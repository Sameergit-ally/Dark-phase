import { useComplaints } from '../hooks/useComplaints'
import ComplaintKanban from '../components/ComplaintKanban'
import { FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'

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
    <PageTransition>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '92px 24px 40px' }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}
        >
          <div>
            <h1 style={{
              fontSize: '30px', fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: '12px',
              fontFamily: 'Outfit, sans-serif',
            }}>
              <span style={{ filter: 'drop-shadow(0 0 10px var(--primary-glow))' }}>
                <FileText size={28} color="var(--primary)" />
              </span>
              Complaints
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
              Track your CCPA dark pattern complaints
            </p>
          </div>
        </motion.div>

        {/* Info banner */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            marginBottom: '28px', borderLeft: '3px solid var(--primary)',
            display: 'flex', alignItems: 'center', gap: '18px',
          }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ fontSize: '36px', filter: 'drop-shadow(0 0 6px var(--primary-glow))' }}
          >
            📋
          </motion.div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', fontFamily: 'Outfit, sans-serif' }}>
              How Complaints Work
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              When you detect dark patterns, DarkGuard generates a CCPA 2023-compliant PDF complaint.
              The complaint includes pattern evidence, screenshots, and legal clause references.
              Submit directly to consumer protection authorities.
            </p>
          </div>
        </motion.div>

        {/* Kanban Board */}
        <ComplaintKanban complaints={mockComplaints} />
      </div>
    </PageTransition>
  )
}
