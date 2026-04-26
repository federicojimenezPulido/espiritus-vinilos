import { useLang } from '../LangContext'
import styles from './KpiBar.module.css'

export default function KpiBar({ data, coll }) {
  const { t } = useLang()
  if (!data) return null

  const kpis = getKpis(data, coll, t)

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

function getKpis(data, coll, t) {
  if (coll === 'vinyl') {
    return [
      { label: 'Total',           value: data.length,                              color: 'var(--v-gold)' },
      { label: t('artists'),      value: unique(data, 'artista'),                  color: '#a78bfa' },
      { label: t('categories'),   value: unique(data, 'agrupador'),                color: '#4ea8de' },
      { label: t('discogs'),      value: data.filter(r => r.discogs).length,       color: 'var(--v-gold)' },
      { label: t('withCover'),    value: data.filter(r => r.cover_url).length,     color: '#22c55e' },
    ]
  }
  if (coll === 'rum') {
    const withScale = data.filter(r => r.scale)
    const avg = withScale.length
      ? (withScale.reduce((a, r) => a + r.scale, 0) / withScale.length).toFixed(1)
      : '—'
    return [
      { label: 'Total',           value: data.length,                               color: 'var(--ru-gold)' },
      { label: t('countries'),    value: unique(data, 'country'),                   color: '#22c55e' },
      { label: t('avgScale'),     value: avg,                                       color: 'var(--ru-gold)' },
      { label: t('withCover'),    value: data.filter(r => r.cover_url).length,      color: '#4ea8de' },
      { label: t('finishedStat'), value: data.filter(r => r.terminado).length,      color: '#a78bfa' },
    ]
  }
  // whisky
  return [
    { label: 'Total',             value: data.length,                                color: 'var(--wh-gold)' },
    { label: t('countries'),      value: unique(data, 'country'),                    color: '#22c55e' },
    { label: 'Single Malts',      value: data.filter(r=>r.type==='Single Malt').length, color: 'var(--wh-gold)' },
    { label: t('withCover'),      value: data.filter(r => r.cover_url).length,       color: '#4ea8de' },
    { label: t('finishedStat'),   value: data.filter(r => r.terminado).length,       color: '#a78bfa' },
  ]
}
