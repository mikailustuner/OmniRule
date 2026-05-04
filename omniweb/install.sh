#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  OmniWeb Setup Assistant v1.0.0
#  Usage:
#    curl -fsSL ... | bash
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

R='\033[0;31m'; G='\033[0;32m'; B='\033[0;34m'
C='\033[0;36m'; Y='\033[1;33m'; D='\033[2m'; N='\033[0m'; BOLD='\033[1m'

print_header() {
  echo -e "\n${B}${BOLD}╔══════════════════════════════════════╗${N}"
  echo -e "${B}${BOLD}║       OmniWeb Setup Assistant        ║${N}"
  echo -e "${B}${BOLD}╚══════════════════════════════════════╝${N}\n"
}
ok()   { echo -e "  ${G}✔${N}  $*"; }
info() { echo -e "  ${C}i${N}  $*"; }
warn() { echo -e "  ${Y}⚠${N}  $*"; }
fail() { echo -e "  ${R}✗${N}  $*" >&2; }
step() { echo -e "\n${BOLD}$*${N}"; }

# ─── OS detection ────────────────────────────────────────────────
detect_os() {
  local u; u="$(uname -s 2>/dev/null || echo unknown)"
  case "$u" in
    Linux*)  echo "linux" ;;
    Darwin*) echo "macos" ;;
    *) echo "unknown" ;;
  esac
}

OS="$(detect_os)"

# ─── Prereqs ─────────────────────────────────────────────────────
check_prereqs() {
  step "Checking prerequisites…"
  local missing=0
  command -v node &>/dev/null && ok "Node.js $(node --version)" || { fail "Node.js not found."; missing=1; }
  command -v npm  &>/dev/null && ok "npm $(npm --version)"     || { fail "npm not found.";    missing=1; }
  [ $missing -eq 0 ] || { echo -e "\n${R}Prerequisite check failed.${N}"; exit 1; }
}

# ─── Main ────────────────────────────────────────────────────────
main() {
  print_header
  info "System: ${BOLD}$OS${N}"
  
  check_prereqs

  # Directory detection
  if [[ "$PWD" == *"/omniweb" ]]; then
    ok "Already in omniweb directory."
  elif [ -d "omniweb" ]; then
    step "Moving into omniweb directory..."
    cd omniweb
  elif [ -f "omniweb/package.json" ]; then
    cd omniweb
  else
    step "Initializing project..."
    if [ ! -d "OmniRule" ]; then
      info "Cloning repository..."
      git clone https://github.com/mikailustuner/OmniRule.git
      cd OmniRule/omniweb
    else
      cd OmniRule/omniweb
    fi
  fi

  if [ ! -f "package.json" ]; then
    fail "Could not find omniweb/package.json. Please run from the project root or omniweb folder."
    exit 1
  fi

  step "Installing dependencies…"
  npm install --prefer-offline --no-fund --no-audit
  ok "Dependencies installed."

  step "Building project…"
  npm run build
  ok "Build complete."

  echo -e "\n${G}${BOLD}╔══════════════════════════════════════╗${N}"
  echo -e "${G}${BOLD}║      OmniWeb is ready!  ✔            ║${N}"
  echo -e "${G}${BOLD}╚══════════════════════════════════════╝${N}"
  echo ""
  info "To start development: ${Y}npm run dev${N}"
  info "To preview build:    ${Y}npm run start${N}"
  echo ""
}

main
