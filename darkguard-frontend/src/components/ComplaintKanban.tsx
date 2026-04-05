import { motion } from 'framer-motion'
import { formatDateTime } from '../lib/utils'

interface Complaint {
  id: string
  status: string
  pdf_url?: string
  created_at: string
  updated_at: string
  scans?: { url: string; domain: string; patterns_found: number }
}

interface ComplaintKanbanProps {
  complaints: Complaint[]
}

const COLUMNS = [
  { key: 'DRAFTED', label: 'Drafted', color: '#7c6aff', icon: '📝' },
  { key: 'SUBMITTED', label: 'Submitted', color: '#ffab40', icon: '📤' },
  { key: 'UNDER_REVIEW', label: 'Under Review', color: '#00e5ff', icon: '🔍' },
  { key: 'RESOLVED', label: 'Resolved', color: '#00e676', icon: '✅' },
]

export default function ComplaintKanban({ complaints }: ComplaintKanbanProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', overflowX: 'auto' }}>
      {COLUMNS.map((col, colIdx) => {
        const items = complaints.filter((c) => c.status === col.key)
        return (
          <motion.div
            key={col.key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIdx * 0.1, duration: 0.5 }}
            style={{
              background: 'rgba(10, 10, 22, 0.5)',
              backdropFilter: 'blur(12px)',
              borderRadius: 'var(--radius)',
              padding: '18px', minWidth: '220px',
              border: '1px solid rgba(124, 106, 255, 0.06)',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '18px', paddingBottom: '14px',
              borderBottom: `2px solid ${col.color}`,
              position: 'relative',
            }}>
              <span style={{ filter: `drop-shadow(0 0 6px ${col.color}60)` }}>{col.icon}</span>
              <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                {col.label}
              </h4>
              <span style={{
                marginLeft: 'auto',
                background: `${col.color}18`,
                color: col.color,
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: `0 0 10px ${col.color}20`,
              }}>
                {items.length}
              </span>
              {/* Animated glow line */}
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                left: 0,
                width: '40px',
                height: '2px',
                background: col.color,
                boxShadow: `0 0 12px ${col.color}`,
                animation: 'shimmer 3s ease-in-out infinite',
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: colIdx * 0.1 + i * 0.05, duration: 0.3 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: `0 0 20px ${col.color}20`,
                    borderColor: col.color,
                  }}
                  style={{
                    background: 'rgba(14, 14, 28, 0.6)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    border: '1px solid var(--border)',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {item.scans?.domain || 'Unknown domain'}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {formatDateTime(item.created_at)}
                  </p>
                  {item.scans && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '11px', color: item.scans.patterns_found > 3 ? 'var(--danger)' : 'var(--text-secondary)',
                      marginBottom: '6px',
                    }}>
                      <span style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: item.scans.patterns_found > 3 ? 'var(--danger)' : 'var(--success)',
                        boxShadow: `0 0 4px ${item.scans.patterns_found > 3 ? 'var(--danger)' : 'var(--success)'}`,
                      }} />
                      {item.scans.patterns_found} patterns
                    </div>
                  )}
                  {item.pdf_url && (
                    <a href={item.pdf_url} target="_blank" rel="noreferrer"
                      style={{
                        fontSize: '12px', color: 'var(--primary)',
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontWeight: 500,
                      }}>
                      📄 Download PDF
                    </a>
                  )}
                </motion.div>
              ))}

              {items.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                  No complaints
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
