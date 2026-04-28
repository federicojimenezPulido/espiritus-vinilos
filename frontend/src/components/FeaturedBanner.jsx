import { useState, useEffect } from 'react'
import { useLang } from '../LangContext'
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

export default function FeaturedBanner({ onOpen }) {
  const { t } = useLang()
  const [featured, setFeaturedState] = useState(getFeatured)
  const [copied,   setCopied]        = useState(false)

  useEffect(() => {
    const handler = () => setFeaturedState(getFeatured())
    window.addEventListener('featured-changed', handler)
    return () => window.removeEventListener('featured-changed', handler)
  }, [])

  if (!featured) return null

  function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?v=${featured._index}`
    navigator.clipboard.writeText(url).catch(() => {})
    window.open(url, '_blank')
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  function handlePlay() {
    window.dispatchEvent(new CustomEvent('enlt-play', {
      detail: {
        id:    featured.spotify_id,
        title: `${featured.artista} · ${featured.album}`,
        cover: featured.cover_url || null,
      }
    }))
  }

  return (
    <div className={styles.banner}>
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
            <button className={styles.btnPost} onClick={() => onOpen(featured)} title={t('enltPostedTitle')}>
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
          <button className={styles.btnClear} onClick={clearFeatured} title={t('removeFeatured')}>✕</button>
        </div>
      </div>
    </div>
  )
}
