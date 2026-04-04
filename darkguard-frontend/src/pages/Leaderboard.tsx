import { useState } from 'react'
import { useLeaderboard } from '../hooks/useTrustScore'
import GradeCircle from '../components/GradeCircle'
import { Trophy, Search } from 'lucide-react'

export default function Leaderboard() {
  const [sort, setSort] = useState<'worst' | 'best'>('worst')
  const [search, setSearch] = useState('')
  const { data: entries = [] } = useLeaderboard(sort)

  // Mock data for demo
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '88px 24px 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Trophy size={32} color="var(--warning)" /> Trust Score Leaderboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          See which websites are the worst (or best) at respecting users
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text" placeholder="Search domain..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input" style={{ paddingLeft: '40px' }}
          />
        </div>
        <button
          className={`btn ${sort === 'worst' ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setSort('worst')}
        >
          🚨 Worst
        </button>
        <button
          className={`btn ${sort === 'best' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSort('best')}
        >
          ✅ Best
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['#', 'Grade', 'Domain', 'Total Scans', 'Avg Confidence', 'Patterns'].map((h) => (
                <th key={h} style={{
                  padding: '14px 16px', textAlign: 'left', color: 'var(--text-muted)',
                  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600,
                  background: 'rgba(0,0,0,0.2)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry: any, i: number) => (
              <tr key={entry.domain} style={{
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.2s',
              }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {i + 1}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <GradeCircle grade={entry.grade} size={40} />
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {entry.domain}
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                  {entry.total_scans?.toLocaleString()}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                    background: entry.avg_confidence > 0.7 ? 'rgba(230,57,70,0.15)' : entry.avg_confidence > 0.3 ? 'rgba(244,162,97,0.15)' : 'rgba(42,157,143,0.15)',
                    color: entry.avg_confidence > 0.7 ? 'var(--danger)' : entry.avg_confidence > 0.3 ? 'var(--warning)' : 'var(--success)',
                  }}>
                    {Math.round(entry.avg_confidence * 100)}%
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: entry.patterns_found > 5 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                  {entry.patterns_found}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
