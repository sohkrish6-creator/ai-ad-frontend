import { useState, useEffect } from 'react'
import CityInput, { getLastCity } from './CityInput'

const LS_KEY_VIS = 'adsoh_visibility_result'
import { Eye, Copy, Check, ChevronDown, ChevronUp, Zap, Search, Bot, MapPin, FileText } from 'lucide-react'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const GOLD    = '#D4AF37'

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

const PRIORITY_COLORS = { high: '#DC2626', medium: '#D97706', low: '#16A34A' }
const INTENT_COLORS   = { informational: '#6366F1', transactional: '#16A34A', local: '#0284C7' }

function scoreColor(s) { return s >= 75 ? '#16A34A' : s >= 50 ? '#D97706' : '#DC2626' }
function scoreBg(s)    { return s >= 75 ? '#F0FDF4' : s >= 50 ? '#FFFBEB' : '#FEF2F2' }

function Chip({ text, color = '#666', bg = '#F5F5F5', border = '#E5E5E5' }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 9px', borderRadius: '20px', fontSize: '11.5px',
      fontWeight: '500', background: bg, color, border: `1px solid ${border}`,
      marginRight: '5px', marginBottom: '5px', whiteSpace: 'nowrap',
    }}>{text}</span>
  )
}

function QuickWins({ wins }) {
  if (!wins?.length) return null
  return (
    <div style={{ marginTop: '14px', background: '#FFFDF5', border: '1px solid #E8DFA8', borderRadius: '7px', padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <Zap size={12} color={GOLD} />
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#8B6914', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Wins This Week</span>
      </div>
      {wins.map((w, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: i < wins.length - 1 ? '6px' : 0 }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '3px', border: '1.5px solid #D4AF37', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: '1.5' }}>{w}</p>
        </div>
      ))}
    </div>
  )
}

function SectionCard({ title, icon: Icon, iconColor, score, children, expanded, onToggle }) {
  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: scoreBg(score), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={15} color={scoreColor(score)} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#171717' }}>{title}</p>
            <p style={{ margin: '1px 0 0', fontSize: '12px', color: scoreColor(score), fontWeight: '600' }}>{score}/100</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={15} color="#BBB" /> : <ChevronDown size={15} color="#BBB" />}
      </button>
      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F0F0F0' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Label({ children }) {
  return <p style={{ margin: '14px 0 6px', fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</p>
}

function BulletList({ items, color = '#444' }) {
  if (!items?.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{ color: GOLD, fontSize: '12px', marginTop: '2px', flexShrink: 0 }}>›</span>
          <p style={{ margin: 0, fontSize: '13px', color, lineHeight: '1.5' }}>{item}</p>
        </div>
      ))}
    </div>
  )
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

function Shimmer({ h = '14px', w = '100%' }) {
  return <div style={{ height: h, width: w, borderRadius: '4px', background: 'linear-gradient(90deg,#F0F0F0 25%,#E8E8E8 50%,#F0F0F0 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.2s ease-in-out infinite' }} />
}

function buildCopyText(r) {
  if (!r) return ''
  const v = r.visibility
  const lines = [
    `VISIBILITY INTELLIGENCE — ${r.url}`,
    `Overall Score: ${v.overall_visibility_score}/100`,
    `Verdict: ${v.overall_verdict}`,
    '',
    'PRIORITY ACTIONS:',
    ...(v.priority_actions || []).map((a, i) => `${i + 1}. ${a}`),
    '',
    `SEO (${v.seo?.score}/100):`,
    `  Current keywords: ${(v.seo?.current_keywords || []).join(', ')}`,
    `  Missing keywords: ${(v.seo?.missing_keywords || []).join(', ')}`,
    ...(v.seo?.on_page_issues || []).map(x => `  ⚠ ${x}`),
    ...(v.seo?.quick_wins || []).map(x => `  ✓ ${x}`),
    '',
    `AEO (${v.aeo?.score}/100):`,
    `  ${v.aeo?.current_status}`,
    ...(v.aeo?.recommended_questions || []).map(x => `  Q: ${x}`),
    ...(v.aeo?.quick_wins || []).map(x => `  ✓ ${x}`),
    '',
    `GEO (${v.geo?.score}/100):`,
    `  ${v.geo?.current_status}`,
    ...(v.geo?.recommended_actions || []).map(x => `  → ${x}`),
    ...(v.geo?.quick_wins || []).map(x => `  ✓ ${x}`),
    '',
    `Content Strategy (${v.content_strategy?.score}/100):`,
    ...(v.content_strategy?.recommended_topics || []).map(x => `  • ${x}`),
    `  Calendar: ${v.content_strategy?.content_calendar_hint}`,
    '',
    `Local SEO (${v.local_seo?.score}/100):`,
    `  GBP: ${v.local_seo?.google_business_profile}`,
    ...(v.local_seo?.local_keywords || []).map(x => `  • ${x}`),
    ...(v.local_seo?.quick_wins || []).map(x => `  ✓ ${x}`),
  ]
  return lines.join('\n')
}

