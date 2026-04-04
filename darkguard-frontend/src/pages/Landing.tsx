import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Scan, FileText, Trophy, Zap, Globe, ChevronRight, Search } from 'lucide-react'
import { useStore } from '../store/useStore'
import GradeCircle from '../components/GradeCircle'

export default function Landing() {
  const { setShowAuthModal } = useStore()
  const [searchDomain, setSearchDomain] = useState('')

  const features = [
    {
      icon: <Scan size={28} />, title: 'Real-Time Scanning',
      desc: 'Our AI scans every page you visit, detecting dark patterns instantly in the browser.',
      color: '#6c63ff',
    },
    {
      icon: <Shield size={28} />, title: 'Visual Highlights',
      desc: 'Deceptive elements are highlighted with colored borders and detailed explanations.',
      color: '#2a9d8f',
    },
    {
      icon: <FileText size={28} />, title: 'CCPA Complaints',
      desc: 'Generate official complaints with one click. PDF ready for submission to authorities.',
      color: '#f4a261',
    },
    {
      icon: <Trophy size={28} />, title: 'Trust Scores',
      desc: 'Every website gets an A-F grade. Check before you buy with our trust leaderboard.',
      color: '#e63946',
    },
    {
      icon: <Globe size={28} />, title: 'Multilingual',
      desc: 'Detects dark patterns in Hindi, Tamil, Bengali, Telugu, Marathi and Hinglish.',
      color: '#00d9ff',
    },
    {
      icon: <Zap size={28} />, title: 'AI Powered',
      desc: 'Groq LLM + ML classifiers ensure 95%+ accuracy with under 3-second response times.',
      color: '#8b83ff',
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
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '100px 24px 60px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(circle at 50% 30%, rgba(108,99,255,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(0,217,255,0.08) 0%, transparent 40%)',
        }} />

        <div className="animate-fade-in" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px',
            borderRadius: '100px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
            fontSize: '13px', color: 'var(--primary)', fontWeight: 600, marginBottom: '24px',
          }}>
            <Shield size={16} /> Protecting Indian users from deceptive UI
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
            <span className="gradient-text">Detect Dark Patterns</span>
            <br />Before They Trick You
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            DarkGuard uses AI to scan websites in real-time, highlight deceptive design tricks,
            and help you file official complaints. Free forever.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowAuthModal(true)} className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: '16px', borderRadius: '12px' }}>
              Get Started Free <ChevronRight size={20} />
            </button>
            <Link to="/leaderboard" className="btn btn-secondary"
              style={{ padding: '14px 32px', fontSize: '16px', borderRadius: '12px' }}>
              <Trophy size={20} /> View Leaderboard
            </Link>
          </div>
        </div>

        {/* Trust Score Search */}
        <div className="animate-fade-in-delay-2" style={{
          position: 'relative', zIndex: 1, marginTop: '60px', width: '100%', maxWidth: '500px',
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text" placeholder="Check any website's trust score..."
              value={searchDomain}
              onChange={(e) => setSearchDomain(e.target.value)}
              className="input"
              style={{ paddingLeft: '48px', paddingRight: '120px', height: '50px', borderRadius: '14px', fontSize: '15px' }}
            />
            <button className="btn btn-primary"
              style={{ position: 'absolute', right: '4px', top: '4px', bottom: '4px', borderRadius: '10px', padding: '0 20px' }}
              onClick={() => searchDomain && (window.location.href = `/leaderboard?search=${searchDomain}`)}>
              Check
            </button>
          </div>
        </div>
      </section>

      {/* Dark Patterns Grid */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '16px' }}>
          8 Dark Patterns We <span className="gradient-text">Detect</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '16px' }}>
          As defined by CCPA 2023 Guidelines on Dark Patterns
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {patterns.map((p, i) => (
            <div key={p.name} className="glass-card animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s`, cursor: 'default' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{p.emoji}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{p.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '48px' }}>
            How <span className="gradient-text">DarkGuard</span> Protects You
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {features.map((f, i) => (
              <div key={f.title} className="glass-card animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s`, borderLeft: `3px solid ${f.color}` }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px', marginBottom: '16px',
                  background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Grade */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '40px' }}>
          Every Website Gets a <span className="gradient-text">Grade</span>
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
          {['A', 'B', 'C', 'D', 'F'].map((g) => (
            <div key={g} style={{ textAlign: 'center' }}>
              <GradeCircle grade={g} size={80} />
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                {g === 'A' ? '0 patterns' : g === 'B' ? '1-2 patterns' : g === 'C' ? '3-5 patterns' : g === 'D' ? '6-10 patterns' : '10+ patterns'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'var(--bg-secondary)' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>
          Ready to Browse <span className="gradient-text">Safely</span>?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
          Install the Chrome Extension and start protecting yourself today.
        </p>
        <button onClick={() => setShowAuthModal(true)} className="btn btn-primary"
          style={{ padding: '16px 40px', fontSize: '18px', borderRadius: '14px' }}>
          Get DarkGuard Free <ChevronRight size={22} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px', textAlign: 'center', borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)', fontSize: '13px',
      }}>
        <p>© 2026 DarkGuard. Built with ❤️ to protect Indian consumers.</p>
      </footer>
    </div>
  )
}
