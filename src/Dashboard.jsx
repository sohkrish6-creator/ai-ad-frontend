import { useState, useEffect } from 'react'
import {
  Users, Bot, CheckCircle, MessageCircle,
  TrendingUp, Activity,
} from 'lucide-react'

const GOLD = '#D4AF37'

const card = {
  background: '#0A0A0A',
  border: '1px solid #1F1F1F',
  borderRadius: '8px',
}

function Label({ children }) {
  return (
    <p style={{
      fontSize: '11px',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: '#555',
      margin: '0 0 14px 0',
    }}>
      {children}
    </p>
  )
}

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
    { label: 'Total Leads',   value: stats.total,     sub: `+${stats.new} this week`,   Icon: Users,         color: '#fff' },
    { label: 'Analyses Run',  value: analyses.length, sub: 'AI reports generated',       Icon: Bot,           color: GOLD  },
    { label: 'Converted',     value: stats.converted, sub: `${convRate}% close rate`,    Icon: CheckCircle,   color: '#fff' },
    { label: 'Via WhatsApp',  value: stats.whatsapp,  sub: 'chat-sourced leads',         Icon: MessageCircle, color: '#fff' },
  ] : []

  const sources = stats ? [
    { name: 'WhatsApp', count: stats.whatsapp },
    { name: 'Website',  count: stats.website  },
    { name: 'Form',     count: stats.form      },
  ] : []
  const maxSource = Math.max(...sources.map(s => s.count), 1)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');
        .kpi-card { transition: border-color 0.15s; }
        .kpi-card:hover { border-color: #3A3A3A !important; }
        .analysis-row { transition: background 0.1s; border-radius: 6px; }
        .analysis-row:hover { background: #111 !important; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#000',
        fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
        color: '#ededed',
        padding: isMobile ? '28px 16px 28px' : '40px 36px',
        maxWidth: '960px',
      }}>

        {/* Page header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '20px' : '22px',
              fontWeight: '600',
              margin: '0 0 3px 0',
              letterSpacing: '-0.4px',
              color: '#fff',
            }}>
              Overview
            </h1>
            <p style={{ color: '#555', fontSize: '13px', margin: 0, letterSpacing: '-0.1px' }}>
              Sohscape · Namaste, Krish
            </p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#0A0A0A',
            border: '1px solid #1F1F1F',
            borderRadius: '6px',
            padding: '5px 12px',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 0 2px #22C55E20',
            }} />
            <span style={{ color: '#888', fontSize: '12px', fontWeight: '500' }}>Live</span>
          </div>
        </div>

        {loading ? (
          <div style={{ ...card, padding: '32px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Activity size={14} color="#444" />
              <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
                Loading data{attempt > 1 ? ` — attempt ${attempt} of 3` : ''}
              </p>
            </div>
            <p style={{ fontSize: '12px', color: '#2E2E2E', margin: '0 0 0 24px' }}>
              Backend may take ~30s on first wake
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '8px',
            }}>
              {kpis.map(({ label, value, sub, Icon, color }) => (
                <div key={label} className="kpi-card" style={{ ...card, padding: isMobile ? '18px 16px' : '20px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <p style={{
                      fontSize: '11px', fontWeight: '500', textTransform: 'uppercase',
                      letterSpacing: '0.07em', color: '#555', margin: 0,
                    }}>
                      {label}
                    </p>
                    <Icon size={13} color="#333" strokeWidth={1.5} />
                  </div>
                  <p style={{
                    fontSize: isMobile ? '28px' : '32px',
                    fontWeight: '600',
                    margin: '0 0 6px 0',
                    letterSpacing: '-1.5px',
                    color,
                    lineHeight: 1,
                  }}>
                    {value}
                  </p>
                  <p style={{ fontSize: '11px', color: '#3A3A3A', margin: 0, letterSpacing: '-0.1px' }}>
                    {sub}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '8px',
              marginBottom: '8px',
            }}>

              {/* Lead Sources */}
              <div style={{ ...card, padding: isMobile ? '20px 18px' : '22px 20px' }}>
                <Label>Lead Sources</Label>

                {stats.total === 0 ? (
                  <p style={{ color: '#2A2A2A', fontSize: '13px', margin: 0 }}>
                    No leads yet.
                  </p>
                ) : (
                  sources.map((s, i) => (
                    <div key={s.name} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      marginBottom: i < sources.length - 1 ? '13px' : 0,
                    }}>
                      <span style={{
                        fontSize: '12px', color: '#555', fontWeight: '500',
                        width: '64px', flexShrink: 0, letterSpacing: '-0.1px',
                      }}>
                        {s.name}
                      </span>
                      <div style={{ flex: 1, background: '#1A1A1A', borderRadius: '2px', height: '3px' }}>
                        <div style={{
                          width: `${(s.count / maxSource) * 100}%`,
                          height: '100%',
                          background: '#3A3A3A',
                          borderRadius: '2px',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: '13px', fontWeight: '600', color: '#ccc',
                        letterSpacing: '-0.5px', width: '20px', textAlign: 'right', flexShrink: 0,
                      }}>
                        {s.count}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Recent Analyses */}
              <div style={{ ...card, padding: isMobile ? '20px 18px' : '22px 20px' }}>
                <Label>Recent Analyses</Label>

                {analyses.length === 0 ? (
                  <p style={{ color: '#2A2A2A', fontSize: '13px', margin: 0 }}>
                    No analyses yet. Run one from AI Analyzer.
                  </p>
                ) : (
                  analyses.slice(0, 5).map((a, i) => (
                    <div key={a.id} className="analysis-row" style={{
                      padding: '8px',
                      margin: '0 -8px',
                      borderBottom: i < 4 ? '1px solid #141414' : 'none',
                    }}>
                      <p style={{
                        margin: '0 0 2px 0', fontSize: '12px', fontWeight: '500',
                        color: '#ccc', letterSpacing: '-0.2px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {a.url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#333', letterSpacing: '-0.1px' }}>
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
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderStyle: 'dashed',
            }}>
              <TrendingUp size={14} color="#2E2E2E" strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: '#2E2E2E', margin: 0, flex: 1, letterSpacing: '-0.1px' }}>
                Ad Performance Tracking — Google Ads &amp; Meta Ads live data
              </p>
              <span style={{
                fontSize: '10px', fontWeight: '600',
                color: GOLD, border: '1px solid #2A2010',
                borderRadius: '4px', padding: '2px 8px',
                letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0,
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
