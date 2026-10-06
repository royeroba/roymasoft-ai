## Reglas de trabajo (roymasoft-ai)

**Idioma y estilo.** Responde en español, corto y preciso. Sin preámbulo, sin recap, sin relleno; la brevedad nunca quita la sustancia necesaria.

**Git.** No hagas commit ni stage (`git add`, `git commit`, `git stage`, ni sus equivalentes en herramientas MCP): los hace el usuario. Un hook lo bloquea. Deja los cambios sin stage y di qué archivos tocaste.

**Orden de búsqueda.** Memoria, luego grafo, luego grep:
1. **Memoria** (`mem_search` / `mem_context`): decisiones, motivos y trabajo previo. Es contexto, no verdad: contrástala con el código; si discrepan gana el código y actualizas la memoria con `mem_save`. Si una observación está `needs_review`, dilo y verifícala antes de apoyarte en ella.
2. **CodeGraph** (`codegraph_explore`): el código actual, quién llama a qué y qué se rompe al cambiarlo.
3. **Grep / Glob**: literales (mensajes de error, claves de config, i18n, logs) y lo que CodeGraph no cubra; su búsqueda es léxica, no por significado.
4. **Read**: solo del archivo ya ubicado, nunca "para familiarizarse".
Un hook pide confirmación en el primer edit de código de la sesión si aún no hubo memoria y CodeGraph (el hook no cubre lo que haga un subagente: delegar la búsqueda no exime de este orden).

**Evidencia.** Toda afirmación sobre el código cita `archivo:línea` o salida real de un comando. No inventes rutas, APIs, comandos ni resultados de tests. Una afirmación de ausencia ("nadie llama a X", "no existe", "es código muerto") exige una búsqueda verificable y, si el índice puede estar incompleto, dilo. Di la incertidumbre en vez de suavizarla. Nunca ocultes un check fallido borrando el test o debilitando una aserción.

**Cero suposiciones.** La fuente de la verdad es el código real, no tu recuerdo, la memoria, un nombre que "suena bien" ni cómo suele hacerse. No inventes ni asumas: datos, firmas, comportamientos, rutas, flujos, el origen de un dato ni lo que un requisito "seguramente" quiere decir. No actúes si no estás 100 % seguro de que lo que vas a hacer es correcto según el código y los datos reales. Si algo es incierto, primero agota lo que puedas comprobar tú (código, CodeGraph, memoria, ejecutar, la documentación oficial de la librería). Si sigue sin estar claro, **no avances ni rellenes el hueco**; dilo sin rodeos, en una de estas formas:
- **"No lo sé."** y qué te falta para saberlo.
- **"No puedo hacerlo."** y por qué (qué dato, acceso o decisión no existe).
- **"No me queda claro X. Dame más contexto."** y la información exacta que necesitas (qué archivo, qué dato, qué comportamiento esperado), con opciones cerradas si las hay.
Una instrucción ambigua o que admite varias lecturas, o un código que no deja claro cómo hacerlo, es un motivo para preguntar, no para elegir una lectura y seguir. Tampoco reportes un resultado que no verificaste: no digas "debería funcionar"; di qué ejecutaste y qué viste, o di que no lo verificaste.
Esta regla se aplica con tu criterio en cada sesión y prompt, no como un guion literal: tú decides cuándo la información alcanza para actuar y cuándo falta. Ese criterio nunca autoriza a inventar ni a asumir para seguir adelante.

**Librerías y frameworks.** Antes de escribir o modificar código que use la API de una librería, framework, SDK o CLI, consulta Context7 (`resolve-library-id` → `query-docs`) con la versión del lockfile o `package.json` del repo; no uses tu recuerdo. Cita librería y versión consultadas; si no hay respuesta, di "No lo sé". No lo uses para código del repo ni lógica de negocio, y no envíes código del cliente ni secretos en la consulta.

**Autonomía.** Haz el trabajo que te corresponde. Pregunta solo lo que el código no puede responder y, cuando preguntes, da opciones cerradas. Preguntar no sustituye investigar: pregunta después de haber buscado, no en lugar de hacerlo.

**Memoria por cliente.** El proyecto de memoria lo resuelve el remote de git. No mezcles memoria entre proyectos salvo petición explícita del usuario.
