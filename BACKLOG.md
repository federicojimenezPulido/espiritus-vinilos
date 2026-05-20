# Backlog — En Las Nubes Trepao

> **Última actualización:** 2026-05-20 · v3.1.0

---

## Pendientes activos

| ID | Feature | Prioridad | Por qué |
|---|---|---|---|
| EDIT-02 | Pairing vinilo + espíritu | 🔴 Alta | Núcleo del concepto editorial "Booze & Vinyl" — diferenciador único del proyecto. Sin esto la colección y las sesiones son módulos separados sin conexión curatorial. |
| UX-NEW | Badge "nuevo" / sección recién llegado | 🟡 Media | Sin señal de contenido nuevo no hay razón para que un seguidor vuelva. Impacta retención directamente. Bloquea: decidir campo de fecha (`created_at` o fecha de compra). |
| QA-ASTRO | QA mobile páginas Astro en teléfono real | 🟡 Media | Las 166 páginas estáticas (tracklist, créditos, hero, email capture) no fueron auditadas en dispositivo físico a 375px. Riesgo de regresión visual silenciosa. |
| UXUI-02 | Cloudflare fallback hosting | 🟢 Baja | GitHub Pages tiene historial de outages breves. Cloudflare Pages como fallback daría resiliencia. Bloquea: acceso DNS en Porkbun. |

---

## EDIT-02 — Pairing vinilo + espíritu

**Priority:** 🔴 Alta — núcleo del concepto editorial

Framework *Booze & Vinyl* digitalizado. Una vista que propone combinaciones concretas: este disco con este espíritu, por qué, qué notas comparten. Requiere contenido curatorial del owner. Sin este feature el proyecto es un catálogo digital; con él es una propuesta editorial única.

---

## UX-NEW — Badge "nuevo" / recién llegado

Sin señal de "nuevo contenido" no hay motivo para que un seguidor vuelva. Opciones: badge en card de vinilos recientes, sección "Últimos en llegar" en home. Requiere decidir campo de fecha a usar (`created_at` o fecha de compra existente).

---

## QA-ASTRO — QA mobile páginas Astro

Las 166 páginas estáticas (tracklist, créditos, hero, email capture) no fueron auditadas en teléfono real a 375px. Revisar manualmente 3-5 páginas representativas en iPhone/Android.

---

## UXUI-02 — Cloudflare fallback hosting

Requiere acceso a DNS en Porkbun para configurar Cloudflare Pages como fallback de GitHub Pages.

---

## Historial cerrado

| Versión | Fecha | Qué se hizo |
|---|---|---|
| v2.3.0 | 2026-04-29 | Fix persistencia notes/credits en DB, badge ❝ clickable, modal 2col datos+notas |
| v2.4.0 | 2026-04-30 | **ARCH-01**: Astro SSG, 166 páginas estáticas, sitemap, robots.txt, CI/CD, cards crawleables |
| v2.5.0 | 2026-05-02 | **UXUI-01**: Modal UX overhaul — bottom sheet, hero unificado, vinyl/spirits hero, Spotify en footer, Compartir unificado, mapa colapsable, drag handle |
| v2.6.0 | 2026-05-03 | **UXUI-03+04**: Modal 2 columnas siempre (exploración/acción), CTAs con descripción, páginas estáticas editorial redesign. **CI-01**: fix legacy-peer-deps |
| v2.6.1 | 2026-05-03 | **Limpieza**: CSS muerto (~100 líneas), .gitignore expandido, formateo precios COP/USD/EUR |
| v2.7.0 | 2026-05-04 | **DATA-01**: tracks JSONB en Supabase, save-discogs-release, bulk-discogs-tracks paginado, créditos con íconos en páginas estáticas. **QA-01**: fixes mobile WelcomeModal + AdminForm |
| v2.7.1 | 2026-05-05 | **QA-01 cerrado**: auditoría CSS sesiones post-login, fix spiritCountry overflow + detailTitle ellipsis |
| v2.7.2 | 2026-05-05 | **DATA-01 casi cerrado**: soporte URLs /master/ en endpoints Discogs, 104/106 vinilos con tracklist poblado |
| v2.7.3 | 2026-05-05 | **UX-SESIONES**: búsqueda local en vinyl picker. **UX**: remover botón Spotify del hero en páginas estáticas |
| v3.0.0 | 2026-05-05 | **PROD-01**: email capture Kit en 106 páginas. **SEO-01**: og:image dinámico + alt por vinilo. **ANALYTICS-01**: GA4. **FIX**: deploy.sh unificado React+Astro, compartir vinilo usa URL estática |
| v3.1.0 | 2026-05-20 | **ADMIN-01**: panel admin Sesiones en SettingsPanel (tab protegido por PIN) — KPIs + tabla clientes + tabla sesiones, endpoint `/api/sessions/admin/overview` con auth bcrypt. **QA-iOS**: modal bottom sheet — scroll interno funcional, single-tap para abrir (eliminado double-tap logic). **AUTH**: SSH key configurada para deploys automáticos. |
