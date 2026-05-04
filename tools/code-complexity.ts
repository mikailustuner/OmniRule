#!/usr/bin/env tsx
/**
 * OmniRule Code Complexity Analyzer
 *
 * Analyzes source files for:
 * - Cyclomatic complexity (decision point count)
 * - Nesting depth (if/for/while/try levels)
 * - Function length
 * - File length
 * - Magic numbers
 * - TODO/FIXME accumulation
 *
 * Usage:
 *   npm run tool:complexity             — analyze changed files
 *   npm run tool:complexity -- src/     — analyze directory
 *   npm run tool:complexity -- src/api/auth.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComplexityReport {
  file: string;
  lines: number;
  functions: FunctionComplexity[];
  maxNesting: number;
  magicNumbers: number;
  todoCount: number;
  score: 'green' | 'yellow' | 'red';
  issues: string[];
}

interface FunctionComplexity {
  name: string;
  startLine: number;
  length: number;
  cyclomaticComplexity: number;
  score: 'green' | 'yellow' | 'red';
}

// ─── Thresholds ───────────────────────────────────────────────────────────────

const THRESHOLDS = {
  fileLines:            { warn: 300,  block: 500 },
  functionLines:        { warn: 30,   block: 50 },
  cyclomaticComplexity: { warn: 7,    block: 12 },
  nestingDepth:         { warn: 3,    block: 5 },
  magicNumbers:         { warn: 3,    block: 8 },
};

// ─── Analysis ─────────────────────────────────────────────────────────────────

function countCyclomatic(body: string): number {
  // Count decision points: if, else if, for, while, case, &&, ||, ?.
  const patterns = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bfor\s*\(/g,
    /\bwhile\s*\(/g,
    /\bcase\s+/g,
    /\?\?/g,
    /\?\./g,
    /&&/g,
    /\|\|/g,
    /\bswitch\s*\(/g,
    /\bcatch\s*\(/g,
  ];
  let count = 1; // base complexity
  for (const p of patterns) {
    count += (body.match(p) ?? []).length;
  }
  return count;
}

function measureNestingDepth(content: string): number {
  let max = 0;
  let depth = 0;
  for (const ch of content) {
    if (ch === '{') { depth++; max = Math.max(max, depth); }
    else if (ch === '}') depth = Math.max(0, depth - 1);
  }
  return max;
}

function extractFunctions(content: string): FunctionComplexity[] {
  const functions: FunctionComplexity[] = [];
  const lines = content.split('\n');

  // Match function declarations, arrow functions, methods
  const funcPattern = /(?:(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(|(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{)/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const match = funcPattern.exec(line);
    if (match) {
      const name = match[1] || match[2] || match[3] || 'anonymous';
      const startLine = i + 1;
      // Find function end by brace counting
      let depth = 0;
      let endLine = i;
      let started = false;
      for (let j = i; j < Math.min(i + 200, lines.length); j++) {
        for (const ch of lines[j]) {
          if (ch === '{') { depth++; started = true; }
          else if (ch === '}') { depth--; }
        }
        if (started && depth === 0) { endLine = j; break; }
      }
      const body = lines.slice(i, endLine + 1).join('\n');
      const length = endLine - i + 1;
      const cc = countCyclomatic(body);

      const score: FunctionComplexity['score'] =
        length > THRESHOLDS.functionLines.block || cc > THRESHOLDS.cyclomaticComplexity.block ? 'red' :
        length > THRESHOLDS.functionLines.warn  || cc > THRESHOLDS.cyclomaticComplexity.warn  ? 'yellow' : 'green';

      if (length > 5) { // skip trivial functions
        functions.push({ name, startLine, length, cyclomaticComplexity: cc, score });
      }
    }
    i++;
  }

  return functions;
}

function countMagicNumbers(content: string): number {
  // Numbers that aren't 0, 1, -1, 2, 100 and aren't in variable declarations
  const magicPattern = /(?<![a-zA-Z_$])\b(?!0\b|1\b|-1\b|2\b|100\b)\d{2,}\b/g;
  return (content.match(magicPattern) ?? []).length;
}

function countTodos(content: string): number {
  return (content.match(/(?:TODO|FIXME|HACK|XXX)\s*:/gi) ?? []).length;
}

function analyzeFile(filePath: string): ComplexityReport {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').length;
  const functions = extractFunctions(content);
  const maxNesting = measureNestingDepth(content);
  const magicNumbers = countMagicNumbers(content);
  const todoCount = countTodos(content);

  const issues: string[] = [];
  if (lines > THRESHOLDS.fileLines.block) issues.push(`File too long: ${lines} lines (max ${THRESHOLDS.fileLines.block})`);
  else if (lines > THRESHOLDS.fileLines.warn) issues.push(`File getting long: ${lines} lines`);

  if (maxNesting > THRESHOLDS.nestingDepth.block) issues.push(`Nesting too deep: ${maxNesting} levels (max ${THRESHOLDS.nestingDepth.block})`);
  else if (maxNesting > THRESHOLDS.nestingDepth.warn) issues.push(`Deep nesting: ${maxNesting} levels`);

  if (magicNumbers > THRESHOLDS.magicNumbers.block) issues.push(`Too many magic numbers: ${magicNumbers}`);
  if (todoCount > 3) issues.push(`${todoCount} unresolved TODOs/FIXMEs`);

  for (const fn of functions.filter(f => f.score !== 'green')) {
    if (fn.length > THRESHOLDS.functionLines.block) issues.push(`${fn.name}() too long: ${fn.length} lines`);
    if (fn.cyclomaticComplexity > THRESHOLDS.cyclomaticComplexity.block) issues.push(`${fn.name}() complexity: ${fn.cyclomaticComplexity} (max ${THRESHOLDS.cyclomaticComplexity.block})`);
  }

  const hasRed = functions.some(f => f.score === 'red') ||
    lines > THRESHOLDS.fileLines.block || maxNesting > THRESHOLDS.nestingDepth.block;
  const hasYellow = functions.some(f => f.score === 'yellow') ||
    lines > THRESHOLDS.fileLines.warn || maxNesting > THRESHOLDS.nestingDepth.warn;

  return {
    file: filePath,
    lines,
    functions,
    maxNesting,
    magicNumbers,
    todoCount,
    score: hasRed ? 'red' : hasYellow ? 'yellow' : 'green',
    issues,
  };
}

function getChangedFiles(): string[] {
  try {
    return execSync('git diff --name-only HEAD 2>/dev/null', { encoding: 'utf-8' })
      .split('\n').filter(f => f.trim() && /\.(ts|tsx|js|jsx)$/.test(f) && fs.existsSync(f));
  } catch { return []; }
}

function getFilesIn(target: string): string[] {
  if (fs.statSync(target).isFile()) return [target];
  const files: string[] = [];
  const walk = (d: string) => fs.readdirSync(d).forEach(e => {
    const full = path.join(d, e);
    if (fs.statSync(full).isDirectory() && !e.includes('node_modules') && !e.startsWith('.')) walk(full);
    else if (/\.(ts|tsx|js|jsx)$/.test(e)) files.push(full);
  });
  walk(target);
  return files;
}

function writeReport(reports: ComplexityReport[]): void {
  const dir = path.join(process.cwd(), '.omnirule', 'reports');
  fs.mkdirSync(dir, { recursive: true });

  const scoreIcon = (s: string) => s === 'green' ? '🟢' : s === 'yellow' ? '🟡' : '🔴';

  const md = `# Code Complexity Report
> Generated: ${new Date().toISOString()}

## Summary
| File | Lines | Max Nesting | Complexity | TODOs | Score |
|---|---|---|---|---|---|
${reports.map(r => `| \`${r.file}\` | ${r.lines} | ${r.maxNesting} | ${r.functions.length > 0 ? Math.max(...r.functions.map(f => f.cyclomaticComplexity)) : 1} | ${r.todoCount} | ${scoreIcon(r.score)} |`).join('\n')}

## Issues
${reports.flatMap(r => r.issues.map(i => `- \`${r.file}\`: ${i}`)).join('\n') || '✅ No issues found.'}

## Complex Functions
${reports.flatMap(r => r.functions.filter(f => f.score !== 'green').map(f =>
  `- \`${r.file}:${f.startLine}\` **${f.name}()** — ${f.length} lines, complexity ${f.cyclomaticComplexity} ${scoreIcon(f.score)}`
)).join('\n') || '✅ All functions within limits.'}
`;

  fs.writeFileSync(path.join(dir, 'complexity-report.md'), md);
  fs.writeFileSync(path.join(dir, 'complexity-report.json'), JSON.stringify(reports, null, 2));
}

export async function analyzeComplexity(target?: string): Promise<ComplexityReport[]> {
  const files = target ? getFilesIn(target) : getChangedFiles();
  if (files.length === 0) { console.log('[Complexity] No files to analyze'); return []; }

  console.log(`\n[Complexity] Analyzing ${files.length} file(s)...`);
  const reports = files.map(analyzeFile);
  writeReport(reports);

  const red = reports.filter(r => r.score === 'red');
  const yellow = reports.filter(r => r.score === 'yellow');

  console.log(`[Complexity] 🔴 ${red.length}  🟡 ${yellow.length}  🟢 ${reports.length - red.length - yellow.length}`);
  console.log(`[Complexity] Report: .omnirule/reports/complexity-report.md\n`);

  return reports;
}

if (process.argv[1]?.endsWith('code-complexity.ts')) {
  analyzeComplexity(process.argv[2]).catch(console.error);
}
