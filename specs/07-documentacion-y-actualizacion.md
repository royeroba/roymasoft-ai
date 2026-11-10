# SPEC 07 — Documentación del plugin y skill `update-plugin-roy`

> **Estado:** Implementado
> **Depende de:** SPEC 06 (26 skills y 33 casos de eval)
> **Fecha:** 2026-11-09
> **Objetivo:** Que una persona o un agente que reciba el plugin sepa instalarlo (Windows y Mac), usarlo, actualizarlo con un comando dentro de Claude y entender qué hace cada skill y para qué.

## Contexto

Hoy `docs/` solo tiene `diseno-flujos.md` (diseño interno). La instalación es una línea en `README.md:9` y el catálogo de skills una tabla por grupos. Actualizar es manual: no hay skill ni comando que lo haga; el bootstrap solo sube Engram.

Comprobado en esta máquina con `claude plugin ... --help`:
- `claude plugin marketplace add <fuente>` y `claude plugin install roymasoft-ai@roymasoft` instalan.
- `claude plugin marketplace update roymasoft` refresca el marketplace; `claude plugin update roymasoft-ai@roymasoft` actualiza (pide reiniciar Claude Code).
- `claude plugin list --json` da `id` y `version` instaladas (hoy `roymasoft-ai@roymasoft` 0.19.0).
- `claude plugin marketplace list --json` da el `installLocation` del marketplace, donde `.claude-plugin/marketplace.json` trae la versión disponible tras refrescar.
- `claude plugin list --json --available` no lista los plugins ya instalados, por eso la versión disponible se lee del marketplace.

El bootstrap (`hooks/bootstrap.mjs`) instala Engram en `%LOCALAPPDATA%\engram\bin` (Windows) o `~/.local/bin` (Mac y Linux) y CodeGraph con npm; usa Go solo como respaldo.

## Alcance

**Dentro:**
- `docs/instalacion.md`: requisitos, Windows, Mac, verificación y problemas conocidos.
- `docs/actualizacion.md`: cómo actualizar con `/update-plugin-roy` y a mano.
- `docs/uso.md`: uso diario (carriles pequeño y grande, memoria, reglas de git, ejemplos de peticiones).
- `docs/skills.md`: las 27 skills, cada una con qué hace, cuándo usarla, cuándo no y un ejemplo; sirve a una persona y a un agente.
- Skill nuevo `skills/update-plugin-roy/SKILL.md` (inglés, menos de 200 líneas).
- Chequeo en `scripts/validate-skills.mjs`: falla si una carpeta de skill no aparece en `docs/skills.md`.
- Casos de eval: 1 de disparo y 1 de seguridad; recuentos a 27 skills y 35 casos.
- Enlaces desde `README.md`.

**Fuera (otro spec):**
- Versión en inglés de los manuales.
- Subir versión, release, commit y PR (el skill de actualización solo ve versiones ya publicadas).
- Instalación en Linux como manual propio.
- Cambiar el bootstrap, Engram o CodeGraph.
- Catálogo generado por script.

## Specs

- **S1.** "hay doc como tal en una caroppeta que diga doc o instal here que tenga manual de uso de este plugin" — carpeta `docs/` con un manual de uso.
- **S2.** "manual de instalacion en windows y mac" — manual de instalación con sección para Windows y para Mac.
- **S3.** "manual de actualizacion para que el que lo use en este caso calude escriba un comando y busque si el plugin tiene actualizaciones y se actualice?" — manual de actualización y un comando (skill) que busque la versión nueva y actualice.
- **S4.** "manual de skill que hace cada una para que un agente y un huamno sepa que hacer y para que" — catálogo de cada skill: qué hace, para qué y cuándo usarla, legible por una persona y por un agente.
- **S5.** "si planelo con /roymasoft-ai:plan-feature-roy" — planeado con spec y fases.

## Datos

Sin datos persistentes. Estructura de cada skill en `docs/skills.md`: nombre, qué hace (una frase), cuándo usarla, cuándo no, ejemplo de petición, y qué devuelve. Los nombres de carpeta de `skills/` son la fuente: el validador los cruza con el catálogo.

## Plan

Cada fase deja el plugin funcionando.

- [x] **Fase 1 — Catálogo de skills y chequeo** (S4): crear `docs/skills.md` con las 26 skills actuales y añadir a `scripts/validate-skills.mjs` el chequeo de "toda carpeta de skill aparece en `docs/skills.md`". Verificación: `node scripts/validate-skills.mjs --expect-evals 33` → OK; con una copia temporal del repo a la que se le quita una skill del catálogo y `--repo <copia>` → error esperado.
- [x] **Fase 2 — Manual de instalación** (S2): crear `docs/instalacion.md` con requisitos (Claude Code, Node, git; npm para CodeGraph; Go opcional), pasos para Windows y para Mac, qué instala el bootstrap y dónde, cómo verificar (`claude plugin list`, reinicio) y problemas conocidos (PATH, bloqueo de aplicaciones en Windows). Verificación: cada comando citado existe en `claude plugin --help`; las rutas coinciden con `hooks/bootstrap.mjs`.
- [x] **Fase 3 — Actualización: skill y manual** (S3): crear `skills/update-plugin-roy/SKILL.md` (versión instalada con `claude plugin list --json` → refrescar con `claude plugin marketplace update roymasoft` → versión disponible desde el `marketplace.json` del `installLocation` → comparar → con el sí del usuario `claude plugin update roymasoft-ai@roymasoft` → verificar con `list --json` → pedir reiniciar). Crear `docs/actualizacion.md`, añadir el skill al catálogo, `evals/fires-update-plugin-roy/` y `evals/safety-update-plugin-needs-yes/`, y subir recuentos (README y `evals/rubric.md`: 27 skills, 35 casos). Verificación: `node scripts/validate-skills.mjs --expect-evals 35` → OK; `claude plugin list --json` y la lectura del `marketplace.json` dan la versión que el skill compara (hoy iguales: "al día").
- [x] **Fase 4 — Manual de uso** (S1): crear `docs/uso.md` con el recorrido diario: carril pequeño y grande, cuándo pide confirmación, memoria, reglas de git, ejemplos de peticiones y qué esperar. Verificación: lo que afirma coincide con `rules/behavior.md` y `README.md` (se cita archivo y línea).
- [x] **Fase 5 — Índice y regresión** (S1, S2, S3, S4): índice de manuales en `README.md` enlazando los 4; comprobar que todos los enlaces relativos existen. Regresión: `claude plugin validate .`, `node scripts/test-secrets-hook.mjs`, validador con `--expect-evals 35`, y revisión fresca con `regression-review-roy`. Verificación: todos pasan.

## Criterios de aceptación

- [x] Existen `docs/instalacion.md`, `docs/actualizacion.md`, `docs/uso.md` y `docs/skills.md`, en español, enlazados desde `README.md`.
- [x] `docs/instalacion.md` tiene pasos separados para Windows y Mac y solo cita comandos que existen en `claude plugin --help`.
- [x] `/update-plugin-roy` compara la versión instalada con la del marketplace refrescado, dice si hay una nueva y solo actualiza tras un sí explícito.
- [x] Tras actualizar, el skill pide reiniciar Claude Code y verifica la versión leyendo `claude plugin list --json`.
- [x] `docs/skills.md` describe las 27 skills (qué hace, cuándo usarla, cuándo no, ejemplo) y el validador falla si falta una.
- [x] `node scripts/validate-skills.mjs --expect-evals 35`, `claude plugin validate .` y `node scripts/test-secrets-hook.mjs` pasan.
- [x] La revisión fresca da PASS.

## Decisiones

