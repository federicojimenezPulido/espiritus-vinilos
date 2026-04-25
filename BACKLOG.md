# Backlog — En Las Nubes Trepao

> **Última actualización:** 2026-04-24 · commit `486fd58`

---

## Tabla de estado — resumen ejecutivo

| ID | Feature | Prioridad | Esfuerzo | Estado |
|---|---|---|---|---|
| ARCH-01 | Migrar SPA a SSG (Astro) | 🔴 Alta | Grande | ⏳ Pendiente decisión |
| UXUI-02 | Cloudflare fallback hosting | 🟡 Media | Pequeño | ⏳ Pendiente decisión |
| PROD-01 | Email capture / lista propia | 🔴 Crítica | Pequeño | ⏳ Pendiente decisión |
| EDIT-01 | Arquitectura por mood/concepto | 🔴 Alta | Grande | ⏳ Pendiente |
| EDIT-02 | Pairing vinilo + espíritu | 🔴 Alta | Grande | ⏳ Pendiente |
| EDIT-03 | Voz editorial / reseñas | 🔴 Alta | Grande | ⏳ Pendiente contenido |
| EDIT-04 | Sesiones | 🔴 Alta | Grande | ✅ Completado |
| EDIT-05 | Profundidad progresiva | 🟡 Media | Grande | ⏳ Pendiente |
| EDIT-06 | Integración fotográfica editorial | 🟡 Media | Medio | ⏳ Pendiente |

---

## ARCH-01 — Migrar SPA a Static Site Generator (SSG)

**Status:** ⏳ No iniciado — requiere decisión del owner
**Priority:** 🔴 Alta — bloquea todo el SEO orgánico de contenido
**Effort:** Grande (3–5 días mínimo)
**Dependency:** Decisión sobre Astro vs Eleventy vs Hugo

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

Copy correcto: *"Si querés saber cuándo llega un disco nuevo, dejá tu correo acá."*
Se vuelve más valioso después de ARCH-01 (cada disco tendría su propia landing page).

---

## TRACK B — Concepto editorial

**Status:** En curso — EDIT-04 completado
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

### EDIT-03 — Voz editorial: reseñas y notas de cata

**Status:** ⏳ Pendiente — bloqueado por contenido
**Effort:** Grande (arquitectura + contenido)

Primer contenido escrito del sitio: liner notes de discos seleccionados, notas de cata de espíritus clave. Define la voz de ENLT como curador, no solo como coleccionista. Prerequisito para ARCH-01 (cada reseña sería una página indexable).

---

### EDIT-04 — Sesiones ✅ Completado

**Status:** ✅ En producción desde 2026-04-24
**Commits:** `0f7c41a`, `865463f`

Permite armar una playlist de vinilos + espíritus para una noche específica. Identidad por email + token UUID (sin auth complejo). 8 plantillas de ambiente, máx 2h de música, máx 3 espíritus, vista previa de la sesión completa.

---

### EDIT-05 — Profundidad progresiva

**Status:** ⏳ Pendiente
**Effort:** Grande

Dos capas de contenido para cada ítem: la tarjeta/modal actual (curioso) + un artículo largo accesible desde el modal (experto). Requiere ARCH-01 para que los artículos sean páginas indexables.

---

### EDIT-06 — Integración fotográfica editorial

**Status:** ⏳ Pendiente
**Effort:** Medio

Fotografía propia o editorial para artículos, páginas de pairing y sesiones. Los heroes actuales son placeholders generados por AI — el siguiente nivel es fotografía real del dueño de la colección en contexto.

---

*Actualizado automáticamente en cada commit a main.*
