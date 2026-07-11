import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock, Search, ExternalLink, FileText, Rocket, Sparkles, ChevronDown, ChevronUp,
  RefreshCw, AlertCircle,
} from 'lucide-react'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const LS_TAB    = 'adsoh_history_tab'
const LS_FILTER = 'adsoh_history_filter'


// activity_type → display label, category (for filter chips), icon, and the
// route to open when a report/analysis row is clicked.
const ACTIVITY_META = {
  marketing_brain:          { label: 'Marketing Brain report',        category: 'reports',  route: '/brain' },
  campaign_kit:             { label: 'Campaign Launch Kit generated', category: 'reports',  route: '/brain' },
  autonomous_marketing:     { label: 'Autonomous Marketing plan',     category: 'reports',  route: '/brain' },
  opportunity_engine:       { label: 'Opportunity Engine report',     category: 'reports',  route: '/opportunity' },
  offer_intelligence:       { label: 'Offer Intelligence report',     category: 'reports',  route: '/offer' },
  website_intelligence:     { label: 'Website Intelligence audit',    category: 'reports',  route: '/website-audit' },
  visibility_intelligence:  { label: 'Visibility Intelligence report',category: 'reports',  route: '/visibility' },
  outreach_ai:              { label: 'Outreach AI scripts',           category: 'reports',  route: '/outreach' },
  kpi_engine:                { label: 'KPI Engine prediction',         category: 'reports',  route: '/kpi-engine' },
  result_center:            { label: 'Result Center report',          category: 'reports',  route: '/result-center' },
  performance_intelligence: { label: 'Performance Intelligence report',category: 'analysis', route: '/performance' },
  ai_optimizer:             { label: 'AI Optimizer recommendations',  category: 'analysis', route: '/ai-optimizer' },
  prospect_discovery:       { label: 'Prospect Discovery run',        category: 'analysis', route: '/prospects' },
  smart_analysis:           { label: 'Smart Analysis run',            category: 'analysis', route: '/smart-analysis' },
  social_intel:             { label: 'Social Intelligence audit',     category: 'analysis', route: '/social-intelligence' },
  sports_analysis:          { label: 'Sports Growth analysis',        category: 'analysis', route: '/cricket-ads' },
  google_campaign_created:  { label: 'Google campaign created',       category: 'campaigns', route: null },
  meta_campaign_created:    { label: 'Meta campaign created',         category: 'campaigns', route: null },
}

const FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'reports',   label: 'Reports' },
  { key: 'campaigns', label: 'Campaigns' },
  { key: 'analysis',  label: 'Analysis' },
]

function metaFor(type) {
  return ACTIVITY_META[type] || { label: type, category: 'analysis', route: null }
}

function timeAgo(iso) {
  if (!iso) return ''
  const d = new Date(iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z')
  if (isNaN(d.getTime())) return iso
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString()
}

function TypeIcon({ category }) {
  const color = category === 'campaigns' ? '#16A34A' : category === 'analysis' ? '#6366F1' : GOLD
  const Icon  = category === 'campaigns' ? Rocket : category === 'analysis' ? Sparkles : FileText
  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
      background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={15} color={color} />
    </div>
  )
}

function StatusBadge({ status }) {
  const s = (status || '').toUpperCase()
  const enabled = s === 'ENABLED' || s === 'ACTIVE'
  const bg = enabled ? '#F0FDF4' : '#F5F5F5'
  const fg = enabled ? '#16A34A' : '#888'
  const border = enabled ? '#BBF7D0' : '#E5E5E5'
  return (
    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: bg, color: fg, border: `1px solid ${border}` }}>
      {s || 'UNKNOWN'}
    </span>
  )
}

