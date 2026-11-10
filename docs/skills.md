# Catálogo de skills

Qué hace cada skill, cuándo usarla y cuándo no. Está escrito para una persona y para un agente: la persona escribe `/nombre-de-la-skill` o pide algo en lenguaje natural; el agente la carga con la herramienta `Skill` cuando la petición encaja con "Cuándo usarla". Las frases exactas que la disparan están en el campo `description` de cada `skills/<nombre>/SKILL.md`.

Todas terminan en `-roy`. Las que escriben fuera del repo (Jira, Git remoto) piden tu sí antes; las que solo leen lo dicen.

## Flujo de trabajo

### `implement-ticket-roy`
- **Qué hace:** punto de entrada. Reformula la tarea, lista criterios, explora el código, la clasifica y, si es pequeña, la ejecuta; si es grande, propone un spec y espera.
- **Cuándo usarla:** llega un ticket, historia de usuario, feature o bug, con o sin criterios; o pegas una URL de Jira o Figma.
- **Cuándo no:** solo quieres leer un ticket (`read-ticket-roy`) o ya sabes que quieres un spec (`plan-feature-roy`).
- **Ejemplo:** "implementa este ticket ABC-123" o "arregla este bug del login".

### `plan-feature-roy`
- **Qué hace:** carril grande. Entra en modo plan, te hace las preguntas necesarias, presenta el plan para tu aprobación, lo guarda en `specs/NN-slug.md` y lo implementa por fases, con tu "continuar" entre fase y fase.
- **Cuándo usarla:** la tarea es grande, tiene varias partes o pides planear antes de programar ("planea", "hazlo con spec").
- **Cuándo no:** el cambio es pequeño y claro.
- **Ejemplo:** "planea una pantalla de reportes con filtros y exportación".

### `regression-review-roy`
- **Qué hace:** lanza un revisor sin el contexto de la conversación que compara el cambio con la evidencia de antes y devuelve PASS o FAIL con una tabla de hallazgos. No edita nada.
- **Cuándo usarla:** al cerrar un cambio de riesgo alto o una feature grande que toca código; o si pides "revisa que no rompimos nada".
- **Cuándo no:** cambios solo de documentación o comentarios.
- **Ejemplo:** "haz el regression review de lo que acabamos de hacer".

### `browser-test-roy`
- **Qué hace:** prueba en un navegador real que una feature cumple sus criterios. Usa Playwright por defecto y Claude in Chrome si hace falta tu sesión iniciada, con respaldo entre las dos. Muestra la evidencia en el chat y, con Playwright, la guarda en `.playwright-mcp/`.
- **Cuándo usarla:** quieres verificar en el navegador una historia o lo que acabamos de hacer.
- **Cuándo no:** escribir tests automáticos del repo (`testing-roy`).
- **Ejemplo:** "pruébalo en el navegador".

### `ticket-evidence-roy`
- **Qué hace:** deja en el ticket de Jira un comentario corto, en palabras sencillas, con 3 o 4 capturas que muestran que se cumplió lo pedido. Solo publica con tu sí explícito y nunca afirma un éxito que no se observó.
- **Cuándo usarla:** el trabajo está terminado y probado, y quieres que QA lo vea en el ticket.
- **Cuándo no:** para leer el ticket (`read-ticket-roy`) o cambiar su estado: esta skill solo comenta.
- **Ejemplo:** "deja la evidencia en el ticket ABC-123".

## Git y contexto externo

### `commit-roy`
- **Qué hace:** lee el cambio, redacta el mensaje con Conventional Commits y hace stage y commit de los archivos que corresponden. Nunca hace push.
- **Cuándo usarla:** pides el commit o su mensaje.
- **Cuándo no:** amend, rebase, squash o abrir un PR.
- **Ejemplo:** "haz commit".

### `create-pr-roy`
- **Qué hace:** sube la rama y abre el Pull Request con título, resumen, qué se hizo, criterios y ticket.
- **Cuándo usarla:** el trabajo está terminado y probado, y quieres el PR.
- **Cuándo no:** no revisa ni prueba nada; eso se hace antes.
- **Ejemplo:** "crea el PR de lo que hicimos".

### `read-ticket-roy`
- **Qué hace:** lee un ticket de Jira y entrega su contexto analizado: objetivo, criterios tal como están escritos, huecos y preguntas. Solo lectura.
- **Cuándo usarla:** pegas una URL o clave de Jira, o pides "qué dice el ticket".
- **Cuándo no:** para comentar o mover el ticket.
- **Ejemplo:** "revisa el ticket ABC-123".

