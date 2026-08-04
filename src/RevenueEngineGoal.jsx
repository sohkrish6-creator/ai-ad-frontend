import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, Sparkles } from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, card, lbl, inp, BONE, MUTED, RED, SLATE_M, SLATE_L } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import RevenueEngineSubNav from './RevenueEngineSubNav'

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
        title="Revenue Engine"
        sub="Tell it what you need — a segment to prospect, or a revenue target — and it builds the plan."
      />

      <div style={{ ...card, padding: '24px' }}>
        {error && (
          <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid rgba(196,69,58,0.3)', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: RED, fontSize: '13px' }}>
            {error}
          </div>
        )}

        <label style={lbl}>What do you need?</label>
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder='e.g. "I need 5 hotel clients in Jaipur" or "I want ₹5 lakh revenue this month"'
          style={{ ...inp, minHeight: '90px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '14px' }}
        />

        <button onClick={handleParse} disabled={parsing} style={{
          display: 'flex', alignItems: 'center', gap: '8px', background: parsing ? SLATE_M : GOLD,
          border: `1px solid ${parsing ? SLATE_L : GOLD}`, color: parsing ? MUTED : '#0B0B0D',
          padding: '11px 20px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700',
          cursor: parsing ? 'not-allowed' : 'pointer', marginBottom: goal ? '20px' : 0,
        }}>
          <Sparkles size={15} /> {parsing ? 'Understanding...' : 'Understand Goal'}
        </button>

        {goal && (
          <div style={{ ...card, background: SLATE_M, padding: '16px', marginBottom: '18px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Understood as
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: goal.needs_clarification ? '10px' : 0 }}>
              <div>
                <label style={lbl}>Industry</label>
                <input value={goal.industry || ''} onChange={e => setGoal(g => ({ ...g, industry: e.target.value }))} placeholder="required" style={inp} />
              </div>
              <div>
                <label style={lbl}>City</label>
                <input value={goal.city || ''} onChange={e => setGoal(g => ({ ...g, city: e.target.value }))} placeholder="optional" style={inp} />
              </div>
            </div>
            <p style={{ margin: '10px 0 0', fontSize: '12px', color: BONE }}>
              {goal.goal_type === 'revenue'
                ? `Revenue goal: ₹${(goal.target_amount || 0).toLocaleString('en-IN')} this month.`
                : `Segment goal: ${goal.target_count ? `${goal.target_count} clients` : 'as many qualified prospects as possible'}.`}
            </p>
            {goal.needs_clarification && !goal.industry && (
              <p style={{ margin: '8px 0 0', fontSize: '11.5px', color: GOLD }}>
                Add an industry above before starting.
              </p>
            )}
          </div>
        )}

        {goal && (
          <button onClick={handleStart} disabled={starting || !goal.industry} style={{
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center',
            background: (starting || !goal.industry) ? SLATE_M : GOLD,
            border: `1px solid ${(starting || !goal.industry) ? SLATE_L : GOLD}`,
            color: (starting || !goal.industry) ? MUTED : '#0B0B0D',
            padding: '13px 20px', borderRadius: '8px', fontSize: '14.5px', fontWeight: '700',
            cursor: (starting || !goal.industry) ? 'not-allowed' : 'pointer',
          }}>
            <Rocket size={16} /> {starting ? 'Starting Quick Scan...' : 'Start Quick Scan'}
          </button>
        )}
      </div>
    </PageShell>
  )
}
