import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../backend/firebase'

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!auth) {
      setStatus('denied')
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setStatus(user?.email === import.meta.env.VITE_ADMIN_EMAIL ? 'admin' : 'denied')
    })
    return () => unsubscribe()
  }, [])

  if (status === 'loading') 
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>Checking permissions...</div>
  if (status === 'denied') 
    return <Navigate to="/admin/login" replace />
  return children
}

export default AdminRoute
