import { useState } from 'react'

const API = 'https://ai-ad-backend-zhpj.onrender.com'
const GOLD = '#D4AF37'
const card = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
const inputSt = { width: '100%', padding: '10px 13px', borderRadius: '7px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
const lbl = { display: 'block', color: '#999', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }

const BUSINESS_TYPES = [
  'E-commerce / Online Store','Restaurant / Cafe / Food','Fashion / Apparel / Accessories',
  'Beauty / Skincare / Salon','Health / Fitness / Wellness','Education / Coaching / Courses',
  'Real Estate / Property','Wedding & Events','Travel & Tourism','Jewellery / Luxury',
  'Finance / Insurance','Technology / SaaS / App','Healthcare / Clinic / Doctor',
  'Automobile / Vehicles','Home Decor / Furniture','Sports / Fantasy Sports',
  'Entertainment / Media','NGO / Non-profit','Other',
]

export default function AudienceFinder() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const [form, setForm] = useState({ url: '', niche: '', business_type: '', offer: '', platform: 'Both', language: 'Hinglish' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.business_type) { setError('Business type select karo!'); return }
    if (!form.url.trim() && !form.niche.trim()) { setError('URL ya Niche — kuch toh do!'); return }
    setError(''); setLoading(true); setResult('')
    try {
      const res = await fetch(`${API}/audience-finder`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.success) setResult(data.audience)
      else setError(data.message || 'Kuch toh gadbad hai, dobara try karo.')
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  const handleCopy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const page = { minHeight: '100vh', background: '#FAFAFA', padding: isMobile ? '28px 16px' : '40px 36px', maxWidth: '820px', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={page}>
      <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 4px', letterSpacing: '-0.4px' }}>Audience Finder</h1>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 32px' }}>URL ya Niche do — exact audience, segments aur "where to find them" milega</p>

      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '28px', marginBottom: '16px' }}>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Website URL <span style={{ color: '#CCC', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional agar Niche doge)</span></label>
            <input name="url" value={form.url} onChange={handleChange} placeholder="https://example.com" style={inputSt} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Niche / Industry Focus <span style={{ color: '#CCC', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional agar URL doge)</span></label>
            <input name="niche" value={form.niche} onChange={handleChange} placeholder="jaise: fantasy sports app, bridal jewellery, NEET coaching" style={inputSt} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Business Type <span style={{ color: '#BE123C' }}>*</span></label>
            <select name="business_type" value={form.business_type} onChange={handleChange} style={{ ...inputSt, color: form.business_type ? '#171717' : '#999' }}>
              <option value="">-- Select karo --</option>
              {BUSINESS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Kya promote karna hai? <span style={{ color: '#CCC', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input name="offer" value={form.offer} onChange={handleChange} placeholder="jaise: app download, product sale, lead generation" style={inputSt} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={lbl}>Platform</label>
              <select name="platform" value={form.platform} onChange={handleChange} style={inputSt}>
                <option value="Both">Both (Meta + Google)</option>
                <option value="Meta">Meta Only</option>
                <option value="Google">Google Only</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Language</label>
              <select name="language" value={form.language} onChange={handleChange} style={inputSt}>
                {['Hinglish','English','Hindi'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '10px 14px', color: '#BE123C', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: loading ? '#999' : '#171717', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Audience dhundh raha hoon...' : 'Find My Audience'}
          </button>
        </div>

        {result && (
          <div style={{ ...card, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '600', color: GOLD, margin: 0 }}>Audience Report</h2>
              <button onClick={handleCopy} style={{ padding: '6px 14px', borderRadius: '7px', background: copied ? '#22C55E' : '#F5F5F5', color: copied ? '#fff' : '#666', border: '1px solid #E5E5E5', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '14px', lineHeight: '1.7', color: '#333', margin: 0, fontFamily: 'inherit' }}>{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
