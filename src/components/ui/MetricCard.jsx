import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { BG_SURFACE, BORDER_SUBTLE, TEXT_PRIMARY, TEXT_TERTIARY, SUCCESS, DANGER, radius } from '../../ds'

/** Tiny inline sparkline — no chart library needed for a single trend line. */
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null
  const w = 64, h = 20
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  return (
    <svg width={w} height={h} style={{ flexShrink: 0 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/** Animate a metric counting up once on mount — 400ms, respects prefers-reduced-motion via CSS override. */
function useCountUp(target, durationMs = 400) {
  const [value, setValue] = useState(typeof target === 'number' ? 0 : target)
  const startRef = useRef(null)
  useEffect(() => {
    if (typeof target !== 'number') { setValue(target); return }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setValue(target); return }
    let raf
    function tick(ts) {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / durationMs, 1)
      setValue(Math.round(target * progress))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])
  return value
}

/**
 * MetricCard — label, value, optional delta + sparkline. `size="lg"` is
 * for dashboard hero numbers (44px, animated count-up on mount); default
 * size is the dense in-page stat-grid variant (28px, no animation).
 */
export default function MetricCard({ label, value, delta, sparkline, icon: Icon, size = 'md', style = {} }) {
  const animated = useCountUp(size === 'lg' ? value : null)
  const display = size === 'lg' && typeof value === 'number' ? animated : value
  const deltaColor = delta?.direction === 'down' ? DANGER : SUCCESS
  const DeltaIcon = delta?.direction === 'down' ? TrendingDown : TrendingUp

  return (
    <div style={{
      background: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: radius.lg,
      padding: '18px 16px', ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, margin: 0 }}>
          {label}
        </p>
        {Icon && <Icon size={14} color={TEXT_TERTIARY} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px' }}>
        <p
          className="tabular-nums"
          style={{
            fontSize: size === 'lg' ? '44px' : '28px', lineHeight: size === 'lg' ? '48px' : '32px',
            fontWeight: size === 'lg' ? 650 : 600, color: TEXT_PRIMARY, margin: 0,
          }}
        >
          {display}
        </p>
        {sparkline && <Sparkline data={sparkline} color={deltaColor} />}
      </div>
      {delta && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: deltaColor, fontSize: '12px', fontWeight: 600 }}>
          <DeltaIcon size={12} />
          <span>{delta.value}</span>
        </div>
      )}
    </div>
  )
}
