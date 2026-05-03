---
description: Universal High-Performance Code Review Workflow
agent: ArchitectAgent
---

# 🔎 Global Code Review SOP

Perform a rigorous technical and architectural review of the provided code or PR.

## 🏁 Phase 1: Contextual Awareness
1. **Identify Module Type**: Is this UI, Logic, DB, or Infra?
2. **Check Rules**: Reference `.designrules/` and `.memory/` for project-specific constraints.
3. **Analyze Impact**: How does this change affect other parts of the system?

## 🏁 Phase 2: Technical Compliance
- **DRY/SOLID**: Ensure code is maintainable and decoupled.
- **Error Handling**: Are there try/catch blocks where needed? Is error reporting consistent?
- **Performance**: Look for N+1 queries, heavy loops, or unnecessary re-renders.
- **Security**: Sanitize inputs, check for secret leaks, and verify auth boundaries.

## 🏁 Phase 3: Visual & Style Compliance
- **Tailwind**: Ensure valid V4.0 Oxide utilities are used.
- **Aesthetics**: Does the UI match the premium feel defined in `DesignVault`?
- **Typography**: Check for consistent type hierarchy.

## 🏁 Phase 4: Quality Gate
- **Tests**: Are there corresponding tests for new logic?
- **Docs**: Is `README.md` or `AGENT_INSTRUCTIONS.md` updated if architecture changed?

---
*Output: Deliver a structured report with "BLOCKERS", "IMPROVEMENTS", and "PRAISE".*
