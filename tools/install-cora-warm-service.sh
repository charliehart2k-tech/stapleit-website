#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-/srv/stapleit/repo}"
if (( EUID != 0 )); then
  exec sudo "$0" "$@"
fi

install -m 0755 "$REPO/ops/systemd/stapleit-cora-warm.sh" /usr/local/sbin/stapleit-cora-warm
mkdir -p /etc/systemd/system/ollama.service.d
install -m 0644 "$REPO/ops/systemd/ollama-stapleit-cora.conf" /etc/systemd/system/ollama.service.d/stapleit-cora.conf
systemctl daemon-reload
systemctl restart ollama
systemctl is-active --quiet ollama
curl -fsS --max-time 10 http://127.0.0.1:11434/api/tags >/dev/null

echo 'PASS: Cora model warm/pin configuration installed and Ollama restarted.'
