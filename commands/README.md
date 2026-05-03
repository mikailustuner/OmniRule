# OmniRule Commands

Universal slash commands. Work in any AI agent environment that reads this directory.

| Command | File | Agent | Description |
|---|---|---|---|
| `/orchestrate` | `orchestrate.md` | orchestrator | Route any task through the full agent fleet |
| `/extract` | `extract.md` | style-architect | Screenshot + design token extraction from a live URL |
| `/design` | `design.md` | style-architect | Analyze, apply, or create a design system |
| `/agent` | `agent.md` | direct dispatch | Activate a specific specialist agent |
| `/plan` | `plan.md` | architect | Strategic implementation planning |
| `/tdd` | `tdd.md` | qa-specialist | Red-Green-Refactor TDD workflow |
| `/security` | `security.md` | security-officer | Security audit and threat modeling |
| `/refactor` | `refactor.md` | architect | Structured code refactoring |
| `/research` | `research.md` | researcher | Deep investigation and documentation lookup |
| `/docs` | `documentation.md` | docs-agent | Generate or update documentation |
| `/build-fix` | `build-fix.md` | devops-engineer | Diagnose and fix build failures |

## How it works in each platform

| Platform | How commands are loaded |
|---|---|
| **Claude Code** | `.claude/commands/*.md` (thin wrappers → `{file:commands/X.md}`) |
| **OpenCode** | `opencode.json` `"command"` section → `{file:commands/X.md}` |
| **Codex / Copilot** | Read `AGENTS.md` which references this directory |
| **Antigravity / Minimax** | Read `AGENTS.md` or directly load from `commands/` |
| **Any AGENTS.md runner** | `AGENTS.md` lists all commands with file paths |

## Adding a new command

1. Create `commands/{name}.md` with full documentation + agent execution protocol
2. Add 2-line wrapper in `.claude/commands/{name}.md`: `{file:commands/{name}.md}\n\n$ARGUMENTS`
3. Add entry to `opencode.json` under `"command"`
4. Add row to `AGENTS.md` command table
