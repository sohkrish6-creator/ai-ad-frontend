import { useState, useEffect } from 'react'
import CityInput, { getLastCity } from './CityInput'

const LS_KEY_YT = 'adsoh_youtube_result'
import { Copy, Check, Video, ExternalLink } from 'lucide-react'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'



const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

const INDUSTRIES = [
  'Hospitality (Hotels, Restaurants, Cafes)', 'Schools & Education', 'Healthcare & Clinics',
  'Real Estate', 'Retail & Fashion', 'Food & Beverage', 'Wellness & Fitness', 'Wedding & Events',
  'Auto & Transport', 'Professional Services', 'Coaching & Tutoring', 'Jewellery & Accessories',
  'Interior Design & Architecture', 'Photography & Videography', 'Legal & CA Services',
  'IT & Software Companies', 'Travel & Tourism', 'Salon & Beauty', 'Gym & Sports Academy',
  'NGO & Social Enterprise', 'Agriculture & Dairy', 'Logistics & Transport', 'Printing & Packaging',
  'Construction & Builders', 'Media & Entertainment', 'Other',
]

function CopyBtn({ text, label = '' }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handle} style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      background: copied ? '#16A34A' : '#F5F5F5',
      border: '1px solid ' + (copied ? '#16A34A' : '#E5E5E5'),
      color: copied ? '#fff' : '#666',
      padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', flexShrink: 0,
    }}>
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied!' : (label || 'Copy')}
    </button>
  )
}

function Shimmer({ h = '14px', w = '100%' }) {
  return <div style={{ height: h, width: w, borderRadius: '4px', background: 'linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.2s ease-in-out infinite' }} />
}

function formatViews(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}

function renderLines(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    const t = line.trim()
    if (!t) return <div key={i} style={{ height: '6px' }} />
    return <p key={i} style={{ margin: '0 0 6px', fontSize: '13.5px', lineHeight: '1.65', color: '#2a2a2a' }}>{t}</p>
  })
}

