import { BACKEND, apiFetch } from './lib/api'
import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import {
  Users, Bot, CheckCircle, MessageCircle,
  TrendingUp, Activity, Eye, MousePointerClick, IndianRupee, Percent, Zap, RefreshCw,
  Check, X, RotateCcw, Sliders, ChevronDown, ChevronUp, TrendingDown, AlertTriangle,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useToast } from './ToastContext'

const INK      = '#0B0B0D'
const BONE     = '#EDEAE3'
const GOLD     = '#C9A227'
const SLATE    = '#23242B'
const SLATE_L  = '#2E2F38'
const SLATE_M  = '#1A1B22'
const MUTED    = '#8A8A92'
const GREEN    = '#3FA66B'
const RED      = '#C4453A'

const FONT_DISPLAY = "'Fraunces', Georgia, serif"
const FONT_BODY    = "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
const FONT_MONO    = "'IBM Plex Mono', 'Menlo', monospace"

// ── Count-up hook ──────────────────────────────────────────────────────────
function useCountUp(target, duration = 900, enabled = true) {
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    if (!enabled || target === 0) { setCount(target); return }
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * target))
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, enabled])
  return count
}

// ── Animated KPI number (mono font) ───────────────────────────────────────
function AnimatedNumber({ value, gold, size }) {
  const n = useCountUp(value, 900, true)
  return (
    <p style={{
      fontSize: size, fontWeight: '600', margin: '0 0 5px 0',
      letterSpacing: '-1.5px', color: gold ? GOLD : BONE, lineHeight: 1,
      fontFamily: FONT_MONO,
    }}>
      {n}
    </p>
  )
}

// ── Animated decimal number (mono font) ───────────────────────────────────
// Post-audit fix: Conversions showed "0.0" (and any whole count, e.g. "3.0")
// because toFixed(decimals) applied unconditionally — Conversions can be a
// genuine fraction (cross-device attribution) so the decimal formatter is
// still correct in general, it just needs a whole-number case. Opt-in via
// dropDecimalIfWhole so Cost/CTR/Avg CPC (which read naturally with a fixed
// decimal count even at a whole value, e.g. "₹5.00") are unaffected.
function AnimatedDecimal({ value, prefix = '', suffix = '', decimals = 2, size = '28px', gold = false, dropDecimalIfWhole = false }) {
  const int = useCountUp(Math.round(value * 100), 900, true)
  const rounded = int / 100
  const display = (dropDecimalIfWhole && Number.isInteger(rounded)) ? String(rounded) : rounded.toFixed(decimals)
  return (
    <p style={{
      fontSize: size, fontWeight: '600', margin: '0 0 5px 0',
      letterSpacing: '-1px', color: gold ? GOLD : BONE, lineHeight: 1,
      fontFamily: FONT_MONO,
    }}>
      {prefix}{display}{suffix}
    </p>
  )
}

// ── Skeleton shimmer block ─────────────────────────────────────────────────
function Skeleton({ w = '100%', h = '16px', radius = '4px', style = {} }) {
  return (
    <div className="skeleton" style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...style }} />
  )
}

// ── Animated bar chart ─────────────────────────────────────────────────────
function BarChart({ sources, maxSource, visible }) {
  return sources.map((s, i) => (
    <div key={s.name} style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      marginBottom: i < sources.length - 1 ? '13px' : 0,
    }}>
      <span style={{ fontSize: '12px', color: MUTED, fontWeight: '500', width: '64px', flexShrink: 0, letterSpacing: '-0.1px', fontFamily: FONT_BODY }}>
        {s.name}
      </span>
      <div style={{ flex: 1, background: SLATE_L, borderRadius: '2px', height: '4px', overflow: 'hidden' }}>
        <div style={{
          width: visible ? `${(s.count / maxSource) * 100}%` : '0%',
          height: '100%',
          background: `linear-gradient(90deg, ${GOLD}, #E8C84A)`,
          borderRadius: '2px',
          transition: `width 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${i * 120}ms`,
        }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: '600', color: BONE, letterSpacing: '-0.5px', width: '20px', textAlign: 'right', flexShrink: 0, fontFamily: FONT_MONO }}>
        {s.count}
      </span>
    </div>
  ))
}

// ── "Why isn't this campaign delivering?" panel ────────────────────────────
// Real reported case: a live Search campaign running 3 days at 78
// impressions/5 clicks/₹4.39 spend/0 conversions, and the dashboard could
// show the numbers but never say why. Renders GET /google-ads/campaign-
// diagnostics/{id}'s structured issues (severity + plain-English fix,
// grounded in Google's own campaign.primary_status_reasons and impression-
// share-lost metrics) — never a guess generated in this component.
const SEVERITY_META = {
  high:   { color: RED,   label: 'High' },
  medium: { color: GOLD,  label: 'Medium' },
  low:    { color: MUTED, label: 'Low' },
}

