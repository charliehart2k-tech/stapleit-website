# liquidGL integration

Current implementation uses the pinned, self-hosted `liquid-gl` v2.0.1 vendor.

## Design rule

liquidGL is used more generously than the original audit-only proof of concept, but it remains limited to **one small, contained optical surface per page**. The full navigation ribbon, navigation pills and hero shells are never WebGL targets. Those large/persistent surfaces use the lighter CSS glass system instead.

Current liquidGL pages:

- Homepage — Free IT Audit CTA lens (`#audit-liquid-stage`).
- IT Support — secondary hero CTA lens (`#support-liquid-stage`).
- IT Solutions — contained hero-side lens (`#solutions-liquid-stage`).
- IT Consultancy — contained hero-side lens (`#consultancy-liquid-stage`).
- Cybersecurity — contained hero-side lens (`#security-liquid-stage`).
- AI Integrations — contained hero-side lens (`#ai-liquid-stage`).

Each page contains exactly one `.js-liquid-surface` target and declares its local snapshot region with `data-liquid-snapshot`. The target itself is an empty optical layer; readable/clickable content remains a sibling above it.

## Runtime

Contained liquidGL surfaces are enabled by default. Add `?liquid=off` to disable them for comparison. `prefers-reduced-motion: reduce`, lack of WebGL or any initialisation failure produces a silent CSS fallback.

The loader imports only the local vendor file:

`site/assets/js/vendor/liquidGL-2.0.1.js`

Pinned SHA-256:

`11a286f4251811e767cd6c4901e7aae76b37c561ddb884aa2b2b5ad37579316a`

There is no CDN fallback. `specular:false`, `tilt:false` and modest refraction/frost values remain the default for persistent B2B UI.
