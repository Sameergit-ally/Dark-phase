import { useState } from 'react'
import { Search, Loader, CheckCircle, Download, Clock, Globe } from 'lucide-react'

export default function Audit() {
  const [url, setUrl] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const mockJobs = [
    { id: '1', url: 'https://example-store.in', status: 'COMPLETED', pages_crawled: 34, report_url: '#', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', url: 'https://test-shop.com', status: 'RUNNING', pages_crawled: 12, report_url: null, created_at: new Date().toISOString() },
    { id: '3', url: 'https://old-site.in', status: 'COMPLETED', pages_crawled: 50, report_url: '#', created_at: new Date(Date.now() - 604800000).toISOString() },
  ]

  const handleStartAudit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle size={18} color="var(--success)" />
      case 'RUNNING': return <Loader size={18} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
      case 'QUEUED': return <Clock size={18} color="var(--warning)" />
      default: return <Clock size={18} color="var(--text-muted)" />
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '88px 24px 40px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Search size={28} color="var(--primary)" /> B2B Self-Audit Portal
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Audit your website for dark patterns. Get a detailed compliance report.
      </p>

      {/* Start Audit Form */}
      <div className="glass-card" style={{ marginBottom: '32px', borderLeft: '3px solid var(--primary)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
          🔍 Start New Audit
        </h3>
        <form onSubmit={handleStartAudit} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Globe size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            <input
              type="url" placeholder="https://your-website.com"
              value={url} onChange={(e) => setUrl(e.target.value)}
              className="input" style={{ paddingLeft: '40px' }}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isRunning}
            style={{ minWidth: '140px' }}>
            {isRunning ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Running...
              </>
            ) : (
              <>
                <Search size={16} /> Start Audit
              </>
            )}
          </button>
        </form>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          We'll crawl up to 50 pages and analyze each for dark patterns. Takes 2-5 minutes.
        </p>
      </div>

      {/* Audit Jobs */}
      <div className="glass-card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
          📊 Audit History
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockJobs.map((job) => (
            <div key={job.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
            }}>
              {getStatusIcon(job.status)}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{job.url}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {job.pages_crawled} pages crawled • {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                background: job.status === 'COMPLETED' ? 'rgba(42,157,143,0.15)' : job.status === 'RUNNING' ? 'rgba(108,99,255,0.15)' : 'rgba(244,162,97,0.15)',
                color: job.status === 'COMPLETED' ? 'var(--success)' : job.status === 'RUNNING' ? 'var(--primary)' : 'var(--warning)',
              }}>
                {job.status}
              </span>
              {job.report_url && (
                <a href={job.report_url} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }}>
                  <Download size={14} /> PDF
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
