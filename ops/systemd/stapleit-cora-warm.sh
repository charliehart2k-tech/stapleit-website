#!/usr/bin/env bash
set -euo pipefail

endpoint="http://127.0.0.1:11434"
for _ in $(seq 1 30); do
  if curl -fsS --max-time 2 "$endpoint/api/tags" >/dev/null; then
    break
  fi
  sleep 1
done

curl -fsS --max-time 60 \
  -H 'Content-Type: application/json' \
  "$endpoint/api/generate" \
  -d '{"model":"qwen2.5:1.5b-instruct-q5_0","prompt":"","stream":false,"keep_alive":-1,"options":{"num_ctx":1280}}' \
  >/dev/null
