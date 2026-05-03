import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { getDoc, doc } from 'firebase/firestore'
import { auth, db } from '../backend/firebase'

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('denied')
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const role = userDoc.data()?.role
        setStatus(role === 'admin' ? 'admin' : 'denied')
      } catch (error) {
        console.error('Error checking admin role:', error)
        setStatus('denied')
      }
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