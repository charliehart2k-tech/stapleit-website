# Design system

Staple IT uses a solid-black foundation, deep glossy black glass, local colour reflections and restrained Aero-style movement. Raleway is the display family; Roboto is used for body and UI copy.

## Current page scope

The public build is intentionally page-by-page. Only these content routes are active:

- Homepage — `/`
- IT Support — `/it-services/it-support/`

Other site pages are removed from `site/` until they are designed and reviewed individually. Source snapshots remain under `reference/` for later rebuilds.

## Navigation

The desktop navigation is one continuous liquid surface. The optical material comes from the pinned liquidGL renderer, not from CSS blur/gradient imitation. `nav.css` is limited to layout, interaction and a plain black fallback.

The brand is not wrapped in a second glass pill. It is one mark + wordmark sitting directly on the liquid navigation surface.

## IT accent rule

The letters `IT` are treated as a deliberate visual signature:

- `Staple.IT` — Staple blue.
- IT Support — support green.
- IT Solutions — orange when referenced on the Homepage.
- IT Consultancy — yellow when referenced on the Homepage.
- Other section-specific IT labels inherit that section's accent where appropriate.

The accent is applied to the letters themselves rather than washing entire cards in colour.

## Black glossy material

Major panels use near-black transparency, sharp white edge reflections, deep inset shadow and small local colour caustics. Repeated cards stay lighter-weight than hero surfaces. Large flat grey or blue panel fills are not part of the design language.

The Homepage status card remains CSS-only by design; it uses reflected liquid imagery but is not a liquidGL target.