export default function VisibilityIntelligence() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [url, setUrl]                     = useState('')
  const [industry, setIndustry]           = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [city, setCity]                   = useState(getLastCity)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [result, setResult]               = useState(null)
  const [expanded, setExpanded]           = useState('seo')
  const [fromCache, setFromCache]         = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY_VIS); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  const resolvedIndustry = industry === 'Other' ? industryOther : industry

  const page = {
    minHeight: '100vh', background: '#FAFAFA',
    padding: isMobile ? '28px 16px' : '40px 36px',
    maxWidth: '880px', width: '100%', boxSizing: 'border-box',
    fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
  }

  async function handleAnalyse() {
    if (!url.trim()) { setError('Website URL daalo.'); return }
    setError(''); setLoading(true); setResult(null); setExpanded('seo')
    try {
      const res  = await fetch(`${BACKEND}/visibility-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), industry: resolvedIndustry, city }),
      })
      const data = await res.json()
      if (data.success) { setResult(data); localStorage.setItem(LS_KEY_VIS, JSON.stringify(data)); setFromCache(false) }
      else setError(data.error || 'Analysis failed. Dobara try karo.')
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  const toggle = key => setExpanded(e => e === key ? null : key)

  return (
    <div style={page}>
      <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Eye size={20} color={GOLD} />
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.4px' }}>Visibility Intelligence</h1>
      </div>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 28px' }}>SEO · AEO · GEO — full-spectrum visibility audit grounded in your actual site content + live keyword data.</p>

      {/* Input */}
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '16px' }}>
          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: '#BE123C', fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Website URL <span style={{ color: '#DC2626' }}>*</span></label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://sohscape.com" onKeyDown={e => e.key === 'Enter' && handleAnalyse()} style={inp} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={lbl}>Industry <span style={{ color: '#BBB', fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inp, color: industry ? '#171717' : '#999' }}>
                <option value="">— Any industry —</option>
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

          <button onClick={handleAnalyse} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
            background: loading ? '#E5E5E5' : GOLD, border: 'none', color: loading ? '#999' : '#fff',
            padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            <Eye size={15} />
            {loading ? 'Crawling + analysing visibility...' : 'Analyse Visibility'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ maxWidth: '640px', width: '100%' }}>
          {['Crawling website...', 'Fetching live keyword data...', 'Analysing SEO · AEO · GEO...'].map((label, i) => (
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

      {/* Results */}
      {fromCache && result && !loading && (
        <div style={{ maxWidth: '820px', width: '100%', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '7px', padding: '9px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Showing previous result · Generate new report to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY_VIS); setResult(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#888', textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}

      {result && (() => {
        const v     = result.visibility
        const score = v.overall_visibility_score ?? 0

        return (
          <div style={{ maxWidth: '820px', width: '100%' }}>

            {/* Overall score */}
            <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '16px', flexShrink: 0,
                background: scoreBg(score), border: `2px solid ${scoreColor(score)}40`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '28px', fontWeight: '700', color: scoreColor(score), lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: '10px', color: scoreColor(score), fontWeight: '600', marginTop: '2px' }}>/100</span>
              </div>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '700', color: '#171717', letterSpacing: '-0.3px' }}>
                  {score >= 75 ? 'Good visibility' : score >= 50 ? 'Visibility needs work' : 'Low visibility — urgent fixes needed'}
                </p>
                <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#555', lineHeight: '1.5' }}>{v.overall_verdict}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>{result.url}{result.memory_used ? ' · Memory context used' : ''}</p>
              </div>
              <CopyBtn text={buildCopyText(result)} />
            </div>

            {/* Priority Actions */}
            {(v.priority_actions || []).length > 0 && (
              <div style={{ ...card, padding: isMobile ? '20px 16px' : '24px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GOLD }} />
                  <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Priority Actions</h3>
                  <span style={{ fontSize: '12px', color: '#999' }}>ordered by visibility ROI</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {v.priority_actions.map((action, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{
                        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                        background: i === 0 ? GOLD : '#F5F5F5', color: i === 0 ? '#fff' : '#888',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: '700',
                      }}>{i + 1}</span>
                      <p style={{ margin: 0, fontSize: '13.5px', color: '#222', lineHeight: '1.5' }}>{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Score mini-bar */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {[
                { key: 'seo', label: 'SEO', score: v.seo?.score },
                { key: 'aeo', label: 'AEO', score: v.aeo?.score },
                { key: 'geo', label: 'GEO', score: v.geo?.score },
                { key: 'content', label: 'Content', score: v.content_strategy?.score },
                { key: 'local', label: 'Local SEO', score: v.local_seo?.score },
              ].map(({ key, label, score: s = 0 }) => (
                <button key={key} onClick={() => toggle(key)} style={{
                  background: expanded === key ? scoreBg(s) : '#fff',
                  border: `1px solid ${expanded === key ? scoreColor(s) + '60' : '#EAEAEA'}`,
                  borderRadius: '7px', padding: '7px 13px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: scoreColor(s) }}>{s}</span>
                  <span style={{ fontSize: '10px', color: '#888', fontWeight: '600' }}>{label}</span>
                </button>
              ))}
            </div>

            {/* Section cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

              {/* SEO */}
              <SectionCard title="SEO — Search Engine Optimisation" icon={Search} iconColor="#6366F1" score={v.seo?.score ?? 0} expanded={expanded === 'seo'} onToggle={() => toggle('seo')}>
                {v.seo && <>
                  <Label>Current Keywords</Label>
                  <div>{(v.seo.current_keywords || []).map(k => <Chip key={k} text={k} bg="#F0F0FF" color="#4F46E5" border="#C7D2FE" />)}</div>

                  <Label>Missing Keywords</Label>
                  <div>{(v.seo.missing_keywords || []).map(k => <Chip key={k} text={k} bg="#FFF1F2" color="#BE123C" border="#FECDD3" />)}</div>

                  {(v.seo.recommended_keywords || []).length > 0 && <>
                    <Label>Recommended Keywords</Label>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                        <thead>
                          <tr style={{ background: '#F9F9F9' }}>
                            {['Keyword', 'Intent', 'Priority'].map(h => (
                              <th key={h} style={{ textAlign: 'left', padding: '7px 10px', color: '#888', fontWeight: '600', borderBottom: '1px solid #EAEAEA', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {v.seo.recommended_keywords.map((kw, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #F5F5F5' }}>
                              <td style={{ padding: '7px 10px', color: '#171717', fontWeight: '500' }}>{kw.keyword}</td>
                              <td style={{ padding: '7px 10px' }}>
                                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: (INTENT_COLORS[kw.intent] || '#888') + '15', color: INTENT_COLORS[kw.intent] || '#888' }}>
                                  {kw.intent}
                                </span>
                              </td>
                              <td style={{ padding: '7px 10px' }}>
                                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: (PRIORITY_COLORS[kw.priority] || '#888') + '15', color: PRIORITY_COLORS[kw.priority] || '#888' }}>
                                  {kw.priority}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>}

                  {v.seo.on_page_issues?.length > 0 && <><Label>On-Page Issues</Label><BulletList items={v.seo.on_page_issues} color="#DC2626" /></>}
                  {v.seo.content_gaps?.length > 0   && <><Label>Content Gaps</Label><BulletList items={v.seo.content_gaps} /></>}
                  {v.seo.schema_needed?.length > 0   && (
                    <><Label>Schema Markup Needed</Label>
                    <div>{v.seo.schema_needed.map(s => <Chip key={s} text={s} bg="#F0FFF4" color="#16A34A" border="#BBF7D0" />)}</div></>
                  )}
                  <QuickWins wins={v.seo.quick_wins} />
                </>}
              </SectionCard>

              {/* AEO */}
              <SectionCard title="AEO — Answer Engine Optimisation" icon={FileText} iconColor="#8B5CF6" score={v.aeo?.score ?? 0} expanded={expanded === 'aeo'} onToggle={() => toggle('aeo')}>
                {v.aeo && <>
                  <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '7px', padding: '11px 14px', marginTop: '14px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What is AEO?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#4C1D95', lineHeight: '1.5' }}>{v.aeo.what_is_aeo}</p>
                  </div>

                  <Label>Current Status</Label>
                  <p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: '1.5' }}>{v.aeo.current_status}</p>

                  <Label>Questions to Answer on Your Site</Label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(v.aeo.recommended_questions || []).map((q, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#F9F9F9', border: '1px solid #F0F0F0', borderRadius: '6px', padding: '9px 12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#8B5CF6', flexShrink: 0, minWidth: '18px' }}>Q{i + 1}</span>
                        <p style={{ margin: 0, fontSize: '13px', color: '#333', lineHeight: '1.5' }}>{q}</p>
                      </div>
                    ))}
                  </div>

                  {v.aeo.content_format_needed?.length > 0 && (
                    <><Label>Content Formats Needed</Label>
                    <div>{v.aeo.content_format_needed.map(f => <Chip key={f} text={f} bg="#F5F3FF" color="#7C3AED" border="#DDD6FE" />)}</div></>
                  )}
                  <QuickWins wins={v.aeo.quick_wins} />
                </>}
              </SectionCard>

              {/* GEO */}
              <SectionCard title="GEO — Generative Engine Optimisation" icon={Bot} iconColor="#0284C7" score={v.geo?.score ?? 0} expanded={expanded === 'geo'} onToggle={() => toggle('geo')}>
                {v.geo && <>
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '7px', padding: '11px 14px', marginTop: '14px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What is GEO?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#1E3A8A', lineHeight: '1.5' }}>{v.geo.what_is_geo}</p>
                  </div>

                  <Label>Current Status</Label>
                  <p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: '1.5' }}>{v.geo.current_status}</p>

                  <Label>Recommended Actions</Label>
                  <BulletList items={v.geo.recommended_actions} />

                  {v.geo.content_needed?.length > 0 && (
                    <><Label>Content AI Assistants Need to Cite You</Label>
                    <div>{v.geo.content_needed.map(c => <Chip key={c} text={c} bg="#EFF6FF" color="#1D4ED8" border="#BFDBFE" />)}</div></>
                  )}
                  <QuickWins wins={v.geo.quick_wins} />
                </>}
              </SectionCard>

              {/* Content Strategy */}
              <SectionCard title="Content Strategy" icon={FileText} iconColor="#16A34A" score={v.content_strategy?.score ?? 0} expanded={expanded === 'content'} onToggle={() => toggle('content')}>
                {v.content_strategy && <>
                  <Label>8 High-Value Topic Ideas</Label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(v.content_strategy.recommended_topics || []).map((topic, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 12px', background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD, flexShrink: 0, minWidth: '18px' }}>{i + 1}</span>
                        <p style={{ margin: 0, fontSize: '13px', color: '#333', lineHeight: '1.5' }}>{topic}</p>
                      </div>
                    ))}
                  </div>

                  {v.content_strategy.content_calendar_hint && (
                    <div style={{ marginTop: '14px', background: '#FFFDF5', border: '1px solid #E8DFA8', borderRadius: '7px', padding: '12px 14px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#8B6914', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Publish Order</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: '1.5' }}>{v.content_strategy.content_calendar_hint}</p>
                    </div>
                  )}

                  {v.content_strategy.internal_linking?.length > 0 && (
                    <><Label>Internal Linking Opportunities</Label><BulletList items={v.content_strategy.internal_linking} /></>
                  )}
                </>}
              </SectionCard>

              {/* Local SEO */}
              <SectionCard title="Local SEO" icon={MapPin} iconColor="#DC2626" score={v.local_seo?.score ?? 0} expanded={expanded === 'local'} onToggle={() => toggle('local')}>
                {v.local_seo && <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '14px', padding: '6px 12px', borderRadius: '20px', background: v.local_seo.google_business_profile === 'present' ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${v.local_seo.google_business_profile === 'present' ? '#BBF7D0' : '#FECACA'}` }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: v.local_seo.google_business_profile === 'present' ? '#16A34A' : '#DC2626' }}>
                      Google Business Profile: {v.local_seo.google_business_profile}
                    </span>
                  </div>

                  <Label>Local Keywords to Target</Label>
                  <div>{(v.local_seo.local_keywords || []).map(k => <Chip key={k} text={k} bg="#FEF2F2" color="#B91C1C" border="#FECACA" />)}</div>

                  {v.local_seo.citation_opportunities?.length > 0 && (
                    <><Label>Directory / Citation Opportunities</Label>
                    <div>{v.local_seo.citation_opportunities.map(d => <Chip key={d} text={d} bg="#F9F9F9" color="#555" border="#E5E5E5" />)}</div></>
                  )}
                  <QuickWins wins={v.local_seo.quick_wins} />
                </>}
              </SectionCard>

            </div>
          </div>
        )
      })()}
    </div>
  )
}
