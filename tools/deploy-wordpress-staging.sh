#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-/srv/stapleit/repo}"
THEME="${THEME:-/var/www/stapleit/wp-content/themes/stapleit}"
SOURCE="$REPO/site"
STAMP="$(date +%Y%m%d-%H%M%S)"
VERSION="$(git -C "$REPO" rev-parse --short HEAD)"

if [[ ! -f "$SOURCE/index.html" ]]; then
  echo "Source homepage not found: $SOURCE/index.html" >&2
  exit 1
fi

if [[ ! -d "$THEME" ]]; then
  echo "WordPress theme path not found: $THEME" >&2
  exit 1
fi

echo "Deploying Staple IT homepage from Git $VERSION"

if [[ -f "$THEME/front-page.php" ]]; then
  cp "$THEME/front-page.php" "$THEME/front-page.php.before-$VERSION-$STAMP"
fi

rm -rf "$THEME/assets"
mkdir -p "$THEME/assets"
cp -a "$SOURCE/assets/." "$THEME/assets/"
cp "$SOURCE/favicon.ico" "$THEME/favicon.ico"
cp "$SOURCE/apple-touch-icon.png" "$THEME/apple-touch-icon.png"

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

# Cache-bust theme CSS and JS from the exact source commit deployed.
s = re.sub(r'(href="[^"?]+\.css)(")', rf'\1?v={version}\2', s)
s = re.sub(r'(src="[^"?]+\.js)(")', rf'\1?v={version}\2', s)

if '<?php wp_head(); ?>' not in s:
    s = s.replace('</head>', '<?php wp_head(); ?>\n</head>', 1)

if '<?php wp_footer(); ?>' not in s:
    s = s.replace('</body>', '<?php wp_footer(); ?>\n</body>', 1)

target.write_text(s)
PY

php -l "$THEME/front-page.php"

sudo chown -R deploy:www-data "$THEME"
find "$THEME" -type d -exec chmod 755 {} \;
find "$THEME" -type f -exec chmod 644 {} \;

echo "Deployed Git $VERSION to $THEME"
echo "Homepage source of truth: $SOURCE/index.html"
