/**
 * Adsoh Design System — single import for all page files.
 * Replace local const GOLD / card / lbl / inp / page with:
 *   import { GOLD, card, lbl, inp, pageStyle } from './ds'
 */

// ── Tokens ──────────────────────────────────────────────────────────────────
export const INK       = '#0B0B0D'
export const BONE      = '#EDEAE3'
export const GOLD      = '#C9A227'
export const GOLD_DIM  = 'rgba(201,162,39,0.12)'
export const GOLD_BDR  = 'rgba(201,162,39,0.28)'
export const SLATE     = '#23242B'
export const SLATE_L   = '#2E2F38'
export const SLATE_M   = '#1A1B22'
export const GREEN     = '#3FA66B'
export const RED       = '#C4453A'
export const MUTED     = '#8A8A92'

export const FONT_DISPLAY = "'Fraunces', Georgia, serif"
export const FONT_BODY    = "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
export const FONT_MONO    = "'IBM Plex Mono', 'Menlo', monospace"

// ── Shared style objects ─────────────────────────────────────────────────────

/** Standard card — replaces every page's local `const card = { background: '#fff', ... }` */
export const card = {
  background:   SLATE,
  border:       `1px solid ${SLATE_L}`,
  borderRadius: '8px',
  boxShadow:    '0 1px 4px rgba(0,0,0,0.4)',
}

/** Elevated card (slightly lighter, for nested content) */
export const cardInner = {
  background:   SLATE_M,
  border:       `1px solid ${SLATE_L}`,
  borderRadius: '7px',
}

/** Label above an input — uppercase, muted, 11px */
export const lbl = {
  display: 'block', color: MUTED, fontSize: '11px', fontWeight: '600',
  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px',
  fontFamily: FONT_BODY,
}

/** Input / select / textarea */
export const inp = {
  width: '100%', padding: '10px 13px', borderRadius: '7px',
  border: `1px solid ${SLATE_L}`, background: SLATE_M,
  color: BONE, fontSize: '14px', boxSizing: 'border-box',
  outline: 'none', fontFamily: FONT_BODY,
}

/** Alias — some pages use 'inputSt' */
export const inputSt = inp

/** Page outer wrapper — use as base, spread and add padding/maxWidth per page */
export const pageStyle = {
  minHeight: '100vh',
  background: INK,
  color: BONE,
  fontFamily: FONT_BODY,
  boxSizing: 'border-box',
  width: '100%',
}

/** Responsive page padding helper */
export const pagePad = (isMobile) => ({
  padding: isMobile ? '24px 16px 48px' : '40px 32px 60px',
})

/** Standard section title style */
export const sectionTitle = {
  fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
  letterSpacing: '0.08em', color: MUTED, margin: 0,
  fontFamily: FONT_BODY,
}

/** Page h1 — Fraunces display */
export const h1Style = {
  fontSize: '24px', fontWeight: '700', margin: '0 0 4px',
  letterSpacing: '-0.5px', color: BONE, lineHeight: 1.2,
  fontFamily: FONT_DISPLAY,
}

/** Page subtitle / description line */
export const subStyle = {
  color: MUTED, fontSize: '13px', margin: 0,
  fontFamily: FONT_BODY,
}

/** Error panel */
export const errBox = {
  background: 'rgba(196,69,58,0.1)', border: `1px solid rgba(196,69,58,0.3)`,
  borderRadius: '8px', padding: '12px 16px',
  color: RED, fontSize: '13px',
  fontFamily: FONT_BODY,
}

/** Success / positive panel */
export const okBox = {
  background: 'rgba(63,166,107,0.1)', border: `1px solid rgba(63,166,107,0.28)`,
  borderRadius: '8px', padding: '12px 16px',
  color: GREEN, fontSize: '13px',
  fontFamily: FONT_BODY,
}
