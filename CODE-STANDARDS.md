# Staple IT Code Standards

These standards apply to the static site, WordPress theme source and supporting tooling.

## 1. General principles

- Prefer the simplest reliable implementation.
- Keep the repository dependency-light.
- Use semantic source markup rather than presentation hacks.
- Keep changes scoped to the requested route/component.
- Reuse existing tokens and approved patterns before inventing new ones.
- Delete obsolete code when a direction is abandoned.
- Comments should explain **why**, not restate obvious syntax.

## 2. HTML

- Use semantic `header`, `nav`, `main`, `section`, `article`, `aside` and `footer` elements appropriately.
- Every page has exactly one useful H1 in `main`.
- Keep heading levels logical.
- Use actual text in the DOM for meaningful content.
- Meaningful images and logos use `<img>`.
- Decorative duplicated images use empty alt text and, where appropriate, `aria-hidden="true"` on the containing duplicate group.
- Declare `width` and `height` on local raster images where dimensions are known.
- Lazy-load below-the-fold imagery/iframes where appropriate.
- Buttons are buttons; navigation links are links.
- Controls require accessible names and visible focus states.
- Do not add inline `style` attributes.
- Do not add executable inline scripts or inline event handlers.
- JSON-LD is the only normal inline script exception and must remain inert/truthful structured data.

## 3. CSS

- Use external stylesheets.
- Edit the scoped source modules, then run `python3 tools/build-css.py`; HTML loads one generated `*.bundle.css` file per route.
- Do not edit generated bundle files by hand or add extra render-blocking stylesheet links.
- Use Manrope and only canonical weights `400`, `600`, `700`.
- Serve Manrope locally from `site/assets/fonts/`; do not add a third-party font request.
- Use shared type, spacing, radius and palette tokens where they exist.
- Solid brand/service colours must follow `BRAND-PALETTE.md`; neutral glass alpha values may remain component-specific.
- No CSS `@import` asset/font chains.
- Prefer normal class selectors over positional `nth-child` rules for meaningful content.
- Do not use CSS backgrounds to carry meaningful logo/content semantics.
- Avoid excessive specificity and `!important`.
- `!important` is acceptable only when protecting an established cascade contract or overriding a legacy rule that cannot reasonably be removed in the same scoped change.
- The homepage carries measured legacy specificity debt; the audit blocks any increase, and new IT Support CSS permits no `!important` declarations.
- No generic RGB/neon/spotlight/glow treatments outside documented design-system exceptions.
- Keep animation properties stable; avoid animating expensive layout/filter properties without a clear reason.
- Respect `prefers-reduced-motion`.
- Prevent horizontal page overflow at all reference widths.

## 4. JavaScript

- Prefer no JavaScript when HTML/CSS can provide the behaviour.
- Keep JavaScript dependency-free by default.
- No third-party runtime libraries without explicit approval.
- No inline executable JavaScript.
- Features should initialise defensively and fail open.
- Avoid polling when an event/observer is appropriate.
- Clean up timers/listeners when a component lifecycle requires it.
- Do not block reading/navigation for animation.
- Touch interactions should follow the user's gesture where native scrolling can do the job.

## 5. PHP / WordPress

- `wordpress/` is source; generated files under the deployed theme are not edited directly.
- Validate and normalise untrusted request data.
- Escape output using the appropriate WordPress escaping function.
- Use WordPress nonces/capability checks for authenticated state-changing operations.
- Do not expose secrets in source or client-side markup.
- Mail/form handlers must preserve a recoverable record of submissions where designed to do so.
- Do not silently report delivery success when a required operation actually failed; where the product intentionally treats persisted submission as success, keep the delivery state observable in administration/logging.

## 6. Accessibility

Reference baseline:

- working skip link;
- semantic landmarks;
- useful labels/alt text;
- visible keyboard focus;
- minimum practical 44px touch targets;
- no essential information conveyed by colour alone;
- reduced-motion path;
- no permanently hidden content when a progressive enhancement fails.

## 7. Responsive behaviour

Check at minimum:

- `360 × 800`
- `430 × 932`
- `768 × 1024`
- `1024 × 1366`
- `1366 × 768`
- `1920 × 1080`

Do not solve layout issues by:

- shrinking body text below readable size;
- allowing horizontal page scroll;
- clipping heading glyphs;
- forcing desktop navigation into too little space.

## 8. File and selector hygiene

- Use lower-case hyphenated asset filenames.
- Keep page/component-specific CSS scoped.
- Do not leave dead aliases, abandoned experiments or hidden placeholder content active.
- If a new stylesheet is introduced, load it intentionally and only where required.
- Avoid duplicate CSS/JS functionality spread across multiple files.

## 9. Security

- No secrets, tokens or credentials.
- No `javascript:` URLs.
- No unreviewed external runtime scripts.
- Keep CSP/security-header requirements aligned with `DESIGN-SYSTEM.md` and `DEPLOYMENT-NOTES.md`.
- Validate server-side form input.
- Preserve `.well-known/security.txt`.

## 10. Validation and release

Before deployment:

```bash
python3 tools/audit-site.py --root site
python3 tools/audit-assets.py --root site/assets
python3 tools/audit-repository.py --root .
python3 tools/build-css.py --check
bash -n tools/deploy-wordpress-staging.sh
```

Then verify the exact pushed commit passes GitHub **Site quality gates**.

Do not use browser appearance as a substitute for these checks.
