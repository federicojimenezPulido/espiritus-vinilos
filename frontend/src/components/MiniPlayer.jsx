import { useState, useEffect } from 'react'
import styles from './MiniPlayer.module.css'

const ENLT_PLAYLIST = 'playlist/79AtpWBncbLNIr0jHPmVf4'

function spotifyEmbedUrl(id) {
  if (!id) return null
  if (id.includes('/')) return `https://open.spotify.com/embed/${id}?utm_source=generator&theme=0`
  return `https://open.spotify.com/embed/album/${id}?utm_source=generator&theme=0`
}

function NoteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>
  )
}

function ChevronIcon({ up }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points={up ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
    </svg>
  )
}

export default function MiniPlayer() {
  const [expanded,  setExpanded]  = useState(false)
  const [hidden,    setHidden]    = useState(false)
  const [playerId,  setPlayerId]  = useState(ENLT_PLAYLIST)
  const [label,     setLabel]     = useState('En Las Nubes Trepao · Playlist')
  const [coverUrl,  setCoverUrl]  = useState(null)

  // Escuchar evento global enlt-play
  useEffect(() => {
    function handler(e) {
      const { id, title, cover } = e.detail || {}
      if (id) {
        setPlayerId(id)
        setLabel(title || 'En Las Nubes Trepao')
        setCoverUrl(cover || null)
        setExpanded(true)
        setHidden(false)
      }
    }
    window.addEventListener('enlt-play', handler)
    return () => window.removeEventListener('enlt-play', handler)
  }, [])

  // Resetear a playlist cuando no hay featured
  useEffect(() => {
    function handler() {
      const stored = localStorage.getItem('enlt_featured')
      if (!stored) {
        setPlayerId(ENLT_PLAYLIST)
        setLabel('En Las Nubes Trepao · Playlist')
        setCoverUrl(null)
      }
    }
    window.addEventListener('featured-changed', handler)
    return () => window.removeEventListener('featured-changed', handler)
  }, [])

  if (hidden) {
    return (
      <button className={styles.showBtn} onClick={() => setHidden(false)}>
        <NoteIcon />
      </button>
    )
  }

  return (
    <div className={`${styles.root} ${expanded ? styles.expanded : ''}`}>
      {/* Pill header */}
      <div className={styles.pill} onClick={() => setExpanded(v => !v)}>
        <div className={styles.pillLeft}>
          {coverUrl
            ? <img src={coverUrl} alt="" className={styles.pillCover} />
            : <div className={styles.pillLogo}>
                <img src="/espiritus-vinilos/logo-enlt.jpeg" alt="" />
              </div>
          }
          <div className={styles.pillInfo}>
            <span className={styles.pillLabel}>{label}</span>
            <span className={styles.pillSub}>Spotify</span>
          </div>
        </div>
        <div className={styles.pillRight}>
          <span className={styles.pillNote}><NoteIcon /></span>
          <span className={styles.pillChevron}><ChevronIcon up={expanded} /></span>
          <button
            className={styles.pillClose}
            onClick={e => { e.stopPropagation(); setHidden(true); setExpanded(false) }}
            title="Minimizar"
          >✕</button>
        </div>
      </div>

      {/* Iframe — solo se monta cuando expandido */}
      {expanded && (
        <div className={styles.frameWrap}>
          <iframe
            key={playerId}
            src={spotifyEmbedUrl(playerId)}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className={styles.frame}
          />
        </div>
      )}
    </div>
  )
}
