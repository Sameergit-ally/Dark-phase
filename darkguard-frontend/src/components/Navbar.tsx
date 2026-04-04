import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Shield, LayoutDashboard, FileText, Trophy, Users, Settings, Search, LogOut } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const { isAuthenticated, user, logout, setShowAuthModal } = useStore()

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/complaints', label: 'Complaints', icon: <FileText size={18} /> },
    { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
    { to: '/community', label: 'Community', icon: <Users size={18} /> },
    { to: '/audit', label: 'Audit', icon: <Search size={18} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(10, 10, 20, 0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', height: '64px', gap: '32px',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          textDecoration: 'none', color: 'var(--text-primary)',
          fontWeight: 800, fontSize: '20px',
        }}>
          <Shield size={24} color="var(--primary)" />
          <span className="gradient-text">DarkGuard</span>
        </Link>

        {/* Nav Links */}
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
            {links.map((link) => (
              <Link key={link.to} to={link.to} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                color: location.pathname === link.to ? 'var(--primary)' : 'var(--text-secondary)',
                background: location.pathname === link.to ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                transition: 'all 0.2s',
              }}>
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Auth */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {user?.full_name || user?.email}
              </span>
              <button onClick={logout} className="btn btn-ghost" style={{ padding: '8px' }}>
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="btn btn-primary">
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
