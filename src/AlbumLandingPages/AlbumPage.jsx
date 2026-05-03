import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SongCard from './SongCard'
import { db, isFirebaseReady } from '../backend/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { getPublicAdminAlbums } from '../utils/adminStore'

const AlbumPage = () => {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlbumData = async () => {
      setLoading(true)

      const localAlbum = (await getPublicAdminAlbums()).find((item) => item.id === id)

      if (localAlbum) {
        setAlbum(localAlbum)
        setSongs(localAlbum.songs || [])
        setLoading(false)
        return
      }

      if (!isFirebaseReady()) {
        setAlbum(null)
        setSongs([])
        setLoading(false)
        return
      }

      try {
        const albumDoc = await getDoc(doc(db, 'albums', id))

        if (albumDoc.exists()) {
          const albumData = { id: albumDoc.id, ...albumDoc.data() }
          setAlbum(albumData)

          const songsQuery = query(
            collection(db, 'songs'),
            where('albumId', '==', id)
          )
          const songsSnapshot = await getDocs(songsQuery)
          const songsData = songsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))

          setSongs(songsData)
        } else {
          setAlbum(null)
          setSongs([])
        }
      } catch (error) {
        console.error('Error fetching album data:', error)
        setAlbum(null)
        setSongs([])
      } finally {
        setLoading(false)
      }
    }

    fetchAlbumData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-4 border-t-transparent"
          style={{
            borderColor: 'var(--color-primary)',
            borderTopColor: 'transparent'
          }}
        />
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p style={{ color: 'var(--color-muted)' }}>Album not found</p>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '80px'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '40px',
            alignItems: 'flex-end',
            padding: '32px',
            marginBottom: '32px'
          }}
        >
          <img
            src={album.coverUrl}
            alt={album.title}
            style={{
              width: '220px',
              height: '220px',
              borderRadius: '16px',
              objectFit: 'cover',
              flexShrink: 0,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
          />
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '8px'
              }}
            >
              ALBUM
            </p>
            <h1
              style={{
                fontSize: '42px',
                fontWeight: '800',
                color: 'var(--color-text)',
                marginBottom: '8px',
                lineHeight: 1.1
              }}
            >
              {album.title}
            </h1>
            <div
              style={{
                color: 'var(--color-muted)',
                fontSize: '15px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <span>{album.artist}</span>
              <span>&bull;</span>
              <span>{album.year}</span>
              <span>&bull;</span>
              <span>{songs.length} songs</span>
            </div>
          </div>
        </motion.section>

        <div
          style={{
            padding: '0 32px 120px'
          }}
        >
          {songs.length > 0 ? (
            songs.map((song, index) => (
              <SongCard
                key={song.id}
                songData={song}
                trackNumber={index + 1}
                album={album}
              />
            ))
          ) : (
            <div
              style={{
                background: 'rgba(15, 15, 46, 0.6)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '24px',
                color: 'var(--color-muted)',
                textAlign: 'center'
              }}
            >
              No tracks added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AlbumPage
