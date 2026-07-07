import { useState, useEffect } from 'react'
import {
  Palette, Copy, Check, ChevronDown, ChevronUp, Sparkles, Layers, Type, LayoutGrid,
  CalendarDays, MapPin, Wand2, Trophy, Database, Info,
} from 'lucide-react'
import { useToast } from './ToastContext'
import { useLoadingSteps } from './useLoadingSteps'
import CityInput, { getLastCity } from './CityInput'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const GOLD    = '#D4AF37'
const LS_KEY  = 'adsoh_creative_director_result'
const LOADING_STEPS = [
  'Reading business intelligence...', 'Studying audience signals...', 'Building color psychology...',
  'Designing 3 creative concepts...', 'Writing production-ready image prompts...', 'Scoring concepts...',
]

const OBJECTIVES = ['Awareness', 'Traffic', 'Leads', 'Sales', 'Branding']

const card = { background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
const lbl  = { display: 'block', color: '#999', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }
const inp  = { width: '100%', padding: '10px 13px', borderRadius: '7px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }

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
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <Icon size={16} color={GOLD} style={{ flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#171717' }}>{title}</p>
            {sub && <p style={{ margin: '1px 0 0', fontSize: '11.5px', color: '#999' }}>{sub}</p>}
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
        <span style={{ fontSize: '11px', color: '#888' }}>{label}</span>
        <span style={{ fontSize: '11px', fontWeight: '700', color }}>{v}</span>
      </div>
      <div style={{ height: '5px', borderRadius: '3px', background: '#F0F0F0', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, v))}%`, background: color, borderRadius: '3px' }} />
      </div>
    </div>
  )
}

function ConceptCard({ concept, review, scores }) {
  const angleColors = { Authority: '#6366F1', Lifestyle: '#D97706', Emotional: '#DB2777' }
  const angleColor = angleColors[concept.angle] || GOLD

  return (
    <div style={{ ...card, padding: '18px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '15px', fontWeight: '700', color: '#171717' }}>{concept.name}</span>
        <span style={{
          padding: '2px 10px', borderRadius: '20px', fontSize: '10.5px', fontWeight: '700',
          background: angleColor + '18', color: angleColor, border: `1px solid ${angleColor}40`,
        }}>{concept.angle} angle</span>
        {scores?.overall != null && (
          <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '700', color: GOLD }}>
            <Trophy size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />{scores.overall}/100
          </span>
        )}
      </div>

      <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: '#171717' }}>{concept.headline}</p>
      <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#666' }}>{concept.subheadline}</p>
      <span style={{ display: 'inline-block', padding: '4px 11px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#171717', color: '#fff', marginBottom: '12px' }}>
        {concept.cta}
      </span>

      <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: '#888', lineHeight: 1.5 }}>
        <strong style={{ color: '#666' }}>Visual concept: </strong>{concept.visual_concept}
      </p>

      <div style={{ background: '#FAFAFA', border: '1px solid #EEE', borderRadius: '7px', padding: '12px 14px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Image Prompt — ready to paste</span>
          <CopyBtn text={concept.image_prompt} label="Copy Prompt" />
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#444', lineHeight: 1.6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
          {concept.image_prompt}
        </p>
      </div>

      {review && (
        <div style={{ marginBottom: '14px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Creative Review</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px', fontSize: '12px', color: '#666' }}>
            <p style={{ margin: 0 }}><strong style={{ color: '#16A34A' }}>Strong:</strong> {review.strong}</p>
            <p style={{ margin: 0 }}><strong style={{ color: '#DC2626' }}>Weak:</strong> {review.weak}</p>
            <p style={{ margin: 0 }}><strong style={{ color: '#666' }}>Scroll-stopping:</strong> {review.scroll_stopping}</p>
            <p style={{ margin: 0 }}><strong style={{ color: '#666' }}>CTA standout:</strong> {review.cta_standout}</p>
            <p style={{ margin: 0, gridColumn: '1 / -1' }}><strong style={{ color: '#666' }}>Audience match:</strong> {review.audience_match}</p>
          </div>
        </div>
      )}

      {scores && (
        <div>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score Breakdown</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <ScoreBar label="Visual Appeal" value={scores.visual_appeal} />
            <ScoreBar label="Headline" value={scores.headline} />
            <ScoreBar label="CTA" value={scores.cta} />
            <ScoreBar label="Brand Match" value={scores.brand_match} />
            <ScoreBar label="Emotional Appeal" value={scores.emotional_appeal} />
            <ScoreBar label="Scroll-Stopping" value={scores.scroll_stopping} />
            <ScoreBar label="Conversion Potential" value={scores.conversion_potential} />
          </div>
          {scores.score_reasoning && <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#999', fontStyle: 'italic' }}>{scores.score_reasoning}</p>}
        </div>
      )}
    </div>
  )
}

export default function CreativeDirector() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const toast = useToast()

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

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY); if (s) { setResult(JSON.parse(s)); setFromCache(true) } } catch {}
  }, [])

  async function handleGenerate() {
    if (!url.trim()) { setError('Business URL bharo!'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const res = await fetch(`${BACKEND}/creative-director`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(), industry: industry.trim(), city,
          campaign_objective: objective, offer: offer.trim(),
        }),
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
  const reviewByName = Object.fromEntries((c.ai_creative_review?.per_concept || []).map(r => [r.concept, r]))
  const scoresByName = Object.fromEntries((c.creative_scores?.per_concept || []).map(s => [s.concept, s]))

  const page = {
    minHeight: '100vh', background: '#FAFAFA',
    padding: isMobile ? '28px 16px' : '40px 36px',
    maxWidth: '900px', width: '100%', boxSizing: 'border-box',
    fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
  }

  return (
    <div style={page}>
      <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Palette size={20} color={GOLD} />
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.4px' }}>AI Creative Director</h1>
      </div>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 8px' }}>Complete creative strategy + production-ready image prompts, built from your business intelligence.</p>
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '7px', padding: '9px 13px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Info size={14} color="#1E40AF" style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ margin: 0, fontSize: '12px', color: '#1E40AF', lineHeight: 1.5 }}>
          Paste any image prompt below into your image tool of choice (Midjourney, DALL-E, Canva AI) to generate the visual.
          Automatic in-app image generation is coming soon.
        </p>
      </div>

      {/* Input */}
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '16px' }}>
          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: '#BE123C', fontSize: '13px' }}>{error}</div>}

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Business URL <span style={{ color: '#DC2626' }}>*</span></label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g. sohscape.com" style={inp} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={lbl}>Industry <span style={{ color: '#BBB', fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
              <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Hospitality" style={inp} />
            </div>
            <div>
              <label style={lbl}>City <span style={{ color: '#BBB', fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
              <CityInput value={city} onChange={setCity} style={inp} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Campaign Objective</label>
              <select value={objective} onChange={e => setObjective(e.target.value)} style={inp}>
                {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Offer <span style={{ color: '#BBB', fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
              <input type="text" value={offer} onChange={e => setOffer(e.target.value)} placeholder="e.g. Free consultation" style={inp} />
            </div>
          </div>

          <button
            onClick={handleGenerate} disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#E5C158' : GOLD, color: '#171717', fontSize: '14px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <Wand2 size={15} /> {loading ? (loadingStep || 'Generating...') : 'Generate Creative Direction'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={{ maxWidth: '760px', width: '100%' }}>
          {fromCache && (
            <div style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: '7px', padding: '9px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Showing previous result · Generate new to refresh</p>
              <button onClick={clearReport} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#888', textDecoration: 'underline' }}>Clear</button>
            </div>
          )}

          <Section icon={Sparkles} title="Creative Strategy" sub={c.creative_strategy?.primary_goal}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#444' }}><strong>Dominant emotion:</strong> {c.creative_strategy?.dominant_emotion}</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.6 }}>{c.creative_strategy?.why}</p>
          </Section>

          <Section icon={Layers} title="Color Psychology" sub={c.color_psychology?.why_for_this_industry}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {(c.color_psychology?.palette || []).map((p, i) => (
                <div key={i} style={{ textAlign: 'center', width: '100px' }}>
                  <div style={{ width: '100%', height: '52px', borderRadius: '8px', background: p.hex, border: '1px solid #0000000F', marginBottom: '6px' }} />
                  <p style={{ margin: 0, fontSize: '11.5px', fontWeight: '700', color: '#171717' }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: '10.5px', color: '#999' }}>{p.hex}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#999' }}>{p.reason}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Type} title="Typography" defaultOpen={false}>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#444' }}><strong>Style:</strong> {c.typography?.style}</p>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#444' }}><strong>Fonts:</strong> {(c.typography?.recommended_fonts || []).join(', ')}</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{c.typography?.why}</p>
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
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>{c.seasonal_intelligence?.recommendation}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <MapPin size={13} color="#999" />
              <strong style={{ fontSize: '13px', color: '#444' }}>Localization: {c.localization?.use_or_skip}</strong>
            </div>
            {(c.localization?.city_elements || []).length > 0 && (
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{c.localization.city_elements.join(', ')}</p>
            )}
          </Section>

          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#171717', margin: '24px 0 12px' }}>3 Creative Concepts</h2>
          {concepts.map((concept, i) => (
            <ConceptCard key={i} concept={concept} review={reviewByName[concept.name]} scores={scoresByName[concept.name]} />
          ))}

          <Section icon={Trophy} title="A/B Prediction">
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#444' }}><strong>Likely winner:</strong> {c.ab_prediction?.likely_winner}</p>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#666' }}>{c.ab_prediction?.why}</p>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#666' }}><strong>Expected CTR difference:</strong> {c.ab_prediction?.expected_ctr_difference}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#444' }}><strong>Confidence:</strong></span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: (c.ab_prediction?.confidence || 0) >= 60 ? '#16A34A' : '#D97706' }}>{c.ab_prediction?.confidence}/100</span>
            </div>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#999', fontStyle: 'italic' }}>{c.ab_prediction?.caveat}</p>
          </Section>

          <Section icon={Database} title="Data Sources Used" sub="What real intelligence fed this report" defaultOpen={false}>
            {(() => {
              const ds = c.data_sources_used || {}
              const rows = [
                ['Business DNA', ds.business_dna],
                ['Audience Intelligence', ds.audience_intelligence],
                ['Performance Data', ds.performance_data],
              ]
              return (
                <>
                  {rows.map(([label, has]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ color: has ? '#16A34A' : '#BBB', fontSize: '14px', fontWeight: '700' }}>{has ? '✓' : '✗'}</span>
                      <span style={{ fontSize: '13px', color: '#444' }}>{label}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: (ds.growth_memory_records || 0) > 0 ? '#16A34A' : '#BBB', fontSize: '14px', fontWeight: '700' }}>{(ds.growth_memory_records || 0) > 0 ? '✓' : '✗'}</span>
                    <span style={{ fontSize: '13px', color: '#444' }}>Cross-business learning — {ds.growth_memory_records || 0} real record(s)</span>
                  </div>
                </>
              )
            })()}
          </Section>
        </div>
      )}
    </div>
  )
}
