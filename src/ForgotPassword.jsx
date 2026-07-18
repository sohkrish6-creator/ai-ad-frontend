import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { INK, BONE, GOLD, SLATE, SLATE_L, MUTED, FONT_BODY, FONT_DISPLAY, inp, lbl, errBox, okBox } from './ds'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_BODY, padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: 40, height: 40, background: GOLD, borderRadius: '10px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: INK }}>A</span>
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: '24px', color: BONE, margin: '0 0 6px', fontWeight: '700' }}>Reset password</h1>
          <p style={{ color: MUTED, fontSize: '14px', margin: 0 }}>We'll email you a reset link</p>
        </div>

        <div style={{ background: SLATE, border: `1px solid ${SLATE_L}`, borderRadius: '12px', padding: '28px' }}>
          {sent ? (
            <div style={okBox}>
              <strong>Email sent!</strong>
              <p style={{ margin: '6px 0 0', fontSize: '13px' }}>Check <strong>{email}</strong> for a password reset link.</p>
            </div>
          ) : (
            <>
              {error && <div style={{ ...errBox, marginBottom: '20px' }}>{error}</div>}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={lbl}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={{ ...inp, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '11px', background: GOLD, color: INK, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: FONT_BODY }}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: MUTED, fontSize: '13px', marginTop: '20px' }}>
          <Link to="/login" style={{ color: GOLD, textDecoration: 'none', fontWeight: '500' }}>← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
