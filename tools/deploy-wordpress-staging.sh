#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-/srv/stapleit/repo}"
WP_ROOT="${WP_ROOT:-/var/www/stapleit}"
THEME="${THEME:-$WP_ROOT/wp-content/themes/stapleit}"
MU_PLUGINS_DIR="${MU_PLUGINS_DIR:-$WP_ROOT/wp-content/mu-plugins}"
WELL_KNOWN_DIR="${WELL_KNOWN_DIR:-$WP_ROOT/.well-known}"
SOURCE="$REPO/site"
WORDPRESS_SOURCE="$REPO/wordpress"
STATIC_ROUTES_SOURCE="$WORDPRESS_SOURCE/mu-plugins/stapleit-static-routes.php"
BACKUP_DIR="${BACKUP_DIR:-/home/deploy/stapleit-theme-backups}"
BACKUP_RETENTION="${BACKUP_RETENTION:-5}"
EXPECTED_BRANCH="${EXPECTED_BRANCH:-main}"

fail() {
  printf 'Deployment refused: %s\n' "$1" >&2
  exit 1
}

require_safe_absolute_path() {
  local label="$1"
  local path="$2"
  case "$path" in
    ""|/|/var|/var/www|/home|/srv)
      fail "$label resolves to an unsafe broad path: ${path:-<empty>}"
      ;;
  esac
  [[ "$path" == /* ]] || fail "$label must be absolute: $path"
  [[ "$path" != *'/../'* && "$path" != */.. ]] || fail "$label must not contain parent traversal: $path"
}

require_safe_absolute_path REPO "$REPO"
require_safe_absolute_path WP_ROOT "$WP_ROOT"
require_safe_absolute_path THEME "$THEME"
require_safe_absolute_path MU_PLUGINS_DIR "$MU_PLUGINS_DIR"
require_safe_absolute_path WELL_KNOWN_DIR "$WELL_KNOWN_DIR"
require_safe_absolute_path BACKUP_DIR "$BACKUP_DIR"
[[ "$THEME" == "$WP_ROOT"/wp-content/themes/* ]] || fail "THEME is outside the configured WordPress themes directory"
[[ "$MU_PLUGINS_DIR" == "$WP_ROOT"/wp-content/mu-plugins ]] || fail "MU_PLUGINS_DIR does not match the configured WordPress root"
[[ "$WELL_KNOWN_DIR" == "$WP_ROOT"/.well-known ]] || fail "WELL_KNOWN_DIR does not match the configured WordPress root"

[[ -d "$REPO/.git" ]] || fail "Git repository not found at $REPO"
CURRENT_BRANCH="$(git -C "$REPO" branch --show-current)"
[[ "$CURRENT_BRANCH" == "$EXPECTED_BRANCH" ]] || fail "expected branch $EXPECTED_BRANCH, found ${CURRENT_BRANCH:-detached HEAD}"
[[ -z "$(git -C "$REPO" status --porcelain)" ]] || fail "repository contains uncommitted changes"
UPSTREAM_HEAD="$(git -C "$REPO" rev-parse '@{upstream}' 2>/dev/null || true)"
[[ -n "$UPSTREAM_HEAD" ]] || fail "branch $EXPECTED_BRANCH has no configured upstream"
[[ "$(git -C "$REPO" rev-parse HEAD)" == "$UPSTREAM_HEAD" ]] || fail "local $EXPECTED_BRANCH does not match its fetched upstream"
[[ ! -L "$THEME/assets" ]] || fail "theme assets path must not be a symbolic link"

STAMP="$(date +%Y%m%d-%H%M%S)"
VERSION="$(git -C "$REPO" rev-parse --short HEAD)"

STATIC_ROUTE_SOURCES=(
  "it-services/index.html"
  "it-services/it-support/index.html"
  "it-services/it-solutions/index.html"
  "it-services/it-consultancy/index.html"
  "it-services/cybersecurity/index.html"
  "it-services/ai-integrations/index.html"
  "about-us/index.html"
  "about-us/who-we-support/index.html"
  "about-us/our-partners/index.html"
  "about-us/privacy-policy/index.html"
  "about-us/legal/index.html"
  "get-in-touch/index.html"
  "get-in-touch/it-audit/index.html"
  "client-portal/index.html"
  "remote-support/index.html"
  "the-staple-blog/index.html"
)

if [[ ! -f "$SOURCE/index.html" ]]; then
  echo "Source homepage not found: $SOURCE/index.html" >&2
  exit 1
fi

for relative_source in "${STATIC_ROUTE_SOURCES[@]}"; do
  if [[ ! -f "$SOURCE/$relative_source" ]]; then
    echo "Static route source page not found: $SOURCE/$relative_source" >&2
    exit 1
  fi
done

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
echo "=== Release gate: generated CSS bundles ==="
python3 "$REPO/tools/build-css.py" --check

echo
echo "=== Release gate: raster asset integrity ==="
python3 "$REPO/tools/audit-assets.py" --root "$SOURCE/assets"

echo
echo "Deploying Staple IT site from Git $VERSION"

mkdir -p "$BACKUP_DIR"
if [[ -f "$THEME/front-page.php" && -d "$THEME/assets" ]]; then
  theme_backup_items=(front-page.php functions.php assets favicon.ico apple-touch-icon.png)
  if [[ -f "$THEME/404.php" ]]; then
    theme_backup_items+=(404.php)
  fi
  tar -czf "$BACKUP_DIR/stapleit-theme-$STAMP.tar.gz" \
    -C "$THEME" "${theme_backup_items[@]}"
  echo "Rollback backup: $BACKUP_DIR/stapleit-theme-$STAMP.tar.gz"
fi

STATIC_BACKUP_DIR="$BACKUP_DIR/static-templates-$STAMP"
mkdir -p "$STATIC_BACKUP_DIR"
find "$THEME" -maxdepth 1 -type f -name 'static-*.php' -exec cp {} "$STATIC_BACKUP_DIR/" \;

if [[ -f "$MU_PLUGINS_DIR/stapleit-static-routes.php" ]]; then
  cp "$MU_PLUGINS_DIR/stapleit-static-routes.php" "$BACKUP_DIR/stapleit-static-routes-$STAMP.php"
fi

rm -rf "$THEME/assets"
mkdir -p "$THEME/assets"
cp -a "$SOURCE/assets/." "$THEME/assets/"
cp "$SOURCE/favicon.ico" "$THEME/favicon.ico"
cp "$SOURCE/apple-touch-icon.png" "$THEME/apple-touch-icon.png"
cp "$WORDPRESS_SOURCE/functions.php" "$THEME/functions.php"
find "$THEME" -maxdepth 1 -type f -name 'static-*.php' -delete

python3 "$REPO/tools/build-wordpress-templates.py" \
  --source-root "$SOURCE" \
  --theme-root "$THEME" \
  --version "$VERSION"

sudo mkdir -p "$MU_PLUGINS_DIR"
sudo install -m 0644 -o deploy -g www-data "$STATIC_ROUTES_SOURCE" "$MU_PLUGINS_DIR/stapleit-static-routes.php"
sudo mkdir -p "$WELL_KNOWN_DIR"
sudo install -m 0644 -o deploy -g www-data "$SOURCE/.well-known/security.txt" "$WELL_KNOWN_DIR/security.txt"

php -l "$THEME/front-page.php"
php -l "$THEME/404.php"
php -l "$THEME/functions.php"
php -l "$MU_PLUGINS_DIR/stapleit-static-routes.php"

for template in "$THEME"/static-*.php; do
  php -l "$template"
  grep -Fq 'class="site-header"' "$template"
  grep -Fq 'class="site-footer"' "$template"
  grep -Fq '<meta name="robots" content="noindex,nofollow"' "$template"
  grep -Fq "assets/js/app.js?v=$VERSION" "$template"
done

grep -Fq '<title>Page Not Found | Staple IT</title>' "$THEME/404.php"
grep -Fq '<meta name="robots" content="noindex,nofollow"' "$THEME/404.php"
grep -Fq 'class="reset-stage reset-404"' "$THEME/404.php"

grep -Fq 'class="mobile-nav-group"' "$THEME/front-page.php"
grep -Fq 'data-audit-explainer' "$THEME/front-page.php"
grep -Fq 'class="contact-section"' "$THEME/front-page.php"
grep -Fq "assets/css/home.bundle.css?v=$VERSION" "$THEME/front-page.php"
grep -Fq "assets/fonts/manrope-latin.woff2" "$THEME/front-page.php"
grep -Fq "assets/js/app.js?v=$VERSION" "$THEME/front-page.php"
grep -Fq 'class="support-hero-intro"' "$THEME/static-it-support.php"
grep -Fq 'data-support-hero-intro-svg' "$THEME/static-it-support.php"
grep -Fq 'id="support-intro-cover-mask"' "$THEME/static-it-support.php"
grep -Fq 'class="support-hero-intro-reveal"' "$THEME/static-it-support.php"
grep -Fq '<use href="#support-intro-title-shape" fill="#fff"' "$THEME/static-it-support.php"
grep -Fq 'href="#support-intro-title-shape" fill="#000" stroke="#000"' "$THEME/static-it-support.php"
grep -Fq 'support-hero-intro-reveal' "$THEME/assets/css/it-support.css"
grep -Fq 'data-support-hero-intro' "$THEME/assets/js/it-support.js"
grep -Fq 'supportIntroMaskFade' "$THEME/assets/js/it-support.js"
if grep -Fq 'support-css-ambient' "$THEME/static-it-support.php"; then
  echo "Retired IT Support ambient blob is still referenced; refusing deployment." >&2
  exit 1
fi
if grep -Fq 'support-liquid-motion' "$THEME/static-it-support.php"; then
  echo "Retired IT Support MP4 hero is still referenced; refusing deployment." >&2
  exit 1
fi
grep -Fq 'assets/images/icons/it-support.svg#helpdesk' "$THEME/static-it-support.php"
test -s "$THEME/assets/images/icons/it-support.svg"
test -s "$THEME/assets/images/effects/glass-grain.svg"
grep -Fq 'assets/images/effects/glass-grain.svg' "$THEME/assets/css/it-support.css"
grep -Fq '<link rel="canonical" href="https://stapleit.co.uk/"' "$THEME/front-page.php"
grep -Fq 'https://stapleit.co.uk/#organization' "$THEME/front-page.php"
grep -Fq '"ProfessionalService"' "$THEME/front-page.php"
grep -Fq '"WebPage"' "$THEME/front-page.php"
grep -Fq "wp_ajax_nopriv_stapleit_audit" "$THEME/functions.php"
grep -Fq "xmlrpc_enabled" "$THEME/functions.php"
grep -Fq "stapleit_mail_error" "$THEME/functions.php"

grep -Fq '<title>Managed IT Support in Surrey | Staple IT</title>' "$THEME/static-it-support.php"
grep -Fq 'aria-current="page" href="/it-services/it-support/"' "$THEME/static-it-support.php"
grep -Fq "assets/css/it-support.bundle.css?v=$VERSION" "$THEME/static-it-support.php"
grep -Fq '"@type":"Service"' "$THEME/static-it-support.php"
grep -Fq "assets/js/it-support.js?v=$VERSION" "$THEME/static-it-support.php"
grep -Fq '<dialog class="support-dialog' "$THEME/static-it-support.php"
grep -Fq 'data-pack-late' "$THEME/static-it-support.php"
grep -Fq 'class="support-step-card support-step-card--one"' "$THEME/static-it-support.php"
grep -Fq 'class="support-step-content"' "$THEME/static-it-support.php"
grep -Fq 'class="support-onboarding-accent"' "$THEME/static-it-support.php"
test -s "$WELL_KNOWN_DIR/security.txt"
grep -Fq 'Contact: mailto:hello@stapleit.co.uk' "$WELL_KNOWN_DIR/security.txt"

if grep -Fq 'assets/css/it-support-packages.css' "$THEME/static-it-support.php"; then
  echo "Legacy IT Support package override stylesheet is still referenced; refusing deployment." >&2
  exit 1
fi

if grep -Fq 'assets/css/typography-refinement.css' "$THEME/static-it-support.php"; then
  echo "Homepage typography refinement leaked into IT Support; refusing deployment." >&2
  exit 1
fi

if grep -Fq 'support-modal-backdrop' "$THEME/static-it-support.php"; then
  echo "Legacy IT Support modal markup is still present; refusing deployment." >&2
  exit 1
fi

if grep -Fq 'support-step-card support-card' "$THEME/static-it-support.php"; then
  echo "Legacy IT Support onboarding card material is still present; refusing deployment." >&2
  exit 1
fi

if grep -Fq 'support-step-orbit' "$THEME/static-it-support.php"; then
  echo "Detached IT Support onboarding glass chips are still present; refusing deployment." >&2
  exit 1
fi

if grep -Fq 'support-step-number" aria-hidden' "$THEME/static-it-support.php"; then
  echo "IT Support process numbers are hidden from assistive technology; refusing deployment." >&2
  exit 1
fi

grep -Fq "'/it-services/'" "$MU_PLUGINS_DIR/stapleit-static-routes.php"
grep -Fq "'/about-us/'" "$MU_PLUGINS_DIR/stapleit-static-routes.php"
grep -Fq "'/get-in-touch/'" "$MU_PLUGINS_DIR/stapleit-static-routes.php"
grep -Fq "'/client-portal/'" "$MU_PLUGINS_DIR/stapleit-static-routes.php"
grep -Fq "'/remote-support/'" "$MU_PLUGINS_DIR/stapleit-static-routes.php"
grep -Fq "'/the-staple-blog/'" "$MU_PLUGINS_DIR/stapleit-static-routes.php"

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

BACKUP_DIR="$BACKUP_DIR" BACKUP_RETENTION="$BACKUP_RETENTION" \
  bash "$REPO/tools/prune-theme-backups.sh"

echo "Deployment verified."
echo "Deployed Git $VERSION to $THEME"
echo "Homepage source of truth: $SOURCE/index.html"
echo "Static route sources deployed: ${#STATIC_ROUTE_SOURCES[@]}"
echo "Static route handler: $MU_PLUGINS_DIR/stapleit-static-routes.php"
echo "WordPress form handler source: $WORDPRESS_SOURCE/functions.php"
