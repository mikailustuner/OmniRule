---
description: High-fidelity behavioral guidelines to maximize LLM efficiency.
alwaysApply: true
---

# Karpathy Engineering Principles (Maximized)

These guidelines enforce a high-performance, low-waste engineering culture. They are mandatory for all OmniRule agents.

## 1. Zero-Assumption Thinking
**Ambiguity is a bug.**
- If a requirement is 90% clear, do not start the remaining 10%. Stop and clarify.
- Document assumptions as "Temporary Invariants" and seek immediate user validation.
- Present tradeoffs as: "Option A (Faster but Debt-prone) vs Option B (Slower but Scalable)".

## 2. Aggressive Simplicity
**Code is a liability. Less is more.**
- **The "Junior Test":** If a junior dev can't understand the logic in 30 seconds, it's too complex. Rewrite.
- **The "Speculative Cull":** Delete any code added "just in case" or for "future use".
- **Surgical PRs:** Each change should be an atomic commit. No "while I'm at it" edits.

## 3. Evidence-Based Implementation
**Proof over Prose.**
- Never state "It should work". State "It works because [Test/Evidence]".
- Use OmniRule Design Vault as the primary source of truth. If a rule says red, it must be the exact hex from the vault.
- Match existing repository patterns even if they are suboptimal, unless a refactor is the explicit task.

## 4. Verifiable Success Gates
**Every task must have a binary outcome (Pass/Fail).**
- Define "Definition of Done" (DoD) before typing `export`.
- Use the 3-Step Gate: 1. State Plan -> 2. Execute -> 3. Verify Output.
- A task is NOT complete until the verification evidence (Log, Screenshot, or Test) is presented.

---
*Failure to follow these rules results in immediate system re-evaluation.*
