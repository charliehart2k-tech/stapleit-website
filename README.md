# Staple IT Website

Page-by-page rebuild of `stapleit.co.uk` from the approved source material under `reference/`.

## Midpoint baseline — 14 August 2026

The homepage foundation is now established and should be treated as the visual/engineering reference for the second half of the rebuild.

Current approved work includes:

- monochrome black liquid-glass navigation;
- Manrope typography throughout;
- restored homepage hero with the approved liquid-wave video and live support-availability widget;
- `Small enough to care. Experienced enough to deliver.` statement card;
- four-state service carousel for Support, Solutions, Consultancy and Cyber Security using the canonical service colours;
- `Who do we support?` chapter with three neutral glass audience cards, restrained palette glows and a viewport-triggered entrance reveal;
- Client Portal navigation entry with an intentionally `noindex` placeholder route until the real portal destination is supplied;
- global liquid-glass footer across the route shells;
- tablet/mobile navigation from 1080px and below;
- shared focus, touch, view-transition and interaction behaviour.

The approved navigation, homepage hero, statement/service row and current audience chapter should not be casually redesigned while building later pages.

## Recovery point

`agent/midpoint-baseline-2026-08-14` is a snapshot of the exact pre-cleanup midpoint state.

Earlier recovery points remain available as well. Do not delete recovery/reference branches as routine housekeeping while the rebuild is still in progress.

## Source of truth

The original website scrapes, visible text, artwork and source references under `reference/` remain the source of truth for page content and information architecture.

Before rebuilding any route:

1. inspect its relevant original scrape/visible text;
2. identify what original content is still required;
3. rebuild it using the current design system;
4. do not replace source content with generic marketing copy simply because it is easier.

## Governing documents

Use these together:

- `BRAND-PALETTE.md` — canonical Staple IT colours and service sub-brand colours.
- `DESIGN-SYSTEM.md` — visual language, typography, glass material, responsive behaviour, motion, security and performance baseline.
- `SEO-AEO-SCHEMA.md` — SEO, AEO/GEO, local search, crawl/indexing and structured-data rules.
- `RELEASE-CHECKLIST.md` — the nine quality gates every completed route must pass.

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

- Rebuild one page or deliberate section at a time.
- Keep diffs scoped and understandable.
- Prefer plain HTML, CSS and small dependency-free JavaScript.
- Do not introduce a framework for static content.
- CSS liquid glass is the default material.
- LiquidGL/WebGL is opt-in only when explicitly requested.
- Navigation and footer remain monochrome.
- Brand/service colour may be used where it has an explicit design purpose; do not spray colour across generic UI.
- No internal glass shelf/highlight effects on cards or navigation controls.
- Reuse shared code only when it is genuinely shared.
- Remove obsolete assets, selectors and interactions once the active build no longer uses them.
- Motion must add depth, hierarchy, feedback or continuity.
- Complete the SEO/AEO/schema checklist as each route becomes launch-ready.

## Typography

The active design uses **Manrope** throughout:

- 400 — body copy;
- 600 — UI, supporting text and controls;
- 700 — navigation, headings and hero typography.

Current staging loads Manrope from Google Fonts. If production requires zero third-party asset delivery, self-host the Manrope webfont and return production CSP `font-src`/`style-src` to self-only.

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

- no credentials/secrets in the repository;
- no third-party runtime scripts by default;
- no inline JavaScript without a documented reason;
- keep `.well-known/security.txt` current;
- configure the production security headers documented in `DESIGN-SYSTEM.md`;
- keep autoplay video exceptional rather than repeating it throughout the site;
- prefer CSS over JavaScript for visual effects;
- run the static-site audit before calling a route or milestone clean.

Current intentional exceptions:

- Manrope is delivered by Google Fonts during staging;
- `assets/media/liquid-wave.mp4` is the approved homepage hero video and is expected to trigger the large-asset warning in the audit;
- `/client-portal/` is an unfinished `noindex` placeholder until the production portal URL is supplied.

## Local staging

From the repository root:

```powershell
.\Start-Staging.ps1
```

The staging server:

- binds only to `127.0.0.1`;
- injects live reload;
- disables browser caching;
- emits the baseline CSP/security headers during development (HSTS is intentionally omitted on local HTTP).

Useful staging commands:

```text
home             Open homepage
who              Jump to Who do we support?
support          Open IT Support route
solutions        Open IT Solutions route
consultancy      Open IT Consultancy route
security         Open Cyber Security route
ai               Open AI Integrations route
portal           Open Client Portal placeholder
audit            Run static-site integrity/security checks
aliases          Show valid edit aliases
status           Show server/build status
help             Show all commands
quit             Stop staging
```

You can also run the audit directly:

```powershell
py -3 .\tools\audit-site.py --root .\site
```

The audit checks local references, duplicate IDs, unexpected inline/event-handler JavaScript, external runtime scripts and oversized assets without using external packages or network access.

## Branch safety

Normal rebuild work remains away from `main` so the approved master baseline stays recoverable.

Useful recovery points:

- `main` — approved clean navigation master baseline;
- `legacy-nav-approved-2026-08-13` — historical approved navigation reference;
- `agent/repo-cleanup-safety` — snapshot from before the first active-rebuild cleanup pass;
- `agent/midpoint-baseline-2026-08-14` — exact midpoint snapshot before this cleanup pass.

Do not delete `reference/` or recovery branches as part of routine cleanup.
