import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import {
  ACCENT, ACCENT_HOVER, DANGER, BG_RAISED, BORDER_SUBTLE, BORDER_STRONG,
  TEXT_PRIMARY, TEXT_SECONDARY, BG_INSET, FONT_BODY, radius,
} from '../../ds'

const SIZES = {
  sm: { padding: '6px 12px', fontSize: '12.5px', gap: '6px', iconSize: 13 },
  md: { padding: '9px 16px', fontSize: '13.5px', gap: '7px', iconSize: 14 },
  lg: { padding: '12px 22px', fontSize: '14.5px', gap: '8px', iconSize: 16 },
}

function variantStyle(variant, disabled) {
  if (disabled) {
    return { background: BG_INSET, color: TEXT_SECONDARY, border: `1px solid ${BORDER_SUBTLE}` }
  }
  switch (variant) {
    case 'primary':
      return { background: ACCENT, color: '#0B0D12', border: `1px solid ${ACCENT}` }
    case 'danger':
      return { background: 'transparent', color: DANGER, border: `1px solid rgba(251,113,133,0.4)` }
    case 'ghost':
      return { background: 'transparent', color: TEXT_SECONDARY, border: '1px solid transparent' }
    case 'secondary':
    default:
      return { background: 'transparent', color: TEXT_PRIMARY, border: `1px solid ${BORDER_SUBTLE}` }
  }
}

/**
 * Button — primary/secondary/ghost/danger, sm/md/lg, optional loading state.
 * Hover is a background/border shift only — no scale, no lift, per the
 * redesign's "restraint over effects" direction (dense data screens feel
 * unstable with lifting buttons).
 */
const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', loading = false, disabled = false, icon: Icon, children, style = {}, ...rest },
  ref
) {
  const s = SIZES[size] || SIZES.md
  const v = variantStyle(variant, disabled || loading)
  const isDisabled = disabled || loading
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: s.gap,
        padding: s.padding, fontSize: s.fontSize, fontWeight: 600, fontFamily: FONT_BODY,
        borderRadius: radius.md, cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease',
        ...v, ...style,
      }}
      onMouseEnter={e => {
        if (isDisabled) return
        if (variant === 'primary') e.currentTarget.style.background = ACCENT_HOVER
        else if (variant === 'secondary') e.currentTarget.style.borderColor = BORDER_STRONG
        else if (variant === 'ghost') e.currentTarget.style.background = BG_RAISED
        else if (variant === 'danger') e.currentTarget.style.background = 'rgba(251,113,133,0.1)'
      }}
      onMouseLeave={e => {
        if (isDisabled) return
        e.currentTarget.style.background = v.background
        e.currentTarget.style.borderColor = v.border.split(' ').pop()
      }}
      {...rest}
    >
      {loading
        ? <Loader2 size={s.iconSize} className="spin" />
        : (Icon && <Icon size={s.iconSize} />)}
      {children}
    </button>
  )
})

export default Button
