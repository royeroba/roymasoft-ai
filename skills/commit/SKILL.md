---
name: commit
description: "Redacta el mensaje de commit en Conventional Commits para los cambios actuales. Trigger: el usuario pide 'haz el commit', 'commitea', 'mensaje de commit', 'qué mensaje le pongo' o 'prepara el commit'. Lee el diff, propone tipo, scope y descripción, y entrega el mensaje listo; el commit lo ejecuta el usuario, no tú."
disable-model-invocation: false
argument-hint: "opcional: contexto o ticket (por ejemplo ABC-123)"
---

# /commit — Mensaje de commit (Conventional Commits)

Lees el cambio y entregas un mensaje en [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). **No ejecutas `git add`, `git commit`, `git stage` ni `push`**: el commit lo hace el usuario y un hook lo bloquea. Aunque pida "hazlo tú", explica que la regla del plugin lo impide y entrégale el mensaje y el comando.

## Cuándo usar / cuándo no

- Úsala cuando pidan hacer, preparar o redactar un commit, o el mensaje de uno.
- No la uses para amend, rebase, squash ni para abrir un PR; para eso, dilo y pregunta.

## 1. Lee el cambio (solo lectura)

1. `git status --short` y `git diff --staged`. Si no hay nada en stage, usa `git diff` y avisa: "no hay nada en stage; me baso en el árbol de trabajo".
2. `git log --oneline -10` para copiar **el idioma y el estilo de scope** del repo. Si el historial no es consistente, usa el idioma del usuario en el chat.
3. Si no hay cambios, dilo y termina.

## 2. ¿Un commit o varios?

Si el diff mezcla propósitos sin relación (un fix y un refactor, o código y docs de otra cosa), **propón varios commits**: para cada uno, la lista de archivos y su mensaje. El usuario hace el stage de cada grupo. No fuerces la división si el cambio es una sola unidad.

## 3. Arma el mensaje

```
<tipo>[scope opcional][!]: <descripción>

[cuerpo opcional]

[pie opcional]
```

| Tipo | Cuándo |
|---|---|
| `feat` | Funcionalidad nueva para el usuario |
| `fix` | Corrección de un bug |
| `docs` | Solo documentación |
| `style` | Formato sin cambio de lógica |
| `refactor` | Cambio interno sin arreglar ni añadir |
| `perf` | Mejora de rendimiento |
| `test` | Añadir o corregir tests |
| `build` / `ci` | Dependencias, build, pipelines |
| `chore` | Mantenimiento que no encaja arriba |
| `revert` | Deshace un commit anterior |

Reglas verificables:

- **Descripción:** imperativo, minúscula inicial, sin punto final, máximo 72 caracteres, dice **qué cambió y por qué importa**, no cómo.
- **Tipo:** el que describe el efecto, no el archivo. Un cambio en `README` que corrige un comando roto es `docs`; un cambio de comportamiento con test es `fix` o `feat`.
- **Scope:** solo si el repo ya lo usa (paso 1.2) y es un módulo real, no inventado.
- **Cuerpo:** solo si el porqué no cabe en la descripción. Líneas de 72 como máximo.
- **Cambio incompatible:** `!` tras el tipo o scope **y** un pie `BREAKING CHANGE: <qué se rompe y cómo migrar>`.
- **Pie con ticket:** `Refs: ABC-123` si el usuario lo dio. No inventes números.

Correcto:
```
fix(auth): evita cerrar sesión al renovar el token expirado

El interceptor reintentaba sin esperar el refresh y borraba la sesión.
```

Incorrecto:
```
Fixed stuff and updated files.
```
Falla porque no tiene tipo, está en pasado, no dice qué se arregló y no es verificable.

## 4. Entrega

1. Muestra el mensaje en un bloque de código.
2. Da el comando para que el usuario lo ejecute, en un bloque `bash` aparte, con `git commit -m "<línea>"` si es de una línea o con un archivo de mensaje si tiene cuerpo.
3. Lista los archivos que irían en el commit y cualquier archivo que **no** debería ir.

## 5. Alertas

- Si el diff incluye secretos (`.env`, llaves, tokens, credenciales), **no redactes el commit**: avísalo primero.
- Si hay archivos generados, binarios o lockfiles sin relación, señálalos.
- Si no entiendes el propósito del cambio, pregunta; no lo adivines a partir de nombres de archivo.

## Checklist final

- [ ] Leí el diff real, no supuse
- [ ] No ejecuté `git add`, `git commit` ni `git stage`
- [ ] Tipo correcto según el efecto
- [ ] Descripción en imperativo, minúscula, sin punto, 72 caracteres o menos
- [ ] `BREAKING CHANGE` si el cambio rompe compatibilidad
- [ ] Idioma y scope coinciden con el historial del repo
- [ ] Revisé secretos y archivos que no deberían ir
