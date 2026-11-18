#!/usr/bin/env bash
# Sync Things to Do events from Google Sheets, build for staging, deploy to Cloudflare.
# Usage: npm run deploy:staging
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Syncing events from Google Sheets..."
npm run sync-events

echo "==> Building for staging..."
npm run build:staging

echo "==> Deploying to Cloudflare staging..."
npx wrangler deploy --env staging

echo "==> Done. Staging is updated with the latest events."
