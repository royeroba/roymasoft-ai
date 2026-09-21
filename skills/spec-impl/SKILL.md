---
name: spec-impl
description: "Implement an approved spec. Trigger: the human names a spec to implement, confirms in natural language that an already-Approved spec should be built now ('dale', 'implementá esto', 'seguí'), or runs /spec-impl explicitly. Refuses unless the spec's state means Approved, creates the branch, implements step by step pausing for diff review, and ends with a fresh-subagent regression audit before handing off for commit. Never commits."
disable-model-invocation: false
argument-hint: "<NN-spec-name>"
allowed-tools: Read, Glob, Grep, Edit, Write, AskUserQuestion, Task, Bash(git status:*), Bash(git branch:*), Bash(git checkout:*), Bash(git log:*), Bash(git diff:*), Bash(cat:*), Bash(ls:*)
---

# /spec-impl — Implement an approved spec

## Session context

Working tree:
!`git status --short 2>/dev/null || echo "not a git repository"`

Current branch:
!`git branch --show-current 2>/dev/null || echo "unknown"`

Available specs:
!`ls specs/ 2>/dev/null || echo "specs/ does not exist"`

Branch config:
!`cat specs/.spec-config.yml 2>/dev/null || echo "AutoCreateBranch: true (default, no config file)"`

---

Five phases, in strict order. **Do not advance if the previous one did not complete.**

---

## Phase 1 — Identify the spec

Argument received: `$ARGUMENTS`

**Empty** → list the specs above, ask which one, stop and wait.

**Present** → find the file in `specs/`. The human may have written the full name
(`01-csv-export`), just the number (`01`), or just the slug (`csv-export`). Resolve any of them.
Not found → show what exists and ask.

---

## Phase 2 — Validate the state

Read the spec. Find the status line near the top — usually `**Status:**`, but it may be labelled in
another language. Match by **position and meaning**, not by the exact label.

**Absolute rule: continue only if the state means "Approved".**

| Category | Examples | Action |
|---|---|---|
| Approved | `Approved`, `Aprobado`, `Aprovado`, `Approuvé`, `Genehmigt` | Continue |
| Draft | `Draft`, `Borrador` | **Stop** |
| In review | `In review`, `En revisión` | **Stop** |
| Implemented | `Implemented`, `Implementado` | **Stop** |
| Obsolete | `Obsolete`, `Obsoleto` | **Stop** |
| Not found / unrecognized | — | **Stop.** The file does not follow the expected format |

Unsure whether a value means approved? **Do not assume.** Stop and ask.

### Standard refusal

```
❌ No puedo implementar esta spec.

Estado actual: [STATE FOUND]
Solo trabajo con specs cuyo estado signifique "Approved".

Dos opciones:
  1. Si está lista, abre el archivo y cambia el estado a "Approved" a mano.
     Ese cambio lo hace el humano, no el agente.
  2. Si le falta trabajo, usa /spec [nombre] para retomarla.
```

**Do not offer alternatives. Do not suggest "puedo ir empezando igual".** The block is deliberate.

---

## Phase 3 — Branch

**0. Check the working tree first.** If `git status --short` above is **not empty**, stop and show
the pending changes:

```
⚠️ Hay cambios sin commitear. Cambiar de rama se los lleva. ¿Qué hacemos?
   1. Los commiteas o guardas tú, y relanzas  (recomendado)
   2. Seguimos igual — los cambios viajan a la nueva rama
```

Wait. **Never stash or commit on the human's behalf** unless they explicitly ask.
Clean tree → skip straight to step 1 without mentioning it.

1. Branch name from the spec filename without extension: `spec-NN-slug`.
2. Read `AutoCreateBranch` from the config above. Missing, absent or unrecognized → treat as `true`. Only an explicit `false` disables it.
   - **`true`**: create and switch without asking. If the branch already exists, this is a resume: switch to it, read `git log --oneline`, and propose which step to continue from. Wait for confirmation on the resume point.
   - **`false`**: ask `Create and switch to spec-NN-slug? [y/N]`. On no, implement on the current branch — and ask for explicit confirmation to do so.
