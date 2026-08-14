# Staple IT Brand Palette

This file is the canonical colour reference for the Staple IT website rebuild.

## Primary colours

| Name | Hex | Intended use |
|---|---|---|
| Royal Blue | `#1D4ED8` | Logo mark and `.IT` |
| Signal Red | `#E62B2B` | Accent dot and sparing high-energy emphasis |
| Near Black | `#111111` | `Staple` wordmark |

## Supporting colours

| Name | Hex | Intended use |
|---|---|---|
| White | `#FFFFFF` | Backgrounds and sections |
| Pale Blue | `#D0D9F0` | Subtle section tints |
| Off White | `#F5F6FA` | Card backgrounds |

## Sub-brand colours

| Name | Hex | Intended use |
|---|---|---|
| Support Green | `#22C55E` | Staple.Support |
| Solutions Orange | `#F97316` | Staple.Solutions |
| Consultancy Yellow | `#EAB308` | Staple.Consultancy |
| Security Purple | `#A855F7` | Staple.Security |

## Brand usage rules

- The brand should feel bold, modern and confident.
- Use heavy sans-serif typography and strong geometric forms.
- Royal Blue is the dominant brand colour.
- Signal Red is a sparing, high-energy accent rather than a general-purpose glow.
- Sub-brand colours belong exclusively to their respective service areas and should not be mixed into the primary brand treatment.
- Keep layouts clean and direct rather than soft or conventionally corporate.

## Dark-site adaptation

The active website intentionally uses a black liquid-glass interface. That approved website treatment does not replace the canonical palette above.

- `#000000` remains the approved page background for the dark website.
- `#111111` is retained as the canonical Near Black brand colour and may be used where the formal palette requires it.
- The existing brighter hero/UI blue `#4F85FF` is an approved website highlight derived from the current hero treatment, but it is not a replacement for canonical Royal Blue `#1D4ED8`.
- Brand accents should use the semantic CSS tokens in `site/assets/css/tokens.css` instead of repeating hex values in component styles.

If the supplied brand palette changes, update this file and the matching CSS tokens in the same change.
