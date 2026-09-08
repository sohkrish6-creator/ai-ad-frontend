import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageCircle, SkipForward, CheckCircle2, PhoneOff, Home } from 'lucide-react'
import { BACKEND, apiFetch } from './lib/api'
import {
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, WARNING, WARNING_MUTED,
  DANGER, BG_INSET, BORDER_SUBTLE, errBox, scoreColor, radius,
} from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import Card from './components/ui/Card'
import Button from './components/ui/Button'
import Skeleton from './components/ui/Skeleton'

const WA_LENGTH_WARNING = 400

// The one place a "detected gap" code becomes a display label on this
// screen — mirrors RevenueEnginePipeline.jsx's WEAKNESS_LABELS (backend
// already sends the label pre-resolved via _VOICE_WEAKNESS_LABELS for
// session items, so this is only a fallback for an unmapped code).
function gapLabel(code) {
  if (!code) return 'None detected'
  return code
}

async function fetchWhatsappDraft(prospectId) {
  const res = await apiFetch(`${BACKEND}/revenue-engine/prospects/${prospectId}/outreach-drafts`)
  const data = await res.json()
  if (!data.success) return null
  const draft = (data.drafts || []).find(d => d.channel === 'whatsapp')
  if (!draft) return null
  return { draftId: draft.id, message: draft.content?.message_1 || '' }
}

