import { useState } from 'react'
import { Settings as SettingsIcon, User, Bell, Trash2, Save } from 'lucide-react'
import { useStore } from '../store/useStore'

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
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '88px 24px 40px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
        <SettingsIcon size={28} color="var(--primary)" /> Settings
      </h1>

      {/* Profile */}
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} /> Profile
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Full Name
            </label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="input" />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Email
            </label>
            <input type="email" value={user?.email || ''} disabled className="input"
              style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Plan
            </label>
            <div style={{
              padding: '10px 16px', background: 'rgba(108,99,255,0.1)', borderRadius: 'var(--radius-sm)',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              color: 'var(--primary)', fontWeight: 600, fontSize: '14px',
            }}>
              ⭐ Free Plan
            </div>
          </div>
        </div>
      </div>

      {/* Digest Preferences */}
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} /> Digest Preferences
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Digest Channel
            </label>
            <select value={digestChannel} onChange={(e) => setDigestChannel(e.target.value)}
              className="input" style={{ cursor: 'pointer' }}>
              <option value="email">📧 Email</option>
              <option value="whatsapp">📱 WhatsApp</option>
              <option value="none">🔕 Disabled</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Digest Language
            </label>
            <select value={digestLang} onChange={(e) => setDigestLang(e.target.value)}
              className="input" style={{ cursor: 'pointer' }}>
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={handleSave} className="btn btn-primary" style={{ padding: '12px 32px' }}>
          <Save size={16} /> {saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="glass-card" style={{ marginTop: '40px', borderLeft: '3px solid var(--danger)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 size={18} /> Danger Zone
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <button className="btn btn-danger">
          <Trash2 size={14} /> Delete Account
        </button>
      </div>
    </div>
  )
}
