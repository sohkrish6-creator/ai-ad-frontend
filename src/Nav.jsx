import { Link, useLocation } from 'react-router-dom'

const GOLD     = '#D4AF37'
const GOLD_BG  = '#D4AF3708'
const GOLD_BDR = '#D4AF3726'

function Nav() {
  const location = useLocation()
  const isMobile = window.innerWidth < 768

  const links = [
    { path: '/dashboard',    label: 'Dashboard',       icon: '📊' },
    { path: '/intelligence', label: 'BI Platform',     icon: '🧬' },
    { path: '/brain',        label: 'Marketing Brain', icon: '🧠' },
    { path: '/analyze',      label: 'AI Analyzer',     icon: '🌐' },
    { path: '/competitor',   label: 'Competitor',      icon: '🔍' },
    { path: '/ad-intel',     label: 'Ad Intel',        icon: '📡' },
    { path: '/ad-creative',  label: 'Ad Creative',     icon: '🎨' },
    { path: '/audience',     label: 'Audience Finder', icon: '🎯' },
    { path: '/leads',        label: 'Leads',           icon: '👥' },
  ]

  // ── MOBILE bottom bar ─────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '56px',
        background: '#0A0A0A',
        borderTop: '1px solid #181818',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        {links.map(link => {
          const active = location.pathname === link.path
          return (
            <Link key={link.path} to={link.path} style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              color: active ? GOLD : '#383838',
              fontSize: '9px',
              fontWeight: active ? '600' : '400',
              letterSpacing: active ? '0.01em' : '0',
            }}>
              <span style={{ fontSize: '16px', opacity: active ? 1 : 0.35 }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </div>
    )
  }

  // ── DESKTOP sidebar ───────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', left: 0, top: 0,
      width: '216px',
      height: '100vh',
      background: '#0A0A0A',
      borderRight: '1px solid #161616',
      padding: '28px 10px 24px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Logo */}
      <div style={{ padding: '0 12px', marginBottom: '36px' }}>
        <p style={{
          color: '#D8D8D8',
          fontWeight: '600',
          fontSize: '14px',
          margin: 0,
          letterSpacing: '-0.2px',
        }}>
          <span style={{ color: GOLD }}>✦</span> AI Ad Manager
        </p>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {links.map(link => {
          const active = location.pathname === link.path
          return (
            <Link key={link.path} to={link.path} style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '7px 12px 7px 10px',
              borderRadius: '6px',
              borderLeft: `2px solid ${active ? GOLD : 'transparent'}`,
              background: active ? GOLD_BG : 'transparent',
              color: active ? GOLD : '#383838',
              fontSize: '13px',
              fontWeight: active ? '500' : '400',
              letterSpacing: '-0.1px',
              transition: 'color 0.12s',
            }}>
              <span style={{ fontSize: '13px', opacity: active ? 0.9 : 0.3, flexShrink: 0 }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 12px 0', borderTop: '1px solid #141414' }}>
        <p style={{ color: '#242424', fontSize: '11px', margin: 0 }}>Krish · Sohscape</p>
      </div>
    </div>
  )
}

export default Nav
