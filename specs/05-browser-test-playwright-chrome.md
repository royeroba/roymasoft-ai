# SPEC 05 — browser-test-roy: elegir entre Playwright y Claude in Chrome, con respaldo

> **Estado:** Implementado
> **Depende de:** SPEC 04 (nombre `browser-test-roy`)
> **Fecha:** 2026-11-09
> **Objetivo:** Que `browser-test-roy` use Playwright por defecto, pase a Claude in Chrome cuando la prueba lo exija y cambie de herramienta solo si la otra no responde, sin romper sus reglas de credenciales ni de evidencia.

## Contexto

Hoy `skills/browser-test-roy/SKILL.md` solo usa Playwright MCP (descripción línea 3, carga de herramientas líneas 24-25, evidencia en `.playwright-mcp/` líneas 43-49, cierre con `browser_close` línea 60). No hay criterio de elección ni respaldo hacia `mcp__claude-in-chrome__*`.

## Alcance

**Dentro:**
- Sección nueva de elección de herramienta en `skills/browser-test-roy/SKILL.md`.
- Regla de respaldo por indisponibilidad.
- Reglas de credenciales y evidencia para Chrome.
- Ajustar `description`, `README.md:18` y `docs/diseno-flujos.md:105` (dicen "solo Playwright").
- Prueba de que el validador sigue pasando.

**Fuera (otro spec):**
- Navegador integrado de la app de escritorio (`mcp__Claude_Browser__*`).
- Reescribir `evals/fires-browser-test-roy` (el disparo no cambia).
- Subir versión, release, commit y PR.
- Guardar capturas de Chrome en disco.

## Specs

- **S1.** "busca si lo que va a probar debe hacerlo con playwrith o con la herramiente de claude de claude in chrome dependiendo de la dificultad o de lo quqe debe testiar" — la elección depende de lo que se prueba; Playwright por defecto, Chrome si exige tu sesión ya iniciada, tus extensiones o lo pides.
- **S2.** "o de si una herramienta falla ysar la ottra" — si la herramienta elegida no está disponible, no conecta o da error de infraestructura, se usa la otra y se dice en una línea. Un fallo de la feature o de un selector nunca dispara el cambio.
- **S3.** "haz esa jeora creo es importante hagamsolo bien" — implementar con spec y verificación, sin tocar nada fuera de alcance.

## Datos

No hay datos nuevos.

## Plan

Cada fase deja el skill funcionando.

- [x] **Fase 1 — Criterio de elección** (S1): en `SKILL.md`, sección "2. Prepare", añadir la regla: Playwright por defecto (navegador limpio, evidencia en `.playwright-mcp/`); Chrome si la prueba necesita sesión iniciada, extensiones, o el usuario lo pide. Declarar la herramienta elegida en una línea antes de actuar. Verificación: `node scripts/validate-skills.mjs` → sin errores (inglés, <200 líneas, sin enlaces rotos).
- [x] **Fase 2 — Carga y ejecución con Chrome** (S1): indicar que, antes de usar Chrome, se lee `anthropic-skills:chrome-browser` y se cargan sus herramientas con un único `ToolSearch`; en "3. Execute" el equivalente de `browser_snapshot` es `read_page`/`find`, y se revisan consola y red con `read_console_messages`/`read_network_requests`. Verificación: cada herramienta citada existe en la lista de herramientas diferidas de la sesión.
- [x] **Fase 3 — Respaldo** (S2): nueva regla: cambia solo por indisponibilidad (herramienta ausente, conexión rechazada, extensión sin conectar), lo dice en una línea y retoma desde el criterio en curso; fallo de feature o selector se reporta como hoy (sección 5). Si ninguna de las dos responde, lo dice y no inventa resultado. Verificación: relectura del texto contra los 3 casos (ausente, caída a mitad, fallo de feature).
- [x] **Fase 4 — Credenciales y evidencia con Chrome** (S1): con Chrome se aprovecha la sesión existente; si aparece login, parar y pedir al usuario que lo haga, sin escribir credenciales ni leer cookies o storage. Evidencia: capturas inline en el chat y la tabla indica "sin carpeta de evidencia en disco" para esa prueba; el cierre no llama a `browser_close` de Playwright. Verificación: la sección 4 y 6 distinguen ambas herramientas.
- [x] **Fase 5 — Textos vinculados** (S3): actualizar `description` (ya no "using the Playwright MCP"), `README.md:18` y `docs/diseno-flujos.md:105`. Verificación: `node scripts/validate-skills.mjs` y `grep -rn "solo vía /browser-test-roy"` sin resultados desfasados.

## Criterios de aceptación

