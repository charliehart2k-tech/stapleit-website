#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-/srv/stapleit/repo}"
THEME="${THEME:-/var/www/stapleit/wp-content/themes/stapleit}"
MU_PLUGINS_DIR="${MU_PLUGINS_DIR:-/var/www/stapleit/wp-content/mu-plugins}"
SOURCE="$REPO/site"
WORDPRESS_SOURCE="$REPO/wordpress"
STATIC_ROUTES_SOURCE="$WORDPRESS_SOURCE/mu-plugins/stapleit-static-routes.php"
IT_SUPPORT_SOURCE="$SOURCE/it-services/it-support/index.html"
BACKUP_DIR="${BACKUP_DIR:-/home/deploy/stapleit-theme-backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
VERSION="$(git -C "$REPO" rev-parse --short HEAD)"

if [[ ! -f "$SOURCE/index.html" ]]; then
  echo "Source homepage not found: $SOURCE/index.html" >&2
  exit 1
fi

if [[ ! -f "$IT_SUPPORT_SOURCE" ]]; then
  echo "IT Support source page not found: $IT_SUPPORT_SOURCE" >&2
  exit 1
fi

if [[ ! -f "$WORDPRESS_SOURCE/functions.php" ]]; then
  echo "WordPress functions source not found: $WORDPRESS_SOURCE/functions.php" >&2
  exit 1
fi

if [[ ! -f "$STATIC_ROUTES_SOURCE" ]]; then
  echo "Static route handler not found: $STATIC_ROUTES_SOURCE" >&2
  exit 1
fi

if [[ ! -d "$THEME" ]]; then
  echo "WordPress theme path not found: $THEME" >&2
  exit 1
fi

echo "=== Release gate: static site audit ==="
python3 "$REPO/tools/audit-site.py" --root "$SOURCE"

echo
echo "=== Release gate: raster asset integrity ==="
python3 "$REPO/tools/audit-assets.py" --root "$SOURCE/assets"

echo
echo "Deploying Staple IT site from Git $VERSION"

mkdir -p "$BACKUP_DIR"
if [[ -f "$THEME/front-page.php" && -d "$THEME/assets" ]]; then
  tar -czf "$BACKUP_DIR/stapleit-theme-$STAMP.tar.gz" \
    -C "$THEME" front-page.php functions.php assets favicon.ico apple-touch-icon.png static-it-support.php 2>/dev/null || true
  echo "Rollback backup: $BACKUP_DIR/stapleit-theme-$STAMP.tar.gz"
fi

if [[ -f "$MU_PLUGINS_DIR/stapleit-static-routes.php" ]]; then
  cp "$MU_PLUGINS_DIR/stapleit-static-routes.php" "$BACKUP_DIR/stapleit-static-routes-$STAMP.php"
fi

rm -rf "$THEME/assets"
mkdir -p "$THEME/assets"
cp -a "$SOURCE/assets/." "$THEME/assets/"
cp "$SOURCE/favicon.ico" "$THEME/favicon.ico"
cp "$SOURCE/apple-touch-icon.png" "$THEME/apple-touch-icon.png"
cp "$WORDPRESS_SOURCE/functions.php" "$THEME/functions.php"

SOURCE_ROOT="$SOURCE" THEME_ROOT="$THEME" VERSION="$VERSION" python3 <<'PY'
from pathlib import Path
import os
import re

source_root = Path(os.environ['SOURCE_ROOT'])
theme_root = Path(os.environ['THEME_ROOT'])
version = os.environ['VERSION']
theme_uri = "<?php echo esc_url( get_template_directory_uri() ); ?>"


