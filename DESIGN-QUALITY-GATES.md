# Staple IT Design Quality Gates

This document converts the visual system into repeatable release checks. It
complements `DESIGN-SYSTEM.md`: that document defines the direction; this one
defines the conditions a change must satisfy before it can ship.

The machine-readable limits used by the audit tools live in
`DESIGN-BASELINES.json`. Do not duplicate or loosen those limits in a route
stylesheet. A baseline may stay level or decrease as debt is removed; it must
not be raised simply to make a failing change pass.

## 1. Authority and review model

Design quality has two layers:

1. automated gates catch objective regressions such as undersized type,
   non-canonical weights, new specificity debt, unregistered breakpoints,
   stale bundles and missing motion fallbacks;
2. human review judges balance, hierarchy, rhythm, contrast and whether an
   effect still feels like Staple IT.

A green workflow is necessary, not sufficient. Browser and device review in
`RELEASE-CHECKLIST.md` remains required before production.

## 2. Typography

### Canonical family and weights

- Manrope is the only approved family unless the design system records an
  explicit exception.
- Use weights 400, 600 and 700 only.
- Do not simulate hierarchy with 500, 650, 800 or other unloaded weights.
- Text must remain live HTML. Do not paint essential copy with pseudo-elements,
  raster images or canvas.

### Canonical type roles

`site/assets/css/tokens.css` owns every `--type-*` declaration:

| Token | Current role | Enforced minimum |
|---|---|---:|
| `--type-small` | compact supporting/legal labels | 13px |
| `--type-ui` | navigation, controls and compact decision copy | 15px |
| `--type-body` | normal paragraph copy | 16px |
| `--type-lead` | chapter and hero supporting copy | 18px |
| `--type-card` | card headings | 24.8px |
| `--type-section` | major chapter headings | 44px |
| `--type-hero` | page-level hero headings | 72px |

The normal body token is 17px on larger screens and 16px on small screens.
The minimum is a floor, not a target for every component. Conversion copy,
package terms and form feedback should use the largest role their space can
comfortably support.

Route-specific aliases that duplicate a canonical role are prohibited. In
particular, do not restore `--home-copy`, `--home-card-title` or
`--home-chapter`.

### Readability rules

- Inputs remain at least 16px to avoid mobile browser zoom.
- Navigation and compact legal labels never drop below their recorded floors.
- Paragraph text must not be reduced merely to force equal card heights.
- Display text needs a safe line-height and visible descender allowance.
- Long copy should be edited or reflowed before type is shrunk.
- Heading line breaks must remain intentional at the reference viewports.

## 3. Spacing and layout

`site/assets/css/tokens.css` is the sole owner of `--space-*` declarations.
Use its semantic scale for new work:

| Token | Value |
|---|---:|
| `--space-1` | 8px |
| `--space-2` | 12px |
| `--space-3` | 16px |
| `--space-4` | 24px |
| `--space-5` | 32px |
| `--space-6` | 48px |
| `--space-7` | 64px |
| `--space-8` | 96px |
| `--space-9` | 128px |

The current site still contains deliberate legacy literals, so an arbitrary
"every value must be divisible by eight" test is not a release gate. New
layout work should use the scale, and touched legacy rules should be moved to
tokens when doing so preserves the approved composition.

Layout checks:

- the page must not scroll horizontally at any reference viewport;
- content remains inside `--page` unless a chapter is intentionally full
  bleed;
- card padding and gaps should read as a system, not isolated guesses;
- cards in a row align by structure rather than tiny type or filler copy;
- fixed heights are acceptable only when content still fits at zoom and at the
  narrowest supported width;
- controls that wrap remain vertically centred and retain their touch target.

## 4. Responsive system

Reference viewports are defined in `RELEASE-CHECKLIST.md`. The current
homepage source modules may use only the registered widths in
`DESIGN-BASELINES.json`:

`370`, `400`, `430`, `640`, `700`, `701`, `980`, `981`, `1260` pixels.

These values include paired min/max boundaries and narrow-phone safeguards.
The navigation changes to its menu at 1260px, not 1080px. Shared shell and
route-specific components may retain other documented widths where their
content requires them; adding a new homepage width requires a deliberate
baseline and documentation update.

## 5. Interaction and accessibility

- Primary controls and links listed in `DESIGN-BASELINES.json` retain a 44px
  minimum height.
- Keyboard focus is visible against black and glass surfaces.
- Hover-only information is prohibited.
- Colour is never the sole carrier of package, state or error meaning.
- Dialogs, disclosure controls and forms remain usable without JavaScript.
- Meaningful images have useful alternative text and declared dimensions.
- Touch layouts do not depend on fine-pointer effects.
- Browser zoom to 200% must preserve reading order and access to every action.

## 6. Glass, colour and depth

The default material is restrained monochrome black glass. Colour has a
semantic or specifically approved role.

