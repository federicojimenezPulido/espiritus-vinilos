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

/* ── Stat cell helper ── */
function Stat({ num, lbl, items, title, onStatClick, missing }) {
  const clickable = !!(items && onStatClick)
  return (
    <div
      className={[
        styles.stat,
        clickable ? styles.statClickable : '',
        missing   ? styles.statMissing   : '',
      ].join(' ')}
      onClick={clickable ? () => onStatClick(title || lbl, items) : undefined}
      title={clickable ? `Ver ${items.length} registros` : undefined}
    >
      <span className={styles.statNum}>{num}</span>
      <span className={styles.statLbl}>{lbl}</span>
    </div>
  )
}

/* ── Vinyl stats ── */
function VinylStats({ data, onBarClick, onStatClick }) {
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

  const noDiscogs = data.filter(r => !r.discogs)
  const noCover   = data.filter(r => !r.cover_url)

  return (
    <>
      {/* Summary card */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Resumen</h3>
        <div className={styles.summaryGrid}>
          <Stat num={data.length}   lbl="Álbumes"    items={data}                        title="Todos los álbumes"      onStatClick={onStatClick} />
          <Stat num={totalArtists}  lbl="Artistas"   />
          <Stat num={withDiscogs}   lbl="En Discogs" items={data.filter(r => r.discogs)} title="Con Discogs"            onStatClick={onStatClick} />
          <Stat num={`${pctDiscogs}%`} lbl="Sin Discogs" items={noDiscogs}               title={`Sin Discogs (${noDiscogs.length})`} onStatClick={onStatClick} missing={noDiscogs.length > 0} />
          <Stat num={withCover}     lbl="Con portada" items={data.filter(r => r.cover_url)} title="Con portada"         onStatClick={onStatClick} />
          <Stat num={`${pctCover}%`} lbl="Sin portada"  items={noCover}                  title={`Sin portada (${noCover.length})`}   onStatClick={onStatClick} missing={noCover.length > 0} />
          {prestados > 0 && (
            <Stat num={prestados} lbl="Prestados" items={data.filter(r => r.fuera)} title="Prestados" onStatClick={onStatClick} />
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
function RumStats({ data, onBarClick, onStatClick }) {
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

  const noCover = data.filter(r => !r.cover_url)

  return (
    <>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Resumen</h3>
        <div className={styles.summaryGrid}>
          <Stat num={data.length}      lbl="Rones"       items={data}                        title="Todos los rones"       onStatClick={onStatClick} />
          <Stat num={countries.length} lbl="Países" />
          <Stat num={types.length}     lbl="Tipos" />
          <Stat num={avgScale}         lbl="Escala prom" />
          <Stat num={withCover}        lbl="Con portada" items={data.filter(r => r.cover_url)} title="Con portada"          onStatClick={onStatClick} />
          <Stat num={`${pctCover}%`}   lbl="Sin portada" items={noCover}                      title={`Sin portada (${noCover.length})`} onStatClick={onStatClick} missing={noCover.length > 0} />
          {terminados > 0 && (
            <Stat num={terminados} lbl="Ya consumí" items={data.filter(r => r.terminado)} title="Ya consumí" onStatClick={onStatClick} />
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
function WhiskyStats({ data, onBarClick, onStatClick }) {
  const countries  = useMemo(() => countBy(data, 'country'),    [data])
  const types      = useMemo(() => countBy(data, 'type'),       [data])
  const regions    = useMemo(() => countBy(data, 'region'),     [data])
  const origins    = useMemo(() => countBy(data, 'origin'),     [data])

  const withCover  = data.filter(r => r.cover_url).length
  const terminados = data.filter(r => r.terminado).length
  const withAge    = data.filter(r => r.years).length
  const nas        = data.length - withAge
  const pctCover   = data.length ? Math.round((withCover / data.length) * 100) : 0

  const noCover = data.filter(r => !r.cover_url)

  return (
    <>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Resumen</h3>
        <div className={styles.summaryGrid}>
          <Stat num={data.length}      lbl="Whiskies"    items={data}                        title="Todos los whiskies"    onStatClick={onStatClick} />
          <Stat num={countries.length} lbl="Países" />
          <Stat num={regions.length}   lbl="Regiones" />
          <Stat num={withAge}          lbl="Con edad"    items={data.filter(r => r.years)}   title="Con edad declarada"    onStatClick={onStatClick} />
          <Stat num={nas}              lbl="NAS"         items={data.filter(r => !r.years)}  title="NAS (sin edad)"        onStatClick={onStatClick} />
          <Stat num={withCover}        lbl="Con portada" items={data.filter(r => r.cover_url)} title="Con portada"         onStatClick={onStatClick} />
          <Stat num={`${pctCover}%`}   lbl="Sin portada" items={noCover}                     title={`Sin portada (${noCover.length})`} onStatClick={onStatClick} missing={noCover.length > 0} />
          {terminados > 0 && (
            <Stat num={terminados} lbl="Ya consumí" items={data.filter(r => r.terminado)} title="Ya consumí" onStatClick={onStatClick} />
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
export default function StatsView({ data, coll, onBarClick, onStatClick }) {
  if (!data || data.length === 0) {
    return <div className={styles.empty}>Sin datos para mostrar estadísticas</div>
  }

  return (
    <div className={styles.container}>
      {coll === 'vinyl'  && <VinylStats  data={data} onBarClick={onBarClick} onStatClick={onStatClick} />}
      {coll === 'rum'    && <RumStats    data={data} onBarClick={onBarClick} onStatClick={onStatClick} />}
      {coll === 'whisky' && <WhiskyStats data={data} onBarClick={onBarClick} onStatClick={onStatClick} />}
    </div>
  )
}
