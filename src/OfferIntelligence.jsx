import { useState } from 'react'
import { Copy, Check, Gift, Zap, Tag, Star, ShieldCheck, MessageSquare, TrendingUp } from 'lucide-react'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const GOLD    = '#D4AF37'

const card  = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
const lbl   = { display: 'block', color: '#999', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }
const inp   = { width: '100%', padding: '10px 13px', borderRadius: '7px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }

const INDUSTRIES = [
  'Hospitality (Hotels, Restaurants, Cafes)', 'Schools & Education', 'Healthcare & Clinics',
  'Real Estate', 'Retail & Fashion', 'Food & Beverage', 'Wellness & Fitness', 'Wedding & Events',
  'Auto & Transport', 'Professional Services', 'Coaching & Tutoring', 'Jewellery & Accessories',
  'Interior Design & Architecture', 'Photography & Videography', 'Legal & CA Services',
  'IT & Software Companies', 'Travel & Tourism', 'Salon & Beauty', 'Gym & Sports Academy',
  'NGO & Social Enterprise', 'Agriculture & Dairy', 'Logistics & Transport', 'Printing & Packaging',
  'Construction & Builders', 'Media & Entertainment', 'Other',
]

function CopyBtn({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        background: copied ? '#16A34A' : '#F5F5F5',
        border: '1px solid ' + (copied ? '#16A34A' : '#E5E5E5'),
        color: copied ? '#fff' : '#666',
        padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
        cursor: 'pointer', flexShrink: 0,
      }}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

function Shimmer({ h = '14px', w = '100%' }) {
  return <div style={{ height: h, width: w, borderRadius: '4px', background: 'linear-gradient(90deg,#F0F0F0 25%,#E8E8E8 50%,#F0F0F0 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.2s ease-in-out infinite' }} />
}

function ScoreBadge({ score, label = 'Confidence' }) {
  const color = score >= 80 ? '#16A34A' : score >= 60 ? GOLD : '#F97316'
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 11px', borderRadius: '20px', background: color + '15', border: `1px solid ${color}40` }}>
      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color }} />
      <span style={{ fontSize: '11px', fontWeight: '700', color }}>{score} {label}</span>
    </div>
  )
}

function MiniCard({ icon: Icon, label, title, body, badge, badgeColor }) {
  return (
    <div style={{ ...card, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Icon size={14} color="#888" />
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#888' }}>{label}</span>
        </div>
        {badge && (
          <span style={{ fontSize: '11px', fontWeight: '700', borderRadius: '12px', padding: '2px 8px', color: badgeColor || '#666', background: (badgeColor || '#666') + '15', border: `1px solid ${badgeColor || '#666'}40` }}>
            {badge}
          </span>
        )}
      </div>
      {title && <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '600', color: '#171717' }}>{title}</p>}
      {body  && <p style={{ margin: 0, fontSize: '12.5px', color: '#555', lineHeight: '1.6' }}>{body}</p>}
    </div>
  )
}

