# Staple IT Website

Static-first rebuild of `stapleit.co.uk` with WordPress used as the deployment/runtime shell for forms, Cora and operational administration.

The committed `site/` tree is the front-end source of truth. Original website scrapes, visible text, artwork and other source references under `reference/` remain the content and information-architecture reference and must not be deleted during cleanup.

## Homepage v1 baseline — 14 August 2026

The homepage is the approved visual and engineering reference for the rest of the site.

Current approved homepage includes:

- monochrome black liquid-glass navigation;
- self-hosted Manrope typography throughout;
- restrained liquid-wave hero and live London support-availability widget;
- `Small enough to care. Experienced enough to deliver.` statement card;
- four-state Support / Solutions / Consultancy / Cyber Security service carousel;
- `Who do we support?` chapter with three responsive glass audience cards and restrained palette glows;
- `Why trust Staple IT?` editorial trust chapter with scroll-driven liquid-gradient typography and contained proof-row motion;
- final Free IT Audit conversion chapter with WordPress-backed enquiry form and direct phone/email panel;
- Client Portal navigation entry with an intentionally `noindex` placeholder route until the real portal destination is supplied;
- global liquid-glass footer across active route shells;
- responsive navigation switching to the mobile menu at `1260px` and below.

Treat these homepage patterns as approved. Reuse the design language; do not copy every layout verbatim onto later pages.

## Branch model

The intended long-lived branch model is:

- `main` — current approved working build;
- `legacy/pre-homepage-v1-2026-08-14` — snapshot of the previous clean `main` baseline before the homepage rebuild was promoted.

Git history is the source for older intermediate states. Temporary implementation branches should be removed once they no longer serve an active review purpose.

## Source of truth

Before rebuilding any route:

1. inspect its relevant original scrape/visible text under `reference/`;
2. identify what original content is still required;
3. rebuild it under `site/` using the current governing standards;
4. do not replace source content with generic marketing copy simply because it is easier.

Do not delete `reference/` as part of cleanup.

## Governing documents

Start with `STANDARDS-INDEX.md`, then use the specialist documents it points to:

- `BRAND-PALETTE.md` — canonical Staple IT and service colours;
- `DESIGN-SYSTEM.md` — visual language and component behaviour;
- `DESIGN-QUALITY-GATES.md` / `DESIGN-BASELINES.json` — measurable design and regression contracts;
- `CODE-STANDARDS.md` — implementation, security and performance rules;
- `ASSET-STANDARDS.md` — image/video handling and integrity rules;
- `SEO-AEO-SCHEMA.md` — SEO, AEO/GEO, local search and structured-data rules;
- `RELEASE-CHECKLIST.md` — route/release quality gates;
- `PRODUCTION-GATES.md` — intentionally open production-readiness work;
- `DEPLOYMENT-NOTES.md` — staging/VPS deployment and Cora activation.

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
- Prefer opacity and small transforms over blur/filter-heavy entrance motion.
- Remove obsolete assets, selectors and interactions rather than preserving them for old tests.
- Complete SEO/AEO/schema checks as each route becomes launch-ready.

## Typography

The active design uses self-hosted **Manrope** from `site/assets/fonts/manrope-latin.woff2`:

- 400 — body copy;
- 600 — UI, supporting text and controls;
- 700 — navigation, headings and hero typography.

There is no Google Fonts runtime dependency. CI rejects `fonts.googleapis.com` and `fonts.gstatic.com` references in compiled templates and Nginx policy.

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

- desktop navigation switches to the mobile menu at `1260px`;
- hero becomes single-column below `980px`;
- statement/service cards stack below `980px` or their container threshold;
- audience cards become one column below `980px`;
- trust sticky/two-column layout collapses below `980px`;
- Free IT Audit hero/contact layout becomes single-column below `980px`;
- tighter phone typography, padding, blur and form layout apply below `640px`;
- global page gutters reduce below `700px`;
- footer moves from four columns to three/two/one across its documented breakpoints.

There should be no horizontal page scrolling, squeezed desktop navigation or unreadably small text used to make a layout fit.

## Security baseline

The active site is intentionally dependency-light.

Current controls/rules include:

