# SEO checklist

Verifiable items for the author and for the reviewer. An unmet item caused by the change is a finding.

- [ ] The Nuxt version, rendering mode and installed SEO modules were detected, and Nuxt 3 end of life was reported when present.
- [ ] Page content and head tags are in the server-rendered HTML (checked with view-source or `curl`), not only after JavaScript runs.
- [ ] Each indexable page has one absolute, self-referencing canonical, and host, protocol and trailing slash are consistent.
- [ ] Pages that must stay out of Google use `noindex` and are not blocked in robots.txt; staging and preview builds are not indexable.
- [ ] Missing pages return a real 404 (or 410) and moved pages a 301 or 308; there is no soft 404 and no blanket redirect of 404s to the home page.
- [ ] The sitemap lists only canonical, indexable URLs and is reachable at `/sitemap.xml` in production; `site.url` is the production URL.
- [ ] Titles and meta descriptions are unique and descriptive, and no length or keyword-position rule was invented.
- [ ] Structured data is JSON-LD, matches the visible content, has the required properties and passes the Rich Results Test; no retired type (FAQ, how-to) was added.
- [ ] Internal links are `<a href>` and images have `alt`; the LCP image is not lazy-loaded.
- [ ] Multilingual pages list every language version with absolute `hreflang` URLs and a production `baseUrl`.
- [ ] Anything not verified (real indexing, rich results, rankings) was stated.
