import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ShieldAlert, ShieldCheck, CheckCircle2, XCircle, MessageSquareText,
  Sparkles, Ban, Clock, ChevronDown, ChevronUp, RefreshCw, PhoneCall,
} from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, card, cardInner, lbl, inp, BONE, MUTED, RED, GREEN, SLATE_M, SLATE_L } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

const LAST_URL_KEY = 'adsoh_voice_outreach_business_url'

function getLastUrl() {
  try { return localStorage.getItem(LAST_URL_KEY) || '' } catch { return '' }
}

const WEAKNESS_LABELS = {
  no_website:        'No Website',
  poor_reviews:       'Poor Reviews',
  low_review_count:   'Few Reviews',
  inactive_listing:   'Inactive Listing',
  missing_tracking:   'No Ad Tracking',
  weak_seo_meta:      'Weak SEO Meta',
  weak_seo_title:     'Weak SEO Title',
  no_cta:             'No Clear CTA',
  site_unreachable:   'Site Unreachable',
}

function PriorityBadge({ priority }) {
  const map = {
    high:   { bg: 'rgba(196,69,58,0.12)', color: RED,   label: 'High' },
    medium: { bg: 'rgba(201,162,39,0.14)', color: GOLD, label: 'Medium' },
    low:    { bg: 'rgba(63,166,107,0.12)', color: GREEN, label: 'Low' },
  }
  const s = map[(priority || '').toLowerCase()] || { bg: SLATE_M, color: MUTED, label: priority || '—' }
  return <span style={{ padding: '2px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: s.bg, color: s.color }}>{s.label}</span>
}

function GateBadge({ prospect }) {
  if (prospect.approval_status === 'approved') {
    return <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: GREEN }}><CheckCircle2 size={13} /> Approved</span>
  }
  if (prospect.approval_status === 'rejected') {
    return <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: MUTED }}><XCircle size={13} /> Rejected</span>
  }
  if (prospect.gate_blocked) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: RED }} title={(prospect.gate_block_reasons || []).join(', ')}>
        <ShieldAlert size={13} /> Blocked: {(prospect.gate_block_reasons || []).join(', ') || 'gated'}
      </span>
    )
  }
  return <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: MUTED }}><ShieldCheck size={13} /> Eligible</span>
}