3. Confirm what is active:

```
✅ Listo para implementar.
   Spec:   specs/NN-slug.md
   Rama:   spec-NN-slug (activa)
   Estado: Approved
```

4. **Do not start implementing yet.** Show the spec summary first: objective · scope · implementation plan · acceptance criteria. Match section headings by meaning; the spec may be authored in any language.

---

## Phase 4 — Resolve TDD

Read `testing.available` from `PROJECT.md` and apply the cascade in `behavior/verification.md`.

| Situation | Do |
|---|---|
| `testing.available: false` | **Do not mention TDD.** Say which functional checks you will run instead |
| `tdd.mode: on` | Announce it and follow `contracts/tdd-strict.md` |
| `tdd.mode: off` | Respect it. Functional checks still run |
| `tdd.mode: ask` or missing | **Offer once**, with the runner you found, and wait |

> *"El repo usa vitest (`pnpm test {file}`). ¿Vamos con TDD — test primero — o implemento y verifico después?"*

Whatever is resolved travels with every delegation and is restated on resume.

---

## Phase 5 — Implement, step by step

```
Voy a implementar siguiendo el plan exactamente.
Paro después de cada paso para que revises el diff.

¿Empezamos con el paso 1?
```

Wait for explicit confirmation. Do not start without it.

### Rules for the whole implementation

**Never commit. Not per step, not at the end.** You write the code and show the diff; committing is
the human's decision and the human's command.

**Implement what the spec says.** If something looks suboptimal, say so as an observation and
implement what was agreed. Changes to the spec go into the spec, not silently into the code.

**Delegate when the triggers fire** (→ `behavior/routing.md`). A step touching 2+ non-trivial files
goes to a `worker` with derived `## Allowed edit surfaces`. Verification goes to `verifier`. You
derive the surfaces — never ask the human for globs.

### Rhythm

1. Implement one step of the plan.
2. If TDD is active: observed RED → GREEN → triangulate → refactor, per `contracts/tdd-strict.md`.
3. Run the step's check. Report `<command>: <observed result>`.
4. Show which files changed and what they do now.
5. Say: `Paso N hecho. ¿Reviso el diff contigo y sigo con el N+1?`
6. **Wait for confirmation.**

### When you hit an ambiguity the spec does not resolve

Stop. Describe it exactly. Offer two or three concrete options with a recommendation. Wait. **Do not
improvise.**

### When the human asks for something outside the spec's scope

Say it is out of scope for this spec. Suggest noting it for the next one. Do not implement it on
this branch.

### When something fails

Fix the cause. **Never delete the failing test, weaken the assertion, or remove the check that
exposed it.** If you cannot make it work, revert your own change, leave the tree as you found it,
and say so.

---

## Closing

```
✅ Todos los pasos del plan están implementados.

Verificando criterios de aceptación uno a uno...
```

1. Verify each acceptance criterion from the spec against what was built. Report each as
   `<criterion>: <observed>` — never "should work."
2. Delegate to `auditor` (→ `agents/auditor.md`) for a holistic regression check: fresh context, a
   different question than the acceptance criteria — whether *anything else* broke. Pass it the
   spec path and note the diff is everything since the branch was created; let it read the diff
   itself rather than summarizing the implementation for it.
3. **On `NO PASA`**: show the breakage table as-is. Hand the rows to a `worker` (or fix directly
   only if it is a single mechanical line, at your judgment), then re-run the auditor after the
   fix. Do not tell the human it is done.
4. **On `PASA`**:

```
✅ Auditoría: PASA. No se detectaron regresiones.

Siguiente: cambia el estado de la spec a "Implemented" y haz el commit final
antes de mergear esta rama.
```

Save to memory: the decision, the root causes found, and anything durable learned. Scope `project`.
