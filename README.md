# roymasoft-ai

**Mi harness de IA.** Una sola fuente de comportamiento, proyectada a los agentes que uso.

No es un agente ni un framework: es la capa que se interpone entre yo y el modelo, y que
determina **cómo se comporta el agente** — sin tocar el modelo.

```
roymasoft-ai  =  INSTALADOR  +  CONFIGURACIÓN  +  REGLAS PROPIAS
```

---

## La separación que lo ordena todo

| HARNESS *(este repo — portable)* | PROYECTO *(el repo del cliente — local)* |
|---|---|
| Cómo busca, delega, verifica | Stack y versiones |
| Cuándo pregunta y cuándo no asume | Arquitectura y capas |
| SDD / TDD | Convenciones de código |
| Seguridad y contención | Comandos de build/test/lint |
| Memoria y economía de contexto | Reglas de negocio |

Trabajo para varias empresas con stacks distintos. **El comportamiento es el mismo en todas; el
dominio no se mezcla** — ni por utilidad ni por confidencialidad. El dominio de cada cliente vive
en el `PROJECT.md` de su propio repo.

---

## Uso

```powershell
# una vez
git clone <este-repo> C:\Users\royei\roymasoft-ai

# en cada repo de cliente
pwsh C:\Users\royei\roymasoft-ai\install.ps1 -Project .
```

Reinicia el agente. Eso es todo.

### Qué genera en el repo destino

| Agente | Archivo | Estrategia |
|---|---|---|
| Codex | `AGENTS.md` | Nativo — es la proyección canónica |
| Claude Code | `CLAUDE.md` | Puntero de una línea a `AGENTS.md` |
| Cursor | `.cursor/rules/*.mdc` | Una regla por archivo de comportamiento |
| Copilot | `.github/copilot-instructions.md` | Bloque idempotente entre marcadores |
| Antigravity | `.gemini/GEMINI.md` | Copia |
| *(detalle)* | `.roymasoft/behavior/…` | Archivos lazy, cargados solo cuando aplican |

Todo se **copia**, nunca se enlaza: los symlinks en Windows exigen elevación o modo desarrollador,
y se rompen al descargar el repo como ZIP.

El bloque de Copilot va entre `<!-- roymasoft-ai:start -->` y `<!-- roymasoft-ai:end -->`. Lo que
escribas fuera de esos marcadores se conserva.

---

## Estructura

```
behavior/     ★ las reglas — lo único 100% propio
  _core.md      ALWAYS-ON (~90 líneas). Todo lo demás se carga bajo demanda
  evidence.md   no asumir: qué puede afirmar y con qué prueba
  output.md     respuestas cortas, sin preámbulo ni recapitulación
  language.md   idioma de conversación vs. de artefactos
build/
  project.mjs   la proyección 1 → 5
stack.toml      qué componentes se instalan y con qué perfil
install.ps1     instalador
```

### Economía de contexto

Solo `behavior/_core.md` está siempre en contexto (~1.000 tokens). El resto son punteros: el agente
lee `evidence.md` cuando va a afirmar algo, `output.md` cuando compone la respuesta, y nada más.

Un `AGENTS.md` monolítico típico son ~3.000 tokens de instrucciones **antes de leer una línea de
código**.

---

## Estado

| Fase | Contenido | Estado |
|---|---|---|
| **1** | Esqueleto · comportamiento núcleo · proyección | ✅ |
| 2 | Orquestador · subagentes · pipeline `/hu` | pendiente |
| 3 | SDD (Fernando) · TDD condicional · ping-pong | pendiente |
| 4 | engram · CBM · Context7 · rtk · hooks · `onboard-repo` | pendiente |
| 5 | Guards · skills restantes · evals | pendiente |

Plan completo: `~/.claude/plans/armemos-un-plan-para-logical-neumann.md`
Análisis de referencia: `../HARNESS-NOTAS.md` · Diseño: `../DISENO-HARNESS.md`

---

## Créditos

El comportamiento se apoya en ideas de repos públicos analizados para esto:
[gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) ·
[engram](https://github.com/Gentleman-Programming/engram) ·
[fernando-skills](https://github.com/Klerith/fernando-skills) ·
[i-have-adhd](https://github.com/ayghri/i-have-adhd) ·
[rtk](https://github.com/rtk-ai/rtk) ·
[codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) ·
[tuweb.dev](https://github.com/midudev/tuweb.dev)
