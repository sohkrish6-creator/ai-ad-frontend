import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

const BACKEND = 'https://ai-ad-backend-zhpj.onrender.com'
const GOLD = '#D4AF37'

const card = {
  background: '#fff',
  border: '1px solid #EAEAEA',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}

export default function MetaAdsTest() {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)

  async function checkConnection() {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND}/meta-ads/test-connection`)
      const json = await res.json()
      setResult(json)
    } catch (e) {
      setResult({ connected: false, error: `Network error: ${e.message}` })
    }
    setLoading(false)
  }

  useEffect(() => { checkConnection() }, [])

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '36px 20px 60px', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#171717', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Meta Ads Connection Test</h1>
      <p style={{ fontSize: '13px', color: '#999', margin: '0 0 24px' }}>
        Read-only connectivity check for the Meta Marketing API — no campaign creation yet.
      </p>

      <div style={{ ...card, padding: '22px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <p style={{ fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#999', margin: 0 }}>
            Connection
          </p>
          <button onClick={checkConnection} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '5px',
            border: '1px solid #E5E5E5', background: 'transparent', cursor: 'pointer', color: '#999', fontSize: '11px',
          }}>
            <RefreshCw size={11} /> Retest
          </button>
        </div>

        {loading ? (
          <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>Checking connection…</p>
        ) : result?.connected ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <CheckCircle size={14} color="#16A34A" />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#171717' }}>Connected</p>
            </div>
            <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.9' }}>
              <div><strong>Account:</strong> {result.account_name || '—'}</div>
              <div><strong>Account ID:</strong> {result.account_id}</div>
              <div><strong>Currency:</strong> {result.currency}</div>
              <div><strong>Timezone:</strong> {result.timezone}</div>
              <div><strong>Status:</strong> {result.status}</div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <AlertCircle size={14} color="#BE123C" />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#BE123C' }}>Not Connected</p>
            </div>
            <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '6px', padding: '10px 14px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#BE123C', wordBreak: 'break-word' }}>{result?.error || 'Unknown error.'}</p>
              {result?.error_code != null && (
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#BE123C' }}>
                  code: {result.error_code}{result.error_subcode != null ? ` · subcode: ${result.error_subcode}` : ''}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
