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

# Cora AI architecture

Cora appears on every route through the shared CSS and `app.js`. The browser talks only to WordPress and never receives an AI-provider credential. WordPress owns the conversation state, commercial facts and package decisions.

The preferred conversational path is a hosted model configured server-side. The hosted model does **not** decide prices, package eligibility or support scope: WordPress first resolves a trusted answer/decision from `wordpress/cora-knowledge.php` and the deterministic package tools, then supplies that trusted packet to the model to express naturally. Every generated answer is re-validated before publication. A failed, slow, missing or unsafe hosted response falls back without breaking the chat.

The current VPS keeps Qwen2.5 1.5B Q5 (roughly 1.1 GB) as a local bounded fallback only. Ollama stays on loopback and is never exposed through Nginx, Cloudflare or the firewall. Do not attempt to make the 4 GB VPS the primary reasoning host: 3B benchmarking caused heavy swap use, 4.5–17 second responses and still produced unsupported claims.

Install/verify the local fallback using the existing `tools/install-cora-warm-service.sh` workflow. The expected listener is `127.0.0.1:11434`, never `0.0.0.0:11434`.

Hosted-provider secrets are stored outside Git. Cora must stay parked until the hosted provider is fully grounded. Build the public-site snapshots first with `python3 tools/build-cora-site-corpus.py`; this produces the full source-labelled corpus plus `training/cora-site-runtime-corpus.md`, which intentionally excludes supplementary blog posts from live retrieval. Validate both with `python3 tools/check-cora-site-corpus.py`.

With an OpenAI project API key available, sync the canonical runtime corpus with `python3 tools/sync-cora-openai-knowledge.py`. The tool creates/updates the OpenAI vector store and prints the resulting `CORA_OPENAI_VECTOR_STORE_ID`. Then configure and explicitly enable Cora with the key and that vector-store ID:

```bash
CORA_OPENAI_API_KEY='...' \
CORA_OPENAI_VECTOR_STORE_ID='vs_...' \
CORA_PUBLIC_ENABLED=1 \
sudo -E bash tools/install-cora-hosted-config.sh
```

The installer refuses `CORA_PUBLIC_ENABLED=1` without a vector-store ID. It writes `/etc/stapleit/cora-ai.php` as `root:www-data` mode `0640`, updates `wp-config.php` to require that server-local file, and reloads PHP-FPM. The key is never emitted to browser JavaScript. `CORA_OPENAI_MODEL` defaults to `gpt-5.6-terra`; `CORA_OPENAI_BASE_URL` defaults to `https://api.openai.com/v1`. The browser asks WordPress for a boolean readiness status; the full Cora UI activates only when the public flag, API key and vector store are all present. Runtime deterministic package/pricing/safety rules always outrank retrieved website text.

When the hosted provider is configured, successful generated turns use diagnostic mode `hosted-ai`. The local fallback uses `local-ai`; deterministic fallback uses `knowledge-guide`. These backend mode names are diagnostic only and must never appear in visitor-facing copy.

WordPress issues a signed, opaque conversation token and keeps a maximum short conversation window in a transient for 30 minutes. This server-owned memory may contain recent user and assistant messages so Cora can remember what she said. Browser-supplied assistant/system history is never trusted; legacy browser history remains visitor-turn-only and is used only as a compatibility fallback.

The supervised fine-tune source is generated by `tools/build-cora-finetune.py` into `training/cora-sft-train.jsonl` and `training/cora-sft-validation.jsonl`. It teaches Cora's UK conversational style, recovery behaviour and Staple IT vocabulary. Runtime commercial truth still comes from the curated knowledge/tools. The 933-check Cora training/evaluation corpus is separate from SFT data and remains a release gate. If an API key is available, `tools/start-cora-finetune.sh` can submit the SFT data against the configured supported base model for a benchmark; do not promote a fine-tuned model until it beats the held-out/live evaluation set.

Input guards intercept secret-shaped values, prompt-injection requests and active-incident wording. Output gates reject unapproved monetary amounts, incomplete package price bases, unsupported Business Premium claims, invented contact/SLA/package tiers, 24/7 staffed-support claims, unsupported booking/processing/inspection capabilities, external URLs and unsafe compliance claims. Fixed Basic/Standard/Premium/Tailored decisions cannot be changed by a model.

Planner analytics are first-party daily aggregate counters stored in the WordPress options table for 90 days. They contain only allowlisted event names and counts: no prompts, answers, IP addresses, cookies, device identifiers or contact details.
