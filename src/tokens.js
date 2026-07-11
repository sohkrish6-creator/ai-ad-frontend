// Design tokens — single source of truth for inline styles across all pages.
// CSS variables in index.css are the canonical source; these JS values mirror them
// for use in JSX inline style objects.

export const T = {
  ink:         '#0B0B0D',
  bone:        '#EDEAE3',
  gold:        '#C9A227',
  goldDim:     'rgba(201,162,39,0.12)',
  goldBorder:  'rgba(201,162,39,0.28)',
  slate:       '#23242B',
  slateMid:    '#1A1B22',
  slateLight:  '#2E2F38',
  green:       '#3FA66B',
  red:         '#C4453A',
  muted:       '#8A8A92',

  fontDisplay: "'Fraunces', Georgia, serif",
  fontBody:    "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  fontMono:    "'IBM Plex Mono', 'Menlo', monospace",
}

// Pre-built style objects for common patterns
export const card = {
  background:   T.slate,
  border:       `1px solid ${T.slateLight}`,
  borderRadius: '8px',
  boxShadow:    '0 1px 4px rgba(0,0,0,0.4)',
}

export const inputSt = {
  width: '100%', padding: '10px 13px', borderRadius: '7px',
  border: `1px solid ${T.slateLight}`, background: T.slateMid,
  color: T.bone, fontSize: '14px', boxSizing: 'border-box',
  outline: 'none', fontFamily: T.fontBody,
}

export const lbl = {
  display: 'block', color: T.muted, fontSize: '11px', fontWeight: '600',
  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px',
  fontFamily: T.fontBody,
}

export const btnPrimary = {
  background: T.gold, color: T.ink, border: 'none',
  borderRadius: '8px', padding: '11px 20px',
  fontSize: '14px', fontWeight: '700', cursor: 'pointer',
  fontFamily: T.fontBody,
}

export const btnSecondary = {
  background: 'transparent', color: T.bone,
  border: `1px solid ${T.slateLight}`,
  borderRadius: '8px', padding: '10px 18px',
  fontSize: '14px', fontWeight: '500', cursor: 'pointer',
  fontFamily: T.fontBody,
}
