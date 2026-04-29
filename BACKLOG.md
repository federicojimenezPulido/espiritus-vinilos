# Backlog — En Las Nubes Trepao

> **Última actualización:** 2026-04-29 · v2.3.0

---

## Tabla de estado — resumen ejecutivo

| ID | Feature | Prioridad | Esfuerzo | Estado |
|---|---|---|---|---|
| ARCH-01 | Migrar SPA a SSG (Astro) | 🔴 **Crítica — PRÓXIMO** | Grande | ⏳ Pendiente decisión |
| QA-01 | Triage responsive end-to-end v2.3 | 🔴 Alta | Medio | ⏳ Pendiente |
| UXUI-02 | Cloudflare fallback hosting | 🟡 Media | Pequeño | ⏳ Pendiente decisión |
| PROD-01 | Email capture / lista propia | 🔴 Crítica | Pequeño | ⏳ Pendiente decisión |
| EDIT-01 | Arquitectura por mood/concepto | 🔴 Alta | Grande | ⏳ Pendiente |
| EDIT-02 | Pairing vinilo + espíritu | 🔴 Alta | Grande | ⏳ Pendiente |
| EDIT-05 | Profundidad progresiva | 🟡 Media | Grande | 🔶 Parcial — modal 2col con panel editorial, falta ARCH-01 para páginas indexables |

---

## QA-01 — Triage responsive end-to-end v2.2

**Status:** ⏳ Pendiente
**Priority:** 🔴 Alta — la v2.2 está en producción sin QA mobile formal
**Effort:** Medio (1 sesión)

Revisión sistemática de todas las vistas en viewport mobile (375px / 390px). Vistas a cubrir: collection grid (badge ❝ en cards), hover overlay con snippet (desktop), modal vinilos (epígrafe editorial + tracklist colapsable + créditos grid), modal espíritus, stats, crate, atlas, sesiones (register / list / create / detail), admin form (notas + editor créditos + botón import Discogs), welcome modal, mini-player. Documentar issues y resolverlos en la misma sesión.

---

## ARCH-01 — Migrar SPA a Static Site Generator (SSG)

**Status:** ⏳ **PRÓXIMO — iniciamos en la siguiente sesión**
**Priority:** 🔴 Crítica — bloquea todo el SEO orgánico de contenido
**Effort:** Grande (3–5 días mínimo)
**Dependency:** Decisión sobre Astro vs Eleventy vs Hugo

**Contexto v2.3:** La plataforma alcanzó madurez editorial. El sitio ya tiene notas, créditos, tracklists, sesiones y pairing cultural. La capa de contenido está lista para ser indexada. Sin SSG, ningún motor de búsqueda ve nada más allá del `<title>`. ARCH-01 es el paso que convierte este proyecto poderoso en uno visible.

Todo el contenido renderiza client-side. Los crawlers (Google, Bing) y los scrapers de redes sociales (WhatsApp, Telegram, iMessage) solo ven el `<title>` tag. Ninguna reseña de disco ni página de colección puede ser indexada ni previsualizada individualmente.

**Opciones:**
- **Astro (recomendado):** mantiene los componentes React existentes, genera HTML estático en build time, deploy gratis en GitHub Pages vía GitHub Actions.
- **Eleventy:** más simple, cero JS por defecto, mayor esfuerzo en migración.
- **Hugo:** build más rápido, templates en Go, curva de aprendizaje alta.

---

## UXUI-02 — Resiliencia ante caídas / Fallback hosting

**Status:** ⏳ No iniciado — requiere confirmar DNS con Porkbun
**Priority:** 🟡 Media
**Effort:** Pequeño (1–2 horas)

Cuando GitHub Pages cae, los usuarios ven pantalla blanca. Solución: Cloudflare free tier frente a GitHub Pages — puede servir una página cacheada "estamos volviendo" ante falla del origen. Requiere migrar los NS del dominio a Cloudflare.

---

## PROD-01 — Canal de audiencia propia / Email capture

**Status:** ⏳ No iniciado — requiere decisión del owner
**Priority:** 🔴 Crítica para monetización
**Effort:** Pequeño una vez elegida la plataforma (1 snippet de embed)
**Blocker:** Owner debe elegir plataforma y crear cuenta

100% de la audiencia vive en Instagram. Sin lista de emails no hay base de monetización ni resiliencia ante cambios de algoritmo.

**Opciones:**
1. **Kit (ConvertKit) — recomendado.** Gratis hasta 1,000 suscriptores. Nativo para creadores. Newsletter pago integrado.
2. **Buttondown** — más simple, gratis hasta 100.
3. **Substack — evitar.** Crea dependencia de plataforma.

Copy sugerido: *"Si querés saber cuándo llega un disco nuevo, dejá tu correo acá."*
Se vuelve más valioso después de ARCH-01 (cada disco tendría su propia landing page).

---

## TRACK B — Concepto editorial

**Priority:** 🔴 Alta para posicionamiento a largo plazo

### EDIT-01 — Arquitectura por mood/concepto

**Status:** ⏳ Pendiente decisión estratégica
**Effort:** Grande

Reemplazar los tabs por categoría (Vinilos / Rones / Whiskies) por una arquitectura de descubrimiento basada en mood, ocasión o concepto curatorial. El usuario no entraría a "buscar un ron" sino a "encontrar algo para una noche de lluvia".

---

### EDIT-02 — Feature de pairing vinilo + espíritu

**Status:** ⏳ Pendiente
**Effort:** Grande

El núcleo del concepto editorial: el framework *Booze & Vinyl* digitalizado. Una vista o página que propone combinaciones concretas: este disco con este espíritu, por qué, qué notas comparten. Requiere contenido curatorial del owner.

---

### EDIT-05 — Profundidad progresiva

**Status:** 🔶 Parcialmente cubierto por Fase 12
**Effort:** Grande (el resto requiere ARCH-01)

Dos capas de contenido por ítem. La capa 1 (tarjeta/modal) ya existía. La capa 2 está ahora implementada para vinilos via:
- **Notas editoriales** (`notes`): liner notes con voz propia
- **Tracklist Discogs**: tracklist + créditos desde la API en tiempo real
- **Créditos manuales** (`credits`): créditos adicionales editables en AdminForm

Lo que falta para completar EDIT-05: páginas individuales indexables por disco (requiere ARCH-01 — SSG).

---

---

**v2.3.0 — 2026-04-29:** Fix persistencia notes/credits en DB, badge ❝ clickable, modal 2 columnas datos+notas, fix workflow deploy gh-pages. La plataforma editorial está completa y lista para crecer con SEO (ARCH-01).

*Actualizado manualmente en cada sesión de trabajo.*
