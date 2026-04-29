# Espíritus & Vinilos — En Las Nubes Trepao

![Version](https://img.shields.io/badge/version-v2.3.0-7c3aed?style=flat-square) ![Stack](https://img.shields.io/badge/stack-React%20%2B%20FastAPI-4a90e2?style=flat-square) ![Hosting](https://img.shields.io/badge/hosting-GitHub%20Pages-222?style=flat-square&logo=github)

Dashboard personal para gestionar y compartir colecciones de vinilos, rones y whiskies. Construido con React en el frontend y FastAPI en el backend, desplegado en GitHub Pages + Render.com.

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
│  React 19 (Vite) — enlasnubestrepao.com                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Header    │  │   KpiBar     │  │    FeaturedBanner      │ │
│  │ (logo ENLT, │  │              │  │  (disco del mes)       │ │
│  │  ES/EN, ⚙) │  │              │  │                        │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     Dashboard                           │   │
│  │   useQuery → cache + refetch automático                 │   │
│  │   useMemo  → filtered list                              │   │
│  │   requirePin → protege add/edit/delete                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  Modal   │  │ AdminForm │  │ SocialDrawer │  │Settings  │  │
│  └──────────┘  └───────────┘  └──────────────┘  └──────────┘  │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐ │
│  │   MiniPlayer     │  │         SessionesView               │ │
│  │ (Spotify flotante│  │  (registro, sesiones, tracks,       │ │
│  │  bottom-right)   │  │   espíritus, plantillas)            │ │
│  └──────────────────┘  └─────────────────────────────────────┘ │
│                                                                 │
│  LangContext (i18n ES/EN, persiste en localStorage)            │
│  axios → VITE_API_URL                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP / JSON (CORS)
┌────────────────────────▼────────────────────────────────────────┐
│                     FastAPI Backend                             │
│                     (Render.com — free tier)                    │
│                                                                 │
│  /api/vinyls · /api/rums · /api/whiskies                        │
│  /api/covers · /api/spotify · /api/config · /api/sessions       │
│                                                                 │
│  data_store.py → psycopg2 → Supabase PostgreSQL                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ psycopg2 / Session Pooler
┌────────────────────────▼────────────────────────────────────────┐
│                  Supabase PostgreSQL                            │
│                                                                 │
│   vinyls · rums · whiskies · app_config · sessions · ...       │
└─────────────────────────────────────────────────────────────────┘
```

**Deploy:**
- Frontend: `cd frontend && npm run deploy` (= `npm run build && npx gh-pages -d dist` → push a rama `gh-pages`)
- Backend: push a `main` → auto-deploy en Render.com
- ⚠️ No commitear `frontend/dist/` a `main` — el deploy del frontend va exclusivamente a la rama `gh-pages`

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
│   │   ├── Modal.jsx           # Detalle de ítem (solo lectura)
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
│   ├── covers.py        # Portadas Discogs + og:image scraping
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
notes TEXT,          -- liner notes editoriales (Fase 12)
credits JSONB        -- créditos manuales [{name, role}] (Fase 12)
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

### Portadas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/covers/fetch` | Raspar og:image y guardar en licor |
| `POST` | `/api/covers/fetch-discogs` | Buscar en Discogs y guardar en vinilo |
| `POST` | `/api/covers/bulk-discogs` | Portadas Discogs para todos los vinilos sin cover_url |
| `GET` | `/api/covers/discogs-release?url=` | Tracklist + créditos de un release de Discogs |

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

### Auditor de completitud
Tab en SettingsPanel (⚙). Muestra una tabla de todos los vinilos con semáforo de campos completos. Click en una fila cierra el panel y abre AdminForm para ese vinilo — al cerrar AdminForm vuelve al Auditor. Incluye botón de export CSV.

### AdminForm con DynamicSelect
Todos los campos de opciones usan `DynamicSelect`: dropdown estándar + botón "+" para agregar opciones nuevas que se persisten en `localStorage`. Los valores de país/origen se normalizan automáticamente (UK, USA, Europa, Japón, etc.) para eliminar duplicados.

### Voz editorial (Fases 12–13)
Tres capas de contenido por vinilo:
1. **Notas editoriales** (`notes`): textarea en AdminForm, persistidas en DB. Badge `❝` en card (clickable — abre modal), snippet en hover overlay, panel editorial en modal.
2. **Tracklist Discogs**: sección colapsable en Modal — fetchea tracklist + créditos (extraartists) en tiempo real desde la API de Discogs. Requiere token y URL de release.
3. **Créditos manuales** (`credits JSONB`): editor de filas nombre+rol en AdminForm, visible en el colapsable del Modal en grid 2 columnas.

**Modal 2 columnas (v2.3):** cuando un vinilo tiene notas, el modal se expande a 900px con layout de 2 columnas — izquierda: datos duros + tracklist + acciones; derecha: panel editorial con Fraunces italic sobre fondo rojo tenue.

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
| `DISCOGS_TOKEN` | Token personal Discogs API |
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
# Variables en .env: DATABASE_URL, DISCOGS_TOKEN, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
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

### Frontend → GitHub Pages

```bash
cd espiritus-vinilos/frontend
npm run deploy
# = npm run build && npx gh-pages -d dist
# Publica el contenido de dist/ en la rama gh-pages (que es la que sirve el sitio)
# NO hacer git add frontend/dist/ en main — eso no actualiza producción
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

> **Última actualización:** 2026-04-29 · v2.3.0

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
| 13 | **Modal editorial v2.3**: fix persistencia `notes`/`credits` en DB (`_VINYL_COLS`), badge `❝` clickable, modal 2 columnas (datos + panel editorial) al detectar notas, fix workflow deploy → rama `gh-pages` |

---

*Proyecto construido con Claude Code · Abril 2026*
