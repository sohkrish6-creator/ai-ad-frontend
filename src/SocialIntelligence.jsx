import { useState, useEffect } from 'react'
import {
  Radar, ChevronDown, ChevronUp, Copy, Check, ExternalLink, Camera, MessageCircle,
  Briefcase, Play, Globe, Building2,
} from 'lucide-react'
import CityInput, { getLastCity } from './CityInput'
import { useToast } from './ToastContext'
import { useLoadingSteps } from './useLoadingSteps'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const LS_KEY = 'adsoh_social_intel_result'
const PREFILL_LS_KEY = 'adsoh_social_intel_prefill'

const SIE_LOADING_STEPS = [
  'Discovering platforms...', 'Reading YouTube data...',
  'Researching social signals...', 'Building growth plan...',
]

const INPUT_TYPES = [
  { value: 'website',       label: 'Website URL' },
  { value: 'business_name', label: 'Business Name' },
  { value: 'instagram',     label: 'Instagram Handle' },
  { value: 'facebook',      label: 'Facebook Page' },
  { value: 'linkedin',      label: 'LinkedIn Page' },
  { value: 'youtube',       label: 'YouTube Channel' },
  { value: 'gbp',           label: 'Google Business Profile' },
]

const C = {
  bg: '#0A0F1E', surface: '#111827', card: '#1A2236', border: '#1E2D45',
  accent: '#3B82F6', accentDk: '#2563EB', gold: '#D4AF37', green: '#10B981',
  red: '#EF4444', yellow: '#F59E0B', text: '#F1F5F9', muted: '#94A3B8', inpBg: '#0D1526',
}

const s = {
  page:  { minHeight: '100vh', background: C.bg, color: C.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif' },
  wrap:  { maxWidth: '900px', margin: '0 auto', padding: '36px 20px 60px' },
  card:  { background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px', marginBottom: '20px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, marginBottom: '6px' },
  input: { width: '100%', background: C.inpBg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '11px 14px', color: C.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  secHead: { fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: '14px', paddingBottom: '10px', borderBottom: `1px solid ${C.border}` },
  row:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
}

const PLATFORM_ICON = { website: Globe, instagram: Camera, facebook: MessageCircle, linkedin: Briefcase, youtube: Play, business_name: Building2, gbp: Building2 }

function DataLabelBadge({ label }) {
  const map = {
    VERIFIED:    { bg: '#052e1630', color: C.green,  border: C.green + '50',  text: 'VERIFIED' },
    OBSERVED:    { bg: '#2D1B0030', color: C.yellow, border: C.yellow + '50', text: 'OBSERVED' },
    INFERRED:    { bg: '#1E293B',   color: C.accent, border: C.accent + '50', text: 'INFERRED' },
    NOT_VERIFIED:{ bg: '#1E293B',   color: C.muted,  border: C.muted + '50',  text: 'NOT VERIFIED' },
    MIXED:       { bg: '#1E293B',   color: C.accent, border: C.accent + '50', text: 'MIXED' },
  }
  const st = map[label] || map.NOT_VERIFIED
  return <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, borderRadius: '4px', padding: '2px 7px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.04em' }}>{st.text}</span>
}

