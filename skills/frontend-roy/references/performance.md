# Frontend performance

Last verified: 2026-10-06

## Core Web Vitals

Three metrics, each assessed at the 75th percentile of page loads, segmented across mobile and desktop:

- **Largest Contentful Paint (LCP):** loading; good is 2.5 seconds or less.
- **Interaction to Next Paint (INP):** interactivity; good is 200 milliseconds or less.
- **Cumulative Layout Shift (CLS):** visual stability; good is 0.1 or less.

A page is compliant only when all three meet their thresholds. Field data (real users) is the primary source; lab tools are a proxy, and Total Blocking Time stands in for INP in the lab. A good lab score does not prove users have a good experience.

Source: https://web.dev/articles/vitals

## Workflow

1. Pick the metric the user cares about and get a baseline, field data first (see `/performance-roy`).
2. Find the bottleneck with the browser profiler or the lab report; do not guess.
3. Apply one change and re-measure the same way.
4. Report before and after, and what the measurement cannot show.

Source: https://web.dev/articles/vitals

## Where the framework levers are

- Vue: server rendering or static generation, tree-shaking, code splitting, stable props, `v-memo`, list virtualization, shallow reactivity (`vue.md`).
- React: avoid unnecessary effects and derived state (`react.md`); for rendering optimizations check the installed version's documentation through Context7 before applying one.
- Any framework: load less JavaScript per route, lazy-load non-critical features and keep dependencies tree-shakeable.

Source: https://vuejs.org/guide/best-practices/performance.html
