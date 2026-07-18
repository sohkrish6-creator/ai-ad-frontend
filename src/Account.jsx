import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuth } from './AuthContext'
import { BACKEND, apiFetch } from './lib/api'
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

  // Connected Accounts
  const [connStatus, setConnStatus] = useState(null)
  const [connLoading, setConnLoading] = useState(true)
  const [connError, setConnError] = useState('')
  const [oauthMsg, setOauthMsg] = useState({ text: '', ok: false })
  const [disconnectingG, setDisconnectingG] = useState(false)
  const [disconnectingM, setDisconnectingM] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('gads_connected') === 'true') {
      setOauthMsg({ text: 'Google Ads connected successfully!', ok: true })
    } else if (params.get('gads_connected') === 'false') {
      setOauthMsg({ text: `Google Ads connection failed: ${params.get('error') || 'Unknown error'}`, ok: false })
    } else if (params.get('meta_connected') === 'true') {
      setOauthMsg({ text: 'Meta Ads connected successfully!', ok: true })
    } else if (params.get('meta_connected') === 'false') {
      setOauthMsg({ text: `Meta Ads connection failed: ${params.get('error') || 'Unknown error'}`, ok: false })
    }
    if (params.has('gads_connected') || params.has('meta_connected')) {
      window.history.replaceState({}, '', '/account')
    }
    fetchConnStatus()
  }, [])

  async function fetchConnStatus() {
    setConnLoading(true)
    setConnError('')
    try {
      const res = await apiFetch(`${BACKEND}/connected-accounts`)
      const data = await res.json()
      setConnStatus(data)
    } catch {
      setConnError('Could not load connection status.')
    }
    setConnLoading(false)
  }

  async function connectGoogle() {
    try {
      const res = await apiFetch(`${BACKEND}/google/connect`)
      const data = await res.json()
      if (data.auth_url) window.location.href = data.auth_url
    } catch { setConnError('Could not start Google Ads connection.') }
  }

  async function disconnectGoogle() {
    setDisconnectingG(true)
    try {
      await apiFetch(`${BACKEND}/google/disconnect`, { method: 'DELETE' })
      await fetchConnStatus()
    } catch { setConnError('Disconnect failed.') }
    setDisconnectingG(false)
  }

  async function connectMeta() {
    try {
      const res = await apiFetch(`${BACKEND}/meta/connect`)
      const data = await res.json()
      if (data.auth_url) window.location.href = data.auth_url
    } catch { setConnError('Could not start Meta Ads connection.') }
  }

  async function disconnectMeta() {
    setDisconnectingM(true)
    try {
      await apiFetch(`${BACKEND}/meta/disconnect`, { method: 'DELETE' })
      await fetchConnStatus()
    } catch { setConnError('Disconnect failed.') }
    setDisconnectingM(false)
  }

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

        {/* Connected Accounts */}
        <div style={{ ...section }}>
          <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED, margin: '0 0 16px' }}>Connected Accounts</p>
          {oauthMsg.text && (
            <div style={{ ...(oauthMsg.ok ? okBox : errBox), marginBottom: '14px', fontSize: '13px' }}>{oauthMsg.text}</div>
          )}
          {connError && <div style={{ ...errBox, marginBottom: '14px', fontSize: '13px' }}>{connError}</div>}
          {connLoading ? (
            <div style={{ color: MUTED, fontSize: '13px' }}>Loading…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Google Ads */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: INK, border: `1px solid ${SLATE_L}`, borderRadius: '8px', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#34A853', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>G</span>
                  <div>
                    <div style={{ color: BONE, fontSize: '13px', fontWeight: '600' }}>Google Ads</div>
                    {connStatus?.google_ads?.connected ? (
                      <>
                        <div style={{ color: GREEN, fontSize: '11px', marginTop: '2px' }}>Connected</div>
                        {connStatus.google_ads.customer_id && (
                          <div style={{ color: MUTED, fontSize: '11px' }}>Account: {connStatus.google_ads.customer_id}</div>
                        )}
                      </>
                    ) : (
                      <div style={{ color: MUTED, fontSize: '11px', marginTop: '2px' }}>Not connected</div>
                    )}
                  </div>
                </div>
                {connStatus?.google_ads?.connected ? (
                  <button
                    onClick={disconnectGoogle}
                    disabled={disconnectingG}
                    style={{ padding: '7px 14px', background: 'transparent', color: RED, border: `1px solid ${RED}50`, borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: disconnectingG ? 'not-allowed' : 'pointer', opacity: disconnectingG ? 0.6 : 1, fontFamily: FONT_BODY, flexShrink: 0 }}
                  >
                    {disconnectingG ? 'Disconnecting…' : 'Disconnect'}
                  </button>
                ) : (
                  <button
                    onClick={connectGoogle}
                    style={{ padding: '7px 14px', background: '#34A853', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: FONT_BODY, flexShrink: 0 }}
                  >
                    Connect
                  </button>
                )}
              </div>
              {/* Meta Ads */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: INK, border: `1px solid ${SLATE_L}`, borderRadius: '8px', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1877F2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>f</span>
                  <div>
                    <div style={{ color: BONE, fontSize: '13px', fontWeight: '600' }}>Meta Ads</div>
                    {connStatus?.meta_ads?.connected ? (
                      <>
                        <div style={{ color: GREEN, fontSize: '11px', marginTop: '2px' }}>Connected</div>
                        {connStatus.meta_ads.ad_account_id && (
                          <div style={{ color: MUTED, fontSize: '11px' }}>Ad Account: {connStatus.meta_ads.ad_account_id}</div>
                        )}
                      </>
                    ) : (
                      <div style={{ color: MUTED, fontSize: '11px', marginTop: '2px' }}>Not connected</div>
                    )}
                  </div>
                </div>
                {connStatus?.meta_ads?.connected ? (
                  <button
                    onClick={disconnectMeta}
                    disabled={disconnectingM}
                    style={{ padding: '7px 14px', background: 'transparent', color: RED, border: `1px solid ${RED}50`, borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: disconnectingM ? 'not-allowed' : 'pointer', opacity: disconnectingM ? 0.6 : 1, fontFamily: FONT_BODY, flexShrink: 0 }}
                  >
                    {disconnectingM ? 'Disconnecting…' : 'Disconnect'}
                  </button>
                ) : (
                  <button
                    onClick={connectMeta}
                    style={{ padding: '7px 14px', background: '#1877F2', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: FONT_BODY, flexShrink: 0 }}
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          )}
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
