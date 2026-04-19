import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getVinyls, savePin, deletePin, getPinStatus } from '../services/api'
import styles from './SettingsPanel.module.css'

// Campos auditados por vinilo
const AUDIT_FIELDS = [
  { key: 'cover_url',  label: 'Portada'   },
  { key: 'genero',     label: 'Género'    },
  { key: 'agrupador',  label: 'Categoría' },
  { key: 'sello',      label: 'Sello'     },
  { key: 'pais_sello', label: 'P.Sello'   },
  { key: 'anio',       label: 'Año'       },
  { key: 'cat_num',    label: 'Cat.Nº'    },
  { key: 'pais',       label: 'País'      },
  { key: 'url',        label: 'Discogs'   },
  { key: 'spotify_id', label: 'Spotify'   },
  { key: 'tiktok_url', label: 'TikTok'    },
  { key: 'ig_url',     label: 'Instagram' },
]

export default function SettingsPanel({ onClose, onPinChange }) {
  const [tab, setTab] = useState('config')

  // ── Config state ──
  const [token,    setToken]    = useState(() => localStorage.getItem('discogs_token') || '')
  const [pin1,     setPin1]     = useState('')
  const [pin2,     setPin2]     = useState('')
  const [pinMsg,   setPinMsg]   = useState('')
  const [pinSaving,setPinSaving]= useState(false)
  const [tokenMsg, setTokenMsg] = useState('')
  const [hasPin,   setHasPin]   = useState(false)

  useEffect(() => {
    getPinStatus().then(({ set }) => setHasPin(set)).catch(() => {})
  }, [])

  // ── Audit state ──
  const [auditFilter, setAuditFilter] = useState('incomplete') // 'incomplete' | 'all'
  const [auditSort,   setAuditSort]   = useState('missing')    // 'missing' | 'artista'

  const { data: vinyls = [], isLoading } = useQuery({
    queryKey: ['vinyl'],
    queryFn: getVinyls,
    staleTime: 60_000,
  })

  // ── Handlers ──
  function saveToken() {
    if (token.trim()) {
      localStorage.setItem('discogs_token', token.trim())
      setTokenMsg('✅ Token guardado')
    } else {
      localStorage.removeItem('discogs_token')
      setTokenMsg('Token eliminado')
    }
    setTimeout(() => setTokenMsg(''), 2200)
  }

  async function handleDeletePin() {
    setPinSaving(true)
    try {
      await deletePin()
      setHasPin(false)
      setPin1(''); setPin2('')
      setPinMsg('PIN eliminado')
      onPinChange?.()
    } catch { setPinMsg('⚠ Error al eliminar') }
    finally { setPinSaving(false) }
    setTimeout(() => setPinMsg(''), 2200)
  }

  async function handleSavePin() {
    if (!pin1) {
      setPinSaving(true)
      try {
        await deletePin()
        setHasPin(false)
        setPinMsg('PIN eliminado')
        onPinChange?.()
      } catch { setPinMsg('⚠ Error al eliminar') }
      finally { setPinSaving(false) }
    } else if (pin1 !== pin2) {
      setPinMsg('⚠ Los PINs no coinciden')
      return
    } else {
      setPinSaving(true)
      try {
        await savePin(pin1)
        setHasPin(true)
        setPinMsg('✅ PIN guardado')
        onPinChange?.()
      } catch { setPinMsg('⚠ Error al guardar') }
      finally { setPinSaving(false) }
    }
    setPin1(''); setPin2('')
    setTimeout(() => setPinMsg(''), 2200)
  }

  // ── Audit computation ──
  const auditRows = vinyls.map((item, idx) => {
    const missing = AUDIT_FIELDS.filter(f => !item[f.key])
    const score   = Math.round(((AUDIT_FIELDS.length - missing.length) / AUDIT_FIELDS.length) * 100)
    return { item, idx, missing, score }
  })

  let displayed = auditFilter === 'incomplete'
    ? auditRows.filter(r => r.missing.length > 0)
    : auditRows

  displayed = [...displayed].sort((a, b) => {
    if (auditSort === 'missing') {
      const diff = b.missing.length - a.missing.length
      return diff !== 0 ? diff : (a.item.artista || '').localeCompare(b.item.artista || '', 'es')
    }
    return (a.item.artista || '').localeCompare(b.item.artista || '', 'es')
  })

  const totalMissing  = auditRows.reduce((s, r) => s + r.missing.length, 0)
  const totalPossible = auditRows.length * AUDIT_FIELDS.length
  const globalScore   = totalPossible ? Math.round(((totalPossible - totalMissing) / totalPossible) * 100) : 0

  const hasToken = !!localStorage.getItem('discogs_token')

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>

        {/* ── Header ── */}
        <div className={styles.hdr}>
          <span className={styles.hdrTitle}>⚙ Configuración</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'config' ? styles.tabActive : ''}`}
            onClick={() => setTab('config')}
          >Config</button>
          <button
            className={`${styles.tab} ${tab === 'audit' ? styles.tabActive : ''}`}
            onClick={() => setTab('audit')}
          >📋 Auditor</button>
          <button
            className={`${styles.tab} ${tab === 'docs' ? styles.tabActive : ''}`}
            onClick={() => setTab('docs')}
          >📖 Docs</button>
        </div>

        {/* ══════════════ CONFIG TAB ══════════════ */}
        {tab === 'config' && (
          <div className={styles.body}>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>🛡 Acceso admin</div>
              <div className={styles.fieldLabel}>
                PIN Admin — {hasPin ? '✅ configurado' : '⚠ sin PIN (acceso libre)'}
              </div>
              <div className={styles.fieldRow}>
                <input
                  type="password"
                  placeholder="PIN nuevo…"
                  value={pin1}
                  onChange={e => { setPin1(e.target.value); setPinMsg('') }}
                  className={styles.input}
                />
                <input
                  type="password"
                  placeholder="Confirmar…"
                  value={pin2}
                  onChange={e => { setPin2(e.target.value); setPinMsg('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSavePin()}
                  className={styles.input}
                />
                <button className={styles.btn} onClick={handleSavePin} disabled={pinSaving}>
                  {pinSaving ? '…' : 'Guardar'}
                </button>
                {hasPin && (
                  <button className={styles.btnDanger} onClick={handleDeletePin} disabled={pinSaving}>
                    {pinSaving ? '…' : 'Eliminar PIN'}
                  </button>
                )}
              </div>
              {pinMsg && <div className={styles.msg}>{pinMsg}</div>}
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>🔑 Integraciones</div>
              <div className={styles.fieldLabel}>
                Token Discogs — {hasToken ? '✅ configurado' : '⚠ sin token (portadas manuales)'}
              </div>
              <div className={styles.fieldRow}>
                <input
                  type="password"
                  placeholder="Token de Discogs…"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveToken()}
                  className={`${styles.input} ${styles.inputWide}`}
                />
                <button className={styles.btn} onClick={saveToken}>Guardar</button>
              </div>
              {tokenMsg && <div className={styles.msg}>{tokenMsg}</div>}
            </div>

          </div>
        )}

        {/* ══════════════ AUDITOR TAB ══════════════ */}
        {tab === 'audit' && (
          <div className={styles.body}>

            {/* Global score */}
            <div className={styles.auditSummary}>
              <div className={styles.auditScore}>
                <span className={styles.auditScoreNum}>{globalScore}%</span>
                <span className={styles.auditScoreLabel}>completitud global · {totalMissing} campos vacíos en {vinyls.length} discos</span>
              </div>
              <div className={styles.auditScoreBar}>
                <div className={styles.auditScoreFill} style={{ width: `${globalScore}%` }} />
              </div>
            </div>

            {/* Controls */}
            <div className={styles.auditControls}>
              <div className={styles.btnGroup}>
                <button
                  className={`${styles.filterBtn} ${auditFilter === 'incomplete' ? styles.filterActive : ''}`}
                  onClick={() => setAuditFilter('incomplete')}
                >Incompletos ({auditRows.filter(r => r.missing.length > 0).length})</button>
                <button
                  className={`${styles.filterBtn} ${auditFilter === 'all' ? styles.filterActive : ''}`}
                  onClick={() => setAuditFilter('all')}
                >Todos ({auditRows.length})</button>
              </div>
              <div className={styles.btnGroup}>
                <button
                  className={`${styles.filterBtn} ${auditSort === 'missing' ? styles.filterActive : ''}`}
                  onClick={() => setAuditSort('missing')}
                >↓ Más vacíos</button>
                <button
                  className={`${styles.filterBtn} ${auditSort === 'artista' ? styles.filterActive : ''}`}
                  onClick={() => setAuditSort('artista')}
                >A–Z</button>
              </div>
            </div>

            {/* Table */}
            {isLoading
              ? <div className={styles.loading}>Cargando colección…</div>
              : (
                <div className={styles.auditWrap}>
                  <table className={styles.auditTable}>
                    <thead>
                      <tr>
                        <th className={styles.thArtista}>Artista</th>
                        <th className={styles.thAlbum}>Álbum</th>
                        <th className={styles.thScore}>%</th>
                        {AUDIT_FIELDS.map(f => (
                          <th key={f.key} className={styles.thField} title={f.label}>
                            {f.label.slice(0, 4)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayed.map(({ item, idx, missing, score }) => (
                        <tr key={idx} className={styles.auditRow}>
                          <td className={styles.tdArtista}>{item.artista}</td>
                          <td className={styles.tdAlbum}>{item.album}</td>
                          <td className={styles.tdScore}>
                            <span className={
                              score === 100 ? styles.scoreGreen
                              : score >= 67  ? styles.scoreYellow
                              : styles.scoreRed
                            }>
                              {score}
                            </span>
                          </td>
                          {AUDIT_FIELDS.map(f => (
                            <td key={f.key} className={styles.tdField}>
                              <span
                                className={item[f.key] ? styles.dotFilled : styles.dotEmpty}
                                title={`${f.label}: ${item[f.key] ? '✓ OK' : '✗ vacío'}`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }

          </div>
        )}

        {/* ══════════════ DOCS TAB ══════════════ */}
        {tab === 'docs' && (
          <div className={styles.body}>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>🏗 Arquitectura</div>
              <div className={styles.docsGrid}>
                <div className={styles.docsCard}>
                  <div className={styles.docsCardTitle}>Frontend</div>
                  <div className={styles.docsCardText}>React 19 + Vite · GitHub Pages · React Query v5</div>
                </div>
                <div className={styles.docsCard}>
                  <div className={styles.docsCardTitle}>Backend</div>
                  <div className={styles.docsCardText}>FastAPI · Render.com · Supabase PostgreSQL</div>
                </div>
                <div className={styles.docsCard}>
                  <div className={styles.docsCardTitle}>Integraciones</div>
                  <div className={styles.docsCardText}>Discogs API · Spotify API · Zapier webhook</div>
                </div>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>⌨ Acciones rápidas</div>
              <div className={styles.docsTable}>
                {[
                  ['Buscar',      'Escribir en el campo de búsqueda'],
                  ['Filtrar',     'Click en Categoría / Género / Sello en el sidebar'],
                  ['Ver detalle', 'Click en cualquier card'],
                  ['Editar',      'Modal → Editar (requiere PIN)'],
                  ['Destacar',    'Modal → Destacar del mes (requiere PIN)'],
                  ['Compartir',   'Modal → Compartir · copia link directo al vinilo'],
                  ['Anaquel',     'Botón 🗄 Anaquel en la barra superior'],
                  ['Stats',       'Botón 📊 Stats en la barra superior'],
                ].map(([acc, desc]) => (
                  <div key={acc} className={styles.docsRow}>
                    <span className={styles.docsKey}>{acc}</span>
                    <span className={styles.docsDesc}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
