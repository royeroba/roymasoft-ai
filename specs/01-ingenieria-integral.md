# SPEC 01 — Skills y reglas de ingeniería integral (8 skills)

> **Estado:** Aprobado
> **Depende de:** ninguno
> **Fecha:** 2026-10-06
> **Objetivo:** Añadir al plugin 8 skills (testing, security, typescript, database, frontend, backend, performance, delivery) con checklists verificables, una regla mínima de enrutado, un hook de secretos y evals, basados solo en fuentes oficiales ya verificadas.

## Alcance

**Entra:**
- 8 skills nuevas, cada una `skills/<nombre>-roy/` con `SKILL.md` (despachador) + `references/` + `references/checklist.md`.
- Validador local `scripts/validate-skills.mjs` (comprueba las reglas objetivas de cada skill).
- Regla de enrutado y disparadores de seguridad en `rules/behavior.md` (≤ 10 líneas).
- Integración con la revisión: `rdd-roy` pasa los checklists de los dominios tocados y `agents/reviewer.md` los lee.
- Hook de secretos (`ask`, fail-open) y 3 casos de evals por skill (24).
- Subir versión por fase y actualizar `docs/diseno-flujos.md`.

**No entra (otro spec):**
- Runner de evals (`claude plugin eval`).
- MySQL, SQL Server, ORMs, GraphQL, colas, estrategia de caché, JWT/OAuth y privacidad (sin fuente oficial leída).
- Playbooks de migraciones sin downtime de fuentes no oficiales (solo los principios oficiales de PostgreSQL).
- Copiar guías de estilo completas: las skills usan el linter, `tsconfig` y la configuración del repo.
- Cambios a las 10 skills existentes, salvo `rdd-roy` (checklists).

## Specs

- **S1.** "la idea es que se adepte a los distintos repos que tengo donde no solo hay fornto tamb hay back yambn hay seguridad y la idea es que sea un plugin lo mas integral posible para hacer sistemas de software profesionales, robustos, seguros y con buen performance" — Cada skill detecta el stack y la versión del repo (no los supone) y cubre front, back, seguridad y performance.
- **S2.** "buenas practicas, manejo y skill, reglas de como usar hacer test tanto para backend como para frontend en web yo uso el ecositema javascript como vue, react, node, pero indepdneite del stack es las buenas practicas y metodoligias, para test, para escritura de codigo, lineamientos de codigo, typescrit, rendimiento, seguridad, performance, tanto en front como back" — `testing-roy`, `typescript-roy`, `security-roy`, `performance-roy`, `frontend-roy` y `backend-roy`; ejemplos en Vue, React y Node, principios independientes del stack.
- **S3.** "haz un doble chek en la fuente y revisa la inromacion untyal que necesitas y los huecos pendientes y de base de datos tano sql como nosql" — Todo contenido cita su fuente oficial verificada; `database-roy` cubre SQL y NoSQL; huecos cubiertos: API, observabilidad, accesibilidad, Docker y CI.
- **S4.** "ahi si hacemos el plan de las skill faltntes y reglas fantaes o todo lo flante en ese aspecto" — Además de las skills: regla de enrutado, checklists para la revisión, hook de secretos y evals.
- **S5.** "hazlo con spec-roy, las 8 skills" — Las 8: `testing-roy`, `security-roy`, `typescript-roy`, `database-roy`, `frontend-roy`, `backend-roy`, `performance-roy`, `delivery-roy`, ejecutadas con este spec.
- **S6.** "quiero que sea en ingles para que sea mejor precision todo incluido las frases para disparar la skill y quiero que al final se agregue el -roy" — Convención: nombre terminado en `-roy`, todo en inglés incluidas las frases de disparo.

## Datos

Estructura de cada skill (patrón de `styles-roy`, ya validado en este repo):

```
skills/<nombre>-roy/
  SKILL.md                 despachador: detectar stack y versión, tabla de enrutado, reglas comunes, ejemplo correcto/incorrecto
  references/<tema>.md     una página por tema, cada sección con su línea "Source: <URL oficial>"
  references/checklist.md  lista verificable (la usan el agente al escribir y el reviewer al revisar)
```

