/**
 * Adsoh Design System — single import for all page files.
 * Replace local const GOLD / card / lbl / inp / page with:
 *   import { GOLD, card, lbl, inp, pageStyle } from './ds'
 *
 * Visual Redesign (2026): values below were repointed to the new
 * violet/cool-neutral palette (mirrors the :root custom properties in
 * index.css) — every export name is unchanged so all existing importers
 * pick up the new look with zero prop or structural changes. New code
 * (src/components/ui/*) should prefer the semantically-named exports
 * (ACCENT, TEXT_SECONDARY, BG_SURFACE, ...) over the legacy names.
 */

// ── Legacy names (kept — 60 files import these) ──────────────────────────────
export const INK       = '#0B0D12'   // was near-black, now bg-base (cool cast)
export const BONE      = '#E8EAF0'   // now text-primary
export const GOLD      = '#7C6CF5'   // was literal gold, now the violet accent
export const GOLD_DIM  = 'rgba(124,108,245,0.12)'   // accent-muted
export const GOLD_BDR  = 'rgba(124,108,245,0.28)'   // accent border variant
export const SLATE     = '#12151C'   // now bg-surface
export const SLATE_L   = '#1F2430'   // was a lighter fill, now border-subtle — matches how the
                                      // codebase actually used it (grepped: ~95% of SLATE_L usages
                                      // are `border: 1px solid ${SLATE_L}`, not a background fill)
export const SLATE_M   = '#0E1116'   // now bg-inset (wells, inputs, table headers)
export const GREEN     = '#34D399'   // now success
export const RED       = '#FB7185'   // now danger
export const MUTED     = '#7A8299'   // now text-tertiary — 4.77:1 on bg-surface, clears WCAG AA (4.5:1)

export const FONT_DISPLAY = "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" // Fraunces retired — one family, real weight range
export const FONT_BODY    = "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
export const FONT_MONO    = "'IBM Plex Mono', 'Menlo', monospace"

// ── Semantic names (new — use these in src/components/ui/*) ─────────────────
export const BG_BASE       = INK
export const BG_SURFACE    = SLATE
export const BG_RAISED     = '#191D26'
export const BG_INSET      = SLATE_M
export const BORDER_SUBTLE = SLATE_L
export const BORDER_STRONG = '#2C3342'
export const TEXT_PRIMARY   = BONE
export const TEXT_SECONDARY = '#A0A7B8'
export const TEXT_TERTIARY  = MUTED
export const ACCENT        = GOLD
export const ACCENT_HOVER  = '#8F82F7'
export const ACCENT_MUTED  = GOLD_DIM
export const SUCCESS       = GREEN
export const WARNING       = '#FBBF24'
export const DANGER        = RED
export const INFO          = '#38BDF8'
export const SUCCESS_MUTED = 'rgba(52,211,153,0.12)'
export const WARNING_MUTED = 'rgba(251,191,36,0.12)'
export const DANGER_MUTED  = 'rgba(251,113,133,0.12)'
export const INFO_MUTED    = 'rgba(56,189,248,0.12)'

// ── Score → semantic color (opportunity/priority/need scores, 0-100) ────────
// Matches the high(>75)/medium(50-75)/low(<50) cutoff already computed
// server-side for priority buckets — reused here, not reinvented.
export function scoreColor(value) {
  if (value == null) return TEXT_TERTIARY
  if (value >= 75) return SUCCESS
  if (value >= 50) return WARNING
  return DANGER
}

// ── Spacing / radius / elevation (mirrors index.css :root) ──────────────────
export const space = { 4: '4px', 8: '8px', 12: '12px', 16: '16px', 24: '24px', 32: '32px', 48: '48px', 64: '64px' }
export const radius = { sm: '6px', md: '10px', lg: '14px', xl: '20px', full: '9999px' }
export const elevation = {
  1: '0 1px 2px rgba(0,0,0,.4)',
  2: '0 4px 16px rgba(0,0,0,.5)',
  3: '0 16px 48px rgba(0,0,0,.6)',
}

// ── Shared style objects ─────────────────────────────────────────────────────

/** Standard card — replaces every page's local `const card = { background: '#fff', ... }` */
export const card = {
  background:   SLATE,
  border:       `1px solid ${SLATE_L}`,
  borderRadius: radius.lg,
  boxShadow:    elevation[1],
}

/** Elevated card (slightly lighter, for nested content) */
export const cardInner = {
  background:   SLATE_M,
  border:       `1px solid ${SLATE_L}`,
  borderRadius: radius.md,
}

/** Label above an input — uppercase, muted, 11px */
export const lbl = {
  display: 'block', color: MUTED, fontSize: '12px', fontWeight: '500',
  textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '7px',
  fontFamily: FONT_BODY,
}

/** Input / select / textarea */
export const inp = {
  width: '100%', padding: '10px 13px', borderRadius: radius.md,
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
  padding: isMobile ? '24px 16px 48px' : '32px 32px 60px',
})

/** Standard section title style */
export const sectionTitle = {
  fontSize: '12px', fontWeight: '500', textTransform: 'uppercase',
  letterSpacing: '0.04em', color: MUTED, margin: 0,
  fontFamily: FONT_BODY,
}

/** Page h1 — Inter Display scale (Fraunces retired) */
export const h1Style = {
  fontSize: '32px', fontWeight: '600', margin: '0 0 4px',
  letterSpacing: '-0.02em', color: BONE, lineHeight: '40px',
  fontFamily: FONT_DISPLAY,
}

/** Page subtitle / description line */
export const subStyle = {
  color: MUTED, fontSize: '13px', margin: 0,
  fontFamily: FONT_BODY,
}

/** Error panel */
export const errBox = {
  background: DANGER_MUTED, border: `1px solid rgba(251,113,133,0.3)`,
  borderRadius: radius.md, padding: '12px 16px',
  color: DANGER, fontSize: '13px',
  fontFamily: FONT_BODY,
}

/** Success / positive panel */
export const okBox = {
  background: SUCCESS_MUTED, border: `1px solid rgba(52,211,153,0.28)`,
  borderRadius: radius.md, padding: '12px 16px',
  color: SUCCESS, fontSize: '13px',
  fontFamily: FONT_BODY,
}
