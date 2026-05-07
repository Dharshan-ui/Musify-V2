import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Camera, Lock, Settings, User, UserPlus } from 'lucide-react'

const links = [
  { label: 'My Account', path: '/profile', icon: User },
  { label: 'Add Profile', path: '/profile/edit', icon: UserPlus },
  { label: 'Change Password', path: '/profile/change-password', icon: Lock },
  { label: 'Upload Photo', path: '/profile/upload-photo', icon: Camera },
  { label: 'Settings', path: '/profile/settings', icon: Settings }
]

const ProfileSidebar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <>
      {isMobile && (
        <nav style={{ display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap', gap: '8px', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: 'rgba(10, 10, 26, 0.95)' }}>
          {links.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.path} to={item.path} end={item.path === '/profile'}
                style={({ isActive }) => ({ display: 'flex', alignItems: 'center', flexShrink: 0, gap: '8px', padding: '10px 14px', borderRadius: '999px', color: isActive ? 'white' : 'var(--color-muted)', background: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)', fontSize: '14px', fontWeight: '500', textDecoration: 'none' })}>
                <Icon size={17} />{item.label}
              </NavLink>
            )
          })}
        </nav>
      )}
      {!isMobile && (
        <aside style={{ position: 'fixed', left: 0, top: '64px', width: '240px', height: 'calc(100vh - 64px)', background: 'rgba(10, 10, 26, 0.95)', backdropFilter: 'blur(12px)', borderRight: '1px solid var(--color-border)', padding: '24px 0', zIndex: 40 }}>
          <nav>
            {links.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.path} to={item.path} end={item.path === '/profile'}
                  style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: isActive ? 'var(--color-primary)' : 'var(--color-muted)', background: isActive ? 'rgba(59,108,244,0.1)' : 'transparent', fontSize: '14px', fontWeight: '500', textDecoration: 'none' })}>
                  <Icon size={18} />{item.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>
      )}
    </>
  )
}

export default ProfileSidebar
