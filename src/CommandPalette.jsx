import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

const GOLD = '#C9A227'

export const COMMAND_PALETTE_PAGES = [
  { label: 'Dashboard',          path: '/dashboard' },
  { label: 'Marketing Brain',    path: '/brain' },
  { label: 'Smart Analysis',     path: '/smart-analysis' },
  { label: 'BI Platform',        path: '/intelligence' },
  { label: 'AI Analyzer',        path: '/analyze' },
  { label: 'Competitor',         path: '/competitor' },
  { label: 'Ad Intel',           path: '/ad-intel' },
  { label: 'Ad Creative',        path: '/ad-creative' },
  { label: 'Audience Finder',    path: '/audience' },
  { label: 'Leads',              path: '/leads' },
  { label: 'YouTube Intel',      path: '/youtube' },
  { label: 'Opportunity Engine', path: '/opportunity' },
  { label: 'Offer Intelligence', path: '/offer' },
  { label: 'Website Audit',      path: '/website-audit' },
  { label: 'Visibility',         path: '/visibility' },
  { label: 'Outreach AI',        path: '/outreach' },
  { label: 'KPI Engine',         path: '/kpi-engine' },
  { label: 'Performance',        path: '/performance' },
  { label: 'AI Optimizer',       path: '/ai-optimizer' },
  { label: 'Result Center',      path: '/result-center' },
  { label: 'Prospects',          path: '/prospects' },
  { label: 'Command Center',     path: '/command-center' },
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

  if (!open) return null

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh',
      }}
    >
      <style>{`.cmdk-box { transition: box-shadow 0.15s ease; } .cmdk-box:focus-within { box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 2px ${GOLD}; }`}</style>
      <div className="cmdk-box" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '560px', margin: '0 16px', background: '#23242B', borderRadius: '12px',
        boxShadow: '0 28px 64px rgba(0,0,0,0.7)', overflow: 'hidden', border: '1px solid #2E2F38',
        fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px',
          borderBottom: '1px solid #2E2F38',
        }}>
          <Search size={16} color="#8A8A92" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Jump to a page..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#EDEAE3', fontSize: '15px', fontFamily: 'inherit',
              boxShadow: 'none',
            }}
          />
          <kbd style={{ fontSize: '11px', color: '#8A8A92', border: '1px solid #2E2F38', borderRadius: '4px', padding: '2px 6px', background: '#1A1B22' }}>Esc</kbd>
        </div>
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {filtered.length === 0 ? (
            <p style={{ color: '#8A8A92', fontSize: '13px', padding: '16px', textAlign: 'center', margin: 0 }}>No matches</p>
          ) : (
            filtered.map((p, i) => (
              <div
                key={p.path}
                onClick={() => go(p.path)}
                onMouseEnter={() => setActiveIndex(i)}
                style={{
                  padding: '10px 14px', borderRadius: '7px', fontSize: '13.5px', cursor: 'pointer',
                  color: i === activeIndex ? '#0B0B0D' : '#EDEAE3',
                  background: i === activeIndex ? GOLD : 'transparent',
                  fontWeight: i === activeIndex ? '700' : '400',
                }}
              >
                {p.label}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