function ScoreCard({ label, score, dataLabel, confidence }) {
  const col = (score || 0) >= 70 ? C.green : (score || 0) >= 40 ? C.gold : C.red
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: `3px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', background: `${col}15` }}>
        <span style={{ fontSize: '17px', fontWeight: '800', color: col }}>{score ?? 0}</span>
      </div>
      <p style={{ margin: '0 0 6px', fontSize: '11.5px', color: C.muted, fontWeight: '600' }}>{label}</p>
      <DataLabelBadge label={dataLabel} />
      {confidence != null && <p style={{ margin: '5px 0 0', fontSize: '10px', color: C.muted }}>{confidence}% confidence</p>}
    </div>
  )
}

function Collapsible({ title, children, defaultOpen = false, badge = null }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', background: C.surface, border: 'none', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: C.text, fontSize: '13px', fontWeight: '600' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{title}{badge}</span>
        {open ? <ChevronUp size={15} color={C.muted} /> : <ChevronDown size={15} color={C.muted} />}
      </button>
      {open && <div style={{ padding: '16px', background: C.card }}>{children}</div>}
    </div>
  )
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600) }} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: '5px', padding: '3px 8px', cursor: 'pointer', color: done ? C.green : C.muted, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', flexShrink: 0 }}>
      {done ? <Check size={10} /> : <Copy size={10} />} {done ? 'Copied' : 'Copy'}
    </button>
  )
}

function RecCard({ rec }) {
  if (!rec) return null
  const confColor = (rec.confidence || 0) >= 70 ? C.green : (rec.confidence || 0) >= 40 ? C.gold : C.red
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '13px 15px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ fontSize: '10px', fontWeight: '700', color: { high: C.red, medium: C.gold, low: C.muted }[rec.priority] || C.muted, textTransform: 'uppercase', border: `1px solid ${C.border}`, borderRadius: '4px', padding: '2px 7px' }}>{rec.priority || 'medium'}</span>
        <span style={{ fontSize: '11px', fontWeight: '700', color: confColor }}>{rec.confidence ?? 0}% confidence</span>
      </div>
      <p style={{ margin: '0 0 4px', fontSize: '13px', color: C.text, lineHeight: '1.5' }}><strong style={{ color: C.muted }}>Observation:</strong> {rec.observation}</p>
      <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.muted, lineHeight: '1.5' }}><strong>Evidence:</strong> {rec.evidence}</p>
      <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.green, lineHeight: '1.5' }}><strong>Expected impact:</strong> {rec.expected_impact}</p>
      {rec.risk && <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.yellow, lineHeight: '1.5' }}><strong>Risk:</strong> {rec.risk}</p>}
      <p style={{ margin: 0, fontSize: '12px', color: C.accent, lineHeight: '1.5' }}><strong>Next action:</strong> {rec.next_action}</p>
    </div>
  )
}

export default function SocialIntelligence() {
  const toast = useToast()
  const [inputValue, setInputValue] = useState('')
  const [inputType, setInputType]   = useState('website')
  const [city, setCity]             = useState(getLastCity)
  const [industry, setIndustry]     = useState('')
  const [loading, setLoading]       = useState(false)
  const loadingStep = useLoadingSteps(SIE_LOADING_STEPS, loading)
  const [error, setError]           = useState('')
  const [data, setData]             = useState(null)
  const [fromCache, setFromCache]   = useState(false)
  const [contentTab, setContentTab] = useState('reels')

  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_KEY)
      if (s) { setData(JSON.parse(s)); setFromCache(true) }
    } catch {}
    try {
      const pre = localStorage.getItem(PREFILL_LS_KEY)
      if (pre) {
        const p = JSON.parse(pre)
        if (p.input_value) setInputValue(p.input_value)
        if (p.input_type)  setInputType(p.input_type)
        if (p.city)        setCity(p.city)
        if (p.industry)    setIndustry(p.industry)
        localStorage.removeItem(PREFILL_LS_KEY)
      }
    } catch {}
  }, [])

  async function analyze() {
    if (!inputValue.trim()) { setError('Please enter a value to analyze.'); return }
    setLoading(true); setError(''); setData(null); setFromCache(false)
    try {
      const res = await fetch(`${BACKEND}/social-intelligence`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_value: inputValue.trim(), input_type: inputType, city: city.trim(), industry: industry.trim() }),
      })
      const json = await res.json()
      if (json.success) {
        setData(json); localStorage.setItem(LS_KEY, JSON.stringify(json)); toast.success('Analysis complete!')
      } else {
        setError(json.error || 'Analysis failed.'); toast.error(json.error || 'Analysis failed.')
      }
    } catch (e) { setError(`Network error: ${e.message}`); toast.error(`Network error: ${e.message}`) }
    setLoading(false)
  }

  const d  = data?.data || {}
  const bh = d.brand_health || {}
  const bs = d.business_summary || {}
  const yt = d.youtube || {}
  const gbp = d.google_business_profile || {}
  const web = d.website || {}
  const social = d.social_signals || {}
  const comp = d.competitor_comparison || {}
  const content = d.content_intelligence || {}
  const growth = d.growth_engine || {}
  const calendar = content.calendar || {}
  const platforms = d.platform_discovery || []
  const warnings = data?.warnings || []

  const CONTENT_TABS = [
    { key: 'reels', label: 'Reels', items: calendar.reels || [] },
    { key: 'carousels', label: 'Carousels', items: calendar.carousels || [] },
    { key: 'stories', label: 'Stories', items: calendar.stories || [] },
  ]
  const activeContentItems = CONTENT_TABS.find(t => t.key === contentTab)?.items || []

  return (
    <div style={s.page}>
      <style>{`
        input::placeholder,select::placeholder { color: #334155; }
        input:focus,select:focus { border-color: ${C.accent} !important; }
        select option { background: #111827; color: #F1F5F9; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .spin { animation: pulse 1.5s infinite; }
      `}</style>
      <div style={s.wrap}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <Radar size={26} color={C.gold} />
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>Social Intelligence Engine</h1>
          </div>
          <p style={{ margin: 0, color: C.muted, fontSize: '14px' }}>A complete social/digital presence audit from one input — every data point labeled by how certain it is.</p>
        </div>

        {/* Input Form */}
        <div style={s.card}>
          <p style={s.secHead}>Analyze Presence</p>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={s.label}>Input Value</label>
              <input style={s.input} value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="e.g. sohscape.com or business name" />
            </div>
            <div>
              <label style={s.label}>Input Type</label>
              <select style={{ ...s.input, appearance: 'none' }} value={inputType} onChange={e => setInputType(e.target.value)}>
                {INPUT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div style={s.row}>
            <div>
              <label style={s.label}>City</label>
              <CityInput value={city} onChange={setCity} style={s.input} />
            </div>
            <div>
              <label style={s.label}>Industry <span style={{ fontWeight: '400', textTransform: 'none', color: '#475569' }}>— optional</span></label>
              <input style={s.input} value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Hospitality" />
            </div>
          </div>
          {error && <div style={{ background: '#1F0A0A', border: `1px solid ${C.red}40`, borderRadius: '7px', padding: '10px 14px', marginTop: '14px', color: C.red, fontSize: '13px' }}>{error}</div>}
          <button onClick={analyze} disabled={loading} style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: loading ? C.accentDk : C.gold, border: 'none', color: loading ? '#ccc' : '#171717', padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? <span className="spin">{loadingStep}</span> : <>🔍 Analyze Presence</>}
          </button>
        </div>

        {/* Cache banner */}
        {fromCache && data && !loading && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '7px', padding: '9px 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontSize: '12px', color: C.muted }}>Showing previous result · Analyze again to refresh</p>
            <button onClick={() => { localStorage.removeItem(LS_KEY); setData(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: C.muted, textDecoration: 'underline' }}>Clear</button>
          </div>
        )}

        {warnings.length > 0 && data && !loading && (
          <div style={{ background: '#2D1B00', border: `1px solid ${C.gold}40`, borderRadius: '7px', padding: '9px 14px', marginBottom: '12px' }}>
            {warnings.map((w, i) => <p key={i} style={{ margin: i < warnings.length - 1 ? '0 0 4px' : 0, fontSize: '12px', color: C.gold }}>⚠ {w}</p>)}
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <>
            {/* Brand Health */}
            <div style={s.card}>
              <p style={s.secHead}>Brand Health</p>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', border: `5px solid ${(bh.overall?.score || 0) >= 70 ? C.green : (bh.overall?.score || 0) >= 40 ? C.gold : C.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <span style={{ fontSize: '30px', fontWeight: '800' }}>{bh.overall?.score ?? '—'}</span>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '600', color: C.muted }}>Overall Brand Health</p>
                <DataLabelBadge label={bh.overall?.data_label} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
                <ScoreCard label="Website" score={bh.website?.score} dataLabel={bh.website?.data_label} confidence={bh.website?.confidence} />
                <ScoreCard label="YouTube" score={bh.youtube?.score} dataLabel={bh.youtube?.data_label} confidence={bh.youtube?.confidence} />
                <ScoreCard label="Google Business" score={bh.google_business?.score} dataLabel={bh.google_business?.data_label} confidence={bh.google_business?.confidence} />
                <ScoreCard label="Social Presence" score={bh.social_presence?.score} dataLabel={bh.social_presence?.data_label} confidence={bh.social_presence?.confidence} />
                <ScoreCard label="Content" score={bh.content?.score} dataLabel={bh.content?.data_label} confidence={bh.content?.confidence} />
              </div>
            </div>

            {/* Platform Discovery */}
            <Collapsible title="🗺️ Platform Discovery" defaultOpen>
              <div style={{ display: 'grid', gap: '8px' }}>
                {platforms.map((p, i) => {
                  const Icon = PLATFORM_ICON[p.platform] || Globe
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface, borderRadius: '6px', padding: '9px 12px', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <Icon size={15} color={p.status === 'found' ? C.accent : C.muted} />
                        <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>{p.platform.replace('_', ' ')}</span>
                        {p.url && <span style={{ fontSize: '11.5px', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.url}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, display: 'flex' }}><ExternalLink size={12} /></a>}
                        <DataLabelBadge label={p.data_label} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Collapsible>

            {/* Business Summary */}
            <Collapsible title="🏢 Business Summary">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <DataLabelBadge label={bs.data_label} />
                {bs.memory_reused && <span style={{ fontSize: '11px', color: C.accent }}>Reused Marketing Brain intelligence</span>}
              </div>
              <p style={{ margin: '0 0 6px', fontSize: '13px' }}><strong style={{ color: C.muted }}>Name:</strong> {bs.business_name}</p>
              <p style={{ margin: '0 0 6px', fontSize: '13px' }}><strong style={{ color: C.muted }}>Industry:</strong> {bs.industry}</p>
              {bs.positioning && <p style={{ margin: '0 0 6px', fontSize: '13px' }}><strong style={{ color: C.muted }}>Positioning:</strong> {bs.positioning}</p>}
              {bs.uvp && <p style={{ margin: 0, fontSize: '13px' }}><strong style={{ color: C.muted }}>UVP:</strong> {bs.uvp}</p>}
            </Collapsible>

            {/* YouTube */}
            <Collapsible title="▶️ YouTube Intelligence">
              <div style={{ marginBottom: '10px' }}><DataLabelBadge label={yt.data_label} /></div>
              {yt.found ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {[['Subscribers', yt.subscriber_count ?? 'Hidden'], ['Videos', yt.video_count], ['Total Views', yt.view_count]].map(([k, v]) => (
                      <div key={k} style={{ background: C.surface, borderRadius: '7px', padding: '9px 12px' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '10px', color: C.muted, fontWeight: '600', textTransform: 'uppercase' }}>{k}</p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: C.muted }}>{yt.publishing_frequency}</p>
                  {yt.recent_videos?.map((v, i) => (
                    <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: C.text, background: C.surface, borderRadius: '6px', padding: '8px 12px', marginBottom: '6px', fontSize: '12.5px' }}>
                      <span>{v.title}</span><span style={{ color: C.muted, flexShrink: 0, marginLeft: '10px' }}>{v.views} views</span>
                    </a>
                  ))}
                </>
              ) : <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>{yt.note || yt.error}</p>}
            </Collapsible>

            {/* Google Business Profile */}
            <Collapsible title="📍 Google Business Profile">
              <div style={{ marginBottom: '10px' }}><DataLabelBadge label={gbp.data_label} /></div>
              {gbp.found ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[['Name', gbp.name], ['Rating', gbp.rating ? `⭐ ${gbp.rating} (${gbp.review_count})` : '—'], ['Address', gbp.address], ['Status', gbp.business_status]].map(([k, v]) => (
                    <div key={k} style={{ background: C.surface, borderRadius: '7px', padding: '9px 12px' }}>
                      <p style={{ margin: '0 0 3px', fontSize: '10px', color: C.muted, fontWeight: '600', textTransform: 'uppercase' }}>{k}</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{v || '—'}</p>
                    </div>
                  ))}
                  {gbp.match_note && <p style={{ gridColumn: '1 / -1', margin: 0, fontSize: '11.5px', color: C.muted, fontStyle: 'italic' }}>{gbp.match_note}</p>}
                </div>
              ) : <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>{gbp.note}</p>}
            </Collapsible>

            {/* Website Health */}
            <Collapsible title="🌐 Website Health">
              <div style={{ marginBottom: '10px' }}><DataLabelBadge label={web.data_label} /></div>
              {web.found ? (
                <>
                  <p style={{ margin: '0 0 10px', fontSize: '13px' }}>Overall Score: <strong style={{ color: web.overall_score >= 70 ? C.green : web.overall_score >= 40 ? C.gold : C.red }}>{web.overall_score}</strong></p>
                  {web.overall_verdict && <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: C.muted }}>{web.overall_verdict}</p>}
                  {web.quick_wins?.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 6px', fontSize: '11px', color: C.green, fontWeight: '600', textTransform: 'uppercase' }}>Quick Wins</p>
                      {web.quick_wins.map((q, i) => <p key={i} style={{ margin: '0 0 3px', fontSize: '12.5px', color: '#6EE7B7' }}>→ {q}</p>)}
                    </div>
                  )}
                </>
              ) : <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>{web.note || web.error}</p>}
            </Collapsible>

            {/* Social Signals */}
            <Collapsible title="📱 Social Signals (Instagram / Facebook / LinkedIn)">
              {['instagram', 'facebook', 'linkedin'].map(p => {
                const entry = social[p] || {}
                const Icon = PLATFORM_ICON[p]
                return (
                  <div key={p} style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={14} /><span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'capitalize' }}>{p}</span>
                      </div>
                      <DataLabelBadge label={entry.data_label} />
                    </div>
                    {entry.data_label === 'OBSERVED' ? (
                      <>
                        {entry.approx_followers && <p style={{ margin: '0 0 4px', fontSize: '12.5px' }}><strong style={{ color: C.muted }}>Followers:</strong> {entry.approx_followers}</p>}
                        {entry.activity_level && <p style={{ margin: '0 0 4px', fontSize: '12.5px' }}><strong style={{ color: C.muted }}>Activity:</strong> {entry.activity_level}</p>}
                        {entry.content_themes?.length > 0 && <p style={{ margin: '0 0 4px', fontSize: '12.5px' }}><strong style={{ color: C.muted }}>Themes:</strong> {entry.content_themes.join(', ')}</p>}
                        {entry.source_snippet && <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B', fontStyle: 'italic' }}>Source: {entry.source_snippet}</p>}
                      </>
                    ) : (
                      <p style={{ margin: 0, fontSize: '12.5px', color: C.muted }}>{entry.note}</p>
                    )}
                  </div>
                )
              })}
            </Collapsible>

            {/* Competitor Comparison */}
            <Collapsible title="🔍 Competitor Comparison">
              <div style={{ marginBottom: '10px' }}><DataLabelBadge label={comp.data_label} /></div>
              {comp.competitors?.length > 0 ? (
                <>
                  {comp.competitors.map((c, i) => (
                    <div key={i} style={{ background: C.surface, borderRadius: '7px', padding: '10px 12px', marginBottom: '8px' }}>
                      <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '700' }}>{c.name}</p>
                      {c.activity_level && <p style={{ margin: '0 0 2px', fontSize: '12px', color: C.muted }}>Activity: {c.activity_level}</p>}
                      {c.positioning && <p style={{ margin: 0, fontSize: '12px', color: C.muted }}>Positioning: {c.positioning}</p>}
                    </div>
                  ))}
                  {comp.where_behind?.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.yellow, fontWeight: '600', textTransform: 'uppercase' }}>Where you're behind</p>
                      {comp.where_behind.map((w, i) => <p key={i} style={{ margin: '0 0 3px', fontSize: '12.5px', color: C.muted }}>• {w}</p>)}
                    </div>
                  )}
                </>
              ) : <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>{comp.note || 'No competitor data available.'}</p>}
            </Collapsible>

            {/* Content Intelligence */}
            <Collapsible title="✨ Content Intelligence">
              <div style={{ marginBottom: '10px' }}><DataLabelBadge label={content.data_label} /></div>
              {content.best_topics?.length > 0 && (
                <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: C.muted }}><strong style={{ color: C.text }}>Best topics:</strong> {content.best_topics.join(', ')}</p>
              )}
              {content.posting_schedule && (
                <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: C.muted }}><strong style={{ color: C.text }}>Posting schedule:</strong> {content.posting_schedule}</p>
              )}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {CONTENT_TABS.map(t => (
                  <button key={t.key} onClick={() => setContentTab(t.key)} style={{ padding: '7px 16px', borderRadius: '7px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', border: 'none', background: contentTab === t.key ? C.gold : C.surface, color: contentTab === t.key ? '#171717' : C.muted }}>
                    {t.label} ({t.items.length})
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gap: '6px', maxHeight: '340px', overflowY: 'auto' }}>
                {activeContentItems.map((idea, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface, borderRadius: '6px', padding: '8px 12px', gap: '10px' }}>
                    <span style={{ fontSize: '12.5px', flex: 1 }}>{i + 1}. {idea}</span>
                    <CopyBtn text={idea} />
                  </div>
                ))}
              </div>
            </Collapsible>

            {/* Growth Plan */}
            <Collapsible title="🚀 Growth Plan" defaultOpen>
              {growth.paid_campaign_readiness && (
                <div style={{ background: growth.paid_campaign_readiness.ready ? '#052e1620' : '#2D1B0030', border: `1px solid ${growth.paid_campaign_readiness.ready ? C.green : C.yellow}40`, borderRadius: '7px', padding: '12px 14px', marginBottom: '14px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '700', color: growth.paid_campaign_readiness.ready ? C.green : C.yellow }}>
                    {growth.paid_campaign_readiness.ready ? '✅ Ready for paid campaigns' : '⚠ Not ready for paid campaigns yet'}
                  </p>
                  {growth.paid_campaign_readiness.reasons?.map((r, i) => <p key={i} style={{ margin: '0 0 3px', fontSize: '12px', color: C.muted }}>• {r}</p>)}
                </div>
              )}
              {growth.organic_vs_paid_split && <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: C.muted }}><strong style={{ color: C.text }}>Organic vs paid:</strong> {growth.organic_vs_paid_split}</p>}

              {['quick_wins', 'plan_30_day', 'plan_90_day'].map(key => (
                growth[key]?.length > 0 && (
                  <div key={key} style={{ marginBottom: '14px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', color: C.gold, fontWeight: '700', textTransform: 'uppercase' }}>
                      {key === 'quick_wins' ? 'Quick Wins (This Week)' : key === 'plan_30_day' ? '30-Day Plan' : '90-Day Roadmap'}
                    </p>
                    {growth[key].map((rec, i) => <RecCard key={i} rec={rec} />)}
                  </div>
                )
              ))}

              {growth.campaign_recommendations?.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', color: C.accent, fontWeight: '700', textTransform: 'uppercase' }}>Campaign Recommendations</p>
                  {growth.campaign_recommendations.map((c, i) => <p key={i} style={{ margin: '0 0 4px', fontSize: '12.5px', color: C.muted }}>→ {c}</p>)}
                </div>
              )}
            </Collapsible>
          </>
        )}
      </div>
    </div>
  )
}
