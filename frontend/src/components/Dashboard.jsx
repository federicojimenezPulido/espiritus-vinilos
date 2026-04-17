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
import SpotifyModal   from './SpotifyModal'
import FeaturedBanner, { setFeatured, getFeatured } from './FeaturedBanner'
import ShareView      from './ShareView'
import styles         from './Dashboard.module.css'

const FETCHERS = { vinyl: getVinyls, rum: getRums, whisky: getWhiskies }

export default function Dashboard({ coll }) {
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
      if (val) result = result.filter(r => r[key] === val)
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
    return result
  }, [data, search, filters, coll])

  if (isLoading) return <div className={styles.state}>Cargando...</div>
  if (isError)   return <div className={styles.state}>⚠ Error conectando al backend</div>

  const activeFilters = Object.entries(filters).filter(([, v]) => v)
  const hasActive     = activeFilters.length > 0 || search.trim()

  function findIndex(item) {
    if (!data || !item) return -1
    return data.findIndex(r => JSON.stringify(r) === JSON.stringify(item))
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
    if (!localStorage.getItem('admin_pin')) { onSuccess(); return }
    setPinAction({ label, onSuccess })
  }

  return (
    <>
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
          onEdit={() => { setAdminIndex(findIndex(selected)); setSelected(null); setAdminItem(selected) }}
          onSetFeatured={coll === 'vinyl' ? (item, idx) => {
            setFeatured(item, idx)
            setFeaturedVer(v => v + 1)
            setSelected(null)
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
          onRequestPin={(label, cb) => requirePin(label, cb)}
        />
      )}
      {coll === 'vinyl' && (
        <FeaturedBanner
          key={featuredVer}
          onOpen={item => setSelected(item)}
          onSpotify={(item, idx) => setSpotifyItem({ item, index: idx })}
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

          {/* Top bar */}
          <div className={styles.topBar}>
            {/* Mobile: show filter toggle button */}
            <button className={styles.filterToggle} onClick={() => setSidebarOpen(o => !o)}>
              🎚 Filtros
            </button>
            <SearchBar search={search} setSearch={setSearch} coll={coll} />
            {hasActive && (
              <button className={styles.clearBtn} onClick={clearAll}>
                Limpiar
              </button>
            )}
            {/* View toggle: collection → stats → crate */}
            {coll === 'vinyl'
              ? <button
                  className={styles.viewToggle}
                  onClick={() => setView(v => v === 'collection' ? 'stats' : v === 'stats' ? 'crate' : 'collection')}
                >
                  {view === 'collection' ? '📊 Stats' : view === 'stats' ? '🗄 Anaquel' : '📋 Colección'}
                </button>
              : <button
                  className={styles.viewToggle}
                  onClick={() => setView(v => v === 'collection' ? 'stats' : 'collection')}
                >
                  {view === 'collection' ? '📊 Stats' : '📋 Colección'}
                </button>
            }
            <button className={`${styles.addBtn} ${styles[coll]}`} onClick={() => requirePin('Agregar nuevo registro', () => setAdminItem(null))}>
              + Agregar
            </button>
          </div>

          {view === 'crate'
            ? <CrateView
                data={filtered.length < data.length ? filtered : data}
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
                  {filtered.length} de {data.length} registros
                </div>

                {filtered.length === 0
                  ? <div className={styles.empty}>🔍 Sin resultados</div>
                  : <div className={styles.grid}>
                      {filtered.map((item, i) => (
                        <Card
                          key={i} item={item} coll={coll}
                          onClick={() => setSelected(item)}
                          onSpotify={coll === 'vinyl' ? () => setSpotifyItem({ item, index: findIndex(item) }) : null}
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
function Card({ item, coll, onClick, onSpotify }) {
  const title = coll === 'vinyl' ? item.artista : item.brand
  const sub   = coll === 'vinyl' ? item.album   : (item.name || item.version || '')
  const tag   = coll === 'vinyl' ? item.genero  : item.type
  const year  = coll === 'vinyl'
    ? item.anio
    : coll === 'whisky'
      ? (item.years ? `${item.years} años` : 'NAS')
      : (item.abv   ? `${item.abv}%`       : '')

  return (
    <div className={`${styles.card} ${styles[coll]}`} onClick={onClick}>
      <div className={styles.cardArt}>
        {coll === 'vinyl'
          ? item.cover_url
            ? <img src={item.cover_url} alt={item.album} loading="lazy" />
            : <VinylDisc artista={item.artista} agrupador={item.agrupador} />
          : item.cover_url
            ? <img src={item.cover_url} alt={item.brand} loading="lazy" />
            : <div className={styles.bottle}>🥃</div>
        }
        {/* Dot: verde = tiene imagen · rojo = sin imagen */}
        <span className={`${styles.dot} ${item.cover_url ? styles.dotGreen : styles.dotRed}`} />
        {/* Badge prestado (vinyl) / ya consumí (rum, whisky) */}
        {item.fuera      && <span className={styles.lentBadge} title="Prestado">📤</span>}
        {item.terminado  && <span className={styles.lentBadge} title="Ya consumí">🫗</span>}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{title}</div>
        <div className={styles.cardSub}>{sub}</div>
        <div className={styles.cardMeta}>
          {tag && <span className={`${styles.pill} ${styles[coll]}`}>{tag}</span>}
          {year && <span className={styles.year}>{year}</span>}
          {onSpotify && (
            <button
              className={styles.spotifyBtn}
              onClick={e => { e.stopPropagation(); onSpotify() }}
              title="Escuchar en Spotify"
            >▶</button>
          )}
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
