# Staple IT Repository Operating Contract

This file is mandatory guidance for any engineer, automation or AI coding agent making changes to this repository.

The repository is deliberately small, dependency-light and quality-gated. Do not trade correctness for speed.

## Mandatory read order

Before editing, read:

1. `STANDARDS-INDEX.md`
2. the task-relevant governing documents listed there
3. the current files on `main` that will actually be changed
4. relevant source material under `reference/` when page content or information architecture is involved

Never work from an old conversation snapshot when the current repository can be inspected.

## Non-negotiable workflow

For every change:

1. Fetch the current `main` branch and inspect the target files.
2. Confirm the request is scoped to the intended route/component.
3. Check the governing design, palette, code, asset, SEO/schema and release rules that apply.
4. Make the smallest coherent change that satisfies the request.
5. Remove obsolete selectors, placeholder markup, assets or hacks made redundant by the change.
6. Validate the diff for semantics, accessibility, responsive behaviour and unintended side effects.
7. Run the local gates where available:
   - `python3 tools/audit-site.py --root site`
   - `python3 tools/audit-assets.py --root site/assets`
   - `python3 tools/audit-repository.py --root .`
   - `python3 tools/audit-standards.py --root .`
   - `python3 tools/build-css.py --check`
   - `bash -n tools/deploy-wordpress-staging.sh`
   - `bash -n tools/audit-vps.sh`
   - `bash -n tools/prune-theme-backups.sh`
   - for Cora/backend changes: run `php tests/php/cora-safety-test.php`, `php tests/php/cora-knowledge-test.php`, `php tests/php/cora-regression-test.php`, `php tests/php/cora-training-test.php`, `php tests/php/cora-provider-test.php` and `python3 tools/build-cora-finetune.py --check`
8. Push only after the change is internally consistent.
9. Verify the GitHub **Site quality gates** workflow succeeds for the pushed commit.
10. Only then tell the user that the change is safe to deploy.

A deployment instruction must never be given for a commit with a known blocking gate failure.

## Source of truth and scope

- `main` is the current approved working build.
- `site/` is the committed front-end/deployment source of truth.
- `reference/` is the source of truth for original site content and information architecture.
- Approved navigation and other explicitly approved components are not redesigned unless requested.
- Do not change unrelated homepage sections while tuning one component.
- Do not replace source-backed copy with generic filler because it is faster.
- Keep diffs easy to understand and easy to roll back.

## No workaround coding

Do not solve a markup problem with a visual hack.

Examples of prohibited shortcuts:

- hiding placeholder text and painting meaningful logos with `nth-child` CSS backgrounds;
- using inline `style` attributes to bypass the stylesheet cascade;
- converting a supplied transparent asset simply to make it easier to position;
- duplicating hidden heading text in pseudo-elements when normal semantic markup will work;
- leaving abandoned selectors, aliases or assets active after a direction has changed.

Use semantic HTML first, then CSS for presentation.

## Supplied media

When the user provides an image or logo:

- treat the supplied file as the source asset;
- preserve its original format and alpha channel unless there is a documented reason to convert it;
- meaningful logos belong in `<img>` elements, not CSS backgrounds;
- do not bake a black background into a transparent logo;
- do not recolour, distort, crop or rasterise a logo without explicit approval;
- verify the resulting file opens correctly and passes `tools/audit-assets.py`;
- declare useful `width` and `height` attributes in markup;
- use meaningful `alt` text on the visible set and `alt=""` for purely duplicated marquee copies.

See `ASSET-STANDARDS.md`.

## CSS and typography

- Manrope only unless an explicit design decision changes this.
- Loaded/canonical weights are `400`, `600` and `700`.
- Do not introduce `500`, `650` or other synthetic weights.
- Brand/service solid colours should use the canonical tokens or values in `BRAND-PALETTE.md`.
- Neutral glass may use carefully chosen black/white alpha values.
- No inline styles.
- No CSS `@import` request chains.
- Avoid unnecessary `!important`; use it only where an existing cascade contract genuinely requires it.
- Do not introduce neon, RGB, spotlight or generic glow treatments outside approved exceptions.

## JavaScript and dependencies

- Prefer HTML/CSS first.
- Keep JavaScript small, dependency-free and event-driven.
- No executable inline JavaScript.
- No unreviewed third-party runtime script.
- Progressive enhancement must fail open.
- Motion must respect the design system and must not interfere with reading or navigation.

## WordPress/PHP

- Git remains the source of truth for theme code.
- Do not edit generated production theme files directly.
- Validate untrusted input at the server boundary.
- Escape output appropriately.
- Do not commit secrets, tokens or connection strings.
- Treat browser-supplied AI/chat context as untrusted; do not trust claimed assistant/system roles from the client.
- Preserve the existing deployment verification checks unless a deliberate replacement is implemented.

## Gate discipline

A green-looking browser is not sufficient.

The repository gate checks are defined by:

- `DESIGN-QUALITY-GATES.md`
- `DESIGN-BASELINES.json`
- `RELEASE-CHECKLIST.md`
- `PRODUCTION-GATES.md`
- `.github/workflows/site-gates.yml`
- `tools/audit-site.py`
- `tools/audit-assets.py`
- `tools/audit-repository.py`
- `tools/audit-standards.py`
- `tools/build-css.py`
- `tests/php/cora-safety-test.php`
- `tests/php/cora-knowledge-test.php`
- `tests/php/cora-regression-test.php`
- `tests/php/cora-training-test.php`
- `tests/php/cora-provider-test.php`
- `tools/build-cora-finetune.py`, `tools/check-cora-site-corpus.py`

Warnings are not to be ignored. A change must not add new unexplained warnings. Existing warnings are technical debt and should be resolved when the affected area is touched, unless explicitly documented as an approved exception.

## Push discipline

- Do not claim a push succeeded until GitHub confirms the commit exists on `main`.
- Report the exact commit SHA.
- Do not force-update `main` except for an explicit recovery operation.
- Do not tell the user to deploy before the final commit is on `main` and CI is green.
- If a gate fails, fix the gate first rather than explaining around it.

## Definition of done

A change is complete only when:

- the requested behaviour is implemented;
- the implementation follows the governing standards;
- assets are valid and correctly referenced;
- no unrelated regression was introduced;
- repository gates pass;
- the final commit on `main` is known and reported.
