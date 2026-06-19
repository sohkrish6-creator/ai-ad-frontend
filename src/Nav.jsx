import { Link, useLocation } from 'react-router-dom'

const GOLD      = '#D4AF37'
const GOLD_DIM  = '#D4AF3738'
const GOLD_GLOW = '#D4AF3712'

function Nav() {
  const location = useLocation()
  const isMobile = window.innerWidth < 768

  const links = [
    { path: '/dashboard',    label: 'Dashboard',      icon: '📊' },
    { path: '/intelligence', label: 'BI Platform',    icon: '🧬' },
    { path: '/brain',        label: 'Marketing Brain', icon: '🧠' },
    { path: '/analyze',      label: 'AI Analyzer',    icon: '🌐' },
    { path: '/competitor',   label: 'Competitor',     icon: '🔍' },
    { path: '/ad-intel',     label: 'Ad Intel',       icon: '📡' },
    { path: '/ad-creative',  label: 'Ad Creative',    icon: '🎨' },
    { path: '/audience',     label: 'Audience Finder', icon: '🎯' },
    { path: '/leads',        label: 'Leads',          icon: '👥' },
  ]

  // MOBILE — bottom bar
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: '64px',
        background: '#0D0D0D',
        borderTop: `1px solid #1A1A1A`,
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
                color: active ? GOLD : '#3A3A3A',
                fontSize: '10px',
                fontWeight: active ? '600' : '400',
              }}
            >
              <span style={{ fontSize: '19px' }}>{link.icon}</span>
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
      left: 0, top: 0,
      width: '200px',
      height: '100vh',
      background: '#0D0D0D',
      borderRight: '1px solid #1A1A1A',
      padding: '24px 14px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '28px', paddingLeft: '10px' }}>
        <p style={{ color: '#fff', fontWeight: '700', fontSize: '15px', margin: '0 0 5px 0', letterSpacing: '-0.2px' }}>
          <span style={{ color: GOLD }}>✦</span> AI Ad Manager
        </p>
        <span style={{
          display: 'inline-block',
          background: GOLD_GLOW,
          border: `1px solid ${GOLD_DIM}`,
          borderRadius: '20px',
          padding: '2px 10px',
          fontSize: '10px',
          fontWeight: '600',
          color: GOLD,
          letterSpacing: '0.04em',
        }}>
          Pro Plan
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
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
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '7px',
                background: active ? GOLD_GLOW : 'transparent',
                border: `1px solid ${active ? GOLD_DIM : 'transparent'}`,
                color: active ? GOLD : '#2E2E2E',
                fontSize: '13px',
                fontWeight: active ? '600' : '400',
                boxShadow: active ? `0 0 12px ${GOLD_GLOW}` : 'none',
                letterSpacing: active ? '-0.1px' : '0',
              }}
            >
              <span style={{ fontSize: '14px', opacity: active ? 1 : 0.5 }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ paddingLeft: '10px', borderTop: '1px solid #1A1A1A', paddingTop: '14px' }}>
        <p style={{ color: '#252525', fontSize: '11px', margin: 0 }}>Krish · Sohscape</p>
      </div>
    </div>
  )
}

export default Nav
