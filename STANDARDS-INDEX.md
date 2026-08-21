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

The IT Support hero opens with a CSS-only SVG text mask rather than video. `Unlimited IT Support` initially occupies the pane as clean, fully readable letterforms containing a restrained blue-to-purple moving field and soft SVG glow. The sequence begins on the first stylesheet paint, so the completed hero never flashes before the intro. The title retires as ten flat black louvres collapse cleanly from the centre out, exposing the real hero through widening gaps without rotating, slicing or distorting the finished copy. There is no travelling title, aperture expansion, circular wipe, stroke bloom or sustained overlap between the display title and permanent heading. The transition is automated, one-shot, limited to opacity, louvre transforms and masked gradient movement, and skipped on stacked tablet/phone layouts and whenever reduced motion is requested; required copy always remains in semantic HTML and becomes readable without JavaScript. The settled `Unlimited` word keeps the same restrained blue-to-purple movement, while `£35` remains Signal Red. The complete left-column proposition is vertically centred, and its CTA is centred beneath the proposition rather than against the full pane. The second column is headed `Everything you need, as standard`; `as standard` is lowercase, the same heading size as the preceding words and Support Green. Default inclusions use the body-copy scale in compact, unboxed clusters. The primary hero action is `Scroll down to find out more`, linking to the onboarding chapter. Below the hero, measured staggered reveals and restrained focus/hover light provide depth without obscuring copy; mobile uses an aligned vertical onboarding timeline and bottom-sheet package dialogs, while touch, reduced-motion and forced-colour modes receive simplified equivalents.

The hero contains no background blob or video after the SVG intro retires; the settled pane is restrained black glass so the content remains dominant. The `Getting started is simple` chapter is a connected three-step composition: compact numbered nodes sit on a restrained palette rail above three equal-height neutral black-glass cards. `simple` and the `support` word in the package heading use a restrained moving Support Green fill and soft glow. Orange/red, blue/purple and Support Green/blue appear only as contained organic blooms, node edges and interaction accents rather than solid backing slabs. Each step remains one readable pane with no detached decorative glass chips; hover mirrors the homepage cards with a small lift and moving bloom. The route follows the homepage chapter/card/body hierarchy, with safe line boxes, visible overflow and descender allowance on display text. The package sequence adds a neutral grey `Sole trader` POA card ahead of Basic, Standard and Premium. Sole trader has a real enquiry control and a `Sole Trader IT Support` panel containing a dedicated WordPress-backed form; it is stored, rate-limited and mail-observed through the same architecture as the homepage IT Audit while remaining a distinct enquiry type. Core package cards use contained heading and price scales, four/two/one-column breakpoints and balanced wrapping so icons, badges and copy never clip. Minimum staff counts and material licence requirements stay visible, while inclusion dialogs use a roomy two/one-column layout and never compress commercial qualifiers into fine print. Add-on packs keep short summaries in the grid and place complete grouped scope and caveats in the shared accessible dialog. A lightweight monochrome grain tile adds depth to the route's major black-glass surfaces, while a single external line-icon sprite supports the four `as standard` headings without replacing their visible text. The chapter uses Manrope, falls back to an opaque near-black surface where backdrop blur is unavailable and removes motion when reduced motion is requested.

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

- Python syntax for the audit tooling;
- shell syntax for the staging deploy script;
- required governing standards being present;
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
- raster image and MP4 container integrity checks;
- blocking deployment when static/asset audits fail.

The active CI definition is `.github/workflows/site-gates.yml`.

## Mandatory pre-push check

Before pushing a substantive change:

```bash
python3 tools/audit-site.py --root site
python3 tools/audit-assets.py --root site/assets
python3 tools/audit-repository.py --root .
python3 tools/build-css.py --check
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

A new change must not add an unexplained warning.

Current known static-audit warning:

- `site/assets/media/liquid-wave.mp4` is approximately `1.81 MiB` and is the explicitly approved hero-video exception.

The previous non-canonical Manrope weight warnings in the homepage CSS have been removed. The homepage hero video may remain until a visually equivalent smaller source is approved.

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
