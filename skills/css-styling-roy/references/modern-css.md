# Modern CSS

Read it for any approach: it applies to plain CSS, Sass and to the CSS you write next to Tailwind.

**Before using a recent feature, check support** against the project's `browserslist` or the Baseline status (Context7 or MDN). If it is not supported, use `@supports` or a fallback. Do not state a feature's support from memory.

## Layout

| Need | Use |
|---|---|
| One dimension (row or column of items) | Flexbox (`display: flex`, `gap`) |
| Two dimensions, or aligned rows and columns | Grid (`display: grid`, `grid-template-columns`, `gap`) |
| Responsive grid with no media query | `grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr))` |
| Child aligned to the parent's tracks | Subgrid (check support) |
| Keep a ratio | `aspect-ratio` |
| Center | `place-items: center` / `place-content: center` |

Use `gap` for spacing between items, not margins on children. No floats or table layouts for layout.

## Values and units

- **Custom properties** (`--space-4`, `--color-accent`) as the single source of tokens. Define them on `:root` or on the component.
- **`rem`** for type and spacing, `em` for values that must scale with the component's font size, `px` only for hairlines (borders).
- **Fluid sizing:** `clamp(min, preferred, max)`, `min()` and `max()` for type and spacing, instead of piles of media queries.
- **Logical properties** (`margin-inline`, `padding-block`, `inset-inline-start`) instead of left/right where the project supports other writing directions or may in the future.
- **Viewport units:** prefer `dvh`/`svh` over `vh` for full-height mobile layouts (check support).

## Selectors and structure

- `:is()` and `:where()` to group selectors; `:where()` keeps specificity at zero.
- `:has()` for parent-based styling; check support first.
- Native CSS nesting only if the project's `browserslist` supports it, or if a preprocessor is not already doing it.
- `@layer` to control the cascade order (reset, base, components, utilities) instead of raising specificity.
- **Container queries** (`@container`) for components that adapt to their own space, and media queries for page-level layout.

## Interaction and accessibility

- `:focus-visible` with a clearly visible outline; never `outline: none` without a replacement.
- `@media (prefers-reduced-motion: reduce)` to cut non-essential animation.
- `@media (prefers-color-scheme: dark)` when the project supports dark mode.
- Animate `transform` and `opacity`, not layout properties.

## Incorrect → correct

```css
/* Incorrect */
.item { float: left; margin-right: 16px; width: 31%; }
```
```css
/* Correct */
.list { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); }
```
The first breaks with different content widths, hardcodes sizes and needs a clearfix; the second adapts by itself.

## Checklist

- [ ] Flexbox or Grid, with `gap`
- [ ] Tokens as custom properties, no hardcoded values
- [ ] Fluid values with `clamp()` where it removes media queries
- [ ] Support checked for every recent feature used
- [ ] Visible focus and reduced-motion handled
