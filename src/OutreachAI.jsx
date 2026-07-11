import { useState, useEffect } from 'react'
import CityInput, { getLastCity } from './CityInput'

const LS_KEY_OUTREACH = 'adsoh_outreach_result'
import { MessageSquare, Copy, Check, ChevronRight } from 'lucide-react'
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

const GOALS = [
  { value: 'get meeting',      label: 'Get a Meeting' },
  { value: 'sell service',     label: 'Sell Service' },
  { value: 'offer free audit', label: 'Offer Free Audit' },
  { value: 'follow up',        label: 'Follow Up' },
]

const TABS = [
  { key: 'whatsapp',  label: 'WhatsApp' },
  { key: 'instagram', label: 'Instagram DM' },
  { key: 'email',     label: 'Cold Email' },
  { key: 'linkedin',  label: 'LinkedIn' },
  { key: 'call',      label: 'Call Script' },
  { key: 'objections',label: 'Objections' },
  { key: 'followup',  label: 'Follow-up Seq' },
]

function CopyBtn({ text, small }) {
  const [copied, setCopied] = useState(false)
  const handle = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <button onClick={handle} style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      background: copied ? '#16A34A' : '#F5F5F5',
      border: '1px solid ' + (copied ? '#16A34A' : '#E5E5E5'),
      color: copied ? '#fff' : '#666',
      padding: small ? '4px 9px' : '6px 11px',
      borderRadius: '6px', fontSize: small ? '11px' : '12px',
      fontWeight: '600', cursor: 'pointer', flexShrink: 0,
    }}>
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function MsgBlock({ label, text, highlight }) {
  if (!text) return null
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: highlight ? GOLD : '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <CopyBtn text={text} small />
      </div>
      <div style={{
        background: highlight ? '#FFFDF5' : '#F9F9F9',
        border: `1px solid ${highlight ? '#E8DFA8' : '#EAEAEA'}`,
        borderRadius: '7px', padding: '13px 15px',
        fontSize: '13.5px', color: '#222', lineHeight: '1.65', whiteSpace: 'pre-wrap',
      }}>{text}</div>
    </div>
  )
}

function WhyBox({ text }) {
  if (!text) return null
  return (
    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '9px 13px', marginTop: '4px' }}>
      <p style={{ margin: 0, fontSize: '12px', color: '#1D4ED8' }}><strong>Why it works:</strong> {text}</p>
    </div>
  )
}

function Shimmer({ h = '14px', w = '100%' }) {
  return <div style={{ height: h, width: w, borderRadius: '4px', background: 'linear-gradient(90deg,#F0F0F0 25%,#E8E8E8 50%,#F0F0F0 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.2s ease-in-out infinite' }} />
}

function buildFullKit(o) {
  if (!o) return ''
  const e = o.cold_email || {}
  const l = o.linkedin_message || {}
  const w = o.whatsapp || {}
  const ig = o.instagram_dm || {}
  const c = o.call_script || {}
  const f = o.follow_up_sequence || {}
  const lines = [
    '════════════════════════════════',
    '  OUTREACH KIT — Adsoh Growth OS',
    '════════════════════════════════',
    '',
    '── COLD EMAIL ──',
    `Subject: ${e.subject || ''}`,
    '',
    e.body || '',
    '',
    e.ps_line ? `P.S. ${e.ps_line}` : '',
    '',
    '── LINKEDIN ──',
    `Connection Request: ${l.connection_request || ''}`,
    '',
    `Follow-up: ${l.follow_up_message || ''}`,
    '',
    '── WHATSAPP ──',
    `Message 1:\n${w.message_1_pain || ''}`,
    '',
    `Message 2:\n${w.message_2_proof || ''}`,
    '',
    `Day 3 Follow-up:\n${w.follow_up_day3 || ''}`,
    '',
    `Day 7 Follow-up:\n${w.follow_up_day7 || ''}`,
    '',
    '── INSTAGRAM DM ──',
    `Opener:\n${ig.opener || ''}`,
    '',
    `Follow-up:\n${ig.follow_up || ''}`,
    '',
    '── CALL SCRIPT ──',
    `Opener (10 sec): ${c.opener_10sec || ''}`,
    `Pain Question: ${c.pain_question || ''}`,
    `Value Statement: ${c.value_statement || ''}`,
    `Close: ${c.close || ''}`,
    '',
    '── OBJECTIONS ──',
    ...(o.objection_handling || []).map(ob => `"${ob.objection}"\n→ ${ob.response}`).join('\n\n').split('\n'),
    '',
    '── FOLLOW-UP SEQUENCE ──',
    `Day 1: ${f.day1 || ''}`,
    `Day 3: ${f.day3 || ''}`,
    `Day 7: ${f.day7 || ''}`,
    `Day 14: ${f.day14 || ''}`,
    '',
    '── PROPOSAL OPENER ──',
    o.proposal_opener || '',
    '',
    `Confidence Score: ${o.confidence}/100`,
  ]
  return lines.join('\n')
}

