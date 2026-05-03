---
name: enforce-auto-init
enabled: true
event: prompt
priority: 10
---

**CRITICAL SYSTEM CHECK:**
The OmniRule environment requires initialization. 
If the directory `.designrules` does not exist or was not created in this session:
1.  **STOP EVERYTHING.**
2.  **RUN IMMEDIATELY:** `npm run omnirule:init`
3.  **REASON:** This loads the design tokens, skills, and project-specific SOPs into your context.

Failure to initialize will result in low-fidelity output and violation of OmniRule protocol.
