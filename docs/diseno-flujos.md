# Diseño de los flujos de trabajo (HU, ODD, specs, TDD, RDD, E2E)

Estado: **propuesta aprobada en lo esencial, sin implementar**. Fecha: 2026-10-06.
Fuentes: gentle-ai `origin/main` (ODD, RDD), fernando-skills (`/spec`, `/spec-impl`), harness anterior de este repo (`origin/master`), feedback #204 en Engram.

## 1. Principios

1. **Ligero.** Lo que no cambia el resultado no se hace. Sin revisores múltiples, sin procesos en segundo plano, sin hooks nuevos.
2. **Natural.** Todo avance se pide y se aprueba en lenguaje natural ("dale", "sigue"). El "aceptar" del Plan Mode nativo es la aprobación de un spec.
3. **Evidencia.** Nada se da por hecho: se cita `archivo:línea` o la salida real de un comando.
4. **El commit lo decide el usuario.** El agente no hace commit ni stage por iniciativa propia; solo cuando el usuario lo pide, con `/commit-roy` (un hook pide confirmación en cada uno). El avance queda en el documento y en archivos sin stage.
5. **Proporcional.** El esfuerzo de verificación sigue el riesgo del cambio, no el número de archivos.
6. **Carga mínima.** Solo lo imprescindible está siempre en contexto; lo demás son skills que se cargan al usarse.

## 2. Piezas

| Pieza | Tipo | Cuándo se carga | Archivo |
|---|---|---|---|
| Autorizar y clasificar | Regla corta | Siempre | `rules/behavior.md` |
| `/hu-roy` (entrada con ticket o criterios) | Skill | Al invocarla o al traer una HU | `skills/hu-roy/SKILL.md` |
| Carril grande (spec) | Skill | Solo si la tarea es grande | `skills/spec-roy/SKILL.md` + `template.md` |
| TDD condicional | Sección de la skill del carril | Al implementar | dentro de `hu` y `spec` |
| RDD (revisión fresca) | Agente + skill delgada | Al cerrar un cambio con código | `agents/reviewer.md`, `skills/rdd-roy/SKILL.md` |
| E2E en navegador | Skill (ya existe) | Al aceptar la oferta | `skills/e2e-roy/SKILL.md` |

## 3. Regla siempre activa (borrador, ~10 líneas)

> **Cambios.** Antes de tocar nada: (1) ¿el pedido autoriza un cambio? Investigar, explicar o revisar es solo lectura. Si es ambiguo, una pregunta y sigues en lectura. (2) Explora lo mínimo. (3) Clasifica: **pequeña** si está entendida, su riesgo está contenido y se puede reanudar desde la petición y `git diff`; **grande** solo si eso falla. Nunca por número de archivos. (4) Pequeña: hazla directo. Grande: propón spec en una línea y espera. (5) Riesgo alto = datos o efectos irreversibles, seguridad, contratos que otros consumen, concurrencia, entorno o despliegue, o ningún test detectaría una regresión. (6) Cierra con `Riesgo: <ítem>|ninguno` y lo que no verificaste.

## 4. Flujo

```
petición ──► autorizar ──► explorar ──► clasificar ──┬─► pequeña ──► carril pequeño ─┐
                                                     └─► grande  ──► carril grande ──┤
                                                                                     ▼
                              oferta de E2E (si hay UI) ──► RDD (revisión fresca) ──► cierre
```

`/hu-roy` es la misma entrada cuando el usuario trae un ticket: reformula la historia en 1–2 líneas, lista los criterios de aceptación como checklist (si no hay, lo dice: es el primer hueco) y propone el carril. **No escribe código.**

## 5. Carril pequeño (absorbe el ping-pong)

1. Explorar con el orden memoria → CodeGraph → grep.
2. Si es un bug: **reproducir antes de corregir** y guardar la evidencia (ver §8).
3. TDD condicional (§7).
4. Hacer el cambio, mostrar el diff y esperar el visto bueno del usuario.
5. Cerrar con `Riesgo:` y RDD si procede (§9).

Sin documento de seguimiento ni preguntas largas.

## 6. Carril grande (spec)

1. **Preguntas** en bloques de 3 a 5, con opciones cerradas y recomendación. Parar cuando se pueda responder: qué archivos cambian, cuál es el primer y el último paso, cómo se verifica.
2. **Plan nativo** (Plan Mode): se presenta el plan; el "aceptar" del usuario es la aprobación. Fallback sin Plan Mode: aprobación con un "dale" en el chat.
3. **Documento** `specs/NN-slug.md` en el repo del cliente, visible y sin stage (el usuario decide si lo commitea). Orden fijo:
   - Cabecera: estado (`Draft` → `Approved` → `Implemented`), fecha, objetivo en una frase, HU.
   - `## Specs`: S1..Sn con las frases del usuario **literales**, sin parafrasear ni añadir requisitos.
   - `## Plan`: fases numeradas; cada una deja el sistema funcionando.
   - `## Criterios de aceptación`: checklist verificable.
   - `## Decisiones` (tomadas y descartadas), `## Riesgos`, `## Log` (L1 = petición original literal).
