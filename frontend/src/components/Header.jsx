import { useState, useEffect } from 'react'
import styles from './Header.module.css'
import About from './About'

const COLLECTIONS = [
  { id: 'vinyl',  label: '🎵 Vinilos' },
  { id: 'rum',    label: '🥃 Rones'   },
  { id: 'whisky', label: '🥃 Whiskies'},
]

const TITLES = { vinyl: 'Vinilos', rum: 'Rones', whisky: 'Whiskies' }

export default function Header({ coll, setColl }) {
  const [showToken, setShowToken] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [showAbout, setShowAbout] = useState(false)
  const [showPin,   setShowPin]   = useState(false)
  const [pinInput,  setPinInput]  = useState('')
  const [pinInput2, setPinInput2] = useState('')
  const [pinMsg,    setPinMsg]    = useState('')
  const hasToken = !!localStorage.getItem('discogs_token')
  const hasPin   = !!localStorage.getItem('admin_pin')

  useEffect(() => {
    if (showToken) setTokenInput(localStorage.getItem('discogs_token') || '')
  }, [showToken])

  function savePin() {
    if (!pinInput) {
      localStorage.removeItem('admin_pin')
      setPinMsg('PIN eliminado')
    } else if (pinInput !== pinInput2) {
      setPinMsg('Los PINs no coinciden')
      return
    } else {
      localStorage.setItem('admin_pin', pinInput)
      setPinMsg('✅ PIN guardado')
    }
    setPinInput(''); setPinInput2('')
    setTimeout(() => { setShowPin(false); setPinMsg('') }, 1200)
  }

  function saveToken() {
    if (tokenInput.trim()) {
      localStorage.setItem('discogs_token', tokenInput.trim())
    } else {
      localStorage.removeItem('discogs_token')
    }
    setShowToken(false)
  }

  return (
    <>
    {showAbout && <About onClose={() => setShowAbout(false)} />}
    <header className={`${styles.header} ${styles[coll]}`}>
      <div className={`${styles.logo} ${styles[`logo_${coll}`]}`} />
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>{TITLES[coll]}</h1>
        <p className={styles.sub}>Colección Personal · Federico</p>
      </div>
      <div style={{ flex: 1 }} />

      {/* Botón About */}
      <button
        className={styles.tokenIcon}
        onClick={() => setShowAbout(true)}
        title="Documentación del proyecto"
        style={{ opacity: 1, filter: 'none' }}
      >
        📖
      </button>

      {/* PIN de admin */}
      {showPin
        ? <div className={styles.tokenRow}>
            <input
              className={styles.tokenInput}
              type="password"
              placeholder="PIN nuevo..."
              value={pinInput}
              onChange={e => { setPinInput(e.target.value); setPinMsg('') }}
              style={{ width: 120 }}
            />
            <input
              className={styles.tokenInput}
              type="password"
              placeholder="Confirmar..."
              value={pinInput2}
              onChange={e => { setPinInput2(e.target.value); setPinMsg('') }}
              onKeyDown={e => e.key === 'Enter' && savePin()}
              style={{ width: 120 }}
            />
            <button className={styles.tokenBtn} onClick={savePin}>
              {pinInput ? 'Guardar' : 'Quitar PIN'}
            </button>
            <button className={styles.tokenBtn} onClick={() => { setShowPin(false); setPinMsg(''); setPinInput(''); setPinInput2('') }}>✕</button>
            {pinMsg && <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{pinMsg}</span>}
          </div>
        : <button
            className={`${styles.tokenIcon} ${hasPin ? styles.tokenOk : styles.tokenMissing}`}
            onClick={() => setShowPin(true)}
            title={hasPin ? 'PIN admin configurado — click para cambiar' : 'Sin PIN admin — click para configurar'}
          >
            ⚙
          </button>
      }

      {/* Token Discogs */}
      <div className={styles.tokenWrap}>
        {showToken
          ? <div className={styles.tokenRow}>
              <input
                className={styles.tokenInput}
                type="password"
                placeholder="Token Discogs..."
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveToken()}
                autoFocus
              />
              <button className={styles.tokenBtn} onClick={saveToken}>Guardar</button>
              <button className={styles.tokenBtn} onClick={() => setShowToken(false)}>✕</button>
            </div>
          : <button
              className={`${styles.tokenIcon} ${hasToken ? styles.tokenOk : styles.tokenMissing}`}
              onClick={() => setShowToken(true)}
              title={hasToken ? 'Token Discogs guardado — click para cambiar' : 'Sin token Discogs — click para agregar'}
            >
              🔑
            </button>
        }
      </div>

      <nav className={styles.toggle}>
        {COLLECTIONS.map(c => (
          <button
            key={c.id}
            className={`${styles.toggleBtn} ${styles[c.id]} ${coll === c.id ? styles.active : ''}`}
            onClick={() => setColl(c.id)}
          >
            {c.label}
          </button>
        ))}
      </nav>
    </header>
    </>
  )
}
