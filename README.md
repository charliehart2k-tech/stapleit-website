# Staple IT Website

Page-by-page rebuild of `stapleit.co.uk` from the clean approved baseline.

## Current working baseline

The active rebuild currently includes:

- Approved monochrome black liquid-glass navigation.
- Raleway typography standardised across the active site.
- Homepage hero restored from the approved historical build, including the liquid-wave background and functional support-status widget.
- Homepage two-card content row started with the About Staple IT card.
- Global four-column liquid-glass footer applied across the active route shells.
- Responsive navigation now switches to the menu layout for tablet widths rather than squeezing the desktop controls.

The approved navigation structure must not be redesigned unless explicitly requested.

## Source of truth

The original website scrapes, visible text, artwork and source references under `reference/` remain the source of truth for content and information architecture.

Before rebuilding any route, inspect its relevant original scrape/reference files first.

Do not replace original content with generic marketing copy simply because it is easier to write something new.

## Design reference

`DESIGN-SYSTEM.md` is the active visual and engineering reference for new work.

It documents:

- typography;
- black liquid-glass material rules;
- approved navigation/footer behaviour;
- responsive breakpoints and test viewports;
- accessibility expectations;
- performance budgets;
- security requirements; and
- the standard page-build workflow.

If the approved design direction changes, update `DESIGN-SYSTEM.md` in the same change.

## SEO, AEO/GEO and structured data

`SEO-AEO-SCHEMA.md` is the active search-discovery standard for the rebuild.

It defines:

- page titles, descriptions, canonicals and heading rules;
- local-search principles for a Surrey-focused IT provider;
- AEO/GEO/AI-discovery content principles;
- the JSON-LD and schema model for the organisation, services, breadcrumbs and blog articles;
- crawl/index controls, sitemap and robots rules;
- Google Search Console and Bing Webmaster launch checks; and
- the per-page search checklist.

Search optimisation must describe the real visible content. Do not add schema to blank route shells, invent reviews, create doorway location pages or write FAQ content purely for rich-result bait.

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

- self-host core assets;
- no credentials/secrets in the repository;
- no third-party runtime scripts by default;
- no inline JavaScript without a documented reason;
- keep `.well-known/security.txt` current;
- configure CSP and standard security headers at the production hosting/CDN layer;
- keep autoplay video exceptional rather than repeating it throughout the site;
- prefer CSS over JavaScript for visual effects; and
- respect `prefers-reduced-motion`.

See `DESIGN-SYSTEM.md` for the recommended production header policy and working asset budgets.

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
