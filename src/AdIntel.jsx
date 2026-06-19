import { useState } from 'react'

const GOLD = '#D4AF37'
const card = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
const inputSt = { width: '100%', padding: '10px 13px', borderRadius: '7px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
const lbl = { display: 'block', color: '#999', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }

function renderLines(text) {
  return text.split('\n').map((line, i) => {
    if (line.match(/^[A-Z\s()]+:$/)) {
      return <h3 key={i} style={{ color: GOLD, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '22px', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #EAEAEA' }}>{line}</h3>
    }
    if (line.match(/^\d+\./)) {
      return <div key={i} style={{ background: '#F9F9F9', border: '1px solid #EAEAEA', borderRadius: '7px', padding: '10px 14px', marginBottom: '7px', fontSize: '14px', color: '#171717', lineHeight: '1.5' }}>{line}</div>
    }
    if (line.trim()) {
      return <p key={i} style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: '4px 0' }}>{line}</p>
    }
    return null
  })
}

function AdIntel() {
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

  async function handleAnalyze() {
    if (!businessName || !businessType) { alert('Competitor ka naam aur business type bharo!'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch(`${BACKEND}/ad-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_name: businessName, business_type: businessType, website, country: 'IN' })
      })
      setResult(await res.json())
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  const page = { minHeight: '100vh', background: '#FAFAFA', padding: '40px 36px', maxWidth: '820px' }

  if (loading) return (
    <div style={page}>
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Ad Intelligence</h1>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 32px' }}>Fetching ad data...</p>
      <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 6px' }}>Ad intelligence tayyaar ho rahi hai...</p>
        <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>15–30 seconds lagenge</p>
      </div>
    </div>
  )

  if (result) return (
    <div style={page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Ad Intelligence</h1>
          <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>{result.business_name}</p>
        </div>
        <button onClick={() => setResult(null)} style={{ background: 'transparent', border: '1px solid #E5E5E5', color: '#666', padding: '7px 16px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
          ← New Search
        </button>
      </div>

      <div style={{ ...card, padding: '24px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 6px', color: '#171717' }}>Live Ads — {result.business_name}</h2>
        <p style={{ color: '#999', fontSize: '13px', margin: '0 0 18px' }}>Yeh buttons competitor ke abhi chal rahe real ads kholenge</p>
        <a href={result.meta_ad_library_link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#1877F2', color: '#fff', padding: '13px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>
          Facebook &amp; Instagram Ads →
        </a>
        <a href={result.google_ads_link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#34A853', color: '#fff', padding: '13px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>
          Google Ads Transparency →
        </a>
      </div>

      <div style={{ ...card, padding: '28px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 20px', color: GOLD }}>Ad Analysis Guide</h2>
        {renderLines(result.guide)}
      </div>
    </div>
  )

  return (
    <div style={page}>
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Ad Intelligence</h1>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 32px' }}>Competitor ke LIVE ads dekho aur AI se analysis guide pao</p>

      <div style={{ maxWidth: '560px' }}>
        <div style={{ ...card, padding: '28px' }}>
          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '20px', color: '#BE123C', fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Competitor ka Naam</label>
            <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Dot and Key" style={inputSt} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Competitor ki Website (Google ads ke liye)</label>
            <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. mamaearth.in" style={inputSt} />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={lbl}>Business Type</label>
            <select value={businessType} onChange={e => setBusinessType(e.target.value)} style={{ ...inputSt, color: businessType ? '#171717' : '#999' }}>
              <option value="">Select karo...</option>
              {['Wedding & Events','Restaurant / Cafe','Healthcare / Clinic','Real Estate','Education / Coaching','Beauty & Skincare','Retail Store','Salon / Spa','Travel & Tourism','Technology / SaaS','Other'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <button onClick={handleAnalyze} style={{ width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: '#171717', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Ad Intelligence Nikalo
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdIntel
