#!/bin/bash

# OmniRule Universal Bash Installer
# Usage: ./install.sh [--opencode]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}     OMNIRULE BASH INSTALLER           ${NC}"
echo -e "${BLUE}=======================================${NC}"

TARGET_DIR="$(pwd)/.omnirule-local"
IS_OPENCODE=false

# Parse arguments
for arg in "$@"; do
  if [ "$arg" == "--opencode" ]; then
    TARGET_DIR="$HOME/.config/opencode"
    IS_OPENCODE=true
  fi
done

echo -e "${CYAN}i${NC} Target Location: ${YELLOW}$TARGET_DIR${NC}"

# Create target directory
mkdir -p "$TARGET_DIR"
echo -e "${GREEN}✔${NC} Target directory ready."

# Define assets
ASSETS=("agents" "commands" "instructions" "rules" "skills" "plugins" "index.ts" "package.json")

echo -e "${CYAN}i${NC} Deploying OmniRule assets..."

# Copy assets
for asset in "${ASSETS[@]}"; do
  if [ -e "$asset" ]; then
    cp -rf "$asset" "$TARGET_DIR/"
    echo -e "  ${GREEN}→${NC} $asset [DEPLOYED]"
  fi
done

# Copy tools and lib specifically
if [ -d "packages/core/src/tools" ]; then
  cp -rf "packages/core/src/tools" "$TARGET_DIR/tools"
  echo -e "  ${GREEN}→${NC} packages/core/src/tools -> tools [DEPLOYED]"
fi

if [ -d "packages/core/src/lib" ]; then
  cp -rf "packages/core/src/lib" "$TARGET_DIR/lib"
  echo -e "  ${GREEN}→${NC} packages/core/src/lib -> lib [DEPLOYED]"
fi

# Copy and Patch opencode.json from userspec
if [ -f "userspec/opencode.json" ]; then
  cp "userspec/opencode.json" "$TARGET_DIR/opencode.json"
  # Use sed to replace {{CONFIG_DIR}} with actual TARGET_DIR
  # We use | as a delimiter in sed because TARGET_DIR contains slashes
  sed -i "s|{{CONFIG_DIR}}|$TARGET_DIR|g" "$TARGET_DIR/opencode.json"
  echo -e "  ${GREEN}→${NC} opencode.json [DEPLOYED & PATCHED]"
fi

# Patch package.json scripts in target
if [ -f "$TARGET_DIR/package.json" ]; then
  sed -i 's|tsx packages/core/src/|tsx |g' "$TARGET_DIR/package.json"
  echo -e "  ${GREEN}✔${NC} package.json scripts patched."
fi

echo -e "\n${GREEN}=======================================${NC}"
echo -e "${GREEN}      INSTALLATION SUCCESSFUL          ${NC}"
echo -e "${GREEN}=======================================${NC}"
echo -e "${CYAN}i${NC} OmniRule fleet is configured at: ${YELLOW}$TARGET_DIR${NC}"

if [ "$IS_OPENCODE" = true ]; then
  echo -e "${YELLOW}★${NC} You can now use OpenCode with this global configuration."
fi
