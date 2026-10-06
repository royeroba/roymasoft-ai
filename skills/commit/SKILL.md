---
name: commit
description: "Hace el commit de los cambios actuales con mensaje en Conventional Commits. Trigger: el usuario pide 'haz el commit', 'commitea', 'mensaje de commit', 'qué mensaje le pongo' o 'prepara el commit'. Lee el diff, propone tipo, scope y descripción, muestra el mensaje y, con el visto bueno del usuario, hace el stage y el commit."
disable-model-invocation: false
argument-hint: "opcional: contexto o ticket (por ejemplo ABC-123)"
---

# /commit — Commit en Conventional Commits

Lees el cambio, redactas un mensaje en [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) y, con el visto bueno del usuario, haces el stage y el commit. **Nunca haces `git push`** (eso lo cubre `/crear-pr`). Un hook pide confirmación en pantalla en cada `git add` y `git commit`: es lo esperado, no lo evites.

## Cuándo usar / cuándo no

- Úsala cuando pidan hacer, preparar o redactar un commit, o el mensaje de uno. Si solo piden el mensaje, entrégalo sin ejecutar nada.
- No la uses para amend, rebase, squash ni para abrir un PR; para eso, dilo y pregunta.
- Nunca la dispares por iniciativa propia ni al terminar otra tarea.

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

## 4. Muestra y confirma

1. Muestra el mensaje en un bloque de código, los archivos que irían en el commit y cualquier archivo que **no** debería ir.
2. Pregunta: "¿Hago el commit así?". Sin un sí explícito, no ejecutes nada. Si pidió solo el mensaje, termina aquí.

## 5. Ejecuta

1. Haz el stage **solo de los archivos listados** (`git add <archivos>`), nunca `git add .` ni `-A`, y no incluyas archivos con secretos.
2. `git commit` con el mensaje confirmado. Si tiene cuerpo, usa un archivo de mensaje temporal fuera del repo y bórralo después. Nunca `--no-verify`.
3. Si un hook de git falla, muestra el error y detente: no reintentes con otro mensaje ni saltándote el hook.
4. Con varios commits, ejecútalos uno por uno en el orden propuesto.
5. Muestra `git log --oneline -n` con lo creado. Deja sin stage todo lo que no pertenezca al commit.

## 6. Alertas

- Si el diff incluye secretos (`.env`, llaves, tokens, credenciales), **no redactes el commit**: avísalo primero.
- Si hay archivos generados, binarios o lockfiles sin relación, señálalos.
- Si no entiendes el propósito del cambio, pregunta; no lo adivines a partir de nombres de archivo.

## Checklist final

- [ ] Leí el diff real, no supuse
- [ ] No ejecuté `git add` ni `git commit` sin el sí explícito del usuario
- [ ] Stage solo de los archivos listados, sin `git add .` ni `--no-verify`
- [ ] No hice `git push`
- [ ] Tipo correcto según el efecto
- [ ] Descripción en imperativo, minúscula, sin punto, 72 caracteres o menos
- [ ] `BREAKING CHANGE` si el cambio rompe compatibilidad
- [ ] Idioma y scope coinciden con el historial del repo
- [ ] Revisé secretos y archivos que no deberían ir
