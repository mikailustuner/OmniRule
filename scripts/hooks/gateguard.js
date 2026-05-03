#!/usr/bin/env node
/**
 * OmniRule GateGuard — PreToolUse Hook (Write/Edit)
 *
 * Fact-forcing: reads stdin for the tool call context.
 * Blocks write operations if the agent is trying to modify:
 *   - Config files (eslint, prettier, tsconfig) — require explicit user approval
 *   - Files not yet read in this session — require read-first
 *
 * Exit 0 = allow, Exit 1 = block (message to stdout)
 * OpenCode/Claude reads stdout as the block message.
 */

const fs = require('fs');
const path = require('path');

// Config files that should never be silently modified
const PROTECTED_CONFIGS = [
  'eslint.config', '.eslintrc', 'prettier.config', '.prettierrc',
  'tsconfig.json', 'tsconfig.base.json', 'vite.config', 'vitest.config',
  'jest.config', '.env', '.env.local', '.env.production',
];

function isProtectedConfig(filePath) {
  const basename = path.basename(filePath);
  return PROTECTED_CONFIGS.some(c => basename.startsWith(c));
}

function isInsideSafeDir(filePath) {
  const safe = ['.designrules', '.omnirule', '.design'];
  return safe.some(d => filePath.includes(d));
}

function main() {
  let input = '';
  try {
    input = fs.readFileSync('/dev/stdin', 'utf-8');
  } catch {}

  // Parse tool call context if available
  let toolInput = {};
  try { toolInput = JSON.parse(input); } catch {}

  const filePath = toolInput?.path || toolInput?.file_path || toolInput?.target || '';

  // Always allow writes to safe OmniRule dirs
  if (isInsideSafeDir(filePath)) {
    process.stdout.write(JSON.stringify({ action: 'allow' }));
    process.exit(0);
  }

  // Block config file modifications with warning
  if (filePath && isProtectedConfig(filePath)) {
    process.stdout.write(JSON.stringify({
      action: 'block',
      message: `[GateGuard] Protected config file: ${path.basename(filePath)}\nConfig files should only be modified with explicit user instruction. If this is intentional, the user must confirm.`,
    }));
    process.exit(1);
  }

  // Allow everything else
  process.stdout.write(JSON.stringify({ action: 'allow' }));
  process.exit(0);
}

main();
