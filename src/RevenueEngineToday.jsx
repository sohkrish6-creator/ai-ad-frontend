import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneCall, Clock3, Ban, ChevronRight, RefreshCw } from 'lucide-react'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, card, cardInner, BONE, MUTED, RED, GREEN, SLATE_M, SLATE_L } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import RevenueEngineSubNav from './RevenueEngineSubNav'
import RevenueEngineProfileBanner from './RevenueEngineProfileBanner'

const REC_ICON = { CALL: PhoneCall, FOLLOW_LATER: Clock3, IGNORE: Ban }
const REC_COLOR = { CALL: GREEN, FOLLOW_LATER: GOLD, IGNORE: MUTED }

export default function RevenueEngineToday() {
  const navigate = useNavigate()
  const toast = useToast()
  const [prospects, setProspects] = useState([])
  const [counts, setCounts] = useState({ CALL: 0, FOLLOW_LATER: 0, IGNORE: 0 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${BACKEND}/revenue-engine/todays-priority`)
      const data = await res.json()
      if (data.success) { setProspects(data.prospects); setCounts(data.counts) }
      else toast.error(data.detail || 'Could not load today\'s tasks.')
    } catch { toast.error('Backend se connect nahi ho paya.') }
    setLoading(false)
  }, [toast])

  useEffect(() => { load() }, [load])

  return (
    <PageShell maxWidth="820px">
      <RevenueEngineSubNav />
      <PageHeader
        title="Today's Tasks"
        sub="Top prospects by priority — excludes anything on cooldown, DNC, or already actioned today."
        action={
          <button onClick={load} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
            border: `1px solid ${SLATE_L}`, color: MUTED, padding: '8px 14px', borderRadius: '7px',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
          }}>
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      <RevenueEngineProfileBanner prospects={prospects} requireBlocked={false} />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {[
          { label: 'Call', value: counts.CALL, color: GREEN },
          { label: 'Follow Later', value: counts.FOLLOW_LATER, color: GOLD },
          { label: 'Ignore', value: counts.IGNORE, color: MUTED },
        ].map(s => (
          <div key={s.label} style={{ ...cardInner, padding: '12px 16px', flex: '1 1 120px' }}>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading && <p style={{ color: MUTED, fontSize: '13px' }}>Loading...</p>}

      {!loading && prospects.length === 0 && (
        <div style={{ ...card, padding: '24px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
          Nothing queued right now — run a Quick Scan from the Goal page to fill your pipeline.
        </div>
      )}

      {prospects.map(p => {
        const Icon = REC_ICON[p.recommendation] || Ban
        const color = REC_COLOR[p.recommendation] || MUTED
        return (
          <button key={p.id} onClick={() => navigate(`/revenue-engine/lead/${p.id}`)} style={{
            ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
            padding: '14px 18px', marginBottom: '8px', cursor: 'pointer', border: `1px solid ${SLATE_L}`,
            color: BONE, textAlign: 'left', fontFamily: 'inherit',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon size={17} color={color} />
              <div>
                <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '700' }}>{p.business_name}</p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: MUTED }}>
                  Opportunity {p.opportunity_score ?? '—'} · Need {p.need_score ?? '—'} · {p.priority} priority
                </p>
              </div>
            </div>
            <ChevronRight size={16} color={MUTED} />
          </button>
        )
      })}
    </PageShell>
  )
}
