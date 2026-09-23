import { BACKEND, apiFetch } from './lib/api'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, Film, Clock, CheckCircle2, XCircle, Loader2, Download, AlertTriangle } from 'lucide-react'
import { useToast } from './ToastContext'
import { GOLD, GOLD_DIM, GOLD_BDR, card, cardInner, lbl, MUTED, BONE, SLATE_L, GREEN, RED } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

const MAX_BYTES = 300 * 1024 * 1024
const ALLOWED_EXT = ['.mp4', '.mov', '.m4v', '.webm']
// Post-audit fix (same discipline as the WhatsApp draft-generation hang):
// every request this page makes is timeout-bounded so a stuck backend call
// can never leave the UI spinning forever with no error.
const UPLOAD_TIMEOUT_MS = 120000
const POLL_TIMEOUT_MS = 15000

const STATUS_META = {
  queued:     { label: 'Queued',     color: MUTED, Icon: Clock },
  processing: { label: 'Processing', color: GOLD,  Icon: Loader2 },
  done:       { label: 'Done',       color: GREEN, Icon: CheckCircle2 },
  failed:     { label: 'Failed',     color: RED,   Icon: XCircle },
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.queued
  const Icon = meta.Icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', color: meta.color }}>
      <Icon size={13} className={status === 'processing' ? 'spin' : ''} />
      {meta.label}
    </span>
  )
}

function JobCard({ job, onOpenPreview }) {
  const isTerminal = job.status === 'done' || job.status === 'failed'
  return (
    <div style={{ ...cardInner, padding: '14px 16px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '600', color: BONE, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {job.source_filename || 'Untitled upload'}
          </p>
          <StatusBadge status={job.status} />
          {!isTerminal && job.current_step && (
            <span style={{ marginLeft: '8px', fontSize: '12px', color: MUTED }}>{job.current_step}</span>
          )}
        </div>
        {job.status === 'done' && (
          <button
            onClick={() => onOpenPreview(job)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
              background: GOLD_DIM, border: `1px solid ${GOLD_BDR}`, color: GOLD,
              padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            <Film size={12} /> Preview
          </button>
        )}
      </div>
      {job.status === 'done' && job.hook && (
        <p style={{ margin: '8px 0 0', fontSize: '12.5px', color: MUTED, fontStyle: 'italic' }}>
          "{job.hook}" — {Math.round((job.segment_end || 0) - (job.segment_start || 0))}s segment
        </p>
      )}
      {job.status === 'failed' && job.error_message && (
        <p style={{ margin: '8px 0 0', fontSize: '12.5px', color: RED, display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
          <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
          {job.error_message}
        </p>
      )}
    </div>
  )
}

function PreviewModal({ job, onClose }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiFetch(`${BACKEND}/creative-studio/reel-editor/jobs/${job.id}/download-url`, { timeoutMs: POLL_TIMEOUT_MS })
        const data = await res.json()
        if (cancelled) return
        if (data.success) setUrl(data.url)
        else setError(data.detail || 'Could not load this Reel.')
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Could not load this Reel.')
      }
    })()
    return () => { cancelled = true }
  }, [job.id])

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <div onClick={e => e.stopPropagation()} style={{ ...card, padding: '18px', maxWidth: '360px', width: '100%' }}>
        <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: BONE }}>{job.source_filename}</p>
        {error && <p style={{ fontSize: '12.5px', color: RED }}>{error}</p>}
        {!error && !url && <p style={{ fontSize: '12.5px', color: MUTED }}>Loading preview...</p>}
        {url && (
          <>
            <video src={url} controls autoPlay style={{ width: '100%', borderRadius: '8px', aspectRatio: '9/16', background: '#000' }} />
            <a
              href={url} download={`reel-${job.id}.mp4`} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', background: GOLD, color: '#0B0D12', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}
            >
              <Download size={14} /> Download
            </a>
          </>
        )}
        <button onClick={onClose} style={{ display: 'block', width: '100%', marginTop: '10px', background: 'none', border: 'none', color: MUTED, fontSize: '12px', cursor: 'pointer', padding: '6px' }}>
          Close
        </button>
      </div>
    </div>
  )
}

