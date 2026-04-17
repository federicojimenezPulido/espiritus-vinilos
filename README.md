# Espíritus & Vinilos

Dashboard personal para gestionar colecciones de vinilos, rones y whiskies. Construido con React en el frontend y FastAPI en el backend, desplegado en GitHub Pages + Render.com.

---

## Qué es este proyecto

Una aplicación web full-stack que funciona como base de datos personal para tres colecciones:

- **Vinilos**: álbumes de vinilo con portadas automáticas vía Discogs API
- **Rones**: botella por botella con ABV, región, blend, escala personal
- **Whiskies**: expresiones por destilería, tipo, años, origen

Incluye búsqueda, filtros por categoría, KPIs automáticos, modal de detalle, formulario de alta/edición/borrado, y obtención automática de portadas.

---

## Sobre el proyecto — En Las Nubes Trepao

**En Las Nubes Trepao** es un proyecto cultural de Federico que vive en TikTok e Instagram, dedicado a artistas que moldearon épocas pero ya no son parte del mainstream. Vinilos que siguen girando, rones que cuentan el paisaje de donde vienen, whiskies de destilerías que trabajan con tiempo.

Esta app es el archivo digital de esas colecciones físicas: una herramienta personal para catalogar, descubrir, filtrar y compartir.

🎵 [TikTok](https://www.tiktok.com/@enlasnubestrepao13) · 📷 [Instagram](https://www.instagram.com/enlasnubestrepao/)

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                          BROWSER                                │
│                                                                 │
│  React (Vite)                                                   │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Header  │  │  KpiBar   │  │ Sidebar  │  │  SearchBar   │  │
│  └──────────┘  └───────────┘  └──────────┘  └──────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     Dashboard                           │   │
│  │   useQuery (React Query) ──→ cache + refetch automático  │   │
│  │   useMemo  ──→ filtered list (sin re-render innecesario) │   │
│  │   useCrud  ──→ add / update / remove con invalidation   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌──────────┐  ┌───────────┐                                   │
│  │  Modal   │  │ AdminForm │                                   │
│  └──────────┘  └───────────┘                                   │
│                                                                 │
│  axios (services/api.js) → VITE_API_URL                        │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON
                                 │ (CORS habilitado)
┌────────────────────────────────▼────────────────────────────────┐
│                     FastAPI Backend                             │
│                     (Render.com — free tier)                    │
│                                                                 │
│  main.py                                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CORSMiddleware  →  localhost:5173 + github.io           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Routers (packages/procedures):                                 │
│  ┌───────────┐ ┌───────────┐ ┌────────────┐ ┌─────────────┐   │
│  │ /vinyls   │ │  /rums    │ │ /whiskies  │ │  /covers    │   │
│  └───────────┘ └───────────┘ └────────────┘ └─────────────┘   │
│                                                                 │
│  data_store.py  →  read_collection() / write_collection()      │
└────────────────────────────────┬────────────────────────────────┘
                                 │ json.load / json.dump
┌────────────────────────────────▼────────────────────────────────┐
│                     data/ (archivos JSON)                       │
│                                                                 │
│   vinilos.json      rums.json      whiskies.json               │
│   (tabla vinilos)  (tabla rones)  (tabla whiskies)             │
└─────────────────────────────────────────────────────────────────┘

Flujo de portadas (covers):
  Discogs API ←── x-discogs-token (header) ──← localStorage
  og:image scraping ←── URL del producto (sitio oficial)
```

**Deploy:**
- Frontend: `npm run deploy` → GitHub Pages (`federicojimenezpulido.github.io/...`)
- Backend: push a `main` → auto-deploy en Render.com vía `render.yaml`

---

## Stack tecnológico — explicado con analogías SQL/Oracle

Tenés fondo en SQL y PL/SQL. Esta sección traduce cada tecnología web a algo que ya conocés.

### Frontend

| Tecnología | Analogía SQL/Oracle | Para qué sirve aquí |
|---|---|---|
| **React** | Generador de reportes dinámicos | Renderiza la UI en el browser, actualiza solo lo que cambia |
| **React components** | Vistas / reportes reutilizables | Cada componente es una pieza de UI independiente con su estado |
| **React Query (`useQuery`)** | `SELECT` con cache + TTL | Fetcha los datos del backend, los guarda en memoria, los refresca automáticamente |
| **React Query (`useMutation`)** | `INSERT/UPDATE/DELETE` + `COMMIT` | Ejecuta cambios y tras el éxito invalida el cache (re-fetcha) |
| **`useMemo`** | Columna computada / inline view | Recalcula la lista filtrada solo cuando cambian los datos o filtros; evita trabajo innecesario |
| **`useState`** | Variable de sesión / paquete `v_variable` | Estado local del componente (qué item está seleccionado, qué texto hay en el buscador, etc.) |
| **`useEffect`** | Trigger | Se activa cuando cambia alguna dependencia; con cleanup es como un trigger que se habilita y deshabilita |
| **`useCrud` (hook)** | Procedimiento DML reutilizable | Encapsula add/update/remove para cualquier colección; se instancia por colección |
| **CSS Modules** | Scope por esquema | Los nombres de clase son únicos por componente; `styles.card` en Dashboard no colisiona con `styles.card` en otro archivo |
| **axios** | Database link / dblink | Cliente HTTP preconfigurado con la URL base del backend; todas las llamadas pasan por él |
| **Vite** | Make / build tool | Empaqueta el proyecto para producción; en dev sirve con hot-reload instantáneo |

### Backend

| Tecnología | Analogía SQL/Oracle | Para qué sirve aquí |
|---|---|---|
| **FastAPI** | Oracle REST Data Services (ORDS) / PL/SQL HTTP server | Framework Python que expone endpoints HTTP con validación automática |
| **Routers FastAPI** | Packages PL/SQL | Cada archivo en `routers/` agrupa los endpoints de una colección; se registran en `main.py` con `include_router` |
| **`data_store.py`** | Capa de acceso a datos (DAL) | `read_collection()` = SELECT, `write_collection()` = TRUNCATE + INSERT bulk |
| **Archivos JSON** | Tablas | Cada `.json` es el equivalente de una tabla; no hay motor de base de datos, solo archivos de texto estructurado |
| **CORSMiddleware** | Permisos entre esquemas | Le dice al browser que el frontend tiene permiso de llamar al backend desde otro dominio |
| **`@router.get("/")`** | `SELECT * FROM ...` con filtros opcionales | Endpoint que lee y filtra la colección |
| **`@router.post("/")`** | `INSERT INTO ...` | Agrega un nuevo registro al JSON |
| **`@router.put("/{index}")`** | `UPDATE ... WHERE rownum = index` | Reemplaza el registro completo en esa posición |
| **`@router.delete("/{index}")`** | `DELETE FROM ... WHERE rownum = index` | Elimina el registro en esa posición del array |
| **`render.yaml`** | Script de deployment (como un shell script de instalación) | Le dice a Render cómo construir y arrancar el backend automáticamente |

---

## Estructura del frontend

```
frontend/
├── src/
│   ├── App.jsx              # Raíz: mantiene el estado de colección activa
│   ├── main.jsx             # Entry point: monta React + QueryClientProvider
│   ├── index.css            # Variables CSS globales (--bg, --text, --v-acc, etc.)
│   ├── components/
│   │   ├── Header.jsx       # Barra superior: logo, título, toggle de colección, token Discogs
│   │   ├── Header.module.css
│   │   ├── Dashboard.jsx    # Contenedor principal: useQuery, useMemo, filtros, cards
│   │   ├── Dashboard.module.css
│   │   ├── Sidebar.jsx      # Panel lateral: filtros por categoría/género/país
│   │   ├── Sidebar.module.css
│   │   ├── KpiBar.jsx       # Barra de métricas: totales, artistas únicos, promedio escala
│   │   ├── KpiBar.module.css
│   │   ├── SearchBar.jsx    # Input de búsqueda full-text
│   │   ├── SearchBar.module.css
│   │   ├── Modal.jsx        # Modal de detalle (item seleccionado): Escape para cerrar
│   │   ├── Modal.module.css
│   │   ├── AdminForm.jsx    # Modal de alta/edición/borrado + fetch de portadas
│   │   ├── AdminForm.module.css
│   │   ├── FeaturedBanner.jsx   # Banner "Descubrimiento del mes" — localStorage
│   │   ├── FeaturedBanner.module.css
│   │   ├── ShareView.jsx        # Vista compartible por URL (?v=INDEX)
│   │   ├── ShareView.module.css
│   │   ├── SpotifyModal.jsx     # Player Spotify embebido
│   │   ├── SpotifyModal.module.css
│   │   ├── StatsView.jsx        # Vista de estadísticas con barras CSS
│   │   ├── StatsView.module.css
│   │   ├── PinModal.jsx         # Diálogo de PIN para acciones admin
│   │   ├── PinModal.module.css
│   │   ├── WelcomeModal.jsx     # Modal de bienvenida — primera visita
│   │   ├── WelcomeModal.module.css
│   │   ├── About.jsx            # Modal informativo: arquitectura, stack, API
│   │   └── About.module.css
│   ├── hooks/
│   │   └── useCrud.js       # Hook reutilizable: add/update/remove con invalidación de cache
│   └── services/
│       └── api.js           # Todas las funciones axios (GET/POST/PUT/DELETE por colección)
├── package.json
└── vite.config.js
```

### Descripción de cada componente

**`Header`**
Barra superior sticky. Renderiza el logo animado (vinilo giratorio o gradiente de color), el título con tipografía serif (Playfair Display), el toggle de colección activa, y el botón 🔑 para guardar el token de Discogs en `localStorage`. El token se usa en el header `x-discogs-token` de cada request a la API de covers.

**`Dashboard`**
El componente más importante. Orquesta todo: hace el `useQuery` para traer datos, aplica filtros y búsqueda con `useMemo`, y controla qué modal está abierto. Contiene el grid de cards y la topBar con búsqueda, botón de agregar, y el botón de portadas bulk.

**`Sidebar`**
Panel lateral con botones de filtro. Para vinilos muestra agrupadores y géneros; para licores muestra tipo y país. Al hacer click activa/desactiva un filtro; `Dashboard` recibe el objeto `filters` y lo aplica en el `useMemo`.

**`KpiBar`**
Barra horizontal de métricas. Para vinilos: total, activos, fuera de colección, artistas únicos, géneros únicos, registrados en Discogs. Para rones: total, países, escala promedio, blended, tipos. Para whiskies: total, países, single malts, blended, con edad declarada.

**`SearchBar`**
Input controlado simple. El estado `search` vive en `Dashboard` y se pasa hacia abajo via props (prop drilling simple; no se justifica Context para esto).

**`Modal`**
Modal de solo lectura para ver el detalle de un item. Cierra con `Escape` (useEffect con cleanup), con click en el overlay, o con el botón Cerrar. Tiene sección de acciones: link a Discogs (vinilos), link al sitio oficial (licores), y botón Editar que abre `AdminForm`.

**`AdminForm`**
Modal de escritura. Detecta si es alta (item=null) o edición (item con datos). Tiene auto-fetch de portada Discogs al abrir un vinilo sin cover_url. Para licores usa el endpoint de scraping og:image. Permite pegar URL manual si la búsqueda automática falla, con detección de URLs de release de Discogs para raspar la imagen real.

**`FeaturedBanner`**
Banner "Descubrimiento del mes" anclado en la parte superior de la colección de vinilos. El vinilo destacado se persiste en `localStorage`. Incluye botón para escuchar en Spotify y botón para copiar la URL compartible.

**`ShareView`**
Vista de tarjeta diseñada para compartir un vinilo por URL (`?v=INDEX`). Se activa automáticamente al acceder al link. Permite navegar directo a la colección desde esa tarjeta.

**`SpotifyModal`**
Player de Spotify embebido en modal propio. El `spotify_id` puede corregirse manualmente y persiste en la base de datos para no repetir fetches.

**`StatsView`**
Vista de estadísticas con gráficos de barras CSS puro (sin librerías externas). Las barras son clickeables — al hacer clic se filtra la colección y se abre un modal con los registros de esa categoría.

**`PinModal`**
Diálogo de PIN para proteger acciones de escritura (agregar, editar, borrar). El PIN es opcional y se configura desde el Header (botón 🛡️). Se guarda en `localStorage`.

**`WelcomeModal`**
Modal de bienvenida para primeras visitas. Explica qué es el proyecto, muestra las tres colecciones y las features principales. Se controla con la clave `enlt_welcome_seen` en `localStorage`.

**`About`**
Modal informativo de solo lectura. Muestra la arquitectura, el stack con analogías SQL, los endpoints de la API, y cómo correr el proyecto localmente. Se abre desde el botón 📖 en el Header.

---

## Estructura del backend

```
backend/
├── main.py              # Entry point: crea la app FastAPI, registra routers, configura CORS
├── data_store.py        # Capa de I/O: read_collection() y write_collection()
├── requirements.txt     # fastapi, uvicorn, httpx
├── render.yaml          # Configuración de deploy en Render.com (en raíz del repo)
├── routers/
│   ├── __init__.py
│   ├── vinyls.py        # GET/POST/PUT/DELETE /api/vinyls/
│   ├── rums.py          # GET/POST/PUT/DELETE /api/rums/
│   ├── whiskies.py      # GET/POST/PUT/DELETE /api/whiskies/
│   └── covers.py        # GET /api/covers/, POST /fetch, /fetch-discogs, /bulk-discogs, GET /scrape
└── data/
    ├── vinilos.json     # Colección de vinilos (array de objetos)
    ├── rums.json        # Colección de rones
    └── whiskies.json    # Colección de whiskies
```

### `main.py`

Crea la aplicación FastAPI, configura CORS para permitir requests desde `localhost:5173` (dev) y `federicojimenezpulido.github.io` (prod), y registra los cuatro routers con sus prefijos.

```python
app.include_router(vinyls.router,   prefix="/api/vinyls",   tags=["Vinyls"])
app.include_router(rums.router,     prefix="/api/rums",     tags=["Rums"])
app.include_router(whiskies.router, prefix="/api/whiskies", tags=["Whiskies"])
app.include_router(covers.router,   prefix="/api/covers",   tags=["Covers"])
```

### `data_store.py`

Abstracción de lectura/escritura de archivos JSON. Todos los routers importan solo estas dos funciones, nunca tocan el filesystem directamente.

```python
read_collection("vinilos")          # → json.load del archivo
write_collection("vinilos", data)   # → json.dump (reescribe el archivo completo)
```

La operación de escritura es un "replace completo": equivale a `TRUNCATE TABLE + INSERT INTO ... SELECT`. No hay operaciones parciales a nivel de archivo; se reemplaza el array entero.

### Routers

Cada router sigue el mismo patrón CRUD. El índice del array JSON hace las veces de PRIMARY KEY (posicional, no un ID explícito). Esto es una simplificación intencional para un proyecto personal.

### `covers.py`

El router más complejo. Tiene dos fuentes de portadas:

1. **Discogs API** (`search_discogs`): Busca por artista+álbum usando el token personal. Devuelve la URL de `cover_image` del primer resultado. Requiere el header `x-discogs-token`.

2. **og:image scraping** (`scrape_og_image`): Lee los primeros 50KB del HTML de cualquier URL y extrae el meta tag `og:image`. Funciona para sitios de destilerías, importadoras, y páginas de release de Discogs.

El endpoint `POST /bulk-discogs` itera todos los vinilos sin `cover_url` y les busca portada de a uno.

---

## Endpoints de la API

### Vinilos

| Método | Endpoint | Descripción | Analogía SQL |
|--------|----------|-------------|--------------|
| `GET` | `/api/vinyls/` | Lista con filtros opcionales (`genero`, `agrupador`, `fuera`, `search`) | `SELECT * FROM vinilos WHERE ...` |
| `GET` | `/api/vinyls/{index}` | Un vinilo por posición | `SELECT * FROM vinilos WHERE rownum = n` |
| `POST` | `/api/vinyls/` | Agregar vinilo | `INSERT INTO vinilos VALUES (...)` |
| `PUT` | `/api/vinyls/{index}` | Reemplazar vinilo completo | `UPDATE vinilos SET ... WHERE rownum = n` |
| `DELETE` | `/api/vinyls/{index}` | Eliminar vinilo | `DELETE FROM vinilos WHERE rownum = n` |

### Rones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/rums/` | Lista con filtros opcionales |
| `GET` | `/api/rums/{index}` | Un ron por posición |
| `POST` | `/api/rums/` | Agregar ron |
| `PUT` | `/api/rums/{index}` | Reemplazar ron |
| `DELETE` | `/api/rums/{index}` | Eliminar ron |

### Whiskies

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/whiskies/` | Lista con filtros opcionales |
| `GET` | `/api/whiskies/{index}` | Un whisky por posición |
| `POST` | `/api/whiskies/` | Agregar whisky |
| `PUT` | `/api/whiskies/{index}` | Reemplazar whisky |
| `DELETE` | `/api/whiskies/{index}` | Eliminar whisky |

### Portadas (Covers)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/covers/?type=vinyl&q=...` | Buscar portada en Discogs (sin guardar). Requiere header `x-discogs-token` |
| `POST` | `/api/covers/fetch` | Raspar og:image de una URL y guardar `cover_url` en el JSON del licor |
| `POST` | `/api/covers/fetch-discogs` | Buscar en Discogs y guardar `cover_url` en el vinilo |
| `GET` | `/api/covers/scrape?url=...` | Raspar og:image de cualquier URL (sin guardar) |
| `POST` | `/api/covers/bulk-discogs` | Buscar portadas Discogs para todos los vinilos sin `cover_url`. Requiere `x-discogs-token` |

---

## Funcionalidades clave

### Token Discogs y portadas de vinilos

Discogs tiene una API pública pero con rate limiting más generoso si usás un token personal (gratis). El token se guarda en `localStorage` del browser bajo la clave `discogs_token`. Cuando el frontend hace una request a `/api/covers/`, lo incluye como header `x-discogs-token`. El backend lo recibe y lo pasa a la API de Discogs.

Al abrir `AdminForm` para editar un vinilo sin portada, el formulario auto-dispara la búsqueda en Discogs usando `artista + album` como query. Si no encuentra nada, muestra un campo para pegar la URL manualmente. Si pegás una URL de release de Discogs (`/release/...` o `/master/...`), el backend raspa el `og:image` de esa página en lugar de usar la URL directamente.

### og:image scraping para licores

Los sitios de destilerías y distribuidoras usan el meta tag `og:image` para la imagen social. El endpoint `/api/covers/fetch` lee los primeros 50KB del HTML de la URL del producto y extrae esa imagen con regex. Es liviano y no requiere ninguna librería extra (solo `urllib` de Python stdlib).

### Bulk cover fetch

El botón "🎵 Portadas" en el Dashboard de vinilos dispara `POST /api/covers/bulk-discogs`. El backend itera el array de vinilos, y para cada uno sin `cover_url` hace una búsqueda en Discogs. Con 100+ vinilos puede tardar 1-2 minutos. El timeout del axios está seteado en 120 segundos para este endpoint.

### Variables CSS globales

Todas las variables de diseño están en `index.css`. Esto permite que cualquier componente use `var(--v-acc)` para el rojo de vinilos sin hardcodear colores. Cambiar el tema requiere editar un solo archivo.

---

## Cómo correr localmente

### Backend

```bash
cd espiritus-vinilos/backend

# Primera vez: crear entorno virtual e instalar dependencias
python -m venv .venv
source .venv/bin/activate       # Mac/Linux
# .venv\Scripts\activate        # Windows

pip install -r requirements.txt

# Arrancar
uvicorn main:app --reload
# → Disponible en http://localhost:8000
# → Documentación interactiva en http://localhost:8000/docs
```

El flag `--reload` hace que el servidor se reinicie automáticamente cuando cambiás el código. Equivale a tener el IDE en modo "live reload".

### Frontend

```bash
cd espiritus-vinilos/frontend

# Primera vez
npm install

# Arrancar en modo desarrollo
npm run dev
# → Disponible en http://localhost:5173
```

Vite sirve el frontend con HMR (Hot Module Replacement): los cambios en el código se reflejan en el browser sin recargar la página completa. La variable `VITE_API_URL` en `.env.local` permite apuntar a un backend remoto en dev:

```
# frontend/.env.local
VITE_API_URL=https://tu-backend.onrender.com
```

Si no existe `.env.local`, usa `http://localhost:8000` por defecto.

---

## Cómo deployar

### Frontend → GitHub Pages

```bash
cd espiritus-vinilos/frontend
npm run deploy
```

Este comando hace dos cosas:
1. `npm run build` → Vite compila todo en `dist/` (HTML + JS + CSS minificados)
2. `npx gh-pages -d dist` → Sube la carpeta `dist/` a la rama `gh-pages` del repo

GitHub Pages sirve automáticamente la rama `gh-pages`. El proceso tarda ~1 minuto.

Para que los assets y la API apunten bien en producción, `vite.config.js` tiene el `base` configurado con el path correcto del repo, y `VITE_API_URL` se setea en las variables de entorno del build (en GitHub Actions si usás CI, o localmente antes del deploy).

### Backend → Render.com

El archivo `render.yaml` en la raíz del repo configura el servicio:

```yaml
services:
  - type: web
    name: espiritus-vinilos-api
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    plan: free
```

Cada `git push` a `main` dispara un re-deploy automático en Render. El free tier "duerme" el servicio tras 15 minutos de inactividad; el primer request después de inactividad tarda ~30 segundos (cold start).

---

## Historial de lo que se construyó

### Fase 1 — Base
- Setup del repo monorepo con carpetas `backend/` y `frontend/`
- FastAPI con los tres routers básicos (vinyls, rums, whiskies) y `data_store.py`
- React con Vite, tema oscuro, variables CSS globales
- `Dashboard` con `useQuery` para fetch de datos
- Grid de cards básico con dato hardcodeado

### Fase 2 — Componentes de UI
- `Header` con toggle de colección y logo animado (vinilo giratorio en CSS puro)
- `Sidebar` con filtros interactivos
- `KpiBar` con métricas por colección
- `SearchBar` con búsqueda full-text en memoria
- `Modal` de detalle con cierre por Escape, click overlay, y botón
- CSS Modules en todos los componentes

### Fase 3 — CRUD completo
- `AdminForm` para alta, edición y borrado
- `useCrud` hook que encapsula las tres mutations con invalidación de cache
- Validación de tipos en `parseForm` (parseInt, parseFloat, string a boolean)
- Todos los endpoints `POST`, `PUT`, `DELETE` en el backend

### Fase 4 — Portadas
- Endpoint `GET /api/covers/` conectado a Discogs API
- Token Discogs en `localStorage` con UI en el `Header` (botón 🔑)
- Auto-fetch de portada al abrir `AdminForm` para un vinilo sin `cover_url`
- Scraping de `og:image` para portadas de licores
- Input manual de URL con detección de releases de Discogs
- Endpoint `POST /bulk-discogs` para actualización masiva
- Botón "🎵 Portadas" en el Dashboard de vinilos

### Fase 5 — Deploy y documentación
- Configuración de CORS en FastAPI para GitHub Pages
- `render.yaml` para auto-deploy en Render
- Script `npm run deploy` con `gh-pages`
- `About.jsx`: modal de documentación interna accesible desde el Header (botón 📖)
- Este README

### Fase 6 — Features avanzadas y UX

- **SpotifyModal**: player de Spotify embebido en modal propio, abierto desde las cards de vinilos. El `spotify_id` o álbum de búsqueda se puede corregir manualmente y persiste en la base de datos para no repetir fetches
- **FeaturedBanner**: banner "Descubrimiento del mes" anclado en la parte superior de la colección de vinilos. El vinilo destacado se guarda en `localStorage` y persiste entre sesiones. Incluye botón para escuchar en Spotify y botón para copiar URL compartible
- **ShareView**: vista de tarjeta diseñada para compartir un vinilo vía URL (`?v=INDEX`). Se abre automáticamente al acceder al link. Permite pasar directo a la colección
- **StatsView**: vista de estadísticas con gráficos de barras CSS (sin librerías externas). Gráficos clickeables — al hacer clic en una barra se filtra la colección y se abre un modal con los registros de esa categoría
- **PinModal + protección admin**: PIN opcional configurable desde el Header (botón 🛡️). Si está configurado, cualquier acción de escritura (agregar, editar, borrar) requiere ingresarlo. Se guarda en `localStorage`
- **Responsive mobile**: CSS breakpoints para mobile (`< 768px`). Sidebar oculto por defecto en mobile con toggle "🎚 Filtros". Grid adaptativo. Modales a full-width
- **WelcomeModal**: modal de bienvenida para primeras visitas que explica el proyecto y sus colecciones
- **Branding ENLT**: logo `logo-enlt.jpeg`, título "En Las Nubes Trepao", links a redes sociales (TikTok, Instagram), CNAME para dominio personalizado
- **About modal**: documentación técnica accesible desde el Header (📖) con arquitectura, stack, componentes y endpoints

---

## Variables CSS disponibles

```css
/* Fondos oscuros */
--bg:     fondo más oscuro (body)
--bg2:    cards
--bg3:    inputs, nav pill
--bg4:    detalles en modal, campos de formulario

/* Textos */
--text:   texto principal (blanco)
--text2:  texto secundario (gris claro)
--text3:  texto terciario (gris oscuro, labels)

/* Bordes */
--border: borde estándar

/* Vinilos (rojo) */
--v-acc:   rojo principal
--v-acc2:  rojo hover
--v-gold:  dorado para KPIs

/* Rones (ámbar) */
--ru-acc:  ámbar principal
--ru-acc2: ámbar hover

/* Whiskies (azul) */
--wh-acc:  azul principal
--wh-acc2: azul hover

/* Border radius */
--r: radio de borde estándar
```

---

## Tecnologías usadas

- **React 19** + **Vite 8**
- **@tanstack/react-query 5** — data fetching y cache
- **axios** — cliente HTTP
- **FastAPI** — backend Python
- **uvicorn** — servidor ASGI para FastAPI
- **GitHub Pages** — hosting del frontend
- **Render.com** — hosting del backend
- **Discogs API** — portadas de vinilos
