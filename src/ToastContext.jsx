import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { BG_RAISED, BORDER_SUBTLE, TEXT_PRIMARY, SUCCESS, DANGER, FONT_BODY, radius, elevation } from './ds'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const push = useCallback((type, message) => {
    const id = ++idCounter
    setToasts(t => [...t, { id, type, message }])
    timers.current[id] = setTimeout(() => dismiss(id), 2500)
  }, [dismiss])

  const toast = {
    success: (message) => push('success', message),
    error:   (message) => push('error', message),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 100000,
        display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: '10px',
            background: BG_RAISED,
            color: TEXT_PRIMARY,
            border: `1px solid ${BORDER_SUBTLE}`,
            borderLeft: t.type === 'success' ? `3px solid ${SUCCESS}` : `3px solid ${DANGER}`,
            padding: '12px 16px', borderRadius: radius.md,
            boxShadow: elevation[2],
            fontSize: '13px', fontWeight: '500', minWidth: '220px', maxWidth: '360px',
            animation: 'toastIn 0.2s ease-out',
            fontFamily: FONT_BODY,
          }}>
            {t.type === 'success'
              ? <CheckCircle size={16} color={SUCCESS} style={{ flexShrink: 0 }} />
              : <XCircle size={16} color={DANGER} style={{ flexShrink: 0 }} />}
            <span style={{ wordBreak: 'break-word' }}>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
