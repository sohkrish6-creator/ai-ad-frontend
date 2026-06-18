import { useState } from 'react'

function MarketingBrain() {
  const [url, setUrl] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [budget, setBudget] = useState('')
  const [goal, setGoal] = useState('')
  const [compName, setCompName] = useState('')
  const [compWebsite, setCompWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

  async function handleRun() {
    if (!url || !businessType || !budget || !goal) {
      alert('Website, business type, budget aur goal bharo!')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch(`${BACKEND}/full-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url, business_type: businessType, budget: parseInt(budget), goal,
          competitor_name: compName, competitor_website: compWebsite
        })
      })
      const data = await response.json()
      if (data.scan_failed) setError(data.message)
      else setResult(data)
    } catch (err) {
      setError('Backend se connect nahi ho paya.')
    } finally {
      setLoading(false)
    }
  }

  const renderBlock = (text) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      const clean = line.replace(/\*\*/g, '').replace(/^#+\s*/, '')
      if (clean.match(/^[A-Z\s()\/]+:$/)) {
        return <h3 key={i} style={{ color: '#6366F1', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '18px', marginBottom: '8px', paddingBottom: '5px', borderBottom: '1px solid #1E2A3E' }}>{clean}</h3>
      }
      if (clean.match(/^\d+\./)) {
        return <div key={i} style={{ background: '#131820', border: '1px solid #1E2A3E', borderRadius: '8px', padding: '9px 13px', marginBottom: '7px', fontSize: '14px', color: '#E2E8F0', lineHeight: '1.5' }}>{clean}</div>
      }
      if (clean.trim()) {
        return <p key={i} style={{ color: '#94A3B8', fontSize: '14px', lineHeight: '1.6', margin: '4px 0' }}>{clean}</p>
      }
      return null
    })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
          <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>Marketing Brain Soch Raha Hai...</h2>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Strategy + Competitor + Ad Intel — teeno ban rahe hain</p>
          <p style={{ color: '#6366F1', fontSize: '13px', marginTop: '8px' }}>1-2 minute lagenge ☕ (3 cheezein ek saath)</p>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
        <div style={{ background: '#0D1117', borderBottom: '1px solid #1E2A3E', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '700', fontSize: '15px' }}>🧠 Marketing Brain</span>
          <button onClick={() => setResult(null)} style={{ background: 'transparent', border: '1px solid #1E2A3E', color: '#64748B', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>← Naya Report</button>
        </div>

        <div style={{ maxWidth: '800px', margin: '32px auto', padding: '0 24px' }}>
          <div style={{ background: '#10B98115', border: '1px solid #10B98140', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
            <p style={{ margin: 0, fontWeight: '600', color: '#10B981' }}>✅ Complete Marketing Report Taiyaar!</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>{result.url} — strategy, competitor & ad intelligence</p>
          </div>

          {/* SECTION 1 — Strategy */}
          <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', padding: '26px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: '#818CF8' }}>📊 1. Marketing Strategy</h2>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: 0, marginBottom: '16px' }}>Targeting, budget, headlines, ad copy</p>
            {renderBlock(result.strategy)}
          </div>

          {/* SECTION 2 — Competitor */}
          {result.competitor && (
            <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', padding: '26px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: '#818CF8' }}>🔍 2. Competitor Analysis</h2>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: 0, marginBottom: '16px' }}>Positioning, gaps, jeet ke mauke</p>
              {renderBlock(result.competitor)}
            </div>
          )}

          {/* SECTION 3 — Ad Intel */}
          <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', padding: '26px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: '#818CF8' }}>📡 3. Ad Intelligence</h2>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: 0, marginBottom: '16px' }}>Competitor ke live ads + guide</p>

            <a href={result.meta_ad_library_link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#1877F2', color: '#fff', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '13px', textAlign: 'center', marginBottom: '10px' }}>
              📘 Facebook & Instagram Live Ads →
            </a>
            <a href={result.google_ads_link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#34A853', color: '#fff', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '13px', textAlign: 'center', marginBottom: '18px' }}>
              🔍 Google Ads Transparency →
            </a>

            {renderBlock(result.ad_guide)}
          </div>

          {/* SECTION 4 — Smart Creative */}
          {result.smart_creative && (
            <div style={{ background: 'linear-gradient(135deg, #1a1030 0%, #0D1117 100%)', border: '1px solid #6366F1', borderRadius: '16px', padding: '26px', marginTop: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: '#A78BFA' }}>✨ 4. Smart Ad Creative</h2>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: 0, marginBottom: '16px' }}>Competitor se ALAG — market gap pe based, ready-to-use ad</p>
              {renderBlock(result.smart_creative)}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      <div style={{ background: '#0D1117', borderBottom: '1px solid #1E2A3E', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: '700', fontSize: '15px' }}>🧠 Marketing Brain</span>
      </div>

      <div style={{ maxWidth: '560px', margin: '40px auto', padding: '0 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0' }}>🧠 AI Marketing Brain</h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Ek baar daalo — Strategy + Competitor + Ad Intel, teeno ek saath</p>
        </div>

        <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', padding: '28px' }}>
          {error && (
            <div style={{ background: '#F43F5E15', border: '1px solid #F43F5E40', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '13px' }}>⚠️ {error}</div>
          )}

          <p style={{ fontSize: '11px', color: '#6366F1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px 0' }}>Aapka Business</p>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Budget (₹/month)</label>
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="50000" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: goal ? '#fff' : '#64748B', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}>
                <option value="">Select...</option>
                <option value="Lead Generation">Lead Generation</option>
                <option value="Sales / Revenue">Sales / Revenue</option>
                <option value="Brand Awareness">Brand Awareness</option>
                <option value="Website Traffic">Website Traffic</option>
                <option value="WhatsApp Inquiries">WhatsApp Inquiries</option>
              </select>
            </div>
          </div>

          <p style={{ fontSize: '11px', color: '#6366F1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 14px 0' }}>Competitor (Optional)</p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Competitor ka Naam</label>
            <input type="text" value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="e.g. Mamaearth" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Competitor ki Website</label>
            <input type="text" value={compWebsite} onChange={(e) => setCompWebsite(e.target.value)} placeholder="e.g. mamaearth.in" style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <button onClick={handleRun} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#6366F1', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            🧠 Full Marketing Report Banao
          </button>
        </div>
      </div>
    </div>
  )
}

export default MarketingBrain