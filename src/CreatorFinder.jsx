import { BACKEND, apiFetch } from './lib/api'
import { useState, useEffect } from 'react'
import {
  PlaySquare, AtSign, Send, Copy, Check, ExternalLink, Mail, MessageCircle,
  ShieldCheck, ShieldAlert, Sparkles, Video,
} from 'lucide-react'
import CityInput, { getLastCity } from './CityInput'
import { useToast } from './ToastContext'
import { useLoadingSteps } from './useLoadingSteps'
import { GOLD, GOLD_BDR, card, cardInner, lbl, inp, BONE, SLATE_L, SLATE_M, MUTED, GREEN, RED } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

const LS_YT  = 'adsoh_creator_finder_youtube'
const LS_IG  = 'adsoh_creator_finder_instagram'
const LS_CTX = 'adsoh_creator_finder_campaign_ctx'

const YT_LOADING_STEPS = ['Searching YouTube channels...', 'Pulling real subscriber & view counts...', 'Scoring content relevance...']
const IG_LOADING_STEPS = ['Verifying handles via Meta Business Discovery...', 'Scoring verified profiles...']
const OUTREACH_LOADING_STEPS = ['Verifying creator data...', 'Pulling business memory...', 'Writing outreach...']

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

function fmtNum(n) {
  if (n === null || n === undefined) return null
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

function ScoreBar({ label, score }) {
  if (score === null || score === undefined) {
    return (
      <div style={{ marginBottom: '6px' }}>
        <p style={{ margin: '0 0 3px', fontSize: '10px', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '11px', color: MUTED, fontStyle: 'italic' }}>not available from real data</p>
      </div>
    )
  }
  const color = score >= 75 ? GREEN : score >= 45 ? GOLD : RED
  return (
    <div style={{ marginBottom: '6px' }}>
      <p style={{ margin: '0 0 3px', fontSize: '10px', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: SLATE_L, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: '700', color, minWidth: '24px' }}>{score}</span>
      </div>
    </div>
  )
}

function VerifiedBadge({ verified }) {
  return verified ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: '700', color: GREEN, background: 'rgba(63,166,107,0.12)', border: '1px solid rgba(63,166,107,0.3)', borderRadius: '20px', padding: '2px 9px' }}>
      <ShieldCheck size={11} /> Verified
    </span>
  ) : (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: '700', color: MUTED, background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '20px', padding: '2px 9px' }}>
      <ShieldAlert size={11} /> Not Verified
    </span>
  )
}

