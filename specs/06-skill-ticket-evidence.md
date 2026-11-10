# SPEC 06 — Skill `ticket-evidence-roy`: comentar en Jira con capturas y resumen sencillo

> **Estado:** Implementado
> **Depende de:** SPEC 04 (nombres), SPEC 05 (`browser-test-roy` con Playwright o Chrome)
> **Fecha:** 2026-11-09
> **Objetivo:** Un skill nuevo que, con el ticket ya probado, publique en Jira un comentario en lenguaje sencillo con 3 o 4 capturas que demuestren que se cumplió lo que pide el ticket, siempre con tu "sí" antes de publicar.

## Contexto

Hoy ningún skill escribe en Jira. `read-ticket-roy` es solo lectura (`skills/read-ticket-roy/SKILL.md:10`) y `browser-test-roy` guarda la evidencia en `.playwright-mcp/e2e-<fecha>/NN-<criterio>.png` y la muestra en el chat, sin saber de Jira.

Lo que permite el conector de Atlassian de esta sesión (comprobado con `discover`):
- `addOrEditJiraIssueComment`: comenta; con `contentFormat: html` y `inlineFileId` + `inlineFileCollection` incrusta imágenes en el comentario.
- `uploadAttachmentToJiraIssue` (ejecutado con `executeWrite`): dos fases. La primera devuelve un `uploadCommand` que se corre en la shell y entrega un `fileId`; la segunda adjunta el archivo al ticket.

Las capturas de Chrome no se guardan en disco (SPEC 05), y subir a Jira exige un archivo. Por eso la fuente de las capturas es la carpeta de `browser-test-roy` hecha con Playwright.

## Alcance

**Dentro:**
- Skill nuevo `skills/ticket-evidence-roy/SKILL.md` (inglés, menos de 200 líneas, con `Trigger:`).
- Redactar el comentario en lenguaje natural para QA y personas no técnicas, en el idioma del ticket.
- Elegir 3 o 4 capturas de la última carpeta `.playwright-mcp/e2e-*` y relacionarlas con los criterios del ticket.
- Mostrar borrador y capturas, esperar el "sí" y publicar con imágenes dentro del comentario; respaldo: adjuntarlas al ticket y nombrarlas en el texto.
- Leer el comentario de vuelta para confirmar que quedó publicado.
- Ofrecerlo en una línea al cerrar `browser-test-roy` e `implement-ticket-roy` cuando hay clave de Jira y todos los criterios pasaron.
- Casos de regresión: 1 de disparo y 2 de seguridad en `evals/`, y recuento actualizado.

**Fuera (otro spec):**
- Cambiar el estado del ticket, asignar, editar descripción o crear tickets.
- Tomar capturas propias (lo hace `browser-test-roy`).
- Evidencia con Chrome en disco.
- Otros trackers (Linear, Asana, GitHub Issues).
- Subir versión, release, commit y PR.

## Specs

- **S1.** "el skill nuestro de jira o browser que toma capturas puede crear comentarios en los ticket de jira y cargar evidencias" — un skill capaz de comentar en Jira y cargar evidencia.
- **S2.** "crear comenatrios en el ticket de jira cuando ya lot e   gamos termiando y probado cargar esa evidencias unas 3 o 4 fotos capturas" — solo cuando el trabajo está terminado y probado; 3 o 4 capturas.
- **S3.** "una description resumida sencilla con palabras no tan tecnicas ya que eso lo revisa qa y personas no tan tecnicas sino en tono mas natural sencillo facild  enteder" — comentario corto, sin jerga, tono natural.
- **S4.** "donde muestre que se realizo de manera exitosa el ticket cumpliendo lo que pide los criterios de aceptacion si los hay o lo que ooide en si el ticket" — el comentario relaciona lo hecho con cada criterio del ticket, o con lo que pide el ticket si no hay criterios.
- **S5.** "si pkanealo como nuevo skill con rpuenas y test de regresion" — skill nuevo, con pruebas y tests de regresión.
- **S6.** "en ingles evidence ticket ajustalo tu la ortografia" — nombre en inglés: `ticket-evidence-roy`.

## Datos

No hay datos persistentes. Estructura del comentario (Markdown/HTML de Jira):
- Una línea: qué pedía el ticket.
- Qué se hizo, en 2 o 3 frases simples.
- Lista por criterio: ✅ + qué se ve en la captura N.
- Qué no se pudo verificar, si algo.

## Plan

Cada fase deja el plugin funcionando.

- [x] **Fase 1 — Skill: borrador y redacción** (S1, S2, S3, S4, S6): crear `skills/ticket-evidence-roy/SKILL.md` con: cuándo usarlo y cuándo no; contexto del ticket (reutiliza `read-ticket-roy` si no hay); elección de 3 o 4 capturas de la última carpeta `.playwright-mcp/e2e-*` ligadas a criterios; reglas de redacción con ejemplo correcto e incorrecto; no publica si algún criterio no pasó o no se probó. Verificación: `node scripts/validate-skills.mjs` → sin errores, 26 skills, inglés, menos de 200 líneas.
- [x] **Fase 2 — Skill: confirmación y publicación** (S1, S2): añadir el barrido de conectores con `_shared/connectors.md`; mostrar borrador y capturas y esperar el "sí"; subida en dos fases (`uploadAttachmentToJiraIssue` con `uploadCommand` revisado antes de correrlo), comentario HTML con imágenes incrustadas, respaldo de adjuntos, lectura de vuelta, y resumen de lo publicado. Verificación: validador sin errores y relectura contra los 3 casos (sin conector, sin HTML en el comentario, subida fallida).
- [x] **Fase 3 — Integración** (S2): oferta de una línea al cerrar `skills/browser-test-roy/SKILL.md` e `implement-ticket-roy`; cabecera de `skills/_shared/connectors.md` (quién lo usa); `docs/diseno-flujos.md`. Verificación: `node scripts/validate-skills.mjs` (referencias a skills resueltas) y búsqueda de `ticket-evidence-roy` en los 4 archivos.
- [x] **Fase 4 — Casos de regresión y recuentos** (S5): crear `evals/fires-ticket-evidence-roy/`, `evals/safety-ticket-evidence-failed-criterion/` y `evals/safety-ticket-evidence-needs-confirmation/` (prompt + grader); `README.md` (26 skills, fila nueva, `--expect-evals 33`); `evals/rubric.md` (recuentos). Verificación: `node scripts/validate-skills.mjs --expect-evals 33` → OK.
- [x] **Fase 5 — Regresión completa** (S5): `claude plugin validate .`, `node scripts/test-secrets-hook.mjs`, validador con `--expect-evals 33`, comprobar que `read-ticket-roy` sigue siendo solo lectura (`grep "You only read"`), y que los 30 casos anteriores siguen presentes. Opcional con tu ok de gasto: `claude plugin eval . --case "fires-ticket-evidence-roy" --runs 1 --max-cost-usd 1` y los dos de seguridad. Cierre con `regression-review-roy`.

## Criterios de aceptación

- [x] `skills/ticket-evidence-roy/SKILL.md` existe, está en inglés, tiene `Trigger:` y menos de 200 líneas.
- [x] Se rehúsa a publicar éxito si algún criterio falló o no se probó, y lo dice.
- [x] Muestra el borrador y las capturas y espera un "sí" antes de cualquier escritura en Jira.
- [x] El comentario es breve, sin jerga, en el idioma del ticket, y cubre cada criterio (o lo que pide el ticket).
- [x] Usa 3 o 4 capturas de la carpeta de `browser-test-roy` y, si no hay en disco, no inventa: ofrece repetir con Playwright.
- [x] Verifica la publicación leyendo el comentario de vuelta y reporta el enlace.
- [x] `read-ticket-roy` sigue siendo solo lectura.
- [x] `node scripts/validate-skills.mjs --expect-evals 33`, `claude plugin validate .` y `node scripts/test-secrets-hook.mjs` pasan.
- [x] `README.md` y `evals/rubric.md` muestran los recuentos nuevos (26 skills, 33 casos).

## Decisiones

- **Tomada:** nombre `ticket-evidence-roy` — pedido por el usuario ("evidence ticket", ortografía ajustada) y en el formato objeto-propósito de los demás.
- **Tomada:** skill nuevo y no ampliar `read-ticket-roy` — conserva su regla de solo lectura.
- **Tomada:** capturas de la carpeta de `browser-test-roy` — evita duplicar el trabajo de capturar.
- **Tomada:** imágenes dentro del comentario con adjuntos de respaldo — QA ve texto e imagen juntos.
- **Tomada:** se ofrece al cerrar, nunca solo — publicar en Jira lo ve todo el equipo y no se deshace del todo.
- **Descartada:** capturas propias del skill — duplica `browser-test-roy`.
- **Descartada:** cambiar el estado del ticket — no lo pidió y es otra decisión.

## Riesgos

- Publicar en Jira es visible para todos: se confirma siempre el texto y las capturas antes. Las capturas pueden mostrar datos reales o personales; el skill avisa que las revises.
- El `uploadCommand` que devuelve el conector es un comando de shell: se revisa que apunte al servidor de Atlassian y al archivo elegido antes de correrlo; si no coincide, no se corre.
- Las imágenes dentro del comentario exigen que el sitio tenga activado el formato HTML; si no, se usa el respaldo de adjuntos.
- No se prueba la publicación real sin un ticket de prueba que tú indiques; la verificación llega hasta la confirmación y a leer el comentario de vuelta solo en ese caso.
- El recuento de evals sube a 33; si falta un caso, el validador avisa.

## Registro

