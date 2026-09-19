# Result contract

Load when: you are a subagent about to return, or the orchestrator about to read a subagent's
return.

Every delegated task returns this envelope. It is what the parent reads instead of the subagent's
context — the whole point of delegation is that the parent never pays for the files the child read.

---

## The envelope

```text
status: completed | partial | blocked | interaction_required

summary:
  <2-4 lines. What was done and what it means. Not a narrative of your steps.>

files_changed:
  - path/to/file.ts — what changed and why

validation:
  - <exact command>: <observed result>
  - <exact command>: <observed result>

risks:
  - <what could bite, or "none observed">

next_recommended:
  <the single next action, or "none">

skill_resolution: paths-injected | paths-invalid | none
```

### Two hard rules

**1. Your last output must be text, never a tool call.** If your final act is a tool invocation,
the parent receives only the tool result and loses this entire report. Finish by writing the
envelope.

**2. Never report a command you did not run, or an outcome you did not observe.** `validation`
carries the *exact* command and its *observed* output. If you did not run it, it does not go in the
list. "Should pass" is not a result.

---

## `status` — pick honestly

| Value | Meaning |
|---|---|
| `completed` | The task is done and verified. Every required check ran and passed |
| `partial` | Real work landed, but something required did not finish or did not pass. Say exactly what |
| `blocked` | A **technical** obstacle stopped you: missing dependency, broken toolchain, unreachable service, a path you are not allowed to touch |
| `interaction_required` | A **human decision** is needed. Not a failure — the work is fine, it just cannot proceed without a choice |

> `blocked` and `interaction_required` are not the same thing, and conflating them is the most
> common failure. `blocked` means the machine stopped you. `interaction_required` means the human
> owns the next decision. A missing product decision is never `blocked`.

A required command that failed forces `partial` — unless the parent's task listed it under
`## Known environmental failures` as a pre-existing break, in which case report it as such and do
not degrade the status.

---

## `interaction_required` — the interactive payload

When a human decision is needed, append:

```text
interaction_required:
  question: <one sentence, concrete>
  reason: <why the code cannot settle this>
  checked: <what you already verified, so the human does not repeat your work>
  options:
    - id: a
      label: <short>
      consequence: <what happens if chosen>
    - id: b
      label: <short>
      consequence: <what happens if chosen>
  recommended: a
  unblock_response: <exactly what the human needs to reply, e.g. "a" or "b">
```

**`options` is a closed set.** Never hand the human an open question they have to answer by typing
file paths, globs or command lines — derive those yourself and let them pick. Two to four options.
Mark your recommendation and why it is your recommendation.

If you genuinely cannot enumerate options, say what single fact you need and where you looked for
it.

---

## Key Learnings

Close every return with:

```markdown
## Key Learnings
- <one durable fact worth remembering next session>
- <another>
```

One to five entries, each a full sentence. This is what gets persisted to memory — write facts that
will still be true and useful in a month, not a log of this run.

❌ "I read three files and then edited the client."
✅ "`api/client.ts` reads the auth token from a module-level constant, so tests must reset it between cases."

Omit the section entirely if nothing durable was learned. An empty list is better than filler.

---

## What the parent does with this

The parent merges, it does not replace. A bounded worker's view is partial by construction: the
parent reconciles the envelope against the feature document and the other workers' returns, and
owns the synthesis the human sees.

If `skill_resolution` is anything other than `paths-injected`, the parent treats it as an
orchestration gap and passes exact skill paths on the next delegation.
