#!/usr/bin/env tsx
/**
 * OmniRule Security Audit
 *
 * Static analysis of source files for common security anti-patterns.
 * Runs on changed files (git diff) or a specific path.
 *
 * Usage:
 *   npm run tool:security             (scans git-changed files)
 *   npm run tool:security -- src/     (scans directory)
 *   npm run tool:security -- src/api/auth.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SecurityFinding {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  rule: string;
  match: string;
  description: string;
  remediation: string;
}

export interface AuditReport {
  scannedAt: string;
  filesScanned: number;
  findings: SecurityFinding[];
  passed: boolean;
}

// ─── Rules ────────────────────────────────────────────────────────────────────

interface AuditRule {
  id: string;
  pattern: RegExp;
  severity: SecurityFinding['severity'];
  description: string;
  remediation: string;
}

const RULES: AuditRule[] = [
  // Secrets / credentials
  {
    id: 'hardcoded-secret',
    pattern: /(?:password|passwd|secret|api_?key|auth_?token|access_?token)\s*[:=]\s*["'][^"']{6,}["']/i,
    severity: 'critical',
    description: 'Hardcoded credential or secret',
    remediation: 'Move to environment variable. Use process.env.SECRET_NAME',
  },
  {
    id: 'hardcoded-jwt',
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
    severity: 'critical',
    description: 'Hardcoded JWT token',
    remediation: 'Never hardcode tokens. Use environment variables.',
  },
  {
    id: 'aws-key',
    pattern: /AKIA[0-9A-Z]{16}/,
    severity: 'critical',
    description: 'AWS Access Key ID detected',
    remediation: 'Revoke key immediately. Use IAM roles or environment variables.',
  },
  // Injection
  {
    id: 'sql-injection',
    pattern: /(?:query|execute|db\.run)\s*\(`[^`]*\$\{[^}]+\}[^`]*`\)/i,
    severity: 'critical',
    description: 'Potential SQL injection via template literal',
    remediation: 'Use parameterized queries: db.query(sql, [params])',
  },
  {
    id: 'raw-sql-concat',
    pattern: /["']\s*SELECT\s.+\+\s*(?:req\.|user\.|params\.)/i,
    severity: 'critical',
    description: 'SQL query built by string concatenation with user input',
    remediation: 'Use ORM (Prisma) or parameterized queries',
  },
  // XSS
  {
    id: 'dangerouslySetInnerHTML',
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:/,
    severity: 'high',
    description: 'dangerouslySetInnerHTML with potentially unsanitized content',
    remediation: 'Sanitize with DOMPurify before passing to __html',
  },
  {
    id: 'innerHTML-assignment',
    pattern: /\.innerHTML\s*=\s*(?!['"`]<)/,
    severity: 'high',
    description: 'innerHTML set with potentially dynamic content',
    remediation: 'Use textContent or sanitize with DOMPurify',
  },
  // Unsafe eval
  {
    id: 'eval-usage',
    pattern: /\beval\s*\(/,
    severity: 'critical',
    description: 'eval() executes arbitrary code',
    remediation: 'Replace eval() with safe alternatives (JSON.parse, Function constructor only if necessary)',
  },
  {
    id: 'new-function',
    pattern: /new\s+Function\s*\(/,
    severity: 'high',
    description: 'new Function() is similar to eval()',
    remediation: 'Avoid dynamic code execution',
  },
  // Path traversal
  {
    id: 'path-traversal',
    pattern: /(?:readFile|writeFile|readdir|stat)\s*\([^)]*(?:req\.|params\.|query\.)[^)]*\)/,
    severity: 'high',
    description: 'File system operation with user-controlled path',
    remediation: 'Validate and sanitize paths. Use path.resolve() + check it starts with allowed base dir.',
  },
  // Command injection
  {
    id: 'command-injection',
    pattern: /(?:exec|execSync|spawn)\s*\(`[^`]*\$\{(?:req\.|params\.|query\.|user\.)[^}]+\}`/,
    severity: 'critical',
    description: 'Shell command injection with user-controlled input',
    remediation: 'Use execFile() with argument arrays, never string interpolation',
  },
  // Weak crypto
  {
    id: 'weak-hash',
    pattern: /createHash\s*\(\s*["'](?:md5|sha1)["']\s*\)/i,
    severity: 'medium',
    description: 'Weak cryptographic hash algorithm',
    remediation: 'Use SHA-256 or SHA-512 for hashing. Use bcrypt/argon2 for passwords.',
  },
  // Debug left in
  {
    id: 'debug-console',
    pattern: /console\.\s*(?:log|debug|warn)\s*\([^)]*(?:password|token|secret|key)[^)]*\)/i,
    severity: 'high',
    description: 'Sensitive data logged to console',
    remediation: 'Remove logging of sensitive values',
  },
];

// ─── Scanner ──────────────────────────────────────────────────────────────────

function getChangedFiles(): string[] {
  try {
    const output = execSync('git diff --name-only HEAD 2>/dev/null || git diff --name-only --cached 2>/dev/null', {
      encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'],
    });
    return output.split('\n').filter(f =>
      f.trim() && /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f) && fs.existsSync(f)
    );
  } catch {
    return [];
  }
}

function getFilesInPath(target: string): string[] {
  const files: string[] = [];
  if (fs.statSync(target).isFile()) return [target];

  const walk = (dir: string) => {
    fs.readdirSync(dir).forEach(entry => {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory() && !entry.includes('node_modules') && !entry.startsWith('.')) {
        walk(full);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
        files.push(full);
      }
    });
  };
  walk(target);
  return files;
}

function auditFile(filePath: string): SecurityFinding[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const findings: SecurityFinding[] = [];

  for (const rule of RULES) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
      const match = rule.pattern.exec(line);
      if (match) {
        findings.push({
          file: filePath,
          line: i + 1,
          severity: rule.severity,
          rule: rule.id,
          match: match[0].substring(0, 80),
          description: rule.description,
          remediation: rule.remediation,
        });
      }
    }
  }
  return findings;
}

// ─── Report ───────────────────────────────────────────────────────────────────

function writeReport(report: AuditReport, outputDir: string): void {
  fs.mkdirSync(outputDir, { recursive: true });

  const bySeverity = (s: SecurityFinding['severity']) => report.findings.filter(f => f.severity === s);

  const md = `# Security Audit Report
> Generated: ${report.scannedAt}
> Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}

## Summary
- Files scanned: ${report.filesScanned}
- Critical: ${bySeverity('critical').length}
- High: ${bySeverity('high').length}
- Medium: ${bySeverity('medium').length}
- Low: ${bySeverity('low').length}

## Findings

${report.findings.length === 0 ? '✅ No security issues found.' :
  report.findings
    .sort((a, b) => ['critical','high','medium','low'].indexOf(a.severity) - ['critical','high','medium','low'].indexOf(b.severity))
    .map(f => `### [${f.severity.toUpperCase()}] ${f.rule} — \`${f.file}:${f.line}\`
\`\`\`
${f.match}
\`\`\`
**Issue:** ${f.description}
**Fix:** ${f.remediation}
`).join('\n')
}

---
*OmniRule Security Audit*
`;

  fs.writeFileSync(path.join(outputDir, 'security-report.md'), md);
  fs.writeFileSync(path.join(outputDir, 'security-report.json'), JSON.stringify(report, null, 2));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function runAudit(target?: string): Promise<AuditReport> {
  const files = target ? getFilesInPath(target) : getChangedFiles();

  if (files.length === 0) {
    console.log('[Security] No files to audit (no changed files found)');
    return { scannedAt: new Date().toISOString(), filesScanned: 0, findings: [], passed: true };
  }

  console.log(`\n[Security] Auditing ${files.length} files...`);
  const allFindings: SecurityFinding[] = [];

  for (const file of files) {
    const findings = auditFile(file);
    allFindings.push(...findings);
    if (findings.length > 0) {
      console.log(`  ⚠ ${file}: ${findings.length} issue(s)`);
    }
  }

  const report: AuditReport = {
    scannedAt: new Date().toISOString(),
    filesScanned: files.length,
    findings: allFindings,
    passed: !allFindings.some(f => f.severity === 'critical' || f.severity === 'high'),
  };

  writeReport(report, path.join(process.cwd(), '.omnirule', 'reports'));

  console.log(`\n[Security] ${report.passed ? 'PASSED ✅' : 'FAILED ❌'} — ${allFindings.length} findings`);
  console.log(`[Security] Report: .omnirule/reports/security-report.md\n`);

  return report;
}

if (process.argv[1]?.endsWith('security-audit.ts')) {
  const target = process.argv[2];
  runAudit(target).catch(console.error);
}
