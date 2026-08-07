import { ACCENT, TEXT_PRIMARY, TEXT_TERTIARY, BORDER_SUBTLE, FONT_BODY } from '../../ds'

/** Tabs — items: [{key, label}]. Controlled: active + onChange(key). */
export default function Tabs({ items, active, onChange, style = {} }) {
  return (
    <div style={{ display: 'flex', gap: '4px', borderBottom: `1px solid ${BORDER_SUBTLE}`, ...style }}>
      {items.map(item => {
        const isActive = item.key === active
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY,
              padding: '10px 14px', fontSize: '13px', fontWeight: isActive ? 600 : 500,
              color: isActive ? TEXT_PRIMARY : TEXT_TERTIARY,
              borderBottom: `2px solid ${isActive ? ACCENT : 'transparent'}`,
              marginBottom: '-1px', transition: 'color 0.12s ease, border-color 0.12s ease',
            }}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