function ActivityRow({ item, onOpen }) {
  const [expanded, setExpanded] = useState(false)
  const meta = metaFor(item.activity_type)
  const isCampaign = meta.category === 'campaigns'
  const dashboardLink = item.activity_type === 'google_campaign_created'
    ? `https://ads.google.com/aw/campaigns?campaignId=${item.reference_id}`
    : item.activity_type === 'meta_campaign_created'
      ? `https://business.facebook.com/adsmanager`
      : null

  return (
    <div style={{ ...card, padding: '13px 16px', marginBottom: '8px' }}>
      <div
        onClick={() => isCampaign ? setExpanded(e => !e) : onOpen(item)}
        style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}
      >
        <TypeIcon category={meta.category} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13.5px', fontWeight: '600', color: BONE }}>
              {item.business_name || item.url || 'Unknown business'}
            </span>
            <span style={{ fontSize: '11px', color: '#AAA', whiteSpace: 'nowrap' }}>{timeAgo(item.created_at)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '3px 0', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: MUTED }}>{meta.label}</span>
            {item.city && <span style={{ fontSize: '11px', color: MUTED }}>· {item.city}</span>}
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: MUTED, lineHeight: '1.5' }}>{item.summary}</p>
        </div>
        {isCampaign && (expanded ? <ChevronUp size={15} color="#BBB" /> : <ChevronDown size={15} color="#BBB" />)}
      </div>
      {isCampaign && expanded && (
        <div style={{ marginTop: '11px', paddingTop: '11px', borderTop: '1px solid #EEE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '12px', color: MUTED }}>
            <strong style={{ color: BONE }}>Campaign ID:</strong> {item.reference_id || 'N/A'}
          </div>
          {dashboardLink && (
            <a href={dashboardLink} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#171717', color: '#fff',
              padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', textDecoration: 'none',
            }}>
              <ExternalLink size={12} /> Open in {item.activity_type === 'google_campaign_created' ? 'Google' : 'Meta'} Ads
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function CampaignRow({ c }) {
  const platformColor = c.platform === 'google' ? '#4285F4' : '#0866FF'
  return (
    <div style={{ ...card, padding: '13px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: platformColor, flexShrink: 0 }} />
        <div>
          <p style={{ margin: '0 0 2px', fontSize: '13.5px', fontWeight: '600', color: BONE }}>{c.name}</p>
          <p style={{ margin: 0, fontSize: '11px', color: MUTED, textTransform: 'capitalize' }}>{c.platform} Ads · ID: {c.campaign_id}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <StatusBadge status={c.status} />
        <a href={c.dashboard_link} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', background: SLATE_M, border: `1px solid ${SLATE_L}`,
          color: BONE, padding: '7px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', textDecoration: 'none',
        }}>
          <ExternalLink size={12} /> Open
        </a>
      </div>
    </div>
  )
}

export default function History() {
  const navigate = useNavigate()
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [tab, setTab] = useState(() => { try { return localStorage.getItem(LS_TAB) || 'activity' } catch { return 'activity' } })
  const [filter, setFilter] = useState(() => { try { return localStorage.getItem(LS_FILTER) || 'all' } catch { return 'all' } })
  const [search, setSearch] = useState('')

  const [activity, setActivity] = useState([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [activityError, setActivityError] = useState(null)

  const [campaigns, setCampaigns] = useState([])
  const [campaignErrors, setCampaignErrors] = useState({})
  const [campaignsLoading, setCampaignsLoading] = useState(true)
  const [campaignsError, setCampaignsError] = useState(null)

  useEffect(() => { try { localStorage.setItem(LS_TAB, tab) } catch {} }, [tab])
  useEffect(() => { try { localStorage.setItem(LS_FILTER, filter) } catch {} }, [filter])

  async function loadActivity() {
    setActivityLoading(true); setActivityError(null)
    try {
      const res = await fetch(`${BACKEND}/activity/list?limit=100`)
      const data = await res.json()
      if (data.success) setActivity(data.activity || [])
      else setActivityError(data.error || 'Could not load activity.')
    } catch (e) {
      setActivityError(`Backend se connect nahi ho paya: ${e.message}`)
    }
    setActivityLoading(false)
  }

  async function loadCampaigns() {
    setCampaignsLoading(true); setCampaignsError(null)
    try {
      const res = await fetch(`${BACKEND}/campaigns/all`)
      const data = await res.json()
      if (data.success) { setCampaigns(data.campaigns || []); setCampaignErrors(data.errors || {}) }
      else setCampaignsError(data.error || 'Could not load campaigns.')
    } catch (e) {
      setCampaignsError(`Backend se connect nahi ho paya: ${e.message}`)
    }
    setCampaignsLoading(false)
  }

  useEffect(() => { loadActivity(); loadCampaigns() }, [])

  function openActivity(item) {
    const meta = metaFor(item.activity_type)
    if (!meta.route) return
    const qs = item.business_key ? `?business_key=${encodeURIComponent(item.business_key)}` : ''
    navigate(`${meta.route}${qs}`)
  }

  const filteredActivity = useMemo(() => {
    let list = activity
    if (filter !== 'all') list = list.filter(a => metaFor(a.activity_type).category === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(a =>
        (a.business_name || '').toLowerCase().includes(q) ||
        (a.url || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [activity, filter, search])

  const googleCampaigns = campaigns.filter(c => c.platform === 'google')
  const metaCampaigns    = campaigns.filter(c => c.platform === 'meta')

  return (
    <PageShell maxWidth="780px">
      <PageHeader title="History" sub="Every report, analysis, and campaign this tool has ever generated — one place to find past work." />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '18px', borderBottom: '1px solid #EAEAEA' }}>
        {[{ key: 'activity', label: 'Activity' }, { key: 'campaigns', label: 'Campaigns' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 16px', fontSize: '13.5px', fontWeight: '600',
              color: tab === t.key ? '#171717' : '#999',
              borderBottom: tab === t.key ? `2px solid ${GOLD}` : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'activity' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: '6px 13px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                    border: filter === f.key ? `1px solid ${GOLD}` : '1px solid #E5E5E5',
                    background: filter === f.key ? '#FDF8EE' : '#fff',
                    color: filter === f.key ? '#8A6D1D' : '#666',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button onClick={loadActivity} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={14} color="#BBB" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by business name or URL..."
              style={{ ...inp, width: '100%', paddingLeft: '34px' }}
            />
          </div>

          {activityLoading && <p style={{ color: MUTED, fontSize: '13px' }}>Loading activity...</p>}
          {activityError && (
            <div style={{ ...card, padding: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: RED }}>
              <AlertCircle size={15} /> <span style={{ fontSize: '13px' }}>{activityError}</span>
            </div>
          )}
          {!activityLoading && !activityError && filteredActivity.length === 0 && (
            <p style={{ color: MUTED, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>Nothing here yet — run a report or push a campaign to see it show up.</p>
          )}
          {filteredActivity.map(item => <ActivityRow key={item.id} item={item} onOpen={openActivity} />)}
        </>
      )}

      {tab === 'campaigns' && (
        <>
          {campaignsLoading && <p style={{ color: MUTED, fontSize: '13px' }}>Loading campaigns...</p>}
          {campaignsError && (
            <div style={{ ...card, padding: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: RED, marginBottom: '14px' }}>
              <AlertCircle size={15} /> <span style={{ fontSize: '13px' }}>{campaignsError}</span>
            </div>
          )}
          {!campaignsLoading && !campaignsError && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#4285F4', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Google Ads ({googleCampaigns.length})</h3>
                <button onClick={loadCampaigns} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
              {campaignErrors.google && <p style={{ fontSize: '12px', color: '#D97706', marginBottom: '10px' }}>Google Ads: {campaignErrors.google}</p>}
              {googleCampaigns.length === 0 && !campaignErrors.google && <p style={{ color: MUTED, fontSize: '12px', marginBottom: '20px' }}>No Google Ads campaigns found.</p>}
              {googleCampaigns.map(c => <CampaignRow key={`g-${c.campaign_id}`} c={c} />)}

              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0866FF', margin: '24px 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Meta Ads ({metaCampaigns.length})</h3>
              {campaignErrors.meta && <p style={{ fontSize: '12px', color: '#D97706', marginBottom: '10px' }}>Meta Ads: {campaignErrors.meta}</p>}
              {metaCampaigns.length === 0 && !campaignErrors.meta && <p style={{ color: MUTED, fontSize: '12px' }}>No Meta Ads campaigns found.</p>}
              {metaCampaigns.map(c => <CampaignRow key={`m-${c.campaign_id}`} c={c} />)}
            </>
          )}
        </>
      )}
    </PageShell>
  )
}
