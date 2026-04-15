import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getVinyls, getRums, getWhiskies } from '../services/api'
import KpiBar    from './KpiBar'
import SearchBar from './SearchBar'
import Sidebar   from './Sidebar'
import Modal     from './Modal'
import AdminForm from './AdminForm'
import PinModal  from './PinModal'
import styles    from './Dashboard.module.css'

const FETCHERS = { vinyl: getVinyls, rum: getRums, whisky: getWhiskies }

export default function Dashboard({ coll }) {
  const [search,    setSearch]    = useState('')
  const [filters,   setFilters]   = useState({})
  const [selected,  setSelected]  = useState(null)
  const [adminItem, setAdminItem] = useState(undefined)
  const [pinAction, setPinAction] = useState(null) // { label, onSuccess }

  const { data, isLoading, isError } = useQuery({
    queryKey: [coll],
    queryFn: FETCHERS[coll],
  })

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

  function requirePin(label, onSuccess) {
    if (!localStorage.getItem('admin_pin')) { onSuccess(); return }
    setPinAction({ label, onSuccess })
  }

  return (
    <>
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
          onClose={() => setSelected(null)}
          onEdit={() => { setSelected(null); setAdminItem(selected) }}
        />
      )}
      {adminItem !== undefined && (
        <AdminForm
          coll={coll}
          item={adminItem}
          index={findIndex(adminItem)}
          data={data}
          onClose={() => setAdminItem(undefined)}
          onRequestPin={(label, cb) => requirePin(label, cb)}
        />
      )}
      <KpiBar data={data} coll={coll} />
      <div className={styles.layout}>
        <Sidebar data={data} coll={coll} filters={filters} setFilter={setFilter} />
        <main className={styles.content}>

          {/* Top bar */}
          <div className={styles.topBar}>
            <SearchBar search={search} setSearch={setSearch} coll={coll} />
            {hasActive && (
              <button className={styles.clearBtn} onClick={clearAll}>
                Limpiar
              </button>
            )}
            <button className={`${styles.addBtn} ${styles[coll]}`} onClick={() => requirePin('Agregar nuevo registro', () => setAdminItem(null))}>
              + Agregar
            </button>
          </div>

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
                  <Card key={i} item={item} coll={coll} onClick={() => setSelected(item)} />
                ))}
              </div>
          }
        </main>
      </div>
    </>
  )
}

// ── CARD ─────────────────────────────────────────────────────────────────────
function Card({ item, coll, onClick }) {
  const title = coll === 'vinyl' ? item.artista : item.brand
  const sub   = coll === 'vinyl' ? item.album   : (item.name || item.version || '')
  const tag   = coll === 'vinyl' ? item.genero  : item.type
  const year  = coll === 'vinyl' ? item.anio    : (item.years ? `${item.years} años` : '')

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
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{title}</div>
        <div className={styles.cardSub}>{sub}</div>
        <div className={styles.cardMeta}>
          {tag && <span className={`${styles.pill} ${styles[coll]}`}>{tag}</span>}
          {year && <span className={styles.year}>{year}</span>}
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
