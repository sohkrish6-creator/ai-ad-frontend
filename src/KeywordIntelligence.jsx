import { BACKEND, apiFetch } from './lib/api'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Search, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle, Download,
  FileText, FileSpreadsheet, TrendingUp, TrendingDown, ChevronRight,
} from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { useToast } from './ToastContext'
import CityInput, { getLastCity } from './CityInput'
import {
  GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, INK, BONE, SLATE, SLATE_L, SLATE_M,
  MUTED, GREEN, RED, WARNING,
} from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import { downloadKeywordResearchDocx, downloadKeywordResearchXlsx } from './lib/keywordExport'

const POLL_MS = 2000
const REQUEST_TIMEOUT_MS = 30000
// A real Ads API pull + GSC blend + web research + clustering can
// genuinely take a couple minutes — bounded, not infinite, matching the
// backend's own per-stage hard timeouts (see main.py _run_keyword_research_job).
const START_TIMEOUT_MS = 20000

const SOURCE_META = {
  VERIFIED:     { label: 'Verified (Search Console)', color: GREEN },
  REAL_VOLUME:  { label: 'Real Volume (Google Ads)',   color: GOLD },
  OBSERVED:     { label: 'Observed (web research)',    color: MUTED },
}
function SourceBadge({ label }) {
  const meta = SOURCE_META[label] || { label: label || 'unknown', color: MUTED }
  return (
    <span style={{ fontSize: '10.5px', fontWeight: '700', color: meta.color, border: `1px solid ${meta.color}55`, borderRadius: '10px', padding: '2px 8px', whiteSpace: 'nowrap' }}>
      {meta.label}
    </span>
  )
}

