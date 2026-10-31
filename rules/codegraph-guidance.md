<!-- Fuente: Gentleman-Programming/gentle-ai (MIT), internal/components/communitytool/codegraph_guidance.go (CodeGraphGuidanceMarkdown).
     Condensado para que la salida de SessionStart quepa en el límite de 10.000 caracteres; `gentle-ai codegraph init` -> {{INIT_CMD}}. -->
## CodeGraph

For structural questions (architecture, call flow, dependencies, references, impact, "how does X work") use CodeGraph before broad Read/Glob/Grep. Hard rule.

1. Root: `git rev-parse --show-toplevel || pwd`. Never initialize in `$HOME`, temp dirs or non-project folders.
2. If `<project-root>/.codegraph/` is missing, run `{{INIT_CMD}}` once without asking: a missing index means initialize, not skip.
3. Use `codegraph_explore`; without MCP, the read-only CLI (`codegraph query|explore|callers|callees|impact|affected|status`).
4. After edits trust the watcher; `codegraph sync` only if files stay stale.
5. Fall back to filesystem tools only if CodeGraph fails, and say why.

Never run `codegraph uninit|install|uninstall|upgrade`; `codegraph index` only for a corrupt index. Worktrees needing CodeGraph go under home (`<repo-parent>/<repo-name>-worktrees/<name>`), never `/tmp`, each with its own `.codegraph/`.
