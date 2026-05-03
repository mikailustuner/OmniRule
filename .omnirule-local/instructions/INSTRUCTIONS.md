# OmniRule: Engineering Excellence Protocol (EEP) v2.0

This document defines the mandatory architectural governance and operational lifecycle for all autonomous agents operating within the OmniRule ecosystem. Compliance with this protocol is non-negotiable for session validity.

---

## 1. System Initialization (Bootstrap Protocol)

Every session MUST begin with the activation of the project's cognitive infrastructure. This sequence ensures that the agent is synchronized with the repository's specific design tokens, logic patterns, and constraints.

### 1.1 Initialization Sequence
1.  **Execute Activation:** Run `npm run omnirule:init` as the primary tool call.
2.  **Context Synchronization:** Validate the population of `.designrules/AGENT_INSTRUCTIONS.md`.
3.  **Memory Integration:** Ingest project-specific instincts and SOPs from the `.memory/` directory.

> [!IMPORTANT]
> Failure to initialize triggers a systemic blockade. System hooks will intercept and cancel any implementation-level tool calls (write_to_file, replace_file_content) until bootstrap is verified.

---

## 2. Architectural Governance and Code Standards

The OmniRule codebase is governed by the principles of First-Principles Engineering, prioritizing long-term stability and clean abstractions.

### 2.1 Immutable Data Flow (The Pure-State Mandate)
Mutation of state is treated as a critical architectural failure. All logic must follow the Pure Flow pattern:
- **Input Integrity:** Function arguments and external state must remain untouched.
- **State Transition:** Use shallow/deep copying or specialized libraries (e.g., Immer) to produce new states.
- **Concurrency Safety:** Immutability is the primary mechanism for preventing race conditions during parallel agent missions.

```typescript
// PROHIBITED: Side-effect through mutation
const updateCart = (items, newItem) => { items.push(newItem); return items; }

// MANDATORY: Pure state transition
const updateCart = (items, newItem) => [...items, newItem];
```

### 2.2 Complexity Budgeting and File Decomposition
To maintain high maintainability, every module must adhere to the following constraints:
- **Function Length:** Max 50 logical lines. Extract sub-logic into private helpers.
- **Module Size:** Max 400 lines for high-traffic logic; 800 lines absolute ceiling.
- **Nesting Limit:** Maximum 4 levels of logical nesting (if/for/while).
- **Cohesion Rule:** High internal cohesion, low external coupling. Extract non-core utilities to the `@omnirule/core` package.

---

## 3. Mission Execution Lifecycle (The State Machine)

Every task must progress through a formalized state machine to ensure user alignment and technical fidelity.

### Phase 1: Planning (Blueprint)
- **Action:** Utilize the `blueprint` capability to decompose the request into a Directed Acyclic Graph (DAG).
- **Requirements:** Define dependencies, potential risks, and "Definition of Done" (DoD).

### Phase 2: Verification (User Gate)
- **Action:** Present the implementation DAG to the user for formal approval.
- **Blocker:** No implementation tools may be invoked without an explicit "Proceed" confirmation.

### Phase 3: TDD-Driven Implementation
1.  **Red:** Implement failing tests covering both happy paths and edge cases.
2.  **Green:** Write minimal, high-fidelity code to pass tests.
3.  **Refactor:** Optimize for performance and readability without breaking the test suite.

---

## 4. Agent Fleet Orchestration (IAP)

Agents interact via the Inter-Agent Protocol (IAP) to perform specialized tasks in parallel or sequence.

| Agent Role | Domain Authority | Primary Trigger |
| :--- | :--- | :--- |
| ArchitectAgent | System Design & Abstractions | New features, major refactoring |
| QA_Agent | TDD, E2E, Regression Testing | Code modification, PR review |
| SecurityAgent | Threat Modeling & Compliance | Authentication, data sensitivity |
| StyleAgent | Design Tokens & UI Consistency | Frontend components, CSS architecture |
| DevOpsAgent | Infrastructure & CI/CD | Deployment, environment config |

### Mission Communication
Agents communicate via structured **Mission Memos** in `.omnirule/missions/`. Every handoff must include context files, dependency IDs, and success criteria.

---

## 5. Security and Reliability Guardrails

### Zero-Trust Implementation
- **Input Validation:** Use `Zod` or similar for runtime type verification of all external data.
- **Secret Hygiene:** Environment variables only. Hardcoded secrets in code result in immediate rejection.
- **Leakage Prevention:** Sanitize all error messages and logs to prevent sensitive data exposure.

---

## 6. Success Metrics and Compliance

A mission is only marked "Completed" when:
- **Build Integrity:** `npm run build` succeeds with zero warnings.
- **Coverage Threshold:** Minimum 80% test coverage across all layers.
- **Peer Verification:** `QA_Agent` or a second independent review pass is successful.
- **Documentation:** All changes are reflected in relevant API docs and the project README.

---

## 7. Tool Execution and User Approval Protocol

To ensure system safety and human alignment, all agent tools are categorized by risk levels.

### 7.1 Safe Tools (Auto-Execution)
The following tools may be executed autonomously for context gathering:
- `read`, `grep`, `glob`, `list_dir`, `view_file`.

### 7.2 Dangerous Tools (Mandatory Approval)
The following tools **MUST NEVER** be executed without explicit user confirmation:
- `write_to_file`, `replace_file_content`, `run_command`, `delete_file`.
- **Protocol:** You must state: "I am proposing to [ACTION] in [FILE/PATH]. Do you approve?"

### 7.3 Enforcement
Failure to request approval for "Dangerous" tools will result in a **Systemic Blockade** by the OmniRule Hookify layer.

---

## 8. Automatic Tool Trigger Protocol (Reflex Layer)

The following tools must be executed by the agent automatically based on specific mission events. Manual user intervention is not required for these triggers.

### 8.1 Pre-Implementation (Intelligence)
- **New Package Request:** Run `npm run tool:sentinel <package>` before adding any dependency to `package.json`.
- **Logic Search:** Run `npm run tool:search` or `npm run tool:knowledge` before declaring "code not found".

### 8.2 During Implementation (Safety)
- **Security Sensitive Code:** Run `npm run tool:red-team` after modifying auth, database, or API logic.
- **Structural Changes:** Run `npm run tool:schema` to verify architectural alignment.

### 8.3 Mission Completion (The Final Gate)
- **Mandatory Final Check:** Before asking for final user approval, you MUST run `npm run tool:quality`.
- **Knowledge Persistence:** If a significant decision was made, run `npm run tool:adr`.
- **Commit Prep:** Run `npm run tool:summary` to generate the final report and commit message.

---
*Operational Authority: rules/KARPATHY.md*
