import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Send, Sparkles, AlertTriangle, ArrowRight, Copy, Check, Search, Clapperboard, ChevronDown, ChevronUp } from 'lucide-react'
import { useToast } from './ToastContext'
import { ProspectCard } from './ProspectDiscovery'
import { GoogleCampaignSuccessCard } from './PushToAdsSection'
import { extractInsights } from './SmartAnalysis'
import { TrustBadge, ValidationWarningBanner } from './TrustLayer'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'


const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'


const EXAMPLE_CHIPS = [
  'Find hotels in Jaipur',
  'Launch a ₹10,000 Google Ads campaign for [website URL]',
  'Audit my website: [URL]',
  "What's trending in [industry] marketing right now",
  'Generate hashtags for [Instagram handle]',
]

const INTENT_LABELS = {
  full_report: 'Marketing Brain', prospect_discovery: 'Prospect Discovery', campaign_launch_kit: 'Campaign Launch Kit',
  ai_optimizer: 'AI Optimizer', opportunity_engine: 'Opportunity Engine', kpi_engine: 'KPI Engine',
  outreach_ai: 'Outreach AI', website_intelligence: 'Website Intelligence', offer_intelligence: 'Offer Intelligence',
  autonomous_marketing: 'Autonomous Marketing', full_campaign_launch: 'Full Campaign Launch (Google)',
  trend_research: 'Trend Research', hashtag_generation: 'Hashtags & Captions', ad_script_writing: 'Ad Script Writing',
  market_query: 'Market Research', creative_generation: 'Creative Generation', competitor_ad_finder: 'Competitor Ad Finder',
  weekly_report: 'Weekly Report', meta_campaign_launch: 'Full Campaign Launch (Meta)', unknown: 'Unknown',
}

// Live step status -> icon glyph + color, shared by the Live Tasks Panel.
const STEP_STATUS_STYLE = {
  pending: { glyph: '○', color: MUTED },
  running: { glyph: '◐', color: GOLD },
  done:    { glyph: '✓', color: GREEN },
  error:   { glyph: '✕', color: '#DC2626' },
}

