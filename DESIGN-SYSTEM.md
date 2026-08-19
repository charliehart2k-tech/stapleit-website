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

- the hero uses the approved liquid-wave video behind white heading/supporting copy, with the blue primary CTA retained as the principal action;
- the four-card service grid uses Support Green, Solutions Orange, Consultancy Yellow and Security Purple to identify each service, with the approved matching bloom/sheeen hover treatment;
- the `you` accent in the service chapter heading uses the same passing Staple-colour shimmer as the `you` accent in the final contact heading;
- the `support` word in `Who do we support?` uses canonical Support Green;
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
- headings use restrained negative tracking and short, balanced line lengths; large display headings should normally stay around `-.025em` or looser and card headings around `-.015em` or looser unless an explicitly approved treatment requires otherwise;
- body copy, navigation and utility text use neutral tracking by default rather than compressed spacing;
- line boxes must preserve ascenders and descenders and multi-line headings must not look vertically bunched;
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

The homepage deliberately uses more generous vertical breathing room between major chapters than the component-level spacing tokens alone. Each section should read as a distinct chapter rather than one continuous stacked strip, with that separation reduced proportionally on tablet and phone rather than removed.

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
- Heading remains the dominant visual element and stays white.
- Supporting hero copy stays white for clarity over the moving background.
- Support availability panel uses Europe/London time.
- Green/red status colour communicates open/closed state.
- When open, the telephone number is presented as the prominent green call action with a white outline telephone icon.

### IT Support hero

- Uses the same large rounded proportions as the homepage hero and settles as pure translucent black glass after its opening SVG text-mask transition.
- The automated opening mask shows `Unlimited IT Support` at large scale in a restrained blue-to-purple moving gradient, then scales towards the real left-column heading while the semantic hero content fades into place.
- The intro uses no video, third-party runtime or scroll-jacking, runs once on page load and is skipped for reduced motion. Without JavaScript, the normal hero remains fully visible.
- Primary copy is `Unlimited IT Support` with `Unlimited` on its own line and `IT Support` directly beneath it.
- `Unlimited` keeps the approved restrained blue-to-purple moving-highlight treatment after the intro completes.
- Pricing sits immediately beneath as `from £35 per staff member, per month`, with `£35` in Signal Red.
- The CTA is centred beneath the left-column proposition and links to the onboarding chapter.
- The support-summary card starts directly with `Core support cover`; small pre-heading labels are deliberately omitted.
- The route remains `noindex,nofollow` while it is under construction.

### IT Support chapters

- The managed-support feature chapter uses six matching black-glass cards in a three-by-two desktop grid, collapsing to two columns on tablet and one column on phone.
- Feature and onboarding cards use Support Green as their interaction accent, including the same soft bloom, travelling sheen and small lift language as the approved homepage cards.
- The onboarding chapter presents `01`, `02`, `03` in order as three matching step cards. It becomes a single vertical sequence below the tablet breakpoint.
- Small pre-heading/kicker labels and repetitive closing straplines are omitted so the chapters read cleanly and directly.
- Desktop card typography is vertically aligned: feature headings reserve a common heading row, onboarding titles reserve a common title row, and package badges do not push package titles or prices out of alignment.
- IT Support packages always read left-to-right as `Basic`, `Standard`, `Premium` on desktop and in that same order when stacked.
- Package pricing uses the same `per staff member, per month` wording as the IT Support hero.
- Package tier accents are deliberate UI semantics: `Basic` uses `--tier-basic` red, `Standard` uses `--tier-standard` blue and `Premium` uses `--tier-premium` purple. The glass material remains predominantly black.
- `Standard` is explicitly marked `Most popular`; the badge and blue treatment reinforce the tier but popularity must never be communicated by colour alone.
- Every IT Support card, including the hero summary, uses the shared one-time opacity/vertical reveal and homepage-equivalent hover bloom/sheen interaction. Reduced motion and no-IntersectionObserver paths remain fully readable.
- Cross-document page transitions are inherited from the same shared `base.css` View Transition treatment used by the homepage.

### Homepage service grid

