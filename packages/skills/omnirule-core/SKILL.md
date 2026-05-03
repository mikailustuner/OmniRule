---
name: OmniRule Orchestrator
description: The ultimate agentic engineering skill for deep site analysis, design memory persistence, and full-stack context mapping. Following Andrej Karpathy's minimalist principles.
version: 1.0.0
author: OmniRule Team
category: AI Tooling / Agentic Workflow
---

# OmniRule Core Orchestrator

OmniRule is a Context Expansion Engine designed to supercharge AI agents with ground-truth architectural data. This skill enables agents to transform raw extraction data into a persistent "Design and Logic Memory" for the project.

## Philosophy
- **Think First:** Before any extraction or analysis, verify the target URL, the specific intent, and the desired outcome. Never start a process without a clear goal.
- **Surgical Extraction:** Extract only the necessary design patterns, database contexts, or file structures. Avoid data bloat and focus on high-signal information.
- **Verifiable Results:** Every extraction must be followed by a formal verification step. The existence and accuracy of the .designrules folder is the primary success metric.
- **Ground Truth over Hallucination:** Prioritize extracted HTML/CSS and screenshots over the model's internal training data.

## Strategic Objectives
1. **Eliminate Hallucination:** Rely on real-time extraction (Jina HTML, Headless Screenshots) for all design decisions.
2. **Design Fidelity:** Maintain absolute compliance with source design systems via persistent vaulting.
3. **Architectural Mapping:** Simplify complex backend and frontend relationships into actionable context for agents.

## Mental Model: The Surgical System Architect
When utilizing OmniRule, the agent must operate with high precision:
- **Minimalism:** Do not implement features or abstractions beyond what is explicitly requested or evidenced by the extraction.
- **Verification:** Every action must have a measurable output. If a style is extracted, the configuration must match it 1:1.
- **No Speculation:** If data is missing or ambiguous, stop and clarify. Do not fill gaps with generic assumptions.

## Core Capabilities and Workflows

### 1. Frontend DNA Extraction (Style-Memory)
- **Action:** Deep-crawl target URLs using Jina-Reader and Headless APIs.
- **Output:** Atomized Design System (DESIGN_RULES.md) and Tailwind configurations.
- **Validation:** Visual comparison using full-page snapshots to ensure layout integrity.

### 2. DB Schema Mapping (Context-Memory)
- **Action:** Parse ORM schemas (Prisma, Drizzle) or SQL definitions.
- **Output:** Mermaid ER diagrams and Entity Context summaries.
- **Goal:** Enable rapid understanding of data relationships without manual code review.

### 3. Agent Instruction Protocol
- Every extraction must generate an AGENT_INSTRUCTIONS.md file in the vault.
- This file acts as a Context Lock to prevent architectural drift across sessions.

## Execution Protocol (The 3-Step Gate)

Before any OmniRule task, the agent must state:
1. **ASSUMPTIONS:** Clearly define what is assumed about the target system.
2. **EXECUTION PLAN:**
   - Step 1: Extraction -> Verify output files.
   - Step 2: Persistence -> Verify vault structure.
   - Step 3: Instruction -> Verify compliance rules.
3. **KARPATHY CHECK:** Confirm this is the simplest and most surgical path to completion.

## Monorepo Architecture Compliance
- @omnirule/cli: Interactive terminal interface.
- @omnirule/core: File system and vault logic.
- @omnirule/extractors: External API and parsing logic.
