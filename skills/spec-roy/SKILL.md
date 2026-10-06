---
name: spec-roy
description: "Large lane: designs and executes a feature with a spec. Trigger: the user accepts 'with spec', types /spec-roy, or asks to plan a large feature before coding ('write a spec for this', 'plan this feature', 'let's do it with a spec'). Asks questions, presents the plan (Plan Mode), saves specs/NN-slug.md and implements in phases with pauses."
disable-model-invocation: false
argument-hint: "short description of the feature, or NN-slug of an existing spec to resume it"
---

# /spec-roy — Large feature with a spec

Base, tests, closing and E2E offer: `../_shared/verification.md`. Document template: `template.md` (same folder).

A spec is the contract execution starts from: if it is vague, the code improvises. That is why definition is slow and execution is fast. **In phases 1 and 2 no code is written.**

## Phase 0 — Resume or start

- If the argument (or the user) names an existing spec in `specs/`, read it, compare it with the real code and propose which phase to continue from. An `Approved` spec resumes at phase 4.
- Otherwise, start at phase 1. Look at `specs/` to number the new one and to copy the **language** and conventions of the existing specs.
- Existing specs may use Spanish status values: `Borrador` = Draft, `Aprobado` = Approved, `Implementado` = Implemented, `Obsoleto` = Obsolete. Keep the language the repo's specs already use.

## Phase 1 — Context

If there is a Jira URL or key, invoke `/consult-ticket-roy`; if there is a Figma URL, or the ticket links one, `/consult-figma-roy`. Their gaps and questions feed phase 2. If `/hu-roy` already consulted them, reuse that context instead of fetching it again.

Read the project's memory file (`CLAUDE.md`, `AGENTS.md`, `README.md`, whichever exists first) and, following the rules' search order, whatever the feature touches. If the goal does not fit in one sentence, or touches decisions in 4 or more domains, propose splitting it into two specs before continuing.

## Phase 2 — Questions

Detect ambiguities and **ask, do not assume**. Blocks of 3 to 5, with 2 to 4 options and your recommendation (use `AskUserQuestion` if available). Categories: scope (what is in and what is **not**), data, integration, persistence, UX and error states, risks, decisions already closed. If something opens a Pandora's box, propose leaving it for another spec.

Stop when you can answer without assuming: which files appear or change, what the first and the last step are, and how to verify that it is finished.

## Phase 3 — Plan and approval

Write the full spec following `template.md`: **Specs** with the user's phrases **verbatim** (S1..Sn, without paraphrasing or adding requirements), **Plan** in phases that leave the system working, verifiable **Criteria**, decisions and risks.

- Present it with **Plan Mode** (`EnterPlanMode` / `ExitPlanMode`) if available: the user's "accept" is the approval.
- Without Plan Mode: show it in the chat and ask for a go-ahead.
- If the user asks for changes, adjust and present again. Never mark a spec as approved yourself without that answer.

## Phase 4 — Save

With the approval, write `specs/NN-slug.md` (next number, two digits; slug in kebab-case) with status `Approved`. If the user has not approved yet, save it as `Draft`. The date comes from the system date command, not from your memory. If the file already exists, ask. Verify that the dependencies (`Depends on`) exist. Tell them the path and that it stays **unstaged** in the repo: they decide whether to commit it.

## Phase 5 — Implement in phases

Before the first phase, the **base** (verification.md §1) in the `## Log`. For each phase:

1. TDD if there is a stack (verification.md §2), minimal change, only what the phase says. If the phase touches styles, follow `styles-roy`.
2. Tick its checkbox **only with observed evidence** (command and result) and note the evidence in the `## Log`.
3. Summarize what you did and which files you touched, and offer E2E if the phase touches UI.
4. Say "Phase N ready" and wait for "continue" (or the equivalent in natural language, in the user's language). The human reviews at each phase.

Rules during implementation:

- **Implement what the spec says.** If something seems improvable, note it as an observation; changes go to the spec, not to the code by surprise.
- **Ambiguity** the spec does not resolve: stop, describe it, give 2 or 3 options and wait.
- **Requirement change:** add the user's literal phrase with its date to the `## Log`, rewrite only the affected `S#` and reopen only its phase. Whatever falls outside scope is noted for another spec.
- If context is lost or you have to stop, the document is enough to resume.

## Phase 6 — Closing

When all phases are done: verify the acceptance criteria one by one with evidence, `Riesgo:`, and an `rdd-roy` review of the whole feature (per phase if the risk is high). With the user's "ok", change the status to `Implemented`. The commit only if they ask, with `/commit-roy`.

## Rules

- Statuses: `Draft` → `Approved` → `Implemented` (or `Obsolete`). The agent changes them **only after the user's explicit answer**, in natural language; the user does not have to edit the file.
- Do not commit or stage on your own (only if the user asks, with `/commit-roy`) and do not create branches: that is their decision.
- Save only the decisions to memory (proactive saving), not a copy of the document.
