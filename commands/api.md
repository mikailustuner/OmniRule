# Command: API — API Generator & Documenter

Generate OpenAPI specs from route handlers, or scaffold new API endpoints.
Works in: Claude Code, OpenCode, Codex, Antigravity, Minimax.

---

## Invocation

```
/api generate src/app/api/      — generate OpenAPI spec from Next.js routes
/api scaffold /users CRUD       — scaffold a full CRUD endpoint
/api scaffold /payments POST    — scaffold single endpoint
/api validate openapi.json      — validate an existing spec
/api mock openapi.json          — generate mock handlers from spec
```

---

## Generate Mode

Scans route handlers and extracts:
- HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Request body types (from TypeScript types)
- Response types
- Auth requirements (from middleware patterns)
- Query parameters

Output: `openapi.json` + `API_DOCS.md`

## Scaffold Mode

Generates:
- Route handler file with proper TypeScript types
- Zod validation schema
- Error handling middleware
- Unit test file
- OpenAPI entry

---

## Agent Execution Protocol

1. Activate `architect` agent, load `api-backend` + `api-design` skills
2. Parse subcommand from `$ARGUMENTS`
3. **generate**: Glob `src/app/api/**/*.ts`, extract handler signatures
4. **scaffold**: Generate files following existing patterns in the codebase
5. **validate**: Check spec against OpenAPI 3.1 schema
6. Always activate `security-officer` to review auth patterns on new endpoints

---

*OmniRule — agents/ARCHITECT_AGENT.md + agents/SECURITY_AGENT.md*