function ScriptPanel({ prospect, batch, businessUrl, onSaved }) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [script, setScript] = useState(null)
  const [disclosure, setDisclosure] = useState('')

  async function generate() {
    setLoading(true)
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/scripts/${prospect.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'generate', url: businessUrl, industry: batch.industry, city: batch.city }),
      })
      const data = await res.json()
      if (data.success) {
        setScript(data.script); setDisclosure(data.disclosure_line)
        toast.success('Pitch generated.')
      } else {
        toast.error(data.message || data.error || 'Could not generate a pitch.')
      }
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  async function saveEdits() {
    setLoading(true)
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/scripts/${prospect.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'edit', edited_fields: script }),
      })
      const data = await res.json()
      if (data.success) {
        setDisclosure(data.disclosure_line)
        toast.success(`Saved as version ${data.version}.`)
        onSaved && onSaved()
      } else {
        toast.error(data.error || 'Could not save edits.')
      }
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  function field(key, label, multiline) {
    const Tag = multiline ? 'textarea' : 'input'
    return (
      <div style={{ marginBottom: '10px' }}>
        <label style={lbl}>{label}</label>
        <Tag
          value={script?.[key] || ''}
          onChange={e => setScript(s => ({ ...s, [key]: e.target.value }))}
          style={{ ...inp, ...(multiline ? { minHeight: '52px', resize: 'vertical', fontFamily: 'inherit' } : {}) }}
        />
      </div>
    )
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
        color: GOLD, fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: '4px 0',
      }}>
        <MessageSquareText size={13} /> Phone Pitch {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div style={{ ...cardInner, padding: '14px', marginTop: '6px' }}>
          {!script ? (
            <button onClick={generate} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
              border: `1px solid ${GOLD}`, color: GOLD, padding: '7px 14px', borderRadius: '7px',
              fontSize: '12px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              <Sparkles size={13} /> {loading ? 'Generating...' : 'Generate Pitch'}
            </button>
          ) : (
            <>
              <div style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '9px 11px', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 2px', fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Disclosure line (fixed — never editable)
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: BONE, fontStyle: 'italic' }}>{disclosure}</p>
              </div>
              {field('opening', 'Opening')}
              {field('rapport', 'Rapport')}
              {field('pain_point', 'Pain Point', true)}
              {field('value_prop', 'Value Prop', true)}
              {field('social_proof', 'Social Proof')}
              {field('meeting_close', 'Meeting Close', true)}
              {field('follow_up', 'Follow-Up')}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={saveEdits} disabled={loading} style={{
                  background: GOLD, border: 'none', color: '#0B0B0D', padding: '7px 14px', borderRadius: '7px',
                  fontSize: '12px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? 'Saving...' : 'Save as New Version'}
                </button>
                <button onClick={generate} disabled={loading} style={{
                  display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent',
                  border: `1px solid ${SLATE_L}`, color: MUTED, padding: '7px 14px', borderRadius: '7px',
                  fontSize: '12px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  <RefreshCw size={12} /> Regenerate
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function VoiceOutreachReview() {
  const { batchId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [batch, setBatch] = useState(null)
  const [prospects, setProspects] = useState([])
  const [settings, setSettings] = useState(null)
  const [businessUrl, setBusinessUrl] = useState(getLastUrl)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/batches/${batchId}`)
      const data = await res.json()
      if (data.success) {
        setBatch(data.batch)
        setProspects(data.prospects)
      } else {
        setError(data.detail || 'Batch not found.')
      }
    } catch {
      // transient network hiccup — just try again on the next tick
    }
  }, [batchId])

  useEffect(() => {
    apiFetch(`${BACKEND}/voice-outreach/settings`).then(r => r.json()).then(d => { if (d.success) setSettings(d.settings) }).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    async function poll() {
      if (cancelled) return
      await load()
    }
    poll()
    const interval = setInterval(poll, 2000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [load])

  useEffect(() => {
    try { localStorage.setItem(LAST_URL_KEY, businessUrl) } catch { /* localStorage unavailable */ }
  }, [businessUrl])

  async function handleAction(prospectId, action) {
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/prospects/${prospectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(action === 'approve' ? 'Approved.' : 'Rejected.')
        load()
      } else {
        toast.error(data.detail || 'Action failed.')
      }
    } catch { toast.error('Backend se connect nahi ho paya.') }
  }

  async function handleApproveAllEligible() {
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/prospects/bulk-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', all_eligible_in_batch: batchId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Approved ${data.succeeded.length} eligible prospect(s).`)
        load()
      }
    } catch { toast.error('Backend se connect nahi ho paya.') }
  }

  async function handleConfirmAndCall() {
    const approvedIds = prospects.filter(p => p.approval_status === 'approved').map(p => p.id)
    if (approvedIds.length === 0) return
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/confirm-and-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: batchId, approved_prospect_ids: approvedIds }),
      })
      const data = await res.json()
      if (data.success) {
        const enqueued = data.results.filter(r => r.enqueued).length
        const skipped = data.results.length - enqueued
        toast.success(skipped > 0 ? `${enqueued} call(s) started, ${skipped} skipped — see Call Dashboard.` : `${enqueued} call(s) started.`)
        navigate('/voice-outreach/calls')
      } else {
        toast.error(data.detail || 'Could not start calls.')
      }
    } catch { toast.error('Backend se connect nahi ho paya.') }
  }

  if (error) {
    return (
      <PageShell maxWidth="960px">
        <PageHeader title="Voice Outreach — Review" sub="" />
        <div style={{ ...card, padding: '24px', textAlign: 'center', color: RED }}>{error}</div>
      </PageShell>
    )
  }

  if (!batch) {
    return (
      <PageShell maxWidth="960px">
        <PageHeader title="Voice Outreach — Review" sub="Loading batch..." />
      </PageShell>
    )
  }

  const isRunning = batch.status === 'queued' || batch.status === 'running'
  const estMinutes = settings ? Math.round((settings.avg_estimated_call_duration_seconds / 60) * 10) / 10 : null
  const estCost = settings ? Math.round((settings.avg_estimated_call_duration_seconds / 60) * (settings.blended_rate_per_minute_micros / 1_000_000)) : null
  const visibleProspects = prospects.filter(p => p.approval_status !== 'filtered')
  const filteredProspects = prospects.filter(p => p.approval_status === 'filtered')
  const eligibleCount = prospects.filter(p => p.approval_status === 'pending' && !p.gate_blocked).length
  const approvedCount = prospects.filter(p => p.approval_status === 'approved').length

  return (
    <PageShell maxWidth="960px">
      <PageHeader
        title="Voice Outreach — Review"
        sub={`${batch.industry}${batch.city ? ' in ' + batch.city : ''} — every prospect below needs your explicit approval before anything further happens.`}
        action={
          !isRunning && (eligibleCount > 0 || approvedCount > 0) && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {eligibleCount > 0 && (
                <button onClick={handleApproveAllEligible} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
                  border: `1px solid ${GOLD}`, color: GOLD, padding: '9px 16px', borderRadius: '7px',
                  fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                }}>
                  <CheckCircle2 size={14} /> Approve All Eligible ({eligibleCount})
                </button>
              )}
              {approvedCount > 0 && (
                <button onClick={handleConfirmAndCall} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', background: GOLD, border: 'none',
                  color: '#0B0B0D', padding: '9px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                }}>
                  <PhoneCall size={14} /> Confirm &amp; Call ({approvedCount})
                </button>
              )}
            </div>
          )
        }
      />

      <div style={{ ...card, padding: '14px 16px', marginBottom: '16px' }}>
        <label style={lbl}>Your Business URL (for personalized pitch generation)</label>
        <input type="text" value={businessUrl} onChange={e => setBusinessUrl(e.target.value)} placeholder="https://yourbusiness.com — must match a Marketing Brain run" style={inp} />
      </div>

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

      {batch.status === 'failed' && (
        <div style={{ ...card, padding: '18px', marginBottom: '16px', color: RED, fontSize: '13px' }}>
          Batch failed: {batch.error}
        </div>
      )}

      {batch.status === 'succeeded' && prospects.length === 0 && (
        <div style={{ ...card, padding: '24px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
          No prospects found for this search.
        </div>
      )}

      {visibleProspects.map(p => (
        <ProspectCardWithUrl key={p.id} prospect={p} batch={batch} businessUrl={businessUrl} onAction={handleAction} estCost={estCost} estMinutes={estMinutes} />
      ))}

      {filteredProspects.length > 0 && (
        <FilteredOutSection prospects={filteredProspects} onAction={handleAction} />
      )}
    </PageShell>
  )
}

