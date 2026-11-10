# Accessibility

Last verified: 2026-10-06

## WCAG 2.2 in short

WCAG is organized in four principles: Perceivable, Operable, Understandable and Robust. It has three conformance levels: A (basic), AA (intermediate, broader audiences) and AAA (advanced). **Plugin policy:** target level AA unless the user states another requirement.

Source: https://www.w3.org/TR/WCAG22/

## New in WCAG 2.2

- AA: 2.4.11 Focus Not Obscured (Minimum), 2.5.7 Dragging Movements, 2.5.8 Target Size (Minimum), 3.3.8 Accessible Authentication (Minimum).
- A: 3.2.6 Consistent Help, 3.3.7 Redundant Entry.
- AAA: 2.4.12 Focus Not Obscured (Enhanced), 2.4.13 Focus Appearance, 3.3.9 Accessible Authentication (Enhanced).

In practice: a focused element must not be hidden by sticky headers or banners; anything done by dragging needs a non-dragging alternative; interactive targets must meet the minimum size; login must not depend on a cognitive test such as transcribing or remembering; do not ask users to re-enter information they already gave in the same flow. Read the exact criterion text before claiming conformance.

Source: https://www.w3.org/TR/WCAG22/

## ARIA

"No ARIA is better than bad ARIA": incorrect ARIA misrepresents the interface to assistive technology. A role is a promise: adding `role="button"` to a `<div>` pledges that JavaScript provides the keyboard interaction, which native elements give for free. ARIA can cloak or enhance native semantics, so do not override them by accident. Test the final implementation with the relevant browser and assistive technology combinations.

Source: https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/

## Working rules

- Use native elements (`button`, `a`, `input`, `label`, headings, landmarks) before ARIA.
- Every interactive control has an accessible name and a visible focus indicator.
- Everything operable by mouse is operable by keyboard, in a logical focus order.
- Query by role and accessible name in tests (see `/testing-roy`): if a test cannot find the control that way, a user of assistive technology probably cannot either.
- Say what cannot be verified by code reading (screen reader behavior, real devices).

Source: https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/

## Auditing a page or component

Automated tools cannot judge accessibility alone, so audit in this order and say which steps you could not do:

1. **Automated scan** of the rendered page, if the repo already has a checker; read its findings, do not trust a clean result as proof.
2. **Keyboard only:** tab through everything. Every control is reachable and operable, the focus order follows the visual order, the focus is always visible, nothing traps it (modals included) and Escape closes what opened.
3. **Contrast:** measure the real colors, do not eyeball them.
4. **Zoom and text size:** zoom to 200% and enlarge the text; nothing is cut off or overlaps.
5. **Names and structure:** headings in order, landmarks, every control and image with a name or alt text, every field with a label.
6. **Screen reader:** needs a real one (NVDA, VoiceOver); if unavailable, list the flows still to test.

Source: https://www.w3.org/WAI/test-evaluate/preliminary/

## Numbers to check (WCAG 2.2 AA)

- Contrast: 4.5:1 for normal text, 3:1 for large text (1.4.3).
- Text resizes to 200% without loss of content or function (1.4.4), and content reflows at a 320 CSS pixel width without two-dimensional scrolling (1.4.10).
- Target size: at least 24 by 24 CSS pixels, with the criterion's exceptions (2.5.8). 44 by 44 is the AAA criterion (2.5.5), not a requirement for AA.

Source: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
Source: https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
Source: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
Source: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

## Findings report (plugin format)

One row per finding, anchored to something checkable: `file:line` or a selector, never "the form".

| # | Where | Criterion | Severity | Fix |
|---|---|---|---|---|
| 1 | `src/Modal.vue:42` | 2.1.2 No Keyboard Trap | Critical | Return focus to the trigger and close on Escape |

Severity (the plugin's own scale): **Critical** blocks a task for a group of users (keyboard trap, unlabeled required field); **Major** makes it hard but has a workaround (weak contrast, missing focus style); **Minor** is polish. End with the steps not verified.

Source: https://www.w3.org/WAI/test-evaluate/
