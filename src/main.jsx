import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Inject X-API-Key on every request to the backend
;(function patchFetch() {
  const _orig = window.fetch
  const BACKEND_ORIGIN = 'https://ai-ad-backend-zhpj.onrender.com'
  const API_KEY = import.meta.env.VITE_BACKEND_API_KEY || ''
  window.fetch = function (url, opts = {}) {
    if (typeof url === 'string' && url.startsWith(BACKEND_ORIGIN) && API_KEY) {
      opts = { ...opts, headers: { 'X-API-Key': API_KEY, ...(opts.headers || {}) } }
    }
    return _orig.call(this, url, opts)
  }
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
