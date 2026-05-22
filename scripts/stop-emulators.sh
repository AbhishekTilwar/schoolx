#!/usr/bin/env bash
# Stop Flutter run processes started by run-emulators.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT/logs"

stop_pid_file() {
  local name="$1"
  local pid_file="$LOG_DIR/${name}.pid"
  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file")"
    if kill -0 "$pid" 2>/dev/null; then
      echo "Stopping $name (pid $pid)..."
      kill "$pid" 2>/dev/null || true
      # Kill child flutter/dart processes
      pkill -P "$pid" 2>/dev/null || true
    fi
    rm -f "$pid_file"
  fi
}

stop_pid_file "teacher"
stop_pid_file "student"
stop_pid_file "api"

echo "Done. Emulator may still be open — close from Android Emulator UI if needed."
