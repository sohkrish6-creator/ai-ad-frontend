import { useState, useEffect, useRef } from 'react'
import {
  Users, Bot, CheckCircle, MessageCircle,
  TrendingUp, Activity,
} from 'lucide-react'

const GOLD = '#D4AF37'

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
      const eased = 1 - Math.pow(1 - p, 3) // ease-out cubic
      setCount(Math.round(eased * target))
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, enabled])
  return count
}

// ── Animated KPI number ────────────────────────────────────────────────────
function AnimatedNumber({ value, gold, size }) {
  const n = useCountUp(value, 900, true)
  return (
    <p style={{
      fontSize: size,
      fontWeight: '600',
      margin: '0 0 5px 0',
      letterSpacing: '-1.5px',
      color: gold ? GOLD : '#171717',
      lineHeight: 1,
      textShadow: gold ? '0 0 24px rgba(212,175,55,0.35)' : 'none',
    }}>
      {n}
    </p>
  )
}

// ── Skeleton shimmer block ─────────────────────────────────────────────────
function Skeleton({ w = '100%', h = '16px', radius = '4px', style = {} }) {
  return (
    <div className="skeleton" style={{
      width: w, height: h, borderRadius: radius, flexShrink: 0, ...style,
    }} />
  )
}

// ── Animated bar chart ─────────────────────────────────────────────────────
function BarChart({ sources, maxSource, visible }) {
  return sources.map((s, i) => (
    <div key={s.name} style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      marginBottom: i < sources.length - 1 ? '13px' : 0,
    }}>
      <span style={{
        fontSize: '12px', color: '#888', fontWeight: '500',
        width: '64px', flexShrink: 0, letterSpacing: '-0.1px',
      }}>
        {s.name}
      </span>
      <div style={{ flex: 1, background: '#F0F0F0', borderRadius: '2px', height: '4px', overflow: 'hidden' }}>
        <div style={{
          width: visible ? `${(s.count / maxSource) * 100}%` : '0%',
          height: '100%',
          background: `linear-gradient(90deg, #D4AF37, #E8C84A)`,
          borderRadius: '2px',
          transition: `width 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${i * 120}ms`,
        }} />
      </div>
      <span style={{
        fontSize: '13px', fontWeight: '600', color: '#171717',
        letterSpacing: '-0.5px', width: '20px', textAlign: 'right', flexShrink: 0,
      }}>
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

  // Trigger entrance animations after data loads
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
    background: '#fff',
    border: '1px solid #EAEAEA',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(1);   opacity: 1;   }
          50%       { transform: scale(1.5); opacity: 0.5; }
        }

        .skeleton {
          background: linear-gradient(90deg, #F5F5F5 25%, #EBEBEB 50%, #F5F5F5 75%);
          background-size: 800px 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }

        .kpi-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          cursor: pointer;
        }
        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important;
          border-color: #999 !important;
        }

        .section-card {
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .section-card:hover {
          border-color: #D4D4D4 !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.07) !important;
        }

        .analysis-row {
          transition: background 0.12s ease;
          border-radius: 6px;
          cursor: default;
        }
        .analysis-row:hover { background: #F5F5F5 !important; }

        .live-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#FAFAFA',
        fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
        color: '#171717',
        padding: isMobile ? '28px 16px' : '40px 36px',
        maxWidth: '960px',
      }}>

        {/* Page header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '28px', flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '20px' : '22px', fontWeight: '600',
              margin: '0 0 3px 0', letterSpacing: '-0.4px', color: '#171717',
            }}>
              Overview
            </h1>
            <p style={{ color: '#999', fontSize: '13px', margin: 0, letterSpacing: '-0.1px' }}>
              Sohscape · Namaste, Krish
            </p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#fff', border: '1px solid #EAEAEA', borderRadius: '6px',
            padding: '5px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}>
            <div className="live-dot" style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#22C55E', boxShadow: '0 0 0 2px #22C55E20',
            }} />
            <span style={{ color: '#888', fontSize: '12px', fontWeight: '500' }}>Live</span>
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
              <Activity size={14} color="#CCC" />
              <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
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
                      fontSize: '11px', fontWeight: '500', textTransform: 'uppercase',
                      letterSpacing: '0.07em', color: '#999', margin: 0,
                    }}>
                      {label}
                    </p>
                    <Icon size={13} color="#D4D4D4" strokeWidth={1.5} />
                  </div>
                  <AnimatedNumber value={value} gold={gold} size={isMobile ? '28px' : '32px'} />
                  <p style={{ fontSize: '11px', color: '#666', margin: 0, letterSpacing: '-0.1px' }}>
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
                  fontSize: '11px', fontWeight: '500', textTransform: 'uppercase',
                  letterSpacing: '0.07em', color: '#999', margin: '0 0 14px 0',
                }}>
                  Lead Sources
                </p>

                {stats.total === 0 ? (
                  <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>No leads yet.</p>
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
                  fontSize: '11px', fontWeight: '500', textTransform: 'uppercase',
                  letterSpacing: '0.07em', color: '#999', margin: '0 0 14px 0',
                }}>
                  Recent Analyses
                </p>

                {analyses.length === 0 ? (
                  <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
                    No analyses yet. Run one from AI Analyzer.
                  </p>
                ) : (
                  analyses.slice(0, 5).map((a, i) => (
                    <div key={a.id} className="analysis-row" style={{
                      padding: '7px 8px', margin: '0 -8px',
                      borderBottom: i < 4 ? '1px solid #F0F0F0' : 'none',
                    }}>
                      <p style={{
                        margin: '0 0 2px 0', fontSize: '12px', fontWeight: '500',
                        color: '#333', letterSpacing: '-0.2px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {a.url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#999', letterSpacing: '-0.1px' }}>
                        {a.business_type} · {a.created_at}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Coming soon */}
            <div style={{
              ...card,
              padding: '13px 18px',
              display: 'flex', alignItems: 'center', gap: '12px',
              borderStyle: 'dashed', boxShadow: 'none',
              opacity: cardsIn ? 1 : 0,
              animation: cardsIn ? 'fadeSlideUp 0.4s ease both' : 'none',
              animationDelay: '520ms',
            }}>
              <TrendingUp size={14} color="#D4D4D4" strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: '#555', margin: 0, flex: 1, letterSpacing: '-0.1px' }}>
                Ad Performance Tracking — Google Ads &amp; Meta Ads live data
              </p>
              <span style={{
                fontSize: '10px', fontWeight: '600', color: GOLD,
                border: `1px solid ${GOLD}33`, borderRadius: '4px',
                padding: '2px 8px', letterSpacing: '0.06em',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                PHASE 4
              </span>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default Dashboard
