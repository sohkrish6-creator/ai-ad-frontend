import { BACKEND, apiFetch } from './lib/api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crosshair, Copy, Check, ExternalLink, Phone, MapPin, TrendingUp, Flame, Thermometer, Snowflake, Radar } from 'lucide-react'
import CityInput, { getLastCity } from './CityInput'
import { useToast } from './ToastContext'
import { useLoadingSteps } from './useLoadingSteps'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'



const LS_KEY  = 'adsoh_prospect_result'
const SIE_PREFILL_LS_KEY = 'adsoh_social_intel_prefill'
const PROSPECT_LOADING_STEPS = ['Scanning Google Maps...', 'Enriching business details...', 'Scoring prospects...']


const INDUSTRIES = [
  'Hospitality (Hotels, Restaurants, Cafes)', 'Schools & Education', 'Healthcare & Clinics',
  'Real Estate', 'Retail & Fashion', 'Food & Beverage', 'Wellness & Fitness', 'Wedding & Events',
  'Auto & Transport', 'Professional Services', 'Coaching & Tutoring', 'Jewellery & Accessories',
  'Interior Design & Architecture', 'Photography & Videography', 'Legal & CA Services',
  'IT & Software Companies', 'Travel & Tourism', 'Salon & Beauty', 'Gym & Sports Academy',
  'NGO & Social Enterprise', 'Agriculture & Dairy', 'Logistics & Transport', 'Printing & Packaging',
  'Construction & Builders', 'Media & Entertainment', 'Other',
]

function Shimmer({ h = '14px', w = '100%' }) {
  return <div style={{ height: h, width: w, borderRadius: '4px', background: 'linear-gradient(90deg,#F0F0F0 25%,#E8E8E8 50%,#F0F0F0 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.2s ease-in-out infinite' }} />
}

function CopyBtn({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const toast = useToast()
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }}
      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: copied ? '#16A34A' : '#F5F5F5', border: '1px solid ' + (copied ? '#16A34A' : '#E5E5E5'), color: copied ? '#fff' : '#666', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

function ClassBadge({ c }) {
  const map = {
    hot:  { bg: '#FEF2F2', color: RED, border: '#FECDD3', icon: '🔥', label: 'Hot' },
    warm: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', icon: '🌡️', label: 'Warm' },
    cold: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', icon: '🧊', label: 'Cold' },
  }
  const s = map[(c || '').toLowerCase()] || map.cold
  return <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.icon} {s.label}</span>
}

