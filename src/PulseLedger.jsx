// Signature divider: a thin horizontal rule with tick marks — like a seismograph line.
// Gold ticks appear at evenly-spaced intervals among the slate-colored ticks.
// Usage: <PulseLedger /> between sections, as card-header underlines, etc.

export default function PulseLedger({ style = {}, goldPositions = [3, 8, 14] }) {
  const TOTAL_TICKS = 20
  const TICK_GAP    = 100 / TOTAL_TICKS // % spacing

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="12"
      viewBox="0 0 400 12"
      preserveAspectRatio="none"
      style={{ display: 'block', ...style }}
      aria-hidden="true"
    >
      {/* Base horizontal line */}
      <line x1="0" y1="6" x2="400" y2="6" stroke="#2E2F38" strokeWidth="1" />

      {/* Tick marks */}
      {Array.from({ length: TOTAL_TICKS + 1 }, (_, i) => {
        const x = (i / TOTAL_TICKS) * 400
        const isGold = goldPositions.includes(i)
        const h = isGold ? 8 : 4
        const y1 = 6 - h / 2
        const y2 = 6 + h / 2
        return (
          <line
            key={i}
            x1={x} y1={y1} x2={x} y2={y2}
            stroke={isGold ? '#C9A227' : '#3A3B46'}
            strokeWidth={isGold ? 1.5 : 0.8}
            style={isGold ? { animation: 'ledger-pulse 3s ease-in-out infinite' } : undefined}
          />
        )
      })}
    </svg>
  )
}
