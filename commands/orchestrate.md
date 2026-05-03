# Command: Orchestrate (Fleet Coordination and Mission Delegation)

This SOP defines the procedures for multi-agent coordination, task delegation, and cross-mission state synchronization within the OmniRule ecosystem. It ensures that the "Agent Fleet" operates as a cohesive, zero-waste engineering unit.

---

## 1. The Fleet Management Philosophy

Orchestration is the art of breaking a complex system goal into atomic, parallelizable missions that can be executed by specialized agent personas.

### 1.1 The Dispatcher Role
The primary agent (you) acts as the **Mission Dispatcher**. Your goal is to:
- Identify specialized tasks.
- Assign them to the correct persona (IAP).
- Verify the outputs and integrate them into the master branch.

### 1.2 Zero-Waste Engineering
Avoid overlapping missions. If two agents are working on the same file, a race condition occurs. Orchestration must ensure **Domain Isolation**.

---

## 2. Phase 1: Mission Decomposition (The DAG)

### 2.1 Domain Identification
- **Frontend Ops:** Assign to `StyleAgent` or `FrontendOpsAgent`.
- **Backend/Data:** Assign to `ArchitectAgent` or `InfraAgent`.
- **Quality/Testing:** Assign to `QA_Agent`.
- **Security Audit:** Assign to `SecurityAgent`.

### 2.2 Dependency Mapping
- Define which missions must complete before others can start (e.g., "API Schema" before "Frontend Component").
- Create a visual DAG in the `.omnirule/missions/` directory for each major project.

---

## 3. Phase 2: Mission Dispatch and IAP

### 3.1 Mission Memo Creation
Every delegation must be documented in a `mission-[id].json` file with:
- **Target Persona:** The agent role being activated.
- **Context Files:** Absolute paths to files the agent needs to read/write.
- **Success Criteria:** Binary (Pass/Fail) metrics for the mission.
- **State isolation:** Ensuring the agent works in a specific git branch or directory.

### 3.2 Inter-Agent Communication (IAP)
Agents communicate via **State Sync Files**.
- **Hand-off:** Agent A writes its artifacts to `.omnirule/artifacts/`.
- **Trigger:** Agent B reads those artifacts as its input context.

---

## 4. Phase 3: Integration and Convergence

### 4.1 Conflict Resolution
When multiple missions complete:
1.  **Merge Base:** Pull the latest changes from the master branch.
2.  **Conflict Scan:** Identify any logical or textual conflicts between agent outputs.
3.  **Resolution:** The Dispatcher (Primary Agent) resolves conflicts using the `build-fix.md` protocol.

### 4.2 The Quality Gate (QA Checkpoint)
- Every integrated mission must pass through a `QA_Agent` review.
- If a mission fails QA, it is sent back to the original agent with a **Failure Report**.

---

## 5. Parallel Execution Guardrails

### 5.1 Lock Management
- Prevent two agents from modifying `package.json` simultaneously to avoid lockfile corruption.
- Use a "Lock File" mechanism in `.omnirule/iap/lock` for critical system files.

### 5.2 Context Window Optimization
- Do not overwhelm sub-agents with the entire repo context.
- Provide only the **Relevant Slice** of the codebase required for their mission.

---

## 6. Monitoring and Dashboarding

### 6.1 Mission Status Tracking
Maintain a `DASHBOARD.md` in the root (or via an MCP tool) that shows:
- **Active Missions:** Which agent is doing what.
- **Completion Rate:** Progress towards the project goal.
- **Blockers:** Why a mission is stalled.

### 6.2 Performance Metrics
- **Turn Efficiency:** How many turns did the agent take to complete the mission?
- **Success Rate:** Was the implementation "Green" on the first try?

---

## 7. Escalation Protocol

If an agent mission fails repeatedly:
1.  **Stop:** Cancel the mission.
2.  **Deconstruct:** Analyze if the task was too complex or poorly defined.
3.  **Reformulate:** Break the task into smaller sub-missions and re-dispatch.

---
*Operational Authority: instructions/INSTRUCTIONS.md | Repository: OmniRule*
