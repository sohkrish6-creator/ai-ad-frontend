import { BACKEND, apiFetch } from './lib/api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crosshair, Copy, Check, ExternalLink, Phone, MapPin, TrendingUp, Flame, Thermometer, Snowflake, Radar, History, X, PlusCircle, FileText, FileSpreadsheet } from 'lucide-react'
import CityInput, { getLastCity } from './CityInput'
import { useToast } from './ToastContext'
import { useLoadingSteps } from './useLoadingSteps'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO, BG_RAISED, TEXT_SECONDARY, WARNING, INFO, SUCCESS_MUTED, WARNING_MUTED, DANGER_MUTED, INFO_MUTED } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import { downloadProspectCallSheetDocx, downloadProspectCallLogXlsx } from './lib/prospectExport'



const LS_KEY  = 'adsoh_prospect_result'
const SIE_PREFILL_LS_KEY = 'adsoh_social_intel_prefill'

// Rotating status text, not a live progress counter — a single request/
// response call has no real incremental count to report mid-flight (that
// would need converting this into a background-task+polling flow), so
// these describe the actual phase happening rather than fabricate an "X of
// N" number that isn't really being tracked.
function prospectLoadingSteps(maxProspects) {
  return [
    'Scanning Google Maps...',
    `Enriching up to ${maxProspects} business profiles...`,
    'Checking social & ad presence...',
    'Scoring prospects with AI...',
  ]
}


export const INDUSTRIES = [
  'Hospitality (Hotels, Restaurants, Cafes)', 'Schools & Education', 'Healthcare & Clinics',
  'Real Estate', 'Retail & Fashion', 'Food & Beverage', 'Wellness & Fitness', 'Wedding & Events',
  'Auto & Transport', 'Professional Services', 'Coaching & Tutoring', 'Jewellery & Accessories',
  'Interior Design & Architecture', 'Photography & Videography', 'Legal & CA Services',
  'IT & Software Companies', 'Travel & Tourism', 'Salon & Beauty', 'Gym & Sports Academy',
  'NGO & Social Enterprise', 'Agriculture & Dairy', 'Logistics & Transport', 'Printing & Packaging',
  'Construction & Builders', 'Media & Entertainment', 'Other',
]

function Shimmer({ h = '14px', w = '100%' }) {
  return <div style={{ height: h, width: w, borderRadius: '4px', background: `linear-gradient(90deg,${SLATE_L} 25%,${SLATE_M} 50%,${SLATE_L} 75%)`, backgroundSize: '400px 100%', animation: 'shimmer 1.2s ease-in-out infinite' }} />
}

function CopyBtn({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const toast = useToast()
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }}
      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: copied ? SUCCESS_MUTED : SLATE_M, border: '1px solid ' + (copied ? 'rgba(52,211,153,0.3)' : SLATE_L), color: copied ? GREEN : TEXT_SECONDARY, padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

// Semantic hot/warm/cold styling — muted-tint background + solid text, the
// same dark-theme-safe pattern as ds.js's errBox/okBox (tint composited
// over a dark surface keeps real contrast; a near-white bg with light text
// on it does not). Shared by ClassBadge, the rank circle, ScoreBar, the
// filter tabs, and the summary bar — one definition, not five copies.
const CLASS_STYLES = {
  hot:  { bg: DANGER_MUTED,  border: 'rgba(251,113,133,0.32)', color: RED,     icon: '🔥', label: 'Hot' },
  warm: { bg: WARNING_MUTED, border: 'rgba(251,191,36,0.32)',  color: WARNING, icon: '🌡️', label: 'Warm' },
  cold: { bg: INFO_MUTED,    border: 'rgba(56,189,248,0.32)',  color: INFO,    icon: '🧊', label: 'Cold' },
}

function ClassBadge({ c }) {
  const s = CLASS_STYLES[(c || '').toLowerCase()] || CLASS_STYLES.cold
  return <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.icon} {s.label}</span>
}

function ScoreBar({ score }) {
  const color = score >= 75 ? RED : score >= 50 ? WARNING : INFO
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: SLATE_L, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: score + '%', background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: '700', color, minWidth: '28px' }}>{score}</span>
    </div>
  )
}

