# SPEC 04 — Renombrar 11 skills a nombres claros en inglés

> **Estado:** Implementado
> **Depende de:** SPEC 01 (skills de ingeniería y validador), SPEC 03 (`seo-roy`)
> **Fecha:** 2026-11-09
> **Objetivo:** Que 11 skills tengan nombres en inglés comprensibles (sin siglas), conservando el sufijo `-roy`, sin referencias rotas y con pruebas de regresión que lo demuestren.

## Contexto

Siglas como `hu`, `spec`, `rdd` y `e2e` obligan a recordar qué significan. El renombre ya se aplicó en disco (sin commit) con `git mv` y un reemplazo masivo de referencias. Este spec cierra lo que pueda faltar y añade una prueba permanente para que un nombre viejo o mal escrito nunca vuelva a pasar desapercibido.

Evidencia ya observada: los 42 archivos modificados dan 117 inserciones y 117 borrados (cambio simétrico); el campo `name:` de cada `SKILL.md` coincide con su carpeta (comprobado con un bucle, sin discrepancias); `grep` de los nombres viejos fuera de `specs/` solo devuelve falsos positivos (`user-research-roy` contiene `research-roy`) y una carpeta de capturas `.playwright-mcp/e2e-<...>` en `skills/browser-test-roy/SKILL.md:46`.

## Alcance

**Dentro:**
- Renombrar carpetas en `skills/` y casos `evals/fires-*` (hecho).
- Reemplazar referencias en `README.md`, `rules/`, `docs/`, `agents/`, `skills/`, `evals/`, `scripts/` (hecho).
- Cerrar huecos que queden (carpeta de capturas `e2e-`).
- Nueva comprobación en `scripts/validate-skills.mjs` contra referencias a skills inexistentes.
- Ejecutar la batería de regresión sin coste de tokens.

**Fuera (otro spec):**
- Subir versión a 0.19.0, release, commit y PR.
- Evals reales de pago (`claude plugin eval`).
- Alias o skills puente con los nombres viejos.
- Cambiar `RAI_`, `rai-` o el sufijo `-roy`.
- Editar `specs/01..03` (son historia; conservan los nombres viejos).
- Corregir el conteo desactualizado "20" en `evals/rubric.md` (observación previa).

## Specs

- **S1.** "las skill tienen nombres un poco tecnicos o confusos incluso para mi ejempo hu, spect, e2e, rdd son terminos que quizas podemos standarizar a los nombres normales en ingles que se usa" — nombres en inglés comunes, sin siglas.
- **S2.** "solo cambiaria de tu sugerencia esta del resto si me gustan las demas inclluso las opcionales y todas termianndo con el -roy" — se aplican las 11 sugerencias (con `implement-ticket` en lugar de `implement-task`) y todas terminan en `-roy`.
- **S3.** "hazlo con plan spect para que no falte nada y hazlo con teest de regresion" — spec completo y pruebas de regresión.

Mapa final: `hu`→`implement-ticket`, `spec`→`plan-feature`, `rdd`→`regression-review`, `e2e`→`browser-test`, `consult-ticket`→`read-ticket`, `consult-figma`→`read-figma`, `consult-docs`→`read-shared-docs`, `delivery`→`docker-ci`, `research`→`user-research`, `styles`→`css-styling`, `design-critique`→`design-review` (todos con `-roy`).

## Datos

Sin datos nuevos. El validador exige `name` = carpeta y kebab-case terminado en `-roy` (`scripts/validate-skills.mjs:77-78`) y avisa si falta `fires-<skill>` (`:156`).

## Plan

- [x] **Fase 1 — Línea base y estado actual** (S1, S2): confirmar los 11 renombres. Verificación: `git diff -M --summary` → 11 renames de carpeta de skill y 12 de casos evals (11 más `fires-plan-feature-roy-natural`); bucle de `name:` = carpeta → sin salida.
- [x] **Fase 2 — Cerrar huecos** (S2): revisar `skills/browser-test-roy/SKILL.md:46` (`.playwright-mcp/e2e-<...>`) y cualquier mención en prosa de `/hu`, `RDD`, `e2e` que describa el nombre viejo de una skill; corregir solo lo que nombre una skill. Verificación: `grep` de los 11 nombres viejos con `-roy` fuera de `specs/` y excluyendo los nuevos → 0 resultados.
- [x] **Fase 3 — Prueba de regresión permanente** (S3): en `scripts/validate-skills.mjs` añadir `checkSkillReferences()`: todo token `[a-z0-9-]+-roy` en `README.md`, `rules/`, `docs/`, `agents/`, `skills/**/*.md`, `evals/**/*.md` debe ser una carpeta de `skills/` o, con prefijo `fires-`, un caso de `evals/`; si no, error. Reutiliza `skillDirs` y `mdFiles` ya existentes. Opción `--repo <ruta>` para probarla en un directorio temporal. Verificación: la prueba pasa en el repo y falla en un directorio temporal con un `.md` que contiene `hu-roy`.
- [x] **Fase 4 — Batería de regresión** (S3): `node scripts/validate-skills.mjs --evals evals --expect-evals <n>` (n = casos válidos actuales: 26 fires más 4 safety, a confirmar al ejecutarlo); `node scripts/test-secrets-hook.mjs`; `grep` final de nombres viejos. Verificación: validador `OK (25 skills checked)` sin errores, hook de secretos pasa todos los casos.
- [x] **Fase 5 — Cierre** (S3): `Riesgo:` explícito, revisión `regression-review-roy` (aún `rdd-roy` en la caché instalada 0.18.0) de todo el diff, guardar decisión en Engram. Nada se hace stage ni commit.

