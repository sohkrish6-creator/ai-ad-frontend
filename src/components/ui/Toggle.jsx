import { ACCENT, BORDER_STRONG, TEXT_PRIMARY, FONT_BODY } from '../../ds'

/** Toggle — controlled boolean switch, with an optional trailing label. */
export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1, fontFamily: FONT_BODY,
    }}>
      <span
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          width: '34px', height: '20px', borderRadius: '9999px', position: 'relative', flexShrink: 0,
          background: checked ? ACCENT : BORDER_STRONG,
          transition: 'background-color 0.15s ease',
        }}
      >
        <span style={{
          position: 'absolute', top: '2px', left: checked ? '16px' : '2px',
          width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
          transition: 'left 0.15s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }} />
      </span>
      {label && <span style={{ fontSize: '13px', color: TEXT_PRIMARY }}>{label}</span>}
    </label>
  )
}
