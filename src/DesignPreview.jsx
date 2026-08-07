import { useState } from 'react'
import { Rocket, Users, Inbox, Search } from 'lucide-react'
import { BG_BASE, TEXT_PRIMARY, TEXT_SECONDARY, FONT_BODY } from './ds'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import Input from './components/ui/Input'
import Select from './components/ui/Select'
import Checkbox from './components/ui/Checkbox'
import Toggle from './components/ui/Toggle'
import Badge from './components/ui/Badge'
import Table from './components/ui/Table'
import Modal from './components/ui/Modal'
import Skeleton from './components/ui/Skeleton'
import EmptyState from './components/ui/EmptyState'
import MetricCard from './components/ui/MetricCard'
import Tabs from './components/ui/Tabs'
import Tooltip from './components/ui/Tooltip'

/**
 * DesignPreview — scratch route for reviewing every ui/ primitive in every
 * state (loading/empty/populated/hover) before wiring into real pages.
 * NOT wired into App.jsx's route table — dev-only, visited by temporarily
 * adding the route locally. See visual-redesign plan, Step 2.
 */
export default function DesignPreview() {
  const [checked, setChecked] = useState(true)
  const [toggled, setToggled] = useState(false)
  const [tab, setTab] = useState('a')
  const [modalOpen, setModalOpen] = useState(false)
  const [tableLoading, setTableLoading] = useState(true)

  const section = { marginBottom: '40px' }
  const h2 = { fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: TEXT_SECONDARY, marginBottom: '14px' }
  const row = { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }

  return (
    <div style={{ minHeight: '100vh', background: BG_BASE, color: TEXT_PRIMARY, fontFamily: FONT_BODY, padding: '40px', maxWidth: '1100px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '32px' }}>Design Preview</h1>

      <div style={section}>
        <p style={h2}>Button</p>
        <div style={row}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" size="sm" icon={Rocket}>Small w/ icon</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
      </div>

      <div style={section}>
        <p style={h2}>Card</p>
        <Card style={{ maxWidth: '360px' }} hoverable>
          <Card.Header title="Card title" sub="One-line description" action={<Button size="sm" variant="ghost">Action</Button>} />
          <Card.Body>Body content goes here.</Card.Body>
          <Card.Footer>Footer content</Card.Footer>
        </Card>
      </div>

      <div style={section}>
        <p style={h2}>Input / Select / Checkbox / Toggle</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', maxWidth: '500px', marginBottom: '14px' }}>
          <Input label="Business name" placeholder="Type here..." />
          <Input label="With error" error="Required field" />
          <Select label="Industry" placeholder="Select..." options={[{ value: 'gym', label: 'Gym' }, { value: 'salon', label: 'Salon' }]} />
        </div>
        <div style={row}>
          <Checkbox checked={checked} onChange={setChecked} label="Checked" />
          <Checkbox checked={false} onChange={() => {}} label="Unchecked" />
          <Toggle checked={toggled} onChange={setToggled} label="Toggle" />
        </div>
      </div>

      <div style={section}>
        <p style={h2}>Badge / StatusPill</p>
        <div style={row}>
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </div>

      <div style={section}>
        <p style={h2}>MetricCard</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <MetricCard label="Scanned" value={22} icon={Search} />
          <MetricCard label="Qualified" value={6} delta={{ direction: 'up', value: '+2 today' }} sparkline={[3, 4, 4, 5, 6, 6]} />
          <MetricCard label="Revenue (Hero)" value={148000} size="lg" delta={{ direction: 'up', value: '+12%' }} />
          <MetricCard label="Churn (Hero)" value={4} size="lg" delta={{ direction: 'down', value: '-1' }} />
        </div>
      </div>

      <div style={section}>
        <p style={h2}>Tabs</p>
        <Tabs items={[{ key: 'a', label: 'Overview' }, { key: 'b', label: 'Details' }, { key: 'c', label: 'History' }]} active={tab} onChange={setTab} />
      </div>

      <div style={section}>
        <p style={h2}>Tooltip</p>
        <Tooltip content="This is a tooltip"><Button variant="secondary" size="sm">Hover me</Button></Tooltip>
      </div>

      <div style={section}>
        <p style={h2}>Skeleton</p>
        <Skeleton variant="text" count={3} style={{ marginBottom: '10px', maxWidth: '300px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <Skeleton variant="circle" />
          <Skeleton variant="rect" width="200px" />
        </div>
      </div>

      <div style={section}>
        <p style={h2}>EmptyState</p>
        <Card style={{ maxWidth: '400px' }}>
          <EmptyState icon={Inbox} headline="No batches yet" description="Start a Quick Scan from the Goal page to see prospects here." action={{ label: 'Start Quick Scan', onClick: () => {} }} />
        </Card>
      </div>

      <div style={section}>
        <p style={h2}>Table (loading / populated / empty)</p>
        <div style={row}>
          <Button size="sm" variant="secondary" onClick={() => setTableLoading(l => !l)}>Toggle loading: {String(tableLoading)}</Button>
        </div>
        <Table
          loading={tableLoading}
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'score', label: 'Score', sortable: true, render: r => <Badge variant={r.score > 70 ? 'success' : 'warning'}>{r.score}</Badge> },
          ]}
          rows={tableLoading ? [] : [{ id: 1, name: 'Assured Fit Gym', score: 75 }, { id: 2, name: 'Burnfit Gym', score: 65 }]}
          rowKey={r => r.id}
          empty={{ icon: Users, headline: 'No prospects', description: 'Run a scan to populate this table.', action: { label: 'Run Scan', onClick: () => {} } }}
        />
      </div>

      <div style={section}>
        <p style={h2}>Modal</p>
        <Button variant="primary" onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Confirm action" footer={<><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" onClick={() => setModalOpen(false)}>Confirm</Button></>}>
          Modal body content.
        </Modal>
      </div>
    </div>
  )
}
