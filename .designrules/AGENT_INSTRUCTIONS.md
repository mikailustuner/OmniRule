# OmniRule Agent Instructions
> Session started: 2026-06-03T17:47:01.517Z
> Detected skills: nextjs-expert, react-expert, tailwind-expert, prisma-expert, testing-patterns, typescript-expert

## Active Agent Fleet
Entry point: **ORCHESTRATOR** — reads every task and dispatches to the right specialist.

| Agent | Auto-triggers when |
|---|---|
| style-architect | URL given, CSS/Tailwind file edited, design request |
| architect | Architecture question, planning, new feature design |
| frontend-ops | .tsx/.jsx edited, state/bundle/perf issue |
| qa-specialist | Test file edited, "test" or "bug" in request |
| security-officer | Auth file edited, pre-commit, API route changed |
| devops-engineer | CI/CD, Dockerfile, deployment topic |
| infra-specialist | Schema, DB query, caching topic |

## Auto-Invoke Rules
Agents MUST automatically use these tools without waiting for slash commands:

| Condition | Auto Action |
|---|---|
| User provides a URL | Run: `npm run tool:extract -- <URL>` |
| Session starts | Run: `npm run tool:skills` |
| .tsx/.ts file edited | Load react-expert or typescript-expert skill |
| .prisma file edited | Load prisma-expert + postgres-patterns skills |
| Tailwind config edited | Load tailwind-expert skill |
| Context window filling | Run: `npm run tool:compact` |

---
## Active Skill: nextjs-expert

---
name: nextjs-expert
description: "Next.js 16: Server vs Client component decision, data fetching, Server Actions, Partial Prerendering, Turbopack, React 19, App Router architecture."
triggers:
  extensions: [".tsx", ".ts"]
  directories: ["app/", "pages/", "web/", "frontend/"]
  filenames: ["next.config.js", "next.config.ts"]
  keywords: ["Next.js", "RSC", "server component", "server action", "App Router", "ISR", "SSR", "use client", "use server", "turbopack", "partial prerendering"]
auto_load_when: "Building ANY web project - Next.js 16 is MANDATORY for all web projects. Use the App Router, Server Components, and Server Actions."
agent: frontend-ops
tools: ["Read", "Write", "Bash"]
---

# Next.js 16 Architecture Patterns (MANDATORY FOR ALL WEB PROJECTS)

**Version:** Next.js 16 (Latest) | **Focus:** Server components, Turbopack, Partial Prerendering, React 19

> **IMPORTANT:** Use Next.js 16 for ALL web projects. Pages Router is deprecated. Use App Router only.

---

## 1. Server vs Client Component Decision

```
Should this component be a Server Component?
├── Does it fetch data?                    → Server Component
├── Does it use useState/useEffect?        → Client Component ('use client')
├── Does it use browser APIs?              → Client Component
├── Does it handle events (onClick etc)?   → Client Component
├── Is it purely presentational/static?    → Server Component
└── Does it use React Context?             → Client Component

Performance rule:
└── Push 'use c

---
## Active Skill: react-expert

---
name: react-expert
description: "React 19: Hooks decision tree, State patterns, Component composition, Performance optimization strategy." 
triggers:
  extensions: [".tsx", ".jsx"]
  directories: ["components/", "app/"]
  keywords: ["React", "hooks", "useState", "useEffect", "useCallback", "Suspense", "use()"]
auto_load_when: "Writing React components or hooks"
agent: frontend-ops
tools: ["Read", "Write", "Bash"]
---

# React 19 Architecture Patterns

**Version:** React 19.2 | **Focus:** Decision trees, patterns, performance

## 1. use() Hook Decision

```
When to use use():
├── Promise in component → use(promise) pauses until resolved
├── Needs Suspense boundary → wraps in <Suspense>
├── Parallel data fetching → multiple use() in same component
│   └── React fetches all in parallel, streams in as ready
│
└── NOT for: client-side data, local state
```

**Pattern:**
```tsx
// BAD - blocking render
const data = await fetchData() // blocks entire component

// GOOD - uses Suspense
const data = use(fetchData()) // streams in, shows fallback while loading
```

---

## 2. State Pattern Selection

```
What type of state?
├── UI state (open/close, selected) → useState
│   └── Local component, simple transitions
│
├── Complex local state → useReducer
│   └── Multiple sub-values, complex transitions
│
├── Shared across components → Zustand/Context
│   └── Theme, auth, user preferences
│
└── Server data → React Query / TanStack Query
    └── NOT useState - cache on server
```

---


