import { useState, useEffect } from 'react'
import CityInput, { getLastCity } from './CityInput'

const LS_KEY_OPP = 'adsoh_opportunity_result'
import { Copy, Check, Target, TrendingUp, Zap, Users, Tag, MapPin, ChartBar } from 'lucide-react'
import { useToast } from './ToastContext'
import { useLoadingSteps } from './useLoadingSteps'
import { TrustBadge, ValidationWarningBanner } from './TrustLayer'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'



const OPP_LOADING_STEPS = ['Loading business memory...', 'Finding best audience...', 'Calculating opportunity score...']

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

const input = { width: '100%', padding: '10px 13px', borderRadius: '7px', border: `1px solid ${SLATE_L}`, background: INK, color: BONE, fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }

const INDUSTRIES = [
  'Hospitality (Hotels, Restaurants, Cafes)', 'Schools & Education', 'Healthcare & Clinics',
  'Real Estate', 'Retail & Fashion', 'Food & Beverage', 'Wellness & Fitness', 'Wedding & Events',
  'Auto & Transport', 'Professional Services', 'Coaching & Tutoring', 'Jewellery & Accessories',
  'Interior Design & Architecture', 'Photography & Videography', 'Legal & CA Services',
  'IT & Software Companies', 'Travel & Tourism', 'Salon & Beauty', 'Gym & Sports Academy',
  'NGO & Social Enterprise', 'Agriculture & Dairy', 'Logistics & Transport', 'Printing & Packaging',
  'Construction & Builders', 'Media & Entertainment', 'Other',
]

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const toast = useToast()
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        background: copied ? '#16A34A' : '#F5F5F5',
        border: '1px solid ' + (copied ? '#16A34A' : '#E5E5E5'),
        color: copied ? '#fff' : '#666',
        padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', flexShrink: 0,
      }}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function Shimmer({ h = '14px', w = '100%' }) {
  return <div style={{ height: h, width: w, borderRadius: '4px', background: 'linear-gradient(90deg,#F0F0F0 25%,#E8E8E8 50%,#F0F0F0 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.2s ease-in-out infinite' }} />
}

function ScoreBadge({ score }) {
  const color = score >= 80 ? '#16A34A' : score >= 60 ? GOLD : '#F97316'
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: color + '15', border: `1px solid ${color}40` }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
      <span style={{ fontSize: '12px', fontWeight: '700', color }}>{score}% Confidence</span>
    </div>
  )
}

