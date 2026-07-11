import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IndianRupee, MousePointerClick, Eye, Percent, Zap, CheckCircle, Target,
  TrendingUp, TrendingDown, ChevronDown, ChevronUp, RefreshCw, Smartphone, MapPin,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'


const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

function useCountUp(target, duration = 700, enabled = true) {
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    if (!enabled || !target) { setCount(target || 0); return }
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(target * eased)
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, enabled])
  return count
}

function Skeleton({ w = '100%', h = '16px', radius = '4px', style = {} }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...style }} />
}

function StatCard({ label, value, Icon, prefix = '', suffix = '', decimals = 0 }) {
  const n = useCountUp(value, 700, true)
  const display = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString()
  return (
    <div style={{ ...card, padding: '16px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <p style={{ fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: 0 }}>{label}</p>
        <Icon size={13} color="#BBB" />
      </div>
      <p style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-1px', color: BONE }}>
        {prefix}{display}{suffix}
      </p>
    </div>
  )
}

function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: `1px solid ${SLATE_L}`, borderRadius: '7px', overflow: 'hidden', marginBottom: '8px' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', background: INK, border: 'none', padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
        color: BONE, fontSize: '13px', fontWeight: '600',
      }}>
        {title}
        {open ? <ChevronUp size={14} color="#999" /> : <ChevronDown size={14} color="#999" />}
      </button>
      {open && <div style={{ padding: '14px', background: SLATE }}>{children}</div>}
    </div>
  )
}

