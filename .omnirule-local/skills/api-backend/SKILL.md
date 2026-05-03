---
name: api-backend
description: "Backend: Middleware flow, Error handling strategy, Auth middleware pattern, Validation pattern."
---

# Backend API Architecture Patterns

**Focus:** Middleware, errors, validation, auth flow

## 1. Middleware Flow

```
Request lifecycle:
1. Request arrives
2. CORS (allow origins)
3. Rate limit (check limits)
4. Parse body (JSON)
5. Auth (verify token)
6. Validate (Zod schema)
7. Route handler (business logic)
8. Error handler (catch errors)
9. Response (JSON)

What goes in middleware:
├── Cross-cutting concerns: CORS, logging, rate limit
├── Transformation: parse body, attach user
└── Validation: check auth, validate input

What goes in handlers:
└── Business logic only
```

---

## 2. Error Handling Pattern

```
How to structure errors:
├── Custom error class with status code
├── Error handler catches all, returns consistent format
├── Never leak internal errors to client
└── Log errors with stack trace for debugging

Response format:
├── Success: { data: ... }
├── Error: { error: { code, message } }
└── Validation: { error: { code, details: [...] } }

Never expose:
├── Stack traces
├── Internal file paths
├── Database errors
└── System information
```

---

## 3. Validation Pattern

```
Validation layers:
├── Route: middleware validates schema
├── Service: business rule validation
└── Database: constraints (unique, foreign key)

What to validate:
├── Type: correct data type
├── Required: all required fields present
├── Format: email, UUID, etc.
├── Range: min/max for numbers, length for strings
└── Business: custom rules (not overlapping dates, etc)
```

---

## 4. Auth Middleware Pattern

```
Auth flow:
1. Extract token from header (Bearer <token>)
2. Verify token (JWT.verify)
3. Attach user to request
4. Continue to handler

When to check auth:
├── All protected routes: middleware
├── Specific endpoints: check in handler
└── Role-based: middleware or handler

What to store in token:
├── User ID (for lookups)
├── Role/permissions (for fast checks)
└── Expiry (for token invalidation)
```

---

## 5. Response Format Strategy

```
When to use what status:
├── 200: successful GET, PUT, PATCH
├── 201: successful POST (created)
├── 204: successful DELETE
├── 400: validation error
├── 401: not authenticated
├── 403: authenticated but not authorized
├── 404: resource not found
├── 409: conflict (duplicate, etc)
└── 500: internal error

Pagination response:
├── data: results array
├── meta: { page, perPage, total }
└── links: { self, next, prev }
```

---

## 6. Rate Limiting Pattern

```
What to rate limit:
├── Per IP: general endpoints
├── Per user: authenticated endpoints
└── Per endpoint: expensive operations

How to limit:
├── Time window: X requests per Y minutes
├── Sliding window: continuous, more accurate
└── Token bucket: allows bursting

Response on limit:
├── 429 status
├── Retry-After header
└── Clear error message
```

---

## Key Patterns

1. **Middleware for cross-cutting** - Don't repeat in handlers
2. **Validate at boundary** - Early failure, clear errors
3. **Consistent response format** - Easier to consume
4. **Auth middleware** - Single place to check
5. **Never leak internals** - Error messages to user vs logs