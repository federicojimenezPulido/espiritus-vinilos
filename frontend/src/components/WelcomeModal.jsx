import { useState } from 'react'
import styles from './WelcomeModal.module.css'

const STORAGE_KEY = 'enlt_welcome_seen'

export function shouldShowWelcome() {
  return !localStorage.getItem(STORAGE_KEY)
}

function VinylIcon() {
  return (
    <svg viewBox="0 0 64 64" width="48" height="48" fill="none">
      <circle cx="32" cy="32" r="30" fill="#1a0a0a" stroke="#c0392b" strokeWidth="1.5"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#333" strokeWidth="1"/>
      <circle cx="32" cy="32" r="15" fill="none" stroke="#333" strokeWidth="1"/>
      <circle cx="32" cy="32" r="9"  fill="none" stroke="#333" strokeWidth="1"/>
      <circle cx="32" cy="32" r="10" fill="#c0392b"/>
      <circle cx="32" cy="32" r="3"  fill="#111"/>
    </svg>
  )
}

function RumIcon() {
  return (
    <svg viewBox="0 0 64 80" width="38" height="48" fill="none">
      <rect x="22" y="4" width="20" height="8" rx="3" fill="#7a4a1a" stroke="#a0622a" strokeWidth="1.2"/>
      <path d="M18 14 Q16 26 16 40 Q16 68 32 68 Q48 68 48 40 Q48 26 46 14 Z" fill="#b5651d" stroke="#a0622a" strokeWidth="1.2"/>
      <path d="M20 30 Q32 24 44 30" stroke="rgba(255,255,255,.15)" strokeWidth="1.5" fill="none"/>
      <path d="M18 48 Q32 42 46 48" stroke="rgba(255,255,255,.1)" strokeWidth="1" fill="none"/>
      <rect x="24" y="4" width="16" height="3" rx="1.5" fill="#c07830"/>
    </svg>
  )
}

function WhiskyIcon() {
  return (
    <svg viewBox="0 0 64 80" width="38" height="48" fill="none">
      <path d="M16 20 L20 68 Q20 72 32 72 Q44 72 44 68 L48 20 Z" fill="#1a3a5c" stroke="#2a5a8c" strokeWidth="1.2"/>
      <path d="M16 20 L48 20 L46 12 Q44 8 32 8 Q20 8 18 12 Z" fill="#2a5a8c" stroke="#3a7abf" strokeWidth="1"/>
      <path d="M20 36 Q32 30 44 36" stroke="rgba(255,255,255,.15)" strokeWidth="1.5" fill="none"/>
      <path d="M22 52 Q32 46 42 52" stroke="rgba(255,255,255,.1)" strokeWidth="1" fill="none"/>
      <rect x="24" y="8" width="16" height="2" rx="1" fill="#3a7abf"/>
    </svg>
  )
}

function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
}
function StatsIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="14" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="14" rx="1"/><rect x="18" y="3" width="4" height="19" rx="1"/></svg>
}
function SpotifyIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 0 1-.277-1.215c3.809-.87 7.077-.496 9.712 1.115.294.181.387.563.207.857zm1.224-2.724a.78.78 0 0 1-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 1 1-.453-1.492c3.632-1.102 8.147-.568 11.233 1.329a.78.78 0 0 1 .257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 1 1-.543-1.79c3.532-1.072 9.404-.865 13.115 1.337a.937.937 0 0 1-.954 1.608z"/></svg>
}
function ShareIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
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
          <div className={`${styles.collCard} ${styles.collVinyl}`}>
            <div className={styles.collIcon}><VinylIcon /></div>
            <div className={styles.collName}>Vinilos</div>
            <div className={styles.collDesc}>Salsa, jazz, bolero, rock. Artistas que moldearon épocas.</div>
          </div>
          <div className={`${styles.collCard} ${styles.collRum}`}>
            <div className={styles.collIcon}><RumIcon /></div>
            <div className={styles.collName}>Rones</div>
            <div className={styles.collDesc}>Caña destilada con identidad. Desde el Caribe hasta Latinoamérica.</div>
          </div>
          <div className={`${styles.collCard} ${styles.collWhisky}`}>
            <div className={styles.collIcon}><WhiskyIcon /></div>
            <div className={styles.collName}>Whiskies</div>
            <div className={styles.collDesc}>Destilerías que priorizan el proceso sobre el marketing.</div>
          </div>
        </div>

        {/* Sección: features key */}
        <div className={styles.features}>
          <div className={styles.featuresTitle}>Lo que podés hacer</div>
          <ul className={styles.featureList}>
            <li><SearchIcon /> Buscar y filtrar por género, sello, tipo</li>
            <li><StatsIcon /> Ver estadísticas de la colección</li>
            <li><SpotifyIcon /> Escuchar en Spotify directamente</li>
            <li><ShareIcon /> Compartir un disco con alguien</li>
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
