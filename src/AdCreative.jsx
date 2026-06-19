import { useState } from 'react'

const GOLD = '#D4AF37'
const card = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
const inputSt = { width: '100%', padding: '10px 13px', borderRadius: '7px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
const lbl = { display: 'block', color: '#999', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }

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
    if (!url || !businessType || !offer) { alert('Website, business type aur offer bharo!'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch(`${BACKEND}/ad-creative`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, business_type: businessType, offer, platform, language })
      })
      const data = await res.json()
      if (data.success) setResult(data)
      else setError('Kuch galat ho gaya, dobara try karo.')
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  function parseCreatives(text) {
    return text.split(/CREATIVE \d+:/).filter(b => b.trim()).map(b => b.trim())
  }

  const page = { minHeight: '100vh', background: '#FAFAFA', padding: isMobile ? '28px 16px' : '40px 36px', maxWidth: '820px' }

  if (loading) return (
    <div style={page}>
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Ad Creative</h1>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 32px' }}>Generating creatives...</p>
      <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 6px' }}>3 alag-alag creatives ban rahe hain...</p>
        <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>20–40 seconds lagenge</p>
      </div>
    </div>
  )

  if (result) {
    const creatives = parseCreatives(result.creative)
    return (
      <div style={page}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Ad Creative</h1>
            <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>{offer} · {platform} · {language}</p>
          </div>
          <button onClick={() => setResult(null)} style={{ background: 'transparent', border: '1px solid #E5E5E5', color: '#666', padding: '7px 16px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>← New</button>
        </div>

        {creatives.map((c, idx) => (
          <div key={idx} style={{ ...card, padding: '24px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '600', color: GOLD, margin: 0 }}>Creative {idx + 1}</h2>
              <button
                onClick={() => { navigator.clipboard.writeText('CREATIVE ' + (idx + 1) + ':\n' + c); setCopiedIndex(idx); setTimeout(() => setCopiedIndex(null), 1500) }}
                style={{ background: copiedIndex === idx ? '#22C55E' : '#F5F5F5', border: '1px solid #E5E5E5', color: copiedIndex === idx ? '#fff' : '#666', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
              >
                {copiedIndex === idx ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            {c.split('\n').map((line, i) => {
              const clean = line.replace(/\*\*/g, '').trim()
              if (!clean) return null
              const colonIdx = clean.indexOf(':')
              if (colonIdx > 0 && colonIdx < 25) {
                return (
                  <div key={i} style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', color: '#999', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{clean.slice(0, colonIdx)}</span>
                    <p style={{ margin: '3px 0 0', fontSize: '14px', color: '#171717', lineHeight: '1.5' }}>{clean.slice(colonIdx + 1).trim()}</p>
                  </div>
                )
              }
              return <p key={i} style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>{clean}</p>
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={page}>
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Ad Creative</h1>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 32px' }}>Offer daalo — AI poori ad creative banayega (copy + image idea + layout)</p>

      <div style={{ maxWidth: '560px' }}>
        <div style={{ ...card, padding: '28px' }}>
          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '20px', color: '#BE123C', fontSize: '13px' }}>{error}</div>}

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

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Kya Promote Karna Hai?</label>
            <input type="text" value={offer} onChange={e => setOffer(e.target.value)} placeholder="e.g. Diwali Sale 50% off, New Vitamin C Serum" style={inputSt} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
            <div>
              <label style={lbl}>Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} style={inputSt}>
                {['Instagram','Facebook','Google','YouTube'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={inputSt}>
                {['Hinglish','English','Hindi'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleRun} style={{ width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: '#171717', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Generate 3 Ad Creatives
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdCreative
