import { useState, useEffect } from 'react'
import { INK, BONE, FONT_BODY } from './ds'

/**
 * PageShell — standard outer wrapper for every page.
 * Handles: dark background, consistent max-width, responsive padding.
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
      background: INK,
      color: BONE,
      fontFamily: FONT_BODY,
      padding: noPad ? 0 : (isMobile ? '24px 16px 48px' : '40px 32px 60px'),
      maxWidth,
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {children}
    </div>
  )
}
