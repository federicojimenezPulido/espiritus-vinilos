import { useState, useEffect } from 'react'
import styles from './FeaturedBanner.module.css'

const STORAGE_KEY = 'enlt_featured'

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

export default function FeaturedBanner({ onOpen, onSpotify }) {
  const [featured, setFeaturedState] = useState(getFeatured)

  useEffect(() => {
    const handler = () => setFeaturedState(getFeatured())
    window.addEventListener('featured-changed', handler)
    return () => window.removeEventListener('featured-changed', handler)
  }, [])

  if (!featured) return null

  function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?v=${featured._index}`
    navigator.clipboard.writeText(url).catch(() => {})
  }

  return (
    <div className={styles.banner}>
      <p className={styles.label}>🎵 Descubrimiento del mes</p>
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
          {onSpotify && featured.spotify_id && (
            <button className={styles.btnPlay} onClick={() => onSpotify(featured, featured._index)}>
              ▶ Escuchar
            </button>
          )}
          <button className={styles.btnDetail} onClick={() => onOpen(featured)}>
            Ver disco
          </button>
          {/* Botón contextual — solo aparece si el disco tiene contenido de ENLT */}
          {(featured.tiktok_url || featured.ig_url) && (
            <button className={styles.btnPost} onClick={() => onOpen(featured)} title="ENLT publicó sobre este disco">
              <span className={styles.btnPostDot} />
              {featured.tiktok_url ? 'Ver en TikTok' : 'Ver en IG'}
            </button>
          )}
          <button className={styles.btnShare} onClick={handleShare}>
            🔗 Compartir
          </button>
          <button className={styles.btnClear} onClick={clearFeatured} title="Quitar destacado">✕</button>
        </div>
      </div>
    </div>
  )
}
