// Shared by ProspectDiscovery.jsx and RevenueEnginePipeline.jsx — both pages
// produce the same kind of prospect list (business + rating/reviews/score +
// detected gap + tenant-service-matched angle), so they export through this
// one normalized shape rather than two independently-drifting builders.
//
// Callers normalize their own page's prospect objects into:
//   { rank, name, address, phone, rating, reviews, score, classification,
//     detectedGap, sohscapeAngle, expectedLtv, closingProbability }
// expectedLtv/closingProbability are optional (model-output estimates —
// only Prospect Discovery currently has them) and are always rendered with
// an explicit "(Est.)" label, never as verified numbers.
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, ShadingType, HeadingLevel, VerticalAlign,
} from 'docx'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const BRAND_VIOLET = '7C6CF5'
const HOT_TINT = 'FBE2E5'
const HOT_TINT_XLSX = 'FFFBE2E5'
const HEADER_FILL_XLSX = 'FF7C6CF5'

function safe(v, fallback = '—') {
  if (v === null || v === undefined || v === '') return fallback
  return String(v)
}

function classificationOf(p) {
  if (p.classification) return String(p.classification).toLowerCase()
  const score = p.score ?? 0
  return score >= 75 ? 'hot' : score >= 50 ? 'warm' : 'cold'
}

function sortByScore(prospects) {
  return [...prospects].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

function countByClass(sorted) {
  return {
    total: sorted.length,
    hot: sorted.filter(p => classificationOf(p) === 'hot').length,
    warm: sorted.filter(p => classificationOf(p) === 'warm').length,
    cold: sorted.filter(p => classificationOf(p) === 'cold').length,
  }
}

function sanitizeFilenamePart(s) {
  return (s || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'export'
}

// One generic script, not per-prospect — always uses the tenant's real
// business_name (or a neutral fallback if Settings isn't filled in yet),
// never the platform's own name and never a placeholder like "[Agency]".
function buildCallScript(businessName) {
  const name = (businessName || '').trim() || 'our agency'
  return {
    opening: `Hi, this is [Your Name] calling from ${name}. Do you have two minutes? I'm reaching out to local businesses about their online presence.`,
    hook: `I looked up your business online before calling and noticed a few things that are likely costing you customers right now. Mind if I quickly walk you through what I found?`,
    discoveryQuestions: [
      'How are most new customers finding you today — walk-ins, referrals, or online search?',
      'Have you run any online ads or social media promotion before? How did that go?',
      'Who currently handles your marketing — is it you, someone in-house, or nobody right now?',
      'If we fixed the biggest gap in your online presence this month, what would that be worth to your business?',
    ],
    close: `Based on what you've told me, I think we can help. I'd like to set up a short 15-minute call this week to show you exactly what we'd do and what it would cost — no obligation. Does [day] or [day] work better for you?`,
    notInterested: `Totally understand — a lot of business owners feel that way before they see specifics. Would it be okay if I sent a short note by WhatsApp with what I found, so you have it on file in case things change?`,
  }
}

export async function buildProspectCallSheetDocxBlob({ industry, city, source, businessName, prospects }) {
  const sorted = sortByScore(prospects)
  const counts = countByClass(sorted)
  const generatedDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
  const script = buildCallScript(businessName)
  const hasEstimates = sorted.some(p => p.expectedLtv || p.closingProbability)

  function headerCell(text) {
    return new TableCell({
      shading: { type: ShadingType.CLEAR, fill: BRAND_VIOLET, color: 'auto' },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 16 })] })],
    })
  }
  function bodyCell(text, { hot = false, bold = false } = {}) {
    return new TableCell({
      shading: hot ? { type: ShadingType.CLEAR, fill: HOT_TINT, color: 'auto' } : undefined,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 50, bottom: 50, left: 80, right: 80 },
      children: [new Paragraph({ children: [new TextRun({ text: String(text), bold, size: 16 })] })],
    })
  }

  const prospectCols = ['#', 'Business', 'Rating', 'Reviews', 'Score', 'Detected Gap', 'Sohscape Angle', 'Phone', 'Area']
  const prospectHeaderRow = new TableRow({ tableHeader: true, children: prospectCols.map(headerCell) })
  const prospectRows = sorted.map((p, i) => {
    const hot = classificationOf(p) === 'hot'
    return new TableRow({
      children: [
        bodyCell(i + 1, { hot }),
        bodyCell(safe(p.name), { hot, bold: true }),
        bodyCell(p.rating != null ? p.rating : '—', { hot }),
        bodyCell(p.reviews != null ? p.reviews : 0, { hot }),
        bodyCell(p.score != null ? p.score : '—', { hot }),
        bodyCell(safe(p.detectedGap), { hot }),
        bodyCell(safe(p.sohscapeAngle), { hot }),
        bodyCell(safe(p.phone), { hot }),
        bodyCell(safe(p.address), { hot }),
      ],
    })
  })
  const prospectTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [prospectHeaderRow, ...prospectRows] })

  const trackingCols = ['#', 'Business', 'Phone', 'Called (Date)', 'Outcome', 'Notes / Follow-up']
  const trackingHeaderRow = new TableRow({ tableHeader: true, children: trackingCols.map(headerCell) })
  const trackingRows = sorted.map((p, i) => new TableRow({
    children: [bodyCell(i + 1), bodyCell(safe(p.name)), bodyCell(safe(p.phone)), bodyCell(''), bodyCell(''), bodyCell('')],
  }))
  const trackingTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [trackingHeaderRow, ...trackingRows] })

  function heading(text) {
    return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 320, after: 140 }, children: [new TextRun({ text, bold: true, color: BRAND_VIOLET })] })
  }
  function label(text) {
    return new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text, bold: true, size: 19 })] })
  }
  function body(text) {
    return new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text, size: 19 })] })
  }
  function bullet(text) {
    return new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: '•  ' + text, size: 19 })] })
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'SOHSCAPE', bold: true, color: BRAND_VIOLET, size: 32 })] }),
        new Paragraph({ spacing: { after: 220 }, children: [new TextRun({ text: 'Prospect Call Sheet', bold: true, size: 26 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `${safe(industry, industry)}${city ? ' in ' + city : ''}`, bold: true, size: 22 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `Source: ${source || 'Google Maps'}   ·   Generated: ${generatedDate}`, size: 18, color: '555555' })] }),
        new Paragraph({ spacing: { after: 260 }, children: [new TextRun({ text: `Total ${counts.total}   ·   Hot ${counts.hot}   ·   Warm ${counts.warm}   ·   Cold ${counts.cold}`, bold: true, size: 19 })] }),

        heading('Prospects'),
        prospectTable,

        heading('Call Script'),
        label('Opening'), body(script.opening),
        label('Hook'), body(script.hook),
        label('Discovery Questions'), ...script.discoveryQuestions.map(bullet),
        label('Close'), body(script.close),
        label('If Not Interested'), body(script.notInterested),

        heading('Call Tracking Log'),
        trackingTable,

        ...(hasEstimates ? [new Paragraph({
          spacing: { before: 220 },
          children: [new TextRun({ text: 'Expected LTV and Closing Probability shown on-screen are model-generated estimates, not verified figures.', italics: true, size: 16, color: '777777' })],
        })] : []),
      ],
    }],
  })

  return Packer.toBlob(doc)
}

