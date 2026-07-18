import { BACKEND, apiFetch } from './lib/api'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Link2, CheckCircle, RefreshCw, ChevronRight, AlertCircle } from 'lucide-react'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, inp, inputSt, pageStyle, pagePad, INK, BONE, SLATE, SLATE_L, SLATE_M, MUTED, GREEN, RED, FONT_BODY, FONT_DISPLAY, FONT_MONO } from './ds'




function Skeleton({ w = '100%', h = '16px', radius = '4px', style = {} }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...style }} />
}

function ProgressBar({ pct }) {
  return (
    <div style={{ background: SLATE_L, borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
      <div style={{
        width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%',
        background: `linear-gradient(90deg, ${GOLD}, #E8C84A)`,
        borderRadius: '999px', transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

export default function GoogleAdsConnect() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [banner, setBanner] = useState(null) // { ok, msg } | null
  const [connected, setConnected] = useState(null) // null=unknown, true/false
  const [accounts, setAccounts] = useState([])
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [accountsError, setAccountsError] = useState('')
  const [selectingCid, setSelectingCid] = useState(null)

  const [jobStatus, setJobStatus] = useState(null)
  const [importStarting, setImportStarting] = useState(false)
  const pollRef = useRef(null)

  useEffect(() => {
    const connectedParam = searchParams.get('connected')
    const errorParam = searchParams.get('error')
    if (connectedParam === 'true') setBanner({ ok: true, msg: 'Google Ads account connected successfully.' })
    else if (connectedParam === 'false') setBanner({ ok: false, msg: `Connection failed${errorParam ? `: ${errorParam.replace(/_/g, ' ')}` : '.'}` })
    loadAccounts()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAccounts() {
    setAccountsLoading(true); setAccountsError('')
    try {
      const res = await apiFetch(`${BACKEND}/google/accounts`)
      const json = await res.json()
      if (json.success) {
        setConnected(true)
        setAccounts(json.accounts || [])
      } else {
        const notConnected = (json.error || '').toLowerCase().includes('not connected')
        setConnected(notConnected ? false : null)
        setAccountsError(json.error || 'Could not load accounts.')
        setAccounts([])
      }
    } catch (e) {
      setAccountsError(`Network error: ${e.message}`)
    }
    setAccountsLoading(false)
  }

  async function handleConnect() {
    try {
      const res = await apiFetch(`${BACKEND}/google/connect`)
      const json = await res.json()
      if (json.success && json.auth_url) window.location.href = json.auth_url
      else setBanner({ ok: false, msg: json.error || 'Could not start Google connection.' })
    } catch (e) {
      setBanner({ ok: false, msg: `Network error: ${e.message}` })
    }
  }

  async function handleSelect(cid) {
    setSelectingCid(cid)
    try {
      const res = await apiFetch(`${BACKEND}/google/accounts/select`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: cid }),
      })
      const json = await res.json()
      if (json.success) await loadAccounts()
      else setAccountsError(json.error || 'Could not select account.')
    } catch (e) {
      setAccountsError(`Network error: ${e.message}`)
    }
    setSelectingCid(null)
  }

  function startPolling(id) {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res = await apiFetch(`${BACKEND}/google-ads/import/status/${id}`)
        const json = await res.json()
        if (json.success) {
          setJobStatus(json.job)
          if (json.job.status !== 'running' && json.job.status !== 'queued') {
            clearInterval(pollRef.current)
            pollRef.current = null
            if (json.job.status === 'succeeded') await loadAccounts()
          }
        }
      } catch { /* keep polling despite a transient network blip */ }
    }, 2000)
  }

  async function handleImport(refresh = false) {
    setImportStarting(true); setJobStatus(null)
    try {
      const res = await apiFetch(`${BACKEND}/google-ads/${refresh ? 'refresh' : 'import'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const json = await res.json()
      if (json.success) {
        setJobStatus({ status: 'queued', progress_pct: 0, current_step: 'Queued' })
        startPolling(json.job_id)
      } else {
        setJobStatus({ status: 'failed', progress_pct: 0, error: json.error || 'Could not start import.' })
      }
    } catch (e) {
      setJobStatus({ status: 'failed', progress_pct: 0, error: `Network error: ${e.message}` })
    }
    setImportStarting(false)
  }

  const selectedAccount = accounts.find(a => a.selected)
  const jobRunning = jobStatus && (jobStatus.status === 'running' || jobStatus.status === 'queued')
  const jobDone = jobStatus && jobStatus.status === 'succeeded'
  const jobFailed = jobStatus && jobStatus.status === 'failed'

  return (
    <>
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .skeleton { background: linear-gradient(90deg, #F5F5F5 25%, #EBEBEB 50%, #F5F5F5 75%); background-size: 800px 100%; animation: shimmer 1.5s ease-in-out infinite; }
        .gads-account-row:hover { background: #FAFAFA; }
      `}</style>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '36px 20px 60px', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Link2 size={20} color={GOLD} />
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: BONE, margin: 0, letterSpacing: '-0.5px' }}>Google Ads Account Import</h1>
        </div>
        <p style={{ fontSize: '13px', color: MUTED, margin: '0 0 24px' }}>
          Connect a Google Ads account via OAuth, pick which account to import, and pull 12 months of performance data into AdSoh.
        </p>

        {banner && (
          <div style={{
            ...card, padding: '12px 16px', marginBottom: '20px',
            background: banner.ok ? '#F0FDF4' : '#FFF1F2',
            border: `1px solid ${banner.ok ? '#BBF7D0' : '#FECDD3'}`,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            {banner.ok ? <CheckCircle size={14} color="#16A34A" /> : <AlertCircle size={14} color="#BE123C" />}
            <p style={{ margin: 0, fontSize: '13px', color: banner.ok ? '#166534' : '#BE123C' }}>{banner.msg}</p>
          </div>
        )}

        {/* Connection status / connect button */}
        <div style={{ ...card, padding: '22px 20px', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED, margin: '0 0 14px' }}>
            Connection
          </p>
          {accountsLoading ? (
            <Skeleton w="60%" h="20px" />
          ) : connected === false ? (
            <div>
              <p style={{ fontSize: '13px', color: MUTED, margin: '0 0 14px' }}>
                No Google account connected yet. You'll be redirected to Google to sign in and grant access — never enter a Google password here.
              </p>
              <button onClick={handleConnect} style={{
                background: GOLD, color: BONE, border: 'none', borderRadius: '7px',
                padding: '11px 22px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}>
                <Link2 size={14} /> Connect Google Ads
              </button>
            </div>
          ) : connected === true ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={14} color="#16A34A" />
              <p style={{ margin: 0, fontSize: '13px', color: BONE, fontWeight: '600' }}>Connected</p>
              <button onClick={handleConnect} style={{
                marginLeft: 'auto', background: 'transparent', border: `1px solid ${SLATE_L}`, borderRadius: '6px',
                padding: '5px 12px', fontSize: '12px', color: MUTED, cursor: 'pointer',
              }}>Reconnect</button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: RED, margin: '0 0 14px' }}>{accountsError || 'Could not determine connection status.'}</p>
              <button onClick={handleConnect} style={{
                background: GOLD, color: BONE, border: 'none', borderRadius: '7px',
                padding: '11px 22px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}>
                <Link2 size={14} /> Connect Google Ads
              </button>
            </div>
          )}
        </div>

        {/* Account selector */}
        {connected === true && (
          <div style={{ ...card, padding: '22px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED, margin: 0 }}>
                Ad Accounts
              </p>
              <button onClick={loadAccounts} disabled={accountsLoading} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '5px',
                border: `1px solid ${SLATE_L}`, background: 'transparent', cursor: 'pointer', color: MUTED, fontSize: '11px',
              }}>
                <RefreshCw size={11} className={accountsLoading ? 'spin' : ''} /> Refresh
              </button>
            </div>

            {accountsLoading ? (
              <>
                <Skeleton h="46px" style={{ marginBottom: '8px' }} />
                <Skeleton h="46px" />
              </>
            ) : accountsError ? (
              <p style={{ fontSize: '13px', color: RED, margin: 0 }}>{accountsError}</p>
            ) : accounts.length === 0 ? (
              <p style={{ fontSize: '13px', color: MUTED, margin: 0 }}>No ad accounts found for this Google login.</p>
            ) : (
              accounts.map((a) => (
                <div key={a.customer_id} className="gads-account-row" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 10px', borderRadius: '6px',
                  border: `1px solid ${a.selected ? GOLD : '#F0F0F0'}`,
                  background: a.selected ? `${GOLD}0C` : 'transparent',
                  marginBottom: '8px', transition: 'background 0.15s ease',
                }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: BONE }}>
                      {a.account_name || `Account ${a.customer_id}`}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: MUTED }}>{a.customer_id}</p>
                  </div>
                  {a.selected ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: GOLD, textTransform: 'uppercase' }}>
                      <CheckCircle size={12} /> Selected
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelect(a.customer_id)}
                      disabled={selectingCid === a.customer_id}
                      style={{
                        background: 'transparent', border: `1px solid ${SLATE_L}`, borderRadius: '6px',
                        padding: '6px 14px', fontSize: '12px', fontWeight: '600', color: BONE, cursor: 'pointer',
                      }}
                    >
                      {selectingCid === a.customer_id ? 'Selecting…' : 'Select'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Import trigger + progress */}
        {connected === true && selectedAccount && (
          <div style={{ ...card, padding: '22px 20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.07em', color: MUTED, margin: '0 0 14px' }}>
              Import — Last 12 Months
            </p>

            {!jobStatus && (
              <button
                onClick={() => handleImport(false)}
                disabled={importStarting}
                style={{
                  background: GOLD, color: BONE, border: 'none', borderRadius: '7px',
                  padding: '11px 22px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                }}
              >
                {importStarting ? 'Starting…' : `Import ${selectedAccount.account_name || selectedAccount.customer_id}`}
              </button>
            )}

            {jobStatus && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: BONE, fontWeight: '600' }}>
                    {jobStatus.current_step || jobStatus.status}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>{jobStatus.progress_pct ?? 0}%</p>
                </div>
                <ProgressBar pct={jobStatus.progress_pct ?? 0} />

                {jobRunning && (
                  <p style={{ fontSize: '12px', color: MUTED, margin: '10px 0 0' }}>
                    {jobStatus.stale ? 'This import may be stuck — try refresh below.' : 'Importing… this can take a few minutes for large accounts.'}
                  </p>
                )}

                {jobFailed && (
                  <div style={{ background: 'rgba(196,69,58,0.10)', border: '1px solid #FECDD3', borderRadius: '6px', padding: '10px 14px', marginTop: '10px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: RED }}>{jobStatus.error || 'Import failed.'}</p>
                  </div>
                )}

                {jobDone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
                    <CheckCircle size={14} color="#16A34A" />
                    <p style={{ margin: 0, fontSize: '13px', color: BONE }}>Import complete.</p>
                    <button
                      onClick={() => navigate('/google-ads/dashboard')}
                      style={{
                        marginLeft: 'auto', background: '#171717', color: '#fff', border: 'none', borderRadius: '6px',
                        padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      View Dashboard <ChevronRight size={13} />
                    </button>
                  </div>
                )}

                {!jobRunning && (
                  <button
                    onClick={() => handleImport(true)}
                    disabled={importStarting}
                    style={{
                      marginTop: '14px', background: 'transparent', border: `1px solid ${SLATE_L}`, borderRadius: '6px',
                      padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: BONE, cursor: 'pointer',
                    }}
                  >
                    {importStarting ? 'Starting…' : 'Refresh Import'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
