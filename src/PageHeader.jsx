import { BONE, MUTED, FONT_DISPLAY, FONT_BODY } from './ds'
import PulseLedger from './PulseLedger'

/**
 * PageHeader — consistent page title block used on every page.
 * Title (Fraunces) left-aligned, sub line below, optional right-side slot,
 * always followed by a PulseLedger divider.
 *
 * Usage:
 *   <PageHeader
 *     title="Smart Analysis"
 *     sub="URL + industry → 7-module parallel deep-dive"
 *     action={<Button>Run Analysis</Button>}   // optional right slot
 *   />
 */
export default function PageHeader({ title, sub, action, style = {} }) {
  return (
    <div style={{ marginBottom: '32px', ...style }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: '16px', flexWrap: 'wrap', marginBottom: '16px',
      }}>
        <div>
          <h1 style={{
            fontFamily: FONT_DISPLAY,
            fontSize: '26px', fontWeight: '700',
            margin: '0 0 5px', letterSpacing: '-0.5px',
            color: BONE, lineHeight: 1.2,
          }}>
            {title}
          </h1>
          {sub && (
            <p style={{
              color: MUTED, fontSize: '13px', margin: 0,
              fontFamily: FONT_BODY, lineHeight: 1.5,
            }}>
              {sub}
            </p>
          )}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
      <PulseLedger goldPositions={[2, 9, 17]} />
    </div>
  )
}
