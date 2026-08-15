# Staple IT SEO, AEO, ASEO and Structured Data Standard

This document defines the search, answer-engine/AI-discovery and structured-data baseline for the Staple IT website rebuild.

The original website content under `reference/` remains the source of truth. Search optimisation must improve clarity and discoverability without turning the site into keyword-stuffed marketing copy.

## 1. Principles

SEO, AEO/GEO/ASEO and user experience are treated as one system. ASEO is used here as shorthand for AI-search optimisation; it is not treated as a separate markup standard.

- Build useful pages for people first.
- Keep important information in visible HTML text.
- Use clear headings and concise sections that can be understood out of context.
- Do not create thin pages solely to target keyword variants.
- Do not create artificial FAQ blocks solely for schema or rich-result bait.
- Do not invent reviews, awards, accreditations, locations or service claims.
- Structured data must describe visible, truthful page content.
- Conventional technical SEO remains the foundation for Google AI features; there is no special AI-only markup requirement.
- Do not add `llms.txt` as a ranking tactic. It is not a Google Search requirement.

## 2. Page-level SEO baseline

Every completed indexable page should have:

- a unique, descriptive `<title>`;
- a useful meta description written for humans;
- one clear H1;
- logical H2/H3 hierarchy;
- an absolute HTTPS canonical URL on `stapleit.co.uk`;
- crawlable clean internal links to related pages;
- meaningful link text rather than repeated `click here` links;
- appropriate image alt text when images are introduced;
- Open Graph metadata where social sharing value exists;
- no accidental `noindex`, canonical conflict or duplicate route.

Titles and descriptions should reflect the real page intent. Do not force exact-match keywords into every heading.

Unfinished routes must remain `noindex,nofollow`, have a visible truthful placeholder, and stay out of the production sitemap until their source-backed content is rebuilt.

## 3. Local search

Staple IT is a Surrey-focused IT provider, so local signals should be explicit where they are genuinely relevant.

- Keep `Staple IT`, `Hart Corporate Ltd`, the Epsom address, phone number and published email consistent across the site and external profiles.
- Keep Google Business Profile and Bing Places information accurate when production details change.
- Mention real service areas naturally in relevant copy rather than producing doorway pages for every town.
- Service pages should state who the service is for, what is provided, and the geographic area served where applicable.
- Local landing pages should only be created where there is genuinely distinct local value/content.

## 4. AEO / GEO / ASEO / AI discovery

There is no separate magic format for AI search. Good retrieval and citation eligibility comes from crawlability, clarity, authority, useful visible text and strong normal SEO.

For pages likely to answer questions:

- answer the core question early;
- use descriptive headings;
- keep important definitions and service explanations in text, not only graphics;
- use concise lists or tables where comparison genuinely helps;
- support factual claims with first-party evidence or reputable sources where appropriate;
- keep dates, pricing statements, support hours and product claims current;
- use clear authorship/reviewer information on substantial technical articles where useful;
- link related concepts and services together internally;
- avoid rewriting the same answer into dozens of near-duplicate keyword pages;
- make important business/contact facts machine-readable through truthful structured data as well as visible copy.

## 5. Structured-data implementation

Use JSON-LD unless there is a strong reason not to. Schema should be deliberately small, accurate and reusable; more markup is not automatically better.

### Homepage / organisation

The homepage uses a stable `Organization` entity plus `WebSite`:

```text
https://stapleit.co.uk/#organization
https://stapleit.co.uk/#website
```

Applicable published properties include:

- `name`;
- `legalName`;
- `url`;
- `logo`;
- `description`;
- `address`;
- `areaServed`;
- published email and telephone;
- genuine `sameAs` profile URLs only when confirmed.

Do not invent founding dates, ratings, reviews, memberships or social profiles merely to make the graph larger.

Use `Organization` unless a more specific business type is clearly accurate and supported by the visible business model. Do not choose a type because it sounds better for SEO.

### Service pages

Use `Service` when a page is primarily about a real Staple IT service. Useful properties may include `name`, `serviceType`, `description`, `provider` referencing `#organization`, `areaServed`, `audience`, and a real visible `offers` proposition where appropriate.

Never add fake aggregate ratings or reviews.

### About / ordinary content pages

Use `WebPage` or `AboutPage` only where it adds clear semantic value. Do not add schema types simply because they exist.

