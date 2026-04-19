import styles from './Header.module.css'

const LOGO_SRC = '/espiritus-vinilos/logo-enlt.jpeg'

// ── SVG icons ────────────────────────────────────────────────────────────────
function VinylIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
      <circle cx="12" cy="12" r="6.5" strokeDasharray="2 2.5"/>
    </svg>
  )
}

function SpiritsIcon() {
  return (
    <svg width="14" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8l1 6H7L8 2z"/>
      <path d="M7 8c0 0-2 3-2 6a7 7 0 0 0 14 0c0-3-2-6-2-6"/>
      <line x1="12" y1="14" x2="12" y2="18"/>
    </svg>
  )
}

function WhiskyIcon() {
  return (
    <svg width="14" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2"/>
      <path d="M5 9h14"/>
      <path d="M9 9v3"/>
      <path d="M15 9v3"/>
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

const COLLECTIONS = [
  { id: 'vinyl',  labelEs: 'Vinilos',  labelEn: 'Records',  Icon: VinylIcon   },
  { id: 'rum',    labelEs: 'Rones',    labelEn: 'Rums',     Icon: SpiritsIcon },
  { id: 'whisky', labelEs: 'Whiskies', labelEn: 'Whiskies', Icon: WhiskyIcon  },
]

export default function Header({ coll, setColl, onSettings, lang, setLang }) {
  return (
    <header className={`${styles.header} ${styles[coll]}`}>
      <img
        src={LOGO_SRC}
        alt="En Las Nubes Trepao"
        className={styles.logo}
        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }}
      />
      <div className={`${styles.logo} ${styles[`logo_${coll}`]}`} style={{ display: 'none' }} />

      <div className={styles.titleBlock}>
        <h1 className={styles.title}>En Las Nubes Trepao</h1>
        <p className={styles.sub}>
          {lang === 'en' ? 'Spirits & Records' : 'Espíritus & Vinilos'}
        </p>
      </div>

      <div style={{ flex: 1 }} />

      {/* Redes sociales */}
      <div className={styles.socials}>
        <a href="https://www.tiktok.com/@enlasnubestrepao13" target="_blank" rel="noreferrer"
           className={styles.socialBtn} title="TikTok">
          <TikTokIcon />
        </a>
        <a href="https://www.instagram.com/enlasnubestrepao/" target="_blank" rel="noreferrer"
           className={styles.socialBtn} title="Instagram">
          <InstagramIcon />
        </a>
      </div>

      {/* Lang toggle */}
      <button
        className={styles.langBtn}
        onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
        title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      >
        {lang === 'es' ? 'EN' : 'ES'}
      </button>

      {/* Settings */}
      <button className={styles.settingsBtn} onClick={onSettings} title="Configuración">
        <GearIcon />
      </button>

      {/* Nav */}
      <nav className={styles.toggle}>
        {COLLECTIONS.map(c => (
          <button
            key={c.id}
            className={`${styles.toggleBtn} ${styles[c.id]} ${coll === c.id ? styles.active : ''}`}
            onClick={() => setColl(c.id)}
          >
            <span className={styles.btnIcon}><c.Icon /></span>
            <span>{lang === 'en' ? c.labelEn : c.labelEs}</span>
          </button>
        ))}
      </nav>
    </header>
  )
}
