#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_ID="${NETLIFY_SITE_ID:-283d1d75-9724-4c1f-8b96-7533b6db6c68}"

if [[ -z "${NETLIFY_AUTH_TOKEN:-}" ]]; then
  echo "NETLIFY_AUTH_TOKEN is required for netlify deploy." >&2
  exit 1
fi

cd "$ROOT_DIR"

npx --yes netlify-cli deploy \
  --prod \
  --no-build \
  --dir=.netlify/static \
  --functions=.netlify/functions-internal \
  --site "$SITE_ID" \
  --skip-functions-cache \
  "$@"
