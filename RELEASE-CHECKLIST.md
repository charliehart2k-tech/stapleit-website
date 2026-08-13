# Staple IT Quality Gates and Release Checklist

No page is considered complete because it merely looks finished on a desktop browser.

Use these gates for every rebuilt route.

## Gate 1 — Content accuracy

- Content has been checked against the relevant `reference/` scrape/source files.
- Claims, support hours, prices, service details and legal information are current and truthful.
- No generic filler copy has replaced source-of-truth content without an explicit decision.
- Links and calls to action point to the intended route.

## Gate 2 — Design

- Approved navigation and footer are preserved.
- Raleway typography follows the 400/600/700 system.
- Glass remains monochrome unless colour communicates a real state or approved brand accent.
- No internal glass shelf, coloured glow, spotlight effect or decorative clutter has crept back in.
- Spacing, radius and card hierarchy match `DESIGN-SYSTEM.md`.

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
- reduced-motion behaviour;
- useful alt text and accessible labels.

## Gate 4 — Security

- No secrets, tokens, credentials or connection strings are present.
- No unexpected inline or third-party JavaScript has been introduced.
- Forms or future integrations validate untrusted input at the server boundary.
- `.well-known/security.txt` is current.
- Production headers match the security policy in `DESIGN-SYSTEM.md`.
- Production is HTTPS-only.

## Gate 5 — Performance

- No unnecessary framework or external runtime dependency has been introduced.
- New images are compressed and appropriately sized.
- Below-the-fold imagery is lazy-loaded.
- Media dimensions are declared to reduce layout shift.
- Repeated glass surfaces use restrained blur, especially on phones/tablets.
- Autoplay video remains exceptional.
- New JS/CSS is scoped and small.
- Core Web Vitals are checked before production launch.

Production targets:

- LCP <= 2.5s
- INP <= 200ms
- CLS <= 0.1

## Gate 6 — SEO, AEO and schema

Complete the checklist in `SEO-AEO-SCHEMA.md`.

At minimum:

- unique title and meta description;
- one clear H1;
- logical headings;
- absolute canonical URL;
- useful internal links;
- truthful JSON-LD only where appropriate;
- no schema on unfinished placeholder content;
- route only enters the production sitemap once genuinely launch-ready.

## Gate 7 — Conversion and usability

- The page answers what the visitor is trying to understand.
- The primary next action is obvious without being aggressive.
- Contact/support paths are easy to find.
- Buttons use clear labels rather than vague `click here` text.
- No animation or visual effect gets in the way of reading, navigation or conversion.

## Gate 8 — Browser and device QA

At minimum test current versions of:

- Chromium desktop;
- Safari/iOS where available;
- Firefox desktop;
- Android/Chromium where available.

Progressive enhancements such as view transitions or scroll-driven animations must fail cleanly when unsupported.

## Gate 9 — Release and deployment

Before production:

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

Motion is allowed only when it adds one of these:

- depth;
- hierarchy;
- interaction feedback;
- continuity between pages/components.

If an animation exists merely because it looks clever, remove it.
