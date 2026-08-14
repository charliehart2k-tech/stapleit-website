# Staple IT Design System

This document is the active design and build reference for the Staple IT website rebuild.

The original website scrapes and content under `reference/` remain the source of truth for page content and information architecture. This document defines how that content is presented in the rebuilt site.

## 1. Approved visual direction

The site is dark, clean and deliberately restrained.

- Background: black.
- Primary material: monochrome black liquid glass.
- Brand colour is used selectively, not as a general UI glow.
- The Staple IT logo keeps its original blue/red colours.
- The homepage hero may use its approved blue liquid-wave artwork and blue headline accent.
- Navigation and footer glass remain neutral/monochrome.
- Avoid coloured glows, RGB effects, spotlight effects and excessive animation.
- Avoid internal glass shelves, inset secondary bubbles or layered highlight bars inside controls.
- One component should read as one pane of glass.

The approved navigation is a signed-off component. Its structure must not be redesigned unless explicitly requested.

## 2. Typography

The active site uses Manrope throughout.

- Body copy: Manrope 400.
- Labels, controls and small emphasis: Manrope 600.
- Navigation and headings: Manrope 700.
- Do not introduce a second font family without an explicit design decision.
- Headings use tight negative tracking and short line lengths.
- Body copy should remain comfortably readable; do not make text tiny to force a layout to fit.

Manrope is currently delivered through Google Fonts while the rebuild is in progress. The approved family/weights are 400, 600 and 700. If the font binary is vendored into the repository later, keep the same family and weights and remove the external font dependency in the same change.

## 3. Glass material

Preferred glass recipe:

- Very dark translucent background.
- Thin neutral white border around `rgba(255,255,255,.09-.14)`.
- Backdrop blur generally between 14px and 28px depending on component size.
- Saturation may be used carefully to retain depth behind hero surfaces.
- External shadow may be used for separation from the black page.
- No internal shelf/highlight pseudo-element on cards or nav buttons.
- No coloured border or glow unless a specific component has been explicitly approved.

Repeated cards should use less blur than large hero surfaces. Backdrop filters are relatively expensive, especially on mobile.

## 4. Component hierarchy

### Navigation

- Sticky black liquid-glass shell.
- Individual black liquid-glass buttons.
- No chevrons/downward arrows.
- Manrope 700.
- Minimum interactive height: 44px.
- Desktop navigation is shown only when there is enough room; tablet/mobile uses the menu control rather than horizontally squeezing the approved desktop layout.

### Hero

- Large black glass container.
- Homepage liquid-wave video is an approved exception to the otherwise restrained media policy.
- Heading is the dominant visual element.
- Support-status panel remains functional and uses Europe/London time.
- Status colour may use green/red because it communicates state rather than decoration.

### Content cards

- Prefer two-column grids on desktop where the content suits it.
- Collapse to one column before content becomes cramped.
- Use consistent outer radius and spacing.
- No decorative filler solely to occupy space.

### Footer

- Four-part desktop layout: brand panel plus Staple IT, Support and Legal groups.
- Legal/company strip spans the width underneath.
- Black monochrome glass only.
- Logo retains its original brand colours.

## 5. Responsive baseline

Design mobile-first in behaviour even where desktop is built first.

Target checks for every completed page:

| Class | Reference viewport | Expected behaviour |
|---|---:|---|
| Small phone | 360 x 800 | Single-column content, readable heading scale, no horizontal overflow |
| Large phone | 430 x 932 | Single-column content, comfortable card padding |
| Small tablet | 768 x 1024 | Mobile/tablet navigation, stacked hero/status where needed |
| Large tablet | 1024 x 1366 | Layout may use desktop content grids but must not squeeze navigation |
| Laptop | 1366 x 768 | Full desktop navigation and primary content layout |
| Desktop | 1920 x 1080 | Page remains centred; content does not stretch indefinitely |

Current breakpoint principles:

- Navigation changes to the menu layout at 920px and below.
- Homepage hero/content cards stack at 980px and below.
- Footer progressively collapses from desktop columns to two columns and then one column.

