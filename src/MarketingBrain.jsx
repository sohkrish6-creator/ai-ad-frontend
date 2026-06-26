import { useState, useEffect } from 'react'

const LS_KEY_BRAIN = 'adsoh_brain_result'
import { Copy, Check, ExternalLink, Download, TrendingUp, Rocket, X } from 'lucide-react'

const FONT = '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif'
const GOLD = '#D4AF37'
const card = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
const inputSt = { width: '100%', padding: '10px 13px', borderRadius: '7px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
const lbl = { display: 'block', color: '#999', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }

const SECTIONS = [
  { key: 'business_understanding', num: 1,  title: 'Business Understanding', sub: 'UVP, trust signals, detected industry, core products from BI',                        fallback: 'strategy',       gold: false },
  { key: 'market_understanding',   num: 2,  title: 'Market Understanding',   sub: 'Market size, growth, saturation, real opportunity gaps',                               fallback: null,             gold: false },
  { key: 'competitor_insights',    num: 3,  title: 'Competitor Insights',    sub: 'Competitor landscape, strengths, weaknesses, positioning gaps',                         fallback: 'competitor',     gold: false },
  { key: 'positioning_strategy',   num: 4,  title: 'Positioning Strategy',   sub: 'Market position to own, category opportunity, messaging shift',                         fallback: null,             gold: true  },
  { key: 'audience_strategy',      num: 5,  title: 'Audience Strategy',      sub: 'Buyer intelligence — pain points, income, search behavior, online hangouts',            fallback: 'audience',       gold: false },
  { key: 'lead_sources',           num: 6,  title: 'Lead Sources',           sub: 'Google Maps terms, hashtags, FB groups, directories, seasonal timing',                 fallback: null,             gold: false },
  { key: 'outreach_scripts',       num: 7,  title: 'Outreach Scripts',       sub: 'WhatsApp x2, Instagram DM, Cold Call, objection handling',                             fallback: null,             gold: false },
  { key: 'pitch_close',            num: 8,  title: 'Pitch & Close',          sub: 'Meeting agenda, key questions, closing offer, follow-up Day 1/3/7',                    fallback: null,             gold: true  },
  { key: 'marketing_plan',         num: 9,  title: 'Marketing Plan',         sub: 'Google Ads keywords, Meta targeting, remarketing sequences, landing page tips',         fallback: 'strategy',       gold: false },
  { key: 'ad_assets',              num: 10, title: 'Ad Assets',              sub: 'Headlines, descriptions, hook lines, CTAs, creative briefs',                           fallback: 'smart_creative', gold: false },
  { key: 'media_buying_plan',      num: 11, title: 'Media Buying Plan',      sub: 'Campaign objective, platform priority, budget split, bid strategy, scaling rules, benchmarks', fallback: null, gold: true  },
]

const MEDIA_SECTIONS = [
  { num: 1, key: 'campaign_objective',       header: 'CAMPAIGN OBJECTIVE:',       title: 'Campaign Objective',   sub: 'Primary goal and why' },
  { num: 2, key: 'platform_recommendations', header: 'PLATFORM RECOMMENDATIONS:', title: 'Platform Priority',    sub: 'Platform ranking with reasoning' },
  { num: 3, key: 'budget_allocation',        header: 'BUDGET ALLOCATION:',        title: 'Budget Split',         sub: 'Monthly/daily budget + platform allocation' },
  { num: 4, key: 'bid_strategy',             header: 'BID STRATEGY:',             title: 'Bid Strategy',         sub: 'Recommended bid strategy and why' },
  { num: 5, key: 'launch_plan',              header: 'LAUNCH PLAN:',              title: 'Launch Plan',          sub: 'Launch date and pre-launch checklist' },
  { num: 6, key: 'scaling_plan',             header: 'SCALING PLAN:',             title: 'Scaling Rules',        sub: 'When and how to scale — conditions and thresholds' },
  { num: 7, key: 'pause_rules',              header: 'PAUSE RULES:',              title: 'Pause Rules',          sub: 'Exact conditions to pause ads' },
  { num: 8, key: 'industry_benchmarks',      header: 'INDUSTRY BENCHMARKS:',      title: 'Benchmarks',           sub: 'CTR, CPC, CPA, conversion rate ranges for this industry' },
]

function parseMediaPlan(text) {
  if (!text) return {}
  const headers = MEDIA_SECTIONS.map(s => s.header)
  const result = {}
  headers.forEach((header, i) => {
    const nextHeader = headers[i + 1]
    const startMatch = text.search(new RegExp(header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
    if (startMatch === -1) { result[MEDIA_SECTIONS[i].key] = ''; return }
    const contentStart = startMatch + header.length
    const remaining = text.slice(contentStart)
    const endMatch = nextHeader ? remaining.search(new RegExp(nextHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')) : -1
    result[MEDIA_SECTIONS[i].key] = (endMatch === -1 ? remaining : remaining.slice(0, endMatch)).trim()
  })
  return result
}

function getContent(result, key, fallback) {
  return result?.sections?.[key] || (fallback ? result?.[fallback] : null) || null
}

function CopyBtn({ onClick, copied }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
      border: '1px solid #E5E5E5', background: copied ? '#F0FDF4' : '#F9F9F9',
      color: copied ? '#16A34A' : '#666', transition: 'all 0.15s ease', flexShrink: 0,
    }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Shimmer({ h = '14px', w = '100%', radius = '4px' }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, #F5F5F5 25%, #EBEBEB 50%, #F5F5F5 75%)',
      backgroundSize: '800px 100%', animation: 'shimmer 1.5s ease-in-out infinite',
    }} />
  )
}

function renderBlock(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    const clean = line.replace(/\*\*/g, '').replace(/^#+\s*/, '')
    if (clean.match(/^[A-Z\s()\/\d]+:$/)) {
      return <h3 key={i} style={{ color: GOLD, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '20px', marginBottom: '9px', paddingBottom: '5px', borderBottom: '1px solid #EAEAEA' }}>{clean}</h3>
    }
    if (clean.match(/^\d+\./)) {
      return <div key={i} style={{ background: '#F9F9F9', border: '1px solid #EAEAEA', borderRadius: '7px', padding: '9px 13px', marginBottom: '7px', fontSize: '14px', color: '#171717', lineHeight: '1.5' }}>{clean}</div>
    }
    if (clean.trim()) {
      return <p key={i} style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: '4px 0' }}>{clean}</p>
    }
    return null
  })
}

