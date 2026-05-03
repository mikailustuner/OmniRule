# 🧠 OMNIRULE AGENTIC MEMORY LOCK
## CURRENT FILE: README.md
## FOCUS SKILL: nextjs-expert

## 🔥 0. PROJECT-SPECIFIC MEMORY (ABSOLUTE PRIORITY)
This project has learned the following patterns from its own codebase and history.
YOU MUST ADHERE TO THESE BEFORE ANY GLOBAL SKILLS.

*No project-specific patterns learned yet. Running "omnirule learn" is recommended.*

---

## 📋 1. ACTIVE EXPERT SKILLS
The following expert rulesets are active for this file.


--- 🔥 HOT FOCUS: nextjs-expert (90%) ---
Project contains 4 indicator files

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

--- 📚 SKILL: react-expert (60%) ---
Project contains 2 indicator files

# React 19 Architecture Patterns

**Version:** React 19.2 | **Focus:** Decision trees, patterns, performance

## 1. use() Hook Decision

```
When to use use():
├── Promise in component → use(promise) pauses until resolved
├── Needs Suspense boundary → wraps in <Suspense>
├── Parallel data fetching → multiple use() in same component
│   └── React fetches all in parallel, streams in as ready
│
└── NOT for: client-side data, local state
```

**Pattern:**
```tsx
// BAD - blocking render
const data = await fetchData() // blocks entire component

// GOOD - uses Suspense
const data = use(fetchData()) // streams in, shows fallback while loading
```

---

## 2. State Pattern Selection

```
What type of state?
├── UI state (open/close, selected) → useState
│   └── Local component, simple transitions
│
├── Complex local state → useReducer
│   └── Multiple sub-values, complex transitions
│
├── Shared across components → Zustand/Context
│   └── Theme, auth, user preferences
│
└── Server data → React Query / TanStack Query
    └── NOT useState - cache on server
```

---

## 3. useOptimistic Pattern

```
When to use optimistic updates:
├── User action requires server round-trip
├── Want instant visual feedback
├── Can infer result from action
└── Should handle error case (rollback)

Flow:
1. User clicks
2. Update UI immediately (useOptimistic)
3. Send server request
4. On success: actual server data replaces optimistic
5. On error: optimistic reverts to original
```

---

## 4. useActionState Pattern

```
When to use:
├── Any form with server submission
├── Need validation errors displayed
├── Need pending state for loading UI
└── Want progressive enhancement (works without JS)

Flow:
1. Server Action returns { errors?, message? }
2. useActionState captures return value
3. formAction triggers Server Action
4. isPending shows loading state
5. Form re-renders with result
```

---

## 5. Component Composition

```
When to compose vs flatten:
├── Flat works when:
│   └── Few components, simple relationships
│
└── Compose (children/header/footer slots) when:
    └── Multiple page types share structure
    └── Need different content in same wrapper
    └── Parallel routes (@slot pattern)
    └── Intercepting routes (modal wrapper)
```

---

## 6. Performance Decision Tree

```
Is re-render a problem?
├── YES - measure first with React DevTools Profiler
│
├── If slow - fix causes, not symptoms:
│   ├── Too many components → flatten tree
│   ├── Large data → virtualization
│   ├── Expensive computation → useMemo/useCallback
│   └── Wrong dependency arrays → useCallback for functions
│
└── NO - don't optimize
```

**useMemo/useCallback rules:**
- Only use when calculation is expensive (>1ms)
- Dependency array changes = new calculation
- Don't wrap every function - only callbacks passed to children

---

## 7. Suspense Strategy

```
When to use Suspense:
├── Data fetching in components
├── Code splitting (lazy)
├── Image loading
└── Any async resource

Granular vs Route-level:
├── Route-level (loading.tsx) → OK for simple pages
│   └── All content loads together
│
└── Component-level (<Suspense>) → PREFERRED
    └── Different parts load independently
    └── User sees content faster
    └── Avoids "waterfall" loading
```

---

## 8. Server vs Client Decision

