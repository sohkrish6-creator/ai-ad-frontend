import { forwardRef } from 'react'
import { BG_INSET, BORDER_SUBTLE, ACCENT, TEXT_PRIMARY, TEXT_TERTIARY, DANGER, FONT_BODY, radius } from '../../ds'

const labelStyle = {
  display: 'block', color: TEXT_TERTIARY, fontSize: '12px', fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '7px', fontFamily: FONT_BODY,
}

/** Input — text/number/url/password/etc. Label + inline error, focus ring in accent. */
const Input = forwardRef(function Input({ label, error, style = {}, ...rest }, ref) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        ref={ref}
        style={{
          width: '100%', padding: '10px 13px', borderRadius: radius.md,
          border: `1px solid ${error ? DANGER : BORDER_SUBTLE}`, background: BG_INSET,
          color: TEXT_PRIMARY, fontSize: '14px', boxSizing: 'border-box',
          outline: 'none', fontFamily: FONT_BODY, transition: 'border-color 0.12s ease',
          ...style,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = error ? DANGER : ACCENT; rest.onFocus?.(e) }}
        onBlur={e => { e.currentTarget.style.borderColor = error ? DANGER : BORDER_SUBTLE; rest.onBlur?.(e) }}
        {...rest}
      />
      {error && <p style={{ margin: '5px 0 0', fontSize: '12px', color: DANGER }}>{error}</p>}
    </div>
  )
})

export default Input
