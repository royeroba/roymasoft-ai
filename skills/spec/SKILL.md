---
name: spec
description: "Carril grande: diseña y ejecuta un feature con spec. Trigger: el usuario acepta 'con spec', escribe /spec o pide planificar un feature grande antes de codificar. Pregunta, presenta el plan (Plan Mode), guarda specs/NN-slug.md e implementa por fases con pausas."
disable-model-invocation: false
argument-hint: "descripción corta del feature, o NN-slug de un spec existente para retomarlo"
---

# /spec — Feature grande con spec

Base, tests, cierre y oferta de E2E: `../_shared/verificacion.md`. Plantilla del documento: `template.md` (misma carpeta).

Un spec es el contrato del que parte la ejecución: si es vago, el código improvisa. Por eso la definición es lenta y la ejecución rápida. **En las fases 1 y 2 no se escribe código.**

## Fase 0 — Retomar o empezar

- Si el argumento (o el usuario) nombra un spec existente en `specs/`, léelo, compáralo con el código real y propón desde qué fase seguir. Un spec `Aprobado` se retoma en la fase 4.
- Si no, empieza en la fase 1. Mira `specs/` para numerar y para copiar el **idioma** y las convenciones de los specs existentes.

## Fase 1 — Contexto

Lee el archivo de memoria del proyecto (`CLAUDE.md`, `AGENTS.md`, `README.md`, el primero que exista) y, con el orden de búsqueda de las reglas, lo que el feature toca. Si el objetivo no cabe en una frase, o toca decisiones de 4 o más dominios, propón dividirlo en dos specs antes de seguir.

## Fase 2 — Preguntas

Detecta ambigüedades y **pregunta, no asumas**. Bloques de 3 a 5, con 2 a 4 opciones y tu recomendación (usa `AskUserQuestion` si está). Categorías: alcance (qué entra y qué **no**), datos, integración, persistencia, estados de UX y error, riesgos, decisiones ya cerradas. Si algo abre una caja de Pandora, propón dejarlo para otro spec.

Para cuando puedas responder sin suponer: qué archivos aparecen o cambian, cuál es el primer y el último paso, y cómo se verifica que terminó.

## Fase 3 — Plan y aprobación

Redacta el spec completo siguiendo `template.md`: **Specs** con las frases del usuario **literales** (S1..Sn, sin parafrasear ni añadir requisitos), **Plan** en fases que dejan el sistema funcionando, **Criterios** verificables, decisiones y riesgos.

- Preséntalo con **Plan Mode** (`EnterPlanMode` / `ExitPlanMode`) si está disponible: el "aceptar" del usuario es la aprobación.
- Sin Plan Mode: muéstralo en el chat y pide un "dale".
- Si el usuario pide cambios, ajusta y vuelve a presentar. Nunca marques tú un spec como aprobado sin esa respuesta.

## Fase 4 — Guardar

Con la aprobación, escribe `specs/NN-slug.md` (siguiente número, dos dígitos; slug en kebab-case) con estado `Aprobado`. Si el usuario no aprobó aún, guarda como `Borrador`. La fecha sale del comando de fecha del sistema, no de tu memoria. Si el archivo ya existe, pregunta. Verifica que las dependencias (`Depende de`) existan. Dile la ruta y que queda **sin stage** en el repo: él decide si lo commitea.

## Fase 5 — Implementar por fases

Antes de la primera fase, la **base** (verificacion.md §1) en el `## Log`. Por cada fase:

1. TDD si hay stack (verificacion.md §2), cambio mínimo, solo lo que dice la fase.
2. Marca su checkbox **solo con evidencia observada** (comando y resultado) y anota la evidencia en el `## Log`.
3. Resume qué hiciste y qué archivos tocaste, y oferta E2E si la fase toca UI.
4. Di "Fase N lista" y espera "sigue" (o equivalente en lenguaje natural). El humano revisa en cada fase.

Reglas durante la implementación:

- **Implementa lo que dice el spec.** Si algo te parece mejorable, anótalo como observación; los cambios van al spec, no al código por sorpresa.
- **Ambigüedad** que el spec no resuelve: para, descríbela, da 2 o 3 opciones y espera.
- **Cambio de requisito:** añade al `## Log` la frase literal del usuario con fecha, reescribe solo el `S#` afectado y reabre solo su fase. Lo que quede fuera de alcance, se anota para otro spec.
- Si se pierde contexto o hay que parar, el documento basta para retomar.

## Fase 6 — Cierre

Cuando todas las fases estén hechas: verifica los criterios de aceptación uno a uno con evidencia, `Riesgo:`, y revisión `rdd` sobre el feature completo (por fase si el riesgo es alto). Con el "ok" del usuario, cambia el estado a `Implementado`. El commit solo si lo pide, con `/commit`.

## Reglas

- Estados: `Borrador` → `Aprobado` → `Implementado` (u `Obsoleto`). Los cambia el agente **solo tras la respuesta explícita del usuario**, en lenguaje natural; el usuario no tiene que editar el archivo.
- No hagas commit ni stage por tu cuenta (solo si el usuario lo pide, con `/commit`) ni crees ramas: eso lo decide él.
- Guarda en memoria solo las decisiones (guardado proactivo), no una copia del documento.
