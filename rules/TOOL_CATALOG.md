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
| User gives a URL to copy/clone design | `tool:extract` |
| Starting a new session or project | `tool:skills` |
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

## 2. Skill Detector

- **Command:** `npm run tool:skills`
- **Source:** `tools/skill-detector.ts`

**When to use:** Start of session, unfamiliar project, or before dispatching sub-agents.

---

## 3. Security Audit

- **Command:** `npm run tool:security`
- **Source:** `tools/security-audit.ts`

**When to use:** Before any commit, when auth/API/middleware files are edited, or when security officer agent is active.

---

## 4. Dependency Check

- **Command:** `npm run tool:deps`
- **Source:** `tools/dependency-sentinel.ts`

**When to use:** Session start, when package.json changes, before deploy.

---

## 5. Compact Context

- **Command:** `npm run tool:compact`
- **Source:** `tools/context-compactor.ts`

**When to use:** Context window is getting large. Builds a critical snapshot so nothing is lost during compaction.

---

## 6. Quality Gate

- **Command:** `npm run omnirule:verify`
- **Source:** `scripts/hooks/quality-gate.js`

**When to use:** After every implementation task, before reporting done.

---

## 7. Full Check

- **Command:** `npm run omnirule:check`
- **Purpose:** deps + security + quality in one shot.

**When to use:** Before PR or major milestone.

---

## Adding a New Tool

1. Create `tools/{name}.ts` with a CLI entry at the bottom
2. Add `"tool:{name}": "tsx tools/{name}.ts"` to `package.json`
3. Add entry here in `TOOL_CATALOG.md`
4. Add command to `userspec/opencode.json`
5. Add entry to `registry.json`

---

*OmniRule — Operational Authority: AGENTS.md*
