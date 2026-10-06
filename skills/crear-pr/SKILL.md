---
name: crear-pr
description: "Sube la rama y abre el Pull Request de lo ya terminado, con título, resumen de la tarea, qué se hizo, criterios de aceptación, desarrollador y ticket. Trigger: el usuario pide 'crea el PR', 'sube el PR', 'abre el pull request', 'crea el pr de lo realizado' o 'sube la rama y haz el PR'. Pregunta lo que no puede inferir y confirma antes de subir. No revisa nada: asume que la tarea ya se probó y pasó el RDD."
disable-model-invocation: false
argument-hint: "opcional: ticket, URL del ticket o rama destino"
---

# /crear-pr — Subir la rama y abrir el PR

Publicas lo que ya está hecho. **No revisas la tarea ni el código, no corres el RDD, tests ni build**: si el usuario pide el PR es porque ya lo probó. Leer el log y el diff es solo para **describir** el cambio, no para juzgarlo.

## Cuándo usar / cuándo no

- Úsala cuando pidan abrir o subir el PR de lo realizado.
- No la uses para revisar un PR, actualizar uno existente ni mergear; dilo y pregunta.

## 1. Valida las herramientas

Busca con ToolSearch (`pull request create`, `jira issue`) y usa lo que aparezca. No supongas nombres de herramientas.

| Pieza | Necesaria | Si falta |
|---|---|---|
| Plugin o MCP de **GitHub** (preferido el plugin) | Sí | Para y dile que lo instale o autorice (`/mcp` o los conectores de claude.ai); tú no puedes iniciar el OAuth. Ofrece `gh` solo si él acepta |
| Plugin o MCP de **Jira** | No | Pídele el ticket o su URL (paso 3) |

Si un servidor pide autenticación, dilo y espera: no pidas tokens ni códigos.

## 2. Estado de la rama (solo lectura)

1. `git branch --show-current`, `git status --short` y `git log <base>..HEAD --oneline`. Si estás en la rama base o no hay commits nuevos, dilo y termina.
2. **Si hay cambios sin commit:** invoca `/commit` (propone el mensaje, pide el sí y hace el commit) y **continúa cuando termine**. No hagas `git add` ni `git commit` por tu cuenta fuera de esa skill.
3. Infiere la **rama padre** con `git reflog`, el upstream (`git rev-parse --abbrev-ref @{u}`) y `git merge-base` contra `origin/dev`, `origin/main`, `origin/master` y las demás ramas remotas de largo plazo.

## 3. Infiere y pregunta

Pregunta con **opciones cerradas** y solo lo que no esté claro. **Siempre** la rama destino.

| Dato | Cómo lo infieres | Pregunta |
|---|---|---|
| **Rama destino** | La rama padre del paso 2.3 | Siempre: "La rama padre parece `dev`; ¿el PR va a `dev` o a otra?" |
| **Desarrollador** | `git config user.name` y los autores de `<base>..HEAD` | Solo si hay varios o ninguno: "¿Cómo se llama el desarrollador de esta tarea?" |
| **Ticket** | Rama (`ABC-123-...`), mensajes de commit, argumento; luego Jira si está disponible | Si no aparece: "Dame el ticket o la URL del ticket realizado" |
| **Criterios de aceptación** | Del ticket de Jira | Si no hay Jira ni criterios: "Pásame los criterios de aceptación" |

Con el ticket, trae de Jira: título, descripción y criterios. No inventes ninguno.

## 4. Redacta

- **Título:** corto, en imperativo, máximo 72 caracteres, refleja la tarea realizada. Sigue el estilo de los últimos commits o PR del repo; por defecto, Conventional Commits con el ticket al final: `feat(auth): permite login con SSO (ABC-123)`.
- **Cuerpo** en Markdown de GitHub, con esta plantilla (omite una sección solo si no hay datos y dilo):

```markdown
## Ticket
[ABC-123](https://…) — Título del ticket

## Resumen de la tarea
Dos o tres líneas con el objetivo y el problema que resuelve.

## Qué se hizo
- Cambio principal, en una línea
- Otro cambio relevante (`ruta/archivo.ext` si ayuda)

## Criterios de aceptación
- [x] Criterio cumplido, como lo define el ticket
- [ ] Criterio que el usuario indicó que no se cumple

## Desarrollador
Nombre Apellido

## Ramas
`feature/abc-123-sso` → `dev`
```

Reglas de formato: encabezados `##`, listas con `-`, casillas `- [x]`/`- [ ]`, nombres de rama, archivos y comandos en `` `código` ``, enlaces completos, una línea en blanco entre bloques y sin HTML.
Los criterios van **tal cual los define el ticket**. Márcalos `[x]` según lo que el usuario confirme en el paso 5; no los verificas tú.

Correcto: `- [x] El usuario puede iniciar sesión con SSO`
Incorrecto: `- [x] Todo funciona bien`
Falla porque no es un criterio del ticket ni es verificable.

## 5. Confirma antes de subir

Muestra en el chat: **rama origen → destino, título, cuerpo completo, desarrollador y ticket**. Pregunta: "¿Subo la rama y creo el PR así? ¿Algún criterio no se cumple?". No subas nada sin un sí explícito.

## 6. Sube y crea

1. `git push -u origin <rama>` (nunca `--force`). Si falla o lo rechazan, repórtalo con la causa y detente.
2. Crea el PR con la herramienta de GitHub, con la rama destino y el título y cuerpo confirmados.
3. Si ya existe un PR de esa rama, muestra su URL y pregunta qué hacer.
4. Entrega la **URL del PR**. No mergees, no pidas reviewers ni cambies el estado sin que lo pida.

## Checklist final

- [ ] Plugin o MCP de GitHub validado; Jira validado o ticket preguntado
- [ ] No quedan cambios sin commit (los hizo `/commit` con el sí del usuario)
- [ ] Rama destino confirmada por el usuario
- [ ] Desarrollador y ticket presentes, inferidos o preguntados
- [ ] Título, resumen, qué se hizo y criterios incluidos, en Markdown válido
- [ ] Confirmación explícita antes de `git push` y de crear el PR
- [ ] No revisé la tarea ni corrí tests, RDD o build
- [ ] Entregué la URL del PR
