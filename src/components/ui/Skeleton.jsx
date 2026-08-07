import { BG_RAISED, BG_INSET, radius } from '../../ds'

/**
 * Skeleton — loading placeholder. variant: 'text' | 'circle' | 'rect'.
 * Shimmer respects prefers-reduced-motion globally (index.css disables
 * all animation durations under that media query).
 */
export default function Skeleton({ variant = 'text', width, height, count = 1, style = {} }) {
  const dims = variant === 'circle'
    ? { width: width || '32px', height: height || '32px', borderRadius: '50%' }
    : variant === 'rect'
    ? { width: width || '100%', height: height || '80px', borderRadius: radius.md }
    : { width: width || '100%', height: height || '14px', borderRadius: radius.sm }

  const items = Array.from({ length: count })
  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          style={{
            ...dims,
            background: `linear-gradient(90deg, ${BG_INSET} 25%, ${BG_RAISED} 50%, ${BG_INSET} 75%)`,
            backgroundSize: '600px 100%',
            animation: 'shimmer 1.6s linear infinite',
            marginBottom: count > 1 && i < items.length - 1 ? '8px' : 0,
            ...style,
          }}
        />
      ))}
    </>
  )
}
