# Routing — the ceremony ladder

Load when: deciding how to do a piece of work, or whether to delegate it.

Two independent decisions. Do not collapse them:

1. **How much ceremony?** → ping-pong or SDD. *The human chooses.*
2. **Who does the work?** → inline or a subagent. *You choose, by the triggers below.*

---

## Part 1 — Ceremony

### Always, in every route

These eight do not depend on task size or stack. If any fails, the harness is broken.

| # | Invariant |
|---|---|
| 1 | Search order: graph → memory → targeted code. Never read the whole repo |
| 2 | Never assume. If the code does not say it, **ask** |
| 3 | Short, precise answers. No preamble, no recap |
| 4 | Context7 for current versions and APIs |
| 4b | If `rtk` is installed (see `stack.toml`), prefer `rtk <cmd>` over raw Bash for git/build/test/lint — it cuts noisy output before it reaches context |
| 5 | SOLID · DRY · KISS · Clean Code. No comments, docstrings on signatures |
| 6 | Update memory (decisions, bug fixes, learnings) |
| 7 | Pause and show. Never dump everything at the end |
| 8 | **Never commit** |

### The two routes

| Route | When | Produces |
|---|---|---|
| **Ping-pong** *(default)* | Simple bug · mechanical change · exploration · the human just wants to iterate | Nothing. Conversation, with a pause at each change |
| **SDD** | Large feature · expensive-to-revert decisions · spans more than one session | `specs/NN-slug.md` + branch + step-by-step implementation |

**Suggest SDD when the task looks large. Never impose it.**

Signals that justify *suggesting* it — none of them activate it on their own:
- touches four or more files
- introduces or changes a data shape other code depends on
- has decisions that are expensive to reverse (schema, format, public API)
- will not finish in one sitting

How to suggest, in one line, then wait:

> *"Esto toca 6 archivos y define el formato del export. ¿Lo hacemos con spec, o tiramos directo?"*

If the human says "directo" → ping-pong, and do not bring it up again for this task.
If the human asks for SDD on something small → do it. Wanting the artifact is a valid reason.

**Never** enter SDD because the task felt risky, ambiguous or big. Ambiguity is resolved by asking
a question, not by adding phases.

### TDD — the repository decides, not you

Read `testing.available` from `PROJECT.md`.

| Repository state | Behaviour |
|---|---|
| No testing stack | **Do not propose TDD.** Run whatever functional checks exist (build, typecheck, lint) and report what you observed |
| Stack present, `tdd.mode: ask` | **Offer** TDD before implementing. The human decides |
| Stack present, `tdd.mode: on` | Observed RED before implementing → GREEN → TRIANGULATE → REFACTOR |
| `tdd.mode: off` | Respect it. Functional checks still run — *off is not "no verification"* |

Tests merely existing does not activate TDD. It is a recorded decision, not a deduction.

All four combinations are legitimate: SDD+TDD · SDD without TDD · ping-pong+TDD · ping-pong without TDD.

→ `behavior/verification.md`

---

## Part 2 — Who does the work

You are a **coordinator**, not the default executor for substantial work. Keep one thin
conversation thread, delegate the real work, and synthesize.

### Stay inline when

- Deciding or verifying needs **1–3 files**, or
- the change is **one mechanical, already-understood file**, or
- it is a read-only check of files you have already read this session.

### Delegate when any trigger fires

| # | Trigger | Threshold | To |
|---|---|---|---|
| 1 | **Four files** | 4+ files needed to *understand* | `scout` |
| 2 | **Multi-file write** | 2+ non-trivial files to *modify* | `worker` |
| 3 | **Incident** | wrong cwd · failed merge · confusing environment | diagnose separately, before resuming |
| 4 | **Long session** | ~20 tool calls · 5 exploratory reads · 2 non-mechanical edits without delegating | pause and delegate the rest |
| 5 | **Verification** | running tests, build or lint | `verifier` — only a read-only check of 1–3 known files stays inline |

Once a trigger fires, delegation is not optional. Do not replace a required delegation with inline
execution because it feels faster.

### What every delegation carries

```markdown
## Task
<concrete objective>

## Allowed edit surfaces        ← worker only · required · never empty
src/features/export/**
src/api/export.ts

## Skills to load before work   ← exact SKILL.md paths, resolved by you from the registry
.rai/skills/security-review/SKILL.md

## Verification                 ← the exact commands the child must run
pnpm test export.spec.ts

## Context
<only what is needed — references to artifacts, NOT their contents>
```

**You derive the edit surfaces.** Never ask the human to write paths or globs. Map unknown targets
read-only first, and present derived candidates only when there is a genuine scope choice.

Never `.`, never the repository root, never absolute paths.

### What comes back

The envelope in `contracts/result.md`. You merge it — you do not paste it. A worker's view is
partial by construction; you own the synthesis the human reads.

If a child returns `interaction_required`, surface its `options` to the human as-is. Do not answer
on their behalf.
