import { BACKEND, apiFetch } from './lib/api'
import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { useLoadingSteps } from './useLoadingSteps'
import {
  GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inputSt,
  INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED,
  FONT_BODY, FONT_DISPLAY,
} from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

const LS_KEY = 'adsoh_mi_result'


const MI_STEPS = [
  'Researching company history...',
  'Analyzing marketing strategy...',
  'Scanning social presence...',
  'Mapping competitor landscape...',
  'Diving into products & funnels...',
  'Generating section reports...',
  'Verifying honesty layer...',
  'Building intelligence report...',
]

const BASE_TABS = [
  { key: 'overview',             label: 'Overview' },
  { key: 'business_dna',         label: 'DNA' },
  { key: 'timeline',             label: 'Timeline' },
  { key: 'audience',             label: 'Audience' },
  { key: 'channels',             label: 'Channels' },
  { key: 'advertising',          label: 'Advertising' },
  { key: 'seo',                  label: 'SEO' },
  { key: 'social',               label: 'Social' },
  { key: 'creatives',            label: 'Creatives' },
  { key: 'offers',               label: 'Offers' },
  { key: 'funnels',              label: 'Funnels' },
  { key: 'competitors',          label: 'Competitors' },
  { key: 'swot',                 label: 'SWOT' },
  { key: 'lessons',              label: 'Lessons' },
  { key: 'mistakes',             label: 'Mistakes' },
  { key: 'future_opportunities', label: 'Opportunities' },
]

// ── Inline helpers ────────────────────────────────────────────────────────────

function ConfBadge({ n }) {
  if (!n) return null
  const color = n >= 75 ? GREEN : n >= 50 ? GOLD : RED
  return (
    <span style={{ fontSize: '11px', fontWeight: '600', color, background: `${color}18`,
      border: `1px solid ${color}30`, borderRadius: '4px', padding: '2px 7px', flexShrink: 0 }}>
      {n}% confidence
    </span>
  )
}