```
Should this be Server or Client Component?

Ask in order:
1. Does it need user interaction? → Client
2. Does it use browser APIs? → Client
3. Does it use hooks (useState, etc)? → Client
4. Does it fetch data for display? → Server
5. Does it render layout/structure? → Server
```

**Hybrid pattern:** Server Component fetches, passes data to Client Component that handles interaction.

---

## Key Patterns

1. **use() for async** - Suspense for data, not blocking
2. **Optimistic updates** - Instant feedback, handle errors
3. **Action state** - Forms with validation
4. **Compose when needed** - Flexibility over flatness
5. **Measure first** - Profile before optimizing

--- 📚 SKILL: tailwind-expert (60%) ---
Project contains 2 indicator files

# Tailwind CSS 4 Architecture Patterns

**Version:** Tailwind 4.1 | **Focus:** Design system, strategy, patterns

## 1. Theme Strategy

```
What goes in @theme?
├── Design tokens only (colors, spacing, fonts, radii)
├── NOT component styles (those are in components)
└── NOT complex utilities (use @utility for those)

Theme-first approach:
├── Define tokens in @theme
├── Use semantic names (--color-primary, NOT --color-blue-500)
├── Allow runtime overrides with CSS variables
└── Generate utilities automatically from tokens
```

**When NOT to use @theme:**
- One-off values → use arbitrary values `[100px]`
- Complex transforms → use @utility
- Conditional styles → use CSS classes in component

---

## 2. Responsive Strategy

```
How to handle responsive?
├── Mobile-first (default): classes apply to all, add md: for larger
│   └── div className="base md:large" 
│   └── Small: base applies, md: applies at md+
│
├── Breakpoint system:
│   └── sm: 640px, md: 768px, lg: 1024px, xl: 1280px
│
└── When NOT to use responsive:
    └── Container queries (@container) - adapt to parent, not viewport
```

---

## 3. Container Queries vs Media Queries

```
Media queries (viewport-based):
├── Sidebar hide on mobile
├── Font size changes with screen
└── Use when: layout responds to WINDOW size

Container queries (parent-based):
├── Card content adapts to card width
├── Product grid adapts to container
└── Use when: component behavior depends on ITS CONTAINER

Pattern: @container on parent, @md: on children
```

---

## 4. Component Pattern Decision

```
How to structure components?
├── Variant-based (recommended for simple components)
│   └── Button({ variant = 'primary' | 'secondary' })
│   └── Map variant to CSS classes
│   └── Good for: buttons, inputs, cards
│
├── Composition (recommended for complex)
│   └── Wrapper + Header + Body + Footer
│   └── Each part is optional
│   └── Good for: layouts, complex cards
│
└── Polymorphic (for flexibility)
    └── Render as different elements
    └── Good for: typography, links
```

---

## 5. Dark Mode Strategy

```
Dark mode implementation:
├── System preference (auto): className="dark:bg-black"
└── Manual toggle: className="bg-white dark:bg-black"

When to use each:
├── Auto: user controls via OS, no toggle needed
└── Manual: user explicitly chooses, needs toggle button

Implementation:
├── CSS variables for colors
├── .dark class overrides variables
└── @media (prefers-color-scheme: dark) sets default
```

---

## 6. Color System

```
Color hierarchy:
├── Semantic: --color-primary, --color-success (use in theme)
├── Brand: --color-brand-50 through --color-brand-900 (define in theme)
└── Functional: --color-bg, --color-text (optional abstraction)

When to use specific:
├── Semantic → when meaning is clear (primary, success, error)
├── Brand → when it's your actual brand color
└── Neutral → gray/slate for text, borders, backgrounds
```

---

## 7. Utility Composition

```
When to compose utilities:
├── Multiple values: className="flex items-center justify-between"
├── Conditional: className={cn(base, condition && variant)}
└── Reusable: extract to component

When to create custom utility:
├── Pattern used 3+ times
├── Complex selector logic
└── Not achievable with existing utilities
```

---

## 8. Migration Strategy (v3 → v4)

```
Migration priority:
├── 1. Install @tailwindcss/vite
├── 2. Replace @tailwind with @import "tailwindcss"
├── 3. Move config.js to @theme in CSS
├── 4. Remove content array (auto-detect)
├── 5. Update ring-offset to outline-offset
├── 6. Test functionality
└── 7. Review generated CSS size
```

