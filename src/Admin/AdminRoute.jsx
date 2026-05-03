import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../backend/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { toast } from 'react-hot-toast'

const AdminRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null)
  const navigate = useNavigate()
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Not logged in
        navigate('/login')
        setIsAuthorized(false)
      } else if (user.email !== adminEmail) {
        // Logged in but not admin
        toast.error('Access denied. Admin only.')
        navigate('/')
        setIsAuthorized(false)
      } else {
        // Admin user
        setIsAuthorized(true)
      }
    })

    return () => unsubscribe()
  }, [navigate, adminEmail])

  if (isAuthorized === null) {
    return null // Loading state
  }

  return isAuthorized ? children : null
}

export default AdminRoute
