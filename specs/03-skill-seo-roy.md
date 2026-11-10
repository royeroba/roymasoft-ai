# SPEC 03 — Skill `seo-roy`: SEO técnico para sitios públicos en Nuxt

> **Estado:** Implementado
> **Depende de:** SPEC 01 (skills de ingeniería), SPEC 02 (presupuesto de reglas)
> **Fecha:** 2026-11-09
> **Objetivo:** Añadir al plugin una skill `seo-roy` que guíe a construir y revisar sitios públicos en Nuxt para que Google los rastree, indexe y los muestre bien, con contenido solo de fuentes oficiales leídas y verificadas.

## Contexto

Pediste SEO "bien hecho" para tus sitios públicos en Nuxt. Se leyeron (con 4 rondas de lectura de páginas completas) las guías oficiales de Google Search Central, web.dev, la documentación de Nuxt 4 y la de Nuxt SEO, más Context7 para contrastar Nuxt e i18n. El curso de julio de 2025 se descartó como fuente: casi todo lo suyo no tiene respaldo oficial (límites de 50–65 y 130–155 caracteres, palabra clave a la izquierda, números impares, detectores de IA).

**Hallazgos verificados que cambian el diseño**
- **Nuxt 3 sin soporte desde el 2026-07-31** (endoflife.date y roadmap oficial). Tus 4 sitios de Tradeview usan Nuxt 3.18.1 con módulos sueltos; `asconsisoma` ya está en Nuxt 4.6 con `@nuxtjs/seo`. Nuxt SEO v6 exige Nuxt 4.6.1+; Nuxt 3 se queda en v5, cuya documentación no pude leer.
- **FAQ rich results dejó de mostrarse el 2026-05-07** (documentación eliminada el 2026-06-15); HowTo, el 2023-09-13 en escritorio; el sitelinks search box se retiró (2024-11-29).
- **llms.txt no se necesita para Google Search** (entrada del 2026-06-15). AI Overviews y AI Mode: "no additional requirements".
- Google **no fija límite de caracteres** en título ni en meta description, **no usa** meta keywords, ni objetivo de palabras; robots.txt: límite de 500 KiB, sin `crawl-delay`; sitemap: 50 MB o 50.000 URLs, ignora `priority` y `changefreq`.
- `noindex` solo funciona si robots.txt no bloquea la página; un 404 "pintado" con estado 200 es soft 404; `createError({ status: 404 })` da el 404 real.

## Alcance

**Entra:**
- `skills/seo-roy/SKILL.md` (despachador), `references/` con 4 archivos y `checklist.md`.
- `evals/fires-seo-roy/` (1 caso) y el ajuste del validador (`ENGINEERING_SKILLS`) y de las cuentas (24 → 25 evals, 19 → 20 skills).
- Enrutado: una fila "SEO" en `frontend-roy` ("no usar para SEO → `/seo-roy`") y una entrada en "Dominios" de `rules/behavior.md` sin pasar del presupuesto.
- `README.md` y `docs/diseno-flujos.md` §11d actualizados.

**No entra (otro spec o descartado):**
- Auditar o corregir tus sitios (p. ej. migrar los 4 de Tradeview a Nuxt 4, la redirección 302 de la raíz, `nuxt-llms`).
- Contenido de Nuxt 3 / Nuxt SEO v5 más allá de una nota y la tabla de versiones de la guía oficial.
- Keyword research, herramientas comerciales, redacción editorial del curso.
- Core Web Vitals en detalle (ya está en `frontend-roy/references/performance.md`; `seo-roy` enlaza, no copia).
- Configurar Search Console por sitio.

## Specs

- **S1.** "si hago bastantes web site con nuxt que estan publicas yq uiero indexar con google y tener buen seo asi que sii quiero hacerlo y bien echo" — La skill cubre sitios públicos en Nuxt que deben indexarse en Google; sin sobreingeniería.
- **S2.** "hghazlo en modo plan leyyendo todo no solo las que leiste sino todo leelo verificalo todoa ntes" — Todo el contenido sale de páginas completas leídas y contrastadas; lo no verificado no entra como hecho (va marcado o se omite).
- **S3.** (respuestas a las preguntas del plan, 2026-11-09) "Nuxt 4 y aviso de Nuxt 3", "Skill nueva seo-roy", "Técnico + títulos y snippets" — Nuxt 4 con nota de Nuxt 3; skill propia; técnico más títulos y snippets, sin keyword research.

## Datos