function buildHotCopyText(hotProspects) {
  if (!hotProspects?.length) return 'No hot prospects found.'
  return hotProspects.map((p, i) =>
    `${i + 1}. ${p.name}\n` +
    `   📍 ${p.address || '—'}\n` +
    `   📞 ${p.phone || '—'}  |  🌐 ${p.website || 'No website'}\n` +
    `   ⭐ ${p.google_rating || '—'} (${p.total_reviews || 0} reviews)\n` +
    `   🎯 Score: ${p.opportunity_score}/100  |  LTV: ${p.expected_ltv || '—'}\n` +
    `   ❌ Weakness: ${p.weakness_found || '—'}\n` +
    `   ✅ Service: ${p.recommended_service || '—'}\n` +
    `   💬 Opening Line: "${p.suggested_opening_line || '—'}"\n`
  ).join('\n---\n\n')
}

// Export builders take a normalized shape (see lib/prospectExport.js) —
// this maps this page's own prospect fields into it, and always exports
// the FULL scanned list (not just the active hot/warm/cold tab), sorted by
// score inside the builder, matching the spec's "Prospect table sorted by
// score, Hot rows highlighted" for the whole scan, not one filtered view.
function toExportProspects(prospects) {
  return (prospects || []).map(p => ({
    rank: p.rank, name: p.name, address: p.address, phone: p.phone,
    rating: p.google_rating, reviews: p.total_reviews, score: p.opportunity_score,
    classification: p.classification, detectedGap: p.weakness_found, sohscapeAngle: p.recommended_service,
    expectedLtv: p.expected_ltv, closingProbability: p.closing_probability,
  }))
}

async function fetchTenantBusinessName() {
  try {
    const res = await apiFetch(`${BACKEND}/voice-outreach/settings`)
    const data = await res.json()
    return data.success ? (data.settings?.business_name || '') : ''
  } catch {
    return ''
  }
}

function ExportBtn({ label, icon: Icon, onClick }) {
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  async function handle() {
    if (busy) return
    setBusy(true)
    try {
      await onClick()
    } catch {
      toast.error('Could not generate the file.')
    }
    setBusy(false)
  }
  return (
    <button
      onClick={handle}
      disabled={busy}
      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: SLATE_M, border: `1px solid ${SLATE_L}`, color: busy ? MUTED : TEXT_SECONDARY, padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '600', cursor: busy ? 'not-allowed' : 'pointer', flexShrink: 0, whiteSpace: 'nowrap', fontFamily: 'inherit' }}
    >
      <Icon size={10} />
      {busy ? 'Generating…' : label}
    </button>
  )
}

