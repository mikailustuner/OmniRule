#!/usr/bin/env node
/**
 * OmniRule Security Check — PreToolUse Hook (Bash)
 *
 * Blocks dangerous shell commands before they run.
 * Reads the command from stdin (OpenCode/Claude passes tool input as JSON).
 */

const BLOCKED_PATTERNS = [
  { pattern: /rm\s+-rf\s+\//, label: 'Recursive delete from root' },
  { pattern: />\s*\/etc\/passwd/, label: 'Write to /etc/passwd' },
  { pattern: /curl\s+.*\|\s*(?:bash|sh|zsh)/, label: 'Curl-pipe-to-shell (supply chain risk)' },
  { pattern: /wget\s+.*\|\s*(?:bash|sh|zsh)/, label: 'Wget-pipe-to-shell' },
  { pattern: /chmod\s+777/, label: 'World-writable permission (chmod 777)' },
  { pattern: /--no-verify/, label: 'Git hook bypass (--no-verify)' },
  { pattern: /git\s+push\s+.*--force\s+.*(?:main|master)/, label: 'Force push to main/master' },
  { pattern: /DROP\s+TABLE/i, label: 'SQL DROP TABLE (destructive)' },
  { pattern: /TRUNCATE\s+TABLE/i, label: 'SQL TRUNCATE TABLE (destructive)' },
];

function main() {
  const fs = require('fs');
  let input = '';
  try { input = fs.readFileSync('/dev/stdin', 'utf-8'); } catch {}

  let toolInput = {};
  try { toolInput = JSON.parse(input); } catch {}

  const command = toolInput?.command || toolInput?.cmd || input || '';

  for (const { pattern, label } of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      process.stdout.write(JSON.stringify({
        action: 'block',
        message: `[SecurityCheck] Blocked: ${label}\nCommand: ${command.substring(0, 100)}\nIf this is intentional, ask the user for explicit confirmation first.`,
      }));
      process.exit(1);
    }
  }

  process.stdout.write(JSON.stringify({ action: 'allow' }));
  process.exit(0);
}

main();