Estructura (patrón de `frontend-roy`, validado por `scripts/validate-skills.mjs`):

```
skills/seo-roy/
  SKILL.md                              despachador (<199 líneas, en inglés)
  references/
    google-technical.md                 rastreo e indexación
    snippets-and-structured-data.md     títulos, snippets, datos estructurados, IA, spam
    nuxt.md                             Nuxt 4: render, head, rutas, 404, imágenes, scripts
    nuxt-seo-modules.md                 Nuxt SEO v6 y módulos, versiones, errores comunes
    checklist.md                        ≥5 ítems verificables
evals/fires-seo-roy/{prompt.md, graders/skill-fired.md}
```

Cada referencia: `Last verified: 2026-11-09`, ≤100 líneas, una línea `Source: <URL>` por sección `##`, sin español, y solo hechos de la lista verificada.

**Contenido por referencia (todo verificado en lectura literal salvo lo marcado)**
- `google-technical.md`: robots.txt vs `noindex` (no bloquear lo que lleva noindex; 500 KiB; sin `crawl-delay`; 4xx = sin robots; 5xx = 12 h de pausa); `rel=canonical` (autorreferencial, absoluta, sin mezclar con sitemap, ignora `hreflang`/`lang`/`media`); códigos de estado y soft 404, redirecciones (301/308 fuertes, 302/303/307 débiles, 10 saltos; mantener ≥1 año en migraciones; 404/410 sin destino); sitemaps (50 MB / 50.000, `lastmod` solo si es exacto, solo URLs canónicas, `priority`/`changefreq` ignorados); estructura de URL (History API, no fragmentos, guiones); enlaces `<a href>`; JS (noindex en HTML original, canonical, 15 MB/2 MB de Googlebot); móvil primero; hreflang (reciprocidad, `x-default`, URLs absolutas); paginación y facetas (`?page=n`, sin `rel=next/prev`, 404 sin resultados). Fuentes: `developers.google.com/search/docs/crawling-indexing/...`.
- `snippets-and-structured-data.md`: título único y descriptivo (Google puede reescribirlo; sin límite oficial; el truncado depende del ancho); meta description como sugerencia útil (Google la usa "a veces"); JSON-LD recomendado, propiedades requeridas de Breadcrumb, LocalBusiness, VideoObject, Product (snippet vs merchant listing), Organization y Article (sin requeridas); políticas (fiel al contenido visible, no bloquear con robots/noindex); tipos retirados (FAQ, HowTo, sitelinks search box, course info, etc.); nombre del sitio y favicon (formatos); imágenes (`<img src>`, `alt`); funciones de IA (sin requisitos extra, `nosnippet`, `max-snippet`, `Google-Extended` no afecta a Search); llms.txt innecesario; spam (scaled content, back button hijacking) y contenido útil / YMYL.
- `nuxt.md` (Nuxt 4.x): SSR por defecto recomendado para marketing; `ssr: false` desaconsejado; `routeRules` (`prerender`, `swr`, `isr` solo con soporte del host, `redirect`, `headers`); `nuxt generate` no admite híbrido; `useSeoMeta` (reactivo con getters; estático dentro de `import.meta.server`), `useServerSeoMeta` deprecado, `useHead`, `titleTemplate` en `app.vue`, Unhead v2 (sin `vmid`/`hid`); 404 real con `createError({ status: 404 })`, `experimental.prerenderErrorPages`; `<NuxtLink>` renderiza `<a href>`; Nuxt Image (`alt`, `format`, `sizes`, `preload`, fallo de `sharp` entre sistemas), Nuxt Fonts, Nuxt Scripts (triggers); fin de soporte de Nuxt 3 y pasos de migración (nota corta).
- `nuxt-seo-modules.md`: `@nuxtjs/seo` v6 (Nuxt ≥4.6.1, Node ≥22.22.3) y tabla módulo → paquete → versión (v5 para Nuxt 3, v6 para Nuxt 4); `site.url`, `site.name`, `site.indexable` y `NUXT_SITE_ENV` (staging); robots (`groups`, `blockAiBots`, `routeRules.robots`, robots.txt vs noindex); sitemap (`sources`, `defineSitemapEventHandler`, `exclude`, `autoI18n`, 10 min de caché); schema.org (`schemaOrg.identity`, `useSchemaOrg`, no usar `defineLocalBusiness` en la config, `OnlineStore` no es string válido); seo-utils (`canonicalQueryWhitelist`, `redirectToCanonicalSiteUrl`, `seo.redirects`); link checker (`failOnError` por defecto `false`); OG Image (renderers Takumi/Satori/Browser, Zero Runtime en estático); `@nuxtjs/i18n` v10 (`language` BCP-47, `baseUrl`, `useLocaleHead`); errores comunes.

