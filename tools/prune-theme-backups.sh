#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/home/deploy/stapleit-theme-backups}"
BACKUP_RETENTION="${BACKUP_RETENTION:-5}"

if [[ ! "$BACKUP_RETENTION" =~ ^[0-9]+$ ]] || (( BACKUP_RETENTION < 2 )); then
  echo "BACKUP_RETENTION must be an integer of at least 2." >&2
  exit 1
fi

backup_root="$(realpath -m -- "$BACKUP_DIR")"
case "$backup_root" in
  /|/home|/home/deploy)
    echo "Refusing to prune unsafe backup path: $backup_root" >&2
    exit 1
    ;;
esac

if [[ ! -d "$backup_root" ]]; then
  echo "Backup directory does not exist; nothing to prune: $backup_root"
  exit 0
fi

mapfile -t archives < <(
  find "$backup_root" -maxdepth 1 -type f \
    -name 'stapleit-theme-????????-??????.tar.gz' -print | sort -r
)

if (( ${#archives[@]} <= BACKUP_RETENTION )); then
  echo "Rollback backups retained: ${#archives[@]} of $BACKUP_RETENTION maximum"
  exit 0
fi

removed=0
for archive in "${archives[@]:BACKUP_RETENTION}"; do
  archive_name="${archive##*/}"
  if [[ ! "$archive_name" =~ ^stapleit-theme-([0-9]{8}-[0-9]{6})\.tar\.gz$ ]]; then
    echo "Skipping unexpected rollback filename: $archive_name" >&2
    continue
  fi

  stamp="${BASH_REMATCH[1]}"
  static_backup="$backup_root/static-templates-$stamp"
  routes_backup="$backup_root/stapleit-static-routes-$stamp.php"

  rm -f -- "$archive"
  if [[ -L "$static_backup" ]]; then
    rm -f -- "$static_backup"
  elif [[ -d "$static_backup" ]]; then
    rm -rf -- "$static_backup"
  fi
  rm -f -- "$routes_backup"
  removed=$((removed + 1))
done

echo "Pruned rollback releases: $removed"
echo "Rollback backups retained: $BACKUP_RETENTION"