export function ProspectCard({ p, isMobile, industry, city }) {
  const navigate = useNavigate()

  function openSocialAudit() {
    try {
      localStorage.setItem(SIE_PREFILL_LS_KEY, JSON.stringify({
        input_value: p.name, input_type: 'business_name', city: city || '', industry: industry || '',
      }))
    } catch {}
    navigate('/social-intelligence')
  }

  return (
    <div style={{ ...card, padding: isMobile ? '14px 12px' : '18px', marginBottom: '10px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: (p.opportunity_score >= 75 ? CLASS_STYLES.hot : p.opportunity_score >= 50 ? CLASS_STYLES.warm : CLASS_STYLES.cold).bg, border: `2px solid ${(p.opportunity_score >= 75 ? CLASS_STYLES.hot : p.opportunity_score >= 50 ? CLASS_STYLES.warm : CLASS_STYLES.cold).border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: (p.opportunity_score >= 75 ? CLASS_STYLES.hot : p.opportunity_score >= 50 ? CLASS_STYLES.warm : CLASS_STYLES.cold).color }}>{p.rank}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: BONE }}>{p.name}</p>
            <ClassBadge c={p.classification} />
            {p.google_rating && (
              <span style={{ fontSize: '11px', color: MUTED, fontWeight: '500' }}>⭐ {p.google_rating} ({p.total_reviews} reviews)</span>
            )}
          </div>
          {p.address && (
            <p style={{ margin: 0, fontSize: '11px', color: MUTED, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={10} /> {p.address}
            </p>
          )}
        </div>
      </div>

      {/* Opportunity Score */}
      <div style={{ marginBottom: '10px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Opportunity Score</p>
        <ScoreBar score={p.opportunity_score || 0} />
      </div>

      {/* Tags row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
        {p.weakness_found && (
          <span style={{ padding: '3px 9px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: DANGER_MUTED, color: RED, border: '1px solid rgba(251,113,133,0.32)' }}>
            ❌ {p.weakness_found}
          </span>
        )}
        {p.recommended_service && (
          <span style={{ padding: '3px 9px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: SUCCESS_MUTED, color: GREEN, border: '1px solid rgba(52,211,153,0.32)' }}>
            ✅ {p.recommended_service}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
        {[
          { label: 'Closing Prob', value: p.closing_probability },
          { label: 'Expected LTV', value: p.expected_ltv },
          { label: 'Mktg Maturity', value: p.marketing_maturity },
        ].map(m => (
          <div key={m.label} style={{ ...cardInner, padding: '8px 10px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>{m.label}</p>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: BONE, textTransform: 'capitalize' }}>{m.value || '—'}</p>
          </div>
        ))}
      </div>

      {/* Why Contact — raised dark surface + left accent border, never a
          light background (that combined with the page's light-on-dark
          text tokens like BONE/GOLD was unreadable — the original bug). */}
      {p.why_contact && (
        <div style={{ background: BG_RAISED, borderLeft: `3px solid ${GOLD}`, borderRadius: '6px', padding: '9px 12px', marginBottom: '10px' }}>
          <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: '700', color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Why Contact</p>
          <p style={{ margin: 0, fontSize: '12.5px', color: BONE, lineHeight: '1.45' }}>{p.why_contact}</p>
        </div>
      )}

      {/* Suggested Opening Line — same raised-surface treatment */}
      {p.suggested_opening_line && (
        <div style={{ background: BG_RAISED, borderLeft: `3px solid ${GOLD}`, borderRadius: '7px', padding: '10px 12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Opening Line</p>
            <CopyBtn text={p.suggested_opening_line} label="Copy" />
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: BONE, lineHeight: '1.5', fontStyle: 'italic' }}>"{p.suggested_opening_line}"</p>
        </div>
      )}

      {/* Footer row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {p.phone && (
          <a href={'tel:' + p.phone} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: TEXT_SECONDARY, textDecoration: 'none', background: SLATE_M, border: `1px solid ${SLATE_L}`, padding: '4px 10px', borderRadius: '5px' }}>
            <Phone size={11} /> {p.phone}
          </a>
        )}
        {p.website && (
          <a href={p.website.startsWith('http') ? p.website : 'https://' + p.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: INFO, textDecoration: 'none', background: INFO_MUTED, border: '1px solid rgba(56,189,248,0.32)', padding: '4px 10px', borderRadius: '5px' }}>
            <ExternalLink size={11} /> Website
          </a>
        )}
        <button onClick={openSocialAudit} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: GOLD, textDecoration: 'none', background: SLATE_M, border: `1px solid ${GOLD_BDR}`, padding: '4px 10px', borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit' }}>
          <Radar size={11} /> Social Audit
        </button>
      </div>
    </div>
  )
}

export default function ProspectDiscovery() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const toast = useToast()

  const [industry, setIndustry]           = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [city, setCity]                   = useState(getLastCity)
  const [maxProspects, setMaxProspects]   = useState(15)
  const [loading, setLoading]             = useState(false)
  const loadingStep = useLoadingSteps(prospectLoadingSteps(maxProspects), loading)
  const [error, setError]                 = useState('')
  const [result, setResult]               = useState(null)
  const [fromCache, setFromCache]         = useState(false)
  const [activeTab, setActiveTab]         = useState('hot')

  // Post-audit fix: scan history + "Find more" (re-scanning used to return
  // identical businesses every time, and only the single latest scan was
  // ever kept — an earlier one vanished the moment a new scan ran).
  const [historyOpen, setHistoryOpen]     = useState(false)
  const [historyList, setHistoryList]     = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [scanMaxUsed, setScanMaxUsed]     = useState(15)     // highest max_prospects requested so far for the current query
  const [alreadyDiscoveredTotal, setAlreadyDiscoveredTotal] = useState(0)
  const [findMoreLoading, setFindMoreLoading] = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  async function loadHistory() {
    setHistoryLoading(true)
    try {
      const res = await apiFetch(`${BACKEND}/prospect-discovery/history`)
      const data = await res.json()
      setHistoryList(data.success ? data.history : [])
    } catch {
      setHistoryList([])
    }
    setHistoryLoading(false)
  }

  function toggleHistory() {
    const next = !historyOpen
    setHistoryOpen(next)
    if (next) loadHistory()
  }

  async function viewHistoryScan(id) {
    setHistoryLoading(true)
    try {
      const res = await apiFetch(`${BACKEND}/prospect-discovery/history/${id}`)
      const data = await res.json()
      if (data.success) {
        setResult({ success: true, google_places_used: true, data: data.data })
        setFromCache(false)
        setAlreadyDiscoveredTotal(data.data.already_discovered_count || 0)
        setScanMaxUsed(data.data.prospects?.length || 15)
        const d = data.data
        const firstTab = d.hot_prospects?.length ? 'hot' : d.warm_prospects?.length ? 'warm' : 'cold'
        setActiveTab(firstTab)
        setHistoryOpen(false)
        toast.success('Loaded past scan')
      } else {
        toast.error(data.error || 'Could not load that scan.')
      }
    } catch {
      toast.error('Backend se connect nahi ho paya.')
    }
    setHistoryLoading(false)
  }

  const resolvedIndustry = industry === 'Other' ? industryOther : industry


  async function handleFind() {
    if (!resolvedIndustry) { setError('Please select an industry.'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const res  = await apiFetch(`${BACKEND}/prospect-discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: resolvedIndustry, city, max_prospects: maxProspects }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)
        localStorage.setItem(LS_KEY, JSON.stringify(data))
        setFromCache(false)
        setScanMaxUsed(maxProspects)
        setAlreadyDiscoveredTotal(data.data?.already_discovered_count || 0)
        const firstTab = data.data?.hot_prospects?.length ? 'hot' : data.data?.warm_prospects?.length ? 'warm' : 'cold'
        setActiveTab(firstTab)
        toast.success('Done!')
      } else {
        const msg = data.message || data.error || 'Discovery failed.'
        setError(msg); toast.error(msg)
      }
    } catch { setError('Backend se connect nahi ho paya.'); toast.error('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  // Post-audit fix: re-running the identical query used to return the
  // identical top businesses every time (Google's ranking for a fixed
  // query+location is stable) — "Find more" re-scans at a HIGHER
  // max_prospects so Places pagination actually reaches further down the
  // ranked list, and the backend's own dedup (against every past scan for
  // this industry+city, not just this session) guarantees nothing shown
  // already reappears. Appends to the existing list rather than replacing
  // it, so a "Find more" click never loses what's already on screen.
  async function handleFindMore() {
    if (!resolvedIndustry || !result) return
    setFindMoreLoading(true)
    const nextMax = scanMaxUsed + 20
    try {
      const res = await apiFetch(`${BACKEND}/prospect-discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: resolvedIndustry, city, max_prospects: nextMax }),
      })
      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Could not find more prospects.')
        setFindMoreLoading(false)
        return
      }
      const newOnes = data.data?.prospects || []
      const newAlready = data.data?.already_discovered_count || 0
      setScanMaxUsed(nextMax)
      setAlreadyDiscoveredTotal(prev => prev + newAlready)
      if (newOnes.length === 0) {
        toast.success(
          newAlready > 0
            ? `No new businesses — Google Places has no more unseen results for this search right now.`
            : `No new businesses found for this search.`
        )
        setFindMoreLoading(false)
        return
      }
      setResult(prev => {
        const prevData = prev?.data || {}
        const mergedProspects = [...(prevData.prospects || []), ...newOnes]
        const merged = {
          ...prevData,
          prospects: mergedProspects,
          hot_prospects:  mergedProspects.filter(p => (p.classification || '').toLowerCase() === 'hot'),
          warm_prospects: mergedProspects.filter(p => (p.classification || '').toLowerCase() === 'warm'),
          cold_prospects: mergedProspects.filter(p => (p.classification || '').toLowerCase() === 'cold'),
          total_found: mergedProspects.length,
          already_discovered_count: (prevData.already_discovered_count || 0) + newAlready,
        }
        const next = { ...prev, data: merged }
        localStorage.setItem(LS_KEY, JSON.stringify(next))
        return next
      })
      toast.success(`Found ${newOnes.length} new business${newOnes.length === 1 ? '' : 'es'}${newAlready ? ` (${newAlready} already discovered)` : ''}`)
    } catch {
      toast.error('Backend se connect nahi ho paya.')
    }
    setFindMoreLoading(false)
  }

  const d   = result?.data          || {}
  const hot  = d.hot_prospects      || []
  const warm = d.warm_prospects     || []
  const cold = d.cold_prospects     || []
  const all  = d.prospects          || []

  const TABS = [
    { ...CLASS_STYLES.hot,  key: 'hot',  label: '🔥 Hot',  count: hot.length },
    { ...CLASS_STYLES.warm, key: 'warm', label: '🌡️ Warm', count: warm.length },
    { ...CLASS_STYLES.cold, key: 'cold', label: '🧊 Cold', count: cold.length },
  ]
  const tabData = activeTab === 'hot' ? hot : activeTab === 'warm' ? warm : cold

  return (
    <PageShell maxWidth="960px">
      <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>
      <PageHeader
        title="Prospect Discovery"
        sub="Find real local businesses on Google Maps and score them as marketing agency prospects."
        action={
          <button onClick={toggleHistory} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: historyOpen ? SLATE_M : 'transparent', border: `1px solid ${SLATE_L}`, color: TEXT_SECONDARY, padding: '9px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            <History size={14} /> Past Scans
          </button>
        }
      />

      {/* History panel — every past scan, oldest data never lost, click to
          view its exact original results without re-running anything. */}
      {historyOpen && (
        <div style={{ ...card, maxWidth: '640px', width: '100%', padding: '16px 18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: BONE }}>Past Scans</p>
            <button onClick={() => setHistoryOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, padding: '2px' }}><X size={15} /></button>
          </div>
          {historyLoading ? (
            <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Loading…</p>
          ) : historyList.length === 0 ? (
            <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>No past scans yet — run a search to start building history.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '340px', overflowY: 'auto' }}>
              {historyList.map(h => (
                <button
                  key={h.id}
                  onClick={() => viewHistoryScan(h.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', textAlign: 'left', background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '9px 12px', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '12.5px', fontWeight: '600', color: BONE }}>{h.industry} in {h.city || 'India'}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: MUTED }}>
                      {h.result_count} found{h.already_discovered_count ? ` · ${h.already_discovered_count} already known` : ''} · {new Date(h.created_at.endsWith('Z') ? h.created_at : h.created_at + 'Z').toLocaleString()}
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', color: GOLD, flexShrink: 0, fontWeight: '600' }}>View →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '16px' }}>
          {error && <div style={{ background: DANGER_MUTED, border: '1px solid rgba(251,113,133,0.32)', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: RED, fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Industry <span style={{ color: RED, fontWeight: '700' }}>*</span></label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inp, color: industry ? BONE : MUTED }}>
              <option value="">— Select industry to search —</option>
              {INDUSTRIES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {industry === 'Other' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Specify Industry</label>
              <input type="text" value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="e.g. Optical Stores" style={inp} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>City</label>
              <CityInput value={city} onChange={setCity} style={inp} />
            </div>
            <div>
              <label style={lbl}>Max Prospects</label>
              <select value={maxProspects} onChange={e => setMaxProspects(Number(e.target.value))} style={inp}>
                <option value={10}>10 prospects</option>
                <option value={15}>15 prospects</option>
                <option value={20}>20 prospects</option>
                <option value={50}>50 prospects</option>
              </select>
            </div>
          </div>

          <button onClick={handleFind} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
            background: loading ? SLATE_M : GOLD, border: loading ? `1px solid ${SLATE_L}` : 'none', color: loading ? MUTED : INK,
            padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            <Crosshair size={15} />
            {loading ? loadingStep : 'Find Prospects'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ maxWidth: '640px', width: '100%' }}>
          {[
            'Scanning Google Maps for real businesses...',
            `Fetching contact details & ratings for up to ${maxProspects} businesses...`,
            'Checking social media & ad presence...',
            `Scoring all prospects with AI${maxProspects > 20 ? ' (larger scans take a bit longer)' : ''}...`,
          ].map((label, i) => (
            <div key={i} style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: SLATE_M, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 5px', fontSize: '13px', fontWeight: '500', color: BONE }}>{label}</p>
                <Shimmer h="8px" w="55%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cache banner */}
      {fromCache && result && !loading && (
        <div style={{ maxWidth: '960px', width: '100%', background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '9px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Showing previous result · Scan again to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY); setResult(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: MUTED, textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={{ maxWidth: '960px', width: '100%' }}>

          {/* Report header */}
          <div style={{ ...card, padding: '12px 18px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: BONE }}>{d.industry} in {d.city}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: MUTED }}>
                Query: "{d.search_query_used}" · Source: {d.data_source}
                {result.google_places_used ? ' ✓' : ' (mock data — add GOOGLE_PLACES_API_KEY)'}
                {alreadyDiscoveredTotal > 0 && ` · ${alreadyDiscoveredTotal} already discovered in past scans (not re-shown)`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <CopyBtn text={buildHotCopyText(hot)} label="Copy Hot Prospects" />
              <ExportBtn
                label="Download DOCX"
                icon={FileText}
                onClick={async () => {
                  const businessName = await fetchTenantBusinessName()
                  await downloadProspectCallSheetDocx({
                    industry: d.industry, city: d.city, source: d.data_source, businessName,
                    prospects: toExportProspects(all),
                  })
                }}
              />
              <ExportBtn
                label="Download Excel"
                icon={FileSpreadsheet}
                onClick={async () => {
                  await downloadProspectCallLogXlsx({ industry: d.industry, city: d.city, prospects: toExportProspects(all) })
                }}
              />
            </div>
          </div>

          {/* Summary bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {[
              { label: 'Total Found', value: d.total_found || all.length, color: BONE },
              { label: '🔥 Hot',       value: hot.length,                 color: RED },
              { label: '🌡️ Warm',      value: warm.length,                color: WARNING },
              { label: '🧊 Cold',      value: cold.length,                color: INFO },
            ].map(m => (
              <div key={m.label} style={{ ...card, padding: '12px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</p>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Top Opportunity — same raised-surface treatment as Why Contact
              / Suggested Opening Line (this block lives at page level, not
              inside ProspectCard, but must never diverge from that style). */}
          {d.top_opportunity && (
            <div style={{ background: BG_RAISED, borderLeft: `3px solid ${GOLD}`, borderRadius: '8px', padding: '14px 18px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                <TrendingUp size={14} color={GOLD} />
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Top Opportunity</p>
              </div>
              <p style={{ margin: 0, fontSize: '13.5px', color: BONE, lineHeight: '1.5' }}>{d.top_opportunity}</p>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: '8px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', border: '1.5px solid',
                  background: activeTab === t.key ? t.bg : SLATE_M,
                  borderColor: activeTab === t.key ? t.border : SLATE_L,
                  color: activeTab === t.key ? t.color : MUTED,
                }}
              >
                {t.label} <span style={{ marginLeft: '4px', background: SLATE_M, color: activeTab === t.key ? t.color : MUTED, borderRadius: '10px', padding: '1px 6px', fontSize: '11px' }}>{t.count}</span>
              </button>
            ))}
          </div>

          {/* Prospect Cards */}
          {tabData.length === 0 ? (
            <div style={{ ...card, padding: '24px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: MUTED, fontSize: '13px' }}>No {activeTab} prospects found in this scan.</p>
            </div>
          ) : (
            tabData.map(p => <ProspectCard key={p.rank || p.name} p={p} isMobile={isMobile} industry={resolvedIndustry} city={city} />)
          )}

          {/* Find more — re-scans deeper (higher max_prospects) and appends
              only genuinely new businesses; the backend excludes anything
              already surfaced in ANY past scan of this exact industry+city. */}
          <button
            onClick={handleFindMore}
            disabled={findMoreLoading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%',
              background: 'transparent', border: `1.5px dashed ${SLATE_L}`, color: findMoreLoading ? MUTED : GOLD,
              padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
              cursor: findMoreLoading ? 'not-allowed' : 'pointer', marginTop: '4px', fontFamily: 'inherit',
            }}
          >
            <PlusCircle size={14} />
            {findMoreLoading ? 'Searching deeper…' : 'Find More'}
          </button>

        </div>
      )}
    </PageShell>
  )
}