**Excluido por no verificado (no entra como hecho):** nombres `define*` de schema.org más allá de `definePerson`, `defineOrganization`, `defineLocalBusiness`, `defineWebPage`; compatibilidad de `sharp` por proveedor; OG Image en AWS Amplify; `x-default` en la guía de i18n; documentación v5 de Nuxt SEO; la guía HTTPS de Google (no existe en lo leído); el propósito del Schema Markup Validator; fecha de HowTo en móvil; `ssrStreaming` (solo resumen).

## Plan

Cada fase deja el plugin funcionando; sin commit salvo que lo pidas.

- [x] **Fase 1 — Referencias de Google** (S1, S2): `google-technical.md` y `snippets-and-structured-data.md`. Antes de escribir, releer solo las páginas con cifras que se citan (robots.txt, build-sitemap, http-network-errors, title-link) para copiar los números exactos. Verificación: `node scripts/validate-skills.mjs --expect-evals 24` sin errores nuevos (aún no existe la skill, así que se prueba con `--root` apuntando a una copia temporal del esqueleto o al terminar la Fase 3); `grep -c "^Source:"` igual al número de secciones; sin español.
- [x] **Fase 2 — Referencias de Nuxt** (S1, S2): `nuxt.md` y `nuxt-seo-modules.md`, con la tabla de versiones y la nota de fin de soporte de Nuxt 3. Verificación: ≤100 líneas cada una, `Last verified`, una `Source` por sección, y cada cifra o nombre de API aparece en la lista verificada.
- [x] **Fase 3 — Skill, enrutado y validador** (S1, S3): `SKILL.md` (descripción con el caso principal primero y frases reales: "SEO", "index my Nuxt site", "sitemap", "canonical", "robots.txt", "structured data", "Google Search Console"), reglas comunes, ejemplo correcto/incorrecto (404 real frente a soft 404), `checklist.md` (≥8 ítems), `evals/fires-seo-roy`, `ENGINEERING_SKILLS` en `scripts/validate-skills.mjs`, fila de enrutado y "no usar" en `frontend-roy`, entrada "SEO e indexación → `seo-roy`" en `rules/behavior.md` (si no cabe bajo 8990 caracteres se recorta redundancia o se omite y se documenta), `README.md` y `docs/diseno-flujos.md`. Verificación: `node scripts/validate-skills.mjs --expect-evals 25` → exit 0; `claude plugin validate .` → pasa.
- [x] **Fase 4 — Cierre** (S1–S3): `Riesgo:`, comprobar los criterios uno a uno, revisión `rdd-roy` de todo el feature (carril grande), y opcionalmente correr solo el caso `fires-seo-roy` con `claude plugin eval`. Registrar evidencia y pasar a `Implementado` con tu "ok".

## Criterios de aceptación

- [x] `node scripts/validate-skills.mjs --expect-evals 25` termina con exit 0 y 0 errores.
- [x] `claude plugin validate .` pasa.
- [x] Cada referencia tiene `Last verified: 2026-11-09`, ≤100 líneas, una `Source:` por sección y ningún texto en español.
- [x] Ninguna cifra, API ni nombre de paquete de las referencias está fuera de la lista verificada (se comprueba con `grep` contra las páginas de origen del Log).
- [x] `SKILL.md` tiene <199 líneas, enruta a las 4 referencias y al checklist, e incluye un ejemplo correcto y uno incorrecto con su porqué.
- [x] Las reglas inyectadas siguen ≤ 8990 caracteres según el validador.
- [x] La skill dice que Nuxt 3 está sin soporte y qué módulos usa cada versión; no afirma nada de Nuxt SEO v5 más allá de la tabla oficial.
- [x] Ningún archivo fuera de la lista de Alcance cambia (salvo `evals/rubric.md`, con los conteos 19→20 y 24→25 que su propia regla pide actualizar).

## Decisiones

