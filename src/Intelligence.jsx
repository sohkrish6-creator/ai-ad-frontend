import { useState } from 'react'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'

function ScoreRing({ score, label, inverse = false }) {
  const s = score || 0
  const pct = inverse ? 100 - s : s
  const color = pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#F43F5E'
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (s / 100) * circ
  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: '72px' }}>
      <svg width="76" height="76" viewBox="0 0 76 76" style={{ display: 'block', margin: '0 auto 8px' }}>
        <circle cx="38" cy="38" r={r} fill="none" stroke="#1E2A3E" strokeWidth="6" />
        <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 38 38)" />
        <text x="38" y="43" textAnchor="middle" fill={color} fontSize="15" fontWeight="800" fontFamily="system-ui, sans-serif">{s}</text>
      </svg>
      <p style={{ color: '#94A3B8', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>{label}</p>
    </div>
  )
}

function Badge({ label, type = 'default' }) {
  const styles = {
    default: { background: '#1E2A3E', color: '#94A3B8' },
    green:   { background: '#10B98118', color: '#10B981' },
    yellow:  { background: '#F59E0B18', color: '#F59E0B' },
    red:     { background: '#F43F5E18', color: '#F43F5E' },
    blue:    { background: '#6366F118', color: '#818CF8' },
  }
  const s = styles[type] || styles.default
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', ...s }}>
      {label}
    </span>
  )
}

function CopyBtn({ onClick, copied }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
      border: 'none', flexShrink: 0,
      background: copied ? '#10B981' : '#1E2A3E',
      color: copied ? '#fff' : '#94A3B8',
    }}>
      {copied ? '✅ Copied' : '📋 Copy'}
    </button>
  )
}

function SectionCard({ title, subtitle, accent = '#818CF8', copyKey, onCopy, copied, children }) {
  return (
    <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', padding: '26px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: accent }}>{title}</h2>
        {onCopy && <CopyBtn onClick={onCopy} copied={copied} />}
      </div>
      {subtitle && <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 20px 0' }}>{subtitle}</p>}
      {!subtitle && <div style={{ marginBottom: '20px' }} />}
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '9px 0', borderBottom: '1px solid #1E2A3E30' }}>
      <span style={{ color: '#64748B', fontSize: '13px', minWidth: '140px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#E2E8F0', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>{value}</span>
    </div>
  )
}

