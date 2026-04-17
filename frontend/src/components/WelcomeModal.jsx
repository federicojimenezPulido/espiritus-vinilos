import { useState } from 'react'
import styles from './WelcomeModal.module.css'

const STORAGE_KEY = 'enlt_welcome_seen'

export function shouldShowWelcome() {
  return !localStorage.getItem(STORAGE_KEY)
}

export default function WelcomeModal({ onClose }) {
  const [dontShow, setDontShow] = useState(false)

  function handleClose() {
    if (dontShow) localStorage.setItem(STORAGE_KEY, '1')
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className={styles.box}>

        {/* Hero con logo/título */}
        <div className={styles.hero}>
          <div className={styles.heroTitle}>En Las Nubes Trepao</div>
          <div className={styles.heroSub}>Espíritus &amp; Vinilos</div>
          <div className={styles.heroTagline}>Una colección personal. Tres mundos.</div>
        </div>

        {/* Sección: qué es este lugar */}
        <div className={styles.intro}>
          <p>
            Esto no es una tienda ni una base de datos. Es el archivo de lo que suena y lo que se sirve
            en las nubes — discos que ya no suenan en el radio, rones de destilerías que no necesitan premios,
            whiskies de lugares que todavía trabajan con tiempo.
          </p>
        </div>

        {/* Sección: las tres colecciones en 3 cards */}
        <div className={styles.collectionsRow}>
          <div className={styles.collCard}>
            <div className={styles.collIcon}>🎵</div>
            <div className={styles.collName}>Vinilos</div>
            <div className={styles.collDesc}>Salsa, jazz, bolero, rock. Artistas que moldearon épocas y que merecen seguir sonando.</div>
          </div>
          <div className={styles.collCard}>
            <div className={styles.collIcon}>🥃</div>
            <div className={styles.collName}>Rones</div>
            <div className={styles.collDesc}>Caña destilada con identidad. Desde el Caribe hasta Latinoamérica.</div>
          </div>
          <div className={styles.collCard}>
            <div className={styles.collIcon}>🥃</div>
            <div className={styles.collName}>Whiskies</div>
            <div className={styles.collDesc}>Expresiones de destilerías que priorizan el proceso sobre el marketing.</div>
          </div>
        </div>

        {/* Sección: features key */}
        <div className={styles.features}>
          <div className={styles.featuresTitle}>Lo que podés hacer</div>
          <ul className={styles.featureList}>
            <li>🔍 Buscar y filtrar por género, país, tipo</li>
            <li>📊 Ver estadísticas de la colección</li>
            <li>🎵 Escuchar en Spotify directamente</li>
            <li>🔗 Compartir un disco con alguien</li>
          </ul>
        </div>

        {/* Footer: checkbox + botón CTA */}
        <div className={styles.footer}>
          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={dontShow}
              onChange={e => setDontShow(e.target.checked)}
            />
            <span>No mostrar de nuevo</span>
          </label>
          <button className={styles.ctaBtn} onClick={handleClose}>
            Explorar la colección →
          </button>
        </div>

      </div>
    </div>
  )
}
