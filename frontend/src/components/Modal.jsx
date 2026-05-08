import { useEffect, useState, Suspense, lazy } from 'react'
import { fetchDiscogsRelease } from '../services/api'
import { vinylSlug, rumSlug, whiskeySlug } from '../utils/slugify.js'
import SocialDrawer from './SocialDrawer'
import { useLang } from '../LangContext'
import styles from './Modal.module.css'

const CountryMiniMap = lazy(() => import('./CountryMiniMap'))

export default function Modal({ item, coll, index, onClose, onEdit, onSetFeatured, onOpenSpotify }) {
  const { t } = useLang()
  const [spotifyId,    setSpotifyId]    = useState(item?.spotify_id || null)
  const [copied,       setCopied]       = useState(false)
  const [socialDrawer, setSocialDrawer] = useState(null)
  const [tlOpen,       setTlOpen]       = useState(false)
  const [tlData,       setTlData]       = useState(null)
  const [tlLoading,    setTlLoading]    = useState(false)
  const [tlError,      setTlError]      = useState('')
  const [mapOpen,      setMapOpen]      = useState(false)

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Bloquear scroll del body en iOS cuando el modal está abierto
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    setSpotifyId(item?.spotify_id || null)
    setTlOpen(false)
    setTlData(null)
    setTlError('')
  }, [item])

  async function handleTracklist() {
    if (tlOpen) { setTlOpen(false); return }
    setTlOpen(true)
    if (!item.url || !/discogs\.com\/release\/\d+/.test(item.url)) return
    if (tlData) return
    if (!localStorage.getItem('discogs_token')) { setTlError('no_token'); return }
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
    let shareUrl
    if (coll === 'vinyl') {
      shareUrl = `${window.location.origin}/vinilos/${vinylSlug(item)}/`
    } else {
      const slug = coll === 'rum' ? rumSlug(item) : whiskeySlug(item)
      const base = coll === 'rum' ? '/rones' : '/whiskies'
      shareUrl = `${window.location.origin}${base}/${slug}/`
    }
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
    window.open(shareUrl, '_blank', 'noopener')
  }

  if (!item) return null

  const groups  = coll === 'vinyl' ? getVinylGroups(item, t) : getSpiritsGroups(item, coll, t)
  const title   = coll === 'vinyl' ? item.album : (item.name || item.version || item.brand)
  const url     = item.url
  const hasNotes = coll === 'vinyl' && !!item.notes

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>

        {/* ── Hero ── */}
        <div className={`${styles.spiritHdr} ${styles[coll]}`}>
          <div className={styles.spiritHdrBg}>
            {coll === 'vinyl' ? (
              item.cover_url
                ? <img src={item.cover_url} alt="" className={`${styles.spiritHdrBgImg} ${styles.vinylHdrBgImg}`} />
                : <div className={styles.vinylHdrFallback} />
            ) : (
              <img src={coll === 'rum' ? '/hero-1.png' : '/hero-2.png'} alt="" className={styles.spiritHdrBgImg} />
            )}
            <div className={styles.spiritHdrBgOverlay} />
          </div>
          {coll !== 'vinyl' && item.cover_url && (
            <img src={item.cover_url} alt={title} className={styles.spiritHdrBottle} />
          )}
          {coll !== 'vinyl' && item.cover_url && (
            <img src={item.cover_url} alt="" className={styles.spiritHdrBgCover} />
          )}
          <button className={styles.closeBtn} style={{ zIndex: 2 }} onClick={onClose}>✕</button>

          {coll === 'vinyl' ? (
            <div className={styles.vinylHdrContent}>
              <div className={styles.vinylHdrCoverWrap}>
                {item.cover_url
                  ? <img src={item.cover_url} alt={title} className={styles.vinylHdrCoverImg} />
                  : <VinylIcon agrupador={item.agrupador} artista={item.artista} />
                }
              </div>
              <div className={styles.vinylHdrText}>
                <div className={styles.hdrPills}>
                  {item.agrupador && <span className={styles.hdrPill}>{item.agrupador}</span>}
                  {item.anio      && <span className={styles.hdrPillYear}>{item.anio}</span>}
                </div>
                <h2 className={styles.spiritHdrTitle}>{title}</h2>
                <p className={styles.spiritHdrSub}>{item.artista}</p>
              </div>
            </div>
          ) : (
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
          )}
        </div>

        {/* ── Body: siempre 2 columnas ── */}
        <div className={styles.body}>

          {/* ── Izquierda: exploración ── */}
          <div className={styles.dataCol}>

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

            {/* Mapa — spirits */}
            {coll !== 'vinyl' && item.country && (
              <div className={styles.mapSection}>
                <button className={styles.mapToggle} onClick={() => setMapOpen(o => !o)}>
                  <span className={styles.mapToggleIcon}>{mapOpen ? '▲' : '▼'}</span>
                  {mapOpen ? 'Ocultar mapa' : `Ver en mapa · ${item.country}`}
                </button>
                {mapOpen && (
                  <div className={styles.mapRow}>
                    <Suspense fallback={<div className={styles.mapLoading} />}>
                      <CountryMiniMap country={item.country} coll={coll} />
                    </Suspense>
                  </div>
                )}
              </div>
            )}

            {/* Dónde comprar — spirits */}
            {coll !== 'vinyl' && item.buy_url && (
              <div className={styles.buySection}>
                <div className={styles.buyLabel}>{t('whereToBuy')}</div>
                <div className={styles.buyContent}>
                  {(item.buy_price || item.buy_currency) && (
                    <span className={styles.buyPrice}>
                      {formatPrice(item.buy_price, item.buy_currency)}
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

            {/* Tracklist — vinyl */}
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
                    {tlLoading && <div className={styles.tlMsg}>{t('tracklistLoading')}</div>}
                    {!tlLoading && tlError === 'no_token' && <div className={styles.tlMsg}>{t('tracklistNoToken')}</div>}
                    {!tlLoading && tlError && tlError !== 'no_token' && <div className={styles.tlMsg}>{t('tracklistError')}</div>}
                    {!tlLoading && tlData && (
                      <>
                        {tlData.tracklist.length === 0 && <div className={styles.tlMsg}>{t('tracklistEmpty')}</div>}
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
                    {!tlLoading && !tlData && !tlError && item.credits?.length === 0 && (
                      <div className={styles.tlMsg}>{t('tracklistEmpty')}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notas editoriales — al final de la columna izquierda */}
            {hasNotes && (
              <div className={styles.notesInline}>
                <span className={styles.notesPanelLabel}>Notas editoriales</span>
                <span className={styles.notesMark}>❝</span>
                <p className={styles.notesText}>{item.notes}</p>
              </div>
            )}

          </div>{/* end dataCol */}

          {/* ── Derecha: acción ── */}
          <div className={styles.actionsPanel}>

            {/* Compartir */}
            {index >= 0 && (
              <button
                className={`${styles.btn} ${styles.btnShare} ${styles.btnFull}`}
                onClick={handleShare}
              >
                {copied ? '✓ Enlace copiado' : '↗ Compartir'}
              </button>
            )}

            {/* CTAs */}
            <div className={styles.ctaLinks}>
              {coll === 'vinyl' && (
                <a
                  href={spotifyId
                    ? `https://open.spotify.com/album/${spotifyId}`
                    : `https://open.spotify.com/search/${encodeURIComponent(`${item.artista} ${item.album}`)}`}
                  target="_blank" rel="noreferrer"
                  className={`${styles.ctaCard} ${styles.ctaCardSpotify}`}
                >
                  <span className={styles.ctaIcon}>▶</span>
                  <span className={styles.ctaText}>
                    <span className={styles.ctaTitle}>Escuchar en Spotify</span>
                    <span className={styles.ctaDesc}>Abrí el álbum completo en tu app</span>
                  </span>
                  <span className={styles.ctaArrow}>↗</span>
                </a>
              )}
              {coll === 'vinyl' && (
                <a
                  href={url || `https://www.discogs.com/search/?q=${encodeURIComponent(`${item.artista} ${item.album}`)}&type=master`}
                  target="_blank" rel="noreferrer"
                  className={styles.ctaCard}
                >
                  <span className={styles.ctaIcon}>🔗</span>
                  <span className={styles.ctaText}>
                    <span className={styles.ctaTitle}>Discogs</span>
                    <span className={styles.ctaDesc}>Ficha técnica, prensajes y comunidad</span>
                  </span>
                  <span className={styles.ctaArrow}>↗</span>
                </a>
              )}
              {coll === 'vinyl' && (
                <a
                  href={`/vinilos/${vinylSlug(item)}/`}
                  target="_blank" rel="noreferrer"
                  className={styles.ctaCard}
                >
                  <span className={styles.ctaIcon}>📄</span>
                  <span className={styles.ctaText}>
                    <span className={styles.ctaTitle}>Página del álbum</span>
                    <span className={styles.ctaDesc}>Notas editoriales y recomendaciones</span>
                  </span>
                  <span className={styles.ctaArrow}>↗</span>
                </a>
              )}
              {coll !== 'vinyl' && url && (
                <a href={url} target="_blank" rel="noreferrer" className={styles.ctaCard}>
                  <span className={styles.ctaIcon}>🔗</span>
                  <span className={styles.ctaText}>
                    <span className={styles.ctaTitle}>Más información</span>
                    <span className={styles.ctaDesc}>Ficha técnica y detalles del producto</span>
                  </span>
                  <span className={styles.ctaArrow}>↗</span>
                </a>
              )}
              {coll !== 'vinyl' && (
                <a
                  href={coll === 'rum' ? `/rones/${rumSlug(item)}/` : `/whiskies/${whiskeySlug(item)}/`}
                  target="_blank" rel="noreferrer"
                  className={styles.ctaCard}
                >
                  <span className={styles.ctaIcon}>📄</span>
                  <span className={styles.ctaText}>
                    <span className={styles.ctaTitle}>Página del spirit</span>
                    <span className={styles.ctaDesc}>Notas editoriales y maridajes</span>
                  </span>
                  <span className={styles.ctaArrow}>↗</span>
                </a>
              )}
            </div>

            {/* ENLT lo posteó */}
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

            {/* Spacer — empuja admin al fondo */}
            <div className={styles.actionsSpacer} />

            {/* Admin */}
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

          </div>{/* end actionsPanel */}

        </div>{/* end body */}

        {socialDrawer && (
          <SocialDrawer
            type={socialDrawer.type}
            url={socialDrawer.url}
            onClose={() => setSocialDrawer(null)}
          />
        )}

      </div>
    </div>
  )
}

// ── Formato de precio ────────────────────────────────────────────────────────
function formatPrice(price, currency) {
  if (!price) return null
  const num = parseFloat(price)
  if (isNaN(num)) return `${price}${currency ? ' ' + currency : ''}`
  if (currency === 'COP') return `$${num.toLocaleString('es-CO')} COP`
  if (currency === 'USD') return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
  if (currency === 'EUR') return `€${num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
  return `${num.toLocaleString()} ${currency || ''}`.trim()
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
