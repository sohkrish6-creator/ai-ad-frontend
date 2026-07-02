import { useState, useEffect } from 'react'

const LS_KEY_COMPETITOR = 'adsoh_competitor_result'
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

function Competitor() {
  const [myUrl, setMyUrl] = useState('')
  const [comp1, setComp1] = useState('')
  const [comp2, setComp2] = useState('')
  const [comp3, setComp3] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [fromCache, setFromCache] = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY_COMPETITOR); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

  async function handleAnalyze() {
    if (!myUrl || !comp1 || !businessType) {
      alert('Apni website, kam se kam 1 competitor, aur business type bharo!')
      return
    }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch(`${BACKEND}/competitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ my_url: myUrl, competitor_urls: [comp1, comp2, comp3].filter(u => u.trim()), business_type: businessType })
      })
      const data = await res.json()
      setResult(data); localStorage.setItem(LS_KEY_COMPETITOR, JSON.stringify(data)); setFromCache(false)
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  const isMobile = window.innerWidth < 768
  const page = { minHeight: '100vh', background: '#FAFAFA', padding: isMobile ? '28px 16px' : '40px 36px', maxWidth: '820px', width: '100%', boxSizing: 'border-box' }

  if (loading) return (
    <div style={page}>
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Competitor Intelligence</h1>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 32px' }}>Analyzing websites...</p>
      <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 6px' }}>Competitors analyze ho rahe hain...</p>
        <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>30–60 seconds lagenge</p>
      </div>
    </div>
  )

  if (result) return (
    <div style={page}>
      {fromCache && (
        <div style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '7px', padding: '9px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Showing previous result · Generate new report to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY_COMPETITOR); setResult(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#888', textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Competitor Intelligence</h1>
          <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>Analysis complete</p>
        </div>
        <button onClick={() => { localStorage.removeItem(LS_KEY_COMPETITOR); setResult(null); setFromCache(false) }} style={{ background: 'transparent', border: '1px solid #E5E5E5', color: '#666', padding: '7px 16px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
          ← New Analysis
        </button>
      </div>
      <div style={{ ...card, padding: '28px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 20px', color: GOLD }}>Competitor Intelligence Report</h2>
        {renderLines(result.analysis)}
      </div>
    </div>
  )

  return (
    <div style={page}>
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Competitor Intelligence</h1>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 32px' }}>Apni aur competitors ki website daalo — AI gaps aur jeet ke mauke batayega</p>

      <div style={{ maxWidth: '560px', width: '100%' }}>
        <div style={{ ...card, padding: '28px' }}>
          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '20px', color: '#BE123C', fontSize: '13px' }}>{error}</div>}

          {[['Apni Website', myUrl, setMyUrl, 'https://meri-website.com'], ['Competitor 1 (zaroori)', comp1, setComp1, 'https://competitor1.com'], ['Competitor 2 (optional)', comp2, setComp2, 'https://competitor2.com'], ['Competitor 3 (optional)', comp3, setComp3, 'https://competitor3.com']].map(([l, v, s, ph]) => (
            <div key={l} style={{ marginBottom: '16px' }}>
              <label style={lbl}>{l}</label>
              <input type="url" value={v} onChange={e => s(e.target.value)} placeholder={ph} style={inputSt} />
            </div>
          ))}

          <div style={{ marginBottom: '28px' }}>
            <label style={lbl}>Business Type</label>
            <select value={businessType} onChange={e => setBusinessType(e.target.value)} style={{ ...inputSt, color: businessType ? '#171717' : '#999' }}>
              <option value="">Select karo...</option>
              {['Wedding & Events','Restaurant / Cafe','Healthcare / Clinic','Real Estate','Education / Coaching','Retail Store','Salon / Spa','Travel & Tourism','Technology / SaaS','Digital Marketing Agency','Other'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <button onClick={handleAnalyze} style={{ width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: '#171717', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Analyze Competitors
          </button>
        </div>
      </div>
    </div>
  )
}

export default Competitor
