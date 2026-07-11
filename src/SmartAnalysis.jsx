import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, CheckCircle, AlertCircle, ChevronDown, ChevronUp, ArrowRight, Clock, History, X } from 'lucide-react'
import { useToast } from './ToastContext'
import PushToAdsSection from './PushToAdsSection'
import CityInput, { getLastCity } from './CityInput'
import { TrustBadge, ValidationWarningBanner } from './TrustLayer'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'


const LS_KEY_SMART = 'adsoh_smart_analysis_result'
const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'


const INDUSTRIES = [
  'Hospitality (Hotels, Restaurants, Cafes)', 'Schools & Education', 'Healthcare & Clinics',
  'Real Estate', 'Retail & Fashion', 'Food & Beverage', 'Wellness & Fitness', 'Wedding & Events',
  'Auto & Transport', 'Professional Services', 'Coaching & Tutoring', 'Jewellery & Accessories',
  'Interior Design & Architecture', 'Photography & Videography', 'Legal & CA Services',
  'IT & Software Companies', 'Travel & Tourism', 'Salon & Beauty', 'Gym & Sports Academy',
  'NGO & Social Enterprise', 'Agriculture & Dairy', 'Logistics & Transport', 'Printing & Packaging',
  'Construction & Builders', 'Media & Entertainment', 'Other',
]

const BUSINESS_MODEL_COLORS = {
  B2B: { bg: '#EFF6FF', fg: '#1D4ED8', border: '#BFDBFE' },
  B2C: { bg: '#FDF4FF', fg: '#A21CAF', border: '#F5D0FE' },
  D2C: { bg: '#F0FDFA', fg: '#0F766E', border: '#99F6E4' },
}

// snake_case module key (as returned by the Decision Layer) -> display label + route + result-shape info +
// the EXACT localStorage key that module's own page already reads on mount (see main.py's
// _RESULT_LS_KEY_BY_MODULE — kept in sync manually since frontend/backend are separate deploys).
const MODULE_META = {
  opportunity_engine:      { label: 'Opportunity Engine',      resultKey: 'opportunity', dataKey: 'opportunity', route: '/opportunity',   lsKey: 'adsoh_opportunity_result' },
  offer_intelligence:      { label: 'Offer Intelligence',      resultKey: 'offer',       dataKey: 'offer',       route: '/offer',         lsKey: 'adsoh_offer_result' },
  website_intelligence:    { label: 'Website Intelligence',    resultKey: 'website',     dataKey: 'audit',       route: '/website-audit', lsKey: 'adsoh_website_result' },
  visibility_intelligence: { label: 'Visibility Intelligence', resultKey: 'visibility',  dataKey: 'visibility',  route: '/visibility',    lsKey: 'adsoh_visibility_result' },
  outreach_ai:             { label: 'Outreach AI',             resultKey: 'outreach',    dataKey: 'outreach',    route: '/outreach',      lsKey: 'adsoh_outreach_result' },
  kpi_engine:              { label: 'KPI Engine',              resultKey: 'kpi',         dataKey: 'kpi',         route: '/kpi-engine',    lsKey: 'adsoh_kpi_result' },
  prospect_discovery:      { label: 'Prospect Discovery',      resultKey: 'prospects',   dataKey: 'data',        route: '/prospects',     lsKey: 'adsoh_prospect_result' },
}
const ALL_MODULE_KEYS = Object.keys(MODULE_META)

const LOADING_STAGES = [
  'Running Marketing Brain...',
  'Deciding which modules to run...',
  'Running relevant modules in parallel...',
]

// Walk an arbitrary nested result object and collect a few readable string
// leaves as "top insights" — deliberately schema-agnostic since each
// module's internal JSON shape can evolve independently of this page.
export function extractInsights(node, maxItems = 3, acc = []) {
  if (acc.length >= maxItems) return acc
  if (typeof node === 'string') {
    const t = node.trim()
    if (t.length > 15 && t.length < 220 && !acc.includes(t)) acc.push(t)
  } else if (Array.isArray(node)) {
    for (const item of node) { if (acc.length >= maxItems) break; extractInsights(item, maxItems, acc) }
  } else if (node && typeof node === 'object') {
    for (const v of Object.values(node)) { if (acc.length >= maxItems) break; extractInsights(v, maxItems, acc) }
  }
  return acc
}

