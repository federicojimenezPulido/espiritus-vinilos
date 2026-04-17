import { useEffect } from 'react'
import styles from './About.module.css'

// Modal informativo — misma estructura de overlay que Modal.jsx
// Se abre desde el botón 📖 en el Header
export default function About({ onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>

        {/* Header */}
        <div className={styles.hdr}>
          <div className={styles.hdrIcon}>📖</div>
          <div className={styles.hdrText}>
            <h2>Espíritus &amp; Vinilos</h2>
            <p>Documentación del proyecto</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>

          {/* ── Arquitectura ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Arquitectura</h3>
            <pre className={styles.arch}>{ARCH}</pre>
          </section>

          {/* ── Stack ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Stack</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tecnología</th>
                    <th>Para qué sirve</th>
                  </tr>
                </thead>
                <tbody>
                  {STACK.map(([tech, desc]) => (
                    <tr key={tech}>
                      <td><code className={styles.code}>{tech}</code></td>
                      <td className={styles.desc}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Componentes ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Componentes del frontend</h3>
            <div className={styles.compGrid}>
              {COMPONENTS.map(({ name, desc }) => (
                <div className={styles.comp} key={name}>
                  <div className={styles.compName}>{name}</div>
                  <div className={styles.compDesc}>{desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── API Endpoints ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>API Endpoints</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Método</th>
                    <th>Endpoint</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map(([method, ep, desc]) => (
                    <tr key={ep + method}>
                      <td>
                        <span className={`${styles.method} ${styles[method.toLowerCase()]}`}>
                          {method}
                        </span>
                      </td>
                      <td><code className={styles.code}>{ep}</code></td>
                      <td className={styles.desc}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Correr localmente ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Cómo correr localmente</h3>
            <div className={styles.runGrid}>
              <div className={styles.runBlock}>
                <div className={styles.runLabel}>Backend (FastAPI)</div>
                <pre className={styles.codeBlock}>{BACKEND_RUN}</pre>
              </div>
              <div className={styles.runBlock}>
                <div className={styles.runLabel}>Frontend (React + Vite)</div>
                <pre className={styles.codeBlock}>{FRONTEND_RUN}</pre>
              </div>
            </div>
            <div className={styles.note}>
              El flag <code className={styles.code}>--reload</code> reinicia el backend automáticamente al guardar cambios.
              Vite hace lo mismo en el frontend con Hot Module Replacement.
            </div>
          </section>

          <div className={styles.footer}>
            <button className={styles.closeFooterBtn} onClick={onClose}>Cerrar</button>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Datos ─────────────────────────────────────────────────────────────────────

const ARCH = `Browser
  │
  ├─ React (Vite) — GitHub Pages
  │    ├─ Header · KpiBar · Sidebar · SearchBar
  │    ├─ Dashboard → useQuery · useMemo · useCrud
  │    └─ Modal · AdminForm · About
  │
  │  axios (VITE_API_URL)
  │
  ▼
FastAPI Backend — Render.com
  ├─ CORSMiddleware
  ├─ /api/vinyls   (routers/vinyls.py)
  ├─ /api/rums     (routers/rums.py)
  ├─ /api/whiskies (routers/whiskies.py)
  └─ /api/covers   (routers/covers.py)
       │
  data_store.py
       │
  data/  →  vinilos.json · rums.json · whiskies.json`

const STACK = [
  ['React + Vite',      'Librería de UI. Los componentes son piezas reutilizables que renderizan HTML según su estado'],
  ['useQuery',          'Hook de React Query — fetcha datos del backend, los cachea y refresca automáticamente'],
  ['useMutation',       'Hook de React Query — ejecuta POST/PUT/DELETE e invalida el cache al terminar'],
  ['useMemo',           'Recalcula un valor derivado solo cuando cambian sus dependencias (ej: lista filtrada)'],
  ['useState',          'Guarda estado local del componente: qué filtros están activos, qué item está seleccionado'],
  ['useEffect',         'Ejecuta código al montar o al cambiar dependencias; el return limpia efectos secundarios'],
  ['useCrud hook',      'Hook propio que encapsula add/update/remove con React Query para las tres colecciones'],
  ['CSS Modules',       'Cada componente tiene su propio archivo .module.css con clases de scope local'],
  ['axios',             'Cliente HTTP para llamar al backend — configurado con la URL base del API'],
  ['FastAPI',           'Framework Python para construir APIs REST. Cada router agrupa endpoints de una colección'],
  ['data_store.py',     'Capa que lee y escribe los archivos JSON — centraliza el acceso a los datos'],
  ['JSON files',        'Archivos de datos (vinilos.json, rums.json, whiskies.json) — no hay base de datos'],
  ['CORSMiddleware',    'Permite que el browser llame al backend desde un dominio distinto (GitHub Pages → Render)'],
]

const COMPONENTS = [
  { name: 'Header',         desc: 'Logo animado, título, toggle de colección, redes sociales, token Discogs (🔑), PIN admin (🛡️), About (📖)' },
  { name: 'Dashboard',      desc: 'Orquestador: useQuery, filtros con useMemo, grid de cards, controla todos los modales' },
  { name: 'Sidebar',        desc: 'Filtros por categoría/género/tipo/país — activa/desactiva con click' },
  { name: 'KpiBar',         desc: 'Métricas automáticas: totales, artistas únicos, escala promedio, prestados/consumidos' },
  { name: 'SearchBar',      desc: 'Búsqueda full-text en memoria sobre los datos ya cargados' },
  { name: 'StatsView',      desc: 'Vista de estadísticas: gráficos de barras CSS por género, década, país. Clic en barra filtra la colección' },
  { name: 'FeaturedBanner', desc: 'Banner "Descubrimiento del mes": vinilo destacado fijado en localStorage, con botón de compartir y player Spotify' },
  { name: 'ShareView',      desc: 'Vista de tarjeta compartible vía URL (?v=INDEX). Se abre automáticamente con el link' },
  { name: 'SpotifyModal',   desc: 'Player de Spotify embebido en modal, vinculado al álbum por nombre o Spotify ID corregido manualmente' },
  { name: 'Modal',          desc: 'Detalle de un item (solo lectura). Cierra con Escape, overlay click, o botón. Permite destacar y abrir Spotify' },
  { name: 'AdminForm',      desc: 'Alta/edición/borrado + auto-fetch de portada Discogs + og:image scraping + corrección manual de álbum Spotify' },
  { name: 'PinModal',       desc: 'Protección PIN para acciones de escritura (agregar/editar/borrar). PIN opcional, se configura en el Header' },
  { name: 'WelcomeModal',   desc: 'Modal de bienvenida para primeras visitas — explica qué es el proyecto y sus tres colecciones' },
  { name: 'About',          desc: 'Modal de documentación técnica: arquitectura, stack, endpoints, cómo correr localmente' },
]

const ENDPOINTS = [
  ['GET',    '/api/vinyls/',              'Lista de vinilos con filtros opcionales'],
  ['POST',   '/api/vinyls/',              'Agregar vinilo'],
  ['PUT',    '/api/vinyls/{index}',       'Actualizar vinilo por posición'],
  ['DELETE', '/api/vinyls/{index}',       'Eliminar vinilo'],
  ['GET',    '/api/rums/',                'Lista de rones'],
  ['POST',   '/api/rums/',                'Agregar ron'],
  ['PUT',    '/api/rums/{index}',         'Actualizar ron'],
  ['DELETE', '/api/rums/{index}',         'Eliminar ron'],
  ['GET',    '/api/whiskies/',            'Lista de whiskies'],
  ['POST',   '/api/whiskies/',            'Agregar whisky'],
  ['PUT',    '/api/whiskies/{index}',     'Actualizar whisky'],
  ['DELETE', '/api/whiskies/{index}',     'Eliminar whisky'],
  ['GET',    '/api/covers/',              'Buscar portada en Discogs (requiere x-discogs-token)'],
  ['POST',   '/api/covers/fetch',         'Raspar og:image de URL y guardar en licor'],
  ['POST',   '/api/covers/fetch-discogs', 'Buscar en Discogs y guardar en vinilo'],
  ['GET',    '/api/covers/scrape',        'Raspar og:image sin guardar'],
  ['POST',   '/api/covers/bulk-discogs',  'Portadas Discogs para todos los vinilos sin cover_url'],
  ['GET',    '/api/spotify/search',       'Buscar álbum en Spotify por artista+álbum, devuelve embed_url y spotify_id'],
]

const BACKEND_RUN = `cd espiritus-vinilos/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
# → Docs: http://localhost:8000/docs`

const FRONTEND_RUN = `cd espiritus-vinilos/frontend
npm install
npm run dev
# → http://localhost:5173`
