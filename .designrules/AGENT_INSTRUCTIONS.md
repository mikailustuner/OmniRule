# OmniRule Active Skill Context

> **File:** `middleware.ts`  **Agent:** security-officer  **Updated:** 2026-05-04T10:46:37.447Z
> **Skills loaded:** typescript-expert, authentication-patterns, security-review

---

## typescript-expert

## Quick Reference

| Feature | Syntax | When to use |
|---|---|---|
| Discriminated union | type A = { kind: 'a' } | Type-safe conditionals |
| Type guard | is narrowed type | Custom narrowing |
| Conditional type | T extends U ? A : B | Generic branching |
| Template literal | \`${Status}Event\` | String unions |
| Mapped type | { [K in keyof T]: ... } | Transform types |
| Infer | infer R in conditional | Extract inner type |
| Satisfies | value satisfies Type | Validate without widen |

## Anti-Patterns

```
❌ Using `any` — opts out of type checking entirely
✅ `unknown` for truly unknown types; narrow with type guards

❌ Type assertions (as Type) hiding real type errors
✅ Fix the underlying type; use `satisfies` operator for validation

❌ Overusing generics making code unreadable
✅ Generics only when the type truly varies by caller

❌ Not enabling strict mode
✅ "strict": true in tsconfig.json — catches null/undefined errors

❌ Duplicating type definitions across layers
✅ Generate types from schema (Prisma → types, OpenAPI → types)
```

---

---

## authentication-patterns

## Quick Reference

| Flow | Library | Note |
|---|---|---|
| OAuth 2.0 | Auth.js / NextAuth | Social login |
| Email/password | Lucia / better-auth | Full control |
| Passkeys | SimpleWebAuthn | FIDO2 |
| JWT | jose | RS256, not HS256 |
| MFA | speakeasy (TOTP) | Backup codes required |
| Session | iron-session | Encrypted cookie |

## Anti-Patterns

```
❌ Rolling your own auth from scratch
✅ Use battle-tested library (NextAuth, Auth.js, Clerk, Supabase Auth)

❌ Storing JWT in localStorage (XSS vulnerable)
✅ HttpOnly, Secure, SameSite=Strict cookies

❌ No refresh token rotation
✅ Rotate refresh token on every use; invalidate old on rotation

❌ Weak password policy (4 chars allowed)
✅ Min 12 chars, check against breached password DB (HaveIBeenPwned)

❌ Not expiring sessions on logout
✅ Invalidate session server-side on logout (blocklist or token version)
```

---

---

## security-review

## Quick Reference

| Threat | Mitigation | Priority |
|---|---|---|
| SQLi | Parameterized queries | Critical |
| XSS | CSP + sanitize output | Critical |
| Auth bypass | Verify JWT server-side | Critical |
| CSRF | SameSite=Strict cookie | High |
| Path traversal | Validate + normalize paths | High |
| Rate limiting | Redis sliding window | High |
| Secrets exposure | Vault / env injection | Critical |

## Anti-Patterns

```
❌ Trust user input inside SQL/shell strings
✅ Parameterized queries always; never string-concatenate SQL

❌ Sensitive data in URL query parameters
✅ POST body for sensitive data; never tokens/passwords in URLs

❌ JWT with alg: none or HS256 with weak secret
✅ RS256/ES256 for JWTs; rotate keys; verify signature server-side

❌ Storing plaintext passwords
✅ bcrypt (cost 12+) or Argon2id — never reversible encryption

❌ CORS * in production
✅ Explicit allowlist of origins; never wildcard with credentials
```

---
