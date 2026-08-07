import { TEXT_PRIMARY, TEXT_SECONDARY, BG_RAISED, BORDER_SUBTLE, radius } from '../../ds'
import Button from './Button'

/**
 * EmptyState — icon, headline, one-line guidance, primary action. This
 * component's own API has no bare-message-only path: `headline` and
 * `action` are both required, so "no data" alone can never render —
 * every empty state must say what to do next.
 *
 * action: { label, onClick } — onClick typically a navigate() call.
 */
export default function EmptyState({ icon: Icon, headline, description, action, style = {} }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      padding: '48px 24px', ...style,
    }}>
      {Icon && (
        <div style={{
          width: '44px', height: '44px', borderRadius: radius.lg, background: BG_RAISED,
          border: `1px solid ${BORDER_SUBTLE}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: '16px',
        }}>
          <Icon size={20} color={TEXT_SECONDARY} />
        </div>
      )}
      <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600, color: TEXT_PRIMARY }}>{headline}</p>
      {description && <p style={{ margin: '0 0 20px', fontSize: '12.5px', color: TEXT_SECONDARY, maxWidth: '340px', lineHeight: 1.5 }}>{description}</p>}
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
