# Deployment notes

This file records deployment-specific requirements that must be implemented at the VPS/CDN layer without changing the approved site design.

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

The audit reruns the static, asset, repository, generated-CSS and Cora PHP contracts, checks deployed theme drift, validates WordPress/core/service state and inspects public staging security behaviour. It intentionally excludes WordPress salts, database credentials, database contents and visitor logs. Resolve failures as scoped changes with a rollback path; do not turn the audit into an automatic remediation script.

## Rollback backup retention

Each successful staging deployment keeps the five newest theme rollback releases and removes older release groups. The retention applies only inside `/home/deploy/stapleit-theme-backups` and includes the matching legacy static-template and route-handler copies. Override the default for a specific deployment with `BACKUP_RETENTION`, but never set it below two.

The deployment refuses to complete unless an active PHP-FPM service is found, reloaded and confirmed active after the theme files are copied. This makes PHP and `wp-config.php`-dependent changes visible immediately instead of leaving stale OPcache workers serving the previous configuration.

The deploy script removes/replaces the theme asset tree from the committed `site/assets/` source on each release. Retired assets must be removed from Git rather than preserved in verification lists.

# Cora local AI

Cora appears on every route through the shared CSS and `app.js`. She always has a dependency-free deterministic `knowledge-guide` fallback, but genuine conversation uses Ollama on the WordPress VPS. The current 4 GB VPS uses the Apache-2.0 Qwen2.5 1.5B Q5 model (roughly 1.1 GB). Do not use the 5.3 GB 7B build on this host: the kernel can terminate its runner under memory pressure. A future 7B deployment needs materially more available RAM and must be load-tested before replacing the constrained model.

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

The `ss` result must show `127.0.0.1:11434` or equivalent loopback only, never `0.0.0.0:11434` or a public address. Do not create an Nginx, Cloudflare Tunnel or firewall route to Ollama.

Add the model constant above the `/* That's all, stop editing! */` line in the live `wp-config.php`:

```php
define( 'STAPLEIT_OLLAMA_MODEL', 'qwen2.5:1.5b-instruct-q5_0' );
```

If WordPress defines `WP_HTTP_BLOCK_EXTERNAL`, allow loopback HTTP explicitly or its request to Ollama will be blocked. WordPress calls only `http://127.0.0.1:11434`; the model URL and any server configuration remain hidden from the browser.

After deploying the current Git commit, prove the full path through WordPress:

```bash
curl --fail --silent --show-error \
  --request POST 'https://staging.stapleitdev.co.uk/wp-admin/admin-ajax.php' \
  --data-urlencode 'action=stapleit_cora_chat' \
  --data-urlencode 'prompt=We have ten staff and need help with Microsoft 365 security.'
```

The JSON must contain `"ok":true`, `"mode":"local-ai"` and a useful `reply`. `"mode":"knowledge-guide"` means the website and deterministic fallback are working but WordPress did not publish a model reply; check the model constant, `systemctl status ollama`, available memory and the WordPress/PHP error log. Do not describe Cora as live local AI until this returns `local-ai`.

Use the Apache-2.0 1.5B Qwen2.5 model on the current VPS. WordPress fixes the context at 2,048 tokens, limits output, uses low-temperature generation and applies deterministic safety/commercial gates before any model reply reaches the browser. The gates permit only complete published package prices, reject unapproved monetary amounts, unsupported Microsoft 365 Business Premium claims, invented contact details/SLA times/package tiers, 24/7 staffed-support claims, unsupported booking/processing/inspection capabilities, external URLs and unsafe compliance claims. Input guards intercept secret-shaped values, prompt-injection requests and active-incident wording.

Browser-supplied chat history is untrusted. The client sends only a short set of prior visitor turns, and WordPress independently rejects any claimed assistant/system history, secret-bearing history or oversized history before constructing the model request. A rejected, absent, slow or invalid model response receives the explicitly labelled deterministic `knowledge-guide` fallback. No third-party AI API or browser credential is used. Cora rate-limits each connection and does not store prompts in WordPress.

Planner analytics are first-party daily aggregate counters stored in the WordPress options table for 90 days. They contain only allowlisted event names and counts: no prompts, answers, IP addresses, cookies, device identifiers or contact details.