export default function WhatsAppOutreachSend() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draftLoading, setDraftLoading] = useState(false)
  const [draftId, setDraftId] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [noDraftFound, setNoDraftFound] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const textareaRef = useRef(null)

  const currentIndex = session?.current_index ?? 0
  const currentItem = items[currentIndex] || null

  const loadCurrentDraft = useCallback(async (item) => {
    if (!item) return
    setDraftLoading(true)
    setNoDraftFound(false)
    try {
      const draft = await fetchWhatsappDraft(item.prospect_id)
      if (draft) {
        setDraftId(draft.draftId)
        setMessageText(draft.message)
      } else {
        setDraftId(null)
        setMessageText('')
        setNoDraftFound(true)
      }
    } catch {
      setDraftId(null)
      setMessageText('')
      setNoDraftFound(true)
    } finally {
      setDraftLoading(false)
    }
  }, [])

  const loadSession = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/whatsapp-outreach/sessions/${sessionId}`)
      const data = await res.json()
      if (!data.success) {
        setError(data.detail || 'Session not found.')
        setLoading(false)
        return
      }
      setSession(data.session)
      setItems(data.items)
      if (data.session.status === 'completed') {
        setCompleted(true)
      } else {
        await loadCurrentDraft(data.items[data.session.current_index])
      }
    } catch {
      setError('Backend se connect nahi ho paya.')
    } finally {
      setLoading(false)
    }
  }, [sessionId, loadCurrentDraft])

  useEffect(() => { loadSession() }, [loadSession])

  async function advance(outcome, draftIdForOutcome) {
    setActionLoading(true)
    setError('')
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/whatsapp-outreach/sessions/${sessionId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome, draft_id: draftIdForOutcome || null }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.detail || 'Could not record this action — try again.')
        return
      }
      if (data.session_status === 'completed') {
        setCompleted(true)
        setSession(s => ({ ...s, status: 'completed', current_index: data.current_index }))
        return
      }
      setSession(s => ({ ...s, current_index: data.current_index }))
      await loadCurrentDraft(items[data.current_index])
    } catch {
      setError('Backend se connect nahi ho paya — is prospect abhi bhi pending hai.')
    } finally {
      setActionLoading(false)
    }
  }

  function handleSendOnWhatsApp() {
    if (!currentItem || !draftId || actionLoading) return
    const digits = (currentItem.phone_e164 || '').replace(/^\+/, '')
    if (!digits) { setError('This prospect has no valid phone number.'); return }
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(messageText)}`, '_blank', 'noopener,noreferrer')
    advance('sent', draftId)
  }

  function handleMarkSent() {
    if (!currentItem || !draftId || actionLoading) return
    advance('sent', draftId)
  }

  function handleSkip() {
    if (actionLoading) return
    advance('skipped', null)
  }

  function handleNoNumber() {
    if (actionLoading) return
    advance('no_number', null)
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (actionLoading || completed || loading) return
      const inTextarea = document.activeElement === textareaRef.current
      if (e.key === 'Enter' && !inTextarea) {
        e.preventDefault()
        handleSendOnWhatsApp()
      } else if ((e.key === 's' || e.key === 'S') && !inTextarea) {
        e.preventDefault()
        handleSkip()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionLoading, completed, loading, currentItem, draftId, messageText])

  if (loading && !session) {
    return (
      <PageShell maxWidth="560px">
        <PageHeader title="WhatsApp Outreach" sub="Loading queue..." />
        <Skeleton variant="rect" height="220px" />
      </PageShell>
    )
  }

  if (error && !session) {
    return (
      <PageShell maxWidth="560px">
        <PageHeader title="WhatsApp Outreach" sub="" />
        <div style={errBox}>{error}</div>
        <Button variant="secondary" icon={Home} onClick={() => navigate('/revenue-engine/pipeline')} style={{ marginTop: '12px' }}>
          Back to Pipeline
        </Button>
      </PageShell>
    )
  }

  if (completed) {
    const sentCount = items.filter(i => i.status === 'sent').length
    const skippedCount = items.filter(i => i.status === 'skipped').length
    const noNumberCount = items.filter(i => i.status === 'no_number').length
    return (
      <PageShell maxWidth="560px">
        <PageHeader title="WhatsApp Outreach" sub="Queue complete" />
        <Card style={{ padding: '28px', textAlign: 'center' }}>
          <CheckCircle2 size={40} color={TEXT_PRIMARY} style={{ marginBottom: '12px' }} />
          <p style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: TEXT_PRIMARY }}>All {items.length} prospects worked through</p>
          <p style={{ margin: '0 0 18px', fontSize: '13px', color: TEXT_SECONDARY }}>
            {sentCount} sent · {skippedCount} skipped · {noNumberCount} no number
          </p>
          <Button variant="primary" onClick={() => navigate('/revenue-engine/pipeline')}>Back to Pipeline</Button>
        </Card>
      </PageShell>
    )
  }

  const isTooLong = messageText.length > WA_LENGTH_WARNING

  return (
    <PageShell maxWidth="560px">
      <PageHeader
        title="WhatsApp Outreach"
        sub={`${currentIndex + 1} of ${items.length}`}
      />

      {error && <div style={{ ...errBox, marginBottom: '12px' }}>{error}</div>}

      {currentItem && (
        <Card style={{ padding: '20px' }}>
          <div style={{ marginBottom: '14px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: TEXT_PRIMARY }}>{currentItem.business_name}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: TEXT_TERTIARY }}>
              <span>{currentItem.phone_e164 || 'no phone'}</span>
              <span>Gap: {gapLabel(currentItem.detected_gap)}</span>
              <span>Opportunity <b className="tabular-nums" style={{ color: scoreColor(currentItem.opportunity_score) }}>{currentItem.opportunity_score ?? '—'}/100</b></span>
            </div>
          </div>

          {draftLoading ? (
            <Skeleton variant="rect" height="100px" />
          ) : noDraftFound ? (
            <div style={{ background: WARNING_MUTED, border: `1px solid rgba(251,191,36,0.32)`, borderRadius: radius.md, padding: '12px 14px', marginBottom: '14px' }}>
              <p style={{ margin: 0, fontSize: '12.5px', color: WARNING }}>
                No WhatsApp draft found for this prospect — it may not have been generated. Skip it, or go back to the Pipeline and regenerate.
              </p>
            </div>
          ) : (
            <>
              <textarea
                ref={textareaRef}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                rows={5}
                style={{
                  width: '100%', boxSizing: 'border-box', resize: 'vertical', padding: '12px 14px',
                  borderRadius: radius.md, border: `1px solid ${isTooLong ? DANGER : BORDER_SUBTLE}`,
                  background: BG_INSET, color: TEXT_PRIMARY, fontSize: '13.5px', lineHeight: 1.5,
                  fontFamily: 'inherit', marginBottom: '6px',
                }}
              />
              <p style={{ margin: '0 0 16px', fontSize: '11px', color: isTooLong ? DANGER : TEXT_TERTIARY, textAlign: 'right' }}>
                {messageText.length} characters{isTooLong ? ' — long messages can break the wa.me link or get cut off, consider shortening' : ''}
              </p>
            </>
          )}

          <Button
            variant="primary" size="lg" icon={MessageCircle}
            disabled={draftLoading || noDraftFound || actionLoading || !currentItem.phone_e164}
            onClick={handleSendOnWhatsApp}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            Send on WhatsApp <span style={{ opacity: 0.6, marginLeft: '6px', fontSize: '11px' }}>(Enter)</span>
          </Button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" icon={SkipForward} disabled={actionLoading} onClick={handleSkip} style={{ flex: 1 }}>
              Skip <span style={{ opacity: 0.6, marginLeft: '4px', fontSize: '10.5px' }}>(S)</span>
            </Button>
            <Button variant="secondary" size="sm" icon={CheckCircle2} disabled={draftLoading || noDraftFound || actionLoading} onClick={handleMarkSent} style={{ flex: 1 }}>
              Mark Sent
            </Button>
            <Button variant="secondary" size="sm" icon={PhoneOff} disabled={actionLoading} onClick={handleNoNumber} style={{ flex: 1 }}>
              No Number
            </Button>
          </div>
        </Card>
      )}

      <p style={{ margin: '14px 0 0', fontSize: '11px', color: TEXT_TERTIARY, textAlign: 'center' }}>
        "Send on WhatsApp" opens the chat pre-filled — you still tap send yourself in WhatsApp. Marking sent here only records that you sent it; delivery is never confirmed by the app.
      </p>
    </PageShell>
  )
}
