# SPEC 02 — Mejoras tomadas de los repos de referencia (solo lo que aporta valor)

> **Estado:** Implementado
> **Depende de:** SPEC 01 (reglas y skills de ingeniería)
> **Fecha:** 2026-11-09
> **Objetivo:** Aplicar al plugin solo las mejoras de los repos de referencia que dan valor medible (tokens, velocidad, seguridad o robustez), descartando las que serían sobreingeniería, y corregir un error de presupuesto de reglas que introduje en 79bb66c.

## Contexto

Se hizo `fetch` y `pull` de engram, gentle-ai (reclonado), agent-skills, i-have-adhd y fernando-skills. Tras leer a fondo el código del plugin y las fuentes, esto es lo que se decidió (con evidencia).

**Hallazgo nuevo (error mío):** `node scripts/validate-skills.mjs --expect-evals 24` → `error rules: injected rules are 9193 chars, budget is 9000`. Antes de 79bb66c `rules/behavior.md` tenía 5338 caracteres; ahora 5624 (+286, la frase sobre `mem_search_prompts`, `mem_update` y `org`). El CI de GitHub solo valida los manifiestos, por eso no saltó, pero el validador local sí falla y la revisión `rdd-roy` no lo detectó. Las reglas se pagan en tokens en cada `SessionStart` (startup, resume, clear y compact).

## Alcance

**Entra:**
- Fase 1: recortar `rules/behavior.md` para volver bajo el presupuesto con margen (ahorro de tokens por sesión).
- Fase 2: revisión `rdd-roy` proporcional al riesgo (regla 6 de `behavior.md`, `rdd-roy`, `_shared/verification.md`, `hu-roy`, `docs/diseno-flujos.md`).
- Fase 3: tolerar BOM UTF-8 en `readJson` de `hooks/bootstrap.mjs` y `hooks/codegraph.mjs`.
- Cierre con validaciones y revisión de todo el feature.

**No entra (otro spec o descartado):**
- Ver las descartadas en Decisiones.
- Publicar versión: sigue 0.17.0 sin subir (ya está en `dev`, sin push).

## Specs

- **S1.** "dale acepto tus sugerencia de que aplicar y del orden de hacerlo" — Se implementa la lista priorizada que propuse (BOM y manifiesto primero, luego revisión proporcional, y lo demás para después), sujeta a S2 y S3.
- **S2.** "antes de hacerlo hagas la planficacion correcta y lectarura completa de todo parra tener un contexto mas amplio y deecidir que realmente agrregar y que no que de verdad nos aporte valor" — Cada candidato se decide con lectura del código propio y de la fuente; lo que no aporta se descarta con motivo.
- **S3.** "llamesevallor amejras para nuestro plugin ya sea seguridad, rapidez,, eficiencia, ahorro de tokens, no es aportar valor hacer sobreingenieria innecesaria" — Criterio de entrada: mejora medible en seguridad, rapidez, eficiencia o tokens, sin complejidad innecesaria.

## Datos

Sin datos nuevos. Archivos que cambian: `rules/behavior.md`, `skills/rdd-roy/SKILL.md`, `skills/_shared/verification.md`, `skills/hu-roy/SKILL.md`, `docs/diseno-flujos.md`, `hooks/bootstrap.mjs`, `hooks/codegraph.mjs`.

## Plan

Cada fase deja el sistema funcionando. Sin commit salvo que lo pidas con `/commit-roy`.

- [x] **Fase 1 — Volver bajo el presupuesto de reglas** (S3): en `rules/behavior.md` acortar la frase de memoria a ~150 caracteres ("Para lo pedido textualmente usa `mem_search_prompts`; para corregir por ID, `mem_update` (`find`/`replace` si es un fragmento). `org` solo si el usuario lo pide.") y recortar de las demás secciones solo redundancia (frases repetidas, sin cambiar reglas) hasta que el total quede bajo 9000 con margen (el objetivo inicial de 8850 exigía quitar matiz de reglas reales y se descartó). Sin cambiar el sentido de ninguna regla. Verificación: `node scripts/validate-skills.mjs --expect-evals 24` → 0 errores y total de reglas ≤ 8990; `git diff rules/behavior.md` sin reglas eliminadas.
- [x] **Fase 2 — Revisión proporcional** (S1, S3):
  - `rules/behavior.md` regla 6: "la revisión de `rdd-roy` si el riesgo es alto (regla 4) o el carril es grande; en carril pequeño con `Riesgo: ninguno` se omite y lo dices en una línea" (neto en caracteres ≤ 0 tras la Fase 1).
  - `skills/rdd-roy/SKILL.md` §1: añadir el caso "carril pequeño con `Riesgo: ninguno`" a "Does it apply?"; sin cambiar el resto.
  - `skills/_shared/verification.md` §3.3 y `skills/hu-roy/SKILL.md` línea de cierre: alinear el texto ("si el riesgo es alto").
  - `docs/diseno-flujos.md` §9 "Cuándo": reflejar la política.
  - Sin tocar `agents/reviewer.md`. El eval `fires-rdd-roy` sigue válido: pide la revisión de forma explícita.
  Verificación: `node scripts/validate-skills.mjs --expect-evals 24` → 0 errores; `grep -n "rdd-roy" rules skills docs` sin contradicciones con la nueva política.
