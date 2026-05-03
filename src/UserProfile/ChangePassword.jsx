import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { auth } from '../backend/firebase'
import ProfileSidebar from './ProfileSidebar'

const fieldStyle = {
  height: '48px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text)',
  padding: '0 46px 0 14px',
  width: '100%',
  outline: 'none'
}

const PasswordField = ({ label, value, onChange, visible, onToggle, hint }) => (
  <div style={{ textAlign: 'left', marginBottom: '16px' }}>
    <label style={{ display: 'block', color: 'var(--color-muted)', fontSize: '13px', marginBottom: '6px' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <input type={visible ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle} />
      <button type="button" onClick={onToggle} style={{
        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
        color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer'
      }}>
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {hint && <p style={{ color: 'var(--color-muted)', fontSize: '12px', marginTop: '6px' }}>{hint}</p>}
  </div>
)

const ChangePassword = () => {
  const [values, setValues] = useState({ current: '', next: '', confirm: '' })
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false })
  const [saving, setSaving] = useState(false)

  const change = (key, value) => setValues({ ...values, [key]: value })
  const toggle = (key) => setVisible({ ...visible, [key]: !visible[key] })

  const handleSubmit = async (event) => {
    event.preventDefault()
    const user = auth.currentUser

    if (!user?.email) return toast.error('Please sign in again')
    if (values.next.length < 8) return toast.error('New password must be at least 8 characters')
    if (values.next !== values.confirm) return toast.error('Passwords do not match')

    setSaving(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, values.current)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, values.next)
      setValues({ current: '', next: '', confirm: '' })
      toast.success('Password changed')
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '64px' }}>
      <ProfileSidebar />
      <main style={{ marginLeft: '240px', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={handleSubmit} style={{
          width: '400px', padding: '40px', borderRadius: '16px', textAlign: 'center',
          background: 'rgba(15, 15, 46, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid var(--color-border)'
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-secondary)', color: 'white', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={24} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-text)' }}>Change Password</h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: '28px' }}>Update your account security</p>

          <PasswordField label="Current Password" value={values.current} onChange={(value) => change('current', value)} visible={visible.current} onToggle={() => toggle('current')} />
          <PasswordField label="New Password" value={values.next} onChange={(value) => change('next', value)} visible={visible.next} onToggle={() => toggle('next')} hint="Minimum 8 characters required" />
          <PasswordField label="Confirm New Password" value={values.confirm} onChange={(value) => change('confirm', value)} visible={visible.confirm} onToggle={() => toggle('confirm')} />

          <button type="submit" disabled={saving} style={{
            width: '100%', height: '48px', background: 'var(--color-secondary)', color: 'white',
            borderRadius: '8px', fontWeight: '600', fontSize: '15px', marginTop: '8px', border: 'none', cursor: 'pointer'
          }}>{saving ? 'Updating...' : 'Change Password'}</button>
        </form>
      </main>
    </div>
  )
}

export default ChangePassword
