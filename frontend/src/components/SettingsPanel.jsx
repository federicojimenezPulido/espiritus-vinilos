import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getVinyls, savePin, deletePin, getPinStatus } from '../services/api'
import { useLang } from '../LangContext'
import styles from './SettingsPanel.module.css'

// Field definitions — labels resolved via t() inside component
const AUDIT_FIELDS_DEF = [
  { key: 'cover_url',  tKey: 'afCover'       },
  { key: 'genero',     tKey: 'afGenre'       },
  { key: 'agrupador',  tKey: 'afCategory'    },
  { key: 'sello',      tKey: 'afLabel'       },
  { key: 'pais_sello', tKey: 'afLabelCountry'},
  { key: 'anio',       tKey: 'afYear'        },
  { key: 'cat_num',    tKey: 'afCatNum'      },
  { key: 'pais',       tKey: 'afCountry'     },
  { key: 'url',        tKey: 'afDiscogs'     },
  { key: 'spotify_id', tKey: 'afSpotify'     },
  { key: 'tiktok_url', tKey: 'afTikTok'      },
  { key: 'ig_url',     tKey: 'afInstagram'   },
]

export default function SettingsPanel({ onClose, onPinChange }) {
  const { t } = useLang()
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
  const [auditFilter, setAuditFilter] = useState('incomplete')
  const [auditSort,   setAuditSort]   = useState('missing')

  const { data: vinyls = [], isLoading } = useQuery({
    queryKey: ['vinyl'],
    queryFn: getVinyls,
    staleTime: 60_000,
  })

  const AUDIT_FIELDS = AUDIT_FIELDS_DEF.map(f => ({ ...f, label: t(f.tKey) }))

  // ── Handlers ──
  function saveToken() {
    if (token.trim()) {
      localStorage.setItem('discogs_token', token.trim())
      setTokenMsg(t('tokenSaved'))
    } else {
      localStorage.removeItem('discogs_token')
      setTokenMsg(t('tokenDeleted'))
    }
    setTimeout(() => setTokenMsg(''), 2200)
  }

  async function handleDeletePin() {
    setPinSaving(true)
    try {
      await deletePin()
      setHasPin(false)
      setPin1(''); setPin2('')
      setPinMsg(t('pinDeleted'))
      onPinChange?.()
    } catch { setPinMsg(t('pinDeleteError')) }
    finally { setPinSaving(false) }
    setTimeout(() => setPinMsg(''), 2200)
  }

  async function handleSavePin() {
    if (!pin1) {
      setPinSaving(true)
      try {
        await deletePin()
        setHasPin(false)
        setPinMsg(t('pinDeleted'))
        onPinChange?.()
      } catch { setPinMsg(t('pinDeleteError')) }
      finally { setPinSaving(false) }
    } else if (pin1 !== pin2) {
      setPinMsg(t('pinMismatch'))
      return
    } else {
      setPinSaving(true)
      try {
        await savePin(pin1)
        setHasPin(true)
        setPinMsg(t('pinSaved'))
        onPinChange?.()
      } catch { setPinMsg(t('pinSaveError')) }
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
          <span className={styles.hdrTitle}>{t('settingsTitle')}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'config' ? styles.tabActive : ''}`}
            onClick={() => setTab('config')}
          >{t('tabConfig')}</button>
          <button
            className={`${styles.tab} ${tab === 'audit' ? styles.tabActive : ''}`}
            onClick={() => setTab('audit')}
          >📋 {t('tabAudit')}</button>
          <button
            className={`${styles.tab} ${tab === 'docs' ? styles.tabActive : ''}`}
            onClick={() => setTab('docs')}
          >📖 {t('tabDocs')}</button>
        </div>

        {/* ══════════════ CONFIG TAB ══════════════ */}
        {tab === 'config' && (
          <div className={styles.body}>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>{t('adminAccess')}</div>
              <div className={styles.fieldLabel}>
                {t('pinStatus')} — {hasPin ? t('pinSet') : t('pinNotSet')}
              </div>
              <div className={styles.fieldRow}>
                <input
                  type="password"
                  placeholder={t('pinNew')}
                  value={pin1}
                  onChange={e => { setPin1(e.target.value); setPinMsg('') }}
                  className={styles.input}
                />
                <input
                  type="password"
                  placeholder={t('pinConfirm')}
                  value={pin2}
                  onChange={e => { setPin2(e.target.value); setPinMsg('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSavePin()}
                  className={styles.input}
                />
                <button className={styles.btn} onClick={handleSavePin} disabled={pinSaving}>
                  {pinSaving ? '…' : t('pinSave')}
                </button>
                {hasPin && (
                  <button className={styles.btnDanger} onClick={handleDeletePin} disabled={pinSaving}>
                    {pinSaving ? '…' : t('pinDelete')}
                  </button>
                )}
              </div>
              {pinMsg && <div className={styles.msg}>{pinMsg}</div>}
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>{t('integrations')}</div>
              <div className={styles.fieldLabel}>
                {t('tokenStatus')} — {hasToken ? t('tokenSet') : t('tokenNotSet')}
              </div>
              <div className={styles.fieldRow}>
                <input
                  type="password"
                  placeholder={t('tokenPlaceholder')}
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveToken()}
                  className={`${styles.input} ${styles.inputWide}`}
                />
                <button className={styles.btn} onClick={saveToken}>{t('pinSave')}</button>
              </div>
              {tokenMsg && <div className={styles.msg}>{tokenMsg}</div>}
            </div>

          </div>
        )}

        {/* ══════════════ AUDITOR TAB ══════════════ */}
        {tab === 'audit' && (
          <div className={styles.body}>

            <div className={styles.auditSummary}>
              <div className={styles.auditScore}>
                <span className={styles.auditScoreNum}>{globalScore}%</span>
                <span className={styles.auditScoreLabel}>
                  {t('auditGlobal')} · {totalMissing} {t('auditEmpty')} {vinyls.length} {t('auditDiscs')}
                </span>
              </div>
              <div className={styles.auditScoreBar}>
                <div className={styles.auditScoreFill} style={{ width: `${globalScore}%` }} />
              </div>
            </div>

            <div className={styles.auditControls}>
              <div className={styles.btnGroup}>
                <button
                  className={`${styles.filterBtn} ${auditFilter === 'incomplete' ? styles.filterActive : ''}`}
                  onClick={() => setAuditFilter('incomplete')}
                >{t('incomplete')} ({auditRows.filter(r => r.missing.length > 0).length})</button>
                <button
                  className={`${styles.filterBtn} ${auditFilter === 'all' ? styles.filterActive : ''}`}
                  onClick={() => setAuditFilter('all')}
                >{t('all')} ({auditRows.length})</button>
              </div>
              <div className={styles.btnGroup}>
                <button
                  className={`${styles.filterBtn} ${auditSort === 'missing' ? styles.filterActive : ''}`}
                  onClick={() => setAuditSort('missing')}
                >{t('mostEmpty')}</button>
                <button
                  className={`${styles.filterBtn} ${auditSort === 'artista' ? styles.filterActive : ''}`}
                  onClick={() => setAuditSort('artista')}
                >{t('az')}</button>
              </div>
            </div>

            {isLoading
              ? <div className={styles.loading}>{t('loadingCollection')}</div>
              : (
                <div className={styles.auditWrap}>
                  <table className={styles.auditTable}>
                    <thead>
                      <tr>
                        <th className={styles.thArtista}>{t('artist')}</th>
                        <th className={styles.thAlbum}>{t('album')}</th>
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
                                title={`${f.label}: ${item[f.key] ? t('auditOk') : t('auditMissing')}`}
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
              <div className={styles.sectionTitle}>{t('docsArch')}</div>
              <div className={styles.docsGrid}>
                <div className={styles.docsCard}>
                  <div className={styles.docsCardTitle}>{t('docsFrontend')}</div>
                  <div className={styles.docsCardText}>React 19 + Vite · GitHub Pages · React Query v5</div>
                </div>
                <div className={styles.docsCard}>
                  <div className={styles.docsCardTitle}>{t('docsBackend')}</div>
                  <div className={styles.docsCardText}>FastAPI · Render.com · Supabase PostgreSQL</div>
                </div>
                <div className={styles.docsCard}>
                  <div className={styles.docsCardTitle}>{t('docsIntegrations')}</div>
                  <div className={styles.docsCardText}>Discogs API · Spotify API · Zapier webhook</div>
                </div>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>{t('docsActions')}</div>
              <div className={styles.docsTable}>
                {[
                  [t('docsSearch'),  t('docsSearchDesc')],
                  [t('docsFilter'),  t('docsFilterDesc')],
                  [t('docsDetail'),  t('docsDetailDesc')],
                  [t('docsEdit'),    t('docsEditDesc')],
                  [t('docsFeature'), t('docsFeatureDesc')],
                  [t('docsShare'),   t('docsShareDesc')],
                  [t('docsCrate'),   t('docsCrateDesc')],
                  [t('docsStats'),   t('docsStatsDesc')],
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
