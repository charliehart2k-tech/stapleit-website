#!/usr/bin/env bash
set -euo pipefail
: "${OPENAI_API_KEY:?Set OPENAI_API_KEY in the environment. The key is not printed.}"
BASE="${OPENAI_API_BASE_URL:-https://api.openai.com/v1}"
MODEL="${CORA_FINETUNE_BASE_MODEL:-gpt-4.1-mini-2025-04-14}"
TRAIN="${CORA_FINETUNE_TRAIN:-training/cora-sft-train.jsonl}"
VALID="${CORA_FINETUNE_VALIDATION:-training/cora-sft-validation.jsonl}"

[[ -s "$TRAIN" && -s "$VALID" ]] || { echo "Fine-tune dataset missing; run tools/build-cora-finetune.py first." >&2; exit 1; }
python3 tools/build-cora-finetune.py --root . --check >/dev/null

upload() {
  local file="$1" response
  response="$(curl -fsS "$BASE/files" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -F purpose=fine-tune \
    -F "file=@$file")"
  python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["id"])' <<<"$response"
}

train_id="$(upload "$TRAIN")"
valid_id="$(upload "$VALID")"
payload="$(python3 - "$MODEL" "$train_id" "$valid_id" <<'PY'
import json,sys
print(json.dumps({
  "model":sys.argv[1],
  "training_file":sys.argv[2],
  "validation_file":sys.argv[3],
  "suffix":"stapleit-cora"
}))
PY
)"
response="$(curl -fsS "$BASE/fine_tuning/jobs" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "$payload")"
python3 - <<'PY' <<<"$response"
import json,sys
d=json.load(sys.stdin)
print('Cora fine-tune submitted')
print('job_id='+str(d.get('id','')))
print('status='+str(d.get('status','')))
print('base_model='+str(d.get('model','')))
PY
