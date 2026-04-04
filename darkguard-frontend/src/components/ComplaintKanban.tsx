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
  { key: 'DRAFTED', label: 'Drafted', color: '#6c63ff', icon: '📝' },
  { key: 'SUBMITTED', label: 'Submitted', color: '#f4a261', icon: '📤' },
  { key: 'UNDER_REVIEW', label: 'Under Review', color: '#00d9ff', icon: '🔍' },
  { key: 'RESOLVED', label: 'Resolved', color: '#2a9d8f', icon: '✅' },
]

export default function ComplaintKanban({ complaints }: ComplaintKanbanProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', overflowX: 'auto' }}>
      {COLUMNS.map((col) => {
        const items = complaints.filter((c) => c.status === col.key)
        return (
          <div key={col.key} style={{
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
            padding: '16px', minWidth: '220px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '16px', paddingBottom: '12px',
              borderBottom: `2px solid ${col.color}`,
            }}>
              <span>{col.icon}</span>
              <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 700 }}>
                {col.label}
              </h4>
              <span style={{
                marginLeft: 'auto', background: `${col.color}20`,
                color: col.color, padding: '2px 8px', borderRadius: '10px',
                fontSize: '12px', fontWeight: 700,
              }}>
                {items.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((item) => (
                <div key={item.id} style={{
                  background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
                  padding: '12px', border: '1px solid var(--border)',
                  transition: 'all 0.2s', cursor: 'pointer',
                }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = col.color
                    e.currentTarget.style.boxShadow = `0 0 10px ${col.color}30`
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {item.scans?.domain || 'Unknown domain'}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {formatDateTime(item.created_at)}
                  </p>
                  {item.pdf_url && (
                    <a href={item.pdf_url} target="_blank" rel="noreferrer"
                      style={{
                        fontSize: '12px', color: 'var(--primary)',
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                      }}>
                      📄 Download PDF
                    </a>
                  )}
                </div>
              ))}

              {items.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                  No complaints
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
