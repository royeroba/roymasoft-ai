# Verificación compartida: base, tests, cierre y oferta de E2E

Lo usan `hu` (carril pequeño) y `spec` (carril grande). No es una skill.

## 1. Base (antes de cambiar)

Registra en el chat y, si hay spec, en su `## Log`:

- `git rev-parse HEAD` y si el árbol estaba sucio (`git status --short`). Los cambios sin commit del usuario no están en `HEAD`: dilo.
- **Bug:** la reproducción (comando y salida, test en RED o captura vía `/e2e`). Si no se puede reproducir, dilo.
- **Tests relacionados:** cuáles pasan y cuáles ya fallan. Los que ya fallan **no se arreglan**: se reportan aparte para no cargarte con ellos ni cargar los tuyos al repo.

Cuando el usuario reporta un fallo, reprodúcelo antes de decidir que "ya funciona".

## 2. Stack de pruebas

Detéctalo sin suponer: script `test` en `package.json`, configuración de runner (vitest, jest, playwright test…), `pytest`, `go test`, `cargo test`, etc., y tests existentes. Si no puedes determinarlo, pregunta una vez con opciones cerradas ("¿cómo se corren los tests?" / "no hay tests").

- **Hay stack → TDD:**
  1. Corre los tests relacionados antes de editar (ver Base).
  2. Escribe el test y **míralo fallar por la razón correcta** (RED). Un test por regla pedida y uno por cada comportamiento existente que toques (el que comparte el código que cambias).
  3. Implementa lo mínimo y míralo pasar (GREEN).
  4. Refactoriza con los tests en verde.
  Si para ese cambio no hay un test determinista útil (UI pura, configuración), explica la excepción y verifica con algo funcional. Nunca inventes RED/GREEN.
- **No hay stack:** dilo una vez y omite TDD. Verifica con typecheck, lint o lo que exista, o con `/e2e`; reproduce los bugs con un comando. No crees un runner sin que te lo pidan.
- Un test no se borra ni se debilita para que pase. Si no puedes arreglar la causa, revierte y reporta.
- Si cambias un comando, opción o mensaje, actualiza su ayuda o documentación.

## 3. Cierre

1. `Riesgo: <ítem>` o `Riesgo: ninguno`, según la lista de riesgo alto de las reglas.
2. Lo que no verificaste y por qué.
3. Si tocó código: revisión fresca con la skill `rdd`.
4. Oferta de E2E si corresponde (sección 4).

## 4. Oferta de E2E

Solo cuando el cambio (o la fase) toca UI (vistas, componentes, rutas, estilos) y la app se puede levantar. **Una sola línea** al final, por ejemplo: "Ya quedó el login nuevo. ¿Lo probamos en el navegador?".

- Si acepta: skill `e2e` con los criterios de la HU o del spec.
- No ofrezcas si no hay UI, si ya se probó o si el usuario dijo que no. Nunca lo ejecutes sin que acepte.