def build(source: Path, target: Path, inject_wp_hooks: bool) -> None:
    html = source.read_text(encoding='utf-8')
    replacements = {
        'href="/favicon.ico"': f'href="{theme_uri}/favicon.ico"',
        'href="/apple-touch-icon.png"': f'href="{theme_uri}/apple-touch-icon.png"',
        'href="assets/': f'href="{theme_uri}/assets/',
        'src="assets/': f'src="{theme_uri}/assets/',
        'href="/assets/': f'href="{theme_uri}/assets/',
        'src="/assets/': f'src="{theme_uri}/assets/',
    }

    for old, new in replacements.items():
        html = html.replace(old, new)

    # Cache-bust local theme CSS/JS using the exact Git revision deployed.
    html = re.sub(r'(href="[^"]+\.css)(")', rf'\1?v={version}\2', html)
    html = re.sub(r'(src="[^"]+\.js)(")', rf'\1?v={version}\2', html)

    if inject_wp_hooks:
        if '<?php wp_head(); ?>' not in html:
            html = html.replace('</head>', '<?php wp_head(); ?>\n</head>', 1)
        if '<?php wp_footer(); ?>' not in html:
            html = html.replace('</body>', '<?php wp_footer(); ?>\n</body>', 1)

    target.write_text(html, encoding='utf-8')


build(source_root / 'index.html', theme_root / 'front-page.php', True)
build(source_root / 'it-services/it-support/index.html', theme_root / 'static-it-support.php', False)
PY

sudo mkdir -p "$MU_PLUGINS_DIR"
sudo install -m 0644 -o deploy -g www-data "$STATIC_ROUTES_SOURCE" "$MU_PLUGINS_DIR/stapleit-static-routes.php"

php -l "$THEME/front-page.php"
php -l "$THEME/static-it-support.php"
php -l "$THEME/functions.php"
php -l "$MU_PLUGINS_DIR/stapleit-static-routes.php"

grep -Fq 'class="mobile-nav-group"' "$THEME/front-page.php"
grep -Fq 'data-audit-explainer' "$THEME/front-page.php"
grep -Fq 'class="contact-section"' "$THEME/front-page.php"
grep -Fq "assets/css/home-polish.css?v=$VERSION" "$THEME/front-page.php"
grep -Fq "assets/css/home-golden.css?v=$VERSION" "$THEME/front-page.php"
grep -Fq "assets/js/app.js?v=$VERSION" "$THEME/front-page.php"
grep -Fq '<link rel="canonical" href="https://stapleit.co.uk/"' "$THEME/front-page.php"
grep -Fq 'https://stapleit.co.uk/#organization' "$THEME/front-page.php"
grep -Fq '"ProfessionalService"' "$THEME/front-page.php"
grep -Fq '"WebPage"' "$THEME/front-page.php"
grep -Fq "wp_ajax_nopriv_stapleit_audit" "$THEME/functions.php"
grep -Fq "xmlrpc_enabled" "$THEME/functions.php"
grep -Fq "stapleit_mail_error" "$THEME/functions.php"

grep -Fq '<title>IT Support | Staple IT</title>' "$THEME/static-it-support.php"
grep -Fq '<meta name="robots" content="noindex,nofollow"' "$THEME/static-it-support.php"
grep -Fq 'aria-current="page" href="/it-services/it-support/"' "$THEME/static-it-support.php"
grep -Fq "assets/css/nav-rainbow.css?v=$VERSION" "$THEME/static-it-support.php"
grep -Fq "assets/js/app.js?v=$VERSION" "$THEME/static-it-support.php"
grep -Fq "'/it-services/it-support/' => 'static-it-support.php'" "$MU_PLUGINS_DIR/stapleit-static-routes.php"

if grep -Fq "register_rest_route( 'stapleit/v1', '/audit'" "$THEME/functions.php"; then
  echo "Legacy public audit REST route is still registered; refusing deployment." >&2
  exit 1
fi

if grep -Fq 'home-polish.js' "$THEME/front-page.php"; then
  echo "Legacy home-polish.js is still referenced; refusing deployment." >&2
  exit 1
fi

sudo chown -R deploy:www-data "$THEME"
find "$THEME" -type d -exec chmod 755 {} \;
find "$THEME" -type f -exec chmod 644 {} \;

echo "Deployment verified."
echo "Deployed Git $VERSION to $THEME"
echo "Homepage source of truth: $SOURCE/index.html"
echo "IT Support source of truth: $IT_SUPPORT_SOURCE"
echo "Static route handler: $MU_PLUGINS_DIR/stapleit-static-routes.php"
echo "WordPress form handler source: $WORDPRESS_SOURCE/functions.php"
