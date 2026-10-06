---
name: frontend-roy
description: "Guides building and reviewing frontend components in React and Vue: framework idioms, state and effects, accessibility (WCAG 2.2) and frontend performance (Core Web Vitals, bundle size, rendering). Trigger: the user asks to build, refactor or review a component or page, 'React component', 'Vue component', 'useEffect', 'accessibility', 'a11y', 'ARIA', 'keyboard navigation', 'slow render', 'Core Web Vitals', 'bundle size', or a change edits .tsx, .jsx or .vue files."
disable-model-invocation: false
argument-hint: "the component, page or problem"
---

# /frontend-roy — Idiomatic, accessible, fast components

You build and review frontend code with the official framework guidance and accessibility standards cited in `references/`. **The repo's framework, version and conventions come first**; you do not migrate frameworks or add libraries on your own.

## When to use / when not

- Use it whenever components, state handling, accessibility or frontend performance are written or reviewed.
- Do not use it for CSS, SCSS or Tailwind (that is `/styles-roy`), for tests (that is `/testing-roy`) or for XSS and CSP (that is `/security-roy`).

## 1. Detect (never assume)

Read `package.json` and the lockfile for the framework (React, Vue, other) and its **installed version**, the router and state library, the lint config (`eslint-plugin-react-hooks`, `eslint-plugin-vue`) and the build tool. Consult Context7 for the installed version before relying on an API. If the framework is neither React nor Vue, use its official docs through Context7 and apply the accessibility and performance references.

## 2. Route to the right reference

| Need | Read |
|---|---|
| React components, hooks, effects | `references/react.md` |
| Vue components, reactivity, rendering cost | `references/vue.md` |
| Semantics, keyboard, focus, ARIA, WCAG 2.2 | `references/accessibility.md` |
| Core Web Vitals, bundle size, loading | `references/performance.md` |
| Before closing | `references/checklist.md` |

## 3. Rules for every framework

1. **Pure rendering.** A component returns the same output for the same inputs and does not mutate its props or state.
2. **Derive, do not sync.** Compute values from props and state during render instead of copying them into state with an effect.
3. **Native HTML first.** Use the element that already has the semantics and keyboard behavior; ARIA only fills gaps.
4. **Accessible by default.** Visible focus, keyboard operability, accessible names; target WCAG 2.2 level AA unless the user says otherwise.
5. **Measure performance first.** Do not optimize without a measured problem (Core Web Vitals, profiler).
6. **Load less.** Split code by route or feature and keep dependencies tree-shakeable.

## 4. Verify

Run the repo's lint (with the framework's lint plugin if present), the typecheck and the related tests, and report the results. Offer `/e2e-roy` when the change touches UI, and `design:accessibility-review` if a formal accessibility audit is wanted. Say what was not verified (real devices, screen readers, field performance data).

Correct (React):
```tsx
function ProductList({ products, query }: Props) {
  const visible = products.filter((p) => p.name.includes(query));
  return <ul>{visible.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

Incorrect:
```tsx
function ProductList({ products, query }: Props) {
  const [visible, setVisible] = useState(products);
  useEffect(() => { setVisible(products.filter((p) => p.name.includes(query))); }, [products, query]);
  return <ul>{visible.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}
```
It fails because it stores derived data in state and syncs it with an effect, causing an extra render and a stale intermediate value.

## If it fails

If an accessibility or performance claim cannot be verified without a real device or field data, say so instead of declaring it fixed. Never remove a lint rule to make a hook warning go away.

## Final checklist

Use `references/checklist.md`. Summary:

- [ ] Framework and version detected; repo conventions followed
- [ ] No derived state copied into state; no effect where an event handler or render works
- [ ] Native elements, accessible names, keyboard and focus handled
- [ ] Performance work backed by a measurement
- [ ] Lint, typecheck and related tests run and reported
