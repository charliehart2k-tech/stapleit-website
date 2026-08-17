# Staple IT Asset Standards

This document governs logos, images, video and other front-end media.

The objective is to preserve supplied artwork faithfully while keeping the site performant, accessible and robust.

## 1. Source asset rule

A supplied asset is the source of truth unless the user explicitly asks for it to be changed.

If the user supplies a PNG:

- keep it as PNG by default;
- preserve transparency/alpha;
- do not bake a black/white card background into the bitmap;
- do not convert it to WebP/JPEG merely for convenience;
- do not recolour, crop, distort or redraw it without approval.

Conversion is allowed only when there is a specific benefit and the converted result has been visually and technically validated.

## 2. Meaningful logos use semantic markup

Partner/vendor/customer logos are meaningful content and use `<img>` elements.

Preferred pattern:

```html
<div class="partner-tile" role="listitem">
  <img
    src="assets/media/partners/example.png"
    alt="Example partner"
    width="160"
    height="80"
    loading="lazy"
    decoding="async"
  />
</div>
```

Do not:

- hide placeholder text and use CSS `background-image` as the actual logo;
- map meaningful logos by `nth-child`;
- embed partner artwork in pseudo-elements;
- use an opaque bitmap background to fake card integration.

CSS backgrounds are for genuinely decorative imagery only.

## 3. Marquee/conveyor duplication

For a duplicated set used only to create a seamless loop:

- the first visible set carries useful alt text;
- the duplicate group is `aria-hidden="true"`;
- duplicate `<img>` elements use `alt=""`;
- both sets reference the same source files;
- do not create duplicate physical image files merely for the second loop.

## 4. Presentation

- Use `object-fit: contain` for logos.
- Maintain original aspect ratio.
- Centre artwork in a predictable content box.
- Normalise visual size with CSS constraints, not destructive raster cropping.
- Transparent logos should sit directly over the approved glass/card background.
- Do not add per-logo colour glows unless explicitly approved.
- Do not distort a trademark to make cards look visually identical.

## 5. File formats

Default guidance:

- **PNG** — transparent logos, UI artwork requiring alpha, supplied brand assets;
- **WebP** — photographic/opaque web imagery when conversion measurably reduces size and the source remains visually equivalent;
- **JPEG** — photographs where transparency is not needed;
- **SVG** — vector artwork only when sourced/trusted and appropriate for the project;
- **MP4** — approved video assets; autoplay video remains exceptional.

Never change an extension without actually changing the file encoding.

## 6. Naming and location

- lower-case filenames;
- simple hyphenated names;
- no spaces;
- no opaque generated IDs for committed brand assets;
- place page-independent partner artwork under `site/assets/media/partners/`.

Example:

```text
site/assets/media/partners/
  dell.png
  fortinet.png
  hp.png
  huntress.png
  microsoft.png
  ubiquiti.png
```

## 7. Dimensions and layout shift

For local raster images:

- declare intrinsic `width` and `height` where known;
- use CSS `max-width`/`max-height` to scale responsively;
- do not use HTML width/height to deliberately distort aspect ratio;
- lazy-load below-the-fold images.

## 8. Performance

Working target from the design system:

- ordinary image: aim below `250 KB` where visually acceptable;
- hero video: exceptional, target below `2.5 MB`;
- do not duplicate large assets unnecessarily.

Optimisation must not destroy transparency, logo sharpness or correct colour.

## 9. Integrity validation

Every committed PNG/WebP/JPEG/GIF must pass:

```bash
python3 tools/audit-assets.py --root site/assets
```

The asset audit validates:

- extension/signature agreement;
- PNG chunk structure and CRCs;
- WebP RIFF/container sizing;
- JPEG start/end markers;
- GIF header/trailer integrity.

This gate exists specifically to prevent malformed or corrupted raster assets from reaching staging.

Asset integrity checks do **not** replace a visual check. After any conversion or optimisation, inspect the actual rendered result.

## 10. Trademark handling

Third-party partner logos should be treated as supplied trademarks:

- keep proportions;
- keep supplied colours;
- do not apply filters that materially alter the mark;
- do not add wording suggesting a certification/partnership tier that has not been confirmed;
- do not add relationship schema purely because a logo is displayed.

## 11. Approval rule

If an asset requires destructive editing, background removal, recolouring, format conversion or reconstruction, treat that as a separate explicit design decision rather than quietly modifying the file during implementation.
