import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Rocket, Wand2, Dna, BarChart2, Settings2, Menu, X, LogOut, User,
  ChevronsLeft, ChevronsRight,
} from 'lucide-react'
import { useAuth } from './AuthContext'
import { supabase } from './lib/supabase'
import {
  BG_BASE, BG_SURFACE, BG_RAISED, BORDER_SUBTLE, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY,
  ACCENT, ACCENT_MUTED, SUCCESS, FONT_BODY, radius,
} from './ds'

const NAV_COLLAPSED_KEY = 'adsoh_nav_collapsed'
const SIDEBAR_WIDTH_EXPANDED = 220
const SIDEBAR_WIDTH_COLLAPSED = 64
const SIDEBAR_INSET = 12

// AdSOH IA review (Aug 2026), Phase A: 5 top-level hubs instead of ~30 flat
// entries — every existing page still works, just re-parented under a hub
// (see SalesHub.jsx / MarketingHub.jsx / IntelligenceHub.jsx / AnalyticsHub.jsx
// / SettingsHub.jsx). `match` lists every route prefix that should light up
// this nav item, so a page reached via a hub link (or a direct URL/bookmark)
// still shows where you are — longest-prefix match resolves any overlap.
// Exported (with settingsLink/activePath below) so TopBar.jsx's breadcrumb
// can reuse the exact same hub-resolution logic instead of duplicating it.
export const links = [
  { path: '/dashboard', label: 'Home',         Icon: LayoutDashboard, match: ['/dashboard'] },
  { path: '/sales',     label: 'Sales',        Icon: Rocket,          match: ['/sales', '/revenue-engine', '/voice-outreach', '/prospects', '/leads', '/outreach'] },
  { path: '/marketing', label: 'Marketing',    Icon: Wand2,           match: ['/marketing', '/google-ads/dashboard', '/cricket-ads', '/audience', '/offer', '/command-center', '/instagram-coach', '/creative-studio', '/creative-director', '/ad-creative', '/ad-to-creative', '/creator-finder'] },
  { path: '/intel',     label: 'Intelligence', Icon: Dna,             match: ['/intel', '/website-audit', '/account-audit', '/visibility', '/analyze', '/intelligence', '/brain', '/smart-analysis', '/marketing-intelligence', '/competitor', '/ad-intel', '/opportunity', '/youtube', '/organic-intelligence', '/social-intelligence'] },
  { path: '/analytics', label: 'Analytics',    Icon: BarChart2,       match: ['/analytics', '/performance', '/kpi-engine', '/ai-optimizer', '/result-center', '/history'] },
]

export const settingsLink = { path: '/settings', label: 'Settings', Icon: Settings2, match: ['/settings', '/account', '/google-ads', '/meta-test'] }

function isActive(link, pathname) {
  return link.match.some(p => pathname === p || pathname.startsWith(p + '/'))
}

// Longest matching prefix across every nav item (5 hubs + Settings) wins —
// so e.g. /google-ads/dashboard (Marketing) doesn't get shadowed by the
// shorter /google-ads (Settings) prefix.
export function activePath(pathname) {
  const all = [...links, settingsLink]
  let best = null, bestLen = -1
  for (const link of all) {
    for (const p of link.match) {
      if ((pathname === p || pathname.startsWith(p + '/')) && p.length > bestLen) {
        best = link.path; bestLen = p.length
      }
    }
  }
  return best
}

export function getNavCollapsed() {
  try { return localStorage.getItem(NAV_COLLAPSED_KEY) === '1' } catch { return false }
}

export function sidebarContentOffset(collapsed) {
  return (collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED) + SIDEBAR_INSET * 2
}