4. **Fases:** al terminar cada una, resumen y archivos tocados, checkbox marcado solo con evidencia observada, oferta de E2E si toca UI y espera de "sigue".
5. **Cambio de requisito:** se agrega al Log, se reescribe solo el `S#` afectado y se reabre solo su fase.
6. **Reanudar:** `mem_context` → leer `specs/NN-slug.md` → reconciliar con el código real → continuar.
7. Si el feature no cabe en una frase o toca decisiones de 4+ dominios, proponer dividirlo antes de seguir.

En Engram solo se guardan decisiones (guardado proactivo normal), **no** una copia del documento.

## 7. TDD condicional

- **Detectar stack de test** sin suponer: scripts `test` en `package.json`, configuración (vitest, jest, playwright test), `pytest`, `go test`, `cargo test`, etc., y tests existentes. Si no se puede determinar, preguntar.
- **Hay stack:** TDD siempre. Antes de editar, correr los tests relacionados y registrar los fallos preexistentes (no se arreglan). Escribir el test, **verlo fallar por la razón correcta** (RED), implementar lo mínimo, verlo pasar (GREEN), refactorizar. Un test por regla pedida; un test que demuestre que cada comportamiento existente tocado se mantiene.
- **No hay stack:** decirlo una vez y omitir TDD. Verificar con typecheck/lint o E2E, y en bugs reproducir con un comando o Playwright. Nunca inventar un runner ni crear uno sin que se pida.
- Un test no se borra ni se debilita para que pase.

## 8. Base congelada (baseline)

No es una copia del repo: es la **evidencia del estado de antes**, registrada antes de cambiar:

- el commit de partida (`git rev-parse HEAD`) y si el árbol estaba sucio;
- la reproducción del bug (salida del comando, test en RED o captura de Playwright);
- el resultado de los tests relacionados (cuáles pasaban y cuáles fallaban).

Vive en el chat y, en el carril grande, en el `## Log` del spec. Sirve para decidir en el RDD si un fallo **ya existía** (aviso) o **lo introdujo el cambio** (bloqueo). Una copia física (`git worktree` en un directorio temporal fuera del repo) solo si hace falta y es barata: sin dependencias instaladas no corre. Los cambios sin commit del usuario no entran en `HEAD`; se avisa.

## 9. RDD: revisión fresca, PASS o FAIL

- **Quién:** `agents/reviewer.md`, un subagente sin el contexto de la conversación, con herramientas limitadas a leer y ejecutar comandos (sin editar). *A verificar al implementar:* cómo se referencia un agente de plugin (`subagent_type`).
- **Qué recibe:** objetivo y criterios, lista de archivos y diff, baseline (§8) y los comandos de verificación autorizados. Nada más.
- **Qué hace:** relee el diff, corre los comandos, compara con el baseline y busca regresiones, bugs nuevos y criterios sin cumplir.
- **Salida:** veredicto `PASS` o `FAIL`. Si no pasa, tabla: hallazgo · `archivo:línea` · por qué · bloqueo o aviso · ¿ya fallaba antes? Si pasa: "implementación correcta" y lo que no pudo verificar.
- **Severidad:** bloqueo = defecto causado por el cambio, reproducible, que no existía en el baseline. Defectos preexistentes y valores fuera de dominio son avisos.
- **Límite:** una corrección que arregle todos los bloqueos y una revisión acotada a esos bloqueos. Si siguen abiertos, un único "Necesito tu decisión". Nunca bucles.
- **Cuándo:** al cerrar un cambio con código, en ambos carriles; en el grande, al final del feature (y por fase si el riesgo es alto). Se omite en cambios pasivos (documentación, comentarios).

## 10. Conexión con E2E

- Al cerrar una fase o un cambio **con UI** y con servidor levantable, una sola línea: "Ya quedó el login nuevo. ¿Lo probamos en el navegador?".
- Si acepta, corre `/e2e-roy` con los criterios de la HU o del spec y entrega la evidencia en el chat (ya implementado).
- El informe del E2E incluye lo bueno, lo malo y lo mejorable. El resultado puede alimentar al RDD, pero el E2E nunca se ejecuta sin que el usuario lo acepte.

## 11. Reglas de herramientas

- **Build:** no se ejecuta salvo que el usuario lo pida o sea la única forma de verificar el cambio y sea razonable (corto, sin efectos secundarios como desplegar o escribir fuera del repo). Antes se prefieren tests acotados, typecheck o lint. Si el build es largo, se pregunta.
- **Context7:** antes de usar APIs de librerías (ya en `rules/behavior.md`).
- **Playwright:** solo vía `/e2e-roy` (ya implementado).

