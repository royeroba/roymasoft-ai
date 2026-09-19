---
name: debug
description: "Find the root cause of a bug. Trigger: something fails, throws, returns the wrong value, or works in one environment and not another. Reproduces first, narrows by evidence, and fixes the cause — never the symptom."
disable-model-invocation: false
argument-hint: "the error, or how to reproduce it"
allowed-tools: Read, Grep, Glob, Edit, AskUserQuestion, Task, Bash
---

# /debug

The failure mode of debugging with an agent is **guessing**: changing something plausible, seeing
if it helps, repeating. That is not debugging, and it leaves damage behind.

You narrow by evidence. Every step either eliminates a hypothesis or confirms one.

---

## 1. Reproduce before anything

You cannot fix what you have not seen fail.

- What is the **exact** command, request or interaction?
- What is the **observed** output — the real error, the real stack trace, not a paraphrase?
- What was **expected** instead?
- Does it fail **every** time, or intermittently?

Missing any of these → ask. One block, concrete questions.

**Cannot reproduce it?** Say so before doing anything else. A fix for a bug you never saw is a
guess with a commit message.

---

## 2. Read the error properly

The stack trace names the file and line. Start there, not where you suspect.

- The **first** frame in your code, not the deepest frame in a dependency.
- The actual message, in full. "Cannot read property of undefined" names the property.
- For a test failure: the assertion, the expected value, the received value.

Quote what you read, with `file:line`. Do not paraphrase an error into something that fits your
theory.

---

## 3. Narrow

Follow the data backwards from the failure to its source. At each step, one question: **is the
value correct here?**

| Technique | When |
|---|---|
| Read the call chain (graph `trace_path` inbound) | To find who produced the bad value |
| Bisect the input | A large input fails, a small one does not |
| `git log -S` / `git bisect` | It used to work |
| Compare environments | Works in dev, fails in prod: diff config, versions, data, permissions |
| Add a temporary assertion | To pin down where a value turns wrong |

**Every hypothesis gets a test that could disprove it.** A hypothesis you cannot falsify is a
belief.

---

## 4. The three-strike rule

If three consecutive attempts have not converged — "still broken" three times — **stop editing code.**

State out loud:
1. The assumption you have been making that might be false.
2. The evidence that contradicts it, or the evidence you never actually verified.
3. One diagnostic question, for the human or for the system.

Then ask. Continuing to iterate past three failures burns tokens and leaves a trail of speculative
edits.

---

## 5. Fix the cause

Once you have the root cause, state it in one sentence before changing anything:

> *"`parseFilters` returns `undefined` for an empty query string (`src/filters.ts:22`), and the
> caller at `export.ts:40` spreads it without a guard."*

Then:

- **Fix the cause, not the symptom.** A `?.` at the call site hides a function with a broken contract.
- **Never delete the failing test, weaken the assertion, or remove the check that exposed it.**
- If TDD is active: write the test that reproduces it, observe RED, then fix → `contracts/tdd-strict.md`.
- If TDD is not active: reproduce, fix, re-run the reproduction, report the observed output.
- **Remove your debug instrumentation.** Temporary logs and assertions do not get committed.

If you cannot fix it: **revert your changes**, leave the tree as you found it, and report what you
learned and where you got stuck. A clean tree plus a good diagnosis is a real deliverable.

---

## 6. Close

```
**Causa raíz:** <una frase, con file:line>
**Por qué pasaba:** <la cadena, brevemente>
**Arreglo:** <qué cambiaste y por qué ahí>
**Verificado:** <comando exacto>: <salida observada>
**Sin comprobar:** <lo que no pudiste verificar>
```

Save to memory: the **root cause**, not the patch. A future session hitting the same area needs to
know why it broke, not which line changed.

Do not commit.
