import { useState, useEffect } from 'react'
import { Settings2, Info, Mic } from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, card, cardInner, lbl, inp, BONE, MUTED, SLATE_M, SLATE_L } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

const DAYS = [
  { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' }, { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' }, { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' }, { key: 'sun', label: 'Sun' },
]

export default function VoiceOutreachSettings() {
  const toast = useToast()
  const [settings, setSettings] = useState(null)
  const [agents, setAgents] = useState([])
  const [saving, setSaving] = useState(false)

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

  async function handleSave() {
    setSaving(true)
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calling_window_start: settings.calling_window_start,
          calling_window_end: settings.calling_window_end,
          calling_days: settings.calling_days,
          compliance_mode: settings.compliance_mode,
          cooldown_days: Number(settings.cooldown_days),
          max_call_attempts_same_day: Number(settings.max_call_attempts_same_day),
          blended_rate_per_minute_micros: Math.round(Number(settings.rate_display || 0) * 1_000_000),
          avg_estimated_call_duration_seconds: Number(settings.avg_estimated_call_duration_seconds),
          default_voice_agent_id: settings.default_voice_agent_id ? Number(settings.default_voice_agent_id) : null,
        }),
      })
      const data = await res.json()
      if (data.success) { toast.success('Settings saved.'); setSettings(data.settings) }
      else toast.error(data.detail || 'Could not save settings.')
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setSaving(false)
  }

  if (!settings) {
    return (
      <PageShell maxWidth="720px">
        <PageHeader title="Voice Outreach — Settings" sub="Loading..." />
      </PageShell>
    )
  }

  const rateDisplay = settings.rate_display ?? (settings.blended_rate_per_minute_micros / 1_000_000)

  return (
    <PageShell maxWidth="720px">
      <PageHeader title="Voice Outreach — Settings" sub="Calling window, compliance mode, and cooldown rules — enforced server-side on every approval and (once Phase 2 ships) every call." />

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
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '9px 12px' }}>
          <Info size={13} color={MUTED} style={{ flexShrink: 0, marginTop: '1px' }} />
          <p style={{ margin: 0, fontSize: '11.5px', color: MUTED, lineHeight: 1.5 }}>
            Test Call becomes available once Vapi is connected in Phase 2 — these presets have no assigned voice yet.
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