### `read-figma-roy`
- **Qué hace:** lee un diseño de Figma y lo valida contra el proyecto (tokens, componentes, responsive) antes de implementarlo. Solo lectura.
- **Cuándo usarla:** pegas una URL de figma.com o pides revisar un diseño.
- **Cuándo no:** para criticar la calidad del diseño (`design-review-roy`).
- **Ejemplo:** "mira este Figma y dime qué tiene".

### `read-shared-docs-roy`
- **Qué hace:** lee una página de Notion, un archivo de Drive, un Doc, Sheet, Slides o un correo de Gmail y lo entrega como contexto analizado. Solo escribe borradores, cada uno con tu sí.
- **Cuándo usarla:** pegas una URL de Notion, Drive, Docs o Gmail.
- **Cuándo no:** enviar, compartir o editar lo existente: no lo hace.
- **Ejemplo:** "lee este doc y dime qué falta".

## Ingeniería

### `testing-roy`
- **Qué hace:** guía cómo escribir, revisar y arreglar tests en frontend y backend: estrategia en pirámide, pruebas de comportamiento y tests estables.
- **Cuándo usarla:** vas a escribir, arreglar o revisar tests, o hay un test inestable.
- **Cuándo no:** recorrer una feature en el navegador (`browser-test-roy`) o revisar todo un cambio (`regression-review-roy`).
- **Ejemplo:** "añade tests de integración a este endpoint".

### `security-roy`
- **Qué hace:** aplica buenas prácticas de seguridad al escribir o revisar código: OWASP Top 10, inyecciones, XSS y CSP, autenticación, secretos, subidas y dependencias. Es una guía de código seguro, no un escáner ni un pentest.
- **Cuándo usarla:** el cambio toca autenticación, entradas de usuario, consultas, secretos, archivos subidos, dependencias o cabeceras.
- **Cuándo no:** auditar infraestructura o servidores en producción.
- **Ejemplo:** "revisa si este login es seguro".

### `typescript-roy`
- **Qué hace:** guía TypeScript estricto y seguro en tipos: `tsconfig`, evitar `any`, estrechar `unknown`, errores y nombres.
- **Cuándo usarla:** escribes, tipas o refactorizas TypeScript.
- **Cuándo no:** código que no es TypeScript.
- **Ejemplo:** "quita los `any` de este módulo".

### `database-roy`
- **Qué hace:** guía el trabajo con bases de datos SQL (PostgreSQL de referencia) y NoSQL: esquemas, índices, rendimiento de consultas, transacciones y migraciones.
- **Cuándo usarla:** diseñas un esquema, escribes una consulta o migración, o "esta consulta es lenta".
- **Cuándo no:** administrar el servidor de base de datos.
- **Ejemplo:** "añade un índice para acelerar esta consulta".

### `frontend-roy`
- **Qué hace:** guía componentes en React y Vue: buenas prácticas del framework, estado y efectos, accesibilidad (WCAG 2.2) y rendimiento del front.
- **Cuándo usarla:** construyes, refactorizas o revisas un componente o página.
- **Cuándo no:** solo estilos (`css-styling-roy`).
- **Ejemplo:** "revisa la accesibilidad de este formulario".

### `backend-roy`
- **Qué hace:** guía servicios backend en Node.js: diseño de API HTTP, errores, configuración, logs y observabilidad.
- **Cuándo usarla:** creas o cambias un endpoint, ruta, middleware o servicio.
- **Cuándo no:** consultas y esquemas (`database-roy`).
- **Ejemplo:** "añade paginación a este endpoint".

### `performance-roy`
- **Qué hace:** flujo de rendimiento que mide primero: define la métrica, toma una línea base, encuentra el cuello de botella, cambia una cosa y vuelve a medir con antes y después.
- **Cuándo usarla:** "está lento", "optimiza", latencia, Core Web Vitals, consultas lentas.
- **Cuándo no:** optimizar sin medir.
- **Ejemplo:** "la página de reportes tarda en cargar, hazla más rápida".

### `docker-ci-roy`
- **Qué hace:** guía Dockerfiles, docker-compose, pipelines de CI y flujos de GitHub Actions con valores seguros, reproducibles y de mínimo privilegio; también listas de despliegue y planes de rollback.
- **Cuándo usarla:** escribes o cambias un Dockerfile, un pipeline o un flujo de despliegue.
- **Cuándo no:** infraestructura fuera de Docker y CI.
- **Ejemplo:** "añade CI que corra los tests en cada PR".

