import { useState } from 'react'
import { useLeaderboard } from '../hooks/useTrustScore'
import GradeCircle from '../components/GradeCircle'
import { Trophy, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'

export default function Leaderboard() {
  const [sort, setSort] = useState<'worst' | 'best'>('worst')
  const [search, setSearch] = useState('')
  const { data: entries = [] } = useLeaderboard(sort)

  const mockEntries = entries.length > 0 ? entries : [
    { domain: 'shady-deals.in', grade: 'F', total_scans: 1250, avg_confidence: 0.92, patterns_found: 15 },
    { domain: 'trick-subscribe.com', grade: 'F', total_scans: 890, avg_confidence: 0.88, patterns_found: 12 },
    { domain: 'hidden-fees.in', grade: 'D', total_scans: 2100, avg_confidence: 0.75, patterns_found: 8 },
    { domain: 'cookie-trap.com', grade: 'D', total_scans: 650, avg_confidence: 0.71, patterns_found: 7 },
    { domain: 'guilt-shop.in', grade: 'C', total_scans: 1800, avg_confidence: 0.62, patterns_found: 5 },
    { domain: 'sneaky-add.com', grade: 'C', total_scans: 430, avg_confidence: 0.58, patterns_found: 4 },
    { domain: 'mostly-fair.in', grade: 'B', total_scans: 3200, avg_confidence: 0.35, patterns_found: 2 },
    { domain: 'clean-store.com', grade: 'A', total_scans: 5600, avg_confidence: 0.0, patterns_found: 0 },
    { domain: 'honest-shop.in', grade: 'A', total_scans: 4100, avg_confidence: 0.0, patterns_found: 0 },
    { domain: 'trustworthy.com', grade: 'A', total_scans: 2900, avg_confidence: 0.0, patterns_found: 0 },
  ]

  const filtered = mockEntries.filter((e: any) =>
    !search || e.domain.toLowerCase().includes(search.toLowerCase())
  )

  const getRowGlow = (i: number) => {
    if (sort === 'worst') {
      if (i === 0) return { bg: 'rgba(255, 61, 113, 0.06)', border: 'rgba(255, 61, 113, 0.2)' }
      if (i === 1) return { bg: 'rgba(255, 61, 113, 0.04)', border: 'rgba(255, 61, 113, 0.12)' }
      if (i === 2) return { bg: 'rgba(255, 61, 113, 0.02)', border: 'rgba(255, 61, 113, 0.08)' }
    } else {
      if (i === 0) return { bg: 'rgba(0, 230, 118, 0.06)', border: 'rgba(0, 230, 118, 0.2)' }
      if (i === 1) return { bg: 'rgba(0, 230, 118, 0.04)', border: 'rgba(0, 230, 118, 0.12)' }
      if (i === 2) return { bg: 'rgba(0, 230, 118, 0.02)', border: 'rgba(0, 230, 118, 0.08)' }
    }
    return { bg: 'transparent', border: 'transparent' }
  }

  return (
    <PageTransition>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '92px 24px 40px' }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '44px' }}
        >
          <h1 style={{
            fontSize: '34px', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            fontFamily: 'Outfit, sans-serif',
          }}>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ filter: 'drop-shadow(0 0 12px var(--warning-glow))' }}
            >
              <Trophy size={34} color="var(--warning)" />
            </motion.span>
            Trust Score Leaderboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px', fontSize: '15px' }}>
            See which websites are the worst (or best) at respecting users
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{
              position: 'absolute', left: '14px', top: '12px',
              color: 'var(--text-muted)',
            }} />
            <input
              type="text" placeholder="Search domain..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="input" style={{ paddingLeft: '42px' }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`btn ${sort === 'worst' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setSort('worst')}
            style={sort === 'worst' ? { boxShadow: '0 0 16px var(--danger-glow)' } : {}}
          >
            🚨 Worst
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`btn ${sort === 'best' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSort('best')}
            style={sort === 'best' ? { boxShadow: '0 0 16px var(--primary-glow)' } : {}}
          >
            ✅ Best
          </motion.button>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['#', 'Grade', 'Domain', 'Total Scans', 'Avg Confidence', 'Patterns'].map((h) => (
                  <th key={h} style={{
                    padding: '16px 18px', textAlign: 'left', color: 'var(--text-muted)',
                    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.2px',
                    fontWeight: 600, background: 'rgba(6, 6, 14, 0.5)',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry: any, i: number) => {
                const glow = getRowGlow(i)
                return (
                  <motion.tr
                    key={entry.domain}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    style={{
                      borderBottom: '1px solid rgba(124, 106, 255, 0.05)',
                      transition: 'background 0.3s',
                      background: glow.bg,
                    }}
                    onMouseOver={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(124, 106, 255, 0.06)'
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLElement).style.background = glow.bg
                    }}
                  >
                    <td style={{
                      padding: '16px 18px', fontWeight: 800, fontSize: '15px',
                      color: i < 3 ? (sort === 'worst' ? 'var(--danger)' : 'var(--success)') : 'var(--text-muted)',
                      fontFamily: 'Outfit, sans-serif',
                    }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: '16px 18px' }}>
                      <GradeCircle grade={entry.grade} size={42} />
                    </td>
                    <td style={{ padding: '16px 18px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                      {entry.domain}
                    </td>
                    <td style={{ padding: '16px 18px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {entry.total_scans?.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 18px' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                        background: entry.avg_confidence > 0.7 ? 'rgba(255,61,113,0.12)' : entry.avg_confidence > 0.3 ? 'rgba(255,171,64,0.12)' : 'rgba(0,230,118,0.12)',
                        color: entry.avg_confidence > 0.7 ? 'var(--danger)' : entry.avg_confidence > 0.3 ? 'var(--warning)' : 'var(--success)',
                        boxShadow: entry.avg_confidence > 0.7 ? '0 0 8px var(--danger-glow)' : 'none',
                      }}>
                        {Math.round(entry.avg_confidence * 100)}%
                      </span>
                    </td>
                    <td style={{
                      padding: '16px 18px', fontWeight: 700, fontSize: '14px',
                      color: entry.patterns_found > 5 ? 'var(--danger)' : 'var(--text-secondary)',
                    }}>
                      {entry.patterns_found}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      </div>
    </PageTransition>
  )
}
