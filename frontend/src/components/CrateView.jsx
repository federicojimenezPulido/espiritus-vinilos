import { useState } from 'react'
import { useLang } from '../LangContext'
import styles from './CrateView.module.css'

/* ── Color por agrupador ── */
const LABEL_COLORS = {
  'Salsa/Latina':                  '#c0392b',
  'Jazz/Bigband/Sountracks/Swing': '#1a5276',
  'Voices':                        '#7d3c98',
  'SonCubano/Bolero/Mambo':        '#d35400',
  'Rock':                          '#1e8449',
  'Tropical/Bailable/Parrandera':  '#e67e22',
  'Balada/Pop/Romantica':          '#2980b9',
  'Hip-Hop/Rap':                   '#17202a',
}

function spineColor(item) {
  return LABEL_COLORS[item.agrupador] || '#3a3a3a'
}

/* ── Disco individual ── */
function SpineRecord({ item, onClick }) {
  const [hovered, setHovered] = useState(false)
  const color = spineColor(item)

  return (
    <div
      className={`${styles.record} ${hovered ? styles.recordHovered : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(item)}
      title={`${item.artista} — ${item.album} (${item.anio || '?'})`}
      style={{ '--spine-color': color }}
    >
      {/* Portada que emerge al hacer hover */}
      <div className={styles.cover}>
        {item.cover_url
          ? <img src={item.cover_url} alt={item.album} loading="lazy" />
          : <div className={styles.coverPlaceholder}>
              <div className={styles.vinylDisc}>
                <div className={styles.vinylLabel} style={{ background: color }}>
                  {(item.artista || '').substring(0, 10)}
                </div>
              </div>
            </div>
        }
      </div>

      {/* Lomo */}
      <div className={styles.spine}>
        <span className={styles.spineArtist}>{item.artista}</span>
        <span className={styles.spineAlbum}>{item.album}</span>
        {item.anio && <span className={styles.spineYear}>{item.anio}</span>}
      </div>
    </div>
  )
}

/* ── Anaquel (una fila) ── */
function Shelf({ items, onSelect }) {
  return (
    <div className={styles.shelf}>
      <div className={styles.shelfBoard} />
      <div className={styles.records}>
        {items.map((item, i) => (
          <SpineRecord key={i} item={item} onClick={onSelect} />
        ))}
        <div className={styles.bookend} />
      </div>
    </div>
  )
}

/* ── Vista principal ── */
export default function CrateView({ data, onSelect }) {
  const [activeGenre, setActiveGenre] = useState(null)
  const { t } = useLang()

  // Géneros presentes en la colección actual
  const genres = Object.entries(LABEL_COLORS).filter(([genre]) =>
    data.some(r => r.agrupador === genre)
  )

  // Filtrar por género si hay uno activo
  const visible = activeGenre
    ? data.filter(r => r.agrupador === activeGenre)
    : data

  const SHELF_SIZE = 18
  const shelves = []
  for (let i = 0; i < visible.length; i += SHELF_SIZE) {
    shelves.push(visible.slice(i, i + SHELF_SIZE))
  }

  return (
    <div className={styles.container}>

      {/* Filtro por género — clic activa/desactiva */}
      <div className={styles.legend}>
        <button
          className={`${styles.legendItem} ${!activeGenre ? styles.legendActive : ''}`}
          onClick={() => setActiveGenre(null)}
        >
          <span className={styles.legendDot} style={{ background: 'var(--text3)' }} />
          {t('all')} ({data.length})
        </button>
        {genres.map(([genre, color]) => {
          const count = data.filter(r => r.agrupador === genre).length
          return (
            <button
              key={genre}
              className={`${styles.legendItem} ${activeGenre === genre ? styles.legendActive : ''}`}
              style={activeGenre === genre ? { '--active-color': color } : {}}
              onClick={() => setActiveGenre(g => g === genre ? null : genre)}
            >
              <span className={styles.legendDot} style={{ background: color }} />
              {genre}
              <span className={styles.legendCount}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Contador */}
      <p className={styles.filterInfo}>
        {activeGenre
          ? <><strong style={{ color: LABEL_COLORS[activeGenre] }}>{activeGenre}</strong> · {visible.length} {t('discs')}</>
          : <>{visible.length} {t('discs')} {t('inCollection')}</>
        }
      </p>

      {/* Anaqueles */}
      {visible.length > 0
        ? <div className={styles.unit}>
            {shelves.map((shelf, i) => (
              <Shelf key={i} items={shelf} onSelect={onSelect} />
            ))}
          </div>
        : <div className={styles.empty}>{t('noResults')}</div>
      }

      <p className={styles.hint}>
        {t('crateHint')}
      </p>
    </div>
  )
}
