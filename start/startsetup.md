# Instalación paso a paso

Guía única para instalar, actualizar, diagnosticar y desinstalar `roymasoft-ai`. Si solo quieres
el resumen, el [README](../README.md) ya lo trae — esto es la versión larga, con Windows, macOS y
Linux, y con lo que suele salir mal.

---

## 1. Dónde vive el clon

**El clon de `roymasoft-ai` debe vivir como hermano de los repos en los que vas a trabajar**, no
dentro de ninguno de ellos:

```
C:\Users\tu-usuario\Documents\
├── roymasoft-ai\          ← el harness (este repo, un solo clon)
├── work\
│   ├── proyecto1\
│   └── proyecto2\
├── otro-cliente\
└── otro-proyecto\...
```

Por qué importa: `init` recibe la ruta del **proyecto**, no la del harness, y la ruta del harness
se resuelve sola desde donde está `bin/rai.mjs`. Si el clon vive fuera de tus carpetas de
proyectos, el comando que corres en cada repo es siempre el mismo, sin relativizar rutas raras:

```bash
node C:\Users\tu-usuario\Documents\roymasoft-ai\bin\rai.mjs init
```

Un solo clon sirve para todos los proyectos — no se clona uno por cliente. `update` luego
re-proyecta a **todos** los repos donde hayas corrido `init`, porque los recuerda en
`~/.rai/projects.json`.

---

## 2. Requisitos

