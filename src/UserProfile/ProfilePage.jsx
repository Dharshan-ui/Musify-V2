import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../backend/firebase'
import ProfileSidebar from './ProfileSidebar'

const fields = [
  ['Full Name', 'fullName'],
  ['Date of Birth', 'dateOfBirth'],
  ['Age', 'age'],
  ['Gender', 'gender'],
  ['Language', 'language'],
  ['Address', 'address'],
  ['Country', 'country'],
  ['State', 'state'],
  ['City', 'city']
]

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'Not set'
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age -= 1
  return Number.isFinite(age) ? age : 'Not set'
}

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({})

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (!currentUser) return

      const snapshot = await getDoc(doc(db, 'userProfiles', currentUser.uid))
      setProfile(snapshot.exists() ? snapshot.data() : {})
    })

    return () => unsubscribe()
  }, [])

  const displayName = profile.fullName || user?.displayName || user?.email || 'Musify User'
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  const getValue = (key) => {
    if (key === 'age') return calculateAge(profile.dateOfBirth)
    return profile[key] || 'Not set'
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '64px' }}>
      <ProfileSidebar />
      <main className="md:ml-[240px]" style={{ padding: '32px' }}>
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div
            style={{
              width: '100%',
              height: '160px',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%)',
              borderRadius: '16px 16px 0 0'
            }}
          />
          <div
            style={{
              background: 'rgba(15, 15, 46, 0.8)',
              borderRadius: '0 0 16px 16px',
              padding: '0 32px 32px',
              border: '1px solid var(--color-border)',
              marginBottom: '24px'
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                marginTop: '-40px',
                background: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: '700',
                color: 'white',
                border: '4px solid var(--color-bg)',
                borderRadius: '50%',
                overflow: 'hidden'
              }}
            >
              {user?.photoURL ? <img src={user.photoURL} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-text)', marginTop: '12px' }}>
              {displayName}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>{user?.email || 'Not signed in'}</p>
          </div>
        </motion.section>

        <section
          className="glass-card"
          style={{
            background: 'rgba(15, 15, 46, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border)',
            padding: '28px',
            borderRadius: '16px'
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '20px' }}>
            Profile Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {fields.map(([label, key]) => (
              <div key={key} style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                  {label}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text)' }}>{getValue(key)}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ProfilePage
