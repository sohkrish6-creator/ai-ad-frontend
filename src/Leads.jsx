import { BACKEND, apiFetch } from './lib/api'
import { useState, useEffect } from 'react'
import { useToast } from './ToastContext'
import { UserPlus, Users } from 'lucide-react'
import { TEXT_PRIMARY, TEXT_TERTIARY, ACCENT, WARNING, SUCCESS, DANGER, radius } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import Card from './components/ui/Card'
import Button from './components/ui/Button'
import Input from './components/ui/Input'
import Select from './components/ui/Select'
import MetricCard from './components/ui/MetricCard'
import Table from './components/ui/Table'

const STATUS_VARIANT = { New: 'accent', Contacted: 'warning', Converted: 'success', Lost: 'danger' }
const STATUS_OPTIONS = ['New', 'Contacted', 'Converted', 'Lost']

function Leads() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const toast = useToast()
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(true)
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'whatsapp', message: '', campaign: '' })

  const BASE = BACKEND

  // Post-audit fix (Item 4a): these two swallowed every failure, which was
  // indistinguishable from a genuinely empty account — a tenant with real
  // leads and a backend hiccup saw the exact same "Abhi koi lead nahi hai"
  // empty state as a tenant with zero leads.
  async function loadLeads() {
    try {
      const res = await apiFetch(`${BASE}/leads`)
      const d = await res.json()
      if (res.ok) setLeads(d.leads || [])
      else toast.error(d.message || d.detail || 'Could not load leads.')
    } catch { toast.error('Backend se connect nahi ho paya — leads load nahi hue.') }
    setTableLoading(false)
  }
  async function loadStats() {
    try {
      const res = await apiFetch(`${BASE}/leads/stats`)
      const d = await res.json()
      if (res.ok) setStats(d)
      else toast.error(d.message || d.detail || 'Could not load lead stats.')
    } catch { toast.error('Backend se connect nahi ho paya — stats load nahi hue.') }
  }
  async function handleAddLead() {
    if (!form.name || !form.phone) { alert('Naam aur phone zaroori hai!'); return }
    setLoading(true)
    try {
      await apiFetch(`${BASE}/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setForm({ name: '', phone: '', email: '', source: 'whatsapp', message: '', campaign: '' })
      setShowForm(false); loadLeads(); loadStats()
    } catch { alert('Lead add nahi hua') }
    setLoading(false)
  }
  // Post-audit fix (Item 4a): had no try/catch at all — a failed PUT left
  // the <select> showing whatever option the user just clicked (native DOM
  // selection) even though nothing was actually saved, since no re-render
  // ever occurred to snap the controlled value back. Now every exit path
  // reloads the real persisted state and a failure surfaces a toast instead
  // of leaving a silently-wrong value on screen.
  async function updateStatus(id, status) {
    try {
      const res = await apiFetch(`${BASE}/leads/${id}?status=${status}`, { method: 'PUT' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        toast.success('Status updated.')
      } else {
        toast.error(data.message || data.detail || 'Could not update status.')
      }
    } catch {
      toast.error('Backend se connect nahi ho paya — status save nahi hua.')
    } finally {
      loadLeads()
    }
  }

  useEffect(() => { loadLeads(); loadStats() }, [])

  const kpis = [
    { label: 'Total Leads', value: stats.total || 0 },
    { label: 'WhatsApp',    value: stats.whatsapp || 0 },
    { label: 'Website',     value: stats.website || 0 },
    { label: 'Converted',   value: stats.converted || 0 },
  ]

  return (
    <PageShell maxWidth="1040px">
      <PageHeader
        title="Leads"
        sub="Saare leads ek jagah"
        action={<Button variant="primary" icon={UserPlus} onClick={() => setShowForm(true)}>New Lead</Button>}
      />

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '18px' }}>
        {kpis.map(k => <MetricCard key={k.label} label={k.label} value={k.value} />)}
      </div>

      {/* Add lead form */}
      {showForm && (
        <Card style={{ marginBottom: '16px' }}>
          <Card.Body>
            <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 20px', color: TEXT_PRIMARY }}>New Lead</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              {[['Naam *', 'name', 'text', 'Lead ka naam'], ['Phone *', 'phone', 'tel', '+91 98765 43210'], ['Email', 'email', 'email', 'email@example.com']].map(([l, k, t, ph]) => (
                <Input key={k} label={l} type={t} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={ph} />
              ))}
              <Select label="Source" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                options={[{ value: 'whatsapp', label: 'WhatsApp' }, { value: 'website', label: 'Website' }, { value: 'form', label: 'Form' }]} />
              <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                <Input label="Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Lead ne kya poochha..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <Button variant="primary" loading={loading} onClick={handleAddLead}>Save Lead</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Leads table */}
      <Table
        loading={tableLoading}
        rowKey={lead => lead.id}
        rows={leads}
        empty={{
          icon: Users,
          headline: 'Abhi koi lead nahi hai',
          description: '"+ New Lead" se pehla lead add karo.',
          action: { label: 'New Lead', onClick: () => setShowForm(true) },
        }}
        columns={[
          {
            key: 'name', label: `Name`, render: lead => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(124,108,245,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '11.5px', color: ACCENT, fontWeight: 700 }}>{lead.name?.[0]?.toUpperCase() || '?'}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: '500', fontSize: '13.5px', color: TEXT_PRIMARY }}>{lead.name}</p>
                  <p style={{ margin: 0, color: TEXT_TERTIARY, fontSize: '11.5px' }}>
                    {lead.phone}{lead.email ? ` · ${lead.email}` : ''}{lead.source ? ` · ${lead.source}` : ''}
                  </p>
                  {lead.message && <p style={{ margin: '2px 0 0', color: TEXT_TERTIARY, fontSize: '11.5px', fontStyle: 'italic', maxWidth: '360px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{lead.message}"</p>}
                </div>
              </div>
            ),
          },
          { key: 'created_at', label: 'Created', width: '140px', render: lead => <span style={{ color: TEXT_TERTIARY, fontSize: '12px' }}>{lead.created_at}</span> },
          {
            key: 'status', label: 'Status', width: '140px', render: lead => (
              <select
                value={lead.status}
                onChange={e => updateStatus(lead.id, e.target.value)}
                style={{
                  padding: '4px 10px', borderRadius: radius.full, border: 'none', outline: 'none', cursor: 'pointer',
                  fontSize: '11px', fontWeight: '700',
                  background: { accent: 'rgba(124,108,245,0.12)', warning: 'rgba(251,191,36,0.12)', success: 'rgba(52,211,153,0.12)', danger: 'rgba(251,113,133,0.12)' }[STATUS_VARIANT[lead.status]],
                  color: { accent: ACCENT, warning: WARNING, success: SUCCESS, danger: DANGER }[STATUS_VARIANT[lead.status]],
                }}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ),
          },
        ]}
      />
    </PageShell>
  )
}

export default Leads