function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(getNavCollapsed)
  const isMobile = window.innerWidth < 768
  const active = activePath(location.pathname)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // Close drawer whenever route changes — Nav stays mounted between pages
  // so drawerOpen state would otherwise persist across navigations
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  function toggleCollapsed() {
    setCollapsed(c => {
      const next = !c
      try { localStorage.setItem(NAV_COLLAPSED_KEY, next ? '1' : '0') } catch { /* localStorage unavailable */ }
      window.dispatchEvent(new CustomEvent('adsoh:nav-collapsed', { detail: next }))
      return next
    })
  }

  const NavItem = ({ path, label, Icon, mobile }) => {
    const isOn = active === path
    return (
      <Link
        key={path}
        to={path}
        title={!mobile && collapsed ? label : undefined}
        className={`${mobile ? 'nav-drawer-link' : 'nav-link'}${isOn ? ' active' : ''}`}
        onClick={mobile ? () => setDrawerOpen(false) : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: mobile ? 10 : 10,
          padding: mobile ? '9px 10px' : (collapsed ? '9px 0' : '9px 10px'),
          justifyContent: !mobile && collapsed ? 'center' : 'flex-start',
          borderRadius: radius.sm,
          borderLeft: isOn ? `2px solid ${ACCENT}` : '2px solid transparent',
          background: isOn ? ACCENT_MUTED : 'transparent',
          color: isOn ? TEXT_PRIMARY : TEXT_SECONDARY,
          fontSize: '13.5px', fontWeight: isOn ? '600' : '500',
          letterSpacing: '-0.1px', textDecoration: 'none',
        }}
      >
        <Icon size={15} strokeWidth={isOn ? 2 : 1.5} color={isOn ? ACCENT : TEXT_SECONDARY} style={{ flexShrink: 0 }} />
        {(mobile || !collapsed) && label}
      </Link>
    )
  }

  if (isMobile) {
    return (
      <>
        <style>{`
          .nav-drawer-link { text-decoration: none; transition: background 0.12s ease; }
          .nav-drawer-link:not(.active):hover { background: ${BG_RAISED} !important; }
        `}</style>

        {/* Fixed top bar */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '48px',
          background: BG_BASE, borderBottom: `1px solid ${BORDER_SUBTLE}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', zIndex: 1000, boxSizing: 'border-box',
        }}>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', margin: '-6px', display: 'flex', alignItems: 'center' }}
          >
            <Menu size={20} color={TEXT_SECONDARY} />
          </button>
          <span style={{
            fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px', color: TEXT_PRIMARY,
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            pointerEvents: 'none', fontFamily: FONT_BODY,
          }}>
            <span style={{ color: ACCENT, marginRight: '4px' }}>✦</span>Adsoh
          </span>
          <kbd
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            style={{
              fontSize: '10px', color: TEXT_SECONDARY, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: radius.sm,
              padding: '3px 6px', fontWeight: '600', cursor: 'pointer', background: BG_SURFACE,
              fontFamily: FONT_BODY,
            }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Overlay */}
        {drawerOpen && (
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.65)', zIndex: 1500,
            }}
          />
        )}

        {/* Slide-in drawer */}
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '260px', height: '100vh',
          background: BG_BASE, borderRight: `1px solid ${BORDER_SUBTLE}`,
          zIndex: 2000, boxSizing: 'border-box',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
          padding: '0 12px 20px',
          overflowY: 'auto',
          fontFamily: FONT_BODY,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px 22px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px', color: TEXT_PRIMARY, fontFamily: FONT_BODY }}>
              <span style={{ color: ACCENT, marginRight: '5px' }}>✦</span>Adsoh
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              <X size={18} color={TEXT_SECONDARY} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {links.map(l => <NavItem key={l.path} {...l} mobile />)}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ padding: '10px 0 0', borderTop: `1px solid ${BORDER_SUBTLE}`, marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <NavItem {...settingsLink} mobile />
          </div>

          <div style={{ padding: '14px 10px 0', borderTop: `1px solid ${BORDER_SUBTLE}`, marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: user ? '8px' : '0' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: SUCCESS, boxShadow: `0 0 0 2px rgba(52,211,153,0.2)`, flexShrink: 0 }} />
              <span style={{ color: TEXT_SECONDARY, fontSize: '11px', fontFamily: FONT_BODY }}>{user?.email || 'Sohscape'}</span>
            </div>
            {user && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: TEXT_SECONDARY, fontSize: '11px', textDecoration: 'none', padding: '4px 0' }}>
                  <User size={11} /> Account
                </Link>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: TEXT_SECONDARY, fontSize: '11px', cursor: 'pointer', padding: '4px 0', fontFamily: FONT_BODY }}>
                  <LogOut size={11} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  // ── DESKTOP sidebar — floating panel, inset from every viewport edge ──────
  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED
  return (
    <>
      <style>{`
        .nav-link { transition: background-color 0.12s ease, color 0.12s ease; text-decoration: none; }
        .nav-link:not(.active):hover { background: ${BG_RAISED} !important; color: ${TEXT_PRIMARY} !important; }
        .nav-link:not(.active):hover svg { color: ${TEXT_PRIMARY} !important; }
      `}</style>
      <div style={{
        position: 'fixed', left: SIDEBAR_INSET, top: SIDEBAR_INSET, bottom: SIDEBAR_INSET,
        width: `${width}px`,
        background: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: radius.lg,
        padding: '16px 10px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        fontFamily: FONT_BODY, transition: 'width 0.16s ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '4px 0 20px' : '4px 8px 20px',
        }}>
          {!collapsed && (
            <span style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px', color: TEXT_PRIMARY }}>
              <span style={{ color: ACCENT, marginRight: '5px' }}>✦</span>Adsoh
            </span>
          )}
          {collapsed && <span style={{ color: ACCENT, fontSize: '17px' }}>✦</span>}
        </div>

        {!collapsed && (
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            title="Open command palette"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
              fontSize: '11px', color: TEXT_TERTIARY, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: radius.sm,
              padding: '6px 9px', fontWeight: '500', cursor: 'pointer', background: BG_BASE,
              marginBottom: '14px', fontFamily: FONT_BODY,
            }}
          >
            Search... <kbd style={{ fontSize: '10px', fontWeight: 600 }}>⌘K</kbd>
          </button>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {links.map(l => <NavItem key={l.path} {...l} />)}
        </div>

        <div style={{ flex: 1 }} />

        {/* Settings — bottom-anchored, visually separated, not a nav peer */}
        <div style={{ borderTop: `1px solid ${BORDER_SUBTLE}`, paddingTop: '10px', marginBottom: '10px' }}>
          <NavItem {...settingsLink} />
        </div>

        <div style={{ padding: collapsed ? '12px 0 0' : '12px 8px 0', borderTop: `1px solid ${BORDER_SUBTLE}`, marginTop: '4px' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: user ? '8px' : '0' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: SUCCESS, boxShadow: `0 0 0 2px rgba(52,211,153,0.2)`, flexShrink: 0 }} />
              <span style={{ color: TEXT_SECONDARY, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'Sohscape'}</span>
            </div>
          )}
          {user && !collapsed && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: TEXT_SECONDARY, fontSize: '11px', textDecoration: 'none' }}>
                <User size={11} /> Account
              </Link>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: TEXT_SECONDARY, fontSize: '11px', cursor: 'pointer', padding: 0, fontFamily: FONT_BODY }}>
                <LogOut size={11} /> Log out
              </button>
            </div>
          )}
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '6px', width: '100%', background: 'none', border: 'none', color: TEXT_TERTIARY,
              fontSize: '11px', cursor: 'pointer', padding: '4px 0', fontFamily: FONT_BODY,
            }}
          >
            {collapsed ? <ChevronsRight size={13} /> : <><ChevronsLeft size={13} /> Collapse</>}
          </button>
        </div>
      </div>
    </>
  )
}

export default Nav
