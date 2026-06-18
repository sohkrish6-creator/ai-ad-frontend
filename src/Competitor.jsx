import { useState } from 'react'

function Competitor() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const [myUrl, setMyUrl] = useState('')
  const [comp1, setComp1] = useState('')
  const [comp2, setComp2] = useState('')
  const [comp3, setComp3] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

  async function handleAnalyze() {
    if (!myUrl || !comp1 || !businessType) {
      alert('Apni website, kam se kam 1 competitor, aur business type bharo!')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch(`${BACKEND}/competitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          my_url: myUrl,
          competitor_urls: [comp1, comp2, comp3].filter(u => u.trim()),
          business_type: businessType
        })
      })
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Backend se connect nahi ho paya.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>Competitors Analyze Ho Rahe Hain...</h2>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Websites scan, gaps dhoondhe ja rahe hain...</p>
          <p style={{ color: '#6366F1', fontSize: '13px', marginTop: '8px' }}>30-60 second ☕</p>
        </div>
      </div>
    )
  }

  if (result) {
    const lines = result.analysis.split('\n')
    return (
      <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
        <div style={{ background: '#0D1117', borderBottom: '1px solid #1E2A3E', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '700', fontSize: '15px' }}>✦ Competitor Intelligence</span>
          <button onClick={() => setResult(null)} style={{ background: 'transparent', border: '1px solid #1E2A3E', color: '#64748B', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
            ← Naya Analysis
          </button>
        </div>

        <div style={{ maxWidth: '800px', margin: '32px auto', padding: '0 24px' }}>
          <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', padding: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', color: '#818CF8' }}>🔍 Competitor Intelligence Report</h2>
            {lines.map((line, index) => {
              if (line.match(/^[A-Z\s()]+:$/)) {
                return (
                  <h3 key={index} style={{ color: '#6366F1', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '24px', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #1E2A3E' }}>
                    {line}
                  </h3>
                )
              }
              if (line.match(/^\d+\./)) {
                return (
                  <div key={index} style={{ background: '#131820', border: '1px solid #1E2A3E', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px', fontSize: '14px', color: '#E2E8F0', lineHeight: '1.5' }}>
                    {line}
                  </div>
                )
              }
              if (line.trim()) {
                return (
                  <p key={index} style={{ color: '#94A3B8', fontSize: '14px', lineHeight: '1.6', margin: '4px 0' }}>
                    {line}
                  </p>
                )
              }
              return null
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      <div style={{ background: '#0D1117', borderBottom: '1px solid #1E2A3E', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: '700', fontSize: '15px' }}>✦ Competitor Intelligence</span>
      </div>

      <div style={{ maxWidth: '560px', margin: '48px auto', padding: '0 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0' }}>🔍 Competitor Intelligence</h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Apni aur competitors ki website daalo — AI gaps aur jeet ke mauke batayega</p>
        </div>

        <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', padding: '28px' }}>
          {error && (
            <div style={{ background: '#F43F5E15', border: '1px solid #F43F5E40', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Apni Website</label>
            <input type="url" value={myUrl} onChange={(e) => setMyUrl(e.target.value)} placeholder="https://meri-website.com" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Competitor 1 (zaroori)</label>
            <input type="url" value={comp1} onChange={(e) => setComp1(e.target.value)} placeholder="https://competitor1.com" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Competitor 2 (optional)</label>
            <input type="url" value={comp2} onChange={(e) => setComp2(e.target.value)} placeholder="https://competitor2.com" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Competitor 3 (optional)</label>
            <input type="url" value={comp3} onChange={(e) => setComp3(e.target.value)} placeholder="https://competitor3.com" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Business Type</label>
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: businessType ? '#fff' : '#64748B', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}>
              <option value="">Select karo...</option>
              <option value="Wedding & Events">Wedding & Events</option>
              <option value="Restaurant / Cafe">Restaurant / Cafe</option>
              <option value="Healthcare / Clinic">Healthcare / Clinic</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Education / Coaching">Education / Coaching</option>
              <option value="Retail Store">Retail Store</option>
              <option value="Salon / Spa">Salon / Spa</option>
              <option value="Travel & Tourism">Travel & Tourism</option>
              <option value="Technology / SaaS">Technology / SaaS</option>
              <option value="Digital Marketing Agency">Digital Marketing Agency</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button onClick={handleAnalyze} style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', background: '#6366F1', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            🔍 Competitors Analyze Karo
          </button>
        </div>
      </div>
    </div>
  )
}

export default Competitor