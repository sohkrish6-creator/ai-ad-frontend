import { useState, useEffect } from 'react'
import { Copy, Check, ChevronDown, ChevronUp, Trash2, Plus, ExternalLink, TrendingUp } from 'lucide-react'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

const BUSINESS_TYPES = [
  'Cricket Community', 'Fantasy Sports Platform', 'Gaming Community', 'Esports Content',
  'Sports News', 'Sports Coaching', 'Sports Merchandise', 'Tournament Platform',
]

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
  page:    { minHeight: '100vh', background: C.bg, color: C.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif' },
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

function ScoreRing({ value, label }) {
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
  const col = { high: C.green, medium: C.gold, low: C.muted }[priority] || C.muted
  return <span style={{ color: col, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', border: `1px solid ${col}50`, borderRadius: '4px', padding: '2px 8px' }}>{priority}</span>
}

// Structured recommendation: observation / why / evidence / confidence / expected_impact / risk / difficulty / priority / next_action
function RecCard({ title, rec }) {
  if (!rec || !rec.observation) return null
  const confColor = (rec.confidence || 0) >= 70 ? C.green : (rec.confidence || 0) >= 40 ? C.gold : C.red
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '14px 16px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: C.text }}>{title}</p>
        <div style={{ display: 'flex', gap: '6px' }}>
          {rec.priority && <PriorityBadge priority={rec.priority} />}
          <span style={{ fontSize: '11px', fontWeight: '700', color: confColor, border: `1px solid ${confColor}50`, borderRadius: '4px', padding: '2px 8px' }}>
            {rec.confidence ?? 0}% confidence
          </span>
        </div>
      </div>
      <p style={{ margin: '0 0 6px', fontSize: '13px', color: C.text, lineHeight: '1.5' }}><strong style={{ color: C.muted }}>Observation:</strong> {rec.observation}</p>
      {rec.why && <p style={{ margin: '0 0 6px', fontSize: '12.5px', color: C.muted, lineHeight: '1.5' }}><strong>Why:</strong> {rec.why}</p>}
      <p style={{ margin: '0 0 6px', fontSize: '12.5px', color: C.muted, lineHeight: '1.5' }}><strong>Evidence:</strong> {rec.evidence}</p>
      <p style={{ margin: '0 0 6px', fontSize: '12.5px', color: C.green, lineHeight: '1.5' }}><strong>Expected impact:</strong> {rec.expected_impact}</p>
      <p style={{ margin: '0 0 6px', fontSize: '12.5px', color: C.gold, lineHeight: '1.5' }}><strong>Risk:</strong> {rec.risk}</p>
      {rec.difficulty && <p style={{ margin: '0 0 6px', fontSize: '12.5px', color: C.muted, lineHeight: '1.5' }}><strong>Difficulty:</strong> {rec.difficulty}</p>}
      <p style={{ margin: 0, fontSize: '12.5px', color: C.accent, lineHeight: '1.5' }}><strong>Next action:</strong> {rec.next_action}</p>
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

// ── API Error display (GoogleAdsException array or plain string) ─────────────
function ApiError({ err }) {
  if (!err) return null
  if (Array.isArray(err)) return (
    <div style={{ background: '#1F0A0A', border: `1px solid ${C.red}40`, borderRadius: '7px', padding: '12px 14px', marginTop: '12px' }}>
      <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', color: C.red, textTransform: 'uppercase' }}>Google Ads API Error{err.length > 1 ? 's' : ''}</p>
      {err.map((e, i) => (
        <div key={i} style={{ background: '#2A0A0A', borderRadius: '5px', padding: '7px 10px', marginBottom: i < err.length - 1 ? '6px' : 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: '700', color: '#F87171', textTransform: 'uppercase' }}>{e.error_code || 'ERROR'}</p>
          <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#FCA5A5' }}>{e.message}</p>
          {e.field && <p style={{ margin: 0, fontSize: '11px', color: '#F87171', opacity: 0.7 }}>Field: {e.field}</p>}
        </div>
      ))}
    </div>
  )
  return <div style={{ background: '#1F0A0A', border: `1px solid ${C.red}40`, borderRadius: '7px', padding: '10px 14px', marginTop: '12px', color: C.red, fontSize: '13px' }}>{String(err)}</div>
}

export default function CricketAds() {
  // ── Analysis state ─────────────────────────────────────────────────────────
  const [url, setUrl]                 = useState('')
  const [waLink, setWaLink]           = useState('')
  const [city, setCity]               = useState('India')
  const [industry, setIndustry]       = useState('')
  const [businessType, setBusinessType] = useState('Cricket Community')
  const [budget, setBudget]           = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [data, setData]               = useState(null)
  const [memoryReused, setMemoryReused] = useState(false)
  const [warnings, setWarnings] = useState([])

  // ── Campaign Performance state ─────────────────────────────────────────────
  const [perfCid, setPerfCid]         = useState('')
  const [perfLoading, setPerfLoading] = useState(false)
  const [perfData, setPerfData]       = useState(null)
  const [perfError, setPerfError]     = useState('')
  const [optLoading, setOptLoading]   = useState(false)
  const [optData, setOptData]         = useState(null)
  const [optError, setOptError]       = useState('')

  // ── Account manager state ──────────────────────────────────────────────────
  const [accounts, setAccounts]       = useState([])
  const [acctName, setAcctName]       = useState('')
  const [acctCid, setAcctCid]         = useState('')
  const [acctAdding, setAcctAdding]   = useState(false)
  const [acctStatus, setAcctStatus]   = useState(null)  // null | {ok, msg}
  const [deletingCid, setDeletingCid] = useState(null)

  // ── Push-to-Google state ───────────────────────────────────────────────────
  const [selectedCid, setSelectedCid] = useState('')
  const [pushLoading, setPushLoading] = useState(false)
  const [pushResult, setPushResult]   = useState(null)
  const [pushError, setPushError]     = useState(null)

  useEffect(() => { loadAccounts() }, [])

  async function loadAccounts() {
    try {
      const res = await fetch(`${BACKEND}/cricket-ads/accounts/list`)
      const json = await res.json()
      if (json.success) {
        setAccounts(json.accounts || [])
        if (!selectedCid && json.accounts?.length) setSelectedCid(json.accounts[0].customer_id)
        if (!perfCid && json.accounts?.length) setPerfCid(json.accounts[0].customer_id)
      }
    } catch { /* silent */ }
  }

  async function handleAddAccount() {
    if (!acctName.trim() || !acctCid.trim()) { setAcctStatus({ ok: false, msg: 'Account Name and Customer ID are required.' }); return }
    setAcctAdding(true); setAcctStatus(null)
    try {
      const res  = await fetch(`${BACKEND}/cricket-ads/accounts/add`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_name: acctName.trim(), customer_id: acctCid.trim() }),
      })
      const json = await res.json()
      if (json.success) {
        setAcctStatus({ ok: true, msg: `✅ Queryable — ${json.account?.name || acctCid} saved.` })
        setAcctName(''); setAcctCid('')
        await loadAccounts()
      } else {
        setAcctStatus({ ok: false, msg: json.error || 'Account not reachable.' })
      }
    } catch (e) { setAcctStatus({ ok: false, msg: `Network error: ${e.message}` }) }
    setAcctAdding(false)
  }

  async function handleDeleteAccount(cid) {
    setDeletingCid(cid)
    try {
      await fetch(`${BACKEND}/cricket-ads/accounts/${cid}`, { method: 'DELETE' })
      await loadAccounts()
      if (selectedCid === cid) setSelectedCid('')
    } catch { /* silent */ }
    setDeletingCid(null)
  }

  async function analyze() {
    if (!url.trim()) { setError('Website URL is required.'); return }
    setLoading(true); setError(''); setData(null); setPushResult(null); setPushError(null); setMemoryReused(false); setWarnings([])
    try {
      const res  = await fetch(`${BACKEND}/cricket-ads-intelligence`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(), whatsapp_link: waLink.trim(), city: city.trim() || 'India',
          industry: industry.trim(), business_type: businessType,
          budget: parseFloat(budget) || 0,
        }),
      })
      const json = await res.json()
      if (json.success) { setData(json.data); setMemoryReused(!!json.memory_reused); setWarnings(json.warnings || []) }
      else setError(json.error || 'Analysis failed.')
    } catch (e) { setError(`Network error: ${e.message}`) }
    setLoading(false)
  }

  async function handlePush() {
    if (!selectedCid) { setPushError('Select an ad account first.'); return }
    if (!data) return
    setPushLoading(true); setPushResult(null); setPushError(null)
    const cs = data.campaign_structure || {}
    const ca = data.creative_assets   || {}
    const topSeg = [...(data.audience_segments || [])].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))[0]
    const budgetNum = parseFloat((cs.budget_daily || '').toString().replace(/[^\d.]/g, '')) || 500
    try {
      const res  = await fetch(`${BACKEND}/cricket-ads/push-to-google`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id:    selectedCid,
          campaign_name:  cs.campaign_name || 'Cricket Community Campaign',
          budget_daily:   budgetNum,
          headlines:      ca.headlines_15       || [],
          long_headlines: ca.long_headlines_5   || [],
          descriptions:   ca.descriptions_10    || [],
          whatsapp_link:  waLink.trim(),
          business_type:  businessType,
          top_audience:   topSeg?.platform_match || topSeg?.name || '',
        }),
      })
      const json = await res.json()
      if (json.success) setPushResult(json)
      else if (json.errors) setPushError(json.errors)
      else setPushError(json.error || 'Campaign creation failed.')
    } catch (e) { setPushError(`Network error: ${e.message}`) }
    setPushLoading(false)
  }

  async function loadPerformance() {
    if (!perfCid) { setPerfError('Select an ad account first.'); return }
    setPerfLoading(true); setPerfError(''); setPerfData(null); setOptData(null); setOptError('')
    try {
      const res  = await fetch(`${BACKEND}/cricket-ads/performance?customer_id=${encodeURIComponent(perfCid)}&days=30`)
      const json = await res.json()
      if (json.success) setPerfData(json.performance)
      else setPerfError(json.error || 'Could not load performance.')
    } catch (e) { setPerfError(`Network error: ${e.message}`) }
    setPerfLoading(false)
  }

  async function runOptimize() {
    if (!perfCid) { setOptError('Select an ad account first.'); return }
    setOptLoading(true); setOptError(''); setOptData(null)
    try {
      const res  = await fetch(`${BACKEND}/cricket-ads/optimize`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: perfCid }),
      })
      const json = await res.json()
      if (json.success) setOptData(json.optimizer)
      else setOptError(json.error || json.message || 'Optimization failed.')
    } catch (e) { setOptError(`Network error: ${e.message}`) }
    setOptLoading(false)
  }

  const d  = data || {}
  const cc = d.compliance_check    || {}
  const ls = d.launch_score        || {}
  const ca = d.creative_assets     || {}
  const cs = d.campaign_structure  || {}
  const lp = d.landing_page_audit  || {}
  const kr = d.key_recommendations || {}
  const sc = d.sports_calendar     || {}
  const csim = d.campaign_simulator || {}
  const cw = d.competitor_watch    || []
  const pinv = d.placement_inventory || []
  const yinv = d.youtube_inventory    || []
  const mp   = d.media_plan           || {}
  const dr   = d.design_recommendations || {}
  const bs   = d.business_summary     || {}

  const acctBadge = accounts.length > 0
    ? <span style={{ background: C.accentDk + '40', color: C.accent, fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px', border: `1px solid ${C.accent}40` }}>{accounts.length}</span>
    : null

  return (
    <div style={s.page}>
      <style>{`
        input::placeholder,select::placeholder { color: #334155; }
        input:focus,select:focus { border-color: #3B82F6 !important; }
        select option { background: #111827; color: #F1F5F9; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .spin { animation: pulse 1.5s infinite; }
      `}</style>

      <div style={s.wrap}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ fontSize: '28px' }}>🏏</span>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>Sports Growth Engine</h1>
          </div>
          <p style={{ margin: 0, color: C.muted, fontSize: '14px' }}>Google Display campaign intelligence for cricket, fantasy sports, gaming and esports communities</p>
        </div>

        {/* ── Ad Accounts Manager (collapsible) ─────────────────────────────── */}
        <div style={s.card}>
          <Collapsible title="🎯 Ad Accounts" badge={acctBadge}>
            {/* Add account form */}
            <div style={{ marginBottom: '16px', padding: '14px', background: C.surface, borderRadius: '8px', border: `1px solid ${C.border}` }}>
              <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: '600', color: C.muted, textTransform: 'uppercase' }}>Add Ad Account</p>
              <div style={s.row}>
                <div>
                  <label style={s.label}>Account Name</label>
                  <input style={s.input} value={acctName} onChange={e => setAcctName(e.target.value)} placeholder="e.g. Sohscape Cricket" />
                </div>
                <div>
                  <label style={s.label}>Customer ID (no dashes)</label>
                  <input style={s.input} value={acctCid} onChange={e => setAcctCid(e.target.value)} placeholder="e.g. 2715637188" />
                </div>
              </div>
              <button
                onClick={handleAddAccount} disabled={acctAdding}
                style={{ marginTop: '10px', background: acctAdding ? C.accentDk : C.accent, color: '#fff', border: 'none', borderRadius: '7px', padding: '9px 20px', fontSize: '13px', fontWeight: '600', cursor: acctAdding ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={13} />
                {acctAdding ? 'Testing connection…' : 'Test & Save'}
              </button>
              {acctStatus && (
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: acctStatus.ok ? C.green : C.red }}>{acctStatus.msg}</p>
              )}
            </div>

            {/* Saved accounts list */}
            {accounts.length === 0
              ? <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>No accounts saved yet. Add one above.</p>
              : accounts.map(acct => (
                <div key={acct.customer_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: C.surface, borderRadius: '7px', marginBottom: '8px', border: `1px solid ${C.border}` }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600' }}>{acct.account_name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: C.muted, fontFamily: 'monospace' }}>{acct.customer_id}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(acct.customer_id)}
                    disabled={deletingCid === acct.customer_id}
                    style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', color: C.red, display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            }
          </Collapsible>
        </div>

        {/* ── Campaign Performance (existing accounts) ──────────────────────── */}
        {accounts.length > 0 && (
          <div style={s.card}>
            <Collapsible title="📊 Campaign Performance">
              <div style={{ marginBottom: '14px' }}>
                <label style={s.label}>Ad Account</label>
                <select value={perfCid} onChange={e => { setPerfCid(e.target.value); setPerfData(null); setOptData(null); setPerfError(''); setOptError('') }} style={{ ...s.input, appearance: 'none' }}>
                  <option value="">— Select account —</option>
                  {accounts.map(a => <option key={a.customer_id} value={a.customer_id}>{a.account_name} ({a.customer_id})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <button onClick={loadPerformance} disabled={perfLoading || !perfCid} style={{ flex: 1, background: perfLoading ? C.accentDk : C.accent, color: '#fff', border: 'none', borderRadius: '7px', padding: '10px', fontSize: '13px', fontWeight: '600', cursor: perfLoading || !perfCid ? 'not-allowed' : 'pointer', opacity: !perfCid ? 0.6 : 1 }}>
                  {perfLoading ? 'Loading…' : 'Load Performance'}
                </button>
                <button onClick={runOptimize} disabled={optLoading || !perfCid} style={{ flex: 1, background: optLoading ? '#166534' : C.green, color: '#fff', border: 'none', borderRadius: '7px', padding: '10px', fontSize: '13px', fontWeight: '600', cursor: optLoading || !perfCid ? 'not-allowed' : 'pointer', opacity: !perfCid ? 0.6 : 1 }}>
                  {optLoading ? 'Optimizing…' : 'Optimize'}
                </button>
              </div>

              {perfError && <div style={{ background: '#1F0A0A', border: `1px solid ${C.red}40`, borderRadius: '7px', padding: '10px 14px', marginBottom: '12px', color: C.red, fontSize: '13px' }}>{perfError}</div>}

              {perfData && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                    {[['CTR', perfData.actual_metrics?.ctr], ['CPC', perfData.actual_metrics?.cpc], ['Cost', perfData.actual_metrics?.cost],
                      ['Conversions', perfData.actual_metrics?.conversions], ['CPA', perfData.actual_metrics?.cpa], ['ROAS', perfData.actual_metrics?.roas]].map(([k, v]) => (
                      <div key={k} style={{ background: C.surface, borderRadius: '7px', padding: '9px 12px' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '10px', color: C.muted, fontWeight: '600', textTransform: 'uppercase' }}>{k}</p>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  {perfData.campaign_breakdown?.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: C.surface, borderRadius: '6px', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '600' }}>{c.campaign_name}</span>
                      <span style={{ fontSize: '11px', color: C.muted }}>{c.status} · {c.impressions} impr · {c.clicks} clk · {c.cost} · CTR {c.ctr}</span>
                    </div>
                  ))}
                  {perfData.biggest_problem && <p style={{ margin: '8px 0 0', fontSize: '12px', color: C.gold }}>⚠ {perfData.biggest_problem}</p>}
                </div>
              )}

              {optError && <div style={{ background: '#1F0A0A', border: `1px solid ${C.red}40`, borderRadius: '7px', padding: '10px 14px', marginBottom: '12px', color: C.red, fontSize: '13px' }}>{optError}</div>}

              {optData && (
                <div style={{ background: C.surface, borderRadius: '8px', padding: '14px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '700', color: C.accent }}>{optData.overall_verdict} · health {optData.health_change}</p>
                  {optData.scale_recommendations?.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.green, fontWeight: '600', textTransform: 'uppercase' }}>Scale</p>
                      {optData.scale_recommendations.map((r, i) => <p key={i} style={{ margin: '0 0 3px', fontSize: '12.5px', color: '#6EE7B7' }}>→ {r.what}: {r.why}</p>)}
                    </div>
                  )}
                  {optData.pause_recommendations?.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.red, fontWeight: '600', textTransform: 'uppercase' }}>Pause</p>
                      {optData.pause_recommendations.map((r, i) => <p key={i} style={{ margin: '0 0 3px', fontSize: '12.5px', color: '#FCA5A5' }}>→ {r.what}: {r.why}</p>)}
                    </div>
                  )}
                  {optData.this_week_actions?.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.muted, fontWeight: '600', textTransform: 'uppercase' }}>This Week</p>
                      {optData.this_week_actions.map((a, i) => <p key={i} style={{ margin: '0 0 3px', fontSize: '12.5px', color: C.text }}>{a.priority}. {a.action}</p>)}
                    </div>
                  )}
                </div>
              )}
            </Collapsible>
          </div>
        )}

        {/* ── Analysis Input Form ───────────────────────────────────────────── */}
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
          <div style={{ ...s.row, marginTop: '14px' }}>
            <div>
              <label style={s.label}>Business Type</label>
              <select style={{ ...s.input, appearance: 'none' }} value={businessType} onChange={e => setBusinessType(e.target.value)}>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Budget (₹/month) <span style={{ fontWeight: '400', textTransform: 'none', color: '#475569' }}>— optional, for simulator</span></label>
              <input type="number" style={s.input} value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 15000" min="0" />
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <label style={s.label}>Industry <span style={{ fontWeight: '400', textTransform: 'none', color: '#475569' }}>— optional, reuses Marketing Brain data if this business was analyzed there</span></label>
            <input style={s.input} value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Sports" />
          </div>
          {error && <div style={{ background: '#1F0A0A', border: `1px solid ${C.red}40`, borderRadius: '7px', padding: '10px 14px', marginTop: '14px', color: C.red, fontSize: '13px' }}>{error}</div>}
          <button style={{ ...s.btn, background: loading ? C.accentDk : C.accent, opacity: loading ? 0.8 : 1 }} onClick={analyze} disabled={loading}>
            {loading ? <span className="spin">Analyzing… (crawl + live sports data + AI…)</span> : '🏏 Analyze & Build Campaign'}
          </button>
        </div>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {data && (
          <>
            {memoryReused && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${C.accent}15`, border: `1px solid ${C.accent}40`, borderRadius: '7px', padding: '9px 14px', marginBottom: '12px' }}>
                <TrendingUp size={14} color={C.accent} />
                <p style={{ margin: 0, fontSize: '12px', color: C.accent }}>Reused Marketing Brain intelligence for this business — skipped redundant discovery.</p>
              </div>
            )}

            {warnings.length > 0 && (
              <div style={{ background: '#2D1B00', border: `1px solid ${C.gold}40`, borderRadius: '7px', padding: '9px 14px', marginBottom: '12px' }}>
                {warnings.map((w, i) => <p key={i} style={{ margin: i < warnings.length - 1 ? '0 0 4px' : 0, fontSize: '12px', color: C.gold }}>⚠ {w}</p>)}
              </div>
            )}

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
                    {cc.flags_found?.length > 0 && ` · ${cc.flags_found.length} flag(s)`}
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

            {/* Key Recommendations */}
            {(kr.top_audience || kr.top_placement || kr.timing) && (
              <div style={s.card}>
                <p style={s.secHead}>Key Recommendations</p>
                <RecCard title="🎯 Top Audience" rec={kr.top_audience} />
                <RecCard title="📍 Top Placement" rec={kr.top_placement} />
                <RecCard title="⏱️ Timing" rec={kr.timing} />
              </div>
            )}

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
                    <span style={{ fontSize: '12px', color: C.muted }}>CPC: <strong style={{ color: C.green }}>{seg.estimated_cpc}</strong></span>
                    <span style={{ fontSize: '12px', color: C.muted }}>CTR: <strong style={{ color: C.text }}>{seg.estimated_ctr}</strong></span>
                    {seg.intent_score != null && <span style={{ fontSize: '12px', color: C.muted }}>Intent Score: <strong style={{ color: C.text }}>{seg.intent_score}</strong></span>}
                    {seg.competition && <span style={{ fontSize: '12px', color: C.muted }}>Competition: <strong style={{ color: C.text }}>{seg.competition}</strong></span>}
                    {seg.expected_conversion && <span style={{ fontSize: '12px', color: C.muted }}>Conversion: <strong style={{ color: C.green }}>{seg.expected_conversion}</strong></span>}
                    {seg.confidence != null && <span style={{ fontSize: '12px', color: C.muted }}>Confidence: <strong style={{ color: C.text }}>{seg.confidence}%</strong></span>}
                  </div>
                  {seg.platform_match && (
                    <p style={{ margin: '0 0 6px', fontSize: '12px', color: C.accent }}>
                      <strong>Platform targeting:</strong> {seg.platform_match}
                    </p>
                  )}
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: C.muted, lineHeight: '1.5' }}>{seg.reason}</p>
                  {seg.evidence && <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B', lineHeight: '1.5', fontStyle: 'italic' }}>Evidence: {seg.evidence}</p>}
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
                    <p style={{ margin: 0, fontSize: '12px', color: C.accent }}>Reach: {p.estimated_reach}</p>
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
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 6 — Creative Assets */}
            <div style={s.card}>
              <p style={s.secHead}>Creative Assets</p>
              <Collapsible title="📝 Headlines (15) — max 30 chars" defaultOpen>
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
              <Collapsible title="📋 Long Headlines (5) — max 90 chars">
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
              <Collapsible title="💬 Descriptions (10) — max 90 chars">
                <div style={{ display: 'grid', gap: '8px' }}>
                  {(ca.descriptions_10 || []).map((desc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', background: C.surface, borderRadius: '6px', padding: '9px 12px', gap: '10px' }}>
                      <span style={{ fontSize: '13px', flex: 1, lineHeight: '1.5' }}>{desc}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '10px', color: desc.length > 90 ? C.red : C.muted }}>{desc.length}/90</span>
                        <CopyBtn text={desc} />
                      </div>
                    </div>
                  ))}
                </div>
              </Collapsible>
              <Collapsible title="⚡ CTA Variations (20)" badge={<span style={{ background: C.accentDk + '40', color: C.accent, fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px' }}>{(ca.ctas_20 || []).length}</span>}>
                {Object.entries(
                  (ca.ctas_20 || []).reduce((acc, c) => { (acc[c.angle] = acc[c.angle] || []).push(c.text); return acc }, {})
                ).map(([angle, texts]) => (
                  <div key={angle} style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '11px', color: C.muted, fontWeight: '600', textTransform: 'uppercase' }}>{angle.replace(/_/g, ' ')}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {texts.map((t, i) => (
                        <span key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '5px', padding: '5px 10px', fontSize: '12px' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
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
                  <p style={{ fontSize: '12px', color: C.red, fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Issues</p>
                  {lp.issues.map((iss, i) => <p key={i} style={{ margin: '0 0 5px', fontSize: '13px', color: '#FCA5A5' }}>⚠ {iss}</p>)}
                </div>
              )}
              {lp.fixes?.length > 0 && (
                <div>
                  <p style={{ fontSize: '12px', color: C.green, fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Fixes</p>
                  {lp.fixes.map((fix, i) => <p key={i} style={{ margin: '0 0 5px', fontSize: '13px', color: '#6EE7B7' }}>→ {fix}</p>)}
                </div>
              )}
              {(!lp.issues?.length && !lp.fixes?.length) && (
                <p style={{ color: C.green, fontSize: '14px' }}>✅ Landing page looks good.</p>
              )}
              {(lp.above_fold_assessment || lp.whatsapp_cta_visibility || lp.color_contrast_readability || lp.button_placement || lp.mobile_safe_layout) && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${C.border}` }}>
                  {[
                    ['Above the fold', lp.above_fold_assessment], ['WhatsApp CTA visibility', lp.whatsapp_cta_visibility],
                    ['Color/contrast/readability', lp.color_contrast_readability], ['Button placement', lp.button_placement],
                    ['Mobile-safe layout', lp.mobile_safe_layout],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <p key={k} style={{ margin: '0 0 6px', fontSize: '12.5px', color: C.muted, lineHeight: '1.5' }}><strong style={{ color: C.text }}>{k}:</strong> {v}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Sports Calendar */}
            <div style={s.card}>
              <Collapsible title="📅 Sports Calendar" defaultOpen>
                {sc.events?.length > 0 ? (
                  sc.events.map((ev, i) => (
                    <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{ev.name}</p>
                        <span style={{ fontSize: '12px', color: C.accent, fontWeight: '600' }}>{ev.date}</span>
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: '12.5px', color: C.muted }}><strong>Timing window:</strong> {ev.timing_window}</p>
                      <p style={{ margin: 0, fontSize: '12.5px', color: C.green }}><strong>Budget/creative:</strong> {ev.budget_creative_recommendation}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>No live calendar data available for this window.</p>
                )}
              </Collapsible>
            </div>

            {/* Campaign Simulator — formula chain */}
            <div style={s.card}>
              <Collapsible title="🔮 Campaign Simulator" defaultOpen>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: C.muted }}>Budget used: <strong style={{ color: C.text }}>{csim.budget_used}</strong></p>
                {csim.formula_chain?.length > 0 ? (
                  <div style={{ marginBottom: '12px' }}>
                    {csim.formula_chain.map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: i < csim.formula_chain.length - 1 ? '4px' : 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: C.accentDk, color: '#fff', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                          {i < csim.formula_chain.length - 1 && <div style={{ width: '2px', flex: 1, minHeight: '16px', background: C.border, margin: '2px 0' }} />}
                        </div>
                        <div style={{ background: C.surface, borderRadius: '7px', padding: '9px 14px', flex: 1, marginBottom: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: C.text }}>{step.step}</p>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: C.accent }}>{step.value_range}</p>
                          </div>
                          <p style={{ margin: '3px 0 0', fontSize: '11px', color: C.muted, fontFamily: 'monospace' }}>{step.formula}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    {[
                      ['Reach', csim.reach], ['Clicks', csim.clicks], ['CTR', csim.ctr],
                      ['Joins / Installs', csim.joins_installs], ['Cost per Join/Install', csim.cost_per_join_install], ['Expected ROI', csim.expected_roi],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} style={{ background: C.surface, borderRadius: '7px', padding: '10px 14px' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '11px', color: C.muted, fontWeight: '600', textTransform: 'uppercase' }}>{k}</p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{v.range}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '10px', color: C.muted }}>{v.confidence}% confidence</p>
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B', fontStyle: 'italic' }}>{csim.disclaimer || 'These are forecasts based on benchmarks, not guarantees.'}</p>
              </Collapsible>
            </div>

            {/* Media Plan */}
            {mp.channels?.length > 0 && (
              <div style={s.card}>
                <Collapsible title="💰 Media Plan" defaultOpen>
                  <p style={{ margin: '0 0 12px', fontSize: '12px', color: C.muted }}>Total budget: <strong style={{ color: C.text }}>{mp.total_budget}</strong></p>
                  <div style={{ display: 'flex', height: '28px', borderRadius: '6px', overflow: 'hidden', marginBottom: '14px' }}>
                    {mp.channels.map((ch, i) => (
                      <div key={i} title={`${ch.channel}: ${ch.amount}`} style={{ width: `${ch.pct}%`, background: [C.accent, C.green, C.gold, '#A78BFA', '#F472B6', '#38BDF8'][i % 6], minWidth: ch.pct > 0 ? '2px' : 0 }} />
                    ))}
                  </div>
                  {mp.channels.map((ch, i) => (
                    <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: [C.accent, C.green, C.gold, '#A78BFA', '#F472B6', '#38BDF8'][i % 6], flexShrink: 0 }} />
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{ch.channel}</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: C.text }}>{ch.amount} <span style={{ fontSize: '11px', color: C.muted, fontWeight: '400' }}>({ch.pct}%)</span></p>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11.5px', color: C.muted }}>Reach: <strong style={{ color: C.text }}>{ch.expected_reach}</strong></span>
                        <span style={{ fontSize: '11.5px', color: C.muted }}>Clicks: <strong style={{ color: C.text }}>{ch.expected_clicks}</strong></span>
                        <span style={{ fontSize: '11.5px', color: C.muted }}>Joins: <strong style={{ color: C.green }}>{ch.expected_joins}</strong></span>
                        <span style={{ fontSize: '11.5px', color: C.muted }}>CPA: <strong style={{ color: C.text }}>{ch.expected_cpa}</strong></span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: C.muted, lineHeight: '1.5' }}>{ch.why}</p>
                    </div>
                  ))}
                </Collapsible>
              </div>
            )}

            {/* Placement Inventory */}
            {pinv.length > 0 && (
              <div style={s.card}>
                <Collapsible title="📱 Placement Inventory" badge={<span style={{ background: C.accentDk + '40', color: C.accent, fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px' }}>{pinv.length}</span>}>
                  {pinv.map((p, i) => (
                    <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{p.platform}</p>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <PriorityBadge priority={p.priority} />
                          <span style={{ fontSize: '11px', color: C.muted }}>Suitability: <strong style={{ color: C.text }}>{p.suitability_score}</strong></span>
                        </div>
                      </div>
                      <p style={{ margin: '0 0 6px', fontSize: '12px', color: C.muted }}>{p.audience_type}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                        {[['CPM', p.estimated_cpm], ['CPC', p.estimated_cpc], ['CTR', p.expected_ctr],
                          ['Join Rate', p.expected_join_rate], ['Reach', p.estimated_reach], ['Competition', p.competition]].map(([k, v]) => (
                          <div key={k} style={{ background: C.surface, borderRadius: '5px', padding: '6px 8px' }}>
                            <p style={{ margin: '0 0 2px', fontSize: '9.5px', color: C.muted, textTransform: 'uppercase', fontWeight: '600' }}>{k}</p>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>{v}</p>
                          </div>
                        ))}
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: '11.5px', color: C.muted }}>Device split: {p.device_split} · Traffic: {p.traffic_quality}</p>
                      <p style={{ margin: '0 0 4px', fontSize: '11.5px', color: C.accent }}>Creative: {p.recommended_creative_type} — {(p.banner_sizes || []).join(', ')}</p>
                    </div>
                  ))}
                </Collapsible>
              </div>
            )}

            {/* YouTube Inventory */}
            {yinv.length > 0 && (
              <div style={s.card}>
                <Collapsible title="▶️ YouTube Inventory" badge={<span style={{ background: C.accentDk + '40', color: C.accent, fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px' }}>{yinv.length}</span>}>
                  {yinv.map((ch, i) => (
                    <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{ch.channel}</p>
                        <span style={{ fontSize: '11px', color: C.accent, fontWeight: '600', textTransform: 'uppercase' }}>{ch.ad_type_fit}</span>
                      </div>
                      <p style={{ margin: '0 0 6px', fontSize: '12px', color: C.muted }}>{ch.audience}</p>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11.5px', color: C.muted }}>Reach: <strong style={{ color: C.text }}>{ch.estimated_reach}</strong></span>
                        <span style={{ fontSize: '11.5px', color: C.muted }}>CPM: <strong style={{ color: C.text }}>{ch.expected_cpm}</strong></span>
                        <span style={{ fontSize: '11.5px', color: C.muted }}>CTR: <strong style={{ color: C.text }}>{ch.expected_ctr}</strong></span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: C.muted, lineHeight: '1.5' }}>{ch.creative_recommendation}</p>
                    </div>
                  ))}
                </Collapsible>
              </div>
            )}

            {/* Design Recommendations */}
            {Object.keys(dr).length > 0 && (
              <div style={s.card}>
                <Collapsible title="🎨 Design Recommendations">
                  {dr.color_palette?.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      {dr.color_palette.map((c, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: c.hex, border: `1px solid ${C.border}`, marginBottom: '4px' }} />
                          <p style={{ margin: 0, fontSize: '10px', color: C.muted }}>{c.name}</p>
                          <p style={{ margin: 0, fontSize: '9.5px', color: '#64748B', fontFamily: 'monospace' }}>{c.hex}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {[
                    ['Hero Image Concept', dr.hero_image_concept], ['Background', dr.background], ['Visual Hierarchy', dr.visual_hierarchy],
                    ['Banner Layout', dr.banner_layout], ['Button Style', dr.button_style], ['Typography', dr.typography],
                    ['Mobile Safe Area', dr.mobile_safe_area_notes],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <p key={k} style={{ margin: '0 0 8px', fontSize: '12.5px', color: C.muted, lineHeight: '1.5' }}><strong style={{ color: C.text }}>{k}:</strong> {v}</p>
                  ))}
                </Collapsible>
              </div>
            )}

            {/* Competitor Watch */}
            {cw.length > 0 && (
              <div style={s.card}>
                <Collapsible title="🔍 Competitor Watch">
                  {cw.map((comp, i) => (
                    <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '8px' }}>
                      <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '700' }}>{comp.name}</p>
                      <p style={{ margin: '0 0 4px', fontSize: '12.5px', color: C.muted }}><strong>Creative style:</strong> {comp.creative_style}</p>
                      <p style={{ margin: '0 0 4px', fontSize: '12.5px', color: C.muted }}><strong>Offers:</strong> {comp.offers}</p>
                      <p style={{ margin: '0 0 8px', fontSize: '12.5px', color: C.muted }}><strong>Growth tactics:</strong> {comp.growth_tactics}</p>
                      {comp.differentiation_recommendations?.length > 0 && (
                        <div>
                          <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.green, fontWeight: '600', textTransform: 'uppercase' }}>How to differentiate</p>
                          {comp.differentiation_recommendations.map((r, j) => <p key={j} style={{ margin: '0 0 3px', fontSize: '12.5px', color: '#6EE7B7' }}>→ {r}</p>)}
                        </div>
                      )}
                    </div>
                  ))}
                </Collapsible>
              </div>
            )}

            {/* Business Summary */}
            {d.business_summary && (
              <div style={{ ...s.card, background: C.surface }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <p style={{ ...s.secHead, marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Business Summary</p>
                  {bs.business_dna_score != null && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: `3px solid ${bs.business_dna_score >= 70 ? C.green : bs.business_dna_score >= 40 ? C.gold : C.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800' }}>{bs.business_dna_score}</span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '10px', color: C.muted }}>DNA Score</p>
                    </div>
                  )}
                </div>
                <div style={s.row}>
                  {[['Offer', bs.offer], ['Target User', bs.target_user], ['Primary Conversion', bs.primary_conversion]].map(([k, v]) => (
                    <div key={k}>
                      <p style={{ margin: '0 0 3px', fontSize: '11px', color: C.muted, fontWeight: '600', textTransform: 'uppercase' }}>{k}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: C.text }}>{v}</p>
                    </div>
                  ))}
                </div>
                {bs.business_dna_reasoning && (
                  <p style={{ margin: '12px 0 0', fontSize: '12.5px', color: C.muted, lineHeight: '1.5' }}>{bs.business_dna_reasoning}</p>
                )}
              </div>
            )}

            {/* ── Launch Campaign ───────────────────────────────────────────── */}
            <div style={{ ...s.card, border: `1px solid ${C.green}30`, background: '#052e1610' }}>
              <p style={{ ...s.secHead, color: C.green, borderColor: `${C.green}30` }}>🚀 Launch Campaign on Google Ads</p>

              {accounts.length === 0 ? (
                <p style={{ color: C.muted, fontSize: '13px' }}>Add an ad account above to enable campaign launch.</p>
              ) : (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={s.label}>Select Ad Account</label>
                    <select
                      value={selectedCid}
                      onChange={e => setSelectedCid(e.target.value)}
                      style={{ ...s.input, appearance: 'none' }}
                    >
                      <option value="">— Select account —</option>
                      {accounts.map(a => (
                        <option key={a.customer_id} value={a.customer_id}>
                          {a.account_name} ({a.customer_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ background: C.surface, borderRadius: '8px', padding: '12px 14px', marginBottom: '14px', fontSize: '12px', color: C.muted, lineHeight: '1.7' }}>
                    <strong style={{ color: C.text }}>What will be created:</strong><br />
                    Campaign: <strong style={{ color: C.text }}>{cs.campaign_name || 'Cricket Community Campaign'}</strong><br />
                    Type: Display · Status: <strong style={{ color: C.gold }}>PAUSED</strong> (safe to review before going live)<br />
                    Budget: <strong style={{ color: C.text }}>{cs.budget_daily || '₹500'}/day</strong><br />
                    <span style={{ color: C.yellow }}>⚠ Images must be added in Google Ads dashboard — text assets will be ready.</span>
                  </div>

                  <button
                    onClick={handlePush} disabled={pushLoading || !selectedCid}
                    style={{ background: pushLoading ? '#166534' : C.green, color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: pushLoading || !selectedCid ? 'not-allowed' : 'pointer', opacity: !selectedCid ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {pushLoading ? <span className="spin">Creating campaign…</span> : '🏏 Launch Campaign'}
                  </button>

                  {/* Success */}
                  {pushResult && (
                    <div style={{ marginTop: '14px', background: '#052e16', border: `1px solid ${C.green}40`, borderRadius: '8px', padding: '16px' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: '700', color: C.green }}>✅ Campaign Created!</p>
                      <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.muted }}>Campaign ID: <strong style={{ color: C.text, fontFamily: 'monospace' }}>{pushResult.campaign_id}</strong></p>
                      <p style={{ margin: '0 0 4px', fontSize: '12px', color: C.muted }}>Ad Group ID: <strong style={{ color: C.text, fontFamily: 'monospace' }}>{pushResult.ad_group_id}</strong></p>
                      <p style={{ margin: '0 0 12px', fontSize: '12px', color: C.muted }}>Status: <strong style={{ color: C.gold }}>PAUSED</strong> — add image assets then enable</p>
                      {pushResult.note && <p style={{ margin: '0 0 12px', fontSize: '12px', color: C.yellow }}>ℹ {pushResult.note}</p>}
                      <a href={pushResult.google_ads_dashboard} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#16A34A', color: '#fff', padding: '9px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                        <ExternalLink size={13} /> Open in Google Ads
                      </a>
                    </div>
                  )}

                  {/* Error */}
                  <ApiError err={pushError} />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
