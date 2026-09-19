# Verification

Load when: about to implement something, or about to claim that something works.

Two questions, resolved in order: **is TDD active here?** and **what counts as proof?**

---

## 1. Resolving the TDD mode

Read `PROJECT.md`:

```yaml
testing:
  available: true
  framework: "vitest"
  runner: "pnpm test {file}"
  detected_from: "package.json + 47 *.spec.ts files"
tdd:
  mode: ask            # on | off | ask
```

### The cascade

```
1. testing.available is false      ->  TDD IS NOT AVAILABLE. Do not offer it. Stop here.
2. The human decided this session  ->  use that
3. tdd.mode: on | off              ->  use that
4. tdd.mode: ask (or missing)      ->  OFFER it, once, and wait
```

**Tests merely existing does not activate TDD.** It is a recorded decision, never a deduction from
the presence of a `__tests__` folder.

### When `testing.available` is false

Do not mention TDD. Do not suggest introducing a test framework unless the human asks. Run whatever
functional checks the project does have — build, typecheck, lint, a manual reproduction — and
report exactly what you observed.

**Off is not "no verification".** It changes *what* proof looks like, never *whether* there is any.

### How to offer

One line, with the runner you found, then wait:

> *"El repo usa vitest (`pnpm test {file}`). ¿Lo hacemos con TDD — test primero — o implemento y verifico después?"*

### Propagation

Once resolved, the mode, its source and the **exact runner** travel with every delegation to a
`worker` or `verifier`, and are re-stated when a session resumes. A subagent never decides this on
its own; if a delegation arrives without it, the child returns `interaction_required`.

If the mode is unknown or contradictory, resolve only the ambiguity that blocks the next action.
Never invent precedence and never invent a test command.

---

## 2. What counts as proof

| Claim | Proof |
|---|---|
| "The test fails" | Command run, output shown, the failing assertion named |
| "The test passes" | Command run **now**, output shown |
| "It builds" | Build command run, exit status observed |
| "Types are fine" | Typecheck run, output observed |
| "Nothing else broke" | The relevant suite run — and say which scope you actually ran |

Report as `<exact command>: <observed result>`:

```
pnpm test export.spec.ts: 6 passed
pnpm typecheck: 1 error in src/legacy/report.ts:88 (pre-existing)
```

### Never

- Claim a command ran when it did not.
- Report "should pass", "presumably works", or "tests should be green".
- Round a partial result up to done.
- Retry with different flags until the output looks better.
- **Delete the failing test, weaken the assertion, or remove the check that exposed the problem.** Fix the cause. If you cannot, revert your change and say so.

### Pre-existing failures

Separate them explicitly, do not fix them, and do not let them silently degrade the status of
unrelated work:

> `pnpm lint: 3 warnings in src/legacy/** (pre-existing, untouched by this change)`

---

## 3. With TDD active

The full cycle, its gates and the evidence table live in `contracts/tdd-strict.md`. **Read that
file only when TDD is actually active** — when it is not, it costs nothing because it is never
loaded.

Short version: observed RED before implementing → GREEN → a second case → REFACTOR still green.

## 4. With TDD inactive

1. Implement.
2. Run the checks the project has.
3. Report each command and its observed output.
4. If something fails, fix the cause — never hide the symptom.

The difference from TDD is the ordering of the proof, not its existence.

---

## 5. Before saying it is done

- Every claim in your summary has a command behind it, or a `file:line`.
- Anything you did not verify is named as not verified.
- Anything that failed is named, even if unrelated.
- The human still has to test it and commit it. Say what you would check first.
