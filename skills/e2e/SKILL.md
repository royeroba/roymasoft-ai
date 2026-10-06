---
name: e2e
description: "Prueba en el navegador que un feature o HU funciona, con el MCP de Playwright. Trigger: el usuario pide 'haz las pruebas e2e', 'probemos en el navegador', 'verifica que funcione en el navegador', 'prueba el feature/la HU' o 'prueba lo que hicimos'. Levanta el servidor si no está corriendo, recorre los criterios de aceptación, reporta la evidencia en el chat y limpia lo que dejó."
disable-model-invocation: false
argument-hint: "feature o HU a probar (opcional: si se omite, lo que acabamos de hacer)"
---

# /e2e — Probar en el navegador

Verificación en vivo con el MCP de Playwright. **No escribe archivos de test en el repo, no hace commit y
no toca el código bajo prueba.** La evidencia queda en una carpeta ignorada por git y se muestra en el chat.

## 1. Qué se prueba

Fuente de los criterios, en este orden: lo que el usuario indicó → los criterios de la HU si se pasó → lo
que acabamos de hacer en la sesión (diff y conversación).

Lista los criterios como checklist, cada uno con su paso de prueba y el resultado observable esperado
(texto, URL, estado). Si no queda claro qué debe cumplirse, **no lo inventes**: "No me queda claro X. Dame
más contexto." con opciones cerradas.

## 2. Preparar

- Las herramientas de Playwright están diferidas: cárgalas con **un solo** `ToolSearch`
  (`select:mcp__plugin_playwright_playwright__browser_navigate,…_browser_snapshot,…_browser_click,…_browser_type,…_browser_fill_form,…_browser_take_screenshot,…_browser_console_messages,…_browser_network_requests,…_browser_wait_for,…_browser_close`).
- **Servidor.** Averigua cómo se levanta y en qué URL desde el repo (scripts de `package.json`, README,
  `.claude/launch.json`); no lo supongas. Si no puedes determinarlo, pregunta.
  Comprueba si ya responde (p. ej. `curl -sI <url>`). Si no, levántalo en segundo plano y espera a que
  responda antes de seguir. Anota si lo levantaste tú: solo ese lo apagas al final.
- URL de prueba local por defecto. Si el entorno no es local (staging, producción), confirma con el usuario
  antes de operar y no crees ni borres datos reales sin su visto bueno.

## 3. Ejecutar

- Actúa con `browser_snapshot` (accesibilidad), no con capturas.
- Por criterio: acción → resultado observable → aserción explícita contra lo esperado.
- Tras cada flujo, revisa `browser_console_messages` (nivel `error`) y `browser_network_requests` (4xx/5xx
  relevantes).
- **Credenciales.** Si aparece un login o algo que pide credenciales: **para**. Di "Ingresa las credenciales en la ventana del navegador y avísame para continuar." No las escribas, no las busques y no leas cookies ni almacenamiento. Al volver, haz un `browser_snapshot` y confirma que la sesión está activa antes de seguir.

## 4. Evidencia: se guarda ignorada por git y se muestra en el chat

El MCP solo escribe dentro del repo (raíz del workspace y `.playwright-mcp/`); una ruta fuera da "outside allowed roots". Por eso la evidencia vive en `.playwright-mcp/`, ignorada por git, y se conserva.

- **Antes de la primera captura:** si `.playwright-mcp/` no está ignorada (`git check-ignore .playwright-mcp`), añádela a `.git/info/exclude` (local de este clon; no toca ni el `.gitignore` del repo ni el historial).
- **Capturas:** `browser_take_screenshot` con `filename` = `.playwright-mcp/e2e-<AAAAMMDD-HHmm>/NN-<criterio>.png`, una por criterio clave. Sin `filename` el MCP también las guarda en esa carpeta, pero con nombre de timestamp.
- **Mostrarlas al usuario:** con `filename` la imagen no llega inline. Al terminar, envía las capturas con `SendUserFile` (`display: "render"`); sin eso el usuario no las ve.
- Consola y red: sin `filename`, que vuelvan como texto.
- Reporta una tabla: criterio · ✅/❌ · lo observado, y la ruta de la carpeta de evidencia.
- Veredicto final: "Cumple N de M criterios", y lo que **no** pudiste verificar.

## 5. Fallos

Un fallo se reporta tal cual, con la evidencia. No cambies el feature ni la prueba para que pase y no
arregles código salvo que el usuario lo pida. Distingue fallo del feature de fallo de la prueba (selector,
timing); si es de timing, reintenta una vez y dilo.

## 6. Cerrar (siempre, también si falló)

1. `browser_close`.
2. Apaga el servidor solo si lo levantaste tú.
3. **No borres `.playwright-mcp/`**: es la evidencia. Dile al usuario que puede borrarla cuando quiera; no es parte del repo.
