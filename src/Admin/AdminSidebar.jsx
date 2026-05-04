import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Music, Disc, Users, LogOut } from 'lucide-react'
import { logoutAdmin } from '../utils/adminStore'

const AdminSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Upload Song', path: '/admin/upload-song', icon: Music },
    { name: 'Manage Albums', path: '/admin/albums', icon: Disc },
    { name: 'Users', path: '/admin/users', icon: Users }
  ]

  const isActive = (path) => location.pathname === path

  const handleSignOut = () => {
    logoutAdmin()
    navigate('/admin/login')
  }

  return (
    <aside
      className="hidden md:flex"
      style={{
        position: 'fixed',
        left: 0,
        top: '64px',
        width: '240px',
        height: 'calc(100vh - 64px)',
        minHeight: 'calc(100vh - 64px)',
        background: 'rgba(10, 10, 26, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid var(--color-border)',
        flexDirection: 'column',
        padding: '24px 0',
        zIndex: 40
      }}
    >
      <div
        style={{
          padding: '0 20px 24px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '16px'
        }}
      >
        <h1
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--color-muted)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Admin Panel
        </h1>
      </div>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.name}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: active ? '12px 20px 12px 17px' : '12px 20px',
                color: active ? 'var(--color-primary)' : 'var(--color-muted)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 150ms',
                textDecoration: 'none',
                background: active ? 'rgba(59, 108, 244, 0.15)' : 'transparent',
                borderLeft: active ? '3px solid var(--color-primary)' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(59, 108, 244, 0.1)'
                  e.currentTarget.style.color = 'var(--color-text)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-muted)'
                }
              }}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border)'
        }}
      >
        <button
          type="button"
          onClick={handleSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f87171',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '8px 0'
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
