import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getVinyls, getRums, getWhiskies } from '../services/api'
import SearchBar from './SearchBar'
import Sidebar   from './Sidebar'
import Modal     from './Modal'
import AdminForm from './AdminForm'
import PinModal  from './PinModal'
import StatsView      from './StatsView'
import CrateView      from './CrateView'
import AtlasView      from './AtlasView'
import SpotifyModal   from './SpotifyModal'
import FeaturedBanner, { setFeatured, getFeatured } from './FeaturedBanner'
import ShareView      from './ShareView'
import SocialDrawer   from './SocialDrawer'
import { useLang }    from '../LangContext'
import styles         from './Dashboard.module.css'

const FETCHERS = { vinyl: getVinyls, rum: getRums, whisky: getWhiskies }

const COLL_LABELS = { vinyl: 'Vinilos', rum: 'Rones', whisky: 'Whiskies' }
const VIEW_LABELS  = { collection: null, stats: 'Estadísticas', crate: 'Anaquel', atlas: 'Atlas' }

function Breadcrumb({ coll, view, activeFilters }) {
  const viewLabel = VIEW_LABELS[view]
  return (
    <nav className={styles.breadcrumb} aria-label="Ubicación">
      <span className={`${styles.bcRoot} ${styles[coll]}`}>{COLL_LABELS[coll]}</span>
      {viewLabel && (
        <><span className={styles.bcSep}>›</span><span className={styles.bcCrumb}>{viewLabel}</span></>
      )}
      {!viewLabel && activeFilters.length > 0 && (
        <>
          <span className={styles.bcSep}>›</span>
          <span className={styles.bcCrumb}>{activeFilters[0][1]}</span>
          {activeFilters.length > 1 && (
            <span className={styles.bcMore}>+{activeFilters.length - 1}</span>
          )}
        </>
      )}
    </nav>
  )
}

