import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, TrendingDown, Target, Sparkles, RefreshCw, Copy, Check,
  Rocket, FileText, X, AlertTriangle,
} from 'lucide-react'
import { BACKEND, apiFetch } from './lib/api'
import { useToast } from './ToastContext'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import {
  GOLD, card, cardInner, MUTED, GREEN, RED, BONE, SLATE, SLATE_L, FONT_BODY,
} from './ds'

const AMBER = '#FFB03A'

function Skeleton({ w = '100%', h = '16px', radius = '4px', style = {} }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...style }} />
}

function RatingBadge({ rating }) {
  const color = rating === 'HIGH' ? GREEN : rating === 'MEDIUM' ? GOLD : MUTED
  return (
    <span style={{
      color, border: `1px solid ${color}50`, borderRadius: '4px', padding: '2px 8px',
      fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>{rating}</span>
  )
}

function SubScoreCard({ label, data }) {
  if (!data) {
    return (
      <div style={{ ...cardInner, padding: '14px' }}>
        <p style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: '0 0 8px' }}>{label}</p>
        <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>Needs more data (60+ days)</p>
      </div>
    )
  }
  const color = data.score >= 60 ? GREEN : data.score >= 40 ? GOLD : RED
  return (
    <div style={{ ...cardInner, padding: '14px' }}>
      <p style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 6px', color }}>{data.score}</p>
      {'pct_change' in data && (
        <p style={{ fontSize: '11px', color: MUTED, margin: 0 }}>
          {data.recent_clicks ?? data.recent_avg_position} vs {data.prior_clicks ?? data.prior_avg_position} prior period
        </p>
      )}
      {'actual_ctr' in data && (
        <p style={{ fontSize: '11px', color: MUTED, margin: 0 }}>
          {(data.actual_ctr * 100).toFixed(2)}% vs {(data.benchmark_ctr * 100).toFixed(0)}% benchmark ({data.avg_position_bucket})
        </p>
      )}
      {'pages_active_30d' in data && (
        <p style={{ fontSize: '11px', color: MUTED, margin: 0 }}>
          {data.pages_active_30d} of {data.pages_total_ever} pages active
        </p>
      )}
    </div>
  )
}

