import { useState, useEffect } from 'react'
import { BarChart2, Copy, Check, Zap } from 'lucide-react'
import { useToast } from './ToastContext'
import CityInput, { getLastCity } from './CityInput'
import { useLoadingSteps } from './useLoadingSteps'
import { TrustBadge, ValidationWarningBanner } from './TrustLayer'

const BACKEND  = 'https://ai-ad-backend-zhpj.onrender.com'
const GOLD     = '#D4AF37'
const LS_KEY   = 'adsoh_kpi_result'
const KPI_LOADING_STEPS = ['Gathering benchmarks...', 'Calculating predictions...', 'Building budget breakdown...']

const card = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
const lbl  = { display: 'block', color: '#999', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }
const inp  = { width: '100%', padding: '10px 13px', borderRadius: '7px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }

const INDUSTRIES = [
  'Hospitality (Hotels, Restaurants, Cafes)', 'Schools & Education', 'Healthcare & Clinics',
  'Real Estate', 'Retail & Fashion', 'Food & Beverage', 'Wellness & Fitness', 'Wedding & Events',
  'Auto & Transport', 'Professional Services', 'Coaching & Tutoring', 'Jewellery & Accessories',
  'Interior Design & Architecture', 'Photography & Videography', 'Legal & CA Services',
  'IT & Software Companies', 'Travel & Tourism', 'Salon & Beauty', 'Gym & Sports Academy',
  'NGO & Social Enterprise', 'Agriculture & Dairy', 'Logistics & Transport', 'Printing & Packaging',
  'Construction & Builders', 'Media & Entertainment', 'Other',
]

const GOALS = ['Lead Generation', 'Sales', 'Brand Awareness', 'App Installs', 'Event Registrations']

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const toast = useToast()
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }}
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

function Shimmer({ h = '14px', w = '100%' }) {
  return <div style={{ height: h, width: w, borderRadius: '4px', background: 'linear-gradient(90deg,#F0F0F0 25%,#E8E8E8 50%,#F0F0F0 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.2s ease-in-out infinite' }} />
}

function MetricCard({ label, value, range, benchmark }) {
  const isGood = (label === 'ROAS' && parseFloat(value) >= 3)
    || (label === 'CTR' && parseFloat(value) >= 2)
    || (['CPL', 'CPC', 'CPA'].includes(label) && false) // amber for cost metrics
  const accent = (label === 'ROAS' || label === 'Revenue Potential') ? '#16A34A'
    : (label === 'CTR' || label === 'Reach' || label === 'Impressions') ? '#6366F1'
    : (label === 'Clicks' || label === 'Leads' || label === 'Conversions') ? GOLD
    : '#D97706'

  return (
    <div style={{ ...card, padding: '16px 18px' }}>
      <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: '0 0 3px', fontSize: '22px', fontWeight: '700', color: accent, letterSpacing: '-0.5px', lineHeight: 1.1 }}>{value || '—'}</p>
      {range && <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#999' }}>Range: {range}</p>}
      {benchmark && (
        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600', background: '#F5F5F5', color: '#888', border: '1px solid #EAEAEA' }}>{benchmark}</span>
      )}
    </div>
  )
}