- [x] `SKILL.md` indica cuándo usa Playwright y cuándo Chrome, con la regla por defecto.
- [x] Define el respaldo solo por indisponibilidad y lo separa del fallo de la feature.
- [x] Mantiene la regla de no escribir credenciales ni leer cookies/storage en ambas herramientas.
- [x] Explica la evidencia para cada herramienta y el cierre de cada una.
- [x] `node scripts/validate-skills.mjs` pasa y `SKILL.md` queda en menos de 200 líneas.
- [x] `README.md` y `docs/diseno-flujos.md` ya no dicen que solo se usa Playwright.

## Decisiones

- **Tomada:** Playwright por defecto — navegador aislado, sin sesiones del usuario, evidencia reproducible.
- **Tomada:** respaldo solo por indisponibilidad — evita enmascarar fallos reales de la feature con otra herramienta.
- **Tomada:** Chrome usa la sesión existente pero nunca credenciales tecleadas — conserva la regla actual.
- **Tomada:** evidencia de Chrome inline en el chat, sin disco — Chrome no escribe en `.playwright-mcp/`.
- **Descartada:** Chrome por defecto — usa el navegador real del usuario sin necesidad.
- **Descartada:** cambio automático tras reintento fallido — riesgo de ocultar un fallo real.

## Riesgos

- Chrome opera con las sesiones reales del usuario: una acción mal dirigida afecta cuentas reales. Mitigación: entorno local por defecto y confirmación antes de operar fuera de local (regla ya existente en la sección 2).
- Cambiar de herramienta a mitad de flujo pierde el estado de la página: se reinicia desde el criterio en curso y se dice.
- No se prueba en vivo el respaldo (requiere apagar una herramienta): la verificación es por revisión del texto.

## Registro

- **L1 · 2026-11-09** — "haz esa jeora creo es importante hagamsolo bien /roymasoft-ai:plan-feature-roy"
- **Base** — `HEAD` 80878a1 en `dev`, árbol limpio; sin tests del skill (solo el validador).
- 2026-11-09 — respuestas del usuario: Playwright por defecto; respaldo solo por indisponibilidad; sesión existente sin credenciales tecleadas; evidencia inline en el chat.
- 2026-11-09 · Fase 1 — viñeta "Pick the tool" añadida en `SKILL.md` sección 2 (+3 líneas, 65 en total). Evidencia: `node scripts/validate-skills.mjs` → `OK (25 skills checked)`.
- 2026-11-09 · Fase 2 — viñeta de carga de herramientas Chrome (sección 2) y equivalentes `read_page`/`find`/`read_console_messages`/`read_network_requests` (sección 3). Evidencia: validador `OK (25 skills checked)`, `SKILL.md` en 67 líneas; las 8 herramientas citadas (`tabs_context_mcp`, `navigate`, `read_page`, `find`, `computer`, `read_console_messages`, `read_network_requests`, `tabs_create_mcp`) figuran en la lista de herramientas diferidas de la sesión.
- 2026-11-09 · Fase 3 — viñeta "Fallback" en sección 2: cambia solo por indisponibilidad (herramientas ausentes, sin conexión, caída a mitad), lo dice en una línea y retoma desde el criterio en curso; fallo de feature o selector remite a la sección 5; si ninguna responde, no inventa resultado. Evidencia: validador `OK (25 skills checked)`, `SKILL.md` en 71 líneas; releído contra los 3 casos (ausente, caída a mitad, fallo de feature).
- 2026-11-09 · Fase 4 — credenciales con Chrome (sesión existente, mismo stop si aparece login), evidencia con Chrome (capturas inline, tabla indica "sin carpeta de evidencia en disco") y cierre separado (`browser_close` en Playwright; `tabs_close_mcp` solo de la pestaña propia en Chrome, cargada en el `ToolSearch`). Evidencia: validador `OK (25 skills checked)`, `SKILL.md` en 72 líneas.
- 2026-11-09 · Fase 5 — `description` de `SKILL.md`, `README.md:18` y `docs/diseno-flujos.md:105` actualizados. Evidencia: validador `OK (25 skills checked)`, `SKILL.md` en 72 líneas, grep de las frases antiguas sin resultados. Criterios de aceptación verificados uno a uno contra el texto final; el respaldo no se probó en vivo.
- 2026-11-09 · Revisión fresca (reviewer): PASS con 4 advertencias; ajustadas a petición del usuario ("ajusta las advertencias"): introducción sin "solo Playwright", sección 4 con viñetas marcadas por herramienta, confirmación de sesión con equivalente de Chrome, y `chrome-browser` como lectura condicionada a que el entorno lo ofrezca. Evidencia: validador `OK (25 skills checked)`.
- 2026-11-09 — el usuario aprobó el cierre ("Sí, marcar"); estado cambiado a Implementado.
