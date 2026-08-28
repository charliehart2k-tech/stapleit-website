#!/usr/bin/env bash
set -euo pipefail

: "${CORA_OPENAI_API_KEY:?Set CORA_OPENAI_API_KEY in the environment; it is never written to stdout.}"
MODEL="${CORA_OPENAI_MODEL:-gpt-5.6-terra}"
BASE_URL="${CORA_OPENAI_BASE_URL:-https://api.openai.com/v1}"
VECTOR_STORE_ID="${CORA_OPENAI_VECTOR_STORE_ID:-}"
CONFIG_FILE="${CORA_CONFIG_FILE:-/etc/stapleit/cora-ai.php}"
WP_CONFIG="${CORA_WP_CONFIG:-/var/www/stapleit/wp-config.php}"
RELOAD_FPM="${CORA_RELOAD_FPM:-1}"

install -d -m 0750 -o root -g www-data "$(dirname "$CONFIG_FILE")"
CORA_KEY="$CORA_OPENAI_API_KEY" CORA_MODEL="$MODEL" CORA_BASE="$BASE_URL" CORA_VECTOR="$VECTOR_STORE_ID" CORA_OUT="$CONFIG_FILE" python3 - <<'PY'
import os
from pathlib import Path

def phpq(value: str) -> str:
    return value.replace('\\','\\\\').replace("'","\\'")
path=Path(os.environ['CORA_OUT'])
body="""<?php
// Server-local Cora AI provider configuration. Never commit this file.
define( 'STAPLEIT_OPENAI_API_KEY', '%s' );
define( 'STAPLEIT_OPENAI_MODEL', '%s' );
define( 'STAPLEIT_OPENAI_BASE_URL', '%s' );
define( 'STAPLEIT_OPENAI_VECTOR_STORE_ID', '%s' );
""" % tuple(phpq(os.environ[k]) for k in ('CORA_KEY','CORA_MODEL','CORA_BASE','CORA_VECTOR'))
path.write_text(body,encoding='utf-8')
PY
chown root:www-data "$CONFIG_FILE"
chmod 0640 "$CONFIG_FILE"
php -l "$CONFIG_FILE" >/dev/null

if [[ ! -f "$WP_CONFIG" ]]; then
  echo "WordPress config not found: $WP_CONFIG" >&2
  exit 1
fi
if ! grep -Fq "$CONFIG_FILE" "$WP_CONFIG"; then
  cp "$WP_CONFIG" "$WP_CONFIG.cora-ai.bak"
  python3 - "$WP_CONFIG" "$CONFIG_FILE" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1]); config=sys.argv[2]; s=p.read_text()
q=config.replace('\\','\\\\').replace("'","\\'")
line="\n// Staple IT Cora hosted-AI secret config (server-local, not in Git).\nif ( is_readable( '%s' ) ) { require_once '%s'; }\n" % (q,q)
marker="/* That's all, stop editing! Happy publishing. */"
if marker in s: s=s.replace(marker,line+"\n"+marker,1)
else: s+=line
p.write_text(s)
PY
fi
php -l "$WP_CONFIG" >/dev/null

if [[ "$RELOAD_FPM" == "1" ]]; then
  while read -r unit; do
    [[ -n "$unit" ]] && systemctl reload "$unit"
  done < <(systemctl list-units --type=service --state=running --plain --no-legend 'php*-fpm.service' | awk '{print $1}')
fi

echo "Cora hosted provider configured: model=$MODEL base=$BASE_URL vector_store=${VECTOR_STORE_ID:-none}"
echo "API key stored server-side in $CONFIG_FILE (not printed)."