function CreatorCard({ c, onOutreach }) {
  const isYT = c.platform === 'youtube'
  const sizeLabel = isYT ? 'Subscribers' : 'Followers'
  const sizeValue = isYT ? c.subscriber_count : c.follower_count
  const url = isYT ? c.channel_url : (c.website || `https://instagram.com/${c.handle}`)
  const name = isYT ? c.channel_title : (c.name || c.handle)

  return (
    <div style={{ ...card, padding: '16px 18px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
          {c.thumbnail || c.profile_picture_url ? (
            <img src={c.thumbnail || c.profile_picture_url} alt="" style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: SLATE_M, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isYT ? <PlaySquare size={15} color={MUTED} /> : <AtSign size={15} color={MUTED} />}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: BONE, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
            <p style={{ margin: '1px 0 0', fontSize: '11px', color: MUTED }}>{isYT ? 'YouTube' : `@${c.handle}`}</p>
          </div>
        </div>
        <VerifiedBadge verified={c.verified !== false} />
      </div>

      {c.description && (
        <p style={{ margin: '0 0 10px', fontSize: '12px', color: MUTED, lineHeight: 1.5 }}>{c.description.slice(0, 180)}{c.description.length > 180 ? '…' : ''}</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isYT ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
        <div style={{ ...cardInner, padding: '8px 10px' }}>
          <p style={{ margin: '0 0 2px', fontSize: '10px', color: MUTED, textTransform: 'uppercase' }}>{sizeLabel}</p>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: GOLD }}>{fmtNum(sizeValue) ?? '—'}</p>
        </div>
        {isYT ? (
          <>
            <div style={{ ...cardInner, padding: '8px 10px' }}>
              <p style={{ margin: '0 0 2px', fontSize: '10px', color: MUTED, textTransform: 'uppercase' }}>Avg Recent Views</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: BONE }}>{fmtNum(c.avg_recent_views) ?? '—'}</p>
            </div>
            <div style={{ ...cardInner, padding: '8px 10px' }}>
              <p style={{ margin: '0 0 2px', fontSize: '10px', color: MUTED, textTransform: 'uppercase' }}>Videos</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: BONE }}>{fmtNum(c.video_count) ?? '—'}</p>
            </div>
          </>
        ) : (
          <div style={{ ...cardInner, padding: '8px 10px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '10px', color: MUTED, textTransform: 'uppercase' }}>Media Posts</p>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: BONE }}>{fmtNum(c.media_count) ?? '—'}</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <ScoreBar label="Audience Size Fit" score={c.audience_size_fit_score} />
        <ScoreBar label="Engagement Signal" score={c.engagement_signal_score} />
        {c.content_relevance_score !== null && c.content_relevance_score !== undefined && (
          <ScoreBar label="Content Relevance" score={c.content_relevance_score} />
        )}
      </div>

      {c.relevance_reasoning && (
        <div style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '6px', padding: '9px 12px', marginBottom: '10px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: BONE, lineHeight: 1.5 }}>{c.relevance_reasoning}</p>
        </div>
      )}

      {c.overall_score !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: MUTED, fontWeight: '700', textTransform: 'uppercase' }}>Overall Score</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: GOLD }}>{c.overall_score}/100</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {url && (
          <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#1D4ED8', textDecoration: 'none', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '5px 11px', borderRadius: '6px' }}>
            <ExternalLink size={11} /> {isYT ? 'Channel' : 'Profile'}
          </a>
        )}
        {c.contact_email && (
          <a href={`mailto:${c.contact_email}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#555', textDecoration: 'none', background: SLATE_M, border: `1px solid ${SLATE_L}`, padding: '5px 11px', borderRadius: '6px' }}>
            <Mail size={11} /> {c.contact_email}
          </a>
        )}
        <button
          onClick={() => onOutreach(c)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: GOLD, background: 'rgba(201,162,39,0.1)', border: `1px solid ${GOLD_BDR}`, padding: '5px 11px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}
        >
          <Send size={11} /> Generate Outreach
        </button>
      </div>
    </div>
  )
}

function NotVerifiedRow({ item }) {
  return (
    <div style={{ ...cardInner, padding: '10px 14px', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
      <ShieldAlert size={14} color={MUTED} style={{ marginTop: '2px', flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: BONE }}>@{item.handle}</p>
        <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: MUTED, lineHeight: 1.4 }}>{item.reason}</p>
      </div>
    </div>
  )
}

export default function CreatorFinder() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('youtube')

  // ── YouTube discovery ──────────────────────────────────────────────────
  const [niche, setNiche]           = useState('')
  const [ytCity, setYtCity]         = useState(getLastCity)
  const [ytMax, setYtMax]           = useState(15)
  const [ytLoading, setYtLoading]   = useState(false)
  const ytLoadingStep = useLoadingSteps(YT_LOADING_STEPS, ytLoading)
  const [ytError, setYtError]       = useState('')
  const [ytResult, setYtResult]     = useState(null)

  // ── Instagram enrichment ───────────────────────────────────────────────
  const [handlesText, setHandlesText] = useState('')
  const [igLoading, setIgLoading]     = useState(false)
  const igLoadingStep = useLoadingSteps(IG_LOADING_STEPS, igLoading)
  const [igError, setIgError]         = useState('')
  const [igResult, setIgResult]       = useState(null)

  // ── Outreach ───────────────────────────────────────────────────────────
  const [outreachCreator, setOutreachCreator] = useState('') // handle or channel id/url
  const [outreachPlatform, setOutreachPlatform] = useState('youtube')
  const [ctxUrl, setCtxUrl]           = useState('')
  const [ctxIndustry, setCtxIndustry] = useState('')
  const [ctxCity, setCtxCity]         = useState(getLastCity)
  const [ctxGoal, setCtxGoal]         = useState('')
  const [outLoading, setOutLoading]   = useState(false)
  const outLoadingStep = useLoadingSteps(OUTREACH_LOADING_STEPS, outLoading)
  const [outError, setOutError]       = useState('')
  const [outResult, setOutResult]     = useState(null)

  useEffect(() => {
    try {
      const yt = localStorage.getItem(LS_YT); if (yt) setYtResult(JSON.parse(yt))
      const ig = localStorage.getItem(LS_IG); if (ig) setIgResult(JSON.parse(ig))
      const ctx = localStorage.getItem(LS_CTX)
      if (ctx) {
        const p = JSON.parse(ctx)
        setCtxUrl(p.business_url || ''); setCtxIndustry(p.industry || '')
        if (p.city) setCtxCity(p.city); setCtxGoal(p.goal || '')
      }
    } catch { /* ignore corrupt cache */ }
  }, [])

  function persistCtx(next) {
    try { localStorage.setItem(LS_CTX, JSON.stringify(next)) } catch { /* ignore */ }
  }

  async function handleFindYoutube() {
    if (!niche.trim()) { setYtError('Please enter a niche.'); return }
    setYtError(''); setYtLoading(true); setYtResult(null)
    try {
      const res = await apiFetch(`${BACKEND}/creator-finder/discover-youtube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: niche.trim(), city: ytCity, max_results: ytMax }),
      })
      const data = await res.json()
      if (data.success) {
        setYtResult(data)
        try { localStorage.setItem(LS_YT, JSON.stringify(data)) } catch { /* ignore */ }
        toast.success(`Found ${data.total_found} channel(s)`)
      } else {
        setYtError(data.error || 'Discovery failed.'); toast.error(data.error || 'Discovery failed.')
      }
    } catch (e) {
      setYtError(`Backend se connect nahi ho paya: ${e.message}`); toast.error('Backend se connect nahi ho paya.')
    }
    setYtLoading(false)
  }

  async function handleEnrichInstagram() {
    const handles = handlesText.split('\n').map(h => h.trim()).filter(Boolean)
    if (!handles.length) { setIgError('Paste at least one Instagram handle.'); return }
    setIgError(''); setIgLoading(true); setIgResult(null)
    try {
      const res = await apiFetch(`${BACKEND}/creator-finder/enrich-instagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handles }),
      })
      const data = await res.json()
      if (data.success) {
        setIgResult(data)
        try { localStorage.setItem(LS_IG, JSON.stringify(data)) } catch { /* ignore */ }
        toast.success(`${data.verified_count} verified, ${data.not_verified_count} not verified`)
      } else {
        setIgError(data.error || 'Enrichment failed.'); toast.error(data.error || 'Enrichment failed.')
        if (data.connect_required) toast.error('Connect Meta Ads in Account → Connected Accounts first.')
      }
    } catch (e) {
      setIgError(`Backend se connect nahi ho paya: ${e.message}`); toast.error('Backend se connect nahi ho paya.')
    }
    setIgLoading(false)
  }

  function goToOutreach(creator) {
    if (creator.platform === 'youtube') {
      setOutreachPlatform('youtube')
      setOutreachCreator(creator.channel_url || creator.channel_id)
    } else {
      setOutreachPlatform('instagram')
      setOutreachCreator(creator.handle)
    }
    setActiveTab('outreach')
  }

  async function handleGenerateOutreach() {
    if (!outreachCreator.trim()) { setOutError('Enter a creator handle or channel.'); return }
    setOutError(''); setOutLoading(true); setOutResult(null)
    const ctxPayload = { business_url: ctxUrl, industry: ctxIndustry, city: ctxCity, goal: ctxGoal }
    persistCtx(ctxPayload)
    try {
      const res = await apiFetch(`${BACKEND}/creator-finder/generate-outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_handle_or_channel: outreachCreator.trim(),
          platform: outreachPlatform,
          campaign_context: ctxPayload,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setOutResult(data)
        toast.success('Outreach generated!')
      } else {
        setOutError(data.error || 'Could not generate outreach.'); toast.error(data.error || 'Could not generate outreach.')
        if (data.connect_required) toast.error('Connect Meta Ads in Account → Connected Accounts first.')
      }
    } catch (e) {
      setOutError(`Backend se connect nahi ho paya: ${e.message}`); toast.error('Backend se connect nahi ho paya.')
    }
    setOutLoading(false)
  }

  const TABS = [
    { key: 'youtube',   label: 'Find YouTube Creators', Icon: PlaySquare },
    { key: 'instagram', label: 'Enrich My List',         Icon: AtSign },
    { key: 'outreach',  label: 'Outreach',               Icon: Send },
  ]

  return (
    <PageShell maxWidth="960px">
      <PageHeader title="Creator Finder" sub="Find and reach out to real, verified Instagram/YouTube creators — no third-party API, no invented numbers." />

      <div style={{ display: 'flex', gap: '4px', marginBottom: '18px', background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '8px', padding: '4px', width: 'fit-content', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', border: 'none',
              fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
              background: activeTab === t.key ? GOLD : 'transparent', color: activeTab === t.key ? BONE : MUTED,
            }}
          >
            <t.Icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Find YouTube Creators ── */}
      {activeTab === 'youtube' && (
        <div>
          <div style={{ ...card, padding: isMobile ? '16px' : '20px', marginBottom: '16px', maxWidth: '640px' }}>
            {ytError && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '10px 14px', marginBottom: '14px', color: RED, fontSize: '13px' }}>{ytError}</div>}
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Niche <span style={{ color: RED, fontWeight: '700' }}>*</span></label>
              <input type="text" value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. wedding photography, fitness coaching" style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={lbl}>City (optional)</label>
                <CityInput value={ytCity} onChange={setYtCity} style={inp} />
              </div>
              <div>
                <label style={lbl}>Max Results</label>
                <select value={ytMax} onChange={e => setYtMax(Number(e.target.value))} style={inp}>
                  <option value={10}>10 channels</option>
                  <option value={15}>15 channels</option>
                  <option value={25}>25 channels</option>
                </select>
              </div>
            </div>
            <button onClick={handleFindYoutube} disabled={ytLoading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
              padding: '12px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '700',
              cursor: ytLoading ? 'not-allowed' : 'pointer', background: ytLoading ? '#E5C158' : GOLD, color: BONE,
            }}>
              <PlaySquare size={14} /> {ytLoading ? ytLoadingStep : 'Find YouTube Creators'}
            </button>
          </div>

          {ytResult && !ytLoading && (
            <div>
              <div style={{ ...card, padding: '10px 16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>{ytResult.total_found} verified channel(s) for "{ytResult.niche}"{ytResult.city ? ` in ${ytResult.city}` : ''} · {ytResult.data_source}</p>
              </div>
              {ytResult.results.map(c => <CreatorCard key={c.channel_id} c={c} onOutreach={goToOutreach} />)}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: Enrich My List ── */}
      {activeTab === 'instagram' && (
        <div>
          <div style={{ ...card, padding: isMobile ? '16px' : '20px', marginBottom: '16px', maxWidth: '640px' }}>
            {igError && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '10px 14px', marginBottom: '14px', color: RED, fontSize: '13px' }}>{igError}</div>}
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Instagram Handles — one per line</label>
              <textarea
                value={handlesText} onChange={e => setHandlesText(e.target.value)}
                placeholder={'@handle_one\nhandle_two\n@handle_three'}
                rows={6}
                style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }}
              />
              <p style={{ margin: '6px 0 0', fontSize: '11px', color: MUTED }}>
                This only enriches handles you already have (from manual research, exports, etc.) — it does not discover new ones.
                Requires Meta Ads connected with an Instagram Business account linked (Account → Connected Accounts).
              </p>
            </div>
            <button onClick={handleEnrichInstagram} disabled={igLoading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
              padding: '12px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '700',
              cursor: igLoading ? 'not-allowed' : 'pointer', background: igLoading ? '#E5C158' : GOLD, color: BONE,
            }}>
              <AtSign size={14} /> {igLoading ? igLoadingStep : 'Enrich Handles'}
            </button>
          </div>

          {igResult && !igLoading && (
            <div>
              <div style={{ ...card, padding: '10px 16px', marginBottom: '12px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>{igResult.verified_count} verified · {igResult.not_verified_count} not verified · {igResult.data_source}</p>
              </div>
              {igResult.results.map(c => <CreatorCard key={c.handle} c={c} onOutreach={goToOutreach} />)}
              {igResult.not_verified.length > 0 && (
                <div style={{ marginTop: '14px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Not Verified</p>
                  {igResult.not_verified.map(item => <NotVerifiedRow key={item.handle} item={item} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: Outreach ── */}
      {activeTab === 'outreach' && (
        <div>
          <div style={{ ...card, padding: isMobile ? '16px' : '20px', marginBottom: '16px', maxWidth: '640px' }}>
            {outError && <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '7px', padding: '10px 14px', marginBottom: '14px', color: RED, fontSize: '13px' }}>{outError}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 140px', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={lbl}>Creator Handle / Channel URL</label>
                <input type="text" value={outreachCreator} onChange={e => setOutreachCreator(e.target.value)} placeholder="@handle or youtube.com/@channel" style={inp} />
              </div>
              <div>
                <label style={lbl}>Platform</label>
                <select value={outreachPlatform} onChange={e => setOutreachPlatform(e.target.value)} style={inp}>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
            </div>

            <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Business (for grounding)</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={lbl}>Website / Business Name</label>
                <input type="text" value={ctxUrl} onChange={e => setCtxUrl(e.target.value)} placeholder="yourbusiness.com" style={inp} />
              </div>
              <div>
                <label style={lbl}>Industry</label>
                <input type="text" value={ctxIndustry} onChange={e => setCtxIndustry(e.target.value)} placeholder="e.g. wedding photography" style={inp} />
              </div>
              <div>
                <label style={lbl}>City</label>
                <CityInput value={ctxCity} onChange={setCtxCity} style={inp} />
              </div>
              <div>
                <label style={lbl}>Campaign Goal</label>
                <input type="text" value={ctxGoal} onChange={e => setCtxGoal(e.target.value)} placeholder="e.g. drive bookings for wedding season" style={inp} />
              </div>
            </div>

            <button onClick={handleGenerateOutreach} disabled={outLoading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%',
              padding: '12px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '700',
              cursor: outLoading ? 'not-allowed' : 'pointer', background: outLoading ? '#E5C158' : GOLD, color: BONE,
            }}>
              <Sparkles size={14} /> {outLoading ? outLoadingStep : 'Generate Outreach'}
            </button>
          </div>

          {outResult && !outLoading && (
            <div style={{ maxWidth: '720px' }}>
              <div style={{ ...card, padding: '14px 18px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: BONE }}>
                    {outResult.creator_data.name} <span style={{ color: MUTED, fontWeight: '400' }}>
                      ({outResult.creator_data.platform === 'youtube' ? fmtNum(outResult.creator_data.subscriber_count) + ' subs' : fmtNum(outResult.creator_data.follower_count) + ' followers'})
                    </span>
                  </p>
                  <VerifiedBadge verified={true} />
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: MUTED }}>
                  Business grounding: {outResult.grounded_in_business_data ? '✓ real business memory used' : outResult.research_used ? '✓ live research used' : '✗ generic — no business data found'}
                </p>
              </div>

              <div style={{ ...card, padding: '16px 18px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.05em' }}><MessageCircle size={12} /> DM</p>
                  <CopyBtn text={outResult.dm} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: BONE, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{outResult.dm}</p>
              </div>

              <div style={{ ...card, padding: '16px 18px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.05em' }}><Mail size={12} /> Email Pitch</p>
                  <CopyBtn text={outResult.email_pitch} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: BONE, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{outResult.email_pitch}</p>
              </div>

              <div style={{ ...card, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.05em' }}><Video size={12} /> Collaboration Brief</p>
                  <CopyBtn text={JSON.stringify(outResult.collaboration_brief, null, 2)} label="Copy Brief" />
                </div>
                {(outResult.collaboration_brief?.deliverables || []).length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 5px', fontSize: '10.5px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>Deliverables</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {outResult.collaboration_brief.deliverables.map((d, i) => (
                        <span key={i} style={{ fontSize: '11.5px', color: BONE, background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '20px', padding: '4px 11px' }}>{d}</span>
                      ))}
                    </div>
                  </div>
                )}
                {outResult.collaboration_brief?.suggested_angle && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 3px', fontSize: '10.5px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>Suggested Angle</p>
                    <p style={{ margin: 0, fontSize: '13px', color: BONE, lineHeight: 1.5 }}>{outResult.collaboration_brief.suggested_angle}</p>
                  </div>
                )}
                {outResult.collaboration_brief?.why_this_creator_fits && (
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: '10.5px', fontWeight: '700', color: MUTED, textTransform: 'uppercase' }}>Why This Creator Fits</p>
                    <p style={{ margin: 0, fontSize: '13px', color: BONE, lineHeight: 1.5 }}>{outResult.collaboration_brief.why_this_creator_fits}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  )
}
