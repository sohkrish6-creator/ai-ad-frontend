import { useState, useEffect } from 'react'
import { ShieldOff, Trash2, Plus } from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, card, lbl, inp, BONE, MUTED, RED, SLATE_L } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

export default function VoiceOutreachDNC() {
  const toast = useToast()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [reason, setReason] = useState('')
  const [adding, setAdding] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/dnc`)
      const data = await res.json()
      if (data.success) setEntries(data.dnc_list)
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd() {
    if (!phone.trim()) { toast.error('Enter a phone number.'); return }
    setAdding(true)
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/dnc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, reason }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.re_gated_prospects > 0 ? `Added — blocked ${data.re_gated_prospects} pending prospect(s).` : 'Added to DNC list.')
        setPhone(''); setReason('')
        load()
      } else {
        toast.error(data.detail || 'Could not add — check the number is valid.')
      }
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setAdding(false)
  }

  async function handleDelete(id) {
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/dnc/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { toast.success('Removed.'); load() }
    } catch { toast.error('Backend se connect nahi ho paya.') }
  }

  return (
    <PageShell maxWidth="720px">
      <PageHeader title="Voice Outreach — DNC List" sub="Numbers here are permanently blocked from voice outreach — checked automatically on every approval." />

      <div style={{ ...card, padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={lbl}>Phone Number</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" style={inp} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={lbl}>Reason (optional)</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. requested opt-out" style={inp} />
          </div>
          <button onClick={handleAdd} disabled={adding} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: GOLD, border: 'none',
            color: '#0B0B0D', padding: '10px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: '700',
            cursor: adding ? 'not-allowed' : 'pointer', height: '40px',
          }}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ ...card, padding: '24px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>Loading...</div>
      ) : entries.length === 0 ? (
        <div style={{ ...card, padding: '24px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
          <ShieldOff size={20} color={MUTED} style={{ marginBottom: '8px' }} />
          <p style={{ margin: 0 }}>No numbers on the DNC list yet.</p>
        </div>
      ) : (
        entries.map(e => (
          <div key={e.id} style={{ ...card, padding: '12px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: BONE }}>{e.phone_e164}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: MUTED }}>{e.reason || 'No reason given'} · {new Date(e.created_at).toLocaleDateString()}</p>
            </div>
            <button onClick={() => handleDelete(e.id)} style={{
              display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent',
              border: `1px solid ${SLATE_L}`, color: RED, padding: '6px 11px', borderRadius: '6px',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            }}>
              <Trash2 size={12} /> Remove
            </button>
          </div>
        ))
      )}
    </PageShell>
  )
}
