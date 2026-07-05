import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { ExternalLink, X, Rocket, AlertTriangle } from 'lucide-react'
import { useToast } from './ToastContext'

const LS_KEY_GADS_PUSH = 'adsoh_gads_push_result'
const LS_KEY_MADS_PUSH = 'adsoh_mads_push_result'
const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

const inpSt2 = { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #E5E5E5', background: '#FAFAFA', color: '#171717', fontSize: '13px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
const lbl2   = { display: 'block', color: '#888', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }

// Shared Push-to-Google-Ads / Push-to-Meta-Ads modal + logic, used by both
// MarketingBrain.jsx and SmartAnalysis.jsx so the flow (and its persisted
// result) is identical everywhere it appears. Exposes openGAds()/openMAds()
// via ref so a caller-specific button (e.g. a banner CTA) can trigger the
// same modals without re-rendering another instance of this component.
const PushToAdsSection = forwardRef(function PushToAdsSection(
  { url = '', industry = '', city = 'Jaipur', budget = '', businessKey = '', hideButtons = false },
  ref
) {
  const toast = useToast()

  const [showGAdsModal, setShowGAdsModal] = useState(false)
  const [gAdsForm, setGAdsForm]           = useState({ campaign_name: '', budget_daily: '', start_date: '', end_date: '', campaign_type: 'SEARCH' })
  const [gAdsLoading, setGAdsLoading]     = useState(false)
  const [gAdsResult, setGAdsResult]       = useState(null)
  const [gAdsError, setGAdsError]         = useState(null)

  const [showMAdsModal, setShowMAdsModal] = useState(false)
  const [mAdsForm, setMAdsForm]           = useState({ campaign_name: '', budget_daily: '', creative_id: '' })
  const [mAdsLoading, setMAdsLoading]     = useState(false)
  const [mAdsResult, setMAdsResult]       = useState(null)
  const [mAdsError, setMAdsError]         = useState(null)

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
    setGAdsLoading(true); setGAdsError(null)
    try {
      const res = await fetch(`${BACKEND}/google-ads/create-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name: gAdsForm.campaign_name,
          budget_daily:  parseFloat(gAdsForm.budget_daily),
          campaign_type: gAdsForm.campaign_type || 'SEARCH',
          start_date:    gAdsForm.start_date.replace(/-/g, ''),
          end_date:      gAdsForm.end_date ? gAdsForm.end_date.replace(/-/g, '') : '',
          business_key:  businessKey || '',
          url:           url || '',
          industry:      industry || '',
          city:          city || 'Jaipur',
        }),
      })
      const data = await res.json()
      if (data.success) { setGAdsResult(data); setGAdsError(null); localStorage.setItem(LS_KEY_GADS_PUSH, JSON.stringify(data)); toast.success('Done!') }
      else if (data.errors && Array.isArray(data.errors)) { setGAdsError(data.errors); toast.error(data.errors[0]?.message || 'Campaign creation failed.') }
      else { setGAdsError(data.error || 'Campaign creation failed.'); toast.error(data.error || 'Campaign creation failed.') }
    } catch (err) { setGAdsError(`Network error: ${err.message}`); toast.error(`Network error: ${err.message}`) }
    setGAdsLoading(false)
  }

  function openMAdsModal() {
    const cleanUrl = (url || '').replace(/https?:\/\//, '').replace(/\/$/, '').split('/')[0]
    const defaultName = cleanUrl ? `${cleanUrl} — Meta Leads` : industry ? `${industry} — ${city}` : 'New Meta Campaign'
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
    setMAdsLoading(true); setMAdsError(null)
    try {
      const res = await fetch(`${BACKEND}/meta-ads/create-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name: mAdsForm.campaign_name,
          daily_budget:  parseFloat(mAdsForm.budget_daily),
          creative_id:   mAdsForm.creative_id.trim() || null,
          business_key:  businessKey || '',
          url:           url || '',
          industry:      industry || '',
          city:          city || 'Jaipur',
        }),
      })
      const data = await res.json()
      if (data.success) { setMAdsResult(data); setMAdsError(null); localStorage.setItem(LS_KEY_MADS_PUSH, JSON.stringify(data)); toast.success('Done!') }
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
          <button onClick={e => { e.stopPropagation(); openGAdsModal() }} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1.5px solid #34A853', color: '#34A853', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>G</span> Push to Google Ads
          </button>
          <button onClick={e => { e.stopPropagation(); openMAdsModal() }} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1.5px solid #1877F2', color: '#1877F2', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>f</span> Push to Meta Ads
          </button>
        </div>
      )}

      {/* Google Ads Campaign Modal */}
      {showGAdsModal && (
        <div onClick={() => setShowGAdsModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}><div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#34A853', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#fff' }}>G</span>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#171717' }}>Create Google Campaign</p>
              </div>
              <button onClick={() => setShowGAdsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#888', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              {!gAdsResult ? (
                <>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#888', background: '#F9FAFB', borderRadius: '6px', padding: '9px 12px', border: '1px solid #F0F0F0' }}>
                    Campaign will be created in <strong>PAUSED</strong> status — review it in Google Ads before going live.
                  </p>
                  {gAdsError && (
                    <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '6px', padding: '10px 13px', marginBottom: '14px', color: '#BE123C', fontSize: '12.5px' }}>
                      {Array.isArray(gAdsError) ? (
                        <>
                          <p style={{ margin: '0 0 8px', fontWeight: '600' }}>Google Ads API Error{gAdsError.length > 1 ? 's' : ''}:</p>
                          {gAdsError.map((e, i) => (
                            <div key={i} style={{ background: '#FFF5F5', borderRadius: '4px', padding: '7px 9px', marginBottom: i < gAdsError.length - 1 ? '6px' : 0 }}>
                              <p style={{ margin: '0 0 2px', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9B1C1C' }}>{e.error_code || 'UNKNOWN_CODE'}</p>
                              <p style={{ margin: '0 0 2px', fontSize: '12.5px', color: '#BE123C' }}>{e.message}</p>
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
                      <label style={lbl2}>End Date <span style={{ fontWeight: '400', textTransform: 'none', color: '#BBB' }}>(optional)</span></label>
                      <input type="date" value={gAdsForm.end_date} onChange={e => setGAdsForm(f => ({ ...f, end_date: e.target.value }))} style={inpSt2} />
                    </div>
                  </div>
                  <button onClick={handleGAdsLaunch} disabled={gAdsLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: gAdsLoading ? '#E5E5E5' : '#16A34A', border: 'none', color: gAdsLoading ? '#999' : '#fff', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: gAdsLoading ? 'not-allowed' : 'pointer' }}>
                    <Rocket size={15} />
                    {gAdsLoading ? 'Creating campaign...' : 'Launch Campaign 🚀'}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F0FDF4', border: '2px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <span style={{ fontSize: '22px' }}>✅</span>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#166534' }}>Campaign Created!</p>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#888' }}>Status: PAUSED — enable it in Google Ads when ready</p>
                  <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '14px', textAlign: 'left', marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Campaign:</strong> {gAdsResult.campaign_name}</p>
                    <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Campaign ID:</strong> {gAdsResult.campaign_id}</p>
                    <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Ad Group ID:</strong> {gAdsResult.ad_group_id}</p>
                    <p style={{ margin: '0', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Keywords from memory:</strong> {gAdsResult.keywords_added || 0}</p>
                  </div>
                  {!gAdsResult.ad_created && (
                    <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', padding: '10px 13px', marginBottom: '16px', textAlign: 'left' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '12.5px', fontWeight: '600', color: '#92400E' }}>⚠ Campaign created but ad could not be created</p>
                      {Array.isArray(gAdsResult.ad_creation_error) ? (
                        gAdsResult.ad_creation_error.map((e, i) => (
                          <p key={i} style={{ margin: '0 0 2px', fontSize: '12px', color: '#92400E' }}>{e.message}{e.field ? ` (field: ${e.field})` : ''}</p>
                        ))
                      ) : (
                        <p style={{ margin: 0, fontSize: '12px', color: '#92400E' }}>{gAdsResult.ad_creation_error || 'Unknown reason.'}</p>
                      )}
                      <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#92400E', opacity: 0.85 }}>Add an ad manually in Google Ads, or fix the issue and regenerate the Campaign Launch Kit before pushing again.</p>
                    </div>
                  )}
                  <a href={gAdsResult.google_ads_dashboard} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#34A853', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginBottom: '10px' }}>
                    <ExternalLink size={13} /> Open in Google Ads
                  </a>
                  <br />
                  <button onClick={() => setShowGAdsModal(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div></div>
      )}

      {/* Meta Ads Campaign Modal */}
      {showMAdsModal && (
        <div onClick={() => setShowMAdsModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}><div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1877F2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#fff' }}>f</span>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#171717' }}>Create Meta Campaign</p>
              </div>
              <button onClick={() => setShowMAdsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#888', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              {!mAdsResult ? (
                <>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#888', background: '#F9FAFB', borderRadius: '6px', padding: '9px 12px', border: '1px solid #F0F0F0' }}>
                    Campaign will be created in <strong>PAUSED</strong> status — review it in Meta Ads Manager before going live.
                  </p>
                  {mAdsError && (
                    <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '6px', padding: '10px 13px', marginBottom: '14px', color: '#BE123C', fontSize: '12.5px' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: '600' }}>{mAdsError.error || 'Campaign creation failed.'}</p>
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
                    <label style={lbl2}>Post ID <span style={{ fontWeight: '400', textTransform: 'none', color: '#BBB' }}>(optional)</span></label>
                    <input type="text" value={mAdsForm.creative_id} onChange={e => setMAdsForm(f => ({ ...f, creative_id: e.target.value }))} style={inpSt2} placeholder="e.g. 1140954839109425_1234567890" />
                    <p style={{ margin: '5px 0 0', fontSize: '11px', color: '#999' }}>
                      Optional — leave blank to create Campaign + Ad Set only (PAUSED), then add the ad manually in Meta Ads Manager.
                    </p>
                  </div>
                  <button onClick={handleMAdsLaunch} disabled={mAdsLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: mAdsLoading ? '#E5E5E5' : '#1877F2', border: 'none', color: mAdsLoading ? '#999' : '#fff', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: mAdsLoading ? 'not-allowed' : 'pointer' }}>
                    <Rocket size={15} />
                    {mAdsLoading ? 'Creating campaign...' : 'Launch on Meta Ads 🚀'}
                  </button>
                </>
              ) : mAdsResult.action_needed ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFFBEB', border: '2px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <AlertTriangle size={22} color="#B45309" />
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#92400E' }}>Action Needed</p>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#92400E' }}>{mAdsResult.message}</p>
                  <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '14px', textAlign: 'left', marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Campaign ID:</strong> {mAdsResult.campaign_id}</p>
                    <p style={{ margin: '0', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Ad Set ID:</strong> {mAdsResult.adset_id}</p>
                  </div>
                  <a href={mAdsResult.meta_ads_manager_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1877F2', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginBottom: '10px' }}>
                    <ExternalLink size={13} /> Open in Meta Ads Manager
                  </a>
                  <br />
                  <button onClick={() => setShowMAdsModal(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>Close</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F0FDF4', border: '2px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <span style={{ fontSize: '22px' }}>✅</span>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#166534' }}>Campaign Created!</p>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#888' }}>Status: PAUSED — enable it in Meta Ads Manager when ready</p>
                  <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '14px', textAlign: 'left', marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Campaign ID:</strong> {mAdsResult.campaign_id}</p>
                    <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Ad Set ID:</strong> {mAdsResult.adset_id}</p>
                    <p style={{ margin: '0', fontSize: '12px', color: '#888' }}><strong style={{ color: '#171717' }}>Ad ID:</strong> {mAdsResult.ad_id}</p>
                  </div>
                  <a href={mAdsResult.meta_ads_manager_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1877F2', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginBottom: '10px' }}>
                    <ExternalLink size={13} /> Open in Meta Ads Manager
                  </a>
                  <br />
                  <button onClick={() => setShowMAdsModal(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div></div>
      )}
    </>
  )
})

export default PushToAdsSection