function FilteredOutSection({ prospects, onAction }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ ...card, padding: '14px 16px', marginTop: '8px' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none',
        color: MUTED, fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', padding: 0, width: '100%',
      }}>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Filtered Out ({prospects.length}) — enterprise/chain businesses excluded from scoring
      </button>
      {open && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {prospects.map(p => (
            <div key={p.id} style={{ ...cardInner, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: BONE }}>{p.business_name}</p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: MUTED }}>{p.filter_reason}</p>
              </div>
              <button onClick={() => onAction(p.id, 'admit')} style={{
                display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent',
                border: `1px solid ${GOLD}`, color: GOLD, padding: '6px 12px', borderRadius: '6px',
                fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', flexShrink: 0,
              }}>
                Admit Anyway
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProspectCardWithUrl({ prospect, batch, businessUrl, onAction, estCost, estMinutes }) {
  const weaknessChips = prospect.weaknesses || []
  return (
    <div style={{ ...card, padding: '16px 18px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: BONE }}>{prospect.business_name}</p>
            <PriorityBadge priority={prospect.priority} />
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '11px', color: MUTED }}>{prospect.address}</p>
        </div>
        <GateBadge prospect={prospect} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11.5px', color: MUTED, marginBottom: '10px' }}>
        <span>⭐ {prospect.google_rating ?? '—'} ({prospect.total_reviews || 0} reviews)</span>
        <span>{prospect.missing_phone ? '📵 No phone found' : `📞 ${prospect.phone_e164}`}</span>
        <span>Opportunity {prospect.opportunity_score ?? '—'}/100</span>
        <span>Confidence {prospect.confidence_score ?? '—'}%</span>
      </div>

      {weaknessChips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
          {weaknessChips.map((w, i) => {
            const ev = (prospect.evidence || []).find(e => e.type === w)
            return (
              <span key={w + i} title={ev ? `${ev.value} (confidence ${Math.round((ev.confidence || 0) * 100)}%)` : ''} style={{
                padding: '3px 9px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '600',
                background: 'rgba(196,69,58,0.10)', color: RED, border: '1px solid rgba(196,69,58,0.25)', cursor: 'help',
              }}>
                {WEAKNESS_LABELS[w] || w}
              </span>
            )
          })}
        </div>
      )}

      {prospect.reason && (
        <div style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '9px 12px', marginBottom: '10px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: BONE, lineHeight: 1.5 }}>{prospect.reason}</p>
        </div>
      )}

      {prospect.rescore_note && (
        <div style={{ background: 'rgba(201,162,39,0.10)', border: `1px solid ${GOLD}`, borderRadius: '6px', padding: '9px 12px', marginBottom: '10px' }}>
          <p style={{ margin: 0, fontSize: '11.5px', color: GOLD, lineHeight: 1.5 }}>⚠ {prospect.rescore_note}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
        {[
          { label: 'Est. ROI', value: prospect.estimated_roi },
          { label: 'Call Success', value: prospect.estimated_call_success },
          { label: 'Est. Cost/Call', value: estCost ? `₹${estCost} (${estMinutes}m)` : '—' },
        ].map(m => (
          <div key={m.label} style={{ background: SLATE_M, borderRadius: '6px', padding: '7px 10px', border: `1px solid ${SLATE_L}` }}>
            <p style={{ margin: '0 0 2px', fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>{m.label}</p>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: BONE }}>{m.value || '—'}</p>
          </div>
        ))}
      </div>

      {prospect.approval_status === 'pending' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onAction(prospect.id, 'approve')} disabled={prospect.gate_blocked} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: prospect.gate_blocked ? SLATE_M : 'rgba(63,166,107,0.14)',
            border: `1px solid ${prospect.gate_blocked ? SLATE_L : GREEN}`,
            color: prospect.gate_blocked ? MUTED : GREEN, padding: '6px 13px', borderRadius: '6px',
            fontSize: '12px', fontWeight: '700', cursor: prospect.gate_blocked ? 'not-allowed' : 'pointer',
          }}>
            <CheckCircle2 size={13} /> Approve
          </button>
          <button onClick={() => onAction(prospect.id, 'reject')} style={{
            display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent',
            border: `1px solid ${SLATE_L}`, color: MUTED, padding: '6px 13px', borderRadius: '6px',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
          }}>
            <Ban size={13} /> Reject
          </button>
        </div>
      )}

      <ScriptPanel prospect={prospect} batch={batch} businessUrl={businessUrl} onSaved={() => {}} />
    </div>
  )
}