export default function YouTube() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [industry, setIndustry]   = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [city, setCity]           = useState(getLastCity)
  const [topic, setTopic]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [result, setResult]       = useState(null)
  const [fromCache, setFromCache] = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY_YT); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  const resolvedIndustry = industry === 'Other' ? industryOther : industry


  async function handleGenerate() {
    if (!resolvedIndustry) { setError('Industry select karo!'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const res = await fetch(`${BACKEND}/youtube-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: resolvedIndustry, city, topic }),
      })
      const data = await res.json()
      if (data.success) { setResult(data); localStorage.setItem(LS_KEY_YT, JSON.stringify(data)); setFromCache(false) }
      else setError(data.error || 'Kuch toh gadbad hai, dobara try karo.')
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  return (
    <PageShell maxWidth="820px">
      <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>

      <PageHeader title="YouTube Intelligence" sub="Real top videos → content ideas, viral hooks, competitor patterns — sab ek saath" />

      {/* Input card */}
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '28px', marginBottom: '16px' }}>

          {error && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: RED, fontSize: '13px' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={lbl}>Industry *</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inputSt, color: industry ? '#171717' : '#999' }}>
                <option value="">— Select industry —</option>
                {INDUSTRIES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Target City</label>
              <CityInput value={city} onChange={setCity} style={inputSt} />
            </div>
          </div>

          {industry === 'Other' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={lbl}>Specify Industry</label>
              <input type="text" value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="e.g. Interior Designers" style={inputSt} />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={lbl}>Topic Focus <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Reels ideas, client testimonials, behind the scenes" style={inputSt} />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              justifyContent: 'center', background: loading ? '#E5E5E5' : '#FF0000',
              border: 'none', color: loading ? '#999' : '#fff',
              padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <Video size={16} />
            {loading ? 'Fetching YouTube data...' : 'Generate YouTube Intelligence'}
          </button>
        </div>
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div style={{ maxWidth: '600px', width: '100%' }}>
          {['Searching top YouTube videos...', 'Fetching view counts & stats...', 'Generating content ideas & hooks...'].map((label, i) => (
            <div key={label} style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '12px', color: '#FF4444', fontWeight: '700' }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: BONE, margin: '0 0 6px' }}>{label}</p>
                <Shimmer h="9px" w="60%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {fromCache && result && !loading && (
        <div style={{ maxWidth: '600px', width: '100%', background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '9px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Showing previous result · Generate new report to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY_YT); setResult(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: MUTED, textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}

      {result && (
        <div style={{ maxWidth: '760px', width: '100%' }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0 20px' }}>
            <Video size={18} color="#FF0000" />
            <h2 style={{ fontSize: '17px', fontWeight: '600', margin: 0, letterSpacing: '-0.3px' }}>
              YouTube Intelligence — {result.query}
            </h2>
          </div>

          {/* 1. Top Videos */}
          <div style={{ ...card, padding: '24px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF0000' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Top Performing Videos</h3>
              <span style={{ fontSize: '12px', color: MUTED, marginLeft: '4px' }}>Real data from YouTube</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.top_videos.map((v, i) => (
                <a
                  key={v.videoId}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '8px', background: INK,
                    border: '1px solid #F0F0F0', cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: i < 3 ? '#FF000015' : '#F5F5F5',
                      border: `1px solid ${i < 3 ? '#FF000030' : '#EAEAEA'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: i < 3 ? '#FF0000' : '#999' }}>#{i + 1}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: BONE, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.title}
                      </p>
                      <p style={{ fontSize: '11px', color: MUTED, margin: 0 }}>{v.channel} · {v.publishedAt}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: v.views > 500000 ? '#16A34A' : '#171717', margin: '0 0 2px' }}>
                        {formatViews(v.views)}
                      </p>
                      <p style={{ fontSize: '10px', color: MUTED, margin: 0 }}>views</p>
                    </div>
                    <ExternalLink size={13} color="#CCC" style={{ flexShrink: 0 }} />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* 2. Content Ideas */}
          <div style={{ ...card, padding: '24px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 3px' }}>Trending Content Ideas</h3>
                <p style={{ fontSize: '12px', color: MUTED, margin: 0 }}>8 ideas based on what's actually working in this niche</p>
              </div>
              <CopyBtn text={result.content_ideas} />
            </div>
            <div>{renderLines(result.content_ideas)}</div>
          </div>

          {/* 3. Viral Hooks */}
          <div style={{ ...card, padding: '24px', marginBottom: '12px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 3px' }}>Viral Hooks & Titles</h3>
              <p style={{ fontSize: '12px', color: MUTED, margin: 0 }}>Ready-to-use — paste as YouTube title or Reel opening line</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.viral_hooks
                .split('\n')
                .map(l => l.trim())
                .filter(l => l && /^\d+\./.test(l))
                .map((hook, i) => {
                  const text = hook.replace(/^\d+\.\s*/, '').trim()
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                      padding: '11px 14px', background: INK, borderRadius: '7px',
                      border: '1px solid #F0F0F0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD, flexShrink: 0, minWidth: '18px' }}>{i + 1}</span>
                        <p style={{ margin: 0, fontSize: '13px', color: BONE, lineHeight: '1.4' }}>{text}</p>
                      </div>
                      <CopyBtn text={text} />
                    </div>
                  )
                })
              }
              {/* fallback if no numbered lines */}
              {!result.viral_hooks.match(/^\d+\./m) && (
                <div style={{ padding: '4px 0' }}>{renderLines(result.viral_hooks)}</div>
              )}
            </div>
          </div>

          {/* 4. Competitor Insights */}
          <div style={{ ...card, padding: '24px', marginBottom: '12px', borderColor: '#E5DABB', background: '#FFFDF5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 3px', color: GOLD }}>Competitor Insights</h3>
                <p style={{ fontSize: '12px', color: MUTED, margin: 0 }}>Patterns, formats, topics driving views — and what to do about it</p>
              </div>
              <CopyBtn text={result.competitor_insights} />
            </div>
            <div>{renderLines(result.competitor_insights)}</div>
          </div>

        </div>
      )}
    </PageShell>
  )
}
