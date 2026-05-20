/**
 * SessionesAdmin.jsx — Panel admin para ver actividad de Sesiones
 * Protegido por PIN admin (mismo que el resto del admin).
 */
import { useState, useEffect } from 'react'
import { getSessionsAdminOverview } from '../services/api'
import styles from './SessionesAdmin.module.css'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function SessionesAdmin({ adminPin, onClose }) {
  const [data,    setData]    = useState(null)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('sessions') // 'sessions' | 'clients'

  useEffect(() => {
    getSessionsAdminOverview(adminPin)
      .then(setData)
      .catch(() => setError('Error cargando datos. Verificá el PIN.'))
      .finally(() => setLoading(false))
  }, [adminPin])

  if (loading) return (
    <div className={styles.wrap}>
      <div className={styles.loading}>Cargando sesiones…</div>
    </div>
  )

  if (error) return (
    <div className={styles.wrap}>
      <div className={styles.error}>{error}</div>
      <button className={styles.btnClose} onClick={onClose}>Cerrar</button>
    </div>
  )

  const { stats, clients, sessions } = data

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Sesiones — Panel Admin</h2>
          <p className={styles.subtitle}>Actividad de todos los usuarios</p>
        </div>
        <button className={styles.btnClose} onClick={onClose}>✕</button>
      </div>

      {/* KPIs */}
      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span className={styles.kpiVal}>{stats.total_clients}</span>
          <span className={styles.kpiLabel}>Usuarios</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiVal}>{stats.total_sessions}</span>
          <span className={styles.kpiLabel}>Sesiones</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiVal}>{stats.total_tracks}</span>
          <span className={styles.kpiLabel}>Tracks agregados</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'sessions' ? styles.tabActive : ''}`}
          onClick={() => setTab('sessions')}
        >
          Sesiones ({sessions.length})
        </button>
        <button
          className={`${styles.tab} ${tab === 'clients' ? styles.tabActive : ''}`}
          onClick={() => setTab('clients')}
        >
          Usuarios ({clients.length})
        </button>
      </div>

      {/* Sesiones */}
      {tab === 'sessions' && (
        <div className={styles.tableWrap}>
          {sessions.length === 0
            ? <p className={styles.empty}>No hay sesiones todavía.</p>
            : <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sesión</th>
                    <th>Usuario</th>
                    <th>Template</th>
                    <th>Personas</th>
                    <th>Tracks</th>
                    <th>Espíritus</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id}>
                      <td>
                        <span className={styles.sessionName}>{s.name}</span>
                        {s.notes && <span className={styles.notes} title={s.notes}>📝</span>}
                      </td>
                      <td>
                        <span className={styles.email}>{s.client_email}</span>
                        {s.client_name && <span className={styles.clientName}>{s.client_name}</span>}
                      </td>
                      <td>
                        <span
                          className={styles.template}
                          style={{ borderColor: s.accent_color }}
                        >
                          {s.template_name}
                        </span>
                      </td>
                      <td className={styles.center}>{s.people_count}</td>
                      <td className={styles.center}>{s.track_count}</td>
                      <td className={styles.center}>{s.spirit_count}</td>
                      <td className={styles.date}>{fmtDate(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}

      {/* Clientes */}
      {tab === 'clients' && (
        <div className={styles.tableWrap}>
          {clients.length === 0
            ? <p className={styles.empty}>No hay usuarios todavía.</p>
            : <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Nombre</th>
                    <th>Sesiones</th>
                    <th>Última sesión</th>
                    <th>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.id}>
                      <td className={styles.email}>{c.email}</td>
                      <td>{c.name || '—'}</td>
                      <td className={styles.center}>{c.session_count}</td>
                      <td className={styles.date}>{fmtDate(c.last_session_at)}</td>
                      <td className={styles.date}>{fmtDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}
    </div>
  )
}
