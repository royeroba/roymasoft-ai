---
name: rdd-roy
description: "Fresh-context regression review when closing a change that touches code. Trigger: you finished a change that touches code, or the user asks 'check that we did not break anything', 'regression review', 'RDD', 'review this change' or 'pass or fail'. Launches a subagent without the conversation context that returns PASS or FAIL with a table."
disable-model-invocation: false
argument-hint: "optional: what to review (defaults to the current change)"
---

# /rdd-roy — Fresh review: PASS or FAIL

A subagent without your context reviews what was done, compares it with the evidence from before, and says whether it introduced regressions or new bugs. **It does not edit, it does not commit.**

## 1. Does it apply?

- Skip it for **passive** changes (documentation, comments, images with no executable effect) and say so in one line.
- For everything else, run it when closing the change. In a feature split into phases, at the end of the feature, and per phase if the risk is high.

## 2. Build the package (nothing from the conversation)

Gather it and pass it in the prompt:

- **Goal and acceptance criteria** (the spec's `S#` if there is one, or the story's checklist).
- **Scope:** files touched and `git diff --stat`. The reviewer runs the diff on its own.
- **Base evidence**, from before the change: the starting `HEAD` and whether the tree was dirty, the bug reproduction (command output, a RED test, a capture), and the related tests that passed and those that already failed. If you did not record it, say so: the reviewer will treat failures as probable blockers.
- **Authorized verification commands**, the ones you already ran. No build unless the user allows it.
- **Declared risk.**
- **Domain checklists:** for each domain the change touches (testing, security, and the others as they exist), read `../<domain>-roy/references/checklist.md` (for example `../security-roy/references/checklist.md`) and paste its items into the package. Skip a domain whose checklist does not exist.
- **Comments item, always:** "- [ ] New or changed code has no comments, except JSDoc (short description, `@param`, `@returns`, `@throws` if it throws; no `{type}` in TypeScript) on services, utils, composables or hooks and complex functions, and one-line comments where the reason cannot be read from the code. No comments that repeat the code, no commented-out code, no TODO without a ticket. Comments in untouched code are not removed."

## 3. Launch the reviewer

Agent `roymasoft-ai:reviewer`, in the foreground. The default model is the agent's (`sonnet`). Only pass `opus` if the user chose to activate the suggested distribution or asked for that model; if they chose a model, pass that one.

## 4. Act on the verdict

- **PASS:** say the implementation is correct, show the warnings if there are any and what could not be verified.
- **FAIL:** show the table as is. Fix **all blockers in a single batch** and relaunch the reviewer scoped to those blockers. A new finding in that pass does not open another fix.
- **Still open:** a single "I need your decision" with the pending blockers. Never more than one fix, never loops.
- **Warnings:** they are reported; they are not fixed unless the user asks.

## 5. If it cannot be done

If the subagent is unavailable or fails, say so with the cause. **Do not invent a PASS.** A change without review is reported as "no fresh review".
