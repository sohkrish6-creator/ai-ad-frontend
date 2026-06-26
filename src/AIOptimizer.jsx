import { useState, useEffect } from 'react'
import { Zap, Copy, Check, TrendingUp, TrendingDown, Minus, ArrowRight, PauseCircle, PlayCircle, Users, Palette, DollarSign, Search, FlaskConical } from 'lucide-react'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const GOLD    = '#D4AF37'
const LS_KEY  = 'adsoh_optimizer_result'

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

function UrgencyBadge({ urgency }) {
  const map = {
    immediate:   { bg: '#FEF2F2', color: '#BE123C', border: '#FECDD3' },
    'this week': { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
    monitor:     { bg: '#F5F5F5', color: '#666',    border: '#E5E5E5' },
  }
  const k = (urgency || '').toLowerCase()
  const s = map[k] || map.monitor
  return <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{urgency || '—'}</span>
}

function ActionBadge({ action }) {
  const map = {
    add:    { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
    remove: { bg: '#FEF2F2', color: '#BE123C', border: '#FECDD3' },
    modify: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  }
  const k = (action || '').toLowerCase()
  const s = map[k] || map.modify
  return <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{action || '—'}</span>
}

function FormatBadge({ format }) {
  const colors = { image: '#6366F1', video: '#DC2626', carousel: '#D97706' }
  const c = colors[(format || '').toLowerCase()] || '#888'
  return <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: c + '15', color: c, border: `1px solid ${c}30`, textTransform: 'capitalize' }}>{format || 'ad'}</span>
}

function SectionHeader({ icon: Icon, label, color = '#555' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
      <Icon size={14} color={color} />
      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color }}>{label}</p>
    </div>
  )
}

function buildCopyText(r) {
  if (!r) return ''
  const o  = r.optimizer || {}
  const twa = o.this_week_actions || []
  const pr  = o.pause_recommendations    || []
  const sr  = o.scale_recommendations   || []
  const ar  = o.audience_recommendations || []
  const cr  = o.creative_recommendations || []
  const br  = o.budget_recommendations  || {}
  const kr  = o.keyword_recommendations || []
  const nt  = o.next_test               || {}

  return [
    '══════════════════════════════════',
    '  AI OPTIMIZER — Adsoh Growth OS',
    '══════════════════════════════════',
    '',
    'VERDICT: ' + (o.overall_verdict || '') + '  |  ' + (o.health_change || '') + '  |  Confidence: ' + (o.confidence || '') + '%',
    '',
    'THIS WEEK ACTIONS:',
    ...twa.map(a => '  ' + a.priority + '. ' + a.action + ' → ' + a.expected_impact + ' (' + a.time_to_implement + ')'),
    '',
    'PAUSE:',
    ...pr.map(p => '  • ' + p.what + ' — ' + p.why + ' | Save: ' + p.expected_saving + ' | ' + p.urgency),
    '',
    'SCALE:',
    ...sr.map(s => '  • ' + s.what + ' (' + s.how_much + ') — ' + s.why + ' | Impact: ' + s.expected_impact),
    '',
    'AUDIENCE:',
    ...ar.map(a => '  • ' + a.current + ' → ' + a.recommended_change + ' | ' + a.expected_improvement),
    '',
    'CREATIVE:',
    ...cr.map(c => '  • [' + c.format + '] ' + c.issue + ' → ' + c.recommendation + '\n    Hook: "' + c.hook_suggestion + '"'),
    '',
    'BUDGET: ' + (br.current_total || '') + ' → ' + (br.recommended_total || ''),
    ...(br.reallocation || []).map(b => '  • ' + b.platform + ': ' + b.current + ' → ' + b.recommended + ' — ' + b.reason),
    '',
    'KEYWORDS:',
    ...kr.map(k => '  • [' + k.action + '] ' + k.keyword + ' — ' + k.reason),
    '',
    'NEXT TEST: ' + (nt.what_to_test || ''),
    '  Hypothesis: ' + (nt.hypothesis || ''),
    '  Measure: ' + (nt.how_to_measure || ''),
    '  Duration: ' + (nt.duration || ''),
  ].join('\n')
}

