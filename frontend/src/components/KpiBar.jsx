import styles from './KpiBar.module.css'

// useMemo sería ideal aquí, pero para simplicidad calculamos directo
// Los KPIs dependen de los datos y la colección activa
export default function KpiBar({ data, coll }) {
  if (!data) return null

  const kpis = getKpis(data, coll)

  return (
    <div className={styles.bar}>
      {kpis.map(({ label, value, color }) => (
        <div className={styles.kpi} key={label}>
          <div className={styles.val} style={{ color }}>{value}</div>
          <div className={styles.lbl}>{label}</div>
        </div>
      ))}
    </div>
  )
}

function unique(arr, key) {
  return new Set(arr.map(r => r[key]).filter(Boolean)).size
}

function getKpis(data, coll) {
  if (coll === 'vinyl') {
    return [
      { label: 'Total',        value: data.length,                              color: 'var(--v-gold)' },
      { label: 'Artistas',     value: unique(data, 'artista'),                  color: '#a78bfa' },
      { label: 'Categorías',   value: unique(data, 'agrupador'),                color: '#4ea8de' },
      { label: 'Discogs',      value: data.filter(r => r.discogs).length,       color: 'var(--v-gold)' },
      { label: 'Con imagen',   value: data.filter(r => r.cover_url).length,     color: '#22c55e' },
    ]
  }
  if (coll === 'rum') {
    const withScale = data.filter(r => r.scale)
    const avg = withScale.length
      ? (withScale.reduce((a, r) => a + r.scale, 0) / withScale.length).toFixed(1)
      : '—'
    return [
      { label: 'Total',        value: data.length,                          color: 'var(--ru-gold)' },
      { label: 'Países',       value: unique(data, 'country'),              color: '#22c55e' },
      { label: 'Escala prom',  value: avg,                                  color: 'var(--ru-gold)' },
      { label: 'Blended',      value: data.filter(r=>r.blend==='Si').length,color: '#a78bfa' },
      { label: 'Tipos',        value: unique(data, 'type'),                 color: '#4ea8de' },
    ]
  }
  // whisky
  return [
    { label: 'Total',         value: data.length,                              color: 'var(--wh-gold)' },
    { label: 'Países',        value: unique(data, 'country'),                  color: '#22c55e' },
    { label: 'Single Malts',  value: data.filter(r=>r.type==='Single Malt').length, color: 'var(--wh-gold)' },
    { label: 'Blended',       value: data.filter(r=>r.type==='Blended').length,color: '#a78bfa' },
    { label: 'Con edad',      value: data.filter(r=>r.years).length,           color: '#4ea8de' },
  ]
}
