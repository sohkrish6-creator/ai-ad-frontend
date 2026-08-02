import { useState, useEffect } from 'react'
import { Settings2, Info, Mic, PhoneCall, FlaskConical, Radio, Building2 } from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, GREEN, card, cardInner, lbl, inp, BONE, MUTED, SLATE_M, SLATE_L } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import VoiceOutreachSubNav from './VoiceOutreachSubNav'

const DAYS = [
  { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' }, { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' }, { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' }, { key: 'sun', label: 'Sun' },
]

export default function VoiceOutreachSettings() {
  const toast = useToast()
  const [settings, setSettings] = useState(null)
  const [agents, setAgents] = useState([])
  const [saving, setSaving] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testAgentId, setTestAgentId] = useState('')
  const [testingCall, setTestingCall] = useState(false)

  async function load() {
    try {
      const [sRes, aRes] = await Promise.all([
        apiFetch(`${BACKEND}/voice-outreach/settings`),
        apiFetch(`${BACKEND}/voice-outreach/agents`),
      ])
      const sData = await sRes.json()
      const aData = await aRes.json()
      if (sData.success) setSettings(sData.settings)
      if (aData.success) setAgents(aData.agents)
    } catch { toast.error('Backend se connect nahi ho paya.') }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleDay(day) {
    setSettings(s => {
      const days = s.calling_days.includes(day) ? s.calling_days.filter(d => d !== day) : [...s.calling_days, day]
      return { ...s, calling_days: days }
    })
  }

  function toggleService(key) {
    setSettings(s => {
      const cur = s.services_offered || []
      const next = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key]
      return { ...s, services_offered: next }
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: (settings.business_name || '').trim(),
          services_offered: settings.services_offered || [],
          calling_window_start: settings.calling_window_start,
          calling_window_end: settings.calling_window_end,
          calling_days: settings.calling_days,
          compliance_mode: settings.compliance_mode,
          cooldown_days: Number(settings.cooldown_days),
          max_call_attempts_same_day: Number(settings.max_call_attempts_same_day),
          blended_rate_per_minute_micros: Math.round(Number(settings.rate_display || 0) * 1_000_000),
          avg_estimated_call_duration_seconds: Number(settings.avg_estimated_call_duration_seconds),
          default_voice_agent_id: settings.default_voice_agent_id ? Number(settings.default_voice_agent_id) : null,
          call_mode: settings.call_mode,
          max_review_count: Number(settings.max_review_count),
          min_review_count: Number(settings.min_review_count),
          exclude_chains: settings.exclude_chains,
        }),
      })
      const data = await res.json()
      if (data.success) { toast.success('Settings saved.'); setSettings(data.settings) }
      else toast.error(data.detail || 'Could not save settings.')
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setSaving(false)
  }

  async function handleTestCall() {
    if (!testPhone.trim()) { toast.error('Enter a phone number to test call.'); return }
    setTestingCall(true)
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/test-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone, agent_id: testAgentId ? Number(testAgentId) : null }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(settings.call_mode === 'live' ? 'Live test call started.' : 'Dry-run test call started — check the Call Dashboard.')
      } else {
        toast.error(data.detail || 'Could not start test call.')
      }
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setTestingCall(false)
  }

  if (!settings) {
    return (
      <PageShell maxWidth="720px">
        <VoiceOutreachSubNav />
        <PageHeader title="Voice Outreach — Settings" sub="Loading..." />
      </PageShell>
    )
  }

  const rateDisplay = settings.rate_display ?? (settings.blended_rate_per_minute_micros / 1_000_000)

  return (
    <PageShell maxWidth="720px">
      <VoiceOutreachSubNav />
      <PageHeader title="Voice Outreach — Settings" sub="Calling window, compliance mode, and cooldown rules — enforced server-side on every approval and every call." />

      <div style={{ ...card, padding: '20px', marginBottom: '16px', border: settings.business_name ? undefined : `1px solid ${GOLD}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Building2 size={15} color={GOLD} />
          <p style={{ ...lbl, margin: 0 }}>Your Business Profile</p>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: '11.5px', color: MUTED, lineHeight: 1.5 }}>
          This is YOUR business identity, used in every call disclosure and pitch — never a placeholder, never
          the AdSoh platform name. Required before any pitch can be generated or any call placed.
        </p>
        <div style={{ marginBottom: '16px' }}>
          <label style={lbl}>Business Name</label>
          <input
            type="text" value={settings.business_name || ''}
            onChange={e => setSettings(s => ({ ...s, business_name: e.target.value }))}
            placeholder="e.g. Digital Boost Social" style={inp}
          />
        </div>
        <label style={lbl}>Services You Offer</label>
        <p style={{ margin: '0 0 10px', fontSize: '11px', color: MUTED }}>
          Pitches only ever mention services checked here — a detected weakness with no matching service here
          is never pitched.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
          {(settings.service_catalog || []).map(svc => (
            <label key={svc.key} style={{
              ...cardInner, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              border: `1px solid ${(settings.services_offered || []).includes(svc.key) ? GOLD : SLATE_L}`,
            }}>
              <input type="checkbox" checked={(settings.services_offered || []).includes(svc.key)} onChange={() => toggleService(svc.key)} />
              <span style={{ fontSize: '12px', color: BONE }}>{svc.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ ...card, padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Radio size={15} color={GOLD} />
          <p style={{ ...lbl, margin: 0 }}>Call Mode</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: settings.vapi_configured ? 0 : '10px' }}>
          {['dry_run', 'live'].map(mode => {
            const disabled = mode === 'live' && !settings.vapi_configured
            const active = settings.call_mode === mode
            return (
              <button
                key={mode}
                disabled={disabled}
                onClick={() => !disabled && setSettings(s => ({ ...s, call_mode: mode }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '7px',
                  fontSize: '13px', fontWeight: '700', cursor: disabled ? 'not-allowed' : 'pointer',
                  border: `1px solid ${active ? GOLD : SLATE_L}`,
                  background: active ? 'rgba(201,162,39,0.14)' : 'transparent',
                  color: disabled ? MUTED : (active ? GOLD : BONE), opacity: disabled ? 0.5 : 1,
                }}
              >
                {mode === 'dry_run' ? <FlaskConical size={14} /> : <PhoneCall size={14} />}
                {mode === 'dry_run' ? 'Dry Run' : 'Live'}
              </button>
            )
          })}
        </div>
        {!settings.vapi_configured && (
          <p style={{ margin: '10px 0 0', fontSize: '11.5px', color: MUTED, lineHeight: 1.5 }}>
            Live calling is unavailable until Vapi credentials are configured on the server — everything runs in
            Dry Run (zero cost, zero external calls, full pipeline exercised with a synthetic transcript).
          </p>
        )}
      </div>

      <div style={{ ...card, padding: '20px', marginBottom: '16px' }}>
        <p style={{ ...lbl, marginBottom: '14px' }}>Calling Window</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={lbl}>Start</label>
            <input type="time" value={settings.calling_window_start} onChange={e => setSettings(s => ({ ...s, calling_window_start: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>End</label>
            <input type="time" value={settings.calling_window_end} onChange={e => setSettings(s => ({ ...s, calling_window_end: e.target.value }))} style={inp} />
          </div>
        </div>
        <label style={lbl}>Days</label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {DAYS.map(d => (
            <button key={d.key} onClick={() => toggleDay(d.key)} style={{
              padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              border: `1px solid ${settings.calling_days.includes(d.key) ? GOLD : SLATE_L}`,
              background: settings.calling_days.includes(d.key) ? 'rgba(201,162,39,0.14)' : 'transparent',
              color: settings.calling_days.includes(d.key) ? GOLD : MUTED,
            }}>
              {d.label}
            </button>
          ))}
        </div>
        <p style={{ margin: '10px 0 0', fontSize: '11px', color: MUTED }}>Timezone: {settings.timezone} (fixed)</p>
      </div>

      <div style={{ ...card, padding: '20px', marginBottom: '16px' }}>
        <p style={{ ...lbl, marginBottom: '14px' }}>Compliance & Cooldown</p>
        <div style={{ marginBottom: '14px' }}>
          <label style={lbl}>Compliance Mode</label>
          <select value={settings.compliance_mode} onChange={e => setSettings(s => ({ ...s, compliance_mode: e.target.value }))} style={inp}>
            <option value="strict">Strict</option>
            <option value="standard">Standard</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={lbl}>Cooldown (days between contacts)</label>
            <input type="number" min="0" value={settings.cooldown_days} onChange={e => setSettings(s => ({ ...s, cooldown_days: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>Max Attempts / Day</label>
            <input type="number" min="1" value={settings.max_call_attempts_same_day} onChange={e => setSettings(s => ({ ...s, max_call_attempts_same_day: e.target.value }))} style={inp} />
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: '20px', marginBottom: '16px' }}>
        <p style={{ ...lbl, marginBottom: '14px' }}>Enterprise/Chain Filter</p>
        <p style={{ margin: '0 0 14px', fontSize: '11.5px', color: MUTED, lineHeight: 1.5 }}>
          Businesses matching these are excluded from a batch automatically — never silently dropped, they stay
          visible in a "Filtered Out" section on the Review screen with an explicit per-business override.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={lbl}>Max Reviews</label>
            <input type="number" min="0" value={settings.max_review_count} onChange={e => setSettings(s => ({ ...s, max_review_count: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>Min Reviews</label>
            <input type="number" min="0" value={settings.min_review_count} onChange={e => setSettings(s => ({ ...s, min_review_count: e.target.value }))} style={inp} />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={!!settings.exclude_chains} onChange={e => setSettings(s => ({ ...s, exclude_chains: e.target.checked }))} />
          <span style={{ fontSize: '12.5px', color: BONE }}>Exclude known chains/brands (same-name-multiple-locations + brand keyword list)</span>
        </label>
      </div>

      <div style={{ ...card, padding: '20px', marginBottom: '16px' }}>
        <p style={{ ...lbl, marginBottom: '14px' }}>Cost Estimation</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={lbl}>Blended Rate (₹ / minute)</label>
            <input type="number" min="0" step="0.1" value={rateDisplay} onChange={e => setSettings(s => ({ ...s, rate_display: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>Avg. Call Duration (seconds)</label>
            <input type="number" min="1" value={settings.avg_estimated_call_duration_seconds} onChange={e => setSettings(s => ({ ...s, avg_estimated_call_duration_seconds: e.target.value }))} style={inp} />
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Mic size={15} color={GOLD} />
          <p style={{ ...lbl, margin: 0 }}>Voice Agent Presets</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
          {agents.map(a => (
            <label key={a.id} style={{
              ...cardInner, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer', border: `1px solid ${String(settings.default_voice_agent_id) === String(a.id) ? GOLD : SLATE_L}`,
            }}>
              <input type="radio" name="default_agent" checked={String(settings.default_voice_agent_id) === String(a.id)} onChange={() => setSettings(s => ({ ...s, default_voice_agent_id: a.id }))} />
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: BONE }}>{a.name}</p>
                <p style={{ margin: 0, fontSize: '10.5px', color: MUTED }}>{a.personality} · {a.language}</p>
              </div>
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '10px' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={lbl}>Test Call — Your Number</label>
            <input type="text" value={testPhone} onChange={e => setTestPhone(e.target.value)} placeholder="+91 98765 43210" style={inp} />
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={lbl}>Personality</label>
            <select value={testAgentId} onChange={e => setTestAgentId(e.target.value)} style={inp}>
              <option value="">Use default</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <button onClick={handleTestCall} disabled={testingCall} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
            border: `1px solid ${GOLD}`, color: GOLD, padding: '10px 16px', borderRadius: '7px',
            fontSize: '12.5px', fontWeight: '700', cursor: testingCall ? 'not-allowed' : 'pointer', height: '40px',
          }}>
            <PhoneCall size={13} /> {testingCall ? 'Starting...' : 'Test Call'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '9px 12px' }}>
          {settings.call_mode === 'live'
            ? <PhoneCall size={13} color={GREEN} style={{ flexShrink: 0, marginTop: '1px' }} />
            : <Info size={13} color={MUTED} style={{ flexShrink: 0, marginTop: '1px' }} />}
          <p style={{ margin: 0, fontSize: '11.5px', color: MUTED, lineHeight: 1.5 }}>
            {settings.call_mode === 'live'
              ? 'Live mode — this will place a real call via Vapi.'
              : 'Dry Run mode — this simulates the full call pipeline with a synthetic transcript, zero cost, zero external calls. Check the Call Dashboard to watch it progress.'}
          </p>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} style={{
        display: 'flex', alignItems: 'center', gap: '8px', background: saving ? SLATE_M : GOLD,
        border: 'none', color: saving ? MUTED : '#0B0B0D', padding: '12px 24px', borderRadius: '8px',
        fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
      }}>
        <Settings2 size={15} /> {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </PageShell>
  )
}
