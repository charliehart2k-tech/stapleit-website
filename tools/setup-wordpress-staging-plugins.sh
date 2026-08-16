#!/usr/bin/env bash
set -euo pipefail

WP_ROOT="${WP_ROOT:-/var/www/stapleit}"

if ! command -v wp >/dev/null 2>&1; then
  echo "WP-CLI is required but was not found in PATH." >&2
  exit 1
fi

if [[ ! -f "$WP_ROOT/wp-config.php" ]]; then
  echo "WordPress root not found at $WP_ROOT" >&2
  exit 1
fi

wp_cmd=(wp --path="$WP_ROOT" --skip-plugins --skip-themes)

SITE_URL="$(${wp_cmd[@]} option get siteurl)"
echo "WordPress site: $SITE_URL"

case "$SITE_URL" in
  https://staging.stapleitdev.co.uk*|http://staging.stapleitdev.co.uk*) ;;
  *)
    echo "Refusing to run automatically: this bootstrap is staging-only." >&2
    echo "Set up production plugins deliberately using WORDPRESS-PLUGIN-BASELINE.md." >&2
    exit 1
    ;;
esac

install_activate() {
  local slug="$1"
  echo
  echo "=== $slug ==="
  ${wp_cmd[@]} plugin install "$slug" --activate
}

install_only() {
  local slug="$1"
  echo
  echo "=== $slug (installed, intentionally inactive) ==="
  ${wp_cmd[@]} plugin install "$slug"
}

# Operational plugins that are safe and useful throughout staging.
install_activate query-monitor
install_activate simple-history
install_activate redirection
install_activate two-factor

# Mail transport must be configured with real credentials before activation is
# treated as production-ready. Install it now so the next step is configuration,
# not package discovery.
install_only wp-mail-smtp

# SEO metadata is currently theme-owned on the homepage. Install SEOPress for
# later page-by-page migration, but do not activate it until duplicate metadata
# and schema output have been planned and tested.
install_only wp-seopress

echo
echo "=== Plugin status ==="
${wp_cmd[@]} plugin list --fields=name,status,version,update --format=table

echo
echo "Staging plugin bootstrap complete."
echo "Next: configure authenticated mail, enrol administrator 2FA, then review Redirection/Simple History settings."
