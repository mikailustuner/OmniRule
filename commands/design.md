# Command: Design — Design System Analyzer & Applier

Analyze extracted design tokens or build a design system from scratch.
Works in: Claude Code, OpenCode, Codex, Antigravity, Minimax, any AGENTS.md runner.

---

## Invocation

```
/design analyze <path-or-url>
/design apply <domain> to <target-dir>
/design create <description>
/design diff <domain1> <domain2>
```

**Examples:**
```
/design analyze .design/apple.com
/design analyze https://vercel.com
/design apply stripe.com to src/
/design create dark SaaS dashboard theme
/design diff apple.com stripe.com
```

---

## Modes

### `analyze`
Reads `.design/{domain}/tokens/` and produces:
- Color palette visual description
- Typography scale analysis
- Spacing system pattern detection
- Component style recommendations

If a URL is passed instead of a path, runs `/extract` first automatically.

### `apply`
Takes extracted tokens from `.design/{domain}/` and:
1. Writes `tailwind.config.js` at target dir
2. Generates CSS custom properties (`--color-primary`, etc.)
3. Updates or creates design token files

### `create`
Generates a new design system from a text description:
- Picks a color palette (primary, neutral, accent, semantic)
- Defines type scale
- Defines spacing scale
- Outputs to `.design/custom/{name}/`

### `diff`
Compares two extracted design systems:
- Which colors differ
- Font family differences
- Spacing scale comparison

---

## Agent Execution Protocol

When this command is invoked, the executing agent MUST:

1. Activate `style-architect` persona (load `agents/STYLE_AGENT.md`)
2. Load skills: `tailwind-expert`, `css-architecture`, `css-variables`, `responsive-design`
3. Parse the subcommand and arguments from `$ARGUMENTS`
4. Execute the appropriate mode
5. If URL given and no `.design/` folder exists → run extract first
6. Output a structured summary with token counts and key design decisions

---

*OmniRule — agents/STYLE_AGENT.md*
