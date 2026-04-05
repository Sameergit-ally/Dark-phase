import { useState } from 'react'
import { Settings as SettingsIcon, User, Bell, Trash2, Save, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'

export default function Settings() {
  const { user } = useStore()
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [digestChannel, setDigestChannel] = useState('email')
  const [digestLang, setDigestLang] = useState('en')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <PageTransition>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '92px 24px 40px' }}>
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          style={{ fontSize: '30px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', fontFamily: 'Outfit' }}>
          <span style={{ filter: 'drop-shadow(0 0 10px var(--primary-glow))' }}><SettingsIcon size={28} color="var(--primary)" /></span>
          Settings
        </motion.h1>

        {/* Profile */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit' }}>
            <User size={18} /> Profile
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Email</label>
              <input type="email" value={user?.email || ''} disabled className="input" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Plan</label>
              <div style={{ padding: '10px 18px', background: 'rgba(124,106,255,0.1)', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', border: '1px solid rgba(124,106,255,0.15)', boxShadow: '0 0 12px rgba(124,106,255,0.08)' }}>
                ⭐ Free Plan
              </div>
            </div>
          </div>
        </motion.div>

        {/* Digest */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit' }}>
            <Bell size={18} /> Digest Preferences
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Digest Channel</label>
              <select value={digestChannel} onChange={e => setDigestChannel(e.target.value)} className="input" style={{ cursor: 'pointer' }}>
                <option value="email">📧 Email</option>
                <option value="whatsapp">📱 WhatsApp</option>
                <option value="none">🔕 Disabled</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Digest Language</label>
              <select value={digestLang} onChange={e => setDigestLang(e.target.value)} className="input" style={{ cursor: 'pointer' }}>
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Save */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleSave} className="btn btn-primary" style={{ padding: '12px 34px', boxShadow: '0 0 20px var(--primary-glow)' }}>
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span key="saved" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Saved
                </motion.span>
              ) : (
                <motion.span key="save" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={16} /> Save Changes
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Danger Zone */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ marginTop: '44px', borderLeft: '3px solid var(--danger)', animation: 'borderGlow 4s ease-in-out infinite' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit' }}>
            <Trash2 size={18} style={{ filter: 'drop-shadow(0 0 6px var(--danger-glow))' }} /> Danger Zone
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.6 }}>
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 20px var(--danger-glow)' }} whileTap={{ scale: 0.97 }} className="btn btn-danger">
            <Trash2 size={14} /> Delete Account
          </motion.button>
        </motion.div>
      </div>
    </PageTransition>
  )
}
