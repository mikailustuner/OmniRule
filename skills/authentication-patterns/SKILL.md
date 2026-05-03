---
name: authentication-patterns
description: "Auth flows: JWT, OAuth, sessions, tokens, password handling, 2FA, SSO"
---

# Authentication Patterns

**Focus:** Auth strategy selection, implementation patterns, security

## 1. Auth Strategy Decision Tree

```
Choose session when:
├── Server-rendered app (SSR)
├── Simple deployment (stateless)
└── Session store available (Redis)

Choose JWT when:
├── APIs, SPAs, mobile apps
├── Need stateless scaling
└── Cross-domain requirements

Choose OAuth/SSO when:
├── Social login needed
├── Enterprise SSO required
└── Identity delegation
```

---

## 2. JWT Implementation

```
Token structure:
├── Header: alg, typ
├── Payload: iss, sub, aud, exp, iat, claims
└── Signature: HMAC or RSA

Token types:
├── Access token: short-lived (15min-1hr)
├── Refresh token: long-lived (days-weeks)
└── ID token: identity claims only

Storage decisions:
├── Access: memory (JS only)
├── Refresh: httpOnly cookie
└── NEVER: localStorage (XSS vulnerable)
```

---

## 3. Password Handling

```
Never store plain text. Use:
├── Argon2id: best (memory-hard)
├── bcrypt: good, widely supported
└── scrypt: alternative

Validation requirements:
├── Minimum length (8+)
├── Complexity: mixed case, numbers, symbols
└── Check against known breaches (HaveIBeenPwned)

Auth flow:
1. Client sends plaintext
2. Server hashes + compare
3. Issue tokens on success
4. Log failed attempts
```

---

## 4. OAuth 2.0 Flows

```
Authorization Code (web):
├── Redirect to auth server
├── Receive code via redirect
├── Exchange code for tokens
└── PKCE for public clients

Implicit (deprecated):
├── DO NOT USE
└── Tokens in URL, security risk

Client Credentials (M2M):
├── No user context
├── Service-to-service
└── Server-to-server

Device Code (IoT):
├── User authorizes on separate device
└── Poll for completion
```

---

## 5. Multi-Factor Authentication

```
TOTP (time-based):
├── Google Authenticator, Authy
├── 30-second rotating codes
└── 6-digit, easy UX

SMS (less secure):
├── Vulnerable to SIM swap
├── Phone number required
└── Use as fallback only

WebAuthn (passwordless):
├── Biometric or hardware key
├── Most secure
└── Cross-device support varies

When to require 2FA:
├── High-value actions (payments, settings)
├── Sensitive accounts
└── After suspicious activity
```

---

## 6. Session Management

```
Session store:
├── Redis: fast, scalable
├── Database: simple, slower
└── In-memory: single server only

Session data:
├── User ID, creation time
├── Last activity
└── Device/browser info

Security:
├── Secure, httpOnly cookie
├── SameSite=strict/lax
├── Rotate on login
└── Expire inactive sessions
```

---

## Key Patterns

1. **Never store passwords** - Hash + salt
2. **Short access tokens** - Long-lived refresh
3. **Secure cookies** - httpOnly, SameSite
4. **OAuth with PKCE** - Required for SPA
5. **2FA for sensitive** - Not everywhere
6. **Log auth failures** - Detect attacks