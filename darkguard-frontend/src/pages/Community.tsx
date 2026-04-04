import { useState } from 'react'
import { Users, Send, Trophy, ExternalLink } from 'lucide-react'
import PatternBadge from '../components/PatternBadge'
import { formatDateTime } from '../lib/utils'

const PATTERN_TYPES = [
  'FAKE_URGENCY', 'HIDDEN_CHARGES', 'ROACH_MOTEL', 'TRICK_QUESTION',
  'COOKIE_MANIPULATION', 'CONFIRMSHAMING', 'BAIT_SWITCH', 'MISDIRECTION',
]

export default function Community() {
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [patternType, setPatternType] = useState('FAKE_URGENCY')
  const [submitted, setSubmitted] = useState(false)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setUrl('')
    setDescription('')
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '88px 24px 40px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Users size={28} color="var(--primary)" /> Community Reports
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Crowdsource dark pattern detection. Report what our AI misses. Earn DarkGuard Points!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
        {/* Main Content */}
        <div>
          {/* Submit Form */}
          <div className="glass-card" style={{ marginBottom: '24px', borderLeft: '3px solid var(--primary)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              🚩 Report a Dark Pattern
            </h3>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--success)' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>✅</p>
                <p style={{ fontWeight: 600 }}>Report submitted! You'll earn 50 points if approved.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="url" placeholder="Website URL" value={url} onChange={(e) => setUrl(e.target.value)}
                  className="input" required />
                <select value={patternType} onChange={(e) => setPatternType(e.target.value)}
                  className="input" style={{ cursor: 'pointer' }}>
                  {PATTERN_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <textarea placeholder="Describe the dark pattern..." value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input" style={{ minHeight: '80px', resize: 'vertical' }} required />
                <button type="submit" className="btn btn-primary">
                  <Send size={16} /> Submit Report
                </button>
              </form>
            )}
          </div>

          {/* Recent Reports */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              📋 Recent Community Reports
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mockReports.map((report) => (
                <div key={report.id} style={{
                  padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <a href={report.url} target="_blank" rel="noreferrer" style={{
                        fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        {new URL(report.url).hostname} <ExternalLink size={12} />
                      </a>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        by {report.user_name} • {formatDateTime(report.created_at)}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                      background: report.status === 'APPROVED' ? 'rgba(42,157,143,0.15)' : 'rgba(108,99,255,0.15)',
                      color: report.status === 'APPROVED' ? 'var(--success)' : 'var(--primary)',
                    }}>
                      {report.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {report.description}
                  </p>
                  <PatternBadge type={report.pattern_type} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar — Leaderboard */}
        <div>
          <div className="glass-card" style={{ position: 'sticky', top: '80px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} color="var(--warning)" /> Top Contributors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mockLeaderboard.map((user, i) => (
                <div key={user.name} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  background: i === 0 ? 'rgba(244,162,97,0.1)' : 'transparent',
                }}>
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 800,
                    background: i === 0 ? 'var(--warning)' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--bg-card)',
                    color: i < 3 ? '#000' : 'var(--text-secondary)',
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600 }}>{user.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.reports} reports</p>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--warning)' }}>
                    {user.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
