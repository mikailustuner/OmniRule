#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  OmniRule Universal Setup v1.1.0
#  Usage:
#    curl -fsSL https://mikailustuner.github.io/OmniRule/install.sh | bash
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

  # Create temporary directory for a clean installation
  TMP_DIR=$(mktemp -d)
  step "Created temporary directory: $TMP_DIR"
  
  # Ensure cleanup on exit
  trap 'rm -rf "$TMP_DIR"' EXIT

  step "Cloning OmniRule repository..."
  if git clone --depth 1 https://github.com/mikailustuner/OmniRule.git "$TMP_DIR/OmniRule"; then
    cd "$TMP_DIR/OmniRule"
    
    if [ -f "install.sh" ]; then
      step "Launching Universal Installer..."
      # Run with --opencode by default for a clean global install, 
      # but allow users to override via arguments
      bash install.sh "$@"
      ok "Installation process finished."
    else
      fail "Installer not found in cloned repository."
      exit 1
    fi
  else
    fail "Failed to clone repository."
    exit 1
  fi

  step "Cleaning up temporary files..."
  # trap will handle it, but we can be explicit
}

main
