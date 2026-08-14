# Deployment notes

This file records deployment-specific requirements that must be implemented at the VPS/CDN layer without changing the approved homepage design.

## Front-end CSP dependencies

The current homepage has two external front-end dependencies that production CSP must allow while they remain in use:

- Google Maps iframe: `https://www.google.com`
- Google Fonts stylesheet/font delivery: `https://fonts.googleapis.com` and `https://fonts.gstatic.com`

A compatible front-end baseline therefore needs the equivalent of:

```text
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
frame-src https://www.google.com;
```

The rest of the policy should remain restrictive, including `default-src 'self'`, `object-src 'none'` and `frame-ancestors 'none'`, with any WordPress-specific requirements reviewed separately before production.

If Google Maps is later replaced with a normal outbound link, remove the `frame-src https://www.google.com` exception. If Manrope is self-hosted later, remove the Google Fonts allowances.

## Development hostname / indexing

Until unfinished routes are built, their HTML ships with `noindex,nofollow`. The current sitemap intentionally contains only the production homepage URL.

The temporary development hostname must additionally remain behind Cloudflare Access. At the origin/CDN layer, send an `X-Robots-Tag: noindex, nofollow, noarchive` header for the entire dev hostname. Do not submit the dev hostname or its sitemap to search engines.

For the dev hostname, prefer overriding `/robots.txt` to return:

```text
User-agent: *
Disallow: /
```

The repository `site/robots.txt` is the production-intent file and points to the production sitemap.

## Favicon assets

The site root contains `/favicon.ico` and `/apple-touch-icon.png`. HTML templates must explicitly reference both in `<head>`; do not rely only on browser fallback discovery of `/favicon.ico`.