function Table({ columns, rows, emptyMsg }) {
  if (!rows || rows.length === 0) return <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>{emptyMsg}</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${SLATE_L}` }}>
            {columns.map(c => (
              <th key={c.key} style={{ textAlign: c.align || 'left', padding: '6px 8px', color: MUTED, fontWeight: '600', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.04em' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? `1px solid ${SLATE}` : 'none' }}>
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

const QUERY_TABS = [
  { key: 'top', label: 'Top' },
  { key: 'growing', label: 'Growing' },
  { key: 'declining', label: 'Declining' },
  { key: 'opportunity', label: 'Opportunity' },
]

export default function OrganicIntelligence() {
  const navigate = useNavigate()
  const toast = useToast()

  const [connected, setConnected] = useState(null) // null=unknown, true/false
  const [siteUrl, setSiteUrl] = useState('')
  const [loading, setLoading] = useState(true)

  const [health, setHealth] = useState(null)
  const [opportunities, setOpportunities] = useState(null)
  const [pages, setPages] = useState([])
  const [fragmentationNote, setFragmentationNote] = useState('')
  const [recommendations, setRecommendations] = useState(null)
  const [recRefreshing, setRecRefreshing] = useState(false)

  const [queryTab, setQueryTab] = useState('top')
  const [queryRows, setQueryRows] = useState([])
  const [queryLoading, setQueryLoading] = useState(false)

  const [repurposeTarget, setRepurposeTarget] = useState(null) // page_url string or null
  const [repurposeResult, setRepurposeResult] = useState(null)
  const [repurposeLoading, setRepurposeLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState('')
  const [syncing, setSyncing] = useState(false)

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (connected) loadQueries(queryTab)
  }, [queryTab, connected])

  async function load() {
    setLoading(true)
    try {
      const statusRes = await apiFetch(`${BACKEND}/search-console/status`)
      const status = await statusRes.json()
      if (!status.connected) {
        setConnected(false)
        setLoading(false)
        return
      }
      setConnected(true)
      setSiteUrl(status.site_url || '')

      const [hRes, oRes, pRes, rRes] = await Promise.all([
        apiFetch(`${BACKEND}/search-console/health-score`),
        apiFetch(`${BACKEND}/search-console/opportunities`),
        apiFetch(`${BACKEND}/search-console/pages?limit=15`),
        apiFetch(`${BACKEND}/search-console/recommendations`),
      ])
      const [h, o, p, r] = await Promise.all([hRes.json(), oRes.json(), pRes.json(), rRes.json()])
      if (h.success) setHealth(h)
      if (o.success) setOpportunities(o)
      if (p.success) {
        setPages(p.pages || [])
        setFragmentationNote(p.www_fragmentation_detected ? p.fragmentation_note : '')
      }
      if (r.success) setRecommendations(r)
    } catch {
      toast.error('Could not load Organic Intelligence data.')
    }
    setLoading(false)
  }

  async function loadQueries(tab) {
    setQueryLoading(true)
    try {
      const res = await apiFetch(`${BACKEND}/search-console/queries?tab=${tab}&limit=15`)
      const data = await res.json()
      if (data.success) setQueryRows(data.queries || [])
    } catch { /* keep prior rows on transient failure */ }
    setQueryLoading(false)
  }

  async function handleSyncNow() {
    setSyncing(true)
    try {
      const res = await apiFetch(`${BACKEND}/search-console/sync`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success(`Synced ${data.query_rows ?? 0} query rows, ${data.page_rows ?? 0} page rows.`)
        await load()
      } else {
        toast.error(data.error || 'Sync failed.')
      }
    } catch {
      toast.error('Network error during sync.')
    }
    setSyncing(false)
  }

  async function handleRegenerateInsights() {
    setRecRefreshing(true)
    try {
      const res = await apiFetch(`${BACKEND}/search-console/recommendations?refresh=true`)
      const data = await res.json()
      if (data.success) { setRecommendations(data); toast.success('Insights regenerated.') }
      else toast.error(data.error || 'Could not regenerate insights.')
    } catch { toast.error('Network error.') }
    setRecRefreshing(false)
  }

  function handleGenerateCampaign(row) {
    const queryText = row.query_text || row.top_query || ''
    const pageUrl = row.page_url || ''
    let contextParts = []
    if (queryText) contextParts.push(`the search query '${queryText}'`)
    if (pageUrl) contextParts.push(`the page ${pageUrl}`)
    const imp = row.impressions
    const ctr = row.ctr
    const pos = row.avg_position
    let contextStr = `Optimize around ${contextParts.join(' and ')}.`
    if (imp != null) contextStr += ` It gets ${imp.toLocaleString()} impressions`
    if (pos != null) contextStr += ` at position ${pos}`
    if (ctr != null) contextStr += ` with a ${(ctr * 100).toFixed(1)}% CTR.`
    else contextStr += '.'

    navigate('/brain', {
      state: {
        prefillUrl: siteUrl.replace(/^sc-domain:/, 'https://').replace(/^https?:\/\//, 'https://'),
        additionalContext: contextStr,
      },
    })
  }

  async function handleRepurpose(pageUrl, topQuery) {
    setRepurposeTarget(pageUrl)
    setRepurposeResult(null)
    setRepurposeLoading(true)
    try {
      const res = await apiFetch(`${BACKEND}/search-console/repurpose-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_url: pageUrl, top_query: topQuery || '' }),
      })
      const data = await res.json()
      if (data.success) setRepurposeResult(data)
      else toast.error(data.error || 'Could not repurpose content.')
    } catch { toast.error('Network error.') }
    setRepurposeLoading(false)
  }

  function handleCopy(key, text) {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success('Copied')
    setTimeout(() => setCopiedKey(''), 1800)
  }

  if (loading) {
    return (
      <PageShell maxWidth="1100px">
        <style>{`
          @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
          .skeleton { background: linear-gradient(90deg, ${SLATE} 25%, ${SLATE_L} 50%, ${SLATE} 75%); background-size: 800px 100%; animation: shimmer 1.5s ease-in-out infinite; }
        `}</style>
        <PageHeader title="Organic Intelligence" sub="Google Search Console — organic search performance, opportunities, and AI insights" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[0, 1, 2, 3].map(i => <Skeleton key={i} h="90px" />)}
        </div>
      </PageShell>
    )
  }

  if (connected === false) {
    return (
      <PageShell maxWidth="760px">
        <PageHeader title="Organic Intelligence" sub="Google Search Console — organic search performance, opportunities, and AI insights" />
        <div style={{ ...card, padding: '32px', textAlign: 'center' }}>
          <Search size={28} color={GOLD} style={{ marginBottom: '14px' }} />
          <p style={{ fontSize: '15px', color: BONE, margin: '0 0 8px', fontWeight: '600' }}>No Search Console connected</p>
          <p style={{ fontSize: '13px', color: MUTED, margin: '0 0 20px' }}>
            Connect your Google Search Console property from the Account page to see organic search insights here.
          </p>
          <Link to="/account" style={{
            display: 'inline-block', background: GOLD, color: '#171717', textDecoration: 'none',
            borderRadius: '7px', padding: '10px 22px', fontSize: '13px', fontWeight: '700',
          }}>
            Go to Account →
          </Link>
        </div>
      </PageShell>
    )
  }

  const insufficient = health?.insufficient_data
  const s = health?.sub_scores || {}

  return (
    <PageShell maxWidth="1100px">
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .skeleton { background: linear-gradient(90deg, ${SLATE} 25%, ${SLATE_L} 50%, ${SLATE} 75%); background-size: 800px 100%; animation: shimmer 1.5s ease-in-out infinite; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <PageHeader
        title="Organic Intelligence"
        sub={siteUrl ? `Google Search Console — ${siteUrl}` : 'Google Search Console — organic search performance, opportunities, and AI insights'}
        action={
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', background: GOLD, color: '#171717',
              border: 'none', borderRadius: '7px', padding: '9px 18px', fontSize: '13px', fontWeight: '700',
              cursor: syncing ? 'not-allowed' : 'pointer', opacity: syncing ? 0.6 : 1, fontFamily: FONT_BODY,
            }}
          >
            <RefreshCw size={13} className={syncing ? 'spin' : ''} /> {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
        }
      />

      {insufficient && health?.banner && (
        <div style={{ padding: '10px 14px', background: `${AMBER}18`, border: `1px solid ${AMBER}40`, borderRadius: '6px', marginBottom: '16px' }}>
          <p style={{ color: AMBER, fontSize: '12px', margin: 0, fontWeight: '600' }}>{health.banner}</p>
        </div>
      )}

      <div style={{ opacity: 1 }}>
        {/* Overview: Health Score */}
        <div style={{ ...card, padding: '20px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: 0 }}>Organic Health Score</p>
            {health?.overall_score != null && (
              <p style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: health.overall_score >= 60 ? GREEN : health.overall_score >= 40 ? GOLD : RED }}>
                {health.overall_score}
              </p>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <SubScoreCard label="Click Trend" data={s.click_trend} />
            <SubScoreCard label="CTR vs Benchmark" data={s.ctr_vs_benchmark} />
            <SubScoreCard label="Position Trend" data={s.position_trend} />
            <SubScoreCard label="Content Freshness" data={s.content_freshness} />
          </div>
        </div>

        <div style={{ opacity: insufficient ? 0.5 : 1, pointerEvents: insufficient ? 'none' : 'auto' }}>
          {/* Query tabs */}
          <div style={{ ...card, padding: '20px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
              {QUERY_TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setQueryTab(t.key)}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                    cursor: 'pointer', border: '1px solid', fontFamily: FONT_BODY,
                    borderColor: queryTab === t.key ? GOLD : SLATE_L,
                    background: queryTab === t.key ? `${GOLD}18` : 'transparent',
                    color: queryTab === t.key ? GOLD : MUTED,
                  }}
                >{t.label}</button>
              ))}
            </div>
            {queryLoading ? (
              <Skeleton h="120px" />
            ) : (
              <Table
                emptyMsg="No queries in this category yet."
                rows={queryRows}
                columns={[
                  { key: 'query_text', label: 'Query' },
                  { key: 'clicks', label: 'Clicks', align: 'right', render: (v, r) => v ?? r.recent_clicks },
                  { key: 'impressions', label: 'Impr.', align: 'right' },
                  { key: 'ctr', label: 'CTR', align: 'right', render: v => v != null ? `${(v * 100).toFixed(1)}%` : '—' },
                  { key: 'rating', label: '', align: 'right', render: v => v ? <RatingBadge rating={v} /> : null },
                ]}
              />
            )}
          </div>

          {/* Top Pages */}
          <div style={{ ...card, padding: '20px', marginBottom: '18px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: '0 0 14px' }}>Top Pages</p>
            {fragmentationNote && (
              <div style={{ display: 'flex', gap: '8px', padding: '10px 14px', background: `${AMBER}18`, border: `1px solid ${AMBER}40`, borderRadius: '6px', marginBottom: '14px' }}>
                <AlertTriangle size={14} color={AMBER} style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ color: AMBER, fontSize: '12px', margin: 0, lineHeight: '1.5' }}>{fragmentationNote}</p>
              </div>
            )}
            {pages.length === 0 ? (
              <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>No page data yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pages.map(p => (
                  <div key={p.page_url} style={{ ...cardInner, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '600', color: BONE, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.page_url}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: MUTED }}>
                        {p.clicks} clicks · {p.impressions} impr. · {(p.ctr * 100).toFixed(1)}% CTR · pos {p.avg_position}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleGenerateCampaign(p)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: GOLD, color: '#171717', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: FONT_BODY }}
                      >
                        <Rocket size={11} /> Generate Campaign
                      </button>
                      <button
                        onClick={() => handleRepurpose(p.page_url, '')}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'transparent', color: BONE, border: `1px solid ${SLATE_L}`, borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: FONT_BODY }}
                      >
                        <FileText size={11} /> Repurpose Content
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Opportunities feed */}
          <div style={{ ...card, padding: '20px', marginBottom: '18px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: '0 0 14px' }}>Opportunities</p>
            {(() => {
              const opp = opportunities?.opportunities || {}
              const groups = [
                { key: 'low_ctr_queries', label: 'High Impressions, Low CTR', Icon: TrendingDown, itemLabel: (i) => i.query_text, evidence: (i) => `${i.impressions} impressions · ${(i.ctr * 100).toFixed(1)}% CTR · pos ${i.avg_position}` },
                { key: 'position_4_15_pages', label: 'Page 1 Borderline / Page 2 (Position 4-15)', Icon: Target, itemLabel: (i) => i.page_url, evidence: (i) => `${i.impressions} impressions · pos ${i.avg_position}` },
                { key: 'declining_queries', label: 'Declining Queries', Icon: TrendingDown, itemLabel: (i) => i.query_text, evidence: (i) => `${i.recent_clicks} clicks vs ${i.prior_clicks} prior (${(i.pct_change * 100).toFixed(0)}%)` },
              ]
              const hasAny = groups.some(g => (opp[g.key] || []).length > 0)
              if (!hasAny) {
                return (
                  <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>
                    {opportunities?.insufficient_data
                      ? `Opportunities need more data to confirm reliably. ${opportunities.banner || ''}`
                      : 'No opportunities detected — traffic looks healthy against the current thresholds.'}
                  </p>
                )
              }
              return groups.map(g => {
                const items = opp[g.key] || []
                if (items.length === 0) return null
                return (
                  <div key={g.key} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <g.Icon size={13} color={MUTED} />
                      <p style={{ fontSize: '12px', fontWeight: '600', color: BONE, margin: 0 }}>{g.label}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {items.slice(0, 8).map((item, i) => (
                        <div key={i} style={{ ...cardInner, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: '0 0 2px', fontSize: '12px', color: BONE, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {g.itemLabel(item)}
                              {item.visibility_intel_match && <span style={{ color: GOLD, fontSize: '10px', marginLeft: '6px' }}>· matches Visibility Intel gap</span>}
                            </p>
                            <p style={{ margin: 0, fontSize: '11px', color: MUTED }}>{g.evidence(item)}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <RatingBadge rating={item.rating} />
                            <button
                              onClick={() => handleGenerateCampaign(item)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: GOLD, color: '#171717', border: 'none', borderRadius: '5px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: FONT_BODY }}
                            >
                              <Rocket size={10} /> Campaign
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>

        {/* AI Insights */}
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} color={GOLD} />
              <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, margin: 0 }}>AI Insights</p>
            </div>
            <button
              onClick={handleRegenerateInsights}
              disabled={recRefreshing}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'transparent', border: `1px solid ${SLATE_L}`, borderRadius: '6px', color: MUTED, fontSize: '11px', cursor: 'pointer', fontFamily: FONT_BODY }}
            >
              <RefreshCw size={11} className={recRefreshing ? 'spin' : ''} /> Regenerate
            </button>
          </div>
          {!recommendations || recommendations.no_data ? (
            // Post-audit fix (Item 5): the backend no longer auto-generates
            // on a plain page load when there's no cache — this is the
            // honest "nothing generated yet" state instead of a blank
            // narrative, and Regenerate above is the only thing that
            // triggers the real (billed) GPT call.
            <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>No insights yet — click Regenerate to generate them.</p>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: BONE, lineHeight: '1.6', margin: '0 0 14px' }}>{recommendations.narrative}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(recommendations.top_actions || []).map((a, i) => (
                  <div key={i} style={{ ...cardInner, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: BONE }}>{a.action}</p>
                      <RatingBadge rating={a.impact} />
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: MUTED }}>{a.why}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Repurpose Content modal */}
      {repurposeTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }} onClick={() => setRepurposeTarget(null)}>
          <div style={{ ...card, padding: '24px', maxWidth: '520px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: BONE, margin: 0 }}>Repurpose Content</p>
              <button onClick={() => setRepurposeTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}><X size={16} /></button>
            </div>
            <p style={{ fontSize: '11px', color: MUTED, margin: '0 0 14px', wordBreak: 'break-all' }}>{repurposeTarget}</p>

            {repurposeLoading ? (
              <Skeleton h="160px" />
            ) : !repurposeResult ? (
              <p style={{ fontSize: '13px', color: MUTED }}>Could not generate assets.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: MUTED, margin: '0 0 6px' }}>Instagram Caption</p>
                  <div style={{ ...cardInner, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: BONE }}>{repurposeResult.assets.instagram_caption}</p>
                    <button onClick={() => handleCopy('ig', repurposeResult.assets.instagram_caption)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedKey === 'ig' ? GREEN : MUTED, flexShrink: 0 }}>
                      {copiedKey === 'ig' ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: MUTED, margin: '0 0 6px' }}>Ad Copy Angle</p>
                  <div style={{ ...cardInner, padding: '10px 12px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '700', color: BONE }}>{repurposeResult.assets.ad_copy_angle?.headline}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>{repurposeResult.assets.ad_copy_angle?.body}</p>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: MUTED, margin: '0 0 6px' }}>Video Script Hook</p>
                  <div style={{ ...cardInner, padding: '10px 12px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '700', color: GOLD }}>{repurposeResult.assets.video_script_hook?.hook}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: MUTED }}>{repurposeResult.assets.video_script_hook?.body}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: BONE, fontWeight: '600' }}>{repurposeResult.assets.video_script_hook?.cta}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  )
}
