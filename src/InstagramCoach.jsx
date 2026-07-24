import { BACKEND, apiFetch } from './lib/api'
import { useState, useRef } from 'react'
import {
  Upload, Image as ImageIcon, Sparkles, Copy, Check, MessageCircle, Palette,
  Hash, Wand2, Info, X,
} from 'lucide-react'
import CityInput, { getLastCity } from './CityInput'
import { useToast } from './ToastContext'
import { useLoadingSteps } from './useLoadingSteps'
import { GOLD, GOLD_BDR, card, cardInner, lbl, inp, BONE, SLATE_L, SLATE_M, MUTED, GREEN, RED } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

const LS_KEY = 'adsoh_instagram_coach_result'
const MAX_BYTES = 5 * 1024 * 1024
const LOADING_STEPS = ['Reading your image...', 'Analyzing hook & composition...', 'Writing coaching feedback...']

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

function RatingBadge({ rating }) {
  const map = {
    STRONG:   { color: GREEN, bg: 'rgba(63,166,107,0.12)', border: 'rgba(63,166,107,0.3)' },
    MODERATE: { color: GOLD,  bg: 'rgba(201,162,39,0.12)', border: GOLD_BDR },
    WEAK:     { color: RED,   bg: 'rgba(196,69,58,0.12)',  border: 'rgba(196,69,58,0.3)' },
  }
  const s = map[rating] || map.MODERATE
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '12px', fontWeight: '700', color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: '20px', padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {rating || 'MODERATE'}
    </span>
  )
}

