import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { auth } from '../backend/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import toast from 'react-hot-toast'
import Button from '../components/Button'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!auth) {
      toast.error('Firebase is not configured. Add Firebase environment variables in Vercel.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 pt-16"
      style={{
        background: 'transparent'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
        style={{ width: '420px' }}
      >
        <div
          className="glass-card"
          style={{
            padding: '40px',
            background: 'rgba(15, 15, 46, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            boxShadow: '0 0 40px rgba(59, 108, 244, 0.15)'
          }}
        >
          <h1
            className="font-bold mb-1"
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'var(--color-text)',
              marginBottom: '4px'
            }}
          >
            Create Account
          </h1>
          <p
            className="mb-7"
            style={{
              color: 'var(--color-muted)',
              fontSize: '14px',
              marginBottom: '28px'
            }}
          >
            Join Musify and start listening
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block font-medium mb-2"
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '6px'
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg focus:outline-none transition-all"
                style={{
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text)',
                  padding: '0 14px',
                  width: '100%'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)'
                }}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                className="block font-medium mb-2"
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '6px'
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg focus:outline-none transition-all"
                style={{
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text)',
                  padding: '0 14px',
                  width: '100%'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)'
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                className="block font-medium mb-2"
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '6px'
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg focus:outline-none transition-all"
                  style={{
                    height: '48px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                    padding: '0 42px 0 14px',
                    width: '100%'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)'
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
            </div>

            <div>
              <label
                className="block font-medium mb-2"
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '6px'
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-lg focus:outline-none transition-all"
                  style={{
                    height: '48px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                    padding: '0 42px 0 14px',
                    width: '100%'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)'
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
              style={{
                height: '48px',
                background: 'var(--color-primary)',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '15px'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1'
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p
            className="mt-6 text-center text-sm"
            style={{
              color: 'var(--color-muted)',
              fontSize: '14px'
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium"
              style={{
                color: 'var(--color-primary)'
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
