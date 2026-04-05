import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Shield, LayoutDashboard, FileText, Trophy, Users, Settings, Search, LogOut, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function Navbar() {
  const location = useLocation()
  const { isAuthenticated, user, logout, setShowAuthModal } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/complaints', label: 'Complaints', icon: <FileText size={18} /> },
    { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
    { to: '/community', label: 'Community', icon: <Users size={18} /> },
    { to: '/audit', label: 'Audit', icon: <Search size={18} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: 'rgba(6, 6, 14, 0.75)',
          backdropFilter: 'blur(24px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
          borderBottom: '1px solid rgba(124, 106, 255, 0.08)',
        }}
      >
        <div style={{
          maxWidth: '1400px', margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', height: '68px', gap: '32px',
        }}>
          {/* Logo */}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            textDecoration: 'none', color: 'var(--text-primary)',
          }}>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 12px rgba(124, 106, 255, 0.5))' }}
            >
              <Shield size={26} color="var(--primary)" />
            </motion.div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '22px' }} className="gradient-text">
              DarkGuard
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div style={{ display: 'flex', gap: '2px', flex: 1 }} className="desktop-nav">
              {links.map((link) => (
                <Link key={link.to} to={link.to} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                  fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                  color: isActive(link.to) ? 'var(--primary-light)' : 'var(--text-secondary)',
                  background: isActive(link.to) ? 'rgba(124, 106, 255, 0.12)' : 'transparent',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}>
                  <span style={{
                    filter: isActive(link.to) ? 'drop-shadow(0 0 6px var(--primary-glow))' : 'none',
                    transition: 'filter 0.3s',
                  }}>
                    {link.icon}
                  </span>
                  {link.label}
                  {isActive(link.to) && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '20px',
                        height: '2px',
                        background: 'var(--primary)',
                        borderRadius: '1px',
                        boxShadow: '0 0 8px var(--primary-glow)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Auth + Mobile */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {user?.full_name || user?.email}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="btn btn-ghost"
                  style={{ padding: '8px', borderRadius: '50%' }}
                >
                  <LogOut size={18} />
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAuthModal(true)}
                className="btn btn-primary"
                style={{ boxShadow: '0 0 20px rgba(124, 106, 255, 0.3)' }}
              >
                Sign In
              </motion.button>
            )}

            {/* Mobile hamburger */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="mobile-menu-btn"
                style={{
                  display: 'none',
                  background: 'none', border: 'none', color: 'var(--text-primary)',
                  cursor: 'pointer', padding: '8px',
                }}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Nav Panel */}
      <AnimatePresence>
        {mobileOpen && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', top: '68px', right: 0, bottom: 0,
              width: '280px', zIndex: 999,
              background: 'rgba(6, 6, 14, 0.95)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid var(--border)',
              padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '4px',
            }}
          >
            {links.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={link.to} onClick={() => setMobileOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                  fontSize: '14px', fontWeight: 500, textDecoration: 'none',
                  color: isActive(link.to) ? 'var(--primary-light)' : 'var(--text-secondary)',
                  background: isActive(link.to) ? 'rgba(124, 106, 255, 0.12)' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  {link.icon}
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  )
}
