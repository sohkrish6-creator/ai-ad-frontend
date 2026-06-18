import { useState } from 'react'

function AdIntel() {
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

  async function handleAnalyze() {
    if (!businessName || !businessType) {
      alert('Competitor ka naam aur business type bharo!')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch(`${BACKEND}/ad-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          business_type: businessType,
          website: website,
          country: 'IN'
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
          <h2 style={{ color: '#fff', fontSize: '18px' }}>Ad Intelligence Tayyaar Ho Rahi Hai...</h2>
          <p style={{ color: '#6366F1', fontSize: '13px', marginTop: '8px' }}>15-30 second ☕</p>
        </div>
      </div>
    )
  }

  if (result) {
    const lines = result.guide.split('\n')
    return (
      <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
        <div style={{ background: '#0D1117', borderBottom: '1px solid #1E2A3E', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '700', fontSize: '15px' }}>✦ Ad Intelligence</span>
          <button onClick={() => setResult(null)} style={{ background: 'transparent', border: '1px solid #1E2A3E', color: '#64748B', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
            ← Naya Search
          </button>
        </div>

        <div style={{ maxWidth: '800px', margin: '32px auto', padding: '0 24px' }}>
          {/* Live Ads Buttons */}
          <div style={{ background: '#0D1117', border: '1px solid #6366F1', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>📡 {result.business_name} ke LIVE Ads Dekho</h2>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '20px' }}>Yeh buttons competitor ke abhi chal rahe real ads kholenge</p>

            <a href={result.meta_ad_library_link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#1877F2', color: '#fff', padding: '14px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', textAlign: 'center', marginBottom: '12px' }}>
              📘 Facebook & Instagram Ads Dekho →
            </a>

            <a href={result.google_ads_link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#34A853', color: '#fff', padding: '14px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>
              🔍 Google Ads Transparency Dekho →
            </a>
          </div>

          {/* AI Guide */}
          <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', padding: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', color: '#818CF8' }}>🎯 Ad Analysis Guide</h2>
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
        <span style={{ fontWeight: '700', fontSize: '15px' }}>✦ Ad Intelligence</span>
      </div>

      <div style={{ maxWidth: '560px', margin: '48px auto', padding: '0 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0' }}>📡 Ad Intelligence</h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Competitor ke LIVE ads dekho aur AI se analysis guide pao</p>
        </div>

        <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', padding: '28px' }}>
          {error && (
            <div style={{ background: '#F43F5E15', border: '1px solid #F43F5E40', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Competitor ka Naam</label>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Dot and Key" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>
<div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Competitor ki Website (Google ads ke liye)</label>
            <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. mamaearth.in" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
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
              <option value="Beauty & Skincare">Beauty & Skincare</option>
              <option value="Retail Store">Retail Store</option>
              <option value="Salon / Spa">Salon / Spa</option>
              <option value="Travel & Tourism">Travel & Tourism</option>
              <option value="Technology / SaaS">Technology / SaaS</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button onClick={handleAnalyze} style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', background: '#6366F1', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            📡 Ad Intelligence Nikalo
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdIntel