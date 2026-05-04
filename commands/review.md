# Command: Review — Code Review Specialist

Deep code review with security, quality, and architecture analysis.
Works in: Claude Code, OpenCode, Codex, Antigravity, Minimax.

---

## Invocation

```
/review                          — review staged git changes
/review src/api/auth.ts          — review specific file
/review src/api/                 — review directory
/review PR#42                    — review a pull request
/review --security               — security-focused review only
/review --architecture           — architecture and patterns only
```

---

## What It Does

1. Activates `review` mode automatically
2. Dispatches:
   - `security-officer` → OWASP scan, auth patterns, secrets
   - `qa-specialist` → test coverage, edge cases
   - `architect` → design patterns, complexity, coupling
3. Runs: `npm run tool:security` + `npm run tool:complexity`
4. Produces structured report in `.omnirule/reports/review-{date}.md`

---

## Review Criteria

### Critical (must fix before merge)
- Hardcoded secrets / credentials
- SQL injection / XSS vulnerabilities
- Missing auth checks on protected routes
- Breaking API changes without versioning
- Focused tests (`.only()`) left in

### High (should fix)
- Functions > 50 lines
- Nesting depth > 4
- Missing error handling on async operations
- `any` types in TypeScript
- Missing test coverage for new logic

### Suggestions (nice to have)
- Better naming
- Extract repeated logic
- Add JSDoc for public APIs
- Performance optimizations

---

## Agent Execution Protocol

1. Switch to `review` mode: load `modes/review.md`
2. Parse `$ARGUMENTS` to determine scope
3. If no args: run `git diff --staged --name-only` to get changed files
4. Run `npm run tool:security -- {scope}` 
5. Run `npm run tool:complexity -- {scope}` (when available)
6. Activate `security-officer` + `qa-specialist` + `architect`
7. Each agent reviews their domain in parallel
8. Synthesize findings into structured report

---

*OmniRule — agents/SECURITY_AGENT.md + QA_AGENT.md + ARCHITECT_AGENT.md*
