import { useState, useEffect } from 'react'

function Leads() {
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    source: 'whatsapp', message: '', campaign: ''
  })

  // Leads load karo
  async function loadLeads() {
    try {
      const res = await fetch('http://127.0.0.1:8001/leads')
      const data = await res.json()
      setLeads(data.leads)
    } catch (err) {
      console.log('Leads load nahi hue')
    }
  }

  // Stats load karo
  async function loadStats() {
    try {
      const res = await fetch('http://127.0.0.1:8001/leads/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.log('Stats load nahi hue')
    }
  }

  // Lead add karo
  async function handleAddLead() {
    if (!form.name || !form.phone) {
      alert('Naam aur phone zaroori hai!')
      return
    }
    setLoading(true)
    try {
      await fetch('http://127.0.0.1:8001/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      setForm({ name: '', phone: '', email: '', source: 'whatsapp', message: '', campaign: '' })
      setShowForm(false)
      loadLeads()
      loadStats()
    } catch (err) {
      alert('Lead add nahi hua')
    }
    setLoading(false)
  }

  // Status update karo
  async function updateStatus(id, status) {
    await fetch(`http://127.0.0.1:8001/leads/${id}?status=${status}`, {
      method: 'PUT'
    })
    loadLeads()
  }

  useEffect(() => {
    loadLeads()
    loadStats()
  }, [])

  const sourceIcon = { whatsapp: '💬', website: '🌐', form: '📝' }
  const statusColor = {
    'New': '#6366F1',
    'Contacted': '#F59E0B',
    'Converted': '#10B981',
    'Lost': '#F43F5E'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>

      {/* Top Bar */}
      <div style={{ background: '#0D1117', borderBottom: '1px solid #1E2A3E', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: '700', fontSize: '15px' }}>✦ AI Ad Manager</span>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: '#6366F1', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
        >
          + New Lead
        </button>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>

        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>Lead Tracker</h1>
          <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>Saare leads ek jagah</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Leads', value: stats.total || 0, color: '#6366F1' },
            { label: 'WhatsApp', value: stats.whatsapp || 0, color: '#10B981' },
            { label: 'Website', value: stats.website || 0, color: '#06B6D4' },
            { label: 'Converted', value: stats.converted || 0, color: '#F59E0B' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '12px', padding: '20px' }}>
              <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '700', margin: 0, fontFamily: 'monospace', color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Add Lead Form */}
        {showForm && (
          <div style={{ background: '#0D1117', border: '1px solid #6366F1', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 20px 0' }}>New Lead Add Karo</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>Naam *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Lead ka naam"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>Phone *</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>Email</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>Source</label>
                <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}>
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="website">🌐 Website</option>
                  <option value="form">📝 Form</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>Message</label>
                <input value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Lead ne kya poochha..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>

            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={handleAddLead} disabled={loading}
                style={{ background: '#6366F1', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                {loading ? 'Save ho raha hai...' : '✓ Lead Save Karo'}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ background: 'transparent', border: '1px solid #1E2A3E', color: '#64748B', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2A3E' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
              Saare Leads ({leads.length})
            </h2>
          </div>

          {leads.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
              <p style={{ fontSize: '32px', margin: '0 0 12px 0' }}>📭</p>
              <p style={{ fontSize: '14px', margin: 0 }}>Abhi koi lead nahi hai</p>
              <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>"+ New Lead" button se pehla lead add karo</p>
            </div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} style={{ padding: '16px 20px', borderBottom: '1px solid #1E2A3E', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '20px' }}>{sourceIcon[lead.source] || '👤'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px 0', fontWeight: '600', fontSize: '14px' }}>{lead.name}</p>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '12px' }}>
                    {lead.phone} {lead.email && `· ${lead.email}`}
                  </p>
                  {lead.message && (
                    <p style={{ margin: '4px 0 0 0', color: '#94A3B8', fontSize: '12px', fontStyle: 'italic' }}>
                      "{lead.message}"
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#64748B' }}>{lead.created_at}</p>
                  <select
                    value={lead.status}
                    onChange={e => updateStatus(lead.id, e.target.value)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      border: `1px solid ${statusColor[lead.status]}40`,
                      background: `${statusColor[lead.status]}15`,
                      color: statusColor[lead.status],
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
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
    </div>
  )
}

export default Leads
