#!/usr/bin/env bash

# Automated redeploy helper for the Resort backend on a GCP VM.
# The script recreates the working tree from the remote Git repository while
# preserving the existing .env file, installs dependencies, builds the project,
# and reloads PM2 + Nginx.

set -Eeuo pipefail

# -------- Configurable parameters (override via env vars before running) -----
APP_DIR="${APP_DIR:-/var/www/resort-be}"
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-}"
PM2_APP="${PM2_APP:-resort-be}"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"
NODE_ENVIRONMENT="${NODE_ENV:-production}"
# -----------------------------------------------------------------------------

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2
}

ensure_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Required command '$1' is missing."
    exit 1
  fi
}

ensure_command git
ensure_command npm
ensure_command pm2

SUDO_BIN=""
if command -v sudo >/dev/null 2>&1; then
  if sudo -n true >/dev/null 2>&1; then
    SUDO_BIN="sudo"
  else
    log "sudo detected but passwordless execution is not available; continuing without sudo."
  fi
fi

if [[ ! -d "$APP_DIR" ]]; then
  log "Target directory '$APP_DIR' does not exist yet. Assuming first-time deployment."
  mkdir -p "$APP_DIR"
  rmdir "$APP_DIR"
fi

# Capture repository details before moving anything.
if [[ -z "$REPO_URL" ]]; then
  if [[ -d "$APP_DIR/.git" ]]; then
    REPO_URL="$(git -C "$APP_DIR" remote get-url origin)"
  else
    log "REPO_URL is not set and cannot be inferred. Export REPO_URL before running."
    exit 1
  fi
fi

if [[ -z "$BRANCH" ]]; then
  if [[ -d "$APP_DIR/.git" ]]; then
    BRANCH="$(git -C "$APP_DIR" rev-parse --abbrev-ref HEAD)"
  else
    BRANCH="main"
    log "BRANCH not specified; defaulting to '${BRANCH}'."
  fi
fi

timestamp="$(date '+%Y%m%d-%H%M%S')"
prev_dir=""

rollback() {
  local exit_code=$?
  log "Deployment failed with exit code ${exit_code}. Restoring previous version if available..."
  if [[ -n "$prev_dir" && -d "$prev_dir" ]]; then
    rm -rf "$APP_DIR" >/dev/null 2>&1 || true
    mv "$prev_dir" "$APP_DIR"
    log "Rollback complete. Previous version restored."
  fi
  exit "$exit_code"
}

trap rollback ERR

if [[ -d "$APP_DIR" ]]; then
  prev_dir="${APP_DIR}.prev.${timestamp}"
  log "Renaming current application directory to '${prev_dir}'."
  mv "$APP_DIR" "$prev_dir"
fi

log "Cloning ${REPO_URL} (${BRANCH}) into ${APP_DIR}."
git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$APP_DIR"

if [[ -n "$prev_dir" && -f "${prev_dir}/.env" ]]; then
  log "Restoring existing .env file into the new working tree."
  cp -p "${prev_dir}/.env" "${APP_DIR}/.env"
fi

log "Installing dependencies (npm ci)."
cd "$APP_DIR"
export NODE_ENV="$NODE_ENVIRONMENT"
npm ci

log "Building project artifacts (npm run build)."
npm run build

log "Running database migrations (npm run migration:run --if-present)."
npm run migration:run --if-present

if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
  log "Reloading PM2 process '${PM2_APP}'."
  pm2 reload "$PM2_APP" --update-env
else
  log "PM2 process '${PM2_APP}' not found. Starting a new one."
  pm2 start npm --name "$PM2_APP" -- run start:prod
fi

pm2 save

if [[ -n "$SUDO_BIN" || $(id -u) -eq 0 ]]; then
  log "Reloading Nginx service '${NGINX_SERVICE}'."
  ${SUDO_BIN} systemctl reload "$NGINX_SERVICE"
else
  log "Skipping Nginx reload because sudo/root privileges are unavailable."
fi

trap - ERR

log "Deployment completed successfully."

if [[ -n "$prev_dir" && -d "$prev_dir" ]]; then
  log "Previous deployment preserved at '${prev_dir}'. Remove manually once verified."
fi
