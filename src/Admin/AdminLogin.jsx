import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../backend/firebase'

const fieldStyle = {
  height: '52px',
  width: '100%',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text)',
  padding: '0 16px',
  fontSize: '15px',
  outline: 'none'
}

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, identifier.trim(), password)
      await new Promise((resolve) => {
        const unsub = onAuthStateChanged(auth, (user) => {
          if (user) { unsub(); resolve(); }
        })
      })
      toast.success('Admin signed in')
      navigate('/admin')
    } catch (error) {
      const errorMessage = error.code === 'auth/user-not-found'
        ? 'Admin account not found'
        : error.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : error.code === 'auth/invalid-email'
        ? 'Invalid email format'
        : error.message || 'Unable to sign in'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '96px 16px 32px'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '44px',
          background: 'rgba(15, 15, 46, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
          boxShadow: '0 0 40px rgba(59, 108, 244, 0.15)'
        }}
      >
        <h1
          style={{
            color: 'var(--color-text)',
            fontSize: '30px',
            fontWeight: '700',
            marginBottom: '8px'
          }}
        >
          Admin Login
        </h1>
        <p
          style={{
            color: 'var(--color-muted)',
            fontSize: '14px',
            marginBottom: '28px'
          }}
        >
          Sign in with an admin account to manage albums and tracks.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="admin-identifier"
            style={{
              display: 'block',
              color: 'var(--color-muted)',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '8px'
            }}
          >
            Email or Username
          </label>
          <input
            id="admin-identifier"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
            style={{ ...fieldStyle, marginBottom: '20px' }}
            onFocus={(event) => {
              event.target.style.borderColor = 'var(--color-primary)'
            }}
            onBlur={(event) => {
              event.target.style.borderColor = 'var(--color-border)'
            }}
          />

          <label
            htmlFor="admin-password"
            style={{
              display: 'block',
              color: 'var(--color-muted)',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '8px'
            }}
          >
            Password
          </label>
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{
                ...fieldStyle,
                paddingRight: '42px',
                marginBottom: '0'
              }}
              onFocus={(event) => {
                event.target.style.borderColor = 'var(--color-primary)'
              }}
              onBlur={(event) => {
                event.target.style.borderColor = 'var(--color-border)'
              }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--color-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-text)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-muted)'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="text-right" style={{ marginBottom: '24px' }}>
            <Link
              to="/forgot-password"
              style={{
                color: 'var(--color-primary)',
                fontSize: '13px',
                textDecoration: 'none'
              }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '52px',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '18px'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p
          style={{
            color: 'var(--color-muted)',
            fontSize: '13px',
            lineHeight: 1.6
          }}
        >
          Sign in with your Firebase admin account to access the admin panel.
        </p>
      </motion.div>
    </div>
  )
}

export default AdminLogin