- **Hecha:** skill propia `seo-roy` en lugar de un archivo en `frontend-roy` — el SEO de Nuxt (módulos, robots, sitemap, Search Console, estados HTTP) no cabe en 100 líneas ni encaja con React y Vue; tus respuestas lo confirman.
- **Hecha:** Nuxt 4 con aviso de Nuxt 3 — es lo único que pude verificar entero; la guía oficial de migración da la tabla v5/v6.
- **Hecha:** técnico + títulos y snippets — mantiene lo que Google dice y excluye lo que el curso afirmaba sin fuente.
- **Hecha:** Core Web Vitals se enlaza a `frontend-roy/references/performance.md` — misma regla, no se duplica.
- **Hecha:** llms.txt y `nuxt-ai-ready` solo con una línea: Google lo declara innecesario para Search (2026-06-15).
- **Descartada:** keyword research, intención de búsqueda, herramientas comerciales, detectores de IA, palabra clave a la izquierda y cifras de caracteres del curso — sin respaldo oficial.
- **Descartada:** documentar Nuxt SEO v5 / Nuxt 3 a fondo — no se pudo leer; se prefiere decir "no verificado" a inventar.
- **Descartada:** auditar tus sitios dentro de este spec — es otro trabajo (migración de Nuxt 3, redirección 302 de la raíz, `nuxt-llms`).

## Riesgos

- Las guías de Google y de Nuxt cambian con frecuencia (varias entradas son de 2026): `Last verified` lo declara y hace falta repasarlas de vez en cuando.
- Parte de las páginas largas se truncaron en la lectura (changelog de Google, guía de migración de Nuxt, llms.txt de Nuxt SEO): solo entran hechos leídos literalmente; lo demás está en la lista de excluidos.
- Nuxt SEO documenta sus propios módulos en `nuxtseo.com`, que es su sitio oficial pero no pertenece a Nuxt ni a Google: se cita como fuente de cada módulo, no como norma de Google.
- Presupuesto de reglas con 22 caracteres de margen: la entrada de enrutado puede no caber y habría que recortar o prescindir de ella (la descripción de la skill ya la dispara).
- Una skill más suma ~400 caracteres de descripción al listado de cada sesión; las referencias solo se cargan al usarlas.
- No se ejecutan los evals salvo el caso nuevo (opcional); `fires-frontend-roy` podría cambiar si el nuevo texto de "no usar" confunde, y queda sin re-ejecutar.

## Log

