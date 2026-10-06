# Frontend checklist

Verifiable items for the author and for the reviewer. An unmet item caused by the change is a finding.

- [ ] The framework, its installed version and the repo's conventions were detected and followed.
- [ ] Components render purely: no mutation of props or state, and no side effects during render.
- [ ] Hooks are called only at the top level of components or custom hooks (React), and the lint plugin passes.
- [ ] No derived data is copied into state with an effect; events are handled in event handlers.
- [ ] Interactive controls are native elements or have the roles, names and keyboard behavior they promise.
- [ ] Every interactive control has an accessible name, is reachable by keyboard and shows a visible focus indicator.
- [ ] Focused elements are not hidden by sticky UI, dragging has an alternative, and targets meet the minimum size (WCAG 2.2 AA).
- [ ] Any performance change is backed by a before-and-after measurement of a named metric.
- [ ] New routes or heavy features are code-split, and added dependencies are tree-shakeable.
- [ ] Long lists are virtualized or paginated where they can grow large.
- [ ] Lint, typecheck and the related tests were run and reported; unverifiable items (screen readers, real devices) were stated.