function CampaignDiagnosticsPanel({ loading, error, data }) {
  const boxStyle = {
    background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px',
    padding: '14px 16px', fontFamily: FONT_BODY,
  }
  if (loading) {
    return <div style={boxStyle}><p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Checking campaign status, bidding, keywords, ads, and conversion tracking...</p></div>
  }
  if (error) {
    return <div style={boxStyle}><p style={{ margin: 0, fontSize: '12px', color: RED }}>{error}</p></div>
  }
  if (!data) return null

  const { campaign, budget, bidding_strategy, metrics, issues } = data
  return (
    <div style={boxStyle}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '12px', fontSize: '11px', color: MUTED, fontFamily: FONT_MONO }}>
        <span>Status: <b style={{ color: BONE }}>{campaign.status}</b></span>
        <span>Serving: <b style={{ color: BONE }}>{campaign.serving_status}</b></span>
        <span>Primary: <b style={{ color: BONE }}>{campaign.primary_status}</b></span>
        <span>Bidding: <b style={{ color: BONE }}>{bidding_strategy.type}</b></span>
        {budget.amount_inr != null && <span>Daily budget: <b style={{ color: BONE }}>₹{budget.amount_inr}</b></span>}
        {metrics.search_impression_share_pct != null && <span>Impr. share: <b style={{ color: BONE }}>{metrics.search_impression_share_pct}%</b></span>}
        {metrics.search_rank_lost_impression_share_pct != null && <span>Lost to rank: <b style={{ color: BONE }}>{metrics.search_rank_lost_impression_share_pct}%</b></span>}
        {metrics.search_budget_lost_impression_share_pct != null && <span>Lost to budget: <b style={{ color: BONE }}>{metrics.search_budget_lost_impression_share_pct}%</b></span>}
      </div>

      {issues.length === 0 ? (
        <p style={{ margin: 0, fontSize: '12px', color: GREEN }}>No configuration issues found — status is eligible/serving with real keywords, ads, and conversion tracking in place.</p>
      ) : (
        issues.map((issue, i) => {
          const meta = SEVERITY_META[issue.severity] || SEVERITY_META.medium
          return (
            <div key={i} style={{ padding: '9px 0', borderTop: i > 0 ? `1px solid ${SLATE_L}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span style={{ fontSize: '9px', fontWeight: '700', color: meta.color, border: `1px solid ${meta.color}`, borderRadius: '10px', padding: '1px 7px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{meta.label}</span>
                <span style={{ fontSize: '12.5px', fontWeight: '600', color: BONE }}>{issue.title}</span>
              </div>
              <p style={{ margin: '0 0 3px', fontSize: '12px', color: MUTED, lineHeight: 1.45 }}>{issue.detail}</p>
              <p style={{ margin: 0, fontSize: '12px', color: BONE }}><b style={{ color: GOLD }}>Fix: </b>{issue.fix}</p>
            </div>
          )
        })
      )}
    </div>
  )
}

// ── Google Ads Optimizer: Recommendations section (Phase 1, approval-only) ──
// Nothing here ever changes a live campaign without an explicit click on
// "Approve" — the backend re-checks guardrails again at that exact moment
// (see /google-ads/recommendations/{id}/approve), this UI just surfaces
// what the daily job found and lets a human decide.
const REC_TYPE_LABELS = {
  raise_cpc: 'Raise max CPC', raise_budget: 'Raise daily budget', add_phrase_match: 'Add phrase-match variant',
  add_negative_keyword: 'Add negative keyword', fix_disapproved_ad: 'Disapproved ad(s)',
  fix_conversion_tracking: 'Missing conversion tracking', under_delivery_alert: 'Under-delivery',
  reconnect_google_ads: 'Reconnect Google Ads',
}
const REC_SEVERITY_META = { high: { color: RED, label: 'High' }, medium: { color: GOLD, label: 'Medium' }, low: { color: MUTED, label: 'Low' } }
const REC_STATUS_META = {
  pending: { color: MUTED, label: 'Pending' }, approved: { color: GOLD, label: 'Approving...' },
  applied: { color: GREEN, label: 'Applied' }, rejected: { color: MUTED, label: 'Rejected' },
  reverted: { color: MUTED, label: 'Reverted' }, failed: { color: RED, label: 'Failed' },
}
const _GADS_ALERT_ONLY_TYPES = new Set(['fix_disapproved_ad', 'fix_conversion_tracking', 'under_delivery_alert', 'reconnect_google_ads'])

function fmtInr(micros) {
  if (micros === null || micros === undefined) return '—'
  return `₹${(micros / 1_000_000).toFixed(2)}`
}

function RecommendationCard({ rec, busy, onApprove, onReject, onRevert }) {
  const severity = REC_SEVERITY_META[rec.severity] || REC_SEVERITY_META.medium
  const status = REC_STATUS_META[rec.status] || REC_STATUS_META.pending
  const isAlertOnly = _GADS_ALERT_ONLY_TYPES.has(rec.type)
  return (
    <div style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '13px 15px', marginBottom: '8px', fontFamily: FONT_BODY }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '9px', fontWeight: '700', color: severity.color, border: `1px solid ${severity.color}`, borderRadius: '10px', padding: '1px 7px', textTransform: 'uppercase' }}>{severity.label}</span>
            <span style={{ fontSize: '12.5px', fontWeight: '600', color: BONE }}>{REC_TYPE_LABELS[rec.type] || rec.type}</span>
            <span style={{ fontSize: '10.5px', color: MUTED }}>· {rec.campaign_name}</span>
            <span style={{ fontSize: '10px', fontWeight: '600', color: status.color }}>{status.label}</span>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: MUTED, lineHeight: 1.45 }}>{rec.reason}</p>
          {!isAlertOnly && (rec.type === 'raise_cpc' || rec.type === 'raise_budget') && (
            <p style={{ margin: 0, fontSize: '11.5px', color: BONE, fontFamily: FONT_MONO }}>
              {fmtInr(Number(rec.current_value))} → {fmtInr(Number(rec.proposed_value))}
            </p>
          )}
          {rec.type === 'add_negative_keyword' && (
            <p style={{ margin: 0, fontSize: '11.5px', color: BONE, fontFamily: FONT_MONO }}>"{rec.proposed_value}"</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {rec.status === 'pending' && (
            <>
              <button disabled={busy} onClick={() => onApprove(rec.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: GREEN, color: '#0B0B0D', border: 'none', borderRadius: '5px', padding: '5px 10px', fontSize: '11px', fontWeight: '700', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}>
                <Check size={11} /> Approve
              </button>
              <button disabled={busy} onClick={() => onReject(rec.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', color: MUTED, border: `1px solid ${SLATE_L}`, borderRadius: '5px', padding: '5px 10px', fontSize: '11px', fontWeight: '600', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}>
                <X size={11} /> Reject
              </button>
            </>
          )}
          {rec.status === 'applied' && !isAlertOnly && (
            <button disabled={busy} onClick={() => onRevert(rec.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', color: RED, border: `1px solid ${RED}`, borderRadius: '5px', padding: '5px 10px', fontSize: '11px', fontWeight: '600', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}>
              <RotateCcw size={11} /> Revert
            </button>
          )}
        </div>
      </div>
      {rec.outcome && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${SLATE_L}`, display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {rec.outcome.worsened && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: '700', color: RED }}>
              <AlertTriangle size={11} /> Results worsened
            </span>
          )}
          <span style={{ fontSize: '10.5px', color: MUTED, fontFamily: FONT_MONO }}>
            Clicks {rec.outcome.clicks_change_pct != null ? `${rec.outcome.clicks_change_pct > 0 ? '+' : ''}${rec.outcome.clicks_change_pct}%` : 'n/a'}
          </span>
          <span style={{ fontSize: '10.5px', color: MUTED, fontFamily: FONT_MONO }}>
            CPC {fmtInr(rec.outcome.cpc_before_inr * 1_000_000)} → {fmtInr(rec.outcome.cpc_after_inr * 1_000_000)}
          </span>
          <span style={{ fontSize: '10.5px', color: MUTED, fontFamily: FONT_MONO }}>
            Conversions {rec.outcome.conversions_change > 0 ? '+' : ''}{rec.outcome.conversions_change}
          </span>
        </div>
      )}
    </div>
  )
}

