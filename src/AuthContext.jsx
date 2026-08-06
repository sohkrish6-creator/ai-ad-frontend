import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './lib/supabase'

const AuthContext = createContext(null)

// Key we use to remember which user's data is in localStorage right now.
const LS_ACTIVE_UID = 'adsoh_auth_uid'

// Post-audit fix (Item 3): getSession() had no .catch() and no timeout, and
// every protected route rendered `null` while `loading` was true — so a
// Supabase hiccup, a rejected promise, or a request that just never
// resolves left the ENTIRE app permanently blank, with zero error and zero
// way to recover short of a hard refresh (which hits the same code path
// and can blank again). GET_SESSION_TIMEOUT_MS bounds the wait so a hung
// promise reaches the same error state as a rejected one, and a Retry
// action actually retries the real check instead of just re-rendering.
const GET_SESSION_TIMEOUT_MS = 12000

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
  const [authError, setAuthError] = useState(null)
  const [attempt, setAttempt] = useState(0) // bumped by retry() to re-run the effect

  const retry = useCallback(() => {
    setUser(undefined)
    setAuthError(null)
    setAttempt(a => a + 1)
  }, [])

  useEffect(() => {
    let settled = false
    const timeoutId = setTimeout(() => {
      if (settled) return
      settled = true
      setAuthError('Timed out waiting to verify your session.')
    }, GET_SESSION_TIMEOUT_MS)

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (settled) return
        settled = true
        clearTimeout(timeoutId)
        if (error) { setAuthError(error.message || 'Could not verify your session.'); return }
        const u = data.session?.user ?? null
        clearCacheIfUserChanged(u?.id ?? '')
        setUser(u)
      })
      .catch((err) => {
        if (settled) return
        settled = true
        clearTimeout(timeoutId)
        setAuthError(err?.message || 'Could not verify your session.')
      })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      clearCacheIfUserChanged(u?.id ?? '')
      setAuthError(null)
      setUser(u)
    })

    return () => { clearTimeout(timeoutId); listener.subscription.unsubscribe() }
  }, [attempt])

  return (
    <AuthContext.Provider value={{ user, loading: user === undefined && !authError, authError, retry }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
