# Espíritus & Vinilos — En Las Nubes Trepao

![Version](https://img.shields.io/badge/version-v3.1.0-7c3aed?style=flat-square) ![Stack](https://img.shields.io/badge/stack-Astro%20%2B%20React%20%2B%20FastAPI-4a90e2?style=flat-square) ![Hosting](https://img.shields.io/badge/hosting-GitHub%20Pages-222?style=flat-square&logo=github)

Dashboard personal + sitio estático SEO para gestionar y compartir colecciones de vinilos, rones y whiskies. Construido con Astro SSG + React en el frontend y FastAPI en el backend, desplegado en GitHub Pages + Render.com.

**Live:** [enlasnubestrepao.com](https://enlasnubestrepao.com)

---

## Qué es este proyecto

Una aplicación web full-stack que funciona como archivo digital de tres colecciones físicas:

- **Vinilos**: álbumes con portadas automáticas vía Discogs, player Spotify, estadísticas por género/década/país
- **Rones**: botella por botella con ABV, región, blend, escala personal
- **Whiskies**: expresiones por destilería, tipo, años de maduración, origen

Incluye búsqueda, filtros, KPIs automáticos, modal de detalle, formulario de alta/edición/borrado, autenticación por PIN cifrado en backend, soporte bilingüe ES/EN persistente, Auditor de completitud, MiniPlayer Spotify flotante, y sesiones digitales.

---

## Sobre el proyecto — En Las Nubes Trepao

**En Las Nubes Trepao** es un proyecto cultural de Federico dedicado a artistas que moldearon épocas pero ya no son parte del mainstream. Vinilos que siguen girando, rones que cuentan el paisaje de donde vienen, whiskies de destilerías que trabajan con tiempo.

Esta app es el archivo digital de esas colecciones físicas.

🎵 [TikTok](https://www.tiktok.com/@enlasnubestrepao13) · 📷 [Instagram](https://www.instagram.com/enlasnubestrepao/)

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                          BROWSER                                │
│                                                                 │
│  ① Astro SSG — 166 páginas HTML estáticas (build time)         │
│     /vinilos/[slug]/ · /rones/[slug]/ · /whiskies/[slug]/      │
│     → Indexables por Google · OG tags · Sitemap automático     │
│                                                                 │
│  ② React 19 (island en /) — enlasnubestrepao.com               │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Header    │  │   KpiBar     │  │    FeaturedBanner      │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Dashboard · Modal · AdminForm · ShareView · StatsView  │   │
│  │  CrateView · AtlasView · SessionesView · SocialDrawer   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  LangContext (i18n ES/EN) · axios → VITE_API_URL               │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP / JSON (CORS)
┌────────────────────────▼────────────────────────────────────────┐
│                     FastAPI Backend (Render.com free)           │
│  /api/vinyls · /api/rums · /api/whiskies                        │
│  /api/covers · /api/spotify · /api/config · /api/sessions       │
│  data_store.py → psycopg2 → Supabase PostgreSQL                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ psycopg2 / Session Pooler
┌────────────────────────▼────────────────────────────────────────┐
│  Supabase PostgreSQL                                            │
│  vinyls · rums · whiskies · app_config · sessions · ...        │
└─────────────────────────────────────────────────────────────────┘
```

**Deploy:**
- Frontend unificado: `./deploy.sh` desde la raíz (React + Astro → merge → `gh-pages`)
- Backend: push a `main` → auto-deploy en Render.com
- ⚠️ No commitear `dist/` a `main` — el deploy va exclusivamente a la rama `gh-pages`
- CI/CD: `.github/workflows/deploy.yml` configurado y activo
- Auth: SSH ED25519 configurada (`~/.ssh/id_ed25519`) — pushes y deploys sin credenciales manuales

---

## Stack tecnológico

### Frontend

| Tecnología | Para qué sirve |
|---|---|
| **React 19 + Vite** | Librería de UI. Cada componente es una pieza independiente que renderiza HTML según su estado |
| **@tanstack/react-query v5** | Maneja el fetching de datos: los cachea, los refresca automáticamente, e invalida el cache después de mutaciones |
| **CSS Modules** | Cada componente tiene su propio archivo `.module.css`. Los nombres de clase son únicos por componente, sin colisiones |
| **LangContext + i18n.js** | Sistema de internacionalización propio: 200+ claves de texto en ES y EN, persiste preferencia en `localStorage` |
| **axios** | Cliente HTTP configurado con la URL base del backend. Todas las llamadas pasan por `services/api.js` |
| **`useQuery`** | Fetcha datos del backend, los guarda en memoria, y los refresca automáticamente según el `staleTime` |
| **`useMutation`** | Ejecuta operaciones de escritura (POST/PUT/DELETE) e invalida el cache al terminar |
| **`useMemo`** | Recalcula la lista filtrada solo cuando cambian los datos, filtros, o la búsqueda |

### Backend

| Tecnología | Para qué sirve |
|---|---|
| **FastAPI** | Framework Python para APIs REST. Valida tipos automáticamente y genera documentación interactiva en `/docs` |
| **Routers FastAPI** | Cada archivo en `routers/` agrupa los endpoints de un dominio. Se registran en `main.py` con `include_router` |
| **data_store.py** | Capa de acceso a Supabase: conexión con psycopg2, helpers de CRUD, y funciones `get/set/delete_config` para `app_config` |
| **Supabase PostgreSQL** | Base de datos persistente. Render Free Tier tiene filesystem efímero, por eso la BD vive fuera del contenedor |
| **psycopg2** | Driver Python para PostgreSQL. Se conecta vía Session Pooler de Supabase (IPv4, compatible con Render Free) |
| **passlib[bcrypt]** | Cifrado del PIN admin. El hash se guarda en `app_config`. `verify()` compara sin exponer el PIN real |
| **CORSMiddleware** | Permite que el browser llame al backend desde un dominio distinto (GitHub Pages → Render) |

---

## Estructura del frontend

```
frontend/
├── public/
│   ├── CNAME            # Dominio custom para GitHub Pages
│   ├── logo-enlt.jpeg   # Logo del proyecto
│   ├── hero-1.png       # Hero rones
│   ├── hero-2.png       # Hero whiskies
│   ├── hero-3.png       # Franja surco vinilo
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── 404.html
├── src/
│   ├── i18n.js          # 200+ claves ES/EN
│   ├── LangContext.jsx  # Context + hook useLang(), persiste en localStorage
│   ├── App.jsx          # Root: LangProvider, MiniPlayer, estado global
│   ├── main.jsx         # Entry point: React + QueryClientProvider
│   ├── index.css        # Variables CSS globales
│   ├── components/
│   │   ├── Header.jsx          # Logo ENLT (mix-blend-mode), nav, ES/EN, social, ⚙
│   │   ├── Dashboard.jsx       # Orquestador: useQuery, filtros, vistas, requirePin
│   │   ├── Sidebar.jsx         # Filtros por categoría/género/origen/década
│   │   ├── KpiBar.jsx          # Métricas automáticas por colección
│   │   ├── SearchBar.jsx       # Búsqueda full-text en memoria
│   │   ├── FeaturedBanner.jsx  # Vinilo del mes — dispara MiniPlayer vía evento
│   │   ├── MiniPlayer.jsx      # Player Spotify flotante (bottom-right), playlist ENLT
│   │   ├── Modal.jsx           # Detalle de ítem — 2 columnas (datos + acciones)
│   │   ├── AdminForm.jsx       # Alta/edición/borrado + Discogs + DynamicSelect
│   │   ├── SpotifyModal.jsx    # Player Spotify con corrección manual de ID
│   │   ├── SocialDrawer.jsx    # Drawer para embeds TikTok/Instagram
│   │   ├── SettingsPanel.jsx   # PIN + Auditor de completitud + CSV export + Docs
│   │   ├── PinModal.jsx        # Verificación PIN contra backend (bcrypt)
│   │   ├── StatsView.jsx       # Stats: grilla de tarjetas KPI + barras por campo
│   │   ├── ShareView.jsx       # Vista compartible por URL (?v=INDEX)
│   │   ├── CrateView.jsx       # Vista de exploración de crate (vinilos)
│   │   ├── AtlasView.jsx       # Mapa por país con bandera + nota editorial
│   │   ├── SessionesView.jsx   # Sesiones digitales: registro, tracks, espíritus
│   │   ├── HeroSection.jsx     # Hero fotográfico por colección
│   │   ├── WelcomeModal.jsx    # Modal de bienvenida — primera visita
│   │   └── CountryMiniMap.jsx  # Mini mapa SVG por país (Atlas)
│   ├── hooks/
│   │   └── useCrud.js          # Hook reutilizable: add/update/remove
│   └── services/
│       └── api.js              # Todas las funciones axios por colección
├── index.html           # OG tags, meta description, canonical, loader
├── package.json
└── vite.config.js
```

---

## Estructura del backend

```
backend/
├── main.py              # FastAPI app, CORS, registro de routers
├── data_store.py        # Conexión Supabase + helpers CRUD + get/set/delete_config
├── requirements.txt
├── routers/
│   ├── vinyls.py        # GET/POST/PUT/DELETE /api/vinyls/
│   ├── rums.py          # GET/POST/PUT/DELETE /api/rums/
│   ├── whiskies.py      # GET/POST/PUT/DELETE /api/whiskies/
│   ├── covers.py        # Portadas Discogs + tracklist/créditos + og:image scraping
│   ├── spotify.py       # Búsqueda y guardado de Spotify ID
│   ├── config.py        # PIN admin (bcrypt) + settings en app_config
│   └── sessions.py      # Sesiones digitales: registro, CRUD, tracks, espíritus
```

---

## Base de datos (Supabase)

### Tablas principales

**vinyls**
```sql
id SERIAL PRIMARY KEY, artista TEXT, album TEXT, genero TEXT, agrupador TEXT,
anio INTEGER, pais TEXT, pais_sello TEXT, cat_num TEXT, sello TEXT, origen TEXT,
fuera BOOLEAN, discogs BOOLEAN, url TEXT, cover_url TEXT, spotify_id TEXT,
ig_url TEXT, tiktok_url TEXT,
notes TEXT,          -- liner notes editoriales
credits JSONB,       -- créditos [{name, role}]
tracks JSONB         -- tracklist Discogs [{position, title, duration, type}]
```

**rums / whiskies**
```sql
id SERIAL PRIMARY KEY, brand TEXT, name TEXT, type TEXT, country TEXT,
abv REAL, region TEXT, url TEXT, cover_url TEXT, terminado BOOLEAN, ...
```

**app_config**
```sql
key TEXT PRIMARY KEY, value TEXT
-- Uso: key='admin_pin' → bcrypt hash del PIN
```

**sessions** (schema Sesiones)
```sql
id UUID PRIMARY KEY, user_id UUID, name TEXT, night_type TEXT,
note TEXT, created_at TIMESTAMPTZ, ...
```

### Conexión
Siempre usar el **Session Pooler** de Supabase (no la URL Direct).
Render Free Tier solo soporta IPv4.
Formato: `postgresql://postgres.REF:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres`

---

## Endpoints de la API

### Vinilos / Rones / Whiskies

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/vinyls/` | Lista completa |
| `POST` | `/api/vinyls/` | Agregar registro |
| `PUT` | `/api/vinyls/{index}` | Actualizar registro |
| `DELETE` | `/api/vinyls/{index}` | Eliminar registro |

*(mismo patrón para `/api/rums/` y `/api/whiskies/`)*

### Portadas y contenido Discogs

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/covers/fetch` | Raspar og:image y guardar en licor |
| `POST` | `/api/covers/fetch-discogs` | Buscar portada en Discogs y guardar |
| `POST` | `/api/covers/bulk-discogs` | Portadas Discogs para todos los vinilos sin cover_url |
| `GET` | `/api/covers/discogs-release?url=` | Tracklist + créditos de un release (sin guardar) |
| `POST` | `/api/covers/save-discogs-release` | Fetchea y persiste tracklist+créditos en un vinilo por índice |
| `POST` | `/api/covers/bulk-discogs-tracks` | Pobla tracks para todos los vinilos con URL Discogs (paginado, `limit`+`offset`) |

### Spotify

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/spotify/search` | Buscar álbum → `{ spotify_id, embed_url }` |
| `POST` | `/api/spotify/save/{index}` | Guardar spotify_id en el vinilo |
| `POST` | `/api/spotify/refresh/{index}` | Forzar nueva búsqueda |

### Configuración

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/config/pin` | Estado del PIN `{ set: bool }` |
| `POST` | `/api/config/pin` | Guardar nuevo PIN (bcrypt) |
| `POST` | `/api/config/pin/verify` | Verificar PIN → `{ valid: bool }` |
| `DELETE` | `/api/config/pin` | Eliminar PIN |

---

## Funcionalidades clave

### PIN cifrado en backend
El PIN no vive en `localStorage` — vive como hash bcrypt en `app_config` de Supabase. Toda verificación pasa por el backend.

### Internacionalización ES/EN
`LangContext` provee `useLang()` a todos los componentes. `i18n.js` tiene 200+ claves. La preferencia persiste en `localStorage` entre sesiones.

### MiniPlayer Spotify flotante
`MiniPlayer` vive en `App.jsx` — persiste mientras el usuario navega entre colecciones. Por defecto muestra la playlist ENLT. Al hacer click en "Escuchar" desde el FeaturedBanner, cambia al álbum del disco destacado vía evento global `enlt-play`. Se puede colapsar a un botón redondo de 42px.

### Modal 2 columnas siempre visible
El modal de detalle usa CSS Grid `1fr 260px`. La columna izquierda (exploración: datos, mapa, tracklist, notas) scrollea independientemente. La columna derecha (acciones: Compartir, CTAs Discogs/Spotify/web, ENLT social, Admin) es siempre visible. En mobile colapsa a 1 columna.

### Páginas estáticas editoriales (Astro SSG)
Cada vinilo, ron y whisky tiene su propia página estática con:
- Hero full-bleed (portada/botella + fondo borroso saturado)
- Notas editoriales como pieza central (Fraunces italic)
- Tracklist Discogs (si disponible)
- Créditos con íconos por rol (🎤🎸🎹🥁🎺🎷🎻🎼🎛🎚✍️🎨)
- Spotify embed dark inline
- Recomendaciones por género/tipo/país (4 cards)

### Auditor de completitud
Tab en SettingsPanel (⚙). Muestra una tabla de todos los vinilos con semáforo de campos completos. Click en una fila cierra el panel y abre AdminForm para ese vinilo — al cerrar AdminForm vuelve al Auditor. Incluye botón de export CSV.

### AdminForm con DynamicSelect
Todos los campos de opciones usan `DynamicSelect`: dropdown estándar + botón "+" para agregar opciones nuevas que se persisten en `localStorage`. Los valores de país/origen se normalizan automáticamente (UK, USA, Europa, Japón, etc.) para eliminar duplicados.

### Sesiones digitales
Módulo completo: registro de usuario con email + token, creación de sesiones (tipo de noche, personas, nota), picker de tracks desde playlists Spotify, picker de espíritus de la colección. Hasta 5 sesiones activas por usuario.

### SocialDrawer
Botones TikTok e Instagram en cards y modales abren un drawer lateral (desktop) o bottom sheet (mobile). El embed carga solo cuando el usuario lo abre.

### SEO y social sharing
`index.html` incluye OG tags, Twitter Card, meta description, canonical, `<noscript>` fallback y pre-loader. `robots.txt` y `sitemap.xml` en `/public`. `404.html` personalizado.

---

## Variables de entorno

### Backend (Render)

| Variable | Descripción |
|----------|------------|
| `DATABASE_URL` | Connection string Supabase Session Pooler (IPv4) |
| `SPOTIFY_CLIENT_ID` | Client ID app Spotify |
| `SPOTIFY_CLIENT_SECRET` | Secret app Spotify |

### Frontend

| Variable | Descripción |
|----------|------------|
| `VITE_API_URL` | URL del backend en Render |

---

## Cómo correr localmente

### Backend

```bash
cd espiritus-vinilos/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Variables en .env: DATABASE_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
uvicorn main:app --reload
# → http://localhost:8000/docs
```

### Frontend

```bash
cd espiritus-vinilos/frontend
npm install
# Crear frontend/.env.local con: VITE_API_URL=http://localhost:8000
npm run dev
# → http://localhost:5173
```

---

## Cómo deployar

### Frontend SSG → GitHub Pages

```bash
cd espiritus-vinilos/frontend-astro
npm run deploy
# = astro build && gh-pages -d dist
# Genera 166 páginas HTML estáticas + sitemap y las publica en rama gh-pages
# NO hacer git add dist/ en main — eso no actualiza producción
```

### Backend → Render

Push a `main` → Render detecta cambios en `/backend` y hace redeploy automático.
Free tier: cold start de ~30s tras 15 min de inactividad.

---

## Variables CSS globales

```css
--bg, --bg2, --bg3, --bg4   /* Fondos: de más oscuro a más claro */
--text, --text2, --text3    /* Texto: principal, secundario, terciario */
--border                    /* Borde estándar */
--v-acc, --v-acc2, --v-gold /* Vinilos: rojo */
--ru-acc, --ru-acc2         /* Rones: ámbar */
--wh-acc, --wh-acc2         /* Whiskies: azul */
--se-acc, --se-acc2         /* Sesiones: violeta */
--r                         /* Border radius estándar */
```

---

## Historial de fases

> **Última actualización:** 2026-05-04 · v2.7.0

| Fase | Qué se construyó |
|------|-----------------|
| 1 | Setup monorepo, FastAPI + 3 routers, React + Vite, tema oscuro, grid básico |
| 2 | Header, Sidebar, KpiBar, SearchBar, Modal, CSS Modules |
| 3 | AdminForm, useCrud hook, CRUD completo en backend |
| 4 | Portadas Discogs, og:image scraping, bulk cover fetch |
| 5 | Deploy GitHub Pages + Render, README |
| 6 | SpotifyModal, FeaturedBanner, ShareView, StatsView, PinModal, WelcomeModal, responsive mobile |
| 7 | Migración Supabase, PIN bcrypt, i18n ES/EN, SocialDrawer, SettingsPanel, dominio custom, OG tags + SEO |
| 8 | Hero fotográfico, tipografía Fraunces, cards editorial, scroll-progress, modal licores, breadcrumb |
| 9 | Sesiones digitales: schema, 13 endpoints FastAPI, SessionesView completa, plantillas, tracks, espíritus |
| 10 | Atlas con bandera + nota por país, WelcomeModal editorial, Sesiones como 5ª feature |
| 11 | Stats redesign (grilla KPI equitativa), DynamicSelect + normalización de opciones, Auditor edit-flow, MiniPlayer flotante, idioma persistente en localStorage, CSV en Auditor |
| 12 | **Voz editorial v2.1**: campo `notes` (liner notes), tracklist Discogs colapsable en modal, créditos manuales `credits JSONB`, editor fila-por-fila en AdminForm, endpoint `/api/covers/discogs-release` |
| 12b | **Voz editorial v2.2**: importar créditos desde Discogs en AdminForm (merge inteligente), grid 2 columnas para créditos en modal, 3 capas de descubribilidad — badge `❝` en card, snippet hover en overlay, epígrafe editorial al tope del modal |
| 13 | **Modal editorial v2.3**: fix persistencia `notes`/`credits` en DB, badge `❝` clickable, modal 2 columnas (datos + panel editorial), fix workflow deploy → rama `gh-pages` |
| 14 | **ARCH-01 v2.4**: Astro SSG — 166 páginas estáticas, slugify compartido, `getStaticPaths()`, `@astrojs/sitemap`, tema oscuro, pre-loader controlado, cards crawleables, CI/CD GitHub Actions, sitemap enviado a Google |
| 15 | **UXUI-01 v2.5**: Modal UX overhaul — bottom sheet mobile, hero unificado con blur, portada vinyl hero, botella spirits prominente (195px), Spotify en footer sticky, Compartir unificado (?v=N vinilos / página estática spirits), mapa colapsable, admin footer sutil, campos 1col ≤560px, drag handle |
| 16 | **UXUI-03+04 + CI-01 v2.6**: Modal 2 columnas siempre (izquierda exploración / derecha acción siempre visible), Spotify demovido a CTA card, CTAs con ícono+título+descripción. Páginas estáticas editorial redesign: hero full-bleed para los 3 tipos (vinilos/rones/whiskies), notas como pieza editorial central, Spotify embed dark inline, recomendaciones por género/tipo/país, buy box en el hero. CI fix: `--legacy-peer-deps` para `frontend/` en GitHub Actions. |
| 17 | **v2.6.1 limpieza**: CSS muerto eliminado del modal (~100 líneas), `.gitignore` expandido, formateo de precios por moneda (COP/USD/EUR). |
| 18 | **DATA-01 + QA-01 v2.7.0** *(2026-05-04)*: Columna `tracks JSONB` en Supabase. Endpoints `save-discogs-release` (individual) y `bulk-discogs-tracks` (paginado con `limit`+`offset`, rate limiting 1.1s entre llamadas). Créditos con íconos por rol en páginas estáticas de vinilos. QA mobile 375px completado — fixes en WelcomeModal (line-clamp en cards) y AdminForm (purchaseFields 2col en mobile). 95/106 vinilos con tracklist poblado vía bulk. |
| 19 | **QA-01 + DATA-01 v2.7.1–2.7.2** *(2026-05-05)*: Auditoría CSS SessionesView post-login — fix `spiritCountry` overflow + `detailTitle` ellipsis. Soporte URLs `/master/` en endpoints Discogs. 104/106 vinilos con tracklist. |
| 20 | **UX v2.7.3** *(2026-05-05)*: Búsqueda local en vinyl picker dentro de sesiones (filtra artista/álbum sin backend). Botón Spotify removido del hero en páginas estáticas — el embed ya provee enlace nativo. |
| 21 | **v3.0.0** *(2026-05-05)*: **Email capture** Kit (form `345b76391f`) en las 106 páginas de vinilo. **og:image dinámico** — fallback `hero-1.png`, `og:image:alt` por vinilo, dimensiones hardcodeadas removidas. **GA4** (`G-5VM13PG031`) en 166 páginas. **Fix compartir** — botón Compartir en modal y hover del grid ahora genera URL estática `/vinilos/[slug]/` (WhatsApp preview muestra tapa del disco). **Deploy unificado** `deploy.sh` + CI/CD actualizados — React + Astro mergeados en un único gh-pages, elimina sobreescritura entre builds. |
| 22 | **v3.1.0** *(2026-05-20)*: **ADMIN-01** — Panel admin Sesiones integrado como tab en SettingsPanel (visible solo con PIN válido). Nuevo endpoint `GET /api/sessions/admin/overview` protegido con `X-Admin-Pin` (bcrypt). `SessionesAdmin.jsx`: KPIs (usuarios/sesiones/tracks) + tabla de sesiones con template/personas/tracks/espíritus + tabla de clientes con historial. `PinModal` propaga el PIN al caller para autenticar llamadas admin. **QA-iOS** — modal bottom sheet: scroll interno con `touch-action: pan-y` + body overflow lock; eliminado double-tap logic (single tap abre modal directamente). **AUTH** — SSH key ED25519 configurada; deploys desde CLI sin intervención manual. |

---

> **Última actualización:** 2026-05-20 · v3.1.0

*Proyecto construido con Claude Code · Abril–Mayo 2026*
