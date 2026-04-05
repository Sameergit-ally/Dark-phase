import { useState } from 'react'
import { Search, Loader, CheckCircle, Download, Clock, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'

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
      case 'COMPLETED': return <CheckCircle size={18} color="var(--success)" style={{ filter: 'drop-shadow(0 0 6px var(--success-glow))' }} />
      case 'RUNNING': return <Loader size={18} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', filter: 'drop-shadow(0 0 6px var(--primary-glow))' }} />
      case 'QUEUED': return <Clock size={18} color="var(--warning)" />
      default: return <Clock size={18} color="var(--text-muted)" />
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'COMPLETED') return { bg: 'rgba(0,230,118,0.12)', color: 'var(--success)', shadow: 'var(--success-glow)' }
    if (status === 'RUNNING') return { bg: 'rgba(124,106,255,0.12)', color: 'var(--primary)', shadow: 'var(--primary-glow)' }
    return { bg: 'rgba(255,171,64,0.12)', color: 'var(--warning)', shadow: 'var(--warning-glow)' }
  }

  return (
    <PageTransition>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '92px 24px 40px' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', fontFamily: 'Outfit' }}>
            <span style={{ filter: 'drop-shadow(0 0 10px var(--primary-glow))' }}><Search size={28} color="var(--primary)" /></span>
            B2B Self-Audit Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '36px' }}>Audit your website for dark patterns. Get a detailed compliance report.</p>
        </motion.div>

        {/* Start Audit */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '32px', borderLeft: '3px solid var(--primary)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '18px', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ filter: 'drop-shadow(0 0 6px var(--primary-glow))' }}>🔍</span> Start New Audit
          </h3>
          <form onSubmit={handleStartAudit} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Globe size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
              <input type="url" placeholder="https://your-website.com" value={url} onChange={e => setUrl(e.target.value)} className="input" style={{ paddingLeft: '42px' }} required />
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} type="submit" className="btn btn-primary" disabled={isRunning} style={{ minWidth: '150px', boxShadow: isRunning ? 'none' : '0 0 20px var(--primary-glow)' }}>
              {isRunning ? (<><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Running...</>) : (<><Search size={16} /> Start Audit</>)}
            </motion.button>
          </form>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>We'll crawl up to 50 pages and analyze each for dark patterns. Takes 2-5 minutes.</p>
        </motion.div>

        {/* Audit Jobs */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '22px', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ filter: 'drop-shadow(0 0 6px var(--primary-glow))' }}>📊</span> Audit History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mockJobs.map((job, i) => {
              const sc = getStatusColor(job.status)
              return (
                <motion.div key={job.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                  whileHover={{ borderColor: 'var(--border-hover)', boxShadow: '0 0 20px rgba(124,106,255,0.08)' }}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', background: 'rgba(14,14,28,0.5)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', transition: 'all 0.3s' }}>
                  {getStatusIcon(job.status)}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600 }}>{job.url}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.pages_crawled} pages crawled • {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                  <span style={{ padding: '4px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: sc.bg, color: sc.color, boxShadow: `0 0 8px ${sc.shadow}` }}>{job.status}</span>
                  {job.report_url && (
                    <motion.a whileHover={{ scale: 1.05 }} href={job.report_url} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }}>
                      <Download size={14} /> PDF
                    </motion.a>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
