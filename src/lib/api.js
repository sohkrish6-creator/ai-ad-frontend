import { supabase } from './supabase'

export const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const API_KEY = import.meta.env.VITE_ADSOH_API_KEY || ''

/**
 * Drop-in replacement for fetch() that auto-attaches:
 *   X-API-Key header (from VITE_API_KEY env)
 *   Authorization: Bearer <supabase_session_token> (from active Supabase session)
 *
 * Usage: apiFetch('/some/endpoint', { method: 'POST', body: JSON.stringify(data) })
 * Full URLs work too: apiFetch('https://...', ...)
 *
 * Post-audit fix: plain fetch() has no client-side timeout at all — a
 * backend request that never responds (a hung GPT call, a stuck DB
 * transaction, a bad connection) used to hang the calling await forever,
 * with no error ever surfaced. Real reported case: bulk "Generate WhatsApp
 * Drafts" stuck at "Generating 0/1..." indefinitely. `timeoutMs` is opt-in
 * (omitted = unchanged behavior, since some legitimate calls — exports,
 * long reports — can genuinely take a while) — pass it at call sites where
 * an indefinite hang would be a real problem. On expiry the fetch is
 * aborted and this throws a clearly-labeled Error so a catch block can
 * tell a timeout apart from a network failure or a non-2xx response.
 */
export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BACKEND}${path}`
  const { timeoutMs, signal: callerSignal, ...rest } = options

  const headers = { ...(rest.headers || {}) }

  if (API_KEY) {
    headers['X-API-Key'] = API_KEY
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // A caller-supplied signal takes priority — don't silently replace it.
  if (!timeoutMs || callerSignal) {
    return fetch(url, { ...rest, headers, signal: callerSignal })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...rest, headers, signal: controller.signal })
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
