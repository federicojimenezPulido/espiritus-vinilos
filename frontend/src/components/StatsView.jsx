import { useMemo } from 'react'
import styles from './StatsView.module.css'

/* ── helpers ── */
function countBy(arr, key) {
  const map = {}
  arr.forEach(item => {
    const val = item[key] || 'Desconocido'
    map[val] = (map[val] || 0) + 1
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
}

function BarChart({ title, entries, accent, filterKey, onBarClick }) {
  if (!entries || entries.length === 0) return null
  const max     = entries[0][1]
  const total   = entries.reduce((s, [, c]) => s + c, 0)
  const clickable = !!(filterKey && onBarClick)
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <div className={styles.bars}>
        {entries.slice(0, 10).map(([label, count]) => {
          const pct = Math.round((count / max) * 100)
          return (
            <div
              key={label}
              className={`${styles.barRow} ${clickable ? styles.barRowClickable : ''}`}
              onClick={() => clickable && onBarClick(filterKey, label)}
              title={clickable ? `Ver ${count} registros de "${label}"` : undefined}
            >
              <span className={styles.barLabel}>{label}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${pct}%`, background: accent }}
                />
              </div>
              <span className={styles.barCount}>{count}</span>
              <span className={styles.barPct}>{Math.round((count / total) * 100)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Vinyl stats ── */
function VinylStats({ data, onBarClick }) {
  const genres     = useMemo(() => countBy(data, 'agrupador'), [data])
  const categories = useMemo(() => countBy(data, 'genero'),    [data])
  const countries  = useMemo(() => countBy(data, 'pais'),      [data])

  const decades = useMemo(() => {
    const map = {}
    data.forEach(item => {
      const y = parseInt(item.anio)
      if (!isNaN(y)) {
        const dec = `${Math.floor(y / 10) * 10}s`
        map[dec] = (map[dec] || 0) + 1
      }
    })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [data])

  const totalArtists = useMemo(() => new Set(data.map(r => r.artista).filter(Boolean)).size, [data])
  const withDiscogs  = data.filter(r => r.discogs).length
  const withCover    = data.filter(r => r.cover_url).length
  const pctDiscogs   = data.length ? Math.round((withDiscogs / data.length) * 100) : 0
  const pctCover     = data.length ? Math.round((withCover  / data.length) * 100) : 0
  const prestados    = data.filter(r => r.fuera).length

  return (
    <>
      {/* Summary card */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Resumen</h3>
        <div className={styles.summaryGrid}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{data.length}</span>
            <span className={styles.statLbl}>Álbumes</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{totalArtists}</span>
            <span className={styles.statLbl}>Artistas</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{withDiscogs}</span>
            <span className={styles.statLbl}>En Discogs</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{pctDiscogs}%</span>
            <span className={styles.statLbl}>% Discogs</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{withCover}</span>
            <span className={styles.statLbl}>Con portada</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{pctCover}%</span>
            <span className={styles.statLbl}>% Portada</span>
          </div>
          {prestados > 0 && (
            <div className={styles.stat}>
              <span className={styles.statNum}>{prestados}</span>
              <span className={styles.statLbl}>Prestados</span>
            </div>
          )}
        </div>
      </div>

      <BarChart title="Géneros principales" entries={genres}     accent="var(--v-acc2)" filterKey="agrupador" onBarClick={onBarClick} />
      <BarChart title="Categorías"          entries={categories} accent="var(--v-gold)" filterKey="genero"    onBarClick={onBarClick} />
      <BarChart title="Países"              entries={countries}  accent="var(--v-acc)"  filterKey="pais"      onBarClick={onBarClick} />
      <BarChart title="Por Década"          entries={decades}    accent="var(--v-acc2)" filterKey="decade" onBarClick={onBarClick} />
    </>
  )
}

/* ── Rum stats ── */
function RumStats({ data, onBarClick }) {
  const countries = useMemo(() => countBy(data, 'country'), [data])
  const types     = useMemo(() => countBy(data, 'type'),    [data])
  const regions   = useMemo(() => countBy(data, 'region'),  [data])
  const blends    = useMemo(() => {
    const map = {}
    data.forEach(item => {
      const val = item.blend === 'Si' ? 'Blend' : 'Single'
      map[val] = (map[val] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [data])

  const withCover   = data.filter(r => r.cover_url).length
  const terminados  = data.filter(r => r.terminado).length
  const withScale   = data.filter(r => r.scale)
  const avgScale    = withScale.length
    ? (withScale.reduce((s, r) => s + r.scale, 0) / withScale.length).toFixed(1)
    : '—'
  const pctCover    = data.length ? Math.round((withCover / data.length) * 100) : 0

  return (
    <>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Resumen</h3>
        <div className={styles.summaryGrid}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{data.length}</span>
            <span className={styles.statLbl}>Rones</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{countries.length}</span>
            <span className={styles.statLbl}>Países</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{types.length}</span>
            <span className={styles.statLbl}>Tipos</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{avgScale}</span>
            <span className={styles.statLbl}>Escala prom</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{withCover}</span>
            <span className={styles.statLbl}>Con portada</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{pctCover}%</span>
            <span className={styles.statLbl}>% Portada</span>
          </div>
          {terminados > 0 && (
            <div className={styles.stat}>
              <span className={styles.statNum}>{terminados}</span>
              <span className={styles.statLbl}>Ya consumí</span>
            </div>
          )}
        </div>
      </div>
      <BarChart title="Países"        entries={countries} accent="var(--ru-acc2)" filterKey="country" onBarClick={onBarClick} />
      <BarChart title="Tipos"         entries={types}     accent="var(--ru-gold)" filterKey="type"    onBarClick={onBarClick} />
      <BarChart title="Regiones"      entries={regions}   accent="var(--ru-acc)"  filterKey="region"  onBarClick={onBarClick} />
      <BarChart title="Blend vs Single" entries={blends}  accent="var(--ru-acc)" />
    </>
  )
}

/* ── Whisky stats ── */
function WhiskyStats({ data, onBarClick }) {
  const countries  = useMemo(() => countBy(data, 'country'),    [data])
  const types      = useMemo(() => countBy(data, 'type'),       [data])
  const regions    = useMemo(() => countBy(data, 'region'),     [data])
  const origins    = useMemo(() => countBy(data, 'origin'),     [data])

  const withCover  = data.filter(r => r.cover_url).length
  const terminados = data.filter(r => r.terminado).length
  const withAge    = data.filter(r => r.years).length
  const nas        = data.length - withAge
  const pctCover   = data.length ? Math.round((withCover / data.length) * 100) : 0

  return (
    <>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Resumen</h3>
        <div className={styles.summaryGrid}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{data.length}</span>
            <span className={styles.statLbl}>Whiskies</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{countries.length}</span>
            <span className={styles.statLbl}>Países</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{regions.length}</span>
            <span className={styles.statLbl}>Regiones</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{withAge}</span>
            <span className={styles.statLbl}>Con edad</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{nas}</span>
            <span className={styles.statLbl}>NAS</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{withCover}</span>
            <span className={styles.statLbl}>Con portada</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{pctCover}%</span>
            <span className={styles.statLbl}>% Portada</span>
          </div>
          {terminados > 0 && (
            <div className={styles.stat}>
              <span className={styles.statNum}>{terminados}</span>
              <span className={styles.statLbl}>Ya consumí</span>
            </div>
          )}
        </div>
      </div>
      <BarChart title="Países"   entries={countries} accent="var(--wh-acc2)" filterKey="country" onBarClick={onBarClick} />
      <BarChart title="Tipos"    entries={types}     accent="var(--wh-gold)" filterKey="type"    onBarClick={onBarClick} />
      <BarChart title="Regiones" entries={regions}   accent="var(--wh-acc2)" filterKey="region"  onBarClick={onBarClick} />
      <BarChart title="Origen"   entries={origins}   accent="var(--wh-acc)"  filterKey="origin"  onBarClick={onBarClick} />
    </>
  )
}

/* ── Main component ── */
export default function StatsView({ data, coll, onBarClick }) {
  if (!data || data.length === 0) {
    return <div className={styles.empty}>Sin datos para mostrar estadísticas</div>
  }

  return (
    <div className={styles.container}>
      {coll === 'vinyl'  && <VinylStats  data={data} onBarClick={onBarClick} />}
      {coll === 'rum'    && <RumStats    data={data} onBarClick={onBarClick} />}
      {coll === 'whisky' && <WhiskyStats data={data} onBarClick={onBarClick} />}
    </div>
  )
}
