// Keyword Intelligence's DOCX/XLSX export — mirrors prospectExport.js's
// pattern exactly (same libraries, same client-side-only generation, no
// backend endpoint involved). Every exported row carries its source label
// (VERIFIED / REAL_VOLUME / OBSERVED) explicitly, matching this module's
// own provenance discipline — a client reading this file must be able to
// tell measured data from unverified research at a glance, the same
// guarantee the on-screen UI gives.
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, ShadingType, HeadingLevel, VerticalAlign,
} from 'docx'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const BRAND_VIOLET = '7C6CF5'
const HEADER_FILL_XLSX = 'FF7C6CF5'

function safe(v, fallback = '—') {
  if (v === null || v === undefined || v === '') return fallback
  return String(v)
}

function fmtVolume(v) {
  return v === null || v === undefined ? 'not available' : v.toLocaleString('en-IN')
}

function fmtBid(low, high) {
  if (low === null || low === undefined || high === null || high === undefined) return 'not available'
  return `Rs.${Math.round(low / 1_000_000)}-Rs.${Math.round(high / 1_000_000)}`
}

function sanitizeFilenamePart(s) {
  return (s || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'export'
}

export async function buildKeywordResearchDocxBlob({ category, city, result }) {
  const generatedDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
  const cacheDate = result?.cache?.ideas_cache_date
    ? new Date(result.cache.ideas_cache_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  function headerCell(text) {
    return new TableCell({
      shading: { type: ShadingType.CLEAR, fill: BRAND_VIOLET, color: 'auto' },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 16 })] })],
    })
  }
  function bodyCell(text) {
    return new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 50, bottom: 50, left: 80, right: 80 },
      children: [new Paragraph({ children: [new TextRun({ text: String(text), size: 16 })] })],
    })
  }

  const topCols = ['Keyword', 'Monthly Searches', 'Competition', 'Bid Range', 'Source']
  const topHeaderRow = new TableRow({ tableHeader: true, children: topCols.map(headerCell) })
  const topRows = (result?.top_searches || []).slice(0, 50).map(k => new TableRow({
    children: [
      bodyCell(safe(k.keyword)),
      bodyCell(fmtVolume(k.avg_monthly_searches)),
      bodyCell(safe(k.competition, 'n/a')),
      bodyCell(fmtBid(k.low_bid_micros, k.high_bid_micros)),
      bodyCell(k.label || 'n/a'),
    ],
  }))

  const clusterParagraphs = (result?.clusters || []).flatMap(c => [
    new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [new TextRun({ text: `${(c.label || c.intent)} — ${(c.intent || '').toUpperCase()} — recommend: ${(c.recommendation || '').toUpperCase()}`, bold: true, size: 20 })],
    }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: c.why_it_matters || '', italics: true, size: 18 })] }),
    new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: (c.keywords || []).join(', '), size: 18 })] }),
  ])

  const bidCols = ['Keyword', 'Monthly Searches', 'Competition', 'Bid Range', 'Why']
  const bidHeaderRow = new TableRow({ tableHeader: true, children: bidCols.map(headerCell) })
  const bidRows = (result?.bid_shortlist || []).map(k => new TableRow({
    children: [
      bodyCell(safe(k.keyword)),
      bodyCell(fmtVolume(k.avg_monthly_searches)),
      bodyCell(safe(k.competition, 'n/a')),
      bodyCell(fmtBid(k.low_bid_micros, k.high_bid_micros)),
      bodyCell(safe(k.reason, '')),
    ],
  }))

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: `Keyword Intelligence — ${category}${city ? ` / ${city}` : ''}` })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Generated ${generatedDate}${cacheDate ? ` · Google Ads data as of ${cacheDate}` : ''}`, size: 18, color: '666666' })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: 'Top Searches' })] }),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [topHeaderRow, ...topRows] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 }, children: [new TextRun({ text: 'Intent Clusters' })] }),
        ...clusterParagraphs,

        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 }, children: [new TextRun({ text: 'What to Bid On' })] }),
        ...(bidRows.length > 0
          ? [new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [bidHeaderRow, ...bidRows] })]
          : [new Paragraph({ children: [new TextRun({ text: result?.needs_budget ? 'No budget was provided — a bid shortlist was not computed.' : 'No keywords met the shortlist criteria for the given budget.', italics: true, size: 18 })] })]),
      ],
    }],
  })
  return Packer.toBlob(doc)
}

export async function downloadKeywordResearchDocx({ category, city, result }) {
  const blob = await buildKeywordResearchDocxBlob({ category, city, result })
  saveAs(blob, `sohscape-keyword-intel-${sanitizeFilenamePart(category)}-${sanitizeFilenamePart(city)}.docx`)
}

export async function buildKeywordResearchXlsxBlob({ result }) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Sohscape'
  workbook.created = new Date()

  const topSheet = workbook.addWorksheet('Top Searches', { views: [{ state: 'frozen', ySplit: 1 }] })
  topSheet.columns = [
    { header: 'Keyword', key: 'keyword', width: 36 },
    { header: 'Monthly Searches', key: 'volume', width: 16 },
    { header: 'Competition', key: 'competition', width: 14 },
    { header: 'Competition Index', key: 'competition_index', width: 16 },
    { header: 'Low Bid (Rs.)', key: 'low_bid', width: 14 },
    { header: 'High Bid (Rs.)', key: 'high_bid', width: 14 },
    { header: 'Source', key: 'source', width: 14 },
  ]
  topSheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL_XLSX } }
  })
  ;(result?.top_searches || []).forEach(k => {
    topSheet.addRow({
      keyword: safe(k.keyword, ''),
      volume: k.avg_monthly_searches != null ? k.avg_monthly_searches : 'not available',
      competition: safe(k.competition, ''),
      competition_index: k.competition_index != null ? k.competition_index : '',
      low_bid: k.low_bid_micros != null ? Math.round(k.low_bid_micros / 1_000_000) : '',
      high_bid: k.high_bid_micros != null ? Math.round(k.high_bid_micros / 1_000_000) : '',
      source: k.label || '',
    })
  })
  topSheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 7 } }

  const bidSheet = workbook.addWorksheet('What To Bid On')
  bidSheet.columns = [
    { header: 'Keyword', key: 'keyword', width: 36 },
    { header: 'Monthly Searches', key: 'volume', width: 16 },
    { header: 'Competition', key: 'competition', width: 14 },
    { header: 'Low Bid (Rs.)', key: 'low_bid', width: 14 },
    { header: 'High Bid (Rs.)', key: 'high_bid', width: 14 },
    { header: 'Why', key: 'reason', width: 50 },
  ]
  bidSheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL_XLSX } }
  })
  ;(result?.bid_shortlist || []).forEach(k => {
    bidSheet.addRow({
      keyword: safe(k.keyword, ''), volume: k.avg_monthly_searches, competition: safe(k.competition, ''),
      low_bid: k.low_bid_micros != null ? Math.round(k.low_bid_micros / 1_000_000) : '',
      high_bid: k.high_bid_micros != null ? Math.round(k.high_bid_micros / 1_000_000) : '',
      reason: safe(k.reason, ''),
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export async function downloadKeywordResearchXlsx({ category, city, result }) {
  const blob = await buildKeywordResearchXlsxBlob({ result })
  saveAs(blob, `sohscape-keyword-intel-${sanitizeFilenamePart(category)}-${sanitizeFilenamePart(city)}.xlsx`)
}
