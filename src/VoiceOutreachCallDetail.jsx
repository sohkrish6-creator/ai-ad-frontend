import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, FileText, User, Briefcase, MessageSquareText, CheckCircle2,
  AlertTriangle, Send, Pencil,
} from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, GREEN, MUTED, BONE, SLATE_M, SLATE_L, card, cardInner, lbl, inp } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

const CLASSIFICATIONS = [
  'Interested', 'Callback Requested', 'Not Interested', 'Wrong Contact', 'Voicemail', 'Busy', 'Unknown',
]

const FIELD_LABELS = {
  decision_maker: 'Decision Maker', company_name: 'Company', pain_points: 'Pain Points', needs: 'Needs',
  budget: 'Budget', timeline: 'Timeline', current_marketing: 'Current Marketing', objections: 'Objections',
  competitors: 'Competitors', interest_level: 'Interest Level', meeting_requested: 'Meeting Requested',
  callback_requested: 'Callback Requested', email_requested: 'Email Requested', sentiment: 'Sentiment',
  opt_out_requested: 'Opt-Out Requested',
}

function fieldDisplay(v) {
  if (v === null || v === undefined) return '—'
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return String(v)
}

function TranscriptViewer({ transcript, extracted }) {
  const turns = transcript?.transcript_json || []
  const citedByTurn = {}
  Object.entries(extracted || {}).forEach(([field, data]) => {
    (data?.excerpt_turn_indices || []).forEach(i => {
      citedByTurn[i] = citedByTurn[i] || []
      citedByTurn[i].push(FIELD_LABELS[field] || field)
    })
  })
  if (!turns.length) {
    return <p style={{ margin: 0, fontSize: '12.5px', color: MUTED, whiteSpace: 'pre-wrap' }}>{transcript?.transcript_text || 'No transcript.'}</p>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {turns.map((t, i) => {
        const cited = citedByTurn[t.turn ?? i]
        const isAgent = t.role === 'agent'
        return (
          <div key={i} title={cited ? `Cited by: ${cited.join(', ')}` : ''} style={{
            display: 'flex', gap: '8px', padding: '7px 10px', borderRadius: '6px',
            background: cited ? 'rgba(201,162,39,0.10)' : (isAgent ? SLATE_M : 'transparent'),
            border: cited ? '1px solid rgba(201,162,39,0.3)' : `1px solid ${SLATE_L}`,
          }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: isAgent ? GOLD : MUTED, minWidth: '52px', textTransform: 'uppercase' }}>
              {t.role}
            </span>
            <span style={{ fontSize: '12.5px', color: BONE, flex: 1, lineHeight: 1.5 }}>{t.text}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function VoiceOutreachCallDetail() {
  const { callId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [reviewClass, setReviewClass] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [editingFollowup, setEditingFollowup] = useState(null)
  const [editContent, setEditContent] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/calls/${callId}`)
      const d = await res.json()
      if (d.success) setData(d)
    } catch { /* transient */ }
  }, [callId])

  useEffect(() => { load() }, [load])

  async function submitReview() {
    if (!reviewClass) { toast.error('Pick a classification.'); return }
    setSubmittingReview(true)
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/analysis/${data.analysis.id}/review`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classification: reviewClass }),
      })
      const d = await res.json()
      if (d.success) { toast.success('Reviewed.'); load() } else toast.error(d.detail || 'Could not submit review.')
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setSubmittingReview(false)
  }

  async function saveFollowupEdit(id) {
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/followups/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft_content: editContent }),
      })
      const d = await res.json()
      if (d.success) { toast.success('Draft saved.'); setEditingFollowup(null); load() } else toast.error(d.detail || 'Could not save.')
    } catch { toast.error('Backend se connect nahi ho paya.') }
  }

  async function approveFollowup(id) {
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/followups/${id}/approve`, { method: 'POST' })
      const d = await res.json()
      if (d.success) { toast.success('Approved — still not sent automatically.'); load() } else toast.error(d.detail || 'Could not approve.')
    } catch { toast.error('Backend se connect nahi ho paya.') }
  }

  if (!data) {
    return (
      <PageShell maxWidth="900px">
        <PageHeader title="Voice Outreach — Call Detail" sub="Loading..." />
      </PageShell>
    )
  }

  const { call, prospect, transcript, analysis, followups, crm } = data
  const extracted = analysis?.extracted || {}

  return (
    <PageShell maxWidth="900px">
      <PageHeader
        title={prospect?.business_name || (call.is_test ? 'Test Call' : `Call #${call.id}`)}
        sub={`${call.status} · ${call.duration_seconds || 0}s${(call.is_dry_run === true || call.is_dry_run === 1) ? ' · DRY RUN' : ''}${(call.is_test === true || call.is_test === 1) ? ' · TEST' : ''}`}
        action={
          <button onClick={() => navigate('/voice-outreach/calls')} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
            border: `1px solid ${SLATE_L}`, color: MUTED, padding: '8px 14px', borderRadius: '7px',
            fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
          }}>
            <ArrowLeft size={13} /> Call Dashboard
          </button>
        }
      />

      {analysis?.needs_human_review === true || analysis?.needs_human_review === 1 ? (
        <div style={{ ...card, padding: '16px', marginBottom: '16px', border: `1px solid ${GOLD}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <AlertTriangle size={15} color={GOLD} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: GOLD }}>
              Needs Human Review — classification confidence {Math.round((analysis.classification_confidence || 0) * 100)}%
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select value={reviewClass} onChange={e => setReviewClass(e.target.value)} style={{ ...inp, width: 'auto', flex: '1 1 200px' }}>
              <option value="">— Confirm the correct classification —</option>
              {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={submitReview} disabled={submittingReview} style={{
              background: GOLD, border: 'none', color: '#0B0B0D', padding: '9px 18px', borderRadius: '7px',
              fontSize: '12.5px', fontWeight: '700', cursor: submittingReview ? 'not-allowed' : 'pointer',
            }}>
              {submittingReview ? 'Saving...' : 'Confirm & Unlock Follow-ups'}
            </button>
          </div>
        </div>
      ) : analysis ? (
        <div style={{ ...card, padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={14} color={GREEN} />
          <p style={{ margin: 0, fontSize: '12.5px', color: BONE }}>
            Classified <strong>{analysis.classification}</strong> ({Math.round((analysis.classification_confidence || 0) * 100)}% confidence)
            {analysis.reviewed_by && ` — confirmed by ${analysis.reviewed_by}`}
          </p>
        </div>
      ) : null}

      <div style={{ ...card, padding: '18px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <MessageSquareText size={15} color={GOLD} />
          <p style={{ ...lbl, margin: 0 }}>Transcript</p>
        </div>
        <TranscriptViewer transcript={transcript} extracted={extracted} />
      </div>

      {analysis && (
        <div style={{ ...card, padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FileText size={15} color={GOLD} />
            <p style={{ ...lbl, margin: 0 }}>Extracted Fields</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
            {Object.entries(FIELD_LABELS).map(([field, label]) => {
              const d = extracted[field]
              if (!d) return null
              return (
                <div key={field} style={{ ...cardInner, padding: '9px 12px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>
                    {label} · {Math.round((d.confidence || 0) * 100)}%
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: BONE }}>{fieldDisplay(d.value)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {crm && (
        <div style={{ ...card, padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <User size={15} color={GOLD} />
            <p style={{ ...lbl, margin: 0 }}>CRM</p>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: BONE }}>
            {crm.lead.name} <span style={{ fontSize: '11px', fontWeight: '600', color: MUTED }}>· {crm.lead.status} · {crm.lead.phone}</span>
          </p>
          {crm.notes.map(n => (
            <div key={n.id} style={{ ...cardInner, padding: '9px 12px', marginBottom: '6px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: BONE }}>{n.note_text}</p>
              <p style={{ margin: '3px 0 0', fontSize: '10px', color: MUTED }}>{n.source} · {new Date(n.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {followups?.length > 0 && (
        <div style={{ ...card, padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Briefcase size={15} color={GOLD} />
            <p style={{ ...lbl, margin: 0 }}>Follow-Up Drafts</p>
          </div>
          {followups.map(f => (
            <div key={f.id} style={{ ...cardInner, padding: '12px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: GOLD, textTransform: 'uppercase' }}>{f.channel}</p>
                <span style={{ fontSize: '10.5px', fontWeight: '700', color: f.status === 'approved' ? GREEN : MUTED }}>{f.status}</span>
              </div>
              {editingFollowup === f.id ? (
                <>
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} style={{ ...inp, minHeight: '70px', fontFamily: 'inherit', marginBottom: '8px' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => saveFollowupEdit(f.id)} style={{ background: GOLD, border: 'none', color: '#0B0B0D', padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditingFollowup(null)} style={{ background: 'transparent', border: `1px solid ${SLATE_L}`, color: MUTED, padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: BONE, whiteSpace: 'pre-wrap' }}>{f.draft_content}</p>
                  {f.status === 'draft' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setEditingFollowup(f.id); setEditContent(f.draft_content) }} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: `1px solid ${SLATE_L}`, color: MUTED, padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', cursor: 'pointer' }}>
                        <Pencil size={11} /> Edit
                      </button>
                      <button onClick={() => approveFollowup(f.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(63,166,107,0.14)', border: `1px solid ${GREEN}`, color: GREEN, padding: '6px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}>
                        <Send size={11} /> Approve
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
