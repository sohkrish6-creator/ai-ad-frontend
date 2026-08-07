import { forwardRef } from 'react'
import { BG_INSET, BORDER_SUBTLE, ACCENT, TEXT_PRIMARY, TEXT_TERTIARY, FONT_BODY, radius } from '../../ds'

const labelStyle = {
  display: 'block', color: TEXT_TERTIARY, fontSize: '12px', fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '7px', fontFamily: FONT_BODY,
}

/** Select — options: [{value, label}] or raw <option> children via `children`. */
const Select = forwardRef(function Select({ label, options, placeholder, children, style = {}, ...rest }, ref) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <select
        ref={ref}
        style={{
          width: '100%', padding: '10px 13px', borderRadius: radius.md,
          border: `1px solid ${BORDER_SUBTLE}`, background: BG_INSET,
          color: rest.value ? TEXT_PRIMARY : TEXT_TERTIARY, fontSize: '14px', boxSizing: 'border-box',
          outline: 'none', fontFamily: FONT_BODY, cursor: 'pointer', transition: 'border-color 0.12s ease',
          ...style,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = ACCENT; rest.onFocus?.(e) }}
        onBlur={e => { e.currentTarget.style.borderColor = BORDER_SUBTLE; rest.onBlur?.(e) }}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options ? options.map(o => <option key={o.value} value={o.value}>{o.label}</option>) : children}
      </select>
    </div>
  )
})

export default Select
