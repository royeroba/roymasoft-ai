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

Tres pasos, y el tercero solo hace falta una vez por componente por máquina:

```bash
# 1. clonar el harness UNA VEZ, como hermano de tus repos de cliente (no dentro de ninguno)
git clone https://github.com/royeroba/roymasoft-ai C:\Users\<tu-usuario>\roymasoft-ai

# 2. en cada repo de cliente
node C:\Users\<tu-usuario>\roymasoft-ai\bin\rai.mjs init
```

`init` hace todo el pipeline: detecta SO y runtimes, detecta **qué agentes tienes instalados**,
reporta qué componentes faltan y **pregunta antes de instalar nada**, proyecta, registra el repo, y
si `cbm` queda activo indexa el repo contra el grafo en el momento.

```bash
# 3. si init activó un componente NUEVO en esta máquina, registra su MCP en tu agente
# (comando exacto en la salida de init, bajo "Next" — no siempre hace falta, ver abajo)
claude mcp add engram -- engram mcp --tools=agent
```

**Reinicia el agente y prueba.** Si el repo no tiene `PROJECT.md`, corre `/onboard-repo`.

El paso 3 se corre **en terminal**, nunca dentro de una conversación con el agente — es un
subcomando del propio CLI de cada agente (`claude`, en el caso de Claude Code). Y solo hace falta
la **primera** vez que activas un componente en esta máquina: el registro queda global, no por
proyecto, así que el siguiente repo donde corras `init` ya lo encuentra registrado — ahí el flujo
completo es solo pasos 2, reiniciar y probar. `cbm` es la excepción: su propio instalador ya se
registra solo en Claude Code, así que ese paso 3 nunca hace falta para él ahí.

**Guía paso a paso completa (Windows/macOS/Linux, comandos completos, FAQ):** [start/startsetup.md](start/startsetup.md)

### Comandos

| Comando | Qué hace |
|---|---|
| `rai init [ruta]` | Pipeline completo: detectar -> preguntar -> instalar -> proyectar -> registrar |
| `rai update` | Actualiza el harness desde origin y **re-proyecta todos los repos registrados** |
| `rai sync` | Consulta versiones upstream de engram, CBM y Context7. **Solo reporta** |
| `rai doctor` | Diagnostico read-only: entorno, agentes, componentes, repos, validacion |
| `rai project [ruta]` | Solo la proyeccion, sin nada mas |
| `rai uninstall [ruta]` | Quita el harness **de ese proyecto**. `--all` para todos los registrados |

| Flag | |
|---|---|
| `--agents claude,cursor` | Proyecta para estos en vez de los detectados |
| `--all` | Proyecta para los cinco |
| `--yes` | No preguntar antes de instalar o borrar |
| `--dry-run` | En uninstall: muestra que se iria, sin tocar nada |

**Solo se crean las carpetas de los agentes que tienes.** Si no usas Codex ni Antigravity, no
aparecen sus directorios. Un agente ya proyectado en el repo se sigue manteniendo aunque no este
instalado en esta maquina -- si no, proyectar desde un segundo equipo borraria la configuracion de
un companero.

### Componentes externos

Vienen **todos desactivados** en `stack.toml`. `init` los detecta igual -- activos o no -- y los
lista bajo "Not active yet" con su costo y proposito antes de preguntar una sola vez si los activa
e instala. No hace falta editar `stack.toml` a mano; decir que no ahi los deja como estan.

`cbm` es el mas pesado (daemon por cuenta, mas definiciones de herramienta en cada turno) y su nota
lo dice explicitamente en el propio prompt -- no se activa a ciegas solo por decir "si" una vez. Si
queda activo, `init` tambien indexa el repo actual contra el grafo en el momento -- no hace falta
pedirselo al agente despues. Orden recomendado si vas a medir de a uno: `engram` -> `context7` ->
`cbm`.

Activar un componente **no lo conecta con tu agente todavia** -- eso es un paso aparte, manual, y
por maquina (no por proyecto): `init` te muestra el comando exacto bajo "Next"
(`claude mcp add <nombre> -- <comando>` para Claude Code). `cbm` es la unica excepcion: su propio
instalador ya se registra solo. Corrido una vez por componente en esta maquina, no hace falta
repetirlo en el siguiente repo donde corras `init`.

`rai sync` te dice que hay nuevo upstream; **no instala nada**, tu decides que tomar.

### Desinstalar

```bash
node bin/rai.mjs uninstall            # de este proyecto
node bin/rai.mjs uninstall --all      # de todos los registrados
node bin/rai.mjs uninstall --dry-run  # solo mostrar
```

Quita el harness **de un proyecto**, no el clone del harness. Correrlo dentro de `roymasoft-ai`
se niega: el clone lo borras tu a mano.

Lo dificil no es borrar, es **no borrar lo que no es tuyo**:

| | |
|---|---|
| Archivos generados | Solo si **siguen llevando** la cabecera `Generated by roymasoft-ai`. Si lo editaste a mano, se respeta |
| Skills y subagentes | Solo los que estan en el inventario del harness. Los tuyos se quedan |
| `copilot-instructions.md` | Se **edita**: quita nuestro bloque y conserva tus reglas |
| `PROJECT.md` y `specs/` | **No se tocan** — son del proyecto, no del harness |

Deja a proposito, y lo dice: el clone del harness, el registro, los componentes externos
(engram, cbm son de terceros) y las registraciones MCP de tu agente.

Siempre pide confirmacion, salvo `--yes`.

