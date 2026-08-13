# Staple IT — Framework Hardening & Deployment Readiness

Consolidated doc for the next pass. liquidGL is closed — all nine Definition of Done items verified against v11, no open items there. This doc is scoped to everything else needed to make the framework solid for offline dev and genuinely safe to push to a VPS when that day comes. Treat this as the current single source of truth for this phase; update it in place rather than starting a v2.

**Implementation status — 13 August 2026:** framework hardening remains enforced by `tools/Doctor.ps1`. The first IT Services dropdown is now fully built at V1 (IT Support, IT Solutions, IT Consultancy, Cybersecurity and AI Integrations), bringing the working site to 6 real content pages plus the remaining placeholder routes. liquidGL has moved from audit-only POC to one contained surface per completed service page, while large nav/hero shells remain CSS glass for browser stability.

---

## 0. Immediate cleanup — do this first, it's trivial

- Remove `reference/IT-Master-Service-Agreement-secondary.docx` from the project entirely. Not needed for content work — the live-site scrape already covers that, and it's confidential business material that has no reason being carried through every zip and (soon) every commit. Delete the file and drop the reference to it in `reference/README.md`.
- While in there: `reference/source-archives/www.stapleit.co.uk-full-scrape.zip` (32MB) is worth moving out of the working folder too if it isn't being actively read from during builds — same logic, it's a one-time source, not something that needs to travel with the project indefinitely.
- General rule going forward: nothing confidential or unnecessary-to-ship lives inside the folder that gets zipped, committed, or pushed. If reference material like this is needed again, keep it somewhere adjacent that's explicitly excluded, not inside the working tree.

---

## 1. Version control — before anything else structural

- `git init` at the project root now, before more changes stack on top of each other.
- `.gitignore` excluding at minimum: `staging/runtime/`, `staging/backups/`, `dist/` (build output, not source), `**/__pycache__/`, `*.pyc`.
- Commit the current state as a baseline before starting on anything below — first real "before" snapshot this project has had.
- Going forward: no more `-v9`, `-v10`, `-vN` file or folder suffixes, no duplicate doc versions sitting side by side. Git's history is the version history now. Every doc gets edited in place; every changelog entry is a commit message or a single running `CHANGELOG.md`, not a new file.

---

## 2. Extend the acceptance gate beyond liquidGL

`Doctor.ps1` currently checks the liquidGL Definition of Done specifically. That pattern — a script that hard-fails the build instead of a human eyeballing a checklist — was the single most useful thing to come out of the last few rounds. Generalize it rather than retiring it once liquidGL is done:

- Every page in `site/` parses as valid HTML (a basic lint pass)
- No internal link points at a route that doesn't exist (this already happened once manually via `VALIDATION.json` — make it a repeatable gate, not a one-off report)
- `dist/` builds clean from `site/` with no stale files left over from a previous build
- Keep the existing checks generalized: no `__pycache__`, no duplicate dev servers, no stacked doc versions

Run this before every zip leaves the building, not just before liquidGL-related changes. Nearly every concrete bug found across this whole project so far — the CDN bridge, the fake minifier, the doc sprawl, the dead pills-mode code — is exactly the category of thing this kind of gate catches automatically instead of by someone happening to notice.

---

## 3. Offline-dev correctness

- Smoke-test `Start-Staging.ps1` + `tools/dev/_server.py` end to end after the `reference/` cleanup in step 0 — the dev server shouldn't touch `reference/` at all, but worth confirming nothing broke.
- Add a custom 404 page (`site/404.html`), and have the local dev server serve it for unmatched routes so it's actually tested before it's needed for real.
- Write down a real browser support matrix — a short paragraph is enough, e.g. "last 2 versions of evergreen browsers + Safari 16+, no legacy IE support." Put it in `docs/DESIGN-SYSTEM.md` or a new `docs/BROWSER-SUPPORT.md`. The point is giving future browser-specific calls (like the Safari liquidGL exclusion) something to check against instead of being decided ad hoc in the middle of an incident.

---

## 4. Content — the actual blocker

The acceptance scan currently finds 14 placeholder routes, including the it-audit landing page the homepage's CTA links to. This is the next major work item, ahead of any further SEO, security, or performance polish — everything else in this doc is either already solid or genuinely cheap to finish by comparison. No process change needed here: keep working page-by-page against `reference/live-site/` and the existing `docs/CONTENT-SOURCES.md` rule (no invented copy), the same way Home and IT Support were built.

