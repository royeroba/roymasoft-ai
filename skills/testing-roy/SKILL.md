---
name: testing-roy
description: "Guides writing, reviewing and fixing tests for frontend and backend (JavaScript, TypeScript, Vue, React, Node): a pyramid-shaped strategy, behavior-focused tests, real dependencies at integration level and stable end-to-end tests. Trigger: the user asks to write, add, fix or review tests, 'unit test', 'integration test', 'e2e test', 'test coverage', 'flaky test', 'how should we test this', or a change needs a test strategy."
disable-model-invocation: false
argument-hint: "what to test, or the failing/flaky test to fix"
---

# /testing-roy — What and how to test

You decide **what to test, at which level and how**, following the repo's own stack. The base, the TDD loop and the closing are in `../_shared/verification.md`; this skill adds the testing guidance. **You do not switch the repo's test runner** and you do not create one unless asked.

## When to use / when not

- Use it whenever tests are written, changed, reviewed or diagnosed, or when a change needs a test strategy.
- Do not use it to run a browser walkthrough of a feature (that is `/e2e-roy`) or to review a whole change (that is `/rdd-roy`).

## 1. Detect the stack (never assume)

Read `package.json` scripts, the runner config (Vitest, Jest, Playwright, `node:test`), the existing test folders and the CI test command. Note the framework and its **installed version** (Vue, React, Node) and consult Context7 for that version before relying on an API (the rules' "Libraries" paragraph). If the stack cannot be determined, ask once with closed options.

## 2. Route to the right reference

| Need | Read |
|---|---|
| Which level, how many, flakiness, what to delete | `references/strategy.md` |
| Vue or React components, composables, browser tests | `references/frontend.md` |
| Services, APIs, databases, external services, contracts | `references/backend.md` |
| Before closing | `references/checklist.md` |

## 3. Rules for every stack

1. **Pyramid shape, no fixed ratio.** Many small tests, fewer integration tests, very few end-to-end tests. The exact mix is per team.
2. **Test observable behavior**, not private state or implementation details.
3. **Push tests down.** Cover each behavior at the lowest level that can prove it, and remove duplicate coverage at higher levels.
4. **Deterministic tests.** No fixed sleeps, no real external network, no dependence on order or on the wall clock. A flaky test is a defect to fix, not to retry.
5. **A test is never deleted or weakened to make it pass.** If you cannot fix the cause, revert and report.
6. **Detect, then follow.** Use the repo's naming, folder and assertion conventions.

## 4. Verify

Run the related tests and report command and result. Offer `/e2e-roy` in one line when the change touches UI. Report what you could not verify (real browsers, real services, CI-only failures).

Correct (Testing Library style):
```ts
it('shows an error when the email is invalid', async () => {
  render(<SignupForm />);
  await user.type(screen.getByRole('textbox', { name: /email/i }), 'nope');
  await user.click(screen.getByRole('button', { name: /sign up/i }));
  expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);
});
```

Incorrect:
```ts
it('works', () => {
  const wrapper = mount(SignupForm);
  wrapper.vm.email = 'nope';
  expect(wrapper.vm.isValid).toBe(false);
  expect(wrapper.html()).toMatchSnapshot();
});
```
It fails because it asserts private state, depends on a snapshot alone and does not say what behavior it protects.

## If it fails

If a test cannot be made deterministic or the stack is unclear, say so and ask; do not invent a runner or hide the failure.

## Final checklist

Use `references/checklist.md`. Summary:

- [ ] Stack and version detected from the repo
- [ ] Lowest level that proves the behavior; no duplicate coverage
- [ ] Observable behavior asserted, not implementation details
- [ ] Deterministic: no sleeps, real network or order dependence
- [ ] No test deleted or weakened; related tests run and reported
