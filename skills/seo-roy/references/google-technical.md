# Google crawling and indexing

Last verified: 2026-11-09

## robots.txt and noindex

- robots.txt manages crawl traffic; to keep a page out of Google use `noindex` or password protection, not robots.txt.
- One file per host at its root, UTF-8, rules are case-sensitive; it applies only to its own protocol, host and port.
- Supported fields: `user-agent`, `allow`, `disallow`, `sitemap`. Others such as `crawl-delay` are not supported. Size limit: 500 KiB.
- A 4xx on robots.txt (except 429) is treated as no robots.txt; on a 5xx Google pauses crawling for the first 12 hours while it keeps retrying.
- `noindex` is read only if the page is crawlable: a page blocked in robots.txt never shows its `noindex`. Google does not support `noindex` inside robots.txt.
- For non-HTML files use the `X-Robots-Tag` header. When rules conflict the most restrictive applies.

Source: https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt
Source: https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
Source: https://developers.google.com/search/docs/crawling-indexing/block-indexing
Source: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag

## Canonical URLs and duplicates

- Signals from strongest to weakest: 301 redirect, `rel="canonical"`, then the sitemap. None is required.
- Put a self-referencing `rel="canonical"` on the canonical page and prefer absolute URLs.
- Do not give different canonicals in the sitemap and in the page, do not pick a canonical with `noindex`, and do not use robots.txt for it.
- `rel="canonical"` tags that carry `hreflang`, `lang`, `media` or `type` are ignored for canonicalization.
- Google may pick a different canonical than the one declared; check it with the URL Inspection tool. Re-evaluation can take up to two weeks.

Source: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
Source: https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting

## Status codes and redirects

- A 2xx does not guarantee indexing; a 2xx page that looks like an error is reported as a soft 404.
- 4xx (except 429): the content is treated as missing and drops out of the index over time. 429 and 5xx slow the crawl; persistent 5xx URLs leave the index.
- Googlebot follows up to 10 redirect hops. 301 and 308 are strong signals; 302, 303 and 307 are weak.
- Prefer server-side 301 or 308; a JavaScript redirect is the last resort.
- In a site move keep the redirects for at least 1 year, avoid chains, and do not send many URLs to one unrelated page. Removed URLs with no destination return 404 or 410.

Source: https://developers.google.com/search/docs/crawling-indexing/http-network-errors
Source: https://developers.google.com/search/docs/crawling-indexing/301-redirects
Source: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes

## Sitemaps

- A sitemap is a hint, not a guarantee; a well-linked site of about 500 pages or fewer may not need one.
- Limits per sitemap: 50 MB uncompressed or 50,000 URLs; split larger ones and use a sitemap index.
- UTF-8, absolute URLs, and only canonical URLs.
- Google ignores `priority` and `changefreq`, and uses `lastmod` only when it is consistently accurate.
- Submit it in Search Console or with a `Sitemap:` line in robots.txt.

Source: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
Source: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview

## URLs and links

- A crawlable link is an `<a>` element with an `href`; `onclick`-only links, `<span href>` and `javascript:` hrefs are not recommended.
- Every important page needs at least one internal link. Use descriptive anchor text; for an image link Google uses its `alt`.
- Do not change content behind a fragment (`#/route`); use the History API. URLs are case-sensitive, so keep one casing.
- Use hyphens in paths, limit parameters that do not change content and keep session IDs out of URLs.
- Mark paid links with `rel="sponsored"`, user content with `rel="ugc"`, otherwise `rel="nofollow"`.

Source: https://developers.google.com/search/docs/crawling-indexing/links-crawlable
Source: https://developers.google.com/search/docs/crawling-indexing/url-structure
Source: https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links

## JavaScript rendering

- Pages with a 200 go to the render queue unless they carry `noindex`; only content in the rendered HTML is indexed.
- Do not put `noindex` in the original HTML of a page you want indexed; changing it with JavaScript may not work. A canonical set by JavaScript must be unique and match the one in the original HTML.
- Single-page apps need real status codes: send missing routes to a URL that returns 404 or add `noindex` with JavaScript.
- Googlebot uses HTTP only (no WebSockets or WebRTC), keeps no `localStorage` or cookies between loads and asks no permissions.
- Dynamic rendering was a workaround and is not recommended; use server-side rendering, static rendering or hydration.
- Do not lazy-load content visible on load; infinite scroll must expose paginated URLs. Googlebot reads the first 2 MB of a file; other crawlers 15 MB.

Source: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
Source: https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript
Source: https://developers.google.com/search/docs/crawling-indexing/googlebot

## Mobile, languages, pagination and facets

- Google indexes the mobile version: same content, robots meta and structured data on mobile and desktop, and no main content behind a click or scroll.
- `hreflang`: every version lists itself and all the others, with absolute URLs; add `x-default` for unmatched users. Use one URL per language and do not redirect by browser language.
- Pagination: one URL per page (for example `?page=2`) linked with `<a href>`; Google no longer uses `rel="next"` or `rel="prev"`.
- Faceted filters: block filter parameters in robots.txt if they should not be indexed, and return 404 for combinations with no results.

Source: https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing
Source: https://developers.google.com/search/docs/specialty/international/localized-versions
Source: https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading
Source: https://developers.google.com/search/docs/crawling-indexing/crawling-managing-faceted-navigation
