# Staple IT production readiness gates

This is the go/no-go checklist for moving `stapleit.co.uk` onto the new WordPress/VPS build.

## 1. Content and UX

- Homepage approved on desktop and current iPhone Safari.
- Remaining primary pages rebuilt and reviewed against the same typography/spacing system.
- Navigation destinations exist and do not lead to placeholder/legacy pages unexpectedly.
- No accidental horizontal scrolling at common mobile widths.
- Keyboard navigation and visible focus states checked.
- Reduced-motion behaviour checked.
- Contact details, opening hours, company number, VAT number and address verified.
- Google-review link verified.
- 404 page designed and useful.

## 2. Forms and email

- Free IT Audit form validates client-side and server-side.
- Honeypot/rate limiting confirmed.
- Successful submissions appear under **Form Enquiries** in WordPress.
- Success/error states are visually clear and accessible.
- WP Mail SMTP configured with authenticated delivery.
- Test enquiry reaches `hello@stapleit.co.uk`.
- Reply-To is the submitter address.
- SPF, DKIM and DMARC alignment checked for the sending route.
- Password-reset email tested.

## 3. SEO / AEO / discoverability

- Every indexable page has one unique H1.
- Unique title and meta description per indexable page.
- Production HTTPS canonical on every indexable page.
- Open Graph title/description/url/image present on important pages.
- Twitter/X card metadata present where useful.
- Homepage structured data includes Organisation/ProfessionalService, WebSite and WebPage entities.
- Service pages use Service schema where the visible content supports it.
- FAQ schema is only used where the FAQ is visibly present on the same page.
- Review/AggregateRating schema is only used when backed by genuine visible review data.
- `robots.txt` points to the production sitemap.
- Sitemap contains only canonical, indexable production URLs.
- Google Search Console configured after launch.
- Bing Webmaster Tools configured after launch.
- No staging hostname appears in production HTML, sitemap or canonical metadata.
- No production `noindex` header/meta remains after cutover.

## 4. WordPress application

- WordPress/core/plugins/themes fully patched.
- Default unused themes removed after a known-good fallback decision.
- Hello Dolly removed.
- Akismet either deliberately configured or removed.
- `DISALLOW_FILE_EDIT` remains enabled.
- XML-RPC remains disabled unless a defined future integration requires it.
- Administrator accounts are named accounts only; no shared admin.
- Two-factor authentication enabled for all administrators.
- Simple History or equivalent admin audit log active.
- Query Monitor disabled on production.
- Plugin inventory matches `WORDPRESS-PLUGIN-BASELINE.md` or has a documented exception.

## 5. Server / network / Cloudflare

- SSH key-only, no password login, no root login.
- UFW exposes only the intended management surface.
- Nginx remains loopback-only behind Cloudflare Tunnel unless the architecture deliberately changes.
- Security headers verified on HTML and static assets.
- CSP violations reviewed; move from Report-Only to enforcement only after the final page/plugin set is known-good.
- HSTS verified on production HTTPS.
- WordPress reverse-proxy HTTPS detection remains active.
- Production Nginx `server_name` is explicit rather than `_` once the final hostname is cut over.
- Cloudflare Access policy is appropriate for production (no accidental staging-only login wall).
- Cloudflare caching rules are documented and do not cache wp-admin, login or form POST/AJAX requests.

## 6. Database and files

- WordPress DB user remains restricted to its own database and localhost.
- Off-site backup is operational for MariaDB and `wp-content/uploads`.
- Backup job is scheduled and monitored.
- Retention policy defined.
- A backup has been restored into a disposable location successfully before launch.
- Git remains the source of truth for theme code; production edits are not made directly to generated theme files.

## 7. Performance

- Lighthouse/PageSpeed run against production-like staging on mobile and desktop.
- Largest Contentful Paint reviewed, especially hero/video behaviour.
- No oversized images or unexpected multi-megabyte page assets.
- Non-critical iframes/images lazy-load.
- Third-party scripts are kept to a minimum.
- No duplicate CSS/JS enqueues.
- Query Monitor used on staging to catch PHP warnings, slow/duplicate queries and accidental plugin overhead.
- Cloudflare/Nginx caching introduced deliberately after forms/admin exclusions are proven.

## 8. Analytics and privacy

- Decide whether analytics is GA4, privacy-first analytics, or no analytics initially.
- If non-essential cookies/trackers are introduced, cookie consent and privacy copy are updated before enabling them.
- Privacy policy reflects form data, administrative logs, analytics and any SMTP/mail provider actually used.
- Form data retention policy decided.
- Avoid storing unnecessary personal data; the audit handler does not persist visitor IP addresses.

## 9. Redirects and migration

- Crawl/export the existing public URL set before cutover.
- Map old high-value URLs to equivalent new URLs with 301 redirects.
- Preserve URLs where practical.
- No redirect loops/chains.
- Post-launch crawl checks 200/301/404 behaviour.
- Monitor 404s for the first few weeks and add redirects only where there is a genuine replacement.

## 10. Launch / rollback

- Final database/files backup immediately before DNS/cutover.
- Theme deployment backup exists.
- Production DNS/Tunnel change is documented and reversible.
- Smoke test after cutover: homepage, navigation, forms, wp-admin, password reset, email, sitemap, robots, canonical, headers and mobile rendering.
- Keep old hosting/environment available for the agreed rollback window where possible.

## Current known open items

- Authenticated outbound WordPress mail / WP Mail SMTP.
- Off-site database and uploads backup plus restore test.
- Install the audited Nginx snippets and verify CSP enforcement; staging currently sends the full policy as Report-Only on normal pages.
- Block `/xmlrpc.php` at Nginx/Cloudflare; the WordPress filter alone does not remove the public endpoint.
- Put staging `/wp-login.php` and `/wp-admin/` behind Cloudflare Access; the normal login form is currently public.
- Enable GitHub branch protection/rulesets for `main` with the Site quality gates required before merge.
- Explicit production Nginx `server_name` at cutover.
- Remaining site pages and redirects.
- Production analytics/Search Console decision.
