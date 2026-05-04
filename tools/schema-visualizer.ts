#!/usr/bin/env tsx
/**
 * OmniRule Schema Visualizer
 *
 * Parses Prisma schema and generates:
 * - Mermaid ER diagram (models, relations, foreign keys, indexes)
 * - JSON model map (for context-agent consumption)
 * - Full markdown schema documentation
 *
 * Usage:
 *   npm run tool:schema                       — auto-detect schema.prisma
 *   npm run tool:schema -- prisma/schema.prisma
 *   npm run tool:schema -- --json             — JSON output only
 */

import * as fs from 'fs';
import * as path from 'path';

interface PrismaField {
  name: string; type: string; isRequired: boolean; isArray: boolean;
  isRelation: boolean; isId: boolean; isUnique: boolean;
  default?: string; relationModel?: string;
}

interface PrismaModel {
  name: string; fields: PrismaField[];
  indexes: string[]; uniqueConstraints: string[];
}

interface PrismaEnum { name: string; values: string[] }

export interface SchemaMap {
  models: PrismaModel[];
  enums: PrismaEnum[];
  relations: Array<{ from: string; field: string; to: string; type: '1-1' | '1-N' | 'N-M' }>;
}

function parseField(line: string): PrismaField | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('/') || trimmed.startsWith('@') || trimmed.startsWith('}')) return null;
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return null;
  const name = parts[0];
  let type = parts[1];
  const isArray = type.endsWith('[]');
  const isRequired = !type.endsWith('?') && !isArray;
  type = type.replace('[]', '').replace('?', '');
  const isId = trimmed.includes('@id');
  const isUnique = trimmed.includes('@unique');
  const isRelation = trimmed.includes('@relation');
  const defaultMatch = trimmed.match(/@default\(([^)]+)\)/);
  const SCALARS = ['String','Int','Float','Boolean','DateTime','Json','Bytes','Decimal','BigInt'];
  const isRelationType = !SCALARS.includes(type);
  return {
    name, type, isRequired, isArray,
    isRelation: isRelationType || isRelation,
    isId, isUnique,
    default: defaultMatch?.[1],
    relationModel: isRelationType ? type : undefined,
  };
}

export function parseSchema(content: string): SchemaMap {
  const models: PrismaModel[] = [];
  const enums: PrismaEnum[] = [];
  const lines = content.split('\n');
  let currentModel: PrismaModel | null = null;
  let currentEnum: PrismaEnum | null = null;
  let inModel = false, inEnum = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('model ')) {
      currentModel = { name: trimmed.split(' ')[1], fields: [], indexes: [], uniqueConstraints: [] };
      inModel = true; inEnum = false;
    } else if (trimmed.startsWith('enum ')) {
      currentEnum = { name: trimmed.split(' ')[1], values: [] };
      inEnum = true; inModel = false;
    } else if (trimmed === '}') {
      if (inModel && currentModel) models.push(currentModel);
      if (inEnum && currentEnum) enums.push(currentEnum);
      currentModel = null; currentEnum = null;
      inModel = false; inEnum = false;
    } else if (inModel && currentModel) {
      if (trimmed.startsWith('@@index')) {
        const m = trimmed.match(/@@index\(\[([^\]]+)\]/);
        if (m) currentModel.indexes.push(m[1]);
      } else if (trimmed.startsWith('@@unique')) {
        const m = trimmed.match(/@@unique\(\[([^\]]+)\]/);
        if (m) currentModel.uniqueConstraints.push(m[1]);
      } else {
        const field = parseField(line);
        if (field) currentModel.fields.push(field);
      }
    } else if (inEnum && currentEnum) {
      if (trimmed && !trimmed.startsWith('/')) currentEnum.values.push(trimmed.split(/\s+/)[0]);
    }
  }

  const relations: SchemaMap['relations'] = [];
  for (const model of models) {
    for (const field of model.fields) {
      if (field.relationModel && !relations.find(r => r.from === model.name && r.to === field.relationModel)) {
        relations.push({ from: model.name, field: field.name, to: field.relationModel, type: field.isArray ? '1-N' : '1-1' });
      }
    }
  }

  return { models, enums, relations };
}

