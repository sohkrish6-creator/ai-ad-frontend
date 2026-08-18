import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// __APP_VERSION__ is a build-time constant (vite.config.js `define`) —
// substituted with the real commit SHA at build, not read at runtime.
// Same purpose as the backend's GET /version: confirm a deploy landed by
// comparing window.__APP_VERSION__.commit (or /version.json) to the
// commit that was just pushed.
window.__APP_VERSION__ = __APP_VERSION__

// Inject X-API-Key on every request to the backend
;(function patchFetch() {
  const _orig = window.fetch
  const BACKEND_ORIGIN = 'https://ai-ad-backend-zhpj.onrender.com'
  const API_KEY = import.meta.env.VITE_ADSOH_API_KEY || ''
  window.fetch = function (url, opts = {}) {
    if (typeof url === 'string' && url.startsWith(BACKEND_ORIGIN) && API_KEY) {
      opts = { ...opts, headers: { 'X-API-Key': API_KEY, ...(opts.headers || {}) } }
    }
    return _orig.call(window, url, opts)
  }
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
