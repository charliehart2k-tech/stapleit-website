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

- the hero uses the approved blue liquid-wave video and blue hero copy;
- the four-card service grid uses Support Green, Solutions Orange, Consultancy Yellow and Security Purple to identify each service;
- the three `Who do we support?` audience cards use a very soft palette glow behind otherwise neutral black glass;
- the audit uses a contained, continuous organic orange liquid field;
- the Trust heading may use the approved moving Staple palette treatment.

These are deliberate exceptions, not permission to spread colour effects across unrelated components.

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

## 3. Typography and editorial conformity

Use **Manrope throughout**, and only the loaded weights:

- 400 — body copy;
- 600 — labels, controls and supporting emphasis;
- 700 — navigation and headings.

Do not use synthetic intermediate weights such as 500 or 650. Do not introduce a second font family without an explicit design decision.

Canonical type tokens live in `site/assets/css/tokens.css`:

- `--type-small` — small UI/supporting labels;
- `--type-ui` — buttons, navigation and compact interface text;
- `--type-body` — normal paragraph copy;
- `--type-lead` — supporting chapter/hero copy;
- `--type-card` — card headings;
- `--type-section` — major chapter headings;
- `--type-hero` — page-level hero headings.

Editorial rules:

- write in UK English;
- descriptive headings use sentence case unless a proper service/product name requires capitals;
- service names are `IT Support`, `IT Solutions`, `IT Consultancy`, `Cyber Security` and `AI Integrations`;
- use `Microsoft 365`, `Wi-Fi`, `OneDrive` and other product names consistently;
- body copy should normally stay within `--copy-max` (44rem / roughly 65–75 characters per line);
- headings use tight negative tracking and short, balanced line lengths;
- body copy must remain comfortably readable; never make text tiny simply to force a layout to fit;
- prices and recurring terms must use one wording within a page. The homepage uses `From £35 per staff member, per month`.

Current staging loads Manrope through a direct Google Fonts stylesheet link, not a CSS `@import`. Production may self-host it later if zero third-party font delivery is preferred.

## 4. Spacing and radius rhythm

Shared spacing tokens are the default rhythm:

- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px
- `--space-7`: 64px
- `--space-8`: 96px
- `--space-9`: 128px

Prefer these values over arbitrary one-off gaps. Component-specific spacing is allowed when composition genuinely needs it, but adjacent chapters should still feel like one site.

Canonical radii remain `--radius-md`, `--radius-lg`, `--radius-xl` and `--radius-xxl`. Mobile components may step down one radius tier rather than becoming square.

## 5. Glass material

Default glass recipe:

- very dark translucent background;
- neutral white border around `rgba(255,255,255,.09-.14)`;
- backdrop blur generally 14–28px depending on component size;
- careful saturation where needed to preserve depth;
- external shadow for separation from black;
- no internal shelf/highlight pseudo-element;
- no coloured border/glow unless a component has explicitly earned it.

Repeated cards should generally use less blur than major hero surfaces. Backdrop filters are relatively expensive, particularly on mobile/tablet hardware.

## 6. Component hierarchy

### Navigation

- Sticky black liquid-glass shell.
- Individual neutral liquid-glass buttons.
- No visible chevrons/down arrows.
- Manrope 700.
- Minimum interactive height: 44px.
- Desktop-to-menu breakpoint: 1080px.
- Mobile/tablet menu uses a compact grid with an expandable IT Services group, not one long stack of links.
- Client Portal is a normal primary navigation item.

### Homepage hero

- Large black glass surface with the approved liquid-wave video.
- Heading remains the dominant visual element.
- Blue supporting statement is approved here.
- Support availability panel uses Europe/London time.
- Green/red status colour communicates open/closed state.

### Homepage service grid

- The four core service propositions are displayed simultaneously as four matching black glass cards.
- Desktop and tablet order is IT Support / IT Solutions, then IT Consultancy / Cyber Security in a two-by-two grid.
- Each card keeps the proven service-card content pattern: heading, short explanation, three scannable service points and CTA.
- The service name, bullet markers and CTA treatment use the service's canonical accent colour.
- There is no timer, wheel control, indicator control or carousel state; each service remains directly visible and directly reachable.
- Phone layouts stack the four cards vertically while preserving the same order and content hierarchy.

### Audience cards

- Three matching neutral black glass cards.
- Desktop order: Charities / Small & medium-sized businesses / Sole traders & freelancers.
- Approved external glows: purple for charities, green for businesses, orange for sole traders/freelancers.
- No small metadata/footer line underneath the main paragraph.