## Criterios de aceptación

- [x] Existen las 11 carpetas nuevas en `skills/` y ninguna con el nombre viejo.
- [x] Cada `SKILL.md` tiene `name:` igual a su carpeta y termina en `-roy`.
- [x] `node scripts/validate-skills.mjs --evals evals` sale con código 0.
- [x] La nueva comprobación falla cuando se le da una referencia inexistente (probado con un directorio temporal).
- [x] `node scripts/test-secrets-hook.mjs` pasa completo.
- [x] Cero menciones de los 11 nombres viejos con `-roy` fuera de `specs/`.
- [x] `git status` muestra los cambios sin stage y sin commit.

## Decisiones

- **Tomada:** conservar el sufijo `-roy` — permite escribir el nombre corto (`/commit-roy`) sin chocar con otros plugins ni con skills nativas.
- **Tomada:** sin alias para los nombres viejos — elección del usuario; el plugin lo usa casi solo él.
- **Tomada:** regresión sin coste (validador, hook, comprobación nueva) — elección del usuario.
- **Tomada:** sin subir versión ni release en este spec — elección del usuario.
- **Descartada:** carpetas puente con el nombre viejo — añaden 11 skills a mantener.
- **Descartada:** editar `specs/01..03` — son registro histórico.

## Riesgos

- Quien tenga instalada la 0.18.0 sigue con los nombres viejos hasta actualizar o recargar plugins; al actualizar dejan de funcionar `/hu-roy`, `/rdd-roy`, `/e2e-roy`, `/spec-roy` y los demás renombrados.
- Memorias de Engram y la caché del plugin mencionan nombres viejos; son contexto, no verdad, y no se editan.
- `specs/01..03` conservan nombres viejos a propósito: un `grep` ingenuo los mostrará.
- El reemplazo masivo con `perl` pudo tocar texto que no era el nombre de una skill; lo acota la comprobación simétrica 117/117 y la revisión de la Fase 5.
- Git avisa del cambio de saltos de línea LF → CRLF en el próximo toque; no altera el contenido.

## Registro

- **L1 · 2026-11-09** — "las skill tienen nombres un poco tecnicos o confusos incluso para mi ejempo hu, spect, e2e, rdd son terminos que quizas podemos standarizar a los nombres normales en ingles que se usa dame un atbala de sugerencias de camabios de nombres para esos y todos en general para ver cuales cambio y cuales no".
- **Base** — rama `dev`, árbol limpio al inicio de la sesión (`eed9ca6`); renombres aplicados después y aún sin stage.
- 2026-11-09 — "solo cambiaria de tu sugerencia esta del resto si me gustan las demas inclluso las opcionales y todas termianndo con el -roy para lo que sugeeriste de no pisaarse con otra"; luego "hazlo con plan spect para que no falte nada y hazlo con teest de regresion". Respuestas: sin alias, solo regresión sin coste, sin release.
- **Evidencia · 2026-11-09** — Fase 1: 11 carpetas de skills y 12 de evals nuevas, ninguna vieja, `name:` = carpeta. Fase 2: los nombres viejos con `-roy` fuera de `specs/` dan 0; `.playwright-mcp/e2e-` se deja (carpeta de salida, no skill). Fase 3: `checkSkillReferences` añadida; prueba negativa en directorio temporal detecta `hu-roy` y `fires-rdd-roy`. Hallazgo real: los nombres nuevos subieron las reglas a 9006 de 9000 caracteres; se acortó una frase de `rules/behavior.md`. Fase 4: `validate-skills --evals evals --expect-evals 30` → `OK (25 skills checked)`; `test-secrets-hook` → 21 de 21. Fase 5: revisión `rdd-roy` → PASS con 5 avisos (cosméticos o de alcance); corregido el artículo "an `regression-review-roy`". Nada en stage ni commit.
- 2026-11-09 — "Sí, Implementado": el usuario confirma el cierre; estado cambiado a Implementado.
