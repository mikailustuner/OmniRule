# OmniRule: Mandatory Agent Lifecycle

## 0. ABSOLUTE FIRST ACTION (BOOTSTRAP)
Before doing ANYTHING (including reading files or planning), you MUST run:
```bash
npm run omnirule:init
```
**Why?** This command activates the `DesignVault`, loads project skills, and prepares the mandatory orchestration layer. If you skip this, the system will block your further actions via Hookify.

## 1. Skill Auto-Activation
Before taking any action, run `OmniRule` skill detection to load the correct context.
- **Trigger:** Any file edit or terminal command.
- **Mechanism:** Reference `packages/core/src/index.ts` logic.

## 2. The Mandatory 3-Phase Gate
You are FORBIDDEN from executing code without passing these gates:

### Phase 1: Blueprint (Automatic Planning)
- **Action:** Use the `blueprint` skill to decompose the task.
- **Output:** A structured plan with dependencies and success metrics.
- **Rule:** Never start with "I will do X". Start with a Blueprint.

### Phase 2: User Checkpoint (Feedback)
- **Action:** Present the Blueprint to the user.
- **Ask:** "Does this plan align with your intent? (Yes/No/Adjust)"
- **Wait:** You MUST stop and wait for explicit approval.

### Phase 3: Verified Execution
- **Action:** Only after "Yes", proceed with implementation.
- **Self-Correction:** Run `QA_Agent` SOPs after implementation to verify.

## 3. Environment Compatibility
- **OpenCode Integration:** Ensure all skills and commands are mapped to `~/.config/opencode/skills/`.
- **Memory Store:** Use `.omnirule/missions/` for persistent mission state.

---
*Operational Authority: rules/KARPATHY.md*
