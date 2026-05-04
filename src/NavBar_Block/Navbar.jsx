import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../backend/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { Menu, X } from 'lucide-react'
import Button from '../components/Button'
import { isAdmin } from '../utils/adminStore'

const Navbar = () => {
  const [user, setUser] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
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
      <div className="flex items-center justify-between px-4 md:px-8 h-full">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={closeMobileMenu}
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
        <div className="hidden md:flex items-center gap-8">
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
          <div className="hidden md:flex items-center gap-4">
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
          <div className="hidden md:flex items-center gap-4">
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

        <button
          type="button"
          className="md:hidden flex items-center justify-center"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation-menu"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            background: 'rgba(255, 255, 255, 0.04)',
            color: 'var(--color-text)',
            cursor: 'pointer'
          }}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="md:hidden fixed left-0 right-0 top-16 px-4 py-4"
          style={{
            background: 'rgba(10, 10, 26, 0.96)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="text"
              onClick={closeMobileMenu}
              style={{
                color: 'var(--color-text)',
                fontWeight: '600',
                padding: '12px 0'
              }}
            >
              Home
            </Link>
            <Link
              to="/#albums"
              className="text"
              onClick={closeMobileMenu}
              style={{
                color: 'var(--color-text)',
                fontWeight: '600',
                padding: '12px 0'
              }}
            >
              Albums
            </Link>

            {isAdmin() && (
              <>
                <Link
                  to="/admin"
                  className="text"
                  onClick={closeMobileMenu}
                  style={{
                    color: 'var(--color-text)',
                    fontWeight: '600',
                    padding: '12px 0'
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/upload-song"
                  className="text"
                  onClick={closeMobileMenu}
                  style={{
                    color: 'var(--color-text)',
                    fontWeight: '600',
                    padding: '12px 0'
                  }}
                >
                  Upload Song
                </Link>
                <Link
                  to="/admin/albums"
                  className="text"
                  onClick={closeMobileMenu}
                  style={{
                    color: 'var(--color-text)',
                    fontWeight: '600',
                    padding: '12px 0'
                  }}
                >
                  Manage Albums
                </Link>
                <Link
                  to="/admin/users"
                  className="text"
                  onClick={closeMobileMenu}
                  style={{
                    color: 'var(--color-text)',
                    fontWeight: '600',
                    padding: '12px 0'
                  }}
                >
                  Users
                </Link>
              </>
            )}

            {user ? (
              <>
                <Link
                  to="/admin"
                  className="text"
                  onClick={closeMobileMenu}
                  style={{
                    color: 'var(--color-text)',
                    fontWeight: '600',
                    padding: '12px 0'
                  }}
                >
                  Admin
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-3"
                  onClick={closeMobileMenu}
                  style={{
                    color: 'var(--color-text)',
                    textDecoration: 'none',
                    padding: '12px 0'
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMobileMenu}>
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
