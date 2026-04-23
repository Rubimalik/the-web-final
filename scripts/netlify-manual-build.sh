#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${NETLIFY_AUTH_TOKEN:-}" ]]; then
  echo "NETLIFY_AUTH_TOKEN is required for netlify build." >&2
  exit 1
fi

cd "$ROOT_DIR"

npx --yes netlify-cli build
npm run netlify:manual:shim
