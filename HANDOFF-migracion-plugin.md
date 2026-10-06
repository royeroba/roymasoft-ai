# Traspaso: migración de roymasoft-ai a plugin de Claude Code

Última actualización: 2026-10-06 · Rama de trabajo: `dev` (sin commits nuevos) · Respaldo: `origin/master` y `origin/release` (árbol idéntico al estado anterior).

## Objetivo

Convertir el harness en **un único plugin de Claude Code**, solo para Claude Code, usando los **plugins/repos oficiales** de Engram y CodeGraph (sin versiones propias). Cursor y el resto de agentes quedan fuera hasta que Claude Code esté 100 % afinado.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Destino | Un solo plugin de Claude Code; portabilidad a otros agentes, después |
| Grafo de código | CodeGraph oficial (`colbymchenry/codegraph`). `codebase-memory` (cbm) **eliminado por completo** |
| Memoria | Engram oficial (`Gentleman-Programming/engram`), con su plugin oficial |
| Commits | Siempre los hace el usuario. La IA no commitea ni hace stage |
| Migración | Por partes. Paso 1 limpiar, paso 2 componentes oficiales |
| CLI `rai` | Eliminado (el plugin se instala con `claude plugin`) |
| Flujos (ODD, SDD, TDD, ping-pong, RDD) | Todos disponibles, un solo enrutador. **Sin implementar todavía** |

## Estado actual

### Hecho

**Repo `roymasoft-ai` (`dev`, todo sin commit)**
- Borrados `behavior/`, `skills/`, `hooks/`, `agents/`, `contracts/`, `guards/`, `bin/`, `build/`, `start/`, `install.ps1`, `stack.toml`, `package.json`.
- Nuevos `.claude-plugin/plugin.json` y `marketplace.json` (v0.3.0, `source: "./"`). `claude plugin validate .` pasa.
- `README.md` reducido; `.github/workflows/validate.yml` solo valida los manifiestos (se mantiene el nombre `validate` porque `master` lo exige).
- `.gitignore`: la entrada de cbm se reemplazó por `.codegraph/`.
- Se conserva `evals/` (`rubric.md`, `cases.jsonl` con 12 casos; sin runner).

**Máquina — verificado en la sesión posterior al reinicio (2026-10-06)**

| Pieza | Estado |
|---|---|
| Engram | 3.1.0, binario en `%LOCALAPPDATA%\engram\bin\engram.exe`. 224 observaciones intactas. `mem_context` y `mem_save` funcionan (el hook `PreToolUse` ya no falla) |
| Plugin `engram@engram` | 0.1.5, habilitado (ámbito usuario) |
| MCP de engram | Duplicado resuelto: se quitó el de ámbito `local`; queda solo el de `user` |
| CodeGraph | 1.6.2, MCP conectado, hook `UserPromptSubmit` (`codegraph.cmd prompt-hook`) y permiso `mcp__codegraph__*` |
| `claude mcp list` | Solo `engram` y `codegraph`, ambos conectados |
| `claude plugin validate .` | Pasa |

**CodeGraph indexado**
- `CabinetV2Front_TvMarkets`: 676 archivos, 11.675 nodos.
- `Tradeview-Markets-3`: 628 archivos, 16.440 nodos.
- `roymasoft-ai`: 0 nodos (el repo casi no tiene código); `errors.log` menciona `bin/rai.mjs`, ya borrado, inofensivo.
- Los dos repos cliente ya ignoraban `.codegraph/`.

**cbm eliminado por completo**
- Claude Code: 7 hooks `hook-augment` de `~/.claude/settings.json`, MCP de `~/.claude.json`, skill, 3 agentes y 3 hooks `cbm-*.cmd` de `~/.claude/`, permisos `mcp__codebase-memory-mcp__*` de `Tradeview-Markets-3/.claude/settings.local.json`.
- Otros agentes: opencode (agentes, skill, plugin `cbm-augment.ts`, entrada en `opencode.json`, bloque en `AGENTS.md`), GitHub Copilot (`~/.copilot`: agentes, skill, hook, `copilot-instructions.md`, entrada en `mcp-config.json`) y VS Code (`mcp.json`).
- Disco: exe y carpeta en `AppData\Local\Programs`, bases en `~/.cache/codebase-memory-mcp`, clon `Documents/roymasoft/codebase-memory-mcp`, carpetas `.codebase-memory/` de `roymasoft-ai` y `CabinetV2Front`, entrada del PATH de usuario, procesos.
- `.gitignore` de `CabinetV2Front_TvMarkets` (una línea dentro del bloque `roymasoft-ai`) y su `.git/info/exclude`.
- Restos intencionales: transcripciones (`~/.claude/projects/`), `~/.claude/backups/`, caché de Claude Desktop, los `.bak-*` y este documento.

