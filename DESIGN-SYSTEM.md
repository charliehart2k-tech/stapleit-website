# Staple IT Design System

This is the active visual and engineering reference for the Staple IT website rebuild.

The original website material under `reference/` remains the source of truth for content and information architecture. This document defines how that content is presented in the rebuilt site.

## 1. Approved visual direction

The site is dark, clean, premium and restrained.

- Page background: black.
- Primary material: monochrome black liquid glass.
- Typography: Manrope.
- Navigation and footer remain neutral/monochrome.
- The Staple IT logo retains its original blue/red colours.
- Brand and service colours are accents with a reason, not general decoration.
- One component should read as one pane of glass.
- Do not add an internal glass shelf, nested highlight bubble or inset platform inside a card/control.
- Do not introduce generic RGB/neon/spotlight effects.
- Full-width chapters may break away from boxed sections when the page needs a change of pace.

### Approved homepage exceptions

These are intentional and should not be treated as permission to repeat the effect everywhere:

- the hero uses the approved blue liquid-wave video and blue hero copy;
- the statement card uses Staple Signal Red on `care` and `deliver` plus a restrained glass sweep;
- the service carousel uses Support Green, Solutions Orange, Consultancy Yellow and Security Purple to identify service state;
- the three `Who do we support?` audience cards use a very soft palette glow *behind* otherwise neutral black glass.

The approved navigation, hero, statement/service row and current audience chapter are midpoint reference components. Do not casually redesign them while building later routes.

## 2. Canonical colour use

Canonical values live in `BRAND-PALETTE.md` and `site/assets/css/tokens.css`.

Core:

- Royal Blue: `#1D4ED8`
- Signal Red: `#E62B2B`
- Near Black: `#111111`
- White: `#FFFFFF`

Service accents:

- IT Support: `#22C55E`
- IT Solutions: `#F97316`
- IT Consultancy: `#EAB308`
- Cyber Security: `#A855F7`

Colour rules:

- do not colour-code navigation;
- do not turn generic card borders into service colours;
- prefer colour in text, state indicators or a restrained external glow;
- if colour is removed and the component no longer communicates its meaning, it is probably justified;
- if colour exists only because the page looked empty, remove it.

## 3. Typography

Use **Manrope throughout**.

- 400 — body copy.
- 600 — labels, controls and supporting emphasis.
- 700 — navigation and headings.
- Do not introduce a second font family without an explicit design decision.
- Headings use tight negative tracking and short, balanced line lengths.
- Body copy must remain comfortably readable; never make text tiny simply to force a layout to fit.

Current staging loads Manrope from Google Fonts. Production may move to a self-hosted Manrope webfont if zero third-party asset delivery is required.

## 4. Glass material

Default glass recipe:

- very dark translucent background;
- neutral white border around `rgba(255,255,255,.09-.14)`;
- backdrop blur generally 14–28px depending on component size;
- careful saturation where needed to preserve depth;
- external shadow for separation from black;
- no internal shelf/highlight pseudo-element;
- no coloured border/glow unless a component has explicitly earned it.

Repeated cards should generally use less blur than major hero surfaces. Backdrop filters are relatively expensive, particularly on mobile/tablet hardware.

## 5. Component hierarchy

### Navigation

- Sticky black liquid-glass shell.
- Individual neutral liquid-glass buttons.
- No visible chevrons/down arrows.
- Manrope 700.
- Minimum interactive height: 44px.
- Current desktop-to-menu breakpoint: 1080px.
- Client Portal is a normal primary navigation item.

### Homepage hero

- Large black glass surface with the approved liquid-wave video.
- Heading remains the dominant visual element.
- Blue supporting statement is approved here.
- Support availability panel uses Europe/London time.
- Green/red status colour communicates open/closed state.

### Statement card

- Large editorial statement rather than explanatory body copy.
- `care` and `deliver` use Signal Red.
- Slow specular sweep is approved on this component.

### Service carousel

- One fixed visual card; service states crossfade rather than slide/zoom/blur.
- Automatic rotation interval: 15 seconds.
- Manual indicator controls remain available.
- Active indicator and service accent use the current canonical service colour.
- Content pattern: heading, short explanation, three scannable service points, CTA.

### Audience cards

- Three matching neutral black glass cards.
- Desktop order: Charities / Small & Medium Sized Businesses / Sole traders & Freelancers.
- Small & Medium Sized Businesses deliberately occupies the centre position.
- Card headings reserve consistent vertical rhythm on desktop.
- Approved external glows: purple for charities, green for businesses, orange for sole traders/freelancers.
- No small metadata/footer line underneath the main paragraph.

### Footer

- Brand panel plus Staple IT, Support and Legal groups on desktop.
- Legal/company strip spans underneath.
- Black monochrome glass only.
- Logo retains original brand colours.

## 6. Motion language

Motion must add depth, hierarchy, feedback or continuity. It should never make the interface feel like a demo reel.

Approved patterns:

