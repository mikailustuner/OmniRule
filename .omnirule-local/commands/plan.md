# Command: Plan (High-Fidelity Strategic Blueprinting)

This Standard Operating Procedure (SOP) governs the mandatory pre-implementation phase for all OmniRule missions. It defines the analytical framework required to transition from a user request to a verifiable technical execution path.

## 1. Contextual Intelligence and System Mapping

Before a single line of code is proposed, the agent must establish a 360-degree view of the target environment.

### 1.1 Intent Deconstruction
- Identify the primary business objective and technical constraints.
- Distinguish between "Functional Requirements" (what it does) and "Non-Functional Requirements" (performance, security, scalability).
- Map the request to existing OmniRule architectural patterns (e.g., Repository Pattern, Clean Architecture).

### 1.2 Impact Surface Analysis
- **Dependency Inversion Check:** Identify which existing modules the new logic will depend on.
- **Side-Effect Mapping:** Analyze if the proposed changes impact downstream consumers (API clients, database triggers, UI states).
- **Package Gravity:** Determine if the change belongs in `@omnirule/core`, a specialized package, or the main application.

### 1.3 Conflict Detection
- Scan for overlapping logic. Avoid "Reinventing the Wheel" by leveraging existing utilities in `packages/core`.
- Check for "Stale Patterns": Ensure the new plan does not introduce suboptimal code styles that are currently being refactored out of the repo.

---

## 2. Directed Acyclic Graph (DAG) Construction

OmniRule missions are executed as a series of atomic, verifiable steps organized in a DAG to ensure logical flow and dependency integrity.

### 2.1 Step Decomposition Rules
- **Atomicity:** Each step must be independent and verifiable.
- **Granularity:** Steps should ideally be between 20-100 lines of implementation code.
- **Validation Gates:** Every step must have a corresponding "Success Metric" (e.g., "Test X passes").

### 2.2 The 4-Layer Implementation Model
1.  **Foundation (Layer 0):** Interfaces, types, DTOs, and schema definitions. No logic allowed here.
2.  **Logic (Layer 1):** Pure functions, services, and business rules. Must be 100% unit-testable.
3.  **Integration (Layer 2):** Database connectors, external API clients, and side-effect management.
4.  **Presentation (Layer 3):** UI components, CLI interfaces, or API route handlers.

---

## 3. Risk Mitigation and Architectural Guardrails

### 3.1 Invariant Definition
Identify the system states that MUST NOT change during the mission.
- **Example:** "The `calculateTax` function must return the same value for existing users."
- **Example:** "The API response time must stay under 200ms."

### 3.2 Complexity Budgeting
- **Function Limit:** Any function exceeding 50 lines must be decomposed.
- **Cognitive Load:** Avoid deep nesting (>3 levels). Use guard clauses and early returns.
- **Technical Debt Assessment:** If a "Quick Hack" is proposed, it must be documented as an ADR (Architectural Decision Record) with a cleanup task.

---

## 4. Formal Proposal and User Alignment

The plan is not an internal memo; it is a contract with the user.

### 4.1 Proposal Structure
1.  **Summary of Intent:** Re-state the user request in technical terms.
2.  **Impacted Modules:** List specific files and directories.
3.  **Implementation Steps (The DAG):** A numbered list of atomic actions.
4.  **Verification Plan:** How the user can verify that the mission succeeded.
5.  **Unresolved Decisions:** Ask the user for clarification on ambiguous tradeoffs.

### 4.2 The Verification Gate
You are FORBIDDEN from entering Phase 2 (Implementation) without explicit user confirmation of the Blueprint.

---

## 5. Post-Planning Checklist (The Quality Gate)

- [ ] Does the plan follow the Immutability Mandate (EEP v2.0)?
- [ ] Is the "Definition of Done" (DoD) clearly defined for each step?
- [ ] Have potential security risks (Auth, Input Sanitization) been addressed in the plan?
- [ ] Is there a rollback strategy if the migration/update fails?
- [ ] Have I checked if there's a pre-existing `skill` for this task?

---

## 6. Execution Protocol

Once approved, the mission transitions to the **TDD Workflow** (`commands/tdd.md`).
- Each step of the DAG must be committed separately.
- Each commit message must follow the Conventional Commits format.

---
*Operational Authority: instructions/INSTRUCTIONS.md | Repository: OmniRule*
