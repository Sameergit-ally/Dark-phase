import { useState } from 'react'
import { useStore } from '../store/useStore'
import { X, Shield, Mail, Lock, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, signup } = useStore()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!showAuthModal) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(email, password, fullName)
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={(e) => e.target === e.currentTarget && setShowAuthModal(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            padding: '44px',
            width: '100%',
            maxWidth: '430px',
            border: '1px solid var(--border)',
            boxShadow: '0 0 60px rgba(124, 106, 255, 0.1), 0 24px 48px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Holographic shine overlay */}
          <div style={{
            position: 'absolute',
            top: 0, left: '-100%',
            width: '100%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(124, 106, 255, 0.03), transparent)',
            animation: 'shimmer 3s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          <motion.button
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAuthModal(false)}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(255,255,255,0.05)', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </motion.button>

          <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative' }}>
            <motion.div
              animate={{
                filter: ['drop-shadow(0 0 15px rgba(124, 106, 255, 0.3))', 'drop-shadow(0 0 30px rgba(124, 106, 255, 0.6))', 'drop-shadow(0 0 15px rgba(124, 106, 255, 0.3))'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ marginBottom: '16px' }}
            >
              <Shield size={44} color="var(--primary)" />
            </motion.div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              {mode === 'login' ? 'Welcome Back' : 'Join DarkGuard'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
              {mode === 'login' ? 'Sign in to your account' : 'Create your account to start protecting'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ position: 'relative' }}
              >
                <User size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  type="text" placeholder="Full Name" value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input" style={{ paddingLeft: '42px' }}
                  required
                />
              </motion.div>
            )}

            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input" style={{ paddingLeft: '42px' }}
                required
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input" style={{ paddingLeft: '42px' }}
                required minLength={6}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center' }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%', padding: '14px', fontSize: '15px',
                boxShadow: '0 4px 24px rgba(124, 106, 255, 0.3)',
              }}
              disabled={loading}
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                />
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              style={{
                background: 'none', border: 'none', color: 'var(--primary)',
                cursor: 'pointer', fontWeight: 600, fontSize: '13px',
              }}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