function TrustRow({ confidence, evidence, data_source, data_label }) {
  if (!confidence && !evidence && !data_source) return null
  return (
    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${SLATE_L}`,
      display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      {confidence && <ConfBadge n={confidence} />}
      {data_label && (
        <span style={{ fontSize: '11px', color: GOLD, fontWeight: '600', background: GOLD_DIM,
          border: `1px solid ${GOLD_BDR}`, borderRadius: '4px', padding: '2px 7px' }}>
          {data_label}
        </span>
      )}
      {evidence && <span style={{ fontSize: '11px', color: MUTED }}>{evidence}</span>}
      {data_source && <span style={{ fontSize: '11px', color: MUTED, opacity: 0.7 }}>· {data_source}</span>}
    </div>
  )
}

function SWrap({ children }) {
  return <div style={{ ...card, padding: '24px', marginBottom: '14px' }}>{children}</div>
}

function FRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
        letterSpacing: '0.08em', color: MUTED, marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: BONE, lineHeight: 1.55 }}>{value}</div>
    </div>
  )
}

function TagList({ label, items }) {
  if (!items || !items.length) return null
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
        letterSpacing: '0.08em', color: MUTED, marginBottom: '6px' }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {[].concat(items).map((item, i) => (
          <span key={i} style={{ fontSize: '12px', color: BONE, background: SLATE_M,
            border: `1px solid ${SLATE_L}`, borderRadius: '5px', padding: '3px 10px' }}>{item}</span>
        ))}
      </div>
    </div>
  )
}

// ── Section renderers ─────────────────────────────────────────────────────────

function OverviewSection({ d }) {
  if (!d) return <Empty />
  return (
    <SWrap>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '14px 24px' }}>
        <FRow label="Company Name"   value={d.company_name} />
        <FRow label="Industry"       value={d.industry} />
        <FRow label="Founded"        value={d.founded} />
        <FRow label="Headquarters"   value={d.headquarters} />
        <FRow label="Business Model" value={d.business_model} />
        <FRow label="Estimated Size" value={d.estimated_size} />
        <FRow label="Revenue"        value={d.revenue} />
      </div>
      {d.core_value_proposition && (
        <div style={{ margin: '16px 0', padding: '14px 16px', background: GOLD_DIM,
          border: `1px solid ${GOLD_BDR}`, borderRadius: '7px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
            letterSpacing: '0.08em', color: GOLD, marginBottom: '4px' }}>Core Value Proposition</div>
          <div style={{ fontSize: '14px', color: BONE, lineHeight: 1.55 }}>{d.core_value_proposition}</div>
        </div>
      )}
      <TagList label="Key Products / Services" items={d.key_products_services} />
      <TrustRow confidence={d.confidence} evidence={d.evidence} data_source={d.data_source} />
    </SWrap>
  )
}

function DNASection({ d }) {
  if (!d) return <Empty />
  return (
    <SWrap>
      <FRow label="Brand Positioning"   value={d.brand_positioning} />
      <FRow label="Target Customer"     value={d.target_customer_profile} />
      <FRow label="Brand Voice / Tone"  value={d.brand_voice_tone} />
      <FRow label="Pricing Tier"        value={d.pricing_tier} />
      <FRow label="Distribution Model"  value={d.distribution_model} />
      <FRow label="Culture Signals"     value={d.company_culture_signals} />
      <TagList label="Unique Differentiators" items={d.unique_differentiators} />
      <TrustRow confidence={d.confidence} evidence={d.evidence} data_source={d.data_source} />
    </SWrap>
  )
}

function TimelineSection({ d, revenue, stories }) {
  const hasMilestones = Array.isArray(d) && d.length > 0
  const hasRevenue = Array.isArray(revenue) && revenue.length > 0
  const hasStories = Array.isArray(stories) && stories.length > 0

  if (!hasMilestones && !hasRevenue && !hasStories) {
    return <Empty msg="No timeline milestones found in available research." />
  }

  return (
    <div>
      {/* ── Milestone timeline ── */}
      {hasMilestones && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
            letterSpacing: '0.08em', color: GOLD, marginBottom: '16px' }}>Marketing Timeline</div>
          {d.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '4px' }}>
              <div style={{ flexShrink: 0, width: '80px', paddingTop: '2px', textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: GOLD, background: GOLD_DIM,
                  border: `1px solid ${GOLD_BDR}`, borderRadius: '5px', padding: '3px 7px', display: 'inline-block' }}>
                  {item.year}
                </span>
              </div>
              <div style={{ flex: 1, paddingLeft: '14px', borderLeft: `2px solid ${SLATE_L}`, paddingBottom: '18px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: BONE, marginBottom: '4px' }}>{item.milestone}</div>
                {item.significance && (
                  <div style={{ fontSize: '12px', color: MUTED, marginBottom: '4px', lineHeight: 1.5 }}>{item.significance}</div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  {item.evidence && (
                    <span style={{ fontSize: '11px', color: MUTED, opacity: 0.7, fontStyle: 'italic' }}>{item.evidence}</span>
                  )}
                  {item.data_source && (
                    <span style={{ fontSize: '10px', color: MUTED, opacity: 0.5 }}>· {item.data_source}</span>
                  )}
                  {item.confidence && <ConfBadge n={item.confidence} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Revenue timeline ── */}
      {hasRevenue && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
            letterSpacing: '0.08em', color: GREEN, marginBottom: '14px' }}>Revenue Timeline (documented figures only)</div>
          <div style={{ ...cardInner, padding: '4px 0', overflow: 'hidden' }}>
            {revenue.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0', borderBottom: i < revenue.length - 1 ? `1px solid ${SLATE_L}` : 'none' }}>
                <div style={{ flexShrink: 0, width: '100px', padding: '12px 14px',
                  borderRight: `1px solid ${SLATE_L}`, background: SLATE_M }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: GOLD }}>{item.period}</div>
                </div>
                <div style={{ flex: 1, padding: '12px 14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: GREEN, marginBottom: '3px' }}>
                    {item.revenue_or_metric}
                  </div>
                  {item.source_context && (
                    <div style={{ fontSize: '11px', color: MUTED, fontStyle: 'italic' }}>{item.source_context}</div>
                  )}
                </div>
                {item.confidence && (
                  <div style={{ flexShrink: 0, padding: '12px 14px', display: 'flex', alignItems: 'center' }}>
                    <ConfBadge n={item.confidence} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '10px', color: MUTED, marginTop: '8px', fontStyle: 'italic' }}>
            Only years with figures found in research are shown — gaps are real gaps, not omissions.
          </div>
        </div>
      )}

      {/* ── Unique stories ── */}
      {hasStories && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
            letterSpacing: '0.08em', color: GOLD, marginBottom: '14px' }}>Unique Stories & Anecdotes</div>
          {stories.map((item, i) => (
            <div key={i} style={{ ...card, padding: '18px', marginBottom: '10px',
              borderLeft: `3px solid ${GOLD_BDR}` }}>
              <div style={{ fontSize: '14px', color: BONE, lineHeight: 1.6, marginBottom: '8px' }}>{item.story}</div>
              {item.significance && (
                <div style={{ fontSize: '12px', color: GOLD, marginBottom: '6px' }}>
                  Why it matters: {item.significance}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {item.source_context && (
                  <span style={{ fontSize: '11px', color: MUTED, fontStyle: 'italic' }}>{item.source_context}</span>
                )}
                {item.confidence && <ConfBadge n={item.confidence} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AudienceSection({ d }) {
  if (!d) return <Empty />
  return (
    <SWrap>
      <FRow label="Primary Demographic"    value={d.primary_demographic} />
      <FRow label="Psychographic Profile"  value={d.psychographic_profile} />
      <FRow label="Geography Focus"        value={d.geography_focus} />
      <TagList label="Pain Points Addressed" items={d.pain_points_addressed} />
      <TagList label="Buying Triggers"       items={d.buying_triggers} />
      <TrustRow confidence={d.confidence} evidence={d.evidence} data_source={d.data_source} data_label={d.data_label} />
    </SWrap>
  )
}

function ChannelsSection({ d }) {
  if (!d) return <Empty />
  return (
    <SWrap>
      {Array.isArray(d.primary_channels) && d.primary_channels.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
            letterSpacing: '0.08em', color: MUTED, marginBottom: '8px' }}>Primary Channels</div>
          {d.primary_channels.map((ch, i) => (
            <div key={i} style={{ ...cardInner, padding: '10px 14px', marginBottom: '6px',
              display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: GOLD, flexShrink: 0, minWidth: '100px' }}>
                {ch.name}
              </span>
              <div style={{ fontSize: '12px', color: BONE }}>
                {ch.usage && <span>{ch.usage}</span>}
                {ch.role && <span> · {ch.role}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      <FRow label="Content Strategy"    value={d.content_strategy} />
      <FRow label="Email Marketing"     value={d.email_marketing} />
      <FRow label="Offline Presence"    value={d.offline_presence} />
      <FRow label="Partnerships"        value={d.partnerships} />
      <TrustRow confidence={d.confidence} evidence={d.evidence} data_source={d.data_source} />
    </SWrap>
  )
}

function AdvertisingSection({ d }) {
  if (!d) return <Empty />
  return (
    <SWrap>
      <TagList label="Platforms Observed"   items={d.platforms_observed} />
      <TagList label="Ad Formats"           items={d.ad_formats} />
      <TagList label="Key Messages"         items={d.key_messages} />
      <TagList label="CTA Patterns"         items={d.cta_patterns} />
      <FRow label="Estimated Spend"         value={d.estimated_spend} />
      <FRow label="Seasonal Patterns"       value={d.seasonal_patterns} />
      <TrustRow confidence={d.confidence} evidence={d.evidence} data_source={d.data_source} />
    </SWrap>
  )
}

function SEOSection({ d }) {
  if (!d) return <Empty />
  return (
    <SWrap>
      {d.seo_disclaimer && (
        <div style={{ ...cardInner, padding: '10px 14px', marginBottom: '16px', borderLeft: `3px solid ${GOLD}50` }}>
          <div style={{ fontSize: '11px', color: MUTED, fontStyle: 'italic', lineHeight: 1.5 }}>{d.seo_disclaimer}</div>
        </div>
      )}
      <FRow label="Website Health Signals"      value={d.website_health_signals} />
      <FRow label="Estimated Domain Strength"   value={d.estimated_domain_strength} />
      <FRow label="Content Strategy"            value={d.content_strategy} />
      <FRow label="Backlink Quality"            value={d.backlink_quality} />
      <FRow label="Local SEO"                   value={d.local_seo} />
      <TagList label="Keyword Themes"           items={d.keyword_themes} />
      <TrustRow confidence={d.confidence} evidence={d.evidence} data_source={d.data_source} />
    </SWrap>
  )
}

function SocialSection({ d }) {
  if (!d || Object.keys(d).length === 0) return <Empty msg="No social data found." />
  const renderVal = (v, depth = 0) => {
    if (typeof v === 'string') return <span style={{ fontSize: '13px', color: BONE }}>{v}</span>
    if (Array.isArray(v)) return (
      <div style={{ paddingLeft: '4px' }}>
        {v.map((item, i) => (
          <div key={i} style={{ fontSize: '13px', color: BONE, marginBottom: '4px' }}>
            · {typeof item === 'object' ? renderObj(item, depth + 1) : item}
          </div>
        ))}
      </div>
    )
    if (typeof v === 'object' && v !== null) return renderObj(v, depth + 1)
    return <span style={{ fontSize: '13px', color: BONE }}>{String(v)}</span>
  }
  const renderObj = (obj, depth = 0) => (
    <div style={{ paddingLeft: depth > 0 ? '8px' : '0' }}>
      {Object.entries(obj).map(([k, v]) => {
        const isVerdict = ['OBSERVED', 'NOT_VERIFIED', 'VERIFIED', 'IDENTITY_'].some(x => String(k).includes(x) || String(v).includes(x))
        return (
          <div key={k} style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
              letterSpacing: '0.07em', color: isVerdict ? GOLD : MUTED, marginBottom: '3px' }}>
              {k.replace(/_/g, ' ')}
            </div>
            {renderVal(v, depth)}
          </div>
        )
      })}
    </div>
  )
  return <SWrap>{renderObj(d)}</SWrap>
}

function CreativesSection({ d }) {
  if (!d) return <Empty />
  return (
    <SWrap>
      <FRow label="Visual Identity"       value={d.visual_identity} />
      <FRow label="Copywriting Style"     value={d.copywriting_style} />
      <TagList label="Ad Creative Patterns" items={d.ad_creative_patterns} />
      <TagList label="Hook Formulas"        items={d.hook_formulas} />
      <TrustRow confidence={d.confidence} evidence={d.evidence} data_source={d.data_source} />
    </SWrap>
  )
}

function OffersSection({ d }) {
  if (!d) return <Empty />
  return (
    <SWrap>
      <FRow label="Hero Offer"         value={d.hero_offer} />
      <FRow label="Pricing Signals"    value={d.pricing_signals} />
      <FRow label="Upsell Signals"     value={d.upsell_signals} />
      <TagList label="Promotions Observed" items={d.promotions_observed} />
      <TagList label="Lead Magnets"        items={d.lead_magnets} />
      <TrustRow confidence={d.confidence} evidence={d.evidence} data_source={d.data_source} />
    </SWrap>
  )
}

function FunnelsSection({ d }) {
  if (!d) return <Empty />
  const stages = [
    { label: 'Awareness',     value: d.awareness_stage,     color: GOLD },
    { label: 'Consideration', value: d.consideration_stage, color: '#7C8FFF' },
    { label: 'Conversion',    value: d.conversion_stage,    color: GREEN },
    { label: 'Retention',     value: d.retention_signals,   color: MUTED },
  ]
  return (
    <SWrap>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {stages.map(({ label, value, color }) => value ? (
          <div key={label} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color, textTransform: 'uppercase',
              letterSpacing: '0.07em', minWidth: '100px', paddingTop: '1px' }}>{label}</span>
            <span style={{ fontSize: '13px', color: BONE, flex: 1, lineHeight: 1.5 }}>{value}</span>
          </div>
        ) : null)}
      </div>
      <FRow label="Referral Program" value={d.referral_program} />
      <TrustRow confidence={d.confidence} evidence={d.evidence} data_source={d.data_source} />
    </SWrap>
  )
}

function CompetitorsSection({ d }) {
  if (!Array.isArray(d) || !d.length) return <Empty msg="No competitor data found." />
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: FONT_BODY }}>
        <thead>
          <tr>
            {['Competitor', 'Positioning', 'Strengths', 'Observable Weakness', 'Market Signal'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 12px', background: SLATE_M,
                color: MUTED, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
                letterSpacing: '0.07em', borderBottom: `1px solid ${SLATE_L}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.map((c, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${SLATE_L}` }}>
              <td style={{ padding: '12px', color: GOLD, fontWeight: '600', whiteSpace: 'nowrap' }}>{c.name}</td>
              <td style={{ padding: '12px', color: BONE, lineHeight: 1.5 }}>{c.positioning}</td>
              <td style={{ padding: '12px', color: MUTED }}>
                {Array.isArray(c.estimated_strengths)
                  ? c.estimated_strengths.map((s, j) => <div key={j} style={{ marginBottom: '3px' }}>· {s}</div>)
                  : c.estimated_strengths}
              </td>
              <td style={{ padding: '12px', color: MUTED }}>{c.observable_weakness}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ display: 'inline-block', background: GOLD_DIM, border: `1px solid ${GOLD_BDR}`,
                  borderRadius: '4px', padding: '2px 6px', color: MUTED, fontSize: '10px',
                  fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {c.data_label || 'OBSERVED'}
                </span>
                {c.market_share_signal && <div style={{ fontSize: '11px', color: MUTED }}>{c.market_share_signal}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SWOTSection({ d }) {
  if (!d) return <Empty />
  const quads = [
    { key: 'strengths',    label: 'Strengths',    color: GREEN },
    { key: 'weaknesses',   label: 'Weaknesses',   color: RED },
    { key: 'opportunities',label: 'Opportunities', color: GOLD },
    { key: 'threats',      label: 'Threats',      color: '#C46060' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {quads.map(({ key, label, color }) => (
        <div key={key} style={{ ...cardInner, padding: '16px', borderTop: `3px solid ${color}50` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
            letterSpacing: '0.08em', color, marginBottom: '10px' }}>{label}</div>
          {Array.isArray(d[key]) ? d[key].map((item, i) => (
            <div key={i} style={{ fontSize: '13px', color: BONE, marginBottom: '8px',
              paddingLeft: '10px', borderLeft: `2px solid ${color}30`, lineHeight: 1.5 }}>
              {item}
            </div>
          )) : <div style={{ fontSize: '13px', color: MUTED }}>Not found</div>}
        </div>
      ))}
    </div>
  )
}

function LessonsSection({ d }) {
  if (!Array.isArray(d) || !d.length) return <Empty msg="No lessons extracted." />
  return (
    <div>
      {d.map((item, i) => (
        <div key={i} style={{ ...card, padding: '18px', marginBottom: '10px', borderLeft: `3px solid ${GOLD_BDR}` }}>
          <div style={{ fontSize: '14px', color: BONE, fontWeight: '500', marginBottom: '8px', lineHeight: 1.5 }}>{item.lesson}</div>
          {item.evidence && <div style={{ fontSize: '12px', color: MUTED, marginBottom: '6px', fontStyle: 'italic' }}>{item.evidence}</div>}
          {item.applicability && (
            <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
              color: item.applicability === 'high' ? GREEN : item.applicability === 'medium' ? GOLD : MUTED,
              letterSpacing: '0.07em' }}>
              {item.applicability} applicability
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function MistakesSection({ d }) {
  if (!Array.isArray(d) || !d.length) return <Empty msg="No mistakes data found." />
  return (
    <div>
      {d.map((item, i) => (
        <div key={i} style={{ ...card, padding: '18px', marginBottom: '10px', borderLeft: `3px solid ${RED}40` }}>
          <div style={{ fontSize: '14px', color: BONE, fontWeight: '500', marginBottom: '8px', lineHeight: 1.5 }}>{item.mistake}</div>
          {item.evidence && <div style={{ fontSize: '12px', color: MUTED, marginBottom: '6px', fontStyle: 'italic' }}>{item.evidence}</div>}
          {item.lesson && (
            <div style={{ fontSize: '12px', color: GOLD, borderTop: `1px solid ${SLATE_L}`, paddingTop: '8px', marginTop: '4px' }}>
              Takeaway: {item.lesson}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function OpportunitiesSection({ d }) {
  if (!Array.isArray(d) || !d.length) return <Empty msg="No opportunities identified." />
  return (
    <div>
      {d.map((item, i) => (
        <div key={i} style={{ ...card, padding: '18px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
            <div style={{ fontSize: '14px', color: BONE, fontWeight: '500', lineHeight: 1.5 }}>{item.opportunity}</div>
            {item.confidence && <ConfBadge n={item.confidence} />}
          </div>
          {item.rationale && <div style={{ fontSize: '12px', color: MUTED, fontStyle: 'italic', lineHeight: 1.5 }}>{item.rationale}</div>}
        </div>
      ))}
    </div>
  )
}

function ApplySection({ d }) {
  if (!d) return <Empty />
  if (d.error) return <div style={{ ...card, padding: '20px', color: RED }}>{d.error}</div>
  return (
    <div>
      {d.memory_quality && (
        <div style={{ ...cardInner, padding: '12px 16px', marginBottom: '16px',
          display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: MUTED }}>Memory Quality</span>
          <span style={{ fontSize: '12px', color: d.memory_quality === 'none' ? MUTED : GREEN, fontWeight: '600' }}>{d.memory_quality}</span>
          {d.relevance_score && <span style={{ marginLeft: 'auto' }}><ConfBadge n={d.relevance_score} /></span>}
        </div>
      )}
      {d.relevance_rationale && (
        <SWrap>
          <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: MUTED, marginBottom: '6px' }}>Why This Study Matters For You</div>
          <div style={{ fontSize: '14px', color: BONE, lineHeight: 1.55 }}>{d.relevance_rationale}</div>
        </SWrap>
      )}
      {Array.isArray(d.transferable_strategies) && d.transferable_strategies.length > 0 && (
        <SWrap>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: GOLD, letterSpacing: '0.07em', marginBottom: '12px' }}>Transferable Strategies</div>
          {d.transferable_strategies.map((s, i) => (
            <div key={i} style={{ ...cardInner, padding: '14px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: BONE }}>{s.strategy}</div>
                <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', flexShrink: 0,
                  color: s.priority === 'high' ? GREEN : s.priority === 'medium' ? GOLD : MUTED }}>
                  {s.priority}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.5 }}>{s.what_to_adapt}</div>
            </div>
          ))}
        </SWrap>
      )}
      {Array.isArray(d.do_not_copy) && d.do_not_copy.length > 0 && (
        <SWrap>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: RED, letterSpacing: '0.07em', marginBottom: '12px' }}>Do NOT Copy</div>
          {d.do_not_copy.map((item, i) => (
            <div key={i} style={{ ...cardInner, padding: '12px', marginBottom: '8px', borderLeft: `3px solid ${RED}40` }}>
              <div style={{ fontSize: '13px', color: BONE, marginBottom: '4px' }}>{item.tactic}</div>
              <div style={{ fontSize: '12px', color: MUTED }}>{item.reason}</div>
            </div>
          ))}
        </SWrap>
      )}
      {d.rough_budget_estimate && (
        <SWrap>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: GOLD, letterSpacing: '0.07em', marginBottom: '12px' }}>Budget Estimate</div>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '10px', color: MUTED, marginBottom: '2px' }}>Minimum</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: BONE }}>{d.rough_budget_estimate.minimum}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: MUTED, marginBottom: '2px' }}>Recommended</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: GREEN }}>{d.rough_budget_estimate.recommended}</div>
            </div>
          </div>
          {d.rough_budget_estimate.note && <div style={{ fontSize: '11px', color: MUTED, fontStyle: 'italic' }}>{d.rough_budget_estimate.note}</div>}
        </SWrap>
      )}
      {d.expected_results && (
        <SWrap>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: GOLD, letterSpacing: '0.07em', marginBottom: '12px' }}>Expected Results</div>
          <FRow label="30 Days" value={d.expected_results['30_days']} />
          <FRow label="60 Days" value={d.expected_results['60_days']} />
          <FRow label="90 Days" value={d.expected_results['90_days']} />
          {d.expected_results.note && <div style={{ fontSize: '11px', color: MUTED, fontStyle: 'italic', marginTop: '8px' }}>{d.expected_results.note}</div>}
        </SWrap>
      )}
      {Array.isArray(d.priority_actions) && d.priority_actions.length > 0 && (
        <SWrap>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: GOLD, letterSpacing: '0.07em', marginBottom: '12px' }}>Priority Actions</div>
          {d.priority_actions.map((action, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: GOLD_DIM,
                border: `1px solid ${GOLD_BDR}`, color: GOLD, fontSize: '11px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: '13px', color: BONE, lineHeight: 1.5 }}>{action}</span>
            </div>
          ))}
        </SWrap>
      )}
    </div>
  )
}

function ActionPlanSection({ d }) {
  if (!d || !Object.keys(d).length) {
    return <Empty msg="Action plan appears when 'Apply to My Business' comparison is enabled." />
  }
  const phases = [
    { key: 'days_1_30',  label: 'Days 1–30',  color: GREEN },
    { key: 'days_31_60', label: 'Days 31–60', color: GOLD },
    { key: 'days_61_90', label: 'Days 61–90', color: '#8A8AFF' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {phases.map(({ key, label, color }) => !d[key] ? null : (
        <div key={key} style={{ ...card, padding: '20px', borderLeft: `3px solid ${color}` }}>
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
            letterSpacing: '0.08em', color, marginBottom: '12px' }}>{label}</div>
          {[].concat(d[key]).map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: `${color}18`,
                border: `1px solid ${color}30`, color, fontSize: '11px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: '13px', color: BONE, lineHeight: 1.5 }}>{step}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function Empty({ msg }) {
  return <div style={{ ...card, padding: '24px', color: MUTED, fontSize: '13px', textAlign: 'center' }}>
    {msg || 'No data available for this section.'}
  </div>
}

// ── Tab nav ───────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px',
      marginBottom: '20px', borderBottom: `1px solid ${SLATE_L}`,
      scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          padding: '7px 14px', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer',
          fontSize: '12px', fontWeight: active === t.key ? '600' : '400', fontFamily: FONT_BODY,
          color: active === t.key ? BONE : MUTED,
          background: active === t.key ? SLATE : 'transparent',
          borderBottom: active === t.key ? `2px solid ${GOLD}` : '2px solid transparent',
          whiteSpace: 'nowrap', flexShrink: 0, transition: 'color 0.12s',
        }}>{t.label}</button>
      ))}
    </div>
  )
}

// ── Main section router ───────────────────────────────────────────────────────

function SectionRouter({ tabKey, sections }) {
  const s = sections || {}
  switch (tabKey) {
    case 'overview':             return <OverviewSection d={s.overview} />
    case 'business_dna':         return <DNASection d={s.business_dna} />
    case 'timeline':             return <TimelineSection d={s.timeline} revenue={s.revenue_timeline} stories={s.unique_stories} />
    case 'audience':             return <AudienceSection d={s.audience} />
    case 'channels':             return <ChannelsSection d={s.channels} />
    case 'advertising':          return <AdvertisingSection d={s.advertising} />
    case 'seo':                  return <SEOSection d={s.seo} />
    case 'social':               return <SocialSection d={s.social} />
    case 'creatives':            return <CreativesSection d={s.creatives} />
    case 'offers':               return <OffersSection d={s.offers} />
    case 'funnels':              return <FunnelsSection d={s.funnels} />
    case 'competitors':          return <CompetitorsSection d={s.competitors} />
    case 'swot':                 return <SWOTSection d={s.swot} />
    case 'lessons':              return <LessonsSection d={s.lessons} />
    case 'mistakes':             return <MistakesSection d={s.mistakes} />
    case 'future_opportunities': return <OpportunitiesSection d={s.future_opportunities} />
    case 'apply_to_my_business': return <ApplySection d={s.apply_to_my_business} />
    case 'action_plan':          return <ActionPlanSection d={s.action_plan} />
    default: return <Empty />
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MarketingIntelligence() {
  const [companyInput, setCompanyInput] = useState('')
  const [compareEnabled, setCompareEnabled] = useState(false)
  const [myUrl, setMyUrl] = useState('')
  const [myIndustry, setMyIndustry] = useState('')
  const [myCity, setMyCity] = useState('')
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState(null)
  const [fromCache, setFromCache]   = useState(false)
  const [activeTab, setActiveTab]   = useState('overview')

  const step = useLoadingSteps(MI_STEPS, loading, 3000)

  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_KEY)
      if (s) { setResult(JSON.parse(s)); setFromCache(true) }
    } catch {}
  }, [])

  async function handleSubmit() {
    if (!companyInput.trim()) { alert('Company naam ya URL daalo!'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const body = { company_input: companyInput.trim() }
      if (compareEnabled && (myUrl || myIndustry)) {
        body.compare_to_my_business = { url: myUrl, industry: myIndustry, city: myCity }
      }
      const res = await apiFetch(`${BACKEND}/marketing-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)
        localStorage.setItem(LS_KEY, JSON.stringify(data))
        setFromCache(false)
        setActiveTab('overview')
      } else {
        setError(data.error || 'Kuch galat ho gaya.')
      }
    } catch {
      setError('Backend se connect nahi ho paya.')
    }
    setLoading(false)
  }

  function handleClear() {
    localStorage.removeItem(LS_KEY)
    setResult(null); setFromCache(false); setError(null)
  }

  function handleExport() {
    if (!result) return
    const text = JSON.stringify(result, null, 2)
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mi-${(result.company_name || 'report').replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <PageShell maxWidth="820px">
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: '26px', fontWeight: '700', color: BONE, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
        Marketing Intelligence
      </h1>
      <p style={{ color: MUTED, fontSize: '13px', margin: '0 0 32px' }}>{step}</p>
      <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: `3px solid ${SLATE_L}`, borderTop: `3px solid ${GOLD}`,
          borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: MUTED, fontSize: '14px', margin: '0 0 6px' }}>{step}</p>
        <p style={{ color: MUTED, fontSize: '12px', margin: 0, opacity: 0.7 }}>60–120 seconds lagenge</p>
      </div>
    </PageShell>
  )

  // ── Results ─────────────────────────────────────────────────────────────────
  if (result) {
    const hasCmp = !!result.sections?.apply_to_my_business
    const tabs = hasCmp
      ? [...BASE_TABS, { key: 'apply_to_my_business', label: 'Apply to My Biz' }, { key: 'action_plan', label: 'Action Plan' }]
      : BASE_TABS

    return (
      <PageShell maxWidth="1100px">
        {fromCache && (
          <div style={{ background: SLATE_M, border: `1px solid ${SLATE_L}`, borderRadius: '7px',
            padding: '9px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>Showing previous result · Generate new to refresh</p>
            <button onClick={handleClear} style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', color: MUTED, textDecoration: 'underline', padding: '0 2px' }}>Clear</button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: '26px', fontWeight: '700', color: BONE,
              margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              {result.company_name}
            </h1>
            <p style={{ color: MUTED, fontSize: '13px', margin: 0 }}>Marketing Intelligence Report</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: `1px solid ${SLATE_L}`, color: MUTED,
              padding: '7px 14px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: FONT_BODY }}>
              <Download size={13} /> Export JSON
            </button>
            <button onClick={handleClear} style={{ background: 'transparent', border: `1px solid ${SLATE_L}`,
              color: MUTED, padding: '7px 14px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: FONT_BODY }}>
              ← New Research
            </button>
          </div>
        </div>

        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <SectionRouter tabKey={activeTab} sections={result.sections} />
      </PageShell>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <PageShell maxWidth="680px">
      <PageHeader
        title="Marketing Intelligence"
        sub="Kisi bhi brand ka complete case study — strategy, social, ads, funnels, competitors"
      />

      <div style={{ ...card, padding: '28px' }}>
        {error && (
          <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid rgba(196,69,58,0.3)',
            borderRadius: '7px', padding: '11px 14px', marginBottom: '20px', color: RED, fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>Company Name, Website, or @Handle</label>
          <input
            type="text"
            value={companyInput}
            onChange={e => setCompanyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. Nike, zomato.com, @zomato"
            style={inputSt}
          />
          <div style={{ fontSize: '11px', color: MUTED, marginTop: '6px' }}>
            Global brands, Indian startups, local competitors — koi bhi kaam karega
          </div>
        </div>

        <div style={{ ...cardInner, padding: '16px', marginBottom: '24px', borderRadius: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div
              onClick={() => setCompareEnabled(v => !v)}
              style={{ width: '36px', height: '20px', borderRadius: '10px', position: 'relative', cursor: 'pointer',
                background: compareEnabled ? GOLD : SLATE_L, transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '3px', left: compareEnabled ? '19px' : '3px',
                width: '14px', height: '14px', borderRadius: '50%', background: BONE, transition: 'left 0.2s' }} />
            </div>
            <span style={{ fontSize: '13px', color: BONE, fontFamily: FONT_BODY }}>
              Apne business se compare karo
            </span>
          </label>

          {compareEnabled && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={lbl}>Meri Website</label>
                <input type="url" value={myUrl} onChange={e => setMyUrl(e.target.value)}
                  placeholder="https://sohscape.com" style={inputSt} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Industry</label>
                  <input type="text" value={myIndustry} onChange={e => setMyIndustry(e.target.value)}
                    placeholder="Digital Marketing" style={inputSt} />
                </div>
                <div>
                  <label style={lbl}>City</label>
                  <input type="text" value={myCity} onChange={e => setMyCity(e.target.value)}
                    placeholder="Mumbai" style={inputSt} />
                </div>
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSubmit} style={{ width: '100%', padding: '13px', borderRadius: '8px',
          border: 'none', background: GOLD, color: INK, fontSize: '14px', fontWeight: '700',
          cursor: 'pointer', fontFamily: FONT_BODY, letterSpacing: '-0.2px' }}>
          Research karo →
        </button>
        <p style={{ textAlign: 'center', color: MUTED, fontSize: '11px', margin: '12px 0 0' }}>
          60–120 seconds · 18 sections · Real research, no fabrication
        </p>
      </div>
    </PageShell>
  )
}