function buildCopyText(r) {
  if (!r) return ''
  const k = r.kpi
  const pm = k.predicted_metrics || {}
  const sc = k.success_criteria  || {}
  const bb = k.budget_breakdown   || {}
  const cl = k.cac_ltv            || {}

  return [
    '══════════════════════════════════',
    '  KPI ENGINE REPORT — Adsoh Growth OS',
    '══════════════════════════════════',
    '',
    `PRIMARY KPI: ${k.primary_kpi?.metric} — ${k.primary_kpi?.target}`,
    `Why: ${k.primary_kpi?.why}`,
    '',
    'PREDICTED METRICS:',
    `  CTR: ${pm.ctr?.value} (${pm.ctr?.range})`,
    `  CPC: ${pm.cpc?.value} (${pm.cpc?.range})`,
    `  CPL: ${pm.cpl?.value} (${pm.cpl?.range})`,
    `  CPA: ${pm.cpa?.value} (${pm.cpa?.range})`,
    `  ROAS: ${pm.roas?.value} (${pm.roas?.range})`,
    `  Reach: ${pm.reach?.value} | Impressions: ${pm.impressions?.value}`,
    `  Clicks: ${pm.clicks?.value} | Leads: ${pm.leads?.value} | Conversions: ${pm.conversions?.value}`,
    `  Revenue Potential: ${pm.revenue_potential?.value} (${pm.revenue_potential?.range})`,
    '',
    'SUCCESS CRITERIA:',
    `  Week 1: ${sc.week_1}`,
    `  Week 2: ${sc.week_2}`,
    `  Month 1: ${sc.month_1}`,
    `  Month 2: ${sc.month_2}`,
    `  Month 3: ${sc.month_3}`,
    '',
    'BUDGET BREAKDOWN:',
    `  Total: ${bb.recommended_total} | Daily: ${bb.daily_budget}`,
    `  Google Ads: ${bb.google_ads}`,
    `  Meta Ads: ${bb.meta_ads}`,
    `  Remarketing: ${bb.remarketing}`,
    '',
    'CAC vs LTV:',
    `  CAC: ${cl.estimated_cac} | LTV: ${cl.estimated_ltv}`,
    `  LTV:CAC Ratio: ${cl.ltv_cac_ratio} | Payback: ${cl.payback_period}`,
    '',
    'SECONDARY KPIs:',
    ...(k.secondary_kpis || []).map(s => `  • ${s.metric}: ${s.target} — ${s.why}`),
    '',
    `Confidence: ${k.confidence}/100 — ${k.confidence_reason}`,
  ].join('\n')
}

