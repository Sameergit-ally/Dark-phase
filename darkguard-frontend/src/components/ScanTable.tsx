import { motion } from 'framer-motion'
import { formatDateTime, truncate } from '../lib/utils'
import GradeCircle from './GradeCircle'

interface Scan {
  id: string
  url: string
  domain: string
  patterns_found: number
  scan_duration_ms: number
  created_at: string
  grade?: string
  detections?: Array<{ pattern_type: string; confidence_score: number }>
}

interface ScanTableProps {
  scans: Scan[]
  onSelect?: (scan: Scan) => void
}

export default function ScanTable({ scans, onSelect }: ScanTableProps) {
  if (!scans.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}
      >
        <p style={{ fontSize: '42px', marginBottom: '12px', filter: 'drop-shadow(0 0 10px var(--primary-glow))' }}>🔍</p>
        <p style={{ fontSize: '14px' }}>No scans yet. Install the extension to start scanning!</p>
      </motion.div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
        <thead>
          <tr>
            {['Grade', 'Domain', 'URL', 'Patterns', 'Duration', 'Date'].map((h) => (
              <th key={h} style={{
                padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)',
                fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.2px',
                fontWeight: 600, fontFamily: 'Inter, sans-serif',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scans.map((scan, i) => (
            <motion.tr
              key={scan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              onClick={() => onSelect?.(scan)}
              style={{
                cursor: onSelect ? 'pointer' : 'default',
                borderRadius: 'var(--radius-sm)',
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(124, 106, 255, 0.06)'
                el.style.boxShadow = 'inset 3px 0 0 var(--primary)'
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'transparent'
                el.style.boxShadow = 'none'
              }}
            >
              <td style={{ padding: '14px 16px' }}>
                <GradeCircle grade={scan.grade || 'A'} size={38} />
              </td>
              <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                {scan.domain}
              </td>
              <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                {truncate(scan.url, 40)}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                  background: scan.patterns_found > 0 ? 'rgba(255,61,113,0.12)' : 'rgba(0,230,118,0.12)',
                  color: scan.patterns_found > 0 ? 'var(--danger)' : 'var(--success)',
                  boxShadow: scan.patterns_found > 0 ? '0 0 10px rgba(255,61,113,0.15)' : '0 0 10px rgba(0,230,118,0.15)',
                }}>
                  {scan.patterns_found}
                </span>
              </td>
              <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {scan.scan_duration_ms}ms
              </td>
              <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {formatDateTime(scan.created_at)}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
