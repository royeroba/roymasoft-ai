# Shared verification: base, tests, closing and E2E offer

Used by `hu-roy` (small lane) and `spec-roy` (large lane). It is not a skill.

## 1. Base (before changing)

Record it in the chat and, if there is a spec, in its `## Log`:

- `git rev-parse HEAD` and whether the tree was dirty (`git status --short`). The user's uncommitted changes are not in `HEAD`: say so.
- **Bug:** the reproduction (command and output, a RED test, or a capture via `/e2e-roy`). If it cannot be reproduced, say so.
- **Related tests:** which pass and which already fail. Those that already fail are **not fixed**: they are reported separately so you are not blamed for them and yours are not loaded onto the repo.

When the user reports a failure, reproduce it before deciding that "it already works".

## 2. Test stack

Detect it without assuming: a `test` script in `package.json`, a runner config (vitest, jest, playwright test…), `pytest`, `go test`, `cargo test`, etc., and existing tests. If you cannot determine it, ask once with closed options ("how are tests run?" / "there are no tests").

- **There is a stack → TDD:**
  1. Run the related tests before editing (see Base).
  2. Write the test and **watch it fail for the right reason** (RED). One test per requested rule and one for each existing behavior you touch (the one that shares the code you change).
  3. Implement the minimum and watch it pass (GREEN).
  4. Refactor with the tests green.
  If for that change there is no useful deterministic test (pure UI, configuration), explain the exception and verify with something functional. Never invent RED/GREEN.
- **There is no stack:** say so once and skip TDD. Verify with typecheck, lint or whatever exists, or with `/e2e-roy`; reproduce bugs with a command. Do not create a runner unless asked.
- A test is never deleted or weakened to make it pass. If you cannot fix the cause, revert and report.
- If you change a command, option or message, update its help or documentation.

## 3. Closing

1. `Riesgo: <item>` or `Riesgo: ninguno`, per the rules' high-risk list (the `Riesgo:` label is literal).
2. What you did not verify, and why.
3. If it touched code: fresh review with the `rdd-roy` skill.
4. E2E offer if it applies (section 4).

## 4. E2E offer

Only when the change (or the phase) touches UI (views, components, routes, styles) and the app can be started. **A single line** at the end, for example: "The new login is done. Shall we test it in the browser?".

- If they accept: the `e2e-roy` skill with the story's or the spec's criteria.
- Do not offer if there is no UI, if it was already tested, or if the user said no. Never run it without their acceptance.
