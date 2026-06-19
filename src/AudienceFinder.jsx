import { useState } from 'react'

const API = 'https://ai-ad-backend-zhpj.onrender.com'

const BUSINESS_TYPES = [
  'E-commerce / Online Store',
  'Restaurant / Cafe / Food',
  'Fashion / Apparel / Accessories',
  'Beauty / Skincare / Salon',
  'Health / Fitness / Wellness',
  'Education / Coaching / Courses',
  'Real Estate / Property',
  'Wedding & Events',
  'Travel & Tourism',
  'Jewellery / Luxury',
  'Finance / Insurance',
  'Technology / SaaS / App',
  'Healthcare / Clinic / Doctor',
  'Automobile / Vehicles',
  'Home Decor / Furniture',
  'Sports / Fantasy Sports',
  'Entertainment / Media',
  'NGO / Non-profit',
  'Other',
]

export default function AudienceFinder() {
  const [form, setForm] = useState({
    url: '',
    niche: '',
    business_type: '',
    offer: '',
    platform: 'Both',
    language: 'Hinglish',
  })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.business_type) {
      setError('Business type select karo!')
      return
    }
    if (!form.url.trim() && !form.niche.trim()) {
      setError('URL ya Niche — kuch toh do!')
      return
    }
    setError('')
    setLoading(true)
    setResult('')
    try {
      const res = await fetch(`${API}/audience-finder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.audience)
      } else {
        setError(data.message || 'Kuch toh gadbad hai, dobara try karo.')
      }
    } catch (e) {
      setError('Backend se connect nahi ho paya.')
    }
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '24px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0 }}>
            🎯 Audience Finder
          </h1>
          <p style={{ color: '#888', marginTop: 6, fontSize: 14 }}>
            URL ya Niche do — exact audience, segments aur "where to find them" milega
          </p>
        </div>

        {/* Form Card */}
        <div style={{ background: '#141414', borderRadius: 14, padding: 24, border: '1px solid #222', marginBottom: 24 }}>

          {/* URL Input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>
              Website URL <span style={{ color: '#555' }}>(optional agar Niche doge)</span>
            </label>
            <input
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://example.com"
              style={inputStyle}
            />
          </div>

          {/* Niche Input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>
              Niche / Industry Focus <span style={{ color: '#555' }}>(optional agar URL doge)</span>
            </label>
            <input
              name="niche"
              value={form.niche}
              onChange={handleChange}
              placeholder="jaise: fantasy sports app, bridal jewellery, NEET coaching"
              style={inputStyle}
            />
          </div>

          {/* Business Type */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>
              Business Type <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <select name="business_type" value={form.business_type} onChange={handleChange} style={inputStyle}>
              <option value="">-- Select karo --</option>
              {BUSINESS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Offer */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>
              Kya promote karna hai? <span style={{ color: '#555' }}>(optional)</span>
            </label>
            <input
              name="offer"
              value={form.offer}
              onChange={handleChange}
              placeholder="jaise: app download, product sale, lead generation"
              style={inputStyle}
            />
          </div>

          {/* Platform + Language */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>Platform</label>
              <select name="platform" value={form.platform} onChange={handleChange} style={inputStyle}>
                <option value="Both">Both (Meta + Google)</option>
                <option value="Meta">Meta Only</option>
                <option value="Google">Google Only</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>Language</label>
              <select name="language" value={form.language} onChange={handleChange} style={inputStyle}>
                <option value="Hinglish">Hinglish</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ background: '#2a1a1a', border: '1px solid #e74c3c', borderRadius: 8, padding: '10px 14px', color: '#e74c3c', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 10,
              background: loading ? '#333' : 'linear-gradient(135deg, #f7b731, #e67e22)',
              color: loading ? '#888' : '#000', fontWeight: 700, fontSize: 15,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Audience dhundh raha hoon...' : '🎯 Find My Audience'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: '#141414', borderRadius: 14, padding: 24, border: '1px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f7b731', margin: 0 }}>📊 Audience Report</h2>
              <button
                onClick={handleCopy}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  background: copied ? '#27ae60' : '#222',
                  color: copied ? '#fff' : '#aaa',
                  border: '1px solid #333', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <pre style={{
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              fontSize: 14, lineHeight: 1.7, color: '#ddd', margin: 0,
            }}>
              {result}
            </pre>
          </div>
        )}

      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 8,
  background: '#1a1a1a', border: '1px solid #333',
  color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
