import { useState, useEffect } from 'react'

const GOLD      = '#D4AF37'
const GOLD_DIM  = '#D4AF3740'
const GOLD_GLOW = '#D4AF3712'
const GOLD_SOFT = '#D4AF3780'
const GOLD_SUB  = '#A08835'   // uniform muted gold for all KPI sub-labels

function Dashboard() {
  const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [stats, setStats] = useState(null)
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(1)

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
      try {
        const res = await fetch(url, { signal: ctrl.signal })
        return res
      } finally {
        clearTimeout(timer)
      }
    }

    async function tryLoad(attempt = 1) {
      setAttempt(attempt)
      try {
        const [statsRes, analysesRes] = await Promise.all([
          fetchWithTimeout(`${BACKEND}/leads/stats`),
          fetchWithTimeout(`${BACKEND}/analyses`),
        ])
        const statsData = await statsRes.json()
        const analysesData = await analysesRes.json()
        setStats(statsData)
        setAnalyses(analysesData.analyses || [])
        setLoading(false)
      } catch (err) {
        if (attempt < 3) {
          setTimeout(() => tryLoad(attempt + 1), 5000)
        } else {
          setStats(EMPTY)
          setLoading(false)
        }
      }
    }

    const fallbackTimer = setTimeout(() => {
      setStats(prev => prev ?? EMPTY)
      setLoading(false)
    }, 8000)

    tryLoad().finally(() => clearTimeout(fallbackTimer))
    return () => clearTimeout(fallbackTimer)
  }, [])

  const convRate = stats?.total ? Math.round((stats.converted / stats.total) * 100) : 0

  const kpis = stats ? [
    { label: 'Total Leads',    value: stats.total,      sub: `↑ ${stats.new} new`,         icon: '👥', accent: '#10B981' },
    { label: 'Analyses Done',  value: analyses.length,  sub: `${analyses.length} AI runs`,  icon: '🤖', accent: GOLD,      hero: true },
    { label: 'Converted',      value: stats.converted,  sub: `${convRate}% close rate`,     icon: '✅', accent: '#F59E0B' },
    { label: 'WhatsApp Leads', value: stats.whatsapp,   sub: `${stats.whatsapp} via chat`,  icon: '💬', accent: '#06B6D4' },
  ] : []

  const sources = stats ? [
    { name: 'WhatsApp', count: stats.whatsapp, color: '#10B981' },
    { name: 'Website',  count: stats.website,  color: GOLD },
    { name: 'Form',     count: stats.form,     color: '#F59E0B' },
  ] : []
  const maxSource = Math.max(...sources.map(s => s.count), 1)

  return (
    <>
      <style>{`
        .kpi-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px #D4AF3718, 0 2px 10px #00000050 !important;
          border-color: #D4AF3332 !important;
        }
        .kpi-card.hero:hover {
          box-shadow: 0 8px 32px #D4AF3728, 0 2px 12px #00000060 !important;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
        color: '#fff',
      }}>

        {/* Top Bar */}
        <div style={{
          background: '#0D0D0D',
          borderBottom: '1px solid #1A1A1A',
          padding: isMobile ? '0 16px' : '0 24px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '-0.2px' }}>
            <span style={{ color: GOLD }}>✦</span> AI Ad Manager
          </span>
          <span style={{
            background: GOLD_GLOW,
            border: `1px solid ${GOLD_DIM}`,
            borderRadius: '20px',
            padding: '4px 13px',
            fontSize: '11px',
            fontWeight: '600',
            color: GOLD,
            letterSpacing: '0.04em',
          }}>
            Pro Plan
          </span>
        </div>

        <div style={{ padding: isMobile ? '20px 16px' : '24px 24px', maxWidth: '1100px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{
            marginBottom: isMobile ? '16px' : '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div>
              <h1 style={{
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: '700',
                margin: '0 0 3px 0',
                letterSpacing: '-0.5px',
                color: '#fff',
              }}>
                Namaste, Krish 👋
              </h1>
              <p style={{ color: '#383838', fontSize: '13px', margin: 0 }}>
                Aapke business ka live overview
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#111',
              border: '1px solid #1E1E1E',
              borderRadius: '7px',
              padding: '5px 11px',
            }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#10B981', boxShadow: '0 0 0 3px #10B98115',
              }} />
              <span style={{ color: '#383838', fontSize: '11px', fontWeight: '500' }}>Live</span>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.3 }}>⏳</div>
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 6px' }}>
                Data load ho raha hai... ({attempt}/3)
              </p>
              <p style={{ fontSize: '12px', color: '#444', margin: '0 0 14px' }}>
                Backend waking up — pehli baar ~30s lag sakti hai
              </p>
              <span style={{
                display: 'inline-block', fontSize: '11px', fontWeight: '600',
                color: GOLD, background: GOLD_GLOW, border: `1px solid ${GOLD_DIM}`,
                borderRadius: '20px', padding: '4px 14px',
              }}>
                {attempt < 3 ? 'Retry ho rahi hai...' : 'Zeros ke saath load ho raha hai...'}
              </span>
            </div>
          ) : (
          <>
            {/* KPI Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: isMobile ? '8px' : '10px',
              marginBottom: isMobile ? '14px' : '16px',
            }}>
              {kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className={`kpi-card${kpi.hero ? ' hero' : ''}`}
                  style={{
                    background: kpi.hero
                      ? `linear-gradient(145deg, #161410 0%, #111111 60%)`
                      : `linear-gradient(145deg, #141414 0%, #111111 60%)`,
                    border: `1px solid ${kpi.hero ? '#2A2010' : '#1E1E1E'}`,
                    borderRadius: '12px',
                    padding: isMobile ? '14px' : '18px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: kpi.hero ? `0 0 20px ${GOLD_GLOW}` : '0 1px 3px #00000030',
                  }}
                >
                  {/* Left accent bar */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '2px', height: '100%',
                    background: `linear-gradient(180deg, ${kpi.accent}CC 0%, transparent 80%)`,
                  }} />
                  {/* Hero card top shimmer */}
                  {kpi.hero && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                      background: `linear-gradient(90deg, transparent 0%, ${GOLD_SOFT} 50%, transparent 100%)`,
                    }} />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <p style={{
                      color: '#2A2A2A', fontSize: '9px', margin: 0,
                      textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700',
                    }}>
                      {kpi.label}
                    </p>
                    <span style={{ fontSize: '14px', opacity: 0.55 }}>{kpi.icon}</span>
                  </div>

                  <p style={{
                    fontSize: isMobile ? '26px' : '32px',
                    fontWeight: '700',
                    margin: '0 0 5px 0',
                    letterSpacing: '-1.5px',
                    color: '#fff',
                    lineHeight: 1,
                  }}>
                    {kpi.value}
                  </p>
                  <span style={{ fontSize: '11px', color: GOLD_SUB, fontWeight: '500' }}>
                    {kpi.sub}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '10px' : '10px',
              marginBottom: isMobile ? '10px' : '10px',
            }}>

              {/* Lead Sources */}
              <div style={{ background: '#111111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: isMobile ? '16px' : '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px' }}>📊</span>
                  <h2 style={{ fontSize: '12px', fontWeight: '600', margin: 0, color: '#888', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    Lead Sources
                  </h2>
                </div>

                {stats.total === 0 ? (
                  <p style={{ color: '#252525', fontSize: '13px', textAlign: 'center', padding: '16px 0', margin: 0 }}>
                    Abhi koi lead nahi. Leads aane par yahan dikhega.
                  </p>
                ) : (
                  sources.map((s, i) => (
                    <div key={s.name} style={{ marginBottom: i < sources.length - 1 ? '14px' : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#3A3A3A', fontWeight: '500' }}>{s.name}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#D0D0D0', letterSpacing: '-0.5px' }}>{s.count}</span>
                      </div>
                      <div style={{ background: '#1A1A1A', borderRadius: '3px', height: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${(s.count / maxSource) * 100}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${s.color}CC, ${s.color}40)`,
                          borderRadius: '3px',
                          transition: 'width 0.7s ease',
                        }} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Recent Analyses */}
              <div style={{ background: '#111111', border: '1px solid #1E1E1E', borderRadius: '12px', padding: isMobile ? '16px' : '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px' }}>🤖</span>
                  <h2 style={{ fontSize: '12px', fontWeight: '600', margin: 0, color: '#888', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    Recent AI Analyses
                  </h2>
                </div>

                {analyses.length === 0 ? (
                  <p style={{ color: '#252525', fontSize: '13px', textAlign: 'center', padding: '16px 0', margin: 0 }}>
                    Abhi koi analysis nahi. AI Analyzer use karo!
                  </p>
                ) : (
                  analyses.slice(0, 5).map((a, i) => (
                    <div key={a.id} style={{
                      padding: '9px 12px',
                      background: '#0D0D0D',
                      borderRadius: '7px',
                      marginBottom: i < 4 ? '5px' : 0,
                      border: '1px solid #181818',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <div style={{
                        width: '4px', height: '4px', borderRadius: '50%',
                        background: GOLD, flexShrink: 0,
                        boxShadow: `0 0 0 3px ${GOLD_GLOW}`,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: '0 0 1px 0', fontSize: '12px', fontWeight: '500',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          color: '#C8C8C8',
                        }}>
                          {a.url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                        </p>
                        <p style={{ margin: 0, fontSize: '10px', color: '#282828' }}>
                          {a.business_type} · {a.created_at}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ad Performance — Coming Soon (compact inline) */}
            <div style={{
              background: '#0D0D0D',
              border: `1px dashed ${GOLD_DIM}`,
              borderRadius: '10px',
              padding: '13px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>📈</span>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#888', whiteSpace: 'nowrap' }}>
                  Ad Performance Tracking
                </span>
                <span style={{ fontSize: '12px', color: '#282828' }}>
                  Google Ads &amp; Meta Ads connect hone par live dikhega
                </span>
              </div>
              <span style={{
                flexShrink: 0, fontSize: '10px', fontWeight: '700',
                color: GOLD, background: GOLD_GLOW,
                border: `1px solid ${GOLD_DIM}`, borderRadius: '20px',
                padding: '3px 12px', letterSpacing: '0.06em', whiteSpace: 'nowrap',
              }}>
                Phase 4
              </span>
            </div>
          </>
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard
