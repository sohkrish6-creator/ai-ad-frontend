import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

const AuthContext = createContext(null)

// Key we use to remember which user's data is in localStorage right now.
const LS_ACTIVE_UID = 'adsoh_auth_uid'

/**
 * Wipe every adsoh_* report cache key when the active user changes.
 * This prevents cross-account cache bleed: if user B logs in on the same
 * browser that user A was using, they should never see A's cached reports.
 */
function clearCacheIfUserChanged(newUserId) {
  const prevUserId = localStorage.getItem(LS_ACTIVE_UID) ?? ''
  if (newUserId === prevUserId) return

  // User changed (or first load after auth was added) — wipe all report caches.
  Object.keys(localStorage)
    .filter(k => k.startsWith('adsoh_') && k !== LS_ACTIVE_UID)
    .forEach(k => localStorage.removeItem(k))

  // Record the new owner so subsequent page loads stay clean.
  if (newUserId) {
    localStorage.setItem(LS_ACTIVE_UID, newUserId)
  } else {
    localStorage.removeItem(LS_ACTIVE_UID)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading, null = logged out

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      clearCacheIfUserChanged(u?.id ?? '')
      setUser(u)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      clearCacheIfUserChanged(u?.id ?? '')
      setUser(u)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading: user === undefined }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