## Pendiente

1. **Cambios sin commitear que debe hacer el usuario:**
   - `roymasoft-ai` (`dev`): toda la migración.
   - `CabinetV2Front_TvMarkets`: `.gitignore` modificado (una línea menos). Commitear o revertir.
2. **Plugin de engram vs MCP de usuario:** en esta sesión solo aparecieron herramientas `mcp__engram__*` (MCP de ámbito `user`), no `mcp__plugin_engram_engram__*`. Confirmar en la sesión nueva cuál está activo y si el plugin trae su propio MCP (podría volver a duplicarse).
3. **Hooks de engram en Windows:** los scripts del plugin son `.sh`. El hook `UserPromptSubmit` se disparó, pero no está confirmado que `SessionStart`, `PreToolUse`, `SubagentStop` y compactación funcionen.
4. **Guardar en engram la decisión de la migración** (la observación #225 es solo una prueba; tiene 3 conflictos pendientes de `mem_judge`: #209, #205, #207, puntajes bajos, probablemente falsos).
5. **`~/.claude/CLAUDE.md` global:**
   - La sección de CodeGraph dice "si no hay `.codegraph/`, ignóralo", lo que impide indexar solo. Reemplazarla.
   - "Sin extras no solicitados" choca con el guardado proactivo de engram. Añadir una excepción.
6. **Limpiar los repos cliente** (copias `.rai/`, `.claude/hooks`, `AGENTS.md`, puntero `@AGENTS.md`, bloque `roymasoft-ai` del `.gitignore` de `CabinetV2Front`). **No borrar** las reglas privadas del `CLAUDE.md` de `CabinetV2Front` (ignoradas por git, sin copia).
7. **Diseñar los flujos del plugin:** enrutador `/hu` y línea base congelada (SHA y comando de reproducción antes de cambiar; mismo comando y auditor al final). Después, un runner para `evals/`.
8. **CI de `dev`:** solo valida los manifiestos; el resto de validaciones murió con el CLI.
9. **Cuando todo esté estable:** borrar los respaldos de abajo.

## Respaldos y reversión

| Qué | Dónde |
|---|---|
| Datos de engram | `~/.engram-backup-20261005` |
| Binario viejo de engram | `%LOCALAPPDATA%\engram\bin\engram.exe.old-1.20.0` |
| CLAUDE.md global anterior | `~/.claude/CLAUDE.md.bak-20261005` |
| settings.json anterior (con hooks de cbm) | `~/.claude/settings.json.bak-20261005` |
| `~/.claude.json` antes de quitar cbm | `~/.claude.json.bak-20261006` |
| Config de opencode antes de quitar cbm | `~/.config/opencode/opencode.json.bak-20261006`, `AGENTS.md.bak-20261006` |
| Config de Copilot y VS Code | `~/.copilot/mcp-config.json.bak-20261006`, `AppData/Roaming/Code/User/mcp.json.bak-20261006` |
| Contenido borrado del repo | `git checkout origin/master -- <carpeta>` |

El exe, la skill y los agentes de cbm no tienen respaldo; se reinstalan desde `github.com/DeusData/codebase-memory-mcp` si hiciera falta.

## Problemas conocidos

- `engram doctor` reporta 2 hallazgos de **sincronización en la nube** (148 observaciones antiguas sin título y 8 targets viejos). No afectan el uso local. No se reparó nada.
- `rai sync` sugería `go install .../engram/cmd/engram@latest`, que resuelve a la 1.20.0. El módulo correcto es `.../engram/v3/cmd/engram`.
- CodeGraph **no tiene plugin de Claude Code**: se cablea por MCP, sección en `CLAUDE.md` y hook.
- Las sesiones abiertas antes de quitar cbm cargaron el MCP y los agentes en memoria: cerrarlas y abrirlas de nuevo.

## Reglas del usuario para el agente

Responder en español, corto y preciso. Hacer solo lo pedido, sin extras. No commitear ni hacer stage.

## Siguiente paso previsto

Resolver los puntos 2 a 5 (plugin vs MCP de engram, hooks en Windows, guardar la decisión, arreglar `~/.claude/CLAUDE.md`), luego limpiar los repos cliente (6) y diseñar los flujos (7).