- **Tomada:** manuales en español — igual que `README.md` y `docs/diseno-flujos.md`; nombres de skills y comandos en inglés.
- **Tomada:** `docs/` plano con 4 manuales — es lo que pediste ("carpeta que diga doc") y deja `diseno-flujos.md` como diseño interno.
- **Tomada:** skill `update-plugin-roy` para actualizar — un comando dentro de Claude; actualiza solo con tu sí porque cambia tu instalación.
- **Tomada:** versión disponible leída del `marketplace.json` refrescado — `list --available` no incluye los plugins ya instalados.
- **Tomada:** catálogo escrito a mano más chequeo del validador — lenguaje claro para personas y sin desfase.
- **Descartada:** catálogo generado por script — saldría con el texto técnico de las descripciones.
- **Descartada:** solo documentar los comandos — pediste que Claude lo haga con un comando.

## Riesgos

- Actualizar cambia la instalación del usuario y requiere reiniciar Claude Code: siempre con sí explícito.
- Los pasos de Mac se escriben a partir del código del bootstrap y de la ayuda del CLI; no se probaron en un Mac.
- El skill necesita el CLI `claude` en el PATH; si no está, entrega los dos comandos para correrlos en una terminal.
- Sin red o con el marketplace no añadido, el refresco falla: el skill lo dice y da el comando de instalación, sin inventar una versión.
- El skill de actualización solo existe en las instalaciones que ya tengan la versión con él: quien tenga una anterior debe actualizar una vez a mano (lo explica `docs/actualizacion.md`).
- Los evals de pago no se corren sin tu ok de gasto.

## Registro

