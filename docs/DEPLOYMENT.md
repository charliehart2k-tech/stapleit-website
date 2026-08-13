# VPS deployment and rollback

## Deployment artifact

Only the contents of `dist/` are uploaded to the VPS. Never upload the project
root, `reference/`, `staging/`, `docs/`, `tools/` or `.git/` as web content.

Build locally first:

```powershell
.\tools\Doctor.ps1
.\tools\Build-Production.ps1
```

## Server layout

Use timestamped immutable releases:

```text
/var/www/stapleit/
├── releases/
│   ├── 2026-08-13-1400/
│   └── 2026-08-20-0915/
└── current -> /var/www/stapleit/releases/2026-08-20-0915
```

A deploy uploads a new `dist/` into a new release folder and then atomically
switches `current`. `deploy/activate-release.sh` performs the symlink switch,
runs `nginx -t`, and reloads nginx.

Rollback is the same operation pointed at the previous release:

```bash
sudo ./activate-release.sh 2026-08-13-1400
```

Keep at least the previous two known-good releases until the new release has
been smoke-tested.

## TLS and HSTS order

1. Install nginx and serve the site over HTTP.
2. Use Let's Encrypt / Certbot to issue the certificate and configure renewal.
3. Confirm HTTPS works end to end, including assets, the custom 404 and the
   Google Maps iframe.
4. Run the production smoke test against `https://stapleit.co.uk`.
5. Only then enable the commented HSTS `add_header` directive in
   `deploy/nginx-security-headers.conf`.

Do not enable HSTS before HTTPS is proven. Browsers remember HSTS for the
configured max-age, so the sequencing is deliberate.

## nginx

`deploy/nginx-site.conf.example` is a real nginx server-block example.
`deploy/nginx-security-headers.conf` contains real `add_header` directives and
is intended to be installed as:

```text
/etc/nginx/snippets/stapleit-security-headers.conf
```

Run `nginx -t` before every reload.

## Post-deploy smoke test

From a Windows admin machine:

```powershell
.\tools\Smoke-Test-Production.ps1 -BaseUrl https://stapleit.co.uk
```

This checks key routes, the custom 404 and the expected response headers against
the actual live endpoint rather than only the local build.
