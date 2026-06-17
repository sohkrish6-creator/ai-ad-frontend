function Dashboard() {
  const stats = [
    { label: 'Total Spend', value: '₹48,250', change: '+12%', color: '#6366F1' },
    { label: 'Total Clicks', value: '3,420', change: '+8%', color: '#06B6D4' },
    { label: 'Total Leads', value: '34', change: '+22%', color: '#10B981' },
    { label: 'Cost Per Lead', value: '₹366', change: '-8%', color: '#F59E0B' },
  ]

  const campaigns = [
    { name: 'Jaipur Wedding Leads', platform: 'Google', status: 'Active', budget: '₹15,000' },
    { name: 'Bridal Season Meta', platform: 'Meta', status: 'Active', budget: '₹20,000' },
    { name: 'Display Remarketing', platform: 'Display', status: 'Paused', budget: '₹8,000' },
  ]

  const recommendations = [
    { text: 'Meta campaign ka budget 40% badhao — CPL ₹185 hai jo Google se 3x better hai', priority: 'High' },
    { text: 'Google Ad Group 3 pause karo — CTR 0.3% hai, ₹4,200 waste ho rahe hain', priority: 'High' },
    { text: 'Converted leads ka lookalike audience banao Meta pe', priority: 'Medium' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080B12',
      fontFamily: 'system-ui, sans-serif',
      color: '#fff',
    }}>

      {/* Top Bar */}
      <div style={{
        background: '#0D1117',
        borderBottom: '1px solid #1E2A3E',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: '700', fontSize: '15px' }}>
          ✦ AI Ad Manager
        </span>
        <span style={{
          background: '#6366F1',
          borderRadius: '20px',
          padding: '4px 14px',
          fontSize: '12px',
          fontWeight: '600',
        }}>
          Krish — Pro Plan
        </span>
      </div>

      <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>
            Dashboard
          </h1>
          <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
            Aapke saare campaigns ka overview
          </p>
        </div>

        {/* KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{
              background: '#0D1117',
              border: '1px solid #1E2A3E',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 6px 0', fontFamily: 'monospace' }}>
                {stat.value}
              </p>
              <span style={{
                fontSize: '12px',
                color: stat.change.startsWith('+') ? '#10B981' : '#F43F5E',
                fontWeight: '600',
              }}>
                {stat.change} this month
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}>

          {/* Campaigns */}
          <div style={{
            background: '#0D1117',
            border: '1px solid #1E2A3E',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
              Campaigns
            </h2>
            {campaigns.map((c) => (
              <div key={c.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: '#131820',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid #1E2A3E',
              }}>
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: '500' }}>
                    {c.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>
                    {c.platform} · {c.budget}
                  </p>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: c.status === 'Active' ? '#10B98120' : '#F59E0B20',
                  color: c.status === 'Active' ? '#10B981' : '#F59E0B',
                  border: `1px solid ${c.status === 'Active' ? '#10B98140' : '#F59E0B40'}`,
                }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          <div style={{
            background: '#0D1117',
            border: '1px solid #1E2A3E',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
              🤖 AI Recommendations
            </h2>
            {recommendations.map((r, i) => (
              <div key={i} style={{
                padding: '12px',
                background: '#131820',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid #1E2A3E',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: r.priority === 'High' ? '#F59E0B20' : '#6366F120',
                  color: r.priority === 'High' ? '#F59E0B' : '#818CF8',
                  border: `1px solid ${r.priority === 'High' ? '#F59E0B40' : '#6366F140'}`,
                  whiteSpace: 'nowrap',
                  marginTop: '2px',
                }}>
                  {r.priority}
                </span>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: '1.5' }}>
                  {r.text}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard