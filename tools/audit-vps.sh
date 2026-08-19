#!/usr/bin/env bash
set -uo pipefail

# Read-only Staple IT VPS audit. This script deliberately avoids credentials,
# WordPress salts, database contents, visitor logs and destructive commands.

REPO="${REPO:-/srv/stapleit/repo}"
WP_ROOT="${WP_ROOT:-/var/www/stapleit}"
THEME="${THEME:-$WP_ROOT/wp-content/themes/stapleit}"
BACKUP_DIR="${BACKUP_DIR:-/home/deploy/stapleit-theme-backups}"
BACKUP_RETENTION="${BACKUP_RETENTION:-5}"
STAGING_URL="${STAGING_URL:-https://staging.stapleitdev.co.uk}"

warnings=0
failures=0

section() {
  printf '\n=== %s ===\n' "$1"
}

pass() {
  printf 'PASS: %s\n' "$1"
}

warn() {
  printf 'WARN: %s\n' "$1"
  warnings=$((warnings + 1))
}

fail() {
  printf 'FAIL: %s\n' "$1"
  failures=$((failures + 1))
}

have() {
  command -v "$1" >/dev/null 2>&1
}

wp_read() {
  if ! have wp; then
    return 127
  fi
  if sudo -n -u www-data true >/dev/null 2>&1; then
    sudo -n -u www-data wp --path="$WP_ROOT" "$@"
  else
    wp --path="$WP_ROOT" "$@"
  fi
}

section "Host"
printf 'Timestamp (UTC): %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf 'Hostname: %s\n' "$(hostname -f 2>/dev/null || hostname)"
printf 'Kernel: %s\n' "$(uname -srmo)"
printf 'Uptime: %s\n' "$(uptime -p 2>/dev/null || uptime)"
df -h "$WP_ROOT" 2>/dev/null || warn "Could not read filesystem usage for $WP_ROOT"
free -h 2>/dev/null || warn "Could not read memory usage"
if [[ -f /var/run/reboot-required ]]; then
  warn "The VPS requires a restart to finish installed updates"
else
  pass "No pending system restart"
fi

section "Repository and release gates"
if [[ ! -d "$REPO/.git" ]]; then
  fail "Git repository not found at $REPO"
else
  repo_head="$(git -C "$REPO" rev-parse HEAD 2>/dev/null || true)"
  repo_short="$(git -C "$REPO" rev-parse --short HEAD 2>/dev/null || true)"
  repo_branch="$(git -C "$REPO" branch --show-current 2>/dev/null || true)"
  remote_head="$(git -C "$REPO" ls-remote origin refs/heads/main 2>/dev/null | awk '{print $1}' || true)"
  printf 'Branch: %s\n' "${repo_branch:-detached}"
  printf 'Local HEAD: %s\n' "${repo_head:-unknown}"
  printf 'Remote main: %s\n' "${remote_head:-unavailable}"

  if [[ -n "$(git -C "$REPO" status --porcelain 2>/dev/null)" ]]; then
    fail "VPS repository has uncommitted changes"
    git -C "$REPO" status --short
  else
    pass "VPS repository working tree is clean"
  fi

  if [[ -n "$remote_head" && "$repo_head" == "$remote_head" ]]; then
    pass "VPS repository matches GitHub main"
  elif [[ -n "$remote_head" ]]; then
    warn "VPS repository does not match GitHub main"
  else
    warn "Could not read GitHub main for drift comparison"
  fi

  python3 "$REPO/tools/audit-site.py" --root "$REPO/site" || fail "Static site audit failed"
  python3 "$REPO/tools/audit-assets.py" --root "$REPO/site/assets" || fail "Asset integrity audit failed"
  python3 "$REPO/tools/audit-repository.py" --root "$REPO" || fail "Repository secret/hygiene audit failed"
  python3 "$REPO/tools/build-css.py" --check || fail "Generated CSS bundles are stale or over budget"
  bash -n "$REPO/tools/deploy-wordpress-staging.sh" || fail "Deployment script syntax check failed"
fi

section "Deployed theme drift"
if [[ ! -d "$THEME" ]]; then
  fail "Deployed theme not found at $THEME"
else
  if [[ -n "${repo_short:-}" ]] && grep -Fq "?v=$repo_short" "$THEME/static-it-support.php" 2>/dev/null; then
    pass "IT Support template carries the current Git revision"
  else
    fail "IT Support template does not carry the current Git revision"
  fi

  for relative in \
    assets/css/home.bundle.css \
    assets/css/it-support.bundle.css \
    assets/css/site-shell.bundle.css \
    assets/fonts/manrope-latin.woff2 \
    assets/media/liquid-wave.mp4 \
    assets/media/it-support-liquid.mp4; do
    if [[ ! -s "$THEME/$relative" ]]; then
      fail "Missing deployed asset: $relative"
    elif [[ -f "$REPO/site/$relative" ]] && cmp -s "$REPO/site/$relative" "$THEME/$relative"; then
      pass "Deployed asset matches Git: $relative"
    else
      fail "Deployed asset differs from Git: $relative"
    fi
  done

  if [[ -s "$THEME/404.php" ]] && grep -Fq 'class="reset-stage reset-404"' "$THEME/404.php"; then
    pass "Custom WordPress 404 template is deployed"
  else
    fail "Custom WordPress 404 template is missing or invalid"
  fi

  if have ffprobe; then
    for video in "$THEME"/assets/media/*.mp4; do
      [[ -e "$video" ]] || continue
      ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 "$video" \
        || fail "ffprobe rejected deployed video: ${video##*/}"
    done
  else
    warn "ffprobe is unavailable; repository MP4 checks remain the fallback"
  fi

  wrong_owner="$(find "$THEME" -xdev \( ! -user deploy -o ! -group www-data \) -print -quit 2>/dev/null || true)"
  world_writable="$(find "$THEME" -xdev -perm -0002 -print -quit 2>/dev/null || true)"
  [[ -z "$wrong_owner" ]] && pass "Theme ownership is deploy:www-data" || fail "Unexpected theme ownership begins at $wrong_owner"
  [[ -z "$world_writable" ]] && pass "Theme contains no world-writable files" || fail "World-writable theme path found: $world_writable"
fi

section "WordPress"
if ! have wp; then
  fail "WP-CLI is unavailable"
elif [[ ! -f "$WP_ROOT/wp-config.php" ]]; then
  fail "WordPress config not found at $WP_ROOT/wp-config.php"
else
  wp_read core verify-checksums && pass "WordPress core checksums are valid" || fail "WordPress core checksum verification failed"
  printf 'Environment: '
  wp_read eval 'echo wp_get_environment_type();' 2>/dev/null || warn "Could not read WordPress environment type"
  printf '\nHome URL: '
  wp_read option get home 2>/dev/null || warn "Could not read WordPress home URL"
  printf '\nSite URL: '
  wp_read option get siteurl 2>/dev/null || warn "Could not read WordPress site URL"
  printf '\nSearch visibility (0 is expected on staging): '
  wp_read option get blog_public 2>/dev/null || warn "Could not read WordPress search visibility"
  printf '\nPlugins:\n'
  wp_read plugin list --fields=name,status,update,version,update_version --format=table \
    || warn "Could not list WordPress plugins"
  printf 'Themes:\n'
  wp_read theme list --fields=name,status,update,version,update_version --format=table \
    || warn "Could not list WordPress themes"
fi

section "Services, firewall and SSH"
for service in nginx mariadb cloudflared; do
  service_state="$(systemctl is-active "$service" 2>/dev/null || true)"
  if [[ "$service_state" == "active" ]]; then
    pass "$service is active"
  else
    warn "$service is not active or not installed under that unit name"
  fi
done

php_fpm_unit="$(systemctl list-units --type=service --all --no-legend 'php*-fpm.service' 2>/dev/null | awk 'NR==1{print $1}')"
if [[ -n "$php_fpm_unit" ]] && systemctl is-active --quiet "$php_fpm_unit"; then
  pass "$php_fpm_unit is active"
else
  warn "No active PHP-FPM service was detected"
fi

if have nginx; then
  sudo -n nginx -t 2>&1 || fail "Nginx configuration test failed"
fi

if have ufw; then
  sudo -n ufw status verbose 2>/dev/null || warn "Could not read UFW status without interactive sudo"
else
  warn "UFW is not installed"
fi

if have ss; then
  ss -lntup 2>/dev/null || warn "Could not list listening sockets"
fi

if have sshd; then
  sshd_effective="$(sudo -n sshd -T 2>/dev/null || sshd -T 2>/dev/null || true)"
  if [[ -n "$sshd_effective" ]]; then
    printf '%s\n' "$sshd_effective" | grep -E '^(permitrootlogin|passwordauthentication|pubkeyauthentication) '
    printf '%s\n' "$sshd_effective" | grep -q '^permitrootlogin no$' \
      && pass "SSH root login is disabled" || fail "SSH root login is not explicitly disabled"
    printf '%s\n' "$sshd_effective" | grep -q '^passwordauthentication no$' \
      && pass "SSH password authentication is disabled" || fail "SSH password authentication is enabled"
  else
    warn "Could not read effective SSH daemon settings"
  fi
fi

section "Backups"
if [[ -d "$BACKUP_DIR" ]]; then
  release_count="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name 'stapleit-theme-????????-??????.tar.gz' 2>/dev/null | wc -l)"
  backup_size="$(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}' || true)"
  printf 'Rollback releases: %s\n' "$release_count"
  printf 'Backup storage used: %s\n' "${backup_size:-unavailable}"
  find "$BACKUP_DIR" -maxdepth 1 -type f -name 'stapleit-theme-????????-??????.tar.gz' \
    -printf '%TY-%Tm-%Td %TH:%TM %10s %p\n' 2>/dev/null | sort | tail -5
  if [[ "$release_count" -eq 0 ]]; then
    fail "Theme deployment backup directory contains no rollback releases"
  elif [[ "$release_count" -le "$BACKUP_RETENTION" ]]; then
    pass "Rollback release count is within the $BACKUP_RETENTION-release retention policy"
  else
    warn "Rollback release count exceeds the $BACKUP_RETENTION-release retention policy"
  fi
else
  fail "Theme backup directory not found at $BACKUP_DIR"
fi

section "Public staging behaviour"
if ! have curl; then
  warn "curl is unavailable; public checks skipped"
else
  homepage_headers="$(curl -fsSI --max-time 20 "$STAGING_URL/" 2>/dev/null || true)"
  if printf '%s\n' "$homepage_headers" | grep -Eqi '^x-robots-tag:.*noindex'; then
    pass "Staging sends an X-Robots-Tag noindex header"
  else
    fail "Staging is missing the X-Robots-Tag noindex header"
  fi

  if printf '%s\n' "$homepage_headers" | grep -Eqi '^content-security-policy:.*default-src'; then
    pass "Staging enforces the full Content-Security-Policy"
  else
    fail "Staging only reports CSP violations or is missing an enforced CSP"
  fi

  if printf '%s\n' "$homepage_headers" | grep -Eqi '^content-security-policy:.*frame-ancestors.*none|^x-frame-options: *(deny|sameorigin)'; then
    pass "Staging has clickjacking protection"
  else
    fail "Staging is missing frame-ancestors/X-Frame-Options protection"
  fi

  if printf '%s\n' "$homepage_headers" | grep -Eqi '^strict-transport-security:.*max-age='; then
    pass "Staging sends HSTS"
  else
    fail "Staging is missing HSTS"
  fi

  if printf '%s\n' "$homepage_headers" | grep -Eqi '^x-content-type-options: *nosniff'; then
    pass "Staging prevents MIME sniffing"
  else
    fail "Staging is missing X-Content-Type-Options: nosniff"
  fi

  robots_body="$(curl -fsS --max-time 20 "$STAGING_URL/robots.txt" 2>/dev/null || true)"
  if printf '%s\n' "$robots_body" | grep -Eq '^Disallow: /$'; then
    pass "Staging robots.txt disallows all crawling"
  else
    fail "Staging robots.txt does not disallow all crawling"
  fi

  not_found_body="$(curl -sS --max-time 20 "$STAGING_URL/__stapleit_audit_missing_page__" 2>/dev/null || true)"
  not_found_status="$(curl -sS -o /dev/null --max-time 20 -w '%{http_code}' "$STAGING_URL/__stapleit_audit_missing_page__" 2>/dev/null || true)"
  if [[ "$not_found_status" == "404" ]] && printf '%s\n' "$not_found_body" | grep -Fq 'That page isn’t here.'; then
    pass "Custom 404 renders with HTTP 404"
  else
    fail "Custom 404 is not active"
  fi

  sitemap_result="$(curl -sS -L -o /dev/null --max-time 20 -w '%{http_code} %{url_effective}' "$STAGING_URL/sitemap.xml" 2>/dev/null || true)"
  sitemap_status="${sitemap_result%% *}"
  sitemap_target="${sitemap_result#* }"
  printf 'Sitemap final status: %s (%s)\n' "${sitemap_status:-unavailable}" "${sitemap_target:-unavailable}"
  if [[ "$sitemap_status" == "200" || "$sitemap_status" == "404" ]]; then
    pass "Staging sitemap route resolves without a redirect loop or server error"
  else
    warn "Staging sitemap route returned an unexpected final status"
  fi

  security_body="$(curl -fsS --max-time 20 "$STAGING_URL/.well-known/security.txt" 2>/dev/null || true)"
  if printf '%s\n' "$security_body" | grep -Fq 'Contact: mailto:hello@stapleit.co.uk'; then
    pass "security.txt publishes the security contact"
  else
    fail "security.txt is missing or does not publish the expected contact"
  fi

  xmlrpc_status="$(curl -sS -o /dev/null --max-time 20 -w '%{http_code}' -X POST "$STAGING_URL/xmlrpc.php" --data '' 2>/dev/null || true)"
  if [[ "$xmlrpc_status" == "403" || "$xmlrpc_status" == "404" || "$xmlrpc_status" == "405" ]]; then
    pass "XML-RPC is blocked at the edge/origin"
  else
    fail "XML-RPC POST remains reachable (HTTP ${xmlrpc_status:-unavailable})"
  fi

  login_headers="$(curl -sS -o /dev/null -D - --max-time 20 "$STAGING_URL/wp-login.php" 2>/dev/null || true)"
  login_status="$(printf '%s\n' "$login_headers" | awk '/^HTTP\//{status=$2} END{print status}')"
  if [[ "$login_status" == "401" || "$login_status" == "403" ]] || printf '%s\n' "$login_headers" | grep -Eqi '^location:.*cloudflareaccess\.com'; then
    pass "Development WordPress login is protected by an access policy"
  else
    fail "Development WordPress login is publicly reachable (HTTP ${login_status:-unavailable})"
  fi

  asset_headers="$(curl -fsSI --max-time 20 "$STAGING_URL/wp-content/themes/stapleit/assets/css/home.bundle.css" 2>/dev/null || true)"
  if printf '%s\n' "$asset_headers" | grep -Eqi '^cache-control:.*max-age=31536000.*immutable'; then
    pass "Revisioned theme assets use the immutable one-year cache policy"
  else
    warn "Theme assets are not yet using the immutable one-year cache policy"
  fi
fi

section "Summary"
printf 'Warnings: %d\n' "$warnings"
printf 'Failures: %d\n' "$failures"
if (( failures > 0 )); then
  exit 1
fi
exit 0
