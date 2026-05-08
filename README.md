<div align="center">

# 🧠 OmniRule

### Universal AI Agent Orchestration Toolkit

**v1.15.0** — Agents · Skills · Tools · Commands · Hooks

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://typescriptlang.org)
[![Agents](https://img.shields.io/badge/agents-23-purple.svg)](#-agent-fleet)
[![Skills](https://img.shields.io/badge/skills-90+-orange.svg)](#-skill-library)

*Turn any AI coding assistant into a full engineering team.*

[Quick Start](#-quick-start) · [Architecture](#-architecture) · [Agents](#-agent-fleet) · [Commands](#-commands) · [Tools](#-tools) · [Skills](#-skill-library)

</div>

---

## 📖 Overview

**OmniRule** is an open-source, platform-agnostic orchestration layer that transforms AI coding assistants into a coordinated fleet of specialist agents. Instead of relying on a single general-purpose AI, OmniRule dispatches tasks to domain-specific agents — each with curated skills, tools, and operational protocols — ensuring enterprise-grade output quality across architecture, security, testing, DevOps, and more.

### Key Principles

- **🎯 Specialist Over Generalist** — Every task is routed to the agent best equipped to handle it.
- **🔌 Platform Agnostic** — Works with Claude Code, OpenCode, Codex/GitHub Copilot, Antigravity, Minimax, and any `AGENTS.md`-compatible runner.
- **📦 Zero Config** — One install script, instant agent fleet.
- **🛡️ Safety First** — Built-in security audit, quality gates, and human-in-the-loop approval for dangerous operations.
- **🧩 Modular Skills** — 90+ pluggable skill modules covering every major engineering discipline.

---

## ⚡ Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | ≥ 18.x  |
| **npm**     | ≥ 9.x   |

### Installation

#### Option 1: Local Install (project-level)

```bash
git clone https://github.com/mikailustuner/OmniRule.git
cd OmniRule
npm install
```

#### Option 2: Global OpenCode Install

```bash
# Standard install
bash install.sh --opencode

# Preview changes without writing
bash install.sh --opencode --dry-run

# Skip confirmation prompts
bash install.sh --opencode --force
```

#### Option 3: Windows (PowerShell)

```powershell
.\install.ps1
```

The installer automatically:
1. Detects your OS (Linux, macOS, WSL, Windows)
2. Backs up any existing configuration
3. Deploys all agents, skills, tools, commands, and hooks
4. Patches path references in `opencode.json`
5. Runs `npm install` for tool dependencies

### First Run

Once installed, open your AI assistant in your project directory and run:

```
/orchestrate <your task>
```

That's it. The Orchestrator agent will classify your task and dispatch it to the right specialist(s).

---

## 🏗️ Architecture

```
User Task
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR                           │
│  Task Classification → Agent Selection → Skill Loading   │
└────────────┬─────────────────────────────────┬───────────┘
             │                                 │
     ┌───────┴───────┐               ┌────────┴────────┐
     │  Specialist    │               │   Specialist     │
     │  Agent(s)      │      ...      │   Agent(s)       │
     │  + Skills      │               │   + Skills       │
     └───────┬───────┘               └────────┬────────┘
             │                                 │
             ▼                                 ▼
┌──────────────────────────────────────────────────────────┐
│                   Tools & Hooks Layer                     │
│  Security Audit · Quality Gate · Design Extractor · ...  │
└──────────────────────────────────────────────────────────┘
             │
             ▼
        Final Output
```

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Agent** | A specialized AI persona with domain-specific instructions, loaded skills, and operational protocols. |
| **Skill** | A modular knowledge pack (`SKILL.md`) containing expert-level patterns, decision trees, and best practices for a specific domain. |
| **Tool** | An executable TypeScript script that performs automated analysis (security scanning, dependency checking, design extraction, etc.). |
| **Command** | A slash-command (`/plan`, `/tdd`, `/security`, etc.) that triggers a specific agent with a predefined workflow. |
| **Hook** | An event-driven script triggered by session lifecycle events (start, tool use, stop). |
| **Mode** | A behavioral modifier (`dev`, `research`, `review`) that constrains agent capabilities and focus. |
| **Mission Memo** | A structured JSON document in `.omnirule/missions/` enabling inter-agent communication (IAP protocol). |

---

## 🤖 Agent Fleet

OmniRule ships with **23 specialist agents**, each with a distinct domain of authority.

### Primary Agent

| Agent | File | Role |
|-------|------|------|
| **Orchestrator** | `agents/ORCHESTRATOR_AGENT.md` | Entry point for all tasks. Classifies, dispatches, and synthesizes results. |

### Specialist Agents

| # | Agent | Slug | Domain | Key Skills |
|---|-------|------|--------|------------|
| 1 | **Planner** | `planner` | Task decomposition, DAG planning | blueprint |
| 2 | **Architect** | `architect` | System design, tech strategy | clean-architecture, ddd-patterns, microservices |
| 3 | **Style Architect** | `style-architect` | Visual engineering, CSS, design tokens | tailwind-expert, css-architecture, css-variables |
| 4 | **Frontend Ops** | `frontend-ops` | React, state, bundle optimization | react-expert, state-management, bundle-optimization |
| 5 | **QA Specialist** | `qa-specialist` | TDD, E2E, quality gates | testing-patterns, debugging-strategies |
| 6 | **Security Officer** | `security-officer` | Threat modeling, OWASP | security-review, authentication-patterns |
| 7 | **DevOps Engineer** | `devops-engineer` | CI/CD, Docker, Kubernetes | docker-patterns, ci-cd-patterns, kubernetes-basics |
| 8 | **Infra Specialist** | `infra-specialist` | Database, Redis, caching | postgres-patterns, redis-patterns, caching-patterns |
| 9 | **SEO Agent** | `seo-agent` | SEO, Core Web Vitals | html-semantic, web-performance, accessibility-basics |
| 10 | **Researcher** | `researcher` | Deep investigation, docs | documentation-patterns, bond-analyzer |
| 11 | **Docs Agent** | `docs-agent` | Technical writing, OpenAPI | documentation-patterns, api-design |
| 12 | **Context Agent** | `context-agent` | Schema mapping, Prisma | prisma-expert, postgres-patterns, ddd-patterns |
| 13 | **Migrator** | `migrator` | Database migrations, rollback | — |
| 14 | **Mobile Ops** | `mobile-ops` | React Native, Expo | mobile-patterns |
| 15 | **Document Creator** | `document-creator` | PDF/PPTX generation | professional-pptx-design, professional-report-design |
| 16 | **AI Engineer** | `ai-engineer` | LLM, Vector DB, MLOps | llm-integration, vector-db-patterns, prompt-engineering |
| 17 | **Cloud Architect** | `cloud-architect` | AWS, GCP, Azure | aws-patterns, gcp-patterns, azure-patterns |
| 18 | **Blockchain Developer** | `blockchain-developer` | Solidity, DeFi, Web3 | solidity-patterns, defi-patterns, web3-patterns |
| 19 | **Data Engineer** | `data-engineer` | ETL, streaming, warehousing | etl-patterns, data-pipeline-patterns, streaming-patterns |
| 20 | **Security Expert** | `security-expert` | Network security, cryptography | network-security, cryptography-patterns, compliance-gdpr |
| 21 | **Platform Engineer** | `platform-engineer` | Internal platforms, DX | internal-platforms, developer-experience |
| 22 | **Swift Developer** | `swift-developer` | iOS, SwiftUI, watchOS | swiftui-patterns, watchos-patterns, apple-design-guidelines |

---

## 💻 Commands

Slash-commands provide quick access to agent workflows. Available in Claude Code, OpenCode, and compatible runners.

| Command | Agent | Description |
|---------|-------|-------------|
| `/orchestrate <task>` | Orchestrator | Route any task through the full agent fleet |
| `/plan <task>` | Planner | Strategic decomposition with DAG output |
| `/extract <URL>` | Style Architect | Extract design tokens from any website |
| `/design <path or URL>` | Style Architect | Analyze, apply, or create a design system |
| `/agent <slug> <task>` | Direct dispatch | Bypass orchestrator, call a specific agent |
| `/tdd <task>` | QA Specialist | Red-Green-Refactor TDD workflow |
| `/security <scope>` | Security Officer | Security audit and threat modeling |
| `/review <scope>` | Security Officer | Deep code review (security + quality + arch) |
| `/refactor <scope>` | Architect | Structured code refactoring |
| `/research <topic>` | Researcher | Deep investigation and documentation lookup |
| `/docs <scope>` | Docs Agent | Generate or update documentation |
| `/build-fix` | DevOps Engineer | Diagnose and fix build failures |
| `/migrate <scope>` | Migrator | Database migration with rollback planning |
| `/perf <scope>` | Frontend Ops | Performance audit — Core Web Vitals |
| `/api <scope>` | Architect | API generation, OpenAPI scaffolding |
| `/mobile <task>` | Mobile Ops | React Native / Expo mobile development |
| `/mode <dev\|research\|review>` | Orchestrator | Switch agent behavior mode |

---

## 🔧 Tools

Automated analysis tools that agents invoke during missions.

| Tool | Command | Description |
|------|---------|-------------|
| **Frontend Extractor** | `npm run tool:extract -- <URL>` | Playwright-powered screenshots + full CSS token extraction (colors, typography, spacing, effects) → `.design/{domain}/` |
| **Skill Detector** | `npm run tool:skills` | Analyzes project files to detect and recommend required skills |
| **Security Audit** | `npm run tool:security` | Static analysis for OWASP vulnerabilities in changed files |
| **Dependency Sentinel** | `npm run tool:deps` | Scans `package.json` for vulnerable or deprecated packages |
| **Context Compactor** | `npm run tool:compact` | Builds a critical context snapshot for session compaction |
| **Quality Gate** | `npm run omnirule:verify` | TypeScript type-check + ESLint batch validation |
| **Full Check** | `npm run omnirule:check` | Combined: deps + security + quality gate |
| **Complete Pipeline** | `npm run omnirule:full` | Full pipeline: deps → security → quality |

### Design Extraction Flow

```
/extract https://example.com
       ↓
  Playwright opens browser (headless Chromium)
       ↓
  Full-page screenshots (desktop + mobile)
       ↓
  CSS token extraction (colors, fonts, spacing, shadows)
       ↓
.design/example.com/
  ├── screenshots/
  ├── tokens/
  │   ├── colors.json
  │   ├── typography.json
  │   ├── spacing.json
  │   └── effects.json
  ├── DESIGN_RULES.md
  └── tailwind.config.js
```

> **Setup:** Run `npm run tool:extract:install` once to install Playwright's Chromium browser.

---

## 📚 Skill Library

OmniRule includes **90+ modular skills** — curated knowledge packs loaded dynamically by agents based on task requirements. Each skill is a `SKILL.md` file containing decision trees, patterns, anti-patterns, and best practices.

<details>
<summary><strong>Frontend & UI (17 skills)</strong></summary>

| Skill | Description |
|-------|-------------|
| `react-expert` | React 19 hooks, composition, performance |
| `nextjs-expert` | Next.js 16 App Router, Server Components |
| `nextjs-routing` | Parallel/intercepting routes, middleware |
| `tailwind-expert` | Tailwind 4 theme architecture, dark mode |
| `css-architecture` | CSS organization, BEM, component patterns |
| `css-variables` | Custom properties, theming, runtime |
| `state-management` | Zustand vs Context vs Query patterns |
| `bundle-optimization` | Code splitting, tree shaking, lazy loading |
| `component-design-patterns` | Atomic design, composition, prop design |
| `forms-patterns` | Form architecture, validation, state |
| `responsive-design` | Mobile-first, breakpoint strategy |
| `responsive-images` | srcset, picture element, lazy loading |
| `animations-patterns` | Animation decisions, performance |
| `web-components` | Shadow DOM, custom elements, slots |
| `pwa-patterns` | Service workers, offline strategy |
| `html-semantic` | Semantic HTML, ARIA, accessibility tree |
| `data-visualization` | Charts, libraries, responsive patterns |

</details>

<details>
<summary><strong>Backend & API (10 skills)</strong></summary>

| Skill | Description |
|-------|-------------|
| `nodejs-expert` | Node.js 22 LTS, ESM, worker threads |
| `typescript-expert` | Advanced types, generics, utility types |
| `api-design` | REST resources, HTTP methods, responses |
| `api-backend` | Middleware, error handling, auth, validation |
| `graphql-patterns` | Schema, resolvers, subscriptions |
| `prisma-expert` | Schema design, query optimization |
| `real-time-patterns` | WebSockets, SSE, polling, reconnection |
| `websocket-patterns` | Connection management, rooms |
| `event-driven-patterns` | Event sourcing, CQRS, choreography |
| `message-queues` | Queue vs pub/sub, ordering, delivery |

</details>

<details>
<summary><strong>Infrastructure & DevOps (12 skills)</strong></summary>

| Skill | Description |
|-------|-------------|
| `docker-patterns` | Multi-stage builds, security hardening |
| `kubernetes-basics` | Pods, services, deployments, scaling |
| `ci-cd-patterns` | Pipeline strategy, deployment patterns |
| `terraform-basics` | IaC, state management, modules |
| `aws-patterns` | Lambda, ECS, DynamoDB, S3, RDS |
| `gcp-patterns` | Cloud Functions, Cloud Run, BigQuery |
| `azure-patterns` | Functions, Container Apps, Cosmos DB |
| `postgres-patterns` | Schema design, query optimization, JSON |
| `redis-patterns` | Data structures, cache, pub/sub, locks |
| `mongodb-patterns` | Schema design, aggregation, indexing |
| `caching-patterns` | Cache strategies, invalidation, CDN |
| `edge-computing` | Edge functions, Cloudflare Workers |

</details>

<details>
<summary><strong>Security & Compliance (6 skills)</strong></summary>

| Skill | Description |
|-------|-------------|
| `security-review` | Threat modeling, validation, auth |
| `authentication-patterns` | JWT, OAuth, sessions, 2FA, SSO |
| `network-security` | VPC, firewall, zero-trust, WAF |
| `cryptography-patterns` | Encryption, TLS, hashing, key management |
| `compliance-gdpr` | GDPR, SOC2, HIPAA, data privacy |
| `smart-contract-testing` | Unit tests, fuzzing, formal verification |

</details>

<details>
<summary><strong>Architecture & Patterns (8 skills)</strong></summary>

| Skill | Description |
|-------|-------------|
| `clean-architecture` | Layered architecture, dependency rule |
| `ddd-patterns` | Aggregates, value objects, bounded contexts |
| `hexagonal-architecture` | Ports and adapters |
| `microservices-patterns` | Decomposition, communication, resilience |
| `monolith-to-microservices` | Strangler pattern, migration |
| `code-review-patterns` | Review checklist, feedback patterns |
| `technical-debt` | Identification, prioritization, payoff |
| `blueprint` | Mandatory planning gate, DAG decomposition |

</details>

<details>
<summary><strong>Testing & Quality (3 skills)</strong></summary>

| Skill | Description |
|-------|-------------|
| `testing-patterns` | TDD, test selection, mock strategy |
| `debugging-strategies` | Systematic approach, root cause analysis |
| `chaos-engineering` | Fault injection, resilience testing |

</details>

<details>
<summary><strong>Mobile & Platform (5 skills)</strong></summary>

| Skill | Description |
|-------|-------------|
| `mobile-patterns` | React Native, PWA, native features |
| `swiftui-patterns` | Declarative UI, state, navigation |
| `watchos-patterns` | Digital Crown, complications, glances |
| `apple-design-guidelines` | HIG, accessibility, SF Symbols |
| `browser-apis` | Storage, IndexedDB, BroadcastChannel |

</details>

<details>
<summary><strong>AI, Data & Blockchain (11 skills)</strong></summary>

| Skill | Description |
|-------|-------------|
| `llm-integration` | API patterns, self-hosted, fallbacks |
| `prompt-engineering` | Templates, chain-of-thought, few-shot |
| `vector-db-patterns` | Embeddings, semantic search, RAG |
| `mlops-patterns` | Model deployment, monitoring, drift |
| `data-pipeline-patterns` | Batch/stream processing, orchestration |
| `etl-patterns` | Extract, Transform, Load, schema evolution |
| `streaming-patterns` | Kafka, Flink, windowing, exactly-once |
| `solidity-patterns` | Gas optimization, upgradeable contracts |
| `defi-patterns` | AMM, lending, staking, tokenomics |
| `web3-patterns` | Wallet connections, IPFS, smart contracts |
| `bond-analyzer` | Financial analysis, yield/spread calculation, API retrieval |

</details>

<details>
<summary><strong>DevOps, Docs & Other (9+ skills)</strong></summary>

| Skill | Description |
|-------|-------------|
| `documentation-patterns` | README structure, API docs |
| `git-workflow` | Branch strategy, commit patterns |
| `logging-patterns` | Structured logging, aggregation |
| `monitoring-patterns` | Metrics, alerting, observability |
| `search-patterns` | Full-text, Elasticsearch, relevance |
| `email-patterns` | Transactional email, templates |
| `file-handling` | Upload, storage, CDN |
| `internationalization` | i18n, pluralization, RTL, locales |
| `cron-jobs` | Scheduling, idempotency, monitoring |
| `web-performance` | Core Web Vitals, LCP, FID, CLS |
| `professional-pptx-design` | IBM/McKinsey style presentations |
| `professional-report-design` | Print-ready PDF reports |
| `developer-experience` | CLI tooling, onboarding |
| `internal-platforms` | Self-service infra, golden paths |
| `video-audio-patterns` | Media handling, WebRTC |
| `accessibility-basics` | WCAG, keyboard nav, screen reader |

</details>

---

## 🗂️ Project Structure

```
OmniRule/
├── agents/                  # 23 specialist agent definitions (.md)
│   ├── ORCHESTRATOR_AGENT.md    # Primary entry point
│   ├── ARCHITECT_AGENT.md       # System design
│   ├── STYLE_AGENT.md           # Visual engineering
│   ├── FRONTEND_OPS_AGENT.md    # React/bundle
│   ├── QA_AGENT.md              # Testing
│   ├── SECURITY_AGENT.md        # Security
│   ├── DEVOPS_AGENT.md          # CI/CD
│   ├── INFRA_AGENT.md           # Database/cache
│   ├── SEO_AGENT.md             # SEO
│   ├── RESEARCHER.md            # Investigation
│   ├── DOCS_AGENT.md            # Documentation
│   ├── CONTEXT_AGENT.md         # Schema/Prisma
│   ├── PLANNER_AGENT.md         # DAG planning
│   ├── MIGRATOR_AGENT.md        # DB migrations
│   ├── MOBILE_AGENT.md          # Mobile
│   ├── DOCUMENT_CREATOR_AGENT.md # PDF/PPTX
│   ├── AI_AGENT.md              # AI/ML
│   ├── CLOUD_ARCHITECT.md       # Cloud
│   ├── BLOCKCHAIN_AGENT.md      # Blockchain
│   ├── DATA_ENGINEER.md         # Data pipelines
│   ├── SECURITY_EXPERT.md       # Advanced security
│   ├── PLATFORM_ENGINEER.md     # Platform eng.
│   └── SWIFT_AGENT.md           # Apple platforms
├── commands/                # 18 slash-command definitions (.md)
├── skills/                  # 90+ skill modules (each with SKILL.md)
├── tools/                   # Automated analysis tools (.ts)
│   ├── frontend-extractor.ts    # Design token extraction
│   ├── skill-detector.ts        # Project skill detection
│   ├── security-audit.ts        # OWASP vulnerability scan
│   ├── dependency-sentinel.ts   # Dependency health check
│   └── context-compactor.ts     # Session context snapshot
├── rules/                   # Governance rules
│   ├── KARPATHY.md              # Core engineering principles
│   ├── ORCHESTRATION.md         # Agent dispatch rules
│   └── TOOL_CATALOG.md          # Available tools catalog
├── modes/                   # Behavioral modes
│   ├── dev.md                   # Fast implementation
│   ├── research.md              # Read-only investigation
│   └── review.md                # Critical code review
├── hooks/                   # Event-driven hook config
│   └── hooks.json
├── plugins/                 # Hook plugin system
│   └── omnirule-hooks.ts
├── scripts/                 # Hook scripts & utilities
│   └── hooks/
│       ├── session-start.js
│       ├── quality-gate.js
│       ├── gateguard.js
│       ├── security-check.js
│       └── skill-injector.js
├── lib/                     # Shared library
│   ├── file-cache.ts
│   ├── format.ts
│   └── store.ts
├── instructions/            # Core operational instructions
│   └── INSTRUCTIONS.md
├── omniweb/                 # Documentation website (Next.js)
├── userspec/                # Platform-specific configs
│   └── opencode.json
├── .design/                 # Extracted design tokens (output)
├── .designrules/            # Agent instruction cache
├── .omnirule/               # Runtime state (missions, reports)
├── AGENTS.md                # Universal agent registry
├── CLAUDE.md                # Claude Code bootstrap config
├── registry.json            # Complete component registry
├── index.ts                 # Package entry point
├── install.sh               # Unix installer
├── install.ps1              # Windows installer
├── package.json             # Dependencies & scripts
└── tsconfig.json            # TypeScript config
```

---

## 🔄 Inter-Agent Protocol (IAP)

Agents communicate via structured **Mission Memos** stored in `.omnirule/missions/`. This enables parallel agent execution, handoffs, and status tracking.

```json
{
  "id": "uuid",
  "source": "orchestrator",
  "target": "style-architect",
  "status": "pending | active | completed | failed",
  "priority": "P0 | P1 | P2",
  "task": "Extract design tokens from https://example.com",
  "context": {
    "files": [],
    "skills": ["tailwind-expert"],
    "tools": ["frontend-extractor"]
  },
  "artifacts": [".design/example.com/DESIGN_RULES.md"]
}
```

### Mission Lifecycle

```
pending → active → completed
                 → failed (with error context)
```

---

## 🛡️ Operating Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **dev** | Full tool access, batched quality gates | Active implementation |
| **research** | Read-only, no writes, deep analysis | Investigation & planning |
| **review** | Full security + quality audit | Code review & PR checks |

Switch modes with:
```
/mode dev
/mode research
/mode review
```

---

## ⚙️ Hooks & Lifecycle

OmniRule's hook system intercepts agent lifecycle events to enforce governance:

| Event | Hook | Purpose |
|-------|------|---------|
| `SessionStart` | `session-start.js` | Activates DesignVault, loads skills, prepares orchestration |
| `PreToolUse (Write/Edit)` | `gateguard.js` | Enforces bootstrap completion before writes |
| `PreToolUse (Bash)` | `security-check.js` | Security validation for shell commands |
| `PostToolUse (Read/Write)` | `skill-injector.js` | Dynamic skill loading based on file context |
| `Stop` | `quality-gate.js` | Final quality validation before session end |

---

## 📋 NPM Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run omnirule:init` | Initialize session (bootstrap) |
| `npm run omnirule:verify` | Run quality gate (TypeScript + ESLint) |
| `npm run omnirule:check` | Deps + security + quality gate |
| `npm run omnirule:full` | Full pipeline: deps → security → quality |
| `npm run tool:skills` | Detect required skills from project |
| `npm run tool:extract -- <URL>` | Extract design tokens from URL |
| `npm run tool:extract:install` | Install Playwright Chromium |
| `npm run tool:security` | Run security audit |
| `npm run tool:deps` | Check dependency health |
| `npm run tool:compact` | Build context snapshot |
| `npm run agents:list` | List all available agents |
| `npm run tools:list` | List all available tool scripts |
| `npm run registry` | Show registry stats |
| `npm run hooks:install` | Install git hooks (Lefthook) |
| `npm run hooks:uninstall` | Uninstall git hooks |

---

## 🌐 Platform Compatibility

OmniRule is designed to be universally compatible:

| Platform | Integration | Entry Point |
|----------|-------------|-------------|
| **Claude Code** | `.claude/commands/` + `CLAUDE.md` | Slash commands + bootstrap |
| **OpenCode** | `userspec/opencode.json` + `~/.config/opencode/` | Global skill injection |
| **Codex / GitHub Copilot** | `AGENTS.md` | Agent registry manifest |
| **Antigravity** | `AGENTS.md` | Agent registry manifest |
| **Minimax** | `AGENTS.md` | Agent registry manifest |

---

## 🔐 Security Model

### Tool Safety Classification

| Category | Tools | Behavior |
|----------|-------|----------|
| **Safe** (auto-execute) | `read`, `grep`, `glob`, `list_dir`, `view_file` | No approval needed |
| **Dangerous** (requires approval) | `write_to_file`, `replace_file_content`, `run_command`, `delete_file` | Explicit user confirmation |

### Built-in Security Tools

- **Security Audit** — Static analysis for OWASP Top 10 vulnerabilities
- **Dependency Sentinel** — Scans for known CVEs in npm packages
- **GateGuard Hook** — Prevents unauthorized writes before bootstrap
- **Security Check Hook** — Validates shell commands before execution

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-agent`)
3. **Add** your agent/skill/tool following existing conventions:
   - Agents: `agents/YOUR_AGENT.md` with YAML frontmatter
   - Skills: `skills/your-skill/SKILL.md`
   - Tools: `tools/your-tool.ts`
   - Commands: `commands/your-command.md`
4. **Register** your component in `registry.json`
5. **Test** with `npm run omnirule:full`
6. **Submit** a Pull Request

### Agent Conventions

Every agent file must include:
- A clear **role** and **domain authority**
- **Skills** to load on activation
- **Trigger conditions** for when it should be dispatched
- **Output format** specification

### Skill Conventions

Every skill must:
- Live in `skills/{name}/SKILL.md`
- Include YAML frontmatter with `name` and `description`
- Provide decision trees, not just documentation
- Include anti-patterns alongside patterns

---

## 📄 License

MIT © [OmniRule Team](https://github.com/mikailustuner)

---

<div align="center">

**OmniRule v1.15.0** — *Turn AI assistants into engineering teams.*

Built with 🧠 by the OmniRule community.

</div>
