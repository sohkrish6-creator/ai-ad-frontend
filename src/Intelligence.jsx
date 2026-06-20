import { useState } from 'react'
import { Copy, Check, Search, Dna, TrendingUp, Sword, Target, Zap, Download, ArrowLeft, AlertTriangle, ShieldCheck } from 'lucide-react'

const FONT = '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

function ScoreRing({ score, label, inverse = false }) {
  const s = score || 0
  const color = inverse
    ? (s <= 40 ? '#10B981' : s <= 70 ? '#F59E0B' : '#EF4444')
    : (s >= 80 ? '#10B981' : s >= 60 ? '#F59E0B' : '#EF4444')
  const r = 34
  const circ = 2 * Math.PI * r
  const dash = (s / 100) * circ
  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: '84px' }}>
      <svg width="88" height="88" viewBox="0 0 88 88" style={{ display: 'block', margin: '0 auto 8px', filter: `drop-shadow(0 0 8px ${color}55)` }}>
        <circle cx="44" cy="44" r={r} fill="none" stroke="#E5E5E5" strokeWidth="7" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 44 44)" />
        <text x="44" y="50" textAnchor="middle" fill={color} fontSize="17" fontWeight="800" fontFamily="system-ui, sans-serif">{s}</text>
      </svg>
      <p style={{ color: '#666', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>{label}</p>
    </div>
  )
}

function Badge({ label, type = 'default' }) {
  const styles = {
    default: { background: '#F5F5F5', color: '#666' },
    green:   { background: '#10B98118', color: '#10B981' },
    yellow:  { background: '#F59E0B18', color: '#F59E0B' },
    red:     { background: '#F43F5E18', color: '#F43F5E' },
    blue:    { background: '#D4AF3712', color: '#D4AF37' },
  }
  const s = styles[type] || styles.default
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', ...s }}>
      {label}
    </span>
  )
}

function CopyBtn({ onClick, copied }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
      border: '1px solid #E5E5E5', flexShrink: 0,
      background: copied ? '#F0FDF4' : '#F9F9F9',
      color: copied ? '#16A34A' : '#666',
      transition: 'all 0.15s ease',
    }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function SectionCard({ title, subtitle, accent = '#D4AF37', copyKey, onCopy, copied, children }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EAEAEA', borderRadius: '16px', padding: '26px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: accent }}>{title}</h2>
        {onCopy && <CopyBtn onClick={onCopy} copied={copied} />}
      </div>
      {subtitle && <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 20px 0' }}>{subtitle}</p>}
      {!subtitle && <div style={{ marginBottom: '20px' }} />}
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '9px 0', borderBottom: '1px solid #EAEAEA30' }}>
      <span style={{ color: '#888', fontSize: '13px', minWidth: '110px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#171717', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>{value}</span>
    </div>
  )
}

function ScoreBar({ label, score, inverse = false, reason }) {
  const s = score || 0
  const pct = inverse ? 100 - s : s
  const barColor = inverse
    ? (s >= 70 ? '#F43F5E' : s >= 40 ? '#F59E0B' : '#10B981')
    : (pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#F43F5E')
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
        <span style={{ color: '#666', fontSize: '13px' }}>{label}</span>
        <span style={{ color: barColor, fontSize: '13px', fontWeight: '700' }}>{s} / 100</span>
      </div>
      <div style={{ height: '6px', background: '#EAEAEA', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${s}%`, background: barColor, borderRadius: '3px' }} />
      </div>
      {reason && <p style={{ color: '#888', fontSize: '12px', margin: '6px 0 0', lineHeight: '1.5' }}>{reason}</p>}
    </div>
  )
}

function Intelligence() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [url, setUrl] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [competitorUrl, setCompetitorUrl] = useState('')
  const [language, setLanguage] = useState('Hinglish')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState({})

  const handleCopy = (key, value) => {
    const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    navigator.clipboard.writeText(text)
    setCopied(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000)
  }

  async function handleRun() {
    if (!url.trim()) { alert('Website URL daalo!'); return }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${BACKEND}/intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          business_type: businessType,
          competitor_urls: competitorUrl.trim() ? [competitorUrl.trim()] : [],
        }),
      })
      const data = await res.json()
      if (data.scan_failed) setError(data.message)
      else setResult(data)
    } catch {
      setError('Backend se connect nahi ho paya. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '8px',
    border: '1px solid #EAEAEA', background: '#F9F9F9', color: '#171717',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
  }

  // ── LOADING ──────────────────────────────────────────────────────────────
  const LOAD_STEPS = [
    { Icon: Search,      title: 'Evidence Collection',  sub: 'Homepage + 5 sub-pages crawled'    },
    { Icon: Dna,         title: 'Business DNA Engine',  sub: 'Industry, model, trust signals'    },
    { Icon: TrendingUp,  title: 'Opportunity Score',    sub: 'Market + conversion analysis'      },
    { Icon: Sword,       title: 'Threat Engine',        sub: 'Competition + overlap detection'   },
    { Icon: Target,      title: 'Audience Intel 2.0',   sub: 'Evidence-backed segments only'     },
    { Icon: Zap,         title: 'Executive Decisions',  sub: 'Top 5 actions + ROI plan'          },
  ]
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: FONT, padding: isMobile ? '28px 16px' : '40px 36px', width: '100%', boxSizing: 'border-box' }}>
        <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px', color: '#171717' }}>Business Intelligence</h1>
        <p style={{ color: '#999', fontSize: '13px', margin: '0 0 24px' }}>6 engines running — 30–60 seconds</p>
        <div style={{ maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {LOAD_STEPS.map(({ Icon, title, sub }) => (
            <div key={title} style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F9F9F9', border: '1px solid #EAEAEA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={14} color="#D4AF37" strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#171717', fontSize: '13px', fontWeight: '500', margin: '0 0 5px' }}>{title}</p>
                <div style={{ height: '8px', borderRadius: '4px', background: 'linear-gradient(90deg, #F5F5F5 25%, #EBEBEB 50%, #F5F5F5 75%)', backgroundSize: '800px 100%', animation: 'shimmer 1.5s ease-in-out infinite', width: '65%' }} />
              </div>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#D4AF37', opacity: 0.5, flexShrink: 0 }} />
            </div>
          ))}
        </div>
        <p style={{ color: '#BBB', fontSize: '12px', marginTop: '16px' }}>30–60 seconds · structured JSON output</p>
      </div>
    )
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────
  if (result) {
    const { intelligence, scores } = result
    const dna    = intelligence?.business_dna        || {}
    const opp    = intelligence?.opportunity_score   || {}
    const threat = intelligence?.threat_intelligence  || {}
    const pos    = intelligence?.positioning          || {}
    const aud    = intelligence?.audience_intelligence || {}
    const exec   = intelligence?.executive_decisions   || {}
    const ev     = intelligence?.evidence_collection   || {}

    const threatLvl = (threat.threat_level || '').toLowerCase()
    const threatColor = threatLvl === 'critical' ? '#F43F5E' : threatLvl === 'high' ? '#F97316' : threatLvl === 'medium' ? '#F59E0B' : '#10B981'

    const impactColor = v => ({ Critical: '#F43F5E', High: '#10B981', Medium: '#F59E0B', Low: '#666' }[v] || '#666')
    const effortColor = v => ({ Low: '#10B981', Medium: '#F59E0B', High: '#F43F5E' }[v] || '#666')

    const verdictType = v => {
      if (v === 'Highly Optimized' || v === 'Good to Go') return 'green'
      if (v === 'Not Ready') return 'red'
      return 'yellow'
    }

    const downloadPDF = async () => {
      try {
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const W = 210, PH = 297, M = 18
        let y = M, pg = 1

        const C = {
          bg:[8,11,18], card:[13,17,23], border:[30,42,62],
          gold:[212,175,55], white:[240,242,246], muted:[100,116,139],
          dim:[71,85,105], green:[16,185,129], amber:[245,158,11],
          red:[239,68,68], indigo:[129,140,248], cyan:[56,189,248],
        }

        const scoreCol = (s, inv) => inv
          ? (s <= 40 ? C.green : s <= 70 ? C.amber : C.red)
          : (s >= 80 ? C.green : s >= 60 ? C.amber : C.red)

        const initPage = () => {
          doc.setFillColor(...C.bg); doc.rect(0, 0, W, PH, 'F')
          doc.setFillColor(...C.gold)
          doc.rect(0, 0, W, 1.5, 'F')
          doc.rect(0, PH - 1.5, W, 1.5, 'F')
        }

        const addPage = () => { doc.addPage(); pg++; initPage(); y = M + 4 }

        const checkY = (need) => { if (y + need > PH - 18) addPage() }

        const tt = (str, x, yy, { sz=9, col=C.white, bold=false, align='left', maxW }={}) => {
          if (str == null || str === '') return
          doc.setFontSize(sz); doc.setTextColor(...col)
          doc.setFont('helvetica', bold ? 'bold' : 'normal')
          doc.text(String(str), x, yy, { align, ...(maxW ? { maxWidth: maxW } : {}) })
        }

        const wrapText = (str, x, { sz=8.5, col=C.white, maxW=W-M*2, lh=4.8 }={}) => {
          if (!str) return
          doc.setFontSize(sz); doc.setTextColor(...col); doc.setFont('helvetica','normal')
          doc.splitTextToSize(String(str), maxW).forEach(line => { checkY(lh+1); doc.text(line, x, y); y += lh })
        }

        const secHeader = (title, accent=C.gold) => {
          checkY(16)
          doc.setFillColor(...accent); doc.rect(M, y, 3, 9, 'F')
          tt(title.toUpperCase(), M+7, y+6.5, { sz:11, col:C.white, bold:true })
          y += 15
        }

        const infoRow = (label, value) => {
          if (!value) return
          checkY(8)
          tt(label, M, y, { sz:7.5, col:C.muted })
          tt(String(value), M+52, y, { sz:8, col:C.white, maxW:W-M-56 })
          y += 6.5
        }

        const scoreBar = (label, score, inv=false) => {
          const s = score || 0, c = scoreCol(s, inv)
          checkY(14)
          tt(label, M, y+3.5, { sz:8, col:C.muted })
          tt(`${s}`, W-M, y+3.5, { sz:8, col:c, bold:true, align:'right' })
          y += 6
          doc.setFillColor(...C.border); doc.rect(M, y, W-M*2, 2.5, 'F')
          doc.setFillColor(...c); doc.rect(M, y, (W-M*2)*(s/100), 2.5, 'F')
          y += 7
        }

        // ── COVER ─────────────────────────────────────────────────────────────
        initPage()
        doc.setFillColor(...C.gold)
        doc.rect(M, 36, W-M*2, 0.5, 'F')
        doc.rect(M, PH-44, W-M*2, 0.5, 'F')
        tt('SOHSCAPE', W/2, 54, { sz:30, col:C.gold, bold:true, align:'center' })
        tt('Business Intelligence Report', W/2, 66, { sz:13.5, col:C.white, align:'center' })
        tt(result.url, W/2, 80, { sz:9.5, col:C.muted, align:'center' })
        tt(new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}), W/2, 88, { sz:8.5, col:C.dim, align:'center' })

        const sItems = [
          { l:'DNA Score',   v:scores?.dna_score||0 },
          { l:'Opportunity', v:scores?.opportunity_score||0 },
          { l:'Threat',      v:scores?.threat_score||0, inv:true },
          { l:'Positioning', v:scores?.positioning_score||0 },
          { l:'Audience',    v:scores?.audience_quality_score||0 },
          { l:'Readiness',   v:scores?.readiness_score||0 },
        ]
        const tW = (W-M*2)/3
        sItems.forEach(({l,v,inv},i) => {
          const c = scoreCol(v, inv)
          const tx = M+(i%3)*tW, ty = 102+Math.floor(i/3)*36
          doc.setFillColor(...C.card); doc.rect(tx+1, ty, tW-4, 32, 'F')
          doc.setDrawColor(...c); doc.setLineWidth(0.4); doc.rect(tx+1, ty, tW-4, 32, 'S')
          tt(String(v), tx+tW/2-1.5, ty+19, { sz:19, col:c, bold:true, align:'center' })
          tt(l, tx+tW/2-1.5, ty+27, { sz:7.5, col:C.muted, align:'center' })
        })

        if (exec.readiness_verdict) tt(exec.readiness_verdict, W/2, 188, { sz:13, col:C.gold, bold:true, align:'center' })
        if (dna.detected_industry) tt(`${dna.detected_industry}${dna.detected_sub_industry?' · '+dna.detected_sub_industry:''}`, W/2, 197, { sz:8.5, col:C.muted, align:'center' })
        const evStats = `${ev.pages_fetched||0} pages crawled · ${ev.evidence_points||0} evidence points · ${Math.round((ev.avg_confidence||0)*100)}% confidence`
        tt(evStats, W/2, PH-28, { sz:8, col:C.dim, align:'center' })
        tt('Powered by Sohscape AI  ·  Confidential', W/2, PH-20, { sz:8, col:C.dim, align:'center' })

        // ── PAGE 2: DNA + OPPORTUNITY ──────────────────────────────────────────
        addPage()
        secHeader('Business DNA', C.indigo)
        infoRow('Detected Industry', dna.detected_industry)
        infoRow('Sub-Industry', dna.detected_sub_industry)
        infoRow('Business Model', dna.business_model)
        infoRow('Revenue Model', dna.revenue_model)
        infoRow('Price Range', dna.price_range)
        infoRow('Target Geography', dna.target_geography)
        infoRow('DNA Score', dna.dna_score!=null ? `${dna.dna_score}/100 — ${dna.dna_score_reason||''}` : null)
        y += 2
        if (dna.unique_value_prop) {
          checkY(22)
          doc.setFillColor(15,18,28); doc.rect(M, y, W-M*2, 16, 'F')
          doc.setFillColor(...C.indigo); doc.rect(M, y, 3, 16, 'F')
          tt('UNIQUE VALUE PROPOSITION', M+6, y+5.5, { sz:6.5, col:C.indigo, bold:true })
          tt(dna.unique_value_prop, M+6, y+12, { sz:8.5, col:C.white, maxW:W-M*2-10 })
          y += 20
        }
        if ((dna.core_products||[]).length) {
          checkY(8); tt('Products: '+dna.core_products.join(' · '), M, y, { sz:7.5, col:C.dim, maxW:W-M*2 }); y += 8
        }
        y += 4
        secHeader('Opportunity Analysis', C.green)
        scoreBar('Market Opportunity', opp.market_opportunity_score)
        scoreBar('Competition Difficulty', opp.competition_difficulty_score, true)
        scoreBar('Conversion Potential', opp.conversion_potential_score)
        y += 2
        const oppMeta = [['Market Size',opp.market_size],['Best Platform',opp.best_platform],['Budget Efficiency',opp.budget_efficiency]].filter(([,v])=>v)
        if (oppMeta.length) {
          checkY(24); const mW=(W-M*2)/3
          oppMeta.forEach(([lbl,val],i) => {
            const mx=M+i*mW
            doc.setFillColor(...C.card); doc.rect(mx, y, mW-3, 18, 'F')
            tt(lbl, mx+(mW-3)/2, y+6.5, { sz:7, col:C.muted, align:'center' })
            tt(val, mx+(mW-3)/2, y+13.5, { sz:9, col:C.white, bold:true, align:'center' })
          })
          y += 22
        }
        if (opp.best_platform_reason) { checkY(10); wrapText(opp.best_platform_reason, M, { sz:8, col:C.muted }) }

        // ── PAGE 3: THREAT + POSITIONING ──────────────────────────────────────
        addPage()
        secHeader('Threat Intelligence', [249,115,22])
        const thrC = scoreCol(threat.competitor_threat_score||0, true)
        checkY(24)
        const tMeta = [
          ['Threat Score',`${threat.competitor_threat_score||0}/100`],
          ['Threat Level',threat.threat_level],
          ['Audience Overlap',`${threat.audience_overlap_pct||0}%`],
          ['Pricing Overlap',`${threat.pricing_overlap_pct||0}%`],
        ].filter(([,v])=>v)
        const tCW=(W-M*2)/4
        tMeta.forEach(([lbl,val],i) => {
          const tx2=M+i*tCW
          doc.setFillColor(...C.card); doc.rect(tx2, y, tCW-2, 18, 'F')
          tt(lbl, tx2+(tCW-2)/2, y+6.5, { sz:6.5, col:C.muted, align:'center' })
          tt(val, tx2+(tCW-2)/2, y+13.5, { sz:8.5, col:i===0?thrC:C.white, bold:true, align:'center' })
        })
        y += 22
        const half=(W-M*2-4)/2; let lY=y, rY=y
        if ((threat.key_threats||[]).length) {
          doc.setFillColor(...C.red); doc.rect(M, lY, 2, 7, 'F')
          tt('KEY THREATS', M+4, lY+5.5, { sz:7.5, col:C.red, bold:true }); lY += 10
          for (const thr of (threat.key_threats||[]).slice(0,5)) {
            const lines=doc.splitTextToSize(thr, half-7)
            tt('▸', M, lY, { sz:8, col:C.red })
            doc.setFontSize(8); doc.setTextColor(...C.white); doc.setFont('helvetica','normal'); doc.text(lines, M+5, lY)
            lY += lines.length*4.5+2
          }
        }
        if ((threat.differentiators||[]).length) {
          const rx=M+half+4
          doc.setFillColor(...C.green); doc.rect(rx, rY, 2, 7, 'F')
          tt('DIFFERENTIATORS', rx+4, rY+5.5, { sz:7.5, col:C.green, bold:true }); rY += 10
          for (const d of (threat.differentiators||[]).slice(0,5)) {
            const lines=doc.splitTextToSize(d, half-7)
            tt('✓', rx, rY, { sz:8, col:C.green })
            doc.setFontSize(8); doc.setTextColor(...C.white); doc.setFont('helvetica','normal'); doc.text(lines, rx+5, rY)
            rY += lines.length*4.5+2
          }
        }
        y = Math.max(lY, rY) + 5
        if (threat.moat_strength) {
          checkY(10); doc.setFillColor(...C.card); doc.rect(M, y, W-M*2, 9, 'F')
          tt(`Moat: ${threat.moat_strength}${threat.moat_reason?' — '+threat.moat_reason:''}`, M+4, y+6, { sz:8, col:C.white, maxW:W-M*2-8 }); y += 13
        }
        y += 4
        secHeader('Positioning Engine', C.cyan)
        if (pos.winning_position) {
          checkY(24); doc.setFillColor(12,22,30); doc.rect(M, y, W-M*2, 22, 'F')
          doc.setFillColor(...C.cyan); doc.rect(M, y, 3, 22, 'F')
          tt('WINNING POSITION', M+6, y+5.5, { sz:6.5, col:C.cyan, bold:true })
          const wLines=doc.splitTextToSize(pos.winning_position, W-M*2-10)
          doc.setFontSize(10); doc.setTextColor(...C.white); doc.setFont('helvetica','bold'); doc.text(wLines, M+6, y+13)
          y += Math.max(22, wLines.length*5.5+10)+4
        }
        if (pos.positioning_gap) {
          checkY(16); doc.setFillColor(10,22,14); doc.rect(M, y, W-M*2, 14, 'F')
          tt('POSITIONING GAP', M+4, y+5.5, { sz:6.5, col:C.green, bold:true })
          const gLines=doc.splitTextToSize(pos.positioning_gap, W-M*2-8)
          doc.setFontSize(8.5); doc.setTextColor(...C.white); doc.setFont('helvetica','normal'); doc.text(gLines, M+4, y+11)
          y += Math.max(14, gLines.length*4.5+10)+3
        }
        if (pos.messaging_shift) { infoRow('Messaging Shift', pos.messaging_shift) }
        if (pos.current_positioning) { checkY(12); wrapText('Current: '+pos.current_positioning, M, { sz:8, col:C.muted }); y += 2 }

        // ── PAGE 4: AUDIENCE + EXEC ────────────────────────────────────────────
        addPage()
        secHeader('Audience Intelligence 2.0', [247,183,49])
        for (const [i, seg] of (aud.validated_segments||[]).entries()) {
          const isPrimary = i===(aud.primary_segment_index||0)
          checkY(30)
          doc.setFillColor(8,22,12); doc.rect(M, y, W-M*2, 28, 'F')
          doc.setDrawColor(...C.green); doc.setLineWidth(0.3); doc.rect(M, y, W-M*2, 28, 'S')
          tt(`${isPrimary?'★ ':''}${seg.segment_name||''}`, M+5, y+8, { sz:9.5, col:C.green, bold:true })
          tt(`${seg.age_range||''} · ${seg.gender||''} · ${seg.income_level||''}`, M+5, y+15, { sz:7.5, col:C.muted })
          tt(String(seg.confidence_score||0), W-M-4, y+8, { sz:10, col:C.green, bold:true, align:'right' })
          if (seg.evidence_backing) {
            const eLines=doc.splitTextToSize(`"${seg.evidence_backing}"`, W-M*2-10)
            doc.setFontSize(7.5); doc.setTextColor(...C.dim); doc.setFont('helvetica','italic'); doc.text(eLines.slice(0,2), M+5, y+22)
          }
          y += 31
        }
        if ((aud.rejected_segments||[]).length) {
          checkY(10); tt('REJECTED SEGMENTS', M, y, { sz:7.5, col:C.red, bold:true }); y += 6
          for (const seg of aud.rejected_segments) {
            checkY(7); tt(`✗ ${seg.segment||''}`, M+2, y, { sz:8, col:C.red })
            tt(seg.rejection_reason||'', M+55, y, { sz:7.5, col:C.muted, maxW:W-M-60 }); y += 6
          }
        }
        y += 6
        secHeader('Executive Decisions', C.amber)
        if (exec.highest_roi_action) {
          checkY(22); doc.setFillColor(24,18,2); doc.rect(M, y, W-M*2, 20, 'F')
          doc.setFillColor(...C.amber); doc.rect(M, y, 3, 20, 'F')
          tt('HIGHEST ROI ACTION', M+6, y+5.5, { sz:6.5, col:C.amber, bold:true })
          const roiLines=doc.splitTextToSize(exec.highest_roi_action, W-M*2-10)
          doc.setFontSize(9.5); doc.setTextColor(254,243,199); doc.setFont('helvetica','bold'); doc.text(roiLines, M+6, y+13)
          y += Math.max(20, roiLines.length*5+10)+3
        }
        for (const action of (exec.top_5_actions||[])) {
          checkY(22); doc.setFillColor(...C.card); doc.rect(M, y, W-M*2, 20, 'F')
          doc.setFillColor(30,42,62); doc.circle(M+8, y+10, 4, 'F')
          tt(String(action.rank||''), M+8, y+13, { sz:8, col:C.indigo, bold:true, align:'center' })
          tt(action.action||'', M+16, y+8, { sz:8.5, col:C.white, bold:true, maxW:W-M-24 })
          tt(`${action.expected_impact||''} Impact · ${action.effort||''} Effort · ${action.timeline||''}`, M+16, y+15, { sz:7, col:C.muted })
          y += 23
        }
        if (exec.plan_30_day||exec.plan_60_day||exec.plan_90_day) {
          checkY(35); tt('30/60/90 DAY PLAN', M, y, { sz:8, col:C.gold, bold:true }); y += 8
          const plans=[['30 Days',exec.plan_30_day,C.green],['60 Days',exec.plan_60_day,C.amber],['90 Days',exec.plan_90_day,C.indigo]]
          const pW=(W-M*2)/3, planY=y
          plans.forEach(([lbl,val,c],i) => {
            if (!val) return
            const px=M+i*pW, pLines=doc.splitTextToSize(val, pW-7), h=pLines.length*4.5+16
            doc.setFillColor(...C.card); doc.rect(px, planY, pW-3, h, 'F')
            doc.setFillColor(...c); doc.rect(px, planY, pW-3, 2, 'F')
            tt(lbl, px+3, planY+9, { sz:7.5, col:c, bold:true })
            doc.setFontSize(7.5); doc.setTextColor(...C.white); doc.setFont('helvetica','normal'); doc.text(pLines, px+3, planY+15)
            y = Math.max(y, planY+h+4)
          })
        }
        if (exec.biggest_risk||exec.biggest_opportunity) {
          checkY(22); const h2=(W-M*2-4)/2, bY=y
          if (exec.biggest_risk) {
            doc.setFillColor(20,10,10); doc.rect(M, bY, h2, 18, 'F')
            tt('BIGGEST RISK', M+4, bY+6, { sz:7, col:C.red, bold:true })
            const rL=doc.splitTextToSize(exec.biggest_risk, h2-8)
            doc.setFontSize(7.5); doc.setTextColor(...C.white); doc.setFont('helvetica','normal'); doc.text(rL, M+4, bY+12)
          }
          if (exec.biggest_opportunity) {
            const rx=M+h2+4
            doc.setFillColor(8,20,12); doc.rect(rx, bY, h2, 18, 'F')
            tt('BIGGEST OPPORTUNITY', rx+4, bY+6, { sz:7, col:C.green, bold:true })
            const oL=doc.splitTextToSize(exec.biggest_opportunity, h2-8)
            doc.setFontSize(7.5); doc.setTextColor(...C.white); doc.setFont('helvetica','normal'); doc.text(oL, rx+4, bY+12)
          }
          y = bY + 22
        }

        // ── FOOTERS ────────────────────────────────────────────────────────────
        const totalPg = doc.getNumberOfPages()
        for (let p = 1; p <= totalPg; p++) {
          doc.setPage(p)
          doc.setFontSize(7); doc.setTextColor(...C.dim); doc.setFont('helvetica','normal')
          doc.text('Sohscape · Business Intelligence Report · Confidential', M, PH-7)
          doc.text(`${p} / ${totalPg}`, W-M, PH-7, { align:'right' })
        }

        const fname = `BI-Report-${result.url.replace(/https?:\/\//,'').replace(/[^a-zA-Z0-9]/g,'-').slice(0,30)}-${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(fname)
      } catch(err) {
        console.error('PDF failed:', err)
        alert('PDF export failed. Try again.')
      }
    }

    return (
      <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: FONT, color: '#171717', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>

        {/* Sticky Header */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EAEAEA', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: isMobile ? '48px' : 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Dna size={15} color="#D4AF37" strokeWidth={1.5} />
            <span style={{ fontWeight: '600', fontSize: '15px', color: '#171717' }}>Business Intelligence</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!isMobile && <span style={{ color: '#999', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.url}</span>}
            <button onClick={downloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#D4AF3712', border: '1px solid #D4AF3730', color: '#D4AF37', padding: '6px 14px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
              <Download size={12} /> PDF
            </button>
            <button onClick={() => setResult(null)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid #EAEAEA', color: '#888', padding: '6px 14px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
              <ArrowLeft size={12} /> New
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: isMobile ? '20px 16px' : '28px 20px' }}>

          {/* Success Banner */}
          <div style={{ background: '#F0FDF4', border: '1px solid #D4AF3535', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#10B981' }}>✅ Intelligence Report Ready</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
                {ev.pages_fetched || ev.pages_crawled || 0} pages fetched · {ev.pages_with_evidence || 0} with content · {ev.evidence_points || 0} evidence points · {Math.round((ev.avg_confidence || 0) * 100)}% avg confidence{ev.sitemap_crawled ? ' · sitemap ✓' : ''}
              </p>
            </div>
            <Badge label={exec.readiness_verdict || 'Analyzing'} type={verdictType(exec.readiness_verdict)} />
          </div>

          {/* ── 1. SCORE DASHBOARD ── */}
          <div style={{ background: '#FAFAFA', border: '1px solid #D4AF3535', borderRadius: '16px', padding: '26px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#D4AF37' }}>⚡ Score Dashboard</h2>
                <p style={{ color: '#888', fontSize: '12px', margin: '4px 0 0' }}>6 intelligence scores — Threat: lower is better</p>
              </div>
              <CopyBtn onClick={() => handleCopy('scores', scores)} copied={copied.scores} />
            </div>
            <div style={{ display: 'flex', gap: isMobile ? '12px' : '8px', justifyContent: 'space-around', flexWrap: 'wrap', rowGap: '20px' }}>
              <ScoreRing score={scores?.dna_score}              label="DNA Score" />
              <ScoreRing score={scores?.opportunity_score}      label="Opportunity" />
              <ScoreRing score={scores?.threat_score}           label="Threat" inverse />
              <ScoreRing score={scores?.positioning_score}      label="Positioning" />
              <ScoreRing score={scores?.audience_quality_score} label="Audience" />
              <ScoreRing score={scores?.readiness_score}        label="Readiness" />
            </div>
          </div>

          {/* ── 2. BUSINESS DNA ── */}
          <SectionCard
            title="🧬 Business DNA"
            subtitle="Industry classification built from evidence only — no assumptions"
            accent="#A78BFA"
            onCopy={() => handleCopy('dna', dna)}
            copied={copied.dna}
          >
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 36px', marginBottom: '16px' }}>
              <div>
                <InfoRow label="Detected Industry"    value={dna.detected_industry} />
                <InfoRow label="Sub-Industry"         value={dna.detected_sub_industry} />
                <InfoRow label="Business Model"       value={dna.business_model} />
                <InfoRow label="Revenue Model"        value={dna.revenue_model} />
              </div>
              <div>
                <InfoRow label="Price Range"          value={dna.price_range} />
                <InfoRow label="Target Geography"     value={dna.target_geography} />
                <InfoRow label="DNA Score"            value={dna.dna_score != null ? `${dna.dna_score} / 100` : null} />
              </div>
            </div>

            {dna.dna_score_reason && (
              <p style={{ color: '#888', fontSize: '12px', margin: '0 0 16px', lineHeight: '1.5' }}>{dna.dna_score_reason}</p>
            )}

            {dna.unique_value_prop && (
              <div style={{ background: '#F9F9F9', border: '1px solid #6366F118', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                <p style={{ color: '#D4AF37', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Unique Value Proposition</p>
                <p style={{ color: '#171717', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>{dna.unique_value_prop}</p>
              </div>
            )}

            {(dna.core_products || []).length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Core Products / Services</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {dna.core_products.map((p, i) => <Badge key={i} label={p} type="blue" />)}
                </div>
              </div>
            )}

            {(dna.trust_signals || []).length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Trust Signals Found</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {dna.trust_signals.map((s, i) => <Badge key={i} label={s} type="green" />)}
                </div>
              </div>
            )}

            {(dna.evidence_used || []).length > 0 && (
              <div style={{ background: '#F9F9F9', borderRadius: '8px', padding: '12px 14px' }}>
                <p style={{ color: '#475569', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Evidence Used for Classification</p>
                {dna.evidence_used.map((e, i) => (
                  <p key={i} style={{ color: '#475569', fontSize: '12px', margin: '4px 0', fontStyle: 'italic', lineHeight: '1.5' }}>"{e}"</p>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── 3. OPPORTUNITY ANALYSIS ── */}
          <SectionCard
            title="📈 Opportunity Analysis"
            subtitle="Market opportunity, competition difficulty, conversion potential"
            accent="#10B981"
            onCopy={() => handleCopy('opp', opp)}
            copied={copied.opp}
          >
            <ScoreBar label="Market Opportunity"      score={opp.market_opportunity_score}     reason={opp.market_opportunity_reason} />
            <ScoreBar label="Competition Difficulty"  score={opp.competition_difficulty_score} reason={opp.competition_difficulty_reason} inverse />
            <ScoreBar label="Conversion Potential"    score={opp.conversion_potential_score}   reason={opp.conversion_potential_reason} />

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '10px', marginTop: '20px' }}>
              {[
                { label: 'Market Size',      value: opp.market_size,      color: '#171717' },
                { label: 'Best Platform',    value: opp.best_platform,    color: '#D4AF37' },
                { label: 'Budget Efficiency', value: opp.budget_efficiency, color: opp.budget_efficiency === 'High' ? '#10B981' : opp.budget_efficiency === 'Medium' ? '#F59E0B' : '#F43F5E' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#F9F9F9', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                  <p style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{label}</p>
                  <p style={{ color, fontSize: '14px', fontWeight: '700', margin: 0 }}>{value || '—'}</p>
                </div>
              ))}
            </div>

            {opp.best_platform_reason && (
              <p style={{ color: '#888', fontSize: '13px', margin: '14px 0 0', lineHeight: '1.6' }}>{opp.best_platform_reason}</p>
            )}

            {(opp.seasonal_factors || []).length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Seasonal Factors</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {opp.seasonal_factors.map((f, i) => <Badge key={i} label={f} />)}
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── 4. THREAT INTELLIGENCE ── */}
          <SectionCard
            title="⚔️ Threat Intelligence"
            subtitle="Competitor landscape, audience overlap, pricing overlap, your moat"
            accent="#F97316"
            onCopy={() => handleCopy('threat', threat)}
            copied={copied.threat}
          >
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Threat Score',     value: `${threat.competitor_threat_score || 0} / 100`, color: threatColor },
                { label: 'Threat Level',     value: threat.threat_level || '—',                    color: threatColor },
                { label: 'Audience Overlap', value: `${threat.audience_overlap_pct || 0}%`,         color: '#F59E0B' },
                { label: 'Pricing Overlap',  value: `${threat.pricing_overlap_pct || 0}%`,          color: '#F59E0B' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#F9F9F9', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                  <p style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{label}</p>
                  <p style={{ color, fontSize: '14px', fontWeight: '700', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#F43F5E', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Key Threats</p>
                {(threat.key_threats || []).map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#F43F5E', fontSize: '12px', marginTop: '2px', flexShrink: 0 }}>▸</span>
                    <p style={{ color: '#171717', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{t}</p>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ color: '#10B981', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Your Differentiators</p>
                {(threat.differentiators || []).map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#10B981', fontSize: '12px', marginTop: '2px', flexShrink: 0 }}>✓</span>
                    <p style={{ color: '#171717', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#F9F9F9', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <p style={{ color: '#888', fontSize: '12px', margin: '0 0 3px' }}>
                  Moat Strength: <span style={{ color: '#171717', fontWeight: '600' }}>{threat.moat_strength || '—'}</span>
                </p>
                {threat.moat_reason && <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>{threat.moat_reason}</p>}
              </div>
              <Badge label={threat.estimated_competitors || '—'} />
            </div>
          </SectionCard>

          {/* ── 5. POSITIONING ENGINE ── */}
          <SectionCard
            title="🎯 Positioning Engine"
            subtitle="Where you stand, where competitors stand, and the space you should own"
            accent="#38BDF8"
            onCopy={() => handleCopy('pos', pos)}
            copied={copied.pos}
          >
            {/* Winning Position — hero callout */}
            {pos.winning_position && (
              <div style={{ background: '#F0F9FF', border: '1px solid #38BDF840', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px', borderLeft: '4px solid #38BDF8' }}>
                <p style={{ color: '#38BDF8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Winning Position</p>
                <p style={{ color: '#171717', fontSize: '16px', fontWeight: '700', margin: '0 0 8px', lineHeight: '1.4' }}>{pos.winning_position}</p>
                {pos.category_ownership_opportunity && (
                  <div style={{ display: 'inline-block', background: '#38BDF820', border: '1px solid #38BDF840', borderRadius: '20px', padding: '4px 14px', marginTop: '4px' }}>
                    <span style={{ color: '#7DD3FC', fontSize: '13px', fontWeight: '600' }}>🏆 {pos.category_ownership_opportunity}</span>
                  </div>
                )}
              </div>
            )}

            {/* Current Positioning */}
            {pos.current_positioning && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Current Positioning</p>
                <div style={{ background: '#F9F9F9', borderRadius: '10px', padding: '14px' }}>
                  <p style={{ color: '#171717', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{pos.current_positioning}</p>
                </div>
              </div>
            )}

            {/* Positioning Gap */}
            {pos.positioning_gap && (
              <div style={{ background: '#10B98110', border: '1px solid #10B98128', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <p style={{ color: '#10B981', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Positioning Gap — Unoccupied Space</p>
                <p style={{ color: '#171717', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{pos.positioning_gap}</p>
              </div>
            )}

            {/* Competitor Positioning */}
            {(pos.competitor_positioning || []).length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Competitor Positioning</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pos.competitor_positioning.map((comp, i) => (
                    <div key={i} style={{ background: '#F9F9F9', border: '1px solid #EAEAEA', borderRadius: '10px', padding: '13px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F97316' + '18', border: '1px solid #F9731630', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <span style={{ color: '#F97316', fontSize: '12px', fontWeight: '800' }}>{i + 1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#171717', fontSize: '13px', fontWeight: '600', margin: '0 0 3px' }}>{comp.name}</p>
                        <p style={{ color: '#666', fontSize: '12px', margin: '0 0 6px', lineHeight: '1.5' }}>{comp.position}</p>
                        {comp.owned_category && (
                          <Badge label={comp.owned_category} type="yellow" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messaging Shift */}
            {pos.messaging_shift && (
              <div style={{ background: '#F9F9F9', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Messaging Shift</p>
                <p style={{ color: '#666', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{pos.messaging_shift}</p>
              </div>
            )}

            {/* Reasoning */}
            {pos.reasoning && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Reasoning</p>
                <p style={{ color: '#666', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{pos.reasoning}</p>
              </div>
            )}

            {/* Supporting Evidence + Confidence */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {(pos.supporting_evidence || []).length > 0 && (
                <div style={{ flex: 1, minWidth: '160px', background: '#F9F9F9', borderRadius: '8px', padding: '12px 14px' }}>
                  <p style={{ color: '#475569', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Supporting Evidence</p>
                  {pos.supporting_evidence.map((e, i) => (
                    <p key={i} style={{ color: '#475569', fontSize: '12px', margin: '4px 0', fontStyle: 'italic', lineHeight: '1.5' }}>"{e}"</p>
                  ))}
                </div>
              )}
              {pos.confidence_score != null && (
                <div style={{ background: '#F9F9F9', borderRadius: '10px', padding: '14px 18px', textAlign: 'center', minWidth: '100px' }}>
                  <p style={{ color: pos.confidence_score >= 75 ? '#10B981' : pos.confidence_score >= 50 ? '#F59E0B' : '#F43F5E', fontSize: '26px', fontWeight: '800', margin: '0 0 4px' }}>{pos.confidence_score}</p>
                  <p style={{ color: '#888', fontSize: '11px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── 6. AUDIENCE INTELLIGENCE 2.0 ── */}
          <SectionCard
            title="🎯 Audience Intelligence 2.0"
            subtitle="Segments generated ONLY from Business DNA evidence — rejections shown"
            accent="#F7B731"
            onCopy={() => handleCopy('aud', aud)}
            copied={copied.aud}
          >
            {(aud.validated_segments || []).map((seg, i) => (
              <div key={i} style={{ background: '#F0FDF4', border: '1px solid #10B98135', borderRadius: '12px', padding: '18px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#10B981', fontSize: '14px', fontWeight: '700', margin: '0 0 8px' }}>
                      {i === (aud.primary_segment_index || 0) ? '★ ' : ''}{seg.segment_name}
                      {i === (aud.primary_segment_index || 0) && <span style={{ color: '#888', fontSize: '11px', fontWeight: '400', marginLeft: '8px' }}>Primary</span>}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {seg.age_range    && <Badge label={seg.age_range}    type="green" />}
                      {seg.gender       && <Badge label={seg.gender}       type="green" />}
                      {seg.income_level && <Badge label={seg.income_level} type="green" />}
                      {seg.estimated_reach && <Badge label={seg.estimated_reach} />}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <p style={{ color: '#10B981', fontSize: '20px', fontWeight: '800', margin: 0 }}>{seg.confidence_score}</p>
                    <p style={{ color: '#888', fontSize: '10px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>conf.</p>
                  </div>
                </div>

                {(seg.interests || []).length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Interests</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {seg.interests.map((x, j) => <Badge key={j} label={x} />)}
                    </div>
                  </div>
                )}
                {(seg.meta_interests || []).length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Meta Interests</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {seg.meta_interests.map((x, j) => <Badge key={j} label={x} type="blue" />)}
                    </div>
                  </div>
                )}
                {(seg.google_in_market || []).length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Google In-Market Segments</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {seg.google_in_market.map((x, j) => <Badge key={j} label={x} type="green" />)}
                    </div>
                  </div>
                )}
                {(seg.behaviors || []).length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Behaviors</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {seg.behaviors.map((x, j) => <Badge key={j} label={x} />)}
                    </div>
                  </div>
                )}

                {seg.evidence_backing && (
                  <div style={{ background: '#F0FDF4', borderRadius: '8px', padding: '10px 12px', marginTop: '8px' }}>
                    <p style={{ color: '#475569', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Evidence Backing</p>
                    <p style={{ color: '#065F46', fontSize: '12px', margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>"{seg.evidence_backing}"</p>
                  </div>
                )}
              </div>
            ))}

            {(aud.rejected_segments || []).length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ color: '#F43F5E', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                  Rejected Segments — insufficient evidence
                </p>
                {aud.rejected_segments.map((seg, i) => (
                  <div key={i} style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#BE123C', fontSize: '13px', fontWeight: '600' }}><AlertTriangle size={12} />{seg.segment}</span>
                    <span style={{ color: '#666', fontSize: '12px' }}>{seg.rejection_reason}</span>
                  </div>
                ))}
              </div>
            )}

            {aud.audience_quality_reason && (
              <p style={{ color: '#888', fontSize: '12px', margin: '14px 0 0', lineHeight: '1.5' }}>
                Audience Quality Score: <span style={{ color: '#F7B731', fontWeight: '700' }}>{aud.audience_quality_score}/100</span> — {aud.audience_quality_reason}
              </p>
            )}
          </SectionCard>

          {/* ── 6. EXECUTIVE DECISIONS ── */}
          <SectionCard
            title="⚡ Executive Decisions"
            subtitle="Top 5 highest-impact actions, ROI priorities, 30/60/90-day plan"
            accent="#F59E0B"
            onCopy={() => handleCopy('exec', exec)}
            copied={copied.exec}
          >
            {exec.highest_roi_action && (
              <div style={{ background: '#FFFBEB', border: '1px solid #F59E0B40', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px', borderLeft: '4px solid #F59E0B' }}>
                <p style={{ color: '#F59E0B', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>⚡ Highest ROI Action</p>
                <p style={{ color: '#171717', fontSize: '15px', fontWeight: '700', margin: '0 0 6px', lineHeight: '1.4' }}>{exec.highest_roi_action}</p>
                {exec.highest_roi_reason && <p style={{ color: '#666', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{exec.highest_roi_reason}</p>}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {(exec.top_5_actions || []).map((action, i) => (
                <div key={i} style={{ background: '#F9F9F9', border: '1px solid #EAEAEA', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#D4AF3715', border: '1px solid #D4AF3535', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <span style={{ color: '#D4AF37', fontSize: '13px', fontWeight: '800' }}>{action.rank}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#171717', fontSize: '14px', fontWeight: '600', margin: '0 0 5px', lineHeight: '1.4' }}>{action.action}</p>
                      {action.why && <p style={{ color: '#888', fontSize: '13px', margin: '0 0 10px', lineHeight: '1.5' }}>{action.why}</p>}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {action.expected_impact && (
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `${impactColor(action.expected_impact)}18`, color: impactColor(action.expected_impact) }}>
                            {action.expected_impact} Impact
                          </span>
                        )}
                        {action.effort && (
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `${effortColor(action.effort)}18`, color: effortColor(action.effort) }}>
                            {action.effort} Effort
                          </span>
                        )}
                        {action.timeline && (
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: '#F5F5F5', color: '#666' }}>
                            {action.timeline}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(exec.quick_wins || []).length > 0 && (
              <div style={{ background: '#10B98110', border: '1px solid #10B98128', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ color: '#10B981', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>⚡ Quick Wins</p>
                {exec.quick_wins.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>
                    <p style={{ color: '#171717', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{w}</p>
                  </div>
                ))}
              </div>
            )}

            {(exec.plan_30_day || exec.plan_60_day || exec.plan_90_day) && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {[
                  { label: '30 Days', value: exec.plan_30_day, color: '#10B981' },
                  { label: '60 Days', value: exec.plan_60_day, color: '#F59E0B' },
                  { label: '90 Days', value: exec.plan_90_day, color: '#D4AF37' },
                ].map(({ label, value, color }) => value ? (
                  <div key={label} style={{ background: '#F9F9F9', borderRadius: '10px', padding: '14px', borderTop: `3px solid ${color}` }}>
                    <p style={{ color, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>{label}</p>
                    <p style={{ color: '#171717', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{value}</p>
                  </div>
                ) : null)}
              </div>
            )}

            {(exec.biggest_risk || exec.biggest_opportunity) && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                {exec.biggest_risk && (
                  <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '14px' }}>
                    <p style={{ color: '#BE123C', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Biggest Risk</p>
                    <p style={{ color: '#171717', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{exec.biggest_risk}</p>
                  </div>
                )}
                {exec.biggest_opportunity && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #10B98120', borderRadius: '10px', padding: '14px' }}>
                    <p style={{ color: '#10B981', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Biggest Opportunity</p>
                    <p style={{ color: '#171717', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{exec.biggest_opportunity}</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

        </div>
      </div>
    )
  }

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: FONT, color: '#171717', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EAEAEA', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Dna size={15} color="#D4AF37" strokeWidth={1.5} />
        <span style={{ fontWeight: '600', fontSize: '15px' }}>Business Intelligence</span>
      </div>

      <div style={{ maxWidth: '560px', margin: isMobile ? '20px auto' : '40px auto', padding: isMobile ? '0 16px' : '0 24px' }}>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#D4AF3712', border: '1px solid #D4AF3530', borderRadius: '20px', padding: '4px 14px', marginBottom: '14px' }}>
            <Dna size={11} color="#D4AF37" strokeWidth={1.5} />
            <span style={{ color: '#D4AF37', fontSize: '12px', fontWeight: '600' }}>Flagship Feature</span>
          </div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', margin: '0 0 10px', letterSpacing: '-0.4px' }}>
            Business Intelligence Platform
          </h1>
          <p style={{ color: '#888', fontSize: '14px', margin: 0, lineHeight: '1.7' }}>
            6 AI engines. Evidence-only analysis. DNA score, opportunity score, threat score, audience quality, readiness — sab ek saath.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '10px', marginBottom: '28px' }}>
          {[
            [Search,     'Evidence Engine', '6 pages crawled'],
            [Dna,        'DNA Scoring',    'Evidence-only'],
            [Zap,        '5 BI Scores',    'Real-time output'],
          ].map(([Icon, title, sub]) => (
            <div key={title} style={{ background: '#FFFFFF', border: '1px solid #EAEAEA', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <Icon size={18} color="#D4AF37" strokeWidth={1.5} />
              </div>
              <p style={{ color: '#171717', fontSize: '12px', fontWeight: '600', margin: '0 0 3px' }}>{title}</p>
              <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>{sub}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #EAEAEA', borderRadius: '16px', padding: '28px' }}>
          {error && (
            <div style={{ background: '#F43F5E15', border: '1px solid #F43F5E40', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          <p style={{ fontSize: '11px', color: '#D4AF37', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px' }}>
            Business Info
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Website URL *</label>
            <input
              type="url" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://aapkibusiness.com"
              onKeyDown={e => e.key === 'Enter' && handleRun()}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Business Type <span style={{ color: '#475569', fontWeight: '400' }}>(optional — AI verify karega)</span></label>
            <select value={businessType} onChange={e => setBusinessType(e.target.value)}
              style={{ ...inputStyle, color: businessType ? '#171717' : '#999' }}>
              <option value="">Select karo...</option>
              <option value="Wedding & Events">Wedding &amp; Events</option>
              <option value="Restaurant / Cafe">Restaurant / Cafe</option>
              <option value="Healthcare / Clinic">Healthcare / Clinic</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Education / Coaching">Education / Coaching</option>
              <option value="Beauty & Skincare">Beauty &amp; Skincare</option>
              <option value="Retail Store">Retail Store</option>
              <option value="Salon / Spa">Salon / Spa</option>
              <option value="Travel & Tourism">Travel &amp; Tourism</option>
              <option value="Technology / SaaS">Technology / SaaS</option>
              <option value="Digital Marketing Agency">Digital Marketing Agency</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>
                Competitor URL <span style={{ color: '#475569', fontWeight: '400' }}>(optional)</span>
              </label>
              <input type="url" value={competitorUrl} onChange={e => setCompetitorUrl(e.target.value)}
                placeholder="https://competitor.com"
                style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={inputStyle}>
                <option value="Hinglish">Hinglish</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRun}
            style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#171717', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Dna size={15} /> Run Business Intelligence
          </button>
          <p style={{ textAlign: 'center', color: '#475569', fontSize: '12px', margin: '12px 0 0' }}>
            30–60 seconds · 6 engines · evidence-backed JSON output
          </p>
        </div>
      </div>
    </div>
  )
}

export default Intelligence
