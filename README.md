# Staple IT Website

Static rebuild of `stapleit.co.uk`, using the approved source material under `reference/` as the content and information-architecture source of truth.

## Homepage v1 baseline — 14 August 2026

The homepage is now the approved visual and engineering reference for the rest of the site.

Current approved homepage includes:

- monochrome black liquid-glass navigation;
- Manrope typography throughout;
- restored liquid-wave hero and live London support-availability widget;
- `Small enough to care. Experienced enough to deliver.` statement card;
- four-state Support / Solutions / Consultancy / Cyber Security service carousel;
- `Who do we support?` chapter with three responsive glass audience cards and restrained palette glows;
- `Why trust Staple IT?` editorial trust chapter with scroll-driven liquid-gradient typography and contained moving proof-row auras;
- final Free IT Audit conversion chapter with responsive contact form and direct phone/email panel;
- Client Portal navigation entry with an intentionally `noindex` placeholder route until the real portal destination is supplied;
- global liquid-glass footer across active route shells;
- responsive navigation switching to the mobile menu at 1260px and below.

Treat these homepage patterns as approved. Reuse the design language; do not copy every layout verbatim onto later pages.

## Branch model

The repository is being consolidated to two long-lived branches only:

- `main` — current approved working build;
- `legacy/pre-homepage-v1-2026-08-14` — snapshot of the previous clean `main` baseline before the homepage rebuild was promoted.

Git history remains the source for older intermediate states. Temporary design, agent and safety branches are no longer required once consolidation is complete.

## Source of truth

The original website scrapes, visible text, artwork and source references under `reference/` remain the source of truth for page content and information architecture.

Before rebuilding any route:

1. inspect its relevant original scrape/visible text;
2. identify what original content is still required;
3. rebuild it using the current design system;
4. do not replace source content with generic marketing copy simply because it is easier.

Do not delete `reference/` as part of cleanup.

## Governing documents

Use these together:

- `BRAND-PALETTE.md` — canonical Staple IT and service colours;
- `DESIGN-SYSTEM.md` — visual language, typography, glass, responsive behaviour, motion, security and performance baseline;
- `SEO-AEO-SCHEMA.md` — SEO, AEO/GEO, local search and structured-data rules;
- `RELEASE-CHECKLIST.md` — quality gates every completed route must pass.

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

## Build rules

- Rebuild one page or deliberate section at a time.
- Keep diffs scoped and understandable.
- Prefer plain HTML, CSS and small dependency-free JavaScript.
- Do not introduce a framework for static content.
- CSS liquid glass is the default material; WebGL is opt-in only.
- Navigation and footer remain monochrome.
- Brand/service colour needs a deliberate purpose.
- Avoid repetitive card grids: each major chapter should earn its layout.
- Motion must add depth, hierarchy, feedback or continuity.
- Keep animated effects spatially contained; they must not create page-edge spill or horizontal overflow.
- Remove obsolete assets, selectors and interactions when practical.
- Complete SEO/AEO/schema checks as each route becomes launch-ready.

## Typography

The active design uses **Manrope** throughout:

- 400 — body copy;
- 600 — UI, supporting text and controls;
- 700 — navigation, headings and hero typography.

Current staging loads Manrope from Google Fonts. Production can self-host Manrope later if zero third-party asset delivery is preferred.

## Responsive baseline

Every completed route must be checked at phone, tablet, laptop and desktop widths.

Minimum reference sizes:

- 360 × 800
- 430 × 932
- 768 × 1024
- 1024 × 1366
- 1366 × 768
- 1920 × 1080

Current homepage responsive behaviour:

- desktop navigation switches to the mobile menu at `1080px`;
- hero becomes single-column below `980px`;
- statement/service cards stack below `980px` or their container threshold;
- audience cards become one column below `980px`;
- trust sticky/two-column layout collapses below `980px`;
- Free IT Audit hero/contact layout becomes single-column below `980px`;
- tighter phone typography, padding, blur and form layout apply below `640px`;
- global page gutters reduce below `700px`;
- footer moves from four columns to three/two/one across `1040px`, `800px` and `560px`.

There should be no horizontal page scrolling, squeezed desktop navigation or unreadably small text used to make a layout fit.

## Security baseline

The active site is intentionally static and dependency-light.

Current controls/rules:

- no credentials or secrets in the repository;
- no third-party runtime scripts by default;
- executable inline scripts/styles are rejected by the local audit;
- local staging binds to `127.0.0.1` only;
- staging emits CSP, `X-Content-Type-Options`, frame denial, referrer policy and permissions policy;
- `.well-known/security.txt` is present;
- form submission must not be connected to an unreviewed third-party endpoint;
- production TLS/HSTS and server/CDN headers remain deployment responsibilities.

Current CSP exception: Google Fonts requires `fonts.googleapis.com` and `fonts.gstatic.com` while Manrope is externally delivered.

## Performance baseline

- Prefer CSS over JavaScript for visual effects.
- Keep JavaScript dependency-free and event-driven.
- Use responsive layout rather than rendering separate mobile pages.
- Keep autoplay video exceptional.
- Avoid unconstrained blur/filter layers that paint outside their intended section.
- Run the static-site audit before calling a milestone clean.

Known intentional cost: `assets/media/liquid-wave.mp4` is approximately 1.81 MiB and is expected to trigger the audit's large-asset warning. It remains the main homepage performance item to optimise before production if visual quality can be preserved.

## Free IT Audit form

The homepage form is currently **staging-safe only**. It validates the fields but does not pretend to deliver an enquiry. Before launch, connect it to an approved production handler, add abuse protection/rate limiting appropriate to that handler, and test successful/failed submissions end-to-end.

## Local staging

From the repository root:

```powershell
.\Start-Staging.ps1
```

The staging server injects live reload, disables browser caching and emits the baseline development security headers.

Useful commands:

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

Run the audit directly with:

```powershell
py -3 .\tools\audit-site.py --root .\site
```

The audit checks local references, duplicate IDs, unexpected inline/event-handler code, external runtime scripts and oversized assets without external packages or network access.

## Pre-release manual QA

The static audit does not replace real browser/device testing. Before deployment, manually test at the reference widths above in current Chromium, Safari/WebKit and Firefox where practical, including:

- nav/mobile-menu operation;
- service carousel controls and automatic rotation;
- scroll/reveal effects and graceful CSS fallbacks;
- trust glow containment at page/column edges;
- form keyboard/focus/validation behaviour;
- no horizontal overflow;
- footer stacking and tap targets.
