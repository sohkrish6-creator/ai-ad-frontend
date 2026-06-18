import { useState, useEffect } from 'react'

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
    { label: 'Total Leads', value: stats.total, sub: `${stats.new} new`, color: '#10B981', icon: '👥' },
    { label: 'Analyses Done', value: analyses.length, sub: 'AI reports', color: '#6366F1', icon: '🤖' },
    { label: 'Converted', value: stats.converted, sub: `${stats.total ? Math.round((stats.converted / stats.total) * 100) : 0}% rate`, color: '#F59E0B', icon: '✅' },
    { label: 'WhatsApp Leads', value: stats.whatsapp, sub: 'from chat', color: '#06B6D4', icon: '💬' },
  ] : []

  const sources = stats ? [
    { name: 'WhatsApp', count: stats.whatsapp, color: '#10B981' },
    { name: 'Website', count: stats.website, color: '#6366F1' },
    { name: 'Form', count: stats.form, color: '#F59E0B' },
  ] : []
  const maxSource = Math.max(...sources.map(s => s.count), 1)

  return (
    <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>

      {/* Top Bar */}
      <div style={{ background: '#0D1117', borderBottom: '1px solid #1E2A3E', padding: isMobile ? '0 16px' : '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: '700', fontSize: '15px' }}>✦ AI Ad Manager</span>
        <span style={{ background: '#6366F1', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: '600' }}>Pro Plan</span>
      </div>

      <div style={{ padding: isMobile ? '20px 16px' : '24px 20px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: isMobile ? '20px' : '28px' }}>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', margin: '0 0 4px 0' }}>
            Namaste, Krish 👋
          </h1>
          <p style={{ color: '#64748B', fontSize: isMobile ? '13px' : '14px', margin: 0 }}>
            Aapke business ka live overview
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <p style={{ fontSize: '14px' }}>Data load ho raha hai...</p>
          </div>
        ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '10px' : '14px', marginBottom: isMobile ? '20px' : '28px' }}>
            {kpis.map((kpi) => (
              <div key={kpi.label} style={{ background: 'linear-gradient(135deg, #0D1117 0%, #11161F 100%)', border: '1px solid #1E2A3E', borderRadius: '14px', padding: isMobile ? '14px' : '18px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: kpi.color }} />
                <div style={{ fontSize: isMobile ? '18px' : '20px', marginBottom: '8px' }}>{kpi.icon}</div>
                <p style={{ color: '#64748B', fontSize: '10px', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.label}</p>
                <p style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', margin: '0 0 4px 0' }}>{kpi.value}</p>
                <span style={{ fontSize: '11px', color: kpi.color, fontWeight: '600' }}>{kpi.sub}</span>
              </div>
            ))}
          </div>

          {/* Bottom Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '14px' : '18px', marginBottom: isMobile ? '14px' : '18px' }}>

            {/* Lead Sources */}
            <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '14px', padding: isMobile ? '18px' : '22px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 18px 0' }}>📊 Lead Sources</h2>
              {stats.total === 0 ? (
                <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Abhi koi lead nahi. Leads aane par yahan dikhega.</p>
              ) : (
                sources.map((s) => (
                  <div key={s.name} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#94A3B8' }}>{s.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>{s.count}</span>
                    </div>
                    <div style={{ background: '#1E2A3E', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${(s.count / maxSource) * 100}%`, height: '100%', background: s.color, borderRadius: '6px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent Analyses */}
            <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '14px', padding: isMobile ? '18px' : '22px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 18px 0' }}>🤖 Recent AI Analyses</h2>
              {analyses.length === 0 ? (
                <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Abhi koi analysis nahi. AI Analyzer use karo!</p>
              ) : (
                analyses.slice(0, 5).map((a) => (
                  <div key={a.id} style={{ padding: '11px 13px', background: '#131820', borderRadius: '8px', marginBottom: '8px', border: '1px solid #1E2A3E' }}>
                    <p style={{ margin: '0 0 3px 0', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>
                      {a.business_type} · {a.created_at}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ad Performance — Coming Soon */}
          <div style={{ background: 'linear-gradient(135deg, #0D1117 0%, #131820 100%)', border: '1px dashed #2D3B52', borderRadius: '14px', padding: isMobile ? '20px' : '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📈</div>
            <h2 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 6px 0' }}>Ad Performance Tracking</h2>
            <p style={{ color: '#64748B', fontSize: '13px', margin: '0 auto', maxWidth: '420px', lineHeight: '1.5' }}>
              Live spend, clicks, aur ROAS yahan dikhega jab Google Ads & Meta Ads connect honge.
            </p>
            <span style={{ display: 'inline-block', marginTop: '12px', fontSize: '11px', fontWeight: '600', color: '#818CF8', background: '#6366F115', border: '1px solid #6366F140', borderRadius: '20px', padding: '5px 14px' }}>
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