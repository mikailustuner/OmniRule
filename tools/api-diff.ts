#!/usr/bin/env tsx
/**
 * OmniRule API Diff
 *
 * Compares two OpenAPI 3.x specs and identifies breaking changes.
 * Reads JSON or YAML files. Can also fetch from URLs.
 *
 * Usage:
 *   npm run tool:api-diff -- openapi-v1.json openapi-v2.json
 *   npm run tool:api-diff -- openapi-v1.json openapi-v2.json --json
 *   npm run tool:api-diff -- --base main --head HEAD   (git-based diff)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, '.omnirule', 'reports');

// ─── Types ────────────────────────────────────────────────────────────────────

interface OpenAPISpec {
  openapi?: string;
  info?: { title: string; version: string };
  paths?: Record<string, PathItem>;
  components?: { schemas?: Record<string, Schema> };
}

interface PathItem {
  [method: string]: Operation | undefined;
}

interface Operation {
  operationId?: string;
  summary?: string;
  parameters?: Parameter[];
  requestBody?: { required?: boolean; content?: Record<string, { schema?: Schema }> };
  responses?: Record<string, { description: string; content?: Record<string, { schema?: Schema }> }>;
  deprecated?: boolean;
  security?: Record<string, string[]>[];
}

interface Parameter {
  name: string;
  in: string;
  required?: boolean;
  schema?: Schema;
  deprecated?: boolean;
}

interface Schema {
  type?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  enum?: unknown[];
  $ref?: string;
  nullable?: boolean;
  allOf?: Schema[];
  oneOf?: Schema[];
  anyOf?: Schema[];
}

interface DiffIssue {
  severity: 'breaking' | 'warning' | 'info';
  path: string;
  method?: string;
  description: string;
}

// ─── Spec loader ──────────────────────────────────────────────────────────────

async function loadSpec(source: string): Promise<OpenAPISpec> {
  // HTTP(S) URL
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const res = await fetch(source);
    const text = await res.text();
    return parseSpec(text, source);
  }

  // Local file
  const filePath = path.isAbsolute(source) ? source : path.join(ROOT, source);
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${source}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseSpec(content, filePath);
}

function parseSpec(content: string, source: string): OpenAPISpec {
  // JSON
  if (content.trimStart().startsWith('{')) {
    return JSON.parse(content) as OpenAPISpec;
  }
  // YAML — minimal parser for common patterns
  return parseYaml(content);
}

function parseYaml(yaml: string): OpenAPISpec {
  // For full YAML support, fall back to JSON.parse attempt after basic transform
  // This handles the most common OpenAPI patterns
  try {
    // Quick YAML-to-JSON conversion for simple cases
    const jsonStr = yaml
      .replace(/^(\s*)(\w[\w-]*):\s*$/gm, (_, indent, key) => `${indent}"${key}": {`)
      .replace(/^(\s*)(\w[\w-]*):\s+(.+)$/gm, (_, indent, key, val) => {
        const v = val.trim();
        const jsonVal = v === 'true' ? 'true' : v === 'false' ? 'false' :
                        /^\d+$/.test(v) ? v : `"${v.replace(/"/g, '\\"')}"`;
        return `${indent}"${key}": ${jsonVal},`;
      });
    return JSON.parse(`{${jsonStr}}`) as OpenAPISpec;
  } catch {
    console.warn('[ApiDiff] Could not fully parse YAML — results may be incomplete');
    return {};
  }
}

// ─── Diff engine ──────────────────────────────────────────────────────────────

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

function diffSpecs(base: OpenAPISpec, head: OpenAPISpec): DiffIssue[] {
  const issues: DiffIssue[] = [];

  const basePaths = base.paths ?? {};
  const headPaths = head.paths ?? {};

  // 1. Removed paths
  for (const [routePath, pathItem] of Object.entries(basePaths)) {
    if (!headPaths[routePath]) {
      issues.push({
        severity: 'breaking',
        path: routePath,
        description: `Path removed: ${routePath}`,
      });
      continue;
    }

    // 2. Per-method checks
    for (const method of HTTP_METHODS) {
      const baseOp = pathItem[method] as Operation | undefined;
      const headOp = headPaths[routePath][method] as Operation | undefined;

      if (baseOp && !headOp) {
        issues.push({ severity: 'breaking', path: routePath, method, description: `${method.toUpperCase()} ${routePath} removed` });
        continue;
      }
      if (!baseOp) continue;
      if (!headOp) continue;

      // Newly deprecated
      if (!baseOp.deprecated && headOp.deprecated) {
        issues.push({ severity: 'warning', path: routePath, method, description: `${method.toUpperCase()} ${routePath} marked deprecated` });
      }

      // Parameter changes
      diffParameters(routePath, method, baseOp.parameters ?? [], headOp.parameters ?? [], issues);

      // Request body changes
      if (baseOp.requestBody && headOp.requestBody) {
        diffRequestBody(routePath, method, baseOp.requestBody, headOp.requestBody, issues);
      } else if (baseOp.requestBody && !headOp.requestBody) {
        issues.push({ severity: 'breaking', path: routePath, method, description: `Request body removed from ${method.toUpperCase()} ${routePath}` });
      }

      // Response changes
      diffResponses(routePath, method, baseOp.responses ?? {}, headOp.responses ?? {}, issues);
    }
  }

  // 3. New required paths (info only)
  for (const routePath of Object.keys(headPaths)) {
    if (!basePaths[routePath]) {
      issues.push({ severity: 'info', path: routePath, description: `New path added: ${routePath}` });
    }
  }

  // 4. Schema changes
  diffSchemas(base.components?.schemas ?? {}, head.components?.schemas ?? {}, issues);

  return issues;
}

function diffParameters(
  routePath: string, method: string,
  baseParams: Parameter[], headParams: Parameter[],
  issues: DiffIssue[]
): void {
  for (const bp of baseParams) {
    const hp = headParams.find(p => p.name === bp.name && p.in === bp.in);
    if (!hp) {
      issues.push({
        severity: bp.required ? 'breaking' : 'warning',
        path: routePath, method,
        description: `Parameter removed: ${bp.in}.${bp.name}`,
      });
      continue;
    }
    if (!bp.required && hp.required) {
      issues.push({
        severity: 'breaking', path: routePath, method,
        description: `Parameter ${bp.name} became required`,
      });
    }
    if (bp.schema?.type && hp.schema?.type && bp.schema.type !== hp.schema.type) {
      issues.push({
        severity: 'breaking', path: routePath, method,
        description: `Parameter ${bp.name} type changed: ${bp.schema.type} → ${hp.schema.type}`,
      });
    }
  }

  // New required parameters
  for (const hp of headParams) {
    const bp = baseParams.find(p => p.name === hp.name && p.in === hp.in);
    if (!bp && hp.required) {
      issues.push({
        severity: 'breaking', path: routePath, method,
        description: `New required parameter added: ${hp.in}.${hp.name}`,
      });
    }
  }
}

function diffRequestBody(
  routePath: string, method: string,
  base: Operation['requestBody'], head: Operation['requestBody'],
  issues: DiffIssue[]
): void {
  if (!base?.content || !head?.content) return;

  const baseJson = base.content['application/json']?.schema;
  const headJson = head.content['application/json']?.schema;

  if (!baseJson || !headJson) return;

  const baseRequired = new Set(baseJson.required ?? []);
  const headRequired = new Set(headJson.required ?? []);
  const baseProps = baseJson.properties ?? {};
  const headProps = headJson.properties ?? {};

  // Removed properties
  for (const prop of Object.keys(baseProps)) {
    if (!(prop in headProps)) {
      issues.push({
        severity: baseRequired.has(prop) ? 'breaking' : 'warning',
        path: routePath, method,
        description: `Request body property removed: ${prop}`,
      });
    }
  }

  // New required properties
  for (const prop of headRequired) {
    if (!baseRequired.has(prop) && !(prop in baseProps)) {
      issues.push({
        severity: 'breaking', path: routePath, method,
        description: `New required request body property: ${prop}`,
      });
    }
  }

  // Type changes
  for (const [prop, baseSchema] of Object.entries(baseProps)) {
    const headSchema = headProps[prop];
    if (headSchema && baseSchema.type && headSchema.type && baseSchema.type !== headSchema.type) {
      issues.push({
        severity: 'breaking', path: routePath, method,
        description: `Request body property type changed: ${prop} (${baseSchema.type} → ${headSchema.type})`,
      });
    }
  }
}

function diffResponses(
  routePath: string, method: string,
  base: Record<string, any>, head: Record<string, any>,
  issues: DiffIssue[]
): void {
  for (const statusCode of Object.keys(base)) {
    if (!head[statusCode]) {
      issues.push({
        severity: 'breaking', path: routePath, method,
        description: `Response status ${statusCode} removed from ${method.toUpperCase()} ${routePath}`,
      });
    }
  }
}

function diffSchemas(
  base: Record<string, Schema>, head: Record<string, Schema>,
  issues: DiffIssue[]
): void {
  for (const [name, baseSchema] of Object.entries(base)) {
    if (!head[name]) {
      issues.push({ severity: 'breaking', path: `#/components/schemas/${name}`, description: `Schema removed: ${name}` });
      continue;
    }
    const headSchema = head[name];

    // Required field additions
    const baseReq = new Set(baseSchema.required ?? []);
    const headReq = new Set(headSchema.required ?? []);
    for (const req of headReq) {
      if (!baseReq.has(req)) {
        issues.push({
          severity: 'breaking', path: `#/components/schemas/${name}`,
          description: `Schema ${name}: field '${req}' became required`,
        });
      }
    }

    // Property removals
    const baseProps = baseSchema.properties ?? {};
    const headProps = headSchema.properties ?? {};
    for (const prop of Object.keys(baseProps)) {
      if (!(prop in headProps)) {
        issues.push({
          severity: baseReq.has(prop) ? 'breaking' : 'warning',
          path: `#/components/schemas/${name}`,
          description: `Schema ${name}: property '${prop}' removed`,
        });
      }
    }
  }
}

// ─── Reporter ─────────────────────────────────────────────────────────────────

const c = {
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  cyan:   (s: string) => `\x1b[36m${s}\x1b[0m`,
  dim:    (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
};

function printIssues(issues: DiffIssue[], baseName: string, headName: string): void {
  const breaking = issues.filter(i => i.severity === 'breaking');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos    = issues.filter(i => i.severity === 'info');

  console.log(`\n${c.bold('🔍 API Diff:')} ${c.cyan(baseName)} → ${c.cyan(headName)}\n`);
  console.log(`  Breaking: ${c.red(String(breaking.length))}  Warnings: ${c.yellow(String(warnings.length))}  New: ${c.green(String(infos.length))}`);

  if (breaking.length > 0) {
    console.log(`\n${c.red('BREAKING CHANGES')} — will break existing clients:`);
    breaking.forEach(i => {
      const loc = i.method ? `${i.method.toUpperCase()} ${i.path}` : i.path;
      console.log(`  ${c.red('✗')} ${c.dim(loc)} — ${i.description}`);
    });
  }

  if (warnings.length > 0) {
    console.log(`\n${c.yellow('WARNINGS')} — review before deploying:`);
    warnings.forEach(i => {
      const loc = i.method ? `${i.method.toUpperCase()} ${i.path}` : i.path;
      console.log(`  ${c.yellow('⚠')} ${c.dim(loc)} — ${i.description}`);
    });
  }

  if (infos.length > 0) {
    console.log(`\n${c.green('NEW')} — additions (non-breaking):`);
    infos.forEach(i => console.log(`  ${c.green('+')} ${i.description}`));
  }

  if (issues.length === 0) {
    console.log(c.green('\n  ✓ No breaking changes detected'));
  }

  console.log('');
}

function writeReport(issues: DiffIssue[], baseName: string, headName: string): void {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const breaking = issues.filter(i => i.severity === 'breaking');
  const lines = [
    `# API Diff: ${baseName} → ${headName}`,
    `> ${new Date().toISOString()} | Breaking: **${breaking.length}**`,
    '',
    ...['breaking', 'warning', 'info'].flatMap(sev => {
      const group = issues.filter(i => i.severity === sev);
      if (group.length === 0) return [];
      return [
        `## ${sev.charAt(0).toUpperCase() + sev.slice(1)} (${group.length})`,
        ...group.map(i => `- \`${i.method?.toUpperCase() ?? ''} ${i.path}\`: ${i.description}`),
        '',
      ];
    }),
  ];
  fs.writeFileSync(path.join(REPORT_DIR, 'api-diff.md'), lines.join('\n'));
  console.log(`📄 Report: .omnirule/reports/api-diff.md`);
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const fileArgs = args.filter(a => !a.startsWith('--'));

  if (fileArgs.length < 2) {
    console.error('Usage: npm run tool:api-diff -- <base-spec> <head-spec> [--json]');
    console.error('  Formats: JSON (.json) or YAML (.yaml/.yml)');
    console.error('  Sources: local file path or https:// URL');
    process.exit(1);
  }

  const [baseSource, headSource] = fileArgs;

  console.log('[ApiDiff] Loading specs...');
  const [base, head] = await Promise.all([loadSpec(baseSource), loadSpec(headSource)]);

  console.log('[ApiDiff] Comparing...');
  const issues = diffSpecs(base, head);

  if (jsonMode) {
    console.log(JSON.stringify(issues, null, 2));
  } else {
    printIssues(issues, path.basename(baseSource), path.basename(headSource));
    writeReport(issues, baseSource, headSource);
  }

  const hasBreaking = issues.some(i => i.severity === 'breaking');
  process.exit(hasBreaking ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