- **L1 · 2026-11-09** — "el skill nuestro de jira o browser que toma capturas puede crear comentarios en los ticket de jira y cargar evidencias, es de cir crear comenatrios en el ticket de jira cuando ya lot e   gamos termiando y probado cargar esa evidencias unas 3 o 4 fotos capturas y una description resumida sencilla con palabras no tan tecnicas ya que eso lo revisa qa y personas no tan tecnicas sino en tono mas natural sencillo facild  enteder donde muestre que se realizo de manera exitosa el ticket cumpliendo lo que pide los criterios de aceptacion si los hay o lo que ooide en si el ticket"
- **L2 · 2026-11-09** — "si pkanealo como nuevo skill con rpuenas y test de regresion"
- **Base** — `HEAD` acaeba5 en `dev`, árbol limpio; validador `OK (25 skills checked)`; 30 casos de eval (25 de disparo + 1 en español + 4 de seguridad).
- 2026-11-09 — respuestas del usuario: nombre "en ingles evidence ticket ajustalo tu la ortografia"; capturas de la carpeta de browser-test-roy; imágenes dentro del comentario con adjuntos de respaldo; se ofrece en una línea al cerrar.
- 2026-11-09 · Fase 1 — creado `skills/ticket-evidence-roy/SKILL.md` (72 líneas): puerta (ticket, probado, todos los criterios pasaron), criterios del ticket, elección de 3 o 4 capturas de la carpeta de `browser-test-roy`, redacción sencilla con ejemplo correcto e incorrecto, y entrega del borrador sin publicar todavía. Evidencia: `node scripts/validate-skills.mjs` → `OK (26 skills checked)`.
- 2026-11-09 · Fase 2 — añadidas secciones 5 a 8 y "If it fails" en `ticket-evidence-roy`: confirmación explícita antes de escribir, barrido de conectores con `_shared/connectors.md`, subida en dos fases con revisión del `uploadCommand`, comentario HTML con imágenes incrustadas, respaldo de adjuntos sin duplicar, lectura de vuelta y reporte. Evidencia: validador `OK (26 skills checked)`, `SKILL.md` en 99 líneas; releído contra los 3 casos (sin conector → sección 6 entrega texto y carpeta; sin HTML → sección 7 punto 3; subida fallida → "If it fails"). No probado contra un Jira real.
- 2026-11-09 · Fase 3 — oferta de una línea en `browser-test-roy` (sección 4) y en `_shared/verification.md` §4 (que leen `implement-ticket-roy` y `plan-feature-roy`; por eso no se editó `implement-ticket-roy` directamente), cabecera de `_shared/connectors.md` y `docs/diseno-flujos.md` §10. Evidencia: validador `OK (26 skills checked)` (las referencias a `ticket-evidence-roy` resuelven), `browser-test-roy` en 74 líneas, grep del nombre en los 4 archivos.
- 2026-11-09 · Fase 4 — creados `evals/fires-ticket-evidence-roy`, `evals/safety-ticket-evidence-failed-criterion` y `evals/safety-ticket-evidence-needs-confirmation` (prompt + grader); `README.md` (26 skills, fila nueva, `--expect-evals 33`) y `evals/rubric.md` (26 de disparo, 6 de seguridad, 33; antes decía 20 y 25, desfasados). Evidencia: `node scripts/validate-skills.mjs --expect-evals 33` → `OK (26 skills checked)`; con `--expect-evals 32` falla con "expected 32 valid cases, found 33" (el recuento se comprueba en ambos sentidos).
- 2026-11-09 · Fase 5 — regresión: `claude plugin validate .` → Validation passed; `node scripts/test-secrets-hook.mjs` → all 21 passed; `node scripts/validate-skills.mjs --expect-evals 33` → OK (26 skills checked); `read-ticket-roy` sigue siendo solo lectura (SKILL.md:10 y checklist); ningún caso de eval previo borrado ni modificado (solo `rubric.md` con recuentos). Evals de pago no ejecutados (requieren ok de gasto del usuario).
- 2026-11-09 · Revisión fresca (reviewer): PASS con 3 advertencias; ajustadas a petición del usuario ("Sí, ajustar"): `verification.md` §4 aclara que vale también cuando `implement-ticket-roy` o `plan-feature-roy` cierran con prueba en navegador; `ticket-evidence-roy` §4 describe el comentario honesto con pendientes (sin check en lo que no pasó); §5 con respaldo si no existe `SendUserFile`. Evidencia: validador `--expect-evals 33` → `OK (26 skills checked)`.
- 2026-11-09 — el usuario aprobó el cierre ("Sí, marcar"); estado cambiado a Implementado.
- 2026-11-09 — criterios de aceptación marcados: verificados por el validador, `claude plugin validate .`, el hook de secretos y la revisión fresca (PASS); el comportamiento contra un Jira real y los evals de pago no se probaron.
