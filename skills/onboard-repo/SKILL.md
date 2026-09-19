---
name: onboard-repo
description: "Learn a repository and write its PROJECT.md. Trigger: entering an unfamiliar repo, PROJECT.md is missing or stale, or the human asks to onboard/index the project. Detects stack, commands, conventions and testing capability from evidence — never from the repository name."
disable-model-invocation: false
argument-hint: "(none)"
allowed-tools: Read, Glob, Grep, Write, AskUserQuestion, Task, Bash(ls:*), Bash(cat:*), Bash(git remote:*), Bash(git log:*)
---

# /onboard-repo — Learn this repository

## Session context

Repository root:
!`ls -1 2>/dev/null | head -30 || echo "cannot list"`

Git remote:
!`git remote get-url origin 2>/dev/null || echo "no remote"`

Existing PROJECT.md:
!`cat PROJECT.md 2>/dev/null | head -40 || echo "PROJECT.md does not exist"`

---

This replaces having a skill per stack. Instead of teaching you React, Vue, Nuxt and Python, you
**read the repository** and record what it actually does.

Output: `PROJECT.md` at the root. It is the half of the context that belongs to the client, and it
is the file every later session reads first.

**Everything you write must have evidence behind it.** A field you could not determine is marked
`unknown` and asked about — never filled with a plausible guess.

---

## Phase 1 — Index

If a code graph component is available, index the repository now and pull the architecture
overview: languages, packages, entry points, routes, hotspots, clusters.

Not available → say so once and continue with manifests and globs. The rest of this skill works
either way.

> *"Sin grafo en este setup: voy con manifiestos y estructura de archivos."*

---

## Phases 2–5 — Gather the evidence

Lookup tables for all four: `references/detection.md`. Read it now.

**2. Stack** — from manifests only. Never from folder names. Versions as declared.

**3. Testing capability** — the field that matters most: it decides whether TDD is ever offered
here. Framework + test files + a runnable command -> `true`. Framework but zero test files ->
`false`. Test files but no runner you can name -> `unknown`, and **ask for the command**.
**Never invent a test command.**

**4. Commands** — verbatim from `scripts`, the Makefile, CI or the README. Mark where each came
from. A command nobody wrote down is `unknown`.

**5. Architecture and conventions** — map entry points, layers, where routing and data access live.
**Cite two occurrences** for every convention you record; one is a coincidence. Four or more files
to understand a layer -> delegate to `scout`.

## Phase 6 — Write and confirm

1. Write `PROJECT.md` at the root, following `assets/PROJECT.template.md` next to this skill.
2. **Show the human what you wrote**, highlighting:
   - anything marked `unknown`
   - the testing decision and the evidence behind it
   - any convention you inferred rather than verified
3. Ask about the `unknown` fields — in one block, with options where you can offer them.
4. Apply their corrections.

Then say, in one line, that later sessions will read this file first and that it should be
committed with the repository.

**Do not commit it.** The human commits.

---

## Rules

- **Evidence or `unknown`.** Never a plausible-sounding guess. A wrong `PROJECT.md` poisons every future session in this repository.
- **Never infer the stack from the repository name**, the folder name or the git remote.
- **Do not read `.env`**, credentials or local databases. If you need to know which variables exist, read `.env.example`.
- **Do not record business logic or client-identifying detail** beyond what a developer needs to work here.
- Keep it under roughly 150 lines. This file is loaded in **every** session: every line costs tokens every time.
- Write it in English (→ `behavior/language.md`), unless the repository's existing docs are in another language.

## When PROJECT.md already exists

Do not overwrite it blindly. Read it, compare against what you found, and report the **drift**:

> *"`PROJECT.md` dice vitest, pero `package.json` ya no lo declara y hay 0 archivos `*.spec.ts`.
> ¿Lo actualizo?"*

Preserve everything the human wrote by hand that you cannot verify either way.
