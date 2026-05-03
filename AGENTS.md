# OmniRule Agent Fleet

Universal agent registry. Works with: **Claude Code**, **OpenCode**, **Codex/GitHub Copilot**, **Antigravity**, **Minimax**, and any AGENTS.md-compatible runner.

---

## Entry Point

All tasks start with the **Orchestrator**. It classifies the task and dispatches to the right specialist(s).

```
User Task → ORCHESTRATOR → [1-N specialist agents] → Synthesized output
```

---

## Agent Registry

### ORCHESTRATOR (Primary — always start here)
- **File:** `agents/ORCHESTRATOR_AGENT.md`
- **Role:** Task classification, agent dispatch, skill loading, result synthesis
- **Can call:** All 10 specialist agents as subagents
- **Skills:** Dynamic (loads based on task)

---

### Specialist Agents (Subagents)

| # | Agent | File | Skills Loaded |
|---|---|---|---|
| 1 | **Architect** | `agents/ARCHITECT_AGENT.md` | clean-architecture, ddd-patterns, microservices |
| 2 | **Style Architect** | `agents/STYLE_AGENT.md` | tailwind-expert, css-architecture, css-variables |
| 3 | **Frontend Ops** | `agents/FRONTEND_OPS_AGENT.md` | react-expert, state-management, bundle-optimization |
| 4 | **QA Specialist** | `agents/QA_AGENT.md` | testing-patterns, debugging-strategies |
| 5 | **Security Officer** | `agents/SECURITY_AGENT.md` | security-review, authentication-patterns |
| 6 | **DevOps Engineer** | `agents/DEVOPS_AGENT.md` | docker-patterns, ci-cd-patterns, kubernetes-basics |
| 7 | **Infra Specialist** | `agents/INFRA_AGENT.md` | postgres-patterns, redis-patterns, caching-patterns |
| 8 | **SEO Agent** | `agents/SEO_AGENT.md` | html-semantic, web-performance, accessibility-basics |
| 9 | **Researcher** | `agents/RESEARCHER.md` | documentation-patterns |
| 10 | **Docs Agent** | `agents/DOCS_AGENT.md` | documentation-patterns, api-design |
| 11 | **Context Agent** | `agents/CONTEXT_AGENT.md` | prisma-expert, postgres-patterns, ddd-patterns |

---

## Tools

| Tool | Command | Purpose |
|---|---|---|
| Frontend Extractor | `npm run tool:extract -- <URL>` | Screenshots + design token extraction → `.design/` |
| Skill Detector | `npm run tool:skills` | Detects required skills from project files |
| Quality Gate | `npm run omnirule:verify` | Lint + typecheck + tests |

---

## Commands

| Platform | Command | Agent |
|---|---|---|
| Claude Code / OpenCode | `/orchestrate <task>` | orchestrator |
| Claude Code / OpenCode | `/extract <URL>` | style-architect |
| Claude Code / OpenCode | `/design <path or URL>` | style-architect |
| Claude Code / OpenCode | `/agent <slug> <task>` | direct dispatch |
| Claude Code / OpenCode | `/plan <task>` | architect |
| Claude Code / OpenCode | `/tdd <task>` | qa-specialist |
| Claude Code / OpenCode | `/security <scope>` | security-officer |
| Claude Code / OpenCode | `/refactor <scope>` | architect |
| Claude Code / OpenCode | `/research <topic>` | researcher |
| Claude Code / OpenCode | `/docs <scope>` | docs-agent |
| Claude Code / OpenCode | `/build-fix` | devops-engineer |

---

## Design Extraction Flow

```
/extract https://apple.com
       ↓
  Playwright opens browser
       ↓
  Full-page screenshots (desktop + mobile)
       ↓
  CSS token extraction (colors, fonts, spacing, shadows)
       ↓
.design/apple.com/
  ├── screenshots/
  ├── tokens/ (colors.json, typography.json, spacing.json, effects.json)
  ├── DESIGN_RULES.md
  └── tailwind.config.js
```

---

## Inter-Agent Protocol (IAP)

Agents communicate via Mission Memos in `.omnirule/missions/`:

```json
{
  "id": "uuid",
  "source": "orchestrator",
  "target": "style-architect",
  "status": "pending | active | completed | failed",
  "priority": "P0 | P1 | P2",
  "task": "Extract design tokens from https://apple.com",
  "context": { "files": [], "skills": ["tailwind-expert"], "tools": ["frontend-extractor"] },
  "artifacts": [".design/apple.com/DESIGN_RULES.md"]
}
```

---

*OmniRule v1.11.0 — Operational Authority: rules/ORCHESTRATION.md*
