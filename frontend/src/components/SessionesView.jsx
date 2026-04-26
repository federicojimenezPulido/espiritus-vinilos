/**
 * SessionesView.jsx — Feature EDIT-04: Sesiones de Espíritu y Vinilo
 *
 * Flow:
 *  1. Si no hay token en localStorage → formulario de registro (email)
 *  2. Lista de sesiones propias → crear nueva o abrir existente
 *  3. Crear sesión → elegir template, nombre, personas, nota
 *  4. Detalle de sesión → tabs: Vinilos / Espíritus / Vista Previa
 */

import { useState, useEffect, useCallback } from 'react'
import { useLang } from '../LangContext'
import styles from './SessionesView.module.css'
import {
  registerClient,
  getSessionTemplates,
  getSessions,
  createSession,
  deleteSession,
  getSessionTracks,
  addSessionTrack,
  removeSessionTrack,
  getSessionSpirits,
  addSessionSpirit,
  removeSessionSpirit,
  getSessionPreview,
  getVinylSessionTracks,
  getSessionCatalogVinyls,
  getSessionCatalogSpirits,
} from '../services/api'

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtMs(ms) {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function fmtMins(ms) {
  return `${Math.round(ms / 60000)} min`
}

const TOKEN_KEY = 'session_client_token'
const NAME_KEY  = 'session_client_name'

// ── sub-components ────────────────────────────────────────────────────────────

function BackBtn({ onClick, label = 'Volver' }) {
  return (
    <button className={styles.backBtn} onClick={onClick}>
      ← {label}
    </button>
  )
}

function LoadingDots() {
  return <span className={styles.loadingDots}>···</span>
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SessionesView() {
  const { t } = useLang()
  const [clientToken, setClientToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [clientName,  setClientName_]  = useState(() => localStorage.getItem(NAME_KEY) || '')

  // view: 'register' | 'list' | 'create' | 'detail'
  const [view, setView] = useState(clientToken ? 'list' : 'register')

  // templates (fetched from API)
  const [templates, setTemplates] = useState([])

  // ── register ──
  const [regEmail,    setRegEmail]    = useState('')
  const [regName,     setRegName]     = useState('')
  const [registering, setRegistering] = useState(false)
  const [regError,    setRegError]    = useState('')

  // ── list ──
  const [sessions,        setSessions]        = useState([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  // ── create ──
  const [newName,     setNewName]     = useState('')
  const [newPeople,   setNewPeople]   = useState(4)
  const [newTemplate, setNewTemplate] = useState(null)
  const [newNotes,    setNewNotes]    = useState('')
  const [creating,    setCreating]    = useState(false)
  const [createErr,   setCreateErr]   = useState('')

  // ── detail ──
  const [activeSession,  setActiveSession]  = useState(null)
  const [detailTab,      setDetailTab]      = useState('tracks')
  const [sessionTracks,  setSessionTracks]  = useState([])
  const [sessionSpirits, setSessionSpirits] = useState([])
  const [preview,        setPreview]        = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  // ── track picker ──
  const [vinyls,        setVinyls]        = useState([])
  const [selectedVinyl, setSelectedVinyl] = useState(null)
  const [vinylTracks,   setVinylTracks]   = useState([])
  const [loadingVT,     setLoadingVT]     = useState(false)
  const [addingTrack,   setAddingTrack]   = useState(null) // spotify_track_id
  const [trackErr,      setTrackErr]      = useState('')

  // ── spirit picker ──
  const [allSpirits,    setAllSpirits]    = useState([]) // rums + whiskies
  const [addingSpirit,  setAddingSpirit]  = useState(null) // spirit_id
  const [spiritErr,     setSpiritErr]     = useState('')

  // ── fetch templates once ──────────────────────────────────────────────────

  useEffect(() => {
    getSessionTemplates().then(setTemplates).catch(() => {})
  }, [])

  // ── fetch sessions when on list view ─────────────────────────────────────

  const loadSessions = useCallback(async () => {
    if (!clientToken) return
    setLoadingSessions(true)
    try {
      const data = await getSessions(clientToken)
      setSessions(data)
    } catch {
      setSessions([])
    } finally {
      setLoadingSessions(false)
    }
  }, [clientToken])

  useEffect(() => {
    if (view === 'list') loadSessions()
  }, [view, loadSessions])

  // ── fetch vinyls + spirits when on detail ────────────────────────────────

  useEffect(() => {
    if (view !== 'detail') return

    getSessionCatalogVinyls().then(setVinyls).catch(() => {})

    getSessionCatalogSpirits().then(data => {
      const spirits = data.map(x => ({
        ...x,
        _type:  x.spirit_type,
        _label: x.spirit_type === 'rum'
          ? `${x.brand} ${x.name}`
          : `${x.brand} ${x.version}`.trim(),
      }))
      setAllSpirits(spirits)
    }).catch(() => {})
  }, [view])

  // ── fetch preview when tab changes ───────────────────────────────────────

  useEffect(() => {
    if (view !== 'detail' || detailTab !== 'preview' || !activeSession) return
    setLoadingPreview(true)
    getSessionPreview(clientToken, activeSession.id)
      .then(setPreview)
      .catch(() => setPreview(null))
      .finally(() => setLoadingPreview(false))
  }, [view, detailTab, activeSession, clientToken])

  // ── HANDLERS ─────────────────────────────────────────────────────────────

  async function handleRegister(e) {
    e.preventDefault()
    if (!regEmail.trim()) return
    setRegistering(true)
    setRegError('')
    try {
      const { token, name } = await registerClient(regEmail.trim(), regName.trim() || undefined)
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(NAME_KEY, name || regEmail.trim())
      setClientToken(token)
      setClientName_(name || regEmail.trim())
      setView('list')
    } catch (err) {
      setRegError(err.response?.data?.detail || 'Error al registrar. Intenta de nuevo.')
    } finally {
      setRegistering(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim() || !newTemplate) return
    setCreating(true)
    setCreateErr('')
    try {
      const sess = await createSession(clientToken, {
        name:         newName.trim(),
        people_count: newPeople,
        template_id:  newTemplate,
        notes:        newNotes.trim() || undefined,
      })
      setActiveSession(sess)
      setSessionTracks([])
      setSessionSpirits([])
      setDetailTab('tracks')
      setSelectedVinyl(null)
      setVinylTracks([])
      setView('detail')
    } catch (err) {
      setCreateErr(err.response?.data?.detail || 'Error al crear la sesión.')
    } finally {
      setCreating(false)
    }
  }

  async function openSession(sess) {
    setActiveSession(sess)
    setDetailTab('tracks')
    setSelectedVinyl(null)
    setVinylTracks([])
    setTrackErr('')
    setSpiritErr('')

    const [tracks, spirits] = await Promise.all([
      getSessionTracks(clientToken, sess.id).catch(() => []),
      getSessionSpirits(clientToken, sess.id).catch(() => []),
    ])
    setSessionTracks(tracks)
    setSessionSpirits(spirits)
    setView('detail')
  }

  async function handleDeleteSession(sessId, e) {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta sesión? Esta acción no se puede deshacer.')) return
    await deleteSession(clientToken, sessId).catch(() => {})
    setSessions(prev => prev.filter(s => s.id !== sessId))
  }

  async function selectVinyl(vinyl) {
    if (selectedVinyl?.id === vinyl.id) {
      setSelectedVinyl(null)
      setVinylTracks([])
      return
    }
    setSelectedVinyl(vinyl)
    setVinylTracks([])
    setLoadingVT(true)
    try {
      const { tracks } = await getVinylSessionTracks(vinyl.id)
      setVinylTracks(tracks)
    } catch {
      setVinylTracks([])
    } finally {
      setLoadingVT(false)
    }
  }

  async function handleAddTrack(track) {
    setAddingTrack(track.spotify_track_id)
    setTrackErr('')
    try {
      const added = await addSessionTrack(clientToken, activeSession.id, {
        vinyl_id:         selectedVinyl.id,
        spotify_track_id: track.spotify_track_id,
        track_name:       track.name,
        artist_name:      selectedVinyl.artista,
        duration_ms:      track.duration_ms,
        track_number:     track.track_number,
      })
      setSessionTracks(prev => [...prev, added])
    } catch (err) {
      setTrackErr(err.response?.data?.detail || 'Error al agregar la canción.')
    } finally {
      setAddingTrack(null)
    }
  }

  async function handleRemoveTrack(trackId) {
    await removeSessionTrack(clientToken, activeSession.id, trackId).catch(() => {})
    setSessionTracks(prev => prev.filter(t => t.id !== trackId))
  }

  async function handleAddSpirit(spirit) {
    if (sessionSpirits.length >= 3) {
      setSpiritErr('Máximo 3 espíritus por sesión.')
      return
    }
    setAddingSpirit(spirit.id)
    setSpiritErr('')
    try {
      const added = await addSessionSpirit(clientToken, activeSession.id, {
        spirit_type:  spirit._type,
        spirit_id:    spirit.id,
        brand:        spirit.brand,
        name:         spirit._type === 'rum' ? spirit.name : spirit.version,
      })
      setSessionSpirits(prev => [...prev, added])
    } catch (err) {
      setSpiritErr(err.response?.data?.detail || 'Error al agregar el espíritu.')
    } finally {
      setAddingSpirit(null)
    }
  }

  async function handleRemoveSpirit(spiritId) {
    await removeSessionSpirit(clientToken, activeSession.id, spiritId).catch(() => {})
    setSessionSpirits(prev => prev.filter(s => s.id !== spiritId))
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(NAME_KEY)
    setClientToken(null)
    setClientName_('')
    setView('register')
    setSessions([])
  }

  // ── derived ───────────────────────────────────────────────────────────────

  const totalMs    = sessionTracks.reduce((s, t) => s + (t.duration_ms || 0), 0)
  const maxMs      = 7_200_000
  const pctUsed    = Math.min((totalMs / maxMs) * 100, 100)
  const addedIds   = new Set(sessionTracks.map(t => t.spotify_track_id))
  const tpl        = templates.find(t => t.id === (activeSession?.template_id))

  // ── RENDERS ───────────────────────────────────────────────────────────────

  // ── 1. Register ──
  if (view === 'register') {
    return (
      <div className={styles.page}>
        <div className={styles.registerWrap}>
          <div className={styles.registerCard}>
            <div className={styles.registerIcon}>♪</div>
            <h2 className={styles.registerTitle}>Sesiones</h2>
            <p className={styles.registerSub}>
              Armá tu playlist de vinilo con los espíritus perfectos para la noche.
              Dejá tu correo para guardar tus sesiones.
            </p>
            <form onSubmit={handleRegister} className={styles.registerForm}>
              <div className={styles.field}>
                <label className={styles.label}>Correo electrónico</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="tu@correo.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>¿Cómo te llamás? <span className={styles.optional}>(opcional)</span></label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Tu nombre"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                />
              </div>
              {regError && <p className={styles.error}>{regError}</p>}
              <button type="submit" className={styles.primaryBtn} disabled={registering}>
                {registering ? <LoadingDots /> : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── 2. List ──
  if (view === 'list') {
    return (
      <div className={styles.page}>
        <div className={styles.listHeader}>
          <div>
            <h2 className={styles.pageTitle}>Mis sesiones</h2>
            {clientName && <p className={styles.pageSub}>Hola, {clientName}</p>}
          </div>
          <div className={styles.listHeaderActions}>
            <button
              className={styles.primaryBtn}
              onClick={() => { setNewName(''); setNewTemplate(null); setNewNotes(''); setNewPeople(4); setCreateErr(''); setView('create') }}
              disabled={sessions.length >= 5}
              title={sessions.length >= 5 ? 'Máximo 5 sesiones' : ''}
            >
              + Nueva sesión
            </button>
            <button className={styles.ghostBtn} onClick={logout}>Salir</button>
          </div>
        </div>

        {loadingSessions ? (
          <p className={styles.dim}>Cargando sesiones <LoadingDots /></p>
        ) : sessions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>♫</div>
            <p className={styles.emptyText}>Todavía no tenés sesiones.</p>
            <p className={styles.emptyHint}>Creá una y empezá a construir tu noche.</p>
          </div>
        ) : (
          <div className={styles.sessionGrid}>
            {sessions.map(s => {
              const t = templates.find(t => t.id === s.template_id)
              return (
                <div
                  key={s.id}
                  className={styles.sessionCard}
                  style={{ '--card-acc': t?.accent_color || 'var(--se-acc)' }}
                  onClick={() => openSession(s)}
                >
                  <div className={styles.sessionCardAccent} />
                  <div className={styles.sessionCardBody}>
                    <p className={styles.sessionTemplate}>{t?.name_es || 'Sesión'}</p>
                    <h3 className={styles.sessionName}>{s.name}</h3>
                    <p className={styles.sessionMeta}>
                      {s.people_count} personas
                      {s.notes && <> · <span className={styles.dim}>{s.notes.slice(0, 40)}{s.notes.length > 40 && '…'}</span></>}
                    </p>
                  </div>
                  <button
                    className={styles.deleteCardBtn}
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    title="Eliminar sesión"
                  >✕</button>
                </div>
              )
            })}
          </div>
        )}
        {sessions.length >= 5 && (
          <p className={styles.dim} style={{ marginTop: 8 }}>Alcanzaste el límite de 5 sesiones. Eliminá una para crear otra.</p>
        )}
      </div>
    )
  }

  // ── 3. Create ──
  if (view === 'create') {
    return (
      <div className={styles.page}>
        <BackBtn onClick={() => setView('list')} label="Mis sesiones" />
        <h2 className={styles.pageTitle}>Nueva sesión</h2>

        <form onSubmit={handleCreate} className={styles.createForm}>
          {/* Template selector */}
          <div className={styles.field}>
            <label className={styles.label}>Tipo de noche</label>
            <div className={styles.templateGrid}>
              {templates.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.templateCard} ${newTemplate === t.id ? styles.templateSelected : ''}`}
                  style={{ '--tpl-color': t.accent_color }}
                  onClick={() => setNewTemplate(t.id)}
                >
                  <span className={styles.templateName}>{t.name_es}</span>
                  <span className={styles.templateTagline}>{t.tagline_es}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field} style={{ flex: 2 }}>
              <label className={styles.label}>Nombre de la sesión</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej: Noche de Coltrane y Diplomático"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Personas (2–8)</label>
              <div className={styles.counter}>
                <button type="button" className={styles.counterBtn}
                  onClick={() => setNewPeople(p => Math.max(2, p - 1))}>−</button>
                <span className={styles.counterVal}>{newPeople}</span>
                <button type="button" className={styles.counterBtn}
                  onClick={() => setNewPeople(p => Math.min(8, p + 1))}>+</button>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nota <span className={styles.optional}>(opcional)</span></label>
            <textarea
              className={styles.textarea}
              placeholder="Casa de alguien, vinilo en mente, ocasión especial…"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              rows={2}
            />
          </div>

          {createErr && <p className={styles.error}>{createErr}</p>}

          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={creating || !newTemplate || !newName.trim()}
          >
            {creating ? <LoadingDots /> : 'Crear sesión →'}
          </button>
        </form>
      </div>
    )
  }

  // ── 4. Detail ──
  if (view === 'detail' && activeSession) {
    const alreadyAdded = (spiritId, spiritType) =>
      sessionSpirits.some(s => s.spirit_id === spiritId && s.spirit_type === spiritType)

    return (
      <div className={styles.page}>
        <BackBtn onClick={() => { setView('list'); loadSessions() }} label="Mis sesiones" />

        {/* Session header */}
        <div className={styles.detailHeader} style={{ '--card-acc': tpl?.accent_color || 'var(--se-acc)' }}>
          <div className={styles.detailAccentBar} />
          <div>
            <p className={styles.sessionTemplate}>{tpl?.name_es || 'Sesión'}</p>
            <h2 className={styles.detailTitle}>{activeSession.name}</h2>
            <p className={styles.detailMeta}>
              {activeSession.people_count} personas
              {activeSession.notes && <> · {activeSession.notes}</>}
            </p>
          </div>
        </div>

        {/* Time budget bar */}
        <div className={styles.timeBudget}>
          <span className={styles.timeBudgetLabel}>
            Música: <strong>{fmtMins(totalMs)}</strong> / 2 h
          </span>
          <div className={styles.timeBudgetTrack}>
            <div
              className={styles.timeBudgetFill}
              style={{ width: `${pctUsed}%`, background: pctUsed > 90 ? '#ef4444' : 'var(--se-acc2)' }}
            />
          </div>
          <span className={styles.timeBudgetLabel}>{Math.round(pctUsed)}%</span>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {[
            { id: 'tracks',  label: `${t('vinyls')} (${sessionTracks.length})` },
            { id: 'spirits', label: `${t('spirits')} (${sessionSpirits.length}/3)` },
            { id: 'preview', label: t('preview') },
          ].map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${detailTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setDetailTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Tracks ── */}
        {detailTab === 'tracks' && (
          <div className={styles.tabContent}>
            {/* Current track list */}
            {sessionTracks.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>En la sesión</h3>
                <div className={styles.trackList}>
                  {sessionTracks.map(t => (
                    <div key={t.id} className={styles.trackRow}>
                      <span className={styles.trackNum}>{t.track_number || '·'}</span>
                      <div className={styles.trackInfo}>
                        <span className={styles.trackName}>{t.track_name}</span>
                        <span className={styles.trackArtist}>{t.artist_name}</span>
                      </div>
                      <span className={styles.trackDur}>{fmtMs(t.duration_ms)}</span>
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveTrack(t.id)}
                        title="Quitar"
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vinyl picker */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t('addFromCollection')}</h3>
              {vinyls.length === 0 ? (
                <p className={styles.dim}>Cargando vinilos <LoadingDots /></p>
              ) : (
                <div className={styles.vinylPicker}>
                  {vinyls.map(v => (
                    <div key={v.id} className={styles.vinylPickerItem}>
                      <button
                        className={`${styles.vinylBtn} ${selectedVinyl?.id === v.id ? styles.vinylBtnActive : ''}`}
                        onClick={() => selectVinyl(v)}
                      >
                        {v.cover_url && (
                          <img src={v.cover_url} alt="" className={styles.vinylThumb} />
                        )}
                        <div className={styles.vinylBtnInfo}>
                          <span className={styles.vinylBtnAlbum}>{v.album}</span>
                          <span className={styles.vinylBtnArtist}>{v.artista}</span>
                        </div>
                        <span className={styles.vinylBtnChevron}>
                          {selectedVinyl?.id === v.id ? '▲' : '▼'}
                        </span>
                      </button>

                      {selectedVinyl?.id === v.id && (
                        <div className={styles.vinylTrackList}>
                          {loadingVT ? (
                            <p className={styles.dim}>Cargando tracks <LoadingDots /></p>
                          ) : vinylTracks.length === 0 ? (
                            <p className={styles.dim}>Sin tracks disponibles en Spotify.</p>
                          ) : (
                            vinylTracks.map(t => {
                              const inSession = addedIds.has(t.spotify_track_id)
                              const isAdding  = addingTrack === t.spotify_track_id
                              return (
                                <div key={t.spotify_track_id} className={`${styles.vtRow} ${inSession ? styles.vtRowAdded : ''}`}>
                                  <span className={styles.vtNum}>{t.track_number}</span>
                                  <span className={styles.vtName}>{t.name}</span>
                                  <span className={styles.vtDur}>{fmtMs(t.duration_ms)}</span>
                                  <button
                                    className={styles.addBtn}
                                    disabled={inSession || isAdding || totalMs + t.duration_ms > maxMs}
                                    onClick={() => handleAddTrack(t)}
                                    title={
                                      inSession ? 'Ya está en la sesión' :
                                      totalMs + t.duration_ms > maxMs ? 'Superaría las 2h' :
                                      'Agregar'
                                    }
                                  >
                                    {isAdding ? '···' : inSession ? '✓' : '+'}
                                  </button>
                                </div>
                              )
                            })
                          )}
                          {trackErr && <p className={styles.error}>{trackErr}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Spirits ── */}
        {detailTab === 'spirits' && (
          <div className={styles.tabContent}>
            {/* Current spirits */}
            {sessionSpirits.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>En la sesión ({sessionSpirits.length}/3)</h3>
                <div className={styles.spiritList}>
                  {sessionSpirits.map(s => (
                    <div key={s.id} className={styles.spiritRow}>
                      <span className={`${styles.spiritType} ${s.spirit_type === 'rum' ? styles.spiritRum : styles.spiritWhisky}`}>
                        {s.spirit_type === 'rum' ? 'Ron' : 'Whisky'}
                      </span>
                      <div className={styles.spiritInfo}>
                        <span className={styles.spiritBrand}>{s.brand}</span>
                        <span className={styles.spiritName}>{s.name}</span>
                      </div>
                      <button className={styles.removeBtn} onClick={() => handleRemoveSpirit(s.id)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sessionSpirits.length < 3 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Agregar espíritu</h3>
                {spiritErr && <p className={styles.error}>{spiritErr}</p>}
                {allSpirits.length === 0 ? (
                  <p className={styles.dim}>Cargando espíritus <LoadingDots /></p>
                ) : (
                  <div className={styles.spiritPicker}>
                    {allSpirits.map(s => {
                      const added   = alreadyAdded(s.id, s._type)
                      const adding  = addingSpirit === s.id
                      return (
                        <div
                          key={`${s._type}-${s.id}`}
                          className={`${styles.spiritPickerRow} ${added ? styles.spiritPickerAdded : ''}`}
                        >
                          <span className={`${styles.spiritType} ${s._type === 'rum' ? styles.spiritRum : styles.spiritWhisky}`}>
                            {s._type === 'rum' ? 'Ron' : 'Whisky'}
                          </span>
                          <div className={styles.spiritInfo}>
                            <span className={styles.spiritBrand}>{s.brand}</span>
                            <span className={styles.spiritName}>{s._type === 'rum' ? s.name : (s.version || '')}</span>
                          </div>
                          {s.country && <span className={styles.spiritCountry}>{s.country}</span>}
                          <button
                            className={styles.addBtn}
                            disabled={added || adding}
                            onClick={() => handleAddSpirit(s)}
                          >
                            {adding ? '···' : added ? '✓' : '+'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {sessionSpirits.length >= 3 && (
              <p className={styles.dim}>Alcanzaste el máximo de 3 espíritus por sesión.</p>
            )}
          </div>
        )}

        {/* ── Tab: Preview ── */}
        {detailTab === 'preview' && (
          <div className={styles.tabContent}>
            {loadingPreview ? (
              <p className={styles.dim}>Cargando vista previa <LoadingDots /></p>
            ) : (
              <div className={styles.previewWrap}>
                <div className={styles.previewCard}>
                  <div className={styles.previewHeader} style={{ '--card-acc': tpl?.accent_color || 'var(--se-acc)' }}>
                    <div className={styles.previewAccentBar} />
                    <h3 className={styles.previewTitle}>{activeSession.name}</h3>
                    <p className={styles.previewMeta}>
                      {tpl?.name_es} · {activeSession.people_count} personas
                    </p>
                  </div>

                  <div className={styles.previewBody}>
                    {/* Time summary */}
                    <div className={styles.previewStat}>
                      <span className={styles.previewStatNum}>{fmtMins(totalMs)}</span>
                      <span className={styles.previewStatLabel}>de música</span>
                    </div>
                    <div className={styles.previewStat}>
                      <span className={styles.previewStatNum}>{sessionTracks.length}</span>
                      <span className={styles.previewStatLabel}>canciones</span>
                    </div>
                    <div className={styles.previewStat}>
                      <span className={styles.previewStatNum}>{sessionSpirits.length}</span>
                      <span className={styles.previewStatLabel}>espíritus</span>
                    </div>
                  </div>

                  {sessionSpirits.length > 0 && (
                    <div className={styles.previewSection}>
                      <p className={styles.previewSectionTitle}>Espíritus</p>
                      {sessionSpirits.map(s => (
                        <div key={s.id} className={styles.previewSpiritRow}>
                          <span className={`${styles.spiritType} ${s.spirit_type === 'rum' ? styles.spiritRum : styles.spiritWhisky}`}>
                            {s.spirit_type === 'rum' ? 'Ron' : 'Whisky'}
                          </span>
                          <span>{s.brand} {s.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {sessionTracks.length > 0 && (
                    <div className={styles.previewSection}>
                      <p className={styles.previewSectionTitle}>Playlist</p>
                      {sessionTracks.map((t, i) => (
                        <div key={t.id} className={styles.previewTrackRow}>
                          <span className={styles.previewTrackNum}>{i + 1}</span>
                          <div className={styles.trackInfo}>
                            <span className={styles.trackName}>{t.track_name}</span>
                            <span className={styles.trackArtist}>{t.artist_name}</span>
                          </div>
                          <span className={styles.trackDur}>{fmtMs(t.duration_ms)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {sessionTracks.length === 0 && sessionSpirits.length === 0 && (
                    <p className={styles.dim} style={{ padding: '24px 0', textAlign: 'center' }}>
                      Todavía no hay nada en esta sesión. Agregá vinilos y espíritus.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return null
}
