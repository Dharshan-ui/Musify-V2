import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, Radio } from 'lucide-react'
import { useMusic } from '../Context/MusicContext'

const SongCard = ({ songData, trackNumber, album }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isExpanded, setIsExpanded] = useState(false)
  const { currentSong, isPlaying, playSong, togglePlay } = useMusic()

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const isCurrentSong = currentSong?.id === songData.id

  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlay()
    } else {
      playSong(songData, album)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      style={{ marginBottom: '12px' }}
    >
      <div
        style={{
          background: isCurrentSong
            ? 'linear-gradient(135deg, rgba(59, 108, 244, 0.16), rgba(124, 58, 237, 0.12))'
            : 'rgba(15, 15, 46, 0.58)',
          backdropFilter: 'blur(20px)',
          border: isCurrentSong ? '1px solid rgba(59, 108, 244, 0.55)' : '1px solid var(--color-border)',
          borderRadius: '18px',
          boxShadow: isCurrentSong ? '0 0 28px rgba(59, 108, 244, 0.18)' : 'none',
          padding: '18px 20px',
          transition: 'all 200ms ease'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '32px 44px minmax(0, 1fr) 40px' : '48px 56px 1fr 92px 120px 48px',
            alignItems: 'center',
            gap: isMobile ? '10px' : '16px'
          }}
        >
          <span
            style={{
              width: isMobile ? '32px' : '38px',
              height: isMobile ? '32px' : '38px',
              borderRadius: '12px',
              background: isCurrentSong ? 'rgba(59, 108, 244, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              color: isCurrentSong ? 'var(--color-primary)' : 'var(--color-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '14px'
            }}
          >
            {isCurrentSong && isPlaying ? <Radio size={17} /> : trackNumber}
          </span>

          <div
            style={{
              width: isMobile ? '44px' : '56px',
              height: isMobile ? '44px' : '56px',
              borderRadius: '14px',
              overflow: 'hidden',
              background: 'rgba(59, 108, 244, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: isCurrentSong ? '0 0 22px rgba(59, 108, 244, 0.24)' : 'none'
            }}
          >
            {songData.songCardImageUrl ? (
              <img
                src={songData.songCardImageUrl}
                alt={songData.title}
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
                <Radio size={20} />
              </div>
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                color: isCurrentSong ? 'var(--color-primary)' : 'var(--color-text)',
                fontSize: '16px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '5px'
              }}
            >
              {songData.title}
            </h3>
            <p
              style={{
                color: 'var(--color-muted)',
                fontSize: '13px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: isMobile ? 'none' : 'block'
              }}
            >
              {songData.artist}
            </p>
            {isMobile && (
              <p
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '12px',
                  fontWeight: '600',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {songData.duration}
              </p>
            )}
          </div>

          <span
            style={{
              color: 'var(--color-muted)',
              fontSize: '13px',
              fontWeight: '600',
              fontVariantNumeric: 'tabular-nums',
              display: isMobile ? 'none' : 'inline'
            }}
          >
            {songData.duration}
          </span>

          <span
            style={{
              color: 'var(--color-primary)',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: isMobile ? 'none' : 'inline'
            }}
          >
            {songData.genre || songData.size || 'Track'}
          </span>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              handlePlay()
            }}
            style={{
              width: isMobile ? '38px' : '44px',
              height: isMobile ? '38px' : '44px',
              borderRadius: '999px',
              border: 'none',
              background: isCurrentSong ? 'var(--color-primary)' : 'rgba(59, 108, 244, 0.18)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isCurrentSong ? '0 0 18px rgba(59, 108, 244, 0.32)' : 'none'
            }}
            aria-label={isCurrentSong && isPlaying ? 'Pause song' : 'Play song'}
          >
            {isCurrentSong && isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />}
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                marginTop: '18px',
                paddingTop: '18px',
                borderTop: '1px solid var(--color-border)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: '16px',
                  fontSize: '13px'
                }}
              >
                <div>
                  <p style={{ color: 'var(--color-muted)', marginBottom: '4px' }}>Duration</p>
                  <p style={{ color: 'var(--color-text)' }}>{songData.duration}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--color-muted)', marginBottom: '4px' }}>Genre</p>
                  <p style={{ color: 'var(--color-text)' }}>{songData.genre || 'Unknown'}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--color-muted)', marginBottom: '4px' }}>Artist</p>
                  <p style={{ color: 'var(--color-text)' }}>{songData.artist}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--color-muted)', marginBottom: '4px' }}>Album</p>
                  <p style={{ color: 'var(--color-text)' }}>{album?.title || 'Unknown'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default SongCard
