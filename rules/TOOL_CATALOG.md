---
description: Global catalog of all tools available in the OmniRule ecosystem. ALWAYS read this before deciding how to approach a task — use a tool instead of doing it manually.
alwaysApply: true
---

# OmniRule Tool Catalog

All agents access these tools via `npm run <script>`. **Prefer tools over manual work.**

---

## Quick Reference — When to Reach for a Tool

| Situation | Tool to use |
|---|---|
| User asks for PDF / report / rapor / analiz / teklif | `tool:document --type=pdf` via `document-creator` agent |
| User asks for sunum / presentation / slayt / deck | `tool:document --type=pptx` via `document-creator` agent |
| User gives a URL to copy/clone design | `tool:extract` |
| Starting a new session or project | `tool:skills` |
| Preparing for push (optional) | `tool:preflight` |
| Refactoring a file — want to know what breaks | `tool:impact` |
| Need CRUD for a new Prisma model | `tool:crud` |
| Changing an API — need to check for breaking changes | `tool:api-diff` |
| Suspecting dead/unused exports | `tool:dead-code` |
| Missing translations or hardcoded strings | `tool:i18n` |
| .env is out of sync | `tool:env` |
| Need a CHANGELOG for a release | `tool:changelog` |
| Need React components from design tokens | `tool:generate` |
| PR or major task complete | `omnirule:check` |
| After implementation — verify types | `omnirule:verify` |
| Security concern or auth file edited | `tool:security` |
| Dependency audit | `tool:deps` |
| Context window getting large | `tool:compact` |

---

## 1. Frontend Extractor

- **Command:** `npm run tool:extract -- <URL>`
- **Source:** `tools/frontend-extractor.ts`
- **Output:** `.design/{domain}/` — colors, typography, spacing, effects, screenshots, tailwind config

**When to use:** User says "build something like X", "extract design from Y", or provides a reference URL.

---

## 2. Component Generator

- **Command:** `npm run tool:generate -- <domain>` | `--list` | `--all`
- **Source:** `tools/component-generator.ts`
- **Output:** `src/components/{domain}/` — Button, Card, Input, Badge, Text with design token values

**When to use:** After running `tool:extract`, or when user asks for components matching the extracted design system.

---

## 3. Skill Detector

- **Command:** `npm run tool:skills`
- **Source:** `tools/skill-detector.ts`

**When to use:** Start of session, unfamiliar project, or before dispatching sub-agents.

---

## 4. Impact Analyzer

- **Command:** `npm run tool:impact -- <file-path>`
- **Source:** `tools/impact-analyzer.ts`
- **Output:** `.omnirule/reports/impact-{name}.md` — full reverse dependency graph, risk score

**When to use:** Before refactoring any file. Shows every file that imports the target, recursively. If risk is CRITICAL, warn user before proceeding.

---

## 5. CRUD Generator

- **Command:** `npm run tool:crud -- <ModelName> [--schema path/to/schema.prisma]`
- **Source:** `tools/crud-gen.ts`
- **Output:** `src/` — types, Zod schema, service layer, route handlers, test file

**When to use:** User asks for CRUD for a new or existing Prisma model. Reads `prisma/schema.prisma` automatically. Works without schema too (generates a scaffold).

---

## 6. Pre-flight Check

- **Command:** `npm run tool:preflight`
- **Source:** `tools/pre-flight.ts`
- **Checks:** Branch name, secrets, debug statements, TypeScript, cyclomatic complexity, test coverage, env

**When to use:** Optional check before push or when a full environment/complexity audit is needed.

---

## 7. API Diff

- **Command:** `npm run tool:api-diff -- <spec-a> <spec-b>`
- **Source:** `tools/api-diff.ts`
- **Checks:** Removed endpoints, changed parameters, response type changes — exits 1 on breaking changes

**When to use:** When modifying API routes, before deploying a new version. Compare old OpenAPI spec vs new.

---

## 8. i18n Audit

- **Command:** `npm run tool:i18n`
- **Source:** `tools/i18n-audit.ts`
- **Checks:** Hardcoded strings in JSX, missing keys in locale files, orphan keys

**When to use:** Before a release, or any time new UI text is added.

---

## 9. Dead Code Detector

- **Command:** `npm run tool:dead-code`
- **Source:** `tools/dead-code.ts`
- **Checks:** Named exports that are never imported anywhere

**When to use:** Before a major refactor, or as part of tech-debt cleanup.

---

## 10. Env Validator

- **Command:** `npm run tool:env [--fix]`
- **Source:** `tools/env-validator.ts`
- **Checks:** .env.example ↔ .env ↔ process.env references in source code

**When to use:** When env issues are suspected, before deploy, when onboarding a new dev. `--fix` auto-appends missing vars to .env.

---