- **L1 · 2026-11-09** — "ok pregunta hay skill de ciberseguridad hablo de proteger lo quue haga la app en general de ataques maliciosos vulnerabilidades injecciones peligrosas etc?" (preguntado antes; el spec nace de la siguiente).
- **L2 · 2026-11-09** — "no ya dejalo asi, ahoa pregunta hay doc como tal en una caroppeta que diga doc o instal here que tenga manual de uso de este plugin, manual de instalacion en windows y mac, manual de actualizacion para que el que lo use en este caso calude escriba un comando y busque si el plugin tiene actualizaciones y se actualice? manual de skill que hace cada una para que un agente y un huamno sepa que hacer y para que"
- **L3 · 2026-11-09** — "si planelo con /roymasoft-ai:plan-feature-roy"
- **Base** — `HEAD` 02c596e en `dev`, árbol limpio; validador `OK (26 skills checked)`; 33 casos de eval; plugin instalado `roymasoft-ai@roymasoft` 0.19.0 y marketplace en 0.19.0.
- 2026-11-09 — respuestas del usuario: español; skill nuevo `update-plugin-roy`; catálogo a mano con chequeo en el validador; `docs/` con 4 manuales.
- 2026-11-09 · Fase 1 — creado `docs/skills.md` (173 líneas, 26 skills con qué hace, cuándo usarla, cuándo no y ejemplo) y añadido `checkCatalog()` a `scripts/validate-skills.mjs` (cada carpeta de skill debe tener su encabezado de tercer nivel con el nombre entre comillas invertidas; se omite si `--root` no es el `skills/` del repo). Evidencia: `node scripts/validate-skills.mjs --expect-evals 33` → `OK (26 skills checked)`; copia temporal sin el encabezado de `seo-roy` y con `--root`/`--repo` apuntando a la copia → `error docs/skills.md: skill seo-roy has no "### ..." heading in the catalog` (1 error). Copia temporal borrada.
- 2026-11-09 · Fase 2 — creado `docs/instalacion.md`: requisitos, instalación común, secciones Windows y Mac, qué hace el bootstrap en la primera sesión, verificación, desinstalación y problemas comunes. Evidencia: los comandos `claude plugin marketplace add/remove`, `install`, `uninstall`, `list` existen en la ayuda del CLI (2.1.316) y `engram version` (3.7.0) y `codegraph --version` (1.6.2) responden; las rutas (`%LOCALAPPDATA%\engram\bin`, `~/.local/bin`), el plazo de 300 s y los comandos de CodeGraph coinciden con `hooks/bootstrap.mjs`, `hooks/hooks.json` y `hooks/codegraph.mjs`; el repositorio es público (`gh repo view`). Dos imprecisiones corregidas tras contrastar con la salida real: `claude plugin list` muestra `Status: ✔ enabled` (no `enabled: true`) y el comportamiento de `engram.exe` en uso es renombrar a `.old` y copiar el nuevo. Validador `OK (26 skills checked)`. Pasos de Mac no probados en un Mac.
- 2026-11-09 · Fase 3 — creados `skills/update-plugin-roy/SKILL.md` (86 líneas), `docs/actualizacion.md`, `evals/fires-update-plugin-roy/` y `evals/safety-update-plugin-needs-yes/`; añadida la entrada al catálogo `docs/skills.md`; recuentos a 27 skills y 35 casos en `README.md` y `evals/rubric.md` (27 de disparo, 1 en español y 7 de seguridad). Evidencia: `node scripts/validate-skills.mjs --expect-evals 35` → `OK (27 skills checked)`. Ensayo en seco de los pasos de lectura del skill (sin refrescar ni actualizar): `claude plugin list --json` → `roymasoft-ai@roymasoft` 0.19.0 scope user; `claude plugin marketplace list --json` → `installLocation` de `roymasoft`; `.claude-plugin/marketplace.json` → 0.19.0 publicada; comparación numérica `0.9.0 < 0.19.0` correcta (-1), iguales 0, mayor 1. Hoy iguales: "al día". No se ejecutó `marketplace update` ni `plugin update`, ni los evals de pago.
- 2026-11-09 · Fase 4 — creado `docs/uso.md`: qué es el plugin, cómo pedir las cosas, los dos carriles, un flujo típico de punta a punta, qué pide confirmación (hooks y publicaciones), cómo trabaja (evidencia, solo lectura, TDD), memoria y mapa del código, tabla "quiero... / pídelo así" y problemas. Evidencia: cada afirmación de reglas cita `rules/behavior.md` con su línea (3, 7, 10, 12, 14, 15, 19, 21, 23) y se comprobó el texto de esas líneas; `RAI_ALLOW_GIT_WRITE=1` figura en `hooks/pretooluse-no-commit.mjs:10` y `:66`; los tres enlaces relativos (`instalacion.md`, `actualizacion.md`, `skills.md`) existen; validador `OK (27 skills checked)`.
- 2026-11-09 · Fase 5 — añadida la sección "Documentación" al `README.md` con los 4 manuales y `diseno-flujos.md`. Regresión: 14 enlaces relativos de `README.md` y `docs/` comprobados, 0 rotos; `node scripts/validate-skills.mjs --expect-evals 35` → `OK (27 skills checked)`; `claude plugin validate .` → Validation passed; `node scripts/test-secrets-hook.mjs` → all 21 passed; `read-ticket-roy` sigue siendo solo lectura. Revisión fresca lanzada (resultado en la siguiente entrada). Evals de pago no ejecutados.
- 2026-11-09 · Revisión fresca (reviewer): PASS con 2 advertencias menores sin cambios (pasos de Mac sin probar en un Mac; evals de `update-plugin-roy` sin `Bash`, por diseño). Tras la revisión y a petición del usuario ("aunno esta del todo actualizada este doc ... README.md ... es muy viejo") se reescribió `README.md` (qué incluye, instalación real, primeros pasos, estructura con `.github/`, desarrollo y validación; 8 enlaces sin romper, validador `OK (27 skills checked)`); el README reescrito no pasó por la revisión fresca.
- 2026-11-09 — el usuario aprobó el cierre ("Sí, marcar"); estado cambiado a Implementado y criterios de aceptación marcados (validador, `claude plugin validate .`, hook de secretos y revisión fresca; no se probaron una actualización real, los pasos de Mac ni los evals de pago).
