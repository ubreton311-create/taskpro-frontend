#!/usr/bin/env bash
set -euo pipefail

# These checks are deterministic: Playwright mocks API responses and blocks
# third-party requests. No real bookings or production calls are made.
if [[ ! -d node_modules ]]; then
  echo 'Dependencies are missing. Run npm ci first.' >&2
  exit 1
fi
export VITE_API_URL=https://api.example.com
npm run lint
npm run build
npm run test:ux
