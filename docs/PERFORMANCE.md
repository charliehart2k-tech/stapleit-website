# Performance

- Real backdrop blur is reserved for major surfaces.
- Repeated cards use translucent gradients and borders rather than repeated blur.
- liquidGL is default-off, homepage-only and audit-only.
- liquidGL snapshots only `#audit-liquid-stage`, never `body`.
- The audit lens uses `specular:false` and no tilt.
- The vendor module is imported only after an explicit `?liquid=audit` opt-in.
- Local WOFF2 fonts are used and first-view fonts are preloaded.
- Brand and support-tier content images are WebP; favicon/touch icons remain PNG.
- Production asset minification is parser/token-aware and offline. CSS is parsed
  with a vendored tinycss2 dependency; JavaScript is lexically minified without
  regex-stripping source code. The pinned liquidGL vendor is never rewritten.
- `dist/` is always deleted and rebuilt from `site/`, so stale build artefacts
  cannot survive a production build.
