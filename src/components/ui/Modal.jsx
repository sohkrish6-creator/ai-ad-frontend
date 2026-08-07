import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { BG_SURFACE, BORDER_SUBTLE, TEXT_PRIMARY, TEXT_TERTIARY, radius, elevation } from '../../ds'

const SIZES = { sm: '400px', md: '520px', lg: '720px' }

/**
 * Modal — one of the three surfaces allowed to use glass (backdrop blur).
 * Escape closes; click on the backdrop closes; click inside does not.
 */
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(5,6,9,0.6)', backdropFilter: 'blur(4px)',
            zIndex: 200000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: SIZES[size] || SIZES.md,
              background: `${BG_SURFACE}E8`, backdropFilter: 'blur(20px)',
              border: `1px solid ${BORDER_SUBTLE}`, borderRadius: radius.lg,
              boxShadow: elevation[3], overflow: 'hidden',
            }}
          >
            {title && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
                <p style={{ margin: 0, fontSize: '14.5px', fontWeight: 600, color: TEXT_PRIMARY }}>{title}</p>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                  <X size={16} color={TEXT_TERTIARY} />
                </button>
              </div>
            )}
            <div style={{ padding: '20px' }}>{children}</div>
            {footer && <div style={{ padding: '14px 20px', borderTop: `1px solid ${BORDER_SUBTLE}`, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
