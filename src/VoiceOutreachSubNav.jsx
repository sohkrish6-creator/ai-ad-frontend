import { useNavigate, useLocation } from 'react-router-dom'
import { GOLD, MUTED, SLATE_L } from './ds'

// Every Voice Outreach page must be reachable in one click from every other
// one. Confirmed bug: Nav.jsx has exactly one entry for the whole module
// (Batch Builder), and Settings/DNC had ZERO incoming links from anywhere in
// the app — built, routed, completely unreachable except by typing the URL.
// Call Dashboard/Analytics were only reachable via a one-way chain (Batch
// Builder -> Review -> Calls), not directly. This bar fixes that everywhere
// at once instead of patching each page's header individually.
const LINKS = [
  { path: '/voice-outreach', label: 'Build Batch' },
  { path: '/voice-outreach/calls', label: 'Call Dashboard' },
  { path: '/voice-outreach/analytics', label: 'Analytics' },
  { path: '/voice-outreach/dnc', label: 'DNC List' },
  { path: '/voice-outreach/settings', label: 'Settings' },
]

export default function VoiceOutreachSubNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
      {LINKS.map(l => {
        const active = location.pathname === l.path
        return (
          <button
            key={l.path}
            onClick={() => !active && navigate(l.path)}
            style={{
              background: active ? 'rgba(201,162,39,0.14)' : 'transparent',
              border: `1px solid ${active ? GOLD : SLATE_L}`,
              color: active ? GOLD : MUTED,
              padding: '6px 13px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600',
              cursor: active ? 'default' : 'pointer',
            }}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}
