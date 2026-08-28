# Staple IT Standards Index

This file is the entry point for the repository's design, engineering, asset, search and release standards.

## Authority and precedence

When two instructions appear to conflict, use this order:

1. the user's latest explicit approved requirement;
2. `AGENTS.md` operating rules;
3. the task-specific governing standard below;
4. existing approved implementation patterns on `main`;
5. original content/information architecture under `reference/`.

Do not silently invent a new convention. If a genuine design or engineering decision changes, update the relevant governing document in the same change.

### Current approved visual exceptions

The animated Staple-palette spectrum outline on navigation pills is explicitly approved and must be preserved. The current destination uses a subdued slow outline, while hover and keyboard focus strengthen the same two-pixel treatment; reduced-motion and forced-colour fallbacks remain mandatory. The same restrained spectrum language may be reused on selected interactive buttons where it improves hierarchy without turning the surface itself into a multicolour fill. This exception supersedes older wording that prohibited colour treatment on navigation.

The IT Support hero opens directly on its semantic content with no video, duplicate display title, mask or timed blind sequence. The two settled panes use one short opacity/vertical entrance that finishes in under a second and never delays access to the copy; reduced-motion and forced-colour modes expose the completed layout immediately. `Unlimited` keeps a restrained, slow blue-to-purple moving fill and soft glow, while `IT Support` remains white and `£35` remains Signal Red. The complete left-column proposition is vertically centred, and its CTA is centred beneath the proposition rather than against the full pane. The second column is headed `Everything you need, as standard`; `as standard` is lowercase, the same heading size as the preceding words and Support Green. Default inclusions use the body-copy scale in compact, unboxed clusters. The primary hero action is `See how it works`, centred beneath the left-column proposition and linking to the onboarding chapter. Below the hero, measured staggered reveals and restrained focus/hover light provide depth without obscuring copy; mobile uses an aligned vertical onboarding timeline and bottom-sheet package dialogs, while touch, reduced-motion and forced-colour modes receive simplified equivalents.

The hero contains no background blob or video; the restrained black glass keeps the content dominant. The `Getting started is simple` chapter is a connected three-step composition: compact numbered nodes sit on a restrained palette rail above three equal-height neutral black-glass cards. `simple` and the `support` word in the package heading use a restrained moving Support Green fill and soft glow. Orange, blue and Support Green appear only as contained organic blooms, node edges and interaction accents rather than solid backing slabs. Each step remains one readable pane with no detached decorative glass chips; its resting depth, hover bloom, travelling sheen and small lift mirror the approved homepage service cards using the step's own accent. The route follows the homepage chapter/card/body hierarchy, with the canonical 17px desktop / 16px mobile body role, safe line boxes, visible overflow and descender allowance on display text. The package sequence adds a neutral grey `Sole trader` tailored-pricing card ahead of Basic, Standard and Premium. Sole trader has a real enquiry control and a `Sole Trader IT Support` panel containing a dedicated WordPress-backed form; it is stored, rate-limited and mail-observed through the same architecture as the homepage IT Audit while remaining a distinct enquiry type. Core package cards use contained heading and price scales, four/two/one-column breakpoints and balanced wrapping. They omit decorative icons and boxed price labels; only the quiet `Most popular` marker is retained where it helps comparison. Minimum staff counts and material licence requirements stay visible, while inclusion dialogs use a roomy two/one-column editorial layout without nested cards or compressed commercial qualifiers. Add-on packs use a generous two-column grid, state their shared pricing basis once in the chapter introduction and place complete grouped scope and caveats in the shared accessible dialog. A one-question-at-a-time pack finder maps all nine packs to plain-English `Yes`, `No` and `Not sure` decisions, keeps answers in the browser and returns advisory results with reasons and direct catalogue links; the full pack content remains the source of truth and stays usable without JavaScript. A lightweight monochrome grain tile adds depth to the route's major black-glass surfaces, while a single external line-icon sprite supports the four `as standard` headings without replacing their visible text. The chapter uses Manrope, falls back to an opaque near-black surface where backdrop blur is unavailable and removes motion when reduced motion is requested.

The IT Support planner uses one progressive workflow for package questions and add-on guidance. Recommendations remain advisory and are transferred into the free-audit form only after an explicit visitor choice. The browser shows deterministic package/pack decisions immediately; WordPress independently owns those commercial decisions and a model cannot replace the result, change its certainty or publish a new price. Cora is the single shared conversational service guide on every route. The browser never calls a model directly or receives provider credentials. When OpenAI is configured, WordPress uses GPT-5.6 Terra through the Responses API with low reasoning and low verbosity, supplying a trusted fact/decision packet, relevant curated knowledge, OpenAI file-search access to the live-site snapshot and short server-owned conversation memory; generated output is re-validated before publication. Qwen2.5 1.5B on loopback remains a bounded local fallback, while `knowledge-guide` remains the dependency-free deterministic fallback. Backend mode names (`hosted-ai`, `local-ai`, `knowledge-guide`) are diagnostic metadata and must not appear as visitor-facing copy. Cora is grounded through the versioned `wordpress/cora-knowledge.php` authority layer plus an OpenAI file-search vector store built from a committed snapshot of the public `stapleit.co.uk` sitemap. The site snapshot is rebuilt explicitly rather than scraped on each visitor request; deterministic package/pricing/safety rules outrank retrieved website text. The supervised fine-tune dataset is built separately from the regression/evaluation corpus so training cannot simply memorise release tests. WordPress issues a signed conversation token and keeps only a short, 30-minute server-owned memory; browser-supplied assistant/system history is never trusted. Deterministic input guards intercept secrets, prompt-injection requests and active-incident wording. Output gates reject invented or incomplete prices, incorrect Microsoft 365 Business Premium inclusions, unsupported contact/booking/processing/inspection claims, invented package tiers, external URLs, unapproved telephone/email details, unsupported SLA times and 24/7 staffed-support claims. Fixed package decisions and published price bases must survive any model rewrite. First-party planner analytics store allowlisted daily aggregate event counts only, with no prompts, answers, cookies, IP addresses or device identifiers. The nine canonical reference viewports are exercised by the automated visual-contract job, which blocks horizontal overflow, undersized controls, hidden initial questions and body-copy regression while retaining screenshots as CI evidence.

