import { useState } from 'react'

function UrlInput() {
  const [unlocked, setUnlocked] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [url, setUrl] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [budget, setBudget] = useState('')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleAnalyze() {
    if (!url || !businessType || !budget || !goal) {
      alert('Sabhi fields bharo pehle!')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch('https://ai-ad-backend-zhpj.onrender.com/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url,
          business_type: businessType,
          budget: parseInt(budget),
          goal: goal
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

  // Password Screen
  if (!unlocked) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080B12',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{
          background: '#0D1117',
          border: '1px solid #1E2A3E',
          borderRadius: '16px',
          padding: '40px',
          width: '340px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '40px', margin: '0 0 16px 0' }}>🔐</p>
          <h2 style={{ color: '#fff', fontSize: '18px', margin: '0 0 8px 0' }}>
            AI Ad Manager
          </h2>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 24px 0' }}>
            Access code daalo
          </p>
          <input
            type="password"
            value={accessCode}
            onChange={e => setAccessCode(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (accessCode === 'sohscape') {
                  setUnlocked(true)
                } else {
                  alert('Wrong access code!')
                }
              }
            }}
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '8px',
              border: '1px solid #1E2A3E',
              background: '#131820',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box',
              outline: 'none',
              marginBottom: '12px',
            }}
          />
          <button
            onClick={() => {
              if (accessCode === 'sohscape2024') {
                setUnlocked(true)
              } else {
                alert('Wrong access code!')
              }
            }}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              border: 'none',
              background: '#6366F1',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            🔓 Unlock
          </button>
        </div>
      </div>
    )
  }

  // Loading Screen
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080B12',
        fontFamily: 'system-ui, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>
            AI Analysis Ho Rahi Hai...
          </h2>
          <p style={{ color: '#64748B', fontSize: '14px' }}>
            Website crawl ho rahi hai, headlines generate ho rahi hain...
          </p>
          <p style={{ color: '#6366F1', fontSize: '13px', marginTop: '8px' }}>
            30-60 second lagenge ☕
          </p>
        </div>
      </div>
    )
  }

  // Result Screen
  if (result) {
    const lines = result.analysis.split('\n')
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080B12',
        fontFamily: 'system-ui, sans-serif',
        color: '#fff',
      }}>
        <div style={{
          background: '#0D1117',
          borderBottom: '1px solid #1E2A3E',
          padding: '0 24px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: '700', fontSize: '15px' }}>✦ AI Ad Manager</span>
          <button
            onClick={() => setResult(null)}
            style={{
              background: 'transparent',
              border: '1px solid #1E2A3E',
              color: '#64748B',
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            ← Naya Analysis
          </button>
        </div>

        <div style={{ maxWidth: '800px', margin: '32px auto', padding: '0 24px' }}>
          <div style={{
            background: '#10B98115',
            border: '1px solid #10B98140',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <div>
              <p style={{ margin: '0 0 2px 0', fontWeight: '600', color: '#10B981' }}>
                AI Analysis Complete!
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                {result.url} ka analysis taiyaar hai
              </p>
            </div>
          </div>

          <div style={{
            background: '#0D1117',
            border: '1px solid #1E2A3E',
            borderRadius: '16px',
            padding: '28px',
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', color: '#818CF8' }}>
              🤖 AI Generated Report
            </h2>
            {lines.map((line, index) => {
              if (line.match(/^[A-Z\s]+:$/) || line.match(/^[A-Z\s()]+:$/)) {
                return (
                  <h3 key={index} style={{
                    color: '#6366F1',
                    fontSize: '13px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginTop: '24px',
                    marginBottom: '10px',
                    paddingBottom: '6px',
                    borderBottom: '1px solid #1E2A3E',
                  }}>
                    {line}
                  </h3>
                )
              }
              if (line.match(/^\d+\./)) {
                return (
                  <div key={index} style={{
                    background: '#131820',
                    border: '1px solid #1E2A3E',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '8px',
                    fontSize: '14px',
                    color: '#E2E8F0',
                    lineHeight: '1.5',
                  }}>
                    {line}
                  </div>
                )
              }
              if (line.trim()) {
                return (
                  <p key={index} style={{
                    color: '#94A3B8',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    margin: '4px 0',
                  }}>
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

  // Main Form
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080B12',
      fontFamily: 'system-ui, sans-serif',
      color: '#fff',
    }}>
      <div style={{
        background: '#0D1117',
        borderBottom: '1px solid #1E2A3E',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: '700', fontSize: '15px' }}>✦ AI Ad Manager</span>
        <span style={{
          background: '#6366F1',
          borderRadius: '20px',
          padding: '4px 14px',
          fontSize: '12px',
          fontWeight: '600',
        }}>
          Krish — Pro Plan
        </span>
      </div>

      <div style={{ maxWidth: '560px', margin: '48px auto', padding: '0 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0' }}>
            🌐 Business Analyzer
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            Apni website URL daalo — AI real strategy banayega
          </p>
        </div>

        <div style={{
          background: '#0D1117',
          border: '1px solid #1E2A3E',
          borderRadius: '16px',
          padding: '28px',
        }}>
          {error && (
            <div style={{
              background: '#F43F5E15',
              border: '1px solid #F43F5E40',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#F43F5E',
              fontSize: '13px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Website URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://aapkibusiness.com"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Business Type
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: businessType ? '#fff' : '#64748B', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
            >
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Monthly Ad Budget (₹)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="10000"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #1E2A3E', background: '#131820', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'monospace' }}
            />
            {budget && (
              <p style={{ color: '#64748B', fontSize: '12px', margin: '6px 0 0 0' }}>
                Daily budget: ₹{Math.round(parseInt(budget) / 30).toLocaleString()}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Marketing Goal
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {['Lead Generation', 'Website Traffic', 'Brand Awareness', 'WhatsApp Inquiries', 'Sales / Revenue', 'App Downloads'].map((g) => (
                <div
                  key={g}
                  onClick={() => setGoal(g)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${goal === g ? '#6366F1' : '#1E2A3E'}`,
                    background: goal === g ? '#6366F115' : '#131820',
                    color: goal === g ? '#818CF8' : '#64748B',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: goal === g ? '600' : '400',
                  }}
                >
                  {g}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              border: 'none',
              background: '#6366F1',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            🤖 AI Analysis Shuru Karo
          </button>
        </div>
      </div>
    </div>
  )
}

export default UrlInput