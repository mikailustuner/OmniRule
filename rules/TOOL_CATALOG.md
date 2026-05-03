---
description: Global catalog of standalone tools available in the OmniRule ecosystem.
alwaysApply: true
---

# OmniRule Tool Catalog

All agents access these tools via `npm run <script>` or `tsx tools/<file>`.

---

## 1. Frontend Extractor

- **Command:** `npm run tool:extract -- <URL> [--pages /path1,/path2]`
- **Source:** `tools/frontend-extractor.ts`
- **Engine:** Playwright (Chromium, headless)
- **Output:** `.design/{domain}/`

### What it extracts:
| Category | Data |
|---|---|
| Screenshots | Full-page desktop (1440px) + mobile (390px) per page |
| Colors | Background, text, border colors → hex palette |
| Typography | Font families, sizes, weights, line-heights, letter-spacing |
| Spacing | Padding, margin, gap values |
| Effects | Border-radius, box-shadow, backdrop-filter, transitions |
| Layout | Max-widths, z-index scale, display modes |

### Output files:
```
.design/{domain}/
  screenshots/          ← PNG files
  tokens/
    colors.json
    typography.json
    spacing.json
    effects.json
    layout.json
  DESIGN_RULES.md       ← Human-readable summary
  tailwind.config.js    ← Ready-to-use Tailwind config
```

### Setup (first time only):
```bash
npm run tool:extract:install   # installs Playwright Chromium
```

### When to use:
- User provides a reference URL for "build something similar"
- User says "extract design from X"
- Style Architect agent needs reference tokens

---

## 2. Skill Detector

- **Command:** `npm run tool:skills`
- **Source:** `tools/skill-detector.ts`
- **Purpose:** Scans the project and returns which expert skills are relevant

### Detected indicators:
- `next.config.*` → `nextjs-expert`
- `tailwind.config.*` → `tailwind-expert`
- `schema.prisma` → `prisma-expert`
- `tsconfig.json` → `typescript-expert`
- `Dockerfile` → `docker-patterns`

### When to use:
- Start of a new session in an unfamiliar project
- Orchestrator uses it automatically before dispatching

---

## 3. Quality Gate

- **Command:** `npm run omnirule:verify`
- **Source:** `scripts/hooks/quality-gate.js`
- **Purpose:** Batch lint + typecheck + test run

### When to use:
- Before completing any implementation task
- QA Agent uses it as final verification step
- DevOps Agent uses it as a CI gate check

---

## Adding a New Tool

1. Create `tools/{name}.ts`
2. Add CLI entry point at the bottom (check `process.argv[1]`)
3. Add script to `package.json`: `"tool:{name}": "tsx tools/{name}.ts"`
4. Register here in `TOOL_CATALOG.md`
5. Reference in `ORCHESTRATOR_AGENT.md` dispatch table

---

*OmniRule — Operational Authority: AGENTS.md*
