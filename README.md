# roymasoft-ai

Plugin de Claude Code con mi harness de IA. En reconstrucción: ver `evals/` para la medición de comportamiento.

## Estructura

```
.claude-plugin/   plugin.json + marketplace.json
skills/           skills del plugin (flujos ODD/SDD/TDD/ping-pong/RDD)
commands/         slash commands (enrutador /hu)
agents/           subagentes
hooks/            hooks.json y scripts
evals/            rúbrica y casos de medición
```

## Instalación

```bash
claude plugin marketplace add <ruta-o-repo>
claude plugin install roymasoft-ai@roymasoft
```

## Dependencias (fuera del plugin)

- **Engram**: plugin `engram@engram` + MCP de usuario (el plugin no trae `.mcp.json`).
- **CodeGraph**: MCP de usuario, hook `UserPromptSubmit` y permiso `mcp__codegraph__*` (no tiene plugin de Claude Code).

## Validación

```bash
claude plugin validate .
```
