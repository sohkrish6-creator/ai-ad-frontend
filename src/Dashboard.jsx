import { useState, useEffect } from 'react'

const GOLD = '#D4AF37'

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

    async function tryLoad(n = 1) {
      setAttempt(n)
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
      } catch {
        if (n < 3) {
          setTimeout(() => tryLoad(n + 1), 5000)
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
    { label: 'Total Leads',    value: stats.total,     sub: `${stats.new} new this week` },
    { label: 'Analyses Run',   value: analyses.length, sub: 'AI reports generated', gold: true },
    { label: 'Converted',      value: stats.converted, sub: `${convRate}% close rate` },
    { label: 'Via WhatsApp',   value: stats.whatsapp,  sub: 'chat-sourced leads' },
  ] : []

  const sources = stats ? [
    { name: 'WhatsApp', count: stats.whatsapp },
    { name: 'Website',  count: stats.website  },
    { name: 'Form',     count: stats.form      },
  ] : []
  const maxSource = Math.max(...sources.map(s => s.count), 1)

  const pad = isMobile ? '32px 20px' : '48px 40px'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
      color: '#D0D0D0',
      padding: pad,
      maxWidth: '860px',
    }}>

      {/* Page header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{
          fontSize: isMobile ? '22px' : '26px',
          fontWeight: '600',
          margin: '0 0 6px 0',
          letterSpacing: '-0.5px',
          color: '#E8E8E8',
        }}>
          Namaste, Krish
        </h1>
        <p style={{ color: '#3A3A3A', fontSize: '14px', margin: 0 }}>
          Sohscape — live business overview
        </p>
      </div>

      {loading ? (
        <div style={{ paddingTop: '40px' }}>
          <p style={{ fontSize: '14px', color: '#3A3A3A', margin: '0 0 8px' }}>
            Loading data{attempt > 1 ? ` (attempt ${attempt}/3)` : ''}...
          </p>
          <p style={{ fontSize: '12px', color: '#282828', margin: 0 }}>
            Backend may take ~30s on first wake
          </p>
        </div>
      ) : (
        <>
          {/* KPI stat row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: '0',
            marginBottom: '52px',
            borderTop: '1px solid #1A1A1A',
            borderBottom: '1px solid #1A1A1A',
          }}>
            {kpis.map((kpi, i) => (
              <div key={kpi.label} style={{
                padding: isMobile ? '24px 16px' : '28px 20px',
                borderRight: i < kpis.length - 1 ? '1px solid #1A1A1A' : 'none',
                borderBottom: isMobile && i < 2 ? '1px solid #1A1A1A' : 'none',
              }}>
                <p style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#2E2E2E',
                  margin: '0 0 10px 0',
                }}>
                  {kpi.label}
                </p>
                <p style={{
                  fontSize: isMobile ? '28px' : '34px',
                  fontWeight: '600',
                  margin: '0 0 4px 0',
                  letterSpacing: '-1.5px',
                  color: kpi.gold ? GOLD : '#E8E8E8',
                  lineHeight: 1,
                }}>
                  {kpi.value}
                </p>
                <p style={{ fontSize: '12px', color: '#2E2E2E', margin: 0 }}>
                  {kpi.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '48px' : '64px',
          }}>

            {/* Lead Sources */}
            <div>
              <p style={{
                fontSize: '10px', fontWeight: '600', textTransform: 'uppercase',
                letterSpacing: '0.08em', color: '#2E2E2E', margin: '0 0 20px 0',
              }}>
                Lead Sources
              </p>

              {stats.total === 0 ? (
                <p style={{ color: '#252525', fontSize: '13px', margin: 0 }}>
                  No leads yet. They'll appear here once they come in.
                </p>
              ) : (
                sources.map((s, i) => (
                  <div key={s.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    paddingBottom: i < sources.length - 1 ? '14px' : 0,
                    marginBottom: i < sources.length - 1 ? '14px' : 0,
                    borderBottom: i < sources.length - 1 ? '1px solid #141414' : 'none',
                  }}>
                    <span style={{
                      fontSize: '13px', color: '#3A3A3A', fontWeight: '500',
                      width: '72px', flexShrink: 0,
                    }}>
                      {s.name}
                    </span>
                    <div style={{
                      flex: 1, background: '#161616', borderRadius: '2px', height: '2px',
                    }}>
                      <div style={{
                        width: `${(s.count / maxSource) * 100}%`,
                        height: '100%',
                        background: '#2E2E2E',
                        borderRadius: '2px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{
                      fontSize: '13px', fontWeight: '600', color: '#C0C0C0',
                      letterSpacing: '-0.3px', width: '24px', textAlign: 'right', flexShrink: 0,
                    }}>
                      {s.count}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Recent Analyses */}
            <div>
              <p style={{
                fontSize: '10px', fontWeight: '600', textTransform: 'uppercase',
                letterSpacing: '0.08em', color: '#2E2E2E', margin: '0 0 20px 0',
              }}>
                Recent Analyses
              </p>

              {analyses.length === 0 ? (
                <p style={{ color: '#252525', fontSize: '13px', margin: 0 }}>
                  No analyses yet. Run one from AI Analyzer.
                </p>
              ) : (
                analyses.slice(0, 5).map((a, i) => (
                  <div key={a.id} style={{
                    paddingBottom: i < 4 ? '12px' : 0,
                    marginBottom: i < 4 ? '12px' : 0,
                    borderBottom: i < 4 ? '1px solid #141414' : 'none',
                  }}>
                    <p style={{
                      margin: '0 0 2px 0', fontSize: '13px', fontWeight: '500',
                      color: '#B0B0B0',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {a.url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#282828' }}>
                      {a.business_type} · {a.created_at}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Coming soon */}
          <div style={{
            marginTop: '52px',
            paddingTop: '24px',
            borderTop: '1px solid #141414',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <p style={{ fontSize: '13px', color: '#282828', margin: 0, flex: 1 }}>
              Ad Performance Tracking — Google Ads &amp; Meta Ads live data
            </p>
            <span style={{
              fontSize: '10px', fontWeight: '700',
              color: GOLD, border: `1px solid #2A2010`,
              borderRadius: '20px', padding: '3px 12px',
              letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              Phase 4
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