- **L1 · 2026-11-09** — "si hago bastantes web site con nuxt que estan publicas yq uiero indexar con google y tener buen seo asi que sii quiero hacerlo y bien echo asi qeu hghazlo en modo plan leyyendo todo no solo las que leiste sino todo leelo verificalo todoa ntes"
- **Base** — `HEAD` 8162e8a (rama `dev`, 4 commits sin push), árbol limpio. Skills: 19; evals: 24; `node scripts/validate-skills.mjs --expect-evals 24` → exit 0. Reglas: 8978 caracteres.
- **Lecturas** — Google Search Central (crawling, indexing, appearance, spam, AI, changelog hasta 2026-11), web.dev (vitals, INP, LCP, CLS, optimize-lcp), Nuxt 4.x (SEO and meta, useSeoMeta, useHead, rendering, prerendering, error handling, NuxtLink, Image, upgrade, roadmap), Nuxt SEO (site-config, robots, sitemap, schema-org, seo-utils, link-checker, og-image, going-live, troubleshooting, migración v5→v6), i18n SEO y Nuxt Scripts/Fonts; contraste con Context7 (`/websites/nuxt/4.x`, `/nuxt-modules/i18n`).
- **Respuestas del usuario** — "Nuxt 4 y aviso de Nuxt 3"; "Skill nueva seo-roy"; "Técnico + títulos y snippets".
- **Plan aprobado · 2026-11-09** — con "aceptar" en Plan Mode; spec guardado como Aprobado.
- **Fase 1 · 2026-11-09** — Archivos: `skills/seo-roy/references/google-technical.md` (7 secciones) y `snippets-and-structured-data.md` (8 secciones). Comprobación (script con las reglas del validador, porque la skill aún no existe): `google-technical.md` 88 líneas, `snippets-and-structured-data.md` 88 líneas, ambos con `Last verified: 2026-11-09`, una `Source:` por sección, sin español ni números de versión. Cada afirmación se contrastó con la lectura de páginas completas de la sesión; no se releyeron las cuatro páginas con cifras porque los informes ya traían las cifras literales con su página (500 KiB y 12 h de robots.txt, 50 MB / 50.000 URLs, 10 saltos, 2 MB / 15 MB). No entran: la fecha de HowTo en móvil, la guía HTTPS (no encontrada), el propósito del Schema Markup Validator, las posiciones del favicon en SVG/WebP (la lista de formatos se remite a la fuente).
- **Fase 2 · 2026-11-09** — Archivos: `skills/seo-roy/references/nuxt.md` (7 secciones, 80 líneas) y `nuxt-seo-modules.md` (8 secciones, 98 líneas; la primera versión tenía 102 y se compactó). Comprobación con el script de las reglas del validador: las 4 referencias sin errores (≤100 líneas, `Last verified`, una `Source:` por sección, sin español); solo avisos de números de versión en la tabla de módulos y en Node, esperados. El enlace relativo a `frontend-roy/references/performance.md` existe. Decisiones al escribir: se quitó `NUXT_SITE_URL` porque dos informes de lectura discrepaban (uno decía que no aparece literal, otro que sí); queda `site.url` en `nuxt.config`. Se mantiene `NUXT_SITE_ENV` (consistente en ambos). `x-default` queda como "comprobar las etiquetas generadas" porque la guía de i18n no lo menciona. Excluido por no verificado: nodos `define*` de schema.org más allá de los 4 confirmados, compatibilidad de `sharp` por proveedor, OG Image en Amplify, `ssrStreaming` y la documentación de Nuxt SEO v5.
- **Fase 3 · 2026-11-09** — Archivos: `skills/seo-roy/SKILL.md` (82 líneas, descripción de 585 caracteres, ejemplo correcto e incorrecto de 404 real frente a soft 404), `references/checklist.md` (11 ítems), `evals/fires-seo-roy/` (prompt y grader `tool_used`), `scripts/validate-skills.mjs` (`seo-roy` en `ENGINEERING_SKILLS`), `skills/frontend-roy/SKILL.md` (en "no usar": indexación en Google, sitemap y datos estructurados → `/seo-roy`, y aplicarla también en páginas públicas), `README.md` (20 skills, `--expect-evals 25`, fila de `seo-roy`) y `docs/diseno-flujos.md` §11d. Evidencia: `node scripts/validate-skills.mjs --expect-evals 25` → exit 0, `OK (20 skills checked)`, solo avisos de números de versión en las dos referencias de Nuxt (esperados); `claude plugin validate .` → `Validation passed`; reglas inyectadas siguen en 8978. Desviación del plan: NO se tocó `rules/behavior.md` (la entrada "SEO → `seo-roy`" costaba unos 19 caracteres y el margen quedaba en 3, bajo el tope de 8990). Sustituto: la descripción de la skill dispara por frases de SEO y `frontend-roy` remite a `/seo-roy` en páginas públicas.
- **Fase 4 · 2026-11-09** — Evidencia: `validate-skills.mjs --expect-evals 25` → exit 0, `OK (20 skills checked)`; `claude plugin validate .` → `Validation passed`; reglas 8978 (`rules/` sin cambios). Revisión `rdd-roy` del feature: **PASS**, sin bloqueantes. El revisor verificó con `curl` contra las páginas citadas un muestreo de afirmaciones (robots.txt 500 KiB / 12 h, sitemap 50 MB / 50.000 URLs, 10 saltos, FAQ 7 may 2026, llms.txt 15 jun 2026, Nuxt SEO v6 y tabla v5→v6, fin de vida de Nuxt 3, `createError`, `defineSitemapEventHandler`, `blockAiBots`, `canonicalQueryWhitelist`, propiedades requeridas de LocalBusiness y VideoObject): todas coinciden. Advertencia 1 corregida: en `nuxt.md` "A `titleTemplate` function goes in `app.vue`" era más categórico que la fuente; ahora dice que se recomienda en `app.vue` porque `nuxt.config` no admite una función. Advertencia 2 (cifras de versión que caducan): intencional, con fecha de verificación. No verificado por el revisor: páginas completas de Google sobre canonical, JavaScript SEO, hreflang, paginación, favicon y title-link; detalles de OG Image; guía de i18n; `@nuxt/image`, `@nuxt/fonts`, `@nuxt/scripts`; `navigateTo`; límites de 2 MB y 15 MB. Eval `fires-seo-roy`: NO se pudo correr, ni en esta sesión ni en el terminal del usuario (`claude auth status` → `loggedIn: false`, `authMethod: none`); requiere `claude auth login` y repetir `claude plugin eval . --case "fires-seo-roy" --runs 1 --max-cost-usd 1`. `rules/behavior.md` no se tocó (ver Fase 3).
- **Cierre · 2026-11-09** — Estado pasado a Implementado por orden del usuario ("Sí, Implementado"). El eval `fires-seo-roy` sigue sin ejecutarse por falta de sesión del CLI; queda pendiente.
