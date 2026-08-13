# liquidGL integration

Staple IT uses the pinned, self-hosted liquid-gl v2.0.1 vendor.

## Runtime architecture

liquidGL 2.0.1 creates one shared renderer/canvas per page. The first initialisation owns the renderer snapshot and resolution; later lenses are added to that same renderer. Because of that architecture, Staple IT deliberately uses one shared page-level snapshot (`body`) for every liquid surface on a page.

The enhancement script now discovers all valid `.js-liquid-surface` elements instead of using a hardcoded first-match priority list. It initialises up to three visible surfaces per page against the shared renderer.

Current targets:

- Homepage — full navigation liquid surface plus Free IT Audit lens.
- IT Support — full navigation liquid surface plus secondary hero CTA lens.

The Homepage status panel is intentionally CSS-only.

## Navigation

The navigation itself is now a real liquidGL target. CSS provides only layout and a plain black fallback; the refraction, bevel and specular treatment is rendered by liquidGL over the animated local liquid backdrop.

## Fallbacks

Add `?liquid=off` to disable liquidGL for comparison. Reduced-motion preferences, lack of WebGL or an initialisation error leave the usable black fallback in place. Navigation links and page content remain normal DOM elements above the optical surface.

## Vendor

`site/assets/js/vendor/liquidGL-2.0.1.js`

Pinned SHA-256:

`11a286f4251811e767cd6c4901e7aae76b37c561ddb884aa2b2b5ad37579316a`

There is no CDN fallback.
