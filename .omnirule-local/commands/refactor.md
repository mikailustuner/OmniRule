# Command: Refactor (Architectural Evolution Protocol)

This SOP defines the mandatory procedures for restructuring existing code without changing its external behavior. Refactoring in OmniRule is a strategic operation aimed at reducing technical debt, improving performance, and enhancing maintainability.

---

## 1. Refactoring Philosophy

Refactoring is not a "Cleanup" task; it is a "System Evolution" task. It must be performed with the same rigor as feature implementation.

### 1.1 The Golden Rule of Refactoring
**Behavioral Preservation:** If a refactor changes the output of a function for a given input, it is a BREAKING CHANGE, not a refactor. Use the `tdd.md` protocol to ensure existing tests remain green.

### 1.2 Identification of Technical Debt (Smells)
- **Bloated Modules:** Files exceeding the 800-line limit.
- **Deep Nesting:** Logic that exceeds the 4-level nesting mandate.
- **Primitive Obsession:** Using generic types (string, number) where a specialized DTO or Interface is required.
- **Side-Effect Pollution:** Functions that modify external state or rely on non-deterministic globals.

---

## 2. Phase 1: Pre-Refactor Verification

### 2.1 Test Baseline Establishment
- Before modifying a single line, run the full test suite for the target module.
- If test coverage is below 80%, you MUST write missing tests before refactoring.
- **Verification:** Confirm all existing tests pass (`npm test`).

### 2.2 Refactoring Plan (The Micro-Blueprint)
- Define the specific goal: "Extracting auth logic to a custom hook" or "Optimizing loop complexity".
- Identify the impact radius: Which other modules import this logic?
- Create a surgical step-by-step list of changes.

---

## 3. Phase 2: Systematic Restructuring

### 3.1 Small Steps (Atomic Changes)
- Perform one refactoring pattern at a time (e.g., "Rename Variable", "Extract Method", "Inline Function").
- **Verification:** Run tests after every single atomic change. If tests fail, revert immediately and re-evaluate.

### 3.2 Immutability Realignment
- If the target code uses mutation, the primary goal of the refactor should be transitioning to the **Pure Flow** pattern (EEP v2.0).
- Replace `for` loops with functional patterns (`map`, `filter`, `reduce`) where readability is improved.

### 3.3 Complexity Reduction
- **Decomposition:** Break large functions into small, private helpers.
- **Logic Simplification:** Replace complex nested `if/else` chains with guard clauses and early returns.
- **Type Strengthening:** Replace `any` or loose types with strict interfaces and discriminated unions.

---

## 4. Phase 3: Performance and Optimization

### 4.1 Algorithmic Efficiency
- Identify $O(n^2)$ operations and optimize to $O(n \log n)$ or $O(n)$ if possible.
- Use Memoization for expensive computations that repeat with the same inputs.

### 4.2 Bundle and Load Optimization
- Ensure that the refactor doesn't introduce unnecessary dependencies.
- Optimize imports (Tree-shaking) to keep the bundle size within the complexity budget.

---

## 5. Post-Refactor Quality Gate

### 5.1 Verification Checklist
- [ ] Are all original tests still passing (Green)?
- [ ] Has the file size decreased or stabilized within the 400-800 line limit?
- [ ] Is the code more readable and self-documenting?
- [ ] Have all `TODO` and `FIXME` comments related to the debt been addressed?
- [ ] Has the `QA_Agent` performed a comparative review (Before vs. After)?

### 5.2 Documentation Sync
- Update JSDoc and internal comments to reflect the new structure.
- If the refactor changed a core architectural pattern, document it in the project's ADR (Architectural Decision Records).

---

## 6. Common Refactoring Patterns in OmniRule

### 6.1 Extract to Core
If a utility is found to be useful in multiple packages, move it to `packages/core`.

### 6.2 Interface Strengthening
Convert loose object literals to strict DTOs with validation via `Zod`.

### 6.3 State Management Simplification
Move complex local state into a centralized store (Zustand/Redux) or simplify existing stores to follow the **Single Source of Truth** principle.

---
*Operational Authority: instructions/INSTRUCTIONS.md | Repository: OmniRule*
