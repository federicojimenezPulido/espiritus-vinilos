import { useEffect, useState, Suspense, lazy } from 'react'
import { fetchSpotifyId, fetchDiscogsRelease } from '../services/api'
import SocialDrawer from './SocialDrawer'
import { useLang } from '../LangContext'
import styles from './Modal.module.css'

const CountryMiniMap = lazy(() => import('./CountryMiniMap'))

export default function Modal({ item, coll, index, onClose, onEdit, onSetFeatured, onOpenSpotify }) {
  const { t } = useLang()
  const [spotifyId,    setSpotifyId]    = useState(item?.spotify_id || null)
  const [showPlayer,   setShowPlayer]   = useState(false)
  const [fetchingSpot, setFetchingSpot] = useState(false)
  const [spotifyMsg,   setSpotifyMsg]   = useState('')
  const [copied,       setCopied]       = useState(false)
  const [socialDrawer, setSocialDrawer] = useState(null) // { type, url }
  const [igCopied,     setIgCopied]     = useState(false)
  const [tlOpen,       setTlOpen]       = useState(false)
  const [tlData,       setTlData]       = useState(null)   // { tracklist, credits } o null
  const [tlLoading,    setTlLoading]    = useState(false)
  const [tlError,      setTlError]      = useState('')

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    setSpotifyId(item?.spotify_id || null)
    setShowPlayer(false)
    setSpotifyMsg('')
    setTlOpen(false)
    setTlData(null)
    setTlError('')
  }, [item])

  async function handleSpotify() {
    if (spotifyId) { setShowPlayer(p => !p); return }
    setFetchingSpot(true)
    setSpotifyMsg(t('searchingSpotify'))
    try {
      const result = await fetchSpotifyId(index)
      if (result.spotify_id) {
        setSpotifyId(result.spotify_id)
        setShowPlayer(true)
        setSpotifyMsg('')
      } else {
        setSpotifyMsg(t('notFoundSpotify'))
      }
    } catch {
      setSpotifyMsg(t('errorSpotify'))
    } finally {
      setFetchingSpot(false)
    }
  }

  async function handleTracklist() {
    if (tlOpen) { setTlOpen(false); return }
    setTlOpen(true)
    // Si no hay URL de Discogs, solo mostrar créditos manuales (sin fetch)
    if (!item.url || !/discogs\.com\/release\/\d+/.test(item.url)) return
    if (tlData) return  // ya cargado
    if (!localStorage.getItem('discogs_token')) {
      setTlError('no_token')
      return
    }
    setTlLoading(true)
    setTlError('')
    try {
      const result = await fetchDiscogsRelease(item.url)
      if (result.error) {
        setTlError(result.error === 'no token' ? 'no_token' : 'fetch_error')
      } else {
        setTlData(result)
      }
    } catch {
      setTlError('fetch_error')
    } finally {
      setTlLoading(false)
    }
  }

  function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?v=${index}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
    window.open(url, '_blank', 'noopener')
  }

  function handleIgCopy() {
    const url = `${window.location.origin}${window.location.pathname}?v=${index}`
    const text = `🎵 ${item.artista} — ${item.album}${item.anio ? ` (${item.anio})` : ''}\n\nEn Las Nubes Trepao · ${url}`
    navigator.clipboard.writeText(text).then(() => {
      setIgCopied(true)
      setTimeout(() => setIgCopied(false), 2200)
    }).catch(() => {})
  }

  if (!item) return null

  const groups   = coll === 'vinyl' ? getVinylGroups(item, t) : getSpiritsGroups(item, coll, t)
  const title    = coll === 'vinyl' ? item.album   : (item.name || item.version || item.brand)
  const sub      = coll === 'vinyl' ? item.artista  : `${item.brand} · ${item.country || ''}`
  const url      = item.url
  const hasNotes = coll === 'vinyl' && !!item.notes

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.box} ${hasNotes ? styles.boxWide : ''}`}>

        {/* ── Header ── */}
        {coll === 'vinyl' ? (
          <div className={`${styles.hdr} ${styles.vinyl}`}>
            <div className={styles.icon}>
              {item.cover_url
                ? <img src={item.cover_url} alt={title} />
                : <VinylIcon agrupador={item.agrupador} artista={item.artista} />
              }
            </div>
            <div className={styles.hdrText}>
              <h2>{title}</h2>
              <p>{sub}</p>
              <div className={styles.hdrPills}>
                {item.agrupador && <span className={styles.hdrPill}>{item.agrupador}</span>}
                {item.anio      && <span className={styles.hdrPillYear}>{item.anio}</span>}
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        ) : (
          /* ── Spirit header — cinemático ── */
          <div className={`${styles.spiritHdr} ${styles[coll]}`}>
            <div className={styles.spiritHdrBg}>
              <img
                src={coll === 'rum' ? '/hero-1.png' : '/hero-2.png'}
                alt=""
                className={styles.spiritHdrBgImg}
              />
              <div className={styles.spiritHdrBgOverlay} />
            </div>
            {item.cover_url && (
              <img src={item.cover_url} alt={title} className={styles.spiritHdrBottle} />
            )}
            <button className={styles.closeBtn} style={{ zIndex: 2 }} onClick={onClose}>✕</button>
            <div className={styles.spiritHdrContent}>
              <div className={styles.hdrPills}>
                {item.type    && <span className={styles.hdrPill}>{item.type}</span>}
                {item.country && <span className={styles.hdrPillYear}>{item.country}</span>}
                {item.abv     && <span className={styles.hdrPillYear}>{item.abv}%</span>}
                {coll === 'rum' && (item.age_low || item.age_max) && (
                  <span className={styles.hdrPillYear}>
                    {item.age_low}{item.age_max && item.age_max !== item.age_low ? `–${item.age_max}` : ''} {t('yearsUnit')}
                  </span>
                )}
                {coll === 'whisky' && item.years !== undefined && (
                  <span className={styles.hdrPillYear}>{item.years > 0 ? `${item.years} ${t('yearsUnit')}` : 'NAS'}</span>
                )}
              </div>
              <h2 className={styles.spiritHdrTitle}>{title}</h2>
              <p className={styles.spiritHdrSub}>{item.brand}{item.country ? ` · ${item.country}` : ''}</p>
            </div>
          </div>
        )}

        {/* ── Content grid — 2 columnas cuando hay notas ── */}
        <div className={hasNotes ? styles.contentGrid : undefined}>

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

          {/* ── Mini-mapa de origen — solo rones y whiskies ── */}
          {coll !== 'vinyl' && item.country && (
            <div className={styles.mapRow}>
              <Suspense fallback={<div className={styles.mapLoading} />}>
                <CountryMiniMap country={item.country} coll={coll} />
              </Suspense>
            </div>
          )}

          {/* ── ¿Dónde comprar? ── */}
          {coll !== 'vinyl' && item.buy_url && (
            <div className={styles.buySection}>
              <div className={styles.buyLabel}>{t('whereToBuy')}</div>
              <div className={styles.buyContent}>
                {(item.buy_price || item.buy_currency) && (
                  <span className={styles.buyPrice}>
                    {[item.buy_price, item.buy_currency].filter(Boolean).join(' ')}
                  </span>
                )}
                {item.buy_availability && (
                  <span className={`${styles.buyAvail} ${item.buy_availability?.toLowerCase().includes('stock') ? styles.buyInStock : ''}`}>
                    {item.buy_availability}
                  </span>
                )}
                <a href={item.buy_url} target="_blank" rel="noreferrer" className={styles.buyLink}>
                  {t('viewStore')}
                </a>
              </div>
            </div>
          )}

          {/* ── ENLT lo posteó ── */}
          {coll === 'vinyl' && (item.tiktok_url || item.ig_url) && (
            <div className={styles.enltSection}>
              <div className={styles.enltLabel}>
                <span className={styles.enltDot} />
                {t('enltPosted')}
              </div>
              <div className={styles.enltBtns}>
                {item.tiktok_url && (
                  <button
                    className={`${styles.enltBtn} ${styles.enltBtnTikTok}`}
                    onClick={() => setSocialDrawer({ type: 'tiktok', url: item.tiktok_url })}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
                    {t('viewTikTok')}
                  </button>
                )}
                {item.ig_url && (
                  <button
                    className={`${styles.enltBtn} ${styles.enltBtnIg}`}
                    onClick={() => setSocialDrawer({ type: 'instagram', url: item.ig_url })}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    {t('viewInstagram')}
                  </button>
                )}
              </div>
            </div>
          )}

          {socialDrawer && (
            <SocialDrawer
              type={socialDrawer.type}
              url={socialDrawer.url}
              onClose={() => setSocialDrawer(null)}
            />
          )}

          {/* ── Tracklist Discogs + Créditos manuales ── */}
          {coll === 'vinyl' && (
            (item.url && /discogs\.com\/release\/\d+/.test(item.url)) ||
            (item.credits?.length > 0)
          ) && (
            <div className={styles.tlSection}>
              <button className={styles.tlToggle} onClick={handleTracklist}>
                <span className={styles.tlToggleIcon}>{tlOpen ? '▲' : '▼'}</span>
                {tlOpen
                  ? t('tracklistHide')
                  : (item.url && /discogs\.com\/release\/\d+/.test(item.url))
                    ? t('tracklistLoad')
                    : t('viewCredits')}
              </button>
              {tlOpen && (
                <div className={styles.tlBody}>
                  {tlLoading && (
                    <div className={styles.tlMsg}>{t('tracklistLoading')}</div>
                  )}
                  {!tlLoading && tlError === 'no_token' && (
                    <div className={styles.tlMsg}>{t('tracklistNoToken')}</div>
                  )}
                  {!tlLoading && tlError && tlError !== 'no_token' && (
                    <div className={styles.tlMsg}>{t('tracklistError')}</div>
                  )}
                  {!tlLoading && tlData && (
                    <>
                      {tlData.tracklist.length === 0 && (
                        <div className={styles.tlMsg}>{t('tracklistEmpty')}</div>
                      )}
                      {tlData.tracklist.length > 0 && (
                        <>
                          <div className={styles.tlLabel}>{t('tracklist')}</div>
                          <ol className={styles.tlList}>
                            {tlData.tracklist.filter(tr => tr.type !== 'heading').map((tr, i) => (
                              <li key={i} className={styles.tlTrack}>
                                {tr.position && <span className={styles.tlPos}>{tr.position}</span>}
                                <span className={styles.tlTitle}>{tr.title}</span>
                                {tr.duration && <span className={styles.tlDur}>{tr.duration}</span>}
                              </li>
                            ))}
                          </ol>
                        </>
                      )}
                      {tlData.credits.length > 0 && (
                        <>
                          <div className={styles.tlLabel}>{t('tracklistCredits')}</div>
                          <div className={styles.tlCredits}>
                            {tlData.credits.map((c, i) => (
                              <div key={i} className={styles.tlCredit}>
                                <span className={styles.tlCreditName}>{c.name}</span>
                                <span className={styles.tlCreditRole}>{c.role}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                  {/* Créditos manuales — siempre visibles si existen */}
                  {!tlLoading && item.credits?.length > 0 && (
                    <>
                      <div className={`${styles.tlLabel} ${styles.tlLabelManual}`}>{t('manualCredits')}</div>
                      <div className={styles.tlCredits}>
                        {item.credits.map((c, i) => (
                          <div key={i} className={styles.tlCredit}>
                            <span className={styles.tlCreditName}>{c.name}</span>
                            <span className={styles.tlCreditRole}>{c.role}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {/* Sin Discogs y sin créditos manuales */}
                  {!tlLoading && !tlData && !tlError && item.credits?.length === 0 && (
                    <div className={styles.tlMsg}>{t('tracklistEmpty')}</div>
                  )}
                </div>
              )}
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
              {onOpenSpotify && (
                <button className={styles.spotifyCorrect} onClick={() => onOpenSpotify(item, index)}>
                  {t('wrongAlbum')}
                </button>
              )}
            </div>
          )}
          {spotifyMsg && <p className={styles.spotifyMsg}>{spotifyMsg}</p>}

          {/* ── Acciones ── */}
          <div className={styles.actionsWrap}>

            {/* Acción primaria — ancho completo */}
            {coll === 'vinyl' && (
              <button
                className={`${styles.btn} ${showPlayer ? styles.btnSpotifyActive : styles.btnSpotify} ${styles.btnFull}`}
                onClick={handleSpotify} disabled={fetchingSpot}
              >
                {fetchingSpot ? t('searching') : showPlayer ? t('closePlayer') : spotifyId ? t('listenSpotify') : t('searchSpotify')}
              </button>
            )}
            {coll !== 'vinyl' && url && (
              <a href={url} target="_blank" rel="noreferrer"
                className={`${styles.btn} ${styles.btnPrimary} ${styles[coll]} ${styles.btnFull}`}>
                {t('viewSite')}
              </a>
            )}

            {/* Grid secundario — acciones de contenido */}
            {coll === 'vinyl' && index >= 0 && (
              <div className={styles.actionsGrid}>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleShare}>
                  {copied ? t('copied') : t('share')}
                </button>

                <a
                  href={url || `https://www.discogs.com/search/?q=${encodeURIComponent(`${item.artista} ${item.album}`)}&type=master`}
                  target="_blank" rel="noreferrer"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                >🔗 {t('discogs')}</a>
              </div>
            )}

            {/* Grid admin — separado visualmente */}
            <div className={styles.actionsAdmin}>
              {onSetFeatured && (
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => onSetFeatured(item, index)}>
                  {t('feature')}
                </button>
              )}
              {onEdit && (
                <button className={`${styles.btn} ${styles.btnPrimary} ${styles[coll]}`} onClick={onEdit}>
                  {t('edit')}
                </button>
              )}
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
                {t('close')}
              </button>
            </div>

          </div>
        </div>

        {/* ── Panel editorial derecho ── */}
        {hasNotes && (
          <div className={styles.notesPanel}>
            <span className={styles.notesPanelLabel}>Notas editoriales</span>
            <span className={styles.notesMark}>❝</span>
            <p className={styles.notesText}>{item.notes}</p>
          </div>
        )}

        </div>{/* end contentGrid */}
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
function getVinylGroups(item, t) {
  return [
    {
      label: t('music'),
      rows: [
        [[t('genre'), item.genero], [t('category'), item.agrupador]],
      ]
    },
    {
      label: t('physicalDisc'),
      rows: [
        [[t('label'), item.sello], [t('labelCountry'), item.pais_sello]],
        [[t('pressedCountry'), item.pais], [t('catNum'), item.cat_num]],
      ]
    },
    {
      label: t('collection'),
      rows: [
        [
          [t('origin'), item.origen],
          [t('lent'), item.fuera ? '📤 Sí' : null],
          [t('discogs'), item.discogs ? '🔗 Sí' : null],
        ]
      ]
    }
  ]
}

