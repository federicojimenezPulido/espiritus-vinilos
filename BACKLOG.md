# Backlog — En Las Nubes Trepao

Decisiones pendientes y mejoras estructurales que requieren decisión del owner antes de ejecutar.

---

## ARCH-01 — Migrar SPA a Static Site Generator (SSG)

**Status:** No iniciado
**Priority:** Alta — bloquea todo el SEO orgánico de contenido
**Effort:** Grande (3–5 días mínimo)
**Dependency:** Decisión del owner sobre Astro vs Eleventy vs Hugo

**Problema:**
Todo el contenido renderiza client-side. Los crawlers (Google, Bing) y los scrapers de redes sociales (WhatsApp, Telegram, iMessage) solo ven el `<title>` tag. Ninguna reseña de disco, ninguna entrada de curaduría, ninguna página de colección puede ser indexada ni previsualizada.

Los OG tags y robots.txt implementados en esta sesión establecen autoridad de dominio y habilitan el social sharing de la URL raíz — pero no resuelven la indexabilidad de contenido individual.

**Opciones:**
- **Astro (recomendado):** migración sin fricción, mantiene los componentes React existentes, genera HTML estático en build time, deploy gratis en GitHub Pages vía GitHub Actions.
- **Eleventy:** más simple, cero JS por defecto, mayor esfuerzo en migración de contenido.
- **Hugo:** build más rápido, templates en Go, curva de aprendizaje más alta.

No ejecutar hasta que el owner confirme el framework y el plan de migración de contenido.

---

## UXUI-02 — Resiliencia ante caídas / Fallback hosting

**Status:** No iniciado
**Priority:** Media
**Effort:** Pequeño (1–2 horas una vez confirmado el DNS)

**Problema:**
Cuando GitHub Pages tiene un incidente, los usuarios con JS activo ven pantalla blanca.
El bloque `<noscript>` es el único safety net server-rendered actual.

**Opción:**
Configurar Cloudflare (free tier) frente a GitHub Pages.
Cloudflare puede servir una página estática cacheada "estamos volviendo" ante falla del origen.
Requiere migrar los DNS del dominio a los nameservers de Cloudflare.
Confirmar con el owner si el registrador (Porkbun) permite cambio de NS.

---

## PROD-01 — Canal de audiencia propia / Email capture

**Status:** No iniciado — requiere decisión del owner
**Priority:** Crítica para monetización
**Effort:** Pequeño una vez elegida la plataforma (1 snippet de embed)
**Blocker:** Owner debe elegir plataforma y crear cuenta

**Problema:**
100% de la audiencia vive en Instagram, plataforma que el owner no controla.
Sin lista de emails no hay base de monetización ni resiliencia ante cambios de algoritmo.

**Opciones:**
1. **Kit (ConvertKit) — recomendado.** Gratis hasta 1,000 suscriptores. Nativo para creadores. Opción de newsletter pago integrada.
2. **Buttondown** — más simple, gratis hasta 100, fácil upgrade.
3. **Substack — evitar.** Crea dependencia de plataforma y tensión estética con el posicionamiento underground/análogo.

**Una vez elegida la plataforma:**
- La plataforma provee un snippet JS de embed.
- Agregar el snippet en el SPA en un lugar contextualmente apropiado (después de la primera sección de contenido, nunca como popup).
- Copy en español, voz de curador. No "suscríbete a nuestro newsletter."
  Registro correcto: *"Si querés saber cuándo llega un disco nuevo, dejá tu correo acá."*

Esta feature se vuelve significativamente más valiosa después de ARCH-01 (migración a SSG), que permitiría que cada reseña de disco tenga su propia landing page y punto de conversión.

---

*Última actualización: Abril 2026*
