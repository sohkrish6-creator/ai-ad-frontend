import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

const ToastContext = createContext(null)
const GOLD = '#D4AF37'

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
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 100000,
        display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#171717', color: '#fff',
            borderLeft: `3px solid ${GOLD}`,
            padding: '12px 16px', borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            fontSize: '13px', fontWeight: '500', minWidth: '220px', maxWidth: '360px',
            animation: 'toastIn 0.2s ease-out',
          }}>
            {t.type === 'success'
              ? <CheckCircle size={16} color={GOLD} style={{ flexShrink: 0 }} />
              : <XCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />}
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
