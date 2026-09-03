import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PhoneCall, Clock3, Ban, ChevronRight, RefreshCw, ListChecks, Send,
  Wallet, Users, Flame, CalendarClock, FileText,
} from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import {
  TEXT_PRIMARY, TEXT_TERTIARY, TEXT_SECONDARY, SUCCESS, WARNING,
  BG_SURFACE, BORDER_SUBTLE, radius,
} from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import RevenueEngineSubNav from './RevenueEngineSubNav'
import RevenueEngineProfileBanner from './RevenueEngineProfileBanner'
import Card from './components/ui/Card'
import Button from './components/ui/Button'
import Badge from './components/ui/Badge'
import MetricCard from './components/ui/MetricCard'
import EmptyState from './components/ui/EmptyState'
import Skeleton from './components/ui/Skeleton'

const REC_ICON = { CALL: PhoneCall, SEND_FOLLOW_UP: Send, FOLLOW_LATER: Clock3, IGNORE: Ban }
const REC_COLOR = { CALL: SUCCESS, SEND_FOLLOW_UP: SUCCESS, FOLLOW_LATER: WARNING, IGNORE: TEXT_TERTIARY }
const ACTION_LABEL = { CALL: 'Call', SEND_FOLLOW_UP: 'Send follow-up', FOLLOW_LATER: 'Follow later', IGNORE: 'Ignore' }
const URGENCY_VARIANT = { high: 'danger', medium: 'warning', low: 'neutral' }

// Post-audit fix (Revenue Dashboard): EmptyState's own layout (48px
// padding, centered icon/headline/description/button) is built for a full
// empty panel, not a tile-sized slot in a metric grid next to MetricCard —
// forcing it into one produced uneven, oversized cells. This reuses
// MetricCard's own visual container (background/border/radius/padding) at
// the same footprint, with EmptyState's honesty contract kept: it must
// name what's missing, never render a fabricated number in its place.
function UnavailableMetricTile({ label, reason, actionRoute, actionLabel, navigate }) {
  return (
    <div style={{
      background: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: radius.lg,
      padding: '18px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div>
        <p style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, margin: '0 0 10px' }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: TEXT_SECONDARY, lineHeight: 1.4 }}>{reason}</p>
      </div>
      {actionRoute && (
        <button onClick={() => navigate(actionRoute)} style={{
          marginTop: '10px', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          color: SUCCESS, fontSize: '12px', fontWeight: 700, textAlign: 'left', fontFamily: 'inherit',
        }}>
          {actionLabel} →
        </button>
      )}
    </div>
  )
}

function formatInr(amountMicros) {
  const rupees = Math.round((amountMicros || 0) / 1_000_000)
  return `₹${rupees.toLocaleString('en-IN')}`
}

const METRIC_TILES = [
  { key: 'pipeline_value', label: 'Pipeline Value', icon: Wallet, format: m => formatInr(m.amount_micros) },
  { key: 'open_opportunities', label: 'Open Opportunities', icon: Users, format: m => m.count },
  { key: 'high_priority_prospects', label: 'High-Priority Prospects', icon: Flame, format: m => m.count },
  { key: 'followups_due', label: 'Follow-ups Due', icon: Send, format: m => m.count },
  { key: 'meetings_today', label: 'Meetings Today', icon: CalendarClock, format: m => m.count },
  { key: 'proposals_pending', label: 'Proposals Pending', icon: FileText, format: m => m.count },
]

export default function RevenueEngineToday() {
  const navigate = useNavigate()
  const toast = useToast()
  const [prospects, setProspects] = useState([])
  const [counts, setCounts] = useState({ CALL: 0, SEND_FOLLOW_UP: 0, FOLLOW_LATER: 0, IGNORE: 0 })
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/todays-priority`)
      const data = await res.json()
      if (data.success) { setProspects(data.prospects); setCounts(data.counts); setMetrics(data.metrics || null) }
      else toast.error(data.detail || 'Could not load today\'s tasks.')
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setLoading(false)
  }, [toast])

  useEffect(() => { load() }, [load])

  return (
    <PageShell maxWidth="820px">
      <RevenueEngineSubNav />
      <PageHeader
        title="Today's Priorities"
        sub="Who to contact today, why, and what to do — excludes anything on cooldown, DNC, suppressed, or already actioned."
        action={
          <Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button>
        }
      />

      <RevenueEngineProfileBanner prospects={prospects} requireBlocked={false} />

      {/* Dashboard metrics — each tile is either a real computed number or
          an explicit reason it isn't available. Never a hardcoded/fabricated
          value; a missing integration is named, not hidden. */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '14px' }}>
          {METRIC_TILES.map(({ key, label, icon, format }) => {
            const m = metrics[key]
            if (!m) return null
            if (!m.available) {
              return (
                <UnavailableMetricTile
                  key={key} label={label} reason={m.reason} navigate={navigate}
                  actionRoute={m.missing_module_route}
                  actionLabel={m.missing_module_route ? 'Set it up' : null}
                />
              )
            }
            return <MetricCard key={key} label={label} value={format(m)} icon={icon} />
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '18px' }}>
        <MetricCard label="Call" value={counts.CALL} />
        <MetricCard label="Send Follow-up" value={counts.SEND_FOLLOW_UP} />
        <MetricCard label="Follow Later" value={counts.FOLLOW_LATER} />
        <MetricCard label="Ignore" value={counts.IGNORE} />
      </div>

      {loading && <Skeleton variant="rect" height="66px" count={4} style={{ marginBottom: '8px' }} />}

      {!loading && prospects.length === 0 && (
        <Card>
          <EmptyState
            icon={ListChecks}
            headline="Nothing queued right now"
            description="Run a Quick Scan from the Goal page to fill your pipeline."
            action={{ label: 'Go to Discover', onClick: () => navigate('/revenue-engine') }}
          />
        </Card>
      )}

      {prospects.map(p => {
        const nba = p.next_best_action
        const actionType = nba?.action_type || p.recommendation
        const Icon = REC_ICON[actionType] || Ban
        const color = REC_COLOR[actionType] || TEXT_TERTIARY
        return (
          <Card key={p.id} hoverable style={{ marginBottom: '8px' }}>
            <button onClick={() => navigate(nba?.target_route || `/revenue-engine/lead/${p.id}`)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%',
              padding: '14px 18px', cursor: 'pointer', border: 'none', background: 'transparent',
              color: TEXT_PRIMARY, textAlign: 'left', fontFamily: 'inherit', gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                <Icon size={17} color={color} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '700' }}>{p.business_name}</p>
                    <Badge variant="accent">{ACTION_LABEL[actionType] || actionType}</Badge>
                    {nba?.urgency && <Badge variant={URGENCY_VARIANT[nba.urgency] || 'neutral'}>{nba.urgency}</Badge>}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: TEXT_SECONDARY }}>
                    Opportunity {p.opportunity_score ?? '—'} · Need {p.need_score ?? '—'} · {p.priority} priority
                  </p>
                  {nba?.reason && (
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: TEXT_SECONDARY, lineHeight: 1.4 }}>{nba.reason}</p>
                  )}
                </div>
              </div>
              <ChevronRight size={16} color={TEXT_TERTIARY} style={{ flexShrink: 0, marginTop: '2px' }} />
            </button>
          </Card>
        )
      })}
    </PageShell>
  )
}
