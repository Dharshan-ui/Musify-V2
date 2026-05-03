import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPublicAdminAlbums } from '../utils/adminStore'
import { isMusicStoreReady, listAlbums } from '../utils/musicStore'

const Home = () => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true)

      if (isMusicStoreReady()) {
        try {
          setAlbums(await listAlbums(8))
          setLoading(false)
          return
        } catch (error) {
          console.error('Error fetching live albums:', error)
        }
      }

      const localAlbums = await getPublicAdminAlbums()
      setAlbums(localAlbums)
      setLoading(false)
    }

    fetchAlbums()
  }, [])

  return (
    <div className="min-h-screen">
      <section
        style={{
          minHeight: '45vh',
          paddingTop: '80px',
          paddingBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          paddingLeft: '32px',
          paddingRight: '32px'
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Your Music. Your World.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl max-w-2xl"
          style={{ color: 'var(--color-muted)' }}
        >
          Discover, stream, and enjoy your favorite music with Musify
        </motion.p>
      </section>

      <section
        id="albums"
        style={{
          paddingTop: 0,
          paddingBottom: '48px',
          paddingLeft: '32px',
          paddingRight: '32px'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'var(--color-text)',
              marginBottom: '24px',
              paddingLeft: 0
            }}
          >
            Featured Albums
          </h2>

          {!loading && albums.length === 0 ? (
            <div
              style={{
                background: 'rgba(15, 15, 46, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '28px',
                color: 'var(--color-muted)',
                textAlign: 'center'
              }}
            >
              No albums yet. Create one from the admin Manage Albums page.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px'
              }}
            >
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <motion.div
                    key={index}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                    style={{
                      background: 'rgba(15, 15, 46, 0.6)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '16px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        background: 'rgba(59, 108, 244, 0.1)'
                      }}
                    />
                    <div style={{ padding: '16px' }}>
                      <div style={{ height: '18px', background: 'rgba(59, 108, 244, 0.1)', borderRadius: '6px', marginBottom: '8px' }} />
                      <div style={{ height: '14px', background: 'rgba(59, 108, 244, 0.1)', borderRadius: '6px' }} />
                    </div>
                  </motion.div>
                ))
              ) : (
                albums.map((album, index) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link to={`/album/${album.id}`} style={{ textDecoration: 'none' }}>
                      <div
                        style={{
                          background: 'rgba(15, 15, 46, 0.6)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 200ms'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 0 24px rgba(59, 108, 244, 0.3), 0 0 48px rgba(124, 58, 237, 0.15)'
                          e.currentTarget.style.borderColor = 'var(--color-primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.borderColor = 'var(--color-border)'
                        }}
                      >
                        <img
                          src={album.coverUrl}
                          alt={album.title}
                          style={{
                            width: '100%',
                            aspectRatio: '1 / 1',
                            objectFit: 'cover'
                          }}
                        />
                        <div style={{ padding: '16px' }}>
                          <h3
                            style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: 'var(--color-text)',
                              marginBottom: '4px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {album.title}
                          </h3>
                          <p
                            style={{
                              fontSize: '13px',
                              color: 'var(--color-muted)',
                              marginBottom: '6px'
                            }}
                          >
                            {album.artist}
                          </p>
                          <p
                            style={{
                              fontSize: '12px',
                              color: 'var(--color-primary)',
                              fontWeight: '500'
                            }}
                          >
                            {album.songCount ?? album.songs?.length ?? 0} songs
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
