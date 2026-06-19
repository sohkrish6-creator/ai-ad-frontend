import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Dna, Brain, Globe, Search,
  Radio, Palette, Target, Users,
} from 'lucide-react'

const GOLD = '#D4AF37'

const links = [
  { path: '/dashboard',    label: 'Dashboard',       Icon: LayoutDashboard },
  { path: '/intelligence', label: 'BI Platform',     Icon: Dna             },
  { path: '/brain',        label: 'Marketing Brain', Icon: Brain           },
  { path: '/analyze',      label: 'AI Analyzer',     Icon: Globe           },
  { path: '/competitor',   label: 'Competitor',      Icon: Search          },
  { path: '/ad-intel',     label: 'Ad Intel',        Icon: Radio           },
  { path: '/ad-creative',  label: 'Ad Creative',     Icon: Palette         },
  { path: '/audience',     label: 'Audience Finder', Icon: Target          },
  { path: '/leads',        label: 'Leads',           Icon: Users           },
]

function Nav() {
  const location = useLocation()
  const isMobile = window.innerWidth < 768

  // ── MOBILE bottom bar ────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <style>{`
          .nav-mobile-link { transition: color 0.1s; }
          .nav-mobile-link:hover { color: #333 !important; }
        `}</style>
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: '56px',
          background: '#fff',
          borderTop: '1px solid #EAEAEA',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          {links.map(({ path, label, Icon }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path} className="nav-mobile-link" style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                color: active ? '#171717' : '#AAAAAA',
                fontSize: '9px',
                fontWeight: active ? '500' : '400',
                letterSpacing: '0.02em',
              }}>
                <Icon size={15} strokeWidth={active ? 2 : 1.5} color={active ? GOLD : '#BBBBBB'} />
                {label}
              </Link>
            )
          })}
        </div>
      </>
    )
  }

  // ── DESKTOP sidebar ───────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');
        .nav-link { transition: background 0.15s ease, color 0.15s ease; }
        .nav-link:not(.active):hover { background: #F5F5F5 !important; color: #333 !important; }
        .nav-link:not(.active):hover svg { color: #888 !important; }
      `}</style>
      <div style={{
        position: 'fixed', left: 0, top: 0,
        width: '220px',
        height: '100vh',
        background: '#fff',
        borderRight: '1px solid #EAEAEA',
        padding: '20px 12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
      }}>

        {/* Logo */}
        <div style={{ padding: '4px 10px 28px' }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '-0.3px',
            color: '#171717',
          }}>
            <span style={{ color: GOLD, marginRight: '6px' }}>✦</span>
            AI Ad Manager
          </span>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {links.map(({ path, label, Icon }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`nav-link${active ? ' active' : ''}`}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: active ? '#F0F0F0' : 'transparent',
                  color: active ? '#171717' : '#888',
                  fontSize: '13px',
                  fontWeight: active ? '500' : '400',
                  letterSpacing: '-0.1px',
                }}
              >
                <Icon
                  size={14}
                  strokeWidth={active ? 2 : 1.5}
                  color={active ? GOLD : '#BBBBBB'}
                  style={{ flexShrink: 0 }}
                />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 10px 0', borderTop: '1px solid #EAEAEA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 0 2px #22C55E20',
              flexShrink: 0,
            }} />
            <span style={{ color: '#AAAAAA', fontSize: '11px' }}>Krish · Sohscape</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Nav
