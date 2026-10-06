# BEM for plain CSS, SCSS and Sass

Read it when the project uses CSS, SCSS or Sass and has no other consistent naming convention.

## Naming

Block, Element, Modifier, written in lowercase kebab-case:

| Part | Syntax | Example |
|---|---|---|
| Block | `.block` | `.card` |
| Element | `.block__element` | `.card__title` |
| Modifier | `.block--modifier` or `.block__element--modifier` | `.card--featured`, `.card__title--small` |

Rules:

1. A **block** is an independent component that makes sense on its own. It never depends on where it is placed.
2. An **element** belongs to exactly one block. Never chain elements: `.card__body__title` is wrong; use `.card__title`.
3. A **modifier** changes appearance or state and is always used **together with** the base class (`class="card card--featured"`).
4. Style by **single class**: no tag selectors, no IDs and no chains like `.card .title` for styling.
5. Do not style a block's layout position from inside it. Position it from its parent with a **mix** (an extra class from the parent's block): `class="card header__card"`.
6. State from JavaScript: use `is-*` or `has-*` classes, or ARIA attributes (`[aria-expanded="true"]`), not new modifiers.

If the project already uses a variant (for example `block__elem_mod`), follow the project's.

## In SCSS

Use `&` to build names; keep nesting to one level under the block:

```scss
.card {
  display: grid;
  gap: var(--space-4);

  &__title { font-size: var(--font-size-lg); }
  &__action { justify-self: end; }
  &--featured { border-color: var(--color-accent); }
}
```

Correct HTML: `<article class="card card--featured"><h2 class="card__title">…</h2></article>`.

Incorrect:

```scss
.card { .title { h2 { .icon { color: red; } } } }
```
It fails because it nests four levels, depends on tags and on the DOM structure, and cannot be reused outside `.card`.

## Files and structure

- One block per file (`_card.scss` or `card.css`), named after the block.
- Sass: use `@use` and `@forward` (the module system), not `@import`. Check the installed Sass version through Context7 before relying on a feature.
- Share values with variables or custom properties, not by copying them.

## Checklist

- [ ] Names in kebab-case, `block__element--modifier`
- [ ] No element chains (`__a__b`) and no tag or ID selectors
- [ ] Modifiers always paired with the base class
- [ ] Nesting no deeper than one level under the block
- [ ] Layout position given by the parent through a mix