---

## 5. SEO fundamentals (cheap, unblocked, still outstanding)

- Per-page Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) plus the Twitter Card equivalent. Needs one representative image per page at minimum — the brand logo is a fine placeholder `og:image` until something better exists.
- `LocalBusiness` / `ProfessionalService` JSON-LD on at least the homepage — name, address, phone, the Companies House number already in the footer, opening hours if available.
- `<link rel="canonical">` on every page.
- Generate `robots.txt` and `sitemap.xml` as part of `build_production.py` — both are mechanical to produce from the existing route list, so this is a build-script addition, not new tooling.

---

## 6. Performance follow-through

- Replace `min_js()` in `build_production.py` — it currently only strips full-line `//` comments and collapses blank lines (measured: 3,416 → 3,413 bytes on `app.js`), not real minification, and the naive regex approach carries a small correctness risk against any line starting with `//` inside a string or template literal. A single tool like esbuild can replace both `min_js()` and `min_css()` and the hand-rolled bundling loop with something well-tested.
- **Completed:** deployable brand/tier images are WebP. Favicons/touch icons remain PNG. The browser matrix (Safari 16+) does not require a WebP fallback for content imagery.
- **Completed:** all five WOFF2 files were subset against the glyphs used by the current site/JS plus a safe UK punctuation set, reducing the combined font payload substantially while retaining the current copy.

---

## 7. Security follow-through

- Add `security.txt` under `.well-known/` — a contact address for responsible disclosure is enough to start.
- Contact form pre-launch checklist (unchanged from earlier, still applies once it's wired to a real backend): server-side validation, a honeypot field at minimum, consent checkbox linked directly to the privacy policy page.
- **Completed:** a quarterly reminder is scheduled to check official `liquid-gl` releases, compare against the pinned v2.0.1 vendor, and review deliberately rather than auto-updating.

---

## 8. VPS push readiness — settle this before the first real deploy, not during it

- **Header translation.** `deploy/security-headers.conf` is currently a flat list of header names and values, not directive syntax for any specific server. Before the first deploy, translate it into real nginx `add_header` directives inside the actual server block (or the Apache equivalent, if that ends up being the choice).
- **TLS sequencing.** Get Let's Encrypt/Certbot issuing and auto-renewing first, confirm HTTPS actually works end to end, *then* uncomment `Strict-Transport-Security` — not before. HSTS is a one-way commitment for its `max-age` duration; getting the order wrong is a mistake every visitor's browser remembers, not one you quietly patch later.
- **Deploy artifact discipline.** Only `dist/` gets uploaded to the VPS. `reference/`, `staging/`, `docs/`, and `tools/` stay local. Decide this in writing now, so "just rsync the whole folder, it's faster" doesn't become the shortcut taken at 11pm during the first real push.
- **Rollback.** A bare VPS gives no rollback by default the way a platform like Netlify does. Cheapest version that actually works: timestamped release folders on the server (e.g. `releases/2026-08-13-1400/`) with a `current` symlink pointing at whichever one is live. Deploy = upload to a new timestamped folder, swap the symlink. Rollback = swap it back. Set this up before the first real deploy, not after the first bad one.
- **Post-deploy smoke test.** Once it's live on the VPS, re-run the extended acceptance gate from step 2 against the real URL where practical — a link check and a header check (`curl -I`) against production, not just the local build.

---

## Definition of done for this pass

- [x] MSA and other confidential material removed from the working project
- [x] `git init` done, baseline committed, `.gitignore` in place
- [x] Acceptance gate extended beyond liquidGL to cover general framework health
- [x] Custom 404 page exists and is served locally
- [x] A written browser support matrix exists
- [x] `robots.txt` + `sitemap.xml` generated by the build
- [x] OG tags + JSON-LD + canonical links present on every real page
- [x] `min_js`/`min_css` replaced with a token/parser-aware offline minifier
- [x] `security.txt` added
- [x] Security headers translated into real nginx directives in `deploy/nginx-security-headers.conf`, ready for the actual VPS
- [x] Release/rollback strategy (timestamped folders + symlink) documented and ready
- [x] Content build-out is the acknowledged next major work item, not competing with further polish
