# Command: Documentation (Knowledge Sovereignty and ADR Protocol)

This SOP defines the procedures for maintaining high-fidelity technical documentation, Architectural Decision Records (ADRs), and API specifications within the OmniRule ecosystem.

---

## 1. The Documentation Philosophy

In OmniRule, documentation is not an "Afterthought"; it is a **Core System Component**. If it is not documented, it does not exist.

### 1.1 Principles of Knowledge Sovereignty
- **Source of Truth:** The repository must be self-documenting. External docs (Wikis, Notion) are secondary.
- **Precision:** Use technical terminology correctly. Avoid vague descriptions like "This does stuff".
- **Automated Sync:** Documentation should ideally be derived from code (e.g., JSDoc, OpenAPI).

---

## 2. Types of Documentation Artifacts

### 2.1 README (The Front Door)
- **Purpose:** Onboarding and project overview.
- **Mandate:** Must include "Getting Started", "Architecture Map", and "Development Workflow".

### 2.2 ADR (Architectural Decision Record)
- **Purpose:** Documenting "Why" a decision was made.
- **Mandate:** Use the `architecture-decision-records` skill to capture the context, alternatives, and rationale for every major change.

### 2.3 API Documentation (OpenAPI/Swagger)
- **Purpose:** Defining the contract for clients and services.
- **Mandate:** Every API endpoint in `app/api` must have a corresponding TypeScript interface and descriptive JSDoc.

---

## 3. Phase 1: Identification of Changes

### 3.1 Impact Analysis
- After every implementation mission, identify which documents need updating.
- **Checklist:** README, API Docs, Skill Instructions, Diagrams.

### 3.2 Diagram Generation (Mermaid)
- Use Mermaid diagrams to visualize system flow, ER diagrams, and component hierarchies.
- **Rule:** Diagrams must be kept in sync with the actual implementation.

---

## 4. Phase 2: Drafting and Review

### 4.1 The Documentation SOP
1.  **Analyze Code:** Read the final implementation.
2.  **Draft:** Create/Update the markdown files.
3.  **Review:** Use the `senior-developer` or `DocsAgent` to review for clarity and technical accuracy.

### 4.2 JSDoc Standards
- Every exported function must have a JSDoc block.
- Must include `@param`, `@returns`, and `@throws` if applicable.
- **Example:**
```typescript
/**
 * Calculates the complexity budget for a given module.
 * @param lines - Number of logical lines in the file.
 * @returns The budget score from 0 to 100.
 */
```

---

## 5. Phase 3: Knowledge Persistence

### 5.1 Updating the Agent Context
- If a documentation change affects how agents should behave, update `CLAUDE.md` or `.designrules/AGENT_INSTRUCTIONS.md`.

### 5.2 Versioning and History
- Documentation changes must be committed alongside the code they describe. No "Docs update" commits weeks later.

---

## 6. Quality Checklist for Documentation

- [ ] Is the language formal and professional (No emojis)?
- [ ] Are all code examples up-to-date and working?
- [ ] Are all Mermaid diagrams rendering correctly?
- [ ] Has the `architecture-decision-records` skill been used for the major changes?
- [ ] Is the "Definition of Done" for the mission reflected in the docs?

---

## 7. Specialized Documentation: Skill Guides

Every skill in the `skills/` directory must follow a standard structure:
- **Context:** When to use the skill.
- **Implementation:** Step-by-step instructions.
- **Examples:** Working code snippets.
- **Anti-Patterns:** What NOT to do.

---
*Operational Authority: instructions/INSTRUCTIONS.md | Repository: OmniRule*
