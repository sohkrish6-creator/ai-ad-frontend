import { AlertTriangle, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react'

const VERDICT_CONFIG = {
  HIGH:         { bg: '#F0FDF4', border: '#BBF7D0', color: '#166534', dot: '#22C55E', label: 'High Confidence — ready to use', Icon: ShieldCheck },
  MEDIUM:       { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E', dot: '#D4AF37', label: 'Medium — review before using', Icon: ShieldQuestion },
  VERIFY_FIRST: { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B', dot: '#EF4444', label: 'Verify First — may be generic/off', Icon: ShieldAlert },
}

export function TrustBadge({ verdict, basedOn }) {
  if (!verdict || !verdict.level) return null
  const c = VERDICT_CONFIG[verdict.level] || VERDICT_CONFIG.MEDIUM
  const { Icon } = c
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '8px', padding: '13px 16px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
        <Icon size={15} color={c.color} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '13px', fontWeight: '700', color: c.color }}>{c.label}</span>
      </div>
      {verdict.reason && <p style={{ margin: '0 0 5px', fontSize: '12px', color: c.color, opacity: 0.85, lineHeight: 1.5 }}>{verdict.reason}</p>}
      {basedOn && <p style={{ margin: 0, fontSize: '12px', color: c.color, opacity: 0.75, lineHeight: 1.5 }}>{basedOn}</p>}
    </div>
  )
}

export function ValidationWarningBanner({ message }) {
  if (!message) return null
  return (
    <div style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: '8px', padding: '14px 18px', marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
      <p style={{ margin: 0, fontSize: '13px', color: '#991B1B', fontWeight: '500', lineHeight: 1.5 }}>{message}</p>
    </div>
  )
}

export function NeedsMarketingBrainNotice({ show, message }) {
  if (!show) return null
  return (
    <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '8px', padding: '13px 18px', marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: '1px' }} />
      <p style={{ margin: 0, fontSize: '13px', color: '#92400E', fontWeight: '500', lineHeight: 1.5 }}>{message || "We couldn't confidently read this business from its website. For accurate creatives, run Marketing Brain first."}</p>
    </div>
  )
}
