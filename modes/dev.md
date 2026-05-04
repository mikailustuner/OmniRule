---
name: dev
description: Development mode — fast implementation, full tool access, quality gate at end
---

# Mode: DEV

**Activate with:** `/mode dev`

## Behavior Profile
- **Speed:** Fast — skip planning gate for small tasks (<3 steps)
- **Tools:** All tools available
- **Quality gate:** Runs at Stop event (batched, not per-edit)
- **Security:** GateGuard active on config files only
- **Skill loading:** Auto — DesignVault injects on file edit

## Agent Priorities
1. `orchestrator` reads task → dispatches immediately without waiting for full plan
2. `frontend-ops` and `architect` are primary implementers
3. `qa-specialist` runs at the end, not before
4. `planner` is skipped for tasks with <3 steps

## Auto-Invoke Rules (DEV Mode)
| Trigger | Action |
|---|---|
| URL in message | Immediately run `npm run tool:extract -- <URL>` |
| `.tsx` file edited | Load `react-expert` + `typescript-expert` |
| `.prisma` file edited | Load `prisma-expert`, activate `context-agent` |
| `package.json` changed | Run `npm run tool:deps` |
| Implementation complete | Run `npm run omnirule:verify` |

## Quality Gate
- TypeScript check on changed `.ts/.tsx` files
- ESLint on changed files (max 10 warnings)
- Security audit on changed API/auth files
- **Does NOT block** on warnings — reports only

## Skill Loading
- Aggressive: load 3 skills per file context
- Hot-swap: switch skills when file context changes
