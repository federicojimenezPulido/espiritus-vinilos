# En Las Nubes Trepao — Frontend

Archivo personal de vinilos, rones y whiskies. Una colección curada desde Medellín, Colombia.

**Sitio en producción:** [enlasnubestrepao.com](https://enlasnubestrepao.com)

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 8 |
| Estilos | CSS Modules |
| Estado / fetch | TanStack Query (React Query) |
| Tipografía | Fraunces (display) + Inter (cuerpo) |
| Mapas | react-simple-maps v3 |
| Backend | FastAPI — [espiritus-vinilos-api](https://github.com/enlasnubestrepao/espiritus-vinilos-api) |
| Base de datos | Supabase PostgreSQL |
| Hosting | GitHub Pages (dominio custom via CNAME) |
| Deploy | `npx gh-pages -d dist` → rama `gh-pages` |

---

## Estructura del proyecto

```
frontend/
├── public/
│   ├── hero-1.png          # Foto editorial — sala + crate + whisky
│   ├── hero-2.png          # Foto editorial — tocadiscos + whisky close-up
│   ├── hero-3.png          # Foto editorial — surco de vinilo macro
│   ├── hero-4.png          # Foto editorial — liner notes + vela + glass (hero principal)
│   ├── logo-enlt.jpeg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── CNAME               # enlasnubestrepao.com
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Nav sticky + scroll-progress bar
│   │   ├── HeroSection.jsx     # Hero dinámico por colección (imagen + copy)
│   │   ├── Dashboard.jsx       # Grid de cards + filtros + vistas
│   │   ├── Modal.jsx           # Detalle de ítem
│   │   ├── StatsView.jsx       # Estadísticas + exportar CSV
│   │   ├── AtlasView.jsx       # Mapa mundial de espíritus
│   │   ├── CountryMiniMap.jsx  # Mini-mapa en modal de detalle
│   │   ├── AdminForm.jsx       # Alta / edición de ítems (requiere PIN)
│   │   ├── WelcomeModal.jsx    # Modal de bienvenida con foto editorial
│   │   ├── Sidebar.jsx         # Filtros laterales
│   │   ├── SearchBar.jsx
│   │   ├── SpotifyModal.jsx
│   │   ├── ShareView.jsx       # Vista de sharing para redes
│   │   ├── SocialDrawer.jsx    # Drawer de Instagram / TikTok
│   │   ├── PinModal.jsx        # Autenticación por PIN
│   │   ├── SettingsPanel.jsx   # Panel de configuración
│   │   ├── FeaturedBanner.jsx
│   │   ├── CrateView.jsx       # Vista crate digger
│   │   ├── KpiBar.jsx
│   │   └── About.jsx
│   ├── services/
│   │   └── api.js              # Llamadas al backend FastAPI
│   ├── LangContext.jsx         # i18n ES/EN
│   ├── App.jsx
│   └── index.css               # Variables globales + grooveStrip
```

---

## Desarrollo local

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

El frontend apunta al backend en Render. No hay entorno local de backend — las llamadas van directo a producción.

---

## Deploy

```bash
npm run build
npx gh-pages -d dist
```

Publica el contenido de `dist/` en la rama `gh-pages`. GitHub Pages sirve esa rama en el dominio custom definido en `public/CNAME`.

El commit al código fuente va a `main` por separado:

```bash
git add src/ public/ BACKLOG.md README.md
git commit -m "feat: descripción"
git push origin main
```

---

## Colecciones

| Colección | Campos clave | Hero image |
|---|---|---|
| Vinilos | artista, album, genero, agrupador, sello, anio, discogs, ig_url, tiktok_url | hero-4.png |
| Rones | brand, name, type, country, region, abv, blend, age, buy_url, url | hero-1.png |
| Whiskies | brand, version, type, origin, country, region, distillery, years, abv, buy_url, url | hero-2.png |

---

## Features principales

- **Hero dinámico por colección** — imagen y copy editorial distinto para Vinilos, Rones y Whiskies
- **Cards con overlay editorial** — metadata integrada sobre la portada, zoom al hover
- **Hover actions** — Spotify y share para vinilos; compra y destilería para espíritus
- **Modal de detalle** — mini-mapa del país, sección de compra, grupos de metadatos
- **Atlas view** — mapa mundial con intensidad por cantidad de espíritus por país
- **StatsView + exportar CSV** — estadísticas de la colección descargables en Excel
- **Scroll-progress bar** — en el header, color según colección activa
- **WelcomeModal** con foto editorial de fondo
- **Franja de transición** entre Hero y colección (surco de vinilo macro)
- **i18n ES/EN** — via LangContext
- **PIN de administración** — para alta y edición de ítems
- **Tipografía Fraunces** — token `--font-display` centralizado en `index.css`

---

## Variables de entorno

No hay variables de entorno en el frontend. La URL base del backend está hardcodeada en `src/services/api.js`:

```js
const BASE_URL = 'https://espiritus-vinilos-api.onrender.com'
```

---

## SEO

- `public/robots.txt` — permite todo, bloquea `/api/`, crawl-delay 10
- `public/sitemap.xml` — URL raíz del sitio
- OG tags en `index.html` — título, descripción, imagen social
- El sitio es una SPA — el contenido individual no es indexable hasta migrar a SSG (ver ARCH-01 en BACKLOG.md)
