#!/usr/bin/env bash
# Free port 3000 (SchoolX API) if something is already listening.
set -euo pipefail

PORT="${PORT:-3000}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$ROOT/logs/api.pid"

if [[ -f "$PID_FILE" ]]; then
  pid="$(cat "$PID_FILE")"
  if kill -0 "$pid" 2>/dev/null; then
    echo "Stopping API (pid $pid)..."
    kill "$pid" 2>/dev/null || true
    sleep 1
  fi
  rm -f "$PID_FILE"
fi

pids="$(lsof -ti :"$PORT" 2>/dev/null || true)"
if [[ -n "$pids" ]]; then
  echo "Stopping process(es) on port $PORT: $pids"
  kill $pids 2>/dev/null || true
  sleep 1
fi

if lsof -i :"$PORT" >/dev/null 2>&1; then
  echo "Port $PORT still in use. Force kill with: kill -9 \$(lsof -ti :$PORT)"
  exit 1
fi

echo "Port $PORT is free. Run: cd backend && npm run dev"
