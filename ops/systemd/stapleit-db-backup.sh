#!/usr/bin/env bash
set -euo pipefail
BACKUP_DIR=/var/backups/stapleit-db
STAMP=$(date -u +%Y%m%d-%H%M%S)
TMP="$BACKUP_DIR/.stapleit-$STAMP.sql"
OUT="$BACKUP_DIR/stapleit-$STAMP.sql.gz"
install -d -m 0700 -o root -g root "$BACKUP_DIR"
wp --path=/var/www/stapleit db export "$TMP" --allow-root --quiet
gzip -9 "$TMP"
mv "$TMP.gz" "$OUT"
chmod 0600 "$OUT"
find "$BACKUP_DIR" -type f -name 'stapleit-*.sql.gz' -mtime +14 -delete
printf 'Created %s (%s bytes)\n' "$OUT" "$(stat -c %s "$OUT")"
