import { BACKEND, apiFetch } from './lib/api'
import { useState, useEffect } from 'react'
import {
  Wand2, Copy, Check, ChevronDown, ChevronUp, Sparkles, Layers, Type, LayoutGrid,
  CalendarDays, MapPin, Trophy, Database, Info, RefreshCw, Hash, Lightbulb,
} from 'lucide-react'
import { useToast } from './ToastContext'
import { useLoadingSteps } from './useLoadingSteps'
import CityInput, { getLastCity } from './CityInput'
import { TrustBadge, ValidationWarningBanner, NeedsMarketingBrainNotice } from './TrustLayer'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'



const LS_KEY  = 'adsoh_creative_studio_result'
const LOADING_STEPS = [
  'Analyzing business & audience first...', 'Reading campaign data...', 'Checking performance signals...',
  'Building 3 creative concepts...', 'Writing production-ready image prompts...', 'Scoring concepts...',
]

const OBJECTIVES = ['Awareness', 'Traffic', 'Leads', 'Sales', 'Branding']


function CopyBtn({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const toast = useToast()
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text || ''); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
        background: copied ? '#16A34A' : '#F5F5F5', border: '1px solid ' + (copied ? '#16A34A' : '#E5E5E5'),
        color: copied ? '#fff' : '#666', padding: '6px 12px', borderRadius: '6px',
        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

function Section({ icon: Icon, title, sub, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ ...card, marginBottom: '14px', overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <Icon size={16} color={GOLD} style={{ flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: BONE }}>{title}</p>
            {sub && <p style={{ margin: '1px 0 0', fontSize: '11.5px', color: MUTED }}>{sub}</p>}
          </div>
        </div>
        {open ? <ChevronUp size={16} color="#BBB" /> : <ChevronDown size={16} color="#BBB" />}
      </div>
      {open && <div style={{ padding: '0 18px 18px' }}>{children}</div>}
    </div>
  )
}

function ScoreBar({ label, value }) {
  const v = Number(value) || 0
  const color = v >= 75 ? '#16A34A' : v >= 50 ? '#D97706' : '#DC2626'
  return (
    <div style={{ marginBottom: '7px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ fontSize: '11px', color: MUTED }}>{label}</span>
        <span style={{ fontSize: '11px', fontWeight: '700', color }}>{v}</span>
      </div>
      <div style={{ height: '5px', borderRadius: '3px', background: SLATE_L, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, v))}%`, background: color, borderRadius: '3px' }} />
      </div>
    </div>
  )
}

const VARIANT_COLORS = { 'Direct Response': '#6366F1', 'Emotional/Lifestyle': '#DB2777', 'Authority/Trust': '#D97706' }

function ConceptCard({ concept }) {
  const accent = VARIANT_COLORS[concept.variant_name] || GOLD
  const scores = concept.creative_score || {}

  return (
    <div style={{ ...card, padding: '18px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '10.5px', fontWeight: '700', background: accent + '18', color: accent, border: `1px solid ${accent}40` }}>
          {concept.variant_name}
        </span>
        {scores.overall != null && (
          <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '700', color: GOLD }}>
            <Trophy size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />{scores.overall}/100
          </span>
        )}
      </div>

      {(concept.applicable_platforms_and_sizes || []).length > 0 && (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {concept.applicable_platforms_and_sizes.map((s, i) => (
            <span key={i} style={{ fontSize: '10.5px', color: MUTED, background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '5px', padding: '2px 7px' }}>{s}</span>
          ))}
        </div>
      )}

      <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: BONE }}>{concept.headline}</p>
      {concept.subheadline && <p style={{ margin: '0 0 8px', fontSize: '13px', color: MUTED }}>{concept.subheadline}</p>}
      {concept.caption && <p style={{ margin: '0 0 8px', fontSize: '12.5px', color: MUTED, lineHeight: 1.5 }}>{concept.caption}</p>}
      {concept.cta && (
        <span style={{ display: 'inline-block', padding: '4px 11px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#171717', color: '#fff', marginBottom: '10px' }}>
          {concept.cta}
        </span>
      )}

      {(concept.hashtags || []).length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <Hash size={12} color="#BBB" />
          {concept.hashtags.map((h, i) => <span key={i} style={{ fontSize: '11.5px', color: '#6366F1' }}>{h.startsWith('#') ? h : `#${h}`}</span>)}
          <CopyBtn text={concept.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')} label="Copy tags" />
        </div>
      )}

      <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: MUTED, lineHeight: 1.5 }}>
        <strong style={{ color: MUTED }}>Visual direction: </strong>{concept.visual_direction}
      </p>

      <div style={{ background: INK, border: '1px solid #EEE', borderRadius: '7px', padding: '12px 14px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Image Prompt — ready to paste</span>
          <CopyBtn text={concept.image_prompt} label="Copy Prompt" />
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#444', lineHeight: 1.6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
          {concept.image_prompt}
        </p>
      </div>

      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '7px', padding: '10px 13px', marginBottom: '14px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#92400E', lineHeight: 1.5 }}>
          <strong>Why this matches: </strong>{concept.reason_this_matches}
        </p>
      </div>

      {concept.ai_review && (
        <div style={{ marginBottom: '14px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Review</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px', fontSize: '12px', color: MUTED }}>
            <p style={{ margin: 0 }}><strong style={{ color: GREEN }}>Strong:</strong> {concept.ai_review.strong}</p>
            <p style={{ margin: 0 }}><strong style={{ color: '#DC2626' }}>Weak:</strong> {concept.ai_review.weak}</p>
            <p style={{ margin: 0 }}><strong style={{ color: MUTED }}>Scroll-stopping:</strong> {concept.ai_review.scroll_stopping}</p>
            <p style={{ margin: 0 }}><strong style={{ color: MUTED }}>CTA standout:</strong> {concept.ai_review.cta_standout}</p>
            <p style={{ margin: 0, gridColumn: '1 / -1' }}><strong style={{ color: MUTED }}>Audience match:</strong> {concept.ai_review.audience_match}</p>
          </div>
        </div>
      )}

      <div>
        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score Breakdown</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <ScoreBar label="Visual Appeal" value={scores.visual_appeal} />
          <ScoreBar label="Headline" value={scores.headline} />
          <ScoreBar label="CTA" value={scores.cta} />
          <ScoreBar label="Brand Match" value={scores.brand_match} />
          <ScoreBar label="Emotional Appeal" value={scores.emotional_appeal} />
          <ScoreBar label="Scroll-Stopping" value={scores.scroll_stopping} />
          <ScoreBar label="Conversion Potential" value={scores.conversion_potential} />
        </div>
        {scores.reasoning && <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: MUTED, fontStyle: 'italic' }}>{scores.reasoning}</p>}
      </div>
    </div>
  )
}

