import { useComplaints } from '../hooks/useComplaints'
import ComplaintKanban from '../components/ComplaintKanban'
import { FileText } from 'lucide-react'

export default function Complaints() {
  const { data: complaints = [] } = useComplaints()

  // Mock data for demo
  const mockComplaints = complaints.length > 0 ? complaints : [
    { id: '1', status: 'DRAFTED', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), scans: { url: 'https://fake-deals.com', domain: 'fake-deals.com', patterns_found: 5 } },
    { id: '2', status: 'SUBMITTED', pdf_url: '#', created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date().toISOString(), scans: { url: 'https://sneaky-site.in', domain: 'sneaky-site.in', patterns_found: 3 } },
    { id: '3', status: 'UNDER_REVIEW', pdf_url: '#', created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date().toISOString(), scans: { url: 'https://dark-shop.com', domain: 'dark-shop.com', patterns_found: 7 } },
    { id: '4', status: 'RESOLVED', pdf_url: '#', created_at: new Date(Date.now() - 604800000).toISOString(), updated_at: new Date().toISOString(), scans: { url: 'https://old-complaint.in', domain: 'old-complaint.in', patterns_found: 2 } },
  ]

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '88px 24px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={28} color="var(--primary)" /> Complaints
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Track your CCPA dark pattern complaints
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="glass-card" style={{
        marginBottom: '24px', borderLeft: '3px solid var(--primary)',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <div style={{ fontSize: '32px' }}>📋</div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
            How Complaints Work
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            When you detect dark patterns, DarkGuard generates a CCPA 2023-compliant PDF complaint.
            The complaint includes pattern evidence, screenshots, and legal clause references.
            Submit directly to consumer protection authorities.
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <ComplaintKanban complaints={mockComplaints} />
    </div>
  )
}