- The chapter is introduced by `What can we do for you...`, with `you` using the same passing Staple-colour shimmer as the final contact heading and supporting copy aligned to the right on desktop.
- The four core service propositions are displayed simultaneously as four matching black glass cards.
- Desktop and tablet order is IT Support / IT Solutions, then IT Consultancy / Cyber Security in a two-by-two grid.
- Each card keeps the proven service-card content pattern: heading, short explanation, three scannable service points and CTA.
- `IT Support` uses the same two-line heading rhythm as the other cards: `We do IT` on the first line and `Support` on the second.
- The service name, bullet markers, CTA treatment and restrained external glow use the service's canonical accent colour.
- The cards use the same approved bloom, sheen, lift and external-glow interaction language as the audience cards, using the relevant service colour.
- There is no timer, wheel control, indicator control, horizontal scroll-snap or carousel state; each service remains directly visible and directly reachable.
- Phone layouts stack the four cards vertically while preserving the same order and content hierarchy.

### Audience cards

- The chapter heading is `Who do we support?`; `support` is canonical Support Green (`#22C55E`).
- Three matching neutral black glass cards.
- Desktop order: Charities / Small & medium-sized businesses / Sole traders & freelancers.
- Approved external glows: purple for charities, green for businesses, orange for sole traders/freelancers.
- Hover/focus uses the approved soft bloom, travelling sheen and small lift without turning the card border into a solid service colour.
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
- service and audience cards use the approved colour bloom/sheen interaction on hover or keyboard focus;
- viewport entrance reveals use only opacity and a small vertical transform so scrolling stays smooth and text is never blurred while moving;
- each reveal runs once and releases `will-change` after entrance; no permanent compositor promotion for ordinary content;
- same-origin View Transition for route changes where supported;
- continuous, spatially contained liquid movement in the audit;
- anchor navigation uses native smooth scrolling with sticky-header offset, and automatically falls back to instant scrolling when reduced motion is requested;
- the hero video pauses while the document is hidden and when reduced motion is requested.

Avoid scroll-jacking, large parallax systems, custom cursors, constant mouse-follow effects, blur/filter-heavy scroll reveals, or animation that delays reading. Every reveal must fail open if JavaScript/observer support is unavailable. Respect `prefers-reduced-motion`.

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

Meaningful enhancement content should exist in semantic markup rather than being created only by JavaScript where practical. The homepage Google rating and form honeypot follow this rule; JavaScript enhances behaviour rather than supplying required presentation markup.

## 10. Performance baseline

- no framework for static content that HTML/CSS/small JS can handle;
- no casual external runtime libraries;
- avoid duplicate image/video assets;
- load fonts with direct stylesheet links rather than CSS `@import` chains;
- preload only genuinely critical resources;
- lazy-load below-the-fold imagery/iframes where appropriate;
- keep hero video exceptional and pause it when the tab is hidden or reduced motion is requested;
- prefer CSS glass over JavaScript/WebGL glass;
- keep repeated backdrop-filter surfaces modest on mobile/tablet;
- avoid permanent `will-change` on ordinary cards/content;
- run `tools/audit-site.py` at milestones and before every deployment.

Working budgets:

- normal image: aim below 250 KB where visually acceptable;
- decorative hero video: aim below 2.5 MB;
- page-specific CSS: normally well below 50 KB uncompressed;
- page-specific JS: normally well below 30 KB uncompressed;
- third-party runtime JavaScript: zero by default.

The static audit warns when individual CSS/JS files exceed these working budgets. The current hero video is an approved large-asset exception and is expected to appear as a warning in the audit.

## 11. Security baseline

- no executable inline JavaScript without a documented reason; JSON-LD is inert structured data and is allowed;
- no runtime injection/mutation of inline styles; keep presentation in external stylesheets so the CSP contract remains clean;
- no `eval()` or `new Function()` dynamic code execution;
- avoid third-party scripts/trackers by default;
- never commit keys, credentials, connection strings or tokens;
- validate untrusted input at the server boundary;
- keep anti-bot fields in semantic markup and validate them server-side;
- keep `.well-known/security.txt` current;
- HTTPS only in production.

The static release audit enforces the no-runtime-inline-style and no-dynamic-code rules for site JavaScript.

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
- leave dead experiments/aliases/selectors in the active build after a direction has changed.

If the design direction explicitly changes, update this document in the same change so the repository stays truthful.
