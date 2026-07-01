import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

const C = {
  bg:       '#0A0F1E',
  surface:  '#111827',
  card:     '#1A2236',
  border:   '#1E2D45',
  accent:   '#3B82F6',
  accentDk: '#2563EB',
  gold:     '#F59E0B',
  green:    '#10B981',
  red:      '#EF4444',
  yellow:   '#F59E0B',
  text:     '#F1F5F9',
  muted:    '#94A3B8',
  inpBg:    '#0D1526',
}

const s = {
  page:    { minHeight: '100vh', background: C.bg, color: C.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif', padding: '0' },
  wrap:    { maxWidth: '860px', margin: '0 auto', padding: '36px 20px 60px' },
  card:    { background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px', marginBottom: '20px' },
  label:   { display: 'block', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: '6px' },
  input:   { width: '100%', background: C.inpBg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '11px 14px', color: C.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  btn:     { background: C.accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '13px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '6px' },
  secHead: { fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: '14px', paddingBottom: '10px', borderBottom: `1px solid ${C.border}` },
  row:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800) }
  return (
    <button onClick={copy} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: '5px', padding: '3px 8px', cursor: 'pointer', color: done ? C.green : C.muted, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
      {done ? <Check size={10} /> : <Copy size={10} />} {done ? 'Copied' : 'Copy'}
    </button>
  )
}

function ScoreRing({ value, label, color }) {
  const col = value >= 70 ? C.green : value >= 40 ? C.gold : C.red
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: `4px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', background: `${col}18` }}>
        <span style={{ fontSize: '20px', fontWeight: '800', color: col }}>{value}</span>
      </div>
      <p style={{ margin: 0, fontSize: '11px', color: C.muted, fontWeight: '600' }}>{label}</p>
    </div>
  )
}

function IntentBadge({ intent }) {
  const colors = { high: [C.green, '#052e16'], medium: [C.gold, '#2D1B00'], low: [C.muted, '#1E293B'] }
  const [fg, bg] = colors[intent] || colors.low
  return <span style={{ background: bg, color: fg, border: `1px solid ${fg}40`, borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{intent}</span>
}

function PriorityBadge({ priority }) {
  const colors = { high: C.green, medium: C.gold, low: C.muted }
  const col = colors[priority] || C.muted
  return <span style={{ color: col, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', border: `1px solid ${col}50`, borderRadius: '4px', padding: '2px 8px' }}>{priority}</span>
}

function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', background: C.surface, border: 'none', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: C.text, fontSize: '13px', fontWeight: '600' }}>
        {title}
        {open ? <ChevronUp size={15} color={C.muted} /> : <ChevronDown size={15} color={C.muted} />}
      </button>
      {open && <div style={{ padding: '16px', background: C.card }}>{children}</div>}
    </div>
  )
}

export default function CricketAds() {
  const [url, setUrl]           = useState('')
  const [waLink, setWaLink]     = useState('')
  const [city, setCity]         = useState('India')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [data, setData]         = useState(null)

  async function analyze() {
    if (!url.trim()) { setError('Website URL is required.'); return }
    setLoading(true); setError(''); setData(null)
    try {
      const res  = await fetch(`${BACKEND}/cricket-ads-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), whatsapp_link: waLink.trim(), city: city.trim() || 'India' }),
      })
      const json = await res.json()
      if (json.success) setData(json.data)
      else setError(json.error || 'Analysis failed.')
    } catch (e) { setError(`Network error: ${e.message}`) }
    setLoading(false)
  }

  const d = data || {}
  const cc = d.compliance_check || {}
  const ls = d.launch_score    || {}
  const ca = d.creative_assets || {}
  const cs = d.campaign_structure || {}
  const lp = d.landing_page_audit || {}

  return (
    <div style={s.page}>
      <style>{`
        input::placeholder { color: #334155; }
        input:focus { border-color: #3B82F6 !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .spin { animation: pulse 1.5s infinite; }
      `}</style>

      <div style={s.wrap}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>🏏</span>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>Cricket Community Ads</h1>
          </div>
          <p style={{ margin: 0, color: C.muted, fontSize: '14px' }}>Google Display campaign intelligence for cricket WhatsApp communities</p>
        </div>

        {/* Input form */}
        <div style={s.card}>
          <p style={s.secHead}>Campaign Setup</p>
          <div style={{ marginBottom: '14px' }}>
            <label style={s.label}>Website / Landing Page URL</label>
            <input style={s.input} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yoursite.com" />
          </div>
          <div style={s.row}>
            <div>
              <label style={s.label}>WhatsApp Group Link</label>
              <input style={s.input} value={waLink} onChange={e => setWaLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." />
            </div>
            <div>
              <label style={s.label}>City / Region</label>
              <input style={s.input} value={city} onChange={e => setCity(e.target.value)} placeholder="India" />
            </div>
          </div>
          {error && <div style={{ background: '#1F0A0A', border: `1px solid ${C.red}40`, borderRadius: '7px', padding: '10px 14px', marginTop: '14px', color: C.red, fontSize: '13px' }}>{error}</div>}
          <button style={{ ...s.btn, background: loading ? '#1D4ED8' : C.accent, opacity: loading ? 0.8 : 1 }} onClick={analyze} disabled={loading}>
            {loading ? <span className="spin">Analyzing… (crawling + live cricket data + AI…)</span> : '🏏 Analyze & Build Campaign'}
          </button>
        </div>

        {/* Results */}
        {data && (
          <>
            {/* 1 — Compliance Check */}
            <div style={{ ...s.card, border: `1px solid ${cc.safe_to_advertise ? C.green : C.red}50`, background: cc.safe_to_advertise ? '#052e1615' : '#1F0A0A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{cc.safe_to_advertise ? '✅' : '⚠️'}</span>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: '700', color: cc.safe_to_advertise ? C.green : C.red }}>
                    {cc.safe_to_advertise ? 'Safe to Advertise' : 'Review Required'}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: C.muted }}>
                    Risk Level: <strong style={{ color: cc.risk_level === 'low' ? C.green : cc.risk_level === 'medium' ? C.gold : C.red }}>{(cc.risk_level || '').toUpperCase()}</strong>
                    {cc.flags_found?.length > 0 && ` · ${cc.flags_found.length} flag(s) found`}
                  </p>
                </div>
              </div>
              {cc.flags_found?.length > 0 && (
                <div style={{ marginTop: '12px', padding: '10px 14px', background: '#1F0A0A', borderRadius: '7px' }}>
                  {cc.flags_found.map((f, i) => <p key={i} style={{ margin: '0 0 4px', fontSize: '13px', color: C.red }}>• {f}</p>)}
                </div>
              )}
              {cc.required_fixes?.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: C.muted, fontWeight: '600' }}>REQUIRED FIXES:</p>
                  {cc.required_fixes.map((f, i) => <p key={i} style={{ margin: '0 0 3px', fontSize: '13px', color: C.yellow }}>→ {f}</p>)}
                </div>
              )}
            </div>

            {/* 2 — Launch Score */}
            <div style={s.card}>
              <p style={s.secHead}>Launch Score</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <ScoreRing value={ls.overall    || 0} label="Overall"    />
                <ScoreRing value={ls.audience   || 0} label="Audience"   />
                <ScoreRing value={ls.compliance || 0} label="Compliance" />
                <ScoreRing value={ls.creative   || 0} label="Creative"   />
              </div>
            </div>

            {/* 3 — Audience Segments */}
            <div style={s.card}>
              <p style={s.secHead}>Audience Segments</p>
              {(d.audience_segments || []).sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0)).map((seg, i) => (
                <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '14px 16px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.accentDk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>#{i + 1}</span>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{seg.name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <IntentBadge intent={seg.intent} />
                      <span style={{ fontSize: '12px', color: C.muted }}>Score: <strong style={{ color: C.text }}>{seg.priority_score}</strong></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: C.muted }}>Est. CPC: <strong style={{ color: C.green }}>{seg.estimated_cpc}</strong></span>
                    <span style={{ fontSize: '12px', color: C.muted }}>Est. CTR: <strong style={{ color: C.text }}>{seg.estimated_ctr}</strong></span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: C.muted, lineHeight: '1.5' }}>{seg.reason}</p>
                </div>
              ))}
            </div>

            {/* 4 — Placement Recommendations */}
            <div style={s.card}>
              <p style={s.secHead}>Placement Recommendations</p>
              {(d.placement_recommendations || []).map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px 0', borderBottom: i < (d.placement_recommendations.length - 1) ? `1px solid ${C.border}` : 'none' }}>
                  <PriorityBadge priority={p.priority} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '600' }}>{p.placement}</p>
                    <p style={{ margin: '0 0 3px', fontSize: '13px', color: C.muted }}>{p.why}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: C.accent }}>Est. reach: {p.estimated_reach}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 5 — Campaign Structure */}
            <div style={s.card}>
              <p style={s.secHead}>Campaign Structure</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  ['Campaign Name',    cs.campaign_name],
                  ['Objective',        cs.objective],
                  ['Campaign Type',    cs.campaign_type],
                  ['Daily Budget',     cs.budget_daily],
                  ['Bidding Strategy', cs.bidding_strategy],
                  ['Devices',          cs.devices],
                  ['Frequency Cap',    cs.frequency_cap],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ background: C.surface, borderRadius: '7px', padding: '10px 14px' }}>
                    <p style={{ margin: '0 0 3px', fontSize: '11px', color: C.muted, fontWeight: '600', textTransform: 'uppercase' }}>{k}</p>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: C.text }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 6 — Creative Assets */}
            <div style={s.card}>
              <p style={s.secHead}>Creative Assets</p>

              <Collapsible title={`📝 Headlines (15) — max 30 chars each`} defaultOpen>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {(ca.headlines_15 || []).map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface, borderRadius: '6px', padding: '9px 12px', gap: '10px' }}>
                      <span style={{ fontSize: '13px', flex: 1 }}>{h}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '10px', color: h.length > 30 ? C.red : C.muted }}>{h.length}/30</span>
                        <CopyBtn text={h} />
                      </div>
                    </div>
                  ))}
                </div>
              </Collapsible>

              <Collapsible title={`📋 Long Headlines (5) — max 90 chars`}>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {(ca.long_headlines_5 || []).map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface, borderRadius: '6px', padding: '9px 12px', gap: '10px' }}>
                      <span style={{ fontSize: '13px', flex: 1 }}>{h}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '10px', color: h.length > 90 ? C.red : C.muted }}>{h.length}/90</span>
                        <CopyBtn text={h} />
                      </div>
                    </div>
                  ))}
                </div>
              </Collapsible>

              <Collapsible title={`💬 Descriptions (5) — max 90 chars`}>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {(ca.descriptions_5 || []).map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', background: C.surface, borderRadius: '6px', padding: '9px 12px', gap: '10px' }}>
                      <span style={{ fontSize: '13px', flex: 1, lineHeight: '1.5' }}>{d}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '10px', color: d.length > 90 ? C.red : C.muted }}>{d.length}/90</span>
                        <CopyBtn text={d} />
                      </div>
                    </div>
                  ))}
                </div>
              </Collapsible>

              {ca.image_suggestions?.length > 0 && (
                <div style={{ marginTop: '14px' }}>
                  <p style={{ fontSize: '12px', color: C.muted, fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Image Suggestions</p>
                  {ca.image_suggestions.map((img, i) => (
                    <p key={i} style={{ margin: '0 0 5px', fontSize: '13px', color: C.text }}>• {img}</p>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', padding: '10px 14px', background: C.accentDk + '20', borderRadius: '7px', border: `1px solid ${C.accent}30` }}>
                <span style={{ fontSize: '12px', color: C.muted, fontWeight: '600' }}>CTA:</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: C.accent }}>{ca.cta}</span>
              </div>
            </div>

            {/* 7 — Landing Page Audit */}
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <p style={{ ...s.secHead, marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Landing Page Audit</p>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: `3px solid ${lp.score >= 70 ? C.green : lp.score >= 40 ? C.gold : C.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${lp.score >= 70 ? C.green : lp.score >= 40 ? C.gold : C.red}18` }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: lp.score >= 70 ? C.green : lp.score >= 40 ? C.gold : C.red }}>{lp.score}</span>
                </div>
              </div>
              {lp.issues?.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ fontSize: '12px', color: C.red, fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Issues Found</p>
                  {lp.issues.map((iss, i) => (
                    <p key={i} style={{ margin: '0 0 5px', fontSize: '13px', color: '#FCA5A5' }}>⚠ {iss}</p>
                  ))}
                </div>
              )}
              {lp.fixes?.length > 0 && (
                <div>
                  <p style={{ fontSize: '12px', color: C.green, fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Recommended Fixes</p>
                  {lp.fixes.map((fix, i) => (
                    <p key={i} style={{ margin: '0 0 5px', fontSize: '13px', color: '#6EE7B7' }}>→ {fix}</p>
                  ))}
                </div>
              )}
              {(!lp.issues?.length && !lp.fixes?.length) && (
                <p style={{ color: C.green, fontSize: '14px' }}>✅ Landing page looks good — no major issues found.</p>
              )}
            </div>

            {/* Business Summary footer */}
            {d.business_summary && (
              <div style={{ ...s.card, background: C.surface }}>
                <p style={s.secHead}>Business Summary</p>
                <div style={s.row}>
                  {[['Offer', d.business_summary.offer], ['Target User', d.business_summary.target_user], ['Primary Conversion', d.business_summary.primary_conversion]].map(([k, v]) => (
                    <div key={k}>
                      <p style={{ margin: '0 0 3px', fontSize: '11px', color: C.muted, fontWeight: '600', textTransform: 'uppercase' }}>{k}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: C.text }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
