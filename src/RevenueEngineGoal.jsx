import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, Sparkles } from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { TEXT_PRIMARY, TEXT_TERTIARY, ACCENT, BG_INSET, errBox, inp, lbl, radius } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import RevenueEngineSubNav from './RevenueEngineSubNav'
import Card from './components/ui/Card'
import Input from './components/ui/Input'
import Button from './components/ui/Button'

export default function RevenueEngineGoal() {
  const navigate = useNavigate()
  const toast = useToast()

  const [text, setText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [starting, setStarting] = useState(false)
  const [goal, setGoal] = useState(null)
  const [error, setError] = useState('')

  async function handleParse() {
    if (!text.trim()) { setError('Describe your goal first.'); return }
    setError(''); setParsing(true); setGoal(null)
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/parse-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (data.success) {
        setGoal(data.goal)
      } else {
        const msg = data.detail || 'Could not parse that goal.'
        setError(msg); toast.error(msg)
      }
    } catch {
      setError('Backend se connect nahi ho paya.'); toast.error('Backend se connect nahi ho paya.')
    }
    setParsing(false)
  }

  async function handleStart() {
    if (!goal) return
    if (!goal.industry) { setError('Which industry? Add it and re-parse before starting.'); return }
    setStarting(true); setError('')
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_type: goal.goal_type, industry: goal.industry, city: goal.city,
          target_count: goal.target_count, target_amount: goal.target_amount,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Quick Scan started — results will stream in.')
        navigate(`/revenue-engine/pipeline?batch=${data.batch_id}`)
      } else {
        const msg = data.message || data.detail || 'Could not start discovery.'
        setError(msg); toast.error(msg)
      }
    } catch {
      setError('Backend se connect nahi ho paya.'); toast.error('Backend se connect nahi ho paya.')
    }
    setStarting(false)
  }

  return (
    <PageShell maxWidth="720px">
      <RevenueEngineSubNav />
      <PageHeader
        title="Discover"
        sub="Tell it what you need — a segment to prospect, or a revenue target — and it builds the plan."
      />

      <Card>
        <Card.Body>
          {error && <div style={{ ...errBox, marginBottom: '16px' }}>{error}</div>}

          <label style={lbl}>What do you need?</label>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder='e.g. "I need 5 hotel clients in Jaipur" or "I want ₹5 lakh revenue this month"'
            style={{ ...inp, minHeight: '90px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '14px' }}
          />

          <Button variant="primary" size="md" icon={Sparkles} loading={parsing} onClick={handleParse} style={{ marginBottom: goal ? '20px' : 0 }}>
            {parsing ? 'Understanding...' : 'Understand Goal'}
          </Button>

          {goal && (
            <div style={{ background: BG_INSET, borderRadius: radius.md, padding: '16px', marginBottom: '18px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '700', color: TEXT_TERTIARY, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Understood as
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: goal.needs_clarification ? '10px' : 0 }}>
                <Input label="Industry" value={goal.industry || ''} onChange={e => setGoal(g => ({ ...g, industry: e.target.value }))} placeholder="required" />
                <Input label="City" value={goal.city || ''} onChange={e => setGoal(g => ({ ...g, city: e.target.value }))} placeholder="optional" />
              </div>
              <p style={{ margin: '10px 0 0', fontSize: '12px', color: TEXT_PRIMARY }}>
                {goal.goal_type === 'revenue'
                  ? `Revenue goal: ₹${(goal.target_amount || 0).toLocaleString('en-IN')} this month.`
                  : `Segment goal: ${goal.target_count ? `${goal.target_count} clients` : 'as many qualified prospects as possible'}.`}
              </p>
              {goal.needs_clarification && !goal.industry && (
                <p style={{ margin: '8px 0 0', fontSize: '11.5px', color: ACCENT }}>
                  Add an industry above before starting.
                </p>
              )}
            </div>
          )}

          {goal && (
            <Button variant="primary" size="lg" icon={Rocket} loading={starting} disabled={!goal.industry} onClick={handleStart} style={{ width: '100%' }}>
              {starting ? 'Starting Quick Scan...' : 'Start Quick Scan'}
            </Button>
          )}
        </Card.Body>
      </Card>
    </PageShell>
  )
}
