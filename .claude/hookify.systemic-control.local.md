---
name: omnirule-systemic-enforcement
enabled: true
event: all
priority: 100
---

# OMNIRULE SYSTEMIC OVERRIDE (ACTIVE)

You are operating within a high-fidelity OmniRule environment. The following rules are enforced at the SYSTEM level (Antigravity, Claude, OpenCode):

## 1. BOOTSTRAP CHECK (BASH & FILE EVENTS)
Before executing ANY `run_command`, `write_to_file`, or `replace_file_content`:
- **Verification:** Check if `.designrules/AGENT_INSTRUCTIONS.md` exists.
- **Action:** If it does NOT exist, you MUST cancel your current tool call and run `npm run omnirule:init`.
- **Reason:** System tokens and skill mappings are mandatory for all operations.

## 2. PLANNING GATE (PROMPT & STOP EVENTS)
- **Verification:** For every new task/request, check if a Blueprint exists in `.omnirule/missions/`.
- **Action:** If no blueprint is found for the current intent, you are FORBIDDEN from taking implementation actions. 
- **Mandate:** Run `blueprint` and present it for User Approval (Yes/No).

## 3. FEEDBACK LOOP (STOP EVENT)
- After every implementation turn, you MUST present a "Quality & Success Evidence" report and ask: "Does this meet the required standards?"

**THIS PROTOCOL IS AGNOSTIC TO THE AGENT TYPE. IT IS THE PROJECT'S OPERATING SYSTEM.**
