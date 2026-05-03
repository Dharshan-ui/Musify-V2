import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { auth, db } from '../backend/firebase'
import ProfileSidebar from './ProfileSidebar'

const inputStyle = {
  height: '48px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text)',
  padding: '0 14px',
  width: '100%',
  outline: 'none'
}

const labelStyle = { color: 'var(--color-muted)', fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return ''
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age -= 1
  return Number.isFinite(age) ? String(age) : ''
}

const EditProfile = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '', language: '',
    address: '', country: '', state: '', city: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return
      const snapshot = await getDoc(doc(db, 'userProfiles', auth.currentUser.uid))
      if (snapshot.exists()) setForm((prev) => ({ ...prev, ...snapshot.data() }))
    }

    loadProfile()
  }, [])

  const updateField = (field, value) => setForm({ ...form, [field]: value })
  const age = calculateAge(form.dateOfBirth)

  const handleSave = async (event) => {
    event.preventDefault()
    if (!auth.currentUser) {
      toast.error('Please sign in first')
      return
    }

    setSaving(true)
    try {
      await setDoc(doc(db, 'userProfiles', auth.currentUser.uid), {
        ...form,
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        age,
        email: auth.currentUser.email,
        updatedAt: serverTimestamp()
      }, { merge: true })
      toast.success('Profile updated')
    } catch (error) {
      console.error('Profile save error:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '64px' }}>
      <ProfileSidebar />
      <main style={{ marginLeft: '240px', padding: '32px' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
          fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '8px',
          background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Update Your Profile
        </motion.h1>
        <p style={{ color: 'var(--color-muted)', textAlign: 'center', marginBottom: '32px' }}>
          Complete your profile information to get started
        </p>

        <form onSubmit={handleSave} style={{
          maxWidth: '900px', margin: '0 auto', padding: '32px', borderRadius: '16px',
          background: 'rgba(15, 15, 46, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid var(--color-border)'
        }}>
          <h2 style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '12px', color: 'var(--color-text)', fontWeight: '700', marginBottom: '20px' }}>
            Personal Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '18px' }}>
            {['firstName', 'lastName'].map((field) => (
              <div key={field}>
                <label style={labelStyle}>{field === 'firstName' ? 'First Name' : 'Last Name'}</label>
                <input value={form[field]} onChange={(e) => updateField(field, e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'} />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
            <div><label style={labelStyle}>Age</label><input value={age} readOnly style={{ ...inputStyle, opacity: 0.75 }} /></div>
            <div>
              <label style={labelStyle}>Gender</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Male', 'Female', 'Others'].map((gender) => (
                  <button key={gender} type="button" onClick={() => updateField('gender', gender)} style={{
                    height: '48px', flex: 1, borderRadius: '999px', border: '1px solid var(--color-border)',
                    background: form.gender === gender ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                    color: form.gender === gender ? 'white' : 'var(--color-muted)', cursor: 'pointer'
                  }}>{gender}</button>
                ))}
              </div>
            </div>
            <div><label style={labelStyle}>Language</label><input value={form.language} onChange={(e) => updateField('language', e.target.value)} style={inputStyle} /></div>
          </div>

          <h2 style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '12px', color: 'var(--color-text)', fontWeight: '700', marginBottom: '20px' }}>
            Address Information
          </h2>
          <label style={labelStyle}>Full Address</label>
          <textarea rows="3" value={form.address} onChange={(e) => updateField('address', e.target.value)} style={{ ...inputStyle, height: 'auto', padding: '14px', marginBottom: '18px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {['country', 'state', 'city'].map((field) => (
              <div key={field}><label style={labelStyle}>{field[0].toUpperCase() + field.slice(1)}</label><input value={form[field]} onChange={(e) => updateField(field, e.target.value)} style={inputStyle} /></div>
            ))}
          </div>
          <button type="submit" disabled={saving} style={{
            width: '100%', height: '52px', background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
            color: 'white', borderRadius: '10px', fontWeight: '600', fontSize: '16px', border: 'none', cursor: 'pointer', marginTop: '24px'
          }}>{saving ? 'Saving...' : 'Save Profile'}</button>
        </form>
      </main>
    </div>
  )
}

export default EditProfile
