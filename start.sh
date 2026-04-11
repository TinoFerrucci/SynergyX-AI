#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PORT=${BACKEND_PORT:-8000}
FRONTEND_PORT=${FRONTEND_PORT:-5173}
DB_FILE="$BACKEND_DIR/synergyx.db"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[SynergyX]${NC} $*"; }
ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; }

kill_port() {
    local port=$1
    local pids
    pids=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        warn "Killing process(es) on port $port: $pids"
        echo "$pids" | xargs -r kill -9 2>/dev/null || true
        sleep 1
    fi
}

cleanup() {
    log "Shutting down..."
    kill 0 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# ── 0. Prerequisites ──────────────────────────────────────────────
log "Checking prerequisites..."

if ! command -v uv &>/dev/null; then
    err "'uv' is not installed. Install it: https://docs.astral.sh/uv/"
    exit 1
fi
ok "uv found"

if ! command -v node &>/dev/null; then
    err "'node' is not installed."
    exit 1
fi
ok "node found"

if ! command -v npm &>/dev/null; then
    err "'npm' is not installed."
    exit 1
fi
ok "npm found"

# ── 1. Kill existing processes ────────────────────────────────────
log "Cleaning up existing processes..."
kill_port "$BACKEND_PORT"
kill_port "$FRONTEND_PORT"
ok "Ports $BACKEND_PORT and $FRONTEND_PORT are free"

# ── 2. Load .env ──────────────────────────────────────────────────
if [ -f "$BACKEND_DIR/.env" ]; then
    set -a
    source "$BACKEND_DIR/.env"
    set +a
fi

if [ -z "${OPENAI_API_KEY:-}" ] || [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
    warn "OPENAI_API_KEY is not set in backend/.env"
    warn "AI features (CV parsing, team generation) will fail."
    warn "Set your key in backend/.env and re-run."
fi

# ── 3. Backend setup ─────────────────────────────────────────────
log "Setting up backend..."
(
    cd "$BACKEND_DIR"

    if [ ! -d ".venv" ]; then
        log "Creating backend virtual environment..."
        uv sync
    else
        log "Syncing backend dependencies..."
        uv sync --quiet
    fi
)
ok "Backend dependencies ready"

# ── 4. Frontend setup ────────────────────────────────────────────
log "Setting up frontend..."
(
    cd "$FRONTEND_DIR"

    if [ ! -d "node_modules" ]; then
        log "Installing frontend dependencies..."
        npm install --silent
    else
        log "Checking frontend dependencies..."
        npm install --silent 2>/dev/null || true
    fi
)
ok "Frontend dependencies ready"

# ── 5. Remove stale DB ───────────────────────────────────────────
if [ -f "$DB_FILE" ]; then
    warn "Existing database found. Removing to start fresh..."
    rm -f "$DB_FILE"
    ok "Database reset"
fi

# ── 6. Start backend ─────────────────────────────────────────────
log "Starting backend on port $BACKEND_PORT..."
(
    cd "$BACKEND_DIR"
    uv run uvicorn app.main:app --host 0.0.0.0 --port "$BACKEND_PORT" --reload
) &
BACKEND_PID=$!
ok "Backend started (PID $BACKEND_PID)"

# ── 7. Wait for backend health ───────────────────────────────────
log "Waiting for backend to be ready..."
MAX_RETRIES=30
for i in $(seq 1 $MAX_RETRIES); do
    if curl -sf "http://localhost:$BACKEND_PORT/api/health" >/dev/null 2>&1; then
        break
    fi
    if [ "$i" -eq "$MAX_RETRIES" ]; then
        err "Backend did not start in time."
        cleanup
    fi
    sleep 0.5
done
ok "Backend is healthy"

# ── 8. Seed database ─────────────────────────────────────────────
log "Seeding database with mock CVs..."
(
    cd "$BACKEND_DIR"
    uv run python seed_cvs.py --url "http://localhost:$BACKEND_PORT/api"
)
ok "Database seeded"

# ── 9. Start frontend ────────────────────────────────────────────
log "Starting frontend on port $FRONTEND_PORT..."
(
    cd "$FRONTEND_DIR"
    npm run dev -- --port "$FRONTEND_PORT" --host
) &
FRONTEND_PID=$!
ok "Frontend started (PID $FRONTEND_PID)"

# ── 10. Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           SynergyX-AI is running!                       ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  Frontend : ${CYAN}http://localhost:$FRONTEND_PORT${NC}                    ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Backend  : ${CYAN}http://localhost:$BACKEND_PORT${NC}                    ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  API Docs : ${CYAN}http://localhost:$BACKEND_PORT/docs${NC}                ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Profiles : ${CYAN}8 seeded${NC}                                      ${GREEN}║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  Press ${YELLOW}Ctrl+C${NC} to stop all services                    ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

wait
