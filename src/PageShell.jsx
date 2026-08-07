import { useState, useEffect } from 'react'
import { TEXT_PRIMARY, FONT_BODY } from './ds'

/**
 * PageShell — standard outer wrapper for every page.
 * Handles: consistent max-width, responsive padding.
 *
 * Visual redesign: no longer paints its own opaque background — App.jsx's
 * AppBackground (a fixed radial-gradient + noise layer behind the whole
 * shell) shows through instead, matching the Linear/Raycast pattern where
 * the page canvas is subtly tinted and only cards/panels are opaque
 * surfaces on top. Individual `card`/`cardInner` (ds.js) still render
 * opaque against this.
 *
 * Usage:
 *   <PageShell>
 *     <PageHeader title="..." sub="..." />
 *     ...content...
 *   </PageShell>
 *
 * Props:
 *   maxWidth  — default '1100px'
 *   noPad     — suppress padding (for full-bleed pages)
 */
export default function PageShell({ children, maxWidth = '1100px', noPad = false }) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      color: TEXT_PRIMARY,
      fontFamily: FONT_BODY,
      padding: noPad ? 0 : (isMobile ? '24px 16px 48px' : '32px 32px 60px'),
      maxWidth,
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {children}
    </div>
  )
}
