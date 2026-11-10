# Nuxt SEO modules

Last verified: 2026-11-09

## Versions and installation

- `@nuxtjs/seo` bundles Sitemap, Robots, OG Image, Schema.org, Link Checker, SEO Utils, Site Config, AI Ready and Skew Protection. Install with `npx nuxt module add @nuxtjs/seo`.
- Version 6 requires Nuxt ^4.6.1 or ^5.0.0 and Node ^22.22.3, ^24.15.0 or >=26.0.0. The migration guide says Nuxt 3 sites stay on version 5.
- When `@nuxtjs/i18n` is used, version 6 needs `@nuxtjs/i18n` v10 or newer. Disable bundled modules you do not use with `aiReady: false` or `skewProtection: false`.

| Package | With Nuxt SEO v5 (Nuxt 3) | With Nuxt SEO v6 (Nuxt 4) |
|---|---|---|
| `nuxt-site-config` | v4 | v5 |
| `@nuxtjs/robots` | v6 | v7 |
| `@nuxtjs/sitemap` | v8 | v9 |
| `nuxt-og-image`, `nuxt-schema-org` | v6 | v7 |
| `nuxt-seo-utils` | v8 | v9 |
| `nuxt-link-checker` | v5 | v6 |

Source: https://nuxtseo.com/docs/nuxt-seo/getting-started/installation
Source: https://nuxtseo.com/docs/nuxt-seo/migration-guide/v5-to-v6.md

## Site config

- Set `site.url` and `site.name`. The URL is filled in automatically only on Vercel, Netlify and Cloudflare Pages; elsewhere set it in `nuxt.config`. Without it the sitemap uses localhost in production.
- `site.indexable` defaults to `env === 'production'`. Set `NUXT_SITE_ENV=staging` on staging builds (for static builds, in the CI that runs the build) so staging is not indexed.
- `site.trailingSlash` defaults to `false`; keep it consistent with the links.

Source: https://nuxtseo.com/docs/site-config/api/config
Source: https://nuxtseo.com/docs/site-config/guides/how-it-works

## Robots

- The module writes `robots.txt`, a `<meta name="robots">` tag and an `X-Robots-Tag` header (`metaTag` and `header` default to `true`).
- Block a whole site with `site: { indexable: false }`. Per route use `routeRules: { '/path/**': { robots: 'noindex, nofollow' } }`; `false` disables it and the most specific route wins.
- Options: `groups` (`userAgent`, `disallow`, `allow`), `disallow`, `allow`, `sitemap`; `disallowNonIndexableRoutes` is deprecated. robots.txt controls crawling and `noindex` controls indexing: never block in robots.txt a URL that must show `noindex`.
- `blockAiBots: true` blocks training, search and retrieval bots and can reduce visibility in AI answers; `'training'` blocks only training bots. robots.txt is voluntary.

Source: https://nuxtseo.com/docs/robots/guides/disable-indexing
Source: https://nuxtseo.com/docs/robots/api/config
Source: https://nuxtseo.com/docs/robots/guides/robot-recipes

## Sitemap

- `/sitemap.xml` works with no configuration once `site.url` is set. Check it in production and submit it in Search Console under Indexing, Sitemaps.
- Filter with `sitemap.exclude` and `sitemap.include` (strings or RegExp; a string cannot have a variable segment before a fixed one) or `routeRules: { '/secret/**': { robots: false } }`.
- Dynamic pages: create `server/api/__sitemap__/urls.ts` with `defineSitemapEventHandler()` from `#sitemap/server`, return `{ loc, lastmod }` items and register it in `sitemap.sources`. Static extras go in `sitemap.urls`.
- Production cache is 10 minutes (`cacheMaxAgeSeconds`). `autoLastmod` is `false` by default.
- With `@nuxtjs/i18n` it builds one sitemap per locale with `alternatives` (`hreflang`); use `_i18nTransform: true` for dynamic URLs or `autoI18n: false` to turn it off.