export default function OutreachAI() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [url, setUrl]                     = useState('')
  const [industry, setIndustry]           = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [city, setCity]                   = useState(getLastCity)
  const [targetName, setTargetName]       = useState('')
  const [goal, setGoal]                   = useState('get meeting')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [result, setResult]               = useState(null)
  const [activeTab, setActiveTab]         = useState('whatsapp')
  const [fromCache, setFromCache]         = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY_OUTREACH); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  const resolvedIndustry = industry === 'Other' ? industryOther : industry


  async function handleGenerate() {
    if (!resolvedIndustry) { setError('Industry select karo.'); return }
    setError(''); setLoading(true); setResult(null); setActiveTab('whatsapp')
    try {
      const res  = await fetch(`${BACKEND}/outreach-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url:           url.trim(),
          industry:      resolvedIndustry,
          city,
          target_name:   targetName,
          outreach_goal: goal,
        }),
      })
      const data = await res.json()
      if (data.success) { setResult(data); localStorage.setItem(LS_KEY_OUTREACH, JSON.stringify(data)); setFromCache(false) }
      else setError(data.message || data.error || 'Generation failed. Dobara try karo.')
    } catch { setError('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  const o = result?.outreach || {}

  function renderTab() {
    switch (activeTab) {
      case 'whatsapp': {
        const w = o.whatsapp || {}
        return (
          <div>
            <MsgBlock label="Message 1 — Lead with Pain" text={w.message_1_pain} highlight />
            <MsgBlock label="Message 2 — Proof (send Day 2)" text={w.message_2_proof} />
            <MsgBlock label="Day 3 Follow-up" text={w.follow_up_day3} />
            <MsgBlock label="Day 7 Final Follow-up" text={w.follow_up_day7} />
          </div>
        )
      }
      case 'instagram': {
        const ig = o.instagram_dm || {}
        return (
          <div>
            <MsgBlock label="Opener (3 lines max)" text={ig.opener} highlight />
            <MsgBlock label="Follow-up DM (Day 3)" text={ig.follow_up} />
            <WhyBox text={ig.why_it_works} />
          </div>
        )
      }
      case 'email': {
        const e = o.cold_email || {}
        return (
          <div>
            <MsgBlock label="Subject Line" text={e.subject} highlight />
            <MsgBlock label="Email Body" text={e.body} />
            {e.ps_line && <MsgBlock label="P.S. Line" text={`P.S. ${e.ps_line}`} />}
            <WhyBox text={e.why_it_works} />
          </div>
        )
      }
      case 'linkedin': {
        const l = o.linkedin_message || {}
        return (
          <div>
            <MsgBlock label="Connection Request (< 300 chars)" text={l.connection_request} highlight />
            {l.connection_request && (
              <p style={{ fontSize: '11px', color: l.connection_request.length > 300 ? '#DC2626' : '#16A34A', margin: '-8px 0 14px', fontWeight: '600' }}>
                {l.connection_request.length} / 300 chars
              </p>
            )}
            <MsgBlock label="Follow-up (after they accept)" text={l.follow_up_message} />
            <WhyBox text={l.why_it_works} />
          </div>
        )
      }
      case 'call': {
        const c = o.call_script || {}
        const steps = [
          { key: 'opener_10sec',   label: 'Opener',         sub: '10 seconds',       color: '#6366F1' },
          { key: 'pain_question',  label: 'Pain Question',  sub: 'Discovery',        color: '#DC2626' },
          { key: 'value_statement',label: 'Value Statement',sub: '30 seconds',       color: GOLD },
          { key: 'close',          label: 'Close',          sub: 'Book the meeting', color: GREEN },
        ]
        return (
          <div>
            {steps.map((step, i) => c[step.key] ? (
              <div key={step.key} style={{ display: 'flex', gap: '14px', marginBottom: '12px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step.color + '18', border: `2px solid ${step.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: step.color }}>{i + 1}</span>
                  </div>
                  {i < steps.length - 1 && <div style={{ width: '2px', flex: 1, minHeight: '20px', background: '#EAEAEA', marginTop: '4px' }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: BONE }}>{step.label}</span>
                      <span style={{ fontSize: '11px', color: MUTED, marginLeft: '7px' }}>{step.sub}</span>
                    </div>
                    <CopyBtn text={c[step.key]} small />
                  </div>
                  <div style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '11px 13px', fontSize: '13.5px', color: '#222', lineHeight: '1.65' }}>
                    {c[step.key]}
                  </div>
                </div>
              </div>
            ) : null)}
            <div style={{ marginTop: '8px', textAlign: 'right' }}>
              <CopyBtn text={[c.opener_10sec, c.pain_question, c.value_statement, c.close].filter(Boolean).join('\n\n')} />
            </div>
          </div>
        )
      }
      case 'objections': {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(o.objection_handling || []).map((ob, i) => (
              <div key={i} style={{ ...card, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '3px 9px', borderRadius: '20px', background: '#FEF2F2', color: '#DC2626', fontSize: '11px', fontWeight: '700', border: '1px solid #FECACA' }}>Objection</span>
                    <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '600', color: BONE }}>{ob.objection}</p>
                  </div>
                  <CopyBtn text={`Objection: "${ob.objection}"\nResponse: ${ob.response}`} small />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <ChevronRight size={14} color={GOLD} style={{ marginTop: '3px', flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '13.5px', color: BONE, lineHeight: '1.65' }}>{ob.response}</p>
                </div>
              </div>
            ))}
          </div>
        )
      }
      case 'followup': {
        const f = o.follow_up_sequence || {}
        const days = [
          { key: 'day1',  label: 'Day 1',  sub: 'Same day',      color: GREEN },
          { key: 'day3',  label: 'Day 3',  sub: 'Different angle', color: GOLD },
          { key: 'day7',  label: 'Day 7',  sub: 'Add value',     color: '#6366F1' },
          { key: 'day14', label: 'Day 14', sub: 'Final attempt', color: '#DC2626' },
        ]
        return (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {days.map(d => f[d.key] ? (
                <div key={d.key} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', flexShrink: 0, paddingTop: '2px' }}>
                    <div style={{ background: d.color + '18', border: `1.5px solid ${d.color}40`, borderRadius: '6px', padding: '4px 6px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: d.color }}>{d.label}</p>
                      <p style={{ margin: 0, fontSize: '9px', color: d.color + 'AA' }}>{d.sub}</p>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <p style={{ margin: 0, fontSize: '13.5px', color: BONE, lineHeight: '1.65' }}>{f[d.key]}</p>
                      <CopyBtn text={f[d.key]} small />
                    </div>
                  </div>
                </div>
              ) : null)}
            </div>
            {o.proposal_opener && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <p style={lbl}>Proposal Opener</p>
                  <CopyBtn text={o.proposal_opener} small />
                </div>
                <div style={{ background: '#FFFDF5', border: '1px solid #E8DFA8', borderRadius: '7px', padding: '13px 15px', fontSize: '13.5px', color: '#222', lineHeight: '1.65' }}>
                  {o.proposal_opener}
                </div>
              </div>
            )}
          </div>
        )
      }
      default: return null
    }
  }

  return (
    <PageShell maxWidth="880px">
      <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>
      <PageHeader title="Outreach AI" sub="Personalized outreach kit built from memory — cold email, WhatsApp, LinkedIn, call script, objections, and follow-up sequence." />

      {/* Input */}
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '10px' }}>
          {error && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: RED, fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Business Website URL <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g. sohscape.com" style={inp} />
            <p style={{ margin: '5px 0 0', fontSize: '11px', color: MUTED }}>Same URL + Industry as Marketing Brain for memory to load.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={lbl}>Target Industry <span style={{ color: '#DC2626' }}>*</span></label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inp, color: industry ? '#171717' : '#999' }}>
                <option value="">— Select industry —</option>
                {INDUSTRIES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>City</label>
              <CityInput value={city} onChange={setCity} style={inp} />
            </div>
          </div>

          {industry === 'Other' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Specify Industry</label>
              <input type="text" value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="e.g. Interior Designers" style={inp} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Target Name <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
              <input type="text" value={targetName} onChange={e => setTargetName(e.target.value)} placeholder="e.g. Hotel Raj Palace" style={inp} />
            </div>
            <div>
              <label style={lbl}>Outreach Goal</label>
              <select value={goal} onChange={e => setGoal(e.target.value)} style={inp}>
                {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
            background: loading ? '#E5E5E5' : GOLD, border: 'none', color: loading ? '#999' : '#fff',
            padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            <MessageSquare size={15} />
            {loading ? 'Building outreach kit...' : 'Generate Outreach Kit'}
          </button>
        </div>
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '7px', padding: '9px 14px', maxWidth: '640px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#92400E' }}>
            <strong>Note:</strong> Run Marketing Brain first for this industry so memory is available for personalisation.
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ maxWidth: '640px', width: '100%', marginTop: '16px' }}>
          {['Reading all memory tables...', 'Writing personalised messages...', 'Building objection scripts...'].map((label, i) => (
            <div key={i} style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#FFFBF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: BONE, margin: '0 0 6px' }}>{label}</p>
                <Shimmer h="9px" w="55%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {fromCache && result && !loading && (
        <div style={{ maxWidth: '820px', width: '100%', background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '9px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Showing previous result · Generate new report to refresh</p>
          <button onClick={() => { localStorage.removeItem(LS_KEY_OUTREACH); setResult(null); setFromCache(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: MUTED, textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
        </div>
      )}

      {result && (
        <div style={{ maxWidth: '820px', width: '100%', marginTop: '8px' }}>

          {/* Header bar */}
          <div style={{ ...card, padding: '14px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MessageSquare size={16} color={GOLD} />
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: BONE }}>Outreach Kit Ready</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: MUTED }}>
                  {resolvedIndustry} · {city}
                  {targetName ? ` · ${targetName}` : ''}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {o.confidence !== undefined && (
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                  background: o.confidence >= 70 ? '#F0FDF4' : '#FFFBEB',
                  color:      o.confidence >= 70 ? '#16A34A' : '#D97706',
                  border: `1px solid ${o.confidence >= 70 ? '#BBF7D0' : '#FDE68A'}`,
                }}>{o.confidence}% personalised</span>
              )}
              <CopyBtn text={buildFullKit(o)} />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px', overflowX: 'auto', paddingBottom: '2px' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                padding: '7px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: '500',
                border: activeTab === t.key ? `1.5px solid ${GOLD}` : '1px solid #EAEAEA',
                background: activeTab === t.key ? '#FFFBF0' : '#fff',
                color: activeTab === t.key ? '#8B6914' : '#666',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{t.label}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ ...card, padding: isMobile ? '18px 14px' : '24px' }}>
            {renderTab()}
          </div>

        </div>
      )}
    </PageShell>
  )
}
