import { useLocation, useNavigate } from 'react-router-dom'

function Nav() {
  const location = useLocation()
  const navigate = useNavigate()

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/analyze', label: 'AI Analyzer', icon: '🌐' },
    { path: '/leads', label: 'Leads', icon: '👥' },
  ]

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '200px',
      background: '#0D1117',
      borderRight: '1px solid #1E2A3E',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid #1E2A3E',
        marginBottom: '8px',
      }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#fff' }}>
          ✦ AI Ad Manager
        </p>
        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#6366F1', fontWeight: '600' }}>
          Pro Plan
        </p>
      </div>

      {/* Links */}
      <div style={{ padding: '0 8px', flex: 1 }}>
        {links.map((link) => {
          const isActive = location.pathname === link.path
          return (
            <div
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '4px',
                cursor: 'pointer',
                background: isActive ? '#6366F115' : 'transparent',
                border: isActive ? '1px solid #6366F130' : '1px solid transparent',
                color: isActive ? '#818CF8' : '#64748B',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '400',
              }}
            >
              <span style={{ fontSize: '16px' }}>{link.icon}</span>
              {link.label}
            </div>
          )
        })}
      </div>

      {/* Bottom */}
      <div style={{ padding: '16px', borderTop: '1px solid #1E2A3E' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>Krish · Sohscape</p>
        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#334155' }}>krish@sohscape.com</p>
      </div>
    </div>
  )
}

export default Nav