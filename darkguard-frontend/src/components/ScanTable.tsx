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
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</p>
        <p>No scans yet. Install the extension to start scanning!</p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
        <thead>
          <tr>
            {['Grade', 'Domain', 'URL', 'Patterns', 'Duration', 'Date'].map((h) => (
              <th key={h} style={{
                padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)',
                fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600,
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr key={scan.id}
              onClick={() => onSelect?.(scan)}
              style={{ cursor: onSelect ? 'pointer' : 'default' }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={{ padding: '12px 16px' }}>
                <GradeCircle grade={scan.grade || 'A'} size={36} />
              </td>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {scan.domain}
              </td>
              <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                {truncate(scan.url, 40)}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{
                  padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                  background: scan.patterns_found > 0 ? 'rgba(230,57,70,0.15)' : 'rgba(42,157,143,0.15)',
                  color: scan.patterns_found > 0 ? 'var(--danger)' : 'var(--success)',
                }}>
                  {scan.patterns_found}
                </span>
              </td>
              <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {scan.scan_duration_ms}ms
              </td>
              <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {formatDateTime(scan.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
