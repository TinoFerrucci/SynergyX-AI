#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
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

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    log "Shutting down..."
    [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null || true
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

kill_port() {
    local port=$1
    local pids

    # Stop Docker containers bound to this port (they live in a separate
    # network namespace so lsof/fuser can't see them)
    if command -v docker &>/dev/null; then
        local containers
        containers=$(docker ps --format '{{.Names}} {{.Ports}}' 2>/dev/null \
            | awk -v p="$port" '$0 ~ "0.0.0.0:"p"->" || $0 ~ "\\[::\\]:"p"->" {print $1}')
        if [ -n "$containers" ]; then
            warn "Stopping Docker container(s) on port $port: $containers"
            echo "$containers" | xargs -r docker stop 2>/dev/null || true
        fi
    fi

    # Gather all PIDs holding the port (lsof + fuser sweep)
    pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        warn "Killing process(es) on port $port: $pids"
        echo "$pids" | xargs -r kill -9 2>/dev/null || true
    fi
    fuser -k "${port}/tcp" 2>/dev/null || true

    # Wait until ss confirms the port is free (up to 5 s)
    local waited=0
    while ss -tlnH "sport = :$port" 2>/dev/null | grep -q .; do
        if [ "$waited" -ge 10 ]; then
            warn "Port $port still in use after 5 s — proceeding anyway"
            break
        fi
        sleep 0.5
        waited=$((waited + 1))
    done
}

# ── 0. Load .env (must be first so port vars are correct) ────────────────────
if [ -f "$ROOT_DIR/.env" ]; then
    set -a; source "$ROOT_DIR/.env"; set +a
fi
if [ -f "$BACKEND_DIR/.env" ]; then
    set -a; source "$BACKEND_DIR/.env"; set +a
fi

BACKEND_PORT=${BACKEND_PORT:-8000}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

# ── 1. Prerequisites ─────────────────────────────────────────────────────────
log "Checking prerequisites..."

for cmd in uv node npm; do
    if ! command -v "$cmd" &>/dev/null; then
        err "'$cmd' is not installed."
        exit 1
    fi
    ok "$cmd found"
done

# ── 2. Kill existing processes on configured ports ───────────────────────────
log "Cleaning up existing processes on ports $BACKEND_PORT and $FRONTEND_PORT..."
kill_port "$BACKEND_PORT"
kill_port "$FRONTEND_PORT"
ok "Ports $BACKEND_PORT and $FRONTEND_PORT are free"

# ── 3. Validate API key ───────────────────────────────────────────────────────
if [ -z "${OPENAI_API_KEY:-}" ] || [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
    warn "OPENAI_API_KEY is not set. AI features will fail."
    warn "Set your key in .env or backend/.env and re-run."
fi

# ── 4. Backend setup ──────────────────────────────────────────────────────────
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

# ── 5. Frontend setup ─────────────────────────────────────────────────────────
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

# ── 6. Database & seed decisions ─────────────────────────────────────────────
TOTAL_PROFILES=16
SEED_COUNT=0
RESET_DB=false

echo ""
if [ -f "$DB_FILE" ]; then
    echo -e "${YELLOW}[?]${NC} Database already exists. Reset it and re-seed? [y/N]: \c"
    read -r _ans </dev/tty || _ans="n"
    if [[ "$_ans" =~ ^[Yy]$ ]]; then
        RESET_DB=true
        rm -f "$DB_FILE"
        ok "Database reset"
    else
        ok "Keeping existing database — skipping seed"
    fi
else
    RESET_DB=true
fi

if [ "$RESET_DB" = true ]; then
    echo ""
    echo -e "${CYAN}    Available profiles (${TOTAL_PROFILES} total):${NC}"
    echo "     1-8  : Ana Martinez, Carlos Ruiz, Sofia Chen, Marcus Johnson,"
    echo "            Elena Petrova, Diego Santos, Priya Sharma, James Wilson"
    echo "     9-16 : Maria Gonzalez, Thomas Brown, Luciana Ferreira, Robert Taylor,"
    echo "            Akiko Yamamoto, Omar Hassan, Valerie Dupont, Daniel Kim"
    echo ""
    echo -e "${YELLOW}[?]${NC} How many profiles to seed? (0 = skip, 1-${TOTAL_PROFILES}, default 8): \c"
    read -r _count </dev/tty || _count="8"
    if [[ "$_count" =~ ^[0-9]+$ ]] && [ "$_count" -ge 0 ] && [ "$_count" -le "$TOTAL_PROFILES" ]; then
        SEED_COUNT=$_count
    else
        SEED_COUNT=8
    fi
    ok "Will seed ${SEED_COUNT} profile(s)"
fi
echo ""

# ── 7. Start backend ──────────────────────────────────────────────────────────
log "Starting backend on port $BACKEND_PORT..."
(
    trap - SIGTERM SIGINT  # prevent cascade: let the parent manage shutdown
    cd "$BACKEND_DIR"
    uv run uvicorn app.main:app --host 0.0.0.0 --port "$BACKEND_PORT" --reload
) &
BACKEND_PID=$!
ok "Backend started (PID $BACKEND_PID)"

# ── 8. Wait for backend health ────────────────────────────────────────────────
log "Waiting for backend to be ready..."
MAX_RETRIES=30
for i in $(seq 1 $MAX_RETRIES); do
    if curl -sf "http://localhost:$BACKEND_PORT/api/health" >/dev/null 2>&1; then
        break
    fi
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        err "Backend process died unexpectedly."
        exit 1
    fi
    if [ "$i" -eq "$MAX_RETRIES" ]; then
        err "Backend did not start in time."
        cleanup
    fi
    sleep 0.5
done
ok "Backend is healthy"

# ── 9. Seed database ──────────────────────────────────────────────────────────
if [ "$SEED_COUNT" -gt 0 ]; then
    log "Seeding database with $SEED_COUNT profile(s)..."
    (
        trap - SIGTERM SIGINT
        cd "$BACKEND_DIR"
        uv run python seed_cvs.py --url "http://localhost:$BACKEND_PORT/api" --count "$SEED_COUNT"
    )
    ok "Database seeded with $SEED_COUNT profile(s)"
else
    ok "Skipping database seed"
fi

# ── 10. Start frontend ────────────────────────────────────────────────────────
log "Starting frontend on port $FRONTEND_PORT..."
(
    trap - SIGTERM SIGINT  # prevent cascade
    cd "$FRONTEND_DIR"
    npm run dev -- --port "$FRONTEND_PORT" --host
) &
FRONTEND_PID=$!
ok "Frontend started (PID $FRONTEND_PID)"

# ── 11. Done ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           SynergyX-AI is running!                       ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  Frontend : ${CYAN}http://localhost:$FRONTEND_PORT${NC}                    ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Backend  : ${CYAN}http://localhost:$BACKEND_PORT${NC}                    ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  API Docs : ${CYAN}http://localhost:$BACKEND_PORT/docs${NC}                ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}  Profiles : ${CYAN}${SEED_COUNT} seeded${NC}                                      ${GREEN}║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  Press ${YELLOW}Ctrl+C${NC} to stop all services                    ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

wait