function HashtagGroup({ label, tags }) {
  if (!tags || tags.length === 0) return null
  return (
    <div style={{ marginBottom: '10px' }}>
      <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {tags.map((t, i) => (
          <span key={i} style={{ fontSize: '12px', color: BONE, background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '20px', padding: '4px 11px' }}>
            {t.startsWith('#') ? t : `#${t}`}
          </span>
        ))}
      </div>
    </div>
  )
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div style={{ ...card, padding: '18px 20px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Icon size={14} color={GOLD} />
        <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</p>
      </div>
      {children}
    </div>
  )
}

export default function InstagramCoach() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const toast = useToast()
  const fileInputRef = useRef(null)

  const [imageBase64, setImageBase64] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [caption, setCaption] = useState('')
  const [businessUrl, setBusinessUrl] = useState('')
  const [industry, setIndustry] = useState('')
  const [city, setCity] = useState(getLastCity)

  const [loading, setLoading] = useState(false)
  const loadingStep = useLoadingSteps(LOADING_STEPS, loading)
  const [error, setError] = useState('')
  const [result, setResult] = useState(() => {
    try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [resultImagePreview, setResultImagePreview] = useState('')

  function handleFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please choose an image file (JPG, PNG, or WEBP).'); return }
    if (file.size > MAX_BYTES) { setError('Image too large — max 5MB.'); return }
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
      setImageBase64(reader.result)
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  function clearImage() {
    setImageBase64(''); setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleAnalyze() {
    if (!imageBase64) { setError('Upload an image to analyze.'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const res = await apiFetch(`${BACKEND}/instagram-coach/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageBase64, caption, business_url: businessUrl, industry, city,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)
        setResultImagePreview(imagePreview)
        try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch { /* ignore */ }
        toast.success('Analysis ready!')
      } else {
        setError(data.error || 'Analysis failed.'); toast.error(data.error || 'Analysis failed.')
      }
    } catch (e) {
      setError(`Backend se connect nahi ho paya: ${e.message}`); toast.error('Backend se connect nahi ho paya.')
    }
    setLoading(false)
  }

  const coherence = result?.content_coherence || {}
  const hook = result?.hook_assessment || {}
  const cap  = result?.caption_analysis || {}
  const vis  = result?.visual_psychology || {}
  const coach = result?.ai_coach_feedback || []
  const imp  = result?.improvement_suggestions || {}

  return (
    <PageShell maxWidth="1040px">
      <PageHeader title="Instagram Coach" sub="Pre-publish feedback on your image + caption — specific, evidence-based, never a fabricated score." />

      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '11px 16px', marginBottom: '16px', display: 'flex', gap: '9px', alignItems: 'flex-start', maxWidth: '820px' }}>
        <Info size={14} color="#D97706" style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ margin: 0, fontSize: '12px', color: '#92400E', lineHeight: 1.55 }}>
          This analyzes what's visible in your image/caption — it does not predict exact reach, views, or algorithm
          behavior, since that requires real performance history this account hasn't shared yet.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '380px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left column — inputs */}
        <div style={{ ...card, padding: isMobile ? '16px' : '20px' }}>
          {error && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '10px 14px', marginBottom: '14px', color: RED, fontSize: '13px' }}>{error}</div>}

          <label style={lbl}>Image <span style={{ color: RED, fontWeight: '700' }}>*</span></label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `1.5px dashed ${dragOver ? GOLD : SLATE_L}`, borderRadius: '8px', padding: imagePreview ? '10px' : '28px 14px',
              textAlign: 'center', cursor: 'pointer', marginBottom: '14px', background: dragOver ? 'rgba(201,162,39,0.06)' : SLATE_M,
              position: 'relative',
            }}
          >
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleFile(e.target.files?.[0])} style={{ display: 'none' }} />
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '6px', display: 'block', margin: '0 auto' }} />
                <button
                  onClick={e => { e.stopPropagation(); clearImage() }}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={13} color="#fff" />
                </button>
              </>
            ) : (
              <>
                <Upload size={22} color={MUTED} style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '13px', color: BONE, fontWeight: '600' }}>Drag & drop or click to upload</p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: MUTED }}>JPG, PNG, or WEBP · max 5MB</p>
              </>
            )}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Caption (optional)</label>
            <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Paste the caption you're planning to post..." rows={4} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Context (optional, for grounding)</p>
          <div style={{ marginBottom: '10px' }}>
            <label style={lbl}>Website / Business Name</label>
            <input type="text" value={businessUrl} onChange={e => setBusinessUrl(e.target.value)} placeholder="yourbusiness.com" style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
            <div>
              <label style={lbl}>Industry</label>
              <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. wedding photography" style={inp} />
            </div>
            <div>
              <label style={lbl}>City</label>
              <CityInput value={city} onChange={setCity} style={inp} />
            </div>
          </div>

          <button onClick={handleAnalyze} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
            padding: '12px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#E5C158' : GOLD, color: BONE,
          }}>
            <Sparkles size={14} /> {loading ? loadingStep : 'Analyze'}
          </button>
        </div>

        {/* Right column — results */}
        <div>
          {!result && !loading && (
            <div style={{ ...card, padding: '32px', textAlign: 'center' }}>
              <ImageIcon size={26} color={MUTED} style={{ marginBottom: '10px' }} />
              <p style={{ margin: 0, color: MUTED, fontSize: '13px' }}>Upload an image and hit Analyze to get coaching feedback.</p>
            </div>
          )}

          {result && !loading && (
            <div>
              {coherence.coherent === false && (
                <div style={{ background: 'rgba(196,69,58,0.12)', border: `1.5px solid ${RED}`, borderRadius: '8px', padding: '14px 16px', marginBottom: '14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>⚠️</span>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '13.5px', fontWeight: '700', color: RED }}>Image and caption appear to be about different things</p>
                    <p style={{ margin: 0, fontSize: '13px', color: BONE, lineHeight: 1.55 }}>{coherence.mismatch_warning}</p>
                  </div>
                </div>
              )}

              {resultImagePreview && (
                <div style={{ ...card, padding: '10px', marginBottom: '14px', textAlign: 'center' }}>
                  <img src={resultImagePreview} alt="Analyzed" style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: '6px' }} />
                </div>
              )}

              <SectionCard icon={ImageIcon} title="Hook / Thumbnail Assessment">
                <div style={{ marginBottom: '10px' }}><RatingBadge rating={hook.rating} /></div>
                {hook.strengths?.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '10.5px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>Strong</p>
                    {hook.strengths.map((s, i) => <p key={i} style={{ margin: '0 0 3px', fontSize: '13px', color: BONE, lineHeight: 1.5 }}>✓ {s}</p>)}
                  </div>
                )}
                {hook.weaknesses?.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '10.5px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>Weak</p>
                    {hook.weaknesses.map((s, i) => <p key={i} style={{ margin: '0 0 3px', fontSize: '13px', color: BONE, lineHeight: 1.5 }}>✗ {s}</p>)}
                  </div>
                )}
                {hook.reasoning && <p style={{ margin: '8px 0 0', fontSize: '12.5px', color: MUTED, lineHeight: 1.55, fontStyle: 'italic' }}>{hook.reasoning}</p>}
              </SectionCard>

              <SectionCard icon={MessageCircle} title="Caption Analysis">
                {cap.hook_quality && <p style={{ margin: '0 0 8px', fontSize: '13px', color: BONE, lineHeight: 1.5 }}>{cap.hook_quality}</p>}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: cap.has_clear_cta ? GREEN : RED, background: cap.has_clear_cta ? 'rgba(63,166,107,0.1)' : 'rgba(196,69,58,0.1)', border: `1px solid ${cap.has_clear_cta ? 'rgba(63,166,107,0.3)' : 'rgba(196,69,58,0.3)'}`, borderRadius: '20px', padding: '3px 10px' }}>
                    {cap.has_clear_cta ? '✓ Has CTA' : '✗ No clear CTA'}
                  </span>
                </div>
                {cap.cta_feedback && <p style={{ margin: '0 0 6px', fontSize: '12.5px', color: MUTED, lineHeight: 1.5 }}>{cap.cta_feedback}</p>}
                {cap.length_feedback && <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: MUTED, lineHeight: 1.5 }}>{cap.length_feedback}</p>}
                <HashtagGroup label="Broad" tags={cap.hashtags?.broad} />
                <HashtagGroup label="Niche" tags={cap.hashtags?.niche} />
                <HashtagGroup label="Local" tags={cap.hashtags?.local} />
              </SectionCard>

              <SectionCard icon={Palette} title="Visual Psychology">
                {vis.color_observations && <p style={{ margin: '0 0 8px', fontSize: '13px', color: BONE, lineHeight: 1.5 }}><strong>Color:</strong> {vis.color_observations}</p>}
                {vis.emotional_tone && <p style={{ margin: '0 0 8px', fontSize: '13px', color: BONE, lineHeight: 1.5 }}><strong>Tone:</strong> {vis.emotional_tone}</p>}
                {vis.brand_consistency && <p style={{ margin: 0, fontSize: '12.5px', color: MUTED, lineHeight: 1.5 }}><strong>Brand fit:</strong> {vis.brand_consistency}</p>}
              </SectionCard>

              <div style={{ ...cardInner, border: `1px solid ${GOLD_BDR}`, padding: '18px 20px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Wand2 size={14} color={GOLD} />
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Coach Feedback</p>
                </div>
                {coach.map((line, i) => (
                  <div key={i} style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', marginBottom: '9px' }}>
                    <span style={{ fontSize: '13px', color: GOLD, fontWeight: '700', flexShrink: 0 }}>{i + 1}.</span>
                    <p style={{ margin: 0, fontSize: '13.5px', color: BONE, lineHeight: 1.55, fontWeight: '500' }}>{line}</p>
                  </div>
                ))}
              </div>

              <SectionCard icon={Hash} title="Improvement Suggestions">
                {imp.rewritten_caption && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <p style={{ margin: 0, fontSize: '10.5px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>Rewritten Caption</p>
                      <CopyBtn text={imp.rewritten_caption} />
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: BONE, lineHeight: 1.55, background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '10px 12px' }}>{imp.rewritten_caption}</p>
                  </div>
                )}
                {imp.suggested_cta && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <p style={{ margin: 0, fontSize: '10.5px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>Suggested CTA</p>
                      <CopyBtn text={imp.suggested_cta} />
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: BONE, lineHeight: 1.5 }}>{imp.suggested_cta}</p>
                  </div>
                )}
                {imp.retake_suggestion && (
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '10.5px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>Retake Suggestion</p>
                    <p style={{ margin: 0, fontSize: '13px', color: BONE, lineHeight: 1.5 }}>{imp.retake_suggestion}</p>
                  </div>
                )}
              </SectionCard>

              {result.note && (
                <p style={{ margin: '0 0 4px', fontSize: '11.5px', color: MUTED, lineHeight: 1.5 }}>{result.note}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
