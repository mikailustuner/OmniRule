---
name: research
description: Research mode — read-only investigation, no writes, deep analysis
---

# Mode: RESEARCH

**Activate with:** `/mode research`

## Behavior Profile
- **Speed:** Thorough — read everything before concluding
- **Tools:** Read, Grep, Glob, Bash (read-only commands only)
- **Write tools:** BLOCKED (GateGuard blocks all writes)
- **Quality gate:** Disabled (no code changes)
- **Output:** Analysis reports, comparisons, recommendations

## Agent Priorities
1. `researcher` is primary agent
2. `architect` for architectural analysis
3. `context-agent` for schema/data analysis
4. `docs-agent` for documentation review
5. All implementation agents (`frontend-ops`, `devops-engineer`) are inactive

## Auto-Invoke Rules (RESEARCH Mode)
| Trigger | Action |
|---|---|
| URL provided | Fetch with Jina Reader, do NOT screenshot |
| File path mentioned | Read file, analyze, report — do not modify |
| "compare X vs Y" | Research both, produce comparison table |
| "how does X work" | Trace through code, explain, no changes |

## Output Format
All research outputs go to `.omnirule/research/`:
```
.omnirule/research/
  {topic}-{date}.md
```

## Constraints
- NO file writes outside `.omnirule/research/`
- NO package installs
- NO git operations
- Every claim must cite a file path or line number
