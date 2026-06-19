import { useState, useEffect } from 'react'

const GOLD       = '#D4AF37'
const GOLD_DIM   = '#D4AF3740'
const GOLD_GLOW  = '#D4AF3712'
const GOLD_SOFT  = '#D4AF3780'

function Dashboard() {
  const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [stats, setStats] = useState(null)
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, analysesRes] = await Promise.all([
          fetch(`${BACKEND}/leads/stats`),
          fetch(`${BACKEND}/analyses`)
        ])
        const statsData = await statsRes.json()
        const analysesData = await analysesRes.json()
        setStats(statsData)
        setAnalyses(analysesData.analyses || [])
      } catch (err) {
        setStats({ total: 0, whatsapp: 0, website: 0, form: 0, new: 0, converted: 0 })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const kpis = stats ? [
    { label: 'Total Leads',    value: stats.total,      sub: `${stats.new} new`,                                                             color: '#10B981', icon: '👥' },
    { label: 'Analyses Done',  value: analyses.length,  sub: 'AI reports',                                                                   color: GOLD,      icon: '🤖' },
    { label: 'Converted',      value: stats.converted,  sub: `${stats.total ? Math.round((stats.converted / stats.total) * 100) : 0}% rate`, color: '#F59E0B', icon: '✅' },
    { label: 'WhatsApp Leads', value: stats.whatsapp,   sub: 'from chat',                                                                    color: '#06B6D4', icon: '💬' },
  ] : []

  const sources = stats ? [
    { name: 'WhatsApp', count: stats.whatsapp, color: '#10B981' },
    { name: 'Website',  count: stats.website,  color: GOLD },
    { name: 'Form',     count: stats.form,     color: '#F59E0B' },
  ] : []
  const maxSource = Math.max(...sources.map(s => s.count), 1)

  return (
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

      <div style={{ padding: isMobile ? '24px 16px' : '32px 24px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          marginBottom: isMobile ? '24px' : '32px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '22px' : '28px',
              fontWeight: '700',
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px',
              color: '#fff',
            }}>
              Namaste, Krish 👋
            </h1>
            <p style={{ color: '#3A3A3A', fontSize: '14px', margin: 0, letterSpacing: '-0.1px' }}>
              Aapke business ka live overview
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: '#111',
            border: '1px solid #1F1F1F',
            borderRadius: '8px',
            padding: '6px 13px',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#10B981', boxShadow: '0 0 0 3px #10B98118',
            }} />
            <span style={{ color: '#3A3A3A', fontSize: '12px', fontWeight: '500' }}>Live</span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '14px', opacity: 0.3 }}>⏳</div>
            <p style={{ fontSize: '14px', color: '#2A2A2A', margin: 0 }}>Data load ho raha hai...</p>
          </div>
        ) : (
        <>
          {/* KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? '10px' : '12px',
            marginBottom: isMobile ? '20px' : '24px',
          }}>
            {kpis.map((kpi, i) => (
              <div key={kpi.label} style={{
                background: '#111111',
                border: `1px solid ${i === 1 ? GOLD_DIM : '#1A1A1A'}`,
                borderRadius: '14px',
                padding: isMobile ? '16px' : '22px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: i === 1 ? `0 0 24px ${GOLD_GLOW}` : 'none',
              }}>
                {/* Left accent bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '2px', height: '100%',
                  background: `linear-gradient(180deg, ${kpi.color} 0%, transparent 100%)`,
                }} />
                {/* Top glow for hero card */}
                {i === 1 && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                    background: `linear-gradient(90deg, transparent, ${GOLD_SOFT}, transparent)`,
                  }} />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <p style={{
                    color: '#2E2E2E', fontSize: '10px', margin: 0,
                    textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: '600',
                  }}>
                    {kpi.label}
                  </p>
                  <span style={{ fontSize: '16px', opacity: 0.7 }}>{kpi.icon}</span>
                </div>

                <p style={{
                  fontSize: isMobile ? '28px' : '34px',
                  fontWeight: '700',
                  margin: '0 0 7px 0',
                  letterSpacing: '-1.5px',
                  color: '#fff',
                  lineHeight: 1,
                }}>
                  {kpi.value}
                </p>
                <span style={{ fontSize: '11px', color: kpi.color, fontWeight: '600', letterSpacing: '0.02em' }}>
                  {kpi.sub}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '12px' : '14px',
            marginBottom: isMobile ? '12px' : '14px',
          }}>

            {/* Lead Sources */}
            <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '14px', padding: isMobile ? '20px' : '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
                <span style={{ fontSize: '13px' }}>📊</span>
                <h2 style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#C0C0C0', letterSpacing: '-0.1px' }}>
                  Lead Sources
                </h2>
              </div>

              {stats.total === 0 ? (
                <p style={{ color: '#252525', fontSize: '13px', textAlign: 'center', padding: '24px 0', margin: 0 }}>
                  Abhi koi lead nahi. Leads aane par yahan dikhega.
                </p>
              ) : (
                sources.map((s) => (
                  <div key={s.name} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#3A3A3A', fontWeight: '500', letterSpacing: '0.03em' }}>
                        {s.name}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#E2E8F0', letterSpacing: '-0.5px' }}>
                        {s.count}
                      </span>
                    </div>
                    <div style={{ background: '#1A1A1A', borderRadius: '3px', height: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(s.count / maxSource) * 100}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${s.color}, ${s.color}55)`,
                        borderRadius: '3px',
                        transition: 'width 0.7s ease',
                      }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent Analyses */}
            <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '14px', padding: isMobile ? '20px' : '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
                <span style={{ fontSize: '13px' }}>🤖</span>
                <h2 style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#C0C0C0', letterSpacing: '-0.1px' }}>
                  Recent AI Analyses
                </h2>
              </div>

              {analyses.length === 0 ? (
                <p style={{ color: '#252525', fontSize: '13px', textAlign: 'center', padding: '24px 0', margin: 0 }}>
                  Abhi koi analysis nahi. AI Analyzer use karo!
                </p>
              ) : (
                analyses.slice(0, 5).map((a) => (
                  <div key={a.id} style={{
                    padding: '11px 13px',
                    background: '#0D0D0D',
                    borderRadius: '8px',
                    marginBottom: '6px',
                    border: '1px solid #191919',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px',
                  }}>
                    <div style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: GOLD, flexShrink: 0,
                      boxShadow: `0 0 0 3px ${GOLD_GLOW}`,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: '0 0 2px 0', fontSize: '13px', fontWeight: '500',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        color: '#D0D0D0',
                      }}>
                        {a.url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#2A2A2A' }}>
                        {a.business_type} · {a.created_at}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ad Performance — Coming Soon */}
          <div style={{
            background: '#0D0D0D',
            border: `1px dashed ${GOLD_DIM}`,
            borderRadius: '14px',
            padding: isMobile ? '28px 20px' : '32px 24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '360px', height: '180px',
              background: `radial-gradient(ellipse, ${GOLD}07 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
            <div style={{ fontSize: '26px', marginBottom: '12px' }}>📈</div>
            <h2 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 8px 0', color: '#C0C0C0', letterSpacing: '-0.2px' }}>
              Ad Performance Tracking
            </h2>
            <p style={{ color: '#282828', fontSize: '13px', margin: '0 auto', maxWidth: '420px', lineHeight: '1.65' }}>
              Live spend, clicks, aur ROAS yahan dikhega jab Google Ads &amp; Meta Ads connect honge.
            </p>
            <span style={{
              display: 'inline-block',
              marginTop: '16px',
              fontSize: '11px',
              fontWeight: '600',
              color: GOLD,
              background: GOLD_GLOW,
              border: `1px solid ${GOLD_DIM}`,
              borderRadius: '20px',
              padding: '5px 16px',
              letterSpacing: '0.05em',
            }}>
              Coming in Phase 4
            </span>
          </div>
        </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
