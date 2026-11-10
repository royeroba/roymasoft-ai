# Manual de uso

Cómo trabajar día a día con `roymasoft-ai`. Si todavía no lo tienes, empieza por [instalacion.md](instalacion.md). Para saber qué hace cada skill, ve a [skills.md](skills.md).

## Qué es

Un plugin de Claude Code que añade cuatro cosas, sin que tengas que configurarlas:

- **Reglas de trabajo** que se inyectan en cada sesión (`rules/behavior.md`): cómo investigar, cambiar, probar y cerrar.
- **Skills** (27, todas terminan en `-roy`): flujos y guías para tareas concretas.
- **Hooks** que piden tu confirmación en lo delicado: commits, secretos y editar sin investigar antes.
- **Memoria (Engram) y mapa del código (CodeGraph)** para no empezar de cero en cada sesión.

## Cómo pedir las cosas

Hay dos formas, y valen las dos:

1. **En lenguaje natural.** "haz commit", "revisa el ticket ABC-123", "pruébalo en el navegador". Claude elige la skill que encaja.
2. **Con el nombre de la skill.** Escribe `/roymasoft-ai:commit-roy` (nombre completo) o empieza a escribir `/` y elige de la lista.

Responde siempre en español, corto y al grano (`rules/behavior.md:3`).

## Los dos carriles de trabajo

Al recibir un cambio, Claude lo clasifica (`rules/behavior.md:12`):

| Carril | Cuándo | Qué hace |
|---|---|---|
| **Pequeño** | Se entiende, el riesgo es contenido y se puede retomar desde tu petición y `git diff` | Lo hace y te enseña el diff |
| **Grande** | Varias sesiones, depende de algo externo o tiene entregables separados | Propone un spec en una línea y espera. Con `/roymasoft-ai:plan-feature-roy` entra en modo plan, te pregunta, te presenta el plan para aprobar, lo guarda en `specs/NN-nombre.md` y lo implementa por fases: tú dices "continuar" entre fase y fase |

Si pides planear ("planea", "modo plan", "haz un spec"), va directo al carril grande.

## Un flujo típico, de punta a punta

1. Llega un ticket: `/roymasoft-ai:implement-ticket-roy` (lee el ticket de Jira con `read-ticket-roy` y el Figma con `read-figma-roy` si los hay).
2. Se hace el cambio con la guía de su dominio (tests, seguridad, estilos, TypeScript... ver [skills.md](skills.md)).
3. Cierra con `Riesgo: <ítem>` o `Riesgo: ninguno` y con lo que no se verificó (`rules/behavior.md:15`). Si tocó código de riesgo alto o fue una feature grande, una revisión fresca con `regression-review-roy`.
4. Si tiene interfaz, te ofrece probarlo en el navegador (`browser-test-roy`) y, si pasó todo y hay clave de Jira, dejar la evidencia en el ticket (`ticket-evidence-roy`).
5. Cuando tú lo pides: `commit-roy` y luego `create-pr-roy`.

## Lo que te va a pedir confirmación

| Qué | Por qué |
|---|---|
| `git add`, `git commit`, `git stage` | Nunca commitea por su cuenta: solo si lo pides, con `commit-roy` (`rules/behavior.md:7`). Un hook lo confirma en pantalla |
| Escribir un archivo con un secreto evidente | El hook de secretos avisa antes de dejarlo en el código |
| Editar código sin haber consultado antes memoria y mapa del código | El hook pide respetar el orden: memoria, CodeGraph, búsqueda y lectura (`rules/behavior.md:19`) |
| Publicar fuera de tu máquina (comentario en Jira, Pull Request, borradores en Notion o Drive) | Cada skill muestra el contenido y espera tu "sí" |
| Actualizar el plugin | `update-plugin-roy` te muestra las versiones y pregunta primero |

Los commits, PRs y merges salen **sin firma de IA** (`rules/behavior.md:7`).

## Cómo trabaja: evidencia, no suposiciones

- Investigar, explicar o revisar es **solo lectura**: no edita nada hasta que lo pides (`rules/behavior.md:10`).
- Si algo no queda claro, no avanza: dice "No lo sé", "No puedo hacerlo" o "No me queda claro X" con opciones cerradas (`rules/behavior.md:21`).
- Cita `archivo:línea` o la salida real de un comando; no da por hecho que algo funciona sin haberlo ejecutado.
- Con un stack de pruebas, hace TDD: ve fallar el test por la razón correcta y luego pasar (`rules/behavior.md:14`).
- Antes de usar la API de una librería, consulta su documentación vigente (`rules/behavior.md:23`).

## Memoria y mapa del código

- **Engram** guarda decisiones, bugs corregidos y hallazgos de cada sesión, y los recupera en la siguiente. No tienes que pedirlo; si quieres consultar algo, pregúntalo: "¿qué decidimos sobre X?".
- **CodeGraph** indexa el proyecto para responder "cómo funciona X" o "qué se rompe si cambio Y" sin leer decenas de archivos. La primera vez en un proyecto crea una carpeta `.codegraph/`.
- La memoria es contexto, no verdad: si discrepa del código, gana el código (`rules/behavior.md:19`).

## Qué pedir para cada necesidad

| Quiero... | Pídelo así |
|---|---|
| Implementar un ticket o arreglar un bug | "implementa el ticket ABC-123" |
| Una feature grande con plan | "planea esta feature" |
| Probar en el navegador | "pruébalo en el navegador" |
| Dejar evidencia en Jira | "deja la evidencia en el ticket" |
| Hacer commit | "haz commit" |
| Abrir el PR | "crea el PR" |
| Revisar que no rompimos nada | "haz el regression review" |
| Mi daily | "dame mi update para el daily" |
| Saber si hay versión nueva | "busca actualizaciones del plugin" |
| Revisar seguridad | "revisa si esto es seguro" |

## Si algo no funciona

- Las skills no aparecen o están viejas: reinicia Claude Code.
- Un aviso de Engram o CodeGraph al iniciar la sesión: trae el comando exacto para repetirlo. Ver [instalacion.md](instalacion.md).
- Quieres saltarte la confirmación de git en una sesión concreta: se lanza Claude Code con la variable `RAI_ALLOW_GIT_WRITE=1` (úsalo con cuidado).
- Actualizar el plugin: [actualizacion.md](actualizacion.md).
