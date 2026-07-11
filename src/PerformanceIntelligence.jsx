import { useState, useEffect } from 'react'
import { Activity, Copy, Check, TrendingUp, TrendingDown, Minus, AlertCircle, Zap } from 'lucide-react'
import CityInput, { getLastCity } from './CityInput'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'



const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const LS_KEY  = 'adsoh_performance_result'


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
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        background: copied ? '#16A34A' : '#F5F5F5', border: '1px solid ' + (copied ? '#16A34A' : '#E5E5E5'),
        color: copied ? '#fff' : '#666', padding: '6px 12px', borderRadius: '6px',
        fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0,
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy Report'}
    </button>
  )
}

function StatusBadge({ status }) {
  const map = {
    above:    { bg: '#F0FDF4', color: GREEN, border: '#BBF7D0', label: 'Above Target' },
    on_track: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', label: 'On Track' },
    below:    { bg: '#FFF1F2', color: RED, border: '#FECDD3', label: 'Below Target' },
  }
  const s = map[status] || map.on_track
  return (
    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

function RatingBadge({ rating }) {
  const map = {
    good:    { bg: '#F0FDF4', color: GREEN, border: '#BBF7D0' },
    average: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
    poor:    { bg: '#FFF1F2', color: RED, border: '#FECDD3' },
  }
  const s = map[rating] || map.average
  return (
    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}`, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {rating || 'N/A'}
    </span>
  )
}

function TrendIcon({ trend }) {
  if (trend === 'improving') return <TrendingUp size={14} color="#16A34A" />
  if (trend === 'declining') return <TrendingDown size={14} color="#DC2626" />
  return <Minus size={14} color="#D97706" />
}

function buildCopyText(r) {
  if (!r) return ''
  const p   = r.performance || {}
  const am  = p.actual_metrics || {}
  const eva = p.expected_vs_actual || []
  const cb  = p.campaign_breakdown || []
  const qw  = p.quick_wins || []
  return [
    '══════════════════════════════════════',
    '  PERFORMANCE INTELLIGENCE — Adsoh Growth OS',
    '══════════════════════════════════════',
    '',
    `Period: ${p.date_range || ''}  |  Health: ${p.overall_health}/100  |  Trend: ${p.trend}`,
    `Google Ads Connected: ${r.google_ads_connected ? 'Yes' : 'No'}`,
    '',
    'ACTUAL METRICS:',
    `  Impressions: ${am.impressions?.toLocaleString?.() || am.impressions}  |  Clicks: ${am.clicks}  |  CTR: ${am.ctr}`,
    `  CPC: ${am.cpc}  |  Cost: ${am.cost}  |  Conversions: ${am.conversions}`,
    `  CPA: ${am.cpa}  |  ROAS: ${am.roas}`,
    '',
    'TOP INSIGHT:',
    `  ${p.top_insight}`,
    '',
    'BIGGEST PROBLEM:',
    `  ${p.biggest_problem}`,
    '',
    'EXPECTED vs ACTUAL:',
    ...eva.map(e => `  ${e.metric}: expected ${e.expected} / actual ${e.actual} / gap ${e.gap} — ${e.action}`),
    '',
    'CAMPAIGN BREAKDOWN:',
    ...cb.map(c => `  ${c.campaign_name} (${c.status}): ${c.impressions?.toLocaleString?.() || c.impressions} impr / ${c.clicks} clk / ${c.cost} / ${c.conversions} conv / ${c.ctr} CTR — ${c.performance_rating}`),
    '',
    'QUICK WINS:',
    ...qw.map((w, i) => `  ${i + 1}. ${w}`),
    '',
    'AI ANALYSIS:',
    p.ai_analysis || '',
  ].join('\n')
}

export default function PerformanceIntelligence() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [url, setUrl]                     = useState('')
  const [industry, setIndustry]           = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [city, setCity]                   = useState(getLastCity)
  const [dateRange, setDateRange]         = useState('30d')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [result, setResult]               = useState(null)
  const [fromCache, setFromCache]         = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  const resolvedIndustry = industry === 'Other' ? industryOther : industry


  async function handleAnalyse() {
    setError(''); setLoading(true); setResult(null)
    try {
      const res  = await fetch(`${BACKEND}/performance-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), industry: resolvedIndustry, city, date_range: dateRange }),
      })
      const data = await res.json()
      if (data.success) { setResult(data); localStorage.setItem(LS_KEY, JSON.stringify(data)); setFromCache(false) }
      else setError(data.message || data.error || 'Analysis failed.')
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  const p   = result?.performance || {}
  const am  = p.actual_metrics    || {}
  const eva = p.expected_vs_actual || []
  const cb  = p.campaign_breakdown || []
  const qw  = p.quick_wins        || []

  const healthScore = p.overall_health ?? null
  const healthColor =
    healthScore === null     ? '#888'    :
    healthScore >= 70        ? '#16A34A' :
    healthScore >= 40        ? GOLD      : '#DC2626'
  const healthBg =
    healthScore === null     ? '#F5F5F5' :
    healthScore >= 70        ? '#F0FDF4' :
    healthScore >= 40        ? '#FFFBEB' : '#FEF2F2'

  const METRIC_CARDS = [
    { label: 'Impressions', value: typeof am.impressions === 'number' ? am.impressions.toLocaleString() : am.impressions, color: '#6366F1' },
    { label: 'Clicks',      value: am.clicks,      color: '#6366F1' },
    { label: 'CTR',         value: am.ctr,         color: GOLD },
    { label: 'CPC',         value: am.cpc,         color: '#D97706' },
    { label: 'Cost',        value: am.cost,        color: '#DC2626' },
    { label: 'Conversions', value: am.conversions, color: GREEN },
    { label: 'CPA',         value: am.cpa,         color: '#D97706' },
    { label: 'ROAS',        value: am.roas,        color: GREEN },
  ]

  return (
    <PageShell maxWidth="960px">
      <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>

      <PageHeader title="Performance Intelligence" sub="Live Google Ads performance analysis — actual vs expected KPIs, campaign breakdown, and AI-generated insights." />

      {/* Form */}
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '16px' }}>
          {error && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: RED, fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Business URL <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>(optional — for memory)</span></label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g. sohscape.com" style={inp} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
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
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Specify Industry</label>
              <input type="text" value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="e.g. Interior Designers" style={inp} />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={lbl}>Date Range</label>
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={inp}>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <button onClick={handleAnalyse} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
            background: loading ? '#E5E5E5' : GOLD, border: 'none', color: loading ? '#999' : '#fff',
            padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            <Activity size={15} />
            {loading ? 'Analysing Performance...' : 'Analyse Performance'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ maxWidth: '640px', width: '100%' }}>
          {['Connecting to Google Ads...', 'Fetching campaign data...', 'Comparing expected vs actual...', 'Generating AI insights...'].map((label, i) => (
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
          <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Showing previous result · Analyse again to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY); setResult(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: MUTED, textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ maxWidth: '960px', width: '100%' }}>

          {/* Report header */}
          <div style={{ ...card, padding: '14px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: BONE }}>Google Ads Performance — {p.date_range}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: MUTED }}>
                {result.google_ads_connected ? '✓ Connected to Google Ads' : '⚠ Google Ads not connected or no data'}
                {result.memory_used ? ' · memory used' : ''}
              </p>
            </div>
            <CopyBtn text={buildCopyText(result)} />
          </div>

          {/* Health Score + Top Insight + Biggest Problem */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '160px 1fr', gap: '12px', marginBottom: '12px' }}>

            {/* Health score */}
            <div style={{ ...card, padding: '20px', background: healthBg, border: `1px solid ${healthColor}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Health Score</p>
              <p style={{ margin: 0, fontSize: '44px', fontWeight: '700', color: healthColor, lineHeight: 1 }}>
                {healthScore ?? '—'}
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: MUTED }}>/100</p>
              {p.trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', background: SLATE, border: `1px solid ${SLATE_L}` }}>
                  <TrendIcon trend={p.trend} />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#555', textTransform: 'capitalize' }}>{p.trend}</span>
                </div>
              )}
            </div>

            {/* Top insight + Biggest problem stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {p.top_insight && (
                <div style={{ ...card, padding: '16px 20px', borderLeft: `3px solid ${GOLD}`, flex: 1 }}>
                  <p style={{ margin: '0 0 5px', fontSize: '11px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top Insight</p>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#222', lineHeight: '1.55' }}>{p.top_insight}</p>
                </div>
              )}
              {p.biggest_problem && (
                <div style={{ ...card, padding: '16px 20px', borderLeft: '3px solid #DC2626', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                    <AlertCircle size={12} color="#DC2626" />
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Biggest Problem</p>
                  </div>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#222', lineHeight: '1.55' }}>{p.biggest_problem}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actual Metrics grid */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#555' }}>Actual Metrics</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '8px' }}>
              {METRIC_CARDS.map(m => (
                <div key={m.label} style={{ ...card, padding: '14px 16px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</p>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: m.color, letterSpacing: '-0.3px', lineHeight: 1.1 }}>{m.value ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expected vs Actual table */}
          {eva.length > 0 && (
            <div style={{ ...card, padding: isMobile ? '16px 12px' : '20px', marginBottom: '12px', overflowX: 'auto' }}>
              <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '600', color: '#555' }}>Expected vs Actual</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                <thead>
                  <tr>
                    {['Metric', 'Expected', 'Actual', 'Status', 'Gap', 'Action'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '7px 10px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eva.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F7F7F7' }}>
                      <td style={{ padding: '9px 10px', fontSize: '13px', fontWeight: '600', color: BONE, whiteSpace: 'nowrap' }}>{row.metric}</td>
                      <td style={{ padding: '9px 10px', fontSize: '13px', color: MUTED }}>{row.expected}</td>
                      <td style={{ padding: '9px 10px', fontSize: '13px', fontWeight: '600', color: BONE }}>{row.actual}</td>
                      <td style={{ padding: '9px 10px' }}><StatusBadge status={row.status} /></td>
                      <td style={{ padding: '9px 10px', fontSize: '12px', color: row.status === 'below' ? '#DC2626' : row.status === 'above' ? '#16A34A' : '#D97706', fontWeight: '600', whiteSpace: 'nowrap' }}>{row.gap}</td>
                      <td style={{ padding: '9px 10px', fontSize: '12px', color: '#555', lineHeight: '1.4', maxWidth: '240px' }}>{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Campaign Breakdown table */}
          {cb.length > 0 && (
            <div style={{ ...card, padding: isMobile ? '16px 12px' : '20px', marginBottom: '12px', overflowX: 'auto' }}>
              <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '600', color: '#555' }}>Campaign Breakdown</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr>
                    {['Campaign', 'Status', 'Impressions', 'Clicks', 'Cost', 'Conv.', 'CTR', 'Rating'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '7px 10px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F0F0F0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cb.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F7F7F7' }}>
                      <td style={{ padding: '9px 10px', fontSize: '12.5px', fontWeight: '500', color: BONE, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.campaign_name}</td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: c.status === 'ENABLED' ? '#F0FDF4' : '#F5F5F5', color: c.status === 'ENABLED' ? '#16A34A' : '#888', border: `1px solid ${c.status === 'ENABLED' ? '#BBF7D0' : '#E5E5E5'}` }}>{c.status}</span>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: '12.5px', color: '#444' }}>{typeof c.impressions === 'number' ? c.impressions.toLocaleString() : c.impressions}</td>
                      <td style={{ padding: '9px 10px', fontSize: '12.5px', color: '#444' }}>{c.clicks}</td>
                      <td style={{ padding: '9px 10px', fontSize: '12.5px', fontWeight: '600', color: BONE }}>{c.cost}</td>
                      <td style={{ padding: '9px 10px', fontSize: '12.5px', color: '#444' }}>{c.conversions}</td>
                      <td style={{ padding: '9px 10px', fontSize: '12.5px', color: '#444' }}>{c.ctr}</td>
                      <td style={{ padding: '9px 10px' }}><RatingBadge rating={c.performance_rating} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick Wins */}
          {qw.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                <Zap size={14} color={GOLD} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#555' }}>Quick Wins</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '8px' }}>
                {qw.map((w, i) => (
                  <div key={i} style={{ ...card, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: GOLD + '20', border: `1.5px solid ${GOLD}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: GOLD }}>{i + 1}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12.5px', color: BONE, lineHeight: '1.5' }}>{w}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {p.ai_analysis && (
            <div style={{ ...card, padding: isMobile ? '18px 14px' : '22px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                <Activity size={13} color={GOLD} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#555' }}>AI Analysis</p>
              </div>
              {p.ai_analysis.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} style={{ margin: i > 0 ? '10px 0 0' : '0', fontSize: '13.5px', color: BONE, lineHeight: '1.65' }}>{para}</p>
              ))}
            </div>
          )}

        </div>
      )}
    </PageShell>
  )
}