export default function ReelAutoEditor() {
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [jobs, setJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [previewJob, setPreviewJob] = useState(null)

  const loadJobs = useCallback(async () => {
    try {
      const res = await apiFetch(`${BACKEND}/creative-studio/reel-editor/jobs`, { timeoutMs: POLL_TIMEOUT_MS })
      const data = await res.json()
      if (data.success) setJobs(data.jobs)
    } catch { /* transient — next poll tick will retry */ }
    setLoadingJobs(false)
  }, [])

  // Only poll while at least one job is still in flight — a finished list
  // has nothing left to learn from re-fetching every 2s forever.
  useEffect(() => {
    let cancelled = false
    async function poll() { if (!cancelled) await loadJobs() }
    poll()
    const hasActive = jobs.some(j => j.status === 'queued' || j.status === 'processing')
    if (!hasActive && jobs.length > 0) return () => { cancelled = true }
    const interval = setInterval(poll, 2000)
    return () => { cancelled = true; clearInterval(interval) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadJobs, jobs.length, jobs.map(j => j.status).join(',')])

  async function handleFile(file) {
    if (!file) return
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
    if (!ALLOWED_EXT.includes(ext)) {
      setUploadError(`Unsupported file type '${ext}' — allowed: ${ALLOWED_EXT.join(', ')}`)
      return
    }
    if (file.size > MAX_BYTES) {
      setUploadError(`File too large — max ${Math.round(MAX_BYTES / (1024 * 1024))}MB`)
      return
    }
    setUploadError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await apiFetch(`${BACKEND}/creative-studio/reel-editor/jobs`, {
        method: 'POST', body: form, timeoutMs: UPLOAD_TIMEOUT_MS,
      })
      const data = await res.json()
      if (!data.success) {
        setUploadError(data.error || data.detail || 'Upload failed.')
        toast.error(data.error || data.detail || 'Upload failed.')
      } else {
        toast.success('Uploaded — processing has started.')
        await loadJobs()
      }
    } catch (err) {
      const msg = err?.message || 'Backend se connect nahi ho paya.'
      setUploadError(msg)
      toast.error(msg)
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  return (
    <PageShell maxWidth="720px">
      <PageHeader title="AI Reel Auto-Editor" sub="Upload a raw video — get back a 30-60s vertical Reel with burned-in captions." />

      <style>{`@keyframes reel-spin { to { transform: rotate(360deg) } } .spin { animation: reel-spin 1s linear infinite }`}</style>

      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          ...card, padding: '32px 20px', textAlign: 'center', cursor: uploading ? 'default' : 'pointer',
          border: `1.5px dashed ${dragOver ? GOLD : SLATE_L}`, marginBottom: '14px',
          background: dragOver ? GOLD_DIM : card.background,
        }}
      >
        <input
          ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
          onChange={e => handleFile(e.target.files?.[0])} style={{ display: 'none' }}
        />
        {uploading ? (
          <>
            <Loader2 size={22} color={GOLD} className="spin" />
            <p style={{ margin: '10px 0 0', fontSize: '13px', color: MUTED }}>Uploading...</p>
          </>
        ) : (
          <>
            <Upload size={22} color={MUTED} />
            <p style={{ margin: '10px 0 2px', fontSize: '13px', fontWeight: '600', color: BONE }}>
              Drop a video here, or click to browse
            </p>
            <p style={{ margin: 0, fontSize: '11.5px', color: MUTED }}>
              MP4, MOV, M4V, or WEBM — max {Math.round(MAX_BYTES / (1024 * 1024))}MB
            </p>
          </>
        )}
      </div>

      {uploadError && (
        <div style={{ ...cardInner, padding: '10px 14px', marginBottom: '14px', border: `1px solid rgba(251,113,133,0.35)` }}>
          <p style={{ margin: 0, fontSize: '12.5px', color: RED }}>{uploadError}</p>
        </div>
      )}

      <p style={lbl}>Your Reels</p>
      {loadingJobs && jobs.length === 0 && <p style={{ fontSize: '12.5px', color: MUTED }}>Loading...</p>}
      {!loadingJobs && jobs.length === 0 && (
        <p style={{ fontSize: '12.5px', color: MUTED }}>No uploads yet — drop a video above to get started.</p>
      )}
      {jobs.map(job => <JobCard key={job.id} job={job} onOpenPreview={setPreviewJob} />)}

      {previewJob && <PreviewModal job={previewJob} onClose={() => setPreviewJob(null)} />}
    </PageShell>
  )
}
