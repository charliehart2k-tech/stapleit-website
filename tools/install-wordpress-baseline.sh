#!/usr/bin/env bash
set -euo pipefail

WP_PATH="${WP_PATH:-/var/www/stapleit}"
INCLUDE_DEV="${INCLUDE_DEV:-0}"

if ! command -v wp >/dev/null 2>&1; then
  echo "WP-CLI is not installed; no changes made." >&2
  exit 1
fi

if [[ ! -f "$WP_PATH/wp-config.php" ]]; then
  echo "WordPress not found at $WP_PATH; no changes made." >&2
  exit 1
fi

echo "Installing Staple IT production plugin baseline..."

wp --path="$WP_PATH" plugin install wp-mail-smtp --activate
wp --path="$WP_PATH" plugin install two-factor --activate
wp --path="$WP_PATH" plugin install redirection --activate
wp --path="$WP_PATH" plugin install simple-history --activate

# Hello Dolly and Akismet are not used by the current Staple IT build.
wp --path="$WP_PATH" plugin delete hello 2>/dev/null || true
wp --path="$WP_PATH" plugin delete akismet 2>/dev/null || true

if [[ "$INCLUDE_DEV" == "1" ]]; then
  echo "Installing staging-only Query Monitor..."
  wp --path="$WP_PATH" plugin install query-monitor --activate
else
  # Do not leave a development profiler enabled accidentally on production.
  wp --path="$WP_PATH" plugin deactivate query-monitor 2>/dev/null || true
fi

echo
echo "Installed baseline:"
wp --path="$WP_PATH" plugin list --fields=name,status,version --format=table

echo
echo "Next manual configuration gates:"
echo "- Configure authenticated delivery in WP Mail SMTP and send a test email."
echo "- Enrol every administrator in Two Factor."
echo "- Configure Redirection during the URL migration, avoiding blanket 404 redirects."
echo "- Review Simple History retention/privacy settings."
echo "- Keep Query Monitor staging-only."
echo "- Do not install SEOPress until metadata/schema ownership is migrated deliberately."