## Governing documents

| Document | Purpose |
|---|---|
| `AGENTS.md` | Mandatory operating procedure for engineers and AI agents |
| `BRAND-PALETTE.md` | Canonical Staple IT and service colours |
| `DESIGN-SYSTEM.md` | Visual language, glass, typography, motion, responsive, accessibility, performance and security baseline |
| `DESIGN-QUALITY-GATES.md` | Enforceable design, typography, layout, motion and CSS quality criteria |
| `DESIGN-BASELINES.json` | Machine-readable type, touch, breakpoint, bundle-order and specificity limits |
| `CODE-STANDARDS.md` | HTML, CSS, JavaScript, PHP and repository coding conventions |
| `ASSET-STANDARDS.md` | Image, logo, video, transparency, optimisation and integrity rules |
| `SEO-AEO-SCHEMA.md` | SEO, AEO/GEO/ASEO and structured-data rules |
| `RELEASE-CHECKLIST.md` | Nine route/component quality gates |
| `PRODUCTION-GATES.md` | Go/no-go production readiness checklist |
| `DEPLOYMENT-NOTES.md` | VPS/CDN/staging-specific deployment requirements |
| `WORDPRESS-PLUGIN-BASELINE.md` | Approved WordPress plugin inventory and policy |

## Automated enforcement

The repository currently enforces:

- Python syntax for the audit/build tooling;
- shell syntax for deployment/VPS/backup tooling;
- required governing standards being present;
- repository-wide secret and unsafe-file scanning;
- static content/security/reference/SEO/AEO checks;
- blocking canonical Manrope weight checks;
- canonical shared type/spacing token ownership, semantic type floors and protected readable-copy floors;
- no duplicate homepage-only aliases for chapter, card-heading or body-copy type roles;
- per-file and total `!important` ceilings that can decrease but cannot drift upward;
- registered homepage media-query widths and homepage bundle source order;
- 44px minimum-height protection for key interactive controls;
- route-level reduced-motion coverage for animated bundles and preservation of the approved navigation spectrum fallback;
- no runtime JavaScript inline-style injection/mutation;
- no `eval()` / `new Function()` dynamic code execution;
- working per-file CSS and JavaScript size budgets;
- generated CSS bundle integrity and compressed route budgets;
- raster image and MP4 container integrity checks;
- WordPress/PHP syntax plus Cora safety and knowledge contracts;
- safe deployment-path and rollback-retention checks;
- Nginx hardening/CSP baseline checks;
- nine-viewport Chromium visual/interaction contracts for IT Support and Cora;
- blocking deployment when static, asset or Cora contract audits fail.

The active CI definition is `.github/workflows/site-gates.yml`.

## Mandatory pre-push check

Before pushing a substantive change:

```bash
python3 tools/audit-site.py --root site
python3 tools/audit-assets.py --root site/assets
python3 tools/audit-repository.py --root .
python3 tools/build-css.py --check
php -l wordpress/functions.php
php -l wordpress/cora-safety.php
php -l wordpress/cora-knowledge.php
php tests/php/cora-safety-test.php
php tests/php/cora-knowledge-test.php
bash -n tools/deploy-wordpress-staging.sh
bash -n tools/audit-vps.sh
bash -n tools/prune-theme-backups.sh
```

Then inspect the diff and confirm:

- only intended files changed;
- no inline style/script/event-handler workaround was introduced;
- semantic HTML is used for meaningful content;
- supplied assets were not needlessly converted or altered;
- responsive/accessibility behaviour still matches the design system;
- no new warnings have been introduced without explanation.

## Warning policy

CI distinguishes warnings from blocking errors, but warnings are still engineering debt.

A new change must not add an unexplained warning. Approved exceptions must describe the current file/state accurately and must be removed when they are no longer true.

There is currently no approved oversized-media warning: `site/assets/media/liquid-wave.mp4` is approximately `1.36 MB`, below the repository's `1.5 MB` video warning/target threshold. Autoplay video remains exceptional and this file should not be made heavier without a measured reason.

The previous non-canonical Manrope weight warnings in the homepage CSS have been removed.

## Release rule

A commit is not deployable merely because it renders correctly.

The minimum release condition is:

1. requested behaviour implemented;
2. governing standards followed;
3. local/static checks pass;
4. GitHub **Site quality gates** succeeds on the exact commit;
5. only then run the staging deployment script.

## Updating these standards

When a rule changes:

- update the relevant document in the same commit as the implementation where practical;
- keep `STANDARDS-INDEX.md` accurate;
- update CI/audit tooling when a rule is important enough to enforce automatically.
