import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, HardDrive, Monitor, Music, Shield, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { auth } from '../backend/firebase'
import ProfileSidebar from './ProfileSidebar'

const tabs = [
  ['audio', 'Audio & Playback', Music],
  ['interface', 'Interface', Monitor],
  ['privacy', 'Privacy', Shield],
  ['notifications', 'Notifications', Bell],
  ['storage', 'Storage & Cache', HardDrive],
  ['account', 'Account', User]
]

const Toggle = ({ checked, onClick }) => (
  <button type="button" onClick={onClick} style={{
    width: '44px', height: '24px', borderRadius: '12px', border: 'none',
    background: checked ? 'var(--color-primary)' : 'var(--color-muted)', cursor: 'pointer', padding: '2px'
  }}>
    <span style={{ display: 'block', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transform: checked ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 150ms' }} />
  </button>
)

const Row = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--color-border)' }}>
    <span style={{ color: 'var(--color-text)', fontWeight: '500' }}>{label}</span>
    {children}
  </div>
)

const selectStyle = {
  height: '42px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text)',
  padding: '0 12px'
}

const SettingsPanel = ({ active, values, setValues }) => {
  const toggle = (key) => setValues({ ...values, [key]: !values[key] })

  if (active === 'interface') return (
    <>
      <h2 style={panelTitle}>Interface</h2>
      <Row label="Language"><select style={selectStyle}><option>English</option><option>Tamil</option><option>Hindi</option></select></Row>
      <Row label="Theme"><span style={{ color: 'var(--color-muted)' }}>Dark selected · Light/System coming soon</span></Row>
      <Row label="Compact mode"><Toggle checked={values.compact} onClick={() => toggle('compact')} /></Row>
      <Row label="Show album art"><Toggle checked={values.albumArt} onClick={() => toggle('albumArt')} /></Row>
    </>
  )

  if (active === 'privacy') return (
    <>
      <h2 style={panelTitle}>Privacy</h2>
      {['Private listening history', 'Show profile publicly', 'Allow friend requests'].map((label, index) => (
        <Row key={label} label={label}><Toggle checked={values[`privacy${index}`]} onClick={() => toggle(`privacy${index}`)} /></Row>
      ))}
    </>
  )

  if (active === 'notifications') return (
    <>
      <h2 style={panelTitle}>Notifications</h2>
      {['New releases', 'Playlist updates', 'Email notifications'].map((label, index) => (
        <Row key={label} label={label}><Toggle checked={values[`notice${index}`]} onClick={() => toggle(`notice${index}`)} /></Row>
      ))}
    </>
  )

  if (active === 'storage') return (
    <>
      <h2 style={panelTitle}>Storage & Cache</h2>
      <Row label="Cache size"><span style={{ color: 'var(--color-muted)' }}>24.3 MB</span></Row>
      <button onClick={() => toast.success('Cache cleared')} style={dangerButton}>Clear Cache</button>
    </>
  )

  if (active === 'account') return (
    <>
      <h2 style={panelTitle}>Account</h2>
      <Row label="Email"><span style={{ color: 'var(--color-muted)' }}>{auth.currentUser?.email || 'Not signed in'}</span></Row>
      <Row label="Password"><Link to="/profile/change-password" style={{ color: 'var(--color-primary)' }}>Change Password</Link></Row>
      <button onClick={() => toast.error('Contact support to delete your account')} style={dangerButton}>Delete Account</button>
    </>
  )

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h2 style={panelTitle}>Audio & Playback</h2>
        <button onClick={() => setValues(defaultSettings())} style={ghostButton}>Reset to Default</button>
      </div>
      <Row label={`Default Volume: ${values.volume}%`}>
        <input type="range" min="0" max="100" value={values.volume} onChange={(e) => {
          localStorage.setItem('musify_volume', e.target.value)
          setValues({ ...values, volume: e.target.value })
        }} />
      </Row>
      <Row label="Auto-play next track"><Toggle checked={values.autoplay} onClick={() => toggle('autoplay')} /></Row>
      <Row label="Repeat Mode"><select style={selectStyle}><option>Off</option><option>One</option><option>All</option></select></Row>
      {['Shuffle by default', 'Crossfade between tracks', 'Normalize volume levels'].map((label, index) => (
        <Row key={label} label={label}><Toggle checked={values[`audio${index}`]} onClick={() => toggle(`audio${index}`)} /></Row>
      ))}
    </>
  )
}

const panelTitle = { fontSize: '20px', fontWeight: '700', color: 'var(--color-text)' }
const ghostButton = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }
const dangerButton = { marginTop: '18px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer' }
const defaultSettings = () => ({ volume: localStorage.getItem('musify_volume') || 70, autoplay: true, audio0: false, audio1: false, audio2: true, compact: false, albumArt: true, privacy0: false, privacy1: true, privacy2: true, notice0: true, notice1: true, notice2: false })

const Settings = () => {
  const isMobile = window.innerWidth < 768
  const [active, setActive] = useState('audio')
  const [values, setValues] = useState(defaultSettings)

  return (
    <div style={{ minHeight: '100vh', paddingTop: '64px' }}>
      <ProfileSidebar />
      <main style={{ padding: '32px', marginLeft: isMobile ? '0' : '240px' }}>
        <h1 style={{
          fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '8px',
          background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>Settings</h1>
        <p style={{ color: 'var(--color-muted)', textAlign: 'center', marginBottom: '32px' }}>Customize your music experience</p>
        <div style={{ display: 'flex', gap: '24px', flexDirection: isMobile ? 'column' : 'row' }}>
          <nav style={{ width: isMobile ? '100%' : '220px', padding: '16px', borderRadius: '16px', background: 'rgba(15,15,46,0.6)', border: '1px solid var(--color-border)' }}>
            {tabs.map(([key, label, Icon]) => (
              <button key={key} onClick={() => setActive(key)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '4px', border: 'none',
                background: active === key ? 'var(--color-primary)' : 'transparent', color: active === key ? 'white' : 'var(--color-muted)'
              }}><Icon size={17} />{label}</button>
            ))}
          </nav>
          <section style={{ flex: 1, padding: '28px', borderRadius: '16px', background: 'rgba(15,15,46,0.6)', border: '1px solid var(--color-border)' }}>
            <SettingsPanel active={active} values={values} setValues={setValues} />
          </section>
        </div>
      </main>
    </div>
  )
}

export default Settings
