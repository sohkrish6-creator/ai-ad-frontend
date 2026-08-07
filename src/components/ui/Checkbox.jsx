import { Check } from 'lucide-react'
import { ACCENT, BORDER_STRONG, BG_INSET, TEXT_PRIMARY, FONT_BODY, radius } from '../../ds'

/** Checkbox — controlled, with an optional label. No native checkbox styling (cross-browser inconsistent). */
export default function Checkbox({ checked, onChange, label, disabled = false, style = {} }) {
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: '9px', cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1, fontFamily: FONT_BODY, ...style,
    }}>
      <span
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          width: '16px', height: '16px', borderRadius: radius.sm, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: checked ? ACCENT : BG_INSET,
          border: `1px solid ${checked ? ACCENT : BORDER_STRONG}`,
          transition: 'background-color 0.12s ease, border-color 0.12s ease',
        }}
      >
        {checked && <Check size={12} color="#0B0D12" strokeWidth={3} />}
      </span>
      {label && <span style={{ fontSize: '13px', color: TEXT_PRIMARY }}>{label}</span>}
    </label>
  )
}
