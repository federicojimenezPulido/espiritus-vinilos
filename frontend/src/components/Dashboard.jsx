import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getVinyls, getRums, getWhiskies, bulkFetchCovers } from '../services/api'
import KpiBar    from './KpiBar'
import SearchBar from './SearchBar'
import Sidebar   from './Sidebar'
import Modal     from './Modal'
import AdminForm from './AdminForm'
import styles    from './Dashboard.module.css'

const FETCHERS = { vinyl: getVinyls, rum: getRums, whisky: getWhiskies }

export default function Dashboard({ coll }) {
  const [search,      setSearch]      = useState('')
  const [filters,     setFilters]     = useState({})
  const [selected,    setSelected]    = useState(null)
  const [adminItem,   setAdminItem]   = useState(undefined)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkMsg,     setBulkMsg]     = useState('')
  const qc = useQueryClient() // undefined=cerrado, null=nuevo, obj=editar  // { agrupador: 'Salsa/Latina', genero: null, ... }

  // Cuando cambia la colección, limpiar búsqueda y filtros
  // useQuery re-fetcha automáticamente cuando cambia queryKey
  const { data, isLoading, isError } = useQuery({
    queryKey: [coll],
    queryFn: FETCHERS[coll],
  })

  // setFilter — activa o desactiva un filtro individual
  function setFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function clearAll() {
    setSearch('')
    setFilters({})
  }

  async function handleBulkCovers() {
    if (!localStorage.getItem('discogs_token')) {
      setBulkMsg('⚠ Primero guardá tu token Discogs (ícono 🔑 arriba)')
      return
    }
    setBulkLoading(true)
    setBulkMsg('Buscando portadas... puede tardar un minuto')
    try {
      const result = await bulkFetchCovers()
      setBulkMsg(`✅ ${result.updated} portadas nuevas · ${result.skipped} ya tenían`)
      qc.invalidateQueries({ queryKey: ['vinyl'] })
    } catch {
      setBulkMsg('⚠ Error al buscar portadas')
    } finally {
      setBulkLoading(false)
    }
  }

  // useMemo — solo recalcula cuando cambian data, search o filters
  // Análogo a una vista materializada que se refresca solo cuando cambian los datos
  const filtered = useMemo(() => {
    if (!data) return []
    let result = data

    // Aplicar filtros de sidebar
    Object.entries(filters).forEach(([key, val]) => {
      if (val) result = result.filter(r => r[key] === val)
    })

    // Aplicar búsqueda
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
  if (isError)   return <div className={styles.state}>⚠ Error conectando al backend (puerto 8000)</div>

  const activeFilters = Object.values(filters).some(Boolean) || search

  // Encontrar el índice real del item en el array original (necesario para PUT/DELETE)
  function findIndex(item) {
    if (!data || !item) return -1
    return data.findIndex(r => JSON.stringify(r) === JSON.stringify(item))
  }

  return (
    <>
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
        />
      )}
      <KpiBar data={data} coll={coll} />
      <div className={styles.layout}>
        <Sidebar data={data} coll={coll} filters={filters} setFilter={setFilter} />
        <main className={styles.content}>
          <div className={styles.topBar}>
            <SearchBar search={search} setSearch={setSearch} coll={coll} />
            {activeFilters && (
              <button className={styles.clearBtn} onClick={clearAll}>
                Limpiar filtros
              </button>
            )}
            <button className={`${styles.addBtn} ${styles[coll]}`} onClick={() => setAdminItem(null)}>
              + Agregar
            </button>
            {coll === 'vinyl' && (
              <button
                className={styles.bulkBtn}
                onClick={handleBulkCovers}
                disabled={bulkLoading}
                title="Buscar portadas en Discogs para todos los vinilos"
              >
                {bulkLoading ? '⏳ Buscando...' : '🎵 Portadas'}
              </button>
            )}
          </div>
          {bulkMsg && <div className={styles.bulkMsg}>{bulkMsg}</div>}
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
        {coll === 'vinyl' && (
          <span className={`${styles.dot} ${item.fuera ? styles.dotRed : styles.dotGreen}`} />
        )}
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