### `seo-roy`
- **Qué hace:** guía el SEO técnico de sitios públicos hechos con Nuxt: renderizado, etiquetas del head, canónicas, `robots.txt`, sitemap, datos estructurados e hreflang.
- **Cuándo usarla:** "mi página no sale en Google", sitemap, canonical, JSON-LD.
- **Cuándo no:** sitios que no son públicos o no usan Nuxt.
- **Ejemplo:** "mi página de Nuxt no se indexa, revisa por qué".

## Diseño, estilos e investigación

### `css-styling-roy`
- **Qué hace:** escribe y revisa CSS, SCSS, Sass y Tailwind de forma moderna: BEM, flexbox, grid, variables CSS, container queries y responsive mobile-first.
- **Cuándo usarla:** das estilos, arreglas el layout o haces responsive un componente.
- **Cuándo no:** la lógica del componente (`frontend-roy`).
- **Ejemplo:** "haz este layout responsive".

### `design-review-roy`
- **Qué hace:** critica un diseño o una página construida: primera impresión, jerarquía, usabilidad, consistencia y accesibilidad, con arreglos priorizados. No edita código ni Figma.
- **Cuándo usarla:** compartes una captura, un mockup o una página y quieres opinión.
- **Cuándo no:** convertir el diseño en código (`read-figma-roy` primero).
- **Ejemplo:** "¿qué te parece este diseño?".

### `user-research-roy`
- **Qué hace:** planea investigación con usuarios (guías de entrevista, pruebas de usabilidad, encuestas) y sintetiza resultados en hallazgos con evidencia. Nunca inventa participantes, citas ni cifras.
- **Cuándo usarla:** vas a investigar con usuarios o tienes transcripciones, encuestas o reseñas que resumir.
- **Cuándo no:** decidir qué construir sin datos reales.
- **Ejemplo:** "resume estas 5 entrevistas".

## Mantenimiento y documentación

### `tech-debt-roy`
- **Qué hace:** audita la deuda técnica de un repo o carpeta y devuelve una lista priorizada con evidencia y un plan por fases. Solo lectura: no arregla ni crea tickets.
- **Cuándo usarla:** "qué deberíamos refactorizar primero".
- **Cuándo no:** para arreglar la deuda: eso se pide aparte.
- **Ejemplo:** "haz una auditoría de deuda técnica de `src/`".

### `write-docs-roy`
- **Qué hace:** escribe o actualiza documentación del proyecto basada en el código real: README, referencia de API, runbooks, guías de incorporación y notas de arquitectura.
- **Cuándo usarla:** "documenta esto", "escribe el README".
- **Cuándo no:** publicar en Notion, Drive o Confluence: solo escribe archivos del repo.
- **Ejemplo:** "documenta cómo correr este proyecto".

### `standup-roy`
- **Qué hace:** arma tu daily (ayer, hoy, bloqueos) desde la actividad de git, los PRs abiertos y las claves de Jira. Solo lectura.
- **Cuándo usarla:** "dame mi update para el daily".
- **Cuándo no:** si no hay actividad en git que resumir.
- **Ejemplo:** "¿qué hice ayer?".

## Meta y mantenimiento del plugin

### `update-plugin-roy`
- **Qué hace:** revisa si hay una versión nueva del plugin `roymasoft-ai`: compara la instalada con la publicada en el marketplace, te muestra ambas y, con tu sí, actualiza y verifica. Después te pide reiniciar Claude Code.
- **Cuándo usarla:** "busca actualizaciones del plugin" o "actualiza roymasoft".
- **Cuándo no:** otros plugins (solo gestiona `roymasoft-ai`) ni publicar una versión nueva. Más detalle en [actualizacion.md](actualizacion.md).
- **Ejemplo:** "¿hay una versión nueva del plugin?".

### `create-skill-roy`
- **Qué hace:** crea o revisa una skill del plugin, o decide si lo que pides debe ser una regla en lugar de una skill. Escribe el `SKILL.md` y lo valida.
- **Cuándo usarla:** "crea una skill para X" o "revisa esta skill".
- **Cuándo no:** cambios de código de la aplicación.
- **Ejemplo:** "¿esto debería ser una skill o una regla?".
