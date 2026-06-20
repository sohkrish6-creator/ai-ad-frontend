import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'

const FONT = '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif'
const GOLD = '#D4AF37'
const card = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
const inputSt = { width: '100%', padding: '10px 13px', borderRadius: '7px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
const lbl = { display: 'block', color: '#999', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }

function CopyBtn({ onClick, copied }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
      border: '1px solid #E5E5E5', background: copied ? '#F0FDF4' : '#F9F9F9',
      color: copied ? '#16A34A' : '#666', transition: 'all 0.15s ease',
    }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Shimmer({ h = '14px', w = '100%', radius = '4px', mb = '0' }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius, marginBottom: mb,
      background: 'linear-gradient(90deg, #F5F5F5 25%, #EBEBEB 50%, #F5F5F5 75%)',
      backgroundSize: '800px 100%', animation: 'shimmer 1.5s ease-in-out infinite',
    }} />
  )
}

function renderBlock(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    const clean = line.replace(/\*\*/g, '').replace(/^#+\s*/, '')
    if (clean.match(/^[A-Z\s()\/]+:$/)) {
      return <h3 key={i} style={{ color: GOLD, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '20px', marginBottom: '9px', paddingBottom: '5px', borderBottom: '1px solid #EAEAEA' }}>{clean}</h3>
    }
    if (clean.match(/^\d+\./)) {
      return <div key={i} style={{ background: '#F9F9F9', border: '1px solid #EAEAEA', borderRadius: '7px', padding: '9px 13px', marginBottom: '7px', fontSize: '14px', color: '#171717', lineHeight: '1.5' }}>{clean}</div>
    }
    if (clean.trim()) {
      return <p key={i} style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: '4px 0' }}>{clean}</p>
    }
    return null
  })
}