function getSpiritsGroups(item, coll, t) {
  const yearsLabel = t('years').replace(' (0 = NAS)', '')
  if (coll === 'rum') return [
    {
      label: t('production'),
      rows: [
        [[t('type'), item.type], [t('country'), item.country]],
        [[t('region'), item.region], [t('blend'), item.blend]],
        [[t('ageMin'), item.age_low ? `${item.age_low} ${yearsLabel}` : null], [t('ageMax'), item.age_max ? `${item.age_max} ${yearsLabel}` : null]],
        [['ABV', item.abv ? `${item.abv}%` : null], [t('scale'), item.scale ? '★'.repeat(Math.round(item.scale)) + ` (${item.scale})` : null]],
      ]
    },
    {
      label: t('collection'),
      rows: [
        [[t('finished'), item.terminado ? '🫗 Sí' : null]],
      ]
    }
  ]
  return [
    {
      label: t('production'),
      rows: [
        [[t('type'), item.type], [t('country'), item.country]],
        [[t('region'), item.region], [t('origin'), item.origin]],
        [[t('distillery'), item.distillery], [yearsLabel, item.years ? `${item.years} ${yearsLabel}` : 'NAS']],
        [['ABV', item.abv ? `${item.abv}%` : null]],
      ]
    },
    {
      label: t('collection'),
      rows: [
        [[t('finished'), item.terminado ? '🫗 Sí' : null]],
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
