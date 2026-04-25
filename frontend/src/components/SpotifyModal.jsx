import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { fetchSpotifyId, saveSpotifyId, refreshSpotifyId } from '../services/api'
import styles from './SpotifyModal.module.css'

// Soporta "album/ID", "playlist/ID", "track/ID" (nuevo) o solo "ID" (legacy album)
function spotifyEmbedUrl(id) {
  if (!id) return null
  if (id.includes('/')) return `https://open.spotify.com/embed/${id}?utm_source=generator&theme=0`
  return `https://open.spotify.com/embed/album/${id}?utm_source=generator&theme=0`
}

export default function SpotifyModal({ item, index, coll, onClose, requirePin }) {
  const [spotifyId,    setSpotifyId]    = useState(item?.spotify_id || null)
  const [fetching,     setFetching]     = useState(false)
  const [msg,          setMsg]          = useState('')
  const [manualId,     setManualId]     = useState('')
  const [showManual,   setShowManual]   = useState(false)
  const queryClient = useQueryClient()

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

  // Guarda en BD y refresca el cache de React Query para que no vuelva a buscar
  async function persistId(id) {
    try {
      await saveSpotifyId(index, id)
      if (coll) queryClient.invalidateQueries({ queryKey: [coll] })
    } catch { /* silencioso */ }
  }

  async function doSearch() {
    setFetching(true)
    setMsg('')
    setShowManual(false)
    try {
      const result = await fetchSpotifyId(index)
      if (result.spotify_id) {
        setSpotifyId(result.spotify_id)
        // fetchSpotifyId ya guarda en BD; solo refrescamos el cache
        if (coll) queryClient.invalidateQueries({ queryKey: [coll] })
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
        if (coll) queryClient.invalidateQueries({ queryKey: [coll] })
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
    const raw = manualId.trim()
    if (!raw) return

    // Parsear URL completa: https://open.spotify.com/{type}/{id}?...
    const urlMatch = raw.match(/open\.spotify\.com\/(album|playlist|track)\/([A-Za-z0-9]+)/)
    // URI: spotify:album:ID  /  spotify:playlist:ID
    const uriMatch = raw.match(/spotify:(album|playlist|track):([A-Za-z0-9]+)/)

    let storedId
    if (urlMatch)      storedId = `${urlMatch[1]}/${urlMatch[2]}`
    else if (uriMatch) storedId = `${uriMatch[1]}/${uriMatch[2]}`
    else               storedId = raw  // ID crudo → legacy album

    setSpotifyId(storedId)
    setShowManual(false)
    setMsg('')
    setManualId('')
    await persistId(storedId)
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
                src={spotifyEmbedUrl(spotifyId)}
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
                      <button className={styles.wrongBtn} onClick={() => {
                        if (requirePin) requirePin('Corregir álbum Spotify', () => setShowManual(true))
                        else setShowManual(true)
                      }}>
                        ¿Álbum incorrecto? Corregir
                      </button>
                      <button className={styles.refreshBtn} onClick={() => {
                        if (requirePin) requirePin('Buscar otro álbum', doRefresh)
                        else doRefresh()
                      }}>
                        🔄 Buscar otro
                      </button>
                    </div>
                  : <div className={styles.manualRow}>
                      <input
                        className={styles.manualInput}
                        placeholder="URL de Spotify (álbum, playlist o canción)..."
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
