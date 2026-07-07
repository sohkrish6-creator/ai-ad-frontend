import { useState, useEffect } from 'react'
import {
  Layers, Copy, Check, Sparkles, Trophy, Database, Info, RefreshCw, Hash,
} from 'lucide-react'
import { useToast } from './ToastContext'
import { useLoadingSteps } from './useLoadingSteps'
import CityInput, { getLastCity } from './CityInput'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const GOLD    = '#D4AF37'
const LS_KEY  = 'adsoh_ad_to_creative_result'
const LOADING_STEPS = [
  'Reading campaign data...', 'Checking audience + performance signals...', 'Building 3 creative variants...',
  'Writing production-ready image prompts...', 'Scoring creatives...',
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

const CREATIVE_TYPE_LABELS = {
  core_social: 'Core Social', google_display_banner: 'Google Display Banner',
  whatsapp_status: 'WhatsApp Status', linkedin_post: 'LinkedIn Post',
}

function CreativeCard({ creative }) {
  const typeLabel = CREATIVE_TYPE_LABELS[creative.creative_type] || creative.creative_type
  const scoreVal = creative.creative_score?.value ?? creative.creative_score
  return (
    <div style={{ ...card, padding: '18px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '10.5px', fontWeight: '700', background: GOLD + '18', color: '#8A6D1D', border: `1px solid ${GOLD}40` }}>
          {typeLabel}
        </span>
        <span style={{ fontSize: '11.5px', color: '#999' }}>{creative.platform}</span>
        {scoreVal != null && (
          <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '700', color: GOLD }}>
            <Trophy size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />{scoreVal}/100
          </span>
        )}
      </div>

      {(creative.applicable_sizes || []).length > 0 && (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {creative.applicable_sizes.map((s, i) => (
            <span key={i} style={{ fontSize: '10.5px', color: '#888', background: '#F5F5F5', border: '1px solid #EAEAEA', borderRadius: '5px', padding: '2px 7px' }}>{s}</span>
          ))}
        </div>
      )}

      <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: '#171717' }}>{creative.headline}</p>
      {creative.subheadline && <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#666' }}>{creative.subheadline}</p>}
      {creative.caption && <p style={{ margin: '0 0 8px', fontSize: '12.5px', color: '#888', lineHeight: 1.5 }}>{creative.caption}</p>}
      {creative.cta && (
        <span style={{ display: 'inline-block', padding: '4px 11px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#171717', color: '#fff', marginBottom: '10px' }}>
          {creative.cta}
        </span>
      )}

      {(creative.hashtags || []).length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <Hash size={12} color="#BBB" />
          {creative.hashtags.map((h, i) => (
            <span key={i} style={{ fontSize: '11.5px', color: '#6366F1' }}>{h.startsWith('#') ? h : `#${h}`}</span>
          ))}
          <CopyBtn text={creative.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')} label="Copy tags" />
        </div>
      )}

      <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: '#888', lineHeight: 1.5 }}>
        <strong style={{ color: '#666' }}>Visual direction: </strong>{creative.visual_direction}
      </p>

      <div style={{ background: '#FAFAFA', border: '1px solid #EEE', borderRadius: '7px', padding: '12px 14px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Image Prompt — ready to paste</span>
          <CopyBtn text={creative.image_prompt} label="Copy Prompt" />
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#444', lineHeight: 1.6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
          {creative.image_prompt}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px', fontSize: '12px', color: '#666', marginBottom: '10px' }}>
        <p style={{ margin: 0 }}><strong style={{ color: '#666' }}>Layout:</strong> {creative.design_layout}</p>
        <p style={{ margin: 0 }}><strong style={{ color: '#666' }}>Audience:</strong> {creative.target_audience}</p>
        <p style={{ margin: 0, gridColumn: '1 / -1' }}><strong style={{ color: '#666' }}>Why it matches this campaign:</strong> {creative.reason_this_matches_campaign}</p>
        <p style={{ margin: 0 }}><strong style={{ color: '#16A34A' }}>Strengths:</strong> {creative.predicted_strengths}</p>
        <p style={{ margin: 0 }}><strong style={{ color: '#DC2626' }}>Risks:</strong> {creative.risks}</p>
      </div>
      {creative.creative_score?.reasoning && (
        <p style={{ margin: '0 0 4px', fontSize: '11.5px', color: '#999', fontStyle: 'italic' }}>{creative.creative_score.reasoning}</p>
      )}
      {creative.next_action && (
        <p style={{ margin: 0, fontSize: '12px', color: '#8A6D1D', fontWeight: '600' }}>Next: {creative.next_action}</p>
      )}
    </div>
  )
}

