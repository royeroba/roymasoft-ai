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
