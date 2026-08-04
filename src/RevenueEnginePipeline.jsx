import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Clock, PhoneCall, Users, ChevronRight } from 'lucide-react'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, card, cardInner, BONE, MUTED, RED, GREEN, SLATE_M, SLATE_L } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import RevenueEngineSubNav from './RevenueEngineSubNav'

const WEAKNESS_LABELS = {
  no_website: 'No Website', poor_reviews: 'Poor Reviews', low_review_count: 'Few Reviews',
  inactive_listing: 'Inactive Listing', missing_tracking: 'No Ad Tracking',
  weak_seo_meta: 'Weak SEO Meta', weak_seo_title: 'Weak SEO Title', no_cta: 'No Clear CTA',
  site_unreachable: 'Site Unreachable',
}

const REC_STYLE = {
  CALL:         { bg: 'rgba(63,166,107,0.14)', color: GREEN, label: 'Call' },
  FOLLOW_LATER: { bg: 'rgba(201,162,39,0.14)', color: GOLD,  label: 'Follow Later' },
  IGNORE:       { bg: SLATE_M,                 color: MUTED, label: 'Ignore' },
}

function RecBadge({ rec }) {
  const s = REC_STYLE[rec] || REC_STYLE.IGNORE
  return <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10.5px', fontWeight: '700', background: s.bg, color: s.color }}>{s.label}</span>
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
          <div style={{ ...card, padding: '24px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
            No Quick Scan runs yet — start one from the Goal page.
          </div>
        ) : batches.map(b => (
          <button key={b.id} onClick={() => navigate(`/revenue-engine/pipeline?batch=${b.id}`)} style={{
            ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
            padding: '14px 16px', marginBottom: '8px', cursor: 'pointer', border: `1px solid ${SLATE_L}`,
            color: BONE, textAlign: 'left', fontFamily: 'inherit',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{b.industry}{b.city ? ` in ${b.city}` : ''}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: MUTED }}>{b.status} · {b.total_qualified || 0}/{b.total_found || 0} qualified</p>
            </div>
            <ChevronRight size={16} color={MUTED} />
          </button>
        ))}
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell maxWidth="960px">
        <RevenueEngineSubNav />
        <PageHeader title="Pipeline" sub="" />
        <div style={{ ...card, padding: '24px', textAlign: 'center', color: RED }}>{error}</div>
      </PageShell>
    )
  }

  if (!batch) {
    return (
      <PageShell maxWidth="960px">
        <RevenueEngineSubNav />
        <PageHeader title="Pipeline" sub="Loading..." />
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
          <button onClick={() => navigate('/revenue-engine/today')} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: GOLD, border: 'none',
            color: '#0B0B0D', padding: '9px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
          }}>
            <PhoneCall size={14} /> Go to Today's Tasks
          </button>
        }
      />

      {isRunning && (
        <div style={{ ...card, padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Clock size={15} color={GOLD} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: BONE }}>{batch.current_step || 'Working...'}</p>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: SLATE_M, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${batch.progress_pct || 0}%`, background: GOLD, borderRadius: '4px', transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {[
          { label: 'Scanned', value: batch.total_found || 0 },
          { label: 'High Opportunity', value: high },
          { label: 'Call-First', value: callFirst },
          { label: 'Qualified', value: batch.total_qualified || 0 },
        ].map(s => (
          <div key={s.label} style={{ ...cardInner, padding: '12px 16px', flex: '1 1 140px' }}>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: BONE }}>{s.value}</p>
          </div>
        ))}
      </div>

      {batch.status === 'succeeded' && prospects.length === 0 && (
        <div style={{ ...card, padding: '24px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
          No prospects found for this search.
        </div>
      )}

      {prospects.map(p => (
        <div key={p.id} style={{ ...card, padding: '14px 18px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: BONE }}>{p.business_name}</p>
                <RecBadge rec={p.recommendation} />
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: MUTED }}>{p.address}</p>
            </div>
            <button onClick={() => navigate(`/revenue-engine/lead/${p.id}`)} style={{
              display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent',
              border: `1px solid ${GOLD}`, color: GOLD, padding: '6px 13px', borderRadius: '6px',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0,
            }}>
              <Users size={13} /> Open Workspace
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11.5px', color: MUTED, marginBottom: '8px' }}>
            <span>⭐ {p.google_rating ?? '—'} ({p.total_reviews || 0} reviews)</span>
            <span>Opportunity {p.opportunity_score ?? '—'}/100</span>
            <span>Need {p.need_score ?? '—'}/100</span>
            <span>Closing (est.) {p.estimated_call_success ?? '—'}</span>
          </div>
          {(p.weaknesses || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: p.reason ? '8px' : 0 }}>
              {p.weaknesses.map((w, i) => (
                <span key={w + i} style={{
                  padding: '3px 9px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '600',
                  background: 'rgba(196,69,58,0.10)', color: RED, border: '1px solid rgba(196,69,58,0.25)',
                }}>
                  {WEAKNESS_LABELS[w] || w}
                </span>
              ))}
            </div>
          )}
          {p.reason && <p style={{ margin: 0, fontSize: '12px', color: BONE, lineHeight: 1.5 }}>{p.reason}</p>}
        </div>
      ))}
    </PageShell>
  )
}
