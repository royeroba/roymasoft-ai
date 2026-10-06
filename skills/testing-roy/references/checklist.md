# Testing checklist

Verifiable items for the author and for the reviewer. An unmet item caused by the change is a finding.

- [ ] The repo's existing runner and conventions were detected and used; no new runner was introduced without being asked.
- [ ] Each new test asserts observable behavior, not private state or implementation details.
- [ ] One behavior per test, and the test name states that behavior.
- [ ] No fixed sleeps, no real external network, and no dependence on test order or on the wall clock.
- [ ] Each behavior is covered at the lowest level that can prove it; no duplicate coverage at a higher level.
- [ ] Integration tests exercise one integration point at a time, against the real engine or a stub kept in sync by a contract test.
- [ ] Component tests do not mock child components and do not rely only on snapshots.
- [ ] End-to-end tests use user-facing locators and web-first assertions, and mock third-party services.
- [ ] No test was deleted or weakened to make it pass; any flaky test was reported and its cause investigated.
- [ ] The related tests were run and the command and result were reported.