| Requisito | Para qué | Obligatorio |
|---|---|---|
| [Node.js](https://nodejs.org) ≥ 20 | corre el CLI (`bin/rai.mjs`) — es la única dependencia dura | sí |
| [Git](https://git-scm.com) | clonar el harness y que `update` haga `pull` | sí |
| Go | compilar `engram` desde fuente | solo si activas `engram` |
| PowerShell (Windows) | instalar `cbm` vía su `install.ps1` oficial, sin tocar disco (`iwr \| iex`) | solo si lo activas en Windows |
| `curl` (Linux/macOS) | instalar `cbm` vía su `install.sh` | solo si lo activas fuera de Windows |

`rai doctor` te dice cuáles tienes y cuáles faltan — no hace falta adivinar.

---

## 3. Instalar — por sistema operativo

El CLI es Node puro: el mismo `bin/rai.mjs` corre igual en los tres sistemas. Lo único que
cambia es cómo se clona y qué instalador usan los componentes externos (`cbm`).

### Windows (PowerShell)

```powershell
git clone https://github.com/royeroba/roymasoft-ai C:\Users\<tu-usuario>\Documents\roymasoft-ai
node C:\Users\<tu-usuario>\Documents\roymasoft-ai\bin\rai.mjs doctor
```

Si `doctor` marca Node o Git como `fail`, instálalos primero (`winget install OpenJS.NodeJS.LTS`,
`winget install Git.Git`) y vuelve a correr `doctor`.

### macOS / Linux (bash o zsh)

```bash
git clone https://github.com/royeroba/roymasoft-ai ~/roymasoft/roymasoft-ai
node ~/roymasoft/roymasoft-ai/bin/rai.mjs doctor
```

Igual que en Windows: si falta Node o Git, instálalos con tu gestor de paquetes (`brew`, `apt`,
`dnf`, …) y repite `doctor`.

> **`install.ps1` en la raíz es un envoltorio obsoleto**, solo para Windows y solo por
> compatibilidad con costumbres viejas de PowerShell. El instalador real es siempre
> `node bin/rai.mjs <comando>`, en cualquier sistema. Úsalo directo.

### Dentro de cada proyecto (los tres sistemas)

```bash
node <ruta-al-harness>/bin/rai.mjs init
```

Esto: detecta el SO y los runtimes, detecta qué agentes tienes instalados, reporta qué componentes
faltan y **pregunta antes de instalar nada**, proyecta el comportamiento a los agentes detectados,
y registra el repo para que `update` lo encuentre después.

Reinicia el agente (Claude Code, Cursor, etc.) al terminar. Si el repo no tiene `PROJECT.md`,
corre `/onboard-repo` dentro del agente.

---

## 4. Componentes externos (`engram`, `context7`, `cbm`)

**Importante — no son parte del harness, son herramientas de terceros que `init` puede instalar
por ti si las activas.** Distinción de scope:

| | Nivel | Dónde vive |
|---|---|---|
| El clon de `roymasoft-ai` | máquina | una sola vez, donde tú lo clonaste |
| `engram`, `context7`, `cbm` (los binarios) | **máquina** | en tu `PATH` / `~/.local/bin`, no dentro de ningún repo |
| El registro de proyectos (`~/.rai/projects.json`) | máquina | tu carpeta de usuario, nunca en un repo de cliente |
| La proyección (`CLAUDE.md`, `AGENTS.md`, `.rai/`, `.cursor/rules/`, …) | **por proyecto** | dentro de cada repo donde corriste `init` |
| Las MCP del agente (registro de `engram mcp`, `context7`, etc.) | **máquina** (usualmente) | **manual, en terminal** — `init` te dice el comando exacto bajo "Next", pero no lo registra por ti |

En corto: **instalas la herramienta una vez por máquina**, y la activas en el `stack.toml` del
propio clon del harness — como es un solo clon compartido por todos tus proyectos, activar un
componente ahí aplica a **todo** `init` futuro, no a un repo puntual.

Todos vienen `enabled = false` a propósito. **Ya no hace falta editar `stack.toml` a mano**: `init`
detecta los tres estén o no activos, los lista bajo "Not active yet" con su costo y propósito, y
con una sola confirmación instala y activa los que aceptes. `cbm` es el más pesado — su nota lo dice
en el propio prompt, así que decir que sí una vez no lo activa a ciegas. Si queda activo, `init`
además indexa el repo actual contra el grafo en el momento — no hay que pedírselo al agente después.
Si prefieres medir de a uno, di que no y vuelve a correr `init` cuando quieras el siguiente — orden
recomendado: `engram` → `context7` → `cbm`.

`rai sync` te dice qué hay nuevo upstream de cada uno. **Solo reporta, no instala nada.**

### Registrar el MCP en tu agente — el paso que sí es manual

Activar un componente en `stack.toml` no lo conecta con tu agente. Es un paso aparte:

```bash
# se corre en TERMINAL, nunca dentro de una conversación con el agente
claude mcp add engram -- engram mcp --tools=agent
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

El comando exacto para cada componente lo imprime `init` al final, bajo "Next" — cópialo de ahí en
vez de adivinarlo.

Dos cosas que confirmé revisando `~/.claude.json` en una máquina real:

1. **El registro queda global**, no por proyecto — una vez que registras `engram` en esta máquina,
   el siguiente repo donde corras `init` ya lo encuentra registrado. No hay que repetirlo.
2. **`cbm` es la excepción**: su propio instalador ya registra el MCP en Claude Code solo, sin que
   corras nada — si `init` te lo sugiere igual bajo "Next" para `cbm`, ya está de más, ignóralo.

Si usas Cursor o Copilot además de Claude Code, cada uno tiene su propio mecanismo de registro de
MCP (archivo o UI propios) — `init` no lo automatiza para ninguno.

---

## 5. Comandos — referencia completa

| Comando | Qué hace |
|---|---|
| `rai init [ruta]` | Pipeline completo: detectar → preguntar → instalar → proyectar → registrar |
| `rai update` | `git pull` del harness + re-proyecta **todos** los repos registrados |
| `rai sync` | Consulta versiones upstream de `engram`, `context7`, `cbm`. Solo reporta, no instala |
| `rai doctor` | Diagnóstico read-only: entorno, agentes detectados, componentes, repos registrados, validación del harness |
| `rai project [ruta]` | Solo la proyección (sin detectar componentes ni preguntar nada) |
| `rai uninstall [ruta]` | Quita el harness **de ese proyecto** (no borra el clon) |

### Flags

| Flag | Aplica a | Qué hace |
|---|---|---|
| `--agents claude,cursor` | `init`, `project` | Proyecta para estos agentes en vez de los detectados |
| `--all` | `init`, `project` | Proyecta para los cinco agentes soportados |
| `--yes` | `init`, `update`, `uninstall` | No pregunta antes de instalar o borrar — para correr sin TTY |
| `--dry-run` | `uninstall` | Muestra qué se borraría, sin tocar nada |
| `--all` | `uninstall` | Desinstala de **todos** los repos registrados, no solo del actual |

Sin argumento de ruta, `init`, `project` y `uninstall` usan el directorio actual (`process.cwd()`)
— por eso conviene correrlos parados dentro del repo de cliente.

---

## 6. El ciclo de vida completo

```
1. Clonar el harness UNA VEZ, como hermano de tus proyectos
        git clone ... roymasoft-ai

2. Por cada repo de cliente donde quieras el harness
        node <harness>/bin/rai.mjs init
        → si activaste un componente NUEVO en esta máquina, registra su MCP
          (comando exacto bajo "Next" -- se corre en terminal, no en el chat)
        → reinicia el agente
        → prueba
        → /onboard-repo si no hay PROJECT.md

   El registro de MCP es por máquina, no por proyecto -- solo hace falta la
   primera vez que activas cada componente. El siguiente repo donde corras
   init ya lo encuentra listo.

3. Cuando el harness cambie (nuevas reglas, skills, fixes)
        node <harness>/bin/rai.mjs update
        → hace pull y re-proyecta TODOS los repos registrados de una vez

4. Para saber si engram/cbm/context7 tienen versión nueva
        node <harness>/bin/rai.mjs sync
        → solo reporta, decides tú qué tomar

5. Si algo no cuadra
        node <harness>/bin/rai.mjs doctor

6. Si quieres quitarlo de un repo puntual
        node <harness>/bin/rai.mjs uninstall --dry-run   # primero mira qué se iría
        node <harness>/bin/rai.mjs uninstall              # confirma y borra
```

---

## 7. Preguntas frecuentes / solución de problemas

**`node` no se reconoce como comando**
Node no está en el `PATH`. Instálalo (nodejs.org, o `winget install OpenJS.NodeJS.LTS` /
`brew install node` / tu gestor de paquetes) y abre una terminal nueva.

**`init` dice "no agents detected"**
No encontró `claude`, `codex`, `cursor`, `.copilot` ni Antigravity en esta máquina. Fuerza los que
quieras con `--agents claude,cursor` o `--all`.

**`init` se queda esperando y no pregunta nada**
Estás corriéndolo sin terminal interactiva (por ejemplo desde un script o un hook). En ese caso
`init` no pregunta — te avisa y sigue. Pasa `--yes` si quieres que instale sin confirmar.

**Un componente (`cbm`) falla al instalar**
`init` reporta el comando exacto que intentó y el código de salida, y no bloquea el resto —
instálalo a mano con el comando que te mostró y vuelve a correr `doctor` para confirmar.

**En Linux/macOS, `cbm` falla por falta de `curl`**
Instálalo con tu gestor de paquetes (`apt install curl`, `brew install curl` — en macOS ya viene).

**`cbm` queda activo pero mi repo no aparece indexado**
Si `init` activó `cbm` en esta misma corrida, ya debería haber indexado el repo actual solo — mira
la sección "Graph index" en la salida. Si `cbm` ya estaba activo de antes y solo corriste `init` en
un repo nuevo, también debería indexarlo automáticamente al final. Si por lo que sea falló, corre a
mano: `codebase-memory-mcp cli --progress index_repository --repo-path <ruta-del-repo>`.

**`update` dice que el harness tiene cambios sin commitear**
No hace `pull` sobre un working tree sucio. Si esos cambios son tuyos (poco común: el harness no
debería editarse por proyecto), commitéalos o guárdalos en un stash; si no reconoces los cambios,
revisa qué los generó antes de descartarlos.

**Un repo de cliente quedó desactualizado tras un `update`**
`update` re-proyecta todo lo que está en `~/.rai/projects.json`. Si el repo no aparece ahí
(por ejemplo lo moviste de carpeta), `update` lo reporta como "gone" y lo saltea — corre `init`
de nuevo ahí para volver a registrarlo con la ruta nueva.

**`uninstall` no borró algo que esperaba**
Es a propósito: solo borra lo que puede **probar** que generó (cabecera `Generated by
roymasoft-ai`, o nombre de skill/subagente que sigue existiendo en el harness). Si editaste el
archivo a mano o el nombre ya no está en el harness, lo deja y te dice por qué en la columna
`= ruta — motivo`. Corre con `--dry-run` primero si quieres ver el plan sin ejecutar nada.

**Quiero desinstalar y reinstalar para probar la experiencia de cero**
```bash
node <harness>/bin/rai.mjs uninstall --dry-run   # revisa el plan
node <harness>/bin/rai.mjs uninstall              # confirma
node <harness>/bin/rai.mjs init                    # vuelve a instalar
```
`uninstall` nunca toca `PROJECT.md`, `specs/`, el clon del harness, los binarios de los
componentes externos ni las MCP registradas en tu agente — eso lo dice explícitamente al terminar
cada corrida.

**¿Puedo correr `uninstall` dentro del propio `roymasoft-ai`?**
No, y es intencional: `uninstall` quita el harness **de un proyecto**, no borra el clon. Intentarlo
dentro del propio repo del harness lanza un error explícito. Para deshacerte del clon, bórralo a
mano como cualquier carpeta.

---

## 8. Ver también

- [README.md](../README.md) — resumen, estructura del repo, modelo de ramas
- `rai doctor` — el diagnóstico real de tu máquina, siempre más confiable que esta guía si
  algo cambió desde que se escribió