export default function AIOptimizer() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [url, setUrl]                     = useState('')
  const [industry, setIndustry]           = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [city, setCity]                   = useState('Jaipur')
  const [loading, setLoading]             = useState(false)
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
    maxWidth: '960px', width: '100%', boxSizing: 'border-box',
    fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
  }

  async function handleOptimise() {
    setError(''); setLoading(true); setResult(null)
    try {
      const res  = await fetch(`${BACKEND}/ai-optimizer`, {
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
        setError(data.message || data.error || 'Optimization failed.')
      }
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  const o   = result?.optimizer        || {}
  const twa = o.this_week_actions      || []
  const pr  = o.pause_recommendations  || []
  const sr  = o.scale_recommendations  || []
  const ar  = o.audience_recommendations || []
  const cr  = o.creative_recommendations || []
  const br  = o.budget_recommendations  || {}
  const kr  = o.keyword_recommendations || []
  const nt  = o.next_test              || {}

  const verdictStyle = (() => {
    const v = (o.overall_verdict || '').toLowerCase()
    if (v.includes('urgent')) return { bg: '#FEF2F2', border: '#FECDD3', color: '#BE123C' }
    if (v.includes('well'))   return { bg: '#F0FDF4', border: '#BBF7D0', color: '#16A34A' }
    return { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706' }
  })()

  return (
    <div style={page}>
      <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Zap size={20} color={GOLD} />
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.4px' }}>AI Optimizer</h1>
      </div>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 28px' }}>Compare expected KPIs vs actual performance and get specific, data-backed optimization recommendations.</p>

      {/* Form */}
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '16px' }}>
          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: '#BE123C', fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Business URL <span style={{ color: '#BBB', fontWeight: '400', textTransform: 'none' }}>(optional — for memory)</span></label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g. sohscape.com" style={inp} />
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#999' }}>Same URL + Industry as Marketing Brain, KPI Engine, and Performance Intelligence</p>
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
              <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Jaipur" style={inp} />
            </div>
          </div>

          {industry === 'Other' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Specify Industry</label>
              <input type="text" value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="e.g. Interior Designers" style={inp} />
            </div>
          )}

          <button onClick={handleOptimise} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
            background: loading ? '#E5E5E5' : GOLD, border: 'none', color: loading ? '#999' : '#fff',
            padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            <Zap size={15} />
            {loading ? 'Optimising Campaigns...' : 'Optimise Campaigns'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ maxWidth: '640px', width: '100%' }}>
          {['Loading KPI targets from memory...', 'Loading performance data from memory...', 'Comparing expected vs actual...', 'Generating optimization plan...'].map((label, i) => (
            <div key={i} style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FFFBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 5px', fontSize: '13px', fontWeight: '500', color: '#171717' }}>{label}</p>
                <Shimmer h="8px" w="50%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cache banner */}
      {fromCache && result && !loading && (
        <div style={{ maxWidth: '960px', width: '100%', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '7px', padding: '9px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Showing previous result · Optimise again to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY); setResult(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#888', textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ maxWidth: '960px', width: '100%' }}>

          {/* Report header */}
          <div style={{ ...card, padding: '14px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#171717' }}>AI Optimizer Report</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#999' }}>
                {result.has_kpi ? '✓ KPI data' : '⚠ No KPI data'}
                {' · '}
                {result.has_perf ? '✓ Performance data' : '⚠ No Performance data'}
                {result.memory_used ? ' · memory used' : ''}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {o.confidence !== undefined && (
                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: o.confidence >= 70 ? '#F0FDF4' : '#FFFBEB', color: o.confidence >= 70 ? '#16A34A' : '#D97706', border: `1px solid ${o.confidence >= 70 ? '#BBF7D0' : '#FDE68A'}` }}>{o.confidence}% confidence</span>
              )}
              <CopyBtn text={buildCopyText(result)} />
            </div>
          </div>

          {/* Overall Verdict */}
          {o.overall_verdict && (
            <div style={{ background: verdictStyle.bg, border: `1.5px solid ${verdictStyle.border}`, borderRadius: '8px', padding: '16px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: '11px', fontWeight: '700', color: verdictStyle.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Overall Verdict</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: verdictStyle.color, textTransform: 'capitalize' }}>{o.overall_verdict}</p>
              </div>
              {o.health_change && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: '#fff', border: '1px solid #EAEAEA' }}>
                  {o.health_change === 'improving' ? <TrendingUp size={13} color="#16A34A" /> : o.health_change === 'declining' ? <TrendingDown size={13} color="#DC2626" /> : <Minus size={13} color="#D97706" />}
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#555', textTransform: 'capitalize' }}>{o.health_change}</span>
                </div>
              )}
            </div>
          )}

          {/* This Week Actions */}
          {twa.length > 0 && (
            <div style={{ ...card, padding: isMobile ? '18px 14px' : '22px', marginBottom: '12px' }}>
              <SectionHeader icon={Zap} label="This Week Actions" color={GOLD} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {twa.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: i === 0 ? '#FFFDF5' : '#FAFAFA', borderRadius: '7px', border: i === 0 ? `1.5px solid ${GOLD}40` : '1px solid #F0F0F0' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: i === 0 ? GOLD : '#E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: i === 0 ? '#fff' : '#666' }}>{a.priority}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px', fontSize: '13.5px', fontWeight: i === 0 ? '600' : '500', color: '#171717', lineHeight: '1.4' }}>{a.action}</p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '500' }}>→ {a.expected_impact}</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>{a.time_to_implement}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pause + Scale side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

            {/* Pause */}
            {pr.length > 0 && (
              <div style={{ ...card, padding: '18px' }}>
                <SectionHeader icon={PauseCircle} label="Pause Recommendations" color="#DC2626" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pr.map((p, i) => (
                    <div key={i} style={{ borderLeft: '3px solid #DC2626', paddingLeft: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#171717' }}>{p.what}</p>
                        <UrgencyBadge urgency={p.urgency} />
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#555', lineHeight: '1.45' }}>{p.why}</p>
                      {p.expected_saving && <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#16A34A' }}>Save: {p.expected_saving}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scale */}
            {sr.length > 0 && (
              <div style={{ ...card, padding: '18px' }}>
                <SectionHeader icon={PlayCircle} label="Scale Recommendations" color="#16A34A" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sr.map((s, i) => (
                    <div key={i} style={{ borderLeft: '3px solid #16A34A', paddingLeft: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#171717' }}>{s.what}</p>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#16A34A', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '2px 7px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{s.how_much}</span>
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#555', lineHeight: '1.45' }}>{s.why}</p>
                      {s.expected_impact && <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#6366F1' }}>Impact: {s.expected_impact}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Audience Recommendations */}
          {ar.length > 0 && (
            <div style={{ ...card, padding: isMobile ? '18px 14px' : '22px', marginBottom: '12px' }}>
              <SectionHeader icon={Users} label="Audience Recommendations" color="#6366F1" />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '10px' }}>
                {ar.map((a, i) => (
                  <div key={i} style={{ background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '7px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', background: '#EEF2FF', color: '#6366F1', border: '1px solid #C7D2FE', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', flexShrink: 0 }}>Current</span>
                      <p style={{ margin: 0, fontSize: '12px', color: '#555', lineHeight: '1.4' }}>{a.current}</p>
                    </div>
                    {a.problem && <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#DC2626', lineHeight: '1.4' }}>Problem: {a.problem}</p>}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <ArrowRight size={12} color={GOLD} style={{ flexShrink: 0, marginTop: '3px' }} />
                      <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '500', color: '#171717', lineHeight: '1.4' }}>{a.recommended_change}</p>
                    </div>
                    {a.expected_improvement && <p style={{ margin: 0, fontSize: '11px', color: '#16A34A', fontWeight: '600' }}>{a.expected_improvement}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creative Recommendations */}
          {cr.length > 0 && (
            <div style={{ ...card, padding: isMobile ? '18px 14px' : '22px', marginBottom: '12px' }}>
              <SectionHeader icon={Palette} label="Creative Recommendations" color="#D97706" />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '10px' }}>
                {cr.map((c, i) => (
                  <div key={i} style={{ background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '7px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '8px' }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#DC2626', lineHeight: '1.4', flex: 1 }}>Issue: {c.issue}</p>
                      <FormatBadge format={c.format} />
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '12.5px', color: '#333', lineHeight: '1.45' }}>{c.recommendation}</p>
                    {c.hook_suggestion && (
                      <div style={{ background: GOLD + '10', border: `1px solid ${GOLD}30`, borderRadius: '5px', padding: '7px 10px' }}>
                        <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hook</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#333', fontStyle: 'italic', lineHeight: '1.4' }}>"{c.hook_suggestion}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Reallocation */}
          {(br.reallocation || []).length > 0 && (
            <div style={{ ...card, padding: isMobile ? '18px 14px' : '22px', marginBottom: '12px' }}>
              <SectionHeader icon={DollarSign} label="Budget Reallocation" color="#16A34A" />
              <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {[{ label: 'Current', value: br.current_total, color: '#888' }, { label: 'Recommended', value: br.recommended_total, color: '#16A34A' }].map(x => (
                  <div key={x.label} style={{ background: '#FAFAFA', border: '1px solid #EAEAEA', borderRadius: '7px', padding: '10px 16px' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: '700', color: '#999', textTransform: 'uppercase' }}>{x.label}</p>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: x.color }}>{x.value || '—'}</p>
                  </div>
                ))}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Platform', 'Current', 'Recommended', 'Reason'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: '10px', fontWeight: '700', color: '#999', textTransform: 'uppercase', borderBottom: '1px solid #F0F0F0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {br.reallocation.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F7F7F7' }}>
                      <td style={{ padding: '9px 10px', fontSize: '13px', fontWeight: '600', color: '#171717' }}>{row.platform}</td>
                      <td style={{ padding: '9px 10px', fontSize: '13px', color: '#888' }}>{row.current}</td>
                      <td style={{ padding: '9px 10px', fontSize: '13px', fontWeight: '600', color: '#16A34A' }}>{row.recommended}</td>
                      <td style={{ padding: '9px 10px', fontSize: '12px', color: '#555', lineHeight: '1.4' }}>{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Keyword Recommendations */}
          {kr.length > 0 && (
            <div style={{ ...card, padding: isMobile ? '18px 14px' : '22px', marginBottom: '12px' }}>
              <SectionHeader icon={Search} label="Keyword Recommendations" color="#555" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {kr.map((k, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '9px 12px', background: '#FAFAFA', borderRadius: '6px', border: '1px solid #F0F0F0' }}>
                    <ActionBadge action={k.action} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#171717' }}>{k.keyword}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{k.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Test */}
          {nt.what_to_test && (
            <div style={{ ...card, padding: isMobile ? '18px 14px' : '22px', marginBottom: '12px', border: `1.5px solid ${GOLD}40`, background: '#FFFDF5' }}>
              <SectionHeader icon={FlaskConical} label="Next Test to Run" color={GOLD} />
              <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '600', color: '#171717' }}>{nt.what_to_test}</p>
              {[
                { label: 'Hypothesis', value: nt.hypothesis },
                { label: 'How to Measure', value: nt.how_to_measure },
                { label: 'Duration', value: nt.duration },
              ].map(row => row.value ? (
                <div key={row.label} style={{ display: 'flex', gap: '10px', marginBottom: '6px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD, minWidth: '110px', flexShrink: 0, paddingTop: '1px' }}>{row.label}</span>
                  <p style={{ margin: 0, fontSize: '13px', color: '#333', lineHeight: '1.5' }}>{row.value}</p>
                </div>
              ) : null)}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
