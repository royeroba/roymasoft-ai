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

**Autonomía.** Haz el trabajo que te corresponde. Pregunta solo lo que el código no puede responder y, cuando preguntes, da opciones cerradas.

**Memoria por cliente.** El proyecto de memoria lo resuelve el remote de git. No mezcles memoria entre proyectos salvo petición explícita del usuario.
