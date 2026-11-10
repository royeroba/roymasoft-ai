# Instalación

Cómo instalar `roymasoft-ai` en Windows y en Mac. Los dos usan los mismos dos comandos; cambian los requisitos previos y dónde queda lo que el plugin instala.

## Requisitos

| Requisito | Para qué | Cómo comprobarlo |
|---|---|---|
| Claude Code | Es quien instala y ejecuta el plugin | `claude --version` |
| Node.js | Los hooks del plugin se ejecutan con `node`; no hay versión mínima declarada (probado con v24) | `node --version` |
| npm (viene con Node) | Instala CodeGraph con `npm install -g` | `npm --version` |
| git | Descarga el marketplace desde GitHub | `git --version` |
| Conexión a internet | Descarga el marketplace y el binario de Engram desde GitHub | — |
| Go (opcional) | Respaldo: compila Engram si la descarga falla | `go version` |

El repositorio `royeroba/roymasoft-ai` es público, no hace falta iniciar sesión en GitHub.

## Instalar (igual en Windows y Mac)

Abre una terminal (PowerShell en Windows, Terminal en Mac) y ejecuta:

```bash
claude plugin marketplace add royeroba/roymasoft-ai
```

```bash
claude plugin install roymasoft-ai@roymasoft
```

Después **reinicia Claude Code**. En la primera sesión el plugin termina de prepararse solo (ver "Qué pasa en la primera sesión").

## Windows

1. Instala Node.js (incluye npm) y git si faltan, y abre una terminal nueva para que reconozca los comandos.
2. Ejecuta los dos comandos de arriba.
3. Reinicia Claude Code.
4. Engram queda en `%LOCALAPPDATA%\engram\bin\engram.exe`. Si `engram version` no se reconoce, agrega esa carpeta al PATH de Windows y abre una terminal nueva.

Problemas conocidos en Windows:
- Una política de control de aplicaciones (por ejemplo el "Control inteligente de aplicaciones") puede bloquear el `engram.exe` descargado. El plugin lo detecta, no deja un binario roto y avisa con "el binario descargado no ejecuta". Solución: permitir el archivo en esa política o instalar Go para que el plugin lo compile.
- Si `engram.exe` está en uso por otra sesión, Windows no deja sobrescribirlo: el plugin lo renombra a `engram.exe.<número>.old` y copia el nuevo. Esas copias `.old` se borran solas cuando ya nadie las usa.

## Mac

1. Instala Node.js (incluye npm) y git si faltan, con el instalador de nodejs.org o con tu gestor de paquetes. Abre una terminal nueva.
2. Ejecuta los dos comandos de arriba.
3. Reinicia Claude Code.
4. Engram queda en `~/.local/bin/engram`. Si `engram version` no se reconoce, agrega `~/.local/bin` al PATH de tu shell y abre una terminal nueva.

Los pasos de Mac salen del código del plugin (`hooks/bootstrap.mjs`) y de la ayuda del CLI; todavía no se han probado en un Mac.

## Qué pasa en la primera sesión

Al iniciar cada sesión el plugin ejecuta `hooks/bootstrap.mjs` (hasta 300 segundos). Es seguro repetirlo: solo instala lo que falta.

1. **Engram** (memoria): descarga el binario verificado desde GitHub; si falla, lo compila con Go. Luego registra su servidor MCP y el plugin `engram@engram`.
2. **CodeGraph** (exploración de código): lo instala con `npm install -g @colbymchenry/codegraph@latest` y ejecuta `codegraph install --yes --target claude --location global`.
3. Inyecta las reglas de trabajo del plugin en la sesión.

Si algo falla, el aviso sale al inicio de la sesión con el comando exacto para repetirlo a mano.

## Verificar que quedó bien

```bash
claude plugin list
```

Debe aparecer `roymasoft-ai@roymasoft` con su versión y `Status: ✔ enabled` (usa `claude plugin list --json` para ver el detalle).

```bash
engram version
```

```bash
codegraph --version
```

En Claude Code, escribe `/` y comprueba que aparecen las skills del plugin (por ejemplo `/roymasoft-ai:commit-roy`).

## Desinstalar

```bash
claude plugin uninstall roymasoft-ai@roymasoft
```

```bash
claude plugin marketplace remove roymasoft
```

Eso no borra Engram ni CodeGraph, que son herramientas aparte.

## Problemas comunes

| Síntoma | Qué hacer |
|---|---|
| `marketplace add` falla | Comprueba `git --version` y tu conexión; vuelve a ejecutarlo |
| No aparecen las skills | Reinicia Claude Code; confirma con `claude plugin list` que está `✔ enabled` |
| Aviso "No pude instalar CodeGraph" | Ejecuta el comando que indica el aviso: `npm install -g @colbymchenry/codegraph@latest` (en Mac, si falla por permisos, configura npm para instalar globales en tu carpeta de usuario) |
| Aviso "No pude cablear CodeGraph" | Ejecuta `codegraph install --yes --target claude --location global` |
| `engram` no se reconoce | Agrega su carpeta al PATH (ver Windows y Mac arriba) |

Para mantenerlo al día, ver [actualizacion.md](actualizacion.md).
