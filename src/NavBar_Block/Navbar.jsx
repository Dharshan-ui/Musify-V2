import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../backend/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import Button from '../components/Button'

const Navbar = () => {
  const [user, setUser] = useState(null)

  const handleSignOut = async () => {
    if (!auth) return

    try {
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  useEffect(() => {
    if (!auth) {
      setUser(null)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10, 10, 26, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        height: '64px'
      }}
    >
      <div className="flex items-center justify-between px-8 h-full">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
        >
          <img
            src="/logo.png"
            alt="Musify"
            style={{
              height: '56px',
              maxWidth: '100px',
              width: 'auto',
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
        </Link>

        {/* Center Navigation */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text"
            style={{
              color: 'var(--color-muted)',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--color-text)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--color-muted)'}
          >
            Home
          </Link>
          <Link
            to="/#albums"
            className="text"
            style={{
              color: 'var(--color-muted)',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--color-text)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--color-muted)'}
          >
            Albums
          </Link>
        </div>

        {/* Right side */}
        {user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="text"
              style={{
                color: 'var(--color-muted)',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--color-text)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--color-muted)'}
            >
              Admin
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3"
              style={{
                color: 'var(--color-text)',
                textDecoration: 'none'
              }}
            >
              <div
                className="rounded-full flex items-center justify-center text-sm font-medium overflow-hidden"
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'var(--color-secondary)',
                  color: 'white'
                }}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : getUserInitials()}
              </div>

              <span className="text-sm">
                {user.displayName || user.email}
              </span>
            </Link>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
