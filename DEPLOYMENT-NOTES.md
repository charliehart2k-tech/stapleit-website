# Deployment notes

This file records deployment-specific requirements that must be implemented at the VPS/CDN layer without changing the approved homepage design.

## Front-end CSP dependencies

The public front end has one external embedded dependency:

- Google Maps iframe: `https://www.google.com`

A compatible front-end baseline therefore needs the equivalent of:

```text
style-src 'self';
font-src 'self';
frame-src https://www.google.com;
```

The rest of the policy should remain restrictive, including `default-src 'self'`, `object-src 'none'` and `frame-ancestors 'none'`, with any WordPress-specific requirements reviewed separately before production.

Manrope is self-hosted under `site/assets/fonts/`; do not reintroduce a third-party font request. If Google Maps is later replaced with a normal outbound link, remove the `frame-src` exception.

The audited Nginx policy is stored in `ops/nginx/`. Install the two snippets under `/etc/nginx/snippets/`, include `stapleit-hardening.conf` inside the Staple IT server block, then run `sudo nginx -t` before reloading. The hardening snippet blocks XML-RPC and sensitive dotfiles, promotes CSP to enforcement, and gives revisioned theme assets an immutable one-year cache policy. Preserve the existing PHP/WordPress locations and Cloudflare Tunnel binding.

## Development hostname / indexing

Until unfinished routes are built, their HTML ships with `noindex,nofollow`. The current sitemap intentionally contains only the production homepage URL.

The temporary development hostname must additionally remain behind Cloudflare Access. At the origin/CDN layer, send an `X-Robots-Tag: noindex, nofollow, noarchive` header for the entire dev hostname. Do not submit the dev hostname or its sitemap to search engines.

Cloudflare Access must protect `/wp-login.php` and `/wp-admin/` on the development hostname. The public audit intentionally fails if the normal WordPress login form is directly reachable.

For the dev hostname, prefer overriding `/robots.txt` to return:

```text
User-agent: *
Disallow: /
```

The repository `site/robots.txt` is the production-intent file and points to the production sitemap.

## Staging static route templates

Git remains the source of truth for every current page shell. The staging deploy script compiles the homepage to `front-page.php` and compiles every rebuilt or in-progress route under `site/` to an explicit `static-*.php` theme template.

`wordpress/mu-plugins/stapleit-static-routes.php` maps the navigation/footer routes to those generated templates so the whole site can be clicked through on staging before WordPress page records are created. The static route map and deploy-script template list must be kept in sync whenever a route is added or removed.

In-progress static routes remain `noindex,nofollow`, and the MU-plugin also sends `X-Robots-Tag: noindex, nofollow, noarchive` when serving them.

## Favicon assets

The site root contains `/favicon.ico` and `/apple-touch-icon.png`. HTML templates must explicitly reference both in `<head>`; do not rely only on browser fallback discovery of `/favicon.ico`.

## VPS audit

Run the read-only infrastructure and deployment audit from the repository root:

```bash
bash tools/audit-vps.sh | tee /tmp/stapleit-vps-audit.txt
```

The report intentionally excludes WordPress salts, database credentials, database contents and visitor logs. Resolve failures as scoped changes with a rollback path; do not turn the audit into an automatic remediation script.

## Rollback backup retention

Each successful staging deployment keeps the five newest theme rollback releases and removes older release groups. The retention applies only inside `/home/deploy/stapleit-theme-backups` and includes the matching legacy static-template and route-handler copies. Override the default for a specific deployment with `BACKUP_RETENTION`, but never set it below two.
# Cora local AI

Cora appears on every route through the shared CSS and `app.js`. She always has a dependency-free catalogue fallback, but genuine conversation requires Ollama on the WordPress VPS. The current 4 GB VPS uses the Apache-2.0 Qwen2.5 1.5B Q5 model (roughly 1.1 GB). Do not use the 5.3 GB 7B build on this host: the kernel will terminate its runner under memory pressure. A future 7B deployment requires a VPS with at least 8 GB available RAM, not merely 8 GB installed.

Install Ollama using its official Linux installer, keep the service on loopback and pull the constrained 1.5B model:

```bash
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl edit ollama
```

Add this systemd override:

```ini
[Service]
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="OLLAMA_KEEP_ALIVE=10m"
Environment="OLLAMA_NUM_PARALLEL=1"
Environment="OLLAMA_CONTEXT_LENGTH=2048"
```

Then activate and verify it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ollama
ollama pull qwen2.5:1.5b-instruct-q5_0
curl --fail --silent http://127.0.0.1:11434/api/tags
sudo ss -lntp | grep 11434
```

The `ss` result must show `127.0.0.1:11434`, never `0.0.0.0:11434` or a public address. Do not create an Nginx, Cloudflare Tunnel or firewall route to Ollama.

Add the model constant above the `/* That's all, stop editing! */` line in the live `wp-config.php`:

```php
define( 'STAPLEIT_OLLAMA_MODEL', 'qwen2.5:1.5b-instruct-q5_0' );
```

If WordPress defines `WP_HTTP_BLOCK_EXTERNAL`, allow loopback HTTP explicitly or its request to Ollama will be blocked. WordPress calls only `http://127.0.0.1:11434`; the model URL and credentials are never exposed to the browser.

After deploying the current Git commit, prove the full path through WordPress:

```bash
curl --fail --silent --show-error \
  --request POST 'https://staging.stapleitdev.co.uk/wp-admin/admin-ajax.php' \
  --data-urlencode 'action=stapleit_cora_chat' \
  --data-urlencode 'prompt=We have ten staff and need help with Microsoft 365 security.'
```

The JSON must contain `"ok":true`, `"mode":"local-ai"` and a useful `reply`. `"mode":"catalogue-match"` means the website is working but WordPress could not reach or use Ollama; check the constant, `systemctl status ollama`, available memory and the WordPress/PHP error log. Do not call Cora live AI until this returns `local-ai`.

Use the Apache-2.0 1.5B Qwen2.5 model on the current VPS, not the separately licensed 3B or 72B variants. WordPress fixes the context at 2,048 tokens, limits output, uses low-temperature generation and applies a deterministic commercial safety gate before any model reply reaches the browser. The gate permits only complete published package prices, rejects unsupported Microsoft 365 Business Premium claims, invented booking or processing capabilities and requests for contact details. A rejected, absent, slow or invalid model response receives the explicitly labelled catalogue match instead. No third-party AI API or browser credential is used. Cora rate-limits each connection, accepts only a short six-message history, does not log prompts in WordPress and refuses requests for credentials through her system instruction.

Planner analytics are first-party daily aggregate counters stored in the WordPress options table for 90 days. They contain only allowlisted event names and counts: no prompts, answers, IP addresses, cookies, device identifiers or contact details.
