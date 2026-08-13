#!/usr/bin/env bash
set -euo pipefail

# Run on the VPS after a new release folder has been uploaded.
# Example: sudo ./activate-release.sh 2026-08-13-1400

RELEASE_NAME="${1:-}"
ROOT="/var/www/stapleit"
RELEASES="$ROOT/releases"
CURRENT="$ROOT/current"

if [[ -z "$RELEASE_NAME" ]]; then
  echo "Usage: $0 <release-folder-name>" >&2
  exit 2
fi
TARGET="$RELEASES/$RELEASE_NAME"
if [[ ! -f "$TARGET/index.html" ]]; then
  echo "Release does not look valid: $TARGET/index.html is missing" >&2
  exit 1
fi

ln -sfn "$TARGET" "$CURRENT.next"
mv -Tf "$CURRENT.next" "$CURRENT"
nginx -t
systemctl reload nginx
printf 'Activated %s -> %s\n' "$CURRENT" "$TARGET"