**When to upgrade:**
- ✓ New projects → use v4
- ✓ Simple projects → upgrade
- ✗ Complex custom config → may need refactoring

---

## Key Patterns

1. **Theme tokens** - Only design tokens, not component styles
2. **Mobile-first** - Base styles, add md/lg for larger
3. **Container queries** - Components adapt to parent
4. **Variant pattern** - Simple components, compose for complex
5. **CSS variables** - Enable runtime theming

--- 📚 SKILL: prisma-expert (60%) ---
Project contains 2 indicator files

# Prisma Architecture Patterns

**Version:** Prisma 7 | **Focus:** Schema, queries, transactions

## 1. Schema Design Strategy

```
When to use relations:
├── One-to-One: use @unique on child, NOT separate table
├── One-to-Many: parent has children array
├── Many-to-Many: implicit (array on both) OR explicit (join table)
└── Self-referential: use Optional for nullable

Indexes strategy:
├── Foreign keys: auto-indexed, add custom only if filtering
├── Composite: when querying multiple fields together
├── Partial: when filtering with same condition (WHERE active)
└── Unique: when field must be unique

Enums vs Strings:
├── Use enum: fixed values, won't change (Role.ADMIN vs "admin")
└── Use string: flexible, might expand (status field)
```

---

## 2. Query Decision Tree

```
How to fetch related data?
├── Need ENTIRE related object → include
│   └── User with ALL posts: include: { posts: true }
│
├── Need SPECIFIC fields → select
│   └── User with post titles only: select: { posts: { select: { title: true } } }
│
├── Need nested depth → nested select/include
│   └── User → posts → comments: select: { posts: { include: { comments: true } } }
│
└── Count only → count or _count
    └── User with post count: include: { _count: { select: { posts: true } } }
```

---

## 3. Performance Strategy

```
Query optimization order:
├── 1. Select only needed fields (select, not include)
├── 2. Add pagination (take/skip, cursor)
├── 3. Add indexes on WHERE/ORDER BY columns
├── 4. Use compound indexes for multi-column
├── 5. Check query plan with EXPLAIN
└── 6. Use $queryRaw only if ORM can't express

When to worry about performance:
├── Query returns >1000 rows → paginate
├── N+1 problem → use include or batch
├── Slow joins → denormalize or cache
└── Large JSON fields → separate table or index
```

---

## 4. Transaction Decision

```
When to use transactions:
├── Multiple writes that must succeed together
│   └── Order + OrderItems + Inventory update
│
├── Read-then-write (conditional)
│   └── Check balance, then deduct
│
├── Idempotency important
│   └── Same operation multiple times = same result

When NOT to use:
├── Single write → just write
├── Independent writes → parallel or sequential
└── Read-only operations → just read
```

---

## 5. Connection Strategy

```
When to use connection pooling:
├── Serverless functions (Vercel, Lambda)
├── High concurrency (100+ connections)
└── Long-running processes with many instances

How to choose:
├── Prisma Accelerate → managed, includes caching
├── PgBouncer → self-hosted, just pooling
├── Prisma Postgres → managed DB with native pooling
└── Direct connection → single instance, low traffic
```

---

## 6. Migration Strategy

```
When to migrate:
├── Development: migrate dev (creates migration)
├── Staging/Prod: migrate deploy (applies)
└── Never: migrate reset in production

Schema change workflow:
├── 1. Change schema.prisma
├── 2. Run migrate dev (creates .sql)
├── 3. Review migration SQL
├── 4. Push to repo
├── 5. CI runs migrate deploy
└── 6. Monitor for errors
```

---

## 7. Soft Delete Pattern

```
When to implement soft delete:
├── Need audit trail
├── Can't permanently delete (compliance)
├── Need "trash" functionality
└── Related data should also be hidden

Implementation approaches:
├── Middleware: transform delete to update
├── Query filter: automatically filter deletedAt: null
└── Composite unique: allow multiple with different deletedAt
```

---

## Key Patterns

