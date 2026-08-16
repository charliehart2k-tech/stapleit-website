#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-/srv/stapleit/repo}"
THEME="${THEME:-/var/www/stapleit/wp-content/themes/stapleit}"
SOURCE="$REPO/site"
WORDPRESS_SOURCE="$REPO/wordpress"
BACKUP_DIR="${BACKUP_DIR:-/home/deploy/stapleit-theme-backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
VERSION="$(git -C "$REPO" rev-parse --short HEAD)"

if [[ ! -f "$SOURCE/index.html" ]]; then
  echo "Source homepage not found: $SOURCE/index.html" >&2
  exit 1
fi

if [[ ! -f "$WORDPRESS_SOURCE/functions.php" ]]; then
  echo "WordPress functions source not found: $WORDPRESS_SOURCE/functions.php" >&2
  exit 1
fi

if [[ ! -d "$THEME" ]]; then
  echo "WordPress theme path not found: $THEME" >&2
  exit 1
fi

echo "=== Release gate: static site audit ==="
python3 "$REPO/tools/audit-site.py" --root "$SOURCE"

echo
echo "Deploying Staple IT homepage from Git $VERSION"

mkdir -p "$BACKUP_DIR"
if [[ -f "$THEME/front-page.php" && -d "$THEME/assets" ]]; then
  tar -czf "$BACKUP_DIR/stapleit-theme-$STAMP.tar.gz" \
    -C "$THEME" front-page.php functions.php assets favicon.ico apple-touch-icon.png 2>/dev/null || true
  echo "Rollback backup: $BACKUP_DIR/stapleit-theme-$STAMP.tar.gz"
fi

rm -rf "$THEME/assets"
mkdir -p "$THEME/assets"
cp -a "$SOURCE/assets/." "$THEME/assets/"
cp "$SOURCE/favicon.ico" "$THEME/favicon.ico"
cp "$SOURCE/apple-touch-icon.png" "$THEME/apple-touch-icon.png"
cp "$WORDPRESS_SOURCE/functions.php" "$THEME/functions.php"

SOURCE="$SOURCE/index.html" THEME="$THEME/front-page.php" VERSION="$VERSION" python3 <<'PY'
from pathlib import Path
import os
import re

source = Path(os.environ['SOURCE'])
target = Path(os.environ['THEME'])
version = os.environ['VERSION']
s = source.read_text()

theme = "<?php echo esc_url( get_template_directory_uri() ); ?>"

replacements = {
    'href="/favicon.ico"': f'href="{theme}/favicon.ico"',
    'href="/apple-touch-icon.png"': f'href="{theme}/apple-touch-icon.png"',
    'href="assets/': f'href="{theme}/assets/',
    'src="assets/': f'src="{theme}/assets/',
    'href="/assets/': f'href="{theme}/assets/',
    'src="/assets/': f'src="{theme}/assets/',
}

for old, new in replacements.items():
    s = s.replace(old, new)

# Cache-bust local theme CSS/JS using the exact Git revision deployed.
s = re.sub(r'(href="[^"]+\.css)(")', rf'\1?v={version}\2', s)
s = re.sub(r'(src="[^"]+\.js)(")', rf'\1?v={version}\2', s)

if '<?php wp_head(); ?>' not in s:
    s = s.replace('</head>', '<?php wp_head(); ?>\n</head>', 1)

if '<?php wp_footer(); ?>' not in s:
    s = s.replace('</body>', '<?php wp_footer(); ?>\n</body>', 1)

target.write_text(s)
PY

php -l "$THEME/front-page.php"
php -l "$THEME/functions.php"

grep -Fq 'class="mobile-nav-group"' "$THEME/front-page.php"
grep -Fq 'data-audit-explainer' "$THEME/front-page.php"
grep -Fq 'class="contact-section"' "$THEME/front-page.php"
grep -Fq "assets/css/home-polish.css?v=$VERSION" "$THEME/front-page.php"
grep -Fq "assets/css/home-golden.css?v=$VERSION" "$THEME/front-page.php"
grep -Fq "assets/js/app.js?v=$VERSION" "$THEME/front-page.php"
grep -Fq '<link rel="canonical" href="https://stapleit.co.uk/"' "$THEME/front-page.php"
grep -Fq 'https://stapleit.co.uk/#organization' "$THEME/front-page.php"
grep -Fq "register_rest_route( 'stapleit/v1', '/audit'" "$THEME/functions.php"

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
echo "WordPress form handler source: $WORDPRESS_SOURCE/functions.php"
