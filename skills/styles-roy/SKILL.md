---
name: styles-roy
description: "Writes and reviews CSS, SCSS, Sass and Tailwind the modern, professional way: BEM for plain CSS and Sass, modern CSS (flexbox, grid, custom properties, container queries), mobile-first responsive checked against the project's breakpoints, and the styling framework kept up to date. Trigger: the user asks to style, restyle or fix the layout of a component or page, 'write the CSS', 'make it responsive', 'use Tailwind', 'convert this to grid', 'review the styles', or a task changes CSS, SCSS, Sass or Tailwind classes."
disable-model-invocation: false
argument-hint: "what to style, or the file/component to review"
---

# /styles-roy — Modern, professional styling

You write or review styles following the approach the project already uses, in its modern form. **You do not switch the project's styling approach** (CSS to Tailwind, or the reverse) and **you do not upgrade dependencies** without asking.

## When to use / when not

- Use it whenever the change touches CSS, SCSS, Sass, Tailwind classes or layout markup. `/hu-roy`, `/spec-roy` and `/consult-figma-roy` apply it.
- Do not use it to read a Figma design (that is `/consult-figma-roy`) or to create files in Figma.

## 1. Detect the approach (never assume)

Read `package.json` and the lockfile, the styling config and the project memory file. Find:

- **Approach:** plain CSS, SCSS/Sass, Tailwind, CSS Modules or CSS-in-JS. Several can coexist: follow the one used by the file you are editing.
- **Versions:** the installed version of Tailwind, Sass or the UI framework, from the lockfile.
- **Tooling:** `stylelint`, `prettier` (and its Tailwind plugin), `postcss`, `browserslist`.
- **Breakpoints and tokens:** where they are defined (Tailwind theme, SCSS variables or mixins, CSS custom properties).

If you cannot determine the approach, ask once with closed options.

## 2. Route to the right reference

| Approach | Read |
|---|---|
| Plain CSS, SCSS or Sass | `references/bem.md` and `references/modern-css.md` |
| Tailwind | `references/tailwind.md` and `references/modern-css.md` |
| Any (layout that must adapt) | `references/responsive.md` |

Another convention that is already consistent in the project (CSS Modules, a design system, another naming scheme) wins over BEM: follow it and say so.

## 3. Rules for every approach

1. **Mobile-first.** Base styles for the smallest screen, then `min-width` (or the framework's prefixes) to grow.
2. **Modern layout.** Flexbox for one dimension, Grid for two. No floats, no table layouts, no positioning hacks for layout.
3. **Tokens, not magic values.** Colors, spacing, type and radii come from the project's variables or theme. A new value is proposed as a token, not hardcoded.
4. **Existing breakpoints only.** Never invent a breakpoint: use the project's (`references/responsive.md`).
5. **Support check.** Before using a recent CSS feature, check it against the project's `browserslist` or the Baseline status (Context7 or MDN). If it is not supported, use `@supports` or a fallback.
6. **Accessible by default.** Visible `:focus-visible` styles, respect `prefers-reduced-motion`, no information by color alone.
7. **No `!important`** and no deep selector chains to win specificity. Fix the structure instead.

## 4. Stay current

Before writing code that depends on a framework's API or syntax, consult Context7 for the **version in the lockfile** (the rules' "Libraries" paragraph): Tailwind v3 and v4 are configured differently, and Sass has replaced `@import` with `@use` and `@forward`. Cite library and version. If a newer major exists, mention it in **one line** and do not upgrade without the user's yes.

## 5. Verify

- Run the project's `stylelint` or lint script if one exists; otherwise say none exists.
- Do not run the build unless asked. For visual checks at several widths, offer `/e2e-roy` (one line).
- Report what you could not verify (real browsers, real devices).

Correct:
```scss
.card {
  display: grid;
  gap: var(--space-4);

  &__title { font-size: var(--font-size-lg); }
  &--featured { border-color: var(--color-accent); }
}
```

Incorrect:
```scss
.card .title h2.big { font-size: 18px !important; float: left; }
```
It fails because it chains selectors to the tag level, hardcodes a size, uses `!important` and lays out with a float.

## If it fails

If the approach, a breakpoint or a token is unclear, ask; do not invent it. If a feature has no support in the project's browsers, say so and propose the fallback.

## Final checklist

- [ ] Approach and versions detected from the real project
- [ ] Followed the project's convention (BEM if there is none)
- [ ] Mobile-first, existing breakpoints only
- [ ] Flexbox or Grid for layout, no legacy hacks
- [ ] Tokens instead of hardcoded values
- [ ] Support checked against browserslist or Baseline
- [ ] Focus, reduced motion and contrast handled
- [ ] No `!important`, no deep selectors
- [ ] Framework docs consulted for the lockfile version
- [ ] Lint run if it exists; limits reported
