import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Disc, Music, Users } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import AdminSidebar from './AdminSidebar'
import { db } from '../backend/firebase'
import { getStoredAdmin, resolveMediaUrl } from '../utils/adminStore'

const AdminDashboard = () => {
  const [admin] = useState(() => getStoredAdmin())
  const [albums, setAlbums] = useState([])
  const [coverUrls, setCoverUrls] = useState({})

  useEffect(() => {
    const loadAlbums = async () => {
      const snapshot = await getDocs(collection(db, 'music_musify2'))
      setAlbums(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })))
    }

    loadAlbums()
  }, [])

  const stats = useMemo(() => ({
    totalAlbums: albums.length,
    totalSongs: albums.reduce((total, album) => total + (album.tracks?.length || 0), 0),
    totalUsers: 1
  }), [albums])

  const recentAlbums = useMemo(() => (
    [...albums]
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
      .slice(0, 5)
  ), [albums])

  useEffect(() => {
    let isMounted = true

    const loadCoverUrls = async () => {
      const entries = await Promise.all(recentAlbums.map(async (album) => [
        album.id,
        await resolveMediaUrl(album.coverImageUrl)
      ]))

      if (isMounted) {
        setCoverUrls(Object.fromEntries(entries))
      }
    }

    loadCoverUrls()

    return () => {
      isMounted = false
    }
  }, [recentAlbums])

  const statCards = [
    { label: 'Total Albums', value: stats.totalAlbums, icon: Disc },
    { label: 'Total Tracks', value: stats.totalSongs, icon: Music },
    { label: 'Admins', value: stats.totalUsers, icon: Users }
  ]

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
          Dashboard
        </motion.h1>
        <p
          style={{
            color: 'var(--color-muted)',
            fontSize: '14px',
            marginBottom: '32px'
          }}
        >
          Signed in as {admin.username} with {admin.role} access.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '32px'
          }}
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: 'rgba(15, 15, 46, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  boxShadow: '0 0 24px rgba(59, 108, 244, 0.3), 0 0 48px rgba(124, 58, 237, 0.15)',
                  padding: '28px'
                }}
              >
                <Icon size={24} style={{ color: 'var(--color-primary)', marginBottom: '18px' }} />
                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    color: 'var(--color-primary)',
                    lineHeight: 1
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-muted)',
                    marginTop: '8px',
                    fontWeight: '500'
                  }}
                >
                  {stat.label}
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'rgba(15, 15, 46, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '24px'
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--color-text)',
              marginBottom: '16px'
            }}
          >
            Recent Albums
          </h2>
          {recentAlbums.length > 0 ? (
            <div>
              {recentAlbums.map((album) => (
                <div
                  key={album.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-border)'
                  }}
                >
                  <img
                    src={coverUrls[album.id]}
                    alt={album.title}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}
                  />
                  <div>
                    <div
                      style={{
                        color: 'var(--color-text)',
                        fontWeight: '500'
                      }}
                    >
                      {album.title}
                    </div>
                    <div
                      style={{
                        color: 'var(--color-muted)',
                        fontSize: '13px'
                      }}
                    >
                      {album.artist} - {album.year} - {album.tracks?.length || 0} tracks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-muted)' }}>
              No albums found. Create your first album from Manage Albums.
            </p>
          )}
        </motion.section>
      </main>
    </div>
  )
}

export default AdminDashboard
