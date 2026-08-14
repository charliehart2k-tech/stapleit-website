# Staple IT Website

Page-by-page rebuild of `stapleit.co.uk` from the clean approved baseline.

## Current working baseline

The active rebuild currently includes:

- Approved monochrome black liquid-glass navigation.
- Manrope typography standardised across the active site.
- Homepage hero restored from the approved historical build, including the liquid-wave background and functional support-status widget.
- Homepage statement and service carousel with brand-colour service states.
- Homepage "Who do we support?" editorial chapter using the original audience positioning without the old stock-photo card layout.
- Global Client Portal navigation entry; the interim internal route is intentionally `noindex` until the production portal destination is supplied.
- Global four-column liquid-glass footer applied across the active route shells.
- Responsive navigation switches to the menu layout at 1080px and below rather than squeezing the desktop controls.
- Shared focus, touch and motion behaviour is standardised in the active CSS.

The approved navigation structure must not be redesigned unless explicitly requested.

## Source of truth

The original website scrapes, visible text, artwork and source references under `reference/` remain the source of truth for content and information architecture.

Before rebuilding any route, inspect its relevant original scrape/reference files first.

Do not replace original content with generic marketing copy simply because it is easier to write something new.

## Governing documents

Use these together:

- `DESIGN-SYSTEM.md` — visual language, typography, glass material, responsive behaviour, accessibility, security and performance baseline.
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

## Typography

The active design uses **Manrope** throughout:

- 400 — body copy.
- 600 — UI, supporting text and controls.
- 700 — navigation, headings and hero typography.

The current staging implementation loads Manrope 400/600/700 from Google Fonts. If the production deployment requires fully self-hosted fonts, replace that delivery with a locally hosted Manrope webfont and restore `font-src 'self'` in the production CSP.

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
- configure CSP and standard security headers at the production hosting/CDN layer;
- keep autoplay video exceptional rather than repeating it throughout the site;
- prefer CSS over JavaScript for visual effects.

Manrope is currently the only intentional third-party asset delivery and is CSS/font-only, not a runtime script dependency.

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
