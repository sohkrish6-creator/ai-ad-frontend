import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ShieldCheck, RefreshCw } from 'lucide-react'
import CityInput, { getLastCity } from './CityInput'
import { INDUSTRIES } from './ProspectDiscovery'
import { useToast } from './ToastContext'
import { BACKEND, apiFetch } from './lib/api'
import { GOLD, card, lbl, inp, BONE, MUTED, RED, SLATE_M, SLATE_L } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

export default function VoiceOutreachBatchBuilder() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const navigate = useNavigate()
  const toast = useToast()

  const [industry, setIndustry]           = useState('')
  const [industryOther, setIndustryOther] = useState('')
  const [city, setCity]                   = useState(getLastCity)
  const [maxProspects, setMaxProspects]   = useState(15)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [rescoring, setRescoring]         = useState(false)

  const resolvedIndustry = industry === 'Other' ? industryOther : industry

  async function handleBuild() {
    if (!resolvedIndustry) { setError('Please select an industry.'); return }
    setError(''); setLoading(true)
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/build-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: resolvedIndustry, city, max_prospects: maxProspects }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Batch queued — discovering prospects...')
        navigate(`/voice-outreach/review/${data.batch_id}`)
      } else {
        const msg = data.detail || data.error || 'Could not start batch.'
        setError(msg); toast.error(msg)
      }
    } catch {
      setError('Backend se connect nahi ho paya.'); toast.error('Backend se connect nahi ho paya.')
    }
    setLoading(false)
  }

  async function handleRescore() {
    setRescoring(true)
    try {
      const res = await apiFetch(`${BACKEND}/voice-outreach/rescore-existing`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success(
          `Rescored ${data.prospects_rescored} prospect(s) — ${data.score_changed} score change(s), `
          + `${data.reverted_to_pending} reverted to pending review.`
        )
      } else {
        toast.error(data.detail || 'Could not rescore.')
      }
    } catch {
      toast.error('Backend se connect nahi ho paya.')
    }
    setRescoring(false)
  }

  return (
    <PageShell maxWidth="720px">
      <PageHeader
        title="Voice Outreach — Build Batch"
        sub="Discover real local prospects, detect genuine weaknesses, and prepare AI phone pitches for human review — no calls are made in this step."
      />

      <div style={{ ...card, padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <ShieldCheck size={16} color={GOLD} style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ margin: 0, fontSize: '12.5px', color: MUTED, lineHeight: 1.5 }}>
          This builds a batch for review only. Every prospect must be individually approved on the Review screen
          before anything else happens — nothing here places a phone call.
        </p>
      </div>

      <div style={{ ...card, padding: isMobile ? '20px 16px' : '26px' }}>
        {error && (
          <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid rgba(196,69,58,0.3)', borderRadius: '7px', padding: '11px 14px', marginBottom: '16px', color: RED, fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '14px' }}>
          <label style={lbl}>Industry <span style={{ color: RED, fontWeight: '700' }}>*</span></label>
          <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inp, color: industry ? BONE : MUTED }}>
            <option value="">— Select industry to search —</option>
            {INDUSTRIES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {industry === 'Other' && (
          <div style={{ marginBottom: '14px' }}>
            <label style={lbl}>Specify Industry</label>
            <input type="text" value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="e.g. Optical Stores" style={inp} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
          <div>
            <label style={lbl}>City</label>
            <CityInput value={city} onChange={setCity} style={inp} />
          </div>
          <div>
            <label style={lbl}>Max Prospects</label>
            <select value={maxProspects} onChange={e => setMaxProspects(Number(e.target.value))} style={inp}>
              <option value={10}>10 prospects</option>
              <option value={15}>15 prospects</option>
              <option value={20}>20 prospects</option>
              <option value={50}>50 prospects</option>
            </select>
          </div>
        </div>

        <button onClick={handleBuild} disabled={loading} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
          background: loading ? SLATE_M : GOLD, border: `1px solid ${loading ? SLATE_L : GOLD}`,
          color: loading ? MUTED : '#0B0B0D', padding: '12px 24px', borderRadius: '8px',
          fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          <Phone size={15} />
          {loading ? 'Starting batch...' : 'Build Batch for Review'}
        </button>
      </div>

      <div style={{ ...card, padding: '14px 16px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <p style={{ margin: 0, fontSize: '12px', color: MUTED, lineHeight: 1.5, maxWidth: '460px' }}>
          Rescores every not-yet-called prospect with the corrected site-fetch classifier (a real GPT call — not
          free, and one-time, never automatic). Approved prospects whose score drops too low revert to pending review.
        </p>
        <button onClick={handleRescore} disabled={rescoring} style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
          border: `1px solid ${SLATE_L}`, color: MUTED, padding: '9px 16px', borderRadius: '7px',
          fontSize: '12.5px', fontWeight: '600', cursor: rescoring ? 'not-allowed' : 'pointer', flexShrink: 0,
        }}>
          <RefreshCw size={13} /> {rescoring ? 'Rescoring...' : 'Rescore Existing Prospects'}
        </button>
      </div>
    </PageShell>
  )
}
