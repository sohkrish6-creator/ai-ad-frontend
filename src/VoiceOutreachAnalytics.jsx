import { useState, useEffect } from 'react'
import { BarChart2, TrendingUp, Lightbulb, MessageCircleWarning } from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, GREEN, RED, MUTED, BONE, SLATE_M, SLATE_L, card, cardInner, lbl } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

function Metric({ label, value, color }) {
  return (
    <div style={{ ...card, padding: '14px', textAlign: 'center' }}>
      <p style={{ margin: '0 0 4px', fontSize: '9.5px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: color || BONE }}>{value}</p>
    </div>
  )
}

export default function VoiceOutreachAnalytics() {
  const toast = useToast()
  const [analytics, setAnalytics] = useState(null)
  const [insights, setInsights] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const [aRes, iRes] = await Promise.all([
          apiFetch(`${BACKEND}/voice-outreach/analytics`),
          apiFetch(`${BACKEND}/voice-outreach/learning-insights`),
        ])
        const a = await aRes.json()
        const i = await iRes.json()
        if (a.success) setAnalytics(a)
        if (i.success) setInsights(i)
      } catch { toast.error('Backend se connect nahi ho paya.') }
    })()
  }, [toast])

  if (!analytics) {
    return (
      <PageShell maxWidth="960px">
        <PageHeader title="Voice Outreach — Analytics" sub="Loading..." />
      </PageShell>
    )
  }

  return (
    <PageShell maxWidth="960px">
      <PageHeader
        title="Voice Outreach — Analytics"
        sub="Real completed calls only — test calls and Dry Run simulations are excluded from every number below."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <Metric label="Total Calls" value={analytics.total_calls} />
        <Metric label="Connected" value={`${analytics.connected_pct}%`} color={GREEN} />
        <Metric label="Avg Duration" value={`${analytics.avg_duration_seconds}s`} />
        <Metric label="Callback Rate" value={`${analytics.callback_pct}%`} color={GOLD} />
        <Metric label="Meetings Booked" value={analytics.meetings_booked} color={GREEN} />
        <Metric label="Minutes Used" value={analytics.minutes_used} />
        <Metric label="Total Cost" value={`₹${analytics.total_cost_inr}`} />
        <Metric label="Needs Review" value={`${analytics.human_review_pct}%`} color={analytics.human_review_pct > 20 ? RED : MUTED} />
      </div>

      <div style={{ ...card, padding: '18px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <BarChart2 size={15} color={GOLD} />
          <p style={{ ...lbl, margin: 0 }}>Sentiment Split</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {Object.entries(analytics.sentiment_split).map(([k, v]) => (
            <div key={k} style={{ ...cardInner, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '9.5px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>{k}</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: BONE }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {analytics.total_calls === 0 && (
        <div style={{ ...card, padding: '18px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <MessageCircleWarning size={15} color={MUTED} style={{ flexShrink: 0, marginTop: '1px' }} />
          <p style={{ margin: 0, fontSize: '12.5px', color: MUTED, lineHeight: 1.5 }}>
            No real calls yet — everything so far has run in Dry Run mode. Connect real Vapi credentials and switch
            Call Mode to Live in Settings to start seeing real numbers here.
          </p>
        </div>
      )}

      <div style={{ ...card, padding: '18px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Lightbulb size={15} color={GOLD} />
          <p style={{ ...lbl, margin: 0 }}>Learning Engine — Recommendations</p>
        </div>
        {insights?.segments?.length ? (
          <>
            <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: MUTED }}>
              Grouped by industry / personality — recommendations only, never applied automatically.
            </p>
            {insights.segments.map(s => (
              <div key={s.segment} style={{ ...cardInner, padding: '10px 14px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '600', color: BONE }}>{s.segment} <span style={{ color: MUTED, fontWeight: '400' }}>({s.calls} calls)</span></p>
                <p style={{ margin: 0, fontSize: '11.5px', color: MUTED }}>
                  <TrendingUp size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                  {Math.round(s.conversion_rate * 100)}% conversion · {Math.round(s.meeting_rate * 100)}% meetings · {s.avg_duration_seconds}s avg
                </p>
              </div>
            ))}
          </>
        ) : (
          <p style={{ margin: 0, fontSize: '12.5px', color: MUTED }}>Not enough real call volume yet to surface recommendations (needs at least 3 calls per segment).</p>
        )}
      </div>

      {insights?.common_objections?.length > 0 && (
        <div style={{ ...card, padding: '18px' }}>
          <p style={{ ...lbl, marginBottom: '12px' }}>Common Objections</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {insights.common_objections.map(o => (
              <span key={o.objection} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '600', background: SLATE_M, border: `1px solid ${SLATE_L}`, color: BONE }}>
                {o.objection} <span style={{ color: MUTED }}>×{o.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  )
}