export default function AdToCreative() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const toast = useToast()

  const [mode, setMode] = useState('campaign') // 'campaign' | 'manual'
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
      const res = await fetch(`${BACKEND}/campaigns/all`)
      const data = await res.json()
      if (data.success) setCampaigns(data.campaigns || [])
    } catch {}
    setCampaignsLoading(false)
  }

  useEffect(() => { if (mode === 'campaign') loadCampaigns() }, [mode])

  async function handleGenerate() {
    if (mode === 'campaign' && !selectedCampaignId) { setError('Select a campaign first!'); return }
    if (mode === 'manual' && !url.trim()) { setError('Business URL bharo!'); return }
    setError(''); setLoading(true); setResult(null); setActiveVariant(0)
    try {
      const body = mode === 'campaign'
        ? { campaign_id: selectedCampaignId, campaign_objective: objective, offer: offer.trim() }
        : { url: url.trim(), industry: industry.trim(), city, campaign_objective: objective, offer: offer.trim() }

      const res = await fetch(`${BACKEND}/ad-to-creative`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) { setResult(data); localStorage.setItem(LS_KEY, JSON.stringify(data)); setFromCache(false); toast.success('Creatives ready!') }
      else { const msg = data.error || 'Generation failed. Try again.'; setError(msg); toast.error(msg) }
    } catch (e) { setError(`Backend se connect nahi ho paya: ${e.message}`); toast.error('Backend se connect nahi ho paya.') }
    setLoading(false)
  }

  function clearReport() {
    localStorage.removeItem(LS_KEY)
    setResult(null); setFromCache(false)
  }

  const c = result?.creative || {}
  const variants = c.variants || []
  const ds = c.data_sources_used || {}

  const page = {
    minHeight: '100vh', background: '#FAFAFA',
    padding: isMobile ? '28px 16px' : '40px 36px',
    maxWidth: '900px', width: '100%', boxSizing: 'border-box',
    fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
  }

  return (
    <div style={page}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Layers size={20} color={GOLD} />
        <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.4px' }}>Ad-to-Creative Generator</h1>
      </div>
      <p style={{ color: '#999', fontSize: '13px', margin: '0 0 8px' }}>Matching social creatives generated from a real running campaign's own data.</p>
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '7px', padding: '9px 13px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Info size={14} color="#1E40AF" style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ margin: 0, fontSize: '12px', color: '#1E40AF', lineHeight: 1.5 }}>
          Paste image prompts into Canva AI / Midjourney / DALL-E to produce visuals.
        </p>
      </div>

      {/* Input */}
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px', marginBottom: '16px' }}>
          {error && <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: '#BE123C', fontSize: '13px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '4px', marginBottom: '18px', borderBottom: '1px solid #EAEAEA' }}>
            {[{ key: 'campaign', label: 'From a Campaign' }, { key: 'manual', label: 'Manual' }].map(t => (
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

          {mode === 'campaign' ? (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Select Campaign <span style={{ color: '#DC2626' }}>*</span></label>
                <button onClick={loadCampaigns} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
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
                  <label style={lbl}>Industry <span style={{ color: '#BBB', fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
                  <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Hospitality" style={inp} />
                </div>
                <div>
                  <label style={lbl}>City <span style={{ color: '#BBB', fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
                  <CityInput value={city} onChange={setCity} style={inp} />
                </div>
              </div>
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
            <Sparkles size={15} /> {loading ? (loadingStep || 'Generating...') : 'Generate Creatives'}
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

          <div style={{ ...card, padding: '18px', marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#444', lineHeight: 1.6 }}>
              <strong>Campaign match: </strong>{c.campaign_match_summary}
            </p>
            <div style={{
              background: c.data_sufficiency?.insufficient_data ? '#FFFBEB' : '#F0FDF4',
              border: `1px solid ${c.data_sufficiency?.insufficient_data ? '#FDE68A' : '#BBF7D0'}`,
              borderRadius: '6px', padding: '9px 12px',
            }}>
              <p style={{ margin: 0, fontSize: '12.5px', color: c.data_sufficiency?.insufficient_data ? '#92400E' : '#166534' }}>
                {c.performance_context}
              </p>
            </div>
          </div>

          {/* Variant tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {variants.map((v, i) => (
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

          {variants[activeVariant] && (variants[activeVariant].creatives || []).map((creative, i) => (
            <CreativeCard key={i} creative={creative} />
          ))}

          <div style={{ ...card, padding: '18px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Database size={15} color={GOLD} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#171717' }}>Data Sources Used</p>
            </div>
            {[
              ['Campaign Data', ds.campaign_data],
              ['Performance Data', ds.performance_data],
              ['KPI Prediction', ds.kpi_prediction],
              ['Audience Intelligence', ds.audience],
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
    </div>
  )
}
