import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuth } from './AuthContext'
import { INK, BONE, GOLD, SLATE, SLATE_L, SLATE_M, MUTED, RED, GREEN, FONT_BODY, FONT_DISPLAY, inp, lbl, errBox, okBox, card } from './ds'

export default function Account() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwOk, setPwOk] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwError('')
    setPwOk(false)
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwLoading(false)
    if (error) { setPwError(error.message); return }
    setPwOk(true)
    setNewPw('')
    setConfirmPw('')
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    setDeleteError('')
    // Supabase requires admin rights to delete users — sign out instead and user can contact support
    // (self-service delete requires edge function or admin API)
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (err) {
      setDeleteError(err.message)
      setDeleteLoading(false)
    }
  }

  const page = { minHeight: '100vh', background: INK, color: BONE, fontFamily: FONT_BODY, padding: '40px 24px', boxSizing: 'border-box' }
  const section = { ...card, padding: '24px', marginBottom: '20px', maxWidth: '560px' }

  return (
    <div style={page}>
      <div style={{ maxWidth: '560px' }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: '700', color: BONE, margin: '0 0 6px' }}>Account</h1>
        <p style={{ color: MUTED, fontSize: '13px', margin: '0 0 32px' }}>Manage your Adsoh account</p>

        {/* Profile */}
        <div style={section}>
          <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED, margin: '0 0 14px' }}>Profile</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: INK }}>{(user?.email || 'U')[0].toUpperCase()}</span>
            </div>
            <div>
              <div style={{ color: BONE, fontSize: '14px', fontWeight: '500' }}>{user?.email}</div>
              <div style={{ color: MUTED, fontSize: '12px', marginTop: '2px' }}>Signed in via {user?.app_metadata?.provider === 'google' ? 'Google' : 'Email'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ marginTop: '20px', padding: '9px 18px', background: 'transparent', color: BONE, border: `1px solid ${SLATE_L}`, borderRadius: '7px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: FONT_BODY }}
          >
            Log out
          </button>
        </div>

        {/* Change password — only for email-auth users */}
        {user?.app_metadata?.provider !== 'google' && (
          <div style={section}>
            <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED, margin: '0 0 16px' }}>Change Password</p>
            {pwError && <div style={{ ...errBox, marginBottom: '16px' }}>{pwError}</div>}
            {pwOk && <div style={{ ...okBox, marginBottom: '16px' }}>Password updated successfully.</div>}
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>New password</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required placeholder="Min. 8 characters" style={{ ...inp, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={lbl}>Confirm new password</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required placeholder="••••••••" style={{ ...inp, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <button
                type="submit"
                disabled={pwLoading}
                style={{ padding: '9px 20px', background: GOLD, color: INK, border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: pwLoading ? 'not-allowed' : 'pointer', opacity: pwLoading ? 0.7 : 1, fontFamily: FONT_BODY }}
              >
                {pwLoading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </div>
        )}

        {/* Danger zone */}
        <div style={{ ...section, borderColor: 'rgba(196,69,58,0.3)' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: RED, margin: '0 0 10px' }}>Danger Zone</p>
          {deleteError && <div style={{ ...errBox, marginBottom: '12px' }}>{deleteError}</div>}
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              style={{ padding: '9px 18px', background: 'transparent', color: RED, border: `1px solid rgba(196,69,58,0.4)`, borderRadius: '7px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: FONT_BODY }}
            >
              Delete account
            </button>
          ) : (
            <div>
              <p style={{ color: BONE, fontSize: '13px', margin: '0 0 14px' }}>Are you sure? This will sign you out. To permanently delete your data, contact support.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  style={{ padding: '9px 18px', background: RED, color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteLoading ? 0.7 : 1, fontFamily: FONT_BODY }}
                >
                  {deleteLoading ? 'Processing…' : 'Yes, sign me out'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  style={{ padding: '9px 18px', background: 'transparent', color: MUTED, border: `1px solid ${SLATE_L}`, borderRadius: '7px', fontSize: '13px', cursor: 'pointer', fontFamily: FONT_BODY }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
