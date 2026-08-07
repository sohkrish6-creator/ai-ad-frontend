import { BG_SURFACE, BORDER_SUBTLE, BORDER_STRONG, TEXT_PRIMARY, TEXT_SECONDARY, radius, elevation } from '../../ds'

/**
 * Card — header/body/footer slots. Hover (when `hoverable`) shifts border
 * color + elevation only, never scale/lift — dense data screens read as
 * unstable when cards move on hover.
 *
 * Usage: <Card><Card.Header title="..." action={<Button/>} /><Card.Body>...</Card.Body></Card>
 * or just <Card>...</Card> for a plain panel.
 */
export default function Card({ children, hoverable = false, style = {}, ...rest }) {
  return (
    <div
      style={{
        background: BG_SURFACE,
        border: `1px solid ${BORDER_SUBTLE}`,
        borderRadius: radius.lg,
        boxShadow: elevation[1],
        transition: hoverable ? 'border-color 0.14s ease, box-shadow 0.14s ease' : undefined,
        ...style,
      }}
      onMouseEnter={hoverable ? (e => { e.currentTarget.style.borderColor = BORDER_STRONG; e.currentTarget.style.boxShadow = elevation[2] }) : undefined}
      onMouseLeave={hoverable ? (e => { e.currentTarget.style.borderColor = BORDER_SUBTLE; e.currentTarget.style.boxShadow = elevation[1] }) : undefined}
      {...rest}
    >
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ title, sub, action, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
      padding: '16px 20px', borderBottom: `1px solid ${BORDER_SUBTLE}`, ...style,
    }}>
      <div>
        {title && <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: TEXT_PRIMARY }}>{title}</p>}
        {sub && <p style={{ margin: '3px 0 0', fontSize: '12px', color: TEXT_SECONDARY }}>{sub}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

Card.Body = function CardBody({ children, style = {} }) {
  return <div style={{ padding: '20px', ...style }}>{children}</div>
}

Card.Footer = function CardFooter({ children, style = {} }) {
  return (
    <div style={{ padding: '14px 20px', borderTop: `1px solid ${BORDER_SUBTLE}`, ...style }}>
      {children}
    </div>
  )
}
