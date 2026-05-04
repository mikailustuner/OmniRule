# Command: Mode — Switch Agent Behavior Mode

Switch the active behavior mode of the OmniRule fleet.
Works in: Claude Code, OpenCode, Codex, Antigravity, Minimax.

---

## Invocation

```
/mode dev       — fast implementation, auto skill-loading, batched quality gate
/mode research  — read-only investigation, deep analysis, no writes
/mode review    — critical code review, full security + quality audit
/mode status    — show current mode and active rules
```

---

## Mode Comparison

| Aspect | dev | research | review |
|---|---|---|---|
| Write tools | ✅ Full access | ❌ Blocked | ⚠️ Reports only |
| Quality gate | End of session | Disabled | Full, blocking |
| Primary agent | orchestrator | researcher | security-officer |
| Planning gate | Skip (<3 steps) | Always | Always |
| Skill loading | Aggressive (3) | Passive (1) | Audit-focused |
| Speed | Fast | Thorough | Methodical |

---

## Agent Execution Protocol

When `/mode {name}` is invoked:
1. Load `modes/{name}.md`
2. Apply the behavior profile to all subsequent actions
3. Announce: `[OmniRule] Mode switched to: {name}`
4. Adjust auto-invoke rules per the mode definition
5. For `/mode status`: report current mode + last 3 auto-invoked tools

---

*OmniRule — modes/ directory*
