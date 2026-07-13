import { useState, useEffect, useRef } from 'react'
import {
  Users, Bot, CheckCircle, MessageCircle,
  TrendingUp, Activity, Eye, MousePointerClick, IndianRupee, Percent, Zap, RefreshCw,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

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
function AnimatedDecimal({ value, prefix = '', suffix = '', decimals = 2, size = '28px', gold = false }) {
  const int = useCountUp(Math.round(value * 100), 900, true)
  const display = (int / 100).toFixed(decimals)
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

// ── Main component ─────────────────────────────────────────────────────────
function Dashboard() {
  const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const EMPTY = { total: 0, whatsapp: 0, website: 0, form: 0, new: 0, converted: 0 }

    async function fetchWithTimeout(url, ms = 12000) {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), ms)
      try { return await fetch(url, { signal: ctrl.signal }) }
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
          fetch(`${BACKEND}/google-ads/performance?days=${gAdsDays}`, { signal: ctrl.signal, headers: _authH }),
          fetch(`${BACKEND}/google-ads/campaigns?days=${gAdsDays}`,   { signal: ctrl.signal, headers: _authH }),
          fetch(`${BACKEND}/google-ads/daily?days=${gAdsDays}`,       { signal: ctrl.signal, headers: _authH }),
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

  const sources = stats ? [
    { name: 'WhatsApp', count: stats.whatsapp },
    { name: 'Website',  count: stats.website  },
    { name: 'Form',     count: stats.form      },
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
                      ? 'Google Ads blocked — VITE_ADSOH_API_KEY not set in Vercel. Add it and redeploy.'
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
                      { label: 'Conversions', val: gAds.conversions,  Icon: CheckCircle,        type: 'decimal', decimals: 1         },
                    ].map(({ label, val, Icon, type, prefix, suffix, decimals }) => (
                      <div key={label} style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '14px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <p style={{ fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: 0, fontFamily: FONT_BODY }}>{label}</p>
                          <Icon size={11} color={SLATE_L} strokeWidth={1.5} />
                        </div>
                        {type === 'int'
                          ? <AnimatedNumber value={val} size="22px" />
                          : <AnimatedDecimal value={val} prefix={prefix} suffix={suffix} decimals={decimals ?? 2} size="22px" />
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
                              {['Campaign', 'Status', 'Impr.', 'Clicks', 'Cost', 'CTR', 'CPC'].map(h => (
                                <th key={h} style={{ textAlign: h === 'Campaign' ? 'left' : 'right', padding: '6px 8px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: MUTED, whiteSpace: 'nowrap' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {gAdsCampaigns.map((c, i) => (
                              <tr key={c.campaign_id} className="campaign-row" style={{ borderBottom: i < gAdsCampaigns.length - 1 ? `1px solid ${SLATE_L}` : 'none' }}>
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
                              </tr>
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
    </>
  )
}

export default Dashboard
