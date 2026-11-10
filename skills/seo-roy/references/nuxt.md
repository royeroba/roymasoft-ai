# Nuxt 4 for search engines

Last verified: 2026-11-09

## Rendering mode for public sites

- Universal rendering (SSR) is the default and the docs call it well suited to marketing sites. Client-only rendering (`ssr: false`) is discouraged for public pages because crawlers do not wait for JavaScript to run.
- `routeRules` sets the mode per route: `prerender`, `swr`, `isr` (CDN cache, documented for Netlify and Vercel), `ssr: false`, `redirect`, `headers`.
- Hybrid rendering is not available with `nuxt generate`; use `nuxt build` with a server or a host that supports the rules.
- Verify the deployed result: view the page source or run `curl` and confirm the content and tags are in the HTML without JavaScript.

Source: https://nuxt.com/docs/4.x/guide/concepts/rendering
Source: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/rendering

## Prerendering

- `nuxt generate` starts at `/` and follows `<a href>` links, so a page nothing links to is not found on its own.
- Add routes with `nitro.prerender.routes`, `routeRules: { '/blog/**': { prerender: true } }` or the `prerender:routes` hook.
- Each prerendered route also gets a `_payload.json` (`experimental.payloadExtraction` is on by default).

Source: https://nuxt.com/docs/4.x/getting-started/prerendering

## Head and meta tags

- Nuxt manages the head with Unhead. `useSeoMeta` is the recommended way: a flat typed object, reactive with a `ref` or a getter (`() => value`).
- For static tags wrap the call in `if (import.meta.server)`; `useServerSeoMeta` is deprecated.
- `app.head` in `nuxt.config` holds static defaults (default title, `htmlAttrs.lang`, favicon) and is not reactive. A dynamic `titleTemplate` is recommended in `app.vue`, because `nuxt.config` cannot hold a function.
- Use `useHead` for `link`, `script` and other tags, and `useHeadSafe` for user-supplied data. Unhead v2 removed `vmid`, `hid`, `children` and `body`.
- If meta tags do not update after navigation, pass reactive values to `useSeoMeta` or `useHead`.

Source: https://nuxt.com/docs/4.x/getting-started/seo-meta
Source: https://nuxt.com/docs/4.x/api/composables/use-seo-meta
Source: https://nuxt.com/docs/4.x/api/composables/use-head

## Real 404 pages

- Throw the error from the page: `throw createError({ status: 404, statusText: 'Page Not Found' })`. A template that only renders "404" answers 200, which is a soft 404.
- Custom page: `error.vue` at the root of `srcDir`. `statusText` must be short ASCII; put longer text in `message`.
- Do not redirect every 404 to the home page.
- On static hosting `experimental.prerenderErrorPages: true` prerenders `404.html` as real HTML (the default is an empty shell).
- The docs do not state the HTTP code returned per setup; check it with `curl -I` on the deployed host.

Source: https://nuxt.com/docs/4.x/getting-started/error-handling
Source: https://nuxt.com/docs/4.x/guide/concepts/rendering
Source: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/404-pages

## Redirects, links and trailing slash

- Server redirects: `routeRules: { '/old': { redirect: { to: '/new', statusCode: 301 } } }`. Use 301 or 308 for permanent moves.
- `navigateTo(to, { redirectCode })` redirects with 302 by default on the server; set 301 for permanent ones.
- `<NuxtLink>` renders a real `<a href>`. Keep trailing slashes consistent: `site.trailingSlash` for the SEO modules and `experimental.defaults.nuxtLink.trailingSlash: 'append' | 'remove'` for links.
- An exact-path `routeRules` entry can create a redirect loop when trailing slashes are involved.

Source: https://nuxt.com/docs/4.x/api/utils/navigate-to
Source: https://nuxt.com/docs/4.x/api/components/nuxt-link
Source: https://nuxtseo.com/learn-seo/nuxt/routes-and-rendering/trailing-slashes

## Images, fonts and third-party scripts

- `@nuxt/image`: always give `<NuxtImg>` an `alt` (empty for decorative images), set `sizes` and `format`, and preload the likely LCP image with `:preload="{ fetchPriority: 'high' }"`. Never lazy-load the LCP image.
- Building on one operating system and deploying on Linux can fail with `[IPX_ERROR] Could not load the "sharp" module`; install `sharp` for the target platform.
- `@nuxt/fonts` downloads fonts at build time, serves them from your origin and scales the fallback to reduce layout shift.
- `@nuxt/scripts`: `useScript` loads on `onNuxtReady` by default, or on `manual`, interaction or visibility triggers; Tag Manager and Analytics are `scripts.registry` entries.
- Thresholds and measurement: `../../frontend-roy/references/performance.md`.

Source: https://nuxt.com/modules/image
Source: https://nuxt.com/modules/fonts
Source: https://scripts.nuxt.com/docs/guides/script-triggers
Source: https://web.dev/articles/optimize-lcp

## Nuxt 3 end of life

- Nuxt 3 reached end of life on 2026-07-31 and gets no bug fixes or security patches. Nuxt 4 is the stable line; Nuxt 5 is estimated for Q4 2026 and was not released at the last check.
- Upgrade with `npx nuxt upgrade` or `npm install nuxt@^4.0.0`, then run the codemod `npx codemod@0.18.7 nuxt/4/migration-recipe`.
- Breaking changes that touch SEO code: `srcDir` defaults to `app/`, Unhead v2 head options, `route.meta.name` becomes `route.name`, and `error.data` arrives already parsed.
- Nuxt SEO v6 needs Nuxt 4.6.1 or newer; Nuxt 3 sites stay on Nuxt SEO v5 until they migrate.

Source: https://nuxt.com/docs/4.x/community/roadmap
Source: https://endoflife.date/nuxt
Source: https://nuxt.com/docs/4.x/getting-started/upgrade