Contenido por skill (todo verificado en la investigación, Engram #242):

| Skill | Referencias |
|---|---|
| `testing-roy` | `strategy`, `frontend`, `backend`, `checklist` |
| `security-roy` | `owasp-top10`, `api`, `node-express`, `frontend`, `supply-chain`, `asvs`, `checklist` |
| `typescript-roy` | `tsconfig`, `style`, `checklist` |
| `database-roy` | `sql`, `migrations`, `mongodb`, `dynamodb`, `redis`, `checklist` |
| `frontend-roy` | `react`, `vue`, `accessibility`, `performance`, `checklist` |
| `backend-roy` | `api-design`, `node-runtime`, `observability`, `checklist` |
| `performance-roy` | delgada: flujo "medir antes de optimizar" + `checklist`; enlaza a las referencias de las otras |
| `delivery-roy` | `docker`, `ci`, `checklist` |

Reglas de diseño: sin versiones ni proporciones fijas (pirámide solo como forma; Google da 80/15/5 y 70/20/10); `SKILL.md` < 200 líneas; cada referencia ≤ 100 líneas; referencias a un solo nivel; descripción ≤ 1.024 caracteres, tercera persona.

Archivos tocados fuera de las skills: `rules/behavior.md`, `skills/rdd-roy/SKILL.md`, `agents/reviewer.md`, `hooks/hooks.json`, `hooks/pretooluse-secrets.mjs` (nuevo), `evals/cases.jsonl`, `docs/diseno-flujos.md`, `.claude-plugin/plugin.json` y `marketplace.json`.

## Plan

Cada fase deja el plugin funcionando, sube versión y se detiene para tu revisión.

- [x] **Fase 1 — Fundación, testing y security** (S1, S2, S4, S6): `scripts/validate-skills.mjs`; `testing-roy` y `security-roy`; párrafo "Dominios" en `rules/behavior.md` (enrutado a las 8 skills + disparadores de seguridad: autenticación, autorización, entradas, consultas, secretos, subidas, dependencias); `rdd-roy` pasa los checklists de los dominios tocados y `reviewer.md` los lee; 6 casos de evals; versión 0.9.0. Verificación: `node scripts/validate-skills.mjs` → OK; `claude plugin validate .` → pasa; `wc -c rules/behavior.md` → ≤ 8.000 bytes (base 6.384); `python -c` que parsea `evals/cases.jsonl` → 18 casos válidos.
- [ ] **Fase 2 — TypeScript y bases de datos** (S2, S3): `typescript-roy` y `database-roy` (PostgreSQL, MongoDB, DynamoDB y Redis; migraciones solo con principios oficiales); 6 casos de evals; versión 0.10.0. Verificación: validador OK, `claude plugin validate .` pasa, 24 casos de evals válidos.
- [ ] **Fase 3 — Frontend, backend y performance** (S1, S2, S3): `frontend-roy` (React, Vue, accesibilidad WCAG 2.2 AA, rendimiento de front; los estilos siguen en `styles-roy`), `backend-roy` (API, runtime de Node, observabilidad) y `performance-roy` (delgada); 9 casos de evals; versión 0.11.0. Verificación: validador OK, `claude plugin validate .` pasa, 33 casos válidos.
- [ ] **Fase 4 — Delivery, hook de secretos y cierre** (S3, S4): `delivery-roy` (Docker, CI, GitHub Actions); `hooks/pretooluse-secrets.mjs` (`ask` ante formatos de secreto evidentes en Write/Edit, con excepción de archivos `.example`, fail-open) y su entrada en `hooks.json`; 3 casos de evals; actualizar `docs/diseno-flujos.md` y la tabla de enrutado; versión 0.12.0; `claude plugin update` y reinicio. Verificación: el hook con 4 payloads (secreto → `ask`; limpio → silencio; `.env.example` → silencio; `RAI_ALLOW_GIT_WRITE`-estilo bypass `RAI_ALLOW_SECRETS=1` → silencio); validador OK; 36 casos de evals válidos.

## Criterios de aceptación

- [ ] Las 8 carpetas `skills/<nombre>-roy/` existen, cada una con `SKILL.md`, `references/` y `references/checklist.md` (validador).
- [ ] Nombre = carpeta, en kebab-case y terminado en `-roy`; descripción ≤ 1.024 caracteres en tercera persona con frases de disparo en inglés (validador).
- [ ] `SKILL.md` < 200 líneas y cada referencia ≤ 100 líneas, a un solo nivel (validador).
- [ ] Cada sección de referencia con dato verificable cita su fuente oficial con URL (validador exige la línea `Source:`).
- [ ] Sin texto en español en las skills (validador) y sin versiones ni proporciones fijas fuera de ejemplos citados.
- [ ] Cada skill detecta stack y versión antes de aplicar y consulta Context7 para esa versión (revisión del `SKILL.md`).
- [ ] `rules/behavior.md` ≤ 8.000 bytes y enruta a las 8 skills; el hook de secretos responde como se espera con los 4 payloads.
- [ ] `evals/cases.jsonl` con 36 casos válidos (12 existentes + 3 por skill).
- [ ] `claude plugin validate .` pasa al cerrar cada fase; versión final 0.12.0 instalada y reiniciada.
- [ ] Cada fase cerrada con `Riesgo:`, lo no verificado y revisión `rdd-roy` (el hook de secretos es código).

## Decisiones

- **Tomada:** un solo spec con 4 fases A–D — mismo formato en todas, solo texto, cada fase deja el plugin funcionando (tu respuesta: "Un spec, 4 fases A–D").
- **Tomada:** bases de datos PostgreSQL, MongoDB, DynamoDB y Redis — son las verificadas con docs oficiales (tu respuesta).
- **Tomada:** ASVS L2 por defecto y L1 como mínimo — L2 es el recomendado para la mayoría de aplicaciones (tu respuesta).
- **Tomada:** hook de secretos y 3 evals por skill entran; el runner no (tu respuesta).
- **Tomada:** migraciones sin downtime solo con los principios oficiales de PostgreSQL (bloqueo `ACCESS EXCLUSIVE`, transacciones largas, `CREATE INDEX CONCURRENTLY`) — no hay fuente oficial de playbooks.
- **Tomada:** validador local `scripts/validate-skills.mjs` — Anthropic recomienda scripts para operaciones deterministas; hace verificables los criterios.
- **Tomada:** `performance-roy` delgada que enlaza a las referencias de las otras — evita duplicar y cumple "enlazar, no copiar".
- **Tomada:** `uncaughtException` en `backend-roy` = registrar, limpiar y salir, nunca reanudar (Node oficial).
- **Descartada:** dividir en dos o en ocho specs — más papeleo sin beneficio para skills con la misma estructura.
- **Descartada:** fijar la proporción de la pirámide de tests — dos fuentes de Google difieren (80/15/5 y 70/20/10); se fija solo la forma.
- **Descartada:** prescribir Alpine en Docker — la guía oficial de Node avisa que exige herramientas de compilación para módulos nativos.

## Riesgos

- Reglas siempre cargadas que crecen: se acota con ≤ 10 líneas y un tope de bytes verificado en cada fase.
- 18 skills (10 actuales + 8) pueden agotar el presupuesto del listado de descripciones: se mantienen cortas (≤ ~450 caracteres) y se mide con `/doctor`; si desborda, se baja la prioridad con `skillOverrides`.
- Frases de disparo solo en inglés frente a prompts en español: los evals incluyen casos en español para medirlo; si falla, se añade "o su equivalente en español" a las descripciones.
- Contenido que envejece (versiones, listas OWASP): cada referencia cita la fuente y la fecha de verificación; se re-verifica antes de cambiar una regla.
- El hook de secretos puede dar falsos positivos: solo pide confirmación (`ask`), es fail-open y tiene bypass por variable de entorno.
- Sin stack de tests (solo evals sin runner): la verificación es el validador, los payloads del hook y `claude plugin validate`; el disparo real de las skills no se prueba hasta tener el runner o una sesión nueva.

## Log

- **L1 · 2026-10-06** — petición original del usuario: "hazlo con spec-roy, las 8 skills".
- **Base** — `HEAD` 4c7cf439d825621cb4dec83ee409f4602a663df8, árbol limpio; sin stack de tests (12 casos de evals sin runner); `claude plugin validate .` pasa; `rules/behavior.md` 6.384 bytes; 10 skills existentes con descripciones de 321 a 522 caracteres; plugin en 0.8.1.
- 2026-10-06 — respuestas del usuario a las preguntas de la fase 2: "Un spec, 4 fases A–D (Recomendado)", "PostgreSQL, MongoDB, DynamoDB y Redis (Recomendado)", "L2 por defecto, L1 como mínimo (Recomendado)", "Hook de secretos (Recomendado),Evals: 3 casos por skill (Recomendado)".

- 2026-10-06 — el usuario aprobó el plan (ExitPlanMode); estado Aprobado; implementación por fases con pausa.
- 2026-10-06 — Fase 1 hecha (0.9.0). Evidencia: `node scripts/validate-skills.mjs --expect-evals 18` → OK (12 skills), exit 0; `claude plugin validate .` → pasa; `wc -c rules/behavior.md` → 6.792 bytes (límite 8.000); manifiestos en 0.9.0; evals 18 válidos. Validador: RED con fixture inválido (10 errores) y GREEN en el repo real.
- 2026-10-06 — Desviación de la fase 1: el párrafo "Dominios" de `rules/behavior.md` enruta solo a las skills que ya existen (`testing-roy`, `security-roy`, `styles-roy`) para no referenciar skills inexistentes; se amplía en cada fase y el criterio de las 8 se cumple al cierre.
- 2026-10-06 — Revisión `rdd-roy` de la fase 1: primera pasada NO PASA (2 bloqueos del validador: `--evals` inexistente daba OK falso; conteo de skills 13 en lugar de 12 por `.gitkeep`). Corregidos en un lote junto con: encabezados dentro de bloques de código ya no cuentan como secciones, numeración de líneas de evals, raíz inexistente con error limpio y línea `Last verified` obligatoria en las referencias (promesa del spec). Segunda pasada acotada: PASA. Avisos que quedan: etiqueta fija `evals/cases.jsonl` en mensajes de error con `--evals` alternativo; heurísticas débiles de "tercera persona" y "sin español"; frontmatter multilínea no soportado (ninguna skill lo usa).
