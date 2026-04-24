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

---

## TRACK A — Capa gráfica ✅ COMPLETADO

**Status:** Cerrado
**Sesiones:** 3

### Diagnóstico de partida — 6 ejes editoriales

| Eje | Estado | Gap |
|---|---|---|
| 1. Concepto dual (vinilo + espíritus conversan) | ❌ Coexisten en tabs separados | Alto |
| 2. Voz editorial e identidad | ❌ Visor de colección, sin voz propia | Alto |
| 3. Profundidad progresiva del conocimiento | ⚠️ Modal con datos, sin capas curioso/experto | Medio |
| 4. Potencial de sesión / experiencia compartida | ❌ Sin concepto de pairing ni evento en el UI | Alto |
| 5. Fotografía y lenguaje visual | ⚠️ Artwork presente, estética UI genérica | Medio |
| 6. Arquitectura / descubribilidad | ⚠️ Solo filtros — sin mood, concepto ni narrativa | Medio |

### Tareas completadas

- **GRFX-01** ✅ — Hero fotográfico con `hero-4.png`. Headline Fraunces 900, eyebrow, tagline, scroll cue animado.
- **GRFX-02** ✅ — Paleta resuelta por integración fotográfica. Tokens `--font-display` centralizado.
- **GRFX-03** ✅ — Cards: overlay de metadatos sobre imagen. Gradient editorial. Hover actions con z-index correcto.
- **GRFX-04** ✅ — Tipografía migrada a **Fraunces** (variable font, ink traps). Token `--font-display` en todos los componentes.
- **GRFX-05** ✅ — Franja surco macro (`hero-3.png`) entre Hero y colección. WelcomeModal con foto editorial.
- **GRFX-06** ✅ — Scroll-progress bar en header (color por colección). Zoom en portadas al hover. Animaciones de entrada en Hero.

---

## SPRINT ACTUAL — Features y bugs (Abril 2026)

### Completados en este sprint
- ✅ Hero dinámico por colección — imagen y copy distinto para Vinilos / Rones / Whiskies
- ✅ Copy editorial: "Afinando el vinilo entre espíritus" (Vinilos), "Saboreando la barrica entre melodías" (Rones/Whiskies)
- ✅ Hover actions en tarjetas de espíritus — botón "¿Dónde comprar?" (buy_url) + botón destilería (url)
- ✅ Exportar CSV en StatsView — descarga `enlt-{coll}-{fecha}.csv` compatible con Excel
- ✅ robots.txt mejorado con Disallow /api/ y Crawl-delay

### Completado
- ✅ **Imágenes hero** — `hero-1.png` para Rones, `hero-2.png` para Whiskies — funcionan correctamente en producción
- ✅ README.md — reescrito con arquitectura, stack, estructura, instrucciones de deploy y features

### Prompts de referencia (para reemplazar imágenes en el futuro si se desea)

**Hero Rones:**
```
Editorial photography, analog warmth. A worn wooden table in a dimly lit bar or home library. 
Center: a glass of dark amber rum, slightly backlit, with condensation. Behind it: a vinyl record 
sleeve leaning against a rum bottle from the Caribbean (no brand visible). Warm candlelight from 
the right. Dark background with bokeh. Film grain. Palette: deep amber, burnt sienna, dark mahogany.
Overhead or 3/4 angle. No people. Mood: after midnight, ritual, Latin Caribbean soul. 16:9+.
```

**Hero Whiskies:**
```
Editorial photography, Scottish/Japanese whisky aesthetic. A glass of pale gold whisky neat, 
resting on a thick leather-bound book or atlas. Copper still or whisky barrel detail slightly 
out of focus. Cool morning light from a window. Mist or smoke effect. Vinyl record barely visible 
in the background. Palette: gold, slate grey, deep charcoal, copper. Minimal, architectural.
Mood: patience, process, craft over marketing. 16:9+.
```

---

## TRACK B — Concepto editorial (siguiente iteración)

**Status:** Pendiente — requiere contenido y decisión estratégica del owner
**Priority:** Alta para posicionamiento a largo plazo
**Effort:** Grande (arquitectura + contenido + desarrollo)
**Blocker:** TRACK A debe estar completo. Owner debe definir estructura de contenido.

### Tareas de este track

- **EDIT-01** — Arquitectura por mood/concepto en vez de tabs por categoría
- **EDIT-02** — Feature de pairing vinilo + espíritu (el framework Booze & Vinyl digitalizado)
- **EDIT-03** — Voz editorial: reseñas, liner notes, notas de cata — primer contenido escrito
- **EDIT-04** — Página "Sesiones" — concepto de evento/experiencia compartida, con diseño que genere anticipación
- **EDIT-05** — Profundidad progresiva: entradas simples en la colección + artículos largos para quien quiere más
- **EDIT-06** — Integración fotográfica editorial (hero, artículos, pairing pages)

---

*Última actualización: Abril 2026*
