# Command: Agent — Direct Agent Dispatch

Directly activate a specific specialist agent from the OmniRule fleet.
Works in: Claude Code, OpenCode, Codex, Antigravity, Minimax, any AGENTS.md runner.

---

## Invocation

```
/agent <slug> <task>
```

**Examples:**
```
/agent qa write tests for src/api/auth.ts
/agent security review the payment flow
/agent architect plan the migration to microservices
/agent devops create a GitHub Actions CI pipeline
/agent style extract and apply vercel.com design
/agent researcher compare Zustand vs Jotai vs Redux Toolkit
/agent docs generate OpenAPI spec from src/api/
```

---

## Available Agents

| Slug | Agent File | Specialty |
|---|---|---|
| `architect` | `agents/ARCHITECT_AGENT.md` | System design, planning, refactoring |
| `style` | `agents/STYLE_AGENT.md` | CSS, design tokens, visual extraction |
| `frontend` | `agents/FRONTEND_OPS_AGENT.md` | React, state, performance, bundles |
| `qa` | `agents/QA_AGENT.md` | Testing, TDD, E2E, coverage |
| `security` | `agents/SECURITY_AGENT.md` | Vulnerabilities, auth, compliance |
| `devops` | `agents/DEVOPS_AGENT.md` | CI/CD, Docker, Kubernetes, Terraform |
| `infra` | `agents/INFRA_AGENT.md` | DB, Redis, caching, queues |
| `seo` | `agents/SEO_AGENT.md` | SEO, Core Web Vitals, semantic HTML |
| `researcher` | `agents/RESEARCHER.md` | Research, investigation, comparison |
| `docs` | `agents/DOCS_AGENT.md` | Documentation, README, OpenAPI |
| `context` | `agents/CONTEXT_AGENT.md` | Schema, Prisma, business logic |

---

## Agent Execution Protocol

When this command is invoked, the executing agent MUST:

1. Parse `$ARGUMENTS`: first token = agent slug, remainder = task
2. Load the agent file: `agents/{SLUG}_AGENT.md`
3. Adopt that agent's persona, tools, and mandates
4. Load the agent's declared skills from `opencode.json` or `AGENTS.md`
5. Execute the task in the agent's specialized mode
6. Follow the agent's SOP steps defined in its file

---

*OmniRule — agents/ORCHESTRATOR_AGENT.md*
