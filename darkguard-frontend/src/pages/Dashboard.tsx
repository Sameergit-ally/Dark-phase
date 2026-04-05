import { Scan, AlertTriangle, FileText, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import StatCard from '../components/StatCard'
import TrustScoreChart from '../components/TrustScoreChart'
import ScanTable from '../components/ScanTable'
import { useUserStats } from '../hooks/useScans'
import { useStore } from '../store/useStore'
import PageTransition from '../components/PageTransition'

export default function Dashboard() {
  const { user } = useStore()
  const { data: stats } = useUserStats(!!user)

  // Mock data for demo
  const mockScans = [
    { id: '1', url: 'https://example-shop.in/checkout', domain: 'example-shop.in', patterns_found: 4, scan_duration_ms: 1200, created_at: new Date().toISOString(), grade: 'D' },
    { id: '2', url: 'https://fake-deals.com/sale', domain: 'fake-deals.com', patterns_found: 7, scan_duration_ms: 800, created_at: new Date(Date.now() - 3600000).toISOString(), grade: 'F' },
    { id: '3', url: 'https://trusted-store.in', domain: 'trusted-store.in', patterns_found: 0, scan_duration_ms: 950, created_at: new Date(Date.now() - 7200000).toISOString(), grade: 'A' },
    { id: '4', url: 'https://sneaky-subscribe.com/plans', domain: 'sneaky-subscribe.com', patterns_found: 2, scan_duration_ms: 1500, created_at: new Date(Date.now() - 10800000).toISOString(), grade: 'B' },
    { id: '5', url: 'https://cookie-monster.in', domain: 'cookie-monster.in', patterns_found: 5, scan_duration_ms: 1100, created_at: new Date(Date.now() - 86400000).toISOString(), grade: 'C' },
  ]

  return (
    <PageTransition>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '92px 24px 40px' }}>
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '36px' }}
        >
          <h1 style={{ fontSize: '30px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
            Welcome back, <span className="gradient-text">{user?.full_name || 'Guardian'}</span>{' '}
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'inline-block', filter: 'drop-shadow(0 0 8px rgba(124, 106, 255, 0.4))' }}
            >
              🛡️
            </motion.span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '15px' }}>
            Here's your dark pattern detection overview
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px', marginBottom: '32px' }}>
          <StatCard
            title="Total Scans"
            value={stats?.total_scans || 42}
            icon={<Scan size={24} />}
            trend="+12 this week"
            color="var(--primary)"
          />
          <StatCard
            title="Patterns Found"
            value={stats?.total_patterns_found || 156}
            icon={<AlertTriangle size={24} />}
            trend="+23 detected"
            color="var(--danger)"
          />
          <StatCard
            title="Complaints Filed"
            value={stats?.total_complaints || 8}
            icon={<FileText size={24} />}
            color="var(--warning)"
          />
          <StatCard
            title="DarkGuard Points"
            value={stats?.darkguard_points || 350}
            icon={<Star size={24} />}
            trend="+50 earned"
            color="var(--success)"
          />
        </div>

        {/* Chart */}
        <div style={{ marginBottom: '32px' }}>
          <TrustScoreChart />
        </div>

        {/* Recent Scans */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 style={{
            fontSize: '18px', fontWeight: 700, marginBottom: '20px',
            fontFamily: 'Outfit, sans-serif',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ filter: 'drop-shadow(0 0 8px var(--primary-glow))' }}>🔍</span>
            Recent Scans
          </h3>
          <ScanTable scans={mockScans} />
        </motion.div>
      </div>
    </PageTransition>
  )
}
