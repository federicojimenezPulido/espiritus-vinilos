import { useMemo } from 'react'
import { useLang } from '../LangContext'
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

/* ── Hero summary — grilla de tarjetas KPI ── */
function HeroSummary({ heroNum, heroLbl, heroAccent, kpis, onStatClick }) {
  const { t } = useLang()
  return (
    <div className={styles.summaryGrid}>
      {/* Tarjeta protagonista */}
      <div className={styles.heroCard} style={{ '--hero-accent': heroAccent }}>
        <span className={styles.heroNum} style={{ color: heroAccent }}>{heroNum}</span>
        <span className={styles.heroLbl}>{heroLbl}</span>
      </div>
      {/* KPIs secundarios */}
      {kpis.map((kpi, i) => (
        <div
          key={i}
          className={[
            styles.kpiCard,
            kpi.clickable && onStatClick ? styles.kpiClickable : '',
            kpi.alert ? styles.kpiAlert : '',
          ].join(' ')}
          onClick={kpi.clickable && onStatClick ? () => onStatClick(kpi.title, kpi.items) : undefined}
          title={kpi.clickable && onStatClick ? `${t('view')} ${kpi.items?.length} ${t('records')}` : undefined}
        >
          <span className={styles.kpiNum}>{kpi.num}</span>
          <span className={styles.kpiLbl}>{kpi.lbl}</span>
          {kpi.desc && <span className={styles.kpiDesc}>{kpi.desc}</span>}
        </div>
      ))}
    </div>
  )
}

/* ── Bar chart ── */
function BarChart({ title, entries, accent, filterKey, onBarClick, accentTop }) {
  const { t } = useLang()
  if (!entries || entries.length === 0) return null
  const max     = entries[0][1]
  const total   = entries.reduce((s, [, c]) => s + c, 0)
  const clickable = !!(filterKey && onBarClick)
  return (
    <div className={styles.card} style={{ '--card-accent': accentTop || accent }}>
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
  const withSpotify  = data.filter(r => r.spotify_id).length
  const pctDiscogs   = data.length ? Math.round((withDiscogs / data.length) * 100) : 0
  const pctSpotify   = data.length ? Math.round((withSpotify / data.length) * 100) : 0
  const prestados    = data.filter(r => r.fuera).length
  const noDiscogs    = data.filter(r => !r.discogs)

  const kpis = [
    { num: totalArtists,     lbl: t('artists') },
    { num: `${pctDiscogs}%`, lbl: t('onDiscogs'),  desc: t('discogsDesc'),  clickable: true, items: data.filter(r => r.discogs),          title: t('withDiscogs') },
    { num: `${pctSpotify}%`, lbl: 'Spotify',       desc: t('spotifyLinked'), clickable: true, items: data.filter(r => r.spotify_id), title: t('withSpotify') },
    ...(prestados > 0 ? [{ num: prestados, lbl: t('lentOut'), clickable: true, items: data.filter(r => r.fuera), title: t('lentOut') }] : []),
  ]

  return (
    <>
      <HeroSummary
        heroNum={data.length} heroLbl={t('albums')} heroAccent="var(--v-acc2)"
        kpis={kpis} onStatClick={onStatClick}
      />
      <BarChart title={t('topGenres')}   entries={genres}     accent="var(--v-acc2)" accentTop="var(--v-acc2)" filterKey="agrupador" onBarClick={onBarClick} />
      <BarChart title={t('categories')}  entries={categories} accent="var(--v-gold)" accentTop="var(--v-gold)" filterKey="genero"    onBarClick={onBarClick} />
      <BarChart title={t('labels')}      entries={sellos}     accent="var(--v-acc)"  accentTop="var(--v-acc)"  filterKey="sello"     onBarClick={onBarClick} />
      <BarChart title={t('byDecade')}    entries={decades}    accent="var(--v-acc2)" accentTop="var(--v-acc2)" filterKey="decade"    onBarClick={onBarClick} />
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
  const noCover     = data.filter(r => !r.cover_url)

  const kpis = [
    { num: countries.length, lbl: t('countries'), desc: t('countriesDesc') },
    { num: types.length,     lbl: t('types'),     desc: t('typesDesc') },
    { num: avgScale,         lbl: t('avgScale'),  desc: t('avgScaleDesc') },
    ...(terminados > 0 ? [{ num: terminados, lbl: t('finishedStat'), clickable: true, items: data.filter(r => r.terminado), title: t('finishedStat') }] : []),
  ]

  return (
    <>
      <HeroSummary
        heroNum={data.length} heroLbl={t('rums')} heroAccent="var(--ru-acc2)"
        kpis={kpis} onStatClick={onStatClick}
      />
      <BarChart title={t('countries')}    entries={countries} accent="var(--ru-acc2)" accentTop="var(--ru-acc2)" filterKey="country" onBarClick={onBarClick} />
      <BarChart title={t('types')}        entries={types}     accent="var(--ru-gold)" accentTop="var(--ru-gold)" filterKey="type"    onBarClick={onBarClick} />
      <BarChart title={t('regions')}      entries={regions}   accent="var(--ru-acc)"  accentTop="var(--ru-acc)"  filterKey="region"  onBarClick={onBarClick} />
      <BarChart title={t('blendVsSingle')} entries={blends}   accent="var(--ru-acc)"  accentTop="var(--ru-acc)" />
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
  const noCover    = data.filter(r => !r.cover_url)

  const kpis = [
    { num: countries.length, lbl: t('countries'), desc: t('countriesDesc') },
    { num: regions.length,   lbl: t('regions'),   desc: t('regionsDesc') },
    { num: withAge,          lbl: t('withAge'),   desc: t('ageDesc'),  clickable: true, items: data.filter(r => r.years),  title: t('ageDeclared') },
    { num: nas,              lbl: 'NAS',                               clickable: true, items: data.filter(r => !r.years), title: t('nas') },
    ...(terminados > 0 ? [{ num: terminados, lbl: t('finishedStat'), clickable: true, items: data.filter(r => r.terminado), title: t('finishedStat') }] : []),
  ]

  return (
    <>
      <HeroSummary
        heroNum={data.length} heroLbl={t('whiskies')} heroAccent="var(--wh-acc2)"
        kpis={kpis} onStatClick={onStatClick}
      />
      <BarChart title={t('countries')} entries={countries} accent="var(--wh-acc2)" accentTop="var(--wh-acc2)" filterKey="country" onBarClick={onBarClick} />
      <BarChart title={t('types')}     entries={types}     accent="var(--wh-gold)" accentTop="var(--wh-gold)" filterKey="type"    onBarClick={onBarClick} />
      <BarChart title={t('regions')}   entries={regions}   accent="var(--wh-acc2)" accentTop="var(--wh-acc2)" filterKey="region"  onBarClick={onBarClick} />
      <BarChart title={t('origin')}    entries={origins}   accent="var(--wh-acc)"  accentTop="var(--wh-acc)"  filterKey="origin"  onBarClick={onBarClick} />
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
      {coll === 'vinyl'  && <VinylStats  data={data} onBarClick={onBarClick} onStatClick={onStatClick} />}
      {coll === 'rum'    && <RumStats    data={data} onBarClick={onBarClick} onStatClick={onStatClick} />}
      {coll === 'whisky' && <WhiskyStats data={data} onBarClick={onBarClick} onStatClick={onStatClick} />}
    </div>
  )
}
