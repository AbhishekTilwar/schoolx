#!/usr/bin/env bash
# Start API (if needed), boot Android emulator, run Teacher + Student Flutter apps.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

EMULATOR_ID="${EMULATOR_ID:-Medium_Phone_API_36.1}"
API_PORT="${API_PORT:-3000}"
LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"

# Android SDK on PATH
if [[ -n "${ANDROID_HOME:-}" ]]; then
  export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
elif [[ -d "$HOME/Library/Android/sdk" ]]; then
  export ANDROID_HOME="$HOME/Library/Android/sdk"
  export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
fi

log() { echo "$@" >&2; }

get_android_device_id() {
  flutter devices --machine 2>/dev/null | python3 -c "
import sys, json
try:
    devices = json.load(sys.stdin)
except Exception:
    sys.exit(1)
for d in devices:
    platform = d.get('targetPlatform') or ''
    if d.get('emulator') and platform.startswith('android'):
        print(d['id'])
        sys.exit(0)
for d in devices:
    platform = d.get('targetPlatform') or ''
    if platform.startswith('android'):
        print(d['id'])
        sys.exit(0)
sys.exit(1)
" 2>/dev/null || true
}

wait_for_android_device() {
  log "Waiting for Android emulator (up to 3 min)..."
  local i id
  for i in $(seq 1 90); do
    id="$(get_android_device_id)"
    if [[ -n "$id" ]]; then
      printf '%s' "$id"
      return 0
    fi
    sleep 2
  done
  return 1
}

release_flutter_lock() {
  local flutter_root
  flutter_root="$(dirname "$(dirname "$(which flutter)")")"
  local lockfile="$flutter_root/bin/cache/lockfile"
  if [[ -f "$lockfile" ]]; then
    log "Clearing stale Flutter lock..."
    rm -f "$lockfile" 2>/dev/null || true
  fi
  pkill -f "flutter emulators --launch" 2>/dev/null || true
  sleep 1
}

ensure_api() {
  if curl -sf "http://localhost:${API_PORT}/health" >/dev/null 2>&1; then
    log "✓ API already running at http://localhost:${API_PORT}"
    return 0
  fi
  log "Starting API..."
  cd "$ROOT/backend"
  nohup npm run dev > "$LOG_DIR/api.log" 2>&1 &
  echo $! > "$LOG_DIR/api.pid"
  cd "$ROOT"
  local _
  for _ in $(seq 1 40); do
    if curl -sf "http://localhost:${API_PORT}/health" >/dev/null 2>&1; then
      log "✓ API ready at http://localhost:${API_PORT}"
      return 0
    fi
    sleep 1
  done
  log "✗ API failed to start. See $LOG_DIR/api.log"
  exit 1
}

ensure_emulator() {
  local device_id
  device_id="$(get_android_device_id)"
  if [[ -n "$device_id" ]]; then
    log "✓ Android device already running: $device_id"
    printf '%s' "$device_id"
    return 0
  fi

  release_flutter_lock

  log "Launching emulator: $EMULATOR_ID"
  if [[ -x "${ANDROID_HOME:-}/emulator/emulator" ]]; then
    nohup "${ANDROID_HOME}/emulator/emulator" -avd "$EMULATOR_ID" > "$LOG_DIR/emulator.log" 2>&1 &
  else
    flutter emulators --launch "$EMULATOR_ID" >> "$LOG_DIR/emulator.log" 2>&1 &
  fi

  device_id="$(wait_for_android_device)" || device_id=""
  if [[ -z "$device_id" ]]; then
    log "✗ No Android emulator detected."
    log "  Open Android Studio → Device Manager → start an AVD, or run:"
    log "  flutter emulators --launch $EMULATOR_ID"
    log "  See logs/emulator.log for details."
    exit 1
  fi
  log "✓ Emulator ready: $device_id"
  printf '%s' "$device_id"
}

run_flutter_app() {
  local app_dir="$1"
  local app_name="$2"
  local device_id="$3"
  local vm_port="$4"
  local pid_file="$LOG_DIR/${app_name}.pid"
  local log_file="$LOG_DIR/${app_name}.log"

  if [[ -f "$pid_file" ]]; then
    local old_pid
    old_pid="$(cat "$pid_file")"
    if kill -0 "$old_pid" 2>/dev/null; then
      log "Stopping previous $app_name process (pid $old_pid)..."
      kill "$old_pid" 2>/dev/null || true
      pkill -P "$old_pid" 2>/dev/null || true
      sleep 2
    fi
    rm -f "$pid_file"
  fi

  cd "$ROOT/$app_dir"
  flutter pub get >/dev/null 2>&1 || flutter pub get

  log "▶ Building & launching $app_name on $device_id (logs: $log_file)"
  nohup flutter run -d "$device_id" --device-vmservice-port="$vm_port" > "$log_file" 2>&1 &
  echo $! > "$pid_file"
  cd "$ROOT"
}

main() {
  echo "=== SchoolX — Run apps on emulator ===" >&2
  echo "" >&2

  ensure_api

  local device_id
  device_id="$(ensure_emulator)"
  echo "" >&2
  log "Emulator device: $device_id"
  log "API URL for apps: http://10.0.2.2:${API_PORT}/api/v1 (Android)"
  echo "" >&2

  run_flutter_app "app_teacher" "teacher" "$device_id" "8181"
  sleep 8
  run_flutter_app "app_student" "student" "$device_id" "8182"

  echo "" >&2
  log "=== Apps are building (first run may take 5–10 min) ==="
  echo "" >&2
  log "  tail -f logs/teacher.log"
  log "  tail -f logs/student.log"
  echo "" >&2
  log "  Stop: ./scripts/stop-emulators.sh"
  echo "" >&2
  log "Sign in with users from your database (see README — npm run seed)"
}

main "$@"
