---
name: seo-roy
description: "Guides technical SEO for public websites built with Nuxt so Google can crawl, index and show them: rendering, head tags, canonical URLs, robots.txt and noindex, sitemap, status codes and soft 404s, structured data, hreflang and the Nuxt SEO modules. Trigger: the user asks about 'SEO', 'index my site in Google', 'my Nuxt page is not in Google', 'sitemap', 'robots.txt', 'canonical', 'noindex', 'structured data', 'JSON-LD', 'schema.org', 'meta description', 'hreflang', 'Google Search Console', 'Nuxt SEO', or a change adds or edits a public page's head tags, sitemap or robots rules."
disable-model-invocation: false
argument-hint: "the site, page or indexing problem"
---

# /seo-roy — Technical SEO for public Nuxt sites

You build and review public pages with the official Google Search Central, Nuxt and Nuxt SEO guidance cited in `references/`. **The repo's Nuxt version, rendering mode and modules come first**; you do not migrate Nuxt or add modules on your own. You make no ranking or indexing promises: Google decides, and indexing takes days to weeks.

## When to use / when not

- Use it for public pages that should appear in Google: head tags, canonical, robots, sitemap, status codes, structured data, languages and the Nuxt SEO modules.
- Do not use it for components, accessibility or Core Web Vitals measurement (that is `/frontend-roy` and `/performance-roy`), CSS (that is `/styles-roy`) or XSS and CSP (that is `/security-roy`).
- Private or logged-in apps such as dashboards are not indexed: say so instead of adding SEO.
- Keyword research, copywriting and commercial SEO tools are out of scope; say so.

## 1. Detect (never assume)

Read `package.json` and the lockfile for the **Nuxt major and version**, the installed SEO modules and their versions (`@nuxtjs/seo` or the separate ones), `@nuxtjs/i18n`, and `nuxt.config` for `ssr`, `routeRules`, `nitro.preset`, `site`, `app.head` and `i18n`. Look for `public/robots.txt` and `public/sitemap.xml`. If the site is on Nuxt 3, tell the user it has been without support since 2026-07-31 and that Nuxt SEO v6 needs Nuxt 4.6.1 or newer. Consult Context7 for the installed version of a module before using its API. If it is unclear whether the site should be indexed, ask once with closed options.

## 2. Route to the right reference

| Need | Read |
|---|---|
| Crawling, robots.txt, `noindex`, canonical, status codes, redirects, sitemaps, links, JavaScript, languages | `references/google-technical.md` |
| Titles, meta description, structured data, retired rich results, AI features, spam | `references/snippets-and-structured-data.md` |
| Nuxt rendering, head tags, 404s, redirects, images, scripts, Nuxt 3 end of life | `references/nuxt.md` |
| Nuxt SEO modules, versions, `site` config, sitemap, robots, schema.org, OG images, i18n | `references/nuxt-seo-modules.md` |
| Before closing | `references/checklist.md` |

Core Web Vitals thresholds live in `../frontend-roy/references/performance.md`; do not copy them here.

## 3. Rules for every public site

1. **Content in the HTML.** Content and head tags are in the server-rendered HTML, not only after JavaScript.
2. **One canonical.** Each indexable page has one absolute, self-referencing canonical; host, protocol and trailing slash are consistent.
3. **Index control.** Pages that must stay out use `noindex` and stay crawlable; robots.txt manages crawling and never hides a page.
4. **Real status codes.** Missing pages return 404 or 410, permanent moves 301 or 308; no soft 404 and no blanket redirect of 404s to the home page.
5. **Honest sitemap.** It lists only canonical, indexable URLs.
6. **Titles and descriptions.** Unique, descriptive and written for users. Google sets no length limit, so do not invent character or keyword-position rules.
7. **Structured data.** JSON-LD that matches the visible content, with the required properties; never add retired types such as FAQ or how-to.
8. **No indexing by accident.** Staging and previews are not indexable (`NUXT_SITE_ENV`).
9. **No folklore.** The `keywords` meta tag, `llms.txt`, word counts and AI detectors are not Google requirements.

## 4. Verify

View the source or run `curl` on the built or deployed page and check the tags and the status code (`curl -I`). Check `/robots.txt` and `/sitemap.xml`. Validate structured data with the Rich Results Test and inspect URLs in Search Console. Run `nuxt build` only if the user allows it. Say what was not verified: real indexing, rich results and rankings cannot be confirmed from the code.

Correct (Nuxt 4):
```vue
<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)
if (!post.value) throw createError({ status: 404, statusText: 'Post not found' })
useSeoMeta({ title: () => post.value!.title, description: () => post.value!.summary })
</script>
```

Incorrect:
```vue
<template>
  <article v-if="post">{{ post.title }}</article>
  <p v-else>Post not found</p>
</template>
```
It fails because a missing post still answers 200, so Google can treat the URL as a soft 404 and keep it in the index.

## If it fails

If a claim depends on what Google does after publishing, or a module version is unknown, say so instead of declaring it fixed. Never remove a `noindex` or edit robots rules without knowing why they were set.

## Final checklist

Use `references/checklist.md`. Summary:

- [ ] Nuxt version, rendering mode and SEO modules detected; Nuxt 3 end of life reported if present
- [ ] Content and tags verified in the server HTML, with the real status codes
- [ ] One canonical per page; `noindex` and robots.txt used for their own purpose
- [ ] Sitemap and structured data valid and consistent with the visible content
- [ ] Unverified items (indexing, rich results, rankings) stated