function MarketingBrain() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const [url, setUrl] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [budget, setBudget] = useState('')
  const [goal, setGoal] = useState('')
  const [language, setLanguage] = useState('Hinglish')
  const [compName, setCompName] = useState('')
  const [compWebsite, setCompWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState({})

  const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

  async function handleRun() {
    if (!url || !businessType || !budget || !goal) { alert('Website, business type, budget aur goal bharo!'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch(`${BACKEND}/full-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, business_type: businessType, budget: parseInt(budget), goal, competitor_name: compName, competitor_website: compWebsite, language })
      })
      const data = await res.json()
      if (data.scan_failed) setError(data.message)
      else setResult(data)
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [key]: true })
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000)
  }

  const page = { minHeight: '100vh', background: '#FAFAFA', padding: isMobile ? '28px 16px' : '40px 36px', maxWidth: '900px', fontFamily: FONT }

  if (loading) return (
    <div style={page}>
      <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Marketing Brain</h1>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 24px' }}>5 engines running in parallel...</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {['Marketing Strategy', 'Competitor Analysis', 'Ad Intelligence', 'Smart Creative', 'Audience & Targeting'].map((label, i) => (
          <div key={label} style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', color: '#BBB', fontWeight: '700' }}>{i + 1}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#171717', margin: '0 0 6px' }}>{label}</p>
              <Shimmer h="9px" w="60%" />
            </div>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: GOLD, opacity: 0.6, animation: `pulse ${1 + i * 0.2}s ease-in-out infinite alternate` }} />
          </div>
        ))}
      </div>
      <p style={{ color: '#BBB', fontSize: '12px', margin: '16px 0 0', textAlign: 'center' }}>1–2 minutes · 5 reports generating</p>
    </div>
  )

  const sections = [
    { key: 'strategy',      num: 1, title: 'Marketing Strategy',   sub: 'Targeting, budget, headlines, ad copy',                       content: result?.strategy,       gold: false },
    { key: 'competitor',    num: 2, title: 'Competitor Analysis',   sub: 'Positioning, gaps, jeet ke mauke',                            content: result?.competitor,     gold: false },
    { key: 'smart_creative',num: 4, title: 'Smart Ad Creative',     sub: 'Competitor se ALAG — market gap pe based',                    content: result?.smart_creative, gold: true  },
    { key: 'audience',      num: 5, title: 'Audience & Targeting',  sub: 'Audience segments, where to find them, Meta + Google targeting', content: result?.audience,     gold: true  },
  ]

  if (result) return (
    <div style={page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Marketing Brain</h1>
          <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>{result.url} — full report ready</p>
        </div>
        <button onClick={() => setResult(null)} style={{ background: 'transparent', border: '1px solid #E5E5E5', color: '#666', padding: '7px 16px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>← New Report</button>
      </div>

      {sections.map(({ key, num, title, sub, content, gold }) => content ? (
        <div key={key} style={{ ...card, padding: '26px', marginBottom: '12px', borderColor: gold ? '#E5DABB' : '#EAEAEA' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: gold ? GOLD : '#171717' }}>{num}. {title}</h2>
            <CopyBtn onClick={() => handleCopy(key, content)} copied={!!copied[key]} />
          </div>
          <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 16px' }}>{sub}</p>
          {renderBlock(content)}
        </div>
      ) : null)}

      {/* Section 3 — Ad Intel */}
      <div style={{ ...card, padding: '26px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px', color: '#171717' }}>3. Ad Intelligence</h2>
        <p style={{ fontSize: '12px', color: '#999', margin: '0 0 16px' }}>Competitor ke live ads + guide</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
          {[
            { href: result.meta_ad_library_link, label: 'Facebook & Instagram Live Ads', color: '#1877F2' },
            { href: result.google_ads_link,      label: 'Google Ads Transparency',       color: '#34A853' },
          ].map(({ href, label, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              background: color, color: '#fff', padding: '12px', borderRadius: '8px',
              textDecoration: 'none', fontWeight: '600', fontSize: '13px',
            }}>
              {label} <ExternalLink size={12} />
            </a>
          ))}
        </div>
        {renderBlock(result.ad_guide)}
      </div>
    </div>
  )

  return (
    <div style={page}>
      <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Marketing Brain</h1>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 32px' }}>Ek baar daalo — Strategy + Competitor + Ad Intel + Creative + Audience, sab ek saath</p>

      <div style={{ maxWidth: '560px' }}>
        <div style={{ ...card, padding: '28px' }}>
          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '20px', color: '#BE123C', fontSize: '13px' }}>{error}</div>}

          <p style={{ fontSize: '11px', color: GOLD, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 14px' }}>Aapka Business</p>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Website URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://aapkibusiness.com" style={inputSt} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Business Type</label>
            <select value={businessType} onChange={e => setBusinessType(e.target.value)} style={{ ...inputSt, color: businessType ? '#171717' : '#999' }}>
              <option value="">Select karo...</option>
              {['Wedding & Events','Restaurant / Cafe','Healthcare / Clinic','Real Estate','Education / Coaching','Beauty & Skincare','Retail Store','Salon / Spa','Travel & Tourism','Technology / SaaS','Digital Marketing Agency','Other'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>Budget (₹/month)</label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="50000" style={inputSt} />
            </div>
            <div>
              <label style={lbl}>Goal</label>
              <select value={goal} onChange={e => setGoal(e.target.value)} style={{ ...inputSt, color: goal ? '#171717' : '#999' }}>
                <option value="">Select...</option>
                {['Lead Generation','Sales / Revenue','Brand Awareness','Website Traffic','WhatsApp Inquiries'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={inputSt}>
              {['Hinglish','English','Hindi'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <p style={{ fontSize: '11px', color: GOLD, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '24px 0 14px' }}>Competitor (Optional)</p>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Competitor ka Naam</label>
            <input type="text" value={compName} onChange={e => setCompName(e.target.value)} placeholder="e.g. Mamaearth" style={inputSt} />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={lbl}>Competitor ki Website</label>
            <input type="text" value={compWebsite} onChange={e => setCompWebsite(e.target.value)} placeholder="e.g. mamaearth.in" style={inputSt} />
          </div>

          <button onClick={handleRun} style={{ width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: '#171717', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Generate Full Marketing Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default MarketingBrain
