---
name: crear-skill
description: "Crea o revisa una skill (o decide que debe ser una regla) para el plugin roymasoft-ai. Trigger: el usuario pide 'crea una skill', 'haz un skill de X', 'nueva skill', 'mejora/revisa esta skill' o 'esto debería ser skill o regla'. Decide el tipo, escribe SKILL.md con reglas verificables y valida con el checklist."
disable-model-invocation: false
argument-hint: "qué debe hacer la skill"
---

# /crear-skill — Crear o revisar una skill

Se guía por la documentación oficial de Claude Code (`code.claude.com/docs/en/skills`) y por la guía de reglas verificables del usuario. Si dudas de un campo o límite, **consulta Context7** (`/websites/code_claude`); no lo supongas.

## 1. ¿Regla o skill?

| Es... | Responde a | Dónde va |
|---|---|---|
| **Regla**: convención ("cómo debe verse X": nombres, estructura, límites) | ¿Cómo debe verse esto? | `rules/*.md` o un párrafo en `rules/behavior.md` |
| **Skill**: flujo con pasos ("qué hago para X") | ¿Qué pasos sigo? | `skills/<nombre>/SKILL.md` |

Si es una regla, dilo, propón dónde va y **no crees una skill**. Una skill **enlaza** las reglas; nunca las copia.

## 2. Antes de escribir

- Comprueba que no exista ya algo equivalente (`skills/`, `rules/`, skills globales). Si existe, propón ampliarlo.
- Confirma con el usuario: qué dispara la skill, qué entrega y qué **no** hace. Si el pedido es ambiguo, pregunta con opciones cerradas.
- **Tipo:** *workflow* (pasos con orden fijo, como `/rdd`) o *dispatcher* (muchas convenciones: `SKILL.md` corto que enruta a `references/<tema>.md`).

## 3. Escribe el `SKILL.md`

**Frontmatter** (todos los campos son opcionales; solo `description` es recomendada):

- `name`: kebab-case. Por defecto es el nombre de la carpeta.
- `description`: qué hace y cuándo usarla, con **el caso de uso principal primero**. Con `when_to_use` se corta a 1.536 caracteres en el listado. Incluye frases que el usuario diría de verdad.
- `disable-model-invocation: true` si solo debe correr cuando el usuario la invoca con `/` (acciones con efecto externo, como abrir un PR). `false` si Claude puede dispararla solo.
- `argument-hint`, `allowed-tools`: solo si hacen falta.
- Un campo mal escrito se **ignora sin avisar**: copia el nombre exacto. El `---` de apertura va en la primera línea.

**Cuerpo:**

1. Un párrafo: qué hace y qué **no** (por ejemplo, "no edita, no hace commit").
2. **Cuándo usar / cuándo no**, con condiciones claras.
3. Pasos numerados, accionables y verificables. Cada regla debe poder comprobarse a ojo en un diff o en una salida.
4. Para cada regla no obvia, un ejemplo **correcto y uno incorrecto** con el porqué. Saca los ejemplos del código real, no los inventes.
5. Lo que haga si algo falla ("si no se puede, dilo; no inventes").
6. Checklist final.

**Tamaño:** meta propia, menos de 200 líneas (la documentación oficial permite hasta 500). Si crece, mueve el detalle a archivos aparte referenciados desde `SKILL.md` con qué contienen y cuándo leerlos.

### Description: correcto e incorrecto

Correcto:
> `description: "Redacta y abre el PR del cambio actual. Trigger: 'crea el PR', 'abre un pull request'. Resume el diff, lista riesgos y no hace push sin permiso."`

Incorrecto:
> `description: "Skill útil para trabajar con código de forma limpia y ordenada."`

Falla porque no dice cuándo usarla ni qué entrega: Claude no puede decidir si aplica, y "limpia y ordenada" no se verifica.

## 4. Valida

- Corre `claude plugin validate .` en la raíz del repo.
- Sube la versión en `.claude-plugin/plugin.json` y `marketplace.json` si la caché debe actualizarse (el repo no lo hace solo).
- Prueba el disparo con 2 o 3 frases reales del usuario. Para medirlo de forma repetible, un caso de eval con grader `tool_used: Skill` y `claude plugin eval`.
- No hagas commit ni stage. Muestra los archivos tocados.

## 5. Checklist final

- [ ] ¿Era skill y no regla?
- [ ] Nombre en kebab-case y carpeta `skills/<nombre>/`
- [ ] `description` con el caso de uso primero y frases reales
- [ ] "Cuándo usar / cuándo no" claros
- [ ] Pasos accionables y verificables, sin criterios subjetivos
- [ ] Ejemplo correcto e incorrecto en lo no obvio
- [ ] Enlaza las reglas, no las copia
- [ ] Menos de 200 líneas (o detalle movido a archivos aparte)
- [ ] `claude plugin validate .` pasa
- [ ] Probada con frases reales de disparo
