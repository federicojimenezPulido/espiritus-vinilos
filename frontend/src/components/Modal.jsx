import { useEffect, useState } from 'react'
import { fetchSpotifyId } from '../services/api'
import styles from './Modal.module.css'

export default function Modal({ item, coll, index, onClose, onEdit, onSetFeatured }) {
  const [spotifyId,    setSpotifyId]    = useState(item?.spotify_id || null)
  const [showPlayer,   setShowPlayer]   = useState(false)
  const [fetchingSpot, setFetchingSpot] = useState(false)
  const [spotifyMsg,   setSpotifyMsg]   = useState('')
  const [copied,       setCopied]       = useState(false)

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    setSpotifyId(item?.spotify_id || null)
    setShowPlayer(false)
    setSpotifyMsg('')
  }, [item])

  async function handleSpotify() {
    if (spotifyId) { setShowPlayer(p => !p); return }
    setFetchingSpot(true)
    setSpotifyMsg('Buscando en Spotify...')
    try {
      const result = await fetchSpotifyId(index)
      if (result.spotify_id) {
        setSpotifyId(result.spotify_id)
        setShowPlayer(true)
        setSpotifyMsg('')
      } else {
        setSpotifyMsg('No encontrado en Spotify')
      }
    } catch {
      setSpotifyMsg('Error conectando con Spotify')
    } finally {
      setFetchingSpot(false)
    }
  }

  function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?v=${index}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleIgStory() {
    const url = `${window.location.origin}${window.location.pathname}?v=${index}`
    const text = `${item.artista} — ${item.album}${item.anio ? ` (${item.anio})` : ''}\n\n${url}`
    navigator.clipboard.writeText(text).catch(() => {})
    window.open('https://www.instagram.com/create/story', '_blank')
  }

  if (!item) return null

  const groups = coll === 'vinyl' ? getVinylGroups(item) : getSpiritsGroups(item, coll)
  const title  = coll === 'vinyl' ? item.album   : (item.name || item.version || item.brand)
  const sub    = coll === 'vinyl' ? item.artista  : `${item.brand} · ${item.country || ''}`
  const url    = item.url

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>

        {/* ── Header ── */}
        <div className={`${styles.hdr} ${styles[coll]}`}>
          <div className={styles.icon}>
            {item.cover_url
              ? <img src={item.cover_url} alt={title} />
              : coll === 'vinyl'
                ? <VinylIcon agrupador={item.agrupador} artista={item.artista} />
                : '🥃'
            }
          </div>
          <div className={styles.hdrText}>
            <h2>{title}</h2>
            <p>{sub}</p>
            {/* Pills rápidas en el header */}
            <div className={styles.hdrPills}>
              {coll === 'vinyl' && item.agrupador && <span className={styles.hdrPill}>{item.agrupador}</span>}
              {coll === 'vinyl' && item.anio      && <span className={styles.hdrPillYear}>{item.anio}</span>}
              {coll !== 'vinyl' && item.type      && <span className={styles.hdrPill}>{item.type}</span>}
              {coll !== 'vinyl' && item.country   && <span className={styles.hdrPillYear}>{item.country}</span>}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>

          {/* ── Grupos de campos ── */}
          {groups.map(({ label, rows }) => (
            <div key={label} className={styles.group}>
              <div className={styles.groupLabel}>{label}</div>
              {rows.map((row, ri) => (
                <div key={ri} className={styles.row}>
                  {row.map(([lbl, val]) => val ? (
                    <div key={lbl} className={styles.cell}>
                      <span className={styles.cellLbl}>{lbl}</span>
                      <span className={styles.cellVal}>{val}</span>
                    </div>
                  ) : null)}
                </div>
              ))}
            </div>
          ))}

          {/* ── ENLT lo posteó ── */}
          {coll === 'vinyl' && (item.tiktok_url || item.ig_url) && (
            <div className={styles.enltSection}>
              <div className={styles.enltLabel}>
                <span className={styles.enltDot} />
                En Las Nubes Trepao lo posteó
              </div>
              <div className={styles.enltEmbeds}>
                {item.tiktok_url && (
                  <div className={styles.enltEmbed}>
                    <iframe
                      src={tiktokEmbedUrl(item.tiktok_url)}
                      width="100%" height="700" frameBorder="0"
                      allow="autoplay; clipboard-write" loading="lazy"
                      className={styles.enltFrame} scrolling="no"
                    />
                    <a href={item.tiktok_url} target="_blank" rel="noreferrer" className={styles.enltLink}>
                      Ver en TikTok ↗
                    </a>
                  </div>
                )}
                {item.ig_url && (
                  <div className={styles.enltEmbed}>
                    <iframe
                      src={igEmbedUrl(item.ig_url)}
                      width="100%" height="540" frameBorder="0"
                      scrolling="no" allow="autoplay; clipboard-write; encrypted-media"
                      loading="lazy" className={styles.enltFrame}
                    />
                    <a href={item.ig_url} target="_blank" rel="noreferrer" className={styles.enltLink}>
                      Ver en Instagram ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Player Spotify ── */}
          {coll === 'vinyl' && showPlayer && spotifyId && (
            <div className={styles.spotifyWrap}>
              <iframe
                src={spotifyEmbedUrl(spotifyId)}
                width="100%" height="152" frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy" className={styles.spotifyFrame}
              />
            </div>
          )}
          {spotifyMsg && <p className={styles.spotifyMsg}>{spotifyMsg}</p>}

          {/* ── Acciones — dos filas claras ── */}
          <div className={styles.actionsWrap}>

            {/* Fila 1: acciones principales de contenido */}
            <div className={styles.actionsRow}>
              {coll === 'vinyl' && (
                <button
                  className={`${styles.btn} ${showPlayer ? styles.btnSpotifyActive : styles.btnSpotify}`}
                  onClick={handleSpotify} disabled={fetchingSpot}
                >
                  {fetchingSpot ? '⏳' : showPlayer ? '⏹ Cerrar player' : spotifyId ? '▶ Escuchar' : '🎵 Buscar en Spotify'}
                </button>
              )}
              {coll === 'vinyl' && index >= 0 && (
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleShare}>
                  {copied ? '✅ Copiado' : '🔗 Compartir'}
                </button>
              )}
              {coll === 'vinyl' && index >= 0 && (
                <button className={`${styles.btn} ${styles.btnIg}`} onClick={handleIgStory} title="Compartir en IG Stories">
                  <IgIcon /> IG Stories
                </button>
              )}
              {coll === 'vinyl'
                ? <a
                    href={url || `https://www.discogs.com/search/?q=${encodeURIComponent(`${item.artista} ${item.album}`)}&type=master`}
                    target="_blank" rel="noreferrer"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >🔗 Discogs</a>
                : url && (
                    <a href={url} target="_blank" rel="noreferrer"
                      className={`${styles.btn} ${styles.btnPrimary} ${styles[coll]}`}>
                      🌐 Sitio oficial
                    </a>
                  )
              }
            </div>

            {/* Fila 2: acciones admin */}
            <div className={styles.actionsRow}>
              {onSetFeatured && (
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => onSetFeatured(item, index)}>
                  ⭐ Destacar del mes
                </button>
              )}
              {onEdit && (
                <button className={`${styles.btn} ${styles.btnPrimary} ${styles[coll]}`} onClick={onEdit}>
                  ✏ Editar
                </button>
              )}
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
                Cerrar
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers de URL embed ──────────────────────────────────────────────────────
function spotifyEmbedUrl(id) {
  if (!id) return null
  if (id.includes('/')) return `https://open.spotify.com/embed/${id}?utm_source=generator&theme=0`
  return `https://open.spotify.com/embed/album/${id}?utm_source=generator&theme=0`
}
function tiktokEmbedUrl(url) {
  if (!url) return null
  const match = url.match(/\/video\/(\d+)/)
  if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`
  return url
}
function igEmbedUrl(url) {
  if (!url) return null
  return `${url.replace(/\?.*$/, '').replace(/\/$/, '')}/embed/`
}

// ── Grupos de campos por colección ───────────────────────────────────────────
function getVinylGroups(item) {
  return [
    {
      label: 'Música',
      rows: [
        [['Género', item.genero], ['Categoría', item.agrupador]],
      ]
    },
    {
      label: 'Disco físico',
      rows: [
        [['Sello', item.sello], ['País sello', item.pais_sello]],
        [['País prensado', item.pais], ['Cat. Nº', item.cat_num]],
      ]
    },
    {
      label: 'Colección',
      rows: [
        [
          ['Origen', item.origen],
          ['Prestado', item.fuera ? '📤 Sí' : null],
          ['Discogs', item.discogs ? '🔗 Sí' : null],
        ]
      ]
    }
  ]
}

function getSpiritsGroups(item, coll) {
  if (coll === 'rum') return [
    {
      label: 'Producción',
      rows: [
        [['Tipo', item.type], ['País', item.country]],
        [['Región', item.region], ['Blend', item.blend]],
        [['Edad mín.', item.age_low ? `${item.age_low} años` : null], ['Edad máx.', item.age_max ? `${item.age_max} años` : null]],
        [['ABV', item.abv ? `${item.abv}%` : null], ['Escala', item.scale ? '★'.repeat(Math.round(item.scale)) + ` (${item.scale})` : null]],
      ]
    },
    {
      label: 'Colección',
      rows: [
        [['Ya consumí', item.terminado ? '🫗 Sí' : null]],
      ]
    }
  ]
  return [
    {
      label: 'Producción',
      rows: [
        [['Tipo', item.type], ['País', item.country]],
        [['Región', item.region], ['Origen', item.origin]],
        [['Destilería', item.distillery], ['Años', item.years ? `${item.years} años` : 'NAS']],
        [['ABV', item.abv ? `${item.abv}%` : null]],
      ]
    },
    {
      label: 'Colección',
      rows: [
        [['Ya consumí', item.terminado ? '🫗 Sí' : null]],
      ]
    }
  ]
}

// ── Ícono Instagram SVG ───────────────────────────────────────────────────────
function IgIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

// ── Vinyl icon ────────────────────────────────────────────────────────────────
const LABEL_COLORS = {
  'Salsa/Latina':'#c0392b','Jazz/Bigband/Sountracks/Swing':'#1a5276',
  'Voices':'#7d3c98','SonCubano/Bolero/Mambo':'#d35400',
  'Rock':'#1e8449','Tropical/Bailable/Parrandera':'#e67e22',
  'Balada/Pop/Romantica':'#2980b9','Hip-Hop/Rap':'#17202a',
}
function VinylIcon({ agrupador, artista }) {
  const clr = LABEL_COLORS[agrupador] || '#555'
  return (
    <div style={{
      width:'100%',height:'100%',borderRadius:'50%',
      background:'conic-gradient(#1a1a1a 0,#222 15deg,#1a1a1a 30deg,#222 45deg,#1a1a1a 60deg,#222 75deg,#1a1a1a 90deg,#222 105deg,#1a1a1a 120deg,#222 135deg,#1a1a1a 150deg,#222 165deg,#1a1a1a 180deg,#222 195deg,#1a1a1a 210deg,#222 225deg,#1a1a1a 240deg,#222 255deg,#1a1a1a 270deg,#222 285deg,#1a1a1a 300deg,#222 315deg,#1a1a1a 330deg,#222 345deg)',
      display:'flex',alignItems:'center',justifyContent:'center',
    }}>
      <div style={{
        width:'44%',height:'44%',borderRadius:'50%',background:clr,
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:'.45rem',fontWeight:700,color:'#fff',textAlign:'center',padding:'3px',
      }}>
        {(artista||'').substring(0,12)}
      </div>
    </div>
  )
}
