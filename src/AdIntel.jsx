import { BACKEND, apiFetch } from './lib/api'
import { useState, useEffect } from 'react'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'



const LS_KEY_ADINTEL = 'adsoh_adintel_result'

function renderLines(text) {
  return text.split('\n').map((line, i) => {
    if (line.match(/^[A-Z\s()]+:$/)) {
      return <h3 key={i} style={{ color: GOLD, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '22px', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #EAEAEA' }}>{line}</h3>
    }
    if (line.match(/^\d+\./)) {
      return <div key={i} style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '10px 14px', marginBottom: '7px', fontSize: '14px', color: BONE, lineHeight: '1.5' }}>{line}</div>
    }
    if (line.trim()) {
      return <p key={i} style={{ color: MUTED, fontSize: '14px', lineHeight: '1.6', margin: '4px 0' }}>{line}</p>
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
  const [fromCache, setFromCache] = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY_ADINTEL); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  

  async function handleAnalyze() {
    if (!businessName || !businessType) { alert('Competitor ka naam aur business type bharo!'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await apiFetch(`${BACKEND}/ad-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_name: businessName, business_type: businessType, website, country: 'IN' })
      })
      const data = await res.json()
      setResult(data); localStorage.setItem(LS_KEY_ADINTEL, JSON.stringify(data)); setFromCache(false)
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  const isMobile = window.innerWidth < 768

  if (loading) return (
    <PageShell maxWidth="820px">
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Ad Intelligence</h1>
      <p style={{ color: MUTED, fontSize: '13px', margin: '0 0 32px' }}>Fetching ad data...</p>
      <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
        <p style={{ color: MUTED, fontSize: '14px', margin: '0 0 6px' }}>Ad intelligence tayyaar ho rahi hai...</p>
        <p style={{ color: MUTED, fontSize: '13px', margin: 0 }}>15–30 seconds lagenge</p>
      </div>
    </PageShell>
  )

  if (result) return (
    <PageShell maxWidth="820px">
      {fromCache && (
        <div style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '9px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Showing previous result · Generate new report to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY_ADINTEL); setResult(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: MUTED, textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Ad Intelligence</h1>
          <p style={{ color: MUTED, fontSize: '13px', margin: 0 }}>{result.business_name}</p>
        </div>
        <button onClick={() => { localStorage.removeItem(LS_KEY_ADINTEL); setResult(null); setFromCache(false) }} style={{ background: 'transparent', border: `1px solid ${SLATE_L}`, color: MUTED, padding: '7px 16px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
          ← New Search
        </button>
      </div>

      <div style={{ ...card, padding: '24px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 6px', color: BONE }}>Live Ads — {result.business_name}</h2>
        <p style={{ color: MUTED, fontSize: '13px', margin: '0 0 18px' }}>Yeh buttons competitor ke abhi chal rahe real ads kholenge</p>
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
    </PageShell>
  )

  return (
    <PageShell maxWidth="820px">
      <PageHeader title="Ad Intelligence" sub="Competitor ke LIVE ads dekho aur AI se analysis guide pao" />

      <div style={{ maxWidth: '560px', width: '100%' }}>
        <div style={{ ...card, padding: '28px' }}>
          {error && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '20px', color: RED, fontSize: '13px' }}>{error}</div>}

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
    </PageShell>
  )
}

export default AdIntel
