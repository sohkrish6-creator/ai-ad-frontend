import { useState } from 'react'

const GOLD = '#D4AF37'
const card = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
const inputSt = { width: '100%', padding: '10px 13px', borderRadius: '7px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
const lbl = { display: 'block', color: '#999', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }

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

  const page = { minHeight: '100vh', background: '#FAFAFA', padding: isMobile ? '28px 16px' : '40px 36px', maxWidth: '900px' }

  if (loading) return (
    <div style={page}>
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Marketing Brain</h1>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 32px' }}>Generating full report...</p>
      <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 6px' }}>Strategy + Competitor + Ad Intel + Creative + Audience ban rahe hain...</p>
        <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>1–2 minute lagenge (5 cheezein ek saath)</p>
      </div>
    </div>
  )

  if (result) return (
    <div style={page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Marketing Brain</h1>
          <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>{result.url} — full report ready</p>
        </div>
        <button onClick={() => setResult(null)} style={{ background: 'transparent', border: '1px solid #E5E5E5', color: '#666', padding: '7px 16px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>← New Report</button>
      </div>

      {/* Section 1 — Strategy */}
      <div style={{ ...card, padding: '26px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#171717' }}>1. Marketing Strategy</h2>
          <button onClick={() => handleCopy('strategy', result.strategy)} style={{ padding: '5px 12px', borderRadius: '6px', background: copied.strategy ? '#22C55E' : '#F5F5F5', color: copied.strategy ? '#fff' : '#666', border: '1px solid #E5E5E5', cursor: 'pointer', fontSize: '12px' }}>
            {copied.strategy ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 16px' }}>Targeting, budget, headlines, ad copy</p>
        {renderBlock(result.strategy)}
      </div>

      {/* Section 2 — Competitor */}
      {result.competitor && (
        <div style={{ ...card, padding: '26px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#171717' }}>2. Competitor Analysis</h2>
            <button onClick={() => handleCopy('competitor', result.competitor)} style={{ padding: '5px 12px', borderRadius: '6px', background: copied.competitor ? '#22C55E' : '#F5F5F5', color: copied.competitor ? '#fff' : '#666', border: '1px solid #E5E5E5', cursor: 'pointer', fontSize: '12px' }}>
              {copied.competitor ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 16px' }}>Positioning, gaps, jeet ke mauke</p>
          {renderBlock(result.competitor)}
        </div>
      )}

      {/* Section 3 — Ad Intel */}
      <div style={{ ...card, padding: '26px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px', color: '#171717' }}>3. Ad Intelligence</h2>
        <p style={{ fontSize: '12px', color: '#999', margin: '0 0 16px' }}>Competitor ke live ads + guide</p>
        <a href={result.meta_ad_library_link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#1877F2', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px', textAlign: 'center', marginBottom: '10px' }}>
          Facebook &amp; Instagram Live Ads →
        </a>
        <a href={result.google_ads_link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#34A853', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px', textAlign: 'center', marginBottom: '18px' }}>
          Google Ads Transparency →
        </a>
        {renderBlock(result.ad_guide)}
      </div>

      {/* Section 4 — Smart Creative */}
      {result.smart_creative && (
        <div style={{ ...card, padding: '26px', marginBottom: '12px', borderColor: '#E5DABB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: GOLD }}>4. Smart Ad Creative</h2>
            <button onClick={() => handleCopy('creative', result.smart_creative)} style={{ padding: '5px 12px', borderRadius: '6px', background: copied.creative ? '#22C55E' : '#F5F5F5', color: copied.creative ? '#fff' : '#666', border: '1px solid #E5E5E5', cursor: 'pointer', fontSize: '12px' }}>
              {copied.creative ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 16px' }}>Competitor se ALAG — market gap pe based</p>
          {renderBlock(result.smart_creative)}
        </div>
      )}

      {/* Section 5 — Audience */}
      {result.audience && (
        <div style={{ ...card, padding: '26px', marginBottom: '12px', borderColor: '#E5DABB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: GOLD }}>5. Audience &amp; Targeting</h2>
            <button onClick={() => handleCopy('audience', result.audience)} style={{ padding: '5px 12px', borderRadius: '6px', background: copied.audience ? '#22C55E' : '#F5F5F5', color: copied.audience ? '#fff' : '#666', border: '1px solid #E5E5E5', cursor: 'pointer', fontSize: '12px' }}>
              {copied.audience ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 16px' }}>Audience segments, where to find them, Meta + Google targeting</p>
          {renderBlock(result.audience)}
        </div>
      )}
    </div>
  )

  return (
    <div style={page}>
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
