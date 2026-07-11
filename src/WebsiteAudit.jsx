import { useState, useEffect } from 'react'
import CityInput, { getLastCity } from './CityInput'

const LS_KEY_WEBSITE = 'adsoh_website_result'
import { Monitor, Copy, Check, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Zap } from 'lucide-react'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'


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

function scoreColor(s) {
  if (s >= 75) return '#16A34A'
  if (s >= 50) return '#D97706'
  return '#DC2626'
}

function scoreBg(s) {
  if (s >= 75) return '#F0FDF4'
  if (s >= 50) return '#FFFBEB'
  return '#FEF2F2'
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        background: copied ? '#16A34A' : '#F5F5F5',
        border: '1px solid ' + (copied ? '#16A34A' : '#E5E5E5'),
        color: copied ? '#fff' : '#666',
        padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
        cursor: 'pointer', flexShrink: 0,
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy Audit'}
    </button>
  )
}

function Shimmer({ h = '14px', w = '100%' }) {
  return <div style={{ height: h, width: w, borderRadius: '4px', background: 'linear-gradient(90deg,#F0F0F0 25%,#E8E8E8 50%,#F0F0F0 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.2s ease-in-out infinite' }} />
}

function ScoreCard({ title, data, scoreKey = 'score', expanded, onToggle }) {
  if (!data) return null
  const score  = data[scoreKey] ?? data.score ?? data.headline_clarity ?? 0
  const issues = data.issues || []
  const fixes  = data.fixes  || []

  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 18px', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '8px',
            background: scoreBg(score), border: `1.5px solid ${scoreColor(score)}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: scoreColor(score) }}>{score}</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: BONE }}>{title}</p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: MUTED }}>
              {issues.length} issue{issues.length !== 1 ? 's' : ''} · {fixes.length} fix{fixes.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp size={15} color="#BBB" /> : <ChevronDown size={15} color="#BBB" />}
      </button>

      {expanded && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid #F0F0F0' }}>
          {/* Extra boolean badges */}
          {Object.entries(data).filter(([k, v]) => typeof v === 'boolean').map(([k, v]) => (
            <span key={k} style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              background: v ? '#F0FDF4' : '#FEF2F2',
              color: v ? '#16A34A' : '#DC2626',
              border: `1px solid ${v ? '#BBF7D0' : '#FECACA'}`,
              borderRadius: '20px', padding: '3px 9px', fontSize: '11px', fontWeight: '600',
              marginRight: '6px', marginTop: '12px', marginBottom: '4px',
            }}>
              {v ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
              {k.replace(/_/g, ' ')}
            </span>
          ))}
          {data.cta_quality && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              background: data.cta_quality === 'strong' ? '#F0FDF4' : data.cta_quality === 'medium' ? '#FFFBEB' : '#FEF2F2',
              color: data.cta_quality === 'strong' ? '#16A34A' : data.cta_quality === 'medium' ? '#D97706' : '#DC2626',
              borderRadius: '20px', padding: '3px 9px', fontSize: '11px', fontWeight: '600',
              border: '1px solid currentColor', marginRight: '6px', marginTop: '12px', marginBottom: '4px',
            }}>
              CTA quality: {data.cta_quality}
            </span>
          )}
          {data.cta_count !== undefined && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              background: SLATE_M, color: MUTED,
              borderRadius: '20px', padding: '3px 9px', fontSize: '11px', fontWeight: '600',
              marginTop: '12px', marginBottom: '4px',
            }}>
              {data.cta_count} CTA{data.cta_count !== 1 ? 's' : ''} found
            </span>
          )}

          {issues.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issues found</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {issues.map((issue, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <AlertCircle size={12} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: '1.5' }}>{issue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fixes.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: GREEN, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fixes</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {fixes.map((fix, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <CheckCircle size={12} color="#16A34A" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: '1.5' }}>{fix}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function WebsiteAudit() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [url, setUrl]                     = useState('')
  const [industry, setIndustry]           = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [city, setCity]                   = useState(getLastCity)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [result, setResult]               = useState(null)
  const [expanded, setExpanded]           = useState(null)
  const [fromCache, setFromCache]         = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY_WEBSITE); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  const resolvedIndustry = industry === 'Other' ? industryOther : industry

  const page = {
    minHeight: '100vh', background: INK,
    padding: isMobile ? '28px 16px' : '40px 36px',
    maxWidth: '860px', width: '100%', boxSizing: 'border-box',
    fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
  }

  async function handleAudit() {
    if (!url.trim()) { setError('Website URL daalo.'); return }
    setError(''); setLoading(true); setResult(null); setExpanded(null)
    try {
      const res  = await fetch(`${BACKEND}/website-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), industry: resolvedIndustry, city }),
      })
      const data = await res.json()
      if (data.success) { setResult(data); localStorage.setItem(LS_KEY_WEBSITE, JSON.stringify(data)); setFromCache(false) }
      else setError(data.error || 'Audit failed. Dobara try karo.')
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  function auditText(r) {
    if (!r) return ''
    const a = r.audit
    const lines = [
      `WEBSITE AUDIT — ${r.url}`,
      `Overall Score: ${a.overall_score}/100`,
      `Verdict: ${a.overall_verdict}`,
      '',
      'PRIORITY FIXES:',
      ...(a.priority_fixes || []).map((f, i) => `${i + 1}. ${f}`),
      '',
      'QUICK WINS TODAY:',
      ...(a.quick_wins || []).map(w => `• ${w}`),
      '',
      'HOMEPAGE: ' + (a.homepage?.headline_clarity ?? '?') + '/100',
      ...(a.homepage?.issues || []).map(i => `  ⚠ ${i}`),
      ...(a.homepage?.fixes  || []).map(f => `  ✓ ${f}`),
      '',
      'TRUST SIGNALS: ' + (a.trust_signals?.score ?? '?') + '/100',
      ...(a.trust_signals?.missing || []).map(m => `  ⚠ Missing: ${m}`),
      ...(a.trust_signals?.fixes   || []).map(f => `  ✓ ${f}`),
      '',
      'CONVERSION: ' + (a.conversion?.score ?? '?') + '/100',
      ...(a.conversion?.issues || []).map(i => `  ⚠ ${i}`),
      ...(a.conversion?.fixes  || []).map(f => `  ✓ ${f}`),
      '',
      'CONTENT: ' + (a.content?.score ?? '?') + '/100',
      ...(a.content?.issues || []).map(i => `  ⚠ ${i}`),
      ...(a.content?.fixes  || []).map(f => `  ✓ ${f}`),
      '',
      'SPEED / SEO: ' + (a.speed_seo?.score ?? '?') + '/100',
      ...(a.speed_seo?.issues || []).map(i => `  ⚠ ${i}`),
      ...(a.speed_seo?.fixes  || []).map(f => `  ✓ ${f}`),
    ]
    return lines.join('\n')
  }

  const sections = result ? [
    { key: 'homepage',      title: 'Homepage',       data: result.audit.homepage,      scoreKey: 'headline_clarity' },
    { key: 'trust_signals', title: 'Trust Signals',  data: result.audit.trust_signals, scoreKey: 'score' },
    { key: 'conversion',    title: 'Conversion',     data: result.audit.conversion,    scoreKey: 'score' },
    { key: 'content',       title: 'Content',        data: result.audit.content,       scoreKey: 'score' },
    { key: 'speed_seo',     title: 'Speed / SEO',    data: result.audit.speed_seo,     scoreKey: 'score' },
  ] : []

  return (
    <div style={page}>
      <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Monitor size={20} color={GOLD} />
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.4px' }}>Website Intelligence</h1>
      </div>
      <p style={{ color: MUTED, fontSize: '13px', margin: '0 0 28px' }}>Crawls your website and returns a conversion audit — every issue tied to actual content found.</p>

      {/* Input card */}
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '16px' }}>

          {error && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: RED, fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Website URL <span style={{ color: '#DC2626' }}>*</span></label>
            <input
              type="url" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://sohscape.com"
              onKeyDown={e => e.key === 'Enter' && handleAudit()}
              style={inp}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={lbl}>Industry <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inp, color: industry ? '#171717' : '#999' }}>
                <option value="">— Any industry —</option>
                {INDUSTRIES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Target City <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
              <CityInput value={city} onChange={setCity} style={inp} />
            </div>
          </div>

          {industry === 'Other' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Specify Industry</label>
              <input type="text" value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="e.g. Interior Designers" style={inp} />
            </div>
          )}

          <button
            onClick={handleAudit}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', background: loading ? '#E5E5E5' : GOLD,
              border: 'none', color: loading ? '#999' : '#fff',
              padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <Monitor size={15} />
            {loading ? 'Crawling & analysing website...' : 'Audit Website'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ maxWidth: '640px', width: '100%' }}>
          {['Crawling website content...', 'Analysing homepage & trust signals...', 'Scoring conversion & SEO...'].map((label, i) => (
            <div key={i} style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#FFFBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: BONE, margin: '0 0 6px' }}>{label}</p>
                <Shimmer h="9px" w="55%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {fromCache && result && !loading && (
        <div style={{ maxWidth: '800px', width: '100%', background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '9px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Showing previous result · Generate new report to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY_WEBSITE); setResult(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: MUTED, textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}

      {result && (() => {
        const a     = result.audit
        const score = a.overall_score ?? 0

        return (
          <div style={{ maxWidth: '800px', width: '100%' }}>

            {/* Overall score */}
            <div style={{ ...card, padding: isMobile ? '20px 16px' : '28px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '16px', flexShrink: 0,
                background: scoreBg(score), border: `2px solid ${scoreColor(score)}40`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '28px', fontWeight: '700', color: scoreColor(score), lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: '10px', color: scoreColor(score), fontWeight: '600', marginTop: '2px' }}>/100</span>
              </div>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700', color: BONE, letterSpacing: '-0.3px' }}>
                  {score >= 75 ? 'Good website' : score >= 50 ? 'Needs work' : 'Critical issues'}
                </p>
                <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#555', lineHeight: '1.5' }}>{a.overall_verdict}</p>
                <p style={{ margin: 0, fontSize: '11px', color: MUTED }}>{result.url}{result.memory_used ? ' · Memory context used' : ''}</p>
              </div>
              <CopyBtn text={auditText(result)} />
            </div>

            {/* Priority Fixes */}
            {(a.priority_fixes || []).length > 0 && (
              <div style={{ ...card, padding: isMobile ? '20px 16px' : '24px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GOLD }} />
                  <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Priority Fixes</h3>
                  <span style={{ fontSize: '12px', color: MUTED, marginLeft: '2px' }}>ordered by conversion impact</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {a.priority_fixes.map((fix, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{
                        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                        background: i === 0 ? GOLD : '#F5F5F5',
                        color: i === 0 ? '#fff' : '#888',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: '700',
                      }}>{i + 1}</span>
                      <p style={{ margin: 0, fontSize: '13.5px', color: '#222', lineHeight: '1.5' }}>{fix}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Wins */}
            {(a.quick_wins || []).length > 0 && (
              <div style={{ ...card, padding: isMobile ? '20px 16px' : '24px', marginBottom: '12px', borderColor: '#D4AF3740', background: '#FFFDF5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Zap size={15} color={GOLD} />
                  <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#8B6914' }}>Quick Wins — Do These Today</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {a.quick_wins.map((win, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '10px', alignItems: 'flex-start',
                      background: SLATE, border: '1px solid #E8DFA8', borderRadius: '7px', padding: '10px 13px',
                    }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '1.5px solid #D4AF37', flexShrink: 0, marginTop: '1px' }} />
                      <p style={{ margin: 0, fontSize: '13.5px', color: '#444', lineHeight: '1.5' }}>{win}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Score cards */}
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: MUTED, margin: '20px 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Section Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sections.map(({ key, title, data, scoreKey }) => (
                <ScoreCard
                  key={key}
                  title={title}
                  data={data}
                  scoreKey={scoreKey}
                  expanded={expanded === key}
                  onToggle={() => setExpanded(expanded === key ? null : key)}
                />
              ))}
            </div>

          </div>
        )
      })()}
    </div>
  )
}
