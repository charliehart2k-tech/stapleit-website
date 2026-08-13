# Staple IT SEO, AEO and Structured Data Standard

This document defines the search, AI-discovery and structured-data baseline for the Staple IT website rebuild.

The original website content under `reference/` remains the source of truth. Search optimisation must improve clarity and discoverability without turning the site into keyword-stuffed marketing copy.

## 1. Principles

SEO, AEO/GEO and user experience are treated as one system.

- Build useful pages for people first.
- Keep important information in visible HTML text.
- Use clear headings and concise sections that can be understood out of context.
- Do not create thin pages solely to target keyword variants.
- Do not create artificial FAQ blocks solely for schema or rich-result bait.
- Do not invent reviews, awards, accreditations, locations or service claims.
- Structured data must describe visible, truthful page content.
- No special AI-only markup is required for Google AI features; conventional technical SEO remains the foundation.

## 2. Page-level SEO baseline

Every completed indexable page should have:

- a unique, descriptive `<title>`;
- a useful meta description written for humans;
- one clear H1;
- logical H2/H3 hierarchy;
- an absolute canonical URL;
- crawlable internal links to related pages;
- meaningful link text rather than repeated `click here` links;
- appropriate image alt text when images are introduced;
- Open Graph metadata where social sharing value exists;
- no accidental `noindex`, canonical conflict or duplicate route.

Titles and descriptions should reflect the real page intent. Do not force exact-match keywords into every heading.

## 3. Local search

Staple IT is a Surrey-focused IT provider, so local signals should be explicit where they are genuinely relevant.

- Keep business name, legal identity and address consistent across the site and external profiles.
- Keep Google Business Profile and Bing Places information accurate when production details change.
- Mention real service areas naturally in relevant copy rather than producing doorway pages for every town.
- Service pages should state who the service is for, what is provided, and the geographic area served when applicable.
- Local landing pages should only be created where there is genuinely distinct local value/content.

## 4. AEO / GEO / AI discovery

There is no separate magic format for AI search. Good retrieval and citation eligibility comes from crawlability, clarity, authority and useful content.

For pages likely to answer questions:

- answer the core question early;
- use descriptive headings;
- keep important definitions and service explanations in text, not only graphics;
- use concise lists or tables where comparison genuinely helps;
- support factual claims with first-party evidence or reputable sources where appropriate;
- keep dates, pricing statements, support hours and product claims current;
- use clear authorship/reviewer information on substantial technical articles where useful;
- link related concepts and services together internally;
- avoid rewriting the same answer into dozens of near-duplicate keyword pages.

An `llms.txt` file is not part of the Google Search requirement and should not be treated as a ranking tactic. It may be considered later only if there is a concrete platform/use case for it.

## 5. Structured-data implementation

Use JSON-LD for structured data unless there is a strong reason not to.

Schema should be deliberately small, accurate and reusable. More markup is not automatically better.

### Homepage / organisation

Use `Organization` on the homepage or About page for Staple IT's real-world identity.

Recommended applicable fields include:

- `@id`;
- `name`;
- `legalName`;
- `url`;
- `logo`;
- `description`;
- `foundingDate`;
- `address`;
- `areaServed`;
- genuine `sameAs` profile URLs when confirmed;
- genuine contact details when confirmed and published.

Do not use the deprecated generic `ProfessionalService` type.

Only use `LocalBusiness` if the site is representing a genuine physical/customer-facing business location for which that type is accurate. For a service-area MSP, `Organization` plus page-level `Service` markup is the safer default.

### Service pages

Use `Service` when a page is primarily about a real Staple IT service.

Useful properties may include:

- `name`;
- `serviceType`;
- `description`;
- `provider` referencing the Staple IT Organization `@id`;
- `areaServed`;
- `audience` where meaningful;
- `offers` only when the visible page contains a real offer/pricing proposition.

Never add fake aggregate ratings or reviews.

### About / ordinary content pages

Use `WebPage` or `AboutPage` only where it adds clear semantic value. Do not add schema types simply because they exist.

### Blog articles

