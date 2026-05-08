# Command: Research (Technical Intelligence and Feasibility Protocol)

This SOP defines the mandatory procedures for deep research, technical feasibility studies, and competitor intelligence within the OmniRule ecosystem. It ensures that every architectural decision is backed by empirical evidence and source attribution.

---

## 1. Research Objectives and Scope

Research in OmniRule is not a "Google Search"; it is a systematic intelligence operation to minimize technical risk and maximize innovation.

### 1.1 Types of Intelligence Missions
- **Feasibility Study:** Can we implement X with technology Y?
- **Library Selection:** Comparing Npm packages for bundle size, security, and maintenance.
- **Competitor Analysis:** How does [Competitor] handle this specific feature?
- **Trend Analysis:** Future-proofing the tech stack against industry shifts.
- **Financial Analysis:** Gathering market data, scraping tbliste, and calculating bond yields/spreads.
- **Business Operations (HR, Legal, Marketing, Sales):** Drafting contracts, creating marketing copy, screening resumes, and tracking operations metrics.

---

## 2. Phase 1: Information Acquisition (The Scan)

### 2.1 Multi-Source Extraction
- **Documentation:** Primary source of truth. Use the `documentation-lookup` skill.
- **Source Code:** Analyze the implementation of libraries on GitHub/Npm.
- **Ecosystem Signals:** Check GitHub stars, issue resolution rates, and release frequency.
- **Security Reports:** Scan for known vulnerabilities (CVEs) in target libraries.

### 2.2 Neural Search (Exa)
- Utilize the `exa-search` skill for high-signal, noise-free research.
- **Protocol:** Search for "Best practices for X in 2026" or "Post-mortem of system Y failure".

---

## 3. Phase 2: Synthesis and Analysis

### 3.1 Comparative Analysis (The Matrix)
When comparing technologies, create a decision matrix:
- **Performance:** Execution speed, memory footprint.
- **Maintainability:** Complexity of the API, community support.
- **Compatibility:** Does it work with our current monorepo (pnpm, Next.js, Prisma)?
- **License:** Ensure it is compliant with the project's legal requirements.

### 3.2 Evidence-First Reasoning
- **Rule:** Never state "Library A is better". State "Library A has 30% lower bundle size and 2x faster execution in benchmark X".
- **Source Attribution:** Every claim must have a URL or file reference.

---

## 4. Phase 3: Reporting and Recommendations

### 4.1 The Research Report Structure
1.  **Executive Summary:** 3-sentence overview for the Architect.
2.  **Key Findings:** The "Must-Know" facts discovered.
3.  **The Decision Matrix:** Visual comparison of options.
4.  **The Recommended Path:** Why this option was chosen.
5.  **Risks & Mitigations:** What could go wrong and how we handle it.

### 4.2 Presentation to the Architect
The research report is presented to the `ArchitectAgent` (or the user) for formal decision-making.

---

## 5. Technical Spikes (Experimental Verification)

Research often requires a "Spike" (a time-boxed implementation to verify feasibility).
- **Rule:** Spikes must be done in an isolated scratch directory (`.omnirule/spikes/`).
- **Goal:** Throwaway code that proves a concept.
- **Output:** A "Go/No-Go" decision.

---

## 6. Post-Research Knowledge Management

### 6.1 Update the Design Vault
If the research leads to a new architectural standard, update `.designrules/` and `instructions/INSTRUCTIONS.md`.

### 6.2 Archive the Findings
Store the final report in `.omnirule/research/` for future reference. This prevents "Memory Leakage" where the same research is done twice.

---

## 7. Quality Checklist for Research

- [ ] Have at least 3 alternative options been considered?
- [ ] Is every claim backed by a source?
- [ ] Has the bundle size/performance impact been quantified?
- [ ] Is the recommended library actively maintained (>1 release in 6 months)?
- [ ] Has the `SecurityAgent` reviewed the recommended library?

---
*Operational Authority: instructions/INSTRUCTIONS.md | Repository: OmniRule*
