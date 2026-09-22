# Memory

Load when: starting work that may already have been done, or closing out a decision.

Memory is a curated project record, not a transcript sink.

---

## Client isolation — read this first

This harness is used across **different companies**. Their code, decisions and constraints must
never meet.

| Rule | |
|---|---|
| Scope is always `project` | Never `global`. Never `personal` for work content |
| Never query across projects | No `all_projects`, no cross-project search, ever |
| Project identity comes from the git remote | Not the folder name, not the conversation |
| Never quote another client's code, names or decisions | Even as an example. Even anonymized |

If you are ever unsure which project you are in, check before reading or writing memory. A wrong
write is a confidentiality incident, not a bug.

---

## Read before you work

At the start of related work, and before revisiting any decision that might already exist:

1. Recover recent session context — what was I doing here last time?
2. Search with focused terms from the request before answering.
3. Search results are **previews**. Retrieve the full entry before relying on its content.

If the human's first message references the project, a feature or a problem, search **before**
responding. Repeating work that is already recorded is the cost this exists to avoid.

---

## Proactive save — non-negotiable

If `engram` (or whatever memory component is active) is connected, its own server instructions
already say this — do not water it down to "save deliberately at some point":

> **Call `mem_save` immediately after ANY decision, bug fix, discovery, or convention — not just
> when asked.**

Same source, engram's own docs (`docs/AGENT-SETUP.md`, "Surviving Compaction"): *"Save proactively
after significant work — don't wait to be asked."*

| Trigger | Do it |
|---|---|
| A decision gets made — including a rejected option | `mem_save` before the next step, not batched |
| A bug gets fixed | `mem_save` with the root cause, right after it is confirmed working |
| A non-obvious behaviour or gotcha surfaces | `mem_save` on the spot, not deferred to the summary |
| A convention gets confirmed from the code | `mem_save` once you have two occurrences |

**Waiting to be asked, or saving only in the end-of-session summary, is the failure mode** — a
session with real decisions and zero `mem_save` calls mid-session is a defect. Catch it while it is
happening, not in hindsight when the human asks what you saved.

### Alignment check — engram's own rules vs this file

Verified against `github.com/Gentleman-Programming/engram` (README usage-intent table +
`docs/AGENT-SETUP.md`) so this file never drifts softer than the tool it wraps:

| Engram's rule (source) | Covered here |
|---|---|
| Save proactively, immediately, don't wait to be asked (`AGENT-SETUP.md`, server instructions) | `## Proactive save — non-negotiable`, above |
| Save bugfixes, decisions, discoveries, config changes, patterns, constraints — not raw output or every turn (README) | `## Write deliberately`, below |
| Stable `topic_key` for evolving knowledge, reused instead of duplicated (README) | `### Evolving topics`, below |
| `mem_session_summary` — goal, discoveries, work done, next steps, files — before ending (README) | Last bullet of `## Write deliberately` |
| After compaction: persist the handoff first, then recover recent context (README) | `hooks/session-start.mjs` injects this generically on `source: compact` — it does not name engram's tools, this row is the reminder to use `mem_session_summary` then `mem_context` when engram is what's active |

If engram's own docs change, this table is what to re-check first — it is the drift detector.

## Write deliberately

Save:

- **Decisions** — architecture, convention, tooling, workflow. Including the rejected option and why.
- **Bug fixes** — with the root cause, not just the patch.
- **Discoveries** — non-obvious behaviour, gotchas, edge cases.
- **Conventions** found in the code that are not written down anywhere.
- **Constraints and preferences** the human stated.
- **Session summary** at the end: goal, discoveries, what was done, next step, relevant files. This
  is engram's own closing rule (`mem_session_summary` before ending) — the harness inherits it, it
  does not replace mid-session saves.

Do not save: raw tool output, file contents, conversation turns, or "I read X and then Y".

### Shape

```markdown
**What**:    Added retry-safe upload handling.
**Why**:     Retries could create duplicate records.
**Where**:   src/upload/handler.ts
**Learned**: The request id already works as an idempotency key.
```

Short searchable title. A type that fits: decision · architecture · bugfix · pattern · config ·
discovery · learning.

### Evolving topics

Give a topic that will keep changing a **stable key** — `architecture/auth-model`,
`convention/error-handling` — and reuse it, so the entry is updated instead of accumulating
competing versions of the same fact.

---

## Trust, but check freshness

A retrieved memory describes what was true **when it was written**. Before relying on one that
names a file, a function, a flag or a version: **verify it still exists.**

If a memory is marked stale or needs review, treat it as context to confirm, not as fact. Surface
it to the human rather than acting on it silently. Never mark something reviewed on your own — that
is the human's call.

---

## Honesty about persistence

Writes are not atomic and memory can be unavailable.

- Write locally first, then mirror. **Read back both.**
- If the mirror fails, keep the local record, mark the mirror pending, and **say so**.
- **Never claim persistence succeeded when you did not confirm it.**
- Memory failing never blocks the answer: finish the human's request, then report the limitation.

Memory operations are internal bookkeeping. They are never the answer the human reads.

---

## When memory is not installed

The memory component is optional. If it is not present, say so once at the point it would have
helped, and continue:

> *"Sin memoria persistente en este setup: no puedo comprobar si ya tocamos esto."*

Do not fabricate recall, and do not pretend to save.