Use `Article` or `BlogPosting` for genuine articles.

Include accurate:

- headline;
- description;
- author;
- datePublished;
- dateModified;
- image when available;
- publisher referencing the Staple IT Organization.

Do not change `dateModified` unless the article was meaningfully updated.

### Breadcrumbs

Use visible breadcrumbs and `BreadcrumbList` on deeper routes where hierarchy benefits the user, for example:

`Home > IT Services > Cybersecurity`

Do not add invisible breadcrumb schema that does not reflect the real route hierarchy.

### FAQ markup

FAQ content may be useful for users and AI retrieval, but `FAQPage` schema is not a priority for Staple IT. Google generally limits FAQ rich results to authoritative government and health sites.

If FAQ content is added, write it because the questions genuinely help users. Do not build FAQ sections purely to chase a search feature.

## 6. Schema identity model

Use stable IDs so entities connect cleanly across pages.

Suggested pattern:

```text
https://stapleit.co.uk/#organization
https://stapleit.co.uk/it-services/it-support/#service
https://stapleit.co.uk/it-services/cybersecurity/#service
https://stapleit.co.uk/the-staple-blog/example-article/#article
```

Service and article schemas should reference the same organisation ID rather than embedding slightly different copies of the business identity everywhere.

## 7. Crawl and index controls

Before production launch:

- create `robots.txt` intentionally;
- generate `sitemap.xml` containing only canonical, indexable, production-ready URLs;
- keep sitemap `lastmod` values truthful;
- exclude blank placeholders, staging URLs and duplicate pages;
- verify the production domain in Google Search Console;
- verify it in Bing Webmaster Tools;
- submit the canonical sitemap;
- consider IndexNow for Bing once the production deployment/update workflow is known.

Do not publish a production sitemap full of unfinished route shells.

## 8. Performance and SEO

Search optimisation must not damage page performance.

- Keep metadata and JSON-LD static where possible.
- Do not load an SEO framework or tag manager solely to generate metadata on a static site.
- Avoid render-blocking third-party scripts.
- Keep Core Web Vitals in mind when adding video, imagery and glass effects.
- Prevent layout shift by declaring media dimensions.
- Lazy-load below-the-fold imagery.
- Keep the hero video as an exception rather than a site-wide pattern.

## 9. Per-page build checklist

Before calling a rebuilt page complete:

1. Inspect the relevant `reference/` source material.
2. Identify the page's primary user/search intent.
3. Write a unique title and meta description.
4. Confirm one clear H1 and logical heading order.
5. Confirm useful internal links.
6. Confirm the absolute canonical URL.
7. Add only schema that accurately matches visible content.
8. Test the JSON-LD with Google's Rich Results Test where the type is supported.
9. Validate general Schema.org syntax with the Schema Markup Validator when appropriate.
10. Check mobile/tablet rendering and accessibility.
11. Check there are no accidental external dependencies, duplicate assets or oversized new media.
12. Add the route to the production sitemap only when it is genuinely launch-ready.

## 10. Schema plan for the current rebuild

| Route/content type | Structured data |
|---|---|
| Homepage | `Organization`; normal Web page metadata |
| About Staple IT | `AboutPage` optionally referencing `#organization` |
| IT Services overview | normal page metadata; `ItemList` only if it accurately represents visible service navigation and adds value |
| IT Support | `Service` + optional `BreadcrumbList` |
| IT Solutions | `Service` + optional `BreadcrumbList` |
| IT Consultancy | `Service` + optional `BreadcrumbList` |
| Cybersecurity | `Service` + optional `BreadcrumbList` |
| AI Integrations | `Service` + optional `BreadcrumbList` |
| Who We Support | normal page metadata; audience semantics may be used only where useful |
| Partners | normal page metadata; no invented relationship schema |
| Contact | normal page metadata; organisation contact details only when visibly published |
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
- blindly adding `LocalBusiness` when the physical-location model is not accurate;
- changing dates to manufacture freshness;
- assuming schema itself improves rankings;
- assuming AEO/GEO replaces SEO.

This document should be updated whenever search implementation decisions materially change.