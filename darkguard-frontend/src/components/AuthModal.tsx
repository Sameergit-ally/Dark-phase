import { useState } from 'react'
import { useStore } from '../store/useStore'
import { X, Shield, Mail, Lock, User } from 'lucide-react'

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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={(e) => e.target === e.currentTarget && setShowAuthModal(false)}
    >
      <div style={{
        background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
        padding: '40px', width: '100%', maxWidth: '420px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
        animation: 'fadeInUp 0.3s ease',
      }}>
        <button onClick={() => setShowAuthModal(false)} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer',
        }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Shield size={40} color="var(--primary)" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>
            {mode === 'login' ? 'Welcome Back' : 'Join DarkGuard'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account to start protecting'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="text" placeholder="Full Name" value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input" style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            <input
              type="email" placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input" style={{ paddingLeft: '40px' }}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            <input
              type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input" style={{ paddingLeft: '40px' }}
              required minLength={6}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}
            disabled={loading}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
