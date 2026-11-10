---
name: tech-debt-roy
description: "Audits technical debt in a repo or a folder and returns a prioritized, evidence-backed list with a phased plan that fits next to feature work. Trigger: the user asks for a 'tech debt audit', 'technical debt', 'what should we refactor', 'code health', 'what is rotting in this repo', 'what to clean up first', or 'prioritize the debt'. Read-only: it fixes nothing and creates no tickets."
disable-model-invocation: false
argument-hint: "optional: a folder or area to audit"
---

# /tech-debt-roy — Find the debt, rank it, plan it

You find debt with evidence, score it and propose an order. **You only read and report**: you do not refactor, open tickets or touch dependencies. Fixing an item is a separate request (`/implement-ticket-roy`, or `/plan-feature-roy` for a large one).

## When to use / when not

- Use it for a debt audit, to choose what to clean up first or to judge the health of an area.
- Do not use it to review one change (that is `/regression-review-roy`), to find a specific bug or for performance work (that is `/performance-roy`).

## 1. Scope

Audit the folder the user names, or the whole repo if it is small. If the repo is large and no scope was given, ask with closed options (the heaviest folder, the most recently changed, a named area). Say what was left out.

## 2. Find debt with evidence

Follow the rules' search order (memory, CodeGraph, grep). Every finding cites a `file:line` or a command output; a finding without that is dropped.

| Type | Evidence to look for |
|---|---|
| Code | Very large files (`wc -l`), commented-out code, `TODO` or `FIXME` without a ticket, the same logic repeated (the same rule, not the same shape) |
| Test | Skipped tests (`.skip`, `xit`), core modules whose blast radius shows no tests (CodeGraph reports it), tests that were weakened or deleted in `git log` |
| Dependency | `npm outdated` and `npm audit` (read-only; say that they query the registry), unmaintained or duplicated packages |
| Architecture | Modules with many callers and mixed responsibilities (`codegraph_explore` callers and impact), circular imports |
| Documentation | README without install, run or test steps that `package.json` scripts support; outdated or missing docs for public modules |
| Infrastructure | No CI, unpinned base images or actions, no health or logging setup (see `/docker-ci-roy`, `/backend-roy`) |

Do not run anything with side effects. Cap the list at the ten most relevant findings; say how many more there were.

## 3. Score

For each finding: **Impact** (how much it slows the team, 1 to 5), **Risk** (what happens if it stays, 1 to 5) and **Effort** (1 to 5). Add one line of reason per score; they are judgments, and the user may override them.

`Priority = (Impact + Risk) x (6 - Effort)`

The range is 2 to 50: a high number means big payoff for low effort.

## 4. Plan

- **Quick wins:** priority in the top third and effort 1 or 2. Can ride along with feature work.
- **Planned:** high impact or risk with effort 3 to 5. Propose one item per spec, not a mega-refactor.
- **Watch:** low priority; record it and leave it.

Correct: "`src/billing/calc.ts` (1,240 lines, no tests in its blast radius, 14 callers). Impact 4, risk 5, effort 4 → 36. Reason: every pricing change edits it and nothing would catch a regression."
Incorrect: "The billing code is messy and should be refactored."
It fails because it cites nothing, gives no cause and offers no way to rank it against other work.

## 5. Deliver

```markdown
## Tech debt — <scope>
Left out: …  ·  Evidence: commands and tools used

| # | Type | Where | Finding | I | R | E | Priority |
|---|---|---|---|---|---|---|---|

### Plan
Quick wins · Planned · Watch
### Not verified
```

End by asking which items to turn into work, with closed options. Never create the tickets or start the refactor yourself.

## If it fails

If CodeGraph or a command is unavailable, use the filesystem and say that the result is less complete. If nothing stands out, say so; do not invent debt to fill the table.

## Final checklist

- [ ] Scope stated and what was left out
- [ ] Every finding cites `file:line` or a command output
- [ ] Scores have a reason and the formula was applied
- [ ] Capped list; a plan with quick wins, planned and watch
- [ ] Nothing was edited, installed, updated or ticketed
