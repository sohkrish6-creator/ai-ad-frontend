import { supabase } from './supabase'

export const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const API_KEY = import.meta.env.VITE_API_KEY || ''

/**
 * Drop-in replacement for fetch() that auto-attaches:
 *   X-API-Key header (from VITE_API_KEY env)
 *   Authorization: Bearer <supabase_session_token> (from active Supabase session)
 *
 * Usage: apiFetch('/some/endpoint', { method: 'POST', body: JSON.stringify(data) })
 * Full URLs work too: apiFetch('https://...', ...)
 */
export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BACKEND}${path}`

  const headers = { ...(options.headers || {}) }

  if (API_KEY) {
    headers['X-API-Key'] = API_KEY
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, { ...options, headers })
}
