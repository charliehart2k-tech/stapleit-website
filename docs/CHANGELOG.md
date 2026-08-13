# Changelog

## 2026-08-13 — Black Gloss Design Pass

- Shifted the visual system toward deep black, glossy glass rather than grey/blue filled cards.
- Strengthened nav gloss, transparency, edge highlights and colour pop for Remote Support / The Staple Blog.
- Added contained liquidGL surfaces to the brand capsule and homepage status/audit treatments.
- Updated liquidGL initialisation to support multiple independent, snapshot-scoped surfaces while keeping CSS glass as fallback.
- Retained the five completed IT Services routes and carried the black-gloss material across them.


## 2026-08-13 — Design Drop 02 / staging reliability fix

- Fixed the PowerShell one-word command crash (`System.Char` / `ToLowerInvariant`) by forcing tokenized input to remain an array and parsing commands inside the per-command error boundary.
- Added a visible build identifier plus `version`, `solutions`, `consultancy`, `security`, and `ai` staging commands.
- Dev staging now sends no-cache headers for CSS, JavaScript and media so a freshly extracted framework cannot silently display stale design assets.
- Homepage hero is now video-only: no static liquid-wave background and no video poster layer.
- Navigation moved to near-transparent black glass with a stronger restrained top peel; Remote Support and The Staple Blog remain the deliberate colour anchors.
- Top-left Staple.IT mark keeps its own small glass capsule and subtle blue/purple refractive edge.
- Reduced generic bubble/highlight intensity and tightened the About Staple alignment.
- Retained the built V1 pages for IT Support, IT Solutions, IT Consultancy, Cybersecurity and AI Integrations, with contained liquidGL surfaces only.
- Packaged under a unique `stapleit-framework-current` root to prevent accidental merge/extraction over an older framework.

## 2026-08-13 — homepage visual refinement

- Made the homepage hero video-first by removing the separate CSS poster background; the poster remains only as the video loading fallback.
- Added a restrained CSS liquid-glass peel to the hero and navigation shell without adding new liquidGL/WebGL targets.
- Replaced text-glyph dropdown arrows with CSS chevrons and added a cleaner open-state rotation.
- Reworked the About Staple / Who We Support row so both panels align from the top and the introduction no longer has a large internal dead gap.
- Reduced the strongest decorative highlights in the introduction/audience glass and slightly improved supporting-text contrast.
- Added one subtle liquid-glass plane around the Why Choose & Trust Us section while keeping its repeated cards lightweight.
- Removed the standalone Staple IT liquid-logo interlude after the partners section.
- Corrected the footer wordmark dimensions and forced its natural aspect ratio.
- Kept liquidGL itself audit-only and default-off.

## 2026-08-13 — framework hardening and deployment readiness

- Removed the confidential MSA and the 32 MB source-scrape archive from the
  working project.
- Initialised Git, added a baseline commit and added a real `.gitignore`.
- Generalised the Doctor acceptance gate beyond liquidGL.
- Added custom `site/404.html` and local-dev 404 handling.
- Added an explicit browser support policy.
- Added canonical, Open Graph and Twitter metadata to site pages; placeholders
  are marked `noindex` until their content is rebuilt.
- Added homepage `ProfessionalService` JSON-LD.
- Production builds now generate `robots.txt` and `sitemap.xml`.
- Replaced the old regex/whitespace pseudo-minification with an offline
  token/parser-aware asset minifier and removed the hand-built CSS bundle step.
- Converted the deployable brand logo and support-tier artwork to WebP.
- Added `.well-known/security.txt`.
- Replaced the flat header list with real nginx `add_header` directives and an
  example nginx server block.
- Added timestamped-release/current-symlink deployment and rollback guidance.
- Added a post-deploy PowerShell smoke-test script.
- Preserved liquidGL as a self-hosted, default-off, audit-only experiment.
- Consolidated current documentation without adding version-suffixed copies.
## 2026-08-13 — Homepage nav polish + first IT Services dropdown V1

- Reworked the navigation into a near-transparent black glass ribbon with stronger green Remote Support and purple Blog accents.
- Added a restrained glass capsule around the Staple.IT wordmark and rebuilt the dropdown chevrons.
- Kept the full nav and hero shells off WebGL; they remain CSS glass for stability.
- Expanded real liquidGL to one contained, locally-scoped surface on each completed service page.
- Built V1 pages for IT Solutions, IT Consultancy, Cybersecurity and AI Integrations from the supplied live-site scrape, without inventing service descriptions.
- IT Support remains the existing page, with a small contained liquidGL secondary CTA lens added to match the wider design language.
- Updated production and Doctor gates for the new contained-liquidGL policy.