// Right-side (desktop) / inline (mobile) panel shown only while a
// multi-step intent (full_report, full_campaign_launch, meta_campaign_launch,
// autonomous_marketing) is actually running in the background — each row
// reflects a REAL backend phase completing, polled from
// GET /command/status/{task_id}, never a simulated progress bar. Collapsed
// by default; click a completed/running step with detail to expand it.
function TaskPanel({ task }) {
  const [expanded, setExpanded] = useState({})
  if (!task) return null
  return (
    <div style={{ ...card, padding: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
        <div style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: task.status === 'error' ? '#DC2626' : GOLD,
          animation: task.status === 'running' ? 'pulse 1s ease-in-out infinite alternate' : 'none',
          flexShrink: 0,
        }} />
        <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '700', color: BONE }}>{INTENT_LABELS[task.intent] || task.intent}</p>
      </div>
      <p style={{ margin: '2px 0 12px', fontSize: '11px', color: MUTED }}>"{task.text}"</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {(task.steps || []).map(step => {
          const isOpen = !!expanded[step.key]
          const st = STEP_STATUS_STYLE[step.status] || STEP_STATUS_STYLE.pending
          const hasDetail = step.detail != null
          return (
            <div key={step.key}>
              <div
                onClick={() => hasDetail && setExpanded(e => ({ ...e, [step.key]: !e[step.key] }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', borderRadius: '6px',
                  cursor: hasDetail ? 'pointer' : 'default',
                  background: step.status === 'running' ? '#FFFDF5' : 'transparent',
                }}
              >
                <span style={{ color: st.color, fontWeight: '700', fontSize: '12px', width: '13px', textAlign: 'center', flexShrink: 0 }}>{st.glyph}</span>
                <span style={{ fontSize: '12px', color: step.status === 'pending' ? '#BBB' : '#171717', flex: 1, lineHeight: 1.4 }}>{step.label}</span>
                {hasDetail && (isOpen ? <ChevronUp size={12} color="#BBB" /> : <ChevronDown size={12} color="#BBB" />)}
              </div>
              {isOpen && hasDetail && (
                <div style={{ margin: '4px 0 6px 29px', padding: '8px 10px', background: INK, border: '1px solid #EEE', borderRadius: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: '10.5px', color: MUTED, lineHeight: 1.5 }}>
                    {typeof step.detail === 'string' ? step.detail : JSON.stringify(step.detail, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CopyBtn({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const toast = useToast()
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text || ''); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
        background: copied ? '#16A34A' : '#F5F5F5', border: '1px solid ' + (copied ? '#16A34A' : '#E5E5E5'),
        color: copied ? '#fff' : '#666', padding: '4px 10px', borderRadius: '6px',
        fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

function Tag({ children, color = '#666', bg = '#F5F5F5', border = '#E5E5E5' }) {
  return <span style={{ fontSize: '11.5px', color, background: bg, border: `1px solid ${border}`, borderRadius: '20px', padding: '4px 11px', display: 'inline-block' }}>{children}</span>
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
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: BONE, lineHeight: 1.5 }}>"{text}"</p>
        <span style={{ fontSize: '11px', color: MUTED, flexShrink: 0, whiteSpace: 'nowrap' }}>{timestamp}</span>
      </div>

      {status === 'loading' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: GOLD, animation: 'pulse 1s ease-in-out infinite alternate' }} />
          <p style={{ margin: 0, fontSize: '13px', color: GOLD, fontWeight: '600' }}>Thinking...</p>
        </div>
      )}

      {status === 'error' && (
        <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', color: RED, fontSize: '13px' }}>
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
                <span key={i} style={{ fontSize: '11.5px', color: MUTED, background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '20px', padding: '4px 11px' }}>{c}</span>
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
              <p style={{ margin: 0, fontSize: '12.5px', color: MUTED }}>
                Understood: <strong style={{ color: BONE }}>{INTENT_LABELS[data.intent] || data.intent}</strong> — {data.reasoning}
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
            ) : <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>No prospects found.</p>
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
                  <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '12px 14px', color: RED, fontSize: '13px' }}>
                    {gads?.error || (Array.isArray(gads?.errors) ? gads.errors.map(e => e.message).join('; ') : 'Campaign creation failed — see backend logs.')}
                  </div>
                )}
              </div>
            )
          })()}

          {data.intent === 'meta_campaign_launch' && (() => {
            const brain = data.result?.brain_result
            const meta  = data.result?.meta_result
            return (
              <div>
                {brain?.trust_verdict && <TrustBadge verdict={brain.trust_verdict} basedOn={brain.based_on} />}
                {brain?.validation_warning && <ValidationWarningBanner message={brain.validation_warning} />}
                {meta?.success ? (
                  <div style={{ background: 'rgba(63,166,107,0.1)', border: '1px solid #BBF7D0', borderRadius: '7px', padding: '14px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '700', color: '#166534' }}>✅ Meta Campaign Created — Status: PAUSED</p>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#166534' }}>Campaign ID: {meta.campaign_id} · Ad Set ID: {meta.adset_id}</p>
                    {meta.action_needed && <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#166534' }}>{meta.message}</p>}
                    {meta.meta_ads_manager_link && (
                      <a href={meta.meta_ads_manager_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1877F2', color: '#fff', padding: '8px 16px', borderRadius: '7px', fontSize: '12.5px', fontWeight: '600', textDecoration: 'none' }}>
                        <ArrowRight size={12} /> Open in Meta Ads Manager
                      </a>
                    )}
                  </div>
                ) : (
                  <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '12px 14px', color: RED, fontSize: '13px' }}>
                    {meta?.error || 'Campaign creation failed — see backend logs.'}
                  </div>
                )}
              </div>
            )
          })()}

          {(data.intent === 'trend_research' || data.intent === 'market_query') && (() => {
            const r = data.result || {}
            if (!r.success) {
              return (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '7px', padding: '11px 14px', color: '#92400E', fontSize: '13px' }}>
                  {r.error}
                </div>
              )
            }
            return (
              <div>
                {data.intent === 'trend_research' ? (
                  <>
                    {(r.trending_themes || []).length > 0 && (
                      <div style={{ marginBottom: '10px' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trending Themes</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {r.trending_themes.map((t, i) => <Tag key={i}>{t}</Tag>)}
                        </div>
                      </div>
                    )}
                    {(r.trending_formats || []).length > 0 && (
                      <div style={{ marginBottom: '10px' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trending Formats</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {r.trending_formats.map((t, i) => <Tag key={i} color="#8A6D1D" bg="#FDF8EE" border="#E5DABB">{t}</Tag>)}
                        </div>
                      </div>
                    )}
                    {(r.example_angles || []).length > 0 && (
                      <div style={{ marginBottom: '10px' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Real Example Angles</p>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {r.example_angles.map((a, i) => (
                            <li key={i} style={{ fontSize: '13px', color: '#444', lineHeight: 1.6, marginBottom: '4px', paddingLeft: '14px', position: 'relative' }}>
                              <span style={{ position: 'absolute', left: 0, color: GOLD }}>•</span> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {r.how_to_adapt && (
                      <div style={{ background: '#F9FAFB', border: '1px solid #F0F0F0', borderRadius: '7px', padding: '10px 13px', marginBottom: '10px' }}>
                        <p style={{ margin: '0 0 3px', fontSize: '10.5px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>How to Adapt</p>
                        <p style={{ margin: 0, fontSize: '13px', color: BONE, lineHeight: 1.6 }}>{r.how_to_adapt}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {r.answer && <p style={{ margin: '0 0 10px', fontSize: '13.5px', color: BONE, lineHeight: 1.6 }}>{r.answer}</p>}
                    {(r.key_findings || []).length > 0 && (
                      <ul style={{ margin: '0 0 10px', padding: 0, listStyle: 'none' }}>
                        {r.key_findings.map((f, i) => (
                          <li key={i} style={{ fontSize: '13px', color: '#444', lineHeight: 1.6, marginBottom: '4px', paddingLeft: '14px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, color: GOLD }}>•</span> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
                {r.based_on && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                    <Search size={11} color="#999" />
                    <p style={{ margin: 0, fontSize: '11px', color: MUTED, fontStyle: 'italic' }}>{r.based_on}</p>
                  </div>
                )}
              </div>
            )
          })()}

          {data.intent === 'hashtag_generation' && (() => {
            const r = data.result || {}
            const buckets = [
              { key: 'broad', label: 'Broad' }, { key: 'niche', label: 'Niche' }, { key: 'local', label: 'Local' },
            ]
            const allHashtags = ['broad', 'niche', 'local'].flatMap(k => r.hashtags?.[k] || [])
            return (
              <div>
                {!r.grounded_in_business_data && r.note && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '7px', padding: '9px 13px', marginBottom: '12px', fontSize: '12px', color: '#92400E' }}>
                    {r.note}
                  </div>
                )}
                {buckets.map(({ key, label }) => (r.hashtags?.[key] || []).length > 0 && (
                  <div key={key} style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {r.hashtags[key].map((h, i) => <Tag key={i} color="#6366F1" bg="#EEF2FF" border="#C7D2FE">{h.startsWith('#') ? h : `#${h}`}</Tag>)}
                    </div>
                  </div>
                ))}
                {allHashtags.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <CopyBtn text={allHashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')} label="Copy All Hashtags" />
                  </div>
                )}
                {(r.captions || []).length > 0 && (
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Caption Ideas</p>
                    {r.captions.map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', background: INK, border: '1px solid #EEE', borderRadius: '7px', padding: '9px 12px', marginBottom: '6px' }}>
                        <p style={{ margin: 0, fontSize: '12.5px', color: BONE, lineHeight: 1.55 }}>{c}</p>
                        <CopyBtn text={c} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          {data.intent === 'ad_script_writing' && (() => {
            const r = data.result || {}
            const fullScript = [r.hook && `HOOK: ${r.hook}`, ...(r.body || []).map((b, i) => `BEAT ${i + 1}: ${b}`), r.cta && `CTA: ${r.cta}`].filter(Boolean).join('\n\n')
            return (
              <div>
                {!r.grounded_in_business_data && r.note && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '7px', padding: '9px 13px', marginBottom: '12px', fontSize: '12px', color: '#92400E' }}>
                    {r.note}
                  </div>
                )}
                <div style={{ background: INK, border: '1px solid #EEE', borderRadius: '7px', padding: '14px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Clapperboard size={14} color={GOLD} />
                      {r.format_suggestion && <span style={{ fontSize: '11.5px', color: MUTED }}>{r.format_suggestion}</span>}
                    </div>
                    <CopyBtn text={fullScript} label="Copy Script" />
                  </div>
                  {r.hook && (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ margin: '0 0 3px', fontSize: '10px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hook</p>
                      <p style={{ margin: 0, fontSize: '13.5px', color: BONE, fontWeight: '600', lineHeight: 1.5 }}>{r.hook}</p>
                    </div>
                  )}
                  {(r.body || []).length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ margin: '0 0 5px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Body</p>
                      {r.body.map((b, i) => (
                        <p key={i} style={{ margin: '0 0 4px', fontSize: '12.5px', color: '#444', lineHeight: 1.6 }}>{i + 1}. {b}</p>
                      ))}
                    </div>
                  )}
                  {r.cta && (
                    <div>
                      <p style={{ margin: '0 0 3px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CTA</p>
                      <p style={{ margin: 0, fontSize: '13px', color: BONE, fontWeight: '600' }}>{r.cta}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {!['prospect_discovery', 'full_campaign_launch', 'meta_campaign_launch', 'trend_research', 'market_query', 'hashtag_generation', 'ad_script_writing'].includes(data.intent) && (() => {
            const insights = extractInsights(data.result, 4)
            return insights.length > 0 ? (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {insights.map((ins, i) => (
                  <li key={i} style={{ fontSize: '13px', color: '#444', lineHeight: 1.6, marginBottom: i < insights.length - 1 ? '5px' : 0, paddingLeft: '14px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: GOLD }}>•</span> {ins}
                  </li>
                ))}
              </ul>
            ) : <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>Done — no summary text available.</p>
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
  const [activeTask, setActiveTask] = useState(null) // { taskId, text, timestamp, intent, reasoning, paramsUsed, steps, status }
  const pendingContext = useRef(null) // carries url/industry/city/budget/goal forward across a "missing param" reply

  // Live Tasks Panel: polls GET /command/status/{task_id} every 2s for the
  // 4 multi-step intents until the backend actually finishes — every step
  // status shown here reflects a real completed backend phase, never a
  // simulated/fake progress animation. Runs once per task_id (not per
  // status change) so it manages its own interval/cleanup correctly.
  useEffect(() => {
    if (!activeTask) return
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch(`${BACKEND}/command/status/${activeTask.taskId}`)
        const statusData = await res.json()
        if (cancelled || !statusData.success) return
        if (statusData.status === 'done' || statusData.status === 'error') {
          const finalData = {
            success: statusData.status === 'done',
            intent: statusData.intent,
            reasoning: statusData.reasoning,
            params_used: statusData.params_used,
            result: statusData.result,
            ...(statusData.extra_fields || {}),
          }
          setFeed(f => [{ id: Date.now(), text: activeTask.text, status: 'done', data: finalData, timestamp: activeTask.timestamp }, ...f])
          setActiveTask(null)
          if (finalData.success) toast.success('Done!')
          else toast.error('Something went wrong — see details in the result.')
        } else {
          setActiveTask(prev => prev ? { ...prev, steps: statusData.steps, status: statusData.status } : prev)
        }
      } catch {
        // transient network hiccup — just try again on the next tick
      }
    }

    poll()
    const interval = setInterval(poll, 2000)
    return () => { cancelled = true; clearInterval(interval) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTask?.taskId])

  async function handleAsk() {
    const trimmed = text.trim()
    if (!trimmed || asking || (activeTask && activeTask.status === 'running')) return

    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
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

      if (data.multi_step && data.task_id) {
        pendingContext.current = null
        setActiveTask({
          taskId: data.task_id, text: trimmed, timestamp,
          intent: data.intent, reasoning: data.reasoning, paramsUsed: data.params_used,
          steps: [], status: 'running',
        })
      } else {
        pendingContext.current = (data.success === false && data.params_used) ? data.params_used : null
        setFeed(f => [{ id: Date.now(), text: trimmed, status: 'done', data, timestamp }, ...f])
        if (data.success) toast.success('Done!')
        else toast.error(data.error || 'Could not complete that.')
      }
    } catch (e) {
      setFeed(f => [{ id: Date.now(), text: trimmed, status: 'error', data: { error: `Backend se connect nahi ho paya: ${e.message}` }, timestamp }, ...f])
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

  const busy = asking || (activeTask && activeTask.status === 'running')

  const page = {
    minHeight: '100vh', background: INK,
    padding: isMobile ? '28px 16px' : '40px 36px',
    maxWidth: activeTask ? '1160px' : '820px', width: '100%', boxSizing: 'border-box',
    fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
  }

  const mainColumn = (
    <div style={{ maxWidth: '820px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <MessageSquare size={20} color={GOLD} />
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.4px' }}>Command Center</h1>
      </div>
      <p style={{ color: MUTED, fontSize: '13px', margin: '0 0 24px' }}>
        Tell it what you need in plain language — it figures out which engine to run.
      </p>

      <div style={{ ...card, padding: isMobile ? '16px' : '20px', marginBottom: '14px' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell me what you need... e.g. 'Launch a Google Ads campaign for [client website], budget ₹10,000' or 'Find hotels in Jaipur' or 'Generate hashtags for [Instagram handle]'"
          rows={3}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: '8px', border: `1px solid ${SLATE_L}`,
            background: INK, color: BONE, fontSize: '14px', boxSizing: 'border-box',
            outline: 'none', fontFamily: 'inherit', resize: 'vertical', marginBottom: '10px',
          }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {EXAMPLE_CHIPS.map((chip, i) => (
            <button
              key={i} onClick={() => handleChipClick(chip)}
              style={{ fontSize: '11.5px', color: MUTED, background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '20px', padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {chip}
            </button>
          ))}
        </div>
        <button
          onClick={handleAsk} disabled={busy || !text.trim()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
            padding: '12px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '700',
            cursor: (busy || !text.trim()) ? 'not-allowed' : 'pointer',
            background: (busy || !text.trim()) ? '#E5C158' : GOLD, color: BONE,
          }}
        >
          <Send size={14} /> {asking ? 'Asking...' : busy ? 'Working...' : 'Ask'}
        </button>
      </div>

      {isMobile && activeTask && <div style={{ marginBottom: '14px' }}><TaskPanel task={activeTask} /></div>}

      {feed.length > 0 && (
        <div>
          {feed.map(item => <CommandResultCard key={item.id} item={item} navigate={navigate} />)}
        </div>
      )}
    </div>
  )

  return (
    <div style={page}>
      <style>{`@keyframes pulse { from { opacity: 0.4; } to { opacity: 1; } }`}</style>
      {activeTask && !isMobile ? (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {mainColumn}
          <div style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '20px' }}>
            <TaskPanel task={activeTask} />
          </div>
        </div>
      ) : mainColumn}
    </div>
  )
}
