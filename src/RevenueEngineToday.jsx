import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneCall, Clock3, Ban, ChevronRight, RefreshCw, ListChecks } from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { TEXT_PRIMARY, TEXT_TERTIARY, SUCCESS, WARNING, TEXT_SECONDARY } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import RevenueEngineSubNav from './RevenueEngineSubNav'
import RevenueEngineProfileBanner from './RevenueEngineProfileBanner'
import Card from './components/ui/Card'
import Button from './components/ui/Button'
import MetricCard from './components/ui/MetricCard'
import EmptyState from './components/ui/EmptyState'
import Skeleton from './components/ui/Skeleton'

const REC_ICON = { CALL: PhoneCall, FOLLOW_LATER: Clock3, IGNORE: Ban }
const REC_COLOR = { CALL: SUCCESS, FOLLOW_LATER: WARNING, IGNORE: TEXT_TERTIARY }

export default function RevenueEngineToday() {
  const navigate = useNavigate()
  const toast = useToast()
  const [prospects, setProspects] = useState([])
  const [counts, setCounts] = useState({ CALL: 0, FOLLOW_LATER: 0, IGNORE: 0 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/todays-priority`)
      const data = await res.json()
      if (data.success) { setProspects(data.prospects); setCounts(data.counts) }
      else toast.error(data.detail || 'Could not load today\'s tasks.')
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setLoading(false)
  }, [toast])

  useEffect(() => { load() }, [load])

  return (
    <PageShell maxWidth="820px">
      <RevenueEngineSubNav />
      <PageHeader
        title="Today's Tasks"
        sub="Top prospects by priority — excludes anything on cooldown, DNC, or already actioned today."
        action={
          <Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button>
        }
      />

      <RevenueEngineProfileBanner prospects={prospects} requireBlocked={false} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '18px' }}>
        <MetricCard label="Call" value={counts.CALL} />
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
        const Icon = REC_ICON[p.recommendation] || Ban
        const color = REC_COLOR[p.recommendation] || TEXT_TERTIARY
        return (
          <Card key={p.id} hoverable style={{ marginBottom: '8px' }}>
            <button onClick={() => navigate(`/revenue-engine/lead/${p.id}`)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
              padding: '14px 18px', cursor: 'pointer', border: 'none', background: 'transparent',
              color: TEXT_PRIMARY, textAlign: 'left', fontFamily: 'inherit',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={17} color={color} />
                <div>
                  <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '700' }}>{p.business_name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: TEXT_SECONDARY }}>
                    Opportunity {p.opportunity_score ?? '—'} · Need {p.need_score ?? '—'} · {p.priority} priority
                  </p>
                </div>
              </div>
              <ChevronRight size={16} color={TEXT_TERTIARY} />
            </button>
          </Card>
        )
      })}
    </PageShell>
  )
}
