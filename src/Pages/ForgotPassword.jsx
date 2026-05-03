import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { auth } from '../backend/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      console.log('Sending password reset email to:', email)
      console.log('Firebase auth:', auth)

      await sendPasswordResetEmail(auth, email)
      console.log('Password reset email sent successfully')
      setSuccess(true)
      toast.success('Reset email sent! Check your inbox.')
    } catch (error) {
      console.error('Password reset error:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      setErrorMessage(error.message || 'Failed to send reset email')
      toast.error(error.message || 'Failed to send reset email')
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
        padding: '80px 16px 32px'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%', maxWidth: '440px' }}
      >
        <div
          style={{
            width: '440px',
            maxWidth: '100%',
            padding: '48px',
            borderRadius: '20px',
            background: 'rgba(15, 15, 46, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 0 40px rgba(59, 108, 244, 0.15)'
          }}
        >
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'var(--color-text)',
              marginBottom: '8px'
            }}
          >
            Reset Password
          </h1>
          <p
            style={{
              color: 'var(--color-muted)',
              fontSize: '14px',
              marginBottom: '32px'
            }}
          >
            Enter your email to receive a reset link
          </p>

          {success && (
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '14px'
              }}
            >
              Reset email sent! Check your inbox.
            </div>
          )}

          {errorMessage && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '14px'
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="reset-email"
              style={{
                fontSize: '13px',
                color: 'var(--color-muted)',
                fontWeight: '500',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                height: '52px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text)',
                padding: '0 16px',
                fontSize: '15px',
                marginBottom: '24px',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)'
              }}
              placeholder="you@example.com"
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '52px',
                background: 'var(--color-primary)',
                color: 'white',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '15px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '20px',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.opacity = '1'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p
              style={{
                textAlign: 'center',
                fontSize: '14px',
                color: 'var(--color-muted)'
              }}
            >
              Remember your password?{' '}
              <Link
                to="/login"
                style={{
                  color: 'var(--color-primary)',
                  fontWeight: '500'
                }}
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
