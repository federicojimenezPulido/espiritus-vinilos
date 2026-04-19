import { useEffect } from 'react'
import styles from './SocialDrawer.module.css'

function getTikTokEmbedUrl(url) {
  const match = url?.match(/video\/(\d+)/)
  return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : null
}

function getInstagramEmbedUrl(url) {
  const match = url?.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
  return match ? `https://www.instagram.com/p/${match[1]}/embed/` : null
}

export default function SocialDrawer({ type, url, onClose }) {
  const embedUrl = type === 'tiktok'
    ? getTikTokEmbedUrl(url)
    : getInstagramEmbedUrl(url)

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const label = type === 'tiktok' ? 'TikTok' : 'Instagram'
  const icon  = type === 'tiktok'
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.drawer} ${styles[type]}`} onClick={e => e.stopPropagation()}>

        <div className={styles.drawerHeader}>
          <div className={styles.drawerLabel}>
            {icon}
            <span>{label}</span>
          </div>
          <div className={styles.drawerActions}>
            <a href={url} target="_blank" rel="noreferrer" className={styles.openBtn}>
              Abrir ↗
            </a>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.drawerBody}>
          {embedUrl
            ? <iframe
                src={embedUrl}
                className={styles.frame}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                title={label}
              />
            : <div className={styles.fallback}>
                <p>No se pudo generar el embed.</p>
                <a href={url} target="_blank" rel="noreferrer">Ver publicación en {label} →</a>
              </div>
          }
        </div>

      </div>
    </div>
  )
}
