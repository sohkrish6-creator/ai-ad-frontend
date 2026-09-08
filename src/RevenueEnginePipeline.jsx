import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Clock, PhoneCall, Users, ChevronRight, Inbox, Radar, FileText, FileSpreadsheet, MessageCircle, History } from 'lucide-react'
import { BACKEND, apiFetch } from './lib/api'
import { TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, ACCENT, BG_INSET, DANGER, DANGER_MUTED, WARNING, errBox, scoreColor, radius } from './ds'
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
import { downloadProspectCallSheetDocx, downloadProspectCallLogXlsx } from './lib/prospectExport'
import { useToast } from './ToastContext'

const WEAKNESS_LABELS = {
  no_website: 'No Website', poor_reviews: 'Poor Reviews', low_review_count: 'Few Reviews',
  inactive_listing: 'Inactive Listing', missing_tracking: 'No Ad Tracking',
  weak_seo_meta: 'Weak SEO Meta', weak_seo_title: 'Weak SEO Title', no_cta: 'No Clear CTA',
  site_unreachable: 'Site Unreachable',
  no_social_links_on_website: 'No Social Links On Site', weak_social_presence: 'Weak Social Presence',
}

const WHATSAPP_INELIGIBLE_REASON_LABELS = {
  missing_phone: 'No phone number', dnc: 'On DNC list', cooldown: 'In cooldown window',
}