1. **select over include** - Only fetch what's needed
2. **Transactions for atomicity** - Multiple writes together
3. **Connection pooling for serverless** - Prevent exhaustion
4. **Indexes on WHERE/ORDER BY** - Not just foreign keys
5. **Soft delete middleware** - Single place, not every query

--- 📚 SKILL: typescript-expert (60%) ---
Project contains 2 indicator files

# TypeScript Architecture Patterns

**Version:** TS 5.6 | **Focus:** Type safety, inference, patterns

## 1. Type Inference Strategy

```
How much to annotate?
├── Let inference do its job:
│   └── const x = 1; → x is 1 (literal), not number
│   └── function add(a, b) → return type inferred
│
├── Explicit annotations needed when:
│   ├── Function parameters (clarify intent)
│   ├── API boundaries (incoming data)
│   ├── Complex generic returns
│   └── When inference is wrong
│
└── Avoid:
    ├── Over-annotating local variables
    ├── Type on every line
    └── Using 'any' as easy way out
```

---

## 2. Generic Pattern Selection

```
When to use generics:
├── Function works with multiple types
│   └── <T>(value: T): T → identity function
│
├── Type depends on another type
│   └── type Response<T> = { data: T, error?: Error }
│
├── Constraints needed:
│   └── <T extends HasId>(item: T): T['id']
│
└── When NOT to use:
    └── Single specific type - just use the type
```

**Type parameter position:**
- Function signature: `function fn<T>(...)`
- Arrow: `const fn = <T>(...) => ...`
- Class: `class Store<T> { ... }`

---

## 3. Utility Type Decision

```
What utility to use?
├── Pick specific fields: Pick<User, 'id' | 'name'>
├── Remove specific fields: Omit<User, 'password'>
├── Make optional: Partial<User>
├── Make required: Required<Config>
├── Make readonly: Readonly<User>
├── Extract type from value: typeof user
├── Validate at runtime: z.infer<typeof Schema>
└── Function parameters: Parameters<typeof fn>
```

---

## 4. Type Safety Levels

```
Strictness hierarchy (least to most strict):
├── any - no type checking (AVOID!)
├── unknown - something, must check before use
├── object - any non-primitive
├── string/number/etc - primitives
└── Specific literal - "exact" | "value"

Pattern: Prefer strict, relax only when needed
```

---

## 5. Discriminated Union Pattern

```
When to use discriminated unions:
├── API responses with different shapes
├── State machines (loading/success/error)
├── Form validation errors
└── Any "one of many" type

Pattern:
1. Common field (status, type, kind) as discriminant
2. Type is union of objects with that field
3. TypeScript can narrow in switch/if

Example:
type Result<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
  | { status: 'loading' }
```

---

## 6. Error Handling Pattern

```
Type-safe error handling:
├── Specific error types
│   └── type AppError = { code: string; message: string }
│
├── Result type pattern
│   └── type Result<T> = { ok: true; value: T } | { ok: false; error: E }
│
└── Never use:
    └── throw in async code (harder to type)
    || Return Result instead
```

---

## 7. Zod Integration

```
When to use Zod:
├── Runtime validation needed (API input, forms)
├── Want to derive TypeScript types from schema
└── Need complex validation logic

Pattern:
├── Define schema with Zod
├── Extract type: type User = z.infer<typeof UserSchema>
├── Validate at runtime: schema.parse(data) or safeParse
├── Use inferred type in code
└── Single source of truth for validation AND types
```

---

## 8. Module Type Strategy

```
How to type modules:
├── Export interfaces/types (preferred)
│   └── export type { User, Config }
│   └── export interface { ... }
│
├── Be explicit about exports
│   └── Use package.json exports field
│   └── Define types for both import and require
│
└── Avoid:
    || Exporting 'any' types
    || Confusing default and named exports
```

---

## Key Patterns

1. **Infer first** - Let TypeScript work, add annotations sparingly
2. **Generics** - Use when type depends on usage
3. **Discriminated unions** - Type-safe conditionals
4. **Zod for input** - Runtime validation + type inference
5. **Strict by default** - any is a code smell

--- 📚 SKILL: nodejs-expert (60%) ---
Project contains 2 indicator files

