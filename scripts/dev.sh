#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "Starting API on http://localhost:3000"
echo "Starting Admin on http://localhost:5173"
echo ""

npm install 2>/dev/null || true
cd backend && npm install 2>/dev/null
cd ../admin-web && npm install 2>/dev/null
cd ..

npx concurrently -k -n api,admin -c blue,green \
  "cd backend && npm run dev" \
  "cd admin-web && npm run dev"
