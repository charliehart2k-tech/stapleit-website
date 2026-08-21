# Staple IT Quality Gates and Release Checklist

No page is complete because it merely looks finished on a desktop browser.

Use these gates for every rebuilt route and at major homepage milestones.

## Gate 1 — Content accuracy and conformity

- Content has been checked against the relevant `reference/` scrape/source files.
- Claims, support hours, prices, service details and legal information are current and truthful.
- No generic filler copy has replaced source-of-truth content without an explicit decision.
- Links and calls to action point to the intended clean route.
- Placeholder routes are visibly identified, `noindex,nofollow`, and excluded from the sitemap.
- UK English is used consistently.
- Service naming is consistent: `IT Support`, `IT Solutions`, `IT Consultancy`, `Cyber Security`, `AI Integrations`.
- Product naming is consistent, including `Microsoft 365`, `Wi-Fi` and `OneDrive`.
- Sentence case is used for descriptive headings unless a proper service/product name requires capitals.
- Repeated prices/terms use one wording within a page.

## Gate 2 — Design and typography

- Complete the objective and human checks in `DESIGN-QUALITY-GATES.md`.
- Approved navigation and footer are preserved.
- Manrope follows the 400/600/700 system; no synthetic intermediate weights or stray font families.
- Manrope loads from the local audited font file and each route loads exactly one generated CSS bundle.
- Shared type and spacing tokens in `tokens.css` are used as the baseline.
- Type and spacing tokens are declared only in `tokens.css`; route-specific aliases do not duplicate the system.
- Body copy remains comfortably readable and important text is not shrunk to make a layout fit.
- Copy line length is controlled where practical.
- Glass remains monochrome unless colour communicates state or is an explicitly approved brand treatment.
- No internal glass shelf, unapproved coloured glow, spotlight effect or decorative clutter has crept back in.
- Approved palette-glow exceptions follow `DESIGN-SYSTEM.md`.
- Spacing, radius and card hierarchy match the current design system.
- No source file exceeds the specificity ceiling in `DESIGN-BASELINES.json`.

## Gate 3 — Responsive and accessibility

Check at minimum:

- 360 x 800
- 430 x 932
- 768 x 1024
- 1024 x 1366
- 1366 x 768
- 1920 x 1080

Confirm:

- no horizontal page scrolling;
- no squeezed desktop navigation;
- readable text without artificial downsizing;
- logical document/heading structure;
- keyboard navigation and visible focus states;
- sensible 44px touch targets;
- useful alt text and accessible labels;
- interaction remains understandable without relying on colour alone;
- touch carousels follow the user’s finger rather than requiring tiny indicators.

## Gate 4 — Security

- No secrets, tokens, credentials or connection strings are present.
- No unexpected executable inline/event-handler JavaScript has been introduced.
- JSON-LD is truthful inert structured data only.
- No unexpected third-party runtime script has been introduced.
- Forms/future integrations validate untrusted input at the server boundary.
- `.well-known/security.txt` is current.
- Production headers match `DESIGN-SYSTEM.md`, including the approved Google Maps `frame-src` when the map is present.
- Production is HTTPS-only.
- Staging remains intentionally excluded from indexing.

## Gate 5 — Performance

- No unnecessary framework or external runtime dependency has been introduced.
- No CSS `@import` request chains are introduced for fonts/assets.
- New images are compressed and appropriately sized.
- Below-the-fold imagery/iframes are lazy-loaded where appropriate.
- Media dimensions are declared where relevant to reduce layout shift.
- Repeated glass surfaces use restrained blur, especially on phones/tablets.
- Autoplay video remains exceptional.
- New JS/CSS is scoped and small.
- Generated CSS bundles match their source modules and remain inside the gzip budgets in `tools/build-css.py`.
- `tools/audit-site.py` has no blocking errors.
- Core Web Vitals are checked before production launch.

Production targets:

- LCP <= 2.5s
- INP <= 200ms
- CLS <= 0.1

## Gate 6 — SEO, AEO, ASEO and schema

Complete `SEO-AEO-SCHEMA.md`.

At minimum every indexable page has:

- unique title and meta description;
- one clear H1;
- logical headings;
- absolute HTTPS canonical URL;
- useful crawlable internal links;
- truthful JSON-LD only where appropriate;
- visible text containing the important service/business information;
- no schema on unfinished placeholder content;
- inclusion in the production sitemap only when launch-ready.

Homepage additionally requires stable `Organization` and `WebSite` JSON-LD identities.

Do not add fake review/rating markup, keyword doorway pages, `llms.txt`, or AI-only markup as a substitute for normal SEO.

## Gate 7 — Conversion and usability

- The page answers what the visitor is trying to understand.
- The primary next action is obvious without being aggressive.
- Contact/support paths are easy to find.
- Buttons use clear labels rather than vague `click here` text.
- No animation/effect gets in the way of reading, navigation or conversion.
- Empty space is deliberate rather than caused by missing hierarchy/content.

## Gate 8 — Browser and device QA

At minimum test current versions of:

- Chromium desktop;
- Safari/iOS where available;
- Firefox desktop;
- Android/Chromium where available.

Progressive enhancements must fail cleanly when unsupported. Viewport-triggered reveals must not leave content permanently hidden if the observer/API is unavailable. Check font loading, wrapping and glyph clipping at every reference viewport.

## Gate 9 — Release and deployment

Before production:

- run `python3 tools/audit-site.py --root site` (or Windows equivalent) and resolve blocking errors;
- run `python3 tools/build-css.py --check` and refuse stale generated CSS;
- staging deployment also runs the static audit automatically and refuses to deploy on blocking failures;
- canonical domain is correct;
- redirects are intentional and tested;
- custom 404 works;
- sitemap contains only canonical production-ready URLs;
- robots policy is intentional;
- security headers are enabled at the hosting/CDN layer;
- caching policy is appropriate for HTML, CSS, JS, fonts and media;
- Search Console and Bing Webmaster Tools are verified;
- no staging/test URL is indexed or linked publicly;
- final production smoke test passes on desktop and mobile.

## Motion and polish acceptance rule

Motion is allowed only when it adds depth, hierarchy, interaction feedback or continuity. Prefer the simplest reliable mechanism. If an animation exists merely because it looks clever, remove it.
