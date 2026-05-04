import { createContext, useContext, useRef, useState } from 'react'

const MusicContext = createContext()

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAlbum, setCurrentAlbum] = useState(null)
  const [queue, setQueue] = useState([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef(null)

  const syncAudioEvents = (audio) => {
    audio.onloadedmetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    audio.onended = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.onerror = () => {
      console.error('Audio playback failed')
      setIsPlaying(false)
    }
  }

  const playSong = (song, album = null) => {
    const audioSource = song.audioUrl || song.audioFileUrl

    if (!audioSource) {
      console.error('No audio source found for song:', song)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onloadedmetadata = null
      audioRef.current.ontimeupdate = null
      audioRef.current.onended = null
      audioRef.current.onerror = null
    }

    setCurrentSong(song)
    setCurrentTime(0)
    setDuration(0)

    if (album) {
      setCurrentAlbum(album)
      setQueue(album.tracks || album.songs || [])
    }

    const audio = new Audio(audioSource)
    audioRef.current = audio
    syncAudioEvents(audio)

    audio.play()
      .then(() => {
        setIsPlaying(true)
      })
      .catch((error) => {
        console.error('Audio playback failed:', error)
        setIsPlaying(false)
      })
  }

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    audioRef.current.play()
      .then(() => {
        setIsPlaying(true)
      })
      .catch((error) => {
        console.error('Audio playback failed:', error)
        setIsPlaying(false)
      })
  }

  const seekTo = (nextTime) => {
    if (!audioRef.current) return

    const safeTime = Math.min(Math.max(Number(nextTime), 0), duration || 0)
    audioRef.current.currentTime = safeTime
    setCurrentTime(safeTime)
  }

  const nextSong = () => {
    if (!currentAlbum || !currentSong) return

    const songs = currentAlbum.tracks || currentAlbum.songs || queue
    if (!songs?.length) return

    const currentIndex = songs.findIndex(s => s.id === currentSong.id)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % songs.length

    playSong(songs[nextIndex], currentAlbum)
  }

  const prevSong = () => {
    if (!currentAlbum || !currentSong) return

    const songs = currentAlbum.tracks || currentAlbum.songs || queue
    if (!songs?.length) return

    const currentIndex = songs.findIndex(s => s.id === currentSong.id)
    const prevIndex = currentIndex <= 0 ? songs.length - 1 : currentIndex - 1

    playSong(songs[prevIndex], currentAlbum)
  }

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onloadedmetadata = null
      audioRef.current.ontimeupdate = null
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current = null
    }

    setCurrentSong(null)
    setIsPlaying(false)
    setCurrentAlbum(null)
    setQueue([])
    setCurrentTime(0)
    setDuration(0)
  }

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentAlbum,
        queue,
        currentTime,
        duration,
        playSong,
        togglePlay,
        seekTo,
        closePlayer,
        nextSong,
        prevSong
      }}
    >
      {children}
    </MusicContext.Provider>
  )
}

export const useMusic = () => {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider')
  }
  return context
}
