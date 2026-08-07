import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { ACCENT, BG_SURFACE, BG_RAISED, BORDER_SUBTLE, TEXT_PRIMARY, TEXT_TERTIARY, FONT_BODY, radius, elevation } from './ds'

// Kept in sync with every route in App.jsx — this list going stale (it was
// missing Voice Outreach, Revenue Engine, and half a dozen others before
// this pass) is exactly the "modules nothing points to" problem the Aug
// 2026 IA review flagged. Add a line here whenever a new route is added
// to App.jsx, not just a hub link.
export const COMMAND_PALETTE_PAGES = [
  // Hubs (Phase A, Aug 2026 IA review)
  { label: 'Home',                   path: '/dashboard' },
  { label: 'Sales',                  path: '/sales' },
  { label: 'Marketing',              path: '/marketing' },
  { label: 'Intelligence',           path: '/intel' },
  { label: 'Analytics',              path: '/analytics' },
  { label: 'Settings',               path: '/settings' },
  // Sales
  { label: 'Sales — Pipeline',                 path: '/revenue-engine/pipeline' },
  { label: "Sales — Today's Queue",            path: '/revenue-engine/today' },
  { label: 'Sales — Goal / Discover',          path: '/revenue-engine' },
  { label: 'Leads (CRM)',                      path: '/leads' },
  { label: 'Prospect Discovery',               path: '/prospects' },
  { label: 'Outreach AI',                      path: '/outreach' },
  { label: 'Voice Outreach — Build Batch',     path: '/voice-outreach' },
  { label: 'Voice Outreach — Call Dashboard',  path: '/voice-outreach/calls' },
  { label: 'Voice Outreach — Analytics',       path: '/voice-outreach/analytics' },
  { label: 'Voice Outreach — DNC List',        path: '/voice-outreach/dnc' },
  { label: 'Voice Outreach — Settings',        path: '/voice-outreach/settings' },
  { label: 'Revenue Engine — Rate Card',       path: '/revenue-engine/settings' },
  // Marketing
  { label: 'Google Ads Dashboard',   path: '/google-ads/dashboard' },
  { label: 'Meta Ads Test',          path: '/meta-test' },
  { label: 'Sports Growth (CrickHub)', path: '/cricket-ads' },
  { label: 'Audience Finder',        path: '/audience' },
  { label: 'Offer Intelligence',     path: '/offer' },
  { label: 'Command Center',         path: '/command-center' },
  { label: 'Instagram Coach',        path: '/instagram-coach' },
  { label: 'Creative Studio',        path: '/creative-studio' },
  { label: 'Ad Creative',            path: '/ad-creative' },
  { label: 'Creator Finder',         path: '/creator-finder' },
  // Intelligence
  { label: 'Website Audit',          path: '/website-audit' },
  { label: 'Account Audit',          path: '/account-audit' },
  { label: 'Visibility',             path: '/visibility' },
  { label: 'AI Analyzer',            path: '/analyze' },
  { label: 'BI Platform',            path: '/intelligence' },
  { label: 'Marketing Brain',        path: '/brain' },
  { label: 'Smart Analysis',         path: '/smart-analysis' },
  { label: 'Marketing Intelligence', path: '/marketing-intelligence' },
  { label: 'Competitor',             path: '/competitor' },
  { label: 'Ad Intel',               path: '/ad-intel' },
  { label: 'Opportunity Engine',     path: '/opportunity' },
  { label: 'YouTube Intel',          path: '/youtube' },
  { label: 'Organic Intelligence',   path: '/organic-intelligence' },
  { label: 'Social Intelligence',    path: '/social-intelligence' },
  // Analytics
  { label: 'Performance Intelligence', path: '/performance' },
  { label: 'KPI Engine',             path: '/kpi-engine' },
  { label: 'AI Optimizer',           path: '/ai-optimizer' },
  { label: 'Result Center',          path: '/result-center' },
  { label: 'History',                path: '/history' },
  // Settings
  { label: 'Google Ads — Connect',   path: '/google-ads' },
  { label: 'Account',                path: '/account' },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const filtered = COMMAND_PALETTE_PAGES.filter(p => p.label.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  useEffect(() => { setActiveIndex(0) }, [query])

  function go(path) {
    setOpen(false)
    navigate(path)
  }

  function handleInputKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[activeIndex]) go(filtered[activeIndex].path)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(5,6,9,0.6)', zIndex: 200000,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh',
          }}
        >
          <style>{`.cmdk-box { transition: box-shadow 0.15s ease; } .cmdk-box:focus-within { box-shadow: ${elevation[3]}, 0 0 0 2px ${ACCENT}; }`}</style>
          <motion.div
            className="cmdk-box"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '560px', margin: '0 16px', background: `${BG_SURFACE}E8`,
              backdropFilter: 'blur(20px)', borderRadius: radius.lg,
              boxShadow: elevation[3], overflow: 'hidden', border: `1px solid ${BORDER_SUBTLE}`,
              fontFamily: FONT_BODY,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px',
              borderBottom: `1px solid ${BORDER_SUBTLE}`,
            }}>
              <Search size={16} color={TEXT_TERTIARY} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Jump to a page..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: TEXT_PRIMARY, fontSize: '15px', fontFamily: 'inherit',
                  boxShadow: 'none',
                }}
              />
              <kbd style={{ fontSize: '11px', color: TEXT_TERTIARY, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: radius.sm, padding: '2px 6px', background: BG_RAISED }}>Esc</kbd>
            </div>
            <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
              {filtered.length === 0 ? (
                <p style={{ color: TEXT_TERTIARY, fontSize: '13px', padding: '16px', textAlign: 'center', margin: 0 }}>No matches</p>
              ) : (
                filtered.map((p, i) => (
                  <div
                    key={p.path}
                    onClick={() => go(p.path)}
                    onMouseEnter={() => setActiveIndex(i)}
                    style={{
                      padding: '10px 14px', borderRadius: radius.sm, fontSize: '13.5px', cursor: 'pointer',
                      color: i === activeIndex ? '#0B0D12' : TEXT_PRIMARY,
                      background: i === activeIndex ? ACCENT : 'transparent',
                      fontWeight: i === activeIndex ? '700' : '400',
                    }}
                  >
                    {p.label}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
