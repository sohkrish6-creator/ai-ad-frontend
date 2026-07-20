import { useState } from 'react'
import { BACKEND, apiFetch } from './lib/api'
import {
  INK, BONE, GOLD, GOLD_DIM, GOLD_BDR, SLATE, SLATE_L, SLATE_M,
  MUTED, RED, GREEN, FONT_BODY, FONT_DISPLAY, card, cardInner,
} from './ds'

const DAY_SHORT = { MONDAY:'Mon', TUESDAY:'Tue', WEDNESDAY:'Wed', THURSDAY:'Thu', FRIDAY:'Fri', SATURDAY:'Sat', SUNDAY:'Sun' }
const DEVICE_COLOR = { MOBILE: '#4A9EFF', DESKTOP: '#FFB03A', TABLET: '#9B78F0', OTHER: '#666' }
const STATUS_COLOR  = { ENABLED: GREEN, PAUSED: '#FFB03A', REMOVED: RED }

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}
function money(n) {
  if (n == null) return '—'
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}
function pct(n) { return n == null ? '—' : n.toFixed(2) + '%' }

// Simple inline bar — percentage of the max value in a list
function Bar({ value, max, color = GOLD }) {
  const w = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ flex: 1, height: 6, background: SLATE_M, borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${w}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s' }} />
    </div>
  )
}

function SectionHeader({ title }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: GOLD, margin: '0 0 12px' }}>{title}</p>
  )
}

function EmptyState({ msg }) {
  return <p style={{ color: MUTED, fontSize: 13, margin: '8px 0' }}>{msg}</p>
}

