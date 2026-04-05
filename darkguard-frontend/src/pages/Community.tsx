import { useState } from 'react'
import { Users, Send, Trophy, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PatternBadge from '../components/PatternBadge'
import { formatDateTime } from '../lib/utils'
import PageTransition from '../components/PageTransition'

const PATTERN_TYPES = [
  'FAKE_URGENCY', 'HIDDEN_CHARGES', 'ROACH_MOTEL', 'TRICK_QUESTION',
  'COOKIE_MANIPULATION', 'CONFIRMSHAMING', 'BAIT_SWITCH', 'MISDIRECTION',
]

const mockReports = [
  { id: '1', url: 'https://sneaky-shop.in', description: 'Fake countdown timer on product page', pattern_type: 'FAKE_URGENCY', status: 'APPROVED', points_awarded: 50, user_name: 'Rahul S.', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', url: 'https://hidden-fee.com', description: 'Service fee only shown at checkout', pattern_type: 'HIDDEN_CHARGES', status: 'APPROVED', points_awarded: 50, user_name: 'Priya M.', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: '3', url: 'https://guilt-trip.in', description: '"No thanks, I hate saving" button', pattern_type: 'CONFIRMSHAMING', status: 'PENDING', points_awarded: 0, user_name: 'Arjun K.', created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: '4', url: 'https://cancel-nightmare.com', description: 'Cancellation requires phone call during business hours', pattern_type: 'ROACH_MOTEL', status: 'APPROVED', points_awarded: 50, user_name: 'Neha R.', created_at: new Date(Date.now() - 345600000).toISOString() },
]

const mockLeaderboard = [
  { name: 'Rahul S.', points: 850, reports: 17 },
  { name: 'Priya M.', points: 700, reports: 14 },
  { name: 'Arjun K.', points: 550, reports: 11 },
  { name: 'Neha R.', points: 400, reports: 8 },
  { name: 'Vikram P.', points: 300, reports: 6 },
]

export default function Community() {
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [patternType, setPatternType] = useState('FAKE_URGENCY')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setUrl(''); setDescription('')
  }

  return (
    <PageTransition>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '92px 24px 40px' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', fontFamily: 'Outfit' }}>
            <span style={{ filter: 'drop-shadow(0 0 10px var(--primary-glow))' }}><Users size={28} color="var(--primary)" /></span>
            Community Reports
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '36px' }}>Crowdsource dark pattern detection. Earn DarkGuard Points!</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
          <div>
            <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '24px', borderLeft: '3px solid var(--primary)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '18px', fontFamily: 'Outfit' }}>🚩 Report a Dark Pattern</h3>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div key="s" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '24px', color: 'var(--success)' }}>
                    <p style={{ fontSize: '36px', marginBottom: '10px' }}>✅</p>
                    <p style={{ fontWeight: 600 }}>Report submitted! You'll earn 50 points if approved.</p>
                  </motion.div>
                ) : (
                  <motion.form key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <input type="url" placeholder="Website URL" value={url} onChange={e => setUrl(e.target.value)} className="input" required />
                    <select value={patternType} onChange={e => setPatternType(e.target.value)} className="input" style={{ cursor: 'pointer' }}>
                      {PATTERN_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </select>
                    <textarea placeholder="Describe the dark pattern..." value={description} onChange={e => setDescription(e.target.value)} className="input" style={{ minHeight: '80px', resize: 'vertical' }} required />
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary"><Send size={16} /> Submit Report</motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '18px', fontFamily: 'Outfit' }}>📋 Recent Community Reports</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {mockReports.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }} style={{ padding: '18px', background: 'rgba(14,14,28,0.5)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', transition: 'all 0.3s' }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(124,106,255,0.08)' }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div>
                        <a href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>{new URL(r.url).hostname} <ExternalLink size={12} /></a>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>by {r.user_name} • {formatDateTime(r.created_at)}</p>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: r.status === 'APPROVED' ? 'rgba(0,230,118,0.12)' : 'rgba(124,106,255,0.12)', color: r.status === 'APPROVED' ? 'var(--success)' : 'var(--primary)' }}>{r.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{r.description}</p>
                    <PatternBadge type={r.pattern_type} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div className="glass-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={{ position: 'sticky', top: '84px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit' }}>
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}><Trophy size={20} color="var(--warning)" /></motion.span>
                Top Contributors
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {mockLeaderboard.map((u, i) => (
                  <motion.div key={u.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: i === 0 ? 'rgba(255,171,64,0.08)' : 'transparent', transition: 'background 0.2s' }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(124,106,255,0.06)'}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.background = i === 0 ? 'rgba(255,171,64,0.08)' : 'transparent'}>
                    <span style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, background: i === 0 ? 'var(--warning)' : i === 1 ? '#b8b8b8' : i === 2 ? '#cd7f32' : 'rgba(14,14,28,0.6)', color: i < 3 ? '#000' : 'var(--text-secondary)', boxShadow: i === 0 ? '0 0 12px var(--warning-glow)' : 'none' }}>{i + 1}</span>
                    <div style={{ flex: 1 }}><p style={{ fontSize: '13px', fontWeight: 600 }}>{u.name}</p><p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.reports} reports</p></div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--warning)' }}>{u.points}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
