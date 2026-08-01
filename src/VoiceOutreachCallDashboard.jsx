import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneOff, FlaskConical, Filter, BarChart2 } from 'lucide-react'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, GREEN, RED, MUTED, BONE, SLATE_M, SLATE_L, card } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

// Status glyph/color language mirrors CommandCenter.jsx's Live Tasks Panel
// (STEP_STATUS_STYLE, pulsing dot while running) — that component itself is
// private/non-exported and hardcoded to 4 unrelated Command Center intents
// (confirmed non-portable in Phase 1), so only the visual pattern is reused
// here, not the component.
const STATUS_STYLE = {
  queued:    { glyph: '○', color: MUTED,  label: 'Queued' },
  dialing:   { glyph: '◐', color: GOLD,   label: 'Dialing' },
  connected: { glyph: '◐', color: GOLD,   label: 'Connected' },
  talking:   { glyph: '◐', color: GOLD,   label: 'Talking' },
  ended:     { glyph: '✓', color: GREEN,  label: 'Ended' },
  failed:    { glyph: '✕', color: RED,    label: 'Failed' },
}
const ACTIVE_STATUSES = new Set(['dialing', 'connected', 'talking'])

function CallRow({ call, rateMicros, onOpen }) {
  const st = STATUS_STYLE[call.status] || STATUS_STYLE.queued
  const isActive = ACTIVE_STATUSES.has(call.status)
  const estCost = call.duration_seconds && rateMicros
    ? Math.round((call.duration_seconds / 60) * (rateMicros / 1_000_000))
    : null
  return (
    <div
      onClick={onOpen}
      style={{ ...card, padding: '13px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', cursor: 'pointer' }}
    >
      <div style={{
        width: '7px', height: '7px', borderRadius: '50%', background: st.color, flexShrink: 0,
        animation: isActive ? 'voicePulse 1s ease-in-out infinite alternate' : 'none',
      }} />
      <div style={{ flex: 1, minWidth: '160px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: BONE }}>
            {call.business_name || (call.is_test ? 'Test Call' : `Call #${call.id}`)}
          </p>
          {(call.is_dry_run === true || call.is_dry_run === 1) && (
            <span style={{ padding: '1px 7px', borderRadius: '4px', fontSize: '9.5px', fontWeight: '700', background: 'rgba(201,162,39,0.14)', color: GOLD, letterSpacing: '0.04em' }}>
              DRY RUN
            </span>
          )}
          {(call.is_test === true || call.is_test === 1) && (
            <span style={{ padding: '1px 7px', borderRadius: '4px', fontSize: '9.5px', fontWeight: '700', background: SLATE_M, color: MUTED, letterSpacing: '0.04em' }}>
              TEST
            </span>
          )}
        </div>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: MUTED }}>{call.dialed_number || '—'}</p>
      </div>
      <span style={{ fontSize: '12px', fontWeight: '700', color: st.color, minWidth: '80px' }}>{st.glyph} {st.label}</span>
      <span style={{ fontSize: '11.5px', color: MUTED, minWidth: '70px' }}>{call.duration_seconds ? `${call.duration_seconds}s` : '—'}</span>
      <span style={{ fontSize: '11.5px', color: MUTED, minWidth: '60px' }}>{estCost != null ? `₹${estCost}` : '—'}</span>
      {call.outcome && <span style={{ fontSize: '11px', color: MUTED, textTransform: 'capitalize' }}>{call.outcome.replace(/_/g, ' ')}</span>}
      {call.error && <span style={{ fontSize: '11px', color: RED }} title={call.error}>{call.error.slice(0, 60)}</span>}
    </div>
  )
}

export default function VoiceOutreachCallDashboard() {
  const navigate = useNavigate()
  const [calls, setCalls] = useState([])
  const [rateMicros, setRateMicros] = useState(null)
  const [needsReview, setNeedsReview] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    try {
      const qs = needsReview ? '?needs_review=true' : ''
      const res = await apiFetch(`${BACKEND}/voice-outreach/calls${qs}`)
      const data = await res.json()
      if (data.success) setCalls(data.calls)
    } catch {
      // transient network hiccup — just try again on the next tick
    }
    setLoaded(true)
  }, [needsReview])

  useEffect(() => {
    apiFetch(`${BACKEND}/voice-outreach/settings`).then(r => r.json()).then(d => {
      if (d.success) setRateMicros(d.settings.blended_rate_per_minute_micros)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    async function poll() { if (!cancelled) await load() }
    poll()
    const interval = setInterval(poll, 2000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [load])

  const activeCount = calls.filter(c => ACTIVE_STATUSES.has(c.status)).length
  const totalCost = calls.reduce((sum, c) => {
    if (!c.duration_seconds || !rateMicros) return sum
    return sum + (c.duration_seconds / 60) * (rateMicros / 1_000_000)
  }, 0)

  return (
    <PageShell maxWidth="960px">
      <style>{`@keyframes voicePulse { 0%{opacity:1} 100%{opacity:0.25} }`}</style>
      <PageHeader
        title="Voice Outreach — Call Dashboard"
        sub={`${activeCount} call${activeCount === 1 ? '' : 's'} in progress · running cost estimate ₹${Math.round(totalCost)}`}
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => navigate('/voice-outreach/analytics')} style={{
              display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
              border: `1px solid ${SLATE_L}`, color: MUTED, padding: '8px 14px', borderRadius: '7px',
              fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
            }}>
              <BarChart2 size={13} /> Analytics
            </button>
            <button onClick={() => setNeedsReview(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: '6px', background: needsReview ? 'rgba(201,162,39,0.14)' : 'transparent',
              border: `1px solid ${needsReview ? GOLD : SLATE_L}`, color: needsReview ? GOLD : MUTED,
              padding: '8px 14px', borderRadius: '7px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
            }}>
              <Filter size={13} /> Needs Review
            </button>
          </div>
        }
      />

      {!loaded ? (
        <div style={{ ...card, padding: '24px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>Loading...</div>
      ) : calls.length === 0 ? (
        <div style={{ ...card, padding: '48px 24px', textAlign: 'center' }}>
          {needsReview ? (
            <>
              <FlaskConical size={28} color={MUTED} style={{ marginBottom: '14px' }} />
              <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '600', color: BONE }}>Nothing needs review</p>
              <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>Every completed call classified with high confidence.</p>
            </>
          ) : (
            <>
              <PhoneOff size={28} color={MUTED} style={{ marginBottom: '14px' }} />
              <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '600', color: BONE }}>No calls yet</p>
              <p style={{ margin: 0, fontSize: '13px', color: MUTED, maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                Approve prospects on the Review screen and hit Confirm &amp; Call to see them here.
              </p>
            </>
          )}
        </div>
      ) : (
        calls.map(c => <CallRow key={c.id} call={c} rateMicros={rateMicros} onOpen={() => navigate(`/voice-outreach/calls/${c.id}`)} />)
      )}
    </PageShell>
  )
}
