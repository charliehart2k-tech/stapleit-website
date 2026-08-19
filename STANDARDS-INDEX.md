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

The IT Support hero deliberately uses the Staple spectrum treatment for the `Unlimited` word, canonical Signal Red for the `£35` price, and no separate `Core support cover` card. The `Unlimited` line is centred over `IT Support`, while the complete left-column proposition (heading, price and primary action) is vertically centred as one unit within the desktop hero pane. Its typography follows the same hero, lead-copy and UI scale used by the homepage rather than route-specific one-off sizes. The second column is headed `Everything in your support package as standard`; the exact visible casing is `as standard` in lowercase, at the same heading size as the preceding words, and it uses Support Green with no separate eyebrow label. Default support inclusions use the normal body-copy scale and are grouped into compact, unboxed content clusters inside the single hero glass pane. The primary hero action is `See packages`, linking to the package section. This approved direction supersedes the older IT Support hero description in `DESIGN-SYSTEM.md` where the two differ.

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
- raster image integrity checks;
- blocking deployment when static/asset audits fail.

The active CI definition is `.github/workflows/site-gates.yml`.

## Mandatory pre-push check

Before pushing a substantive change:

```bash
python3 tools/audit-site.py --root site
python3 tools/audit-assets.py --root site/assets
bash -n tools/deploy-wordpress-staging.sh
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

The previous non-canonical Manrope weight warnings in the homepage CSS have been removed. The hero video may remain until a visually equivalent smaller source is approved.

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
