import { useState, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Scan, FileText, Trophy, Zap, Globe, ChevronRight, Search } from 'lucide-react'
import { useStore } from '../store/useStore'
import GradeCircle from '../components/GradeCircle'
import PageTransition, { staggerChild } from '../components/PageTransition'
import { motion } from 'framer-motion'
import { lazy } from 'react'

const ParticleField = lazy(() => import('../components/ParticleField'))

export default function Landing() {
  const { setShowAuthModal } = useStore()
  const [searchDomain, setSearchDomain] = useState('')

  const features = [
    {
      icon: <Scan size={28} />, title: 'Real-Time Scanning',
      desc: 'Our AI scans every page you visit, detecting dark patterns instantly in the browser.',
      color: '#7c6aff',
    },
    {
      icon: <Shield size={28} />, title: 'Visual Highlights',
      desc: 'Deceptive elements are highlighted with colored borders and detailed explanations.',
      color: '#00e676',
    },
    {
      icon: <FileText size={28} />, title: 'CCPA Complaints',
      desc: 'Generate official complaints with one click. PDF ready for submission to authorities.',
      color: '#ffab40',
    },
    {
      icon: <Trophy size={28} />, title: 'Trust Scores',
      desc: 'Every website gets an A-F grade. Check before you buy with our trust leaderboard.',
      color: '#ff3d71',
    },
    {
      icon: <Globe size={28} />, title: 'Multilingual',
      desc: 'Detects dark patterns in Hindi, Tamil, Bengali, Telugu, Marathi and Hinglish.',
      color: '#00e5ff',
    },
    {
      icon: <Zap size={28} />, title: 'AI Powered',
      desc: 'Groq LLM + ML classifiers ensure 95%+ accuracy with under 3-second response times.',
      color: '#a78bfa',
    },
  ]

  const patterns = [
    { name: 'Fake Urgency', example: '"Only 2 left!" timers', emoji: '⏰' },
    { name: 'Hidden Charges', example: 'Surprise fees at checkout', emoji: '💸' },
    { name: 'Roach Motel', example: 'Easy sign-up, impossible cancel', emoji: '🪤' },
    { name: 'Confirmshaming', example: '"No, I hate saving money"', emoji: '😢' },
    { name: 'Trick Questions', example: 'Confusing double negatives', emoji: '❓' },
    { name: 'Cookie Manipulation', example: 'Forced accept, hidden reject', emoji: '🍪' },
    { name: 'Bait & Switch', example: 'Price changes at checkout', emoji: '🎣' },
    { name: 'Misdirection', example: 'Pre-selected expensive plan', emoji: '🎯' },
  ]

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh' }}>
        {/* ─── Hero ─── */}
        <section style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '100px 24px 60px', position: 'relative', overflow: 'hidden',
        }}>
          {/* 3D Particle Background */}
          <Suspense fallback={null}>
            <ParticleField />
          </Suspense>

          {/* Overlay gradient for text readability */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(6,6,14,0.5) 70%)',
            pointerEvents: 'none',
          }} />

          <motion.div
            variants={staggerChild}
            style={{ position: 'relative', zIndex: 2, maxWidth: '850px' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 22px',
                borderRadius: '100px',
                background: 'rgba(124, 106, 255, 0.1)',
                border: '1px solid rgba(124, 106, 255, 0.25)',
                fontSize: '13px', color: 'var(--primary-light)', fontWeight: 600, marginBottom: '28px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Shield size={16} style={{ filter: 'drop-shadow(0 0 4px var(--primary-glow))' }} />
              Protecting Indian users from deceptive UI
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{
                fontSize: 'clamp(38px, 6vw, 76px)', fontWeight: 900,
                lineHeight: 1.08, marginBottom: '28px',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              <span className="gradient-text">Detect Dark Patterns</span>
              <br />Before They Trick You
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                fontSize: '18px', color: 'var(--text-secondary)',
                maxWidth: '620px', margin: '0 auto 44px', lineHeight: 1.7,
              }}
            >
              DarkGuard uses AI to scan websites in real-time, highlight deceptive design tricks,
              and help you file official complaints. Free forever.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAuthModal(true)}
                className="btn btn-primary"
                style={{
                  padding: '16px 36px', fontSize: '16px', borderRadius: '14px',
                  boxShadow: '0 0 30px rgba(124, 106, 255, 0.35)',
                }}
              >
                Get Started Free <ChevronRight size={20} />
              </motion.button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link to="/leaderboard" className="btn btn-secondary"
                  style={{ padding: '16px 36px', fontSize: '16px', borderRadius: '14px' }}>
                  <Trophy size={20} /> View Leaderboard
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            style={{
              position: 'relative', zIndex: 2, marginTop: '64px', width: '100%', maxWidth: '520px',
            }}
          >
            <div style={{
              position: 'relative',
              background: 'rgba(12, 12, 24, 0.6)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
              onFocus={(e) => {
                const div = e.currentTarget
                div.style.borderColor = 'rgba(124, 106, 255, 0.3)'
                div.style.boxShadow = '0 0 30px rgba(124, 106, 255, 0.12)'
              }}
              onBlur={(e) => {
                const div = e.currentTarget
                div.style.borderColor = 'var(--border)'
                div.style.boxShadow = 'none'
              }}
            >
              <Search size={20} style={{
                position: 'absolute', left: '18px', top: '16px',
                color: 'var(--text-muted)',
                filter: 'drop-shadow(0 0 4px var(--primary-glow))',
              }} />
              <input
                type="text" placeholder="Check any website's trust score..."
                value={searchDomain}
                onChange={(e) => setSearchDomain(e.target.value)}
                className="input"
                style={{
                  paddingLeft: '50px', paddingRight: '120px',
                  height: '54px', borderRadius: '16px', fontSize: '15px',
                  border: 'none', background: 'transparent',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
                style={{
                  position: 'absolute', right: '5px', top: '5px', bottom: '5px',
                  borderRadius: '12px', padding: '0 22px',
                }}
                onClick={() => searchDomain && (window.location.href = `/leaderboard?search=${searchDomain}`)}
              >
                Check
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* ─── Dark Patterns Grid ─── */}
        <section style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '56px' }}
          >
            <h2 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>
              8 Dark Patterns We <span className="gradient-text">Detect</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              As defined by CCPA 2023 Guidelines on Dark Patterns
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
            {patterns.map((p, i) => (
              <motion.div
                key={p.name}
                className="glass-card neon-border"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                style={{ cursor: 'default' }}
              >
                <div style={{
                  fontSize: '36px', marginBottom: '14px',
                  filter: 'drop-shadow(0 0 8px rgba(124, 106, 255, 0.3))',
                }}>
                  {p.emoji}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', fontFamily: 'Outfit, sans-serif' }}>
                  {p.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {p.example}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Features ─── */}
        <section style={{
          padding: '100px 24px',
          background: 'linear-gradient(180deg, rgba(10,10,22,0) 0%, rgba(124, 106, 255, 0.03) 50%, rgba(10,10,22,0) 100%)',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontSize: '40px', fontWeight: 800, textAlign: 'center', marginBottom: '56px', fontFamily: 'Outfit, sans-serif' }}
            >
              How <span className="gradient-text">DarkGuard</span> Protects You
            </motion.h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="glass-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  style={{ borderLeft: `3px solid ${f.color}` }}
                >
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '14px', marginBottom: '18px',
                    background: `${f.color}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: f.color,
                    filter: `drop-shadow(0 0 10px ${f.color}40)`,
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', fontFamily: 'Outfit, sans-serif' }}>
                    {f.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Demo Grade ─── */}
        <section style={{ padding: '100px 24px', textAlign: 'center' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: '40px', fontWeight: 800, marginBottom: '48px', fontFamily: 'Outfit, sans-serif' }}
          >
            Every Website Gets a <span className="gradient-text">Grade</span>
          </motion.h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '36px', flexWrap: 'wrap' }}>
            {['A', 'B', 'C', 'D', 'F'].map((g, i) => (
              <motion.div
                key={g}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.1, y: -4 }}
                style={{ textAlign: 'center' }}
              >
                <GradeCircle grade={g} size={90} />
                <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {g === 'A' ? '0 patterns' : g === 'B' ? '1-2 patterns' : g === 'C' ? '3-5 patterns' : g === 'D' ? '6-10 patterns' : '10+ patterns'}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section style={{
          padding: '100px 24px', textAlign: 'center',
          background: 'linear-gradient(180deg, transparent, rgba(124, 106, 255, 0.04), transparent)',
          position: 'relative',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '18px', fontFamily: 'Outfit, sans-serif' }}>
              Ready to Browse <span className="gradient-text">Safely</span>?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '36px', fontSize: '17px' }}>
              Install the Chrome Extension and start protecting yourself today.
            </p>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAuthModal(true)}
              className="btn btn-primary"
              style={{
                padding: '18px 44px', fontSize: '18px', borderRadius: '16px',
                boxShadow: '0 0 40px rgba(124, 106, 255, 0.3)',
              }}
            >
              Get DarkGuard Free <ChevronRight size={22} />
            </motion.button>
          </motion.div>
        </section>

        {/* ─── Footer ─── */}
        <footer style={{
          padding: '28px', textAlign: 'center',
          borderTop: '1px solid rgba(124, 106, 255, 0.08)',
          color: 'var(--text-muted)', fontSize: '13px',
        }}>
          <p>© 2026 DarkGuard. Built with ❤️ to protect Indian consumers.</p>
        </footer>
      </div>
    </PageTransition>
  )
}