function MarketingBrain() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const [url, setUrl] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [budget, setBudget] = useState('')
  const [goal, setGoal] = useState('')
  const [language, setLanguage] = useState('Hinglish')
  const [compName, setCompName] = useState('')
  const [compWebsite, setCompWebsite] = useState('')
  const [targetIndustry, setTargetIndustry] = useState('')
  const [targetIndustryOther, setTargetIndustryOther] = useState('')
  const [targetCity, setTargetCity] = useState('Jaipur')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState({})
  const [mediaPlan, setMediaPlan] = useState(null)
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaError, setMediaError] = useState(null)
  const [launchKit, setLaunchKit] = useState(null)
  const [launchLoading, setLaunchLoading] = useState(false)
  const [launchError, setLaunchError] = useState(null)
  const [launchTab, setLaunchTab] = useState('meta')
  const [fromCache, setFromCache] = useState(false)
  const [showGAdsModal, setShowGAdsModal]   = useState(false)
  const [gAdsForm, setGAdsForm]             = useState({ campaign_name: '', budget_daily: '', start_date: '', end_date: '', campaign_type: 'SEARCH' })
  const [gAdsLoading, setGAdsLoading]       = useState(false)
  const [gAdsResult, setGAdsResult]         = useState(null)
  const [gAdsError, setGAdsError]           = useState('')

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY_BRAIN); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

  const resolvedIndustry = targetIndustry === 'Other' ? targetIndustryOther : targetIndustry

  async function handleRun() {
    if ((!url && !resolvedIndustry) || !businessType || !budget || !goal) { alert(resolvedIndustry ? 'Business type, budget aur goal bharo!' : 'Website, business type, budget aur goal bharo!'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch(`${BACKEND}/full-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, business_type: businessType, budget: parseInt(budget), goal, competitor_name: compName, competitor_website: compWebsite, language, target_industry: resolvedIndustry, target_city: targetCity })
      })
      const data = await res.json()
      if (data.scan_failed) setError(data.message)
      else { setResult(data); localStorage.setItem(LS_KEY_BRAIN, JSON.stringify(data)); setFromCache(false) }
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text)
    setCopied(p => ({ ...p, [key]: true }))
    setTimeout(() => setCopied(p => ({ ...p, [key]: false })), 2000)
  }

  async function handleMediaBuyingPlan() {
    if (!result) return
    setMediaLoading(true); setMediaError(null); setMediaPlan(null)
    const marketingSummary = SECTIONS.slice(0, 4).map(s => {
      const content = getContent(result, s.key, s.fallback)
      return content ? `${s.title}:\n${content.slice(0, 300)}` : ''
    }).filter(Boolean).join('\n\n')
    try {
      const res = await fetch(`${BACKEND}/media-buying-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          industry: resolvedIndustry || businessType,
          city: targetCity,
          budget: parseInt(budget),
          goal,
          language,
          bi_data: result.bi_data || {},
          marketing_summary: marketingSummary,
        })
      })
      const data = await res.json()
      if (data.success) setMediaPlan(data.media_plan)
      else setMediaError('Media buying plan generate nahi hua. Dobara try karo.')
    } catch { setMediaError('Backend se connect nahi ho paya.') }
    setMediaLoading(false)
  }

  async function handleLaunchKit() {
    if (!result) return
    setLaunchLoading(true); setLaunchError(null); setLaunchKit(null); setLaunchTab('meta')
    try {
      const res = await fetch(`${BACKEND}/campaign-launch-kit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          industry: resolvedIndustry || businessType,
          city: targetCity,
          budget: parseInt(budget),
          goal,
          language,
          sections: result.sections || {},
        })
      })
      const data = await res.json()
      if (data.success) setLaunchKit(data)
      else setLaunchError('Campaign Launch Kit generate nahi hua. Dobara try karo.')
    } catch { setLaunchError('Backend se connect nahi ho paya.') }
    setLaunchLoading(false)
  }

  function openGAdsModal() {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
    const defaultStart = tomorrow.toISOString().split('T')[0]
    const cleanUrl = (result?.url || '').replace(/https?:\/\//, '').replace(/\/$/, '').split('/')[0]
    const defaultName = cleanUrl
      ? `${cleanUrl} — Google Search`
      : resolvedIndustry ? `${resolvedIndustry} — ${targetCity}` : 'New Google Campaign'
    setGAdsForm({
      campaign_name: defaultName,
      budget_daily:  budget ? String(Math.round(parseInt(budget) / 30)) : '1000',
      start_date:    defaultStart,
      end_date:      '',
      campaign_type: 'SEARCH',
    })
    setGAdsResult(null)
    setGAdsError('')
    setShowGAdsModal(true)
  }

  async function handleGAdsLaunch() {
    if (!gAdsForm.campaign_name || !gAdsForm.budget_daily) {
      setGAdsError('Campaign name and daily budget are required.')
      return
    }
    setGAdsLoading(true); setGAdsError('')
    try {
      const res = await fetch(`${BACKEND}/google-ads/create-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name: gAdsForm.campaign_name,
          budget_daily:  parseFloat(gAdsForm.budget_daily),
          campaign_type: gAdsForm.campaign_type || 'SEARCH',
          start_date:    gAdsForm.start_date.replace(/-/g, ''),
          end_date:      gAdsForm.end_date ? gAdsForm.end_date.replace(/-/g, '') : '',
          business_key:  result?.business_key || '',
        }),
      })
      const data = await res.json()
      if (data.success) { setGAdsResult(data); setGAdsError('') }
      else setGAdsError(data.error || 'Campaign creation failed.')
    } catch { setGAdsError('Backend se connect nahi ho paya.') }
    setGAdsLoading(false)
  }

  function downloadTxt(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const downloadMediaPDF = async () => {
    if (!mediaPlan) return
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210, PH = 297, M = 18
      let y = M
      const C = {
        bg: [255, 255, 255], panel: [250, 250, 250], border: [234, 234, 234],
        gold: [212, 175, 55], dark: [23, 23, 23], mid: [80, 80, 80], muted: [150, 150, 150],
      }
      const initPage = () => {
        doc.setFillColor(...C.bg); doc.rect(0, 0, W, PH, 'F')
        doc.setFillColor(...C.gold); doc.rect(0, 0, W, 1.8, 'F'); doc.rect(0, PH - 1.8, W, 1.8, 'F')
      }
      const addPage = () => { doc.addPage(); initPage(); y = M + 6 }
      const checkY = (need) => { if (y + need > PH - 22) addPage() }
      const tt = (str, x, yy, { sz = 9, col = C.dark, bold = false, align = 'left' } = {}) => {
        if (!str) return
        doc.setFontSize(sz); doc.setTextColor(...col); doc.setFont('helvetica', bold ? 'bold' : 'normal')
        doc.text(String(str), x, yy, { align })
      }
      const wrapText = (str, x, { sz = 8.5, col = C.mid, maxW = W - M * 2, lh = 5 } = {}) => {
        if (!str) return
        doc.setFontSize(sz); doc.setTextColor(...col); doc.setFont('helvetica', 'normal')
        doc.splitTextToSize(String(str), maxW).forEach(line => { checkY(lh + 1); doc.text(line, x, y); y += lh })
      }
      const sectionHeader = (num, title) => {
        checkY(20)
        doc.setFillColor(...C.panel); doc.rect(M, y, W - M * 2, 14, 'F')
        doc.setFillColor(...C.gold); doc.rect(M, y, 3, 14, 'F')
        doc.setFillColor(...C.gold); doc.circle(M + 12, y + 7, 5, 'F')
        tt(String(num), M + 12, y + 9.5, { sz: 8, col: C.bg, bold: true, align: 'center' })
        tt(title.toUpperCase(), M + 22, y + 9.5, { sz: 9.5, col: C.dark, bold: true })
        doc.setDrawColor(...C.border); doc.setLineWidth(0.3); doc.rect(M, y, W - M * 2, 14, 'S')
        y += 18
      }

      // Cover
      initPage()
      doc.setFillColor(...C.gold); doc.rect(0, 70, W, 0.5, 'F'); doc.rect(0, 110, W, 0.5, 'F')
      tt('SOHSCAPE INTELLIGENCE', W / 2, 58, { sz: 10, col: C.gold, bold: true, align: 'center' })
      tt('MEDIA BUYING PLAN', W / 2, 82, { sz: 28, col: C.dark, bold: true, align: 'center' })
      tt(url || 'Campaign Report', W / 2, 95, { sz: 12, col: C.mid, align: 'center' })
      tt(`Budget: ₹${parseInt(budget).toLocaleString('en-IN')}/mo  ·  Goal: ${goal}`, W / 2, 118, { sz: 9, col: C.muted, align: 'center' })
      tt(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, 128, { sz: 8, col: C.muted, align: 'center' })

      // Sections
      const parsed = parseMediaPlan(mediaPlan)
      MEDIA_SECTIONS.forEach(({ num, key, title }) => {
        const content = parsed[key]
        if (!content) return
        addPage(); sectionHeader(num, title)
        wrapText(content, M, { sz: 8.5, col: C.mid })
        y += 4
      })

      const totalPg = doc.getNumberOfPages()
      for (let p = 1; p <= totalPg; p++) {
        doc.setPage(p)
        doc.setFontSize(7); doc.setTextColor(...C.muted); doc.setFont('helvetica', 'normal')
        doc.text('Adsoh · Media Buying Plan · Confidential', M, PH - 8)
        doc.text(`${p} / ${totalPg}`, W - M, PH - 8, { align: 'right' })
      }
      const fname = `Media-Buying-Plan-${(url || 'report').replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30)}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fname)
    } catch (err) {
      console.error('PDF failed:', err)
      alert('PDF export failed. Try again.')
    }
  }

  const downloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210, PH = 297, M = 18
      let y = M

      // Light theme colours
      const C = {
        bg:    [255, 255, 255],
        panel: [250, 250, 250],
        border:[234, 234, 234],
        gold:  [212, 175, 55],
        goldD: [160, 128, 30],
        dark:  [23,  23,  23],
        mid:   [80,  80,  80],
        muted: [150, 150, 150],
        line:  [212, 175, 55],
      }

      const initPage = () => {
        doc.setFillColor(...C.bg)
        doc.rect(0, 0, W, PH, 'F')
        doc.setFillColor(...C.gold)
        doc.rect(0, 0, W, 1.8, 'F')
        doc.rect(0, PH - 1.8, W, 1.8, 'F')
      }

      const addPage = () => { doc.addPage(); initPage(); y = M + 6 }

      const checkY = (need) => { if (y + need > PH - 22) addPage() }

      const tt = (str, x, yy, { sz = 9, col = C.dark, bold = false, align = 'left', maxW } = {}) => {
        if (str == null || str === '') return
        doc.setFontSize(sz)
        doc.setTextColor(...col)
        doc.setFont('helvetica', bold ? 'bold' : 'normal')
        doc.text(String(str), x, yy, { align, ...(maxW ? { maxWidth: maxW } : {}) })
      }

      const wrapText = (str, x, { sz = 8.5, col = C.mid, maxW = W - M * 2, lh = 5 } = {}) => {
        if (!str) return
        doc.setFontSize(sz); doc.setTextColor(...col); doc.setFont('helvetica', 'normal')
        doc.splitTextToSize(String(str), maxW).forEach(line => { checkY(lh + 1); doc.text(line, x, y); y += lh })
      }

      const sectionHeader = (num, title) => {
        checkY(20)
        doc.setFillColor(...C.panel)
        doc.rect(M, y, W - M * 2, 14, 'F')
        doc.setFillColor(...C.gold)
        doc.rect(M, y, 3, 14, 'F')
        // number circle
        doc.setFillColor(...C.gold)
        doc.circle(M + 12, y + 7, 5, 'F')
        tt(String(num), M + 12, y + 9.5, { sz: 8, col: C.bg, bold: true, align: 'center' })
        tt(title.toUpperCase(), M + 22, y + 9.5, { sz: 9.5, col: C.dark, bold: true })
        doc.setDrawColor(...C.border)
        doc.setLineWidth(0.3)
        doc.rect(M, y, W - M * 2, 14, 'S')
        y += 18
      }

      // ── COVER ──────────────────────────────────────────────────────────
      initPage()

      // decorative gold lines
      doc.setFillColor(...C.gold)
      doc.rect(M, 44, W - M * 2, 0.8, 'F')
      doc.rect(M, PH - 50, W - M * 2, 0.8, 'F')

      tt('SOHSCAPE', W / 2, 64, { sz: 32, col: C.gold, bold: true, align: 'center' })
      tt('Marketing Intelligence Report', W / 2, 76, { sz: 14, col: C.dark, align: 'center' })

      // gold separator under subtitle
      doc.setFillColor(...C.gold)
      doc.rect(W / 2 - 20, 80, 40, 0.5, 'F')

      const cleanUrl = result.url.replace(/https?:\/\//, '').replace(/\/$/, '')
      tt(cleanUrl, W / 2, 92, { sz: 10, col: C.mid, align: 'center' })
      tt(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, 100, { sz: 8.5, col: C.muted, align: 'center' })

      // meta info pills
      const metaItems = [businessType || result.business_type, goal, `Rs ${budget || '—'}/month`, language].filter(Boolean)
      const pillW = (W - M * 2) / metaItems.length
      metaItems.forEach((item, i) => {
        const px = M + i * pillW
        doc.setFillColor(...C.panel)
        doc.rect(px + 1, 116, pillW - 3, 12, 'F')
        doc.setDrawColor(...C.border)
        doc.setLineWidth(0.25)
        doc.rect(px + 1, 116, pillW - 3, 12, 'S')
        tt(item, px + pillW / 2 - 0.5, 124, { sz: 7.5, col: C.mid, align: 'center' })
      })

      // BI cached badge
      if (result.bi_cached != null) {
        const badge = result.bi_cached ? 'BI Data: Cached' : 'BI Data: Fresh Scan'
        tt(badge, W / 2, 142, { sz: 8, col: C.gold, align: 'center' })
      }

      tt('Powered by Adsoh  ·  Confidential', W / 2, PH - 22, { sz: 8, col: C.muted, align: 'center' })

      // ── SECTION PAGES ──────────────────────────────────────────────────
      addPage()

      for (const { key, num, title, fallback } of SECTIONS) {
        const content = getContent(result, key, fallback)
        if (!content) continue

        sectionHeader(num, title)

        // Clean and wrap the text
        const lines = content.split('\n')
        for (const rawLine of lines) {
          const line = rawLine.replace(/\*\*/g, '').trim()
          if (!line) { y += 2; continue }

          // Section sub-header (ALL CAPS ending with colon)
          if (/^[A-Z\s()\/\d\-_]+:$/.test(line)) {
            checkY(12)
            y += 2
            doc.setFillColor(...C.panel)
            doc.rect(M, y - 4, W - M * 2, 9, 'F')
            doc.setFillColor(...C.gold)
            doc.rect(M, y - 4, 2, 9, 'F')
            tt(line, M + 6, y + 2, { sz: 8, col: C.goldD, bold: true })
            y += 8
          }
          // Numbered item
          else if (/^\d+\./.test(line)) {
            checkY(10)
            doc.setFillColor(...C.panel)
            doc.rect(M, y - 3.5, W - M * 2, 8, 'F')
            const wrapped = doc.splitTextToSize(line, W - M * 2 - 6)
            doc.setFontSize(8.5); doc.setTextColor(...C.dark); doc.setFont('helvetica', 'normal')
            doc.text(wrapped[0], M + 4, y + 1)
            y += 7
            if (wrapped.length > 1) {
              for (const extra of wrapped.slice(1)) {
                checkY(6)
                doc.text(extra, M + 4, y)
                y += 5
              }
            }
          }
          // Key: Value lines
          else if (/^[A-Za-z ]+:/.test(line) && line.indexOf(':') < 30) {
            checkY(8)
            const colonIdx = line.indexOf(':')
            const label = line.slice(0, colonIdx).trim()
            const value = line.slice(colonIdx + 1).trim()
            tt(label + ':', M, y, { sz: 7.5, col: C.muted })
            if (value) {
              const vLines = doc.splitTextToSize(value, W - M - 58)
              doc.setFontSize(8); doc.setTextColor(...C.dark); doc.setFont('helvetica', 'normal')
              doc.text(vLines, M + 54, y)
              y += Math.max(6, vLines.length * 4.5)
            } else {
              y += 6
            }
          }
          // Regular paragraph
          else {
            checkY(7)
            wrapText(line, M, { sz: 8.5, col: C.mid, maxW: W - M * 2 })
          }
        }

        y += 8
      }

      // ── (Ad Intelligence removed) ──────────────────────────────────────
      if (false && result.ad_guide) {
        addPage()
        sectionHeader('★', 'Ad Intelligence')
        wrapText(result.ad_guide, M, { sz: 8.5, col: C.mid })
      }

      // ── FOOTERS ────────────────────────────────────────────────────────
      const totalPg = doc.getNumberOfPages()
      for (let p = 1; p <= totalPg; p++) {
        doc.setPage(p)
        doc.setFontSize(7); doc.setTextColor(...C.muted); doc.setFont('helvetica', 'normal')
        doc.text('Adsoh · Marketing Intelligence Report · Confidential', M, PH - 8)
        doc.text(`${p} / ${totalPg}`, W - M, PH - 8, { align: 'right' })
      }

      const fname = `Marketing-Report-${cleanUrl.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30)}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fname)
    } catch (err) {
      console.error('PDF failed:', err)
      alert('PDF export failed. Try again.')
    }
  }

  const page    = { minHeight: '100vh', background: '#FAFAFA', padding: isMobile ? '28px 16px' : '40px 36px', maxWidth: '900px', fontFamily: FONT, width: '100%', boxSizing: 'border-box' }
  const inpSt2  = { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '13px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
  const lbl2    = { display: 'block', color: '#888', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }

  if (loading) return (
    <div style={page}>
      <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Marketing Brain</h1>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 24px' }}>BI scan + 4 engines running in parallel...</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {['Business Intelligence Scan', 'Business & Market Analysis', 'Audience & Outreach', 'Marketing Plan & Ad Assets', 'Media Buying Plan'].map((label, i) => (
          <div key={label} style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', color: '#BBB', fontWeight: '700' }}>{i + 1}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#171717', margin: '0 0 6px' }}>{label}</p>
              <Shimmer h="9px" w="60%" />
            </div>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: GOLD, opacity: 0.6, animation: `pulse ${1 + i * 0.2}s ease-in-out infinite alternate` }} />
          </div>
        ))}
      </div>
      <p style={{ color: '#BBB', fontSize: '12px', margin: '16px 0 0', textAlign: 'center' }}>2–3 minutes · BI scan + Adsoh generating</p>
    </div>
  )

  if (result) return (
    <div style={page}>
      <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>

      {/* Google Ads Campaign Modal */}
      {showGAdsModal && (
        <div onClick={() => setShowGAdsModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}><div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#34A853', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#fff' }}>G</span>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#171717' }}>Create Google Campaign</p>
              </div>
              <button onClick={() => setShowGAdsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#888', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              {!gAdsResult ? (
                <>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#888', background: '#F9FAFB', borderRadius: '6px', padding: '9px 12px', border: '1px solid #F0F0F0' }}>
                    Campaign will be created in <strong>PAUSED</strong> status — review it in Google Ads before going live.
                  </p>
                  {gAdsError && (
                    <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '6px', padding: '10px 13px', marginBottom: '14px', color: '#BE123C', fontSize: '12.5px' }}>{gAdsError}</div>
                  )}
                  <div style={{ marginBottom: '13px' }}>
                    <label style={lbl2}>Campaign Name</label>
                    <input type="text" value={gAdsForm.campaign_name} onChange={e => setGAdsForm(f => ({ ...f, campaign_name: e.target.value }))} style={inpSt2} placeholder="e.g. sohscape.com — Google Search" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '13px' }}>
                    <div>
                      <label style={lbl2}>Daily Budget (₹)</label>
                      <input type="number" value={gAdsForm.budget_daily} onChange={e => setGAdsForm(f => ({ ...f, budget_daily: e.target.value }))} style={inpSt2} placeholder="1000" min="100" />
                    </div>
                    <div>
                      <label style={lbl2}>Campaign Type</label>
                      <select value={gAdsForm.campaign_type} onChange={e => setGAdsForm(f => ({ ...f, campaign_type: e.target.value }))} style={inpSt2}>
                        <option value="SEARCH">Search</option>
                        <option value="DISPLAY" disabled>Display (coming soon)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                    <div>
                      <label style={lbl2}>Start Date</label>
                      <input type="date" value={gAdsForm.start_date} onChange={e => setGAdsForm(f => ({ ...f, start_date: e.target.value }))} style={inpSt2} />
                    </div>
                    <div>
                      <label style={lbl2}>End Date <span style={{ fontWeight: '400', textTransform: 'none', color: '#BBB' }}>(optional)</span></label>
                      <input type="date" value={gAdsForm.end_date} onChange={e => setGAdsForm(f => ({ ...f, end_date: e.target.value }))} style={inpSt2} />
                    </div>
                  </div>
                  <button onClick={handleGAdsLaunch} disabled={gAdsLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: gAdsLoading ? '#E5E5E5' : '#16A34A', border: 'none', color: gAdsLoading ? '#999' : '#fff', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: gAdsLoading ? 'not-allowed' : 'pointer' }}>
                    <Rocket size={15} />
                    {gAdsLoading ? 'Creating campaign...' : 'Launch Campaign 🚀'}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F0FDF4', border: '2px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <span style={{ fontSize: '22px' }}>✅</span>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#166534' }}>Campaign Created!</p>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#888' }}>Status: PAUSED — enable it in Google Ads when ready</p>
                  <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '14px', textAlign: 'left', marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Campaign:</strong> {gAdsResult.campaign_name}</p>
                    <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Campaign ID:</strong> {gAdsResult.campaign_id}</p>
                    <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Ad Group ID:</strong> {gAdsResult.ad_group_id}</p>
                    <p style={{ margin: '0', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Keywords from memory:</strong> {gAdsResult.keywords_added || 0}</p>
                  </div>
                  <a href={gAdsResult.google_ads_dashboard} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#34A853', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginBottom: '10px' }}>
                    <ExternalLink size={13} /> Open in Google Ads
                  </a>
                  <br />
                  <button onClick={() => { setShowGAdsModal(false); setGAdsResult(null) }} style={{ background: 'none', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div></div>
      )}

      {fromCache && (
        <div style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '7px', padding: '9px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Showing previous result · Generate new report to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY_BRAIN); setResult(null); setMediaPlan(null); setMediaError(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#888', textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Marketing Brain</h1>
          <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
            {result.url} — {result.target_industry ? `B2B campaign for ${result.target_industry}` : 'full report'} ready
            {result.bi_cached != null && (
              <span style={{ marginLeft: '8px', color: result.bi_cached ? '#22C55E' : GOLD, fontSize: '11px', fontWeight: '600' }}>
                {result.bi_cached ? '· BI cached' : '· fresh BI scan'}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={downloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#D4AF3712', border: '1px solid #D4AF3730', color: GOLD, padding: '7px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            <Download size={12} /> PDF
          </button>
          <button onClick={() => { localStorage.removeItem(LS_KEY_BRAIN); setResult(null); setMediaPlan(null); setMediaError(null); setFromCache(false) }} style={{ background: 'transparent', border: '1px solid #E5E5E5', color: '#666', padding: '7px 16px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
            ← New Report
          </button>
        </div>
      </div>

      {/* 11 Section Cards */}
      {SECTIONS.map(({ key, num, title, sub, fallback, gold }) => {
        const content = getContent(result, key, fallback)
        if (!content) return null
        return (
          <div key={key} style={{ ...card, padding: '26px', marginBottom: '12px', borderColor: gold ? '#E5DABB' : '#EAEAEA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: gold ? '#D4AF3718' : '#F5F5F5', border: `1px solid ${gold ? '#D4AF3740' : '#EAEAEA'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: gold ? GOLD : '#999' }}>{num}</span>
                </div>
                <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: gold ? GOLD : '#171717' }}>{title}</h2>
              </div>
              <CopyBtn onClick={() => handleCopy(key, content)} copied={!!copied[key]} />
            </div>
            <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 16px 34px' }}>{sub}</p>
            <div style={{ marginLeft: '0' }}>{renderBlock(content)}</div>
          </div>
        )
      })}

      {/* Competitor Ad Links */}
      <div style={{ ...card, padding: '20px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px', color: '#171717' }}>Live Competitor Ads</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { href: result.meta_ad_library_link, label: 'Facebook & Instagram Live Ads', color: '#1877F2' },
            { href: result.google_ads_link,      label: 'Google Ads Transparency',       color: '#34A853' },
          ].map(({ href, label, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              background: color, color: '#fff', padding: '12px', borderRadius: '8px',
              textDecoration: 'none', fontWeight: '600', fontSize: '13px',
            }}>
              {label} <ExternalLink size={12} />
            </a>
          ))}
        </div>
      </div>

      {/* Media Buying Plan CTA */}
      {!mediaPlan && !mediaLoading && (
        <div style={{ ...card, padding: '24px', marginBottom: '12px', borderColor: '#E5DABB', background: '#FFFDF5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px', color: '#171717' }}>Media Buying Plan</h2>
              <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Detailed 8-section plan — platform priorities, budget split, bid strategy, scaling rules, benchmarks</p>
            </div>
            <button onClick={handleMediaBuyingPlan} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: GOLD, border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>
              <TrendingUp size={14} /> Generate Media Buying Plan
            </button>
          </div>
        </div>
      )}

      {/* Media Buying Plan Loading */}
      {mediaLoading && (
        <div style={{ ...card, padding: '28px', marginBottom: '12px', borderColor: '#E5DABB', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GOLD, animation: 'pulse 1s ease-in-out infinite alternate' }} />
            <p style={{ color: '#666', fontSize: '14px', margin: 0, fontWeight: '500' }}>Generating Media Buying Plan...</p>
          </div>
          <p style={{ color: '#BBB', fontSize: '12px', margin: '8px 0 0' }}>8 sections — budget split, scaling rules, benchmarks</p>
        </div>
      )}

      {/* Media Buying Plan Error */}
      {mediaError && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '8px', padding: '14px 18px', marginBottom: '12px', color: '#BE123C', fontSize: '13px' }}>{mediaError}</div>
      )}

      {/* Media Buying Plan Results */}
      {mediaPlan && (() => {
        const parsed = parseMediaPlan(mediaPlan)
        return (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '28px 0 16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 3px', color: GOLD, letterSpacing: '-0.3px' }}>Media Buying Plan</h2>
                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>13-section plan ready</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={downloadMediaPDF} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#D4AF3712', border: '1px solid #D4AF3730', color: GOLD, padding: '7px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  <Download size={12} /> PDF
                </button>
                <button onClick={() => { setMediaPlan(null); setMediaError(null) }} style={{ background: 'transparent', border: '1px solid #E5E5E5', color: '#666', padding: '7px 14px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
                  Regenerate
                </button>
              </div>
            </div>
            {MEDIA_SECTIONS.map(({ num, key, title, sub }) => {
              const content = parsed[key]
              if (!content) return null
              const isGold = [3, 7, 12, 13].includes(num)
              return (
                <div key={key} style={{ ...card, padding: '26px', marginBottom: '12px', borderColor: isGold ? '#E5DABB' : '#EAEAEA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: isGold ? '#D4AF3718' : '#F5F5F5', border: `1px solid ${isGold ? '#D4AF3740' : '#EAEAEA'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: isGold ? GOLD : '#999' }}>{num}</span>
                      </div>
                      <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: isGold ? GOLD : '#171717' }}>{title}</h2>
                    </div>
                    <CopyBtn onClick={() => handleCopy(`media_${key}`, content)} copied={!!copied[`media_${key}`]} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 16px 34px' }}>{sub}</p>
                  <div>{renderBlock(content)}</div>
                </div>
              )
            })}
          </>
        )
      })()}

      {/* Campaign Launch Kit CTA */}
      {!launchKit && !launchLoading && (
        <div style={{ ...card, padding: '24px', marginBottom: '12px', borderColor: '#E5DABB', background: '#FFFDF5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px', color: '#171717' }}>Campaign Launch Kit</h2>
              <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Ready-to-paste Meta Ads + Google Ads + Remarketing kit — audiences, copy, keywords, budgets</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={handleLaunchKit} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: GOLD, border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>
                <Rocket size={14} /> Generate Campaign Launch Kit
              </button>
              <button onClick={e => { e.stopPropagation(); openGAdsModal() }} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1.5px solid #34A853', color: '#34A853', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>G</span> Push to Google Ads
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Launch Kit Loading */}
      {launchLoading && (
        <div style={{ ...card, padding: '28px', marginBottom: '12px', borderColor: '#E5DABB', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GOLD, animation: 'pulse 1s ease-in-out infinite alternate' }} />
            <p style={{ color: '#666', fontSize: '14px', margin: 0, fontWeight: '500' }}>Building Campaign Launch Kit...</p>
          </div>
          <p style={{ color: '#BBB', fontSize: '12px', margin: '8px 0 0' }}>Meta Ads, Google Ads + Remarketing — copy-paste ready</p>
        </div>
      )}

      {/* Campaign Launch Kit Error */}
      {launchError && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '8px', padding: '14px 18px', marginBottom: '12px', color: '#BE123C', fontSize: '13px' }}>{launchError}</div>
      )}

      {/* Campaign Launch Kit Results */}
      {launchKit && (() => {
        const tabs = [
          { id: 'meta',        label: 'Meta Ads',    content: launchKit.meta_kit,        filename: 'meta-ads-launch-kit.txt' },
          { id: 'google',      label: 'Google Ads',  content: launchKit.google_kit,       filename: 'google-ads-launch-kit.txt' },
          { id: 'remarketing', label: 'Remarketing', content: launchKit.remarketing_kit,  filename: 'remarketing-kit.txt' },
        ]
        const active = tabs.find(t => t.id === launchTab) || tabs[0]
        return (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '28px 0 16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 3px', color: GOLD, letterSpacing: '-0.3px' }}>Campaign Launch Kit</h2>
                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Ready to paste into Meta Ads Manager and Google Ads</p>
              </div>
              <button onClick={() => { setLaunchKit(null); setLaunchError(null) }} style={{ background: 'transparent', border: '1px solid #E5E5E5', color: '#666', padding: '7px 14px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
                Regenerate
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setLaunchTab(t.id)} style={{
                  padding: '8px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none',
                  background: launchTab === t.id ? GOLD : '#F5F5F5',
                  color: launchTab === t.id ? '#fff' : '#666',
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Kit Content */}
            <div style={{ ...card, padding: '0', marginBottom: '12px', borderColor: '#E5DABB', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 16px', borderBottom: '1px solid #EAEAEA', background: '#FAFAFA' }}>
                <button onClick={() => handleCopy(`kit_${active.id}`, active.content)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: copied[`kit_${active.id}`] ? '#16A34A' : '#F5F5F5', border: '1px solid #E5E5E5', color: copied[`kit_${active.id}`] ? '#fff' : '#666', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  {copied[`kit_${active.id}`] ? <Check size={11} /> : <Copy size={11} />}
                  {copied[`kit_${active.id}`] ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => downloadTxt(active.content, active.filename)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#D4AF3712', border: '1px solid #D4AF3730', color: GOLD, padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  <Download size={11} /> Download TXT
                </button>
              </div>
              <pre style={{ margin: 0, padding: '20px', fontFamily: '"Geist Mono", "JetBrains Mono", "Fira Code", monospace', fontSize: '12.5px', lineHeight: '1.7', color: '#171717', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#fff', maxHeight: '600px', overflowY: 'auto' }}>
                {active.content}
              </pre>
            </div>

            {/* Launch on Google Ads */}
            <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '8px', padding: '18px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#34A853', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>G</span>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#166534' }}>Launch on Google Ads</p>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#166534', opacity: 0.75 }}>Create a real SEARCH campaign in your Google Ads account — paused by default so you can review before going live</p>
              </div>
              <button onClick={e => { e.stopPropagation(); openGAdsModal() }} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#16A34A', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>
                <Rocket size={14} /> Create Google Campaign
              </button>
            </div>
          </>
        )
      })()}
    </div>
  )

  return (
    <div style={page}>
      <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>

      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Marketing Brain</h1>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 32px' }}>Ek baar daalo — BI scan + Adsoh report (11 sections), sab ek saath</p>

      <div style={{ maxWidth: '560px', width: '100%' }}>
        <div style={{ ...card, padding: '28px' }}>
          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '20px', color: '#BE123C', fontSize: '13px' }}>{error}</div>}

          <p style={{ fontSize: '11px', color: GOLD, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 14px' }}>B2B Industry Campaign (Optional)</p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
            <div>
              <label style={lbl}>Target Industry</label>
              <select value={targetIndustry} onChange={e => setTargetIndustry(e.target.value)} style={{ ...inputSt, color: targetIndustry ? '#171717' : '#999' }}>
                <option value="">— Select (optional) —</option>
                {['Hospitality (Hotels, Restaurants, Cafes)','Schools & Education','Healthcare & Clinics','Real Estate','Retail & Fashion','Food & Beverage','Wellness & Fitness','Wedding & Events','Auto & Transport','Professional Services','Coaching & Tutoring','Jewellery & Accessories','Interior Design & Architecture','Photography & Videography','Legal & CA Services','IT & Software Companies','Travel & Tourism','Salon & Beauty','Gym & Sports Academy','NGO & Social Enterprise','Agriculture & Dairy','Logistics & Transport','Printing & Packaging','Construction & Builders','Media & Entertainment','Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Target City</label>
              <input type="text" value={targetCity} onChange={e => setTargetCity(e.target.value || 'Jaipur')} placeholder="e.g. Jaipur" style={inputSt} />
            </div>
          </div>

          {targetIndustry === 'Other' && (
            <div style={{ marginBottom: '8px' }}>
              <label style={lbl}>Specify Industry</label>
              <input type="text" value={targetIndustryOther} onChange={e => setTargetIndustryOther(e.target.value)} placeholder="e.g. Interior Designers" style={inputSt} />
            </div>
          )}

          {targetIndustry && (
            <div style={{ background: '#D4AF3710', border: '1px solid #D4AF3730', borderRadius: '7px', padding: '10px 13px', marginBottom: '20px', fontSize: '12px', color: GOLD }}>
              B2B mode: Report will target owners/managers of {resolvedIndustry || targetIndustry} businesses in {targetCity || 'India'} — outreach scripts, pain points, where to find leads
            </div>
          )}

          {!targetIndustry && <div style={{ marginBottom: '20px' }} />}

          <p style={{ fontSize: '11px', color: GOLD, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 14px' }}>Aapka Business</p>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Website URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://aapkibusiness.com" style={inputSt} />
            {targetIndustry && (
              <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic', marginTop: '4px' }}>
                URL optional in B2B mode — leave blank for pure industry analysis
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Business Type</label>
            <select value={businessType} onChange={e => setBusinessType(e.target.value)} style={{ ...inputSt, color: businessType ? '#171717' : '#999' }}>
              <option value="">Select karo...</option>
              {['Wedding & Events','Restaurant / Cafe','Healthcare / Clinic','Real Estate','Education / Coaching','Beauty & Skincare','Retail Store','Salon / Spa','Travel & Tourism','Technology / SaaS','Digital Marketing Agency','Other'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>Budget (₹/month)</label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="50000" style={inputSt} />
            </div>
            <div>
              <label style={lbl}>Goal</label>
              <select value={goal} onChange={e => setGoal(e.target.value)} style={{ ...inputSt, color: goal ? '#171717' : '#999' }}>
                <option value="">Select...</option>
                {['Lead Generation','Sales / Revenue','Brand Awareness','Website Traffic','WhatsApp Inquiries'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={inputSt}>
              {['Hinglish','English','Hindi'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <p style={{ fontSize: '11px', color: GOLD, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '24px 0 14px' }}>Competitor (Optional)</p>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Competitor ka Naam</label>
            <input type="text" value={compName} onChange={e => setCompName(e.target.value)} placeholder="e.g. Mamaearth" style={inputSt} />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={lbl}>Competitor ki Website</label>
            <input type="text" value={compWebsite} onChange={e => setCompWebsite(e.target.value)} placeholder="e.g. mamaearth.in" style={inputSt} />
          </div>

          <button onClick={handleRun} style={{ width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: '#171717', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            {resolvedIndustry ? `Generate Industry Campaign — ${resolvedIndustry}` : 'Generate Full Marketing Report'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MarketingBrain
