# Frontend testing (Vue, React, browser)

Last verified: 2026-10-06

Detect the repo's tools and follow them; this page does not change the runner.

## Test types and usual tools

Vue's official guide separates unit tests (functions, classes, composables, with Vitest), component tests (rendering, interaction, props, events, slots, with Vitest plus Vue Test Utils or Testing Library) and end-to-end tests (real network against a production build, with Playwright or Cypress). Jest appears as the migration alternative for unit tests.

Source: https://vuejs.org/guide/scaling-up/testing.html

## Test like a user

"The more your tests resemble the way your software is used, the more confidence they can give you." Work with DOM nodes rather than component instances, and avoid testing implementation details. Testing Library applies the same principles to React and Vue.

Source: https://testing-library.com/docs/guiding-principles/

## Component tests (Vue guidance)

Do:
- Assert the correct render output from props and slots.
- Assert the correct updates and emitted events in response to user input.
- Test through the public interface.

Do not:
- Test private state or implementation details.
- Rely exclusively on snapshot tests.
- Mock child components in component tests.

Source: https://vuejs.org/guide/scaling-up/testing.html

## Composables

A simple composable (reactivity APIs only) is tested by calling it directly. A composable that uses lifecycle hooks or provide/inject is tested wrapped in a host component or with component-testing techniques.

Source: https://vuejs.org/guide/scaling-up/testing.html

## End-to-end with Playwright

- Prefer user-facing attributes (roles, text) to XPath or CSS selectors, and narrow with chaining and filtering.
- Keep each test isolated, with its own data, cookies and storage; reuse signed-in state through setup projects.
- Use web-first assertions that wait and retry (for example `toBeVisible()`), not immediate manual checks.
- Do not test third-party sites or services you do not control; mock them with the Network API.
- Run on every commit and pull request, use sharding and parallelism, and debug CI failures with the trace viewer.
- Lint tests with TypeScript and ESLint, and keep Playwright updated.

Source: https://playwright.dev/docs/best-practices

## Runner basics

Vitest reads `vite.config.*` by default, picks up files with `.test.` or `.spec.` in the name and includes mocking, snapshots and coverage. Check its requirements for the installed version through Context7 instead of assuming them.

Source: https://vitest.dev/guide/