- [x] **Fase 3 — Tolerar BOM UTF-8** (S3): en `readJson` de `hooks/bootstrap.mjs` y de `hooks/codegraph.mjs`, quitar un `﻿` inicial antes de `JSON.parse`. Verificación: `node --check` de ambos y una prueba con archivos temporales (con BOM, sin BOM y JSON inválido) que devuelve objeto, objeto y `null`.
- [x] **Fase 4 — Cierre** (S1–S3): `node scripts/validate-skills.mjs --expect-evals 24`, `claude plugin validate .`, `node scripts/test-secrets-hook.mjs`, `Riesgo:` y revisión `rdd-roy` de todo el feature (carril grande). Registrar evidencia en el Log y pasar a `Implementado` solo con tu "ok".

## Criterios de aceptación

- [x] `validate-skills.mjs` termina con 0 errores (hoy: 1, por el presupuesto de reglas).
- [x] Reglas inyectadas ≤ 8990 caracteres según el validador (eran 9193) sin perder ninguna regla.
- [ ] Una tarea pequeña con `Riesgo: ninguno` no lanza el subagente revisor y lo dice en una línea; con riesgo alto o carril grande sí se lanza. (Texto coherente en regla 6, `rdd-roy`, `verification.md`, `hu-roy` y `docs`; el comportamiento real solo se observa tras actualizar el plugin, por eso sigue sin marcar.)
- [x] `readJson` devuelve el objeto de un JSON con BOM y `null` de uno inválido, en ambos hooks.
- [x] Ningún archivo fuera de la lista de Datos cambia; versión sigue en 0.17.0.

## Decisiones