### Trust

- Desktop may use the sticky editorial heading plus proof rows.
- Mobile uses readable vertical proof cards; do not force a clipped sideways strip.
- Colour remains contained and must never clip heading glyphs.

### Footer

- Brand panel plus Staple IT, Support and Legal groups on desktop.
- Legal/company strip spans underneath.
- Black monochrome glass only.
- Logo retains original brand colours.
- Mobile remains compact and may retain two columns where the links fit comfortably.

## 7. Motion language

Motion must add depth, hierarchy, feedback or continuity. It should never make the interface feel like a demo reel.

Approved patterns:

- short hover/press feedback on buttons and cards;
- light staggered viewport entrance for the four homepage service cards;
- viewport-triggered entrance reveal for major homepage chapters;
- same-origin View Transition for route changes where supported;
- continuous, spatially contained liquid movement in the audit.

Avoid scroll-jacking, large parallax systems, custom cursors, constant mouse-follow effects, or animation that delays reading. Every reveal must fail open if JavaScript/observer support is unavailable. Respect `prefers-reduced-motion`.

## 8. Responsive baseline

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
- homepage service cards remain a two-column grid down to 700px, then stack to one column;
- trust sticky/two-column composition collapses for touch/tablet layouts;
- global page gutters reduce below 700px;
- footer progressively collapses while preserving useful horizontal grouping.

Never solve responsive problems with horizontal page scrolling or artificial text downsizing.

## 9. Accessibility baseline

Every page must retain semantic `main`, `nav`, `header` and `footer` regions, a working skip link, visible focus states, 44px touch targets, useful alt text, logical headings and accessible labels. Decorative media is hidden from assistive technology. Do not rely on colour alone to communicate information.

## 10. Performance baseline

- no framework for static content that HTML/CSS/small JS can handle;
- no casual external runtime libraries;
- avoid duplicate image/video assets;
- load fonts with direct stylesheet links rather than CSS `@import` chains;
- preload only genuinely critical resources;
- lazy-load below-the-fold imagery/iframes where appropriate;
- keep hero video exceptional;
- prefer CSS glass over JavaScript/WebGL glass;
- keep repeated backdrop-filter surfaces modest on mobile/tablet;
- run `tools/audit-site.py` at milestones and before every deployment.

Working budgets:

- normal image: aim below 250 KB where visually acceptable;
- decorative hero video: aim below 2.5 MB;
- page-specific CSS: normally well below 50 KB uncompressed;
- page-specific JS: normally well below 30 KB uncompressed;
- third-party runtime JavaScript: zero by default.

The current hero video is an approved large-asset exception and is expected to appear as a warning in the audit.

## 11. Security baseline

- no executable inline JavaScript without a documented reason; JSON-LD is inert structured data and is allowed;
- avoid third-party scripts/trackers by default;
- never commit keys, credentials, connection strings or tokens;
- validate untrusted input at the server boundary;
- keep `.well-known/security.txt` current;
- HTTPS only in production.

Recommended production headers while Google Fonts and the approved Google Maps iframe are in use:

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; media-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com; script-src 'self'; connect-src 'self'; frame-src https://www.google.com
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Deployment headers belong at the hosting/CDN layer rather than HTML meta tags where possible.

## 12. Page build template

Before editing a route:

1. pull the current working branch;
2. inspect the route’s original scrape/visible text under `reference/`;
3. decide which original content is required;
4. reuse the approved nav/footer/tokens;
5. add only the page-specific CSS/JS needed;
6. test all six reference viewports;
7. check keyboard navigation and interaction timing;
8. run the static-site audit;
9. complete the relevant SEO/AEO/ASEO/schema work;
10. keep the diff scoped to the route/section being rebuilt.

Unfinished routes must contain a truthful visible placeholder and remain `noindex,nofollow`; never leave an empty `<main>`.

## 13. Things we deliberately do not do

- casually redesign approved navigation/homepage reference components;
- colour-code navigation buttons;
- add glow for the sake of glow;
- add LiquidGL/WebGL by default;
- reintroduce old assets merely because they exist in repository history;
- replace source-of-truth copy with generic AI marketing language;
- create keyword doorway pages or fake review/schema content;
- over-engineer static pages;
- leave dead experiments/aliases/selectors in the active build after a direction is abandoned.

If the design direction explicitly changes, update this document in the same change so the repository stays truthful.
