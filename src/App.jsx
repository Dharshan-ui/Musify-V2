import { useMusic } from './Context/MusicContext'
import { Play, Pause, SkipBack, SkipForward, Music2, X } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from './NavBar_Block/Navbar'
import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

const formatTime = (value) => {
  if (!Number.isFinite(value) || value <= 0) return '0:00'

  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60).toString().padStart(2, '0')

  return `${minutes}:${seconds}`
}

function MiniPlayer() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const {
    currentSong,
    currentAlbum,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seekTo,
    closePlayer,
    nextSong,
    prevSong
  } = useMusic()

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (!currentSong) return null

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <motion.div
      initial={{ y: 140, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 140, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        padding: isMobile ? '12px 16px' : '0 24px 22px',
        background: '#0a0a1a',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        position: 'relative',
        pointerEvents: 'none'
      }}
    >
      {isMobile && (
        <button
          type="button"
          onClick={closePlayer}
          aria-label="Close player"
          className="player-close-button"
          style={{
            position: 'absolute',
            top: '8px',
            right: '12px',
            width: '24px',
            height: '24px',
            pointerEvents: 'auto'
          }}
        >
          <X size={14} />
        </button>
      )}

      <div
        style={{
          width: '100%',
          maxWidth: '1180px',
          margin: '0 auto',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 100,
          background: isMobile ? 'transparent' : 'rgba(15, 15, 46, 0.95)',
          backdropFilter: isMobile ? 'none' : 'blur(20px)',
          border: isMobile ? 'none' : '1px solid var(--color-border)',
          borderRadius: isMobile ? '18px' : '24px',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45), 0 0 44px rgba(59, 108, 244, 0.24)',
          padding: isMobile ? '12px 14px' : '18px 22px'
        }}
      >
        {!isMobile && (
          <button
            type="button"
            onClick={closePlayer}
            aria-label="Close player"
            className="player-close-button"
          >
            <X size={18} />
          </button>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'minmax(0, 1fr) 116px' : 'minmax(220px, 1fr) minmax(360px, 1.35fr) minmax(180px, 0.8fr)',
            gap: isMobile ? '12px' : '24px',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
            <div
              style={{
                width: isMobile ? '52px' : '74px',
                height: isMobile ? '52px' : '74px',
                borderRadius: '18px',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'rgba(59, 108, 244, 0.16)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)'
              }}
            >
              {currentSong.albumArt ? (
                <img
                  src={currentSong.albumArt}
                  alt={currentSong.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)'
                  }}
                >
                  <Music2 size={30} />
                </div>
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  display: isMobile ? 'none' : 'block'
                }}
              >
                Now Playing
              </p>
              <h4
                style={{
                  color: 'var(--color-text)',
                  fontSize: isMobile ? '15px' : '17px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '4px'
                }}
              >
                {currentSong.title}
              </h4>
              <p
                style={{
                  color: 'var(--color-muted)',
                  fontSize: isMobile ? '13px' : '14px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {currentSong.artist}
              </p>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '6px' : '14px',
                marginBottom: isMobile ? 0 : '14px'
              }}
            >
              <button
                type="button"
                onClick={prevSong}
                className="player-icon-button"
                aria-label="Previous song"
                style={{
                  width: isMobile ? '32px' : undefined,
                  height: isMobile ? '32px' : undefined
                }}
              >
                <SkipBack size={21} />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="player-play-button"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                style={{
                  width: isMobile ? '40px' : undefined,
                  height: isMobile ? '40px' : undefined
                }}
              >
                {isPlaying ? <Pause size={25} fill="white" /> : <Play size={25} fill="white" />}
              </button>
              <button
                type="button"
                onClick={nextSong}
                className="player-icon-button"
                aria-label="Next song"
                style={{
                  width: isMobile ? '32px' : undefined,
                  height: isMobile ? '32px' : undefined
                }}
              >
                <SkipForward size={21} />
              </button>
            </div>

            <div
              style={{
                display: isMobile ? 'none' : 'grid',
                gridTemplateColumns: '48px 1fr 48px',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              <span className="player-time">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={duration ? currentTime : 0}
                onChange={(event) => seekTo(event.target.value)}
                className="player-range"
                style={{
                  '--progress': `${progress}%`
                }}
                aria-label="Seek through song"
              />
              <span className="player-time" style={{ textAlign: 'right' }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div
            style={{
              display: isMobile ? 'none' : 'block',
              justifySelf: 'end',
              minWidth: 0,
              textAlign: 'right'
            }}
          >
            <p
              style={{
                color: 'var(--color-muted)',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}
            >
              Album
            </p>
            <p
              style={{
                color: 'var(--color-text)',
                fontSize: '15px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '220px'
              }}
            >
              {currentAlbum?.title || 'Single'}
            </p>
            <p
              style={{
                color: 'var(--color-primary)',
                fontSize: '13px',
                marginTop: '5px'
              }}
            >
              {currentSong.genre || currentAlbum?.year || 'Musify'}
            </p>
          </div>
        </div>

        {isMobile && (
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={duration ? currentTime : 0}
            onChange={(event) => seekTo(event.target.value)}
            className="player-range"
            style={{
              '--progress': `${progress}%`,
              height: '3px',
              marginTop: '10px'
            }}
            aria-label="Seek through song"
          />
        )}
      </div>
    </motion.div>
  )
}

function App() {
  return (
    <>
      <Navbar />
      <Outlet />
      <MiniPlayer />
    </>
  )
}

export default App