function getContent(result, key, fallback) {
  return result?.sections?.[key] || (fallback ? result?.[fallback] : null) || null
}

export default function SmartAnalysis() {
  const navigate = useNavigate()
  const toast = useToast()
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [url, setUrl] = useState('')
  const [industry, setIndustry] = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [city, setCity] = useState(getLastCity)
  const [budget, setBudget] = useState('')

  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [fromCache, setFromCache] = useState(false)
  const [showSkipped, setShowSkipped] = useState(false)
  const stageTimers = useRef([])

  // Plan/override screen — lets the user toggle which modules run before
  // spending time on them, instead of always trusting the Decision Layer.
  const [planning, setPlanning] = useState(false)
  const [plan, setPlan] = useState(null)
  const [selectedModules, setSelectedModules] = useState([])
  const [executing, setExecuting] = useState(false)

  // Recent Analyses (last 5, from smart_analysis_history)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY_SMART); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
    loadHistory()
    return () => stageTimers.current.forEach(clearTimeout)
  }, [])

  async function loadHistory() {
    setHistoryLoading(true)
    try {
      const res = await fetch(`${BACKEND}/smart-analysis/history?limit=5`)
      const data = await res.json()
      if (data.success) setHistory(data.history || [])
    } catch { /* silent — history is a nice-to-have, not core */ }
    setHistoryLoading(false)
  }

  async function handleViewHistory(id) {
    try {
      const res = await fetch(`${BACKEND}/smart-analysis/history/${id}`)
      const data = await res.json()
      if (data.success) {
        setResult(data.result)
        localStorage.setItem(LS_KEY_SMART, JSON.stringify(data.result))
        setFromCache(true)
        toast.success('Loaded from history')
      } else {
        toast.error(data.error || 'Could not load that analysis.')
      }
    } catch (e) {
      toast.error(`Network error: ${e.message}`)
    }
  }

  const resolvedIndustry = industry === 'Other' ? industryOther : industry

  async function handleRun() {
    if (!url.trim()) { alert('Website URL bharo!'); return }
    setLoading(true); setError(null); setResult(null); setFromCache(false); setLoadingStage(0)
    stageTimers.current.forEach(clearTimeout)
    stageTimers.current = [
      setTimeout(() => setLoadingStage(1), 12000),
      setTimeout(() => setLoadingStage(2), 18000),
    ]
    try {
      const res = await fetch(`${BACKEND}/smart-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          industry: resolvedIndustry,
          city: city.trim(),
          budget: budget ? parseFloat(budget) : 0,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)
        localStorage.setItem(LS_KEY_SMART, JSON.stringify(data))
        setFromCache(false)
        toast.success('Done!')
        loadHistory()
      } else {
        const msg = data.error || 'Smart Analysis failed. Dobara try karo.'
        setError(msg); toast.error(msg)
      }
    } catch (e) {
      setError(`Backend se connect nahi ho paya: ${e.message}`)
      toast.error(`Backend se connect nahi ho paya: ${e.message}`)
    }
    stageTimers.current.forEach(clearTimeout)
    setLoading(false)
  }

  async function handleReviewModules() {
    if (!url.trim()) { alert('Website URL bharo!'); return }
    setPlanning(true); setError(null); setResult(null); setPlan(null)
    try {
      const res = await fetch(`${BACKEND}/smart-analysis/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          industry: resolvedIndustry,
          city: city.trim(),
          budget: budget ? parseFloat(budget) : 0,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setPlan(data)
        setSelectedModules(data.decision.modules_run)
      } else {
        const msg = data.error || 'Could not plan the analysis. Dobara try karo.'
        setError(msg); toast.error(msg)
      }
    } catch (e) {
      setError(`Backend se connect nahi ho paya: ${e.message}`)
      toast.error(`Backend se connect nahi ho paya: ${e.message}`)
    }
    setPlanning(false)
  }

  function toggleModule(key) {
    setSelectedModules(sel => sel.includes(key) ? sel.filter(m => m !== key) : [...sel, key])
  }

  async function handleRunWithOverride() {
    if (!plan) return
    setExecuting(true); setError(null)
    try {
      const res = await fetch(`${BACKEND}/smart-analysis/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          industry: resolvedIndustry,
          city: city.trim(),
          budget: budget ? parseFloat(budget) : 0,
          business_key: plan.business_key,
          brain_result: plan.brain_result,
          modules_to_run: selectedModules,
          modules_skipped: ALL_MODULE_KEYS.filter(m => !selectedModules.includes(m)).map(m => ({
            module: m,
            reason: plan.decision.modules_skipped.find(s => s.module === m)?.reason || 'Excluded by user',
          })),
          business_model: plan.decision.business_model,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)
        localStorage.setItem(LS_KEY_SMART, JSON.stringify(data))
        setFromCache(false)
        setPlan(null)
        toast.success('Done!')
        loadHistory()
      } else {
        const msg = data.error || 'Execution failed. Dobara try karo.'
        setError(msg); toast.error(msg)
      }
    } catch (e) {
      setError(`Backend se connect nahi ho paya: ${e.message}`)
      toast.error(`Backend se connect nahi ho paya: ${e.message}`)
    }
    setExecuting(false)
  }

  function clearResult() {
    localStorage.removeItem(LS_KEY_SMART)
    setResult(null); setFromCache(false)
  }

  return (
    <PageShell maxWidth="900px">
      <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>
      <PageHeader title="Smart Full Analysis" sub="Marketing Brain runs first, then AI decides which other modules are actually worth running — and runs only those, in parallel." />

      {!result && !loading && !planning && !plan && history.length > 0 && (
        <div style={{ ...card, padding: '16px 20px', marginBottom: '20px', maxWidth: '600px' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED, margin: '0 0 12px' }}>
            <History size={12} /> Recent Analyses
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {history.map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: BONE, fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.url}</span>
                    {h.business_model && (
                      <span style={{
                        fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', flexShrink: 0,
                        background: BUSINESS_MODEL_COLORS[h.business_model]?.bg || '#F5F5F5',
                        color: BUSINESS_MODEL_COLORS[h.business_model]?.fg || '#666',
                      }}>
                        {h.business_model}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: MUTED }}>{new Date(h.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button onClick={() => handleViewHistory(h.id)} style={{ background: 'none', border: 'none', color: GOLD, fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, marginLeft: '10px' }}>View</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !loading && !planning && !plan && (
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '28px', maxWidth: '600px' }}>
          {error && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '18px', color: RED, fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Website URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://aapkibusiness.com" style={inputSt} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '4px' }}>
            <div>
              <label style={lbl}>Industry <span style={{ fontWeight: '400', textTransform: 'none', color: MUTED }}>(optional)</span></label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inputSt, color: industry ? '#171717' : '#999' }}>
                <option value="">— Select (optional) —</option>
                {INDUSTRIES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>City</label>
              <CityInput value={city} onChange={setCity} style={inputSt} />
            </div>
          </div>
          <p style={{ fontSize: '11px', color: MUTED, margin: '0 0 20px', lineHeight: '1.5' }}>
            Leave blank for B2C/D2C businesses selling directly to consumers, fill in for B2B businesses targeting other businesses.
          </p>

          {industry === 'Other' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Specify Industry</label>
              <input type="text" value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="e.g. Interior Designers" style={inputSt} />
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={lbl}>Monthly Budget (₹) <span style={{ fontWeight: '400', textTransform: 'none', color: MUTED }}>(optional)</span></label>
            <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="10000" style={inputSt} />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={handleRun} style={{ flex: 1, minWidth: '160px', padding: '13px', borderRadius: '8px', border: 'none', background: GOLD, color: BONE, fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={15} /> Run Automatically
            </button>
            <button onClick={handleReviewModules} style={{ flex: 1, minWidth: '160px', padding: '13px', borderRadius: '8px', border: '1.5px solid #E5E5E5', background: SLATE, color: MUTED, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              Review Modules First
            </button>
          </div>
        </div>
      )}

      {planning && (
        <div style={{ ...card, padding: '40px', textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GOLD, animation: 'pulse 1s ease-in-out infinite alternate' }} />
            <p style={{ color: GOLD, fontSize: '15px', margin: 0, fontWeight: '600' }}>Running Marketing Brain...</p>
          </div>
          <p style={{ color: MUTED, fontSize: '12px', margin: 0 }}>Deciding which modules are worth running next</p>
        </div>
      )}

      {plan && (
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '28px', maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: BONE }}>AI recommends running:</p>
            <span style={{
              fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
              background: BUSINESS_MODEL_COLORS[plan.decision.business_model]?.bg || '#F5F5F5',
              color: BUSINESS_MODEL_COLORS[plan.decision.business_model]?.fg || '#666',
            }}>
              {plan.decision.business_model}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: MUTED, margin: '0 0 16px' }}>Click a chip to toggle it on/off, then run with your chosen modules.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {ALL_MODULE_KEYS.map(m => {
              const active = selectedModules.includes(m)
              return (
                <button
                  key={m}
                  onClick={() => toggleModule(m)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                    background: active ? '#16A34A12' : '#F5F5F5',
                    border: `1px solid ${active ? '#16A34A40' : '#E5E5E5'}`,
                    color: active ? '#166534' : '#999',
                  }}
                >
                  {active ? <CheckCircle size={11} /> : <X size={11} />} {MODULE_META[m]?.label || m}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={handleRunWithOverride} disabled={executing || selectedModules.length === 0} style={{ flex: 1, minWidth: '160px', padding: '13px', borderRadius: '8px', border: 'none', background: executing ? '#E5E5E5' : GOLD, color: executing ? '#999' : '#171717', fontSize: '14px', fontWeight: '700', cursor: executing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={15} /> {executing ? 'Running...' : 'Run With These Settings'}
            </button>
            <button onClick={() => setPlan(null)} disabled={executing} style={{ padding: '13px 20px', borderRadius: '8px', border: '1.5px solid #E5E5E5', background: SLATE, color: MUTED, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ ...card, padding: '40px', textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GOLD, animation: 'pulse 1s ease-in-out infinite alternate' }} />
            <p style={{ color: GOLD, fontSize: '15px', margin: 0, fontWeight: '600' }}>{LOADING_STAGES[loadingStage]}</p>
          </div>
          <p style={{ color: MUTED, fontSize: '12px', margin: 0 }}>This can take 1-2 minutes for the full pipeline</p>
        </div>
      )}

      {result && (
        <div>
          {fromCache && (
            <div style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '9px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Showing previous result · Run again to refresh</p>
              <button onClick={clearResult} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: MUTED, textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
            </div>
          )}

          <ValidationWarningBanner message={result.validation_warning} />
          <TrustBadge verdict={result.trust_verdict} basedOn={result.based_on} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: BONE }}>{result.brain_result?.url || url}</h2>
                {result.business_model && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: '700', letterSpacing: '0.03em',
                    background: BUSINESS_MODEL_COLORS[result.business_model]?.bg || '#F5F5F5',
                    color: BUSINESS_MODEL_COLORS[result.business_model]?.fg || '#666',
                    border: `1px solid ${BUSINESS_MODEL_COLORS[result.business_model]?.border || '#E5E5E5'}`,
                  }}>
                    {result.business_model} Detected
                  </span>
                )}
              </div>
              <p style={{ display: 'flex', alignItems: 'center', gap: '5px', color: MUTED, fontSize: '12px', margin: 0 }}>
                <Clock size={12} /> Completed in {result.total_time_seconds}s
              </p>
            </div>
            <button onClick={clearResult} style={{ background: 'transparent', border: `1px solid ${SLATE_L}`, color: MUTED, padding: '7px 16px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
              ← New Analysis
            </button>
          </div>

          {/* AI Decided To Run */}
          <div style={{ ...card, padding: '20px 22px', marginBottom: '16px', borderColor: '#E5DABB', background: '#FFFDF5' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: GOLD, margin: '0 0 12px' }}>AI Decided To Run</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: result.decision?.modules_skipped?.length ? '12px' : 0 }}>
              {(result.decision?.modules_run || []).map(m => (
                <span key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#16A34A12', border: '1px solid #16A34A40', color: '#166534', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                  <CheckCircle size={11} /> {MODULE_META[m]?.label || m}
                </span>
              ))}
            </div>
            {result.decision?.modules_skipped?.length > 0 && (
              <div>
                <button onClick={() => setShowSkipped(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: MUTED, fontSize: '12px', cursor: 'pointer', padding: 0 }}>
                  {showSkipped ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Why we skipped {result.decision.modules_skipped.length} module{result.decision.modules_skipped.length > 1 ? 's' : ''}
                </button>
                {showSkipped && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.decision.modules_skipped.map((s, i) => (
                      <div key={i} style={{ fontSize: '12px', color: MUTED }}>
                        <strong style={{ color: MUTED }}>{MODULE_META[s.module]?.label || s.module}:</strong> {s.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Brain summary */}
          {result.brain_result && (
            <div style={{ ...card, padding: '20px 22px', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED, margin: '0 0 12px' }}>Marketing Brain Summary</p>
              {getContent(result.brain_result, 'business_understanding', 'strategy') && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: BONE, margin: '0 0 4px' }}>Business Understanding</p>
                  <p style={{ fontSize: '13px', color: MUTED, lineHeight: '1.6', margin: 0 }}>{getContent(result.brain_result, 'business_understanding', 'strategy').slice(0, 400)}</p>
                </div>
              )}
              {getContent(result.brain_result, 'audience_strategy', 'audience') && (
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: BONE, margin: '0 0 4px' }}>Audience Strategy</p>
                  <p style={{ fontSize: '13px', color: MUTED, lineHeight: '1.6', margin: 0 }}>{getContent(result.brain_result, 'audience_strategy', 'audience').slice(0, 400)}</p>
                </div>
              )}
              <button onClick={() => navigate('/brain')} style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: GOLD, fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                View Full Marketing Brain Report <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* Module cards */}
          {(result.decision?.modules_run || []).map(m => {
            const meta = MODULE_META[m]
            if (!meta) return null
            const moduleResult = result.results?.[meta.resultKey]
            if (moduleResult == null) return null
            const failed = moduleResult.success === false
            const insights = failed ? [] : extractInsights(moduleResult[meta.dataKey] ?? moduleResult)
            return (
              <div key={m} style={{ ...card, padding: '18px 20px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: failed ? '4px' : '10px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: BONE, margin: 0 }}>{meta.label}</p>
                  {!failed && (
                    <button
                      onClick={() => {
                        // Pre-load the exact same localStorage key that module's own
                        // page reads on mount, so it shows this result immediately
                        // instead of forcing a fresh (paid) regenerate.
                        try { localStorage.setItem(meta.lsKey, JSON.stringify(moduleResult)) } catch {}
                        navigate(meta.route)
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: GOLD, fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                    >
                      View Full Report <ArrowRight size={11} />
                    </button>
                  )}
                </div>
                {failed ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={13} color="#BE123C" />
                    <p style={{ fontSize: '12px', color: RED, margin: 0 }}>{moduleResult.error || 'This module failed to run.'}</p>
                  </div>
                ) : insights.length > 0 ? (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {insights.map((ins, i) => (
                      <li key={i} style={{ fontSize: '13px', color: MUTED, lineHeight: '1.6', marginBottom: i < insights.length - 1 ? '4px' : 0, paddingLeft: '14px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: GOLD }}>•</span> {ins}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '12px', color: MUTED, margin: 0 }}>Completed — see full report for details.</p>
                )}
              </div>
            )
          })}

          {/* Push to Google/Meta Ads — same modal/logic as Marketing Brain */}
          <div style={{ ...card, padding: '20px 22px', marginTop: '6px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED, margin: '0 0 12px' }}>Launch a Campaign</p>
            <PushToAdsSection
              url={result.brain_result?.url || url}
              industry={resolvedIndustry}
              city={city}
              budget={budget}
              businessKey={
                Object.values(result.results || {}).find(r => r && r.business_key)?.business_key || ''
              }
            />
          </div>
        </div>
      )}
    </PageShell>
  )
}