export default function CreativeStudio() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const toast = useToast()

  const [mode, setMode] = useState('business') // 'business' | 'campaign'
  const [campaignInputType, setCampaignInputType] = useState('account') // 'account' | 'manual'
  const [campaigns, setCampaigns] = useState([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState('')

  const [url, setUrl]           = useState('')
  const [industry, setIndustry] = useState('')
  const [city, setCity]         = useState(getLastCity)
  const [objective, setObjective] = useState('Leads')
  const [offer, setOffer]       = useState('')

  const [loading, setLoading] = useState(false)
  const loadingStep = useLoadingSteps(LOADING_STEPS, loading)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)
  const [fromCache, setFromCache] = useState(false)
  const [activeVariant, setActiveVariant] = useState(0)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  async function loadCampaigns() {
    setCampaignsLoading(true)
    try {
      const res = await apiFetch(`${BACKEND}/campaigns/all`)
      const data = await res.json()
      if (data.success) setCampaigns(data.campaigns || [])
    } catch {}
    setCampaignsLoading(false)
  }

  useEffect(() => { if (mode === 'campaign' && campaignInputType === 'account') loadCampaigns() }, [mode, campaignInputType])

  async function handleGenerate() {
    if (mode === 'campaign' && campaignInputType === 'account' && !selectedCampaignId) { setError('Select a campaign first!'); return }
    if ((mode === 'business' || (mode === 'campaign' && campaignInputType === 'manual')) && !url.trim()) { setError('Business URL bharo!'); return }
    setError(''); setLoading(true); setResult(null); setActiveVariant(0)
    try {
      const body = mode === 'campaign'
        ? campaignInputType === 'account'
          ? { mode: 'campaign', campaign_id: selectedCampaignId, campaign_objective: objective, offer: offer.trim() }
          : { mode: 'campaign', url: url.trim(), industry: industry.trim(), city, campaign_objective: objective, offer: offer.trim() }
        : { mode: 'business', url: url.trim(), industry: industry.trim(), city, campaign_objective: objective, offer: offer.trim() }

      const res = await apiFetch(`${BACKEND}/creative-studio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) { setResult(data); localStorage.setItem(LS_KEY, JSON.stringify(data)); setFromCache(false); toast.success('Creative direction ready!') }
      else { const msg = data.error || 'Generation failed. Try again.'; setError(msg); toast.error(msg) }
    } catch (e) { setError(`Backend se connect nahi ho paya: ${e.message}`); toast.error('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  function clearReport() {
    localStorage.removeItem(LS_KEY)
    setResult(null); setFromCache(false)
  }

  const c = result?.creative || {}
  const concepts = c.concepts || []
  const ds = c.data_sources_used || {}

  return (
    <PageShell maxWidth="900px">
      <PageHeader title="Creative Studio" sub="Complete creative strategy + production-ready image prompts, built from your real business & campaign intelligence." />
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '7px', padding: '9px 13px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Info size={14} color="#1E40AF" style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ margin: 0, fontSize: '12px', color: '#1E40AF', lineHeight: 1.5 }}>
          Paste image prompts into Canva AI / Midjourney / DALL-E to produce visuals. Automatic in-app image generation is coming soon.
        </p>
      </div>

      {/* Input */}
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '16px' }}>
          {error && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: RED, fontSize: '13px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '4px', marginBottom: '18px', borderBottom: '1px solid #EAEAEA' }}>
            {[{ key: 'business', label: 'For a Business' }, { key: 'campaign', label: 'For a Live Campaign' }].map(t => (
              <button
                key={t.key} onClick={() => setMode(t.key)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '9px 14px', fontSize: '13px', fontWeight: '600',
                  color: mode === t.key ? '#171717' : '#999',
                  borderBottom: mode === t.key ? `2px solid ${GOLD}` : '2px solid transparent', marginBottom: '-1px',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {mode === 'business' && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Business URL <span style={{ color: '#DC2626' }}>*</span></label>
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g. sohscape.com" style={inp} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={lbl}>Industry <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
                  <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Hospitality" style={inp} />
                </div>
                <div>
                  <label style={lbl}>City <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
                  <CityInput value={city} onChange={setCity} style={inp} />
                </div>
              </div>
            </>
          )}

          {mode === 'campaign' && (
            <>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                {[{ key: 'account', label: 'From account' }, { key: 'manual', label: 'Manual' }].map(t => (
                  <button
                    key={t.key} onClick={() => setCampaignInputType(t.key)}
                    style={{
                      padding: '6px 13px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                      border: campaignInputType === t.key ? `1px solid ${GOLD}` : '1px solid #E5E5E5',
                      background: campaignInputType === t.key ? '#FDF8EE' : '#fff',
                      color: campaignInputType === t.key ? '#8A6D1D' : '#666',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {campaignInputType === 'account' ? (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <label style={{ ...lbl, marginBottom: 0 }}>Select Campaign <span style={{ color: '#DC2626' }}>*</span></label>
                    <button onClick={loadCampaigns} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                      <RefreshCw size={11} /> Refresh
                    </button>
                  </div>
                  <select value={selectedCampaignId} onChange={e => setSelectedCampaignId(e.target.value)} style={{ ...inp, color: selectedCampaignId ? '#171717' : '#999' }}>
                    <option value="">{campaignsLoading ? 'Loading campaigns...' : '— Select a campaign —'}</option>
                    {campaigns.map(cmp => (
                      <option key={`${cmp.platform}-${cmp.campaign_id}`} value={cmp.campaign_id}>
                        [{cmp.platform}] {cmp.name} ({cmp.status})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={lbl}>Business URL <span style={{ color: '#DC2626' }}>*</span></label>
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g. sohscape.com" style={inp} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={lbl}>Industry <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
                      <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Hospitality" style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>City <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
                      <CityInput value={city} onChange={setCity} style={inp} />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Campaign Objective</label>
              <select value={objective} onChange={e => setObjective(e.target.value)} style={inp}>
                {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Offer <span style={{ color: MUTED, fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
              <input type="text" value={offer} onChange={e => setOffer(e.target.value)} placeholder="e.g. Free consultation" style={inp} />
            </div>
          </div>

          <button
            onClick={handleGenerate} disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#E5C158' : GOLD, color: BONE, fontSize: '14px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <Sparkles size={15} /> {loading ? (loadingStep || 'Generating...') : 'Generate Creatives'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={{ maxWidth: '760px', width: '100%' }}>
          {fromCache && (
            <div style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '9px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Showing previous result · Generate new to refresh</p>
              <button onClick={clearReport} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: MUTED, textDecoration: 'underline' }}>Clear</button>
            </div>
          )}

          <ValidationWarningBanner message={c.validation_warning} />
          <TrustBadge verdict={c.trust_verdict} basedOn={c.based_on} />
          <NeedsMarketingBrainNotice show={c.needs_marketing_brain} message={c.needs_marketing_brain_message} />

          <div style={{ ...card, padding: '18px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Lightbulb size={15} color={GOLD} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: BONE }}>Intelligence Applied</p>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#444', lineHeight: 1.6 }}>{c.intelligence_applied}</p>
            {c.performance_context && c.performance_context !== 'N/A' && !c.performance_context.startsWith('N/A') && (
              <div style={{
                background: c.data_sufficiency?.insufficient_data ? '#FFFBEB' : '#F0FDF4',
                border: `1px solid ${c.data_sufficiency?.insufficient_data ? '#FDE68A' : '#BBF7D0'}`,
                borderRadius: '6px', padding: '9px 12px',
              }}>
                <p style={{ margin: 0, fontSize: '12.5px', color: c.data_sufficiency?.insufficient_data ? '#92400E' : '#166534' }}>{c.performance_context}</p>
              </div>
            )}
          </div>

          <Section icon={Sparkles} title="Creative Strategy" sub={c.creative_strategy?.primary_goal}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#444' }}><strong>Dominant emotion:</strong> {c.creative_strategy?.dominant_emotion}</p>
            <p style={{ margin: 0, fontSize: '13px', color: MUTED, lineHeight: 1.6 }}>{c.creative_strategy?.why}</p>
          </Section>

          <Section icon={Layers} title="Color Psychology" sub={c.color_psychology?.why_for_this_industry}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {(c.color_psychology?.palette || []).map((p, i) => (
                <div key={i} style={{ textAlign: 'center', width: '100px' }}>
                  <div style={{ width: '100%', height: '52px', borderRadius: '8px', background: p.hex, border: '1px solid #0000000F', marginBottom: '6px' }} />
                  <p style={{ margin: 0, fontSize: '11.5px', fontWeight: '700', color: BONE }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: '10.5px', color: MUTED }}>{p.hex}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: MUTED }}>{p.reason}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Type} title="Typography" defaultOpen={false}>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#444' }}><strong>Style:</strong> {c.typography?.style}</p>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#444' }}><strong>Fonts:</strong> {(c.typography?.recommended_fonts || []).join(', ')}</p>
            <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>{c.typography?.why}</p>
          </Section>

          <Section icon={LayoutGrid} title="Layout Blueprint" defaultOpen={false}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '6px 16px', fontSize: '13px', color: '#444' }}>
              <p style={{ margin: 0 }}><strong>Hierarchy:</strong> {c.layout_blueprint?.hierarchy}</p>
              <p style={{ margin: 0 }}><strong>Logo placement:</strong> {c.layout_blueprint?.logo_placement}</p>
              <p style={{ margin: 0 }}><strong>CTA placement:</strong> {c.layout_blueprint?.cta_placement}</p>
              <p style={{ margin: 0 }}><strong>Visual flow:</strong> {c.layout_blueprint?.visual_flow}</p>
              <p style={{ margin: 0, gridColumn: '1 / -1' }}><strong>Eye path:</strong> {c.layout_blueprint?.eye_path}</p>
            </div>
          </Section>

          <Section icon={CalendarDays} title="Seasonal & Localization" sub="Based on today's real date and your target city" defaultOpen={false}>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#444' }}><strong>Relevant occasions:</strong> {(c.seasonal_intelligence?.current_relevant_occasions || []).join(', ') || 'None flagged'}</p>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: MUTED }}>{c.seasonal_intelligence?.recommendation}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <MapPin size={13} color="#999" />
              <strong style={{ fontSize: '13px', color: '#444' }}>Localization: {c.localization?.use_or_skip}</strong>
            </div>
            {(c.localization?.city_elements || []).length > 0 && <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>{c.localization.city_elements.join(', ')}</p>}
          </Section>

          <h2 style={{ fontSize: '16px', fontWeight: '700', color: BONE, margin: '24px 0 12px' }}>3 Creative Concepts</h2>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {concepts.map((v, i) => (
              <button
                key={i} onClick={() => setActiveVariant(i)}
                style={{
                  padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                  border: activeVariant === i ? `1px solid ${GOLD}` : '1px solid #E5E5E5',
                  background: activeVariant === i ? '#FDF8EE' : '#fff',
                  color: activeVariant === i ? '#8A6D1D' : '#666',
                }}
              >
                {v.variant_name}
              </button>
            ))}
          </div>
          {concepts[activeVariant] && <ConceptCard concept={concepts[activeVariant]} />}

          <Section icon={Trophy} title="A/B Prediction">
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#444' }}><strong>Likely winner:</strong> {c.ab_prediction?.likely_winner}</p>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: MUTED }}>{c.ab_prediction?.why}</p>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: MUTED }}><strong>Expected CTR difference:</strong> {c.ab_prediction?.expected_ctr_difference}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#444' }}><strong>Confidence:</strong></span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: (c.ab_prediction?.confidence || 0) >= 60 ? '#16A34A' : '#D97706' }}>{c.ab_prediction?.confidence}/100</span>
            </div>
            <p style={{ margin: 0, fontSize: '11.5px', color: MUTED, fontStyle: 'italic' }}>{c.ab_prediction?.caveat}</p>
          </Section>

          <div style={{ ...card, padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Database size={15} color={GOLD} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: BONE }}>Data Sources Used</p>
            </div>
            {[
              ['Business DNA', ds.business_dna],
              ['Audience Intelligence', ds.audience_intelligence],
              ['Performance Data', ds.performance_data],
              ['KPI Prediction', ds.kpi_prediction],
            ].map(([label, has]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ color: has ? '#16A34A' : '#BBB', fontSize: '14px', fontWeight: '700' }}>{has ? '✓' : '✗'}</span>
                <span style={{ fontSize: '13px', color: '#444' }}>{label}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: (ds.growth_memory_records || 0) > 0 ? '#16A34A' : '#BBB', fontSize: '14px', fontWeight: '700' }}>{(ds.growth_memory_records || 0) > 0 ? '✓' : '✗'}</span>
              <span style={{ fontSize: '13px', color: '#444' }}>Cross-business learning — {ds.growth_memory_records || 0} real record(s)</span>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
