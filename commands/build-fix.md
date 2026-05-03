# Command: Build-Fix (Root Cause Analysis and Resolution Protocol)

This SOP defines the mandatory protocol for diagnosing and resolving build-time failures, linting errors, and runtime crashes within the OmniRule monorepo.

---

## 1. The Incident Response Framework

When a build failure occurs, do not attempt "Trial and Error" fixes. Follow the **Surgical Correction** model.

### 1.1 Error Capture and Triage
1.  **Capture Log:** Extract the complete stderr output.
2.  **Primary Identification:** Locate the **First Failing Trace**. Cascaded errors are often misleading.
3.  **Context Mapping:** Identify the package, file, and specific line of failure.

### 1.2 Categorization
- **Syntax/TS Error:** Violation of TypeScript compiler rules.
- **Dependency Conflict:** Version mismatch or missing peer dependencies.
- **Module Resolution:** Pathing issues in `tsconfig.json` or `package.json` exports.
- **Environment Issue:** Missing `.env` variables or incorrect Node.js version.
- **Lint/Formatting:** Violation of project-specific stylistic rules.

---

## 2. Diagnostic Deep Dive (The RCA Phase)

Root Cause Analysis (RCA) is required for all systemic failures.

### 2.1 TypeScript Diagnosis
- Check for "Missing Type Definitions" (`@types/node`, `@types/fs-extra`).
- Analyze Generic Mismatches: Ensure type parameters in `DesignVault` or `Orchestrator` are correctly constrained.
- **Tooling:** Run `npx tsc --noEmit` on the specific package to isolate the error.

### 2.2 Dependency Audit
- **Check Lockfiles:** Is there a mismatch between `pnpm-lock.yaml` and `package.json`?
- **Phantom Dependencies:** Is the code importing a package that is not explicitly listed in its `package.json`?
- **Workspace Linking:** Ensure `packages/core` is correctly linked via pnpm workspaces.

### 2.3 Environmental Verification
- Compare `process.env` against `.env.example`.
- Verify Node.js version (`node -v`) matches the project requirement (e.g., v20+).
- Check for system-level binary dependencies (e.g., `libvips` for image processing).

---

## 3. Surgical Correction Protocol

### 3.1 Single-Point Intervention
- Apply the smallest possible change to resolve the error.
- Avoid "While I'm at it" refactors during a build-fix mission.

### 3.2 Verification Loop
1.  **Isolated Build:** Run build for the specific package: `npm run build --filter <pkg>`.
2.  **Dependency Check:** Verify that fixing one package didn't break its consumers.
3.  **Lint Verification:** Ensure the fix adheres to stylistic standards: `npm run lint`.

### 3.3 Documentation of the Fix
- If the fix required a workaround, add a `// FIXME:` comment explaining the rationale and a link to the relevant issue.
- Update `instructions/INSTRUCTIONS.md` if the error revealed a gap in the global engineering standards.

---

## 4. Common Failure Patterns and Solutions

### 4.1 "Module Not Found" (TS2307)
- **Check:** `paths` in `tsconfig.json`.
- **Check:** `exports` field in the dependency's `package.json`.
- **Action:** Run `pnpm install` to ensure workspace links are fresh.

### 4.2 "Type Is Not Assignable" (TS2322)
- **Check:** Null/Undefined handling. Use optional chaining (`?.`) or nullish coalescing (`??`).
- **Check:** Partial vs Required types.

### 4.3 "Cannot Find Name 'process/Buffer'" (TS2591)
- **Check:** `@types/node` presence in `devDependencies`.
- **Action:** Ensure `node` is included in the `types` array of `tsconfig.json`.

---

## 5. Escalation and Prevention

### 5.1 When to Escalate
- If the build error is caused by a bug in an external library.
- If the fix requires a major architectural change that was not in the original plan.

### 5.2 The "Never Again" Rule
For every resolved build-fix, ask: **"Could this have been prevented by a lint rule or a type constraint?"**
- If yes, implement the guardrail.
- If it was a common pitfall, add it to this SOP's "Common Patterns" section.

---

## 6. Build Success Checklist

- [ ] All packages in the workspace build successfully.
- [ ] No `any` or `ts-ignore` added as a "quick fix".
- [ ] Circular dependencies checked and removed.
- [ ] Final `npm run build` from root passes.

---
*Operational Authority: instructions/INSTRUCTIONS.md | Repository: OmniRule*
