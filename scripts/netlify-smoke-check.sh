#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${NETLIFY_PRODUCTION_URL:-https://buysupply-pleura-20260421.netlify.app}"

require_status() {
  local expected="$1"
  local path="$2"
  local actual

  actual="$(curl -sS -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")"

  if [[ "$actual" != "$expected" ]]; then
    echo "Smoke check failed for ${path}: expected ${expected}, got ${actual}" >&2
    exit 1
  fi

  echo "OK ${path} -> ${actual}"
}

require_status "200" "/"
require_status "200" "/login"
require_status "401" "/api/settings"

redirect_headers="$(mktemp)"
api_body="$(mktemp)"
api_headers="$(mktemp)"
trap 'rm -f "$redirect_headers" "$api_headers" "$api_body"' EXIT

curl -sS -D "$redirect_headers" -o /dev/null "${BASE_URL}/dashboard" >/dev/null
dashboard_status="$(awk 'NR==1 {print $2}' "$redirect_headers")"
dashboard_location="$(awk 'BEGIN{IGNORECASE=1} /^location:/ {print $2}' "$redirect_headers" | tr -d '\r')"

if [[ "$dashboard_status" != "307" ]]; then
  echo "Smoke check failed for /dashboard: expected 307, got ${dashboard_status}" >&2
  exit 1
fi

if [[ "$dashboard_location" != "/login?from=%2Fdashboard" ]]; then
  echo "Smoke check failed for /dashboard location: got ${dashboard_location}" >&2
  exit 1
fi

echo "OK /dashboard -> 307 ${dashboard_location}"

curl -sS -D "$api_headers" -o "$api_body" "${BASE_URL}/api/settings" >/dev/null
api_status="$(awk 'NR==1 {print $2}' "$api_headers")"

if [[ "$api_status" != "401" ]]; then
  echo "Smoke check failed for /api/settings body check: expected 401, got ${api_status}" >&2
  exit 1
fi

if ! rg -q '"error":"Unauthorized"' "$api_body"; then
  echo "Smoke check failed for /api/settings body: Unauthorized payload missing" >&2
  exit 1
fi

echo "OK /api/settings body contains Unauthorized"
echo "Netlify smoke check passed for ${BASE_URL}"
