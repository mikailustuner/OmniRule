# Command: TDD (Test-Driven Development Excellence Protocol)

This SOP defines the mandatory implementation workflow for the OmniRule ecosystem. It ensures that every line of code is verifiable, reliable, and adheres to the project's high-fidelity standards.

---

## 1. The Philosophical Foundation of OmniRule TDD

In this repository, code without tests is treated as broken by design. TDD is not an "extra step"; it is the primary mechanism of construction.

### 1.1 The Red-Green-Refactor Mantra
1.  **RED:** Write a test that fails for the correct reason (assertion error, not compilation error).
2.  **GREEN:** Write the minimal code to satisfy the test.
3.  **REFACTOR:** Improve the code while keeping the test green.

### 1.2 Immutability and Testability
- Pure functions are inherently testable.
- Side-effects must be isolated and mocked using the **Dependency Injection** pattern.
- Avoid global state in tests. Each test must be a clean, isolated sandbox.

---

## 2. Phase 1: Specification and Test Design (RED)

### 2.1 Interface Definition
- Before writing the test, define the TypeScript interface for the target logic.
- Ensure types are strict (Avoid `any` at all costs).

### 2.2 Test Case Matrix
For every function/component, you must cover:
- **The Happy Path:** Standard valid input and expected output.
- **Edge Cases:** Boundary values (0, empty string, max integer, null, undefined).
- **Negative Paths:** Invalid inputs, unauthorized access attempts.
- **Asynchronous Failures:** Network timeouts, database connection drops.

### 2.3 Implementation of the Failing Test
- Place the test file in the same directory as the source (e.g., `logic.ts` -> `logic.test.ts`).
- Use descriptive `describe` and `it` blocks: `it('should calculate total with 20% tax when user is in UK')`.
- **Run the test:** Confirm it fails. If it passes, the test is faulty or the logic already exists (avoid duplication).

---

## 3. Phase 2: Implementation and Verification (GREEN)

### 3.1 Minimalist Implementation
- Write ONLY the code needed to pass the current test.
- Do not anticipate future requirements ("YAGNI" - You Ain't Gonna Need It).
- Follow the OmniRule Architectural Governance (EEP v2.0).

### 3.2 Immutability Enforcement
- Use spread operators or `immer` for state changes.
- Ensure all function inputs are treated as read-only.

### 3.3 Passing the Gate
- Run the test suite.
- Once green, do not stop. Proceed immediately to Refactor.

---

## 4. Phase 3: Refactor and Optimization (REFACTOR)

### 4.1 Clean Code Review
- **Variable Naming:** Are names descriptive and context-aware?
- **Function Extraction:** Is the function doing too much? (Max 50 lines).
- **Dryness:** Can repeated patterns be moved to a shared utility?

### 4.2 Performance Tuning
- Analyze loop complexity ($O(n)$ vs $O(n^2)$).
- Check for unnecessary re-renders (in React components).
- Ensure async operations are properly awaited and handled.

---

## 5. Advanced Testing Techniques

### 5.1 Mocking Strategy
- **External APIs:** Use `msw` (Mock Service Worker) for network interception.
- **Database:** Use a local SQLite or a Dockerized instance for integration tests.
- **Time:** Use `vi.useFakeTimers()` for testing timeout logic or scheduled tasks.

### 5.2 Mutation Testing (Optional but Recommended)
- Introduce small changes (mutations) to your implementation.
- If your tests still pass after a mutation, your tests are not sensitive enough. Improve the assertions.

### 5.3 Coverage Metrics
- **Line Coverage:** Minimum 80%.
- **Branch Coverage:** Minimum 80% (Ensure all `if/else` paths are tested).
- **Function Coverage:** 100% for critical business logic.

---

## 6. Pre-Commit Quality Checklist

- [ ] Have I removed all `console.log` statements?
- [ ] Does the test file clean up its side-effects (e.g., clearing mocks)?
- [ ] Is the code documentation (JSDoc) updated for the new function?
- [ ] Have I run the full suite (`npm test`) to ensure no regressions in other modules?
- [ ] Is the implementation compliant with the complexity budget defined in `INSTRUCTIONS.md`?

---

## 7. Troubleshooting Test Failures

- **Flaky Tests:** Identify race conditions. Use deterministic waits instead of static timeouts.
- **Environment Drift:** Ensure `process.env` in tests matches the expected test environment.
- **Mock Leakage:** If one test fails because of another, check for unreset global mocks.

---
*Operational Authority: instructions/INSTRUCTIONS.md | Repository: OmniRule*