function ScoreBar({ score }) {
  const color = score >= 75 ? '#BE123C' : score >= 50 ? '#D97706' : '#1D4ED8'
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
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: p.opportunity_score >= 75 ? '#FEF2F2' : p.opportunity_score >= 50 ? '#FFFBEB' : '#EFF6FF', border: `2px solid ${p.opportunity_score >= 75 ? '#FECDD3' : p.opportunity_score >= 50 ? '#FDE68A' : '#BFDBFE'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: p.opportunity_score >= 75 ? '#BE123C' : p.opportunity_score >= 50 ? '#D97706' : '#1D4ED8' }}>{p.rank}</span>
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
          <span style={{ padding: '3px 9px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: '#FEF2F2', color: RED, border: '1px solid #FECDD3' }}>
            ❌ {p.weakness_found}
          </span>
        )}
        {p.recommended_service && (
          <span style={{ padding: '3px 9px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: '#FFFDF5', color: '#92400E', border: `1px solid ${GOLD}50` }}>
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
          <div key={m.label} style={{ background: INK, borderRadius: '6px', padding: '8px 10px', border: '1px solid #F0F0F0' }}>
            <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>{m.label}</p>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: BONE, textTransform: 'capitalize' }}>{m.value || '—'}</p>
          </div>
        ))}
      </div>

      {/* Why Contact */}
      {p.why_contact && (
        <div style={{ background: '#F9FAFB', borderRadius: '6px', padding: '9px 12px', marginBottom: '10px', border: '1px solid #F0F0F0' }}>
          <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Why Contact</p>
          <p style={{ margin: 0, fontSize: '12.5px', color: BONE, lineHeight: '1.45' }}>{p.why_contact}</p>
        </div>
      )}

      {/* Suggested Opening Line */}
      {p.suggested_opening_line && (
        <div style={{ background: '#FFFDF5', border: `1.5px solid ${GOLD}40`, borderRadius: '7px', padding: '10px 12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Opening Line</p>
            <CopyBtn text={p.suggested_opening_line} label="Copy" />
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: BONE, lineHeight: '1.5', fontStyle: 'italic' }}>"{p.suggested_opening_line}"</p>
        </div>
      )}

      {/* Footer row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {p.phone && (
          <a href={'tel:' + p.phone} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#555', textDecoration: 'none', background: SLATE_M, border: `1px solid ${SLATE_L}`, padding: '4px 10px', borderRadius: '5px' }}>
            <Phone size={11} /> {p.phone}
          </a>
        )}
        {p.website && (
          <a href={p.website.startsWith('http') ? p.website : 'https://' + p.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#1D4ED8', textDecoration: 'none', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '4px 10px', borderRadius: '5px' }}>
            <ExternalLink size={11} /> Website
          </a>
        )}
        <button onClick={openSocialAudit} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: GOLD, textDecoration: 'none', background: '#FFFDF5', border: `1px solid ${GOLD}50`, padding: '4px 10px', borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit' }}>
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
  const loadingStep = useLoadingSteps(PROSPECT_LOADING_STEPS, loading)
  const [error, setError]                 = useState('')
  const [result, setResult]               = useState(null)
  const [fromCache, setFromCache]         = useState(false)
  const [activeTab, setActiveTab]         = useState('hot')

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

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

  const d   = result?.data          || {}
  const hot  = d.hot_prospects      || []
  const warm = d.warm_prospects     || []
  const cold = d.cold_prospects     || []
  const all  = d.prospects          || []

  const TABS = [
    { key: 'hot',  label: '🔥 Hot',  count: hot.length,  color: RED, bg: '#FEF2F2',  border: '#FECDD3' },
    { key: 'warm', label: '🌡️ Warm', count: warm.length, color: '#D97706', bg: '#FFFBEB',  border: '#FDE68A' },
    { key: 'cold', label: '🧊 Cold', count: cold.length, color: '#1D4ED8', bg: '#EFF6FF',  border: '#BFDBFE' },
  ]
  const tabData = activeTab === 'hot' ? hot : activeTab === 'warm' ? warm : cold

  return (
    <PageShell maxWidth="960px">
      <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>
      <PageHeader title="Prospect Discovery" sub="Find real local businesses on Google Maps and score them as marketing agency prospects." />

      {/* Form */}
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '16px' }}>
          {error && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: RED, fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Industry <span style={{ color: '#DC2626', fontWeight: '700' }}>*</span></label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inp, color: industry ? '#171717' : '#999' }}>
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
              </select>
            </div>
          </div>

          <button onClick={handleFind} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
            background: loading ? '#E5E5E5' : GOLD, border: 'none', color: loading ? '#999' : '#fff',
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
            'Fetching contact details & ratings...',
            'Checking social media & ad presence...',
            'AI scoring each prospect...',
          ].map((label, i) => (
            <div key={i} style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FFFBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
              </p>
            </div>
            <CopyBtn text={buildHotCopyText(hot)} label="Copy Hot Prospects" />
          </div>

          {/* Summary bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {[
              { label: 'Total Found', value: d.total_found || all.length, color: BONE },
              { label: '🔥 Hot',       value: hot.length,                 color: RED },
              { label: '🌡️ Warm',      value: warm.length,                color: '#D97706' },
              { label: '🧊 Cold',      value: cold.length,                color: '#1D4ED8' },
            ].map(m => (
              <div key={m.label} style={{ ...card, padding: '12px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</p>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Top Opportunity */}
          {d.top_opportunity && (
            <div style={{ background: '#FFFDF5', border: `1.5px solid ${GOLD}`, borderRadius: '8px', padding: '14px 18px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                <TrendingUp size={14} color={GOLD} />
                <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Top Opportunity</p>
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
                  background: activeTab === t.key ? t.bg : '#fff',
                  borderColor: activeTab === t.key ? t.border : '#E5E5E5',
                  color: activeTab === t.key ? t.color : '#888',
                }}
              >
                {t.label} <span style={{ marginLeft: '4px', background: activeTab === t.key ? t.border : '#F0F0F0', borderRadius: '10px', padding: '1px 6px', fontSize: '11px' }}>{t.count}</span>
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

        </div>
      )}
    </PageShell>
  )
}
