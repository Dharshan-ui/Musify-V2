import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from './AdminSidebar'
import {
  createId,
  deleteMediaUrl,
  getStoredAdmin,
  resolveMediaUrl,
  saveStoredAdmin
} from '../utils/adminStore'
import { uploadToCloudinary } from '../utils/cloudinary'

const inputStyle = {
  height: '52px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text)',
  padding: '0 16px',
  width: '100%',
  marginBottom: '20px',
  outline: 'none'
}

const labelStyle = {
  fontSize: '13px',
  color: 'var(--color-muted)',
  fontWeight: '500',
  display: 'block',
  marginBottom: '6px'
}

const ManageAlbums = () => {
  const [admin, setAdmin] = useState(() => getStoredAdmin())
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    year: ''
  })
  const [coverFile, setCoverFile] = useState(null)
  const [savingAlbum, setSavingAlbum] = useState(false)
  const [activeTrackAlbumId, setActiveTrackAlbumId] = useState('')
  const [trackForms, setTrackForms] = useState({})
  const [savingTrackId, setSavingTrackId] = useState('')
  const [coverUrls, setCoverUrls] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editingAlbumId, setEditingAlbumId] = useState('')
  const [albumEditForms, setAlbumEditForms] = useState({})
  const [editingTrackKey, setEditingTrackKey] = useState('')
  const [trackEditForms, setTrackEditForms] = useState({})
  const [savingEditId, setSavingEditId] = useState('')

  const albums = admin.albums || []

  useEffect(() => {
    let isMounted = true

    const loadCoverUrls = async () => {
      const entries = await Promise.all(albums.map(async (album) => [
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
  }, [albums])

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    })
  }

  const handleFocus = (event) => {
    event.target.style.borderColor = 'var(--color-primary)'
  }

  const handleBlur = (event) => {
    event.target.style.borderColor = 'var(--color-border)'
  }

  const persistAdmin = (nextAdmin) => {
    const savedAdmin = saveStoredAdmin(nextAdmin)
    setAdmin(savedAdmin)
  }

  const startEditAlbum = (album) => {
    setEditingAlbumId(album.id)
    setAlbumEditForms({
      ...albumEditForms,
      [album.id]: {
        title: album.title,
        artist: album.artist,
        year: album.year,
        coverFile: null
      }
    })
  }

  const handleAlbumEditChange = (albumId, field, value) => {
    setAlbumEditForms({
      ...albumEditForms,
      [albumId]: {
        ...albumEditForms[albumId],
        [field]: value
      }
    })
  }

  const handleUpdateAlbum = async (event, albumId) => {
    event.preventDefault()

    if (!hasAdminPermission('create_album')) {
      toast.error('You do not have permission to edit albums')
      return
    }

    const album = albums.find((item) => item.id === albumId)
    const editForm = albumEditForms[albumId]

    if (!album || !editForm) return

    setSavingEditId(`album-${albumId}`)

    try {
      let coverImageUrl = album.coverImageUrl
      let coverPublicId = album.coverPublicId

      if (editForm.coverFile) {
        const coverUpload = await uploadToCloudinary(editForm.coverFile, {
          folder: 'musify/album-covers',
          tags: ['musify', 'album-cover', editForm.artist],
          context: {
            type: 'album_cover',
            title: editForm.title,
            artist: editForm.artist,
            year: editForm.year
          }
        })
        await deleteMediaUrl(album.coverImageUrl)
        coverImageUrl = coverUpload.secureUrl
        coverPublicId = coverUpload.publicId
      }

      persistAdmin({
        ...admin,
        albums: albums.map((item) => (
          item.id === albumId
            ? {
                ...item,
                title: editForm.title,
                artist: editForm.artist,
                year: Number(editForm.year),
                coverImageUrl,
                coverPublicId
              }
            : item
        ))
      })
      setEditingAlbumId('')
      toast.success('Album updated')
    } catch (error) {
      console.error('Error updating album:', error)
      toast.error('Failed to update album')
    } finally {
      setSavingEditId('')
    }
  }

  const getTrackKey = (albumId, trackId) => `${albumId}:${trackId}`

  const startEditTrack = (albumId, track) => {
    const trackKey = getTrackKey(albumId, track.id)
    setEditingTrackKey(trackKey)
    setTrackEditForms({
      ...trackEditForms,
      [trackKey]: {
        title: track.title,
        duration: track.duration,
        genre: track.genre,
        audioFile: null,
        songCardFile: null
      }
    })
  }

  const handleTrackEditChange = (trackKey, field, value) => {
    setTrackEditForms({
      ...trackEditForms,
      [trackKey]: {
        ...trackEditForms[trackKey],
        [field]: value
      }
    })
  }

  const handleUpdateTrack = async (event, albumId, trackId) => {
    event.preventDefault()

    if (!hasAdminPermission('publish_content')) {
      toast.error('You do not have permission to edit tracks')
      return
    }

    const album = albums.find((item) => item.id === albumId)
    const track = album?.tracks?.find((item) => item.id === trackId)
    const trackKey = getTrackKey(albumId, trackId)
    const editForm = trackEditForms[trackKey]

    if (!album || !track || !editForm) return

    setSavingEditId(`track-${trackId}`)

    try {
      let audioFileUrl = track.audioFileUrl
      let audioPublicId = track.audioPublicId
      let songCardImageUrl = track.songCardImageUrl
      let songCardPublicId = track.songCardPublicId

      if (editForm.songCardFile) {
        const songCardUpload = await uploadToCloudinary(editForm.songCardFile, {
          folder: 'musify/song-cards',
          tags: ['musify', 'song-card', editForm.genre],
          context: {
            type: 'song_card',
            title: editForm.title,
            albumId,
            albumTitle: album.title,
            artist: album.artist,
            genre: editForm.genre
          }
        })
        await deleteMediaUrl(track.songCardImageUrl)
        songCardImageUrl = songCardUpload.secureUrl
        songCardPublicId = songCardUpload.publicId
      }

      if (editForm.audioFile) {
        const audioUpload = await uploadToCloudinary(editForm.audioFile, {
          folder: 'musify/audio',
          tags: ['musify', 'audio', editForm.genre],
          context: {
            type: 'track_audio',
            title: editForm.title,
            albumId,
            albumTitle: album.title,
            artist: album.artist,
            duration: editForm.duration,
            genre: editForm.genre
          }
        })
        await deleteMediaUrl(track.audioFileUrl)
        audioFileUrl = audioUpload.secureUrl
        audioPublicId = audioUpload.publicId
      }

      persistAdmin({
        ...admin,
        albums: albums.map((item) => (
          item.id === albumId
            ? {
                ...item,
                tracks: (item.tracks || []).map((song) => (
                  song.id === trackId
                    ? {
                        ...song,
                        title: editForm.title,
                        duration: editForm.duration,
                        genre: editForm.genre,
                        audioFileUrl,
                        audioPublicId,
                        songCardImageUrl,
                        songCardPublicId
                      }
                    : song
                ))
              }
            : item
        ))
      })
      setEditingTrackKey('')
      toast.success('Track updated')
    } catch (error) {
      console.error('Error updating track:', error)
      toast.error('Failed to update track')
    } finally {
      setSavingEditId('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!hasAdminPermission('create_album')) {
      toast.error('You do not have permission to create albums')
      return
    }

    if (!coverFile) {
      toast.error('Please select a cover image')
      return
    }

    setSavingAlbum(true)

    try {
      const coverUpload = await uploadToCloudinary(coverFile, {
        folder: 'musify/album-covers',
        tags: ['musify', 'album-cover', formData.artist],
        context: {
          type: 'album_cover',
          title: formData.title,
          artist: formData.artist,
          year: formData.year
        }
      })
      const newAlbum = {
        id: createId('album'),
        title: formData.title,
        artist: formData.artist,
        year: Number(formData.year),
        coverImageUrl: coverUpload.secureUrl,
        coverPublicId: coverUpload.publicId,
        tracks: [],
        createdAt: new Date().toISOString()
      }

      persistAdmin({
        ...admin,
        albums: [newAlbum, ...albums]
      })
      setFormData({ title: '', artist: '', year: '' })
      setCoverFile(null)
      toast.success('Album created successfully')
    } catch (error) {
      console.error('Error creating album:', error)
      toast.error('Failed to create album')
    } finally {
      setSavingAlbum(false)
    }
  }

  const deleteAlbum = async (albumId) => {
    if (!hasAdminPermission('delete_album')) {
      toast.error('You do not have permission to delete albums')
      return
    }

    const albumToDelete = albums.find((album) => album.id === albumId)

    if (albumToDelete) {
      await deleteMediaUrl(albumToDelete.coverImageUrl)
      await Promise.all((albumToDelete.tracks || []).flatMap((track) => [
        deleteMediaUrl(track.audioFileUrl),
        deleteMediaUrl(track.songCardImageUrl)
      ]))
    }

    persistAdmin({
      ...admin,
      albums: albums.filter((album) => album.id !== albumId)
    })
    toast.success('Album deleted')
  }

  const deleteTrack = async (albumId, trackId) => {
    if (!hasAdminPermission('delete_album')) {
      toast.error('You do not have permission to delete tracks')
      return
    }

    const album = albums.find((item) => item.id === albumId)
    const track = album?.tracks?.find((item) => item.id === trackId)

    if (track) {
      await deleteMediaUrl(track.audioFileUrl)
      await deleteMediaUrl(track.songCardImageUrl)
    }

    persistAdmin({
      ...admin,
      albums: albums.map((item) => (
        item.id === albumId
          ? { ...item, tracks: (item.tracks || []).filter((song) => song.id !== trackId) }
          : item
      ))
    })
    toast.success('Track deleted')
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return

    if (confirmDelete.type === 'album') {
      await deleteAlbum(confirmDelete.albumId)
    }

    if (confirmDelete.type === 'track') {
      await deleteTrack(confirmDelete.albumId, confirmDelete.trackId)
    }

    setConfirmDelete(null)
  }

  const handleTrackChange = (albumId, field, value) => {
    setTrackForms({
      ...trackForms,
      [albumId]: {
        title: '',
        duration: '',
        genre: '',
        audioFile: null,
        songCardFile: null,
        ...trackForms[albumId],
        [field]: value
      }
    })
  }

  const handleAddTrack = async (event, albumId) => {
    event.preventDefault()

    if (!hasAdminPermission('publish_content')) {
      toast.error('You do not have permission to publish tracks')
      return
    }

    const trackForm = trackForms[albumId] || {}

    if (!trackForm.audioFile) {
      toast.error('Please select an audio file')
      return
    }

    if (!trackForm.songCardFile) {
      toast.error('Please select a song card image')
      return
    }

    setSavingTrackId(albumId)

    try {
      const album = albums.find((item) => item.id === albumId)
      const songCardUpload = await uploadToCloudinary(trackForm.songCardFile, {
        folder: 'musify/song-cards',
        tags: ['musify', 'song-card', trackForm.genre],
        context: {
          type: 'song_card',
          title: trackForm.title,
          albumId,
          albumTitle: album?.title,
          artist: album?.artist,
          genre: trackForm.genre
        }
      })
      const audioUpload = await uploadToCloudinary(trackForm.audioFile, {
        folder: 'musify/audio',
        tags: ['musify', 'audio', trackForm.genre],
        context: {
          type: 'track_audio',
          title: trackForm.title,
          albumId,
          albumTitle: album?.title,
          artist: album?.artist,
          duration: trackForm.duration,
          genre: trackForm.genre
        }
      })
      const newTrack = {
        id: createId('track'),
        title: trackForm.title,
        duration: trackForm.duration,
        audioFileUrl: audioUpload.secureUrl,
        audioPublicId: audioUpload.publicId,
        songCardImageUrl: songCardUpload.secureUrl,
        songCardPublicId: songCardUpload.publicId,
        genre: trackForm.genre
      }

      persistAdmin({
        ...admin,
        albums: albums.map((album) => (
          album.id === albumId
            ? { ...album, tracks: [...(album.tracks || []), newTrack] }
            : album
        ))
      })
      setTrackForms({
        ...trackForms,
        [albumId]: {
          title: '',
          duration: '',
          genre: '',
          audioFile: null,
          songCardFile: null
        }
      })
      toast.success('Track added')
    } catch (error) {
      console.error('Error adding track:', error)
      toast.error('Failed to add track')
    } finally {
      setSavingTrackId('')
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        paddingTop: '64px'
      }}
    >
      <AdminSidebar />

      <main
        style={{
          flex: 1,
          marginLeft: '240px',
          padding: '32px'
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'flex-start'
          }}
        >
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(15, 15, 46, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '32px',
              width: '100%',
              maxWidth: '480px'
            }}
          >
            <h1
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: 'var(--color-text)',
                marginBottom: '20px'
              }}
            >
              Create New Album
            </h1>

            <form onSubmit={handleSubmit}>
              <label htmlFor="album-title" style={labelStyle}>
                Album Title
              </label>
              <input
                id="album-title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Enter album title"
              />

              <label htmlFor="album-artist" style={labelStyle}>
                Artist Name
              </label>
              <input
                id="album-artist"
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                required
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Enter artist name"
              />

              <label htmlFor="album-year" style={labelStyle}>
                Year
              </label>
              <input
                id="album-year"
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                min="1900"
                max="2099"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="2024"
              />

              <label htmlFor="album-cover-input" style={labelStyle}>
                Cover Image
              </label>
              <input
                id="album-cover-input"
                type="file"
                accept="image/*"
                onChange={(event) => setCoverFile(event.target.files[0] || null)}
                style={{
                  ...inputStyle,
                  height: 'auto',
                  padding: '14px 16px',
                  cursor: 'pointer'
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />

              <button
                type="submit"
                disabled={savingAlbum}
                style={{
                  width: '100%',
                  height: '48px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: savingAlbum ? 'not-allowed' : 'pointer',
                  opacity: savingAlbum ? 0.7 : 1
                }}
              >
                {savingAlbum ? 'Saving album...' : 'Create Album'}
              </button>
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'rgba(15, 15, 46, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '24px',
              flex: 1
            }}
          >
            <h2
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: 'var(--color-text)',
                marginBottom: '16px'
              }}
            >
              Your Albums
            </h2>

            {albums.length > 0 ? (
              <div>
                {albums.map((album) => {
                  const trackForm = trackForms[album.id] || {}
                  const isTrackFormOpen = activeTrackAlbumId === album.id

                  return (
                    <div
                      key={album.id}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        borderBottom: '1px solid var(--color-border)'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px'
                        }}
                      >
                        <img
                          src={coverUrls[album.id]}
                          alt={album.title}
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '8px',
                            objectFit: 'cover'
                          }}
                        />
                        <div>
                          <h3
                            style={{
                              color: 'var(--color-text)',
                              fontWeight: '500'
                            }}
                          >
                            {album.title}
                          </h3>
                          <p
                            style={{
                              color: 'var(--color-muted)',
                              fontSize: '13px'
                            }}
                          >
                            {album.artist} - {album.year} - {album.tracks?.length || 0} tracks
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTrackAlbumId(isTrackFormOpen ? '' : album.id)}
                          style={{
                            marginLeft: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(59, 108, 244, 0.15)',
                            color: 'var(--color-primary)',
                            border: '1px solid rgba(59, 108, 244, 0.3)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={14} />
                          Track
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditAlbum(album)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--color-text)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete({
                            type: 'album',
                            albumId: album.id,
                            title: album.title,
                            message: `Delete album "${album.title}" and all of its tracks?`
                          })}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                          aria-label={`Delete ${album.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {editingAlbumId === album.id && (
                        <form
                          onSubmit={(event) => handleUpdateAlbum(event, album.id)}
                          style={{
                            margin: '16px 0 4px 72px',
                            padding: '16px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr 110px',
                              gap: '12px'
                            }}
                          >
                            <input
                              type="text"
                              value={albumEditForms[album.id]?.title || ''}
                              onChange={(event) => handleAlbumEditChange(album.id, 'title', event.target.value)}
                              required
                              placeholder="Album title"
                              style={{ ...inputStyle, marginBottom: '12px' }}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                            <input
                              type="text"
                              value={albumEditForms[album.id]?.artist || ''}
                              onChange={(event) => handleAlbumEditChange(album.id, 'artist', event.target.value)}
                              required
                              placeholder="Artist"
                              style={{ ...inputStyle, marginBottom: '12px' }}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                            <input
                              type="number"
                              value={albumEditForms[album.id]?.year || ''}
                              onChange={(event) => handleAlbumEditChange(album.id, 'year', event.target.value)}
                              required
                              min="1900"
                              max="2099"
                              placeholder="Year"
                              style={{ ...inputStyle, marginBottom: '12px' }}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => handleAlbumEditChange(album.id, 'coverFile', event.target.files[0] || null)}
                            style={{
                              ...inputStyle,
                              height: 'auto',
                              padding: '14px 16px',
                              cursor: 'pointer',
                              marginBottom: '12px'
                            }}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          />
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              type="submit"
                              disabled={savingEditId === `album-${album.id}`}
                              style={{
                                height: '42px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                padding: '0 16px',
                                cursor: savingEditId === `album-${album.id}` ? 'not-allowed' : 'pointer',
                                opacity: savingEditId === `album-${album.id}` ? 0.7 : 1
                              }}
                            >
                              <Check size={16} />
                              {savingEditId === `album-${album.id}` ? 'Saving...' : 'Save Album'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAlbumId('')}
                              style={{
                                height: '42px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                fontWeight: '600',
                                padding: '0 16px',
                                cursor: 'pointer'
                              }}
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {album.tracks?.length > 0 && (
                        <div style={{ margin: '12px 0 0 72px' }}>
                          {album.tracks.map((track) => {
                            const trackKey = getTrackKey(album.id, track.id)

                            return (
                            <div
                              key={track.id}
                            >
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 90px 120px 40px 40px',
                                  alignItems: 'center',
                                  gap: '12px',
                                  color: 'var(--color-muted)',
                                  fontSize: '13px',
                                  padding: '8px 0'
                                }}
                              >
                                <span style={{ color: 'var(--color-text)' }}>{track.title}</span>
                                <span>{track.duration}</span>
                                <span>{track.genre}</span>
                                <button
                                  type="button"
                                  onClick={() => startEditTrack(album.id, track)}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    color: 'var(--color-text)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                  }}
                                  aria-label={`Edit ${track.title}`}
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDelete({
                                    type: 'track',
                                    albumId: album.id,
                                    trackId: track.id,
                                    title: track.title,
                                    message: `Delete song "${track.title}" from "${album.title}"?`
                                  })}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                  }}
                                  aria-label={`Delete ${track.title}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              {editingTrackKey === trackKey && (
                                <form
                                  onSubmit={(event) => handleUpdateTrack(event, album.id, track.id)}
                                  style={{
                                    margin: '8px 0 12px',
                                    padding: '16px',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid var(--color-border)'
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: '1fr 120px 140px',
                                      gap: '12px'
                                    }}
                                  >
                                    <input
                                      type="text"
                                      value={trackEditForms[trackKey]?.title || ''}
                                      onChange={(event) => handleTrackEditChange(trackKey, 'title', event.target.value)}
                                      required
                                      placeholder="Track title"
                                      style={{ ...inputStyle, marginBottom: '12px' }}
                                      onFocus={handleFocus}
                                      onBlur={handleBlur}
                                    />
                                    <input
                                      type="text"
                                      value={trackEditForms[trackKey]?.duration || ''}
                                      onChange={(event) => handleTrackEditChange(trackKey, 'duration', event.target.value)}
                                      required
                                      placeholder="3:45"
                                      style={{ ...inputStyle, marginBottom: '12px' }}
                                      onFocus={handleFocus}
                                      onBlur={handleBlur}
                                    />
                                    <input
                                      type="text"
                                      value={trackEditForms[trackKey]?.genre || ''}
                                      onChange={(event) => handleTrackEditChange(trackKey, 'genre', event.target.value)}
                                      required
                                      placeholder="Genre"
                                      style={{ ...inputStyle, marginBottom: '12px' }}
                                      onFocus={handleFocus}
                                      onBlur={handleBlur}
                                    />
                                  </div>
                                  <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(event) => handleTrackEditChange(trackKey, 'audioFile', event.target.files[0] || null)}
                                    style={{
                                      ...inputStyle,
                                      height: 'auto',
                                      padding: '14px 16px',
                                      cursor: 'pointer',
                                      marginBottom: '12px'
                                    }}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                  />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => handleTrackEditChange(trackKey, 'songCardFile', event.target.files[0] || null)}
                                    style={{
                                      ...inputStyle,
                                      height: 'auto',
                                      padding: '14px 16px',
                                      cursor: 'pointer',
                                      marginBottom: '12px'
                                    }}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                  />
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                      type="submit"
                                      disabled={savingEditId === `track-${track.id}`}
                                      style={{
                                        height: '42px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        padding: '0 16px',
                                        cursor: savingEditId === `track-${track.id}` ? 'not-allowed' : 'pointer',
                                        opacity: savingEditId === `track-${track.id}` ? 0.7 : 1
                                      }}
                                    >
                                      <Check size={16} />
                                      {savingEditId === `track-${track.id}` ? 'Saving...' : 'Save Track'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTrackKey('')}
                                      style={{
                                        height: '42px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--color-text)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        padding: '0 16px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <X size={16} />
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                            )
                          })}
                        </div>
                      )}

                      {isTrackFormOpen && (
                        <form
                          onSubmit={(event) => handleAddTrack(event, album.id)}
                          style={{
                            margin: '16px 0 4px 72px',
                            padding: '16px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 120px 140px',
                              gap: '12px'
                            }}
                          >
                            <input
                              type="text"
                              value={trackForm.title || ''}
                              onChange={(event) => handleTrackChange(album.id, 'title', event.target.value)}
                              required
                              placeholder="Track title"
                              style={{ ...inputStyle, marginBottom: '12px' }}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                            <input
                              type="text"
                              value={trackForm.duration || ''}
                              onChange={(event) => handleTrackChange(album.id, 'duration', event.target.value)}
                              required
                              placeholder="3:45"
                              style={{ ...inputStyle, marginBottom: '12px' }}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                            <input
                              type="text"
                              value={trackForm.genre || ''}
                              onChange={(event) => handleTrackChange(album.id, 'genre', event.target.value)}
                              required
                              placeholder="Genre"
                              style={{ ...inputStyle, marginBottom: '12px' }}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                          </div>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(event) => handleTrackChange(album.id, 'audioFile', event.target.files[0] || null)}
                            style={{
                              ...inputStyle,
                              height: 'auto',
                              padding: '14px 16px',
                              cursor: 'pointer',
                              marginBottom: '12px'
                            }}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => handleTrackChange(album.id, 'songCardFile', event.target.files[0] || null)}
                            style={{
                              ...inputStyle,
                              height: 'auto',
                              padding: '14px 16px',
                              cursor: 'pointer',
                              marginBottom: '12px'
                            }}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          />
                          <button
                            type="submit"
                            disabled={savingTrackId === album.id}
                            style={{
                              height: '44px',
                              background: 'var(--color-primary)',
                              color: 'white',
                              borderRadius: '8px',
                              fontWeight: '600',
                              border: 'none',
                              cursor: savingTrackId === album.id ? 'not-allowed' : 'pointer',
                              opacity: savingTrackId === album.id ? 0.7 : 1,
                              padding: '0 18px'
                            }}
                          >
                            {savingTrackId === album.id ? 'Adding track...' : 'Add Track'}
                          </button>
                        </form>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p style={{ color: 'var(--color-muted)' }}>
                  No albums found. Create your first album above!
                </p>
              </div>
            )}
          </motion.section>
        </div>
      </main>

      {confirmDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(8px)',
            padding: '24px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'rgba(15, 15, 46, 0.94)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
              padding: '24px'
            }}
          >
            <h3
              style={{
                color: 'var(--color-text)',
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '8px'
              }}
            >
              Confirm delete
            </h3>
            <p
              style={{
                color: 'var(--color-muted)',
                fontSize: '14px',
                lineHeight: 1.6,
                marginBottom: '24px'
              }}
            >
              {confirmDelete.message}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
              }}
            >
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                style={{
                  height: '42px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  height: '42px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  background: 'rgba(239, 68, 68, 0.18)',
                  color: '#f87171',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageAlbums
