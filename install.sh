#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  OmniRule Universal Installer  v1.15.0
#  Usage:
#    bash install.sh               → local install (.omnirule-local/)
#    bash install.sh --opencode    → global OpenCode config install
#    bash install.sh --opencode --dry-run   → preview only
#    bash install.sh --opencode --force     → overwrite without prompt
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────
R='\033[0;31m'; G='\033[0;32m'; B='\033[0;34m'
C='\033[0;36m'; Y='\033[1;33m'; D='\033[2m'; N='\033[0m'
BOLD='\033[1m'

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

# ─── Parse args ──────────────────────────────────────────────────
IS_OPENCODE=false
DRY_RUN=false
FORCE=false

for arg in "$@"; do
  case "$arg" in
    --opencode)  IS_OPENCODE=true ;;
    --dry-run)   DRY_RUN=true ;;
    --force)     FORCE=true ;;
    --help|-h)
      echo "Usage: bash install.sh [--opencode] [--dry-run] [--force]"
      echo "  --opencode   Install to global AI tool config directory"
      echo "  --dry-run    Preview what would be installed, no files written"
      echo "  --force      Overwrite existing install without prompting"
      exit 0 ;;
  esac
done

# ─── OS detection ────────────────────────────────────────────────
detect_os() {
  local uname
  uname="$(uname -s 2>/dev/null || echo "unknown")"
  case "$uname" in
    Linux*)
      if grep -qi "microsoft" /proc/version 2>/dev/null; then
        echo "wsl"
      else
        echo "linux"
      fi
      ;;
    Darwin*)             echo "macos" ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows-bash" ;;
    *)                   echo "unknown" ;;
  esac
}

OS="$(detect_os)"

# ─── Resolve config paths ────────────────────────────────────────
resolve_opencode_dir() {
  case "$OS" in
    linux|macos)
      echo "${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
      ;;
    wsl)
      local win_user
      win_user="$(cmd.exe /c echo %USERNAME% 2>/dev/null | tr -d '\r' || echo "")"
      if [ -n "$win_user" ] && [ "$win_user" != "%USERNAME%" ]; then
        echo "/mnt/c/Users/$win_user/.config/opencode"
      else
        echo "${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
      fi
      ;;
    windows-bash)
      local win_home="${USERPROFILE:-$HOME}"
      echo "${win_home//\\//}/.config/opencode"
      ;;
    *)
      echo "$HOME/.config/opencode"
      ;;
  esac
}

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$IS_OPENCODE" = true ]; then
  TARGET_DIR="$(resolve_opencode_dir)"
else
  TARGET_DIR="$SOURCE_DIR/.omnirule-local"
fi

BACKUP_DIR="$TARGET_DIR/.omnirule-backup-$(date +%Y%m%d-%H%M%S)"

# ─── Prerequisite checks ─────────────────────────────────────────
check_prereqs() {
  step "Checking prerequisites…"
  local missing=0

  if command -v node &>/dev/null; then
    ok "Node.js $(node --version)"
  else
    fail "Node.js not found. Install from https://nodejs.org"
    missing=1
  fi

  if command -v npm &>/dev/null; then
    ok "npm $(npm --version)"
  else
    fail "npm not found."
    missing=1
  fi

  if [ $missing -eq 1 ]; then
    echo -e "\n${R}Prerequisite check failed. Aborting.${N}"
    exit 1
  fi
}

# ─── Assets to deploy ────────────────────────────────────────────
DIRS=(
  "agents" "commands" "instructions" "rules" "skills"
  "plugins" "tools" "lib" "modes" "hooks" "scripts"
)

FILES=(
  "AGENTS.md" "registry.json" "package.json"
  "tsconfig.json" ".lefthook.yml" "index.ts"
)

# Files that belong to OmniRule — these get backed up before overwrite.
# Anything NOT in this list (e.g. user's own custom opencode settings)
# is left completely untouched.
OMNIRULE_OWNED_FILES=(
  "opencode.json"
  "AGENTS.md"
  "registry.json"
  "package.json"
  "tsconfig.json"
  "index.ts"
)

# ─── Backup ──────────────────────────────────────────────────────
# Backs up only files/dirs that OmniRule owns AND that already exist
# at the target. User's other config files are never touched.
backup_existing() {
  if [ "$DRY_RUN" = true ]; then
    echo -e "  ${D}[dry-run]${N} Would create backup at: $BACKUP_DIR"
    return
  fi

  local backed_up=0

  for file in "${OMNIRULE_OWNED_FILES[@]}"; do
    if [ -f "$TARGET_DIR/$file" ]; then
      mkdir -p "$BACKUP_DIR"
      cp "$TARGET_DIR/$file" "$BACKUP_DIR/$file"
      backed_up=1
    fi
  done

  for dir in "${DIRS[@]}"; do
    if [ -d "$TARGET_DIR/$dir" ]; then
      mkdir -p "$BACKUP_DIR"
      cp -r "$TARGET_DIR/$dir" "$BACKUP_DIR/$dir"
      backed_up=1
    fi
  done

  if [ $backed_up -eq 1 ]; then
    ok "Backup created: ${D}$BACKUP_DIR${N}"
  fi
}

# ─── Dry-run / deploy helper ─────────────────────────────────────
deploy() {
  local src="$1" dst="$2"
  if [ "$DRY_RUN" = true ]; then
    echo -e "  ${D}[dry-run]${N} $src → $dst"
  else
    cp -rf "$src" "$dst"
  fi
}

# ─── Existing install check ──────────────────────────────────────
check_existing() {
  if [ ! -d "$TARGET_DIR" ] || [ -z "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]; then
    return  # nothing there, fresh install
  fi

  if [ "$DRY_RUN" = true ]; then
    warn "Existing config found at $TARGET_DIR (dry-run, no changes)"
    return
  fi

  if [ "$FORCE" = true ]; then
    warn "Existing config found — proceeding with backup + overwrite (--force)"
    return
  fi

  echo -e "\n${Y}Existing config found at:${N} $TARGET_DIR"
  echo -e "${D}OmniRule will back up its own files before overwriting."
  echo -e "Your other config files will NOT be touched.${N}"
  echo -e "\n${BOLD}Continue? [y/N]${N} \c"
  read -r answer </dev/tty
  if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
}

# ─── Patch opencode.json ─────────────────────────────────────────
patch_opencode_json() {
  local json_path="$TARGET_DIR/opencode.json"
  if [ ! -f "$json_path" ]; then return; fi

  if [ "$DRY_RUN" = true ]; then
    echo -e "  ${D}[dry-run]${N} Patch {{CONFIG_DIR}} → $TARGET_DIR in opencode.json"
    return
  fi

  if [[ "$OS" == "macos" ]]; then
    sed -i '' "s|{{CONFIG_DIR}}|$TARGET_DIR|g" "$json_path"
  else
    sed -i "s|{{CONFIG_DIR}}|$TARGET_DIR|g" "$json_path"
  fi
  ok "opencode.json patched ({{CONFIG_DIR}} → $TARGET_DIR)"
}

# ─── npm install ─────────────────────────────────────────────────
run_npm_install() {
  if [ ! -f "$TARGET_DIR/package.json" ]; then return; fi
  if [ "$DRY_RUN" = true ]; then
    echo -e "  ${D}[dry-run]${N} npm install in $TARGET_DIR"
    return
  fi

  step "Installing dependencies…"
  (cd "$TARGET_DIR" && npm install --prefer-offline --no-fund --no-audit 2>&1 \
    | grep -E "added|updated|warn|error" | head -10 || true)
  ok "npm install complete"
}

# ─── Main ────────────────────────────────────────────────────────
main() {
  print_header

  case "$OS" in
    linux)         info "OS: Linux" ;;
    macos)         info "OS: macOS" ;;
    wsl)           info "OS: Windows Subsystem for Linux (WSL)" ;;
    windows-bash)  info "OS: Windows (Git Bash / MSYS2)" ;;
    *)             warn "OS: Unknown ($OS) — using default paths" ;;
  esac

  if [ "$IS_OPENCODE" = true ]; then
    info "Mode:    ${BOLD}Global OpenCode install${N}"
  else
    info "Mode:    ${BOLD}Local install${N}"
  fi

  info "Source:  ${Y}$SOURCE_DIR${N}"
  info "Target:  ${Y}$TARGET_DIR${N}"

  [ "$DRY_RUN" = true ] && warn "DRY RUN — no files will be written"
  [ "$FORCE"   = true ] && warn "FORCE — skipping confirmation prompt"

  check_prereqs
  check_existing

  if [ "$DRY_RUN" = false ]; then
    mkdir -p "$TARGET_DIR"
  fi

  # ── Backup first ──
  step "Backing up existing OmniRule files…"
  backup_existing

  # ── Deploy directories ──
  step "Deploying assets…"

  for dir in "${DIRS[@]}"; do
    if [ -d "$SOURCE_DIR/$dir" ]; then
      deploy "$SOURCE_DIR/$dir" "$TARGET_DIR/$dir"
      ok "$dir/"
    fi
  done

  # ── Deploy files ──
  for file in "${FILES[@]}"; do
    if [ -f "$SOURCE_DIR/$file" ]; then
      deploy "$SOURCE_DIR/$file" "$TARGET_DIR/$file"
      ok "$file"
    fi
  done

  # ── opencode.json from userspec/ ──
  if [ -f "$SOURCE_DIR/userspec/opencode.json" ]; then
    if [ "$DRY_RUN" = false ]; then
      cp "$SOURCE_DIR/userspec/opencode.json" "$TARGET_DIR/opencode.json"
    else
      echo -e "  ${D}[dry-run]${N} userspec/opencode.json → opencode.json"
    fi
    patch_opencode_json
  fi

  run_npm_install

  # ── Summary ──
  echo -e "\n${G}${BOLD}╔══════════════════════════════════════╗${N}"
  echo -e "${G}${BOLD}║   Installation complete! ✔           ║${N}"
  echo -e "${G}${BOLD}╚══════════════════════════════════════╝${N}"
  echo ""
  info "Installed to: ${Y}$TARGET_DIR${N}"

  if [ -d "$BACKUP_DIR" ]; then
    info "Backup at:    ${D}$BACKUP_DIR${N}"
  fi

  if [ "$IS_OPENCODE" = true ]; then
    echo ""
    echo -e "  ${BOLD}Next steps:${N}"
    echo -e "  1. Open OpenCode in your project"
    echo -e "  2. The full OmniRule fleet is now globally available"
    echo -e "  3. Try: ${C}/orchestrate <your task>${N}"
    echo ""
    case "$OS" in
      wsl)
        warn "WSL: Installed to Windows-side path so OpenCode finds it."
        echo -e "     ${D}If it doesn't load, try the Linux path: ~/.config/opencode/${N}"
        ;;
      windows-bash)
        info "Config written to: %USERPROFILE%\\.config\\opencode\\"
        ;;
    esac
  fi
  echo ""
}

main
