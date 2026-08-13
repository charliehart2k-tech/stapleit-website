# Design system

Staple IT uses a solid black foundation with highly transparent liquid-glass
surfaces, strong brand accents and restrained Aero-style refraction. Raleway is
the display family; Roboto is used for body and UI copy.

The navigation and hero use CSS glass only. Their highlight/refraction treatment may include restrained CSS specular "peel" layers, but liquidGL is not permitted on the nav, nav pills or hero shells. Interactive nav pills retain a short CSS micro-animation. The homepage hero is video-first: the liquid-wave poster is a loading fallback, not a second composited background.

Repeated cards use lightweight layered transparency rather than WebGL or heavy backdrop blur. The homepage trust section may sit inside one restrained CSS-glass parent plane to vary page rhythm without blurring every card. The Free IT Audit CTA is the only approved liquidGL experiment, and it remains default-off.

Spacing is aligned to the shared `--page` container. Bubbled/glass sections and
plain sections should share the same horizontal boundaries unless a deliberate
full-bleed treatment is documented.

Browser policy is defined in `BROWSER-SUPPORT.md`: latest two stable Chromium
and Firefox releases plus Safari 16+, with no legacy IE support. Decorative
features must progressively enhance rather than gate content or navigation.


## Current navigation treatment

The primary navigation is intentionally near-transparent black glass rather than a grey panel. The glass is created with a low-opacity black fill, backdrop blur/saturation, a restrained static top peel and a subtle gradient edge. Standard pills remain quiet; Remote Support (green) and The Staple Blog (purple) are the two deliberate high-colour anchors. The brand mark sits in a small contained CSS-glass capsule. The nav shell and nav pills are not liquidGL WebGL targets.