## 11b. Modelos (sugerencia, el humano elige)

- **Por defecto:** `sonnet` al delegar. La distribución de abajo es solo una sugerencia que se ofrece si el usuario quiere activarla; la decisión es suya y el agente no la activa por su cuenta.
- **opus:** planear, razonar y decidir (preguntas y plan del carril grande, el RDD).
- **sonnet:** ejecutar (implementar, explorar, correr comandos).
- **haiku:** tareas triviales que no tocan lógica de negocio (textos, descripciones de PR, formato).
- Se usan los **alias** (`opus`, `sonnet`, `haiku`), que apuntan a la versión disponible, no ids con versión.
- El `reviewer` declara `model: sonnet`. Si el usuario activa la distribución sugerida o elige otro modelo (por ejemplo opus), se pasa al delegar y esa elección tiene prioridad sobre la del agente.
- El modelo de la sesión principal lo elige el usuario; el plugin no lo cambia.

## 11c. Contexto externo: tickets y diseño

- `/hu-roy` (carril pequeño) y `/spec-roy` (carril grande) consultan el contexto en cuanto el usuario pega una URL: Jira con `/consult-ticket-roy` y Figma con `/consult-figma-roy`. Cada una es independiente y también se invoca sola.
- Ambas validan que el plugin o MCP exista (si no, piden el texto o capturas y lo marcan como contexto manual), solo leen, analizan lo que traen y preguntan los huecos con opciones cerradas.
- `/consult-figma-roy` además cruza los nodos con el proyecto: tokens, componentes existentes, responsive y estados, apoyándose en las skills de estilos que existan (del proyecto, del plugin o globales). Si no existe ninguna, valida contra el código y lo dice.
- Un ticket que enlaza Figma ofrece encadenar `/consult-figma-roy`. `/create-pr-roy` reutiliza el contexto del ticket.
- `styles-roy` (CSS/SCSS/Sass con BEM, CSS moderno, Tailwind al día, responsive validado contra los breakpoints del proyecto) es la skill de estilos del plugin: la usan `/hu-roy`, `/spec-roy` y `/consult-figma-roy`. Es un despachador con `references/` (bem, modern-css, tailwind, responsive) y detecta el enfoque del proyecto sin suponerlo.

## 11d. Ingeniería integral (SPEC 01)

- Ocho skills de dominio, todas en inglés y con sufijo `-roy`: `testing-roy`, `security-roy`, `typescript-roy`, `database-roy`, `frontend-roy`, `backend-roy`, `performance-roy` y `delivery-roy`. Cada una es un despachador (`SKILL.md` corto) con `references/` y un `references/checklist.md` verificable.
- Contenido solo de fuentes oficiales verificadas (Anthropic, OpenAI, Cursor, Google, OWASP, Node.js, TypeScript, React, Vue, W3C, PostgreSQL, MongoDB, AWS, Redis, Docker, GitHub); cada sección cita su fuente y la fecha de verificación. Sin versiones ni proporciones fijas.
- `rules/behavior.md` solo trae el enrutado ("Dominios") y los disparadores de seguridad; el detalle va en las skills para no engordar el contexto siempre cargado.
- `rdd-roy` pasa los checklists de los dominios tocados y `agents/reviewer.md` los comprueba ítem por ítem.
- `scripts/validate-skills.mjs` valida las reglas objetivas de las skills y el formato de los evals. `hooks/pretooluse-secrets.mjs` pide confirmación (`ask`) ante secretos evidentes en Write, Edit y MultiEdit; su regresión está en `scripts/test-secrets-hook.mjs`.
- Spec completo y su registro: `specs/01-ingenieria-integral.md`.

## 12. Lo que no se toma

- De gentle-ai: GGA y los revisores 4R, `gentle-ai review ...` (binario propio), commits por unidad de trabajo, espejo completo del documento en Engram, delegación obligatoria por reglas largas, telemetría y registro de skills.
- De fernando-skills: cambio manual de estado a `Approved`, comandos con `disable-model-invocation`, `AutoCreateBranch` (las ramas las decide el usuario).
- De ODD: la copia `odd/tasks/` (se usa `specs/`).

## 13. Evals

Suite chica y manual en `evals/` (formato de `claude plugin eval`): un caso `fires-<skill>` por skill y cuatro `safety-*`. Detalle, comandos y costo en `evals/rubric.md`; el formato lo valida `scripts/validate-skills.mjs`. Los pendientes de diseño de los flujos (referencia del agente reviewer, peso del contexto, disparo de `hu-roy`) se comprueban en uso real y se registran en Engram, no aquí.
