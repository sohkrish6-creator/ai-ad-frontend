import { GOLD, INK, BONE, SLATE, SLATE_L, RED, MUTED, FONT_BODY } from './ds'

/**
 * Btn — unified button with 3 variants:
 *   'primary'     — gold bg, ink text (main actions: Generate, Run, Analyze)
 *   'secondary'   — slate border, bone text (cancel, back, secondary actions)
 *   'ghost'       — no border/bg, muted text (tertiary)
 *   'destructive' — signal-red border, red text (pause, delete, stop)
 *
 * size: 'sm' | 'md' (default) | 'lg'
 *
 * Usage:
 *   <Btn variant="primary" onClick={handleRun}>Generate Report</Btn>
 *   <Btn variant="secondary" onClick={() => setResult(null)}>← New</Btn>
 *   <Btn variant="destructive">Pause</Btn>
 *   <Btn variant="primary" size="lg" icon={<TrendingUp size={14} />}>Big CTA</Btn>
 */

const SIZE = {
  sm: { padding: '6px 14px',  fontSize: '12px', borderRadius: '6px',  iconSize: 12 },
  md: { padding: '10px 20px', fontSize: '14px', borderRadius: '8px',  iconSize: 14 },
  lg: { padding: '13px 28px', fontSize: '15px', borderRadius: '8px',  iconSize: 16 },
}

const VARIANT_STYLE = {
  primary:     { background: GOLD,        color: INK,   border: 'none',                       fontWeight: '700' },
  secondary:   { background: 'transparent', color: BONE, border: `1px solid ${SLATE_L}`,       fontWeight: '500' },
  ghost:       { background: 'transparent', color: MUTED, border: 'none',                      fontWeight: '500' },
  destructive: { background: 'rgba(196,69,58,0.10)', color: RED, border: `1px solid rgba(196,69,58,0.3)`, fontWeight: '600' },
}

export default function Btn({
  variant = 'secondary',
  size    = 'md',
  icon    = null,
  disabled = false,
  onClick,
  style = {},
  children,
  ...rest
}) {
  const s = SIZE[size] || SIZE.md
  const v = VARIANT_STYLE[variant] || VARIANT_STYLE.secondary

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: icon ? '7px' : undefined,
        padding: s.padding, fontSize: s.fontSize, borderRadius: s.borderRadius,
        fontFamily: FONT_BODY, fontWeight: v.fontWeight,
        background: v.background, color: v.color, border: v.border,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s ease, background 0.15s ease, border-color 0.15s ease',
        outline: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {icon && icon}
      {children}
    </button>
  )
}