Never solve responsive problems with horizontal page scrolling.

## 6. Accessibility baseline

Every page must retain:

- Semantic `main`, `nav`, `header` and `footer` regions.
- A working skip-to-content link.
- Visible keyboard focus states.
- 44px minimum interactive targets where practical.
- Meaningful alt text for informative images; decorative media should be hidden from assistive technology.
- Sufficient contrast against the black/glass backgrounds.
- Logical heading order.

Do not rely on colour alone to communicate information.

## 7. Performance baseline

The site should remain lightweight and dependency-free unless there is a compelling reason otherwise.

Rules:

- No framework for static content that plain HTML/CSS/JS can handle.
- Self-host core media and site assets.
- Manrope via Google Fonts is the current approved external font dependency; do not add additional font services or families.
- Prefer vendoring Manrope into `site/assets/fonts/` once the binary can be imported cleanly, then remove the external dependency.
- Do not add external runtime libraries casually.
- Avoid duplicate image/video assets.
- Use `preload` only for genuinely critical resources.
- Use `loading="lazy"` for below-the-fold images when imagery is added later.
- Keep hero video exceptional rather than repeating video backgrounds throughout the site.
- Prefer CSS glass over JavaScript/WebGL glass.
- LiquidGL or similar effects are opt-in only and must be explicitly requested.
- Keep repeated backdrop-filter surfaces modest, especially on phones/tablets.

Suggested working budgets before production optimisation:

- Individual normal image: aim below 250 KB where visually acceptable.
- Decorative hero video: aim below 2.5 MB and avoid adding multiple autoplay videos to a page.
- Page-specific CSS: normally well below 50 KB uncompressed.
- Page-specific JavaScript: normally well below 30 KB uncompressed.
- Third-party runtime JavaScript: zero by default.

## 8. Security baseline

This is currently a static site, which gives us a strong starting position.

Rules:

- No inline JavaScript unless there is a documented reason.
- Avoid third-party scripts and trackers by default.
- Never commit API keys, credentials, connection strings or tokens.
- Keep forms and future server-side integrations separate from static presentation code.
- Validate and encode any future user-supplied content at the server boundary.
- Keep `.well-known/security.txt` current.
- Use HTTPS only in production.

Recommended production response headers while Manrope is delivered through Google Fonts:

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; media-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com; script-src 'self'; connect-src 'self'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

When Manrope is self-hosted, return `font-src` and `style-src` to `'self'` only. Deployment-specific headers should be configured at the hosting/CDN layer rather than copied into HTML meta tags where possible.

## 9. Page build template

Before editing a route:

1. Pull the current working branch.
2. Inspect the route's original scrape/visible text under `reference/`.
3. Decide which original content is required on the rebuilt page.
4. Reuse the approved nav/footer and shared tokens.
5. Add only the page-specific CSS needed for the page.
6. Test desktop, tablet and mobile layouts.
7. Check keyboard navigation and interaction timing.
8. Check that no unused media/dependency was introduced.
9. Keep the diff scoped to the page being rebuilt.

A normal page should follow this structure:

```html
<header><!-- approved global navigation --></header>
<main id="main">
  <section class="page-hero"><!-- page-specific hero --></section>
  <section class="section"><!-- content --></section>
</main>
<footer><!-- approved global footer --></footer>
```

Shared styling belongs in the shared CSS files only when it is genuinely shared. Page-specific styling should not be pushed into global files simply to avoid creating a small page stylesheet.

## 10. Things we deliberately do not do

- Do not redesign the approved navigation casually.
- Do not use arrows/chevrons in the nav unless explicitly requested.
- Do not colour-code nav buttons.
- Do not add glow for the sake of glow.
- Do not add LiquidGL/WebGL by default.
- Do not reintroduce old assets merely because they exist in repository history.
- Do not replace source-of-truth copy with generic AI marketing language.
- Do not over-engineer static pages.

If a future change conflicts with this document because the design direction has explicitly changed, update this document in the same change so the repository remains truthful.
