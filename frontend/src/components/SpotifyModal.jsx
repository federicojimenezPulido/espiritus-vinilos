import { useState, useEffect } from 'react'
import { fetchSpotifyId } from '../services/api'
import styles from './SpotifyModal.module.css'

export default function SpotifyModal({ item, index, onClose }) {
  const [spotifyId,    setSpotifyId]    = useState(item?.spotify_id || null)
  const [fetching,     setFetching]     = useState(false)
  const [msg,          setMsg]          = useState('')

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Auto-buscar si no tiene spotify_id todavía
  useEffect(() => {
    if (!item?.spotify_id) {
      doSearch()
    }
  }, [])

  async function doSearch() {
    setFetching(true)
    setMsg('Buscando en Spotify...')
    try {
      const result = await fetchSpotifyId(index)
      if (result.spotify_id) {
        setSpotifyId(result.spotify_id)
        setMsg('')
      } else {
        setMsg('⚠ Este álbum no se encontró en Spotify')
      }
    } catch {
      setMsg('⚠ Error conectando con Spotify')
    } finally {
      setFetching(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>
        {/* Header */}
        <div className={styles.hdr}>
          <div className={styles.hdrInfo}>
            {item.cover_url && (
              <img src={item.cover_url} alt={item.album} className={styles.thumb} />
            )}
            <div>
              <div className={styles.album}>{item.album}</div>
              <div className={styles.artista}>{item.artista}</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Player */}
        <div className={styles.body}>
          {fetching && (
            <div className={styles.searching}>
              <span className={styles.spinner}>🎵</span> Buscando en Spotify...
            </div>
          )}

          {msg && !fetching && (
            <div className={styles.msg}>
              {msg}
              <button className={styles.retryBtn} onClick={doSearch}>Reintentar</button>
            </div>
          )}

          {spotifyId && !fetching && (
            <iframe
              src={`https://open.spotify.com/embed/album/${spotifyId}?utm_source=generator&theme=0`}
              width="100%"
              height="380"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className={styles.frame}
            />
          )}
        </div>
      </div>
    </div>
  )
}