function SectionCard({ icon: Icon, iconColor = '#171717', label, children, goldBorder = false }) {
  return (
    <div style={{
      ...card,
      padding: '20px 22px',
      borderColor: goldBorder ? GOLD : '#EAEAEA',
      background: goldBorder ? '#FFFDF5' : '#fff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Icon size={15} color={goldBorder ? GOLD : iconColor} />
        <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: goldBorder ? GOLD : '#888' }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

export default function OpportunityEngine() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const toast = useToast()

  const [industry, setIndustry]           = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [businessKey, setBusinessKey]     = useState('')
  const [city, setCity]                   = useState(getLastCity)
  const [budget, setBudget]               = useState('')
  const [loading, setLoading]             = useState(false)
  const loadingStep = useLoadingSteps(OPP_LOADING_STEPS, loading)
  const [error, setError]                 = useState('')
  const [result, setResult]               = useState(null)
  const [fromCache, setFromCache]         = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY_OPP); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  const resolvedIndustry = industry === 'Other' ? industryOther : industry

  async function handleFind() {
    if (!businessKey.trim() && !resolvedIndustry) {
      setError('Business URL ya industry dono mein se ek toh daalو.')
      return
    }
    setError(''); setLoading(true); setResult(null)
    try {
      const res  = await fetch(`${BACKEND}/opportunity-engine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_key: businessKey.trim() || `${resolvedIndustry}::${city}`,
          industry: resolvedIndustry,
          city,
          budget: budget ? parseInt(budget) : 0,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data); localStorage.setItem(LS_KEY_OPP, JSON.stringify(data)); setFromCache(false); toast.success('Done!')
      } else {
        const msg = data.message || data.error || 'Kuch toh gadbad hai, dobara try karo.'
        setError(msg); toast.error(msg)
      }
    } catch {
      setError('Backend se connect nahi ho paya.'); toast.error('Backend se connect nahi ho paya.')
    }
    setLoading(false)
  }

  const opp = result?.opportunity || {}

  function buildCopySummary() {
    if (!opp) return ''
    const lines = [
      `OPPORTUNITY ENGINE REPORT`,
      ``,
      `WHAT TO DO FIRST:`,
      opp.what_to_do_first || '',
      ``,
      `BIGGEST OPPORTUNITY:`,
      opp.biggest_opportunity?.opportunity || '',
      opp.biggest_opportunity?.why || '',
      `Impact: ${opp.biggest_opportunity?.expected_impact || ''}`,
      ``,
      `BEST AUDIENCE: ${opp.highest_roi_audience?.segment || ''}`,
      opp.highest_roi_audience?.why || '',
      `Priority Score: ${opp.highest_roi_audience?.priority_score || ''}`,
      ``,
      `BEST OFFER: ${opp.highest_roi_offer?.offer || ''}`,
      opp.highest_roi_offer?.why || '',
      `Revenue Potential: ${opp.highest_roi_offer?.revenue_potential || ''}`,
      ``,
      `BEST PLATFORM: ${opp.highest_roi_platform?.platform || ''}`,
      opp.highest_roi_platform?.why || '',
      ``,
      `BEST LOCATION: ${opp.highest_roi_location?.area || ''}`,
      opp.highest_roi_location?.why || '',
      ``,
      `QUICK WINS THIS WEEK:`,
      ...(opp.quick_wins || []).map((w, i) => `${i + 1}. ${w}`),
    ]
    return lines.join('\n')
  }


  return (
    <PageShell maxWidth="860px">
      <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>

      <PageHeader title="Opportunity Engine" sub="Reads your stored business memory and tells you exactly where the highest ROI is — so you know what to do first." />

      {/* Notice */}
      <div style={{ maxWidth: '620px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '11px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <Zap size={14} color={GOLD} style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ margin: 0, fontSize: '12.5px', color: '#92400E', lineHeight: '1.55' }}>
          <strong>Run Marketing Brain first</strong> for this business — the Opportunity Engine reads the memory that Marketing Brain saves. No memory = no analysis.
        </p>
      </div>

      {/* Input card */}
      <div style={{ maxWidth: '620px' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px 28px', marginBottom: '16px' }}>

          {error && (
            <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: RED, fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Business Key */}
          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Business URL or Key</label>
            <input
              type="text"
              value={businessKey}
              onChange={e => setBusinessKey(e.target.value)}
              placeholder="e.g. sohscape.com or leave blank to use industry+city"
              style={input}
            />
            <p style={{ margin: '5px 0 0', fontSize: '11px', color: MUTED }}>Same URL you used in Marketing Brain — so memory matches.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={lbl}>Target Industry <span style={{ color: '#F97316', fontWeight: '700' }}>*B2B</span></label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...input, color: industry ? '#171717' : '#999' }}>
                <option value="">— Same as Marketing Brain B2B target —</option>
                {INDUSTRIES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Target City</label>
              <CityInput value={city} onChange={setCity} style={input} />
              <p style={{ margin: '5px 0 0', fontSize: '11px', color: MUTED }}>Same city as Marketing Brain B2B target</p>
            </div>
          </div>

          {industry === 'Other' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Specify Industry</label>
              <input type="text" value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="e.g. Interior Designers" style={input} />
            </div>
          )}

          <div style={{ marginBottom: '22px' }}>
            <label style={lbl}>Monthly Budget (₹) <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>optional</span></label>
            <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 50000" style={input} />
          </div>

          <button
            onClick={handleFind}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              justifyContent: 'center',
              background: loading ? '#E5E5E5' : GOLD,
              border: 'none', color: loading ? '#999' : '#fff',
              padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <Target size={16} />
            {loading ? loadingStep : 'Find Best Opportunities'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ maxWidth: '620px' }}>
          {['Reading stored business memory...', 'Identifying highest-ROI audience segments...', 'Calculating opportunity scores...'].map((label, i) => (
            <div key={i} style={{ ...card, padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: BONE, margin: '0 0 6px' }}>{label}</p>
                <Shimmer h="8px" w="55%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {fromCache && result && !loading && (
        <div style={{ maxWidth: '760px', width: '100%', background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '9px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Showing previous result · Generate new report to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY_OPP); setResult(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: MUTED, textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}

      {result && opp && (
        <div style={{ maxWidth: '820px' }}>

          <ValidationWarningBanner message={result.validation_warning} />
          <TrustBadge verdict={result.trust_verdict} basedOn={result.based_on} />

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', margin: '8px 0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={18} color={GOLD} />
              <h2 style={{ fontSize: '17px', fontWeight: '600', margin: 0, letterSpacing: '-0.3px' }}>Opportunity Analysis</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {opp.confidence && <ScoreBadge score={opp.confidence} />}
              <CopyBtn text={buildCopySummary()} />
            </div>
          </div>

          {/* 1. What To Do First — gold highlighted */}
          {opp.what_to_do_first && (
            <div style={{
              ...card, padding: '22px 24px', marginBottom: '12px',
              borderColor: GOLD, borderWidth: '2px', background: '#FFFDF5',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Target size={16} color={GOLD} />
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD }}>What To Do First</span>
              </div>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: BONE, lineHeight: '1.5' }}>
                {opp.what_to_do_first}
              </p>
            </div>
          )}

          {/* 2. Biggest Opportunity */}
          {opp.biggest_opportunity && (
            <SectionCard icon={TrendingUp} iconColor="#171717" label="Biggest Opportunity">
              <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: '600', color: BONE }}>{opp.biggest_opportunity.opportunity}</p>
              <p style={{ margin: '0 0 10px', fontSize: '13.5px', color: '#555', lineHeight: '1.6' }}>{opp.biggest_opportunity.why}</p>
              <div style={{ display: 'inline-block', background: 'rgba(63,166,107,0.1)', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '5px 12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: GREEN }}>Expected Impact: {opp.biggest_opportunity.expected_impact}</span>
              </div>
            </SectionCard>
          )}

          {/* 3. Grid of 4 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', margin: '10px 0' }}>

            {/* Best Audience */}
            {opp.highest_roi_audience && (
              <div style={{ ...card, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Users size={14} color="#888" />
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED }}>Best Audience</span>
                  </div>
                  {opp.highest_roi_audience.priority_score && (
                    <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD, background: GOLD + '15', border: `1px solid ${GOLD}40`, borderRadius: '12px', padding: '2px 8px' }}>
                      {opp.highest_roi_audience.priority_score}
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 7px', fontSize: '14px', fontWeight: '600', color: BONE }}>{opp.highest_roi_audience.segment}</p>
                <p style={{ margin: 0, fontSize: '12.5px', color: MUTED, lineHeight: '1.55' }}>{opp.highest_roi_audience.why}</p>
              </div>
            )}

            {/* Best Offer */}
            {opp.highest_roi_offer && (
              <div style={{ ...card, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Tag size={14} color="#888" />
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED }}>Best Offer</span>
                  </div>
                  {opp.highest_roi_offer.revenue_potential && (
                    <span style={{
                      fontSize: '11px', fontWeight: '700', borderRadius: '12px', padding: '2px 8px',
                      color: opp.highest_roi_offer.revenue_potential === 'High' ? '#16A34A' : opp.highest_roi_offer.revenue_potential === 'Medium' ? '#D97706' : '#666',
                      background: opp.highest_roi_offer.revenue_potential === 'High' ? '#F0FDF4' : opp.highest_roi_offer.revenue_potential === 'Medium' ? '#FFFBEB' : '#F5F5F5',
                      border: `1px solid ${opp.highest_roi_offer.revenue_potential === 'High' ? '#BBF7D0' : opp.highest_roi_offer.revenue_potential === 'Medium' ? '#FDE68A' : '#E5E5E5'}`,
                    }}>
                      {opp.highest_roi_offer.revenue_potential}
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 7px', fontSize: '14px', fontWeight: '600', color: BONE }}>{opp.highest_roi_offer.offer}</p>
                <p style={{ margin: 0, fontSize: '12.5px', color: MUTED, lineHeight: '1.55' }}>{opp.highest_roi_offer.why}</p>
              </div>
            )}

            {/* Best Platform */}
            {opp.highest_roi_platform && (
              <div style={{ ...card, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                  <ChartBar size={14} color="#888" />
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED }}>Best Platform</span>
                </div>
                <p style={{ margin: '0 0 7px', fontSize: '14px', fontWeight: '600', color: BONE }}>{opp.highest_roi_platform.platform}</p>
                <p style={{ margin: 0, fontSize: '12.5px', color: MUTED, lineHeight: '1.55' }}>{opp.highest_roi_platform.why}</p>
              </div>
            )}

            {/* Best Location */}
            {opp.highest_roi_location && (
              <div style={{ ...card, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                  <MapPin size={14} color="#888" />
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED }}>Best Location</span>
                </div>
                <p style={{ margin: '0 0 7px', fontSize: '14px', fontWeight: '600', color: BONE }}>{opp.highest_roi_location.area}</p>
                <p style={{ margin: 0, fontSize: '12.5px', color: MUTED, lineHeight: '1.55' }}>{opp.highest_roi_location.why}</p>
              </div>
            )}
          </div>

          {/* 4. Quick Wins */}
          {opp.quick_wins?.length > 0 && (
            <div style={{ ...card, padding: '20px 22px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Zap size={15} color={GOLD} />
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED }}>Quick Wins This Week</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {opp.quick_wins.map((win, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      background: GOLD + '18', border: `1.5px solid ${GOLD}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: GOLD }}>{i + 1}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#2a2a2a', lineHeight: '1.6' }}>{win}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </PageShell>
  )
}
