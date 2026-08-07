import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, User, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from './AuthContext'
import { supabase } from './lib/supabase'
import { links, settingsLink, activePath } from './Nav'
import { COMMAND_PALETTE_PAGES } from './CommandPalette'
import { BG_SURFACE, BORDER_SUBTLE, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, ACCENT, BG_RAISED, FONT_BODY, radius } from './ds'

const TOPBAR_HEIGHT = 56

/** Resolve the current hub label + a more specific page label (if any) for the breadcrumb. */
function useBreadcrumb(pathname) {
  const hubPath = activePath(pathname)
  const hub = [...links, settingsLink].find(l => l.path === hubPath)
  // Longest-prefix match against the full page list (already maintained
  // for the command palette) gives a specific page label without this
  // component needing its own per-route name table.
  let best = null, bestLen = -1
  for (const p of COMMAND_PALETTE_PAGES) {
    if ((pathname === p.path || pathname.startsWith(p.path + '/')) && p.path.length > bestLen) {
      best = p; bestLen = p.path.length
    }
  }
  let pageLabel = best?.label || null
  if (pageLabel && hub && pageLabel.startsWith(hub.label + ' — ')) {
    pageLabel = pageLabel.slice(hub.label.length + 3)
  } else if (pageLabel === hub?.label) {
    pageLabel = null
  }
  return { hubLabel: hub?.label || 'Adsoh', pageLabel }
}

/**
 * TopBar — sticky, glass. Breadcrumb (reuses Nav.jsx's activePath/links —
 * no separate route-name table) + a search field that opens the existing
 * CommandPalette (via the same synthetic ⌘K keydown dispatch Nav.jsx's
 * mobile search button already uses — CommandPalette's own open/close
 * logic is untouched) + notifications placeholder + user menu (reuses
 * useAuth()/supabase signOut, doesn't reimplement Nav.jsx's logout).
 */
export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hubLabel, pageLabel } = useBreadcrumb(location.pathname)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function openPalette() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
  }

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 500, height: `${TOPBAR_HEIGHT}px`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
      padding: '0 20px', marginBottom: '4px',
      background: `${BG_SURFACE}CC`, backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${BORDER_SUBTLE}`, boxSizing: 'border-box', fontFamily: FONT_BODY,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: TEXT_TERTIARY, flexShrink: 0, minWidth: 0 }}>
        <span>{hubLabel}</span>
        {pageLabel && (
          <>
            <ChevronRight size={13} />
            <span style={{ color: TEXT_PRIMARY, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageLabel}</span>
          </>
        )}
      </div>

      <button
        onClick={openPalette}
        style={{
          flex: 1, maxWidth: '420px', display: 'flex', alignItems: 'center', gap: '8px',
          background: BG_RAISED, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: radius.md,
          padding: '7px 12px', cursor: 'pointer', color: TEXT_TERTIARY, fontSize: '12.5px', fontFamily: FONT_BODY,
        }}
      >
        <Search size={14} />
        <span style={{ flex: 1, textAlign: 'left' }}>Search or jump to a page...</span>
        <kbd style={{ fontSize: '10px', fontWeight: 600, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: radius.sm, padding: '2px 5px' }}>⌘K</kbd>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <button
          title="Notifications (nothing wired up yet)"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', color: TEXT_TERTIARY }}
        >
          <Bell size={16} />
        </button>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px',
              borderRadius: '50%', background: BG_RAISED, border: `1px solid ${BORDER_SUBTLE}`,
              color: ACCENT, fontSize: '12px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            {user?.email?.[0]?.toUpperCase() || <User size={14} />}
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: '200px',
              background: `${BG_SURFACE}F5`, backdropFilter: 'blur(20px)', border: `1px solid ${BORDER_SUBTLE}`,
              borderRadius: radius.md, boxShadow: '0 16px 48px rgba(0,0,0,.6)', overflow: 'hidden', zIndex: 600,
            }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BORDER_SUBTLE}`, fontSize: '12px', color: TEXT_SECONDARY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || 'Sohscape'}
              </div>
              <Link to="/account" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', fontSize: '12.5px', color: TEXT_PRIMARY, textDecoration: 'none' }}>
                <User size={13} /> Account
              </Link>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '9px 14px', fontSize: '12.5px', color: TEXT_PRIMARY, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, textAlign: 'left' }}>
                <LogOut size={13} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { TOPBAR_HEIGHT }