export async function downloadProspectCallSheetDocx({ industry, city, source, businessName, prospects }) {
  const blob = await buildProspectCallSheetDocxBlob({ industry, city, source, businessName, prospects })
  const filename = `sohscape-${sanitizeFilenamePart(industry)}-${sanitizeFilenamePart(city)}-call-sheet.docx`
  saveAs(blob, filename)
}

export async function buildProspectCallLogXlsxBlob({ prospects }) {
  const sorted = sortByScore(prospects)
  const hasEstimates = sorted.some(p => p.expectedLtv || p.closingProbability)

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Sohscape'
  workbook.created = new Date()
  const sheet = workbook.addWorksheet('Prospects', { views: [{ state: 'frozen', ySplit: 1 }] })

  const columns = [
    { header: '#', key: 'rank', width: 5 },
    { header: 'Business', key: 'name', width: 30 },
    { header: 'Rating', key: 'rating', width: 9 },
    { header: 'Reviews', key: 'reviews', width: 10 },
    { header: 'Score', key: 'score', width: 8 },
    { header: 'Detected Gap', key: 'detectedGap', width: 20 },
    { header: 'Sohscape Angle', key: 'sohscapeAngle', width: 20 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Area', key: 'address', width: 32 },
    ...(hasEstimates ? [
      { header: 'Expected LTV (Est.)', key: 'expectedLtv', width: 18 },
      { header: 'Closing Probability (Est.)', key: 'closingProbability', width: 22 },
    ] : []),
    { header: 'Called (Date)', key: 'calledDate', width: 14 },
    { header: 'Outcome', key: 'outcome', width: 16 },
    { header: 'Notes / Follow-up', key: 'notes', width: 34 },
  ]
  sheet.columns = columns

  const headerRow = sheet.getRow(1)
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL_XLSX } }
    cell.alignment = { vertical: 'middle' }
  })

  sorted.forEach((p, i) => {
    const hot = classificationOf(p) === 'hot'
    const row = sheet.addRow({
      rank: i + 1,
      name: safe(p.name, ''),
      rating: p.rating != null ? p.rating : null,
      reviews: p.reviews != null ? p.reviews : null,
      score: p.score != null ? p.score : null,
      detectedGap: safe(p.detectedGap, ''),
      sohscapeAngle: safe(p.sohscapeAngle, ''),
      phone: safe(p.phone, ''),
      address: safe(p.address, ''),
      expectedLtv: safe(p.expectedLtv, ''),
      closingProbability: safe(p.closingProbability, ''),
      calledDate: '',
      outcome: '',
      notes: '',
    })
    if (hot) {
      row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HOT_TINT_XLSX } } })
    }
  })

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } }

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export async function downloadProspectCallLogXlsx({ industry, city, prospects }) {
  const blob = await buildProspectCallLogXlsxBlob({ industry, city, prospects })
  const filename = `sohscape-${sanitizeFilenamePart(industry)}-${sanitizeFilenamePart(city)}-call-log.xlsx`
  saveAs(blob, filename)
}