function AutomationGuardrails({ settings, onSave, saving }) {
  const [open, setOpen] = useState(false)
  const [cpcCap, setCpcCap] = useState('')
  const [budgetCap, setBudgetCap] = useState('')
  const [stepPct, setStepPct] = useState('')
  useEffect(() => {
    if (settings) {
      setCpcCap(String(settings.max_cpc_cap_micros / 1_000_000))
      setBudgetCap(String(settings.max_daily_budget_cap_micros / 1_000_000))
      setStepPct(String(settings.max_bid_change_pct))
    }
  }, [settings])
  if (!settings) return null
  return (
    <div style={{ marginBottom: '10px' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: MUTED, fontSize: '11.5px', fontWeight: '600', cursor: 'pointer', padding: '4px 0', fontFamily: FONT_BODY }}>
        <Sliders size={12} /> Guardrails {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '14px', marginTop: '6px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ fontSize: '10px', color: MUTED, display: 'block', marginBottom: '3px' }}>Max CPC cap (₹)</label>
              <input type="number" value={cpcCap} onChange={e => setCpcCap(e.target.value)} style={{ width: '100%', background: SLATE, border: `1px solid ${SLATE_L}`, borderRadius: '4px', padding: '6px 8px', color: BONE, fontSize: '12px', fontFamily: FONT_MONO, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: MUTED, display: 'block', marginBottom: '3px' }}>Max daily budget cap (₹)</label>
              <input type="number" value={budgetCap} onChange={e => setBudgetCap(e.target.value)} style={{ width: '100%', background: SLATE, border: `1px solid ${SLATE_L}`, borderRadius: '4px', padding: '6px 8px', color: BONE, fontSize: '12px', fontFamily: FONT_MONO, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: MUTED, display: 'block', marginBottom: '3px' }}>Max change per step (%)</label>
              <input type="number" value={stepPct} onChange={e => setStepPct(e.target.value)} style={{ width: '100%', background: SLATE, border: `1px solid ${SLATE_L}`, borderRadius: '4px', padding: '6px 8px', color: BONE, fontSize: '12px', fontFamily: FONT_MONO, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
              <input
                type="checkbox" checked={!!settings.automation_paused}
                onChange={e => onSave({ automation_paused: e.target.checked })}
                style={{ width: '14px', height: '14px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11.5px', color: settings.automation_paused ? RED : MUTED, fontWeight: settings.automation_paused ? '700' : '500' }}>
                Pause all automation (no new recommendations, approvals blocked)
              </span>
            </label>
            <button
              disabled={saving}
              onClick={() => onSave({ max_cpc_cap_inr: Number(cpcCap), max_daily_budget_cap_inr: Number(budgetCap), max_bid_change_pct: Number(stepPct) })}
              style={{ background: GOLD, color: '#0B0D12', border: 'none', borderRadius: '5px', padding: '6px 14px', fontSize: '11.5px', fontWeight: '700', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RecommendationsSection({ recommendations, loading, error, settings, busyId, onApprove, onReject, onRevert, onSaveSettings, savingSettings }) {
  if (loading && recommendations.length === 0) {
    return <p style={{ fontSize: '12.5px', color: MUTED, fontFamily: FONT_BODY }}>Loading recommendations...</p>
  }
  if (error) {
    return <p style={{ fontSize: '12.5px', color: RED, fontFamily: FONT_BODY }}>{error}</p>
  }
  const pending = recommendations.filter(r => r.status === 'pending')
  const others = recommendations.filter(r => r.status !== 'pending')
  return (
    <div>
      <AutomationGuardrails settings={settings} onSave={onSaveSettings} saving={savingSettings} />
      {recommendations.length === 0 ? (
        <p style={{ fontSize: '12.5px', color: MUTED, fontFamily: FONT_BODY }}>
          No recommendations yet — the daily optimizer job hasn't run, or found nothing to flag.
        </p>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: '0 0 8px', fontFamily: FONT_BODY }}>
                Pending ({pending.length})
              </p>
              {pending.map(rec => (
                <RecommendationCard key={rec.id} rec={rec} busy={busyId === rec.id} onApprove={onApprove} onReject={onReject} onRevert={onRevert} />
              ))}
            </>
          )}
          {others.length > 0 && (
            <>
              <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: '14px 0 8px', fontFamily: FONT_BODY }}>
                History
              </p>
              {others.map(rec => (
                <RecommendationCard key={rec.id} rec={rec} busy={busyId === rec.id} onApprove={onApprove} onReject={onReject} onRevert={onRevert} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
function Dashboard() {
  const toast = useToast()

  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768)
  const [stats, setStats]         = useState(null)
  const [analyses, setAnalyses]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [attempt, setAttempt]     = useState(1)
  const [barsVisible, setBarsVisible] = useState(false)
  const [cardsIn, setCardsIn]     = useState(false)
  const [gAdsDays, setGAdsDays]       = useState(30)
  const [gAds, setGAds]               = useState(null)
  const [gAdsCampaigns, setGAdsCampaigns] = useState(null)
  const [gAdsDaily, setGAdsDaily]     = useState(null)
  const [gAdsLoading, setGAdsLoading] = useState(true)
  const [gAdsError, setGAdsError]     = useState(false)
  const [gAdsUnauth, setGAdsUnauth]   = useState(false)
  const [gAdsWaking, setGAdsWaking]   = useState(false)
  const [gAdsRefreshing, setGAdsRefreshing] = useState(false)
  const [gAdsTick, setGAdsTick]             = useState(0)
  // "Why isn't this campaign delivering?" panel — real reported case: a
  // live Search campaign running 3 days at 78 impressions/5 clicks/₹4.39
  // spend with no way for the dashboard to say why. Keyed by campaign_id
  // so multiple campaigns can be inspected independently without refetching.
  const [openDiagnosticsId, setOpenDiagnosticsId] = useState(null)
  const [diagnosticsById, setDiagnosticsById] = useState({})
  const [diagnosticsLoadingId, setDiagnosticsLoadingId] = useState(null)
  const [diagnosticsErrorById, setDiagnosticsErrorById] = useState({})

  // Google Ads Optimizer: Recommendations — Phase 1, approval-only.
  const [gadsRecs, setGadsRecs] = useState([])
  const [gadsRecsLoading, setGadsRecsLoading] = useState(true)
  const [gadsRecsError, setGadsRecsError] = useState('')
  const [gadsSettings, setGadsSettings] = useState(null)
  const [gadsSettingsSaving, setGadsSettingsSaving] = useState(false)
  const [gadsRecBusyId, setGadsRecBusyId] = useState(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const EMPTY = { total: 0, whatsapp: 0, website: 0, form: 0, unknown: 0, new: 0, converted: 0 }

    async function fetchWithTimeout(url, ms = 12000) {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), ms)
      try { return await apiFetch(url, { signal: ctrl.signal }) }
      finally { clearTimeout(timer) }
    }

    async function tryLoad(n = 1) {
      setAttempt(n)
      try {
        const [sr, ar] = await Promise.all([
          fetchWithTimeout(`${BACKEND}/leads/stats`),
          fetchWithTimeout(`${BACKEND}/analyses`),
        ])
        setStats(await sr.json())
        setAnalyses((await ar.json()).analyses || [])
        setLoading(false)
      } catch {
        if (n < 3) setTimeout(() => tryLoad(n + 1), 5000)
        else { setStats(EMPTY); setLoading(false) }
      }
    }

    const fallback = setTimeout(() => { setStats(p => p ?? EMPTY); setLoading(false) }, 8000)
    tryLoad().finally(() => clearTimeout(fallback))
    return () => clearTimeout(fallback)
  }, [])

  const isFirstGAdsLoad = useRef(true)
  useEffect(() => {
    const isFirstLoad = isFirstGAdsLoad.current
    isFirstGAdsLoad.current = false
    if (isFirstLoad) { setGAdsLoading(true) } else { setGAdsRefreshing(true) }
    const wakingTimer = isFirstLoad ? setTimeout(() => setGAdsWaking(true), 5000) : null
    const ctrl = new AbortController()
    const timeout = setTimeout(() => ctrl.abort(), 70000)

    async function run() {
      setGAdsUnauth(false)
      const _apiKey = import.meta.env.VITE_ADSOH_API_KEY || ''
      const _authH  = _apiKey ? { 'X-API-Key': _apiKey } : {}
      try {
        const [perfRes, campRes, dailyRes] = await Promise.all([
          apiFetch(`${BACKEND}/google-ads/performance?days=${gAdsDays}`, { signal: ctrl.signal, headers: _authH }),
          apiFetch(`${BACKEND}/google-ads/campaigns?days=${gAdsDays}`,   { signal: ctrl.signal, headers: _authH }),
          apiFetch(`${BACKEND}/google-ads/daily?days=${gAdsDays}`,       { signal: ctrl.signal, headers: _authH }),
        ])
        if (perfRes.status === 401) { setGAdsUnauth(true); setGAdsError(true); return }
        const [perf, camp, daily] = await Promise.all([perfRes.json(), campRes.json(), dailyRes.json()])
        if (perf.success) { setGAds(perf); setGAdsError(false) } else setGAdsError(true)
        if (camp.success)  setGAdsCampaigns(camp.campaigns)
        if (daily.success) setGAdsDaily(daily.daily)
      } catch { setGAdsError(true) }
      finally {
        if (wakingTimer) clearTimeout(wakingTimer)
        clearTimeout(timeout)
        setGAdsLoading(false)
        setGAdsWaking(false)
        setGAdsRefreshing(false)
      }
    }

    run()
    return () => ctrl.abort()
  }, [gAdsDays, gAdsTick])

  async function toggleDiagnostics(campaignId) {
    if (openDiagnosticsId === campaignId) { setOpenDiagnosticsId(null); return }
    setOpenDiagnosticsId(campaignId)
    if (diagnosticsById[campaignId]) return  // already fetched — expand only
    setDiagnosticsLoadingId(campaignId)
    setDiagnosticsErrorById(prev => ({ ...prev, [campaignId]: '' }))
    try {
      const res = await apiFetch(`${BACKEND}/google-ads/campaign-diagnostics/${campaignId}?days=${gAdsDays}`, { timeoutMs: 30000 })
      const data = await res.json()
      if (data.success) {
        setDiagnosticsById(prev => ({ ...prev, [campaignId]: data }))
      } else {
        setDiagnosticsErrorById(prev => ({ ...prev, [campaignId]: data.error || data.detail || 'Could not diagnose this campaign.' }))
      }
    } catch (err) {
      setDiagnosticsErrorById(prev => ({ ...prev, [campaignId]: err?.message || 'Backend se connect nahi ho paya.' }))
    }
    setDiagnosticsLoadingId(null)
  }

  const loadGadsRecs = useCallback(async () => {
    try {
      const [recRes, settingsRes] = await Promise.all([
        apiFetch(`${BACKEND}/google-ads/recommendations`, { timeoutMs: 20000 }),
        apiFetch(`${BACKEND}/google-ads/automation-settings`, { timeoutMs: 20000 }),
      ])
      const [recData, settingsData] = await Promise.all([recRes.json(), settingsRes.json()])
      if (recData.success) setGadsRecs(recData.recommendations)
      else setGadsRecsError(recData.error || recData.detail || 'Could not load recommendations.')
      if (settingsData.success) setGadsSettings(settingsData.settings)
    } catch (err) {
      setGadsRecsError(err?.message || 'Backend se connect nahi ho paya.')
    }
    setGadsRecsLoading(false)
  }, [])

  useEffect(() => { loadGadsRecs() }, [loadGadsRecs])

  async function handleApproveRec(recId) {
    setGadsRecBusyId(recId)
    try {
      const res = await apiFetch(`${BACKEND}/google-ads/recommendations/${recId}/approve`, { method: 'POST', timeoutMs: 30000 })
      const data = await res.json()
      if (!data.success) toast.error(data.error || data.detail || 'Could not apply this change.')
      else toast.success('Applied.')
    } catch (err) {
      toast.error(err?.message || 'Backend se connect nahi ho paya.')
    }
    await loadGadsRecs()
    setGadsRecBusyId(null)
  }

  async function handleRejectRec(recId) {
    setGadsRecBusyId(recId)
    try {
      const res = await apiFetch(`${BACKEND}/google-ads/recommendations/${recId}/reject`, { method: 'POST', timeoutMs: 20000 })
      const data = await res.json()
      if (!data.success) toast.error(data.detail || 'Could not reject this recommendation.')
    } catch (err) {
      toast.error(err?.message || 'Backend se connect nahi ho paya.')
    }
    await loadGadsRecs()
    setGadsRecBusyId(null)
  }

  async function handleRevertRec(recId) {
    setGadsRecBusyId(recId)
    try {
      const res = await apiFetch(`${BACKEND}/google-ads/recommendations/${recId}/revert`, { method: 'POST', timeoutMs: 30000 })
      const data = await res.json()
      if (!data.success) toast.error(data.error || data.detail || 'Could not revert this change.')
      else toast.success('Reverted.')
    } catch (err) {
      toast.error(err?.message || 'Backend se connect nahi ho paya.')
    }
    await loadGadsRecs()
    setGadsRecBusyId(null)
  }

  async function handleSaveGadsSettings(patch) {
    setGadsSettingsSaving(true)
    try {
      const res = await apiFetch(`${BACKEND}/google-ads/automation-settings`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, timeoutMs: 20000,
        body: JSON.stringify(patch),
      })
      const data = await res.json()
      if (data.success) setGadsSettings(data.settings)
      else toast.error(data.detail || 'Could not save guardrails.')
    } catch (err) {
      toast.error(err?.message || 'Backend se connect nahi ho paya.')
    }
    setGadsSettingsSaving(false)
  }

  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => {
        setCardsIn(true)
        setTimeout(() => setBarsVisible(true), 300)
      })
    }
  }, [loading])

  const convRate = stats?.total ? Math.round((stats.converted / stats.total) * 100) : 0

  const kpis = stats ? [
    { label: 'Total Leads',  value: stats.total,     sub: `+${stats.new} this week`,  Icon: Users,         gold: false },
    { label: 'Analyses Run', value: analyses.length, sub: 'AI reports generated',      Icon: Bot,           gold: true  },
    { label: 'Converted',    value: stats.converted, sub: `${convRate}% close rate`,   Icon: CheckCircle,   gold: false },
    { label: 'Via WhatsApp', value: stats.whatsapp,  sub: 'chat-sourced leads',        Icon: MessageCircle, gold: false },
  ] : []

  // Post-audit fix: real reported case — Total Leads: 4, Lead Sources
  // (WhatsApp/Website/Form) all 0. Leads created automatically by Voice
  // Outreach/Revenue Engine carry a source string this chart's three fixed
  // buckets never recognized — /leads/stats now reports them under
  // `unknown` instead of silently dropping them, and showing that bucket
  // here (only when it's non-zero, so the normal all-manual-leads case
  // looks exactly as before) is what makes the total actually reconcile
  // with what's on screen instead of three bars that don't add up to it.
  const sources = stats ? [
    { name: 'WhatsApp', count: stats.whatsapp },
    { name: 'Website',  count: stats.website  },
    { name: 'Form',     count: stats.form      },
    ...(stats.unknown > 0 ? [{ name: 'Unknown', count: stats.unknown }] : []),
  ] : []
  const maxSource = Math.max(...sources.map(s => s.count), 1)

  const card = {
    background: SLATE,
    border: `1px solid ${SLATE_L}`,
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1);   opacity: 1;   }
          50%       { transform: scale(1.5); opacity: 0.5; }
        }
        .skeleton {
          background: linear-gradient(90deg, #1E1F27 25%, #2A2B35 50%, #1E1F27 75%);
          background-size: 800px 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        .kpi-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          cursor: pointer;
        }
        .kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
          border-color: ${GOLD}50 !important;
        }
        .section-card { transition: border-color 0.2s ease; }
        .section-card:hover { border-color: #3A3B46 !important; }
        .analysis-row { transition: background 0.1s ease; border-radius: 5px; cursor: default; }
        .analysis-row:hover { background: ${SLATE_L} !important; }
        .campaign-row { transition: background 0.1s ease; border-radius: 4px; }
        .campaign-row:hover { background: ${SLATE_L} !important; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .live-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .gads-day-btn { transition: all 0.15s ease; cursor: pointer; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: INK,
        fontFamily: FONT_BODY,
        color: BONE,
        padding: isMobile ? '28px 16px' : '40px 36px',
        maxWidth: '960px',
        width: '100%',
        boxSizing: 'border-box',
      }}>

        {/* Page header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '28px', flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '22px' : '26px', fontWeight: '700',
              margin: '0 0 3px 0', letterSpacing: '-0.5px', color: BONE,
              fontFamily: FONT_DISPLAY,
            }}>
              Overview
            </h1>
            <p style={{ color: MUTED, fontSize: '13px', margin: 0, letterSpacing: '-0.1px', fontFamily: FONT_BODY }}>
              Sohscape · Namaste, Krish
            </p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: SLATE, border: `1px solid ${SLATE_L}`, borderRadius: '6px',
            padding: '5px 12px',
          }}>
            <div className="live-dot" style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: GREEN, boxShadow: `0 0 0 2px rgba(63,166,107,0.2)`,
            }} />
            <span style={{ color: MUTED, fontSize: '12px', fontWeight: '500' }}>Live</span>
          </div>
        </div>

        {/* ── Loading skeletons ── */}
        {loading ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '8px', marginBottom: '8px',
            }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ ...card, padding: isMobile ? '16px 14px' : '20px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <Skeleton w="60%" h="10px" />
                    <Skeleton w="13px" h="13px" radius="3px" />
                  </div>
                  <Skeleton w="50%" h="32px" radius="4px" style={{ marginBottom: '8px' }} />
                  <Skeleton w="70%" h="10px" />
                </div>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '8px', marginBottom: '8px',
            }}>
              {[0,1].map(i => (
                <div key={i} style={{ ...card, padding: isMobile ? '18px 16px' : '22px 20px' }}>
                  <Skeleton w="40%" h="10px" style={{ marginBottom: '18px' }} />
                  {[0,1,2].map(j => (
                    <div key={j} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: j < 2 ? '13px' : 0 }}>
                      <Skeleton w="64px" h="12px" />
                      <Skeleton h="3px" style={{ flex: 1 }} />
                      <Skeleton w="20px" h="12px" />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ ...card, padding: '13px 18px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Activity size={14} color={SLATE_L} />
              <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>
                Loading data{attempt > 1 ? ` — attempt ${attempt} of 3` : ''}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '8px', marginBottom: '8px',
            }}>
              {kpis.map(({ label, value, sub, Icon, gold }, i) => (
                <div
                  key={label}
                  className="kpi-card"
                  style={{
                    ...card,
                    padding: isMobile ? '16px 14px' : '20px 18px',
                    opacity: cardsIn ? 1 : 0,
                    animation: cardsIn ? `fadeSlideUp 0.4s ease both` : 'none',
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: '14px',
                  }}>
                    <p style={{
                      fontSize: '10px', fontWeight: '500', textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: MUTED, margin: 0, fontFamily: FONT_BODY,
                    }}>
                      {label}
                    </p>
                    <Icon size={13} color={SLATE_L} strokeWidth={1.5} />
                  </div>
                  <AnimatedNumber value={value} gold={gold} size={isMobile ? '28px' : '32px'} />
                  <p style={{ fontSize: '11px', color: MUTED, margin: 0, letterSpacing: '-0.1px', fontFamily: FONT_BODY }}>
                    {sub}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Bottom Grid ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '8px', marginBottom: '8px',
            }}>

              {/* Lead Sources */}
              <div
                className="section-card"
                style={{
                  ...card, padding: isMobile ? '18px 16px' : '22px 20px',
                  opacity: cardsIn ? 1 : 0,
                  animation: cardsIn ? 'fadeSlideUp 0.4s ease both' : 'none',
                  animationDelay: '360ms',
                }}
              >
                <p style={{
                  fontSize: '10px', fontWeight: '500', textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: MUTED, margin: '0 0 14px 0', fontFamily: FONT_BODY,
                }}>
                  Lead Sources
                </p>
                {stats.total === 0 ? (
                  <p style={{ color: MUTED, fontSize: '13px', margin: 0 }}>No leads yet.</p>
                ) : (
                  <BarChart sources={sources} maxSource={maxSource} visible={barsVisible} />
                )}
              </div>

              {/* Recent Analyses */}
              <div
                className="section-card"
                style={{
                  ...card, padding: isMobile ? '18px 16px' : '22px 20px',
                  opacity: cardsIn ? 1 : 0,
                  animation: cardsIn ? 'fadeSlideUp 0.4s ease both' : 'none',
                  animationDelay: '440ms',
                }}
              >
                <p style={{
                  fontSize: '10px', fontWeight: '500', textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: MUTED, margin: '0 0 14px 0', fontFamily: FONT_BODY,
                }}>
                  Recent Analyses
                </p>
                {analyses.length === 0 ? (
                  <p style={{ color: MUTED, fontSize: '13px', margin: 0 }}>
                    No analyses yet. Run one from AI Analyzer.
                  </p>
                ) : (
                  analyses.slice(0, 5).map((a, i) => (
                    <div key={a.id} className="analysis-row" style={{
                      padding: '7px 8px', margin: '0 -8px',
                      borderBottom: i < 4 ? `1px solid ${SLATE_L}` : 'none',
                    }}>
                      <p style={{
                        margin: '0 0 2px 0', fontSize: '12px', fontWeight: '500',
                        color: BONE, letterSpacing: '-0.2px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        fontFamily: FONT_BODY,
                      }}>
                        {a.url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: MUTED, letterSpacing: '-0.1px', fontFamily: FONT_BODY }}>
                        {a.business_type} · {a.created_at}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Google Ads Performance ── */}
            <div
              className="section-card"
              style={{
                ...card,
                padding: isMobile ? '18px 16px' : '22px 20px',
                opacity: cardsIn ? 1 : 0,
                animation: cardsIn ? 'fadeSlideUp 0.4s ease both' : 'none',
                animationDelay: '520ms',
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '10px', flexWrap: 'wrap' }}>
                <p style={{ fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED, margin: 0, fontFamily: FONT_BODY }}>
                  Google Ads Performance
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {[7, 30, 90].map(d => (
                    <button
                      key={d}
                      className="gads-day-btn"
                      onClick={() => setGAdsDays(d)}
                      disabled={gAdsLoading || gAdsRefreshing}
                      style={{
                        padding: '3px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '600',
                        border: '1px solid',
                        borderColor: gAdsDays === d ? GOLD : SLATE_L,
                        background:  gAdsDays === d ? `rgba(201,162,39,0.12)` : 'transparent',
                        color:        gAdsDays === d ? GOLD : MUTED,
                        fontFamily: FONT_MONO,
                      }}
                    >{d}d</button>
                  ))}
                  <button
                    onClick={() => { setGAdsRefreshing(true); setGAdsTick(t => t + 1) }}
                    disabled={gAdsLoading || gAdsRefreshing}
                    style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', borderRadius: '5px', border: `1px solid ${SLATE_L}`, background: 'transparent', cursor: 'pointer', color: MUTED }}
                  >
                    <RefreshCw size={11} className={gAdsRefreshing ? 'spin' : ''} />
                  </button>
                </div>
              </div>

              {gAdsLoading ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                    {[0,1,2,3,4,5].map(i => (
                      <div key={i} style={{ background: SLATE_M, borderRadius: '6px', padding: '14px 12px' }}>
                        <Skeleton w="55%" h="9px" style={{ marginBottom: '12px' }} />
                        <Skeleton w="45%" h="22px" />
                      </div>
                    ))}
                  </div>
                  {gAdsWaking && (
                    <p style={{ fontSize: '12px', color: MUTED, margin: '10px 0 0', fontFamily: FONT_BODY }}>
                      Server waking up — Google Ads data loads in up to a minute...
                    </p>
                  )}
                </>
              ) : gAdsError ? (
                <div style={{ background: 'rgba(196,69,58,0.1)', border: `1px solid rgba(196,69,58,0.3)`, borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={13} color={RED} />
                  <p style={{ fontSize: '13px', color: RED, margin: 0, fontFamily: FONT_BODY }}>
                    {gAdsUnauth
                      ? 'Google Ads blocked — authentication error. Refresh the page or log in again.'
                      : 'Google Ads data unavailable — check API credentials'}
                  </p>
                </div>
              ) : (
                <>
                  {/* 6 KPI mini-cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
                    {[
                      { label: 'Impressions', val: gAds.impressions,  Icon: Eye,               type: 'int'                          },
                      { label: 'Clicks',      val: gAds.clicks,       Icon: MousePointerClick,  type: 'int'                          },
                      { label: 'Cost (₹)',    val: gAds.cost_inr,     Icon: IndianRupee,        type: 'decimal', prefix: '₹'         },
                      { label: 'CTR',         val: gAds.ctr_pct,      Icon: Percent,            type: 'decimal', suffix: '%'         },
                      { label: 'Avg CPC (₹)', val: gAds.avg_cpc_inr, Icon: Zap,                type: 'decimal', prefix: '₹'         },
                      { label: 'Conversions', val: gAds.conversions,  Icon: CheckCircle,        type: 'decimal', decimals: 1, dropDecimalIfWhole: true },
                    ].map(({ label, val, Icon, type, prefix, suffix, decimals, dropDecimalIfWhole }) => (
                      <div key={label} style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '14px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <p style={{ fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: 0, fontFamily: FONT_BODY }}>{label}</p>
                          <Icon size={11} color={SLATE_L} strokeWidth={1.5} />
                        </div>
                        {type === 'int'
                          ? <AnimatedNumber value={val} size="22px" />
                          : <AnimatedDecimal value={val} prefix={prefix} suffix={suffix} decimals={decimals ?? 2} size="22px" dropDecimalIfWhole={dropDecimalIfWhole} />
                        }
                      </div>
                    ))}
                  </div>

                  {/* Trend chart */}
                  {gAdsDaily && gAdsDaily.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED, margin: '0 0 10px', fontFamily: FONT_BODY }}>Daily Trend</p>
                      <ResponsiveContainer width="100%" height={120}>
                        <AreaChart data={gAdsDaily} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={GOLD} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={GOLD} stopOpacity={0}   />
                            </linearGradient>
                            <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={BONE} stopOpacity={0.06} />
                              <stop offset="95%" stopColor={BONE} stopOpacity={0}    />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke={SLATE_L} strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: MUTED, fontFamily: FONT_MONO }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={d => d ? d.slice(5) : ''}
                            interval="preserveStartEnd"
                          />
                          <Tooltip
                            contentStyle={{ background: SLATE, border: `1px solid ${SLATE_L}`, borderRadius: '6px', fontSize: '12px', color: BONE }}
                            labelStyle={{ color: MUTED, fontWeight: '500', marginBottom: '4px' }}
                            formatter={(val, name) => {
                              if (name === 'impressions') return [val.toLocaleString(), 'Impressions']
                              if (name === 'clicks')      return [val.toLocaleString(), 'Clicks']
                              if (name === 'cost_inr')    return [`₹${val}`, 'Cost']
                              return [val, name]
                            }}
                          />
                          <Area type="monotone" dataKey="impressions" stroke={GOLD}  strokeWidth={1.5} fill="url(#goldGrad)"  dot={false} />
                          <Area type="monotone" dataKey="clicks"      stroke={BONE}  strokeWidth={1}   fill="url(#clickGrad)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '12px', height: '2px', background: GOLD, borderRadius: '1px' }} />
                          <span style={{ fontSize: '10px', color: MUTED, fontFamily: FONT_BODY }}>Impressions</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '12px', height: '2px', background: BONE, borderRadius: '1px', opacity: 0.4 }} />
                          <span style={{ fontSize: '10px', color: MUTED, fontFamily: FONT_BODY }}>Clicks</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campaign breakdown */}
                  {gAdsCampaigns && gAdsCampaigns.length > 0 && (
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED, margin: '0 0 8px', fontFamily: FONT_BODY }}>Campaigns</p>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: FONT_BODY }}>
                          <thead>
                            <tr style={{ borderBottom: `1px solid ${SLATE_L}` }}>
                              {['Campaign', 'Status', 'Impr.', 'Clicks', 'Cost', 'CTR', 'CPC', ''].map(h => (
                                <th key={h} style={{ textAlign: h === 'Campaign' ? 'left' : 'right', padding: '6px 8px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: MUTED, whiteSpace: 'nowrap' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {gAdsCampaigns.map((c, i) => (
                              <Fragment key={c.campaign_id}>
                                <tr className="campaign-row" style={{ borderBottom: openDiagnosticsId === c.campaign_id ? 'none' : (i < gAdsCampaigns.length - 1 ? `1px solid ${SLATE_L}` : 'none') }}>
                                  <td style={{ padding: '8px 8px', color: BONE, fontWeight: '500', maxWidth: isMobile ? '100px' : '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</td>
                                  <td style={{ padding: '8px 8px', textAlign: 'right' }}>
                                    <span style={{
                                      padding: '2px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: '600',
                                      fontFamily: FONT_MONO,
                                      background: c.status === 'ENABLED' ? 'rgba(63,166,107,0.12)' : `rgba(138,138,146,0.12)`,
                                      color:      c.status === 'ENABLED' ? GREEN : MUTED,
                                    }}>{c.status === 'ENABLED' ? 'Active' : 'Paused'}</span>
                                  </td>
                                  <td style={{ padding: '8px 8px', textAlign: 'right', color: MUTED, fontFamily: FONT_MONO }}>{c.impressions.toLocaleString()}</td>
                                  <td style={{ padding: '8px 8px', textAlign: 'right', color: MUTED, fontFamily: FONT_MONO }}>{c.clicks.toLocaleString()}</td>
                                  <td style={{ padding: '8px 8px', textAlign: 'right', color: BONE, fontWeight: '500', fontFamily: FONT_MONO }}>₹{c.cost_inr}</td>
                                  <td style={{ padding: '8px 8px', textAlign: 'right', color: MUTED, fontFamily: FONT_MONO }}>{c.ctr_pct}%</td>
                                  <td style={{ padding: '8px 8px', textAlign: 'right', color: MUTED, fontFamily: FONT_MONO }}>₹{c.avg_cpc_inr}</td>
                                  <td style={{ padding: '8px 8px', textAlign: 'right' }}>
                                    <button
                                      onClick={() => toggleDiagnostics(c.campaign_id)}
                                      style={{
                                        background: openDiagnosticsId === c.campaign_id ? GOLD : 'transparent',
                                        color: openDiagnosticsId === c.campaign_id ? INK : GOLD,
                                        border: `1px solid ${GOLD}`, borderRadius: '20px', padding: '3px 9px',
                                        fontSize: '10px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: FONT_BODY,
                                      }}
                                    >
                                      {openDiagnosticsId === c.campaign_id ? 'Hide' : 'Why?'}
                                    </button>
                                  </td>
                                </tr>
                                {openDiagnosticsId === c.campaign_id && (
                                  <tr style={{ borderBottom: i < gAdsCampaigns.length - 1 ? `1px solid ${SLATE_L}` : 'none' }}>
                                    <td colSpan={8} style={{ padding: '0 8px 14px' }}>
                                      <CampaignDiagnosticsPanel
                                        loading={diagnosticsLoadingId === c.campaign_id}
                                        error={diagnosticsErrorById[c.campaign_id]}
                                        data={diagnosticsById[c.campaign_id]}
                                      />
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <p style={{ fontSize: '11px', color: MUTED, margin: '14px 0 0', letterSpacing: '-0.1px', fontFamily: FONT_MONO }}>
                    {gAds.start_date} – {gAds.end_date}
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Google Ads Optimizer: Recommendations — Phase 1, approval-only.
          Shown regardless of whether the performance-metrics fetch above
          succeeded, since recommendations are fetched independently. */}
      <div
        className="section-card"
        style={{
          ...card, padding: isMobile ? '18px 16px' : '22px 20px', marginTop: '20px',
          opacity: cardsIn ? 1 : 0, animation: cardsIn ? 'fadeSlideUp 0.4s ease both' : 'none', animationDelay: '480ms',
        }}
      >
        <p style={{
          fontSize: '10px', fontWeight: '500', textTransform: 'uppercase',
          letterSpacing: '0.08em', color: MUTED, margin: '0 0 14px 0', fontFamily: FONT_BODY,
        }}>
          Recommendations
        </p>
        <RecommendationsSection
          recommendations={gadsRecs} loading={gadsRecsLoading} error={gadsRecsError}
          settings={gadsSettings} busyId={gadsRecBusyId}
          onApprove={handleApproveRec} onReject={handleRejectRec} onRevert={handleRevertRec}
          onSaveSettings={handleSaveGadsSettings} savingSettings={gadsSettingsSaving}
        />
      </div>
    </>
  )
}

export default Dashboard
