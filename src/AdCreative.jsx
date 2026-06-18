import { useState } from 'react'

function AdCreative() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const [url, setUrl] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [offer, setOffer] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [language, setLanguage] = useState('Hinglish')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)

  const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

  async function handleRun() {
    if (!url || !businessType || !offer) {
      alert('Website, business type aur offer bharo!')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch(`${BACKEND}/ad-creative`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, business_type: businessType, offer, platform, language })
      })
      const data = await response.json()
      if (data.success) setResult(data)
      else setError('Kuch galat ho gaya, dobara try karo.')
    } catch (err) {
      setError('Backend se connect nahi ho paya.')
    } finally {
      setLoading(false)
    }
  }

  // Creative text ko cards mein todo
  function parseCreatives(text) {
    const blocks = text.split(/CREATIVE \d+:/).filter(b => b.trim())
    return blocks.map(b => b.trim())
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
          <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>Ad Creatives Ban Rahe Hain...</h2>
          <p style={{ color: '#64748B', fontSize: '14px' }}>3 alag-alag creative tayyaar ho rahe hain</p>
          <p style={{ color: '#6366F1', fontSize: '13px', marginTop: '8px' }}>20-40 second ☕</p>
        </div>
      </div>
    )
  }

  if (result) {
    const creatives = parseCreatives(result.creative)
    return (
      <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
        <div style={{ background: '#0D1117', borderBottom: '1px solid #1E2A3E', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '700', fontSize: '15px' }}>🎨 Ad Creative</span>
          <button onClick={() => setResult(null)} style={{ background: 'transparent', border: '1px solid #1E2A3E', color: '#64748B', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>← Naya</button>
        </div>

        <div style={{ maxWidth: '760px', margin: '32px auto', padding: '0 24px' }}>
          <div style={{ background: '#10B98115', border: '1px solid #10B98140', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
            <p style={{ margin: 0, fontWeight: '600', color: '#10B981' }}>✅ 3 Ad Creatives Taiyaar!</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>{offer} · {platform} · {language}</p>
          </div>

          {creatives.map((c, idx) => (
            <div key={idx} style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', padding: '24px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#818CF8', margin: 0 }}>🎨 Creative {idx + 1}</h2>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('CREATIVE ' + (idx + 1) + ':\n' + c)
                    setCopiedIndex(idx)
                    setTimeout(() => setCopiedIndex(null), 1500)
                  }}
                  style={{ background: copiedIndex === idx ? '#10B981' : '#1E2A3E', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {copiedIndex === idx ? '✓ Copied' : '📋 Copy All'}
                </button>
              </div>
              {c.split('\n').map((line, i) => {
                const clean = line.replace(/\*\*/g, '').trim()
                if (!clean) return null
                const colonIdx = clean.indexOf(':')
                if (colonIdx > 0 && colonIdx < 25) {
                  const label = clean.slice(0, colonIdx)
                  const value = clean.slice(colonIdx + 1).trim()
                  return (
                    <div key={i} style={{ marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#6366F1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                      <p style={{ margin: '3px 0 0 0', fontSize: '14px', color: '#E2E8F0', lineHeight: '1.5' }}>{value}</p>
                    </div>
                  )
                }
                return <p key={i} style={{ fontSize: '14px', color: '#94A3B8', margin: '4px 0' }}>{clean}</p>
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      <div style={{ background: '#0D1117', borderBottom: '1px solid #1E2A3E', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: '700', fontSize: '15px' }}>🎨 Ad Creative</span>
      </div>

      <div style={{ maxWidth: '560px', margin: '40px auto', padding: '0 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0' }}>🎨 Ad Creative Generator</h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Offer daalo — AI poori ad creative banayega (copy + image idea + layout)</p>
        </div>

        <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', padding: '28px' }}>
          {error && (
            <div style={{ background: '#F43F5E15', border: '1px solid #F43F5E40', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '13px' }}>⚠️ {error}</div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Website URL</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://aapkibusiness.com" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Business Type</label>
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
              <option value="Digital Marketing Agency">Digital Marketing Agency</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Kya Promote Karna Hai?</label>
            <input type="text" value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. Diwali Sale 50% off, New Vitamin C Serum" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Google">Google</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}>
                <option value="Hinglish">Hinglish</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

          <button onClick={handleRun} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#6366F1', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            🎨 3 Ad Creatives Banao
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdCreative