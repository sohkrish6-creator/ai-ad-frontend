import { useState, useEffect } from 'react'
import { Trophy, Copy, Check, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Star, ArrowRight, Zap } from 'lucide-react'
import CityInput, { getLastCity } from './CityInput'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'



const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const LS_KEY  = 'adsoh_result_result'


const INDUSTRIES = [
  'Hospitality (Hotels, Restaurants, Cafes)', 'Schools & Education', 'Healthcare & Clinics',
  'Real Estate', 'Retail & Fashion', 'Food & Beverage', 'Wellness & Fitness', 'Wedding & Events',
  'Auto & Transport', 'Professional Services', 'Coaching & Tutoring', 'Jewellery & Accessories',
  'Interior Design & Architecture', 'Photography & Videography', 'Legal & CA Services',
  'IT & Software Companies', 'Travel & Tourism', 'Salon & Beauty', 'Gym & Sports Academy',
  'NGO & Social Enterprise', 'Agriculture & Dairy', 'Logistics & Transport', 'Printing & Packaging',
  'Construction & Builders', 'Media & Entertainment', 'Other',
]

function Shimmer({ h = '14px', w = '100%' }) {
  return <div style={{ height: h, width: w, borderRadius: '4px', background: 'linear-gradient(90deg,#F0F0F0 25%,#E8E8E8 50%,#F0F0F0 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.2s ease-in-out infinite' }} />
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{ display: 'flex', alignItems: 'center', gap: '5px', background: copied ? '#16A34A' : '#F5F5F5', border: '1px solid ' + (copied ? '#16A34A' : '#E5E5E5'), color: copied ? '#fff' : '#666', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy Report'}
    </button>
  )
}

