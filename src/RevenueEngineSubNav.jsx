import { useNavigate, useLocation } from 'react-router-dom'
import { GOLD, MUTED, SLATE_L } from './ds'

// Same discipline as VoiceOutreachSubNav — every Revenue Engine page must be
// reachable in one click from every other one, not just via a linear flow.
const LINKS = [
  { path: '/revenue-engine', label: 'Goal' },
  { path: '/revenue-engine/pipeline', label: 'Pipeline' },
  { path: '/revenue-engine/today', label: "Today's Tasks" },
  { path: '/revenue-engine/settings', label: 'Rate Card' },
]

export default function RevenueEngineSubNav() {
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