const INTENT_COLORS = { transactional: GREEN, commercial: GOLD, informational: MUTED, branded: '#38BDF8' }
function IntentBadge({ intent }) {
  const color = INTENT_COLORS[intent] || MUTED
  return (
    <span style={{ fontSize: '10.5px', fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
      {intent}
    </span>
  )
}

const REC_META = {
  bid:     { label: 'Bid', color: GREEN },
  content: { label: 'Content / GEO-AEO', color: '#38BDF8' },
  both:    { label: 'Bid + Content', color: GOLD },
}
function RecBadge({ rec }) {
  const meta = REC_META[rec] || { label: rec, color: MUTED }
  return (
    <span style={{ fontSize: '11px', fontWeight: '700', color: meta.color, background: `${meta.color}18`, borderRadius: '5px', padding: '3px 9px' }}>
      {meta.label}
    </span>
  )
}

function fmtVolume(v) {
  return v === null || v === undefined ? 'not available' : v.toLocaleString('en-IN')
}
function fmtBid(low, high) {
  if (low == null || high == null) return 'not available'
  return `Rs.${Math.round(low / 1_000_000)}-Rs.${Math.round(high / 1_000_000)}`
}

function Sparkline({ monthly }) {
  if (!monthly || monthly.length === 0) return <span style={{ fontSize: '11px', color: MUTED }}>—</span>
  const data = monthly.map(m => ({ v: m.searches ?? 0 }))
  return (
    <div style={{ width: '70px', height: '22px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={GOLD} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function peakTrough(monthly) {
  const real = (monthly || []).filter(m => m.searches != null)
  if (real.length === 0) return null
  const peak = real.reduce((a, b) => (b.searches > a.searches ? b : a))
  const trough = real.reduce((a, b) => (b.searches < a.searches ? b : a))
  const cap = s => s.charAt(0) + s.slice(1).toLowerCase()
  return { peak: `${cap(peak.month)} (${peak.searches.toLocaleString('en-IN')})`, trough: `${cap(trough.month)} (${trough.searches.toLocaleString('en-IN')})` }
}

const JOB_STATUS_META = {
  queued:     { label: 'Queued', color: MUTED, Icon: Clock },
  processing: { label: 'Processing', color: GOLD, Icon: Loader2 },
  done:       { label: 'Done', color: GREEN, Icon: CheckCircle2 },
  failed:     { label: 'Failed', color: RED, Icon: XCircle },
}

export default function KeywordIntelligence() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const jobId = searchParams.get('job')

  const [category, setCategory] = useState('')
  const [city, setCity] = useState(getLastCity)
  const [seedText, setSeedText] = useState('')
  const [competitorUrl, setCompetitorUrl] = useState('')
  const [budget, setBudget] = useState('')
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')

  const [jobs, setJobs] = useState([])
  const [job, setJob] = useState(null)
  const [result, setResult] = useState(null)
  const [jobError, setJobError] = useState('')

  const [shortlistBudget, setShortlistBudget] = useState('')
  const [computingShortlist, setComputingShortlist] = useState(false)

  const loadJobs = useCallback(async () => {
    try {
      const res = await apiFetch(`${BACKEND}/keyword-intelligence/jobs`, { timeoutMs: REQUEST_TIMEOUT_MS })
      const data = await res.json()
      if (data.success) setJobs(data.jobs)
    } catch { /* transient — next poll tick retries */ }
  }, [])

  useEffect(() => { loadJobs() }, [loadJobs])

  const loadJob = useCallback(async () => {
    if (!jobId) { setJob(null); setResult(null); return }
    try {
      const res = await apiFetch(`${BACKEND}/keyword-intelligence/jobs/${jobId}`, { timeoutMs: REQUEST_TIMEOUT_MS })
      const data = await res.json()
      if (data.success) {
        setJob(data.job)
        setResult(data.result)
        if (data.job.status === 'failed') setJobError(data.job.error_message || 'This research job failed.')
      } else {
        setJobError(data.detail || 'Job not found.')
      }
    } catch (err) {
      // transient — swallow unless we never got a job at all
      if (!job) setJobError(err?.message || 'Could not load this job.')
    }
  }, [jobId, job])

  useEffect(() => {
    if (!jobId) return
    let cancelled = false
    setJobError('')
    async function poll() { if (!cancelled) await loadJob() }
    poll()
    const isTerminal = job && (job.status === 'done' || job.status === 'failed')
    if (isTerminal) return () => { cancelled = true }
    const interval = setInterval(poll, POLL_MS)
    return () => { cancelled = true; clearInterval(interval) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, job?.status])

  async function handleStart() {
    if (!category.trim()) { setStartError('Enter a category or business type.'); return }
    setStarting(true)
    setStartError('')
    try {
      const seed_keywords = seedText.split(',').map(s => s.trim()).filter(Boolean)
      const res = await apiFetch(`${BACKEND}/keyword-intelligence/jobs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, timeoutMs: START_TIMEOUT_MS,
        body: JSON.stringify({
          category: category.trim(), city: city.trim(), seed_keywords,
          competitor_url: competitorUrl.trim(), budget: budget ? Number(budget) : null,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setStartError(data.error || data.detail || 'Could not start research.')
        toast.error(data.error || data.detail || 'Could not start research.')
      } else {
        setSearchParams({ job: data.job_id })
        loadJobs()
      }
    } catch (err) {
      const msg = err?.message || 'Backend se connect nahi ho paya.'
      setStartError(msg)
      toast.error(msg)
    }
    setStarting(false)
  }

  async function handleComputeShortlist() {
    const rupees = Number(shortlistBudget)
    if (!rupees || rupees <= 0) { toast.error('Enter a valid monthly budget in rupees.'); return }
    setComputingShortlist(true)
    try {
      const res = await apiFetch(`${BACKEND}/keyword-intelligence/jobs/${jobId}/shortlist`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, timeoutMs: REQUEST_TIMEOUT_MS,
        body: JSON.stringify({ budget: rupees }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.detail || 'Could not compute a shortlist.')
      } else {
        setResult(r => ({ ...r, bid_shortlist: data.bid_shortlist, needs_budget: false }))
        toast.success('Bid shortlist ready.')
      }
    } catch (err) {
      toast.error(err?.message || 'Backend se connect nahi ho paya.')
    }
    setComputingShortlist(false)
  }

  // Which cluster (if any) each keyword text belongs to, for the Top
  // Searches table's "Intent Cluster" column.
  const clusterByKeyword = {}
  if (result?.clusters) {
    for (const c of result.clusters) {
      for (const kw of c.keywords) clusterByKeyword[kw.toLowerCase()] = c
    }
  }

  return (
    <PageShell maxWidth="1100px">
      <PageHeader title="Keyword Intelligence" sub="What people actually search for, and which of those searches are worth buying — grounded in real Google Ads and Search Console data." />

      {!jobId && (
        <div style={{ ...card, padding: '22px', marginBottom: '20px' }}>
          <p style={{ ...lbl, marginBottom: '14px' }}>Research a Category</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={lbl}>Category / Business Type <span style={{ color: RED }}>*</span></label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Skin Clinic" style={inp} />
            </div>
            <div>
              <label style={lbl}>City</label>
              <CityInput value={city} onChange={setCity} style={inp} placeholder="e.g. Jaipur" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={lbl}>Seed Keywords (optional, comma-separated)</label>
              <input type="text" value={seedText} onChange={e => setSeedText(e.target.value)} placeholder="e.g. laser hair removal, acne treatment" style={inp} />
            </div>
            <div>
              <label style={lbl}>Competitor URL (optional)</label>
              <input type="text" value={competitorUrl} onChange={e => setCompetitorUrl(e.target.value)} placeholder="https://competitor.com" style={inp} />
            </div>
          </div>
          <div style={{ marginBottom: '16px', maxWidth: '260px' }}>
            <label style={lbl}>Monthly Ad Budget (Rs., optional)</label>
            <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 30000" style={inp} />
            <p style={{ margin: '6px 0 0', fontSize: '11px', color: MUTED }}>
              Skip this and we'll show everything except "What to Bid On" — you can add a budget later.
            </p>
          </div>
          {startError && (
            <p style={{ fontSize: '12.5px', color: RED, marginBottom: '12px' }}>{startError}</p>
          )}
          <button
            onClick={handleStart} disabled={starting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: GOLD, color: '#0B0D12', border: 'none', borderRadius: '8px', padding: '11px 20px', fontSize: '13.5px', fontWeight: '700', cursor: starting ? 'default' : 'pointer', opacity: starting ? 0.7 : 1 }}
          >
            {starting ? <Loader2 size={15} className="spin" /> : <Search size={15} />}
            {starting ? 'Starting...' : 'Research Keywords'}
          </button>
          <style>{'@keyframes kwspin { to { transform: rotate(360deg) } } .spin { animation: kwspin 1s linear infinite }'}</style>
        </div>
      )}

      {jobs.length > 0 && !jobId && (
        <div style={{ marginBottom: '20px' }}>
          <p style={lbl}>Past Research</p>
          {jobs.map(j => {
            const meta = JOB_STATUS_META[j.status] || JOB_STATUS_META.queued
            const Icon = meta.Icon
            return (
              <button
                key={j.id} onClick={() => setSearchParams({ job: j.id })}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', ...cardInner, padding: '12px 16px', marginBottom: '8px', border: `1px solid ${SLATE_L}`, cursor: 'pointer', background: SLATE_M }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={14} color={meta.color} className={j.status === 'processing' ? 'spin' : ''} />
                  <span style={{ fontSize: '13px', color: BONE, fontWeight: '600' }}>{j.category}{j.city ? ` — ${j.city}` : ''}</span>
                </span>
                <ChevronRight size={14} color={MUTED} />
              </button>
            )
          })}
        </div>
      )}

      {jobId && (
        <>
          <button onClick={() => setSearchParams({})} style={{ background: 'none', border: 'none', color: MUTED, fontSize: '12px', cursor: 'pointer', padding: 0, marginBottom: '14px' }}>
            ← New research
          </button>

          {job && job.status !== 'done' && (
            <div style={{ ...card, padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {job.status === 'failed' ? <XCircle size={18} color={RED} /> : <Loader2 size={18} color={GOLD} className="spin" />}
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: BONE }}>
                  {job.status === 'failed' ? 'Research failed' : (job.current_step || 'Working...')}
                </p>
                {job.status === 'failed' && jobError && <p style={{ margin: '4px 0 0', fontSize: '12px', color: RED }}>{jobError}</p>}
              </div>
              <style>{'@keyframes kwspin2 { to { transform: rotate(360deg) } } .spin { animation: kwspin2 1s linear infinite }'}</style>
            </div>
          )}

          {result && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: BONE }}>{result.category}{result.geo_matched_name ? ` — ${result.geo_matched_name}` : ''}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: MUTED }}>
                    {result.counts?.real_volume_count ?? 0} real-volume · {result.counts?.verified_count ?? 0} verified · {result.counts?.observed_count ?? 0} observed
                    {result.cache?.ideas_from_cache && ` · Google Ads data cached ${new Date(result.cache.ideas_cache_date).toLocaleDateString('en-IN')}`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => downloadKeywordResearchDocx({ category: result.category, city: result.city, result })} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: SLATE_M, border: `1px solid ${SLATE_L}`, color: BONE, borderRadius: '7px', padding: '8px 13px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    <FileText size={13} /> DOCX
                  </button>
                  <button onClick={() => downloadKeywordResearchXlsx({ category: result.category, city: result.city, result })} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: SLATE_M, border: `1px solid ${SLATE_L}`, color: BONE, borderRadius: '7px', padding: '8px 13px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    <FileSpreadsheet size={13} /> XLSX
                  </button>
                </div>
              </div>

              {/* 1. Top Searches */}
              <SectionTitle>Top Searches</SectionTitle>
              <div style={{ ...card, padding: '0', marginBottom: '24px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${SLATE_L}` }}>
                      {['Keyword', 'Monthly Searches', '12mo Trend', 'Competition', 'Bid Range (Rs.)', 'Intent', 'Source'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: MUTED, fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(result.top_searches || []).map((k, i) => {
                      const cluster = clusterByKeyword[(k.keyword || '').toLowerCase()]
                      const monthly = result.seasonality?.[k.keyword]
                      return (
                        <tr key={i} style={{ borderBottom: `1px solid ${SLATE_L}` }}>
                          <td style={{ padding: '9px 14px', color: BONE }}>{k.keyword}</td>
                          <td style={{ padding: '9px 14px', color: BONE }} className="tabular-nums">{fmtVolume(k.avg_monthly_searches)}</td>
                          <td style={{ padding: '9px 14px' }}><Sparkline monthly={monthly} /></td>
                          <td style={{ padding: '9px 14px', color: MUTED }}>{k.competition || 'n/a'}{k.competition_index != null ? ` (${k.competition_index})` : ''}</td>
                          <td style={{ padding: '9px 14px', color: MUTED }} className="tabular-nums">{fmtBid(k.low_bid_micros, k.high_bid_micros)}</td>
                          <td style={{ padding: '9px 14px' }}>{cluster ? <IntentBadge intent={cluster.intent} /> : <span style={{ color: MUTED, fontSize: '11px' }}>—</span>}</td>
                          <td style={{ padding: '9px 14px' }}><SourceBadge label={k.label} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* 2. Seasonality */}
              {result.seasonality && Object.keys(result.seasonality).length > 0 && (
                <>
                  <SectionTitle>Seasonality (Top 10)</SectionTitle>
                  <div style={{ ...card, padding: '10px 0', marginBottom: '24px' }}>
                    {Object.entries(result.seasonality).map(([kw, monthly]) => {
                      const pt = peakTrough(monthly)
                      return (
                        <div key={kw} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 18px', borderBottom: `1px solid ${SLATE_L}` }}>
                          <span style={{ flex: '1 1 200px', fontSize: '12.5px', color: BONE, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kw}</span>
                          <Sparkline monthly={monthly} />
                          {pt && (
                            <span style={{ fontSize: '11px', color: MUTED, display: 'flex', gap: '12px', flexShrink: 0 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: GREEN }}><TrendingUp size={11} /> Peak: {pt.peak}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: RED }}><TrendingDown size={11} /> Trough: {pt.trough}</span>
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* 3. Intent Clusters */}
              <SectionTitle>Intent Clusters</SectionTitle>
              {result.hinglish_patterns?.length > 0 && (
                <div style={{ ...cardInner, padding: '10px 14px', marginBottom: '12px', border: `1px solid ${GOLD_BDR}` }}>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: GOLD, textTransform: 'uppercase' }}>Hinglish / Vernacular Patterns</p>
                  <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>{result.hinglish_patterns.join(' · ')}</p>
                </div>
              )}
              <div style={{ marginBottom: '24px' }}>
                {(result.clusters || []).map((c, i) => (
                  <div key={i} style={{ ...card, padding: '16px 18px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: BONE }}>{c.label}</span>
                        <IntentBadge intent={c.intent} />
                      </span>
                      <RecBadge rec={c.recommendation} />
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: MUTED, fontStyle: 'italic' }}>{c.why_it_matters}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {c.keywords.map((kw, j) => (
                        <span key={j} style={{ fontSize: '11.5px', color: BONE, background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '14px', padding: '3px 10px' }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* 4. Question Searches */}
              <SectionTitle>Question Searches (Content / GEO-AEO Targets)</SectionTitle>
              <div style={{ ...card, padding: '0', marginBottom: '24px', overflowX: 'auto' }}>
                {(result.question_searches || []).length === 0 ? (
                  <p style={{ padding: '16px 18px', fontSize: '12.5px', color: MUTED, margin: 0 }}>No informational-intent queries found.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                    <tbody>
                      {result.question_searches.map((k, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${SLATE_L}` }}>
                          <td style={{ padding: '9px 14px', color: BONE }}>{k.keyword}</td>
                          <td style={{ padding: '9px 14px', color: MUTED }} className="tabular-nums">{fmtVolume(k.avg_monthly_searches)} / mo</td>
                          <td style={{ padding: '9px 14px' }}><SourceBadge label={k.label} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* 5. What to Bid On */}
              <SectionTitle>What to Bid On</SectionTitle>
              {result.needs_budget ? (
                <div style={{ ...card, padding: '18px', marginBottom: '24px' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: MUTED }}>
                    No budget was given, so nothing here was assumed — enter your monthly Google Ads budget to see a real, budget-aware shortlist (no new Google Ads API calls needed, this reuses the research already done).
                  </p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', maxWidth: '320px' }}>
                    <input type="number" value={shortlistBudget} onChange={e => setShortlistBudget(e.target.value)} placeholder="Monthly budget (Rs.)" style={inp} />
                    <button
                      onClick={handleComputeShortlist} disabled={computingShortlist}
                      style={{ flexShrink: 0, background: GOLD, color: '#0B0D12', border: 'none', borderRadius: '7px', padding: '10px 16px', fontSize: '12.5px', fontWeight: '700', cursor: computingShortlist ? 'default' : 'pointer', opacity: computingShortlist ? 0.7 : 1 }}
                    >
                      {computingShortlist ? 'Computing...' : 'Compute Shortlist'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ ...card, padding: '0', marginBottom: '24px', overflowX: 'auto' }}>
                  {(result.bid_shortlist || []).length === 0 ? (
                    <p style={{ padding: '16px 18px', fontSize: '12.5px', color: MUTED, margin: 0 }}>No keywords met the shortlist criteria for this budget.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${SLATE_L}` }}>
                          {['Keyword', 'Monthly Searches', 'Competition', 'Bid Range (Rs.)', 'Why'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: MUTED, fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.bid_shortlist.map((k, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${SLATE_L}` }}>
                            <td style={{ padding: '9px 14px', color: BONE, fontWeight: '600' }}>{k.keyword}</td>
                            <td style={{ padding: '9px 14px', color: BONE }} className="tabular-nums">{fmtVolume(k.avg_monthly_searches)}</td>
                            <td style={{ padding: '9px 14px', color: MUTED }}>{k.competition || 'n/a'}</td>
                            <td style={{ padding: '9px 14px', color: MUTED }} className="tabular-nums">{fmtBid(k.low_bid_micros, k.high_bid_micros)}</td>
                            <td style={{ padding: '9px 14px', color: MUTED, maxWidth: '320px' }}>{k.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </PageShell>
  )
}

function SectionTitle({ children }) {
  return <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</p>
}
