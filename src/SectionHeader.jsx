import { BONE, MUTED, GOLD, FONT_DISPLAY, FONT_BODY } from './ds'
import PulseLedger from './PulseLedger'

/**
 * SectionHeader — consistent section title + PulseLedger divider
 * used within long-form result pages (Marketing Brain, Smart Analysis, etc.)
 *
 * Usage:
 *   <SectionHeader title="Audience Strategy" sub="3 validated segments" />
 *   <SectionHeader title="Budget Allocation" gold />   // gold accent on title
 */
export default function SectionHeader({ title, sub, gold = false, mb = 20, ledger = true }) {
  return (
    <div style={{ marginBottom: `${mb}px` }}>
      {ledger && <PulseLedger style={{ marginBottom: '14px' }} goldPositions={[4, 12]} />}
      <h2 style={{
        fontFamily: FONT_DISPLAY,
        fontSize: '17px', fontWeight: '700',
        margin: '0 0 4px', letterSpacing: '-0.3px',
        color: gold ? GOLD : BONE,
        lineHeight: 1.3,
      }}>
        {title}
      </h2>
      {sub && (
        <p style={{ color: MUTED, fontSize: '12px', margin: 0, fontFamily: FONT_BODY }}>
          {sub}
        </p>
      )}
    </div>
  )
}