## 11. Changelog Generator

- **Command:** `npm run tool:changelog [--unreleased] [--from v1.0.0] [--to v2.0.0] [--dry-run]`
- **Source:** `tools/changelog-gen.ts`
- **Output:** `CHANGELOG.md` — grouped by feat/fix/perf/security from Conventional Commits

**When to use:** Before a release, or when user asks for a changelog.

---


## 13. Git Sentinel

- **Command:** `npm run tool:git [--staged]`
- **Source:** `tools/git-sentinel.ts`

**When to use:** Optional pre-commit validation. Run manually to catch secrets or generate commit summaries.

---

## 14. Schema Visualizer

- **Command:** `npm run tool:schema`
- **Source:** `tools/schema-visualizer.ts`
- **Output:** Mermaid ER diagram + JSON model map from `prisma/schema.prisma`

**When to use:** When explaining or auditing the database schema, before migrations.

---

## 15. Performance Auditor

- **Command:** `npm run tool:perf -- <URL>`
- **Source:** `tools/performance-auditor.ts`

**When to use:** User asks for Core Web Vitals, LCP/CLS/FCP scores, or performance issues on a URL.

---

## 16. Code Complexity

- **Command:** `npm run tool:complexity`
- **Source:** `tools/code-complexity.ts`

**When to use:** During refactor planning, tech-debt audit, or when a file seems too complex.

---

## 17. Security Audit

- **Command:** `npm run tool:security`
- **Source:** `tools/security-audit.ts`

**When to use:** Before any commit, when auth/API/middleware files are edited, or when security officer agent is active.

---

## 18. Dependency Check

- **Command:** `npm run tool:deps`
- **Source:** `tools/dependency-sentinel.ts`

**When to use:** Session start, when package.json changes, before deploy.

---

## 19. Compact Context

- **Command:** `npm run tool:compact`
- **Source:** `tools/context-compactor.ts`

**When to use:** Context window is getting large. Builds a critical snapshot so nothing is lost during compaction.

---

## 20. Quality Gate

- **Command:** `npm run omnirule:verify`
- **Source:** `scripts/hooks/quality-gate.js`

**When to use:** After every implementation task, before reporting done.

---

## 21. Full Check

- **Command:** `npm run omnirule:check`
- **Purpose:** deps + security + quality in one shot.

**When to use:** Before PR or major milestone.

---

## 22. Mission Runner

- **Command:** `npm run tool:missions`
- **Source:** `tools/mission-runner.ts`

**When to use:** Viewing active mission state, checking agent handoff status.

---

## 23. Document Creator

- **Command:** `npm run tool:document -- --type=pdf --title="Title" --input=content.md --output=out.pdf`
- **Command (PPTX):** `npm run tool:document -- --type=pptx --title="Title" --input=content.md --output=out.pptx`
- **Source:** `tools/document-creator.ts`
- **Agent:** `document-creator` — handles research + structuring + generation end-to-end

### Flags:
| Flag | Description | Default |
|---|---|---|
| `--type` | `pdf` or `pptx` | `pdf` |
| `--title` | Document title | `Untitled Document` |
| `--subtitle` | Cover page subtitle | — |
| `--org` | Organisation name on cover | `OmniRule` |
| `--client` | Client name on cover | — |
| `--input` | Markdown content file | *(placeholder used)* |
| `--output` | Output file path | `output.pdf` / `output.pptx` |

### Output style: IBM/McKinsey
- Dark navy (`#051C2C`) + IBM blue (`#0F62FE`) palette
- IBM Plex Sans typography, A4 pages, 20mm/25mm margins
- Auto cover page, page numbers, section breaks
- PPTX: 16:9, 5 slide types (title, bullets, kpi, table, content)

**When to use — MANDATORY triggers:**
- User says "PDF", "rapor", "report", "analiz", "teklif", "proposal" → `--type=pdf`
- User says "sunum", "presentation", "slayt", "deck", "slides", "pptx" → `--type=pptx`
- Any document that needs to be downloaded, shared, or printed
- **NEVER write raw HTML/PPTX manually** — always run this tool

### Full workflow (document-creator agent follows this exactly):
```
1. Understand topic → research if needed (grep files, read docs)
2. Write structured markdown to a temp content file
3. Run: npm run tool:document -- --type=<pdf|pptx> --title="..." --input=content.md --output=<file>
4. Report output path + file size to user
```

---

## Adding a New Tool

1. Create `tools/{name}.ts` with a CLI entry at the bottom
2. Add `"tool:{name}": "tsx tools/{name}.ts"` to `package.json`
3. Add entry here in `TOOL_CATALOG.md`
4. Add command to `userspec/opencode.json`
5. Add entry to `registry.json`

---

*OmniRule — Operational Authority: AGENTS.md*