export default function KPIEngine() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const toast = useToast()

  const [url, setUrl]                     = useState('')
  const [industry, setIndustry]           = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [city, setCity]                   = useState(getLastCity)
  const [budget, setBudget]               = useState('')
  const [goal, setGoal]                   = useState('Lead Generation')
  const [loading, setLoading]             = useState(false)
  const loadingStep = useLoadingSteps(KPI_LOADING_STEPS, loading)
  const [error, setError]                 = useState('')
  const [result, setResult]               = useState(null)
  const [fromCache, setFromCache]         = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  const resolvedIndustry = industry === 'Other' ? industryOther : industry

  const page = {
    minHeight: '100vh', background: '#FAFAFA',
    padding: isMobile ? '28px 16px' : '40px 36px',
    maxWidth: '900px', width: '100%', boxSizing: 'border-box',
    fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
  }

  async function handleGenerate() {
    if (!resolvedIndustry) { setError('Industry select karo.'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const res  = await fetch(`${BACKEND}/kpi-engine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url:      url.trim(),
          industry: resolvedIndustry,
          city,
          budget:   budget ? parseFloat(budget) : 0,
          goal,
        }),
      })
      const data = await res.json()
      if (data.success) { setResult(data); localStorage.setItem(LS_KEY, JSON.stringify(data)); setFromCache(false); toast.success('Done!') }
      else { const msg = data.message || data.error || 'Generation failed. Dobara try karo.'; setError(msg); toast.error(msg) }
    } catch { setError('Backend se connect nahi ho paya.'); toast.error('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  const k = result?.kpi || {}

  return (
    <div style={page}>
      <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <BarChart2 size={20} color={GOLD} />
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.4px' }}>KPI Engine</h1>
      </div>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 28px' }}>Predict campaign KPIs before launch — CPL, ROAS, CAC, LTV, and success criteria based on your industry + memory.</p>

      {/* Input */}
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '16px' }}>
          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: '#BE123C', fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Business URL <span style={{ color: '#BBB', fontWeight: '400', textTransform: 'none' }}>(optional — for memory lookup)</span></label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g. sohscape.com" style={inp} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={lbl}>Industry <span style={{ color: '#DC2626' }}>*</span></label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inp, color: industry ? '#171717' : '#999' }}>
                <option value="">— Select industry —</option>
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

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Monthly Budget ₹ <span style={{ color: '#BBB', fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 15000" style={inp} min="0" />
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#999' }}>Leave blank to assume ₹10,000/month</p>
            </div>
            <div>
              <label style={lbl}>Campaign Goal</label>
              <select value={goal} onChange={e => setGoal(e.target.value)} style={inp}>
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
            background: loading ? '#E5E5E5' : GOLD, border: 'none', color: loading ? '#999' : '#fff',
            padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            <BarChart2 size={15} />
            {loading ? loadingStep : 'Generate KPI Predictions'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ maxWidth: '640px', width: '100%' }}>
          {['Reading campaign memory...', 'Calibrating industry benchmarks...', 'Predicting KPIs + success criteria...'].map((label, i) => (
            <div key={i} style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#FFFBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#171717', margin: '0 0 6px' }}>{label}</p>
                <Shimmer h="9px" w="55%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cache banner */}
      {fromCache && result && !loading && (
        <div style={{ maxWidth: '860px', width: '100%', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '7px', padding: '9px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Showing previous result · Generate new report to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY); setResult(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#888', textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ maxWidth: '860px', width: '100%' }}>

          <ValidationWarningBanner message={result.validation_warning} />
          <TrustBadge verdict={result.trust_verdict} basedOn={result.based_on} />

          {/* Report header */}
          <div style={{ ...card, padding: '14px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#171717' }}>KPI Predictions — {resolvedIndustry || result.business_key}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#999' }}>{city} · {goal}{result.memory_used ? ' · memory used' : ''}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {k.confidence !== undefined && (
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                  background: k.confidence >= 70 ? '#F0FDF4' : '#FFFBEB',
                  color:      k.confidence >= 70 ? '#16A34A' : '#D97706',
                  border: `1px solid ${k.confidence >= 70 ? '#BBF7D0' : '#FDE68A'}`,
                }}>{k.confidence}% confidence</span>
              )}
              <CopyBtn text={buildCopyText(result)} />
            </div>
          </div>

          {/* Primary KPI */}
          {k.primary_kpi && (
            <div style={{ ...card, padding: isMobile ? '20px 16px' : '24px', marginBottom: '12px', border: `2px solid ${GOLD}40`, background: '#FFFDF5' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Primary KPI — North Star Metric</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', margin: '8px 0 10px' }}>
                <span style={{ fontSize: '28px', fontWeight: '700', color: '#171717', letterSpacing: '-0.5px' }}>{k.primary_kpi.target}</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: GOLD }}>{k.primary_kpi.metric}</span>
              </div>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#555', lineHeight: '1.5' }}>{k.primary_kpi.why}</p>
            </div>
          )}

          {/* Predicted Metrics grid */}
          {k.predicted_metrics && (() => {
            const pm = k.predicted_metrics
            const metrics = [
              { label: 'CTR',               ...pm.ctr },
              { label: 'CPC',               ...pm.cpc },
              { label: 'CPL',               ...pm.cpl },
              { label: 'CPA',               ...pm.cpa },
              { label: 'ROAS',              ...pm.roas },
              { label: 'Reach',             ...pm.reach },
              { label: 'Impressions',       ...pm.impressions },
              { label: 'Clicks',            ...pm.clicks },
              { label: 'Leads',             ...pm.leads },
              { label: 'Conversions',       ...pm.conversions },
              { label: 'Revenue Potential', ...pm.revenue_potential },
            ]
            return (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#555' }}>Predicted Metrics</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '8px' }}>
                  {metrics.map(m => <MetricCard key={m.label} {...m} />)}
                </div>
              </div>
            )
          })()}

          {/* Success Criteria timeline */}
          {k.success_criteria && (() => {
            const sc = k.success_criteria
            const milestones = [
              { key: 'week_1',  label: 'Week 1',   color: '#6366F1', text: sc.week_1 },
              { key: 'week_2',  label: 'Week 2',   color: GOLD,      text: sc.week_2 },
              { key: 'month_1', label: 'Month 1',  color: '#16A34A', text: sc.month_1 },
              { key: 'month_2', label: 'Month 2',  color: '#D97706', text: sc.month_2 },
              { key: 'month_3', label: 'Month 3',  color: '#DC2626', text: sc.month_3 },
            ]
            return (
              <div style={{ ...card, padding: isMobile ? '18px 14px' : '22px', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: '600', color: '#555' }}>Success Criteria Timeline</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {milestones.filter(m => m.text).map((m, i) => (
                    <div key={m.key} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: '52px', padding: '4px 0', borderRadius: '6px', background: m.color + '15', border: `1.5px solid ${m.color}40`, textAlign: 'center' }}>
                          <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: m.color }}>{m.label}</p>
                        </div>
                        {i < milestones.length - 1 && <div style={{ width: '2px', height: '14px', background: '#EAEAEA', margin: '3px 0' }} />}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#333', lineHeight: '1.5', flex: 1 }}>{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Budget + CAC/LTV side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

            {/* Budget breakdown */}
            {k.budget_breakdown && (() => {
              const bb = k.budget_breakdown
              const rows = [
                { label: 'Google Ads', value: bb.google_ads, color: '#4285F4' },
                { label: 'Meta Ads',   value: bb.meta_ads,   color: '#1877F2' },
                { label: 'Remarketing',value: bb.remarketing, color: '#8B5CF6' },
              ]
              return (
                <div style={{ ...card, padding: '20px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '600', color: '#555' }}>Budget Breakdown</p>
                  <p style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: '700', color: '#171717' }}>{bb.recommended_total}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {rows.map(r => r.value ? (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', color: '#555' }}>{r.label}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#171717' }}>{r.value}</span>
                      </div>
                    ) : null)}
                  </div>
                  {bb.daily_budget && (
                    <div style={{ background: '#F9F9F9', border: '1px solid #EAEAEA', borderRadius: '6px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>DAILY BUDGET</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: GOLD }}>{bb.daily_budget}</span>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* CAC vs LTV */}
            {k.cac_ltv && (() => {
              const cl = k.cac_ltv
              return (
                <div style={{ ...card, padding: '20px' }}>
                  <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '600', color: '#555' }}>CAC vs LTV</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    {[
                      { label: 'Est. CAC', value: cl.estimated_cac, color: '#DC2626', bg: '#FEF2F2' },
                      { label: 'Est. LTV', value: cl.estimated_ltv, color: '#16A34A', bg: '#F0FDF4' },
                    ].map(x => (
                      <div key={x.label} style={{ background: x.bg, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: x.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{x.label}</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: x.color }}>{x.value}</p>
                      </div>
                    ))}
                  </div>
                  {cl.ltv_cac_ratio && (
                    <div style={{ background: '#FFFDF5', border: '1px solid #E8DFA8', borderRadius: '7px', padding: '10px 14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#8B6914', fontWeight: '600' }}>LTV:CAC Ratio</span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: GOLD }}>{cl.ltv_cac_ratio}</span>
                    </div>
                  )}
                  {cl.payback_period && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 2px' }}>
                      <span style={{ fontSize: '12px', color: '#888' }}>Payback period</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>{cl.payback_period}</span>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>

          {/* Secondary KPIs */}
          {(k.secondary_kpis || []).length > 0 && (
            <div style={{ ...card, padding: isMobile ? '18px 14px' : '22px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Zap size={14} color={GOLD} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#555' }}>Secondary KPIs</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {k.secondary_kpis.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 14px', background: '#FAFAFA', borderRadius: '7px', border: '1px solid #F0F0F0' }}>
                    <div style={{ minWidth: '140px', flexShrink: 0 }}>
                      <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: '700', color: '#171717' }}>{s.metric}</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: GOLD }}>{s.target}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#666', lineHeight: '1.5', borderLeft: '2px solid #EAEAEA', paddingLeft: '12px' }}>{s.why}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confidence */}
          {k.confidence_reason && (
            <div style={{ background: '#F9F9F9', border: '1px solid #EAEAEA', borderRadius: '7px', padding: '11px 15px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                <strong style={{ color: '#555' }}>Confidence {k.confidence}/100:</strong> {k.confidence_reason}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
