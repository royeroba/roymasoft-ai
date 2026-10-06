# React

Last verified: 2026-10-06

## Rules of React

- **Components and hooks must be pure:** idempotent for the same props, state and context; side effects run outside render (in effects or event handlers); never mutate props, state, values passed to or returned from hooks, or values after they are used in JSX.
- **React calls components and hooks:** never call a component as a regular function and never pass hooks around as values.
- **Rules of hooks:** call hooks at the top level only (not in loops, conditions or nested functions) and only from React components or custom hooks.
- Enforce them with Strict Mode and the `eslint-plugin-react-hooks` lint plugin.

Source: https://react.dev/reference/rules

## You might not need an effect

Use an effect only for code that should run because the component was displayed to the user. Instead:

- Transform data for rendering by calculating it at the top level of the component.
- Handle user events in event handlers, not in effects that watch state.
- Cache expensive calculations with `useMemo`, not state plus an effect.
- Reset state when a prop changes by passing a `key`; adjust state during rendering or store an identifier and derive the item.
- Notify a parent by calling its handler in the same event handler, not from an effect.

Effects are appropriate for synchronizing with external systems, subscribing to external stores (`useSyncExternalStore`) and data fetching with cleanup to handle race conditions.

Source: https://react.dev/learn/you-might-not-need-an-effect
