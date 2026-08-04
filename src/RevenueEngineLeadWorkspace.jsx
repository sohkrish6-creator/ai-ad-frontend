import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  PhoneCall, PhoneOff, Clock3, ThumbsUp, ThumbsDown, CalendarCheck,
  Sparkles, Copy, Check, MessageSquareText, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, card, cardInner, lbl, BONE, MUTED, RED, GREEN, SLATE_M, SLATE_L } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import RevenueEngineSubNav from './RevenueEngineSubNav'

const OUTCOMES = [
  { key: 'no_answer',      label: 'No Answer',       Icon: PhoneOff,      color: MUTED },
  { key: 'not_interested', label: 'Not Interested',  Icon: ThumbsDown,    color: RED   },
  { key: 'callback',       label: 'Callback',        Icon: Clock3,        color: GOLD  },
  { key: 'interested',     label: 'Interested',      Icon: ThumbsUp,      color: GREEN },
  { key: 'meeting_booked', label: 'Meeting Booked',  Icon: CalendarCheck, color: GREEN },
]

const CHANNEL_LABELS = { cold_email: 'Email', whatsapp: 'WhatsApp', linkedin: 'LinkedIn', instagram_dm: 'Instagram DM' }

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }} style={{
      display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: `1px solid ${SLATE_L}`,
      color: copied ? GREEN : MUTED, padding: '4px 9px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '600', cursor: 'pointer',
    }}>
      {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function DraftCard({ draft, onMarkSent }) {
  const [open, setOpen] = useState(false)
  const fullText = Object.values(draft.content || {}).join('\n\n')
  return (
    <div style={{ ...cardInner, padding: '12px 14px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setOpen(o => !o)} style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
          color: GOLD, fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: 0,
        }}>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {CHANNEL_LABELS[draft.channel] || draft.channel}
          {draft.status === 'sent' && <span style={{ color: GREEN, fontWeight: '600' }}>· sent</span>}
        </button>
        <div style={{ display: 'flex', gap: '6px' }}>
          <CopyButton text={fullText} />
          {draft.status !== 'sent' && (
            <button onClick={() => onMarkSent(draft.id)} style={{
              background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD, padding: '4px 10px',
              borderRadius: '6px', fontSize: '10.5px', fontWeight: '700', cursor: 'pointer',
            }}>
              Mark Sent
            </button>
          )}
        </div>
      </div>
      {open && (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.entries(draft.content || {}).map(([k, v]) => (
            <div key={k}>
              <p style={{ margin: '0 0 2px', fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>{k.replace(/_/g, ' ')}</p>
              <p style={{ margin: 0, fontSize: '12px', color: BONE, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RevenueEngineLeadWorkspace() {
  const { prospectId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [ca, setCa] = useState(null)
  const [caError, setCaError] = useState('')
  const [drafts, setDrafts] = useState([])
  const [generating, setGenerating] = useState(false)
  const [loggingOutcome, setLoggingOutcome] = useState('')

  const loadCallAssistant = useCallback(async () => {
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/prospects/${prospectId}/call-assistant`)
      const data = await res.json()
      if (data.success) { setCa(data); setCaError('') }
      else setCaError(data.message || data.detail || 'Could not load this lead.')
    } catch { setCaError('Backend se connect nahi ho paya.') }
  }, [prospectId])

  const loadDrafts = useCallback(async () => {
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/prospects/${prospectId}/outreach-drafts`)
      const data = await res.json()
      if (data.success) setDrafts(data.drafts)
    } catch { /* transient */ }
  }, [prospectId])

  useEffect(() => { loadCallAssistant(); loadDrafts() }, [loadCallAssistant, loadDrafts])

  async function handleGenerateDrafts() {
    setGenerating(true)
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/prospects/${prospectId}/outreach-drafts`, { method: 'POST' })
      const data = await res.json()
      if (data.success) { toast.success('Outreach drafts generated.'); loadDrafts() }
      else toast.error(data.message || data.detail || 'Could not generate drafts.')
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setGenerating(false)
  }

  async function handleMarkSent(draftId) {
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/outreach-drafts/${draftId}/mark-sent`, { method: 'POST' })
      const data = await res.json()
      if (data.success) { toast.success('Marked as sent.'); loadDrafts() }
      else toast.error(data.detail || 'Could not mark as sent.')
    } catch { toast.error('Backend se connect nahi ho paya.') }
  }

  async function handleOutcome(key) {
    setLoggingOutcome(key)
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/prospects/${prospectId}/outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: key }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Outcome logged.')
        navigate('/revenue-engine/today')
      } else {
        toast.error(data.detail || 'Could not log outcome.')
      }
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setLoggingOutcome('')
  }

  if (caError) {
    return (
      <PageShell maxWidth="820px">
        <RevenueEngineSubNav />
        <PageHeader title="Lead Workspace" sub="" />
        <div style={{ ...card, padding: '24px', textAlign: 'center', color: RED }}>{caError}</div>
      </PageShell>
    )
  }

  if (!ca) {
    return (
      <PageShell maxWidth="820px">
        <RevenueEngineSubNav />
        <PageHeader title="Lead Workspace" sub="Loading..." />
      </PageShell>
    )
  }

  return (
    <PageShell maxWidth="820px">
      <RevenueEngineSubNav />
      <PageHeader
        title={ca.business.name}
        sub={`${ca.business.address || ''} · ⭐ ${ca.business.google_rating ?? '—'} (${ca.business.total_reviews || 0} reviews) · ${ca.business.phone_e164 || 'no phone'}`}
      />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {[
          { label: 'Opportunity', value: ca.opportunity_score ?? '—' },
          { label: 'Need', value: ca.need_score ?? '—' },
          { label: 'Closing (estimate)', value: ca.closing_probability_estimate ?? '—' },
          { label: 'Recommendation', value: ca.recommendation ?? '—' },
        ].map(s => (
          <div key={s.label} style={{ ...cardInner, padding: '10px 14px', flex: '1 1 130px' }}>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: BONE }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Call Assistant ── */}
      <div style={{ ...card, padding: '18px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <PhoneCall size={15} color={GOLD} />
          <p style={{ ...lbl, margin: 0 }}>Call Assistant</p>
        </div>

        <div style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '10px 12px', marginBottom: '12px' }}>
          <p style={{ margin: '0 0 2px', fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>Disclosure (say this first)</p>
          <p style={{ margin: 0, fontSize: '12px', color: BONE, fontStyle: 'italic' }}>{ca.call_script.disclosure_line}</p>
        </div>

        {[
          ['Opening', ca.call_script.opening], ['Rapport', ca.call_script.rapport],
          ['Pain Point', ca.call_script.pain_point], ['Value Prop', ca.call_script.value_prop],
          ['Meeting Close', ca.call_script.meeting_close],
        ].map(([label, val]) => val && (
          <div key={label} style={{ marginBottom: '10px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>{label}</p>
            <p style={{ margin: 0, fontSize: '12.5px', color: BONE, lineHeight: 1.5 }}>{val}</p>
          </div>
        ))}

        {(ca.call_script.discovery_questions || []).length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>Discovery Questions</p>
            {ca.call_script.discovery_questions.map((q, i) => (
              <p key={i} style={{ margin: '0 0 3px', fontSize: '12.5px', color: BONE }}>• {q}</p>
            ))}
          </div>
        )}

        {(ca.call_script.objection_handling || []).length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>Objections</p>
            {ca.call_script.objection_handling.map((o, i) => (
              <div key={i} style={{ marginBottom: '6px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: MUTED, fontStyle: 'italic' }}>"{o.objection}"</p>
                <p style={{ margin: 0, fontSize: '12.5px', color: BONE }}>→ {o.response}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ ...cardInner, padding: '10px 14px', marginTop: '8px' }}>
          <p style={{ margin: '0 0 2px', fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>Estimated Budget Range</p>
          {ca.budget_range ? (
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: BONE }}>
              ₹{ca.budget_range.low.toLocaleString('en-IN')} – ₹{ca.budget_range.high.toLocaleString('en-IN')} / {ca.budget_range.unit}
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>{ca.budget_range_note}</p>
          )}
        </div>
      </div>

      {/* ── Outcome logging ── */}
      <div style={{ ...card, padding: '18px', marginBottom: '16px' }}>
        <p style={{ ...lbl, marginBottom: '12px' }}>Log Outcome</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {OUTCOMES.map(o => (
            <button key={o.key} onClick={() => handleOutcome(o.key)} disabled={!!loggingOutcome} style={{
              display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
              border: `1px solid ${o.color}`, color: o.color, padding: '8px 14px', borderRadius: '7px',
              fontSize: '12px', fontWeight: '700', cursor: loggingOutcome ? 'not-allowed' : 'pointer',
              opacity: loggingOutcome && loggingOutcome !== o.key ? 0.5 : 1,
            }}>
              <o.Icon size={13} /> {loggingOutcome === o.key ? 'Logging...' : o.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Outreach drafts ── */}
      <div style={{ ...card, padding: '18px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquareText size={15} color={GOLD} />
            <p style={{ ...lbl, margin: 0 }}>Outreach Drafts</p>
          </div>
          <button onClick={handleGenerateDrafts} disabled={generating} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
            border: `1px solid ${GOLD}`, color: GOLD, padding: '7px 14px', borderRadius: '7px',
            fontSize: '12px', fontWeight: '600', cursor: generating ? 'not-allowed' : 'pointer',
          }}>
            <Sparkles size={13} /> {generating ? 'Generating...' : drafts.length ? 'Regenerate' : 'Generate Drafts'}
          </button>
        </div>
        {drafts.length === 0 ? (
          <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>No drafts yet — generate email/WhatsApp/LinkedIn/Instagram drafts personalized to this prospect's real detected weaknesses.</p>
        ) : (
          drafts.map(d => <DraftCard key={d.id} draft={d} onMarkSent={handleMarkSent} />)
        )}
      </div>
    </PageShell>
  )
}
