import {
  ACCENT, ACCENT_MUTED, SUCCESS, SUCCESS_MUTED, WARNING, WARNING_MUTED,
  DANGER, DANGER_MUTED, INFO, INFO_MUTED, TEXT_SECONDARY, BG_RAISED,
} from '../../ds'

const VARIANTS = {
  neutral: { color: TEXT_SECONDARY, bg: BG_RAISED },
  accent:  { color: ACCENT,  bg: ACCENT_MUTED },
  success: { color: SUCCESS, bg: SUCCESS_MUTED },
  warning: { color: WARNING, bg: WARNING_MUTED },
  danger:  { color: DANGER,  bg: DANGER_MUTED },
  info:    { color: INFO,    bg: INFO_MUTED },
}

/**
 * Badge / StatusPill — semantic-only coloring (success/warning/danger/info/
 * accent/neutral). Never used decoratively — every call site should be able
 * to name which of these six states it means.
 */
export default function Badge({ variant = 'neutral', children, style = {} }) {
  const v = VARIANTS[variant] || VARIANTS.neutral
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '9999px',
      fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.02em',
      color: v.color, background: v.bg, whiteSpace: 'nowrap', ...style,
    }}>
      {children}
    </span>
  )
}