### Blog articles

Use `Article` or `BlogPosting` for genuine articles with accurate headline, description, author, publication/modification dates, relevant image where available, and publisher referencing the Staple IT organisation.

Do not change `dateModified` unless the article was meaningfully updated.

### Breadcrumbs

Use visible breadcrumbs and `BreadcrumbList` on deeper routes where hierarchy benefits the user, for example:

`Home > IT Services > Cyber Security`

Do not add invisible breadcrumb schema that does not reflect the real route hierarchy.

### FAQ markup

FAQ content may be useful to people and AI retrieval, but `FAQPage` schema is not a priority. Write FAQs only where the questions genuinely help users; do not build them solely to chase a search feature.

## 6. Schema identity model

Use stable IDs so entities connect cleanly across pages:

```text
https://stapleit.co.uk/#organization
https://stapleit.co.uk/#website
https://stapleit.co.uk/it-services/it-support/#service
https://stapleit.co.uk/it-services/cybersecurity/#service
https://stapleit.co.uk/the-staple-blog/example-article/#article
```

Service and article schemas should reference the same organisation ID rather than embedding slightly different copies of the business identity everywhere.

## 7. Crawl and index controls

Before production launch:

- keep `robots.txt` intentional;
- keep `sitemap.xml` limited to canonical, indexable, production-ready URLs;
- keep sitemap `lastmod` values truthful;
- exclude placeholders, staging URLs and duplicates;
- verify the production domain in Google Search Console and Bing Webmaster Tools;
- submit the canonical sitemap;
- consider IndexNow for Bing once the production deployment/update workflow is known.

## 8. Performance and SEO

Search optimisation must not damage page performance.

- Keep metadata and JSON-LD static where possible.
- Do not load an SEO framework or tag manager solely to generate metadata.
- Avoid render-blocking third-party scripts and CSS `@import` chains.
- Keep Core Web Vitals in mind when adding video, imagery and glass effects.
- Prevent layout shift by declaring media dimensions.
- Lazy-load below-the-fold imagery/iframes.
- Keep the hero video as an exception rather than a site-wide pattern.

## 9. Per-page build checklist

Before calling a rebuilt page complete:

1. Inspect the relevant `reference/` source material.
2. Identify the page’s primary user/search intent.
3. Write a unique title and meta description.
4. Confirm one clear H1 and logical heading order.
5. Confirm useful clean internal links.
6. Confirm the absolute production canonical URL.
7. Add only schema that accurately matches visible content.
8. Test supported JSON-LD with Google’s Rich Results Test.
9. Validate general Schema.org syntax when appropriate.
10. Check mobile/tablet rendering and accessibility.
11. Run `tools/audit-site.py` and resolve blocking errors.
12. Add the route to the production sitemap only when genuinely launch-ready.

## 10. Schema plan for the current rebuild

| Route/content type | Structured data |
|---|---|
| Homepage | `Organization` + `WebSite` |
| About Staple IT | `AboutPage` optionally referencing `#organization` |
| IT Services overview | normal page metadata; `ItemList` only if it adds real value |
| IT Support | `Service` + optional `BreadcrumbList` |
| IT Solutions | `Service` + optional `BreadcrumbList` |
| IT Consultancy | `Service` + optional `BreadcrumbList` |
| Cyber Security | `Service` + optional `BreadcrumbList` |
| AI Integrations | `Service` + optional `BreadcrumbList` |
| Who We Support | normal page metadata |
| Partners | normal page metadata; no invented relationship schema |
| Contact | normal page metadata; organisation details only when visibly published |
| Blog index | normal page metadata |
| Blog article | `Article`/`BlogPosting` + optional `BreadcrumbList` |
| Privacy / Legal | normal page metadata; no unnecessary schema |

## 11. Things we deliberately avoid

- keyword stuffing;
- location doorway pages;
- mass AI-generated articles;
- fake reviews/ratings;
- hidden schema-only content;
- FAQ schema spam;
- schema types chosen only because they sound more impressive;
- changing dates to manufacture freshness;
- assuming schema itself improves rankings;
- assuming AEO/GEO/ASEO replaces SEO;
- adding AI-specific files or markup without a concrete platform requirement.

This document should be updated whenever search implementation decisions materially change.
