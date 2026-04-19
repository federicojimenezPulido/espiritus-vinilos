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
            <p>Documentación técnica del proyecto · Abril 2026</p>
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
            <h3 className={styles.sectionTitle}>Stack tecnológico</h3>
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

          {/* ── Decisiones técnicas ── */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Decisiones arquitectónicas</h3>
            <div className={styles.compGrid}>
              {DECISIONS.map(({ title, desc }) => (
                <div className={styles.comp} key={title}>
                  <div className={styles.compName}>{title}</div>
                  <div className={styles.compDesc}>{desc}</div>
                </div>
              ))}
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
              Vite hace lo mismo en el frontend con Hot Module Replacement (HMR).
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
  ├─ React 19 (Vite) — GitHub Pages
  │    ├─ LangProvider (i18n Context — ES/EN)
  │    ├─ Header · KpiBar · Sidebar · SearchBar
  │    ├─ FeaturedBanner (ENLT playlist + Spotify embed)
  │    ├─ Dashboard → useQuery · useMemo · requirePin
  │    ├─ Modal · AdminForm · SpotifyModal
  │    ├─ SocialDrawer (TikTok / Instagram embeds)
  │    ├─ SettingsPanel (PIN + idioma)
  │    └─ About · WelcomeModal · ShareView · CrateView
  │
  │  axios (VITE_API_URL)
  │
  ▼
FastAPI Backend — Render.com
  ├─ CORSMiddleware
  ├─ /api/vinyls     (routers/vinyls.py)
  ├─ /api/rums       (routers/rums.py)
  ├─ /api/whiskies   (routers/whiskies.py)
  ├─ /api/covers     (routers/covers.py — Discogs + og:image)
  ├─ /api/spotify    (routers/spotify.py — búsqueda y guardado)
  └─ /api/config     (routers/config.py — PIN bcrypt + settings)
       │
  data_store.py  (psycopg2 + helpers get/set/delete_config)
       │
  Supabase PostgreSQL
  └─ vinyls · rums · whiskies · app_config`

const STACK = [
  ['React 19 + Vite',       'Librería de UI. Componentes reutilizables que renderizan HTML según su estado'],
  ['@tanstack/react-query v5', 'useQuery para fetching/caché; useMutation para escrituras + invalidación automática'],
  ['CSS Modules',           'Cada componente tiene su .module.css con clases de scope local (sin colisiones)'],
  ['i18n.js + LangContext', 'Objeto plano con 150+ claves ES/EN; useLang() hook distribuye t() a todos los componentes'],
  ['axios',                 'Cliente HTTP configurado con VITE_API_URL base; todas las llamadas pasan por services/api.js'],
  ['useMemo',               'Recalcula lista filtrada/ordenada solo cuando cambian filtros, búsqueda u orden'],
  ['useState / useEffect',  'Estado local de componentes; efectos para suscripciones (eventos, API calls al montar)'],
  ['FastAPI',               'Framework Python para APIs REST. Cada router agrupa endpoints de una colección o dominio'],
  ['data_store.py',         'Capa de acceso a Supabase: get_conn(), helpers CRUD, get/set/delete_config para app_config'],
  ['passlib[bcrypt]',       'Cifrado del PIN admin. hash() al guardar, verify() al autenticar — nunca texto plano'],
  ['Supabase PostgreSQL',   'Base de datos persistente en Render Free Tier (filesystem efímero). Session Pooler IPv4'],
  ['app_config table',      'Tabla key/value para configuración del sistema. Actualmente: admin_pin (bcrypt hash)'],
  ['CORSMiddleware',        'Permite llamadas cross-origin desde GitHub Pages (distinto dominio) al backend en Render'],
  ['Discogs API',           'Búsqueda de portadas y metadata de discos. Token personal en variable de entorno'],
  ['Spotify Embed API',     'Iframes embebidos sin OAuth. Soporta album, playlist y track por tipo/ID'],
]

const COMPONENTS = [
  { name: 'App',            desc: 'Root: envuelve todo en LangProvider; gestiona pinIsSet global y despacha a AppInner' },
  { name: 'LangContext',    desc: 'React Context que expone { lang, setLang, t }. useLang() disponible en cualquier componente' },
  { name: 'Header',         desc: 'SVG icons para nav (Vinilos/Rones/Whiskies), toggle ES/EN, TikTok/IG, botón engranaje Settings, About' },
  { name: 'Dashboard',      desc: 'Orquestador: useQuery, filtros useMemo, grid de cards, requirePin, todos los modales' },
  { name: 'Sidebar',        desc: 'Filtros por categoría/género/origen/estado — activa/desactiva con click' },
  { name: 'KpiBar',         desc: 'Métricas automáticas calculadas sobre los datos: totales, artistas únicos, géneros, Discogs' },
  { name: 'FeaturedBanner', desc: 'Vinilo del mes desde localStorage. Playlist ENLT carga inline por defecto; ▶ lo reemplaza con el vinilo. Share abre pestaña + copia URL' },
  { name: 'Modal',          desc: 'Detalle de item (solo lectura). Botones Spotify, TikTok, IG abren SocialDrawer o SpotifyModal' },
  { name: 'AdminForm',      desc: 'Alta/edición/borrado + auto-fetch portada Discogs + og:image scraping + spotify_id manual' },
  { name: 'SpotifyModal',   desc: 'Busca álbum en Spotify automáticamente al abrir. Permite corregir con URL/URI/ID. Guarda en BD' },
  { name: 'SocialDrawer',   desc: 'Drawer desde la derecha (desktop) / bottom sheet (mobile). Embeds TikTok e Instagram extraídos por regex' },
  { name: 'SettingsPanel',  desc: 'Panel slide-down desde el engranaje: set/change/delete PIN (con confirmación), toggle idioma ES/EN' },
  { name: 'PinModal',       desc: 'Intercepta acciones protegidas (add/edit/delete). Verifica PIN contra /api/config/pin/verify (bcrypt)' },
  { name: 'StatsView',      desc: 'Gráficas de barras CSS por género, década, país. Clic en barra filtra la colección' },
  { name: 'ShareView',      desc: 'Vista de tarjeta compartible por URL (?v=INDEX). Se activa automáticamente con el link' },
  { name: 'CrateView',      desc: 'Vista de exploración de crate (búsqueda visual compacta)' },
  { name: 'WelcomeModal',   desc: 'Bienvenida en primera visita — explica las tres colecciones y cómo navegar' },
  { name: 'About',          desc: 'Este modal: arquitectura, stack, componentes, endpoints y cómo correr localmente' },
]

const ENDPOINTS = [
  ['GET',    '/api/vinyls/',                'Lista de vinilos con todos los campos'],
  ['POST',   '/api/vinyls/',                'Agregar vinilo nuevo'],
  ['PUT',    '/api/vinyls/{index}',         'Actualizar vinilo por posición (0-based)'],
  ['DELETE', '/api/vinyls/{index}',         'Eliminar vinilo'],
  ['GET',    '/api/rums/',                  'Lista de rones'],
  ['POST',   '/api/rums/',                  'Agregar ron'],
  ['PUT',    '/api/rums/{index}',           'Actualizar ron'],
  ['DELETE', '/api/rums/{index}',           'Eliminar ron'],
  ['GET',    '/api/whiskies/',              'Lista de whiskies'],
  ['POST',   '/api/whiskies/',              'Agregar whisky'],
  ['PUT',    '/api/whiskies/{index}',       'Actualizar whisky'],
  ['DELETE', '/api/whiskies/{index}',       'Eliminar whisky'],
  ['GET',    '/api/covers/scrape',          'Raspar og:image de URL sin guardar'],
  ['POST',   '/api/covers/fetch',           'Raspar og:image y guardar en licor'],
  ['POST',   '/api/covers/fetch-discogs',   'Buscar en Discogs y guardar cover_url en vinilo'],
  ['POST',   '/api/covers/bulk-discogs',    'Portadas Discogs para todos los vinilos sin cover_url'],
  ['GET',    '/api/spotify/search',         'Buscar álbum en Spotify → { spotify_id, embed_url }'],
  ['POST',   '/api/spotify/save/{index}',   'Guardar spotify_id para un vinilo'],
  ['POST',   '/api/spotify/refresh/{index}','Nueva búsqueda Spotify (ignora resultado anterior)'],
  ['GET',    '/api/config/pin',             'Estado del PIN → { set: true|false }'],
  ['POST',   '/api/config/pin',             'Guardar nuevo PIN (se hashea con bcrypt)'],
  ['POST',   '/api/config/pin/verify',      'Verificar PIN → { valid: true|false }. false si no hay PIN'],
  ['DELETE', '/api/config/pin',             'Eliminar PIN (requiere que exista uno activo)'],
]

const DECISIONS = [
  {
    title: 'Supabase en lugar de archivos JSON',
    desc: 'Render Free Tier tiene filesystem efímero: los archivos se pierden en cada redeploy. Supabase PostgreSQL ofrece persistencia real sin costo adicional con hasta 500 MB free.'
  },
  {
    title: 'PIN bcrypt en backend (no localStorage)',
    desc: 'Un PIN en localStorage es trivialmente bypasseable desde DevTools. Con bcrypt en app_config toda verificación pasa por el backend. Sin PIN guardado = acceso bloqueado, nunca libre.'
  },
  {
    title: 'i18n con Context propio (no librería externa)',
    desc: 'Para 150 claves en 2 idiomas, react-i18next es overhead innecesario. Un objeto plano T[key][lang] con fallback a "es" es suficiente y sin dependencia adicional.'
  },
  {
    title: 'SocialDrawer en lugar de iframes inline en Modal',
    desc: 'Los iframes de TikTok/Instagram dentro del Modal causaban conflictos de z-index, scroll bloqueado y carga innecesaria. El drawer carga el embed solo cuando el usuario lo pide.'
  },
  {
    title: 'Playlist ENLT como estado por defecto en FeaturedBanner',
    desc: 'El banner siempre muestra algo útil: la playlist de ENLT cuando no hay vinilo destacado, y reemplaza con el vinilo cuando el usuario presiona ▶. Un solo iframe con key={playerId} para re-montar.'
  },
  {
    title: 'requirePin como función genérica en Dashboard',
    desc: 'En lugar de PIN logic en cada acción, requirePin(label, callback) centraliza: verifica si hay PIN activo, muestra PinModal, y ejecuta el callback solo si es válido.'
  },
]

const BACKEND_RUN = `cd espiritus-vinilos/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Variables de entorno requeridas:
# DATABASE_URL, DISCOGS_TOKEN, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET

uvicorn main:app --reload
# → http://localhost:8000
# → Docs interactivas: http://localhost:8000/docs`

const FRONTEND_RUN = `cd espiritus-vinilos/frontend
npm install

# Crear .env.local:
# VITE_API_URL=http://localhost:8000

npm run dev
# → http://localhost:5173

# Deploy a GitHub Pages:
npm run build
npx gh-pages -d dist --no-history`