export default function Dashboard({ coll, pinIsSet }) {
  const { t } = useLang()
  const [search,      setSearch]      = useState('')
  const [filters,     setFilters]     = useState({})
  const [selected,    setSelected]    = useState(null)
  const [adminItem,   setAdminItem]   = useState(undefined)
  const [adminIndex,  setAdminIndex]  = useState(-1)   // índice capturado al abrir — no se recalcula
  const [pinAction,   setPinAction]   = useState(null)
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [view,         setView]         = useState('collection')
  const [statsDetail,  setStatsDetail]  = useState(null)
  const [spotifyItem,  setSpotifyItem]  = useState(null) // { item, index }
  const [featuredVer,  setFeaturedVer]  = useState(0)    // bump to re-render banner
  const [shareItem,    setShareItem]    = useState(null) // { item, index } — ShareView cinematográfica
  const [sortBy,       setSortBy]       = useState('artista') // 'artista' | 'default'
  const [socialDrawer, setSocialDrawer] = useState(null)     // { type: 'tiktok'|'instagram', url }

  const { data, isLoading, isError } = useQuery({
    queryKey: [coll],
    queryFn: FETCHERS[coll],
  })

  // Auto-open ShareView desde ?v=INDEX
  useEffect(() => {
    if (!data) return
    const params = new URLSearchParams(window.location.search)
    const vIdx = params.get('v')
    if (vIdx !== null && coll === 'vinyl') {
      const idx = parseInt(vIdx)
      if (!isNaN(idx) && idx >= 0 && idx < data.length) {
        setShareItem({ item: data[idx], index: idx })
      }
    }
  }, [data, coll])

  // Resetear vista y filtros al cambiar de colección
  useEffect(() => {
    setView('collection')
    setFilters({})
    setSearch('')
    setSelected(null)
    setStatsDetail(null)
  }, [coll])

  // Listen for featured-changed events (clear or set from other components)
  useEffect(() => {
    const handler = () => setFeaturedVer(v => v + 1)
    window.addEventListener('featured-changed', handler)
    return () => window.removeEventListener('featured-changed', handler)
  }, [])

  function setFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function clearAll() {
    setSearch('')
    setFilters({})
  }

  const filtered = useMemo(() => {
    if (!data) return []
    let result = data
    Object.entries(filters).forEach(([key, val]) => {
      if (!val) return
      if (key === 'decade') {
        result = result.filter(r => {
          const y = parseInt(r.anio)
          if (!r.anio || isNaN(y)) return val === 'Sin año'
          return `${Math.floor(y / 10) * 10}s` === val
        })
      } else {
        result = result.filter(r => r[key] === val)
      }
    })
    if (search.trim()) {
      const s = search.toLowerCase()
      result = result.filter(r => {
        const fields = coll === 'vinyl'
          ? [r.artista, r.album, r.genero, r.sello]
          : [r.brand, r.name || r.version, r.country, r.type]
        return fields.some(f => (f || '').toLowerCase().includes(s))
      })
    }
    if (coll === 'vinyl' && sortBy === 'artista') {
      result = [...result].sort((a, b) =>
        (a.artista || '').localeCompare(b.artista || '', 'es', { sensitivity: 'base' })
      )
    }
    return result
  }, [data, search, filters, coll, sortBy])

  if (isLoading) return <div className={styles.state}>Cargando...</div>
  if (isError)   return <div className={styles.state}>⚠ Error conectando al backend</div>

  const activeFilters = Object.entries(filters).filter(([, v]) => v)
  const hasActive     = activeFilters.length > 0 || search.trim()

  function findIndex(item) {
    if (!data || !item) return -1
    // Igualdad de referencia — los objetos en filtered SON los mismos de data
    // JSON.stringify es frágil si hay diferencias de orden de propiedades
    const byRef = data.findIndex(r => r === item)
    if (byRef !== -1) return byRef
    // Fallback: comparar por artista + album (en caso de que el item venga de otra fuente)
    if (item.artista && item.album) {
      return data.findIndex(r =>
        r.artista === item.artista && r.album === item.album
      )
    }
    if (item.brand && (item.name || item.version)) {
      return data.findIndex(r =>
        r.brand === item.brand && (r.name || r.version) === (item.name || item.version)
      )
    }
    return -1
  }

  function handleBarClick(filterKey, value) {
    let items
    if (filterKey === 'decade') {
      // value = "1970s" → filtrar anio >= 1970 && < 1980
      const decade = parseInt(value)
      items = (data || []).filter(r => {
        const y = parseInt(r.anio)
        return !isNaN(y) && y >= decade && y < decade + 10
      })
    } else {
      items = (data || []).filter(r => r[filterKey] === value)
    }
    setStatsDetail({ title: value, filterKey, value, items })
  }

  function requirePin(label, onSuccess) {
    if (!pinIsSet) {
      alert(t('requirePinMsg'))
      return
    }
    setPinAction({ label, onSuccess })
  }

  return (
    <>
      {/* Social drawer — TikTok / Instagram side panel */}
      {socialDrawer && (
        <SocialDrawer
          type={socialDrawer.type}
          url={socialDrawer.url}
          onClose={() => setSocialDrawer(null)}
        />
      )}

      {/* ShareView — vista cinematográfica para links ?v=INDEX */}
      {shareItem && (
        <ShareView
          item={shareItem.item}
          index={shareItem.index}
          onClose={() => setShareItem(null)}
          onOpenCollection={() => {
            setSelected(shareItem.item)
            setShareItem(null)
          }}
        />
      )}

      {/* Spotify player modal */}
      {spotifyItem && (
        <SpotifyModal
          item={spotifyItem.item}
          index={spotifyItem.index}
          coll={coll}
          onClose={() => setSpotifyItem(null)}
        />
      )}

      {/* Stats drill-down modal */}
      {statsDetail && (
        <div className={styles.detailOverlay} onClick={() => setStatsDetail(null)}>
          <div className={styles.detailBox} onClick={e => e.stopPropagation()}>
            <div className={styles.detailHeader}>
              <div>
                <h2 className={styles.detailTitle}>{statsDetail.title}</h2>
                <p className={styles.detailSub}>{statsDetail.items.length} registros</p>
              </div>
              <button className={styles.detailClose} onClick={() => setStatsDetail(null)}>✕</button>
            </div>
            <div className={styles.detailGrid}>
              {statsDetail.items.map((item, i) => (
                <Card
                  key={i} item={item} coll={coll}
                  onClick={() => { setStatsDetail(null); setSelected(item) }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {pinAction && (
        <PinModal
          action={pinAction.label}
          onSuccess={() => { pinAction.onSuccess(); setPinAction(null) }}
          onCancel={() => setPinAction(null)}
        />
      )}
      {selected && (
        <Modal
          item={selected} coll={coll}
          index={findIndex(selected)}
          onClose={() => setSelected(null)}
          onEdit={() => requirePin('Editar registro', () => { setAdminIndex(findIndex(selected)); setSelected(null); setAdminItem(selected) })}
          onSetFeatured={coll === 'vinyl' ? (item, idx) => {
            requirePin('Destacar disco del mes', () => {
              setFeatured(item, idx)
              setFeaturedVer(v => v + 1)
              setSelected(null)
            })
          } : null}
        />
      )}
      {adminItem !== undefined && (
        <AdminForm
          coll={coll}
          item={adminItem}
          index={adminItem === null ? -1 : adminIndex}
          data={data}
          onClose={() => { setAdminItem(undefined); setAdminIndex(-1) }}
          pinIsSet={pinIsSet}
          onRequestPin={(label, cb) => requirePin(label, cb)}
        />
      )}
      {coll === 'vinyl' && (
        <FeaturedBanner
          key={featuredVer}
          onOpen={item => setSelected(item)}
        />
      )}
      <div className={styles.layout}>
        {/* Sidebar — hidden on mobile unless sidebarOpen */}
        <Sidebar data={data} coll={coll} filters={filters} setFilter={setFilter} isOpen={sidebarOpen} />
        {/* Overlay to close sidebar on mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 149, background: 'rgba(0,0,0,.5)' }}
          />
        )}
        <main className={styles.content}>

          <Breadcrumb coll={coll} view={view} activeFilters={activeFilters} />

          {/* Top bar */}
          <div className={styles.topBar}>
            {/* Mobile: show filter toggle button */}
            <button className={styles.filterToggle} onClick={() => setSidebarOpen(o => !o)}>
              🎚 {t('filters')}
            </button>
            <SearchBar search={search} setSearch={setSearch} coll={coll} />
            {hasActive && (
              <button className={styles.clearBtn} onClick={clearAll}>
                {t('clear')}
              </button>
            )}
            {coll === 'vinyl' && view === 'collection' && (
              <button
                className={styles.sortToggle}
                onClick={() => setSortBy(s => s === 'artista' ? 'default' : 'artista')}
                title={sortBy === 'artista' ? t('sortedByArtist') : t('originalOrder')}
              >
                {sortBy === 'artista' ? t('sortArtist') : t('sortOrder')}
              </button>
            )}
            {coll === 'vinyl'
              ? <button className={styles.viewToggle} onClick={() => setView(v => v === 'collection' ? 'stats' : v === 'stats' ? 'crate' : 'collection')}>
                  {view === 'collection' ? `📊 ${t('stats')}` : view === 'stats' ? `🗄 ${t('crate')}` : `📋 ${t('collection')}`}
                </button>
              : <button className={styles.viewToggle} onClick={() => setView(v => v === 'collection' ? 'stats' : v === 'stats' ? 'atlas' : 'collection')}>
                  {view === 'collection' ? `📊 ${t('stats')}` : view === 'stats' ? `🗺 ${t('atlas')}` : `📋 ${t('collection')}`}
                </button>
            }
            <button className={`${styles.addBtn} ${styles[coll]}`} onClick={() => requirePin(t('addNew'), () => setAdminItem(null))}>
              {t('addNew')}
            </button>
          </div>

          {view === 'crate'
            ? <CrateView
                data={filtered.length < data.length ? filtered : data}
                onSelect={item => setSelected(item)}
              />
            : view === 'atlas'
            ? <AtlasView
                data={data}
                coll={coll}
                onSelect={item => setSelected(item)}
              />
            : view === 'stats'
            ? <StatsView
                data={filtered.length < data.length ? filtered : data}
                coll={coll}
                onBarClick={handleBarClick}
                onStatClick={(title, items) => setStatsDetail({ title, items })}
              />
            : <>
                {/* Migas de pan — filtros activos */}
                {hasActive && (
                  <div className={styles.crumbs}>
                    {activeFilters.map(([key, val]) => (
                      <span key={key} className={`${styles.crumb} ${styles[coll]}`}>
                        {val}
                        <button onClick={() => setFilter(key, null)}>✕</button>
                      </span>
                    ))}
                    {search.trim() && (
                      <span className={`${styles.crumb} ${styles[coll]}`}>
                        "{search}"
                        <button onClick={() => setSearch('')}>✕</button>
                      </span>
                    )}
                  </div>
                )}

                <div className={styles.meta}>
                  {filtered.length} / {data.length} {t('records')}
                </div>

                {filtered.length === 0
                  ? <div className={styles.empty}>🔍 {t('noResults')}</div>
                  : <div className={styles.grid}>
                      {filtered.map((item, i) => (
                        <Card
                          key={i} item={item} coll={coll}
                          onClick={() => setSelected(item)}
                          onSpotify={coll === 'vinyl' ? (e) => { e.stopPropagation(); setSpotifyItem({ item, index: findIndex(item) }) } : null}
                          onShare={(e) => {
                            e.stopPropagation()
                            const idx = findIndex(item)
                            const url = coll === 'vinyl'
                              ? `${window.location.origin}${window.location.pathname}?v=${idx}`
                              : window.location.href
                            navigator.clipboard.writeText(url).catch(() => {})
                            if (coll === 'vinyl') window.open(url, '_blank', 'noopener')
                          }}
                          onIgStory={(coll === 'vinyl' && item.ig_url) ? (e) => {
                            e.stopPropagation()
                            setSocialDrawer({ type: 'instagram', url: item.ig_url })
                          } : null}
                          onTikTok={(coll === 'vinyl' && item.tiktok_url) ? (e) => {
                            e.stopPropagation()
                            setSocialDrawer({ type: 'tiktok', url: item.tiktok_url })
                          } : null}
                          onBuy={(coll !== 'vinyl' && item.buy_url) ? (e) => {
                            e.stopPropagation()
                            window.open(item.buy_url, '_blank', 'noopener')
                          } : null}
                          onDistillery={(coll !== 'vinyl' && item.url) ? (e) => {
                            e.stopPropagation()
                            window.open(item.url, '_blank', 'noopener')
                          } : null}
                        />
                      ))}
                    </div>
                }
              </>
          }
        </main>
      </div>
    </>
  )
}

// ── CARD ─────────────────────────────────────────────────────────────────────
function Card({ item, coll, onClick, onSpotify, onShare, onIgStory, onTikTok, onBuy, onDistillery }) {
  const [copied,  setCopied]  = useState(false)
  const [touched, setTouched] = useState(false)  // mobile tap-to-reveal

  const title = coll === 'vinyl' ? item.artista : item.brand
  const sub   = coll === 'vinyl' ? item.album   : (item.name || item.version || '')
  const tag   = coll === 'vinyl' ? item.genero  : item.type
  const year  = coll === 'vinyl'
    ? item.anio
    : coll === 'whisky'
      ? (item.years ? `${item.years} años` : 'NAS')
      : (item.abv   ? `${item.abv}%`       : '')

  function handleShare(e) {
    if (!onShare) return
    onShare(e)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function handleCardClick(e) {
    // En mobile: primer tap muestra acciones, segundo tap abre modal
    if (window.matchMedia('(hover: none)').matches && !touched) {
      e.stopPropagation()
      setTouched(true)
      return
    }
    setTouched(false)
    onClick(e)
  }

  return (
    <div
      className={`${styles.card} ${styles[coll]} ${touched ? styles.cardTouched : ''}`}
      onClick={handleCardClick}
      onMouseLeave={() => setTouched(false)}
    >
      <div className={styles.cardArt}>
        {coll === 'vinyl'
          ? item.cover_url
            ? <img src={item.cover_url} alt={item.album} loading="lazy" />
            : <VinylDisc artista={item.artista} agrupador={item.agrupador} />
          : item.cover_url
            ? <img src={item.cover_url} alt={item.brand} loading="lazy" />
            : <div className={styles.bottle}>🥃</div>
        }
        <span className={`${styles.dot} ${item.cover_url ? styles.dotGreen : styles.dotRed}`} />
        {(item.tiktok_url || item.ig_url) && (
          <span className={styles.dotEnlt} title="ENLT publicó sobre este disco" />
        )}
        {item.fuera     && <span className={styles.lentBadge} title="Prestado">📤</span>}
        {item.terminado && <span className={styles.lentBadge} title="Ya consumí">🫗</span>}

        {/* ── Hover/tap overlay con acciones rápidas ── */}
        {(onSpotify || onShare || onIgStory || onTikTok || onBuy || onDistillery) && (
          <div className={styles.hoverActions}>
            {onSpotify && (
              <button
                className={`${styles.haBtn} ${styles.haBtnSpotify}`}
                onClick={onSpotify}
                title="Escuchar en Spotify"
              >▶</button>
            )}
            {onBuy && (
              <button
                className={`${styles.haBtn} ${styles.haBtnBuy}`}
                onClick={onBuy}
                title="¿Dónde comprar?"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </button>
            )}
            {onDistillery && (
              <button
                className={`${styles.haBtn} ${styles.haBtnDistillery}`}
                onClick={onDistillery}
                title="Sitio de la destilería"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            )}
            {onShare && (
              <button
                className={`${styles.haBtn} ${copied ? styles.haBtnCopied : ''}`}
                onClick={handleShare}
                title={copied ? '¡Link copiado!' : 'Copiar link'}
              >{copied ? '✓' : '🔗'}</button>
            )}
            {onIgStory && (
              <button
                className={`${styles.haBtn} ${styles.haBtnIg}`}
                onClick={onIgStory}
                title="Ver en Instagram"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </button>
            )}
            {onTikTok && (
              <button
                className={`${styles.haBtn} ${styles.haBtnTikTok}`}
                onClick={onTikTok}
                title="Ver en TikTok"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Overlay de metadatos sobre la imagen */}
        <div className={styles.cardOverlay}>
          <div className={styles.cardTitle}>{title}</div>
          <div className={styles.cardSub}>{sub}</div>
          <div className={styles.cardMeta}>
            {tag  && <span className={`${styles.pill} ${styles[coll]}`}>{tag}</span>}
            {year && <span className={styles.year}>{year}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

const LABEL_COLORS = {
  'Salsa/Latina':'#c0392b','Jazz/Bigband/Sountracks/Swing':'#1a5276',
  'Voices':'#7d3c98','SonCubano/Bolero/Mambo':'#d35400',
  'Rock':'#1e8449','Tropical/Bailable/Parrandera':'#e67e22',
  'Balada/Pop/Romantica':'#2980b9','Hip-Hop/Rap':'#17202a',
}

function VinylDisc({ artista, agrupador }) {
  const clr = LABEL_COLORS[agrupador] || '#555'
  const lbl = (artista || '').substring(0, 13)
  return (
    <div className={styles.vinylDisc}>
      <div className={styles.vLabel} style={{ background: clr }}>{lbl}</div>
    </div>
  )
}
