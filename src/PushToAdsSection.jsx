import { BACKEND, apiFetch } from './lib/api'
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { ExternalLink, X, Rocket, AlertTriangle } from 'lucide-react'
import { useToast } from './ToastContext'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'


const LS_KEY_GADS_PUSH = 'adsoh_gads_push_result'
const LS_KEY_MADS_PUSH = 'adsoh_mads_push_result'


const inpSt2 = { width: '100%', padding: '9px 12px', borderRadius: '6px', border: `1px solid ${SLATE_L}`, background: INK, color: BONE, fontSize: '13px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
const lbl2   = { display: 'block', color: MUTED, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }

// Extracted so other pages (e.g. Command Center) can show the exact same
// "campaign created" card for a Google Ads result without duplicating this
// markup — same shape as gads_create_campaign's JSON response.
export function GoogleCampaignSuccessCard({ result, onClose }) {
  if (!result) return null
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(63,166,107,0.1)', border: '2px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <span style={{ fontSize: '22px' }}>✅</span>
      </div>
      <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#166534' }}>Campaign Created!</p>
      <p style={{ margin: '0 0 16px', fontSize: '12px', color: MUTED }}>Status: PAUSED — enable it in Google Ads when ready</p>
      <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '14px', textAlign: 'left', marginBottom: '16px' }}>
        <p style={{ margin: '0 0 5px', fontSize: '12px', color: MUTED }}><strong style={{ color: BONE }}>Campaign:</strong> {result.campaign_name}</p>
        <p style={{ margin: '0 0 5px', fontSize: '12px', color: MUTED }}><strong style={{ color: BONE }}>Campaign ID:</strong> {result.campaign_id}</p>
        <p style={{ margin: '0 0 5px', fontSize: '12px', color: MUTED }}><strong style={{ color: BONE }}>Ad Group ID:</strong> {result.ad_group_id}</p>
        <p style={{ margin: '0', fontSize: '12px', color: MUTED }}><strong style={{ color: BONE }}>Keywords from memory:</strong> {result.keywords_added || 0}</p>
      </div>
      {!result.ad_created && result.ad_creation_error && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', padding: '10px 13px', marginBottom: '16px', textAlign: 'left' }}>
          <p style={{ margin: '0 0 4px', fontSize: '12.5px', fontWeight: '600', color: '#92400E' }}>⚠ Campaign created but ad could not be created</p>
          {Array.isArray(result.ad_creation_error.policy_violations) ? (
            result.ad_creation_error.policy_violations.map((v, i) => (
              <div key={i} style={{ background: '#FFF5F5', borderRadius: '4px', padding: '7px 9px', marginBottom: i < result.ad_creation_error.policy_violations.length - 1 ? '6px' : 0 }}>
                <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: '700', color: '#991B1B' }}>Policy: {v.topic}</p>
                {v.offending_text && v.offending_text.length > 0 && (
                  <p style={{ margin: '0 0 3px', fontSize: '11.5px', color: '#92400E' }}>Flagged text: "{v.offending_text.join('", "')}"</p>
                )}
                <p style={{ margin: 0, fontSize: '11.5px', color: '#92400E' }}>{v.explanation}</p>
              </div>
            ))
          ) : Array.isArray(result.ad_creation_error.details) ? (
            result.ad_creation_error.details.map((m, i) => (
              <p key={i} style={{ margin: '0 0 2px', fontSize: '12px', color: '#92400E' }}>{m}</p>
            ))
          ) : Array.isArray(result.ad_creation_error) ? (
            result.ad_creation_error.map((e, i) => (
              <p key={i} style={{ margin: '0 0 2px', fontSize: '12px', color: '#92400E' }}>{e.message}{e.field ? ` (field: ${e.field})` : ''}</p>
            ))
          ) : (
            <p style={{ margin: 0, fontSize: '12px', color: '#92400E' }}>
              {typeof result.ad_creation_error === 'string' ? result.ad_creation_error : (result.ad_creation_error.error || 'Unknown reason.')}
            </p>
          )}
          <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#92400E', opacity: 0.85 }}>Add an ad manually in Google Ads, or fix the flagged text and regenerate the Campaign Launch Kit before pushing again.</p>
        </div>
      )}
      {result.ad_created && result.ad_creation_error && result.ad_creation_error.retried && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '10px 13px', marginBottom: '16px', textAlign: 'left' }}>
          <p style={{ margin: '0 0 4px', fontSize: '12.5px', fontWeight: '600', color: '#1E40AF' }}>ℹ Ad created with some assets removed</p>
          <p style={{ margin: 0, fontSize: '11.5px', color: '#1E40AF' }}>{result.ad_creation_error.note}</p>
        </div>
      )}
      <a href={result.google_ads_dashboard} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#34A853', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginBottom: '10px' }}>
        <ExternalLink size={13} /> Open in Google Ads
      </a>
      {onClose && (<><br /><button onClick={onClose} style={{ background: 'none', border: 'none', color: MUTED, fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>Close</button></>)}
    </div>
  )
}