function VerdictBadge({ verdict }) {
  const map = {
    success:    { bg: '#F0FDF4', color: GREEN, border: '#BBF7D0', label: 'Success' },
    partial:    { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', label: 'Partial Success' },
    needs_work: { bg: '#FEF2F2', color: RED, border: '#FECDD3', label: 'Needs Work' },
  }
  const s = map[verdict] || map.partial
  return <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}`, textTransform: 'capitalize' }}>{s.label}</span>
}

function PvABadge({ verdict }) {
  const map = {
    above:    { bg: '#F0FDF4', color: GREEN, border: '#BBF7D0', label: 'Above' },
    on_track: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', label: 'On Track' },
    below:    { bg: '#FEF2F2', color: RED, border: '#FECDD3', label: 'Below' },
  }
  const s = map[verdict] || map.on_track
  return <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>{s.label}</span>
}

function buildCopyText(r) {
  if (!r) return ''
  const o   = r.result       || {}
  const pva = o.prediction_vs_actual           || []
  const ww  = o.what_worked                    || []
  const wf  = o.what_failed                    || []
  const rs  = o.revenue_summary                || {}
  const bp  = o.best_performing                || {}
  const kl  = o.key_learnings                  || []
  const ncr = o.next_campaign_recommendations  || []
  const na  = o.next_actions                   || []
  const gmp = o.growth_memory_packet           || {}

  return [
    '══════════════════════════════════',
    '  RESULT CENTER — Adsoh Growth OS',
    '══════════════════════════════════',
    '',
    'VERDICT: ' + (o.campaign_verdict || '') + '  |  Score: ' + (o.overall_score || 0) + '/100',
    '',
    'REVENUE SUMMARY:',
    '  Spend: ' + (rs.total_spend || '') + ' | Leads: ' + (rs.total_leads || 0) + ' | Conversions: ' + (rs.total_conversions || 0),
    '  Revenue: ' + (rs.revenue_generated || '') + ' | ROAS: ' + (rs.roas || '') + ' | ROI: ' + (rs.roi || ''),
    '',
    'PREDICTION VS ACTUAL:',
    ...pva.map(p => '  ' + p.metric + ': predicted ' + p.predicted + ' / actual ' + p.actual + ' (' + p.verdict + ') — ' + p.learning),
    '',
    'WHAT WORKED:',
    ...ww.map(w => '  + ' + w.what + ' — ' + w.why + '\n    Keep doing: ' + w.keep_doing),
    '',
    'WHAT FAILED:',
    ...wf.map(w => '  - ' + w.what + ' — ' + w.why + '\n    Fix next time: ' + w.fix_next_time),
    '',
    'BEST PERFORMING:',
    '  Audience: ' + (bp.audience || '') + ' | Creative: ' + (bp.creative || ''),
    '  Platform: ' + (bp.platform || '') + ' | Campaign: ' + (bp.campaign || ''),
    '',
    'KEY LEARNINGS:',
    ...kl.map((l, i) => '  ' + (i + 1) + '. ' + l),
    '',
    'NEXT CAMPAIGN RECOMMENDATIONS:',
    ...ncr.map(n => '  • ' + n.recommendation + ' — ' + n.reason + ' | Expected: ' + n.expected_improvement),
    '',
    'NEXT ACTIONS:',
    ...na.map(a => '  ' + a.priority + '. ' + a.action + ' (' + a.deadline + ') → ' + a.expected_impact),
    '',
    'GROWTH MEMORY PACKET (Anonymous):',
    '  Industry: ' + (gmp.industry || '') + ' | Business type: ' + (gmp.business_type || ''),
    '  Budget range: ' + (gmp.budget_range || '') + ' | Winning audience: ' + (gmp.winning_audience || ''),
    '  Winning platform: ' + (gmp.winning_platform || '') + ' | Winning offer: ' + (gmp.winning_offer || ''),
    '  Avg CPL: ' + (gmp.avg_cpl || '') + ' | Avg ROAS: ' + (gmp.avg_roas || '') + ' | Confidence: ' + (gmp.confidence || 0) + '%',
  ].join('\n')
}

export default function ResultCenter() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [url, setUrl]                     = useState('')
  const [industry, setIndustry]           = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [city, setCity]                   = useState(getLastCity)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [result, setResult]               = useState(null)
  const [fromCache, setFromCache]         = useState(false)
  const [gmpOpen, setGmpOpen]             = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  const resolvedIndustry = industry === 'Other' ? industryOther : industry


  async function handleGenerate() {
    setError(''); setLoading(true); setResult(null)
    try {
      const res  = await fetch(`${BACKEND}/result-center`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), industry: resolvedIndustry, city }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)
        localStorage.setItem(LS_KEY, JSON.stringify(data))
        setFromCache(false)
      } else {
        setError(data.message || data.error || 'Generation failed.')
      }
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  const o   = result?.result                  || {}
  const pva = o.prediction_vs_actual          || []
  const ww  = o.what_worked                   || []
  const wf  = o.what_failed                   || []
  const rs  = o.revenue_summary               || {}
  const bp  = o.best_performing               || {}
  const kl  = o.key_learnings                 || []
  const ncr = o.next_campaign_recommendations || []
  const na  = o.next_actions                  || []
  const gmp = o.growth_memory_packet          || {}

  const verdict    = (o.campaign_verdict || '').toLowerCase()
  const vStyle = verdict === 'success'
    ? { bg: '#F0FDF4', border: '#BBF7D0', color: GREEN, label: 'Campaign Success' }
    : verdict === 'needs_work'
    ? { bg: '#FEF2F2', border: '#FECDD3', color: RED, label: 'Needs Work' }
    : { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', label: 'Partial Success' }

  const score = o.overall_score ?? null

  const REVENUE_CARDS = [
    { label: 'Total Spend',    value: rs.total_spend,        color: '#DC2626' },
    { label: 'Total Leads',    value: rs.total_leads,        color: '#6366F1' },
    { label: 'Conversions',    value: rs.total_conversions,  color: GOLD      },
    { label: 'Revenue',        value: rs.revenue_generated,  color: GREEN },
    { label: 'ROAS',           value: rs.roas,               color: GREEN },
    { label: 'ROI',            value: rs.roi,                color: '#6366F1' },
  ]

  const BEST_CARDS = [
    { label: 'Best Audience',  value: bp.audience,  icon: '👥' },
    { label: 'Best Creative',  value: bp.creative,  icon: '🎨' },
    { label: 'Best Platform',  value: bp.platform,  icon: '📱' },
    { label: 'Best Campaign',  value: bp.campaign,  icon: '🏆' },
  ]

  const GMP_ROWS = [
    { label: 'Industry',          value: gmp.industry },
    { label: 'Business Type',     value: gmp.business_type },
    { label: 'Budget Range',      value: gmp.budget_range },
    { label: 'Winning Audience',  value: gmp.winning_audience },
    { label: 'Winning Platform',  value: gmp.winning_platform },
    { label: 'Winning Offer',     value: gmp.winning_offer },
    { label: 'Avg CPL',           value: gmp.avg_cpl },
    { label: 'Avg ROAS',          value: gmp.avg_roas },
    { label: 'Confidence',        value: gmp.confidence != null ? gmp.confidence + '%' : null },
  ]

  return (
    <PageShell maxWidth="960px">
      <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>

      <PageHeader title="Result Center" sub="Final campaign summary — prediction vs actual, what worked, what failed, and your next moves." />

      {/* Form */}
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '16px' }}>
          {error && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: RED, fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Business URL <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>(optional — for memory)</span></label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g. sohscape.com" style={inp} />
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: MUTED }}>Same URL + Industry as all other modules</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Industry</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inp, color: industry ? '#171717' : '#999' }}>
                <option value="">— Optional —</option>
                {INDUSTRIES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>City</label>
              <CityInput value={city} onChange={setCity} style={inp} />
            </div>
          </div>

          {industry === 'Other' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Specify Industry</label>
              <input type="text" value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="e.g. Interior Designers" style={inp} />
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
            background: loading ? '#E5E5E5' : GOLD, border: 'none', color: loading ? '#999' : '#fff',
            padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            <Trophy size={15} />
            {loading ? 'Generating Result Report...' : 'Generate Result Report'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ maxWidth: '640px', width: '100%' }}>
          {['Reading all memory tables...', 'Comparing predictions vs actuals...', 'Analysing what worked + what failed...', 'Compiling final report + growth memory...'].map((label, i) => (
            <div key={i} style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FFFBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 5px', fontSize: '13px', fontWeight: '500', color: BONE }}>{label}</p>
                <Shimmer h="8px" w="50%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cache banner */}
      {fromCache && result && !loading && (
        <div style={{ maxWidth: '960px', width: '100%', background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '9px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Showing previous result · Generate new report to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY); setResult(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: MUTED, textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ maxWidth: '960px', width: '100%' }}>

          {/* Report header */}
          <div style={{ ...card, padding: '14px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: BONE }}>Result Center Report</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: MUTED }}>{result.business_key}{result.memory_used ? ' · all memory read' : ''}</p>
            </div>
            <CopyBtn text={buildCopyText(result)} />
          </div>

          {/* Campaign Verdict + Score */}
          <div style={{ background: vStyle.bg, border: `1.5px solid ${vStyle.border}`, borderRadius: '8px', padding: isMobile ? '18px 16px' : '22px 24px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: vStyle.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Campaign Verdict</p>
              <p style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '700', color: vStyle.color }}>{vStyle.label}</p>
              <VerdictBadge verdict={verdict} />
            </div>
            {score !== null && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overall Score</p>
                <p style={{ margin: 0, fontSize: '52px', fontWeight: '700', color: vStyle.color, lineHeight: 1 }}>{score}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: MUTED }}>/100</p>
              </div>
            )}
          </div>

          {/* Revenue Summary */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#555' }}>Revenue Summary</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(6, 1fr)', gap: '8px' }}>
              {REVENUE_CARDS.map(m => (
                <div key={m.label} style={{ ...card, padding: '14px 12px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: m.color, lineHeight: 1.1 }}>{m.value ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction vs Actual */}
          {pva.length > 0 && (
            <div style={{ ...card, padding: isMobile ? '16px 12px' : '20px', marginBottom: '12px', overflowX: 'auto' }}>
              <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '600', color: '#555' }}>Prediction vs Actual</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr>
                    {['Metric', 'Predicted', 'Actual', 'Verdict', 'Learning'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '7px 10px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pva.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F7F7F7' }}>
                      <td style={{ padding: '9px 10px', fontSize: '13px', fontWeight: '600', color: BONE, whiteSpace: 'nowrap' }}>{row.metric}</td>
                      <td style={{ padding: '9px 10px', fontSize: '13px', color: MUTED }}>{row.predicted}</td>
                      <td style={{ padding: '9px 10px', fontSize: '13px', fontWeight: '600', color: BONE }}>{row.actual}</td>
                      <td style={{ padding: '9px 10px' }}><PvABadge verdict={row.verdict} /></td>
                      <td style={{ padding: '9px 10px', fontSize: '12px', color: '#555', lineHeight: '1.4', maxWidth: '220px' }}>{row.learning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* What Worked + What Failed */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

            <div style={{ ...card, padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                <TrendingUp size={13} color="#16A34A" />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: GREEN }}>What Worked</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ww.map((w, i) => (
                  <div key={i} style={{ borderLeft: '3px solid #16A34A', paddingLeft: '12px' }}>
                    <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '600', color: BONE }}>{w.what}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#555', lineHeight: '1.4' }}>{w.why}</p>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: GREEN }}>Keep doing: {w.keep_doing}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...card, padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                <TrendingDown size={13} color="#DC2626" />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#DC2626' }}>What Failed</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {wf.map((w, i) => (
                  <div key={i} style={{ borderLeft: '3px solid #DC2626', paddingLeft: '12px' }}>
                    <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '600', color: BONE }}>{w.what}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#555', lineHeight: '1.4' }}>{w.why}</p>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#DC2626' }}>Fix next time: {w.fix_next_time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Best Performing */}
          {Object.values(bp).some(Boolean) && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                <Star size={13} color={GOLD} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#555' }}>Best Performing</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '8px' }}>
                {BEST_CARDS.map(c => (
                  <div key={c.label} style={{ ...card, padding: '14px 16px', border: `1.5px solid ${GOLD}30`, background: '#FFFDF5' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '18px' }}>{c.icon}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</p>
                    <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '600', color: BONE, lineHeight: '1.4' }}>{c.value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Learnings */}
          {kl.length > 0 && (
            <div style={{ ...card, padding: isMobile ? '18px 14px' : '22px', marginBottom: '12px' }}>
              <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '600', color: '#555' }}>Key Learnings</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {kl.map((l, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: SLATE_M, border: '1.5px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: MUTED }}>{i + 1}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: BONE, lineHeight: '1.55' }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Campaign Recommendations */}
          {ncr.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                <ArrowRight size={13} color={GOLD} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#555' }}>Next Campaign Recommendations</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '8px' }}>
                {ncr.map((n, i) => (
                  <div key={i} style={{ ...card, padding: '14px 16px' }}>
                    <p style={{ margin: '0 0 5px', fontSize: '13px', fontWeight: '600', color: BONE, lineHeight: '1.4' }}>{n.recommendation}</p>
                    <p style={{ margin: '0 0 6px', fontSize: '12px', color: MUTED, lineHeight: '1.45' }}>{n.reason}</p>
                    {n.expected_improvement && (
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: GREEN }}>{n.expected_improvement}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Actions */}
          {na.length > 0 && (
            <div style={{ ...card, padding: isMobile ? '18px 14px' : '22px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                <Zap size={13} color={GOLD} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#555' }}>Next Actions</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {na.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 14px', background: i === 0 ? '#FFFDF5' : '#FAFAFA', borderRadius: '7px', border: i === 0 ? `1.5px solid ${GOLD}40` : '1px solid #F0F0F0' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? GOLD : '#E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: i === 0 ? '#fff' : '#666' }}>{a.priority}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: BONE }}>{a.action}</p>
                        {a.deadline && (
                          <span style={{ fontSize: '10px', fontWeight: '700', color: MUTED, background: SLATE_M, border: `1px solid ${SLATE_L}`, padding: '1px 7px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{a.deadline}</span>
                        )}
                      </div>
                      {a.expected_impact && <p style={{ margin: 0, fontSize: '12px', color: GREEN, fontWeight: '500' }}>{a.expected_impact}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Growth Memory Packet (collapsible) */}
          {Object.values(gmp).some(Boolean) && (
            <div style={{ ...card, marginBottom: '12px', overflow: 'hidden' }}>
              <button
                onClick={() => setGmpOpen(v => !v)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trophy size={14} color={GOLD} />
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#555' }}>Growth Memory Packet</p>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: MUTED, background: SLATE_M, border: `1px solid ${SLATE_L}`, padding: '1px 7px', borderRadius: '4px' }}>Saved to Industry Brain</span>
                </div>
                {gmpOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
              </button>
              {gmpOpen && (
                <div style={{ padding: '0 20px 16px', borderTop: '1px solid #F5F5F5' }}>
                  <p style={{ margin: '12px 0 10px', fontSize: '12px', color: MUTED, lineHeight: '1.5' }}>
                    This anonymised packet was saved to the industry growth database. No business name, URL, or PII included. It helps future clients in the same industry benefit from this campaign's learnings.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '8px' }}>
                    {GMP_ROWS.filter(r => r.value).map(r => (
                      <div key={r.label} style={{ background: INK, border: '1px solid #F0F0F0', borderRadius: '6px', padding: '10px 12px' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.label}</p>
                        <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '500', color: BONE, lineHeight: '1.4' }}>{r.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </PageShell>
  )
}
