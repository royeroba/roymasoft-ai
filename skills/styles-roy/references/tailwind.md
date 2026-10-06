# Tailwind CSS

Read it when the project uses Tailwind.

## 1. Know the version first

Read it from the lockfile, then consult Context7 for **that version**; do not write from memory.

- **v4:** CSS-first configuration. The stylesheet starts with `@import "tailwindcss";` and the design tokens live in `@theme` as CSS variables (`--color-*`, `--breakpoint-*`, `--container-*`).
- **v3:** configuration in `tailwind.config.js` (`theme.extend`).

Never mix the two styles in one project. If a newer major exists, mention it in one line; do not upgrade without the user's yes.

## 2. Use the theme, not arbitrary values

- Colors, spacing, type, radii and breakpoints come from the theme. Add a missing token to the theme (`@theme` in v4, `theme.extend` in v3) instead of repeating `bg-[#1D4ED8]` or `w-[437px]`.
- An arbitrary value is acceptable only for a one-off that the design really defines once; say so.
- Use the project's existing tokens and design system first.

## 3. Responsive

- **Mobile-first:** unprefixed utilities apply to every size; `sm:`, `md:`, `lg:`… apply at that width **and up**. Write the base for mobile and add prefixes to grow: `w-16 md:w-32 lg:w-48`.
- Use the **project's breakpoints** (the theme's). To change one, override it in the theme (`--breakpoint-sm: 30rem;` in v4); do not add ad-hoc media queries.
- **Container queries:** mark the parent with `@container` and use variants such as `@sm:` or `@md:` on children for components that adapt to their own space. Check the version's docs for how they are enabled.
- Do not use max-width variants to undo mobile styles; restructure mobile-first.

## 4. Write classes professionally

- **Complete class names only.** Tailwind scans source files for full class strings: never build them by concatenation (`` `text-${color}-500` ``). Map to full names instead.
- **Extract components, not `@apply`.** Repeated groups of classes become a framework component (or a small variant helper the project already uses). Avoid `@apply` except in rare cases such as styling content you do not control.
- **Order and format:** follow the project's formatter. If `prettier-plugin-tailwindcss` is configured, run it; if not, keep a consistent order (layout, box, typography, color, state).
- **States and variants:** `hover:`, `focus-visible:`, `disabled:`, `dark:`, `aria-*:`, `data-*:` on the element, not custom JavaScript class toggling when a variant exists.
- **Accessibility:** keep visible focus (`focus-visible:` ring), `motion-reduce:` for animations, and enough contrast.

## Incorrect → correct

```html
<!-- Incorrect -->
<div class="w-[437px] bg-[#1D4ED8] text-[15px]">
```
```html
<!-- Correct -->
<div class="w-full max-w-md bg-primary-600 text-sm md:w-96">
```
The first hardcodes size, color and type; the second uses theme tokens and grows mobile-first.

## Checklist

- [ ] Version read from the lockfile and its docs consulted
- [ ] Tokens from the theme; arbitrary values justified
- [ ] Mobile-first with the project's breakpoints
- [ ] Full class names, no string-built classes
- [ ] Components extracted instead of heavy `@apply`
- [ ] Project's class-order tooling respected
- [ ] Focus, reduced motion and contrast handled
