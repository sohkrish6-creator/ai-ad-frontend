import { useState, useEffect } from 'react'

const GOLD = '#D4AF37'
const card = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
const inputSt = { width: '100%', padding: '10px 12px', borderRadius: '7px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
const lbl = { display: 'block', color: '#999', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }

const statusColor = { 'New': '#D4AF37', 'Contacted': '#F59E0B', 'Converted': '#22C55E', 'Lost': '#EF4444' }
const statusBg   = { 'New': '#D4AF3712', 'Contacted': '#F59E0B12', 'Converted': '#22C55E12', 'Lost': '#EF444412' }

function Leads() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'whatsapp', message: '', campaign: '' })

  const BASE = 'https://ai-ad-backend-zhpj.onrender.com'

  async function loadLeads() {
    try { const res = await fetch(`${BASE}/leads`); const d = await res.json(); setLeads(d.leads) } catch {}
  }
  async function loadStats() {
    try { const res = await fetch(`${BASE}/leads/stats`); setStats(await res.json()) } catch {}
  }
  async function handleAddLead() {
    if (!form.name || !form.phone) { alert('Naam aur phone zaroori hai!'); return }
    setLoading(true)
    try {
      await fetch(`${BASE}/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setForm({ name: '', phone: '', email: '', source: 'whatsapp', message: '', campaign: '' })
      setShowForm(false); loadLeads(); loadStats()
    } catch { alert('Lead add nahi hua') }
    setLoading(false)
  }
  async function updateStatus(id, status) {
    await fetch(`${BASE}/leads/${id}?status=${status}`, { method: 'PUT' })
    loadLeads()
  }

  useEffect(() => { loadLeads(); loadStats() }, [])

  const kpis = [
    { label: 'Total Leads', value: stats.total || 0 },
    { label: 'WhatsApp',    value: stats.whatsapp || 0 },
    { label: 'Website',     value: stats.website || 0 },
    { label: 'Converted',   value: stats.converted || 0 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', padding: isMobile ? '28px 16px' : '40px 36px', maxWidth: '1040px', width: '100%', boxSizing: 'border-box' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Leads</h1>
          <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>Saare leads ek jagah</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ background: '#171717', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          + New Lead
        </button>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {kpis.map(k => (
          <div key={k.label} style={{ ...card, padding: '18px 16px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#999', margin: '0 0 10px' }}>{k.label}</p>
            <p style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-1.5px', color: '#171717', margin: 0, lineHeight: 1 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Add lead form */}
      {showForm && (
        <div style={{ ...card, padding: '24px', marginBottom: '16px', borderColor: '#E5DABB' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 20px', color: '#171717' }}>New Lead</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
            {[['Naam *', 'name', 'text', 'Lead ka naam'], ['Phone *', 'phone', 'tel', '+91 98765 43210'], ['Email', 'email', 'email', 'email@example.com']].map(([l, k, t, ph]) => (
              <div key={k}>
                <label style={lbl}>{l}</label>
                <input type={t} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={ph} style={inputSt} />
              </div>
            ))}
            <div>
              <label style={lbl}>Source</label>
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={inputSt}>
                <option value="whatsapp">WhatsApp</option>
                <option value="website">Website</option>
                <option value="form">Form</option>
              </select>
            </div>
            <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
              <label style={lbl}>Message</label>
              <input value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Lead ne kya poochha..." style={inputSt} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
            <button onClick={handleAddLead} disabled={loading} style={{ background: '#171717', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              {loading ? 'Saving...' : 'Save Lead'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid #E5E5E5', color: '#666', padding: '10px 18px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Leads table */}
      <div style={{ ...card, overflow: 'hidden', boxShadow: 'none' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #EAEAEA' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#171717' }}>All Leads ({leads.length})</p>
        </div>

        {leads.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#999', fontSize: '14px', margin: '0 0 4px' }}>Abhi koi lead nahi hai</p>
            <p style={{ color: '#CCC', fontSize: '13px', margin: 0 }}>"+ New Lead" se pehla lead add karo</p>
          </div>
        ) : (
          leads.map((lead, i) => (
            <div key={lead.id} style={{ padding: '14px 20px', borderBottom: i < leads.length - 1 ? '1px solid #F5F5F5' : 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '13px', color: '#999' }}>{lead.name?.[0]?.toUpperCase() || '?'}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontWeight: '500', fontSize: '14px', color: '#171717' }}>{lead.name}</p>
                <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                  {lead.phone}{lead.email ? ` · ${lead.email}` : ''}{lead.source ? ` · ${lead.source}` : ''}
                </p>
                {lead.message && <p style={{ margin: '3px 0 0', color: '#BBB', fontSize: '12px', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{lead.message}"</p>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#CCC' }}>{lead.created_at}</p>
                <select
                  value={lead.status}
                  onChange={e => updateStatus(lead.id, e.target.value)}
                  style={{ padding: '3px 10px', borderRadius: '20px', border: `1px solid ${statusColor[lead.status]}40`, background: statusBg[lead.status], color: statusColor[lead.status], fontSize: '11px', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Leads
