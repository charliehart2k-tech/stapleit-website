# Staple IT WordPress plugin baseline

The site should stay intentionally lean. The custom theme already owns the homepage, audit form, metadata and structured data, so plugins should solve operational problems rather than duplicate theme functionality.

## Install before production

### WP Mail SMTP
**Purpose:** authenticated outbound WordPress email.

Use this for the audit form, password resets and future transactional mail. Configure it against an authenticated mail service; do not rely on PHP/local VPS mail for production delivery.

Production gate:
- authenticated mailer configured
- From address is `hello@stapleit.co.uk`
- From name is `Staple IT`
- test mail reaches the target mailbox
- audit form submission reaches WordPress **and** email
- SPF/DKIM/DMARC alignment checked for the chosen sending route

### Two Factor
**Purpose:** MFA for WordPress administrator accounts.

Production gate:
- enabled for every administrator
- TOTP configured
- recovery codes stored securely
- no shared administrator account

### Redirection
**Purpose:** 301 management and useful 404 visibility while the old site is replaced page-by-page.

Production gate:
- old high-value URLs mapped to their new equivalents
- no redirect chains
- no blanket redirect of every 404 to the homepage

### Simple History
**Purpose:** lightweight administrative audit trail.

Production gate:
- administrator actions visible
- retention reviewed against privacy requirements
- logs are not used as a substitute for server/security logging

## Install on staging only

### Query Monitor
**Purpose:** inspect PHP warnings, slow/duplicate database queries, hooks, templates and enqueued assets while pages are being built.

Keep it available while developing the remaining pages. Deactivate it before production launch unless there is a specific troubleshooting reason to enable it temporarily.

## Consider when the rest of the pages move into WordPress

### SEOPress
The theme already owns the homepage title, description, Open Graph metadata and JSON-LD. An SEO plugin becomes useful once ordinary WordPress pages/posts need editor-managed titles, descriptions, canonicals, social metadata, breadcrumbs and sitemap controls.

**Do not activate overlapping homepage output without a migration plan.** Duplicate canonical, Open Graph or schema output is worse than having one clean source of truth.

Recommended approach:
1. Finish the core page templates.
2. Decide whether metadata remains theme-controlled or moves to SEOPress.
3. Make the change once, page-by-page, and extend the static quality gates to detect duplicates.

## Deliberately avoid for now

- **Form-builder plugin:** the free-audit form is custom, server-validated and stored in WordPress already.
- **General cache plugin:** caching should be designed around Nginx/Cloudflare rather than stacking another cache layer blindly.
- **Heavy all-in-one security suite:** SSH, UFW, Cloudflare, Nginx headers, WordPress hardening, MFA and disciplined patching are the preferred layers. Add a security plugin only for a defined gap.
- **Backup plugin:** use the planned VPS database/uploads backup with an off-site copy and a tested restore. A plugin backup is not a substitute for that.
- **Image optimisation plugin:** optimise assets in the build/deployment workflow unless WordPress media uploads become a significant content workflow.

## Plugin policy

Every plugin added to production must have:
- a specific owner and purpose
- active maintenance and current WordPress/PHP compatibility
- no overlapping responsibility with an existing plugin or the theme
- automatic security updates where appropriate
- a documented removal path

If a plugin is inactive and not deliberately retained for a short troubleshooting window, remove it.