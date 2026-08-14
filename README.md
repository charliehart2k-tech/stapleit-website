# Staple IT Website

Page-by-page rebuild of `stapleit.co.uk` from the clean approved baseline.

## Current working baseline

The active rebuild currently includes:

- Approved monochrome black liquid-glass navigation.
- Manrope typography standardised across the active site using 400/600/700 weights.
- Homepage hero restored from the approved historical build, including the liquid-wave background and functional support-status widget.
- Homepage statement card: `Small enough to care. Experienced enough to deliver.` with approved Staple red accents.
- Homepage rotating service card for IT Support, IT Solutions, IT Consultancy and Cyber Security using the canonical service colours.
- Global four-column liquid-glass footer applied across the active route shells.
- Responsive navigation switches to the menu layout for tablet widths rather than squeezing the desktop controls.
- Shared focus, touch and motion behaviour is standardised in the active CSS.
- Progressive cross-page view transitions are enabled where supported.
- Homepage content cards use restrained interaction feedback and container-aware responsive behaviour.

The approved navigation structure must not be redesigned unless explicitly requested.

## Source of truth

The original website scrapes, visible text, artwork and source references under `reference/` remain the source of truth for content and information architecture.

Before rebuilding any route, inspect its relevant original scrape/reference files first.

Do not replace original content with generic marketing copy simply because it is easier to write something new.

## Governing documents

Use these together:

- `DESIGN-SYSTEM.md` — visual language, typography, glass material, responsive behaviour, accessibility, security and performance baseline.
- `BRAND-PALETTE.md` — canonical Staple IT brand and service colours.
- `SEO-AEO-SCHEMA.md` — SEO, AEO/GEO, local search, crawl/indexing and structured-data rules.
- `RELEASE-CHECKLIST.md` — the nine quality gates that every completed page must pass before release.

If an approved design, engineering or search decision changes, update the relevant governing document in the same change.

## Nine quality gates

A route is not complete until it has passed:

1. Content accuracy.
2. Design.
3. Responsive and accessibility.
4. Security.
5. Performance.
6. SEO, AEO and schema.
7. Conversion and usability.
8. Browser and device QA.
9. Release and deployment.

The detailed checklist lives in `RELEASE-CHECKLIST.md`.

## Build rules

- Rebuild one page/section at a time.
- Keep diffs scoped and understandable.
- Prefer plain HTML, CSS and small dependency-free JavaScript.
- No framework unless the site genuinely needs one.
- CSS liquid glass is the default material.
- LiquidGL/WebGL is opt-in only when explicitly requested.
- Do not add coloured glows or coloured navigation controls by default.
- Do not add internal glass shelf/highlight effects to cards or nav buttons.
- Reuse shared code only when it is genuinely shared; do not dump page-specific CSS into global files.
- Remove obsolete assets and code once they are no longer referenced by the active build.
- Complete the SEO/AEO/schema checklist as each route becomes launch-ready.
- Motion must add depth, hierarchy, feedback or continuity; decorative motion without a purpose should be removed.

## Motion and CSS polish baseline

Approved progressive enhancements include:

- `clamp()`-based responsive typography/spacing;
- balanced heading wrapping;
- visible `:focus-visible` states;
- 44px-or-larger practical touch targets;
- subtle button compression/hover feedback;
- container queries where component width matters more than viewport width;
- `content-visibility` for suitable long below-the-fold sections;
- progressive same-origin page view transitions; and
- reduced blur/filter cost on small screens.

Avoid scroll-jacking, custom cursors, excessive parallax, floating decorative blobs, 3D tilt cards, repeated autoplay video and animation that delays navigation or reading.

## Responsive requirement

Every completed page must be checked at phone, tablet, laptop and desktop widths.

Minimum reference checks:

- 360 x 800
- 430 x 932
- 768 x 1024
- 1024 x 1366
- 1366 x 768
- 1920 x 1080

There should be no horizontal page scrolling, squeezed desktop navigation or unreadably small text used to make a layout fit.

## Security and performance

The active site is intentionally static and dependency-light.

Key rules:

- self-host core media and site assets;
- Manrope via Google Fonts is currently the single approved external font dependency while the rebuild is in progress;
- no credentials/secrets in the repository;
- no third-party runtime scripts by default;
- no inline JavaScript without a documented reason;
- keep `.well-known/security.txt` current;
- configure CSP and standard security headers at the production hosting/CDN layer;
- keep autoplay video exceptional rather than repeating it throughout the site; and
- prefer CSS over JavaScript for visual effects.

When the Manrope binary is vendored locally, remove the Google Fonts dependency and return the font/style CSP directives to `'self'` only.

See `DESIGN-SYSTEM.md` for the recommended production header policy and working asset budgets.

## SEO, AEO/GEO and structured data

`SEO-AEO-SCHEMA.md` defines:

- page titles, descriptions, canonicals and heading rules;
- local-search principles for a Surrey-focused IT provider;
- AEO/GEO/AI-discovery content principles;
- the JSON-LD and schema model for the organisation, services, breadcrumbs and blog articles;
- crawl/index controls, sitemap and robots rules;
- Google Search Console and Bing Webmaster launch checks; and
- the per-page search checklist.

Search optimisation must describe the real visible content. Do not add schema to blank route shells, invent reviews, create doorway location pages or write FAQ content purely for rich-result bait.

## Local staging

From the repository root:

```powershell
.\Start-Staging.ps1
```

The staging server binds to `127.0.0.1` and serves the `site/` directory.

## Branch safety

Current rebuild work is being developed away from `main` so the approved master baseline remains recoverable.

Useful recovery points currently include:

- `main` — approved clean navigation master baseline.
- `legacy-nav-approved-2026-08-13` — historical approved navigation reference.
- `agent/repo-cleanup-safety` — snapshot from before the first active-rebuild cleanup pass.

Do not delete recovery/reference branches as routine housekeeping while the rebuild is still in progress.
