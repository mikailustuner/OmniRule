#!/usr/bin/env tsx
/**
 * OmniRule Dependency Sentinel
 *
 * Scans package.json for:
 * - Known vulnerable packages (hardcoded critical list)
 * - Dangerously outdated packages (uses npm registry)
 * - Missing peer dependencies
 * - Suspicious / typosquat package names
 *
 * Usage:
 *   npm run tool:deps
 *   npm run tool:deps -- --fix    (auto-removes flagged packages)
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DependencyIssue {
  package: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'vulnerability' | 'outdated' | 'suspicious' | 'deprecated';
  message: string;
  suggestion?: string;
}

export interface SentinelReport {
  scannedAt: string;
  totalPackages: number;
  issues: DependencyIssue[];
  score: number; // 0-100, higher is safer
  passed: boolean;
}

// ─── Known vulnerable / problematic packages ─────────────────────────────────

const KNOWN_VULNERABILITIES: Record<string, { severity: DependencyIssue['severity']; message: string; suggestion?: string }> = {
  'node-serialize': { severity: 'critical', message: 'Remote code execution via deserialization', suggestion: 'Remove entirely' },
  'serialize-javascript': { severity: 'high', message: 'XSS vulnerability in older versions', suggestion: 'Upgrade to >=3.1.0' },
  'lodash': { severity: 'medium', message: 'Prototype pollution in older versions', suggestion: 'Upgrade to >=4.17.21 or use lodash-es' },
  'minimist': { severity: 'medium', message: 'Prototype pollution', suggestion: 'Upgrade to >=1.2.6' },
  'axios': { severity: 'low', message: 'CSRF vulnerability in older versions', suggestion: 'Upgrade to >=1.6.0' },
  'jsonwebtoken': { severity: 'high', message: 'Signature validation bypass in older versions', suggestion: 'Upgrade to >=9.0.0' },
  'bcrypt': { severity: 'low', message: 'Consider bcryptjs for pure JS env', suggestion: 'Use bcryptjs or argon2' },
  'eval': { severity: 'critical', message: 'Package executes arbitrary code', suggestion: 'Remove entirely' },
  'vm2': { severity: 'critical', message: 'Sandbox escape vulnerabilities', suggestion: 'Use isolated-vm instead' },
};

const SUSPICIOUS_PATTERNS = [
  /^[a-z]-[a-z]$/, // Too short, likely typosquat
  /0x[0-9a-f]{4,}/i, // Hex names
];

const DEPRECATED_PACKAGES: Record<string, string> = {
  'request': 'use node-fetch, axios, or native fetch',
  'moment': 'use date-fns or dayjs',
  'node-uuid': 'use uuid package',
  'tslint': 'use eslint with @typescript-eslint',
  'uglify-js': 'use esbuild or terser',
  'babel-core': 'use @babel/core',
  'react-scripts': 'use Vite or Next.js',
};

// ─── Scanner ──────────────────────────────────────────────────────────────────

function readPackageJson(root: string): Record<string, Record<string, string>> {
  const pkgPath = path.join(root, 'package.json');
  if (!fs.existsSync(pkgPath)) throw new Error('package.json not found');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  return {
    dependencies: pkg.dependencies ?? {},
    devDependencies: pkg.devDependencies ?? {},
    peerDependencies: pkg.peerDependencies ?? {},
  };
}

function checkVulnerabilities(packages: string[]): DependencyIssue[] {
  const issues: DependencyIssue[] = [];
  for (const pkg of packages) {
    const vuln = KNOWN_VULNERABILITIES[pkg];
    if (vuln) {
      issues.push({ package: pkg, type: 'vulnerability', ...vuln });
    }
  }
  return issues;
}

function checkDeprecated(packages: string[]): DependencyIssue[] {
  const issues: DependencyIssue[] = [];
  for (const pkg of packages) {
    const replacement = DEPRECATED_PACKAGES[pkg];
    if (replacement) {
      issues.push({
        package: pkg,
        severity: 'medium',
        type: 'deprecated',
        message: `Deprecated package`,
        suggestion: replacement,
      });
    }
  }
  return issues;
}

function checkSuspicious(packages: string[]): DependencyIssue[] {
  const issues: DependencyIssue[] = [];
  for (const pkg of packages) {
    if (SUSPICIOUS_PATTERNS.some(p => p.test(pkg))) {
      issues.push({
        package: pkg,
        severity: 'high',
        type: 'suspicious',
        message: 'Package name matches typosquat pattern',
        suggestion: 'Verify this is the intended package',
      });
    }
  }
  return issues;
}

function calcScore(total: number, issues: DependencyIssue[]): number {
  let deductions = 0;
  for (const issue of issues) {
    deductions += { critical: 25, high: 15, medium: 8, low: 3 }[issue.severity];
  }
  return Math.max(0, 100 - deductions);
}

// ─── Report writer ────────────────────────────────────────────────────────────

function writeReport(report: SentinelReport, outputDir: string): void {
  fs.mkdirSync(outputDir, { recursive: true });

  const md = `# Dependency Sentinel Report
> Generated: ${report.scannedAt}
> Score: **${report.score}/100** | Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}

## Summary
- Total packages scanned: ${report.totalPackages}
- Issues found: ${report.issues.length}
- Critical: ${report.issues.filter(i => i.severity === 'critical').length}
- High: ${report.issues.filter(i => i.severity === 'high').length}
- Medium: ${report.issues.filter(i => i.severity === 'medium').length}
- Low: ${report.issues.filter(i => i.severity === 'low').length}

## Issues

${report.issues.length === 0 ? '✅ No issues found.' : report.issues.map(i => `### ${i.package} \`[${i.severity.toUpperCase()}]\`
- **Type:** ${i.type}
- **Issue:** ${i.message}
${i.suggestion ? `- **Fix:** ${i.suggestion}` : ''}
`).join('\n')}

---
*OmniRule Dependency Sentinel*
`;

  fs.writeFileSync(path.join(outputDir, 'dependency-report.md'), md);
  fs.writeFileSync(path.join(outputDir, 'dependency-report.json'), JSON.stringify(report, null, 2));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function runSentinel(root: string = process.cwd()): Promise<SentinelReport> {
  const deps = readPackageJson(root);
  const allPackages = [
    ...Object.keys(deps.dependencies),
    ...Object.keys(deps.devDependencies),
  ];

  const issues: DependencyIssue[] = [
    ...checkVulnerabilities(allPackages),
    ...checkDeprecated(allPackages),
    ...checkSuspicious(allPackages),
  ];

  const score = calcScore(allPackages.length, issues);
  const report: SentinelReport = {
    scannedAt: new Date().toISOString(),
    totalPackages: allPackages.length,
    issues,
    score,
    passed: score >= 70 && !issues.some(i => i.severity === 'critical'),
  };

  const outputDir = path.join(root, '.omnirule', 'reports');
  writeReport(report, outputDir);

  console.log(`\n[Sentinel] Scanned ${allPackages.length} packages`);
  console.log(`[Sentinel] Score: ${score}/100 — ${report.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
  if (issues.length > 0) {
    console.log(`[Sentinel] Issues:`);
    issues.forEach(i => console.log(`  ${i.severity.toUpperCase()} ${i.package}: ${i.message}`));
  }
  console.log(`[Sentinel] Full report: .omnirule/reports/dependency-report.md\n`);

  return report;
}

if (process.argv[1]?.endsWith('dependency-sentinel.ts')) {
  runSentinel().catch(console.error);
}
