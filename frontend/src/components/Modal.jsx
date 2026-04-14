import { useEffect } from 'react'
import styles from './Modal.module.css'

// Cerrar con Escape — useEffect con cleanup
// Analogía: como un trigger que se activa y se desactiva
export default function Modal({ item, coll, onClose, onEdit }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler) // cleanup
  }, [onClose])

  if (!item) return null

  const fields = getFields(item, coll)
  const title  = coll === 'vinyl' ? item.album   : (item.name || item.version || item.brand)
  const sub    = coll === 'vinyl' ? item.artista  : `${item.brand} · ${item.country || ''}`
  const url    = item.url

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>

        {/* Header con color por colección */}
        <div className={`${styles.hdr} ${styles[coll]}`}>
          <div className={styles.icon}>
            {coll === 'vinyl' ? <VinylIcon agrupador={item.agrupador} artista={item.artista} /> : '🥃'}
          </div>
          <div className={styles.hdrText}>
            <h2>{title}</h2>
            <p>{sub}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Grilla de detalles */}
        <div className={styles.body}>
          <div className={styles.detGrid}>
            {fields.map(([label, value]) => (
              <div className={styles.det} key={label}>
                <div className={styles.detLbl}>{label}</div>
                <div className={styles.detVal}>{value ?? '—'}</div>
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div className={styles.actions}>
            {coll === 'vinyl'
              ? (
                  <a
                    href={url || `https://www.discogs.com/search/?q=${encodeURIComponent(`${item.artista} ${item.album}`)}&type=master`}
                    target="_blank" rel="noreferrer"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    🔗 Ver en Discogs
                  </a>
                )
              : url && (
                  <a href={url} target="_blank" rel="noreferrer" className={`${styles.btn} ${styles.btnPrimary} ${styles[coll]}`}>
                    🌐 Sitio oficial
                  </a>
                )
            }
            {onEdit && (
              <button className={`${styles.btn} ${styles.btnPrimary} ${styles[coll]}`} onClick={onEdit}>
                ✏ Editar
              </button>
            )}
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Campos por colección ──────────────────────────────────────────────────────
function getFields(item, coll) {
  if (coll === 'vinyl') return [
    ['Artista',      item.artista],
    ['Álbum',        item.album],
    ['Género',       item.genero],
    ['Categoría',    item.agrupador],
    ['Año',          item.anio],
    ['País prensado',item.pais],
    ['Sello',        item.sello],
    ['País sello',   item.pais_sello],
    ['Cat. Nº',      item.cat_num],
    ['Origen',       item.origen],
    ['Estado',       item.fuera ? '📦 Fuera' : '✅ En colección'],
    ['Discogs',      item.discogs ? '🔗 Sí' : '❌ No'],
  ]
  if (coll === 'rum') return [
    ['Marca',        item.brand],
    ['Nombre',       item.name],
    ['Tipo',         item.type],
    ['ABV',          item.abv ? `${item.abv}%` : null],
    ['Blend',        item.blend],
    ['Edad mín.',    item.age_low ? `${item.age_low} años` : null],
    ['Edad máx.',    item.age_max ? `${item.age_max} años` : null],
    ['Región',       item.region],
    ['País',         item.country],
    ['Escala',       item.scale ? '★'.repeat(item.scale) : null],
  ]
  return [
    ['Marca',        item.brand],
    ['Expresión',    item.version],
    ['Tipo',         item.type],
    ['ABV',          item.abv ? `${item.abv}%` : null],
    ['Años',         item.years ? `${item.years} años` : 'NAS'],
    ['Región',       item.region],
    ['País',         item.country],
    ['Origen',       item.origin],
    ['Destilería',   item.distillery],
  ]
}

// ── Vinyl icon en el modal ────────────────────────────────────────────────────
const LABEL_COLORS = {
  'Salsa/Latina':'#c0392b','Jazz/Bigband/Sountracks/Swing':'#1a5276',
  'Voices':'#7d3c98','SonCubano/Bolero/Mambo':'#d35400',
  'Rock':'#1e8449','Tropical/Bailable/Parrandera':'#e67e22',
  'Balada/Pop/Romantica':'#2980b9','Hip-Hop/Rap':'#17202a',
}

function VinylIcon({ agrupador, artista }) {
  const clr = LABEL_COLORS[agrupador] || '#555'
  return (
    <div style={{
      width: '100%', height: '100%', borderRadius: '50%',
      background: 'conic-gradient(#1a1a1a 0,#222 15deg,#1a1a1a 30deg,#222 45deg,#1a1a1a 60deg,#222 75deg,#1a1a1a 90deg,#222 105deg,#1a1a1a 120deg,#222 135deg,#1a1a1a 150deg,#222 165deg,#1a1a1a 180deg,#222 195deg,#1a1a1a 210deg,#222 225deg,#1a1a1a 240deg,#222 255deg,#1a1a1a 270deg,#222 285deg,#1a1a1a 300deg,#222 315deg,#1a1a1a 330deg,#222 345deg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '44%', height: '44%', borderRadius: '50%', background: clr,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '.45rem', fontWeight: 700, color: '#fff', textAlign: 'center', padding: '3px',
      }}>
        {(artista || '').substring(0, 12)}
      </div>
    </div>
  )
}