- no credentials or secrets in the repository;
- repository-wide secret/hygiene scanning in CI;
- no third-party runtime scripts by default;
- executable inline scripts/styles are rejected by the static audit;
- staging emits CSP, `X-Content-Type-Options`, frame denial, referrer policy and permissions policy;
- `.well-known/security.txt` is present;
- XML-RPC is disabled in WordPress and expected to be blocked at the edge/origin;
- form submissions use first-party WordPress handlers with validation, consent, honeypot and rate limiting;
- production TLS/HSTS and server/CDN headers remain deployment responsibilities.

## Cora

Cora is a progressively enhanced service guide shared across the site.

- the browser talks only to WordPress; it never receives an AI-provider credential or calls a model directly;
- curated, versioned Staple IT knowledge and deterministic package tools remain the commercial source of truth;
- `tools/build-cora-site-corpus.py` snapshots the public `stapleit.co.uk` sitemap into a full source-labelled corpus plus a canonical runtime corpus; supplementary blog posts remain available for offline training/reference but are excluded from live file-search retrieval so current service pages remain authoritative;
- when the public flag, OpenAI project key and Staple IT vector store are all configured, OpenAI GPT-5.6 Terra writes the conversational reply from the trusted fact/decision packet and live-site file-search context; until all three are ready Cora remains parked, while the local Qwen model remains a bounded backend fallback only;
- WordPress issues a signed conversation token and keeps only a short, server-owned conversation window so Cora can remember her own replies without trusting forged browser assistant/system messages;
- deterministic input/output gates reject secret disclosure, prompt-injection requests, unsupported commercial claims, invented prices/contact details and unsafe capability claims;
- package and add-on decisions remain deterministic; a model may explain or rephrase them but cannot change the fixed result or published price basis;
- the supervised fine-tune dataset is separate from the regression/evaluation corpus so training cannot simply memorise the release tests;
- if hosted/local AI is unavailable or a model reply fails validation, WordPress returns the deterministic `knowledge-guide` fallback.

## Performance baseline

- Prefer CSS over JavaScript for visual effects.
- Keep JavaScript dependency-free and event-driven.
- Use responsive layout rather than rendering separate mobile pages.
- Keep autoplay video exceptional.
- Avoid unconstrained blur/filter layers that paint outside their intended section.
- Run the static-site, asset, repository and generated-CSS audits before calling a milestone clean.

The homepage `assets/media/liquid-wave.mp4` is currently about 1.36 MB, below the repository's 1.5 MB video target/warning threshold. It remains an exceptional hero asset and should only be made heavier if there is a measured visual reason.

## Free IT Audit and support enquiry forms

The homepage Free IT Audit form and IT Support sole-trader enquiry are backed by first-party WordPress handlers. Valid submissions are stored privately under Form Enquiries and WordPress attempts email delivery to `hello@stapleit.co.uk`. Validation, consent, honeypot handling and per-source rate limiting are enforced server-side.

Production still requires authenticated SMTP/deliverability testing and monitoring before launch; a successful WordPress save must not be confused with guaranteed email delivery.

## Local staging

From the repository root on Windows:

```powershell
.\Start-Staging.ps1
```

The local staging server injects live reload, disables browser caching and emits the baseline development security headers.

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

Core pre-push checks are documented in `STANDARDS-INDEX.md` and include:

```text
python3 tools/audit-site.py --root site
python3 tools/audit-assets.py --root site/assets
python3 tools/audit-repository.py --root .
python3 tools/build-css.py --check
bash -n tools/deploy-wordpress-staging.sh
bash -n tools/audit-vps.sh
bash -n tools/prune-theme-backups.sh
```

Cora changes must also pass the PHP safety/knowledge contracts used by CI and deployment.

## Pre-release manual QA

Automation does not replace real browser/device testing. Before deployment, manually test at the reference widths above in current Chromium, Safari/WebKit and Firefox where practical, including:

- nav/mobile-menu operation;
- service carousel controls and automatic rotation;
- Cora open/close, keyboard interaction, loading and fallback behaviour;
- support planners and recommendation handoff;
- scroll/reveal effects and graceful CSS fallbacks;
- trust glow containment at page/column edges;
- form keyboard/focus/validation behaviour;
- no horizontal overflow;
- footer stacking and tap targets.
