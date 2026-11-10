# roymasoft-ai

Plugin de Claude Code con mi forma de trabajar: reglas, 27 skills, hooks de seguridad y un agente revisor. Incluye memoria entre sesiones con Engram y exploración de código con CodeGraph.

Versión actual: 0.20.0 (ver `.claude-plugin/plugin.json`). Licencia: MIT.

## Qué incluye

- **Reglas de trabajo** que se inyectan en cada sesión: investigar sin editar, clasificar el cambio, probar con evidencia y cerrar con el riesgo (`rules/`).
- **27 skills** (todas terminan en `-roy`): desde recibir un ticket hasta abrir el PR, más guías de ingeniería, diseño y mantenimiento.
- **Hooks** que piden tu confirmación en lo delicado: commits, secretos y editar sin investigar antes.
- **Agente `reviewer`**: revisión fresca, sin el contexto de la conversación, que devuelve PASS o FAIL.
- **Engram** (memoria) y **CodeGraph** (mapa del código), que el plugin instala y cablea solo.

## Instalación

Requiere Claude Code, Node.js (con npm) y git. Pasos completos para Windows y Mac en [docs/instalacion.md](docs/instalacion.md).

```bash
claude plugin marketplace add royeroba/roymasoft-ai
```

```bash
claude plugin install roymasoft-ai@roymasoft
```

Reinicia Claude Code. En la primera sesión `hooks/bootstrap.mjs` instala y cablea Engram y CodeGraph si faltan, y desde entonces, una vez al día, sube el binario y el plugin de Engram si hay versión nueva. El plugin en sí no se actualiza solo: usa `/roymasoft-ai:update-plugin-roy` (ver [docs/actualizacion.md](docs/actualizacion.md)).

## Primeros pasos

- Pide las cosas en lenguaje natural ("implementa el ticket ABC-123", "pruébalo en el navegador", "haz commit") o escribe `/` y elige una skill de la lista.
- Para una tarea grande: "planea esta feature". Entra en modo plan, te pregunta, te muestra el plan y lo guarda en `specs/`.
- Nada se commitea ni se publica en Jira o GitHub sin que lo pidas y lo confirmes.

## Documentación

| Manual | Para qué |
|---|---|
| [docs/instalacion.md](docs/instalacion.md) | Instalar en Windows y Mac, requisitos y problemas comunes |
| [docs/uso.md](docs/uso.md) | Uso diario: carriles de trabajo, confirmaciones, memoria y ejemplos |
| [docs/actualizacion.md](docs/actualizacion.md) | Buscar y aplicar versiones nuevas, con `/update-plugin-roy` o a mano |
| [docs/skills.md](docs/skills.md) | Qué hace cada skill, cuándo usarla y cuándo no |
| [docs/diseno-flujos.md](docs/diseno-flujos.md) | Diseño interno de los flujos (para quien mantiene el plugin) |

## Skills (27, todas `-roy`)

| Grupo | Skills |
|---|---|
| Flujo | `implement-ticket-roy` (entrada), `plan-feature-roy` (tareas grandes), `regression-review-roy` (revisión fresca con el agente `reviewer`), `browser-test-roy` (navegador con Playwright o Claude in Chrome) |
| Git y entrega de contexto | `commit-roy`, `create-pr-roy`, `read-ticket-roy` (Jira), `ticket-evidence-roy` (comentario sencillo en Jira con 3 o 4 capturas), `read-figma-roy`, `read-shared-docs-roy` (Notion, Google Drive, Docs y Gmail) |
| Ingeniería | `testing-roy`, `security-roy`, `typescript-roy`, `database-roy`, `frontend-roy`, `backend-roy`, `performance-roy`, `docker-ci-roy`, `seo-roy` (SEO técnico de sitios públicos en Nuxt) |
| Diseño e investigación | `design-review-roy` (crítica de un diseño o de la página construida), `user-research-roy` (planear y sintetizar investigación con usuarios) |
| Mantenimiento y docs | `tech-debt-roy` (auditoría de deuda con prioridad), `write-docs-roy` (README, API, runbooks), `standup-roy` (daily desde git y Jira) |
| Estilos y meta | `css-styling-roy`, `create-skill-roy`, `update-plugin-roy` (revisa y aplica actualizaciones del plugin) |

Cada skill de ingeniería es un despachador corto con `references/` (fuentes oficiales, con fecha de verificación) y un `checklist.md`. El detalle de cada una está en [docs/skills.md](docs/skills.md).

## Hooks

| Hook | Qué hace |
|---|---|
| `bootstrap.mjs` (SessionStart) | Instala, cablea y mantiene al día Engram; instala y cablea CodeGraph; inyecta `rules/` dentro del límite del hook |
| `pretooluse-no-commit.mjs` | Pide confirmación en `git add`, `commit` y `stage` (se omite lanzando Claude Code con `RAI_ALLOW_GIT_WRITE=1`) |
| `pretooluse-search-gate.mjs` | Pide memoria y mapa del código antes del primer edit de código |
| `pretooluse-secrets.mjs` | Pide confirmación ante secretos evidentes en Write, Edit y MultiEdit |

Las reglas juntas no pasan de 9.000 caracteres (lo exige `scripts/validate-skills.mjs`): Claude Code corta la salida de un hook a 10.000 y el modelo vería solo un preview.

## Estructura

```
.claude-plugin/   plugin.json y marketplace.json
.github/          CODEOWNERS y el flujo de CI (validate.yml)
skills/           las 27 skills (+ _shared/ con conectores y verificación comunes)
agents/           reviewer (revisión fresca de regresiones)
hooks/            hooks.json y scripts
rules/            reglas inyectadas en cada sesión
scripts/          validador de skills y pruebas del hook de secretos
evals/            rúbrica y casos de `claude plugin eval`
specs/            specs de trabajos grandes
docs/             manuales de uso y diseño de los flujos
```

## Desarrollo

- Se trabaja en `dev` y los cambios llegan a `master` con un Pull Request (se crea con `create-pr-roy`).
- Al subir de versión, `.claude-plugin/plugin.json` y `.claude-plugin/marketplace.json` deben llevar el mismo número: la CI lo comprueba y falla si no coinciden.
- Una skill nueva necesita su carpeta en `skills/` (nombre en inglés con sufijo `-roy`), su entrada en `docs/skills.md` y un caso `fires-<skill>` en `evals/`. El validador falla si falta la entrada del catálogo y avisa si falta el caso de eval. `create-skill-roy` ayuda a redactar la skill.

## Validación

```bash
claude plugin validate .
node scripts/validate-skills.mjs --expect-evals 35
node scripts/test-secrets-hook.mjs
```

La CI de GitHub (`.github/workflows/validate.yml`) solo valida los dos manifiestos y que sus versiones coincidan; el validador de skills y la prueba del hook se corren en local antes del PR. Los evals (`claude plugin eval`) se corren a mano antes de subir versión (ver `evals/rubric.md`); consumen tokens y no corren en CI.
