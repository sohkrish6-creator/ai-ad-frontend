import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, BONE, MUTED } from './ds'

// service_fit is a BOOLEAN column read via a raw driver — Postgres returns
// real true/false but some drivers return 0/1, so a strict `=== false`
// check can silently miss it (same bug already fixed once in
// VoiceOutreachReview.jsx's isNoServiceFit — reused here, not reinvented).
function isNoServiceFit(prospect) {
  return prospect.service_fit !== null && prospect.service_fit !== undefined && !prospect.service_fit
}

/**
 * Post-audit fix (Item 1): a new tenant's first Quick Scan returns real,
 * correctly-scored prospects, but every one shows IGNORE with zero
 * explanation when no business profile/services are set yet — the actual
 * reason only surfaces if you click into an individual Lead Workspace.
 * This banner surfaces it at the Pipeline/Today's Tasks level instead,
 * where a first-time user actually looks first.
 *
 * Two modes, because the two pages structurally differ:
 * - Pipeline passes `prospects` (its full list, service_fit=false INCLUDED)
 *   — banner shows only when the profile is incomplete AND at least one
 *   visible prospect is actually blocked by it.
 * - Today's Tasks' query excludes service_fit=false rows entirely (they're
 *   never queueable), so they can never appear in what it passes here —
 *   counting them the same way would always read zero and the banner would
 *   never fire on the one page most in need of it. That page passes
 *   `requireBlocked={false}` instead: show whenever the profile itself is
 *   incomplete, since an incomplete profile is relevant context on this
 *   page regardless of how many prospects are currently queued.
 */
export default function RevenueEngineProfileBanner({ prospects, requireBlocked = true }) {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiFetch(`${BACKEND}/voice-outreach/settings`)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.success) setSettings(d.settings) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (!settings) return null
  const hasProfile = !!(settings.business_name || '').trim() && (settings.services_offered || []).length > 0
  if (hasProfile) return null

  const blockedCount = (prospects || []).filter(isNoServiceFit).length
  if (requireBlocked && blockedCount === 0) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(201,162,39,0.10)',
      border: `1px solid ${GOLD}`, borderRadius: '8px', padding: '13px 16px', marginBottom: '16px',
    }}>
      <AlertTriangle size={16} color={GOLD} style={{ flexShrink: 0, marginTop: '1px' }} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: BONE }}>
          {blockedCount > 0
            ? `${blockedCount} prospect${blockedCount === 1 ? '' : 's'} can't be pitched until you set your business name and services`
            : "Set your business name and services before prospects can be queued for outreach"}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: '12px', color: MUTED, lineHeight: 1.5 }}>
          {blockedCount > 0
            ? 'They\'re showing "Ignore" because there\'s no configured service to match a detected weakness against — this isn\'t a bad scan, it\'s a one-time setup step.'
            : 'Prospects with no matching service are never queued for outreach until this is set — this isn\'t a bad scan, it\'s a one-time setup step.'}
        </p>
      </div>
      <button onClick={() => navigate('/voice-outreach/settings')} style={{
        display: 'flex', alignItems: 'center', gap: '5px', background: GOLD, border: 'none', color: '#0B0B0D',
        padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0,
        whiteSpace: 'nowrap',
      }}>
        Set Up Profile
      </button>
    </div>
  )
}
