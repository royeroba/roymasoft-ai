# Strict TDD

**Load this file only when TDD is active.** When it is not, it is never read and costs nothing.

The mode, its source and the exact runner come from the parent or from `PROJECT.md` — never resolve
them here. → `behavior/verification.md`

---

## The cycle

```
0  SAFETY NET   run the existing suite BEFORE touching anything
       ↓        GATE: pre-existing failures recorded, not fixed
1  UNDERSTAND   what behaviour, observable how?
       ↓        GATE: you can name the assertion before writing it
2  RED          write the test · RUN IT · watch it fail
       ↓        GATE: observed failure, for the RIGHT reason
3  GREEN        minimum implementation · RUN IT · watch it pass
       ↓        GATE: observed pass
4  TRIANGULATE  a second, genuinely different case · RUN
       ↓        GATE: observed pass, or a recorded reason for skipping
5  REFACTOR     clean up · RUN AGAIN
       ↓        GATE: still green
6  RECORD       fill the evidence row
```

**No gate may be skipped or assumed.** A gate passes only on observed output.

---

## Step 0 — Safety net

Run the relevant existing tests **before** editing anything.

- Green → note it; any later failure is yours.
- Red → **record the failures and do not fix them.** They are pre-existing. Report them separately so a later failure is not blamed on your change, and so you are not blamed for theirs.

Skipping this step means you cannot tell your breakage from the repository's.

## Step 1 — Understand

Name the observable behaviour before writing anything: *given this input and this state, the system
should do that.* If you cannot state the assertion in one sentence, you do not yet know what you
are building — go ask.

Choose the cheapest layer that can actually observe the behaviour:

| Layer | Use when |
|---|---|
| Unit | Pure logic, a decision, a transformation |
| Integration | Crosses a boundary you own (repository, handler, adapter) |
| E2E | Only when the behaviour is not observable any lower |

Prefer extracting a pure function over mocking three collaborators. If a test needs more mocks than
assertions, the design is telling you something.

## Step 2 — RED

Write the test. **Run it.** Watch it fail.

Confirm it fails for the **right reason**: the assertion you wrote, not a typo, a missing import, or
a module that does not exist yet.

> A test you never saw fail proves nothing. It may be asserting nothing at all.

## Step 3 — GREEN

The minimum implementation that satisfies the test. No extra cases, no speculative branches. **Run
it.** Observe the pass.

## Step 4 — TRIANGULATE

**Required by default.** One case can be satisfied by returning a constant; two cannot.

Add a genuinely different case — a different input class, a boundary, an error path. Not the same
case with different literals.

Skip only when the change is purely structural (a rename, a move, a type-only edit) and record it:

> `TRIANGULATE skipped: pure rename, behaviour unchanged.`

## Step 5 — REFACTOR

Now clean up: names, duplication, shape. **Run the tests again.** Still green.

Refactoring without a green suite behind you is rewriting, not refactoring.

---

## Assertion quality

A passing suite that asserts nothing is worse than no suite: it manufactures confidence.

| Anti-pattern | Why it is empty | Instead |
|---|---|---|
| `expect(true).toBe(true)` | Tautology | Assert the actual output |
| `expect(result).toBeDefined()` | Passes for `{}`, `0`, `""` | Assert the value |
| `expect(list).toHaveLength(0)` with no setup | Passes because nothing ran | Assert on a populated result |
| `expect(typeof x).toBe('object')` | Type, not behaviour | Assert the shape and the values |
| Loop with assertions over a possibly-empty collection | Zero iterations = zero assertions | Assert the length first |
| "It renders without crashing" | Only proves absence of a throw | Assert what the user sees |
| Asserting on CSS classes | Breaks on restyle, proves nothing | Assert the rendered text or role |
| More mocks than assertions | Testing the mock, not the code | Extract the pure logic and test that |
| Snapshot of everything | Nobody reviews it, so it rots | Assert the specific fields that matter |

A test must be able to **fail** for a reason you can name. If you cannot describe a change that
would break it, it is not testing anything.

---

## Evidence table

Every task carries a row. This is what the verifier audits.

```markdown
### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| T1 | export.spec.ts | unit | 12 passed | observed: "expected 3, got 0" | 3 passed | 2 cases | 3 passed |
| T2 | client.spec.ts | integration | 12 passed | observed: 401 thrown | 5 passed | skipped: pure rename | 5 passed |
```

Each cell records something you **observed**. "ok", "done" and "✓" are not observations.

The table is not decoration: the verifier re-runs GREEN, counts the triangulation cases, and checks
that the safety-net numbers are real. A row that cannot be reproduced is reported as unverified.

---

## Prohibitions

- Never write the implementation before the observed RED.
- Never mark a gate passed without its output.
- Never delete a failing test, loosen an assertion, or remove the check that exposed a problem.
- Never fix a pre-existing failure silently — record it, leave it.
- Never claim a run you did not perform.
- If you cannot complete the cycle, **revert your change**, leave the tree as you found it, and report `partial` with what you learned.
