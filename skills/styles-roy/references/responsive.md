# Responsive design

Read it whenever a layout must adapt to different screen sizes.

## 1. Find the project's breakpoints

Never invent a breakpoint. Look, in this order:

1. Tailwind theme (`@theme` `--breakpoint-*` in v4, `theme.screens` in v3).
2. SCSS variables, maps or mixins (for example `$breakpoints`, `@mixin respond-to`).
3. CSS custom media or the media queries already repeated in the code (grep for `@media`).
4. The design system or UI framework's documented breakpoints.

If none exist or they conflict, ask which ones to use; do not pick them on your own. Report the list you found.

## 2. Build mobile-first

- Base styles for the smallest screen, then `min-width` queries (or Tailwind's prefixes) to grow.
- Prefer **content-driven** layouts (`auto-fit`, `minmax()`, `clamp()`, wrapping flex) over a media query per device.
- Use **container queries** for reusable components, and media queries for page-level structure.
- Fluid type and spacing with `clamp()` where it removes breakpoints.

## 3. Check each of these

- [ ] No horizontal scroll at any width (check images, tables, long words, fixed widths).
- [ ] Navigation, forms and tables have a defined small-screen behavior.
- [ ] Images and media scale (`max-width: 100%`, `height: auto`, `aspect-ratio`).
- [ ] Touch targets are comfortably tappable and not crowded on small screens.
- [ ] Long content and empty content do not break the layout.
- [ ] Text stays readable when zoomed and when the user's font size is larger.
- [ ] A design that has only one size (see `/consult-figma-roy`) has an agreed behavior for the others.

## 4. Verify

- Offer `/e2e-roy` to resize the browser and check the project's breakpoints (one line); do not run it without the user's yes.
- Say which widths you checked and which you did not. Real devices and real browsers are not verified by code reading.

## Incorrect → correct

```css
/* Incorrect: desktop-first with an invented breakpoint */
.nav { display: flex; }
@media (max-width: 817px) { .nav { display: block; } }
```
```css
/* Correct: mobile-first with the project's breakpoint */
.nav { display: block; }
@media (min-width: 48rem) { .nav { display: flex; } } /* the project's "md" */
```
The first uses a number nobody defined and works against the base; the second grows from the smallest screen with a token the project owns.