# Node.js Expert Patterns

**Version:** Node.js 22 LTS (2025) | **Focus:** Performance, ESM, APIs

## When to Activate
- Server-side development
- API creation
- Performance optimization
- Package development

---

## 1. ESM (ECMAScript Modules)

```json
// package.json
{
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./client": "./dist/client.js"
  }
}
```

```typescript
// src/index.ts
import { readFile } from 'node:fs/promises'
import path from 'node:path'

// Dynamic import for CJS
const cjsModule = await import('cjs-package')

// URL imports
const data = await fetch('https://api.example.com/data')
```

---

## 2. Native Fetch & Web APIs

```typescript
// Built-in fetch (Node 18+)
const response = await fetch('https://api.example.com', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: 'test' }),
})

const json = await response.json()

// Web Streams (Node 16+)
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue('Hello')
    controller.close()
  },
})

const text = await new Response(stream).text()
```

---

## 3. Error Handling

```typescript
// Class-based errors
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Async error wrapper
async function tryCatch<T>(
  fn: () => Promise<T>
): Promise<[T, null] | [null, Error]> {
  try {
    return [await fn(), null]
  } catch (e) {
    return [null, e as Error]
  }
}

// Usage
const [data, error] = await tryCatch(fetchData())
if (error) handleError(error)
```

---

## 4. Performance

```typescript
// Worker threads
import { Worker } from 'node:worker'

const worker = new Worker('./heavy-task.js', {
  workerData: { value: 100 },
})

worker.on('message', (result) => console.log(result))

// Streaming (memory efficient)
import { createReadStream } from 'node:fs'

const stream = createReadStream('large-file.txt')
for await (const chunk of stream) {
  processChunk(chunk)
}

// Connection pooling
import pg from 'pg'
const pool = new pg.Pool({ max: 20 })
```

---

## 5. File Operations

```typescript
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

// Read JSON
const config = JSON.parse(
  await readFile('./config.json', 'utf-8')
)

// Atomic write
await writeFile('./data.json', JSON.stringify(data), {
  flag: 'w',
})

// Ensure directory exists
await mkdir('./logs', { recursive: true })

// Check existence
if (!existsSync('./data')) {
  // handle
}
```

---

## 6. Process & Env

```typescript
// Environment variables
const port = parseInt(process.env.PORT || '3000')
const isDev = process.env.NODE_ENV !== 'production'

// Signals
process.on('SIGTERM', async () => {
  await gracefulShutdown()
  process.exit(0)
})

// Memory info
console.log(process.memoryUsage()) // heapUsed, heapTotal, external, rss
```

---

## 7. Package Exports

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs"
    }
  }
}
```

---

## Key Takeaways

1. **ESM default** - Use "type": "module"
2. **Native fetch** - No axios needed
3. **Worker threads** - CPU-intensive tasks
4. **Streaming** - Large files, memory
5. **Error classes** - Structured error handling
6. **Process signals** - Graceful shutdown



## 🛠️ 2. ACTIONABLE PROJECT ASSETS
Check these directories for project-specific operations:

- **Commands**: `.memory/commands/*.md` (Step-by-step SOPs for this project)
- **Tools**: `.memory/tools/*.ts` (Executable utilities for this project)
- **Agents**: `.memory/agents/*.md` (Specialized personas for specific tasks)

---

## 🎯 CONTEXT RULES

1. **PROJECT MEMORY FIRST** - Always follow .memory/ patterns over general rules.
2. **Follow HOT FOCUS patterns** - The primary skill matched this file.
3. **Check dependencies** - Ensure imported modules follow their respective patterns.
4. **Verify design consistency** - UI code should match design rules in .designrules/.

---


## 📁 MEMORY LOCATIONS

- **Project Memory**: `.memory/` (Commands, Tools, Patterns)
- **Global OmniRule Library**: `packages/commands/`, `packages/tools/`
- **User Config Fallback**: `~/.config/opencode/`
- **Vault Assets**: `/home/f0x017/Desktop/OmniRule/.designrules/omnirule/`

Generated: 2026-05-03T00:01:46.644Z
