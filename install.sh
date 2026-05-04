#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  OmniRule Universal Installer  v1.15.0
#  Usage:
#    bash install.sh                        # local install
#    bash install.sh --opencode             # global OpenCode config
#    bash install.sh --opencode --dry-run   # preview only
#    bash install.sh --opencode --force     # skip prompt
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

R='\033[0;31m'; G='\033[0;32m'; B='\033[0;34m'
C='\033[0;36m'; Y='\033[1;33m'; D='\033[2m'; N='\033[0m'; BOLD='\033[1m'

print_header() {
  echo -e "\n${B}${BOLD}╔══════════════════════════════════════╗${N}"
  echo -e "${B}${BOLD}║       OmniRule Installer v1.15       ║${N}"
  echo -e "${B}${BOLD}╚══════════════════════════════════════╝${N}\n"
}
ok()   { echo -e "  ${G}✔${N}  $*"; }
info() { echo -e "  ${C}i${N}  $*"; }
warn() { echo -e "  ${Y}⚠${N}  $*"; }
fail() { echo -e "  ${R}✗${N}  $*" >&2; }
step() { echo -e "\n${BOLD}$*${N}"; }

# ─── Args ────────────────────────────────────────────────────────
IS_OPENCODE=false; DRY_RUN=false; FORCE=false
for arg in "$@"; do
  case "$arg" in
    --opencode) IS_OPENCODE=true ;;
    --dry-run)  DRY_RUN=true ;;
    --force)    FORCE=true ;;
    --help|-h)  echo "Usage: bash install.sh [--opencode] [--dry-run] [--force]"; exit 0 ;;
  esac
done

# ─── OS detection ────────────────────────────────────────────────
detect_os() {
  local u; u="$(uname -s 2>/dev/null || echo unknown)"
  case "$u" in
    Linux*)  grep -qi "microsoft" /proc/version 2>/dev/null && echo "wsl" || echo "linux" ;;
    Darwin*) echo "macos" ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows-bash" ;;
    *) echo "unknown" ;;
  esac
}

OS="$(detect_os)"

resolve_opencode_dir() {
  case "$OS" in
    linux|macos)    echo "${XDG_CONFIG_HOME:-$HOME/.config}/opencode" ;;
    wsl)
      local u; u="$(cmd.exe /c echo %USERNAME% 2>/dev/null | tr -d '\r' || echo "")"
      if [ -n "$u" ] && [ "$u" != "%USERNAME%" ]; then
        echo "/mnt/c/Users/$u/.config/opencode"
      else
        echo "${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
      fi ;;
    windows-bash)
      local h="${USERPROFILE:-$HOME}"; echo "${h//\\//}/.config/opencode" ;;
    *) echo "$HOME/.config/opencode" ;;
  esac
}

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$([ "$IS_OPENCODE" = true ] && resolve_opencode_dir || echo "$SOURCE_DIR/.omnirule-local")"
BACKUP_DIR="$TARGET_DIR/.omnirule-backup-$(date +%Y%m%d-%H%M%S)"

# ─── What to install ─────────────────────────────────────────────
#
# DIRS: copied in full — every file inside is included automatically.
#       Add a new agent/skill/tool file to its folder and it just works.
#
# ROOT_FILES: specific root-level files that belong in the config dir.
#             Project-specific files (next.config.js, schema.prisma, etc.)
#             are intentionally excluded.

DIRS=(
  "agents"       # all agent .md files
  "commands"     # all command .md files
  "instructions" # instruction files
  "rules"        # rule files (TOOL_CATALOG, ORCHESTRATION, etc.)
  "skills"       # all 63+ skill directories
  "plugins"      # hook plugins
  "tools"        # all tool .ts files
  "lib"          # shared library files
  "modes"        # mode definitions
  "hooks"        # hooks config
  "scripts"      # hook scripts
)

ROOT_FILES=(
  "AGENTS.md"
  "registry.json"
  "package.json"
  "tsconfig.json"
  "index.ts"
  ".lefthook.yml"
)

# ─── Prereqs ─────────────────────────────────────────────────────
check_prereqs() {
  step "Checking prerequisites…"
  local missing=0
  command -v node &>/dev/null && ok "Node.js $(node --version)" || { fail "Node.js not found."; missing=1; }
  command -v npm  &>/dev/null && ok "npm $(npm --version)"     || { fail "npm not found.";    missing=1; }
  [ $missing -eq 0 ] || { echo -e "\n${R}Prerequisite check failed.${N}"; exit 1; }
}

# ─── Backup ──────────────────────────────────────────────────────
backup_existing() {
  if [ "$DRY_RUN" = true ]; then
    echo -e "  ${D}[dry-run]${N} Would back up → $BACKUP_DIR"; return
  fi
  local has_content=false
  for dir in "${DIRS[@]}"; do
    [ -d "$TARGET_DIR/$dir" ] && has_content=true && break
  done
  for file in "${ROOT_FILES[@]}" "opencode.json"; do
    [ -f "$TARGET_DIR/$file" ] && has_content=true && break
  done

  if $has_content; then
    mkdir -p "$BACKUP_DIR"
    for dir in "${DIRS[@]}"; do
      [ -d "$TARGET_DIR/$dir" ] && cp -rf "$TARGET_DIR/$dir" "$BACKUP_DIR/"
    done
    for file in "${ROOT_FILES[@]}" "opencode.json"; do
      [ -f "$TARGET_DIR/$file" ] && cp "$TARGET_DIR/$file" "$BACKUP_DIR/"
    done
    ok "Backup: ${D}$BACKUP_DIR${N}"
  else
    info "Fresh install — no backup needed"
  fi
}

