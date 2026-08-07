import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Clock, PhoneCall, Users, ChevronRight, Inbox, Radar } from 'lucide-react'
import { BACKEND, apiFetch } from './lib/api'
import { TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, ACCENT, BG_INSET, DANGER, DANGER_MUTED, errBox, scoreColor, radius } from './ds'
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

const WEAKNESS_LABELS = {
  no_website: 'No Website', poor_reviews: 'Poor Reviews', low_review_count: 'Few Reviews',
  inactive_listing: 'Inactive Listing', missing_tracking: 'No Ad Tracking',
  weak_seo_meta: 'Weak SEO Meta', weak_seo_title: 'Weak SEO Title', no_cta: 'No Clear CTA',
  site_unreachable: 'Site Unreachable',
}

const REC_VARIANT = { CALL: 'success', FOLLOW_LATER: 'warning', IGNORE: 'neutral' }
const REC_LABEL = { CALL: 'Call', FOLLOW_LATER: 'Follow Later', IGNORE: 'Ignore' }

function RecBadge({ rec }) {
  return <Badge variant={REC_VARIANT[rec] || 'neutral'}>{REC_LABEL[rec] || rec}</Badge>
}

export default function RevenueEnginePipeline() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const batchId = params.get('batch')

  const [batches, setBatches] = useState([])
  const [batch, setBatch] = useState(null)
  const [prospects, setProspects] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!batchId) {
      try {
        const res = await apiFetch(`${BACKEND}/voice-outreach/batches`)
        const data = await res.json()
        if (data.success) setBatches(data.batches.filter(b => b.channel === 'revenue_engine'))
      } catch { /* transient */ }
      return
    }
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/batches/${batchId}`)
      const data = await res.json()
      if (data.success) {
        setBatch(data.batch)
        const rank = { high: 2, medium: 1, low: 0 }
        const sorted = [...data.prospects].sort((a, b) => {
          const pr = (rank[b.priority] ?? -1) - (rank[a.priority] ?? -1)
          if (pr !== 0) return pr
          return (b.need_score ?? -1) - (a.need_score ?? -1)
        })
        setProspects(sorted)
      } else {
        setError(data.detail || 'Batch not found.')
      }
    } catch { /* transient */ }
  }, [batchId])

  useEffect(() => {
    let cancelled = false
    async function poll() { if (!cancelled) await load() }
    poll()
    const interval = setInterval(poll, 2000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [load])

  if (!batchId) {
    return (
      <PageShell maxWidth="720px">
        <RevenueEngineSubNav />
        <PageHeader title="Pipeline" sub="Pick a Quick Scan run to review, or start a new one from the Goal page." />
        {batches.length === 0 ? (
          <Card>
            <EmptyState
              icon={Radar}
              headline="No Quick Scan runs yet"
              description="Start one from the Goal page to discover and qualify real local prospects."
              action={{ label: 'Go to Discover', onClick: () => navigate('/revenue-engine') }}
            />
          </Card>
        ) : batches.map(b => (
          <Card key={b.id} hoverable style={{ marginBottom: '8px' }}>
            <button onClick={() => navigate(`/revenue-engine/pipeline?batch=${b.id}`)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
              padding: '14px 16px', cursor: 'pointer', border: 'none', background: 'transparent',
              color: TEXT_PRIMARY, textAlign: 'left', fontFamily: 'inherit',
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{b.industry}{b.city ? ` in ${b.city}` : ''}</p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: TEXT_TERTIARY }}>{b.status} · {b.total_qualified || 0}/{b.total_found || 0} qualified</p>
              </div>
              <ChevronRight size={16} color={TEXT_TERTIARY} />
            </button>
          </Card>
        ))}
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell maxWidth="960px">
        <RevenueEngineSubNav />
        <PageHeader title="Pipeline" sub="" />
        <div style={errBox}>{error}</div>
      </PageShell>
    )
  }

  if (!batch) {
    return (
      <PageShell maxWidth="960px">
        <RevenueEngineSubNav />
        <PageHeader title="Pipeline" sub="Loading..." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rect" height="76px" />)}
        </div>
        <Skeleton variant="rect" height="80px" count={3} style={{ marginBottom: '8px' }} />
      </PageShell>
    )
  }

  const isRunning = batch.status === 'queued' || batch.status === 'running'
  const high = prospects.filter(p => p.priority === 'high').length
  const callFirst = prospects.filter(p => p.recommendation === 'CALL').length

  return (
    <PageShell maxWidth="960px">
      <RevenueEngineSubNav />
      <PageHeader
        title="Pipeline"
        sub={`${batch.industry}${batch.city ? ' in ' + batch.city : ''}`}
        action={
          <Button variant="primary" icon={PhoneCall} onClick={() => navigate('/revenue-engine/today')}>
            Go to Today's Tasks
          </Button>
        }
      />

      <RevenueEngineProfileBanner prospects={prospects} />

      {isRunning && (
        <Card style={{ padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Clock size={15} color={ACCENT} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: TEXT_PRIMARY }}>{batch.current_step || 'Working...'}</p>
          </div>
          <div style={{ height: '8px', borderRadius: radius.sm, background: BG_INSET, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${batch.progress_pct || 0}%`, background: ACCENT, borderRadius: radius.sm, transition: 'width 0.4s ease' }} />
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '18px' }}>
        <MetricCard label="Scanned" value={batch.total_found || 0} />
        <MetricCard label="High Opportunity" value={high} />
        <MetricCard label="Call-First" value={callFirst} />
        <MetricCard label="Qualified" value={batch.total_qualified || 0} />
      </div>

      {batch.status === 'succeeded' && prospects.length === 0 && (
        <Card>
          <EmptyState icon={Inbox} headline="No prospects found for this search" description="Try a broader industry or a different city from the Goal page." action={{ label: 'Back to Discover', onClick: () => navigate('/revenue-engine') }} />
        </Card>
      )}

      {prospects.map(p => (
        <Card key={p.id} hoverable style={{ padding: '14px 18px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: TEXT_PRIMARY }}>{p.business_name}</p>
                <RecBadge rec={p.recommendation} />
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: TEXT_TERTIARY }}>{p.address}</p>
            </div>
            <Button variant="secondary" size="sm" icon={Users} onClick={() => navigate(`/revenue-engine/lead/${p.id}`)} style={{ flexShrink: 0 }}>
              Open Workspace
            </Button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11.5px', color: TEXT_TERTIARY, marginBottom: '8px' }}>
            <span>⭐ {p.google_rating ?? '—'} ({p.total_reviews || 0} reviews)</span>
            <span>Opportunity <b className="tabular-nums" style={{ color: scoreColor(p.opportunity_score) }}>{p.opportunity_score ?? '—'}/100</b></span>
            <span>Need <b className="tabular-nums" style={{ color: scoreColor(p.need_score) }}>{p.need_score ?? '—'}/100</b></span>
            <span>Closing (est.) {p.estimated_call_success ?? '—'}</span>
          </div>
          {(p.weaknesses || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: p.reason ? '8px' : 0 }}>
              {p.weaknesses.map((w, i) => (
                <span key={w + i} style={{
                  padding: '3px 9px', borderRadius: radius.sm, fontSize: '10.5px', fontWeight: '600',
                  background: DANGER_MUTED, color: DANGER, border: `1px solid rgba(251,113,133,0.25)`,
                }}>
                  {WEAKNESS_LABELS[w] || w}
                </span>
              ))}
            </div>
          )}
          {p.reason && <p style={{ margin: 0, fontSize: '12px', color: TEXT_SECONDARY, lineHeight: 1.5 }}>{p.reason}</p>}
        </Card>
      ))}
    </PageShell>
  )
}