### Qué genera en el repo destino

| Agente | Archivo | Estrategia |
|---|---|---|
| Codex | `AGENTS.md` | Nativo — es la proyección canónica |
| Claude Code | `CLAUDE.md` | Puntero de una línea a `AGENTS.md` |
| Cursor | `.cursor/rules/*.mdc` | Una regla por archivo de comportamiento |
| Copilot | `.github/copilot-instructions.md` | Bloque idempotente entre marcadores |
| Antigravity | `.gemini/GEMINI.md` | Copia |
| *(detalle)* | `.rai/behavior/…` | Archivos lazy, cargados solo cuando aplican |

Todo se **copia**, nunca se enlaza: los symlinks en Windows exigen elevación o modo desarrollador,
y se rompen al descargar el repo como ZIP.

El bloque de Copilot va entre `<!-- roymasoft-ai:start -->` y `<!-- roymasoft-ai:end -->`. Lo que
escribas fuera de esos marcadores se conserva.

---

## Ramas

```
dev  ──────►  release  ──────►  master
trabajo       estabilizar       producción
diario        y probar          protegida
```

| Rama | Para qué | Protegida |
|---|---|---|
| **`dev`** | Trabajo diario. Aquí se commitea y se itera | no |
| **`release`** | Antesala: se estabiliza y se prueba antes de producción | no |
| **`master`** | Producción. Solo entra lo que pasó por `release` | **sí** |

`release` **puede ir por delante de `master`** — es donde vive lo que está listo pero aún no
liberado, no una copia de producción.

### Reglas de `master`

| | |
|---|---|
| PR obligatorio | sí — no se puede empujar directo |
| Check obligatorio | `validate` en verde |
| Aprobaciones | 0 (trabajo en solitario; súbelo a 1 si lo comparte un equipo) |
| Force push · borrar rama | no |
| Historia lineal | sí |
| Admins exentos | **no** — la protección también me aplica a mí |

### Flujo

```bash
# 1. trabajar
git checkout dev
# ...commits...
git push origin dev

# 2. subir a release cuando esté listo para probar
gh pr create --base release --head dev
# el CI corre solo → verde → merge

# 3. a producción cuando esté estabilizado
gh pr create --base master --head release
# el CI corre otra vez → verde → merge
```

Un hotfix urgente sale de `master`, y **se mergea a `master` y a `dev`** — si no, el arreglo se
pierde en el siguiente release.

### Para el agente

Nunca commitea (→ `behavior/_core.md` §9). Cuando prepare un commit con `/commit`, el destino por
defecto es **`dev`**: entregar trabajo directamente contra `master` o `release` es saltarse el
flujo, aunque la protección de `master` lo impida técnicamente.

---

## Estructura

```
behavior/     ★ las reglas — lo único 100% propio
  _core.md      ALWAYS-ON (~1.4k tokens). Todo lo demás se carga bajo demanda
  evidence.md   no asumir: qué puede afirmar y con qué prueba
  output.md     respuestas cortas, sin preámbulo ni recapitulación
  routing.md    escalera de ceremonia + triggers de delegación
  search.md     grafo → grep → glob → read. Nunca bash para buscar
  memory.md     qué persistir, con qué scope, aislamiento entre clientes
  language.md   idioma de conversación vs. de artefactos
agents/       orquestador (parent) + scout · worker · verifier · reviewer
contracts/
  result.md      sobre de retorno + interaction_required
  tdd-strict.md  ciclo con gates — SOLO se lee si TDD está activo
skills/
  hu/            pipeline: grafo → memoria → código → análisis → PARA
  spec/          diseño guiado → specs/NN-slug.md en Draft → PARA
  spec-impl/     valida Approved → rama → paso a paso con pausas
  onboard-repo/  aprende el repo y escribe PROJECT.md (con testing.available)
  code-review/ security-review/ debug/ commit/
  skill-creator/ skill-improver/   mantienen el propio harness
guards/
  diff-guard.mjs  rutas · secretos · valores del .env · scope de memoria
evals/
  rubric.md  cases.jsonl   como saber si el harness mejora
hooks/
  session-start.mjs  inyecta PROJECT.md + recuperación post-compactación
bin/
  rai.mjs   CLI: init . update . sync . doctor . project
build/
  project.mjs     la proyeccion + generador del registry
  validate.mjs    frontmatter . presupuestos . referencias muertas
  lib/detect.mjs  SO . runtimes . agentes . componentes
  lib/registry.mjs   repos proyectados (~/.rai/projects.json)
  lib/versions.mjs   consulta de versiones upstream
stack.toml      qué componentes se instalan y con qué perfil
install.ps1     envoltorio de compatibilidad (obsoleto)
```

### Subagentes

| Agente | Para | No puede |
|---|---|---|
| `scout` | Mapeo read-only, 4+ archivos que entender | Escribir · afirmar ausencia |
| `worker` | Implementación acotada, 2+ archivos | Salir de sus edit surfaces · commitear |
| `verifier` | Correr tests/build/lint y reportar | Modificar código · arreglar lo que encuentra |
| `reviewer` | Revisar un cambio terminado | Modificar código |

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
| **2** | Orquestador · subagentes · pipeline `/hu` · registry | ✅ |
| **3** | SDD · TDD condicional · ping-pong · estilo de código | ✅ |
| **4** | Instalador · doctor · hooks · `onboard-repo` · stack.toml | ✅ |
| **5** | Guards · skills restantes · validador · evals · CI | ✅ |

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
