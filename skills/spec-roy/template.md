# Spec template

File: `specs/NN-slug.md`. Write it in the language of the existing specs (by default, the user's) and keep the order. The headings below are shown in English; translate them if the specs use another language. Omit a section with no real content and say so in one line; do not pad it.

```markdown
# SPEC NN — <short title>

> **Status:** Draft | Approved | Implemented | Obsolete
> **Depends on:** SPEC NN (or "none")
> **Date:** YYYY-MM-DD
> **Goal:** a single sentence.

## Scope

**In:**
- ...

**Out (another spec):**
- ...

## Specs

- **S1.** "<the user's literal phrase>" — <authorized scope and criterion, without rewriting the phrase>
- **S2.** ...

## Data (omit if there is no new data and say so)

Structures with real names and where they live.

## Plan

Each phase leaves the system working.

- [ ] **Phase 1 — <name>** (S1): what changes and which files. Verification: `<command>` → <expected result>.
- [ ] **Phase 2 — <name>** (S2): ...

## Acceptance criteria

- [ ] <verifiable criterion, not aspirational>

## Decisions

- **Made:** <decision> — <why>
- **Discarded:** <option> — <why>

## Risks (omit if there are none)

- <what can break and what happens in the degraded case>

## Log

- **L1 · YYYY-MM-DD** — the user's original request, verbatim.
- **Base** — starting `HEAD`, clean/dirty tree, reproduction, related tests (pass / already failed).
- <date> — user corrections (verbatim), evidence per phase, decisions and next step.
```
