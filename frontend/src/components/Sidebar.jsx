import styles from './Sidebar.module.css'

// countBy — equivalente a SELECT campo, COUNT(*) FROM tabla GROUP BY campo ORDER BY 2 DESC
function countBy(arr, key) {
  const map = {}
  arr.forEach(r => {
    const val = r[key]
    if (val) map[val] = (map[val] || 0) + 1
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
}

// filters = objeto con los filtros activos { f1: valor, f2: valor }
// setFilter = función para cambiar un filtro
export default function Sidebar({ data, coll, filters, setFilter }) {
  if (!data) return null

  const sections = getSections(data, coll)

  return (
    <aside className={styles.sidebar}>
      {sections.map(({ title, key, entries }) => (
        <div className={styles.section} key={key}>
          <div className={styles.sectionTitle}>{title}</div>
          {entries.map(([val, count]) => (
            <button
              key={val}
              className={`${styles.filterBtn} ${filters[key] === val ? styles.active : ''} ${styles[coll]}`}
              onClick={() => setFilter(key, filters[key] === val ? null : val)}
            >
              <span className={styles.label}>{val}</span>
              <span className={styles.badge}>{count}</span>
            </button>
          ))}
        </div>
      ))}
    </aside>
  )
}

function getSections(data, coll) {
  if (coll === 'vinyl') {
    return [
      { title: '🎵 Categoría', key: 'agrupador', entries: countBy(data, 'agrupador') },
      { title: '🎼 Género',    key: 'genero',    entries: countBy(data, 'genero') },
      { title: '🌍 País',      key: 'pais',      entries: countBy(data, 'pais') },
    ]
  }
  if (coll === 'rum') {
    return [
      { title: '🌍 País',  key: 'country', entries: countBy(data, 'country') },
      { title: '🏷 Tipo',  key: 'type',    entries: countBy(data, 'type') },
      { title: '🔀 Blend', key: 'blend',   entries: countBy(data, 'blend') },
    ]
  }
  return [
    { title: '🌍 País',   key: 'country', entries: countBy(data, 'country') },
    { title: '🏷 Tipo',   key: 'type',    entries: countBy(data, 'type') },
    { title: '🏭 Origen', key: 'origin',  entries: countBy(data, 'origin') },
  ]
}
