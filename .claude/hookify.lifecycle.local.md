---
name: require-blueprint-feedback
enabled: true
event: prompt
---

**OmniRule Lifecycle Enforcement:**
You are entering a new task. You MUST:
1.  **Detect Skills**: Identify relevant skills for the project/files.
2.  **Generate Blueprint**: Run the `blueprint` skill/command to create a plan.
3.  **Wait for Approval**: Present the plan and wait for the user to say "Yes" or provide feedback.

DO NOT execute any code (edit files or run bash) until the user approves the Blueprint.
