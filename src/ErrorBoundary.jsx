import { Component } from 'react'

const GOLD = '#C9A227'
const INK  = '#0B0B0D'
const BONE = '#EDEAE3'
const MUTED = '#8A8A92'
const SLATE = '#23242B'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    console.error('[ErrorBoundary] Caught:', error, info)
  }

  render() {
    if (this.state.error) {
      const msg = this.state.error?.message || String(this.state.error)
      const stack = this.state.info?.componentStack || ''
      return (
        <div style={{
          minHeight: '100vh', background: INK, color: BONE,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px', fontFamily: "'Inter', system-ui, sans-serif",
          boxSizing: 'border-box',
        }}>
          <div style={{ maxWidth: '640px', width: '100%' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
              letterSpacing: '0.1em', color: GOLD, margin: '0 0 12px' }}>
              Render Error
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px',
              letterSpacing: '-0.4px', color: BONE }}>
              Something crashed
            </h1>
            <p style={{ fontSize: '13px', color: MUTED, margin: '0 0 24px' }}>
              A page component threw during render. Error details below.
            </p>

            <div style={{ background: SLATE, border: '1px solid #C4453A40',
              borderLeft: '3px solid #C4453A', borderRadius: '8px',
              padding: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#C4453A',
                margin: '0 0 6px', fontFamily: "'IBM Plex Mono', monospace" }}>
                {msg}
              </p>
              {stack && (
                <pre style={{ fontSize: '11px', color: MUTED, margin: 0,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.6,
                  maxHeight: '260px', overflowY: 'auto' }}>
                  {stack.trim()}
                </pre>
              )}
            </div>

            <button
              onClick={() => window.location.reload()}
              style={{ background: GOLD, color: INK, border: 'none',
                borderRadius: '8px', padding: '11px 24px', fontSize: '14px',
                fontWeight: '700', cursor: 'pointer' }}>
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
