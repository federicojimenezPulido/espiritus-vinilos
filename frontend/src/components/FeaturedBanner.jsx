import { useState, useEffect } from 'react'
import { useLang } from '../LangContext'
import styles from './FeaturedBanner.module.css'

const STORAGE_KEY   = 'enlt_featured'
const ENLT_PLAYLIST = 'playlist/79AtpWBncbLNIr0jHPmVf4'

export function getFeatured() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
}
export function setFeatured(item, index) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...item, _index: index }))
  window.dispatchEvent(new CustomEvent('featured-changed'))
}
export function clearFeatured() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('featured-changed'))
}

function spotifyEmbedUrl(id) {
  if (!id) return null
  if (id.includes('/')) return `https://open.spotify.com/embed/${id}?utm_source=generator&theme=0`
  return `https://open.spotify.com/embed/album/${id}?utm_source=generator&theme=0`
}

export default function FeaturedBanner({ onOpen }) {
  const { t } = useLang()
  const [featured,    setFeaturedState] = useState(getFeatured)
  const [copied,      setCopied]        = useState(false)
  const [playerId,    setPlayerId]      = useState(ENLT_PLAYLIST) // default: ENLT playlist
  const [showPlayer,  setShowPlayer]    = useState(true)          // visible by default

  useEffect(() => {
    const handler = () => setFeaturedState(getFeatured())
    window.addEventListener('featured-changed', handler)
    return () => window.removeEventListener('featured-changed', handler)
  }, [])

  // Show banner if there's a featured vinyl OR the ENLT playlist is visible
  if (!featured && !showPlayer) return null

  function handleShare() {
    if (!featured) return
    const url = `${window.location.origin}${window.location.pathname}?v=${featured._index}`
    navigator.clipboard.writeText(url).catch(() => {})
    window.open(url, '_blank')
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  function handlePlay() {
    if (featured?.spotify_id) {
      setPlayerId(featured.spotify_id)
    }
    setShowPlayer(true)
  }

  function handleClosePlayer() {
    setShowPlayer(false)
    setPlayerId(ENLT_PLAYLIST) // reset to playlist for next open
  }

  return (
    <div className={styles.banner}>
      {featured && (
        <>
          <p className={styles.label}>{t('featuredTitle')}</p>
          <div className={styles.content}>
            {featured.cover_url
              ? <img src={featured.cover_url} alt={featured.album} className={styles.cover} />
              : <div className={styles.coverPlaceholder}>🎵</div>
            }
            <div className={styles.info}>
              <div className={styles.album}>{featured.album}</div>
              <div className={styles.artista}>{featured.artista}</div>
              {featured.agrupador && <span className={styles.tag}>{featured.agrupador}</span>}
              {featured.anio && <span className={styles.year}>{featured.anio}</span>}
            </div>
            <div className={styles.actions}>
              {featured.spotify_id && (
                <button className={styles.btnPlay} onClick={handlePlay}>
                  {t('listen')}
                </button>
              )}
              <button className={styles.btnDetail} onClick={() => onOpen(featured)}>
                {t('viewRecord')}
              </button>
              {featured.ig_url && (
                <button className={styles.btnPost} onClick={() => onOpen(featured)} title="ENLT publicó sobre este disco">
                  <span className={styles.btnPostDot} />
                  {t('viewIG')}
                </button>
              )}
              <button
                className={`${styles.btnShare} ${copied ? styles.btnShareCopied : ''}`}
                onClick={handleShare}
              >
                {copied ? t('copied') : t('share')}
              </button>
              <button className={styles.btnClear} onClick={clearFeatured} title="Quitar destacado">✕</button>
            </div>
          </div>
        </>
      )}

      {/* ── Inline Spotify player ── */}
      {showPlayer && (
        <div className={styles.playerWrap}>
          <div className={styles.playerHeader}>
            {!featured && (
              <span className={styles.playlistLabel}>
                🎵 En Las Nubes Trepao · Playlist
              </span>
            )}
            <button className={styles.playerClose} onClick={handleClosePlayer} title="Cerrar player">✕</button>
          </div>
          <iframe
            key={playerId}
            src={spotifyEmbedUrl(playerId)}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className={styles.playerFrame}
          />
        </div>
      )}

      {/* If no featured but player is closed, show playlist toggle */}
      {!featured && !showPlayer && (
        <button className={styles.btnPlaylist} onClick={() => setShowPlayer(true)}>
          🎵 Playlist ENLT
        </button>
      )}
    </div>
  )
}
