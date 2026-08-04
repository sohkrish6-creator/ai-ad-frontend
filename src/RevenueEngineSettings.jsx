import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Info } from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, card, lbl, inp, BONE, MUTED, SLATE_M, SLATE_L } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import RevenueEngineSubNav from './RevenueEngineSubNav'

export default function RevenueEngineSettings() {
  const navigate = useNavigate()
  const toast = useToast()
  const [catalog, setCatalog] = useState([])
  const [prices, setPrices] = useState({})   // { service_key: price string }
  const [units, setUnits] = useState({})     // { service_key: unit }
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/rate-card`)
      const data = await res.json()
      if (data.success) {
        setCatalog(data.service_catalog)
        const p = {}, u = {}
        data.entries.forEach(e => { p[e.service_key] = String(e.price); u[e.service_key] = e.unit })
        setPrices(p); setUnits(u)
      }
    } catch { toast.error('Backend se connect nahi ho paya.') }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    setSaving(true)
    try {
      const entries = Object.entries(prices)
        .filter(([, v]) => v !== '' && v !== undefined && !isNaN(Number(v)))
        .map(([service_key, v]) => ({ service_key, price: Number(v), unit: units[service_key] || 'month' }))
      const res = await apiFetch(`${BACKEND}/revenue-engine/rate-card`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
      const data = await res.json()
      if (data.success) { toast.success('Rate card saved.') } else toast.error(data.detail || 'Could not save.')
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setSaving(false)
  }

  return (
    <PageShell maxWidth="640px">
      <RevenueEngineSubNav />
      <PageHeader title="Rate Card" sub="Your real prices per service — used for the Call Assistant's budget estimate and future proposals. Never invented." />

      <div style={{ ...card, padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <Info size={15} color={GOLD} style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ margin: 0, fontSize: '12px', color: MUTED, lineHeight: 1.5 }}>
          Business name and services offered are shared with Voice Outreach —
          <button onClick={() => navigate('/voice-outreach/settings')} style={{
            background: 'none', border: 'none', color: GOLD, cursor: 'pointer', fontSize: '12px',
            fontWeight: '700', padding: '0 4px', textDecoration: 'underline',
          }}>
            manage that in Voice Outreach Settings
          </button>
          if you haven't already.
        </p>
      </div>

      <div style={{ ...card, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Wallet size={15} color={GOLD} />
          <p style={{ ...lbl, margin: 0 }}>Prices Per Service</p>
        </div>
        {catalog.map(svc => (
          <div key={svc.key} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px', gap: '10px', alignItems: 'end', marginBottom: '12px' }}>
            <div>
              <label style={lbl}>{svc.label}</label>
            </div>
            <div>
              <input
                type="number" min="0" placeholder="₹ price"
                value={prices[svc.key] || ''}
                onChange={e => setPrices(p => ({ ...p, [svc.key]: e.target.value }))}
                style={inp}
              />
            </div>
            <div>
              <select value={units[svc.key] || 'month'} onChange={e => setUnits(u => ({ ...u, [svc.key]: e.target.value }))} style={inp}>
                <option value="month">/ month</option>
                <option value="project">/ project</option>
                <option value="one_time">one-time</option>
              </select>
            </div>
          </div>
        ))}

        <button onClick={handleSave} disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: '8px', background: saving ? SLATE_M : GOLD,
          border: 'none', color: saving ? MUTED : '#0B0B0D', padding: '11px 22px', borderRadius: '8px',
          fontSize: '13.5px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', marginTop: '8px',
        }}>
          {saving ? 'Saving...' : 'Save Rate Card'}
        </button>
      </div>
    </PageShell>
  )
}
