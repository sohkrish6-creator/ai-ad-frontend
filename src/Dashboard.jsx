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
    { label: 'Total Leads',   value: stats.total,     sub: `${stats.new} new this week` },
    { label: 'Analyses Run',  value: analyses.length, sub: 'AI reports generated', gold: true },
    { label: 'Converted',     value: stats.converted, sub: `${convRate}% close rate` },
    { label: 'Via WhatsApp',  value: stats.whatsapp,  sub: 'chat-sourced leads' },
  ] : []

  const sources = stats ? [
    { name: 'WhatsApp', count: stats.whatsapp },
    { name: 'Website',  count: stats.website  },
    { name: 'Form',     count: stats.form      },
  ] : []
  const maxSource = Math.max(...sources.map(s => s.count), 1)

  const card = {
    background: '#141414',
    border: '1px solid #252525',
    borderRadius: '10px',
  }

  const sectionLabel = {
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#383838',
    margin: '0 0 18px 0',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
      color: '#D0D0D0',
      padding: isMobile ? '28px 16px' : '40px 36px',
      maxWidth: '900px',
    }}>

      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '600',
          margin: '0 0 4px 0',
          letterSpacing: '-0.4px',
          color: '#E8E8E8',
        }}>
          Namaste, Krish
        </h1>
        <p style={{ color: '#333', fontSize: '13px', margin: 0 }}>
          Sohscape — live business overview
        </p>
      </div>

      {loading ? (
        <div style={{ ...card, padding: '32px 24px' }}>
          <p style={{ fontSize: '14px', color: '#444', margin: '0 0 6px' }}>
            Loading data{attempt > 1 ? ` (attempt ${attempt}/3)` : ''}...
          </p>
          <p style={{ fontSize: '12px', color: '#2A2A2A', margin: 0 }}>
            Backend may take ~30s on first wake
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '20px',
          }}>
            {kpis.map(kpi => (
              <div key={kpi.label} style={{
                ...card,
                padding: isMobile ? '18px 16px' : '22px 20px',
              }}>
                <p style={{ ...sectionLabel, marginBottom: '12px' }}>
                  {kpi.label}
                </p>
                <p style={{
                  fontSize: isMobile ? '30px' : '36px',
                  fontWeight: '600',
                  margin: '0 0 5px 0',
                  letterSpacing: '-1.5px',
                  color: kpi.gold ? GOLD : '#E8E8E8',
                  lineHeight: 1,
                }}>
                  {kpi.value}
                </p>
                <p style={{ fontSize: '11px', color: '#333', margin: 0 }}>
                  {kpi.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '10px',
            marginBottom: '10px',
          }}>

            {/* Lead Sources */}
            <div style={{ ...card, padding: isMobile ? '20px 18px' : '24px 22px' }}>
              <p style={sectionLabel}>Lead Sources</p>

              {stats.total === 0 ? (
                <p style={{ color: '#282828', fontSize: '13px', margin: 0 }}>
                  No leads yet. They'll appear here once they come in.
                </p>
              ) : (
                sources.map((s, i) => (
                  <div key={s.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: i < sources.length - 1 ? '14px' : 0,
                  }}>
                    <span style={{
                      fontSize: '12px', color: '#484848', fontWeight: '500',
                      width: '68px', flexShrink: 0,
                    }}>
                      {s.name}
                    </span>
                    <div style={{
                      flex: 1, background: '#1E1E1E', borderRadius: '2px', height: '3px',
                    }}>
                      <div style={{
                        width: `${(s.count / maxSource) * 100}%`,
                        height: '100%',
                        background: '#404040',
                        borderRadius: '2px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{
                      fontSize: '13px', fontWeight: '600', color: '#C0C0C0',
                      letterSpacing: '-0.3px', width: '22px', textAlign: 'right', flexShrink: 0,
                    }}>
                      {s.count}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Recent Analyses */}
            <div style={{ ...card, padding: isMobile ? '20px 18px' : '24px 22px' }}>
              <p style={sectionLabel}>Recent Analyses</p>

              {analyses.length === 0 ? (
                <p style={{ color: '#282828', fontSize: '13px', margin: 0 }}>
                  No analyses yet. Run one from AI Analyzer.
                </p>
              ) : (
                analyses.slice(0, 5).map((a, i) => (
                  <div key={a.id} style={{
                    paddingBottom: i < 4 ? '11px' : 0,
                    marginBottom: i < 4 ? '11px' : 0,
                    borderBottom: i < 4 ? '1px solid #1C1C1C' : 'none',
                  }}>
                    <p style={{
                      margin: '0 0 2px 0', fontSize: '12px', fontWeight: '500',
                      color: '#B0B0B0',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {a.url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#2E2E2E' }}>
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
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <p style={{ fontSize: '13px', color: '#303030', margin: 0, flex: 1 }}>
              Ad Performance Tracking — Google Ads &amp; Meta Ads live data
            </p>
            <span style={{
              fontSize: '10px', fontWeight: '700',
              color: GOLD, border: '1px solid #2A2010',
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
