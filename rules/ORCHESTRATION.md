# OmniRule Orchestration Protocol (OOP)

This document defines the execution flow and communication standards for the OmniRule Agent Fleet.

## 1. Fleet Dispatch Logic
A "Dispatch" is the act of activating a specific agent persona for a target task.

- **Direct Dispatch:** User or Agent calls a persona explicitly (e.g., `@QA_Agent verify this PR`).
- **Conditional Dispatch:** Triggered by a Hookify rule (e.g., on file edit in `/app`, trigger `StyleAgent`).
- **Chain Dispatch:** One agent finishes and hands off to another (e.g., `Architect` -> `Infra`).

## 2. Inter-Agent Protocol (IAP)
Agents communicate via **Mission Memos** stored in `.omnirule/missions/`.

### Mission Memo Schema:
```json
{
  "id": "uuid",
  "source": "AgentName",
  "target": "AgentName",
  "status": "pending | active | completed | failed",
  "priority": "P0 | P1 | P2",
  "task": "Prompt for the target agent",
  "context": {
    "files": ["paths"],
    "dependencies": ["mission_ids"]
  },
  "artifacts": ["paths_to_outputs"]
}
```

## 3. Execution Gates
Before any agent ships code, it must pass through the **Convergence Loop**:
1. **Plan**: Agent states what it will do.
2. **Execute**: Agent performs the task.
3. **QA Gate**: `QA_Agent` must run tests and provide a pass/fail report.
4. **Docs Gate**: `DocsAgent` must update relevant documentation.

## 4. Automation Triggers
- **Pre-Commit**: `SecurityAgent` scans for secrets.
- **Post-Edit (UI)**: `StyleAgent` checks against design tokens.
- **On Build Failure**: `DevOpsAgent` analyzes logs and proposes a fix.

---
*Operational Authority: AGENTS.md*
