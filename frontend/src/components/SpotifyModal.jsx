import { useState, useEffect } from 'react'
import { fetchSpotifyId, saveSpotifyId, refreshSpotifyId } from '../services/api'
import styles from './SpotifyModal.module.css'

export default function SpotifyModal({ item, index, onClose }) {
  const [spotifyId,    setSpotifyId]    = useState(item?.spotify_id || null)
  const [fetching,     setFetching]     = useState(false)
  const [msg,          setMsg]          = useState('')
  const [manualId,     setManualId]     = useState('')
  const [showManual,   setShowManual]   = useState(false)

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
    setMsg('')
    setShowManual(false)
    try {
      const result = await fetchSpotifyId(index)
      if (result.spotify_id) {
        setSpotifyId(result.spotify_id)
      } else {
        setMsg('⚠ Este álbum no se encontró en Spotify')
        setShowManual(true)
      }
    } catch {
      setMsg('⚠ Error conectando con Spotify')
      setShowManual(true)
    } finally {
      setFetching(false)
    }
  }

  async function doRefresh() {
    setFetching(true)
    setMsg('')
    setShowManual(false)
    setSpotifyId(null)
    try {
      const result = await refreshSpotifyId(index)
      if (result.spotify_id) {
        setSpotifyId(result.spotify_id)
      } else {
        setMsg('⚠ No se encontró otro álbum — pegá la URL manualmente')
        setShowManual(true)
      }
    } catch {
      setMsg('⚠ Error al buscar')
      setShowManual(true)
    } finally {
      setFetching(false)
    }
  }

  async function applyManualId() {
    const raw   = manualId.trim()
    const match = raw.match(/album\/([A-Za-z0-9]+)/)
    const id    = match ? match[1] : raw
    if (!id) return
    setSpotifyId(id)
    setShowManual(false)
    setMsg('')
    setManualId('')
    // Persistir en DB
    try { await saveSpotifyId(index, id) } catch { /* silencioso */ }
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
            <>
              <iframe
                src={`https://open.spotify.com/embed/album/${spotifyId}?utm_source=generator&theme=0`}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className={styles.frame}
              />
              <div className={styles.footer}>
                {!showManual
                  ? <div className={styles.footerBtns}>
                      <button className={styles.wrongBtn} onClick={() => setShowManual(true)}>
                        ¿Álbum incorrecto? Corregir
                      </button>
                      <button className={styles.refreshBtn} onClick={doRefresh}>
                        🔄 Buscar otro
                      </button>
                    </div>
                  : <div className={styles.manualRow}>
                      <input
                        className={styles.manualInput}
                        placeholder="URL o ID del álbum en Spotify..."
                        value={manualId}
                        onChange={e => setManualId(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyManualId()}
                        autoFocus
                      />
                      <button className={styles.applyBtn} onClick={applyManualId} disabled={!manualId.trim()}>
                        Aplicar
                      </button>
                      <button className={styles.cancelBtn} onClick={() => { setShowManual(false); setManualId('') }}>
                        ✕
                      </button>
                    </div>
                }
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