// Shared Push-to-Google-Ads / Push-to-Meta-Ads modal + logic, used by both
// MarketingBrain.jsx and SmartAnalysis.jsx so the flow (and its persisted
// result) is identical everywhere it appears. Exposes openGAds()/openMAds()
// via ref so a caller-specific button (e.g. a banner CTA) can trigger the
// same modals without re-rendering another instance of this component.
const PushToAdsSection = forwardRef(function PushToAdsSection(
  { url = '', industry = '', city = '', budget = '', businessKey = '', hideButtons = false },
  ref
) {
  const toast = useToast()

  const [connStatus, setConnStatus] = useState(null)

  useEffect(() => {
    apiFetch(`${BACKEND}/connected-accounts`)
      .then(r => r.json())
      .then(d => setConnStatus(d))
      .catch(() => {})
  }, [])

  const [showGAdsModal, setShowGAdsModal]     = useState(false)
  const [gAdsForm, setGAdsForm]               = useState({ campaign_name: '', budget_daily: '', start_date: '', end_date: '', campaign_type: 'SEARCH' })
  const [gAdsLoading, setGAdsLoading]         = useState(false)
  const [gAdsResult, setGAdsResult]           = useState(null)
  const [gAdsError, setGAdsError]             = useState(null)
  const [preflightLoading, setPreflightLoading] = useState(false)
  const [preflightData, setPreflightData]     = useState(null)
  const [showPreflight, setShowPreflight]     = useState(false)

  const [showMAdsModal, setShowMAdsModal]         = useState(false)
  const [mAdsForm, setMAdsForm]                   = useState({ campaign_name: '', budget_daily: '', creative_id: '' })
  const [mAdsLoading, setMAdsLoading]             = useState(false)
  const [mAdsResult, setMAdsResult]               = useState(null)
  const [mAdsError, setMAdsError]                 = useState(null)
  const [metaPreflightLoading, setMetaPreflightLoading] = useState(false)
  const [metaPreflightData, setMetaPreflightData]       = useState(null)
  const [showMetaPreflight, setShowMetaPreflight]       = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem(LS_KEY_GADS_PUSH); if (s) setGAdsResult(JSON.parse(s)) } catch {}
    try { const s = localStorage.getItem(LS_KEY_MADS_PUSH); if (s) setMAdsResult(JSON.parse(s)) } catch {}
  }, [])

  function openGAdsModal() {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
    const defaultStart = tomorrow.toISOString().split('T')[0]
    const cleanUrl = (url || '').replace(/https?:\/\//, '').replace(/\/$/, '').split('/')[0]
    const defaultName = cleanUrl ? `${cleanUrl} — Google Search` : industry ? `${industry} — ${city}` : 'New Google Campaign'
    setGAdsForm({
      campaign_name: defaultName,
      budget_daily:  budget ? String(Math.round(parseInt(budget) / 30)) : '1000',
      start_date:    defaultStart,
      end_date:      '',
      campaign_type: 'SEARCH',
    })
    // Deliberately NOT resetting gAdsResult/gAdsError — a completed push
    // should stay visible on reopen, not reset to a blank form.
    setShowGAdsModal(true)
  }

  async function handleGAdsLaunch() {
    if (!gAdsForm.campaign_name || !gAdsForm.budget_daily) {
      setGAdsError('Campaign name and daily budget are required.')
      return
    }
    // Step 1: run pre-flight check before creating campaign
    setPreflightLoading(true); setGAdsError(null)
    try {
      const pfRes = await apiFetch(`${BACKEND}/google-ads/preflight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url || '', budget_daily: parseFloat(gAdsForm.budget_daily), business_key: businessKey || '', industry: industry || '', city: city || '' }),
      })
      const pfJson = await pfRes.json()
      if (pfJson.success) {
        setPreflightData({ ...pfJson.launch_readiness, _form: { ...gAdsForm } })
        setShowPreflight(true)
      } else {
        setGAdsError(pfJson.error || 'Pre-flight check failed.')
      }
    } catch (err) { setGAdsError(`Pre-flight error: ${err.message}`) }
    setPreflightLoading(false)
  }

  async function confirmGAdsLaunch(forceOverride = false) {
    if (!preflightData?._form) return
    const form = preflightData._form
    setShowPreflight(false)
    setGAdsLoading(true); setGAdsError(null)
    try {
      const res = await apiFetch(`${BACKEND}/google-ads/create-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name:  form.campaign_name,
          budget_daily:   parseFloat(form.budget_daily),
          campaign_type:  form.campaign_type || 'SEARCH',
          start_date:     form.start_date.replace(/-/g, ''),
          end_date:       form.end_date ? form.end_date.replace(/-/g, '') : '',
          business_key:   businessKey || '',
          url:            url || '',
          industry:       industry || '',
          city:           city || '',
          force_override: forceOverride,
        }),
      })
      const data = await res.json()
      if (data.success) { setGAdsResult(data); setGAdsError(null); localStorage.setItem(LS_KEY_GADS_PUSH, JSON.stringify(data)); toast.success('Done!') }
      else if (data.connect_required) { setGAdsError('__CONNECT_REQUIRED__'); toast.error('Connect your Google Ads account first') }
      else if (data.preflight_blocked) { setGAdsError(`Pre-flight blocked: ${data.launch_readiness?.blocking_issues?.map(b => b.message).join(' | ')}`); toast.error('Pre-flight check failed') }
      else if (data.errors && Array.isArray(data.errors)) { setGAdsError(data.errors); toast.error(data.errors[0]?.message || 'Campaign creation failed.') }
      else { setGAdsError(data.error || 'Campaign creation failed.'); toast.error(data.error || 'Campaign creation failed.') }
    } catch (err) { setGAdsError(`Network error: ${err.message}`); toast.error(`Network error: ${err.message}`) }
    setGAdsLoading(false)
  }

  function openMAdsModal() {
    const cleanUrl = (url || '').replace(/https?:\/\//, '').replace(/\/$/, '').split('/')[0]
    const defaultName = cleanUrl ? `${cleanUrl} — Meta Leads` : industry ? `${industry} — ${city || 'India'}` : 'New Meta Campaign'
    setMAdsForm({
      campaign_name: defaultName,
      budget_daily:  budget ? String(Math.round(parseInt(budget) / 30)) : '300',
      creative_id:   '',
    })
    // Deliberately NOT resetting mAdsResult/mAdsError — same reason as above.
    setShowMAdsModal(true)
  }

  async function handleMAdsLaunch() {
    if (!mAdsForm.campaign_name || !mAdsForm.budget_daily) {
      setMAdsError('Campaign name and daily budget are required.')
      return
    }
    // Step 1: run Meta pre-flight check before creating campaign
    setMetaPreflightLoading(true); setMAdsError(null)
    try {
      const pfRes = await apiFetch(`${BACKEND}/meta-ads/preflight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url:          url || '',
          budget_daily: parseFloat(mAdsForm.budget_daily),
          creative_id:  mAdsForm.creative_id.trim() || '',
        }),
      })
      const pfJson = await pfRes.json()
      if (pfJson.success) {
        setMetaPreflightData({ ...pfJson.launch_readiness, _form: { ...mAdsForm } })
        setShowMetaPreflight(true)
      } else {
        setMAdsError({ error: pfJson.error || 'Pre-flight check failed.' })
      }
    } catch (err) { setMAdsError({ error: `Pre-flight error: ${err.message}` }) }
    setMetaPreflightLoading(false)
  }

  async function confirmMAdsLaunch(forceOverride = false) {
    if (!metaPreflightData?._form) return
    const form = metaPreflightData._form
    setShowMetaPreflight(false)
    setMAdsLoading(true); setMAdsError(null)
    try {
      const res = await apiFetch(`${BACKEND}/meta-ads/create-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name:  form.campaign_name,
          daily_budget:   parseFloat(form.budget_daily),
          creative_id:    form.creative_id.trim(),
          business_key:   businessKey || '',
          url:            url || '',
          industry:       industry || '',
          city:           city || '',
          force_override: forceOverride,
        }),
      })
      const data = await res.json()
      if (data.success) { setMAdsResult(data); setMAdsError(null); localStorage.setItem(LS_KEY_MADS_PUSH, JSON.stringify(data)); toast.success('Done!') }
      else if (data.connect_required) { setMAdsError({ error: '__CONNECT_REQUIRED__' }); toast.error('Connect your Meta Ads account first') }
      else if (data.preflight_blocked) { setMAdsError({ error: `Pre-flight blocked: ${data.launch_readiness?.blocking_issues?.map(b => b.message).join(' | ')}` }); toast.error('Meta pre-flight check failed') }
      else { setMAdsError(data); toast.error(data.error || 'Campaign creation failed.') }
    } catch (err) { setMAdsError({ error: `Network error: ${err.message}` }); toast.error(`Network error: ${err.message}`) }
    setMAdsLoading(false)
  }

  function resetPersisted() {
    localStorage.removeItem(LS_KEY_GADS_PUSH)
    localStorage.removeItem(LS_KEY_MADS_PUSH)
    setGAdsResult(null); setGAdsError(null)
    setMAdsResult(null); setMAdsError(null)
  }

  useImperativeHandle(ref, () => ({ openGAds: openGAdsModal, openMAds: openMAdsModal, resetPersisted }))

  return (
    <>
      {!hideButtons && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={e => { e.stopPropagation(); openGAdsModal() }} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: SLATE, border: '1.5px solid #34A853', color: '#34A853', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>G</span> Push to Google Ads
          </button>
          <button onClick={e => { e.stopPropagation(); openMAdsModal() }} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: SLATE, border: '1.5px solid #1877F2', color: '#1877F2', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>f</span> Push to Meta Ads
          </button>
        </div>
      )}

      {/* Google Ads Campaign Modal */}
      {showGAdsModal && (
        <div onClick={() => setShowGAdsModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}><div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ background: SLATE, borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#34A853', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#fff' }}>G</span>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: BONE }}>Create Google Campaign</p>
              </div>
              <button onClick={() => setShowGAdsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: MUTED, display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              {!gAdsResult ? (
                connStatus?.google_ads?.connected === false || gAdsError === '__CONNECT_REQUIRED__' ? (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔗</div>
                    <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '600', color: BONE }}>Google Ads account required</p>
                    <p style={{ margin: '0 0 20px', fontSize: '12px', color: MUTED }}>Connect your Google Ads account to push campaigns directly from here.</p>
                    <a href="/account" style={{ display: 'inline-block', background: '#34A853', color: '#fff', padding: '10px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                      Go to Account → Connect
                    </a>
                  </div>
                ) : (
                <>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: MUTED, background: '#F9FAFB', borderRadius: '6px', padding: '9px 12px', border: '1px solid #F0F0F0' }}>
                    Campaign will be created in <strong>PAUSED</strong> status — review it in Google Ads before going live.
                  </p>
                  {gAdsError && (
                    <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '6px', padding: '10px 13px', marginBottom: '14px', color: RED, fontSize: '12.5px' }}>
                      {Array.isArray(gAdsError) ? (
                        <>
                          <p style={{ margin: '0 0 8px', fontWeight: '600' }}>Google Ads API Error{gAdsError.length > 1 ? 's' : ''}:</p>
                          {gAdsError.map((e, i) => (
                            <div key={i} style={{ background: '#FFF5F5', borderRadius: '4px', padding: '7px 9px', marginBottom: i < gAdsError.length - 1 ? '6px' : 0 }}>
                              <p style={{ margin: '0 0 2px', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9B1C1C' }}>{e.error_code || 'UNKNOWN_CODE'}</p>
                              <p style={{ margin: '0 0 2px', fontSize: '12.5px', color: RED }}>{e.message}</p>
                              {e.field && <p style={{ margin: 0, fontSize: '11px', color: '#9B1C1C', opacity: 0.8 }}>Field: {e.field}</p>}
                            </div>
                          ))}
                        </>
                      ) : gAdsError}
                    </div>
                  )}
                  <div style={{ marginBottom: '13px' }}>
                    <label style={lbl2}>Campaign Name</label>
                    <input type="text" value={gAdsForm.campaign_name} onChange={e => setGAdsForm(f => ({ ...f, campaign_name: e.target.value }))} style={inpSt2} placeholder="e.g. sohscape.com — Google Search" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '13px' }}>
                    <div>
                      <label style={lbl2}>Daily Budget (₹)</label>
                      <input type="number" value={gAdsForm.budget_daily} onChange={e => setGAdsForm(f => ({ ...f, budget_daily: e.target.value }))} style={inpSt2} placeholder="1000" min="100" />
                    </div>
                    <div>
                      <label style={lbl2}>Campaign Type</label>
                      <select value={gAdsForm.campaign_type} onChange={e => setGAdsForm(f => ({ ...f, campaign_type: e.target.value }))} style={inpSt2}>
                        <option value="SEARCH">Search</option>
                        <option value="DISPLAY" disabled>Display (coming soon)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                    <div>
                      <label style={lbl2}>Start Date</label>
                      <input type="date" value={gAdsForm.start_date} onChange={e => setGAdsForm(f => ({ ...f, start_date: e.target.value }))} style={inpSt2} />
                    </div>
                    <div>
                      <label style={lbl2}>End Date <span style={{ fontWeight: '400', textTransform: 'none', color: MUTED }}>(optional)</span></label>
                      <input type="date" value={gAdsForm.end_date} onChange={e => setGAdsForm(f => ({ ...f, end_date: e.target.value }))} style={inpSt2} />
                    </div>
                  </div>
                  <button onClick={handleGAdsLaunch} disabled={gAdsLoading || preflightLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: gAdsLoading || preflightLoading ? '#E5E5E5' : '#16A34A', border: 'none', color: gAdsLoading || preflightLoading ? '#999' : '#fff', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: gAdsLoading || preflightLoading ? 'not-allowed' : 'pointer' }}>
                    <Rocket size={15} />
                    {preflightLoading ? 'Running pre-flight check…' : gAdsLoading ? 'Creating campaign...' : 'Launch Campaign 🚀'}
                  </button>
                </>
                )
              ) : (
                <GoogleCampaignSuccessCard result={gAdsResult} onClose={() => setShowGAdsModal(false)} />
              )}
            </div>
          </div>
        </div></div>
      )}

      {/* Meta Ads Campaign Modal */}
      {showMAdsModal && (
        <div onClick={() => setShowMAdsModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}><div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ background: SLATE, borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1877F2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#fff' }}>f</span>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: BONE }}>Create Meta Campaign</p>
              </div>
              <button onClick={() => setShowMAdsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: MUTED, display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              {!mAdsResult ? (
                connStatus?.meta_ads?.connected === false || mAdsError?.error === '__CONNECT_REQUIRED__' ? (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔗</div>
                    <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '600', color: BONE }}>Meta Ads account required</p>
                    <p style={{ margin: '0 0 20px', fontSize: '12px', color: MUTED }}>Connect your Meta Ads account to push campaigns directly from here.</p>
                    <a href="/account" style={{ display: 'inline-block', background: '#1877F2', color: '#fff', padding: '10px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                      Go to Account → Connect
                    </a>
                  </div>
                ) : (
                <>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: MUTED, background: '#F9FAFB', borderRadius: '6px', padding: '9px 12px', border: '1px solid #F0F0F0' }}>
                    Campaign will be created in <strong>PAUSED</strong> status — review it in Meta Ads Manager before going live.
                  </p>
                  {mAdsError && mAdsError.error !== '__CONNECT_REQUIRED__' && (
                    <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '6px', padding: '10px 13px', marginBottom: '14px', color: RED, fontSize: '12.5px' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: '600' }}>{mAdsError.error || 'Campaign creation failed.'}</p>
                      {/* Backend should always send a real "error" string now — this only
                          fires if some future response shape slips through without one, so a
                          bare unhelpful fallback never hides real diagnostic detail again. */}
                      {!mAdsError.error && (
                        <pre style={{ margin: '4px 0 0', fontSize: '10.5px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: RED, opacity: 0.85 }}>
                          {JSON.stringify(mAdsError, null, 2)}
                        </pre>
                      )}
                      {(mAdsError.error_code != null || mAdsError.error_subcode != null) && (
                        <p style={{ margin: '4px 0 0', fontSize: '11px' }}>
                          {mAdsError.error_type ? `type: ${mAdsError.error_type}` : ''}
                          {mAdsError.error_code != null ? ` · code: ${mAdsError.error_code}` : ''}
                          {mAdsError.error_subcode != null ? ` · subcode: ${mAdsError.error_subcode}` : ''}
                        </p>
                      )}
                      {mAdsError.error_user_msg && (
                        <p style={{ margin: '4px 0 0', fontSize: '11px' }}>{mAdsError.error_user_msg}</p>
                      )}
                      {mAdsError.partial && Object.keys(mAdsError.partial).length > 0 && (
                        <p style={{ margin: '4px 0 0', fontSize: '11px' }}>
                          Partially created: {JSON.stringify(mAdsError.partial)} — PAUSED, may need manual cleanup.
                        </p>
                      )}
                    </div>
                  )}
                  <div style={{ marginBottom: '13px' }}>
                    <label style={lbl2}>Campaign Name</label>
                    <input type="text" value={mAdsForm.campaign_name} onChange={e => setMAdsForm(f => ({ ...f, campaign_name: e.target.value }))} style={inpSt2} placeholder="e.g. sohscape.com — Meta Leads" />
                  </div>
                  <div style={{ marginBottom: '13px' }}>
                    <label style={lbl2}>Daily Budget (₹)</label>
                    <input type="number" value={mAdsForm.budget_daily} onChange={e => setMAdsForm(f => ({ ...f, budget_daily: e.target.value }))} style={inpSt2} placeholder="300" min="100" />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={lbl2}>Post ID <span style={{ fontWeight: '400', textTransform: 'none', color: MUTED }}>(optional)</span></label>
                    <input type="text" value={mAdsForm.creative_id} onChange={e => setMAdsForm(f => ({ ...f, creative_id: e.target.value }))} style={inpSt2} placeholder="e.g. 1140954839109425_1234567890" />
                    <p style={{ margin: '5px 0 0', fontSize: '11px', color: MUTED }}>
                      Optional — leave blank to create Campaign + Ad Set only (PAUSED), then add the ad manually in Meta Ads Manager.
                    </p>
                  </div>
                  <button onClick={handleMAdsLaunch} disabled={mAdsLoading || metaPreflightLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: mAdsLoading || metaPreflightLoading ? '#E5E5E5' : '#1877F2', border: 'none', color: mAdsLoading || metaPreflightLoading ? '#999' : '#fff', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: mAdsLoading || metaPreflightLoading ? 'not-allowed' : 'pointer' }}>
                    <Rocket size={15} />
                    {metaPreflightLoading ? 'Running pre-flight…' : mAdsLoading ? 'Creating campaign...' : 'Launch on Meta Ads 🚀'}
                  </button>
                </>
                )
              ) : mAdsResult.action_needed ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFFBEB', border: '2px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <AlertTriangle size={22} color="#B45309" />
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#92400E' }}>Action Needed</p>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#92400E' }}>{mAdsResult.message}</p>
                  <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '14px', textAlign: 'left', marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 5px', fontSize: '12px', color: MUTED }}><strong style={{ color: BONE }}>Campaign ID:</strong> {mAdsResult.campaign_id}</p>
                    <p style={{ margin: '0', fontSize: '12px', color: MUTED }}><strong style={{ color: BONE }}>Ad Set ID:</strong> {mAdsResult.adset_id}</p>
                  </div>
                  <a href={mAdsResult.meta_ads_manager_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1877F2', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginBottom: '10px' }}>
                    <ExternalLink size={13} /> Open in Meta Ads Manager
                  </a>
                  <br />
                  <button onClick={() => setShowMAdsModal(false)} style={{ background: 'none', border: 'none', color: MUTED, fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>Close</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(63,166,107,0.1)', border: '2px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <span style={{ fontSize: '22px' }}>✅</span>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#166534' }}>Campaign Created!</p>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: MUTED }}>Status: PAUSED — enable it in Meta Ads Manager when ready</p>
                  <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '14px', textAlign: 'left', marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 5px', fontSize: '12px', color: MUTED }}><strong style={{ color: BONE }}>Campaign ID:</strong> {mAdsResult.campaign_id}</p>
                    <p style={{ margin: '0 0 5px', fontSize: '12px', color: MUTED }}><strong style={{ color: BONE }}>Ad Set ID:</strong> {mAdsResult.adset_id}</p>
                    <p style={{ margin: '0', fontSize: '12px', color: MUTED }}><strong style={{ color: BONE }}>Ad ID:</strong> {mAdsResult.ad_id}</p>
                  </div>
                  <a href={mAdsResult.meta_ads_manager_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1877F2', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginBottom: '10px' }}>
                    <ExternalLink size={13} /> Open in Meta Ads Manager
                  </a>
                  <br />
                  <button onClick={() => setShowMAdsModal(false)} style={{ background: 'none', border: 'none', color: MUTED, fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div></div>
      )}
      {/* Zero-Waste Pre-flight Modal — Google Ads */}
      {showPreflight && preflightData && (() => {
        const blocking = preflightData.blocking_issues || []
        const warns    = (preflightData.warnings || []).filter(w => w.severity !== 'info')
        const infos    = (preflightData.warnings || []).filter(w => w.severity === 'info')
        const hasBlock = blocking.length > 0
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: SLATE, border: `1px solid ${SLATE_L}`, borderRadius: '12px', maxWidth: '520px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${SLATE_L}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: BONE }}>Zero-Waste Launch Guard</p>
                  <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: MUTED }}>{preflightData.summary}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '4px', background: preflightData.tracking_status === 'NOT_CONVERSION_TRACKED' ? '#3B0000' : 'rgba(63,166,107,0.15)', color: preflightData.tracking_status === 'NOT_CONVERSION_TRACKED' ? RED : GREEN, border: `1px solid ${preflightData.tracking_status === 'NOT_CONVERSION_TRACKED' ? RED + '40' : GREEN + '40'}` }}>
                  {preflightData.tracking_label || preflightData.tracking_status}
                </span>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {blocking.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ margin: '0 0 7px', fontSize: '10.5px', fontWeight: '700', color: RED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Blocking Issues ({blocking.length})</p>
                    {blocking.map((b, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', background: 'rgba(239,68,68,0.08)', border: `1px solid ${RED}30`, borderRadius: '7px', padding: '9px 11px', marginBottom: '5px' }}>
                        <span style={{ color: RED, flexShrink: 0 }}>✕</span>
                        <p style={{ margin: 0, fontSize: '12px', color: '#FCA5A5', lineHeight: 1.5 }}>{b.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                {warns.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ margin: '0 0 7px', fontSize: '10.5px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Warnings ({warns.length})</p>
                    {warns.map((w, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', background: 'rgba(201,162,39,0.08)', border: `1px solid ${GOLD}30`, borderRadius: '7px', padding: '8px 11px', marginBottom: '5px' }}>
                        <span style={{ color: GOLD, flexShrink: 0 }}>⚠</span>
                        <p style={{ margin: 0, fontSize: '11.5px', color: '#FDE68A', lineHeight: 1.5 }}>{w.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                {infos.map((inf, i) => (
                  <div key={i} style={{ display: 'flex', gap: '7px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '7px 11px', marginBottom: '4px' }}>
                    <span style={{ color: MUTED, flexShrink: 0, fontSize: '12px' }}>ℹ</span>
                    <p style={{ margin: 0, fontSize: '11px', color: MUTED, lineHeight: 1.4 }}>{inf.message}</p>
                  </div>
                ))}
                {!hasBlock && warns.length === 0 && (
                  <div style={{ display: 'flex', gap: '8px', background: 'rgba(63,166,107,0.1)', border: `1px solid ${GREEN}40`, borderRadius: '7px', padding: '10px 12px', marginBottom: '12px' }}>
                    <span style={{ color: GREEN, fontSize: '15px' }}>✓</span>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6EE7B7', fontWeight: '600' }}>All checks passed — ready to launch!</p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {!hasBlock && (
                    <button onClick={() => confirmGAdsLaunch(false)} style={{ flex: 1, background: '#16A34A', color: '#fff', border: 'none', borderRadius: '7px', padding: '11px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                      Confirm Launch
                    </button>
                  )}
                  {hasBlock && (
                    <button onClick={() => confirmGAdsLaunch(true)} style={{ flex: 1, background: 'rgba(239,68,68,0.12)', color: RED, border: `1px solid ${RED}40`, borderRadius: '7px', padding: '11px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      Acknowledge Risks &amp; Launch Anyway
                    </button>
                  )}
                  <button onClick={() => { setShowPreflight(false); setPreflightData(null) }} style={{ background: 'transparent', color: MUTED, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '11px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    Fix Issues First
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Zero-Waste Pre-flight Modal — Meta Ads */}
      {showMetaPreflight && metaPreflightData && (() => {
        const blocking = metaPreflightData.blocking_issues || []
        const warns    = (metaPreflightData.warnings || []).filter(w => w.severity !== 'info')
        const infos    = (metaPreflightData.warnings || []).filter(w => w.severity === 'info')
        const hasBlock = blocking.length > 0
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: SLATE, border: `1px solid ${SLATE_L}`, borderRadius: '12px', maxWidth: '520px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${SLATE_L}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#1877F2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>f</span>
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: BONE }}>Meta Launch Guard</p>
                    <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: MUTED }}>{metaPreflightData.summary}</p>
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '4px', background: hasBlock ? '#1A0A0A' : 'rgba(24,119,242,0.12)', color: hasBlock ? RED : '#60A5FA', border: `1px solid ${hasBlock ? RED + '40' : '#1877F240'}` }}>
                  {hasBlock ? 'Blocked' : 'Ready'}
                </span>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {blocking.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ margin: '0 0 7px', fontSize: '10.5px', fontWeight: '700', color: RED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Blocking Issues ({blocking.length})</p>
                    {blocking.map((b, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', background: 'rgba(239,68,68,0.08)', border: `1px solid ${RED}30`, borderRadius: '7px', padding: '9px 11px', marginBottom: '5px' }}>
                        <span style={{ color: RED, flexShrink: 0 }}>✕</span>
                        <p style={{ margin: 0, fontSize: '12px', color: '#FCA5A5', lineHeight: 1.5 }}>{b.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                {warns.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ margin: '0 0 7px', fontSize: '10.5px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Warnings ({warns.length})</p>
                    {warns.map((w, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', background: 'rgba(201,162,39,0.08)', border: `1px solid ${GOLD}30`, borderRadius: '7px', padding: '8px 11px', marginBottom: '5px' }}>
                        <span style={{ color: GOLD, flexShrink: 0 }}>⚠</span>
                        <p style={{ margin: 0, fontSize: '11.5px', color: '#FDE68A', lineHeight: 1.5 }}>{w.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                {infos.map((inf, i) => (
                  <div key={i} style={{ display: 'flex', gap: '7px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '7px 11px', marginBottom: '4px' }}>
                    <span style={{ color: MUTED, flexShrink: 0, fontSize: '12px' }}>ℹ</span>
                    <p style={{ margin: 0, fontSize: '11px', color: MUTED, lineHeight: 1.4 }}>{inf.message}</p>
                  </div>
                ))}
                {!hasBlock && warns.length === 0 && (
                  <div style={{ display: 'flex', gap: '8px', background: 'rgba(24,119,242,0.1)', border: '1px solid #1877F240', borderRadius: '7px', padding: '10px 12px', marginBottom: '12px' }}>
                    <span style={{ color: '#60A5FA', fontSize: '15px' }}>✓</span>
                    <p style={{ margin: 0, fontSize: '13px', color: '#93C5FD', fontWeight: '600' }}>All checks passed — ready to launch on Meta!</p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {!hasBlock && (
                    <button onClick={() => confirmMAdsLaunch(false)} style={{ flex: 1, background: '#1877F2', color: '#fff', border: 'none', borderRadius: '7px', padding: '11px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                      Confirm Launch
                    </button>
                  )}
                  {hasBlock && (
                    <button onClick={() => confirmMAdsLaunch(true)} style={{ flex: 1, background: 'rgba(239,68,68,0.12)', color: RED, border: `1px solid ${RED}40`, borderRadius: '7px', padding: '11px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      Acknowledge Risks &amp; Launch Anyway
                    </button>
                  )}
                  <button onClick={() => { setShowMetaPreflight(false); setMetaPreflightData(null) }} style={{ background: 'transparent', color: MUTED, border: `1px solid ${SLATE_L}`, borderRadius: '7px', padding: '11px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    Fix Issues First
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
})

export default PushToAdsSection
