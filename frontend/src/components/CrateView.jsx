import { useState, useRef } from 'react'
import styles from './CrateView.module.css'

/* ── Color por agrupador — mismo mapa que Modal/Dashboard ── */
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

/* ── Un disco individual en el anaquel ── */
function SpineRecord({ item, index, onClick }) {
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
      {/* Portada que aparece al sacar el disco */}
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

      {/* Lomo del disco */}
      <div className={styles.spine}>
        <span className={styles.spineArtist}>{item.artista}</span>
        <span className={styles.spineAlbum}>{item.album}</span>
        {item.anio && <span className={styles.spineYear}>{item.anio}</span>}
      </div>
    </div>
  )
}

/* ── Anaquel (una fila de discos) ── */
function Shelf({ items, onSelect }) {
  return (
    <div className={styles.shelf}>
      {/* Madera del anaquel */}
      <div className={styles.shelfBoard} />
      {/* Discos */}
      <div className={styles.records}>
        {items.map((item, i) => (
          <SpineRecord key={i} item={item} index={i} onClick={onSelect} />
        ))}
        {/* Sujetador final */}
        <div className={styles.bookend} />
      </div>
    </div>
  )
}

/* ── Vista principal ── */
export default function CrateView({ data, onSelect }) {
  const SHELF_SIZE = 18   // discos por anaquel

  const shelves = []
  for (let i = 0; i < data.length; i += SHELF_SIZE) {
    shelves.push(data.slice(i, i + SHELF_SIZE))
  }

  // Leyenda de colores
  const legend = Object.entries(LABEL_COLORS).filter(([genre]) =>
    data.some(r => r.agrupador === genre)
  )

  return (
    <div className={styles.container}>
      {/* Leyenda */}
      <div className={styles.legend}>
        {legend.map(([genre, color]) => (
          <span key={genre} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: color }} />
            {genre}
          </span>
        ))}
      </div>

      {/* Anaqueles */}
      <div className={styles.unit}>
        {shelves.map((shelf, i) => (
          <Shelf key={i} items={shelf} onSelect={onSelect} />
        ))}
      </div>

      <p className={styles.hint}>
        Pasá el cursor sobre un disco para verlo · Hacé clic para ver el detalle
      </p>
    </div>
  )
}
