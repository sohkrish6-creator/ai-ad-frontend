import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Send, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react'
import { useToast } from './ToastContext'
import { ProspectCard } from './ProspectDiscovery'
import { GoogleCampaignSuccessCard } from './PushToAdsSection'
import { extractInsights } from './SmartAnalysis'
import { TrustBadge, ValidationWarningBanner } from './TrustLayer'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const GOLD    = '#D4AF37'

const card = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }

const EXAMPLE_CHIPS = [
  'Find hotels in Jaipur',
  'Audit my website: [url]',
  'Launch ₹10000 campaign for [url]',
]

const INTENT_LABELS = {
  full_report: 'Marketing Brain', prospect_discovery: 'Prospect Discovery', campaign_launch_kit: 'Campaign Launch Kit',
  ai_optimizer: 'AI Optimizer', opportunity_engine: 'Opportunity Engine', kpi_engine: 'KPI Engine',
  outreach_ai: 'Outreach AI', website_intelligence: 'Website Intelligence', offer_intelligence: 'Offer Intelligence',
  autonomous_marketing: 'Autonomous Marketing', full_campaign_launch: 'Full Campaign Launch', unknown: 'Unknown',
}

// Prospect Discovery's result shape nests hot/warm/cold buckets — flatten a
// small top slice for this session-feed card rather than reusing the full
// tabbed page (that page is one click away via "View Full Report").
function prospectsFromResult(result) {
  const d = result?.data || {}
  if (Array.isArray(d.prospects) && d.prospects.length) return d.prospects
  return [...(d.hot_prospects || []), ...(d.warm_prospects || []), ...(d.cold_prospects || [])]
}