# ─── Existing check ───────────────────────────────────────────────
check_existing() {
  [ -d "$TARGET_DIR" ] && [ "$(ls -A "$TARGET_DIR" 2>/dev/null)" ] || return 0
  [ "$DRY_RUN" = true ] && { warn "Existing config found (dry-run, no changes)"; return; }
  [ "$FORCE"   = true ] && { warn "Existing config found — overwriting (--force)"; return; }
  echo -e "\n${Y}Existing config found at:${N} $TARGET_DIR"
  echo -e "${D}OmniRule files will be backed up before overwriting.${N}"
  echo -e "${BOLD}Continue? [y/N]${N} \c"
  read -r answer </dev/tty
  [[ "$answer" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
}

# ─── Deploy ──────────────────────────────────────────────────────
deploy() {
  local src="$1" dst="$2" label="$3"
  if [ "$DRY_RUN" = true ]; then
    echo -e "  ${D}[dry-run]${N} $label"
  else
    cp -rf "$src" "$dst"
  fi
  ok "$label"
}

deploy_all() {
  step "Deploying assets…"

  for dir in "${DIRS[@]}"; do
    local src="$SOURCE_DIR/$dir"
    [ -d "$src" ] && deploy "$src" "$TARGET_DIR/" "$dir/ ($(find "$src" -type f | wc -l | tr -d ' ') files)"
  done

  for file in "${ROOT_FILES[@]}"; do
    local src="$SOURCE_DIR/$file"
    [ -f "$src" ] && deploy "$src" "$TARGET_DIR/$file" "$file"
  done
}

# ─── opencode.json ───────────────────────────────────────────────
deploy_opencode_json() {
  local src="$SOURCE_DIR/userspec/opencode.json"
  [ -f "$src" ] || return
  if [ "$DRY_RUN" = true ]; then
    echo -e "  ${D}[dry-run]${N} userspec/opencode.json → opencode.json (patched)"; return
  fi
  cp "$src" "$TARGET_DIR/opencode.json"
  if [[ "$OS" == "macos" ]]; then
    sed -i '' "s|{{CONFIG_DIR}}|$TARGET_DIR|g" "$TARGET_DIR/opencode.json"
  else
    sed -i "s|{{CONFIG_DIR}}|$TARGET_DIR|g" "$TARGET_DIR/opencode.json"
  fi
  ok "opencode.json → patched"
}

# ─── Validate ────────────────────────────────────────────────────
validate_refs() {
  [ "$DRY_RUN" = true ] && return
  local json="$TARGET_DIR/opencode.json"
  [ -f "$json" ] || return
  step "Validating file references…"
  local missing=0
  while IFS= read -r ref; do
    [ -f "$TARGET_DIR/$ref" ] || { warn "Missing: $ref"; (( missing++ )) || true; }
  done < <(grep -oP '(?<=\{file:)[^}]+' "$json" 2>/dev/null || true)
  [ $missing -eq 0 ] && ok "All {file:...} references resolved" \
                      || warn "$missing reference(s) unresolved"
}

# ─── npm install ─────────────────────────────────────────────────
run_npm_install() {
  [ -f "$TARGET_DIR/package.json" ] || return
  if [ "$DRY_RUN" = true ]; then echo -e "  ${D}[dry-run]${N} npm install"; return; fi
  step "Installing dependencies…"
  (cd "$TARGET_DIR" && npm install --prefer-offline --no-fund --no-audit 2>&1 \
    | grep -E "added|updated|warn|error" | head -10 || true)
  ok "npm install complete"
}

# ─── Main ────────────────────────────────────────────────────────
main() {
  print_header
  case "$OS" in
    linux)        info "OS: Linux" ;;
    macos)        info "OS: macOS" ;;
    wsl)          info "OS: WSL (Windows Subsystem for Linux)" ;;
    windows-bash) info "OS: Windows (Git Bash)" ;;
    *)            warn "OS: Unknown — using default paths" ;;
  esac
  info "Mode:   $([ "$IS_OPENCODE" = true ] && echo 'Global OpenCode' || echo 'Local')"
  info "Source: ${Y}$SOURCE_DIR${N}"
  info "Target: ${Y}$TARGET_DIR${N}"
  [ "$DRY_RUN" = true ] && warn "DRY RUN — no files written"
  [ "$FORCE"   = true ] && warn "FORCE — no confirmation prompt"

  check_prereqs
  check_existing
  [ "$DRY_RUN" = false ] && mkdir -p "$TARGET_DIR"
  backup_existing
  deploy_all
  deploy_opencode_json
  validate_refs
  run_npm_install

  echo -e "\n${G}${BOLD}╔══════════════════════════════════════╗${N}"
  echo -e "${G}${BOLD}║   Installation complete!  ✔          ║${N}"
  echo -e "${G}${BOLD}╚══════════════════════════════════════╝${N}"
  echo ""
  info "Installed to: ${Y}$TARGET_DIR${N}"
  [ -d "$BACKUP_DIR" ] && info "Backup:       ${D}$BACKUP_DIR${N}"
  if [ "$IS_OPENCODE" = true ]; then
    echo -e "\n  ${BOLD}Next steps:${N}"
    echo -e "  1. Open OpenCode in your project"
    echo -e "  2. OmniRule fleet is globally available"
    echo -e "  3. Try: ${C}/orchestrate <your task>${N}\n"
    [ "$OS" = "wsl" ] && warn "WSL: installed to Windows-side path."
    [ "$OS" = "windows-bash" ] && info "Config: %USERPROFILE%\\.config\\opencode\\"
  fi
  echo ""
}

main
