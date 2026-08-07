import { useState } from 'react'
import { BG_RAISED, BORDER_STRONG, TEXT_PRIMARY, radius, elevation } from '../../ds'

/** Tooltip — wraps a trigger element, shows `content` on hover/focus. placement: 'top' (default) | 'bottom'. */
export default function Tooltip({ content, children, placement = 'top' }) {
  const [open, setOpen] = useState(false)
  if (!content) return children

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          [placement === 'top' ? 'bottom' : 'top']: 'calc(100% + 6px)',
          background: BG_RAISED, border: `1px solid ${BORDER_STRONG}`, borderRadius: radius.sm,
          padding: '5px 9px', fontSize: '11.5px', color: TEXT_PRIMARY, whiteSpace: 'nowrap',
          boxShadow: elevation[2], zIndex: 1000, pointerEvents: 'none',
        }}>
          {content}
        </span>
      )}
    </span>
  )
}
