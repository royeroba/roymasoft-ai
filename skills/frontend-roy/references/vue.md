# Vue

Last verified: 2026-10-06

Security rules for Vue (templates, `v-html`, URLs) live in `/security-roy`; testing guidance in `/testing-roy`. This page covers rendering cost.

## Page load

- Avoid a pure client-side SPA when page load performance is critical; use server-side rendering or static site generation for faster time to content.
- Use a build step so unused Vue APIs are tree-shaken, and choose ES-module dependencies that tree-shake well (for example `lodash-es` instead of `lodash`).
- Split code: lazy-load non-critical features with dynamic `import()`, `defineAsyncComponent` for components and lazy-loaded routes in Vue Router.

Source: https://vuejs.org/guide/best-practices/performance.html

## Updates

- Keep the props passed to child components stable: pass a derived boolean such as `:active="item.id === activeId"` instead of `:active-id="activeId"` to every item, so only changed items re-render.
- Use `v-once` for content rendered once and `v-memo` to skip updates of large sub-trees or lists.
- Computed properties only trigger effects when their value changes (Vue 3.4 and later); in an object-returning computed, return the old value when nothing changed.

Source: https://vuejs.org/guide/best-practices/performance.html

## General

- Virtualize large lists so only the visible items render.
- Reduce reactivity overhead for large immutable structures with shallow APIs such as `shallowRef`, replacing the root value on change.
- Avoid unnecessary component abstractions (renderless or higher-order components) in large lists: a component instance costs more than a DOM node.
- Measure with the browser profiler first; apply these only where a measurement shows the cost.

Source: https://vuejs.org/guide/best-practices/performance.html
