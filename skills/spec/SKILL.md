---
name: spec
description: "Design a spec before writing code. Trigger: the human accepted a spec for a large feature, or asked for one directly. Asks clarifying questions first, then writes specs/NN-slug.md in Draft and stops. Never writes code."
disable-model-invocation: true
argument-hint: "short feature description"
allowed-tools: Read, Glob, Grep, Write, AskUserQuestion, Bash(ls:*), Bash(cat:*), Bash(date:*)
---

# /spec — Guided spec design

## Session context

Today's date — use this for the header, **never guess it**:
!`date +%F 2>/dev/null || echo "UNKNOWN — ask the human for today's date"`

Existing specs:
!`ls specs/ 2>/dev/null || echo "specs/ does not exist yet"`

---

A spec is not decorative documentation. It is the contract that drives execution. A vague spec
produces improvised code — which is why this flow is **deliberately slow while defining** and
**fast while writing**.

Read `template.md` next to this file for the structure. You never write code here. Your job ends
when the file is saved.

**Artifacts are in English** (→ `behavior/language.md`), but talk to the human in their language.

---

## Phase 1 — Context

1. Read `PROJECT.md` if it exists: stack, architecture, conventions, commands. Do not infer the stack from the repository name.
2. Look at the `specs/` listing above for numbering.
3. If previous specs exist, read the **two most recent** to inherit their conventions: section wording, state labels, level of detail. A new spec must match the ones already there.
4. Search memory for prior decisions on this area. If something relevant exists, say so — you may be building on a decision that already closed one of your questions.

If `$ARGUMENTS` is empty, ask for a **one-sentence** description. If it does not fit in one
sentence, that is the first signal the feature is too big: propose splitting it before continuing.

---

## Phase 2 — Clarify

**The most important phase. Never skip it.**

Detect ambiguity and ask. Do not assume.

Ask in **blocks of 3 to 5**, then wait. One question at a time is exhausting; twelve at once is an
interrogation.

Categories worth considering every time:

| Category | Ask about |
|---|---|
| **Scope** | What is in, and what is explicitly NOT? What defers to a later spec? |
| **Data** | New structures? Named how? Living where? |
| **Integration** | Depends on a previous spec? Modifies existing behaviour or only adds? |
| **Persistence** | Anything stored between sessions? Where? Versioned how? |
| **States** | What does success look like? Failure? Intermediate? Empty? |
| **Risks** | What breaks this? What happens in the degraded case? |
| **Closed decisions** | Anything already decided that you should not reopen? |

### How to ask

- **Concrete, never open.** ❌ "How do you see persistence?" → ✅ "localStorage, IndexedDB, or a JSON file on disk?"
- **2–4 options**, with your recommendation marked and why.
- **Say what you already checked** — cite `file:line` — so the human does not repeat your work.
- Use the native multiple-choice tool when available; otherwise a numbered list.
- If an answer opens a new frontier ("and also multiplayer"), say it deserves its own spec and ask whether it is out of scope here.

### When to stop

Stop when you can answer these three **without assuming anything**:

1. Which files appear or change?
2. What is the first executable step, and the last?
3. How do I verify the feature is finished?

If one still fails, keep asking.

### If the human wants to skip this phase

Say once: *"Las preguntas ahora ahorran horas después. ¿Seguro que las salto?"* If they insist,
respect it — and record it in the Decisions section as *"Quick definition, no detailed clarification."*

---

## Phase 3 — Write

**If Phase 2 is genuinely complete** — you can answer the three questions without assuming — write
the **whole spec** and go straight to Phase 4. Do not go section by section, do not show a draft
for approval first. The human answered everything already; re-asking is friction. They review the
saved file.

**Only if information is still missing** (the human cut Phase 2 short, an answer was vague, a
section cannot be written without inventing something) develop the sections one at a time, showing
each and waiting for confirmation.

Either way the order is the same: header · scope · data model · implementation plan · acceptance
criteria · decisions · risks. Details in `template.md`.

### Mistakes to avoid

- Acceptance criteria that are not verifiable ("that it works well").
- Plan steps that are not in scope.
- File names or structures the human never confirmed.
- Skipping the Decisions section — it is the one with the most value in three months.

---

## Phase 4 — Save

1. **Number**: highest existing + 1, zero-padded to two digits. Empty or missing `specs/` → `01-`.
2. **Slug**: short kebab-case, from the objective.
3. **Date**: from the session context above. **Never write a date you did not read there.** If it says UNKNOWN, ask.
4. Write `specs/NN-slug.md`. **Do not ask permission to write it and do not ask whether the filename works** — announce the path. Only ask if the target already exists.
5. **State is `Draft`.** Never `Approved`. The human changes it after re-reading.
6. If the header lists dependencies, verify each referenced spec exists. Do not write a dangling reference.
7. If `specs/.spec-config.yml` is **missing**, create it with the default below. If it exists, **leave it untouched**.

```yaml
# spec workflow configuration
#
# AutoCreateBranch — whether /spec-impl creates the git branch without asking.
#   true  (default) -> creates and switches to spec-NN-slug
#   false           -> asks [y/N] first
AutoCreateBranch: true
```

8. Confirm, in the human's language:
   - the path written
   - *"Queda en `Draft`. Cámbialo a `Approved` cuando lo hayas releído."*
   - *"Cuando esté aprobado: `/spec-impl NN-slug`."*
   - **Stop there.** Do not propose implementing it, do not write code, do not create a branch.

---

## Hard rules

- **Never write code in this command.** Only the `.md` at the end.
- **Never propose implementing after saving.** Your job ends with the file.
- **Never assume a decision the human did not confirm.** Missing information is a Phase 2 question.
- **Do not re-ask in Phase 3 what Phase 2 answered.** Section-by-section is the fallback for incomplete information, not the default.
- **If the feature is too big** — does not fit one sentence, touches more than three areas, needs decisions in four or more domains — propose splitting it into several specs first.

## Tone

Direct and specific. Do not apologize for asking; the human invoked this precisely so you would
ask. No "if you don't mind…", no "could you maybe…". Number the questions so they are easy to
answer.
