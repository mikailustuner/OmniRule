---
name: nextjs-expert
description: "Next.js 16 App Router: When to use Server vs Client, Data fetching patterns, Caching strategy, Server Actions workflow."
---

# Next.js 16 Architecture Patterns

**Version:** Next.js 16.2 | **Focus:** Decision trees, patterns, when-to-use

## 1. Server vs Client Decision

```
Is this component interactive? (onClick, onChange, useState, useEffect)
├── YES → Client Component
│   └── Add 'use client' at TOP of file
│   └── Use only when necessary - minimize client bundle
│   └── Import Server Components directly
│
└── NO → Server Component (default in App Router)
    └── Use for: data fetching, layout, SEO-critical HTML
    └── Can import Client Components
```

**Rule of thumb:** 80-90% should be Server Components. Only add 'use client' when you need:
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect, useRef)

---

## 2. Data Fetching Strategy

```
Need data in Server Component?
├── fetch() → Use for external APIs
│   └── next: { revalidate: 3600 } → cache for 1 hour
│   └── next: { cache: 'no-store' } → always fresh
│   └── next: { tags: ['products'] } → revalidate by tag
│
├── Direct DB query → Use for internal data
│   └── Use cache() for memoization within request
│   └── Prisma/DB queries are NOT cached by default
│
└── Third-party → Use client with SWR/TanStack Query
```

**Caching Rules:**
- Static data (blog posts): cache forever with revalidate
- User-specific data: no-store or short revalidate
- Real-time: no-store, use SWR/TanStack Query

---

## 3. Server Actions Workflow

```
Form submission flow:
1. Client: <form action={serverAction}>
2. Server Action: receives FormData
3. Validate: Zod schema.safeParse(Object.fromEntries(formData))
4. If invalid: return { errors: ... }
5. If valid: mutate DB
6. Revalidate: revalidateTag() or revalidatePath()
7. Return: { success: true } or { message: 'error' }
8. Client: useActionState() handles state + pending
```

**When to use Server Actions:**
- ✓ Form submissions
- ✓ Data mutations (CRUD)
- ✓ Any POST/PUT/DELETE operations
- ✗ External API calls (use Route Handlers)
- ✗ Streaming responses (use Route Handlers)

---

## 4. Cache Components (Next.js 16)

```
When to cache:
├── Static data that rarely changes → "use cache"
│   └── Blog posts, product catalog, static pages
│
├── Semi-static with TTL → { stale: 3600 }
│   └── User profiles, settings
│
└── Never cache → cache: 'no-store'
    └── Real-time data, user-specific content
```

**Cache invalidation:**
- Time-based: revalidate: 3600
- Tag-based: revalidateTag('products')
- Path-based: revalidatePath('/products')
- On-demand: updateTag() (Server Actions only)

---

## 5. Routing Patterns

```
URL Structure:
/dashboard         → dashboard/page.tsx
/dashboard/settings → dashboard/settings/page.tsx
/products/123      → products/[id]/page.tsx

Parallel Routes (multiple slots):
/dashboard → dashboard/layout.tsx gets children + @analytics + @revenue

Intercepting Routes (modal with context):
/feed/photo/123 (modal) ← click from /feed
/photo/123 (full page)  ← direct access
```

---

## 6. PPR (Partial Prerendering) Decision

```
Use PPR when:
├── Page has static shell (header, nav, footer)
├── Page has dynamic sections (user-specific content)
└── Want instant TTFB + progressive streaming

How to enable:
├── Add experimental_ppr = true to page
├── Wrap dynamic parts with Suspense
└── Static parts load immediately, dynamic streams in
```

---

## 7. Error Handling Flow

```
Error types:
├── 404 → notFound() in Server Component
├── 403 → throw Response('Forbidden', { status: 403 })
├── 401 → redirect('/login') or throw Response
└── 500 → error.tsx (React error boundary)

error.tsx pattern:
├── Must be Client Component ('use client')
├── Has access to error.digest for logging
└── Can call reset() to retry
```

---

## 8. Build & Deploy Decisions

```
Dev vs Prod:
├── npm run dev → Turbopack (5-10x faster)
└── npm run build → Webpack (Turbopack experimental)

Runtime selection:
├── edge → auth checks, A/B testing, geo
└── node → DB access, heavy compute, streams
```

---

## Key Patterns

1. **Server-first** - Default to Server Components
2. **Minimal client** - Only 'use client' when needed
3. **Explicit caching** - Use tags, don't rely on defaults
4. **Server Actions** - Replace most API routes
5. **Streaming** - Use Suspense for partial loading