function CommandResultCard({ item, navigate }) {
  const { text, status, data, timestamp } = item

  return (
    <div style={{ ...card, padding: '18px 20px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#171717', lineHeight: 1.5 }}>"{text}"</p>
        <span style={{ fontSize: '11px', color: '#BBB', flexShrink: 0, whiteSpace: 'nowrap' }}>{timestamp}</span>
      </div>

      {status === 'loading' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: GOLD, animation: 'pulse 1s ease-in-out infinite alternate' }} />
          <p style={{ margin: 0, fontSize: '13px', color: GOLD, fontWeight: '600' }}>Thinking...</p>
        </div>
      )}

      {status === 'error' && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', color: '#BE123C', fontSize: '13px' }}>
          {data?.error || 'Something went wrong.'}
        </div>
      )}

      {status === 'done' && data && data.success === false && (
        <div>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '7px', padding: '11px 14px', marginBottom: data.available_commands ? '10px' : 0, display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
            <AlertTriangle size={14} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#92400E', lineHeight: 1.5 }}>{data.error}</p>
          </div>
          {data.available_commands && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {data.available_commands.map((c, i) => (
                <span key={i} style={{ fontSize: '11.5px', color: '#666', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '20px', padding: '4px 11px' }}>{c}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {status === 'done' && data && data.success === true && (
        <div>
          {data.reasoning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
              <Sparkles size={13} color={GOLD} />
              <p style={{ margin: 0, fontSize: '12.5px', color: '#888' }}>
                Understood: <strong style={{ color: '#171717' }}>{INTENT_LABELS[data.intent] || data.intent}</strong> — {data.reasoning}
              </p>
            </div>
          )}

          {data.intent === 'prospect_discovery' && (() => {
            const list = prospectsFromResult(data.result).slice(0, 5)
            return list.length > 0 ? (
              <div>
                {list.map(p => <ProspectCard key={p.rank || p.name} p={p} isMobile={false} industry={data.params_used?.industry} city={data.params_used?.city} />)}
                <button
                  onClick={() => { try { localStorage.setItem('adsoh_prospect_result', JSON.stringify(data.result)) } catch {}; navigate('/prospects') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: GOLD, fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                >
                  View Full Report <ArrowRight size={12} />
                </button>
              </div>
            ) : <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>No prospects found.</p>
          })()}

          {data.intent === 'full_campaign_launch' && (() => {
            const brain = data.result?.brain_result
            const gads  = data.result?.gads_result
            return (
              <div>
                {brain?.trust_verdict && <TrustBadge verdict={brain.trust_verdict} basedOn={brain.based_on} />}
                {brain?.validation_warning && <ValidationWarningBanner message={brain.validation_warning} />}
                {gads?.success ? (
                  <GoogleCampaignSuccessCard result={gads} />
                ) : (
                  <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '12px 14px', color: '#BE123C', fontSize: '13px' }}>
                    {gads?.error || (Array.isArray(gads?.errors) ? gads.errors.map(e => e.message).join('; ') : 'Campaign creation failed — see backend logs.')}
                  </div>
                )}
              </div>
            )
          })()}

          {!['prospect_discovery', 'full_campaign_launch'].includes(data.intent) && (() => {
            const insights = extractInsights(data.result, 4)
            return insights.length > 0 ? (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {insights.map((ins, i) => (
                  <li key={i} style={{ fontSize: '13px', color: '#444', lineHeight: 1.6, marginBottom: i < insights.length - 1 ? '5px' : 0, paddingLeft: '14px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: GOLD }}>•</span> {ins}
                  </li>
                ))}
              </ul>
            ) : <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>Done — no summary text available.</p>
          })()}
        </div>
      )}
    </div>
  )
}

export default function CommandCenter() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const toast = useToast()
  const navigate = useNavigate()

  const [text, setText]         = useState('')
  const [feed, setFeed]         = useState([])
  const [asking, setAsking]     = useState(false)
  const pendingContext = useRef(null) // carries url/industry/city/budget/goal forward across a "missing param" reply

  async function handleAsk() {
    const trimmed = text.trim()
    if (!trimmed || asking) return

    const id = Date.now()
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    setFeed(f => [{ id, text: trimmed, status: 'loading', data: null, timestamp }, ...f])
    setText('')
    setAsking(true)

    const ctx = pendingContext.current || {}
    try {
      const res = await fetch(`${BACKEND}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          url: ctx.url || '', industry: ctx.industry || '', city: ctx.city || '',
          budget: ctx.budget || 0, goal: ctx.goal || '',
        }),
      })
      const data = await res.json()
      pendingContext.current = (data.success === false && data.params_used) ? data.params_used : null
      setFeed(f => f.map(item => item.id === id ? { ...item, status: 'done', data } : item))
      if (data.success) toast.success('Done!')
      else toast.error(data.error || 'Could not complete that.')
    } catch (e) {
      pendingContext.current = null
      setFeed(f => f.map(item => item.id === id ? { ...item, status: 'error', data: { error: `Backend se connect nahi ho paya: ${e.message}` } } : item))
      toast.error('Backend se connect nahi ho paya.')
    }
    setAsking(false)
  }

  function handleChipClick(chip) {
    setText(chip)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk() }
  }

  const page = {
    minHeight: '100vh', background: '#FAFAFA',
    padding: isMobile ? '28px 16px' : '40px 36px',
    maxWidth: '820px', width: '100%', boxSizing: 'border-box',
    fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
  }

  return (
    <div style={page}>
      <style>{`@keyframes pulse { from { opacity: 0.4; } to { opacity: 1; } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <MessageSquare size={20} color={GOLD} />
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.4px' }}>Command Center</h1>
      </div>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 24px' }}>
        Tell it what you need in plain language — it figures out which engine to run.
      </p>

      <div style={{ ...card, padding: isMobile ? '16px' : '20px', marginBottom: '14px' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell me what you need... e.g. 'Skyweds ke liye sohscape.com hai, iska Google ad chalana hai budget 10000'"
          rows={3}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E5E5E5',
            background: '#FAFAFA', color: '#171717', fontSize: '14px', boxSizing: 'border-box',
            outline: 'none', fontFamily: 'inherit', resize: 'vertical', marginBottom: '10px',
          }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {EXAMPLE_CHIPS.map((chip, i) => (
            <button
              key={i} onClick={() => handleChipClick(chip)}
              style={{ fontSize: '11.5px', color: '#666', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '20px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {chip}
            </button>
          ))}
        </div>
        <button
          onClick={handleAsk} disabled={asking || !text.trim()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
            padding: '12px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '700',
            cursor: (asking || !text.trim()) ? 'not-allowed' : 'pointer',
            background: (asking || !text.trim()) ? '#E5C158' : GOLD, color: '#171717',
          }}
        >
          <Send size={14} /> {asking ? 'Asking...' : 'Ask'}
        </button>
      </div>

      {feed.length > 0 && (
        <div>
          {feed.map(item => <CommandResultCard key={item.id} item={item} navigate={navigate} />)}
        </div>
      )}
    </div>
  )
}