function ScoreBar({ label, score, inverse = false, reason }) {
  const s = score || 0
  const pct = inverse ? 100 - s : s
  const barColor = inverse
    ? (s >= 70 ? '#F43F5E' : s >= 40 ? '#F59E0B' : '#10B981')
    : (pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#F43F5E')
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
        <span style={{ color: '#94A3B8', fontSize: '13px' }}>{label}</span>
        <span style={{ color: barColor, fontSize: '13px', fontWeight: '700' }}>{s} / 100</span>
      </div>
      <div style={{ height: '6px', background: '#1E2A3E', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${s}%`, background: barColor, borderRadius: '3px' }} />
      </div>
      {reason && <p style={{ color: '#64748B', fontSize: '12px', margin: '6px 0 0', lineHeight: '1.5' }}>{reason}</p>}
    </div>
  )
}

function Intelligence() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [url, setUrl] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [competitorUrl, setCompetitorUrl] = useState('')
  const [language, setLanguage] = useState('Hinglish')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState({})

  const handleCopy = (key, value) => {
    const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    navigator.clipboard.writeText(text)
    setCopied(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000)
  }

  async function handleRun() {
    if (!url.trim()) { alert('Website URL daalo!'); return }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${BACKEND}/intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          business_type: businessType,
          competitor_urls: competitorUrl.trim() ? [competitorUrl.trim()] : [],
        }),
      })
      const data = await res.json()
      if (data.scan_failed) setError(data.message)
      else setResult(data)
    } catch {
      setError('Backend se connect nahi ho paya. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '8px',
    border: '1px solid #1E2A3E', background: '#131820', color: '#fff',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
  }

  // ── LOADING ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: '420px', width: '100%' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🧬</div>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.3px' }}>Business Intelligence Running</h2>
          <p style={{ color: '#64748B', fontSize: '13px', lineHeight: '1.6', margin: '0 0 28px' }}>
            6 engines crawling, scoring, and analyzing in parallel
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['🔎', 'Evidence Collection', 'Homepage + 5 sub-pages crawled'],
              ['🧬', 'Business DNA Engine', 'Industry, model, trust signals'],
              ['📈', 'Opportunity Score', 'Market + conversion analysis'],
              ['⚔️', 'Threat Engine', 'Competition + overlap detection'],
              ['🎯', 'Audience Intel 2.0', 'Evidence-backed segments only'],
              ['⚡', 'Executive Decisions', 'Top 5 actions + ROI plan'],
            ].map(([icon, title, sub]) => (
              <div key={title} style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <p style={{ color: '#E2E8F0', fontSize: '13px', fontWeight: '600', margin: 0 }}>{title}</p>
                  <p style={{ color: '#64748B', fontSize: '11px', margin: 0 }}>{sub}</p>
                </div>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6366F1', flexShrink: 0,
                  boxShadow: '0 0 0 3px #6366F130' }} />
              </div>
            ))}
          </div>
          <p style={{ color: '#475569', fontSize: '12px', marginTop: '20px' }}>30–60 seconds · structured JSON output</p>
        </div>
      </div>
    )
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────
  if (result) {
    const { intelligence, scores } = result
    const dna    = intelligence?.business_dna        || {}
    const opp    = intelligence?.opportunity_score   || {}
    const threat = intelligence?.threat_intelligence  || {}
    const pos    = intelligence?.positioning          || {}
    const aud    = intelligence?.audience_intelligence || {}
    const exec   = intelligence?.executive_decisions   || {}
    const ev     = intelligence?.evidence_collection   || {}

    const threatLvl = (threat.threat_level || '').toLowerCase()
    const threatColor = threatLvl === 'critical' ? '#F43F5E' : threatLvl === 'high' ? '#F97316' : threatLvl === 'medium' ? '#F59E0B' : '#10B981'

    const impactColor = v => ({ Critical: '#F43F5E', High: '#10B981', Medium: '#F59E0B', Low: '#94A3B8' }[v] || '#94A3B8')
    const effortColor = v => ({ Low: '#10B981', Medium: '#F59E0B', High: '#F43F5E' }[v] || '#94A3B8')

    const verdictType = v => {
      if (v === 'Highly Optimized' || v === 'Good to Go') return 'green'
      if (v === 'Not Ready') return 'red'
      return 'yellow'
    }

    return (
      <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>

        {/* Sticky Header */}
        <div style={{ background: '#0D1117', borderBottom: '1px solid #1E2A3E', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <span style={{ fontWeight: '700', fontSize: '15px' }}>🧬 Business Intelligence</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!isMobile && <span style={{ color: '#475569', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.url}</span>}
            <button onClick={() => setResult(null)} style={{ background: 'transparent', border: '1px solid #1E2A3E', color: '#64748B', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
              ← New Analysis
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 20px' }}>

          {/* Success Banner */}
          <div style={{ background: 'linear-gradient(135deg, #10B98112 0%, #6366F112 100%)', border: '1px solid #6366F135', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#10B981' }}>✅ Intelligence Report Ready</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
                {ev.pages_fetched || ev.pages_crawled || 0} pages fetched · {ev.pages_with_evidence || 0} with content · {ev.evidence_points || 0} evidence points · {Math.round((ev.avg_confidence || 0) * 100)}% avg confidence{ev.sitemap_crawled ? ' · sitemap ✓' : ''}
              </p>
            </div>
            <Badge label={exec.readiness_verdict || 'Analyzing'} type={verdictType(exec.readiness_verdict)} />
          </div>

          {/* ── 1. SCORE DASHBOARD ── */}
          <div style={{ background: 'linear-gradient(135deg, #0c1628 0%, #0D1117 100%)', border: '1px solid #6366F135', borderRadius: '16px', padding: '26px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#818CF8' }}>⚡ Score Dashboard</h2>
                <p style={{ color: '#64748B', fontSize: '12px', margin: '4px 0 0' }}>6 intelligence scores — Threat: lower is better</p>
              </div>
              <CopyBtn onClick={() => handleCopy('scores', scores)} copied={copied.scores} />
            </div>
            <div style={{ display: 'flex', gap: isMobile ? '12px' : '8px', justifyContent: 'space-around', flexWrap: 'wrap', rowGap: '20px' }}>
              <ScoreRing score={scores?.dna_score}              label="DNA Score" />
              <ScoreRing score={scores?.opportunity_score}      label="Opportunity" />
              <ScoreRing score={scores?.threat_score}           label="Threat" inverse />
              <ScoreRing score={scores?.positioning_score}      label="Positioning" />
              <ScoreRing score={scores?.audience_quality_score} label="Audience" />
              <ScoreRing score={scores?.readiness_score}        label="Readiness" />
            </div>
          </div>

          {/* ── 2. BUSINESS DNA ── */}
          <SectionCard
            title="🧬 Business DNA"
            subtitle="Industry classification built from evidence only — no assumptions"
            accent="#A78BFA"
            onCopy={() => handleCopy('dna', dna)}
            copied={copied.dna}
          >
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 36px', marginBottom: '16px' }}>
              <div>
                <InfoRow label="Detected Industry"    value={dna.detected_industry} />
                <InfoRow label="Sub-Industry"         value={dna.detected_sub_industry} />
                <InfoRow label="Business Model"       value={dna.business_model} />
                <InfoRow label="Revenue Model"        value={dna.revenue_model} />
              </div>
              <div>
                <InfoRow label="Price Range"          value={dna.price_range} />
                <InfoRow label="Target Geography"     value={dna.target_geography} />
                <InfoRow label="DNA Score"            value={dna.dna_score != null ? `${dna.dna_score} / 100` : null} />
              </div>
            </div>

            {dna.dna_score_reason && (
              <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 16px', lineHeight: '1.5' }}>{dna.dna_score_reason}</p>
            )}

            {dna.unique_value_prop && (
              <div style={{ background: '#131820', border: '1px solid #6366F118', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                <p style={{ color: '#6366F1', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Unique Value Proposition</p>
                <p style={{ color: '#E2E8F0', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>{dna.unique_value_prop}</p>
              </div>
            )}

            {(dna.core_products || []).length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <p style={{ color: '#64748B', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Core Products / Services</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {dna.core_products.map((p, i) => <Badge key={i} label={p} type="blue" />)}
                </div>
              </div>
            )}

            {(dna.trust_signals || []).length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <p style={{ color: '#64748B', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Trust Signals Found</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {dna.trust_signals.map((s, i) => <Badge key={i} label={s} type="green" />)}
                </div>
              </div>
            )}

            {(dna.evidence_used || []).length > 0 && (
              <div style={{ background: '#0c1018', borderRadius: '8px', padding: '12px 14px' }}>
                <p style={{ color: '#475569', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Evidence Used for Classification</p>
                {dna.evidence_used.map((e, i) => (
                  <p key={i} style={{ color: '#475569', fontSize: '12px', margin: '4px 0', fontStyle: 'italic', lineHeight: '1.5' }}>"{e}"</p>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── 3. OPPORTUNITY ANALYSIS ── */}
          <SectionCard
            title="📈 Opportunity Analysis"
            subtitle="Market opportunity, competition difficulty, conversion potential"
            accent="#10B981"
            onCopy={() => handleCopy('opp', opp)}
            copied={copied.opp}
          >
            <ScoreBar label="Market Opportunity"      score={opp.market_opportunity_score}     reason={opp.market_opportunity_reason} />
            <ScoreBar label="Competition Difficulty"  score={opp.competition_difficulty_score} reason={opp.competition_difficulty_reason} inverse />
            <ScoreBar label="Conversion Potential"    score={opp.conversion_potential_score}   reason={opp.conversion_potential_reason} />

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '10px', marginTop: '20px' }}>
              {[
                { label: 'Market Size',      value: opp.market_size,      color: '#E2E8F0' },
                { label: 'Best Platform',    value: opp.best_platform,    color: '#818CF8' },
                { label: 'Budget Efficiency', value: opp.budget_efficiency, color: opp.budget_efficiency === 'High' ? '#10B981' : opp.budget_efficiency === 'Medium' ? '#F59E0B' : '#F43F5E' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#131820', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                  <p style={{ color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{label}</p>
                  <p style={{ color, fontSize: '14px', fontWeight: '700', margin: 0 }}>{value || '—'}</p>
                </div>
              ))}
            </div>

            {opp.best_platform_reason && (
              <p style={{ color: '#64748B', fontSize: '13px', margin: '14px 0 0', lineHeight: '1.6' }}>{opp.best_platform_reason}</p>
            )}

            {(opp.seasonal_factors || []).length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <p style={{ color: '#64748B', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Seasonal Factors</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {opp.seasonal_factors.map((f, i) => <Badge key={i} label={f} />)}
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── 4. THREAT INTELLIGENCE ── */}
          <SectionCard
            title="⚔️ Threat Intelligence"
            subtitle="Competitor landscape, audience overlap, pricing overlap, your moat"
            accent="#F97316"
            onCopy={() => handleCopy('threat', threat)}
            copied={copied.threat}
          >
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Threat Score',     value: `${threat.competitor_threat_score || 0} / 100`, color: threatColor },
                { label: 'Threat Level',     value: threat.threat_level || '—',                    color: threatColor },
                { label: 'Audience Overlap', value: `${threat.audience_overlap_pct || 0}%`,         color: '#F59E0B' },
                { label: 'Pricing Overlap',  value: `${threat.pricing_overlap_pct || 0}%`,          color: '#F59E0B' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#131820', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                  <p style={{ color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{label}</p>
                  <p style={{ color, fontSize: '14px', fontWeight: '700', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#F43F5E', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Key Threats</p>
                {(threat.key_threats || []).map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#F43F5E', fontSize: '12px', marginTop: '2px', flexShrink: 0 }}>▸</span>
                    <p style={{ color: '#E2E8F0', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{t}</p>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ color: '#10B981', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Your Differentiators</p>
                {(threat.differentiators || []).map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#10B981', fontSize: '12px', marginTop: '2px', flexShrink: 0 }}>✓</span>
                    <p style={{ color: '#E2E8F0', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#131820', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 3px' }}>
                  Moat Strength: <span style={{ color: '#E2E8F0', fontWeight: '600' }}>{threat.moat_strength || '—'}</span>
                </p>
                {threat.moat_reason && <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>{threat.moat_reason}</p>}
              </div>
              <Badge label={threat.estimated_competitors || '—'} />
            </div>
          </SectionCard>

          {/* ── 5. POSITIONING ENGINE ── */}
          <SectionCard
            title="🎯 Positioning Engine"
            subtitle="Where you stand, where competitors stand, and the space you should own"
            accent="#38BDF8"
            onCopy={() => handleCopy('pos', pos)}
            copied={copied.pos}
          >
            {/* Winning Position — hero callout */}
            {pos.winning_position && (
              <div style={{ background: 'linear-gradient(135deg, #0c1e2e 0%, #131820 100%)', border: '1px solid #38BDF840', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px', borderLeft: '4px solid #38BDF8' }}>
                <p style={{ color: '#38BDF8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Winning Position</p>
                <p style={{ color: '#F0F9FF', fontSize: '16px', fontWeight: '700', margin: '0 0 8px', lineHeight: '1.4' }}>{pos.winning_position}</p>
                {pos.category_ownership_opportunity && (
                  <div style={{ display: 'inline-block', background: '#38BDF820', border: '1px solid #38BDF840', borderRadius: '20px', padding: '4px 14px', marginTop: '4px' }}>
                    <span style={{ color: '#7DD3FC', fontSize: '13px', fontWeight: '600' }}>🏆 {pos.category_ownership_opportunity}</span>
                  </div>
                )}
              </div>
            )}

            {/* Current Positioning */}
            {pos.current_positioning && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#64748B', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Current Positioning</p>
                <div style={{ background: '#131820', borderRadius: '10px', padding: '14px' }}>
                  <p style={{ color: '#E2E8F0', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{pos.current_positioning}</p>
                </div>
              </div>
            )}

            {/* Positioning Gap */}
            {pos.positioning_gap && (
              <div style={{ background: '#10B98110', border: '1px solid #10B98128', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <p style={{ color: '#10B981', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Positioning Gap — Unoccupied Space</p>
                <p style={{ color: '#E2E8F0', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{pos.positioning_gap}</p>
              </div>
            )}

            {/* Competitor Positioning */}
            {(pos.competitor_positioning || []).length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#64748B', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Competitor Positioning</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pos.competitor_positioning.map((comp, i) => (
                    <div key={i} style={{ background: '#131820', border: '1px solid #1E2A3E', borderRadius: '10px', padding: '13px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F97316' + '18', border: '1px solid #F9731630', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <span style={{ color: '#F97316', fontSize: '12px', fontWeight: '800' }}>{i + 1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#E2E8F0', fontSize: '13px', fontWeight: '600', margin: '0 0 3px' }}>{comp.name}</p>
                        <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 6px', lineHeight: '1.5' }}>{comp.position}</p>
                        {comp.owned_category && (
                          <Badge label={comp.owned_category} type="yellow" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messaging Shift */}
            {pos.messaging_shift && (
              <div style={{ background: '#131820', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <p style={{ color: '#64748B', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Messaging Shift</p>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{pos.messaging_shift}</p>
              </div>
            )}

            {/* Reasoning */}
            {pos.reasoning && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#64748B', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Reasoning</p>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{pos.reasoning}</p>
              </div>
            )}

            {/* Supporting Evidence + Confidence */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {(pos.supporting_evidence || []).length > 0 && (
                <div style={{ flex: 1, minWidth: '220px', background: '#0c1018', borderRadius: '8px', padding: '12px 14px' }}>
                  <p style={{ color: '#475569', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Supporting Evidence</p>
                  {pos.supporting_evidence.map((e, i) => (
                    <p key={i} style={{ color: '#475569', fontSize: '12px', margin: '4px 0', fontStyle: 'italic', lineHeight: '1.5' }}>"{e}"</p>
                  ))}
                </div>
              )}
              {pos.confidence_score != null && (
                <div style={{ background: '#131820', borderRadius: '10px', padding: '14px 18px', textAlign: 'center', minWidth: '100px' }}>
                  <p style={{ color: pos.confidence_score >= 75 ? '#10B981' : pos.confidence_score >= 50 ? '#F59E0B' : '#F43F5E', fontSize: '26px', fontWeight: '800', margin: '0 0 4px' }}>{pos.confidence_score}</p>
                  <p style={{ color: '#64748B', fontSize: '11px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── 6. AUDIENCE INTELLIGENCE 2.0 ── */}
          <SectionCard
            title="🎯 Audience Intelligence 2.0"
            subtitle="Segments generated ONLY from Business DNA evidence — rejections shown"
            accent="#F7B731"
            onCopy={() => handleCopy('aud', aud)}
            copied={copied.aud}
          >
            {(aud.validated_segments || []).map((seg, i) => (
              <div key={i} style={{ background: '#080f08', border: '1px solid #10B98135', borderRadius: '12px', padding: '18px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#10B981', fontSize: '14px', fontWeight: '700', margin: '0 0 8px' }}>
                      {i === (aud.primary_segment_index || 0) ? '★ ' : ''}{seg.segment_name}
                      {i === (aud.primary_segment_index || 0) && <span style={{ color: '#64748B', fontSize: '11px', fontWeight: '400', marginLeft: '8px' }}>Primary</span>}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {seg.age_range    && <Badge label={seg.age_range}    type="green" />}
                      {seg.gender       && <Badge label={seg.gender}       type="green" />}
                      {seg.income_level && <Badge label={seg.income_level} type="green" />}
                      {seg.estimated_reach && <Badge label={seg.estimated_reach} />}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <p style={{ color: '#10B981', fontSize: '20px', fontWeight: '800', margin: 0 }}>{seg.confidence_score}</p>
                    <p style={{ color: '#64748B', fontSize: '10px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>conf.</p>
                  </div>
                </div>

                {(seg.interests || []).length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Interests</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {seg.interests.map((x, j) => <Badge key={j} label={x} />)}
                    </div>
                  </div>
                )}
                {(seg.meta_interests || []).length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Meta Interests</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {seg.meta_interests.map((x, j) => <Badge key={j} label={x} type="blue" />)}
                    </div>
                  </div>
                )}
                {(seg.google_in_market || []).length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Google In-Market Segments</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {seg.google_in_market.map((x, j) => <Badge key={j} label={x} type="green" />)}
                    </div>
                  </div>
                )}
                {(seg.behaviors || []).length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ color: '#475569', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Behaviors</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {seg.behaviors.map((x, j) => <Badge key={j} label={x} />)}
                    </div>
                  </div>
                )}

                {seg.evidence_backing && (
                  <div style={{ background: '#0d1a0d', borderRadius: '8px', padding: '10px 12px', marginTop: '8px' }}>
                    <p style={{ color: '#475569', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Evidence Backing</p>
                    <p style={{ color: '#6EE7B7', fontSize: '12px', margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>"{seg.evidence_backing}"</p>
                  </div>
                )}
              </div>
            ))}

            {(aud.rejected_segments || []).length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ color: '#F43F5E', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                  Rejected Segments — insufficient evidence
                </p>
                {aud.rejected_segments.map((seg, i) => (
                  <div key={i} style={{ background: '#150a0a', border: '1px solid #F43F5E25', borderRadius: '10px', padding: '12px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ color: '#F43F5E', fontSize: '13px', fontWeight: '600' }}>✗ {seg.segment}</span>
                    <span style={{ color: '#64748B', fontSize: '12px' }}>{seg.rejection_reason}</span>
                  </div>
                ))}
              </div>
            )}

            {aud.audience_quality_reason && (
              <p style={{ color: '#64748B', fontSize: '12px', margin: '14px 0 0', lineHeight: '1.5' }}>
                Audience Quality Score: <span style={{ color: '#F7B731', fontWeight: '700' }}>{aud.audience_quality_score}/100</span> — {aud.audience_quality_reason}
              </p>
            )}
          </SectionCard>

          {/* ── 6. EXECUTIVE DECISIONS ── */}
          <SectionCard
            title="⚡ Executive Decisions"
            subtitle="Top 5 highest-impact actions, ROI priorities, 30/60/90-day plan"
            accent="#F59E0B"
            onCopy={() => handleCopy('exec', exec)}
            copied={copied.exec}
          >
            {exec.highest_roi_action && (
              <div style={{ background: 'linear-gradient(135deg, #18120000 0%, #131820 100%)', border: '1px solid #F59E0B40', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px', borderLeft: '4px solid #F59E0B' }}>
                <p style={{ color: '#F59E0B', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>⚡ Highest ROI Action</p>
                <p style={{ color: '#FEF3C7', fontSize: '15px', fontWeight: '700', margin: '0 0 6px', lineHeight: '1.4' }}>{exec.highest_roi_action}</p>
                {exec.highest_roi_reason && <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{exec.highest_roi_reason}</p>}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {(exec.top_5_actions || []).map((action, i) => (
                <div key={i} style={{ background: '#131820', border: '1px solid #1E2A3E', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366F115', border: '1px solid #6366F135', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <span style={{ color: '#818CF8', fontSize: '13px', fontWeight: '800' }}>{action.rank}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#E2E8F0', fontSize: '14px', fontWeight: '600', margin: '0 0 5px', lineHeight: '1.4' }}>{action.action}</p>
                      {action.why && <p style={{ color: '#64748B', fontSize: '13px', margin: '0 0 10px', lineHeight: '1.5' }}>{action.why}</p>}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {action.expected_impact && (
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `${impactColor(action.expected_impact)}18`, color: impactColor(action.expected_impact) }}>
                            {action.expected_impact} Impact
                          </span>
                        )}
                        {action.effort && (
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `${effortColor(action.effort)}18`, color: effortColor(action.effort) }}>
                            {action.effort} Effort
                          </span>
                        )}
                        {action.timeline && (
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: '#1E2A3E', color: '#94A3B8' }}>
                            {action.timeline}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(exec.quick_wins || []).length > 0 && (
              <div style={{ background: '#10B98110', border: '1px solid #10B98128', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ color: '#10B981', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>⚡ Quick Wins</p>
                {exec.quick_wins.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>
                    <p style={{ color: '#E2E8F0', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{w}</p>
                  </div>
                ))}
              </div>
            )}

            {(exec.plan_30_day || exec.plan_60_day || exec.plan_90_day) && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {[
                  { label: '30 Days', value: exec.plan_30_day, color: '#10B981' },
                  { label: '60 Days', value: exec.plan_60_day, color: '#F59E0B' },
                  { label: '90 Days', value: exec.plan_90_day, color: '#818CF8' },
                ].map(({ label, value, color }) => value ? (
                  <div key={label} style={{ background: '#131820', borderRadius: '10px', padding: '14px', borderTop: `3px solid ${color}` }}>
                    <p style={{ color, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>{label}</p>
                    <p style={{ color: '#E2E8F0', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{value}</p>
                  </div>
                ) : null)}
              </div>
            )}

            {(exec.biggest_risk || exec.biggest_opportunity) && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                {exec.biggest_risk && (
                  <div style={{ background: '#150a0a', border: '1px solid #F43F5E20', borderRadius: '10px', padding: '14px' }}>
                    <p style={{ color: '#F43F5E', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Biggest Risk</p>
                    <p style={{ color: '#E2E8F0', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{exec.biggest_risk}</p>
                  </div>
                )}
                {exec.biggest_opportunity && (
                  <div style={{ background: '#080f08', border: '1px solid #10B98120', borderRadius: '10px', padding: '14px' }}>
                    <p style={{ color: '#10B981', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Biggest Opportunity</p>
                    <p style={{ color: '#E2E8F0', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{exec.biggest_opportunity}</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

        </div>
      </div>
    )
  }

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#080B12', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      <div style={{ background: '#0D1117', borderBottom: '1px solid #1E2A3E', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: '700', fontSize: '15px' }}>🧬 Business Intelligence</span>
      </div>

      <div style={{ maxWidth: '560px', margin: '40px auto', padding: '0 24px' }}>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-block', background: '#6366F118', border: '1px solid #6366F135', borderRadius: '20px', padding: '4px 14px', marginBottom: '14px' }}>
            <span style={{ color: '#818CF8', fontSize: '12px', fontWeight: '600' }}>🧬 Flagship Feature</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 10px', letterSpacing: '-0.4px' }}>
            Business Intelligence Platform
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0, lineHeight: '1.7' }}>
            6 AI engines. Evidence-only analysis. DNA score, opportunity score, threat score, audience quality, readiness — sab ek saath.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '28px' }}>
          {[
            ['🔎', 'Evidence Engine', '6 pages crawled'],
            ['🧬', 'DNA Scoring',    'Evidence-only'],
            ['⚡', '5 BI Scores',    'Real-time output'],
          ].map(([icon, title, sub]) => (
            <div key={title} style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
              <p style={{ color: '#E2E8F0', fontSize: '12px', fontWeight: '600', margin: '0 0 3px' }}>{title}</p>
              <p style={{ color: '#64748B', fontSize: '11px', margin: 0 }}>{sub}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#0D1117', border: '1px solid #1E2A3E', borderRadius: '16px', padding: '28px' }}>
          {error && (
            <div style={{ background: '#F43F5E15', border: '1px solid #F43F5E40', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#F43F5E', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          <p style={{ fontSize: '11px', color: '#6366F1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px' }}>
            Business Info
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Website URL *</label>
            <input
              type="url" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://aapkibusiness.com"
              onKeyDown={e => e.key === 'Enter' && handleRun()}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Business Type <span style={{ color: '#475569', fontWeight: '400' }}>(optional — AI verify karega)</span></label>
            <select value={businessType} onChange={e => setBusinessType(e.target.value)}
              style={{ ...inputStyle, color: businessType ? '#fff' : '#64748B' }}>
              <option value="">Select karo...</option>
              <option value="Wedding & Events">Wedding &amp; Events</option>
              <option value="Restaurant / Cafe">Restaurant / Cafe</option>
              <option value="Healthcare / Clinic">Healthcare / Clinic</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Education / Coaching">Education / Coaching</option>
              <option value="Beauty & Skincare">Beauty &amp; Skincare</option>
              <option value="Retail Store">Retail Store</option>
              <option value="Salon / Spa">Salon / Spa</option>
              <option value="Travel & Tourism">Travel &amp; Tourism</option>
              <option value="Technology / SaaS">Technology / SaaS</option>
              <option value="Digital Marketing Agency">Digital Marketing Agency</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>
                Competitor URL <span style={{ color: '#475569', fontWeight: '400' }}>(optional)</span>
              </label>
              <input type="url" value={competitorUrl} onChange={e => setCompetitorUrl(e.target.value)}
                placeholder="https://competitor.com"
                style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={inputStyle}>
                <option value="Hinglish">Hinglish</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRun}
            style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.02em' }}
          >
            🧬 Run Business Intelligence
          </button>
          <p style={{ textAlign: 'center', color: '#475569', fontSize: '12px', margin: '12px 0 0' }}>
            30–60 seconds · 6 engines · evidence-backed JSON output
          </p>
        </div>
      </div>
    </div>
  )
}

export default Intelligence