function toMermaid(schema: SchemaMap): string {
  const lines = ['erDiagram'];
  for (const model of schema.models) {
    lines.push(`    ${model.name} {`);
    for (const field of model.fields.filter(f => !f.isRelation)) {
      const pk = field.isId ? ' PK' : '';
      const uk = field.isUnique && !field.isId ? ' UK' : '';
      lines.push(`        ${field.type} ${field.name}${pk}${uk}`);
    }
    lines.push('    }');
  }
  lines.push('');
  const seen = new Set<string>();
  for (const rel of schema.relations) {
    const key = `${rel.from}-${rel.to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const arrow = rel.type === '1-N' ? '||--o{' : '||--||';
    lines.push(`    ${rel.from} ${arrow} ${rel.to} : "${rel.field}"`);
  }
  return lines.join('\n');
}

function toMarkdown(schema: SchemaMap, schemaPath: string): string {
  const sections = [
    `# Schema Documentation`,
    `> Source: \`${schemaPath}\` | Generated: ${new Date().toISOString()}`,
    `> Models: **${schema.models.length}** | Enums: **${schema.enums.length}** | Relations: **${schema.relations.length}**`,
    '', '## ER Diagram', '', '```mermaid', toMermaid(schema), '```', '', '## Models', '',
  ];

  for (const model of schema.models) {
    sections.push(`### ${model.name}`, '');
    sections.push('| Field | Type | Required | Notes |');
    sections.push('|---|---|---|---|');
    for (const field of model.fields) {
      const notes = [
        field.isId ? 'PK' : '', field.isUnique ? 'UNIQUE' : '',
        field.isRelation ? `→ ${field.relationModel}` : '',
        field.default ? `default: ${field.default}` : '',
      ].filter(Boolean).join(', ');
      sections.push(`| \`${field.name}\` | \`${field.type}${field.isArray ? '[]' : ''}\` | ${field.isRequired ? '✅' : '—'} | ${notes} |`);
    }
    if (model.indexes.length) sections.push('', `**Indexes:** ${model.indexes.map(i => `\`[${i}]\``).join(', ')}`);
    if (model.uniqueConstraints.length) sections.push(`**Unique:** ${model.uniqueConstraints.map(i => `\`[${i}]\``).join(', ')}`);
    sections.push('');
  }

  if (schema.enums.length) {
    sections.push('## Enums', '');
    for (const e of schema.enums) {
      sections.push(`### ${e.name}`);
      sections.push(e.values.map(v => `- \`${v}\``).join('\n'));
      sections.push('');
    }
  }

  return sections.join('\n');
}

export function visualizeSchema(schemaPath?: string, jsonOnly = false): SchemaMap {
  const candidates = [schemaPath, 'schema.prisma', 'prisma/schema.prisma', 'db/schema.prisma'].filter(Boolean) as string[];
  const resolved = candidates.find(p => fs.existsSync(p));
  if (!resolved) { console.error('[Schema] No Prisma schema found. Tried:', candidates.join(', ')); process.exit(1); }

  console.log(`\n[Schema] Parsing: ${resolved}`);
  const schema = parseSchema(fs.readFileSync(resolved, 'utf-8'));
  console.log(`[Schema] ${schema.models.length} models, ${schema.enums.length} enums, ${schema.relations.length} relations`);

  const outDir = path.join(process.cwd(), '.omnirule', 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'schema-map.json'), JSON.stringify(schema, null, 2));

  if (!jsonOnly) {
    fs.writeFileSync(path.join(outDir, 'SCHEMA_VISUAL.md'), toMarkdown(schema, resolved));
    console.log(`[Schema] ER diagram + docs → .omnirule/reports/SCHEMA_VISUAL.md`);
  }

  console.log(`[Schema] JSON map → .omnirule/reports/schema-map.json\n`);
  return schema;
}

if (process.argv[1]?.endsWith('schema-visualizer.ts')) {
  const arg = process.argv[2];
  visualizeSchema(arg?.endsWith('.prisma') ? arg : undefined, arg === '--json');
}
