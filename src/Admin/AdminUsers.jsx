import { motion } from 'framer-motion'
import { ShieldCheck, UserRound } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import { getStoredAdmin } from '../utils/adminStore'

const AdminUsers = () => {
  const admin = getStoredAdmin()
  const canManageUsers = true

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
        paddingTop: '64px'
      }}
    >
      <AdminSidebar />

      <main
        style={{
          flex: 1,
          marginLeft: '240px',
          padding: '32px',
          overflowY: 'auto'
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            color: 'var(--color-text)',
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '8px'
          }}
        >
          Users
        </motion.h1>
        <p
          style={{
            color: 'var(--color-muted)',
            fontSize: '14px',
            marginBottom: '32px'
          }}
        >
          Manage admin access and permissions for this local Musify workspace.
        </p>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(15, 15, 46, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 0 24px rgba(59, 108, 244, 0.3), 0 0 48px rgba(124, 58, 237, 0.15)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--color-border)',
              marginBottom: '20px'
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(59, 108, 244, 0.15)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UserRound size={24} />
            </div>
            <div>
              <h2
                style={{
                  color: 'var(--color-text)',
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '4px'
                }}
              >
                {admin.username}
              </h2>
              <p
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '14px'
                }}
              >
                {admin.email}
              </p>
            </div>
            <div
              style={{
                marginLeft: 'auto',
                color: canManageUsers ? '#4ade80' : '#f87171',
                background: canManageUsers ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: canManageUsers ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '999px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              {canManageUsers ? 'Manage Users' : 'Limited Access'}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '16px'
            }}
          >
            {admin.permissions.map((permission) => (
              <div
                key={permission}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
                {permission.replaceAll('_', ' ')}
              </div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  )
}

export default AdminUsers
