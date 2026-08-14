# Deployment notes

This file records deployment-specific exceptions that must be implemented at the VPS/CDN layer without changing the approved homepage design.

## Google Maps CSP requirement

The homepage contact chapter embeds Google Maps from `https://www.google.com` in an iframe.

Any production Content-Security-Policy used while that embed remains active must include:

```text
frame-src https://www.google.com;
```

Without that directive, `default-src 'self'` will block the map iframe.

If the embedded map is removed later and replaced with a normal outbound link, remove this exception again.

## Staging/indexing

Until unfinished routes are built, their HTML ships with `noindex,nofollow`. The current sitemap intentionally contains only the production homepage URL.

The temporary development hostname should additionally remain protected by Cloudflare Access and should not be submitted to search engines.
