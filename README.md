# roymasoft-ai

Plugin de Claude Code con mi harness de IA: reglas de trabajo, flujos (HU, spec, TDD, RDD, E2E), skills de ingeniería y hooks de seguridad. Memoria con Engram y exploración de código con CodeGraph.

## Instalación

```bash
claude plugin marketplace add <ruta-o-repo>
claude plugin install roymasoft-ai@roymasoft
```

La primera sesión corre `hooks/bootstrap.mjs`: instala y cablea Engram y CodeGraph si faltan, e inyecta las reglas. Después de instalar o subir de versión, reinicia Claude Code.

## Skills (19, todas `-roy`)

| Grupo | Skills |
|---|---|
| Flujo | `hu-roy` (entrada), `spec-roy` (tareas grandes), `rdd-roy` (revisión fresca con el agente `reviewer`), `e2e-roy` (navegador con Playwright) |
| Git y entrega de contexto | `commit-roy`, `create-pr-roy`, `consult-ticket-roy` (Jira), `consult-figma-roy`, `consult-docs-roy` (Notion, Google Drive, Docs y Gmail) |
| Ingeniería | `testing-roy`, `security-roy`, `typescript-roy`, `database-roy`, `frontend-roy`, `backend-roy`, `performance-roy`, `delivery-roy` |
| Estilos y meta | `styles-roy`, `create-skill-roy` |

Cada skill de ingeniería es un despachador corto con `references/` (fuentes oficiales, con fecha de verificación) y un `checklist.md`.

## Hooks

| Hook | Qué hace |
|---|---|
| `bootstrap.mjs` (SessionStart) | Instala y cablea Engram y CodeGraph; inyecta `rules/` |
| `pretooluse-no-commit.mjs` | Pide confirmación en `git add`, `commit` y `stage` |
| `pretooluse-search-gate.mjs` | Pide memoria y grafo antes del primer edit de código |
| `pretooluse-secrets.mjs` | Pide confirmación ante secretos evidentes en Write, Edit y MultiEdit |

## Estructura

```
.claude-plugin/   plugin.json y marketplace.json
skills/           las 19 skills (+ _shared/)
agents/           reviewer (revisión RDD)
hooks/            hooks.json y scripts
rules/            reglas inyectadas en cada sesión
scripts/          validador de skills y pruebas del hook de secretos
evals/            rúbrica y casos de `claude plugin eval`
specs/            specs de trabajos grandes
docs/             decisiones de diseño de los flujos
```

## Validación

```bash
claude plugin validate .
node scripts/validate-skills.mjs --expect-evals 24
node scripts/test-secrets-hook.mjs
```

Los evals se corren a mano antes de subir versión (ver `evals/rubric.md`); consumen tokens y no corren en CI.
