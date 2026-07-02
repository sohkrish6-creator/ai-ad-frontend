import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, CheckCircle, AlertCircle, ChevronDown, ChevronUp, ArrowRight, Clock } from 'lucide-react'

const LS_KEY_SMART = 'adsoh_smart_analysis_result'
const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const GOLD = '#D4AF37'

const card = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
const inputSt = { width: '100%', padding: '10px 13px', borderRadius: '7px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
const lbl = { display: 'block', color: '#999', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }

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

// snake_case module key (as returned by the Decision Layer) -> display label + route + result-shape info
const MODULE_META = {
  opportunity_engine:      { label: 'Opportunity Engine',      resultKey: 'opportunity', dataKey: 'opportunity', route: '/opportunity' },
  offer_intelligence:      { label: 'Offer Intelligence',      resultKey: 'offer',       dataKey: 'offer',       route: '/offer' },
  website_intelligence:    { label: 'Website Intelligence',    resultKey: 'website',     dataKey: 'audit',       route: '/website-audit' },
  visibility_intelligence: { label: 'Visibility Intelligence', resultKey: 'visibility',  dataKey: 'visibility',  route: '/visibility' },
  outreach_ai:             { label: 'Outreach AI',             resultKey: 'outreach',    dataKey: 'outreach',    route: '/outreach' },
  kpi_engine:              { label: 'KPI Engine',              resultKey: 'kpi',         dataKey: 'kpi',         route: '/kpi-engine' },
  prospect_discovery:      { label: 'Prospect Discovery',      resultKey: 'prospects',   dataKey: 'data',        route: '/prospects' },
}

const LOADING_STAGES = [
  'Running Marketing Brain...',
  'Deciding which modules to run...',
  'Running relevant modules in parallel...',
]

// Walk an arbitrary nested result object and collect a few readable string
// leaves as "top insights" — deliberately schema-agnostic since each
// module's internal JSON shape can evolve independently of this page.
function extractInsights(node, maxItems = 3, acc = []) {
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [url, setUrl] = useState('')
  const [industry, setIndustry] = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [city, setCity] = useState('Jaipur')
  const [budget, setBudget] = useState('')

  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [fromCache, setFromCache] = useState(false)
  const [showSkipped, setShowSkipped] = useState(false)
  const stageTimers = useRef([])

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY_SMART); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
    return () => stageTimers.current.forEach(clearTimeout)
  }, [])

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
          city: city.trim() || 'Jaipur',
          budget: budget ? parseFloat(budget) : 0,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)
        localStorage.setItem(LS_KEY_SMART, JSON.stringify(data))
        setFromCache(false)
      } else {
        setError(data.error || 'Smart Analysis failed. Dobara try karo.')
      }
    } catch (e) {
      setError(`Backend se connect nahi ho paya: ${e.message}`)
    }
    stageTimers.current.forEach(clearTimeout)
    setLoading(false)
  }

  function clearResult() {
    localStorage.removeItem(LS_KEY_SMART)
    setResult(null); setFromCache(false)
  }

  const page = { minHeight: '100vh', background: '#FAFAFA', padding: isMobile ? '28px 16px' : '40px 36px', maxWidth: '900px', width: '100%', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif' }

  return (
    <div style={page}>
      <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Sparkles size={20} color={GOLD} />
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.4px' }}>Smart Full Analysis</h1>
      </div>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 28px' }}>
        Marketing Brain runs first, then AI decides which other modules are actually worth running — and runs only those, in parallel.
      </p>

      {!result && !loading && (
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '28px', maxWidth: '600px' }}>
          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '18px', color: '#BE123C', fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Website URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://aapkibusiness.com" style={inputSt} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '4px' }}>
            <div>
              <label style={lbl}>Industry <span style={{ fontWeight: '400', textTransform: 'none', color: '#CCC' }}>(optional)</span></label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inputSt, color: industry ? '#171717' : '#999' }}>
                <option value="">— Select (optional) —</option>
                {INDUSTRIES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>City</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Jaipur" style={inputSt} />
            </div>
          </div>
          <p style={{ fontSize: '11px', color: '#BBB', margin: '0 0 20px', lineHeight: '1.5' }}>
            Leave blank for B2C/D2C businesses selling directly to consumers, fill in for B2B businesses targeting other businesses.
          </p>

          {industry === 'Other' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Specify Industry</label>
              <input type="text" value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="e.g. Interior Designers" style={inputSt} />
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={lbl}>Monthly Budget (₹) <span style={{ fontWeight: '400', textTransform: 'none', color: '#CCC' }}>(optional)</span></label>
            <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="10000" style={inputSt} />
          </div>

          <button onClick={handleRun} style={{ width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: GOLD, color: '#171717', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Sparkles size={15} /> Run Smart Analysis
          </button>
        </div>
      )}

      {loading && (
        <div style={{ ...card, padding: '40px', textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GOLD, animation: 'pulse 1s ease-in-out infinite alternate' }} />
            <p style={{ color: '#171717', fontSize: '15px', margin: 0, fontWeight: '600' }}>{LOADING_STAGES[loadingStage]}</p>
          </div>
          <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>This can take 1-2 minutes for the full pipeline</p>
        </div>
      )}

      {result && (
        <div>
          {fromCache && (
            <div style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '7px', padding: '9px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Showing previous result · Run again to refresh</p>
              <button onClick={clearResult} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#888', textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#171717' }}>{result.brain_result?.url || url}</h2>
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
              <p style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#999', fontSize: '12px', margin: 0 }}>
                <Clock size={12} /> Completed in {result.total_time_seconds}s
              </p>
            </div>
            <button onClick={clearResult} style={{ background: 'transparent', border: '1px solid #E5E5E5', color: '#666', padding: '7px 16px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
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
                <button onClick={() => setShowSkipped(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#999', fontSize: '12px', cursor: 'pointer', padding: 0 }}>
                  {showSkipped ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Why we skipped {result.decision.modules_skipped.length} module{result.decision.modules_skipped.length > 1 ? 's' : ''}
                </button>
                {showSkipped && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.decision.modules_skipped.map((s, i) => (
                      <div key={i} style={{ fontSize: '12px', color: '#888' }}>
                        <strong style={{ color: '#666' }}>{MODULE_META[s.module]?.label || s.module}:</strong> {s.reason}
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
              <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#888', margin: '0 0 12px' }}>Marketing Brain Summary</p>
              {getContent(result.brain_result, 'business_understanding', 'strategy') && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#171717', margin: '0 0 4px' }}>Business Understanding</p>
                  <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>{getContent(result.brain_result, 'business_understanding', 'strategy').slice(0, 400)}</p>
                </div>
              )}
              {getContent(result.brain_result, 'audience_strategy', 'audience') && (
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#171717', margin: '0 0 4px' }}>Audience Strategy</p>
                  <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>{getContent(result.brain_result, 'audience_strategy', 'audience').slice(0, 400)}</p>
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
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#171717', margin: 0 }}>{meta.label}</p>
                  {!failed && (
                    <button onClick={() => navigate(meta.route)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: GOLD, fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                      View Full Report <ArrowRight size={11} />
                    </button>
                  )}
                </div>
                {failed ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={13} color="#BE123C" />
                    <p style={{ fontSize: '12px', color: '#BE123C', margin: 0 }}>{moduleResult.error || 'This module failed to run.'}</p>
                  </div>
                ) : insights.length > 0 ? (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {insights.map((ins, i) => (
                      <li key={i} style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', marginBottom: i < insights.length - 1 ? '4px' : 0, paddingLeft: '14px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: GOLD }}>•</span> {ins}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Completed — see full report for details.</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
