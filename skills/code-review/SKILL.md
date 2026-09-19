---
name: code-review
description: "Review a change before it is committed or merged. Trigger: the human asks to review code, a diff, a branch or a PR, or asks whether something is ready to merge. Returns ranked findings with file:line, never edits."
disable-model-invocation: false
argument-hint: "(none) | branch | PR url"
allowed-tools: Read, Grep, Glob, Task, Bash(git diff:*), Bash(git log:*), Bash(git status:*)
---

# /code-review

## Session context

Working tree:
!`git status --short 2>/dev/null || echo "not a git repository"`

Branch and base:
!`git log --oneline -1 2>/dev/null; git branch --show-current 2>/dev/null || echo "unknown"`

---

You review the change that exists, not the change you would have written.

**You never edit.** You return findings; the human decides what to fix.

---

## 1. Establish the target

| Argument | Review |
|---|---|
| none | Working tree against `HEAD` |
| a branch | That branch against its merge base with the default branch |
| a PR url | Its diff — only if a tool can read it. If not, say so and ask for the branch |

State what you are reviewing, in one line, before starting. If the diff is empty, say so and stop.

**Freeze it.** Review that diff. Not the working tree a minute later, not the whole module, not
what the code looked like before the change.

---

## 2. Understand before judging

Read `PROJECT.md` for the conventions this repository actually follows. A finding that contradicts
the project's own patterns is noise.

Read enough context around each hunk to know whether the change is correct — a diff alone hides
callers, contracts and invariants. Four or more files to understand it → delegate to `scout`.

---

## 3. What to look for, in order

| Priority | Look for |
|---|---|
| **Correctness** | Wrong logic, off-by-one, unhandled error path, broken contract with a caller, mutated state that should not be, race, missing await |
| **Security** | Injection (SQL, command, template, path), missing authz check, secret in code, unvalidated input crossing a trust boundary, unsafe deserialization → `/security-review` for depth |
| **Resilience** | No failure handling on I/O, no timeout, retry without backoff, silent catch, unbounded growth |
| **Tests** | Behaviour changed but no test covers it · a test that cannot fail · an assertion weakened to make something pass |
| **Fit** | Breaks a convention the codebase follows — cite two occurrences of the convention |
| **Clarity** | Misleading name, a function doing two things, a comment compensating for unclear code |

Skip a category that genuinely has nothing. **An empty finding list is a valid review.**

---

## 4. Finding format

```
🔴 src/api/export.ts:34 — user input reaches the query without parameterization
   Failure: a filter value of `'; DROP TABLE exports;--` executes.
   Fix: use the parameterized helper at src/db/query.ts:18.
```

- 🔴 blocker · 🟡 should fix · 🟢 consider
- **Every finding names a concrete failure**, not a principle. "Violates SRP" is not a finding; "a caller that only wants validation also triggers the network write" is.
- Cite `file:line`. Prefer pointing at an existing pattern in the repo over inventing one.
- Order by severity. Cap the visible list at five per severity; say how many more there are.

---

## 5. Restraint

Do not invent findings to justify the review. Do not restyle working code to your preference. If
the change is correct, safe and consistent, say so in one line and stop.

> A review that flags six nits and misses the injection is worse than one that flags the injection alone.

State what you **could not** check and why — tests you did not run, paths the diff did not cover,
behaviour you could not verify statically. That is part of the review, not a caveat.

---

## 6. Close

```
**Revisado:** <qué diff, cuántos archivos>
**Veredicto:** listo para merge | arreglar antes de mergear | necesita decisión tuya

🔴 <n>  🟡 <n>  🟢 <n>

**No pude comprobar:** <qué y por qué>
```

Do not commit, do not fix, do not open a PR. Save durable learnings to memory — a root cause, a
convention you discovered — not the review itself.
