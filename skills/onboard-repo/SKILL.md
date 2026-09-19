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

## Phase 2 — Stack, from manifests

Read what exists. Do not infer from folder names.

| Manifest | Gives you |
|---|---|
| `package.json` | runtime deps, dev deps, **scripts**, package manager via the lockfile |
| `pyproject.toml` · `requirements.txt` · `Pipfile` | Python deps and tooling |
| `go.mod` · `Cargo.toml` · `composer.json` · `pom.xml` · `build.gradle` · `*.csproj` · `Gemfile` | language, version, deps |
| lockfile | the actual package manager — `pnpm-lock.yaml` means pnpm, not npm |
| `tsconfig.json` · `.eslintrc*` · `.prettierrc*` · `ruff.toml` · `.editorconfig` | tooling and style config |
| `Dockerfile` · `docker-compose*` · `*.tf` | runtime and infra |

Record **versions as declared**, not as remembered. If you need to know what a version implies,
ask Context7 rather than recalling it.

---

## Phase 3 — Testing capability *(the field that matters most)*

This decides whether TDD is ever offered in this repository. Get it right or mark it unknown.

### Look for

1. **A test framework in the manifest** — vitest, jest, pytest, go test, JUnit, RSpec, xUnit…
2. **Test files that actually exist** — `**/*.{spec,test}.*`, `test_*.py`, `*_test.go`, `src/test/**`. Count them.
3. **A runner command** — the `test` script, the documented command, or the framework's default.
4. **CI running them** — a workflow that invokes the runner is strong evidence the command works.

### Decide

| Evidence | `available` | What you write |
|---|---|---|
| Framework + test files + a runnable command | `true` | framework, runner, and how you detected it |
| Framework declared but **zero test files** | `false` | note it: the dependency exists, the practice does not |
| Test files but no runner you can name | `unknown` | **ask the human for the command** |
| Nothing | `false` | say so plainly |

**Never invent a test command.** `pnpm test` is a guess unless you saw it in `scripts`.

`tdd.mode` starts at `ask` when `available: true`, and is omitted entirely when it is `false`.

---

## Phase 4 — Commands

Take them from `scripts`, the Makefile, the CI workflow or the README — **verbatim**. Do not
normalize `yarn` to `npm`, and do not invent a `lint` script that does not exist.

Mark each with where you found it. A command nobody wrote down is `unknown`, not a best guess.

---

## Phase 5 — Architecture and conventions

Map the real structure: entry points, layers, where routing lives, where data access lives, where
shared types live.

For each convention you record, **cite at least two occurrences**. One example is a coincidence.

| Convention | How you evidence it |
|---|---|
| Naming (files, components, tests) | two paths |
| Layering and boundaries | two imports that respect it |
| Error handling | two call sites |
| Docstring style | two functions |
| State management, data fetching | two usages |

A pattern you saw once goes in as an observation, not a rule. A pattern you cannot evidence does
not go in at all.

Four or more files to understand a layer → delegate to `scout` instead of reading them yourself.

---

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
