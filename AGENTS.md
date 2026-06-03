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
- **Can call:** All 25 specialist agents as subagents
- **Skills:** Dynamic (loads based on task)

---

### Specialist Agents (Subagents)

| # | Agent | File | Skills Loaded |
|---|---|---|---|
| 1 | **Architect** | `agents/ARCHITECT_AGENT.md` | clean-architecture, ddd-patterns, microservices, trpc-patterns, turborepo-patterns |
| 2 | **Style Architect** | `agents/STYLE_AGENT.md` | tailwind-expert, css-architecture, css-variables |
| 3 | **Frontend Ops** | `agents/FRONTEND_OPS_AGENT.md` | react-expert, state-management, bundle-optimization, remix-expert, nuxt-expert |
| 4 | **QA Specialist** | `agents/QA_AGENT.md` | testing-patterns, debugging-strategies |
| 5 | **Security Officer** | `agents/SECURITY_AGENT.md` | security-review, authentication-patterns, clerk-auth |
| 6 | **DevOps Engineer** | `agents/DEVOPS_AGENT.md` | docker-patterns, ci-cd-patterns, kubernetes-basics |
| 7 | **Infra Specialist** | `agents/INFRA_AGENT.md` | postgres-patterns, redis-patterns, caching-patterns, supabase-patterns, drizzle-orm |
| 8 | **SEO Agent** | `agents/SEO_AGENT.md` | html-semantic, web-performance, accessibility-basics |
| 9 | **Researcher** | `agents/RESEARCHER.md` | documentation-patterns, bond-analyzer, 100+ business skills |
| 10 | **Docs Agent** | `agents/DOCS_AGENT.md` | documentation-patterns, api-design |
| 11 | **Context Agent** | `agents/CONTEXT_AGENT.md` | prisma-expert, postgres-patterns, ddd-patterns, drizzle-orm |
| 12 | **Migrator** | `agents/MIGRATOR_AGENT.md` | postgres-patterns, prisma-expert |
| 13 | **Mobile Ops** | `agents/MOBILE_AGENT.md` | mobile-patterns, flutter-patterns, expo-router |
| 14 | **Document Creator** | `agents/DOCUMENT_CREATOR_AGENT.md` | professional-pptx-design, professional-report-design |
| 15 | **AI Engineer** | `agents/AI_AGENT.md` | llm-integration, vector-db-patterns, prompt-engineering, mlops-patterns |
| 16 | **Cloud Architect** | `agents/CLOUD_ARCHITECT.md` | aws-patterns, gcp-patterns, azure-patterns |
| 17 | **Blockchain Developer** | `agents/BLOCKCHAIN_AGENT.md` | solidity-patterns, defi-patterns, web3-patterns |
| 18 | **Data Engineer** | `agents/DATA_ENGINEER.md` | etl-patterns, data-pipeline-patterns, streaming-patterns |
| 19 | **Security Expert** | `agents/SECURITY_EXPERT.md` | network-security, cryptography-patterns, compliance-gdpr |
| 20 | **Platform Engineer** | `agents/PLATFORM_ENGINEER.md` | internal-platforms, developer-experience, feature-flags |
| 21 | **Swift Developer** | `agents/SWIFT_AGENT.md` | swiftui-patterns, watchos-patterns, apple-design-guidelines |
| 22 | **Computer Operator** | `agents/COMPUTER_OPERATOR_AGENT.md` | computer-use |
| 23 | **Planner** | `agents/PLANNER_AGENT.md` | blueprint |
| 24 | **Performance Engineer** | `agents/PERFORMANCE_AGENT.md` | web-performance, bundle-optimization, caching-patterns |
| 25 | **Analytics Engineer** | `agents/ANALYTICS_AGENT.md` | a-b-testing, feature-flags, monitoring-patterns |

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

*OmniRule v1.15.0 — Operational Authority: rules/ORCHESTRATION.md*
