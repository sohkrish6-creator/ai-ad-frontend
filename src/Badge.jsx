import { GOLD, GOLD_DIM, GOLD_BDR, GREEN, RED, MUTED, SLATE_L, BONE, FONT_BODY, FONT_MONO } from './ds'

/**
 * Badge — unified pill/badge component.
 * Replaces all ad-hoc inline badge spans across the app.
 *
 * variant:
 *   'gold'    — gold accent (key metrics, active state)
 *   'green'   — signal green (active, enabled, success, hot prospect)
 *   'red'     — signal red (paused, error, warning)
 *   'muted'   — neutral / inactive
 *   'warm'    — amber (warm prospect, medium risk)
 *   'blue'    — informational
 *   'outline' — no fill, just border
 *
 * mono: if true, uses IBM Plex Mono for the label (numbers, scores, CTR)
 *
 * Usage:
 *   <Badge variant="green">Active</Badge>
 *   <Badge variant="red">Paused</Badge>
 *   <Badge variant="gold" mono>92</Badge>
 *   <Badge variant="warm">Hot</Badge>
 */
const VARIANTS = {
  gold:    { bg: GOLD_DIM,                    border: GOLD_BDR,                    color: GOLD  },
  green:   { bg: 'rgba(63,166,107,0.12)',      border: 'rgba(63,166,107,0.28)',      color: GREEN },
  red:     { bg: 'rgba(196,69,58,0.12)',       border: 'rgba(196,69,58,0.28)',       color: RED   },
  muted:   { bg: 'rgba(138,138,146,0.10)',     border: 'rgba(138,138,146,0.22)',     color: MUTED },
  warm:    { bg: 'rgba(217,119,6,0.12)',       border: 'rgba(217,119,6,0.28)',       color: '#D97706' },
  blue:    { bg: 'rgba(59,130,246,0.10)',      border: 'rgba(59,130,246,0.25)',      color: '#60A5FA' },
  outline: { bg: 'transparent',               border: SLATE_L,                     color: BONE  },
}

export default function Badge({ variant = 'muted', mono = false, style = {}, children }) {
  const v = VARIANTS[variant] || VARIANTS.muted
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: '10px', fontWeight: '700',
      background: v.bg,
      border: `1px solid ${v.border}`,
      color: v.color,
      fontFamily: mono ? FONT_MONO : FONT_BODY,
      whiteSpace: 'nowrap',
      letterSpacing: mono ? '0.02em' : '0.01em',
      ...style,
    }}>
      {children}
    </span>
  )
}
