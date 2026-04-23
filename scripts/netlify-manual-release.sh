#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/netlify-manual-build.sh"
"$ROOT_DIR/scripts/netlify-manual-deploy.sh" "$@"
"$ROOT_DIR/scripts/netlify-smoke-check.sh"
