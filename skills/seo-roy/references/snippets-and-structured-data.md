# Titles, snippets, structured data and content policies

Last verified: 2026-11-09

## Title links

- Every page gets a unique, descriptive and concise `<title>`; avoid generic text such as "Home" repeated across pages and avoid stuffing the same words.
- Google sets no length limit; it truncates the title to fit the device width. Keep the language and script of the title the same as the page.
- Google builds the title link from `<title>`, the main visible heading, `og:title` and `WebSite` structured data, and may rewrite it when the title is boilerplate, outdated, inaccurate or half-baked. Changes show up after days to weeks.

Source: https://developers.google.com/search/docs/appearance/title-link

## Snippets and meta description

- The snippet is built mainly from the page content; Google uses the meta description only when it describes the page better.
- Write a unique meta description per page that summarizes it, with no keyword lists. There is no length limit; it is truncated.
- Controls: `nosnippet`, `max-snippet` and `data-nosnippet` (include it when the element is created, do not add or remove it with JavaScript).
- Google does not use the `keywords` meta tag, and there is no minimum or maximum content length.

Source: https://developers.google.com/search/docs/appearance/snippet
Source: https://developers.google.com/search/docs/fundamentals/seo-starter-guide

## Structured data rules

- Use JSON-LD; Microdata and RDFa also work. `data-vocabulary.org` is no longer eligible.
- Include every required property of the type, use the most specific schema.org type, and mark up only what users can see on the page.
- No fake or undisclosed incentivized reviews, and no markup for empty pages. Do not block marked-up pages with robots.txt, `noindex` or a login; image URLs in the markup must be crawlable.
- Valid markup does not guarantee a rich result. Validate with the Rich Results Test and watch the Search Console reports after publishing.

Source: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
Source: https://developers.google.com/search/docs/appearance/structured-data/sd-policies

## Properties by type

- `BreadcrumbList`: `itemListElement`; each `ListItem` needs `name` and `position`, and `item` except on the last one. Follow the user's typical path, not the URL structure.
- `Organization`: nothing required; recommended `name`, `url`, `logo` (at least 112x112 px, crawlable), `sameAs`, `address`, `contactPoint`. Merchant return policies go under `Organization`.
- `LocalBusiness`: `address` and `name` required; recommended `geo`, `openingHoursSpecification`, `telephone`, `url`, `priceRange` (under 100 characters). Use `aggregateRating` and `review` only on sites that review other businesses.
- `Article`: nothing required; recommended `headline`, `image`, `datePublished`, `dateModified`, `author` with `name` and `url`.
- `Product`: a product snippet needs `name` plus one of `review`, `aggregateRating` or `offers`; merchant listings are for pages where the product can be bought.
- `VideoObject`: `name`, `thumbnailUrl` and `uploadDate` required. `WebSite` on the home page with `name` and `url` sets the site name (one name per site).

Source: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
Source: https://developers.google.com/search/docs/appearance/structured-data/organization
Source: https://developers.google.com/search/docs/appearance/structured-data/local-business
Source: https://developers.google.com/search/docs/appearance/structured-data/article
Source: https://developers.google.com/search/docs/appearance/structured-data/product-snippet
Source: https://developers.google.com/search/docs/appearance/structured-data/video
Source: https://developers.google.com/search/docs/appearance/site-names

## Retired rich results

- FAQ: no longer shown in Google Search since May 7, 2026, and its documentation was removed on June 15, 2026. How-to: no longer shown on desktop since September 13, 2023.
- Removed on September 9, 2025: course info, estimated salary, learning video, special announcement and vehicle listing. Practice problem was removed on January 6, 2026.
- Dataset markup is used only by Dataset Search, and the sitelinks search box was removed in November 2024.
- Do not add markup for a retired type hoping for a rich result.

Source: https://developers.google.com/search/updates
Source: https://developers.google.com/search/docs/appearance/structured-data/search-gallery
Source: https://developers.google.com/search/blog/2023/08/howto-faq-changes

## Favicon and images

- Favicon: a `<link rel="icon">` on the home page, square (1:1), at least 8x8 px and ideally larger than 48x48; Googlebot and Googlebot-Image must be able to crawl it. Check the supported-format list on the source page.
- Images: use `<img src>` (images set only in CSS are not indexed), a descriptive `alt` and meaningful file names. Image sitemaps are supported, including for a CDN.

Source: https://developers.google.com/search/docs/appearance/favicon-in-search
Source: https://developers.google.com/search/docs/appearance/google-images

## AI features and llms.txt

- To appear in AI Overviews or AI Mode a page must be indexed and eligible to show a snippet; there are no additional requirements, no special markup and no AI text files.
- Google states `llms.txt` is not needed for Google Search and does not change visibility or rankings (changelog entry of June 15, 2026).
- Controls: `nosnippet`, `max-snippet`, `data-nosnippet` and `noindex`. The `Google-Extended` token controls use for Gemini training and grounding and does not affect inclusion in Search.

Source: https://developers.google.com/search/docs/appearance/ai-features
Source: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
Source: https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
Source: https://developers.google.com/crawling/docs/crawlers-fetchers/google-special-case-crawlers

## Helpful content and spam

- Generative AI is allowed; generating many pages with no added value is scaled content abuse. Check the facts, titles, descriptions, structured data and alt text before publishing.
- E-E-A-T is not a ranking factor by itself and there is no word-count target; changing dates to look fresh does not help. Topics that affect financial stability get more weight and must be accurate and consistent with expert consensus.
- Spam policies cover cloaking, hidden text, keyword stuffing, scaled content abuse, site reputation abuse and, since April 13, 2026, back button hijacking.

Source: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
Source: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
Source: https://developers.google.com/search/docs/essentials/spam-policies