- short hover/press feedback on buttons and cards;
- clean crossfade between service carousel states;
- slow statement-card glass sweep;
- viewport-triggered entrance reveal for major homepage chapters;
- same-origin View Transition for route changes where supported.

### Audience reveal pattern

`Who do we support?` uses a small `IntersectionObserver` trigger plus CSS transitions:

1. the chapter is prepared in its hidden state;
2. once roughly 15% enters the viewport, the heading fades/settles in;
3. the three cards follow with a small 120ms stagger;
4. the observer disconnects after the first reveal.

This is preferred over fragile continuous scroll calculations for this section.

Avoid:

- scroll-jacking;
- large parallax systems;
- blur/zoom/translate all at once;
- custom cursors;
- constant mouse-follow effects;
- decorative animation with no hierarchy/feedback purpose.

## 7. Responsive baseline

Design mobile-first in behaviour even where desktop is built first.

Reference checks for every completed route:

| Class | Reference viewport | Expected behaviour |
|---|---:|---|
| Small phone | 360 x 800 | Single-column content, readable heading scale, no horizontal overflow |
| Large phone | 430 x 932 | Single-column content, comfortable card padding |
| Small tablet | 768 x 1024 | Menu navigation; stacked hero/content where needed |
| Large tablet | 1024 x 1366 | Menu navigation; grids only where comfortable |
| Laptop | 1366 x 768 | Full navigation and primary desktop layout |
| Desktop | 1920 x 1080 | Centred content; no uncontrolled stretching |

Current breakpoints:

- navigation changes to menu at 1080px and below;
- homepage hero/content row stacks at 980px and below;
- audience cards stack at 980px and below;
- footer progressively collapses to two columns then one.

Never solve responsive problems with horizontal page scrolling.

## 8. Accessibility baseline

Every page must retain:

- semantic `main`, `nav`, `header` and `footer` regions;
- working skip-to-content link;
- visible keyboard focus states;
- sensible 44px interactive targets;
- meaningful alt text for informative imagery;
- decorative media hidden from assistive technology;
- sufficient text contrast;
- logical heading order;
- controls with useful accessible labels.

Do not rely on colour alone to communicate information.

## 9. Performance baseline

The site should remain lightweight and dependency-light.

Rules:

- no framework for static content that HTML/CSS/small JS can handle;
- no casual external runtime libraries;
- avoid duplicate image/video assets;
- preload only genuinely critical resources;
- lazy-load future below-the-fold imagery;
- keep hero video exceptional;
- prefer CSS glass over JavaScript/WebGL glass;
- keep repeated backdrop-filter surfaces modest on mobile/tablet;
- run `tools/audit-site.py` at milestones and before release.

Working budgets:

- normal image: aim below 250 KB where visually acceptable;
- decorative hero video: aim below 2.5 MB;
- page-specific CSS: normally well below 50 KB uncompressed;
- page-specific JS: normally well below 30 KB uncompressed;
- third-party runtime JavaScript: zero by default.

The current hero video is an approved large-asset exception and is expected to appear as a warning in the audit.

## 10. Security baseline

The current static architecture gives us a strong default position.

Rules:

- no inline JavaScript without a documented reason;
- avoid third-party scripts/trackers by default;
- never commit keys, credentials, connection strings or tokens;
- keep forms/server integrations separate from static presentation code;
- validate untrusted input at the server boundary;
- keep `.well-known/security.txt` current;
- HTTPS only in production.

Recommended production headers while Google Fonts is in use:

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; media-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com; script-src 'self'; connect-src 'self'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

The local staging server mirrors the CSP, `nosniff`, referrer and permissions baseline so problems surface during development. It intentionally does not send HSTS because staging uses local HTTP.

Deployment headers belong at the hosting/CDN layer rather than being copied into HTML meta tags where possible.

## 11. Page build template

Before editing a route:

1. pull the current working branch;
2. inspect the route's original scrape/visible text under `reference/`;
3. decide which original content is required;
4. reuse the approved nav/footer/tokens;
5. add only the page-specific CSS/JS needed;
6. test desktop, tablet and mobile;
7. check keyboard navigation and interaction timing;
8. run the static-site audit;
9. complete the relevant SEO/AEO/schema work;
10. keep the diff scoped to the route/section being rebuilt.

Normal route structure:

```html
<header><!-- approved global navigation --></header>
<main id="main">
  <section class="page-hero"><!-- page-specific hero --></section>
  <section class="section"><!-- content --></section>
</main>
<footer><!-- approved global footer --></footer>
```

Shared styling belongs in shared files only when it is genuinely shared. Page-specific CSS should not be pushed into global files simply to avoid creating a small stylesheet.

## 12. Things we deliberately do not do

- casually redesign approved navigation/homepage reference components;
- colour-code navigation buttons;
- add glow for the sake of glow;
- add LiquidGL/WebGL by default;
- reintroduce old assets merely because they exist in repository history;
- replace source-of-truth copy with generic AI marketing language;
- over-engineer static pages;
- leave dead experiments/aliases/selectors in the active build after a direction is abandoned.

If the design direction explicitly changes, update this document in the same change so the repository stays truthful.
