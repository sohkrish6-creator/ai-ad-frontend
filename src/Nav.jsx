import { Link, useLocation } from 'react-router-dom'

function Nav() {
  const location = useLocation()
  const isMobile = window.innerWidth < 768

  const links = [
    { path: '/dashboard',    label: 'Dashboard',    icon: '📊' },
    { path: '/intelligence', label: 'BI Platform',  icon: '🧬' },
    { path: '/brain', label: 'Marketing Brain', icon: '🧠' },
    { path: '/analyze', label: 'AI Analyzer', icon: '🌐' },
    { path: '/competitor', label: 'Competitor', icon: '🔍' },
    { path: '/ad-intel', label: 'Ad Intel', icon: '📡' },
    { path: '/ad-creative', label: 'Ad Creative', icon: '🎨' },
    { path: '/audience', label: 'Audience Finder', icon: '🎯' },
    { path: '/leads', label: 'Leads', icon: '👥' },
  ]

  // MOBILE — bottom bar
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: '#0D1117',
        borderTop: '1px solid #1E2A3E',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        {links.map(link => {
          const active = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: active ? '#818CF8' : '#64748B',
                fontSize: '11px',
                fontWeight: active ? '600' : '400',
              }}
            >
              <span style={{ fontSize: '20px' }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </div>
    )
  }

  // DESKTOP — side bar
  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: '200px',
      height: '100vh',
      background: '#0D1117',
      borderRight: '1px solid #1E2A3E',
      padding: '24px 16px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ marginBottom: '32px', paddingLeft: '12px' }}>
        <p style={{ color: '#fff', fontWeight: '700', fontSize: '16px', margin: '0 0 4px 0' }}>
          ✦ AI Ad Manager
        </p>
        <p style={{ color: '#6366F1', fontSize: '12px', margin: 0 }}>Pro Plan</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {links.map(link => {
          const active = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 12px',
                borderRadius: '8px',
                background: active ? '#6366F115' : 'transparent',
                border: `1px solid ${active ? '#6366F1' : 'transparent'}`,
                color: active ? '#818CF8' : '#94A3B8',
                fontSize: '14px',
                fontWeight: active ? '600' : '400',
              }}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </div>

      <div style={{ paddingLeft: '12px', borderTop: '1px solid #1E2A3E', paddingTop: '16px' }}>
        <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>Krish · Sohscape</p>
      </div>
    </div>
  )
}

export default Nav