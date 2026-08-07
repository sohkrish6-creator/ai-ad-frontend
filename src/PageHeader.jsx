import { TEXT_PRIMARY, TEXT_SECONDARY, BORDER_SUBTLE, FONT_BODY } from './ds'

/**
 * PageHeader — consistent page title block used on every page.
 * Title (Inter Display scale) left-aligned, sub line below, optional
 * right-side slot, a plain hairline rule beneath.
 *
 * Visual redesign: the PulseLedger animated seismograph-tick divider that
 * used to run under every single page title was retired — "boldness spent
 * in exactly one place: the data," per the redesign direction, and a
 * pulsing decorative element under every heading on every page reads as
 * exactly the opposite of "quiet instrument panel." A plain border-subtle
 * rule carries the same "section is done, content begins" signal without
 * the noise. PulseLedger.jsx itself is untouched — SectionHeader.jsx still
 * uses it for in-page sub-dividers.
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
            fontFamily: FONT_BODY,
            fontSize: '32px', fontWeight: '600',
            margin: '0 0 5px', letterSpacing: '-0.02em',
            color: TEXT_PRIMARY, lineHeight: '40px',
          }}>
            {title}
          </h1>
          {sub && (
            <p style={{
              color: TEXT_SECONDARY, fontSize: '13px', margin: 0,
              fontFamily: FONT_BODY, lineHeight: 1.5,
            }}>
              {sub}
            </p>
          )}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
      <div style={{ height: '1px', background: BORDER_SUBTLE }} />
    </div>
  )
}