export default function OfferIntelligence() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [industry, setIndustry]           = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [businessKey, setBusinessKey]     = useState('')
  const [city, setCity]                   = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [result, setResult]               = useState(null)

  const resolvedIndustry = industry === 'Other' ? industryOther : industry

  async function handleGenerate() {
    if (!businessKey.trim() && !resolvedIndustry) {
      setError('Business URL ya industry dono mein se ek toh daalo.')
      return
    }
    setError(''); setLoading(true); setResult(null)
    try {
      const res  = await fetch(`${BACKEND}/offer-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_key: businessKey.trim() || `${resolvedIndustry}::${city}`,
          industry: resolvedIndustry,
          city,
        }),
      })
      const data = await res.json()
      if (data.success) setResult(data)
      else setError(data.message || data.error || 'Kuch toh gadbad hai, dobara try karo.')
    } catch {
      setError('Backend se connect nahi ho paya.')
    }
    setLoading(false)
  }

  const offer = result?.offer || {}

  function buildCopy() {
    if (!offer) return ''
    return [
      'OFFER INTELLIGENCE REPORT',
      '',
      'RECOMMENDED OFFER:',
      offer.recommended_offer?.name || '',
      offer.recommended_offer?.description || '',
      `Why it works: ${offer.recommended_offer?.why_it_works || ''}`,
      '',
      'LEAD MAGNET:',
      `${offer.lead_magnet?.name || ''} (${offer.lead_magnet?.format || ''})`,
      offer.lead_magnet?.why || '',
      '',
      'PRICING:',
      `Model: ${offer.pricing_suggestion?.model || ''}`,
      `Entry Offer: ${offer.pricing_suggestion?.entry_offer || ''}`,
      offer.pricing_suggestion?.reasoning || '',
      '',
      'GUARANTEE:',
      offer.guarantee?.guarantee || '',
      offer.guarantee?.why || '',
      '',
      'BEST CTA:',
      offer.cta || '',
      '',
      'COMPETITOR GAP:',
      offer.competitor_offer_gap || '',
      '',
      'IRRESISTIBLE OFFER STACK:',
      ...(offer.irresistible_offer_stack || []).map((e, i) => `${i + 1}. ${e}`),
    ].join('\n')
  }

  const page = {
    minHeight: '100vh', background: '#FAFAFA',
    padding: isMobile ? '28px 16px' : '40px 36px',
    maxWidth: '860px', width: '100%', boxSizing: 'border-box',
    fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
  }

  return (
    <div style={page}>
      <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Gift size={20} color={GOLD} />
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.4px' }}>Offer Intelligence</h1>
      </div>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 24px 30px' }}>
        Reads stored business memory and designs the most irresistible offer to convert your target audience.
      </p>

      {/* Notice */}
      <div style={{ maxWidth: '620px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '11px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <Zap size={14} color={GOLD} style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ margin: 0, fontSize: '12.5px', color: '#92400E', lineHeight: '1.55' }}>
          <strong>Run Marketing Brain first</strong> for this business — Offer Intelligence reads the memory Marketing Brain saves. No memory = no analysis.
        </p>
      </div>

      {/* Input */}
      <div style={{ maxWidth: '620px' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px 28px', marginBottom: '16px' }}>

          {error && (
            <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: '#BE123C', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Business URL or Key</label>
            <input type="text" value={businessKey} onChange={e => setBusinessKey(e.target.value)}
              placeholder="e.g. sohscape.com — same URL used in Marketing Brain"
              style={inp} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={lbl}>Target Industry <span style={{ color: '#F97316', fontWeight: '700' }}>*B2B</span></label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inp, color: industry ? '#171717' : '#999' }}>
                <option value="">— Same as Marketing Brain B2B target —</option>
                {INDUSTRIES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Target City</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Jaipur" style={inp} />
            </div>
          </div>

          {industry === 'Other' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Specify Industry</label>
              <input type="text" value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="e.g. Interior Designers" style={inp} />
            </div>
          )}

          <button
            onClick={handleGenerate}
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
            <Gift size={16} />
            {loading ? 'Designing your offer...' : 'Generate Best Offer'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ maxWidth: '620px' }}>
          {['Reading stored memory & audience data...', 'Analyzing competitor gaps...', 'Designing irresistible offer stack...'].map((label, i) => (
            <div key={i} style={{ ...card, padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#171717', margin: '0 0 6px' }}>{label}</p>
                <Shimmer h="8px" w="55%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {result && offer && (
        <div style={{ maxWidth: '820px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', margin: '8px 0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Gift size={18} color={GOLD} />
              <h2 style={{ fontSize: '17px', fontWeight: '600', margin: 0, letterSpacing: '-0.3px' }}>Offer Intelligence Report</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {offer.confidence && <ScoreBadge score={offer.confidence} label="% Confidence" />}
              <CopyBtn text={buildCopy()} label="Copy Report" />
            </div>
          </div>

          {/* 1. Recommended Offer — gold border */}
          {offer.recommended_offer && (
            <div style={{ ...card, padding: '22px 24px', marginBottom: '12px', borderColor: GOLD, borderWidth: '2px', background: '#FFFDF5' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={15} color={GOLD} />
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: GOLD }}>Recommended Offer</span>
                </div>
                {offer.recommended_offer.offer_score && (
                  <ScoreBadge score={offer.recommended_offer.offer_score} label="Offer Score" />
                )}
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: '700', color: '#171717', letterSpacing: '-0.3px' }}>
                {offer.recommended_offer.name}
              </p>
              <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#444', lineHeight: '1.65' }}>
                {offer.recommended_offer.description}
              </p>
              <div style={{ background: '#F5F5F5', borderRadius: '7px', padding: '10px 14px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Why it works: </span>
                <span style={{ fontSize: '13px', color: '#444', lineHeight: '1.6' }}>{offer.recommended_offer.why_it_works}</span>
              </div>
            </div>
          )}

          {/* 2. Irresistible Offer Stack */}
          {offer.irresistible_offer_stack?.length > 0 && (
            <div style={{ ...card, padding: '20px 22px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <TrendingUp size={15} color="#171717" />
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#888' }}>Irresistible Offer Stack</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {offer.irresistible_offer_stack.map((el, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, background: GOLD + '18', border: `1.5px solid ${GOLD}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: GOLD }}>{i + 1}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#2a2a2a', lineHeight: '1.6' }}>{el}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Mini-card grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            {offer.lead_magnet && (
              <MiniCard
                icon={Zap} label="Lead Magnet"
                title={offer.lead_magnet.name}
                body={`${offer.lead_magnet.format ? '[' + offer.lead_magnet.format + '] ' : ''}${offer.lead_magnet.why}`}
                badge={offer.lead_magnet.format} badgeColor={GOLD}
              />
            )}
            {offer.pricing_suggestion && (
              <MiniCard
                icon={Tag} label="Pricing"
                title={offer.pricing_suggestion.entry_offer}
                body={`Model: ${offer.pricing_suggestion.model} — ${offer.pricing_suggestion.reasoning}`}
                badge={offer.pricing_suggestion.model} badgeColor="#6366F1"
              />
            )}
            {offer.guarantee && (
              <MiniCard
                icon={ShieldCheck} label="Guarantee"
                title={offer.guarantee.guarantee}
                body={offer.guarantee.why}
              />
            )}
            {offer.cta && (
              <div style={{ ...card, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <MessageSquare size={14} color="#888" />
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#888' }}>Best CTA</span>
                  </div>
                  <CopyBtn text={offer.cta} />
                </div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#171717', lineHeight: '1.5' }}>"{offer.cta}"</p>
              </div>
            )}
          </div>

          {/* 4. Competitor Gap */}
          {offer.competitor_offer_gap && (
            <div style={{ ...card, padding: '20px 22px', background: '#F8F4FF', borderColor: '#DDD6FE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <TrendingUp size={15} color="#7C3AED" />
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#7C3AED' }}>Competitor Gap — Own This</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#3B0764', lineHeight: '1.6' }}>{offer.competitor_offer_gap}</p>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
