import { useMemo } from 'react'
import { useLang } from '../LangContext'
import styles from './StatsView.module.css'

/* ── CSV export ── */
function toCSV(data, coll) {
  if (!data.length) return ''
  const keys = Object.keys(data[0]).filter(k => !['id'].includes(k))
  const header = keys.join(',')
  const rows = data.map(item =>
    keys.map(k => {
      const v = item[k] ?? ''
      const str = String(v).replace(/"/g, '""')
      return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str
    }).join(',')
  )
  return [header, ...rows].join('\n')
}

function downloadCSV(data, coll) {
  const csv = toCSV(data, coll)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `enlt-${coll}-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

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
  const { t } = useLang()
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
              title={clickable ? `${t('view')} ${count} ${t('records')} — "${label}"` : undefined}
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
  const { t } = useLang()
  const clickable = !!(items && onStatClick)
  return (
    <div
      className={[
        styles.stat,
        clickable ? styles.statClickable : '',
        missing   ? styles.statMissing   : '',
      ].join(' ')}
      onClick={clickable ? () => onStatClick(title || lbl, items) : undefined}
      title={clickable ? `${t('view')} ${items.length} ${t('records')}` : undefined}
    >
      <span className={styles.statNum}>{num}</span>
      <span className={styles.statLbl}>{lbl}</span>
    </div>
  )
}

/* ── Vinyl stats ── */
function VinylStats({ data, onBarClick, onStatClick }) {
  const { t } = useLang()
  const genres     = useMemo(() => countBy(data, 'agrupador'), [data])
  const categories = useMemo(() => countBy(data, 'genero'),    [data])
  const sellos     = useMemo(() => countBy(data, 'sello'),     [data])

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
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>{t('summary')}</h3>
        <div className={styles.summaryGrid}>
          <Stat num={data.length}      lbl={t('albums')}          items={data}                          title={t('allAlbums')}                                        onStatClick={onStatClick} />
          <Stat num={totalArtists}     lbl={t('artists')} />
          <Stat num={withDiscogs}      lbl={t('onDiscogs')}        items={data.filter(r => r.discogs)}   title={t('withDiscogs')}                                      onStatClick={onStatClick} />
          <Stat num={`${pctDiscogs}%`} lbl={t('withoutDiscogs')}   items={noDiscogs}                     title={`${t('withoutDiscogs')} (${noDiscogs.length})`}         onStatClick={onStatClick} missing={noDiscogs.length > 0} />
          <Stat num={withCover}        lbl={t('withCover')}        items={data.filter(r => r.cover_url)} title={t('withCover')}                                        onStatClick={onStatClick} />
          <Stat num={`${pctCover}%`}   lbl={t('withoutCover')}     items={noCover}                       title={`${t('withoutCover')} (${noCover.length})`}             onStatClick={onStatClick} missing={noCover.length > 0} />
          {prestados > 0 && (
            <Stat num={prestados} lbl={t('lentOut')} items={data.filter(r => r.fuera)} title={t('lentOut')} onStatClick={onStatClick} />
          )}
        </div>
      </div>

      <BarChart title={t('topGenres')}   entries={genres}     accent="var(--v-acc2)" filterKey="agrupador" onBarClick={onBarClick} />
      <BarChart title={t('categories')}  entries={categories} accent="var(--v-gold)" filterKey="genero"    onBarClick={onBarClick} />
      <BarChart title={t('labels')}      entries={sellos}     accent="var(--v-acc)"  filterKey="sello"     onBarClick={onBarClick} />
      <BarChart title={t('byDecade')}    entries={decades}    accent="var(--v-acc2)" filterKey="decade"    onBarClick={onBarClick} />
    </>
  )
}

/* ── Rum stats ── */
function RumStats({ data, onBarClick, onStatClick }) {
  const { t } = useLang()
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
        <h3 className={styles.cardTitle}>{t('summary')}</h3>
        <div className={styles.summaryGrid}>
          <Stat num={data.length}      lbl={t('rums')}        items={data}                          title={t('allRums')}                                 onStatClick={onStatClick} />
          <Stat num={countries.length} lbl={t('countries')} />
          <Stat num={types.length}     lbl={t('types')} />
          <Stat num={avgScale}         lbl={t('avgScale')} />
          <Stat num={withCover}        lbl={t('withCover')}   items={data.filter(r => r.cover_url)} title={t('withCover')}                               onStatClick={onStatClick} />
          <Stat num={`${pctCover}%`}   lbl={t('withoutCover')} items={noCover}                      title={`${t('withoutCover')} (${noCover.length})`}   onStatClick={onStatClick} missing={noCover.length > 0} />
          {terminados > 0 && (
            <Stat num={terminados} lbl={t('finishedStat')} items={data.filter(r => r.terminado)} title={t('finishedStat')} onStatClick={onStatClick} />
          )}
        </div>
      </div>
      <BarChart title={t('countries')}    entries={countries} accent="var(--ru-acc2)" filterKey="country" onBarClick={onBarClick} />
      <BarChart title={t('types')}        entries={types}     accent="var(--ru-gold)" filterKey="type"    onBarClick={onBarClick} />
      <BarChart title={t('regions')}      entries={regions}   accent="var(--ru-acc)"  filterKey="region"  onBarClick={onBarClick} />
      <BarChart title={t('blendVsSingle')} entries={blends}   accent="var(--ru-acc)" />
    </>
  )
}

/* ── Whisky stats ── */
function WhiskyStats({ data, onBarClick, onStatClick }) {
  const { t } = useLang()
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
        <h3 className={styles.cardTitle}>{t('summary')}</h3>
        <div className={styles.summaryGrid}>
          <Stat num={data.length}      lbl={t('whiskies')}    items={data}                          title={t('allWhiskies')}                              onStatClick={onStatClick} />
          <Stat num={countries.length} lbl={t('countries')} />
          <Stat num={regions.length}   lbl={t('regions')} />
          <Stat num={withAge}          lbl={t('withAge')}     items={data.filter(r => r.years)}     title={t('ageDeclared')}                              onStatClick={onStatClick} />
          <Stat num={nas}              lbl="NAS"              items={data.filter(r => !r.years)}    title={t('nas')}                                      onStatClick={onStatClick} />
          <Stat num={withCover}        lbl={t('withCover')}   items={data.filter(r => r.cover_url)} title={t('withCover')}                                onStatClick={onStatClick} />
          <Stat num={`${pctCover}%`}   lbl={t('withoutCover')} items={noCover}                      title={`${t('withoutCover')} (${noCover.length})`}   onStatClick={onStatClick} missing={noCover.length > 0} />
          {terminados > 0 && (
            <Stat num={terminados} lbl={t('finishedStat')} items={data.filter(r => r.terminado)} title={t('finishedStat')} onStatClick={onStatClick} />
          )}
        </div>
      </div>
      <BarChart title={t('countries')} entries={countries} accent="var(--wh-acc2)" filterKey="country" onBarClick={onBarClick} />
      <BarChart title={t('types')}     entries={types}     accent="var(--wh-gold)" filterKey="type"    onBarClick={onBarClick} />
      <BarChart title={t('regions')}   entries={regions}   accent="var(--wh-acc2)" filterKey="region"  onBarClick={onBarClick} />
      <BarChart title={t('origin')}    entries={origins}   accent="var(--wh-acc)"  filterKey="origin"  onBarClick={onBarClick} />
    </>
  )
}

/* ── Main component ── */
export default function StatsView({ data, coll, onBarClick, onStatClick }) {
  const { t } = useLang()

  if (!data || data.length === 0) {
    return <div className={styles.empty}>{t('noStats')}</div>
  }

  const collLabel = { vinyl: t('vinyls'), rum: t('rums'), whisky: t('whiskies') }[coll] || coll

  return (
    <div className={styles.container}>
      <div className={styles.exportBar}>
        <span className={styles.exportLabel}>{data.length} {t('records')} — {collLabel}</span>
        <button
          className={styles.exportBtn}
          onClick={() => downloadCSV(data, coll)}
          title={t('exportCsvTitle')}
        >
          {t('exportCsvBtn')}
        </button>
      </div>
      {coll === 'vinyl'  && <VinylStats  data={data} onBarClick={onBarClick} onStatClick={onStatClick} />}
      {coll === 'rum'    && <RumStats    data={data} onBarClick={onBarClick} onStatClick={onStatClick} />}
      {coll === 'whisky' && <WhiskyStats data={data} onBarClick={onBarClick} onStatClick={onStatClick} />}
    </div>
  )
}