// ── Geographic section ──────────────────────────────────────────────────────
function GeoSection({ geo }) {
  const top = geo?.top || []
  const worst = geo?.worst || []
  const maxImp = Math.max(...top.map(g => g.impressions), 1)
  return (
    <div>
      <SectionHeader title="Geographic" />
      {top.length === 0 ? <EmptyState msg="No geographic data for this campaign." /> : (
        <>
          <p style={{ color: MUTED, fontSize: 11, margin: '0 0 8px' }}>Top locations by impressions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {top.slice(0, 8).map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 140, fontSize: 12, color: BONE, flexShrink: 0 }}>{g.location_name}</span>
                <Bar value={g.impressions} max={maxImp} />
                <span style={{ width: 60, fontSize: 11, color: MUTED, textAlign: 'right', flexShrink: 0 }}>{fmt(g.impressions)} imp</span>
                <span style={{ width: 48, fontSize: 11, color: MUTED, textAlign: 'right', flexShrink: 0 }}>{pct(g.ctr)}</span>
              </div>
            ))}
          </div>
          {worst.length > 0 && (
            <>
              <p style={{ color: MUTED, fontSize: 11, margin: '0 0 8px' }}>Lowest CTR locations (≥10 impressions) — consider bid reduction</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {worst.map((g, i) => (
                  <span key={i} style={{ padding: '3px 8px', background: `${RED}18`, border: `1px solid ${RED}40`,
                                         borderRadius: 4, fontSize: 11, color: RED }}>
                    {g.location_name} {pct(g.ctr)}
                  </span>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── Device section ──────────────────────────────────────────────────────────
function DeviceSection({ devices }) {
  if (!devices || devices.length === 0) return (
    <div><SectionHeader title="Device" /><EmptyState msg="No device data." /></div>
  )
  const total = devices.reduce((s, d) => s + d.impressions, 0) || 1
  return (
    <div>
      <SectionHeader title="Device" />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {devices.map((d, i) => {
          const color = DEVICE_COLOR[d.device] || '#888'
          const share = Math.round(d.impressions / total * 100)
          return (
            <div key={i} style={{ ...cardInner, padding: '12px 16px', minWidth: 130, flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color }}>{share}%</div>
              <div style={{ fontSize: 12, color: BONE, margin: '2px 0' }}>{d.device}</div>
              <div style={{ fontSize: 11, color: MUTED }}>{fmt(d.impressions)} imp · {pct(d.ctr)} CTR</div>
              <div style={{ fontSize: 11, color: MUTED }}>{money(d.cost)} spend</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Time patterns section ───────────────────────────────────────────────────
function TimeSection({ time_patterns }) {
  const hours = time_patterns?.by_hour || []
  const days  = time_patterns?.by_day  || []
  const maxH  = Math.max(...hours.map(h => h.impressions), 1)
  const maxD  = Math.max(...days.map(d => d.impressions), 1)
  return (
    <div>
      <SectionHeader title="Time Patterns" />
      {hours.length === 0 && days.length === 0 ? (
        <EmptyState msg="No time pattern data." />
      ) : (
        <>
          {hours.length > 0 && (
            <>
              <p style={{ color: MUTED, fontSize: 11, margin: '0 0 6px' }}>Hour of day (impressions)</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60, marginBottom: 4 }}>
                {Array.from({ length: 24 }, (_, h) => {
                  const row = hours.find(r => r.hour === h) || { impressions: 0 }
                  const barH = maxH > 0 ? Math.round(row.impressions / maxH * 56) : 0
                  const isTop = row.impressions === Math.max(...hours.map(r => r.impressions))
                  return (
                    <div key={h} title={`${h}:00 — ${fmt(row.impressions)} imp`}
                         style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '100%', height: barH, background: isTop ? GOLD : `${GOLD}50`,
                                   borderRadius: '2px 2px 0 0' }} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                {[0, 6, 12, 18, 23].map(h => (
                  <span key={h} style={{ fontSize: 10, color: MUTED }}>{h}h</span>
                ))}
              </div>
            </>
          )}
          {days.length > 0 && (
            <>
              <p style={{ color: MUTED, fontSize: 11, margin: '0 0 6px' }}>Day of week (impressions)</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {days.map((d, i) => {
                  const share = maxD > 0 ? Math.round(d.impressions / maxD * 100) : 0
                  const isTop = d.impressions === Math.max(...days.map(r => r.impressions))
                  return (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>{DAY_SHORT[d.day] || d.day}</div>
                      <div style={{ height: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <div style={{ width: '80%', height: `${share}%`, minHeight: 2,
                                     background: isTop ? GOLD : `${GOLD}50`, borderRadius: '2px 2px 0 0' }} />
                      </div>
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{fmt(d.impressions)}</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── Search terms section ────────────────────────────────────────────────────
function SearchTermsSection({ search_terms, campaign_type }) {
  const isSearch = campaign_type === 'SEARCH'
  if (!isSearch) return (
    <div><SectionHeader title="Search Terms" /><EmptyState msg="Search term data is only available for Search campaigns." /></div>
  )
  const top    = search_terms?.top    || []
  const wasted = search_terms?.wasted || []
  if (top.length === 0) return (
    <div><SectionHeader title="Search Terms" /><EmptyState msg="No search term data for this campaign in this period." /></div>
  )
  return (
    <div>
      <SectionHeader title="Search Terms" />
      <p style={{ color: MUTED, fontSize: 11, margin: '0 0 8px' }}>Top by clicks</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
        {top.slice(0, 10).map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1, fontSize: 12, color: BONE }}>{s.term}</span>
            <span style={{ fontSize: 11, color: MUTED, flexShrink: 0 }}>{s.clicks} clk</span>
            <span style={{ fontSize: 11, color: MUTED, flexShrink: 0 }}>{money(s.cost)}</span>
            <span style={{ fontSize: 11, color: s.conversions > 0 ? GREEN : MUTED, flexShrink: 0 }}>
              {s.conversions > 0 ? `${s.conversions} conv` : '0 conv'}
            </span>
          </div>
        ))}
      </div>
      {wasted.length > 0 && (
        <>
          <p style={{ color: RED, fontSize: 11, margin: '0 0 6px', fontWeight: 600 }}>
            Wasted spend (≥3 clicks, 0 conversions)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {wasted.map((s, i) => (
              <span key={i} style={{ padding: '3px 9px', background: `${RED}18`, border: `1px solid ${RED}35`,
                                     borderRadius: 4, fontSize: 11, color: RED }}>
                "{s.term}" — {money(s.cost)}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Audience section ────────────────────────────────────────────────────────
function AudienceSection({ audience, campaign_type }) {
  const ages    = (audience?.by_age    || []).filter(a => a.impressions > 0)
  const genders = (audience?.by_gender || []).filter(g => g.impressions > 0)
  const noData  = ages.length === 0 && genders.length === 0
  if (noData) return (
    <div>
      <SectionHeader title="Audience / Demographics" />
      <EmptyState msg={
        campaign_type === 'SEARCH'
          ? 'Age/gender demographic data is limited for Search campaigns. Run Display campaigns to see full audience breakdowns.'
          : 'No demographic data in this period.'
      } />
    </div>
  )
  const maxAge = Math.max(...ages.map(a => a.impressions), 1)
  const totalGender = genders.reduce((s, g) => s + g.impressions, 0) || 1
  const GENDER_COLOR = { MALE: '#4A9EFF', FEMALE: '#FF6B9D', UNDETERMINED: '#888' }
  return (
    <div>
      <SectionHeader title="Audience / Demographics" />
      {ages.length > 0 && (
        <>
          <p style={{ color: MUTED, fontSize: 11, margin: '0 0 8px' }}>Age range</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
            {ages.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 120, fontSize: 12, color: BONE, flexShrink: 0 }}>
                  {a.age_range.replace('AGE_RANGE_', '').replace(/_/g, '–')}
                </span>
                <Bar value={a.impressions} max={maxAge} />
                <span style={{ width: 60, fontSize: 11, color: MUTED, textAlign: 'right', flexShrink: 0 }}>{fmt(a.impressions)}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {genders.length > 0 && (
        <>
          <p style={{ color: MUTED, fontSize: 11, margin: '0 0 8px' }}>Gender</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {genders.map((g, i) => {
              const color = GENDER_COLOR[g.gender] || '#888'
              const share = Math.round(g.impressions / totalGender * 100)
              return (
                <div key={i} style={{ ...cardInner, padding: '10px 14px', flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color }}>{share}%</div>
                  <div style={{ fontSize: 12, color: BONE }}>{g.gender}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{fmt(g.impressions)} imp</div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ── Campaign panel ──────────────────────────────────────────────────────────
function CampaignPanel({ camp }) {
  const insufficient = !camp.data_sufficient
  const sec = { ...card, padding: 20, marginBottom: 16 }

  return (
    <div>
      {/* Header stats */}
      <div style={{ ...card, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: BONE }}>{camp.campaign_name}</span>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                         background: `${STATUS_COLOR[camp.campaign_status] || MUTED}20`,
                         color: STATUS_COLOR[camp.campaign_status] || MUTED,
                         border: `1px solid ${STATUS_COLOR[camp.campaign_status] || MUTED}40` }}>
            {camp.campaign_status}
          </span>
          <span style={{ fontSize: 11, color: MUTED }}>{camp.campaign_type}</span>
        </div>

        {insufficient && (
          <div style={{ padding: '10px 14px', background: '#FFB03A18', border: '1px solid #FFB03A40',
                         borderRadius: 6, marginBottom: 14 }}>
            <p style={{ color: '#FFB03A', fontSize: 12, margin: 0, fontWeight: 600 }}>
              Insufficient data — {camp.data_sufficiency_warnings[0]}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Impressions', value: fmt(camp.total_impressions) },
            { label: 'Clicks',      value: fmt(camp.total_clicks) },
            { label: 'CTR',         value: pct(camp.ctr) },
            { label: 'Spend',       value: money(camp.total_cost) },
            { label: 'Conversions', value: camp.total_conversions > 0 ? camp.total_conversions : '0' },
            { label: 'CPA',         value: camp.cpa != null ? money(camp.cpa) : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ ...cardInner, padding: '10px 16px', minWidth: 110, flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: BONE }}>{value}</div>
              <div style={{ fontSize: 11, color: MUTED }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI summary */}
      {(camp.summary || camp.recommendation) && (
        <div style={{ ...card, padding: 16, marginBottom: 16, borderColor: GOLD_BDR, background: GOLD_DIM }}>
          {camp.summary && <p style={{ color: BONE, fontSize: 13, margin: '0 0 6px' }}>{camp.summary}</p>}
          {camp.recommendation && (
            <p style={{ color: GOLD, fontSize: 13, margin: 0 }}>
              <strong>Recommendation:</strong> {camp.recommendation}
            </p>
          )}
        </div>
      )}

      {/* Breakdowns — show greyed out for insufficient data campaigns */}
      <div style={{ opacity: insufficient ? 0.45 : 1, pointerEvents: insufficient ? 'none' : 'auto' }}>
        <div style={sec}><GeoSection geo={camp.geographic} /></div>
        <div style={sec}><DeviceSection devices={camp.device} /></div>
        <div style={sec}><TimeSection time_patterns={camp.time_patterns} /></div>
        <div style={sec}><SearchTermsSection search_terms={camp.search_terms} campaign_type={camp.campaign_type} /></div>
        <div style={sec}><AudienceSection audience={camp.audience} campaign_type={camp.campaign_type} /></div>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function AccountAudit() {
  const [days,   setDays]   = useState(30)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,  setError]  = useState('')
  const [activeIdx, setActiveIdx] = useState(0)

  async function runAudit() {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res  = await apiFetch(`${BACKEND}/google-ads/deep-audit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ date_range_days: days }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Audit failed.')
      } else {
        setResult(data)
        setActiveIdx(0)
      }
    } catch (e) {
      setError('Could not reach backend: ' + e.message)
    }
    setLoading(false)
  }

  const camps = result?.campaigns || []
  const active = camps[activeIdx]

  return (
    <div style={{ minHeight: '100vh', background: INK, color: BONE, fontFamily: FONT_BODY,
                  padding: '36px 24px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, color: BONE, margin: '0 0 4px' }}>
            Account Deep Audit
          </h1>
          <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>
            Per-campaign geographic, device, time, search-term &amp; audience breakdown
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {[14, 30, 60, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              style={{ padding: '7px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontFamily: FONT_BODY,
                       background: days === d ? GOLD : 'transparent', color: days === d ? INK : MUTED,
                       border: `1px solid ${days === d ? GOLD : SLATE_L}`, fontWeight: days === d ? 600 : 400 }}>
              {d}d
            </button>
          ))}
          <button onClick={runAudit} disabled={loading}
            style={{ padding: '8px 22px', background: loading ? SLATE : BONE, color: INK, border: 'none',
                     borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                     fontFamily: FONT_BODY, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Running audit…' : 'Run Audit'}
          </button>
          {result && (
            <span style={{ fontSize: 12, color: MUTED }}>
              {result.account_level_overview?.overall_note}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '12px 16px', background: `${RED}18`, border: `1px solid ${RED}40`,
                        borderRadius: 8, color: RED, fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ ...card, padding: 20, animation: 'pulse 1.4s ease infinite' }}>
                <div style={{ height: 14, width: 200, background: SLATE_L, borderRadius: 4, marginBottom: 10 }} />
                <div style={{ height: 10, width: 320, background: SLATE_L, borderRadius: 4 }} />
              </div>
            ))}
          </div>
        )}

        {/* Campaign tabs + panel */}
        {!loading && camps.length > 0 && (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {camps.map((c, i) => {
                const isActive = i === activeIdx
                const hasData  = c.data_sufficient
                return (
                  <button key={c.campaign_id} onClick={() => setActiveIdx(i)}
                    style={{
                      padding: '8px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: FONT_BODY, maxWidth: 220, textAlign: 'left',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      background: isActive ? GOLD : SLATE,
                      color:      isActive ? INK  : (hasData ? BONE : MUTED),
                      border:     `1px solid ${isActive ? GOLD : (hasData ? SLATE_L : SLATE_L)}`,
                      opacity:    hasData ? 1 : 0.65,
                    }}>
                    {c.campaign_name}
                    {!hasData && <span style={{ marginLeft: 4, fontSize: 10 }}>⚠</span>}
                  </button>
                )
              })}
            </div>

            {/* Active campaign panel */}
            {active && <CampaignPanel camp={active} />}
          </>
        )}

        {/* Empty state after run */}
        {!loading && result && camps.length === 0 && (
          <div style={{ ...card, padding: 32, textAlign: 'center' }}>
            <p style={{ color: MUTED, fontSize: 14 }}>No campaigns found in this account for the selected period.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
