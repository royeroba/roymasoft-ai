---
name: skill-improver
description: "Audit existing skills against the harness style guide. Trigger: the human asks to review, audit, clean up or improve the skills, or a skill is not firing when it should. Reports problems; applies fixes only when asked."
disable-model-invocation: false
argument-hint: "(none) | skill name"
allowed-tools: Read, Glob, Grep, Edit, AskUserQuestion, Bash(ls:*), Bash(wc:*)
---

# /skill-improver

Skills rot: descriptions stop matching how the human actually talks, bodies grow, two skills start
overlapping. This audits them.

**Default mode is report.** Only edit when the human says to.

---

## Scope

Argument given → audit that skill. No argument → audit all of `skills/`, and report the worst first.

---

## What to check

### 1. Triggering — the most common failure

The `description` is the entire triggering mechanism. A skill with a vague one never loads, and the
human concludes the harness does not work.

| Problem | Symptom | Fix |
|---|---|---|
| No trigger words | Never fires | Add the words the human would actually say |
| Trigger words nobody uses | Never fires | Use their vocabulary, not yours |
| Overlaps another skill | Wrong one fires | Sharpen both, or merge them |
| Describes the implementation | Fires unpredictably | Describe **when to use it**, not what it contains |

### 2. Budget

| Body tokens | Verdict |
|---|---|
| under 450 | good |
| 450–700 | acceptable |
| 700–1000 | move detail to `references/` |
| **over 1000** | **over the ceiling** — split it, or it is doing two jobs |

Estimate as `bytes / 4`. Report the number, not an impression.

### 3. Permissions

`allowed-tools` should grant the minimum. Flag:
- A design or review skill holding `Edit` or `Write`.
- Bare `Bash` where scoped commands would do.
- A skill that can commit — **nothing in this harness commits.**

### 4. Body quality

- Descriptive where it should be imperative ("this skill reads X" → "read X").
- Principles with no concrete failure attached.
- Hedging that weakens a rule ("generally preferable" → "never").
- Prose where a table would be cheaper.
- Missing **Boundaries**, or missing the return shape.
- Dead references: a companion file or path that no longer exists.

### 5. Placement

- A **behaviour rule** living in `skills/` — it belongs in `behavior/`.
- A **project convention** living in `skills/` — it belongs in that project's `PROJECT.md`.
- Library knowledge that Context7 should supply.

---

## Report

```
## skills/<name>  ~<n> tokens

🔴 <blocking problem>
🟡 <should fix>
🟢 <consider>

Sin problemas: <los ejes que están bien>
```

Rank skills worst-first. A skill with nothing wrong gets one line: `✅ skills/debug — ~520 tokens, sin hallazgos.`

Cap the visible list at five skills; say how many remain.

---

## Applying fixes

Only when the human asks. Then:

- **Preserve intent.** You are editing someone's contract, not rewriting it to your taste.
- One skill at a time. Show the diff. Wait.
- **Never silently drop a rule** because it looked redundant — surface it and ask.
- Re-run the projection afterwards so the registry reflects the new descriptions.

---

## Boundaries

**Will:**
- Report problems with the token count and the specific line
- Apply fixes the human approved, one at a time

**Will not:**
- Rewrite a skill wholesale because you would have written it differently
- Delete a skill (propose it; the human decides)
- Commit
- "Improve" prose that is already imperative and under budget