// Small concurrency-limited pool — draft generation is one GPT call per
// prospect, so 20 selected prospects fired all-at-once would be 20
// simultaneous GPT-4o-mini calls. 3-at-a-time keeps this fast without
// hammering a rate limit the way an unbounded Promise.all would.
async function runWithConcurrency(items, limit, worker) {
  let idx = 0
  async function next() {
    while (idx < items.length) {
      const i = idx++
      await worker(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next))
}

const REC_VARIANT = { CALL: 'success', FOLLOW_LATER: 'warning', IGNORE: 'neutral' }
const REC_LABEL = { CALL: 'Call', FOLLOW_LATER: 'Follow Later', IGNORE: 'Ignore' }

function RecBadge({ rec }) {
  return <Badge variant={REC_VARIANT[rec] || 'neutral'}>{REC_LABEL[rec] || rec}</Badge>
}

// This pipeline's prospects already went through _voice_match_service
// server-side (matched_weakness/matched_service), so unlike Prospect
// Discovery there's no separate "invented, unfiltered" value to fix here —
// this just maps the same normalized shape lib/prospectExport.js expects.
// matched_service is a raw service KEY (e.g. "website_development"); the
// tenant's service_catalog (from /voice-outreach/settings) translates it
// to a display label the same way Settings itself does.
function toExportProspects(prospects, serviceCatalog) {
  const svcLabel = Object.fromEntries((serviceCatalog || []).map(s => [s.key, s.label]))
  return (prospects || []).map(p => {
    const gapCode = p.matched_weakness || (p.weaknesses || [])[0] || null
    return {
      name: p.business_name, address: p.address, phone: p.phone_e164 || p.phone_raw,
      rating: p.google_rating, reviews: p.total_reviews, score: p.opportunity_score,
      classification: p.priority === 'high' ? 'hot' : p.priority === 'medium' ? 'warm' : 'cold',
      detectedGap: gapCode ? (WEAKNESS_LABELS[gapCode] || gapCode) : 'None detected',
      sohscapeAngle: p.matched_service ? (svcLabel[p.matched_service] || p.matched_service) : 'No service fit',
      expectedLtv: p.estimated_roi, closingProbability: p.estimated_call_success,
    }
  })
}

async function fetchTenantSettings() {
  try {
    const res = await apiFetch(`${BACKEND}/voice-outreach/settings`)
    const data = await res.json()
    return data.success ? (data.settings || {}) : {}
  } catch {
    return {}
  }
}

export default function RevenueEnginePipeline() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const batchId = params.get('batch')

  const [batches, setBatches] = useState([])
  const [batch, setBatch] = useState(null)
  const [prospects, setProspects] = useState([])
  const [error, setError] = useState('')
  const [docxLoading, setDocxLoading] = useState(false)
  const [xlsxLoading, setXlsxLoading] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState({ done: 0, total: 0 })
  const [activeSessionId, setActiveSessionId] = useState(null)
  const toast = useToast()

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

  // Resume support — an in-progress WhatsApp send queue survives a closed
  // tab or reload (it's server-side state, keyed to the session id, not
  // anything held in this component's memory).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiFetch(`${BACKEND}/revenue-engine/whatsapp-outreach/sessions/active`)
        const data = await res.json()
        if (!cancelled && data.success) setActiveSessionId(data.session_id)
      } catch { /* transient */ }
    })()
    return () => { cancelled = true }
  }, [])

  function toggleSelect(id) {
    setSelected(s => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function selectAllEligible() {
    setSelected(new Set(prospects.filter(p => p.whatsapp_eligible).map(p => p.id)))
  }

  async function handleGenerateAndSend() {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    setGenerating(true)
    setGenProgress({ done: 0, total: ids.length })
    const succeeded = []
    await runWithConcurrency(ids, 3, async (id) => {
      try {
        const res = await apiFetch(`${BACKEND}/revenue-engine/prospects/${id}/outreach-drafts`, { method: 'POST' })
        const data = await res.json()
        if (data.success) succeeded.push(id)
      } catch { /* counted as a failure below — not added to succeeded */ }
      setGenProgress(p => ({ ...p, done: p.done + 1 }))
    })
    setGenerating(false)

    if (succeeded.length === 0) {
      toast.error('Draft generation failed for every selected prospect.')
      return
    }
    if (succeeded.length < ids.length) {
      toast.error(`${ids.length - succeeded.length} draft(s) failed to generate — continuing with the ${succeeded.length} that succeeded.`)
    }

    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/whatsapp-outreach/sessions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect_ids: succeeded, batch_id: batchId || '' }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.detail || 'Could not start the WhatsApp send queue.')
        return
      }
      if (data.dropped?.length) {
        toast.error(`${data.dropped.length} prospect(s) became ineligible between selection and now — skipped.`)
      }
      setSelected(new Set())
      navigate(`/revenue-engine/whatsapp-outreach/${data.session_id}`)
    } catch {
      toast.error('Backend se connect nahi ho paya.')
    }
  }

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

  async function handleDownloadDocx() {
    setDocxLoading(true)
    try {
      const settings = await fetchTenantSettings()
      await downloadProspectCallSheetDocx({
        industry: batch.industry, city: batch.city, businessName: settings.business_name,
        prospects: toExportProspects(prospects, settings.service_catalog),
      })
    } finally {
      setDocxLoading(false)
    }
  }

  async function handleDownloadXlsx() {
    setXlsxLoading(true)
    try {
      const settings = await fetchTenantSettings()
      await downloadProspectCallLogXlsx({
        industry: batch.industry, city: batch.city,
        prospects: toExportProspects(prospects, settings.service_catalog),
      })
    } finally {
      setXlsxLoading(false)
    }
  }

  return (
    <PageShell maxWidth="960px">
      <RevenueEngineSubNav />
      <PageHeader
        title="Pipeline"
        sub={`${batch.industry}${batch.city ? ' in ' + batch.city : ''}`}
        action={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {prospects.length > 0 && (
              <>
                <Button variant="secondary" size="sm" icon={FileText} loading={docxLoading} onClick={handleDownloadDocx}>
                  Download DOCX
                </Button>
                <Button variant="secondary" size="sm" icon={FileSpreadsheet} loading={xlsxLoading} onClick={handleDownloadXlsx}>
                  Download Excel
                </Button>
              </>
            )}
            <Button variant="primary" icon={PhoneCall} onClick={() => navigate('/revenue-engine/today')}>
              Go to Today's Tasks
            </Button>
          </div>
        }
      />

      <RevenueEngineProfileBanner prospects={prospects} />

      {activeSessionId && (
        <Card style={{ padding: '14px 18px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={16} color={WARNING} />
            <p style={{ margin: 0, fontSize: '13px', color: TEXT_PRIMARY }}>You have a WhatsApp send queue in progress.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate(`/revenue-engine/whatsapp-outreach/${activeSessionId}`)}>
            Resume
          </Button>
        </Card>
      )}

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

      {prospects.length > 0 && (
        <Card style={{ padding: '12px 18px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={selectAllEligible} style={{ background: 'none', border: 'none', padding: 0, color: ACCENT, fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Select all eligible
            </button>
            {selected.size > 0 && (
              <button onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', padding: 0, color: TEXT_TERTIARY, fontSize: '12.5px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Clear ({selected.size} selected)
              </button>
            )}
          </div>
          <Button
            variant="primary" size="sm" icon={MessageCircle}
            disabled={selected.size === 0 || generating}
            loading={generating}
            onClick={handleGenerateAndSend}
          >
            {generating ? `Generating ${genProgress.done}/${genProgress.total}...` : `Generate WhatsApp Drafts (${selected.size})`}
          </Button>
        </Card>
      )}

      {prospects.map(p => {
        const ineligibleReason = p.whatsapp_eligible === false
          ? (WHATSAPP_INELIGIBLE_REASON_LABELS[p.whatsapp_ineligible_reason] || p.whatsapp_ineligible_reason)
          : null
        return (
        <Card key={p.id} hoverable style={{ padding: '14px 18px', marginBottom: '8px', opacity: ineligibleReason ? 0.6 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                disabled={!!ineligibleReason}
                onChange={() => toggleSelect(p.id)}
                style={{ marginTop: '4px', cursor: ineligibleReason ? 'not-allowed' : 'pointer' }}
                title={ineligibleReason || 'Select for bulk WhatsApp send'}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: TEXT_PRIMARY }}>{p.business_name}</p>
                  <RecBadge rec={p.recommendation} />
                  {ineligibleReason && <Badge variant="warning">{ineligibleReason}</Badge>}
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: TEXT_TERTIARY }}>{p.address}</p>
              </div>
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
        )
      })}
    </PageShell>
  )
}
