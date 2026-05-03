import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AdminSidebar from './AdminSidebar'
import {
  createId,
  getStoredAdmin,
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

const UploadSong = () => {
  const [admin, setAdmin] = useState(() => getStoredAdmin())
  const [formData, setFormData] = useState({
    title: '',
    albumId: '',
    duration: '',
    genre: ''
  })
  const [audioFile, setAudioFile] = useState(null)
  const [songCardFile, setSongCardFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const albums = admin.albums || []

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAudioFile(file)
    }
  }

  const handleSongCardFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSongCardFile(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.albumId) {
      toast.error('Please select an album')
      return
    }

    if (!audioFile) {
      toast.error('Please select an audio file')
      return
    }

    if (!songCardFile) {
      toast.error('Please select a song card image')
      return
    }

    setUploading(true)
    setUploadProgress(15)

    try {
      const selectedAlbum = albums.find((album) => album.id === formData.albumId)
      
      // Upload both files in parallel instead of sequentially
      const [songCardUpload, audioUpload] = await Promise.all([
        uploadToCloudinary(songCardFile, {
          folder: 'musify/song-cards',
          tags: ['musify', 'song-card', formData.genre],
          context: {
            type: 'song_card',
            title: formData.title,
            albumId: formData.albumId,
            albumTitle: selectedAlbum?.title,
            artist: selectedAlbum?.artist,
            genre: formData.genre
          }
        }),
        uploadToCloudinary(audioFile, {
          folder: 'musify/audio',
          tags: ['musify', 'audio', formData.genre],
          context: {
            type: 'track_audio',
            title: formData.title,
            albumId: formData.albumId,
            albumTitle: selectedAlbum?.title,
            artist: selectedAlbum?.artist,
            duration: formData.duration,
            genre: formData.genre
          }
        })
      ])
      
      setUploadProgress(80)

      const newTrack = {
        id: createId('track'),
        title: formData.title,
        duration: formData.duration,
        audioFileUrl: audioUpload.secureUrl,
        audioPublicId: audioUpload.publicId,
        songCardImageUrl: songCardUpload.secureUrl,
        songCardPublicId: songCardUpload.publicId,
        genre: formData.genre
      }

      const updatedAdmin = saveStoredAdmin({
        ...admin,
        albums: albums.map((album) => (
          album.id === formData.albumId
            ? { ...album, tracks: [...(album.tracks || []), newTrack] }
            : album
        ))
      })

      setAdmin(updatedAdmin)
      setUploadProgress(100)
      toast.success('Song added to album!')
      resetForm()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload song')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      albumId: '',
      duration: '',
      genre: ''
    })
    setAudioFile(null)
    setSongCardFile(null)
    setUploadProgress(0)
  }

  const handleFocus = (e) => {
    e.target.style.borderColor = 'var(--color-primary)'
  }

  const handleBlur = (e) => {
    e.target.style.borderColor = 'var(--color-border)'
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
          padding: '32px',
          maxWidth: 'calc(100vw - 240px)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(15, 15, 46, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px'
          }}
        >
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'var(--color-text)',
              marginBottom: '4px'
            }}
          >
            Upload Song
          </h1>
          <p
            style={{
              color: 'var(--color-muted)',
              fontSize: '14px',
              marginBottom: '28px'
            }}
          >
            Add a new track to one of your created albums.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="song-title" style={labelStyle}>
              Song Title
            </label>
            <input
              id="song-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Enter song title"
            />

            <label htmlFor="song-album" style={labelStyle}>
              Album
            </label>
            <select
              id="song-album"
              name="albumId"
              value={formData.albumId}
              onChange={handleInputChange}
              required
              disabled={albums.length === 0}
              style={{
                ...inputStyle,
                appearance: 'none',
                cursor: albums.length === 0 ? 'not-allowed' : 'pointer',
                opacity: albums.length === 0 ? 0.65 : 1
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              <option value="">
                {albums.length === 0 ? 'Create an album first' : 'Select an album'}
              </option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title} - {album.artist} ({album.year})
                </option>
              ))}
            </select>

            {albums.length === 0 && (
              <p
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '13px',
                  marginTop: '-12px',
                  marginBottom: '20px'
                }}
              >
                Go to Manage Albums and create an album before uploading songs.
              </p>
            )}

            <label htmlFor="song-duration" style={labelStyle}>
              Duration
            </label>
            <input
              id="song-duration"
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="3:45"
            />

            <label htmlFor="song-genre" style={labelStyle}>
              Genre
            </label>
            <input
              id="song-genre"
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Synthwave"
            />

            <label htmlFor="audio-input" style={labelStyle}>
              Audio File
            </label>
            <input
              id="audio-input"
              type="file"
              accept="audio/*"
              onChange={handleAudioFileChange}
              style={{
                ...inputStyle,
                height: 'auto',
                padding: '14px 16px',
                cursor: 'pointer'
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />

            <label htmlFor="song-card-input" style={labelStyle}>
              Song Card Image
            </label>
            <input
              id="song-card-input"
              type="file"
              accept="image/*"
              onChange={handleSongCardFileChange}
              style={{
                ...inputStyle,
                height: 'auto',
                padding: '14px 16px',
                cursor: 'pointer'
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />

            {uploading && (
              <div
                style={{
                  height: '6px',
                  background: 'rgba(59, 108, 244, 0.2)',
                  borderRadius: '3px',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    background: 'var(--color-primary)',
                    borderRadius: '3px'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || albums.length === 0}
              style={{
                width: '100%',
                height: '52px',
                background: 'var(--color-primary)',
                color: 'white',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '15px',
                border: 'none',
                cursor: uploading || albums.length === 0 ? 'not-allowed' : 'pointer',
                opacity: uploading || albums.length === 0 ? 0.7 : 1
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Song'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  )
}

export default UploadSong
