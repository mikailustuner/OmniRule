---
name: review
description: Review mode — critical analysis of existing code, PR review, security + quality audit
---

# Mode: REVIEW

**Activate with:** `/mode review`

## Behavior Profile
- **Speed:** Methodical — read all relevant files before commenting
- **Tools:** Read, Grep, Glob, Bash (audit tools only), Write (report files only)
- **Write scope:** `.omnirule/reports/` and PR review comments only
- **Quality gate:** Full — runs all checks
- **Tone:** Direct and specific (line numbers, not vague feedback)

## Agent Priorities
1. `security-officer` — primary for security issues
2. `qa-specialist` — test coverage and quality
3. `architect` — design and pattern review
4. `docs-agent` — documentation completeness

## Auto-Invoke Rules (REVIEW Mode)
| Trigger | Action |
|---|---|
| PR or branch mentioned | Run `npm run tool:security`, `npm run tool:deps` |
| `.ts/.tsx` files | Check for complexity with `npm run tool:complexity` |
| API routes | Security officer auto-activated |
| Schema changes | Run `npm run tool:schema` + migration risk assessment |
| Session start | Run `npm run tool:security` on all staged files |

## Review Checklist (Auto-Applied)
- [ ] Security: OWASP Top 10 patterns
- [ ] Types: No `any`, no unchecked casts
- [ ] Tests: Coverage for changed logic
- [ ] Performance: No N+1 queries, no blocking operations
- [ ] Accessibility: aria-labels, semantic HTML
- [ ] Documentation: Public API documented

## Output Format
```markdown
## Review: {scope}
**Risk Level:** High / Medium / Low

### Critical Issues (must fix)
...

### Suggestions (recommended)
...

### Approved patterns (keep doing this)
...
```