- Keep one component visually equal to one pane.
- Do not add detached empty glass chips, internal shelves or decorative nested
  cards.
- Use thin low-alpha borders and soft external depth rather than bright solid
  outlines.
- Backdrop blur needs the `-webkit-backdrop-filter` counterpart and a readable
  opaque fallback.
- Service colours identify services or interaction states; they do not become
  general multicolour decoration.
- Soft glows remain contained, low-opacity and subordinate to copy.
- The approved navigation spectrum outline and route-specific treatments in
  `STANDARDS-INDEX.md` are explicit exceptions, not reusable defaults.

Contrast is judged on the settled surface and during animation. Text must not
pass over a bright or low-contrast field that makes it temporarily unreadable.

## 7. Motion

Motion should communicate hierarchy, feedback or continuity.

- Prefer opacity and small transforms for entrance reveals.
- Do not delay access to essential content for an intro effect.
- Avoid scroll-jacking, perpetual cursor tracking and blur-heavy movement.
- Continuous ambient motion must be slow, contained and cheap to composite.
- Every generated route bundle containing keyframes must also include a
  reduced-motion media query.
- The navigation spectrum source must retain its named animation and explicit
  reduced-motion fallback.
- Reduced-motion mode must expose the completed layout immediately.
- No-observer and no-JavaScript paths must fail open with readable content.

The automated reduced-motion check is a route-level sentinel. Human review
must still confirm that each visible animation is actually neutralised.

## 8. Copy and naming

- Use UK English and sentence case for descriptive headings.
- Use the canonical service names in `DESIGN-SYSTEM.md`.
- Use exact product names, including `Microsoft 365` and genuine names such as
  `Microsoft Defender for Office 365`.
- Avoid vague actions such as `Click here`; a descriptive phrase such as
  `Click to chat` may be appropriate where it names the action.
- Prices, minimum seat counts, licensing dependencies and exclusions remain
  visible and truthful.
- Approved unfinished routes may use truthful placeholder copy only while they
  remain `noindex,nofollow` and outside the sitemap.
- Never enforce copy standards with naive substring bans that would reject a
  legitimate product name or approved action.

## 9. CSS architecture and debt

The generated route bundles are outputs. Edit source modules and run
`python3 tools/build-css.py`.

The homepage still carries historical cascade debt. CI records the exact
per-source `!important` ceiling and a total source ceiling of 902 in
`DESIGN-BASELINES.json`.

Rules for this baseline:

- no source file may exceed its recorded ceiling;
- a source file omitted from the map has a zero allowance;
- IT Support source CSS has a zero allowance;
- moving debt between files is prohibited by the per-file ceilings;
- when declarations are removed, lower the relevant ceilings in the same
  commit;
- do not add a new override layer to solve an ownership problem;
- canonical type and spacing tokens may be declared only in `tokens.css`;
- the homepage bundle source order is registered and checked to prevent silent
  cascade changes.

Hard-coded colour and spacing literals are existing debt, not an excuse for
new drift. Use canonical tokens for new work. Consolidate legacy literals only
with visual regression review because blind mechanical replacement can alter
approved contrast and rhythm.

## 10. Automated release gates

The current CI blocks:

- missing or malformed design baselines;
- canonical type/spacing token declarations outside `tokens.css`;
- type-token values below their minimum floors;
- deprecated homepage type aliases;
- protected readable selectors below their role floors;
- protected controls below 44px;
- non-canonical Manrope weights;
- unregistered homepage media-query widths;
- per-file or total `!important` growth;
- a changed homepage bundle registry/order;
- animation bundles without route-level reduced-motion coverage;
- a missing navigation spectrum or navigation reduced-motion fallback;
- stale generated bundles or a gzip-budget regression;
- existing content, security, reference, asset, SEO and repository failures.

Potential future gates should be added only after the current codebase can pass
them truthfully. Good candidates are parsed colour-token drift, line-height
floors, selector-level motion coverage and automated screenshot comparison.
Do not introduce a permanently red gate with an invented baseline.

## 11. Human review checklist

Before production, review each changed route at all reference viewports and
confirm:

- the first screen has one obvious reading order and primary action;
- chapter headings, card titles and body copy follow the same hierarchy as the
  homepage;
- wrapping, descenders and price lines do not clip;
- card rows feel balanced without artificial filler;
- black/glass surfaces retain enough separation without becoming outlined
  boxes;
- glows and animation are subtle, slow and never reduce readability;
- hover, focus, touch, reduced-motion and forced-colour states remain useful;
- navigation switches before it becomes compressed;
- forms expose validation and success states clearly;
- content claims and commercial qualifiers are accurate;
- the final diff contains no obsolete selector, abandoned effect or duplicate
  token system.

Record any approved exception in the relevant governing document and, when it
is machine-enforceable, in `DESIGN-BASELINES.json` in the same change.