- **Hecha:** condensar las reglas (no subir el presupuesto ni quitar mi frase) — ahorra tokens en cada sesión y conserva el aviso sobre `mem_search_prompts`, `mem_update` y `org`.
- **Hecha:** revisión proporcional — alinea la implementación con el principio 5 de `docs/diseno-flujos.md` ("el esfuerzo sigue el riesgo, no el número de archivos") y con gentle-ai v4.1.0 (revisión solo en riesgo alto). La revisión de esta sesión (cambio de `settings.json` y reemplazo de binario) habría seguido corriendo: era riesgo alto.
- **Hecha:** BOM en `readJson` — 2 líneas; en Windows PowerShell 5.1 `Set-Content -Encoding utf8` escribe BOM y hoy haría reinstalar el plugin de Engram cada sesión. gentle-ai lo corrigió por reportes reales (#6019, #6021).
- **Descartada:** `$schema` y `keywords` en `plugin.json` (agent-skills) — el esquema `agent-plugins.org` no es el de Claude Code, es un marketplace personal y no mejora seguridad, velocidad ni tokens.
- **Descartada:** escaneo de secretos del diff staged en `pretooluse-no-commit` — `commit-roy` §6 ya revisa secretos antes de commitear y cada commit pide confirmación en pantalla; añadiría un módulo, un `git diff` por hook y regex duplicadas (el hook de secretos no se puede compartir sin refactor). Reabrir si algún secreto se cuela.
- **Descartada:** commits por unidad de trabajo y PRs encadenados de ~400 líneas (gentle-ai) — `docs/diseno-flujos.md` §12 ya lo rechazó ("Lo que no se toma"); contradice el principio de ligereza.
- **Descartada:** skill `constraint-driven-development` (agent-skills) — 22 KB de SKILL.md + 10 KB de referencia, pide un `CONSTRAINTS.md` por proyecto y herramientas externas (gitleaks, tsc, axe, semgrep) y se solapa con `rules/behavior.md`, `testing-roy` y `security-roy`. Sobreingeniería para hoy.
- **Descartada:** ajustes de evals de agent-skills, correcciones de ejemplos (Lighthouse, axe, `setup-node`; no aparecen en nuestras skills), Gentle Shell, Pi, OpenCode V2, Antigravity, telemetría, i-have-adhd (solo traducciones y OpenCode) y fernando-skills (solo un README).
- **Descartada:** nuevas cosas de Engram — protocolo idéntico al de gentle-ai v4.4.0; `--allow-memory-writes` ya está hecho.

## Riesgos

- Un cambio mal clasificado como bajo riesgo se saltaría la revisión. Mitigación: la clasificación usa la lista de riesgo alto de la regla 4, y "en duda, trátalo como alto".
- Recortar reglas puede quitar un matiz. Mitigación: solo se eliminan frases duplicadas y se revisa `git diff` línea a línea.
- No se corren los evals (manuales y con costo de tokens): `fires-rdd-roy` y los `safety-*` quedan sin re-ejecutar; se declara en el cierre.

## Log

- **L1 · 2026-11-09** — "dale acepto tus sugerencia de que aplicar y del orden de hacerlo solo te pido que antes de hacerlo hagas la planficacion correcta y lectarura completa de todo parra tener un contexto mas amplio y deecidir que realmente agrregar y que no que de verdad nos aporte valor, llamesevallor amejras para nuestro plugin ya sea seguridad, rapidez,, eficiencia, ahorro de tokens, no es aportar valor hacer sobreingenieria innecesaria"
- **Base** — `HEAD` 3150b88 (rama `dev`, 3 commits sin push), árbol limpio. Reproducción: `node scripts/validate-skills.mjs --expect-evals 24` → `error rules: injected rules are 9193 chars, budget is 9000`. Tests relacionados: no hay runner para hooks; `scripts/test-secrets-hook.mjs` existe y no se ha corrido en esta sesión.
- **2026-11-09** — Respuestas del usuario a las 3 preguntas: condensar reglas; revisión solo en riesgo alto o carril grande; incluir el BOM. Plan aprobado con "aceptar" en Plan Mode.
- **Fase 1 · 2026-11-09** — Evidencia: `node scripts/validate-skills.mjs --expect-evals 24` → exit 0, sin líneas `error`; reglas 5382 (behavior) + 2554 (engram) + 1016 (codegraph, con la ruta del plugin resuelta como lo hace el validador) = **8952** (antes 9193, presupuesto 9000). Cambios en `rules/behavior.md`: frase de memoria condensada, "con la skill `/commit-roy`" → "con `/commit-roy`", "como parte de" → "dentro de", párrafo Modelos reordenado, lista de disparadores de planificación acortada, "(usa el Plan Mode nativo)" quitado (lo hace `spec-roy`), "lo que puedas" y "Haz tu trabajo" quitados. Observación: una primera medición con ruta relativa dio 8944 y era errónea (el validador cuenta 48 más); un primer recorte también había quitado "sin lógica de negocio" de la regla de Haiku y se restauró. Margen actual 48 caracteres: la Fase 2 debe quedar neta ≤ 0.
- **Fase 2 · 2026-11-09** — Evidencia: `node scripts/validate-skills.mjs --expect-evals 24` → exit 0 sin `error`; reglas **8954** (límite 8960). Cambios: `rules/behavior.md` regla 6 ("y `rdd-roy` si tocó código con riesgo alto o es grande (si no, dilo)"); `skills/rdd-roy/SKILL.md` (descripción con "high-risk change or a large feature" y §1 con el caso pequeño con `Riesgo: ninguno`, siempre si el usuario la pide); `skills/_shared/verification.md` §3.3; `skills/hu-roy/SKILL.md` línea de cierre; `docs/diseno-flujos.md` §9 "Cuándo" y la línea de comentarios. Sin tocar `agents/reviewer.md` ni `spec-roy` (ya decía "per phase if the risk is high"). Un primer texto de la regla 6 dejó el total en 8988 y se acortó. Coherencia revisada con `grep` en reglas y skills.
- **Fase 3 · 2026-11-09** — Evidencia: `node --check hooks/bootstrap.mjs` y `hooks/codegraph.mjs` OK. Prueba con archivos temporales (funciones extraídas de ambos hooks): con BOM → `{"a":1}` en los dos; sin BOM → `{"a":1}`; JSON inválido → `null`; inexistente → `null`. Cambio: `.replace(/^﻿/, '')` antes de `JSON.parse` en `readJson` de `bootstrap.mjs` (línea 130) y `codegraph.mjs` (línea 16).
- **Fase 4 · 2026-11-09** — Evidencia: `validate-skills.mjs --expect-evals 24` → `OK (19 skills checked)`; `test-secrets-hook.mjs` → `all 21 passed`; `claude plugin validate .` → `Validation passed`. Primera revisión `rdd-roy` del feature: **FAIL, 1 bloqueante** — la regla 3 de `rules/behavior.md` había perdido los disparadores "haz un spec" y "plan mode" y la indicación del Plan Mode nativo (los recortes de la Fase 1 no habían conservado el sentido). Corrección en un solo lote: regla 3 restaurada ("haz un spec", "plan mode", "(Plan Mode nativo)"); además regla 6 aclarada ("con riesgo alto o en carril grande; si la omites, di por qué"), "Haz tu trabajo" restaurado y, para compensar caracteres, "git add|commit|stage" y quitar "Nunca esperes a «guarda en Engram»" (duplica "Sin que te lo pidan"). Reglas: **8978** (tope del spec subido a 8990; margen 22). Segunda revisión acotada al bloqueante: **PASS** (la regla 3 conserva el sentido de la base; único hallazgo, una advertencia: la regla 6 ya no exige `rdd-roy` ni justificación en código de riesgo bajo, que es el cambio de alcance pedido). `git status`: solo los 7 archivos de Datos más el spec; versión 0.17.0 en ambos manifiestos. Estado pasado a Implementado por orden del usuario ("marcallo implementado y haz commit"); el criterio de la revisión proporcional queda sin observar en ejecución hasta actualizar el plugin y los evals manuales no se corrieron. Advertencias del revisor no corregidas: `org` sin explicación en la regla de memoria, `hu-roy` sin "a petición del usuario", y `agents/reviewer.md`/`docs/diseno-flujos.md` línea 23 con "al cerrar un cambio con código" (preexistente; `reviewer.md` fuera de alcance).
