import { useState, useEffect } from 'react'
import { fetchSpotifyId } from '../services/api'
import { useLang } from '../LangContext'
import styles from './ShareView.module.css'

function spotifyEmbedUrl(id) {
  if (!id) return null
  if (id.includes('/')) return `https://open.spotify.com/embed/${id}?utm_source=generator&theme=0`
  return `https://open.spotify.com/embed/album/${id}?utm_source=generator&theme=0`
}

const LABEL_COLORS = {
  'Salsa/Latina':                   '#c0392b',
  'Jazz/Bigband/Sountracks/Swing':  '#1a5276',
  'Voices':                         '#7d3c98',
  'SonCubano/Bolero/Mambo':         '#d35400',
  'Rock':                           '#1e8449',
  'Tropical/Bailable/Parrandera':   '#e67e22',
  'Balada/Pop/Romantica':           '#2980b9',
  'Hip-Hop/Rap':                    '#17202a',
}

export default function ShareView({ item, index, onClose, onOpenCollection }) {
  const [spotifyId,  setSpotifyId]  = useState(item?.spotify_id || null)
  const [fetching,   setFetching]   = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [spinning,   setSpinning]   = useState(false)
  const { t } = useLang()

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => { setSpinning(showPlayer) }, [showPlayer])

  async function handleSpotify() {
    if (spotifyId) { setShowPlayer(p => !p); return }
    setFetching(true)
    try {
      const res = await fetchSpotifyId(index)
      if (res.spotify_id) { setSpotifyId(res.spotify_id); setShowPlayer(true) }
    } catch { /* silencioso */ }
    finally { setFetching(false) }
  }

  const accentColor = LABEL_COLORS[item.agrupador] || '#1DB954'

  return (
    <div className={styles.root}>
      {item.cover_url
        ? <div className={styles.bgImg} style={{ backgroundImage: `url(${item.cover_url})` }} />
        : <div className={styles.bgGrad} style={{ '--accent': accentColor }} />
      }
      <div className={styles.bgVeil} />

      <header className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} style={{ background: accentColor }} />
          <span className={styles.brandName}>En Las Nubes Trepao</span>
        </div>
        <button className={styles.closeBtn} onClick={onClose} title={t('close')}>✕</button>
      </header>

      <main className={styles.stage}>
        <div className={styles.discSection}>
          <div className={`${styles.disc} ${spinning ? styles.spin : ''}`}>
            {[38, 44, 50, 56, 62, 68, 74, 80, 86, 92, 98].map(r => (
              <div key={r} className={styles.groove} style={{ width: `${r}%`, height: `${r}%` }} />
            ))}
            <div className={styles.label} style={{ background: accentColor }}>
              {item.cover_url
                ? <img src={item.cover_url} alt={item.album} className={styles.labelImg} />
                : <span className={styles.labelInitials}>{(item.artista || '').substring(0, 2).toUpperCase()}</span>
              }
            </div>
            <div className={styles.hole} />
          </div>
          <div className={styles.discShadow} />
        </div>

        <div className={styles.infoPanel}>
          <p className={styles.fromLabel}>{t('sharedFrom')}</p>
          <h1 className={styles.albumTitle}>{item.album}</h1>
          <h2 className={styles.artistName}>{item.artista}</h2>

          <div className={styles.pills}>
            {item.agrupador && (
              <span className={styles.pillAccent} style={{ borderColor: accentColor, color: accentColor }}>
                {item.agrupador}
              </span>
            )}
            {item.anio  && <span className={styles.pill}>{item.anio}</span>}
            {item.pais  && <span className={styles.pill}>🌍 {item.pais}</span>}
            {item.sello && <span className={styles.pill}>{item.sello}</span>}
          </div>

          {showPlayer && spotifyId && (
            <div className={styles.playerWrap}>
              <iframe
                src={spotifyEmbedUrl(spotifyId)}
                width="100%" height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ display: 'block', borderRadius: '12px' }}
              />
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={styles.btnPlay}
              style={{ background: accentColor }}
              onClick={handleSpotify}
              disabled={fetching}
            >
              {fetching ? t('searching') : showPlayer ? t('closePlayer') : t('listenAlbum')}
            </button>
            <button className={styles.btnCollection} onClick={onOpenCollection}>
              {t('viewInCollection')}
            </button>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>{t('collectionSubtitle')}</span>
        <span className={styles.footerDot}>·</span>
        <span>{item.genero && `${item.genero} · `}{item.origen && `${t('origin')}: ${item.origen}`}</span>
      </footer>
    </div>
  )
}