Source: https://nuxtseo.com/docs/sitemap/getting-started/installation
Source: https://nuxtseo.com/docs/sitemap/guides/filtering-urls
Source: https://nuxtseo.com/docs/sitemap/guides/dynamic-urls
Source: https://nuxtseo.com/docs/sitemap/guides/i18n
Source: https://nuxtseo.com/learn-seo/nuxt/launch-and-listen/going-live

## Schema.org

- Needs server rendering; in a single-page app add the JSON-LD with `useHead`.
- Set the site identity in `nuxt.config` under `schemaOrg.identity` (`Person`, `Organization` or `LocalBusiness`). For a subtype set `'@type'` there (for example `'ProfessionalService'`); do not wrap it in `defineLocalBusiness()` in the config, it loses the type. `OnlineStore` is not a valid identity string; use `defineOrganization({ '@type': ['Organization', 'Store', 'OnlineStore'] })`.
- Per page use `useSchemaOrg(input)` with `definePerson`, `defineOrganization`, `defineLocalBusiness` or `defineWebPage`. It is reactive in development and static in production unless `reactive` is on.
- Nothing is rendered for a page excluded from indexing. Validate the output with Google's Rich Results Test.

Source: https://nuxtseo.com/docs/schema-org/getting-started/installation
Source: https://nuxtseo.com/docs/schema-org/guides/setup-identity
Source: https://nuxtseo.com/docs/schema-org/api/use-schema-org

## SEO Utils and Link Checker

- SEO Utils sets canonical and `og:url` automatically; `canonicalQueryWhitelist` keeps only `page`, `sort`, `filter`, `search`, `q`, `category`, `tag` by default and `canonicalLowercase` is `true`.
- `redirectToCanonicalSiteUrl` (301 to the canonical domain) is `false` by default; test it before enabling.
- `seo.redirects` accepts `{ to, statusCode }` for 301 or 308 and `{ statusCode: 410 }` or `404` for retired URLs.
- `useBreadcrumbItems()` builds the `BreadcrumbList`; render the breadcrumb in the page, not in a top-level layout.
- Link Checker (`linkChecker`): `failOnError` is `false` by default, so set it to `true` in CI. It scans prerendered pages only, and a link to a page not yet deployed returns 404.

Source: https://nuxtseo.com/docs/seo-utils/api/config
Source: https://nuxtseo.com/docs/seo-utils/api/breadcrumbs
Source: https://nuxtseo.com/docs/link-checker/api/config
Source: https://nuxtseo.com/docs/link-checker/guides/build-scans

## OG Image

- Enable a renderer with `npx nuxt-og-image enable takumi`, `satori` or `browser`; the component suffix (`MyTemplate.takumi.vue`) picks it. Takumi is the recommended one.
- The Browser renderer works only at prerender time, not on Lambda, Vercel or Netlify serverless. Static sites (`nuxt generate`): use `ogImage: { zeroRuntime: true }` with prerendered routes. AWS Amplify is not in the compatibility table, so test it.
- `defineOgImage(component, props, options)` defaults to 1200x600 PNG. Remove it from a route with `ogImage: false` in `routeRules`. Pass a slug, not many props, to keep URLs short. Signed image URLs need `NUXT_APP_SECRET` (32 characters or more) in production.

Source: https://nuxtseo.com/docs/og-image/renderers
Source: https://nuxtseo.com/docs/og-image/api/define-og-image
Source: https://nuxtseo.com/docs/og-image/guides/performance

## Internationalization

- `@nuxtjs/i18n` needs `locales` as objects with `code` and `language` (a BCP-47 tag used as the `hreflang` value) and `baseUrl` set to the production domain so alternate URLs are absolute (string or function).
- `useLocaleHead()` returns `htmlAttrs` (`lang`, `dir`), `link` (`hreflang`, `canonical`) and `meta` (`og:locale`). Canonical drops query parameters unless `canonicalQueries` lists them.
- With `prefix_and_default` the canonical points to the unprefixed URL. The catch-all `hreflang` of each language group is the first locale or the one with `isCatchallLocale: true`. The guide does not mention `x-default`, which Google recommends: check the generated tags.

Source: https://i18n.nuxtjs.org/docs/guide/seo
Source: https://i18n.nuxtjs.org/docs/api/options
