import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { INK, BONE, GOLD, SLATE, SLATE_L, SLATE_M, MUTED, RED, FONT_BODY, FONT_DISPLAY, inp, lbl, errBox } from './ds'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/')
  }

  async function handleGoogle() {
    setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' },
    })
    if (err) setError(err.message)
  }

  return (
    <div style={{ minHeight: '100vh', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_BODY, padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: 40, height: 40, background: GOLD, borderRadius: '10px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: INK }}>A</span>
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: '24px', color: BONE, margin: '0 0 6px', fontWeight: '700' }}>Welcome back</h1>
          <p style={{ color: MUTED, fontSize: '14px', margin: 0 }}>Sign in to Adsoh</p>
        </div>

        <div style={{ background: SLATE, border: `1px solid ${SLATE_L}`, borderRadius: '12px', padding: '28px' }}>
          {error && <div style={{ ...errBox, marginBottom: '20px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{ ...inp, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ ...lbl, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Password</span>
                <Link to="/forgot-password" style={{ color: GOLD, fontSize: '11px', textDecoration: 'none', textTransform: 'none', letterSpacing: 'normal', fontWeight: '500' }}>
                  Forgot password?
                </Link>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ ...inp, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '11px', background: GOLD, color: INK, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: FONT_BODY }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: SLATE_L }} />
            <span style={{ color: MUTED, fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: SLATE_L }} />
          </div>

          <button
            onClick={handleGoogle}
            style={{ width: '100%', padding: '11px', background: 'transparent', color: BONE, border: `1px solid ${SLATE_L}`, borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: FONT_BODY, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
            Continue with Google
          </button>
        </div>

        <p style={{ textAlign: 'center', color: MUTED, fontSize: '13px', marginTop: '20px' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: GOLD, textDecoration: 'none', fontWeight: '500' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
