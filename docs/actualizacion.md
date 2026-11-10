# Actualización

Cómo saber si hay una versión nueva de `roymasoft-ai` y actualizarla. El plugin **no se actualiza solo**: lo único que se mantiene al día solo es Engram (una vez al día, desde el bootstrap). Una versión nueva del plugin solo se ve cuando ya está publicada en el repositorio de GitHub.

## Opción 1: con un comando dentro de Claude Code (recomendada)

Escribe:

```
/update-plugin-roy
```

La skill [`update-plugin-roy`](skills.md) hace esto, en orden:

1. Lee la versión instalada (`claude plugin list --json`).
2. Refresca el catálogo del marketplace (`claude plugin marketplace update roymasoft`); solo descarga el catálogo, no instala nada.
3. Lee la versión publicada en el `marketplace.json` del marketplace y la compara número a número con la instalada.
4. Si estás al día, te lo dice y termina. Si hay una nueva, te muestra las dos versiones y **te pregunta antes de actualizar**.
5. Con tu sí, ejecuta `claude plugin update roymasoft-ai@roymasoft` y comprueba que la versión cambió.
6. Te pide **reiniciar Claude Code**: las sesiones abiertas siguen con la versión anterior hasta entonces.

Si solo quieres saber si hay algo nuevo, pídelo así ("revisa si hay una versión nueva, no actualices") y la skill se detiene antes de cambiar nada.

También puedes pedirlo en lenguaje natural: "busca actualizaciones del plugin" o "actualiza roymasoft".

## Opción 2: a mano, en una terminal

Úsala si tu instalación es anterior a la versión que incluye `/update-plugin-roy` (la skill todavía no existe en esa copia) o si prefieres hacerlo tú.

```bash
claude plugin marketplace update roymasoft
```

```bash
claude plugin update roymasoft-ai@roymasoft
```

Luego reinicia Claude Code. Una vez actualizado, ya tendrás `/update-plugin-roy` para las siguientes veces.

## Saber qué versión tienes

```bash
claude plugin list
```

Busca `roymasoft-ai@roymasoft` y su línea `Version:`. Con `claude plugin list --json` obtienes el mismo dato en formato de máquina, que es lo que lee la skill.

## Problemas comunes

| Síntoma | Qué hacer |
|---|---|
| La skill dice que no pudo refrescar el catálogo | Revisa tu conexión y vuelve a pedirlo. Sin refrescar no puede saber la versión publicada y no la inventa |
| `claude` no se reconoce | Abre una terminal nueva o revisa que Claude Code esté en el PATH; la skill te entrega los dos comandos para correrlos a mano |
| La versión no cambió tras actualizar | Ejecuta `claude plugin list` y envía el mensaje de error que mostró la skill |
| `roymasoft-ai@roymasoft` no aparece en la lista | No está instalado desde este marketplace: sigue [instalacion.md](instalacion.md) |
| Después de actualizar siguen las skills viejas | Reinicia Claude Code; hasta entonces la sesión usa la versión anterior |

## Qué hace y qué no hace la skill

- Solo gestiona `roymasoft-ai@roymasoft`. Para otros plugins (`engram`, `playwright`...) te da el comando `claude plugin update <nombre>`.
- No edita a mano ningún archivo de configuración de plugins.
- No publica versiones nuevas: eso es del mantenedor del plugin.
