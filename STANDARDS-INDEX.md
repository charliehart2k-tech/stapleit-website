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

The animated Staple-palette spectrum outline on navigation pills is explicitly approved and must be preserved. The same restrained spectrum language may be reused on selected interactive buttons where it improves hierarchy without turning the surface itself into a multicolour fill. This exception supersedes older wording that prohibited colour treatment on navigation; reduced-motion behaviour remains mandatory.

The IT Support hero uses a web-optimised H.264 derivative of the supplied `it-support-liquid.mp4` as a clearly visible, contained background video inside the single glass pane, following the homepage hero's autoplay, muted, looping and reduced-motion pattern. Because the supplied animation is predominantly black, its readability shade is deliberately lighter than the homepage wave shade so the asset remains visible behind the text. The hero deliberately uses the Staple spectrum treatment for the `Unlimited` word, canonical Signal Red for the `£35` price, and no separate `Core support cover` card. `Unlimited` shares the same left edge as `IT Support`, while the complete left-column proposition (heading, price and primary action) is vertically centred as one unit within the desktop hero pane. Its typography follows the same hero, lead-copy and UI scale used by the homepage rather than route-specific one-off sizes. The second column is headed `Everything in your support package as standard`; the exact visible casing is `as standard` in lowercase, at the same heading size as the preceding words, and it uses Support Green with no separate eyebrow label. Default support inclusions use the normal body-copy scale and are grouped into compact, unboxed content clusters inside the single hero glass pane. The primary hero action is `See packages`, linking to the package section. This approved direction supersedes the older IT Support hero description in `DESIGN-SYSTEM.md` where the two differ.

The IT Support hero video is deliberately scaled well beyond the pane so the supplied circular form reads as an immersive liquid field rather than a complete floating blob. Its outer circumference must remain outside the clipped hero at the desktop, tablet and phone reference widths; the visible composition should feel like a close crop from inside the liquid surface, not an object placed behind the copy. The `Getting started is simple` chapter is a connected three-step composition: prominent numbered nodes sit on a restrained palette rail above three equal-height neutral black-glass cards. Orange/red, blue/purple and Support Green/blue appear only as contained organic blooms, node edges and interaction accents rather than solid backing slabs. Each step remains one readable pane with no detached decorative glass chips; hover mirrors the homepage cards with a small lift, moving bloom and travelling sheen. A lightweight monochrome grain tile adds depth to the route's major black-glass surfaces, while a single external line-icon sprite supports the four `as standard` headings without replacing their visible text. The chapter uses Manrope, requires no additional JavaScript, falls back to an opaque near-black surface where backdrop blur is unavailable and removes motion when reduced motion is requested.

## Governing documents

| Document | Purpose |
|---|---|
| `AGENTS.md` | Mandatory operating procedure for engineers and AI agents |
| `BRAND-PALETTE.md` | Canonical Staple IT and service colours |
| `DESIGN-SYSTEM.md` | Visual language, glass, typography, motion, responsive, accessibility, performance and security baseline |
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
- canonical Manrope weight checks;
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
