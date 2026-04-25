# Espíritus & Vinilos — En Las Nubes Trepao

![Version](https://img.shields.io/badge/version-v2.0.0-7c3aed?style=flat-square) ![Stack](https://img.shields.io/badge/stack-React%20%2B%20FastAPI-4a90e2?style=flat-square) ![Hosting](https://img.shields.io/badge/hosting-GitHub%20Pages-222?style=flat-square&logo=github)

Dashboard personal para gestionar y compartir colecciones de vinilos, rones y whiskies. Construido con React en el frontend y FastAPI en el backend, desplegado en GitHub Pages + Render.com.

**Live:** [enlasnubestrepao.com](https://enlasnubestrepao.com)

---

## Qué es este proyecto

Una aplicación web full-stack que funciona como archivo digital de tres colecciones físicas:

- **Vinilos**: álbumes con portadas automáticas vía Discogs, player Spotify inline, estadísticas por género/década/país
- **Rones**: botella por botella con ABV, región, blend, escala personal
- **Whiskies**: expresiones por destilería, tipo, años de maduración, origen

Incluye búsqueda, filtros, KPIs automáticos, modal de detalle, formulario de alta/edición/borrado, autenticación por PIN cifrado en backend, soporte bilingüe ES/EN, y drawer para contenido social (TikTok/Instagram).

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
│  │ (SVG icons, │  │              │  │  (playlist ENLT +      │ │
│  │  ES/EN, ⚙) │  │              │  │   Spotify inline)      │ │
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
│                                                                 │
│  LangContext (i18n ES/EN) · axios → VITE_API_URL               │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON (CORS)
┌────────────────────────────────▼────────────────────────────────┐
│                     FastAPI Backend                             │
│                     (Render.com — free tier)                    │
│                                                                 │
│  /api/vinyls · /api/rums · /api/whiskies                        │
│  /api/covers · /api/spotify · /api/config                       │
│                                                                 │
│  data_store.py → psycopg2 → Supabase PostgreSQL                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │ psycopg2 / Session Pooler
┌────────────────────────────────▼────────────────────────────────┐
│                  Supabase PostgreSQL                            │
│                                                                 │
│   vinyls · rums · whiskies · app_config                        │
└─────────────────────────────────────────────────────────────────┘
```

**Deploy:**
- Frontend: `cd frontend && npm run build && npx gh-pages -d dist --no-history`
- Backend: push a `main` → auto-deploy en Render.com

---

## Stack tecnológico

### Frontend

| Tecnología | Para qué sirve |
|---|---|
| **React 19 + Vite** | Librería de UI. Cada componente es una pieza independiente que renderiza HTML según su estado |
| **@tanstack/react-query v5** | Maneja el fetching de datos: los cachea, los refresca automáticamente, e invalida el cache después de mutaciones |
| **CSS Modules** | Cada componente tiene su propio archivo `.module.css`. Los nombres de clase son únicos por componente, sin colisiones |
| **LangContext + i18n.js** | Sistema de internacionalización propio: 150+ claves de texto en ES y EN, distribuido por Context API |
| **axios** | Cliente HTTP configurado con la URL base del backend. Todas las llamadas pasan por `services/api.js` |
| **`useQuery`** | Fetcha datos del backend, los guarda en memoria, y los refresca automáticamente según el `staleTime` |
| **`useMutation`** | Ejecuta operaciones de escritura (POST/PUT/DELETE) e invalida el cache al terminar para mostrar los datos actualizados |
| **`useMemo`** | Recalcula la lista filtrada solo cuando cambian los datos, filtros, o la búsqueda. Evita procesamiento innecesario |
| **`useState` / `useEffect`** | Estado local del componente y efectos secundarios (fetch al montar, suscripciones a eventos, cleanup) |

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
│   ├── favicon.svg
│   ├── robots.txt       # Directivas para crawlers de búsqueda
│   ├── sitemap.xml      # Mapa del sitio para Google Search Console
│   └── 404.html         # Página de error personalizada
├── src/
│   ├── i18n.js          # Objeto plano con 150+ claves ES/EN
│   ├── LangContext.jsx  # Context + hook useLang() para internacionalización
│   ├── App.jsx          # Root: LangProvider + estado global de PIN
│   ├── main.jsx         # Entry point: monta React + QueryClientProvider
│   ├── index.css        # Variables CSS globales (--bg, --text, --v-acc, etc.)
│   ├── components/
│   │   ├── Header.jsx          # Nav SVG icons, toggle ES/EN, social, ⚙ settings
│   │   ├── Dashboard.jsx       # Orquestador: useQuery, filtros, grid, requirePin
│   │   ├── Sidebar.jsx         # Filtros por categoría/género/origen
│   │   ├── KpiBar.jsx          # Métricas automáticas por colección
│   │   ├── SearchBar.jsx       # Búsqueda full-text en memoria
│   │   ├── FeaturedBanner.jsx  # Vinilo del mes + playlist ENLT + Spotify inline
│   │   ├── Modal.jsx           # Detalle de item (solo lectura)
│   │   ├── AdminForm.jsx       # Alta/edición/borrado + Discogs + Spotify
│   │   ├── SpotifyModal.jsx    # Player Spotify con corrección manual de ID
│   │   ├── SocialDrawer.jsx    # Drawer para embeds TikTok/Instagram
│   │   ├── SettingsPanel.jsx   # Panel PIN + toggle idioma
│   │   ├── PinModal.jsx        # Verificación PIN contra backend (bcrypt)
│   │   ├── StatsView.jsx       # Gráficas CSS por género, década, país
│   │   ├── ShareView.jsx       # Vista compartible por URL (?v=INDEX)
│   │   ├── CrateView.jsx       # Vista de exploración de crate
│   │   ├── WelcomeModal.jsx    # Modal de bienvenida — primera visita
│   │   └── About.jsx           # Documentación técnica en modal
│   ├── hooks/
│   │   └── useCrud.js          # Hook reutilizable: add/update/remove
│   └── services/
│       └── api.js              # Todas las funciones axios por colección
├── index.html           # OG tags, meta description, canonical, loader, noscript
├── package.json
└── vite.config.js       # base: '/' (dominio custom, no subpath)
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
│   └── config.py        # PIN admin (bcrypt) + settings en app_config
```

---

## Base de datos (Supabase)

### Tablas principales

**vinyls**
```sql
id SERIAL PRIMARY KEY, artista TEXT, album TEXT, genero TEXT, agrupador TEXT,
anio INTEGER, pais TEXT, sello TEXT, origen TEXT, fuera BOOLEAN,
discogs TEXT, cover_url TEXT, spotify_id TEXT, ig_url TEXT, tiktok_url TEXT
```

**rums / whiskies**
```sql
id SERIAL PRIMARY KEY, brand TEXT, name TEXT, type TEXT, country TEXT,
abv REAL, region TEXT, url TEXT, cover_url TEXT, ...
```

**app_config**
```sql
key TEXT PRIMARY KEY, value TEXT
-- Uso actual: key='admin_pin' → bcrypt hash del PIN
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
| `GET` | `/api/vinyls/` | Lista con filtros opcionales |
| `POST` | `/api/vinyls/` | Agregar registro |
| `PUT` | `/api/vinyls/{index}` | Actualizar registro |
| `DELETE` | `/api/vinyls/{index}` | Eliminar registro |

*(mismo patrón para `/api/rums/` y `/api/whiskies/`)*

### Portadas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/covers/` | Buscar portada en Discogs (sin guardar) |
| `POST` | `/api/covers/fetch` | Raspar og:image y guardar en licor |
| `POST` | `/api/covers/fetch-discogs` | Buscar en Discogs y guardar en vinilo |
| `POST` | `/api/covers/bulk-discogs` | Portadas Discogs para todos los vinilos sin cover_url |

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
| `POST` | `/api/config/pin` | Guardar nuevo PIN (se hashea con bcrypt) |
| `POST` | `/api/config/pin/verify` | Verificar PIN → `{ valid: bool }`. `false` si no hay PIN |
| `DELETE` | `/api/config/pin` | Eliminar PIN |

---

## Funcionalidades clave

### PIN cifrado en backend
El PIN no vive en `localStorage` — vive como hash bcrypt en la tabla `app_config` de Supabase. Toda verificación pasa por el backend. Si no hay PIN configurado, el acceso está bloqueado (no hay "acceso libre por defecto").

### Internacionalización ES/EN
`LangContext` provee el hook `useLang()` a todos los componentes. `i18n.js` tiene 150+ claves con variante `es` y `en`. El toggle vive en el Header y persiste en `localStorage`.

### FeaturedBanner + playlist ENLT
La playlist de ENLT carga automáticamente al abrir la app en un Spotify embed inline. El botón ▶ en cualquier vinilo reemplaza la playlist por el embed del álbum. El botón Compartir copia la URL y abre en nueva pestaña.

### SocialDrawer
Los botones de TikTok e Instagram en cards y modales abren un drawer lateral (desktop) o bottom sheet (mobile). El embed carga solo cuando el usuario lo abre. Extracción de ID por regex desde la URL completa.

### SEO y social sharing
`index.html` incluye OG tags, Twitter Card, meta description, canonical, `<noscript>` fallback, y un pre-loader spinning disc. `robots.txt` y `sitemap.xml` están en `/public`. `404.html` personalizado para URLs inválidas.

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

# Variables requeridas en .env o en el entorno:
# DATABASE_URL, DISCOGS_TOKEN, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET

uvicorn main:app --reload
# → http://localhost:8000
# → Docs interactivas: http://localhost:8000/docs
```

### Frontend

```bash
cd espiritus-vinilos/frontend
npm install

# Crear frontend/.env.local:
# VITE_API_URL=http://localhost:8000

npm run dev
# → http://localhost:5173
```

---

## Cómo deployar

### Frontend → GitHub Pages

```bash
cd espiritus-vinilos/frontend
npm run build
npx gh-pages -d dist --no-history
```

### Backend → Render

Push a `main` → Render detecta cambios en `/backend` y hace redeploy automático.
El free tier duerme el servicio tras 15 minutos de inactividad. El primer request después tiene ~30 segundos de cold start.

---

## Variables CSS globales

```css
--bg, --bg2, --bg3, --bg4   /* Fondos: de más oscuro a más claro */
--text, --text2, --text3    /* Texto: principal, secundario, terciario */
--border                    /* Borde estándar */
--v-acc, --v-acc2, --v-gold /* Vinilos: rojo */
--ru-acc, --ru-acc2         /* Rones: ámbar */
--wh-acc, --wh-acc2         /* Whiskies: azul */
--r                         /* Border radius estándar */
```

---

## Historial de fases

> **Última actualización:** 2026-04-24 · commit `486fd58`

| Fase | Qué se construyó |
|------|-----------------|
| 1 | Setup monorepo, FastAPI + 3 routers, React + Vite, tema oscuro, grid básico |
| 2 | Header, Sidebar, KpiBar, SearchBar, Modal, CSS Modules |
| 3 | AdminForm, useCrud hook, CRUD completo en backend |
| 4 | Portadas Discogs, og:image scraping, bulk cover fetch |
| 5 | Deploy GitHub Pages + Render, About modal, README |
| 6 | SpotifyModal, FeaturedBanner, ShareView, StatsView, PinModal, WelcomeModal, responsive mobile |
| 7 | Migración a Supabase PostgreSQL, PIN bcrypt en backend, i18n ES/EN (LangContext), SocialDrawer, SettingsPanel, Header SVG icons, dominio custom `enlasnubestrepao.com`, OG tags + SEO baseline, BACKLOG.md |
| 8 | Track A gráfico completo: hero fotográfico por colección, tipografía Fraunces, cards con overlay editorial, hover actions, scroll-progress bar, WelcomeModal con foto, franja surco vinilo, exportar CSV, breadcrumb de navegación, modal licores cinemático, compartir vinilo abre nueva pestaña |
| 9 | EDIT-04 Sesiones: schema Supabase, 13 endpoints FastAPI, SessionesView con registro email+token, 8 plantillas, picker de tracks Spotify, picker de espíritus, vista previa; `spotify_album_id` en AdminForm; fix reset de vista al cambiar colección |

---

*Proyecto construido con Claude Code · Abril 2026*