function Table({ columns, rows, emptyMsg }) {
  if (!rows || rows.length === 0) return <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>{emptyMsg}</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #EAEAEA' }}>
            {columns.map(c => (
              <th key={c.key} style={{ textAlign: c.align || 'left', padding: '6px 8px', color: MUTED, fontWeight: '600', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.04em' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: '7px 8px', textAlign: c.align || 'left', color: BONE }}>
                  {c.render ? c.render(r[c.key], r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function GoogleAdsDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${BACKEND}/google-ads/dashboard`)
      const json = await res.json()
      if (json.success) setData(json)
      else setError(json.error || 'Could not load dashboard.')
    } catch (e) {
      setError(`Network error: ${e.message}`)
    }
    setLoading(false)
  }

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const res = await fetch(`${BACKEND}/google-ads/refresh`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
      })
      const json = await res.json()
      if (json.success) navigate('/google-ads')
      else setError(json.error || 'Could not start refresh.')
    } catch (e) {
      setError(`Network error: ${e.message}`)
    }
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '36px 20px 60px' }}>
        <Skeleton w="40%" h="28px" style={{ marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[0, 1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} h="80px" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '36px 20px 60px' }}>
        <div style={{ ...card, padding: '18px', background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3' }}>
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: RED }}>{error}</p>
          <button onClick={() => navigate('/google-ads')} style={{
            background: '#171717', color: '#fff', border: 'none', borderRadius: '6px',
            padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
          }}>Go to Connect / Import</button>
        </div>
      </div>
    )
  }

  const c = data.cards
  const ai = data.ai_summary

  return (
    <>
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .skeleton { background: linear-gradient(90deg, #F5F5F5 25%, #EBEBEB 50%, #F5F5F5 75%); background-size: 800px 100%; animation: shimmer 1.5s ease-in-out infinite; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '36px 20px 60px', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: BONE, margin: 0, letterSpacing: '-0.5px' }}>
              {data.account_name || data.customer_id}
            </h1>
            <p style={{ fontSize: '12px', color: MUTED, margin: '4px 0 0' }}>
              Last imported: {data.last_imported_at ? new Date(data.last_imported_at).toLocaleString() : 'never'}
            </p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: GOLD, color: BONE,
            border: 'none', borderRadius: '7px', padding: '9px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
          }}>
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} /> {refreshing ? 'Starting…' : 'Refresh Import'}
          </button>
        </div>

        {/* 7 KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          <StatCard label="Total Spend" value={c.total_spend} Icon={IndianRupee} prefix="₹" decimals={2} />
          <StatCard label="Total Clicks" value={c.total_clicks} Icon={MousePointerClick} />
          <StatCard label="Total Impressions" value={c.total_impressions} Icon={Eye} />
          <StatCard label="CTR" value={c.ctr} Icon={Percent} suffix="%" decimals={2} />
          <StatCard label="CPC" value={c.cpc} Icon={Zap} prefix="₹" decimals={2} />
          <StatCard label="Conversions" value={c.conversions} Icon={CheckCircle} decimals={1} />
          <StatCard label="CPA" value={c.cpa} Icon={Target} prefix="₹" decimals={2} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* Top Campaigns */}
          <div style={{ ...card, padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <TrendingUp size={13} color={GREEN} />
              <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: 0 }}>Top Campaigns</p>
            </div>
            <Table
              emptyMsg="No campaign data yet."
              rows={c.top_campaigns}
              columns={[
                { key: 'name', label: 'Campaign' },
                { key: 'cost', label: 'Cost', align: 'right', render: v => `₹${Number(v).toFixed(0)}` },
                { key: 'conversions', label: 'Conv.', align: 'right', render: v => Number(v).toFixed(1) },
              ]}
            />
          </div>

          {/* Worst Campaigns */}
          <div style={{ ...card, padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <TrendingDown size={13} color={RED} />
              <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: 0 }}>Worst Campaigns</p>
            </div>
            <Table
              emptyMsg="No campaign data yet."
              rows={c.worst_campaigns}
              columns={[
                { key: 'name', label: 'Campaign' },
                { key: 'cost', label: 'Cost', align: 'right', render: v => `₹${Number(v).toFixed(0)}` },
                { key: 'cpa', label: 'CPA', align: 'right', render: v => v == null ? '—' : `₹${Number(v).toFixed(0)}` },
              ]}
            />
          </div>

          {/* Top Keywords */}
          <div style={{ ...card, padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <TrendingUp size={13} color={GREEN} />
              <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: 0 }}>Top Keywords</p>
            </div>
            <Table
              emptyMsg="No keyword data yet."
              rows={c.top_keywords}
              columns={[
                { key: 'keyword_text', label: 'Keyword' },
                { key: 'clicks', label: 'Clicks', align: 'right' },
                { key: 'conversions', label: 'Conv.', align: 'right', render: v => Number(v).toFixed(1) },
              ]}
            />
          </div>

          {/* Waste Keywords */}
          <div style={{ ...card, padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <TrendingDown size={13} color={RED} />
              <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: 0 }}>Waste Keywords</p>
            </div>
            <p style={{ fontSize: '11px', color: MUTED, margin: '0 0 10px' }}>≥5 clicks, 0 conversions</p>
            <Table
              emptyMsg="No wasted spend detected."
              rows={c.waste_keywords}
              columns={[
                { key: 'keyword_text', label: 'Keyword' },
                { key: 'clicks', label: 'Clicks', align: 'right' },
                { key: 'cost', label: 'Cost', align: 'right', render: v => `₹${Number(v).toFixed(0)}` },
              ]}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* Device Performance */}
          <div style={{ ...card, padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Smartphone size={13} color="#999" />
              <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: 0 }}>Device Performance</p>
            </div>
            {c.device_performance && c.device_performance.length > 0 ? (
              <div style={{ width: '100%', height: 160 }}>
                <ResponsiveContainer>
                  <BarChart data={c.device_performance} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="device" tick={{ fontSize: 11, fill: '#999' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#999' }} />
                    <Tooltip formatter={(v) => Number(v).toFixed(0)} />
                    <Bar dataKey="cost" fill={GOLD} radius={[4, 4, 0, 0]} name="Cost (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>No device data yet.</p>}
          </div>

          {/* Location Performance */}
          <div style={{ ...card, padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <MapPin size={13} color="#999" />
              <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: 0 }}>Location Performance</p>
            </div>
            <Table
              emptyMsg="No location data yet."
              rows={c.location_performance}
              columns={[
                { key: 'location_name', label: 'Location' },
                { key: 'clicks', label: 'Clicks', align: 'right' },
                { key: 'cost', label: 'Cost', align: 'right', render: v => `₹${Number(v).toFixed(0)}` },
              ]}
            />
          </div>
        </div>

        {/* AI Summary */}
        <div style={{ ...card, padding: '18px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: '0 0 14px' }}>
            AI Summary
          </p>
          {!ai ? (
            <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>No AI summary yet — run an import to generate one.</p>
          ) : (
            <>
              <Collapsible title="Best Performing Campaigns" defaultOpen>
                {(ai.best_performing_campaigns || []).map((x, i) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: BONE }}>{x.campaign_name}</p>
                    <p style={{ margin: '0 0 2px', fontSize: '12px', color: MUTED }}>{x.why}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: GOLD }}>{x.recommendation}</p>
                  </div>
                ))}
              </Collapsible>
              <Collapsible title="Poor Performing Campaigns">
                {(ai.poor_performing_campaigns || []).map((x, i) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: BONE }}>{x.campaign_name}</p>
                    <p style={{ margin: '0 0 2px', fontSize: '12px', color: MUTED }}>{x.why}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: RED }}>{x.recommendation}</p>
                  </div>
                ))}
              </Collapsible>
              <Collapsible title="Budget Waste">
                {ai.budget_waste && (
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '600', color: RED }}>{ai.budget_waste.total_wasted_estimate}</p>
                    <p style={{ margin: '0 0 6px', fontSize: '12px', color: MUTED }}>{ai.budget_waste.summary}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>{(ai.budget_waste.top_waste_keywords || []).join(', ')}</p>
                  </div>
                )}
              </Collapsible>
              <Collapsible title="Best Keywords">
                {(ai.best_keywords || []).map((x, i) => (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: BONE }}>{x.keyword}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>{x.why}</p>
                  </div>
                ))}
              </Collapsible>
              <Collapsible title="Waste Keywords">
                {(ai.waste_keywords || []).map((x, i) => (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: BONE }}>{x.keyword} — {x.cost}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>{x.why}</p>
                  </div>
                ))}
              </Collapsible>
              <Collapsible title="Recommended Next Campaign">
                {ai.recommended_next_campaign && (
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '600', color: BONE }}>{ai.recommended_next_campaign.concept}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: MUTED }}>Audience: {ai.recommended_next_campaign.target_audience}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: MUTED }}>Suggested budget: {ai.recommended_next_campaign.suggested_budget}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: GOLD }}>{ai.recommended_next_campaign.rationale}</p>
                  </div>
                )}
              </Collapsible>
            </>
          )}
        </div>
      </div>
    </>
  )
}
