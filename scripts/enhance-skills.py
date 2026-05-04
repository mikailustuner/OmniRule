#!/usr/bin/env python3
"""Add Anti-Patterns and Quick Reference sections to thin skills."""

import os
import re

SKILLS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'skills')

# Map: skill folder → (anti_patterns, quick_reference)
ENHANCEMENTS = {
    'clean-architecture': (
        """## Anti-Patterns

```
❌ Business logic in controllers/routes
✅ Logic lives in use cases and domain services

❌ Domain entities importing framework classes
✅ Domain layer has zero framework dependencies

❌ Repository implementations in domain layer
✅ Domain defines interfaces; infra implements them

❌ Anemic domain model (entities = just data bags)
✅ Rich domain model — entities enforce their own invariants

❌ Direct DB calls from UI/presentation layer
✅ Always go through use case → repository interface
```""",
        """## Quick Reference

| Concept | Where it lives | Rule |
|---|---|---|
| Business rules | Domain entities / services | No framework imports |
| Orchestration | Use cases (application layer) | Calls domain + repos |
| DB / HTTP | Infrastructure layer | Implements domain interfaces |
| DI wiring | Composition root | Once, at startup |
| Input validation | Application layer | Before reaching domain |
| Error types | Domain layer | No HTTP status codes inside |"""
    ),

    'animations-patterns': (
        """## Anti-Patterns

```
❌ Animating layout properties (width, height, top, left)
✅ Animate transform and opacity only — GPU-composited

❌ JavaScript setInterval for animations
✅ requestAnimationFrame or CSS transitions

❌ Blocking main thread with heavy JS during animation
✅ Use CSS animations or offload to Web Animations API

❌ Auto-playing motion with no prefers-reduced-motion check
✅ Always wrap motion in @media (prefers-reduced-motion: no-preference)

❌ Animating every interaction (overload)
✅ Reserve animation for meaningful state changes
```""",
        """## Quick Reference

| Scenario | Solution | Performance |
|---|---|---|
| Simple hover | CSS transition | Excellent |
| Complex sequence | Web Animations API / Framer Motion | Good |
| Enter/exit | CSS keyframes + class toggle | Excellent |
| Scroll-linked | Intersection Observer | Good |
| Canvas/game | requestAnimationFrame | Excellent |
| Reduced motion | prefers-reduced-motion media query | — |"""
    ),

    'css-architecture': (
        """## Anti-Patterns

```
❌ Deep selector chains (.nav ul li a span)
✅ Flat, single-class selectors with BEM/utility approach

❌ Inline styles scattered throughout HTML
✅ Style only via classes — one source of truth

❌ !important everywhere to override specificity wars
✅ Fix specificity at the root — flatten the cascade

❌ One monolithic CSS file for the whole app
✅ Co-located styles per component/feature

❌ Global .button styles affecting every button
✅ Namespace component styles to their scope
```""",
        """## Quick Reference

| Task | Approach | Why |
|---|---|---|
| Component styles | CSS Modules / scoped | No bleed |
| Global tokens | CSS custom properties | Runtime themeable |
| Utility classes | Tailwind / UnoCSS | Zero dead CSS |
| Dark mode | `[data-theme]` attribute | No flash |
| Responsive | Mobile-first breakpoints | Progressive enhancement |
| Specificity | Flat selectors (0,1,0) | Predictable override |"""
    ),

    'video-audio-patterns': (
        """## Anti-Patterns

```
❌ Autoplay video with sound by default
✅ Autoplay muted only; require user gesture for audio

❌ No preload strategy — loading everything upfront
✅ preload="metadata" for above-fold, preload="none" for offscreen

❌ Single video format (only .mp4)
✅ Serve WebM + MP4 with <source> fallbacks

❌ Blocking main thread with video decode work
✅ Use dedicated codec, offload to GPU

❌ No poster image — blank area before playback
✅ Always set poster attribute for perceived performance
```""",
        """## Quick Reference

| Scenario | Attribute / API | Note |
|---|---|---|
| Background video | autoplay muted loop | No sound |
| Lazy load video | IntersectionObserver + src swap | Save bandwidth |
| Custom controls | HTMLMediaElement API | play(), pause(), currentTime |
| Adaptive bitrate | HLS.js / dash.js | For long videos |
| Captions | <track kind="captions"> | Accessibility requirement |
| Format priority | WebM → MP4 → fallback | Bandwidth savings |"""
    ),

    'hexagonal-architecture': (
        """## Anti-Patterns

```
❌ Port (interface) defined in infrastructure layer
✅ Ports belong to the application/domain core

❌ Adapter directly instantiated inside business logic
✅ Inject adapters via constructor/DI container

❌ HTTP concerns (status codes, headers) leaking into use cases
✅ HTTP is an adapter detail — use cases return plain results

❌ Testing with real DB instead of fake adapter
✅ Swap adapters with in-memory fakes in tests

❌ One giant port that does everything
✅ Small, focused ports per capability
```""",
        """## Quick Reference

| Concept | Hexagonal term | Lives where |
|---|---|---|
| Business logic | Application core | Center |
| Interface definition | Port | Core (defines shape) |
| Framework integration | Adapter | Outside |
| DB implementation | Driven adapter | Outside |
| HTTP handler | Driving adapter | Outside |
| DI wiring | Composition root | App startup |"""
    ),

    'html-semantic': (
        """## Anti-Patterns

```
❌ <div> for everything — div soup
✅ Use landmark elements: <header>, <main>, <nav>, <aside>, <footer>

❌ <b> and <i> for visual style
✅ <strong> (importance) and <em> (stress emphasis)

❌ Tables for layout
✅ Tables only for tabular data; CSS Grid for layout

❌ Skipping heading levels (h1 → h4)
✅ Sequential heading hierarchy — never skip levels

❌ Images with no alt text
✅ Always alt="description"; alt="" only for decorative images
```""",
        """## Quick Reference

| Element | Use for | Not for |
|---|---|---|
| `<article>` | Self-contained content | Generic containers |
| `<section>` | Thematic grouping with heading | Styling hooks |
| `<aside>` | Supplementary content | Sidebars by default |
| `<nav>` | Navigation links | Any list of links |
| `<figure>` | Image + caption pair | All images |
| `<time>` | Dates/times | Generic text |
| `<mark>` | Highlighted/searched text | Styling emphasis |"""
    ),

    'responsive-design': (
        """## Anti-Patterns

```
❌ Desktop-first breakpoints (everything starts wide)
✅ Mobile-first — min-width breakpoints only

❌ Fixed pixel widths on containers
✅ max-width with 100% fluid containers

❌ Touch targets smaller than 44×44px
✅ Minimum 44×44px clickable areas for mobile

❌ Viewport-locked font sizes (px only)
✅ Fluid typography with clamp() or rem units

❌ Testing only at 375px and 1440px
✅ Test the fluid range — resize slowly between breakpoints
```""",
        """## Quick Reference

| Concern | Solution | Example |
|---|---|---|
| Container width | max-width + padding | max-width: 1280px |
| Fluid columns | CSS Grid auto-fill | repeat(auto-fill, minmax(280px, 1fr)) |
| Fluid type | clamp() | clamp(1rem, 2.5vw, 1.5rem) |
| Breakpoints | 640 / 768 / 1024 / 1280 | Tailwind defaults |
| Images | max-width: 100% | Prevent overflow |
| Touch targets | min 44px | WCAG 2.5.5 |"""
    ),

    'technical-debt': (
        """## Anti-Patterns

```
❌ "We'll fix it later" with no ticket created
✅ Log all debt immediately with TODO + ticket reference

❌ Paying all debt in one big refactor sprint
✅ Boy Scout Rule — leave code cleaner than you found it

❌ Ignoring debt until it causes an outage
✅ Track debt metric (complexity, coverage) in CI

❌ Rewriting everything instead of targeted refactors
✅ Strangler Fig: replace incrementally, keep working at all times

❌ Debt that no one owns
✅ Each debt item has an assigned owner and deadline
```""",
        """## Quick Reference

| Debt type | Detection | Remedy |
|---|---|---|
| Design debt | Arch review, complexity score | Targeted refactor |
| Code debt | High cyclomatic complexity | Extract + simplify |
| Test debt | Low coverage, flaky tests | Add tests before feature |
| Dependency debt | Outdated/vulnerable packages | Dependency sentinel |
| Documentation debt | No README, stale docs | docs-agent |
| Performance debt | CWV regressions | Perf audit + fix |"""
    ),

    'graphql-patterns': (
        """## Anti-Patterns

```
❌ N+1 queries — resolver fetches per-item inside list
✅ Use DataLoader to batch & deduplicate DB calls

❌ Returning full objects when client needs 2 fields
✅ Let GraphQL projection do the work; never over-fetch in resolvers

❌ Deeply nested mutations that do too much
✅ Single-responsibility mutations, max 2 levels deep

❌ No query depth/complexity limits
✅ Set max depth (10) and max complexity (1000) per query

❌ Exposing internal DB IDs as GraphQL IDs directly
✅ Opaque cursor-based IDs for relay-compatible pagination
```""",
        """## Quick Reference

| Scenario | Solution | Library |
|---|---|---|
| Batch DB calls | DataLoader | dataloader |
| Input validation | Input types + Zod/yup | graphql-shield |
| Auth per field | Field-level directives | graphql-shield |
| Real-time | Subscriptions over WS | graphql-ws |
| File upload | multipart request | graphql-upload |
| Schema-first | SDL + codegen | @graphql-codegen |
| Code-first | Resolver decorators | TypeGraphQL / Pothos |"""
    ),

    'monitoring-patterns': (
        """## Anti-Patterns

```
❌ Alert on every error — alert fatigue kills response
✅ Alert only on symptoms that affect users (SLO breach)

❌ Logs with no structure (free-text printf)
✅ Structured JSON logs with trace_id, user_id, severity

❌ Single dashboard with 50 panels nobody reads
✅ Service-level dashboards: one golden signals view per service

❌ No runbook linked to alert
✅ Every alert links to a runbook with diagnosis steps

❌ Monitoring added after incidents
✅ Define SLOs and add observability in the same PR as the feature
```""",
        """## Quick Reference

| Signal | Tool | Alert threshold |
|---|---|---|
| Latency | Histogram p95/p99 | > SLO threshold |
| Error rate | Counter / rate() | > 1% (5xx) |
| Saturation | CPU/memory gauge | > 80% sustained |
| Availability | Synthetic probe | < 99.9% (30d) |
| Business KPI | Custom counter | Domain-defined |
| Traces | Span duration | Outlier detection |"""
    ),

    'pwa-patterns': (
        """## Anti-Patterns

```
❌ Caching everything with no versioning strategy
✅ Version cache names; clean up old caches on activate

❌ Service worker that never updates
✅ skipWaiting() + clients.claim() for instant updates

❌ Offline page that just says "You're offline"
✅ Cache critical routes; serve stale while revalidating

❌ Installing service worker on localhost only
✅ Test on HTTPS staging; SW requires secure context in prod

❌ No install prompt UI — users don't know app is installable
✅ Capture beforeinstallprompt, show custom install button
```""",
        """## Quick Reference

| Capability | API | Required for |
|---|---|---|
| Offline | Cache API + Service Worker | Core PWA |
| Install prompt | beforeinstallprompt | App store feel |
| Push notifications | Push API + Notification API | Re-engagement |
| Background sync | Background Sync API | Offline mutations |
| Periodic sync | Periodic Background Sync | Content refresh |
| Web manifest | manifest.json | Installability |
| App shell | Precache + runtime cache | Fast load |"""
    ),

    'ci-cd-patterns': (
        """## Anti-Patterns

```
❌ Deploying directly from developer laptops
✅ All deployments via CI/CD pipeline — never manual

❌ CI runs only on main branch
✅ Run CI on every PR — catch issues before merge

❌ No staging environment — dev → prod directly
✅ At minimum: dev → staging → prod with approval gates

❌ Secrets hardcoded in pipeline YAML
✅ Secrets from vault/secrets manager, injected as env vars

❌ Flaky tests causing random pipeline failures
✅ Quarantine flaky tests; fix or remove — never ignore
```""",
        """## Quick Reference

| Stage | What runs | Gate to next |
|---|---|---|
| Build | Compile, lint, typecheck | All pass |
| Test | Unit + integration tests | >80% coverage |
| Security | SAST, dependency audit | No criticals |
| Artifact | Docker build + push | Image tagged |
| Deploy staging | Helm/Terraform apply | Smoke tests pass |
| Deploy prod | Same image, prod values | Manual approval |"""
    ),

    'mongodb-patterns': (
        """## Anti-Patterns

```
❌ No indexes on query fields — full collection scans
✅ explain() every slow query; add compound indexes

❌ Storing large blobs (images, files) in documents
✅ Use GridFS or object storage; store URLs in MongoDB

❌ Deeply nested arrays updated with positional $ on multiple levels
✅ Flatten nested structures; split into separate collections if complex

❌ Schema-less = schema-free thinking
✅ Define Mongoose schema or Zod validation — enforce shape

❌ Reading entire documents to get 1 field
✅ Projection: { name: 1, email: 1, _id: 0 }
```""",
        """## Quick Reference

| Operation | Pattern | Note |
|---|---|---|
| Find + filter | find({field: value}) + index | Always index query fields |
| Partial update | $set, $inc, $push | Never replace whole doc for updates |
| Aggregation | $match early, $project late | Reduce pipeline cardinality first |
| Transactions | session.withTransaction() | Requires replica set |
| TTL expiry | createIndex + expireAfterSeconds | Auto-cleanup |
| Full-text search | $text index | Or Atlas Search for advanced |"""
    ),

    'postgres-patterns': (
        """## Anti-Patterns

```
❌ SELECT * in application queries
✅ Always specify needed columns — saves bandwidth + enables index-only scans

❌ N+1 queries from ORM lazy loading
✅ Eager load with JOINs or Prisma include

❌ No EXPLAIN ANALYZE on slow queries
✅ Run EXPLAIN (ANALYZE, BUFFERS) before adding indexes

❌ Transactions that hold locks too long
✅ Keep transactions short; move expensive work outside

❌ Storing JSON blobs instead of normalized tables
✅ Use JSONB for truly schemaless data; normalize everything else
```""",
        """## Quick Reference

| Scenario | Pattern | Note |
|---|---|---|
| Unique constraint | UNIQUE INDEX | DB enforces, not just app |
| Soft delete | deleted_at TIMESTAMP | Add partial index WHERE deleted_at IS NULL |
| Pagination | Keyset (cursor) pagination | OFFSET is slow at scale |
| Full-text | tsvector + GIN index | Built-in, no extension needed |
| Enum values | PostgreSQL ENUM type | Type-safe at DB level |
| Connection pool | PgBouncer / prisma pool | Max 100 pg connections |
| Migrations | Up + down scripts | Always have rollback |"""
    ),

    'docker-patterns': (
        """## Anti-Patterns

```
❌ RUN apt-get + app copy in one fat layer
✅ Multi-stage: builder stage installs deps, final stage copies artifact only

❌ Running as root inside containers
✅ USER node (or non-root) in Dockerfile

❌ Hardcoding secrets in ENV or ARG
✅ Inject secrets at runtime via --env-file or secrets manager

❌ :latest tag in production
✅ Pin exact image digest or semver tag

❌ No .dockerignore — sending node_modules to daemon
✅ .dockerignore: node_modules, .git, .env, dist
```""",
        """## Quick Reference

| Task | Pattern | Instruction |
|---|---|---|
| Small image | Alpine/distroless base | FROM node:20-alpine |
| Layer cache | Copy package.json first | COPY package*.json ./ |
| Build artifact | Multi-stage | FROM builder AS final |
| Non-root | USER directive | USER node |
| Health | HEALTHCHECK CMD | curl -f /health |
| Secrets | Runtime env | --env-file .env.prod |
| Image size check | docker build + inspect | docker image ls |"""
    ),

    'redis-patterns': (
        """## Anti-Patterns

```
❌ Storing large objects (>1MB) in Redis
✅ Redis for hot, small data; use S3/DB for large blobs

❌ No TTL on cached keys — memory fills up
✅ Every cache key has a TTL; use allkeys-lru eviction policy

❌ KEYS * in production (blocks Redis)
✅ Use SCAN with cursor for key iteration

❌ Using Redis as primary data store
✅ Redis is cache / queue / pub-sub — not source of truth

❌ No Redis Sentinel / Cluster for production
✅ Sentinel for HA; Cluster for horizontal scale
```""",
        """## Quick Reference

| Use case | Redis type | Command |
|---|---|---|
| Cache key-value | String | SET key val EX 300 |
| Rate limiting | String + INCR | INCR + EXPIRE |
| Session store | Hash | HSET session:id field val |
| Queue | List | LPUSH / BRPOP |
| Pub/sub | Pub/Sub | PUBLISH / SUBSCRIBE |
| Leaderboard | Sorted Set | ZADD / ZRANGE |
| Distributed lock | String + NX | SET lock nx ex 30 |"""
    ),

    'monolith-to-microservices': (
        """## Anti-Patterns

```
❌ Extracting services by technical layer (all DBs in one service)
✅ Extract by business domain — each service owns its data

❌ Migrating everything in a big-bang rewrite
✅ Strangler Fig: route traffic to new service; keep old running

❌ Shared database between microservices
✅ Each service owns its DB — communicate via events/APIs

❌ Chatty services (10+ sync calls per request)
✅ Denormalize data; use async events to avoid call chains

❌ No service mesh or circuit breakers
✅ Add retry, timeout, circuit breaker for every inter-service call
```""",
        """## Quick Reference

| Phase | Action | Risk |
|---|---|---|
| 1. Identify boundaries | Domain-driven decomposition | Low |
| 2. Split data | Separate DB per service | Medium |
| 3. Add API gateway | Route + auth centrally | Medium |
| 4. Extract first service | Low-coupling, read-heavy | Low |
| 5. Event sourcing | Replace sync calls | High |
| 6. Remove strangler | Delete old code path | Low |"""
    ),

    'git-workflow': (
        """## Anti-Patterns

```
❌ Force-pushing to main/master
✅ Protected branches + PR reviews — no direct push

❌ Commits like "fix", "WIP", "misc"
✅ Conventional Commits: feat(scope): description

❌ One giant commit per PR
✅ Atomic commits — each commit passes tests independently

❌ Long-lived feature branches (> 2 days)
✅ Trunk-based development with feature flags for incomplete work

❌ Merging without squashing messy WIP commits
✅ Squash-and-merge for clean main history
```""",
        """## Quick Reference

| Scenario | Command | Note |
|---|---|---|
| New feature | git checkout -b feat/name | Branch from main |
| Sync branch | git rebase main | Not merge — cleaner history |
| Interactive rebase | git rebase -i HEAD~N | Squash WIP commits |
| Undo last commit | git reset --soft HEAD~1 | Keeps changes staged |
| Cherry-pick | git cherry-pick <sha> | Port specific commit |
| Stash | git stash push -m "WIP: description" | Named stash |"""
    ),

    'documentation-patterns': (
        """## Anti-Patterns

```
❌ Docs that describe WHAT the code does (code already shows that)
✅ Docs explain WHY decisions were made and non-obvious constraints

❌ Markdown docs that drift from the actual code
✅ Generate API docs from code (JSDoc, OpenAPI) — single source of truth

❌ README with installation but no usage examples
✅ README: install → quick start → common tasks → link to full docs

❌ Architecture diagrams stored as binary in git
✅ Diagrams as code (Mermaid, PlantUML) — diffable, versionable

❌ "Update docs later" — never happens
✅ Docs update in the same PR as the code change
```""",
        """## Quick Reference

| Doc type | Format | Tool |
|---|---|---|
| API reference | OpenAPI 3.1 | swagger-ui / redoc |
| Architecture | Mermaid diagram in MD | In-repo |
| Runbook | Numbered steps + checks | Confluence / Notion |
| ADR | Markdown with status | docs/decisions/ |
| README | Install → usage → contribute | Repo root |
| Inline | JSDoc with @param @returns | TypeDoc |"""
    ),

    'microservices-patterns': (
        """## Anti-Patterns

```
❌ Distributed monolith — services that must deploy together
✅ True loose coupling: each service deploys independently

❌ Synchronous request chains (service A → B → C → D)
✅ Async event-driven for non-critical paths; aggregate at gateway

❌ No idempotency on message consumers
✅ Every consumer deduplicates by message ID

❌ Schema changes without backward compatibility
✅ Additive changes only; use schema registry for events

❌ No distributed tracing across service calls
✅ Propagate trace-id header; instrument with OpenTelemetry
```""",
        """## Quick Reference

| Pattern | Problem solved | Trade-off |
|---|---|---|
| API Gateway | Single entry point + auth | Extra hop |
| Circuit breaker | Cascade failures | Stale data |
| Saga | Distributed transactions | Complexity |
| CQRS | Read/write optimization | Two models to maintain |
| Event sourcing | Audit trail + replay | Storage growth |
| Sidecar | Cross-cutting concerns | Resource overhead |
| Service mesh | mTLS + observability | Ops complexity |"""
    ),

    'real-time-patterns': (
        """## Anti-Patterns

```
❌ Polling every second from client
✅ Server-Sent Events for server→client; WebSocket for bidirectional

❌ Broadcasting every event to every connected client
✅ Room/channel-based routing — clients subscribe to relevant streams

❌ No backpressure handling on fast publishers
✅ Implement flow control; drop/buffer when consumer is slow

❌ Storing real-time state only in memory (lost on restart)
✅ Persist to Redis / DB; reconnecting clients can catch up

❌ WebSocket without heartbeat/ping-pong
✅ Send heartbeat every 30s; disconnect silent clients
```""",
        """## Quick Reference

| Pattern | Transport | Use case |
|---|---|---|
| Chat / collaboration | WebSocket | Bidirectional |
| Notifications | SSE | Server→client only |
| Live dashboards | SSE | Server→client only |
| Game state | WebSocket | Low latency |
| Presence | WebSocket + Redis | User online/offline |
| Event stream | Kafka / Redis Streams | Durable replay |"""
    ),

    'bundle-optimization': (
        """## Anti-Patterns

```
❌ Importing entire library for one utility (import _ from 'lodash')
✅ Named imports only: import { debounce } from 'lodash-es'

❌ No code splitting — one 2MB bundle
✅ Dynamic import() for routes and heavy components

❌ Images not compressed or sized
✅ Next/Image or <picture> with srcset; WebP/AVIF formats

❌ Third-party scripts blocking render
✅ async/defer for non-critical; load analytics after interaction

❌ No tree-shaking (CommonJS modules)
✅ ESM everywhere — enables dead code elimination
```""",
        """## Quick Reference

| Optimization | Technique | Impact |
|---|---|---|
| Route splitting | dynamic import() | Large |
| Tree shaking | ESM named imports | Medium–Large |
| Image formats | WebP/AVIF + srcset | Large |
| Font loading | font-display: swap + subset | Medium |
| Compression | Brotli / gzip | Medium |
| Preload | <link rel=preload> | Medium |
| Bundle analysis | webpack-bundle-analyzer | Discovery |"""
    ),

    'api-backend': (
        """## Anti-Patterns

```
❌ Returning raw DB errors to clients (exposes schema)
✅ Map all errors to application error types with safe messages

❌ No request validation at API boundary
✅ Validate every request with Zod/Joi before business logic

❌ Unbounded list endpoints (return all 1M records)
✅ Mandatory pagination with max page size

❌ Different error shapes per endpoint
✅ Consistent error envelope: { error: { code, message, details } }

❌ Mutation endpoints that are idempotent by accident
✅ Explicit idempotency key header for critical mutations
```""",
        """## Quick Reference

| Concern | Pattern | Implementation |
|---|---|---|
| Validation | Input schema | Zod + middleware |
| Auth | JWT + refresh token | Middleware layer |
| Pagination | Cursor-based | `next_cursor` in response |
| Rate limiting | Sliding window | Redis + middleware |
| Versioning | URL prefix /v1/ | Never break existing clients |
| Error format | RFC 7807 | application/problem+json |
| Logging | Correlation ID | trace-id header |"""
    ),

    'code-review-patterns': (
        """## Anti-Patterns

```
❌ Review style/formatting in PR comments
✅ Automate style with Prettier/ESLint — never manual style reviews

❌ "Looks good to me" on 800-line PRs
✅ PRs should be ≤400 lines; split if larger

❌ Review comments with no actionable suggestion
✅ Every comment either asks a question or suggests a specific fix

❌ Blocking PRs over personal preference, not bugs/correctness
✅ Distinguish nit (optional) vs blocker (must fix) in comments

❌ Author defending every line under review
✅ Code review is collaborative — be curious, not defensive
```""",
        """## Quick Reference

| What to review | Priority | Example |
|---|---|---|
| Correctness | Must | Logic errors, off-by-one |
| Security | Must | Auth checks, input validation |
| Performance | Should | N+1 queries, missing indexes |
| Tests | Should | Coverage, edge cases |
| Readability | Nice | Variable names, comments |
| Style | Automated | Prettier/ESLint, not humans |"""
    ),

    'css-variables': (
        """## Anti-Patterns

```
❌ Defining CSS variables inside component selectors (scope too narrow)
✅ Define tokens at :root; override per component/theme

❌ Variable names that describe appearance (--blue-500)
✅ Semantic names: --color-primary, --color-text-muted

❌ Duplicating values instead of referencing variables
✅ Reference variables everywhere — single source of truth

❌ JavaScript setting CSS variables on every frame
✅ Use CSS calc() and CSS math instead; JS for initial set only

❌ No fallback for browsers that don't support var()
✅ var(--value, fallback) — always provide fallback
```""",
        """## Quick Reference

| Task | Syntax | Example |
|---|---|---|
| Define token | :root { --name: value } | --spacing-4: 1rem |
| Use token | var(--name) | padding: var(--spacing-4) |
| Fallback | var(--name, fallback) | color: var(--text, #000) |
| Dark theme | [data-theme="dark"] { } | Override tokens |
| JS read | getPropertyValue | getComputedStyle(el) |
| JS set | setProperty | el.style.setProperty |"""
    ),

    'forms-patterns': (
        """## Anti-Patterns

```
❌ Validating only on submit — user waits for errors
✅ Validate on blur for each field; show inline errors immediately

❌ Disabling submit button until valid (accessibility issue)
✅ Keep submit enabled; validate on submit, show all errors at once

❌ Resetting the form on validation error
✅ Preserve user input on error — never lose filled data

❌ Generic "Invalid" error message
✅ Specific messages: "Password must be at least 8 characters"

❌ No loading state after submit
✅ Disable submit + show spinner during submission
```""",
        """## Quick Reference

| Library | Use case | Key feature |
|---|---|---|
| react-hook-form | Performance-first | Uncontrolled inputs |
| Zod | Schema validation | Type inference |
| Formik | Complex forms | Built-in state |
| Server Actions | Next.js 15 | No JS bundle cost |
| HTML5 validation | Simple forms | Zero dependencies |

| UX Pattern | When | Note |
|---|---|---|
| Inline error | On blur | Don't show on pristine |
| Summary error | On submit | Anchor to first error |
| Success feedback | After submit | Toast or redirect |"""
    ),

    'prisma-expert': (
        """## Anti-Patterns

```
❌ findMany with no limit (fetch all rows)
✅ Always take + skip or cursor pagination

❌ Nested includes without selecting fields
✅ select specific fields in include to avoid over-fetching

❌ Running migrations in production without a rollback plan
✅ Test migration down script; use shadow DB for preview

❌ Raw SQL queries bypassing Prisma type safety
✅ Use Prisma Client; raw only for unsupported features with $queryRaw

❌ Multiple Prisma Client instances in serverless
✅ Singleton pattern with global caching in dev
```""",
        """## Quick Reference

| Operation | Prisma API | Note |
|---|---|---|
| Create | prisma.model.create | Returns created record |
| Update | prisma.model.update | Requires where |
| Upsert | prisma.model.upsert | create + update in one |
| Delete | prisma.model.delete | Soft-delete via deleted_at |
| Find many | findMany + take/skip | Never unbounded |
| Cursor page | findMany + cursor | For large datasets |
| Transaction | prisma.$transaction([]) | Atomic batch |
| Relation | include: { rel: true } | With select for perf |"""
    ),

    'security-review': (
        """## Anti-Patterns

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
```""",
        """## Quick Reference

| Threat | Mitigation | Priority |
|---|---|---|
| SQLi | Parameterized queries | Critical |
| XSS | CSP + sanitize output | Critical |
| Auth bypass | Verify JWT server-side | Critical |
| CSRF | SameSite=Strict cookie | High |
| Path traversal | Validate + normalize paths | High |
| Rate limiting | Redis sliding window | High |
| Secrets exposure | Vault / env injection | Critical |"""
    ),

    'web-components': (
        """## Anti-Patterns

```
❌ Deeply nested shadow DOM piercing with CSS vars hack
✅ Design tokens via CSS custom properties — they cross shadow boundaries

❌ Web Components that require framework to use
✅ Pure web components have zero framework dependencies

❌ Exposing internal DOM structure via public API
✅ Use well-defined attributes and events as public interface

❌ No form participation (custom inputs don't work in <form>)
✅ Implement ElementInternals for form-associated elements

❌ Re-inventing every component from scratch
✅ Extend existing HTML elements via customized built-ins
```""",
        """## Quick Reference

| API | Purpose | Example |
|---|---|---|
| customElements.define | Register element | define('my-btn', MyBtn) |
| connectedCallback | Mounted | Set up listeners |
| disconnectedCallback | Unmounted | Clean up listeners |
| attributeChangedCallback | Prop change | Re-render |
| observedAttributes | Prop list | static get list |
| adoptedCallback | Moved to new doc | Rare |
| attachShadow | Encapsulate | { mode: 'open' } |"""
    ),

    'websocket-patterns': (
        """## Anti-Patterns

```
❌ No reconnection logic — broken connection = dead client
✅ Exponential backoff reconnect with jitter

❌ Sending full state on every update
✅ Send diffs/patches; client reconciles

❌ No authentication on WebSocket upgrade
✅ Validate JWT/cookie on HTTP upgrade handshake

❌ Unlimited connections per user
✅ Enforce max connections per user; close old on new connect

❌ Ignoring WebSocket close codes
✅ Handle 1000 (normal), 1001 (going away), 4xxx (app errors)
```""",
        """## Quick Reference

| Scenario | Solution | Note |
|---|---|---|
| Reconnect | Exponential backoff | 1s, 2s, 4s, 8s... max 60s |
| Auth | Token in query or upgrade header | Not in URL for prod |
| Rooms | Map<roomId, Set<socket>> | Server-side routing |
| Broadcast | Iterate room sockets | Or Redis Pub/Sub for multi-node |
| Heartbeat | ping/pong interval | 30s; close if no pong |
| Compression | permessage-deflate | Header negotiation |"""
    ),

    'responsive-images': (
        """## Anti-Patterns

```
❌ Single 2000px image served to all devices
✅ srcset with multiple widths: 400w, 800w, 1200w

❌ Loading all images on page load (even below fold)
✅ loading="lazy" on all below-fold images

❌ JPEG for everything
✅ AVIF → WebP → JPEG with <picture> format fallbacks

❌ No width/height on images (causes layout shift)
✅ Always set width and height to prevent CLS

❌ CSS background-image for hero images (not optimizable)
✅ <img> with LCP optimization; CSS bg only for decorative
```""",
        """## Quick Reference

| Scenario | Solution | Attribute |
|---|---|---|
| Responsive sizes | srcset + sizes | sizes="(max-width:768px) 100vw, 50vw" |
| Lazy load | Native lazy | loading="lazy" |
| Format fallback | <picture> + <source> | type="image/avif" |
| LCP image | Eager + preload | loading="eager" fetchpriority="high" |
| Prevent CLS | Explicit dimensions | width="800" height="600" |
| Art direction | <picture> with media | Different crops per breakpoint |"""
    ),

    'authentication-patterns': (
        """## Anti-Patterns

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
```""",
        """## Quick Reference

| Flow | Library | Note |
|---|---|---|
| OAuth 2.0 | Auth.js / NextAuth | Social login |
| Email/password | Lucia / better-auth | Full control |
| Passkeys | SimpleWebAuthn | FIDO2 |
| JWT | jose | RS256, not HS256 |
| MFA | speakeasy (TOTP) | Backup codes required |
| Session | iron-session | Encrypted cookie |"""
    ),

    'mobile-patterns': (
        """## Anti-Patterns

```
❌ Using web-style touch handlers instead of Gesture Responder
✅ Use React Native PanResponder or Gesture Handler for touch

❌ Large JS bundle causing slow TTI on mobile
✅ Hermes engine + Metro bundler tree-shaking; lazy load screens

❌ Platform-specific code scattered everywhere
✅ Platform.select() or .ios.tsx / .android.tsx file extensions

❌ ScrollView wrapping FlatList (double scroll)
✅ FlatList / SectionList for any dynamic list — not ScrollView

❌ No deep link handling
✅ React Navigation linking config + universal links setup
```""",
        """## Quick Reference

| Need | React Native API | Expo |
|---|---|---|
| Navigation | React Navigation | expo-router |
| Camera | react-native-vision-camera | expo-camera |
| Storage | MMKV / AsyncStorage | expo-secure-store |
| Push notifications | notifee | expo-notifications |
| OTA update | CodePush | expo-updates |
| Device info | react-native-device-info | expo-device |"""
    ),

    'web3-patterns': (
        """## Anti-Patterns

```
❌ Trusting client-side wallet data without on-chain verification
✅ Always verify signatures and ownership on-chain / server-side

❌ Sending transactions without estimating gas
✅ estimateGas() before every transaction; add 20% buffer

❌ Storing private keys in code or .env
✅ Hardware wallet / KMS for production; never commit keys

❌ No re-entrancy guard on contract functions
✅ nonReentrant modifier (OpenZeppelin) on all state-changing functions

❌ Contract with no upgrade path
✅ Proxy pattern or design for immutability intentionally
```""",
        """## Quick Reference

| Task | Library | Note |
|---|---|---|
| Wallet connect | wagmi + ConnectKit | React hooks |
| Read contract | ethers.js / viem | Static call |
| Write contract | wagmi writeContract | Gas estimate first |
| Sign message | signMessage (SIWE) | Auth pattern |
| IPFS storage | Pinata / web3.storage | Off-chain metadata |
| Contract testing | Hardhat / Foundry | Fork mainnet for integration |"""
    ),

    'web-performance': (
        """## Anti-Patterns

```
❌ Optimizing before measuring
✅ Measure first with Lighthouse / WebPageTest; fix bottlenecks

❌ Blocking render with synchronous scripts in <head>
✅ defer/async on all scripts; inline only critical CSS

❌ Serving same large image to all viewports
✅ Responsive images with srcset + WebP/AVIF

❌ No caching strategy (every request hits origin)
✅ Cache-Control headers + CDN for static assets

❌ Third-party scripts with no facade pattern
✅ Facade/lazy-load heavy embeds (video, chat, maps)
```""",
        """## Quick Reference

| Metric | Good | Tool to fix |
|---|---|---|
| LCP | < 2.5s | Image optimization, preload |
| CLS | < 0.1 | Explicit dimensions, no injected content |
| INP | < 200ms | Debounce, web workers |
| TTFB | < 800ms | CDN, caching, edge rendering |
| TBT | < 200ms | Split large tasks, defer scripts |
| FCP | < 1.8s | Critical CSS inline, preload fonts |"""
    ),

    'data-visualization': (
        """## Anti-Patterns

```
❌ Rendering 100,000 SVG elements directly in DOM
✅ Canvas or WebGL for large datasets; virtualize SVG lists

❌ Pie charts for comparing more than 4 values
✅ Bar chart for comparison; pie only for part-of-whole with <4 segments

❌ Dual Y-axis charts (misleading scale)
✅ Two separate charts or normalized data

❌ No loading state during data fetch
✅ Skeleton/placeholder chart while data loads

❌ Color as the only differentiator (accessibility)
✅ Color + pattern/shape; check contrast with colorblind simulation
```""",
        """## Quick Reference

| Chart type | When to use | Library |
|---|---|---|
| Bar | Comparison | Recharts / Chart.js |
| Line | Trend over time | Recharts / D3 |
| Scatter | Correlation | D3 / Observable Plot |
| Heatmap | 2D density | D3 |
| Treemap | Hierarchical part-of-whole | D3 |
| Large data | WebGL rendering | deck.gl / regl |"""
    ),

    'debugging-strategies': (
        """## Anti-Patterns

```
❌ console.log debugging in production code
✅ Structured logging with log levels; remove debug logs before commit

❌ Changing multiple things at once while debugging
✅ Change one variable at a time; binary search the bug

❌ Fixing the symptom without understanding root cause
✅ Reproduce reliably → isolate → understand → fix → verify

❌ Skipping reproduction step ("I'll just fix it")
✅ Write a failing test first — it documents the bug and prevents regression

❌ Debugging in prod instead of staging
✅ Reproduce locally; add observability to prod for future incidents
```""",
        """## Quick Reference

| Technique | When to use | Tool |
|---|---|---|
| Breakpoints | Step through logic | DevTools / VSCode |
| Binary search | Narrow down commit | git bisect |
| Network tab | API / fetch issues | DevTools Network |
| Memory snapshot | Leak investigation | DevTools Memory |
| Performance flame | Slow renders | DevTools Performance |
| Error boundary | React render errors | React DevTools |"""
    ),

    'search-patterns': (
        """## Anti-Patterns

```
❌ LIKE '%query%' on large tables (full scan)
✅ Full-text search index: PostgreSQL tsvector or Elasticsearch

❌ Re-indexing entire dataset on every document update
✅ Incremental indexing — queue updates to search index

❌ Returning raw search scores without relevance tuning
✅ Boost by recency, popularity, and field weight

❌ No search analytics — unknown what users can't find
✅ Log zero-result queries and click-through rate

❌ Typos breaking search entirely
✅ Fuzzy matching with configurable edit distance
```""",
        """## Quick Reference

| Scale | Solution | Note |
|---|---|---|
| Small (<100k docs) | PostgreSQL FTS | Built-in, no extra infra |
| Medium | Typesense / Meilisearch | Self-hosted, fast |
| Large | Elasticsearch / OpenSearch | Complex, powerful |
| Hosted | Algolia | SaaS, fast setup |
| Vector search | pgvector / Pinecone | Semantic / AI search |"""
    ),

    'state-management': (
        """## Anti-Patterns

```
❌ Global state for everything (even local UI state)
✅ Keep state as local as possible; hoist only when needed

❌ Storing server data in Redux/Zustand (duplicates cache)
✅ Use TanStack Query / SWR for server state; client store for UI state

❌ Deeply nested state objects
✅ Normalize state: entities by ID map + IDs array

❌ Mutating state directly (bypassing immutability)
✅ Immer or spread for immutable updates — never direct mutation

❌ Synchronizing two separate state slices manually
✅ Derive computed values with selectors — don't duplicate state
```""",
        """## Quick Reference

| State type | Solution | Why |
|---|---|---|
| Server data | TanStack Query / SWR | Cache + deduplicate |
| Global UI | Zustand | Minimal boilerplate |
| Complex global | Redux Toolkit | Time-travel debug |
| Component local | useState | No over-engineering |
| Form | react-hook-form | Performance |
| URL state | searchParams | Shareable, bookmarkable |"""
    ),

    'caching-patterns': (
        """## Anti-Patterns

```
❌ Caching mutable data without TTL
✅ Every cache entry has a TTL or explicit invalidation

❌ Cache stampede — all entries expire simultaneously
✅ Jitter on TTLs; probabilistic early expiration

❌ Caching at multiple layers with different stale states
✅ Define cache hierarchy: browser → CDN → app → DB query

❌ Not caching because "it's complex"
✅ Start with simple TTL caching; add complexity only if needed

❌ Sensitive data in shared caches
✅ User-specific data in private cache (no CDN); strip auth headers
```""",
        """## Quick Reference

| Layer | Tool | TTL guidance |
|---|---|---|
| Browser | Cache-Control, ETag | Static: 1y, HTML: no-cache |
| CDN | Cloudflare / Fastly | Vary on Accept-Encoding |
| App memory | node-cache / LRU | Short TTL, small hot set |
| Distributed | Redis | Session: 24h, API: 5-60s |
| DB query | Prisma + Redis | Heavy aggregations |
| Full-page | Next.js ISR | revalidate: 60 |"""
    ),

    'ddd-patterns': (
        """## Anti-Patterns

```
❌ Anemic domain model (entities are just data structs)
✅ Rich entities with behavior — User.changeEmail(), Order.place()

❌ Aggregate that spans too many entities
✅ Keep aggregates small; one transaction = one aggregate

❌ Domain events published synchronously blocking the caller
✅ Collect events in aggregate; dispatch after transaction commits

❌ Business logic in application services or controllers
✅ Logic belongs to entities and domain services

❌ Exposing aggregate internals to the outside
✅ Only aggregate root is accessible from outside; internal objects are private
```""",
        """## Quick Reference

| Concept | Role | Rule |
|---|---|---|
| Entity | Identity + lifecycle | Mutable; identified by ID |
| Value Object | Describe by value | Immutable; no identity |
| Aggregate | Consistency boundary | One transaction per aggregate |
| Domain Event | Side effect trigger | Immutable; past tense name |
| Repository | Persistence facade | Returns full aggregates |
| Domain Service | Stateless logic | When logic doesn't fit entity |
| Bounded Context | Linguistic boundary | Each team owns its context |"""
    ),

    'accessibility-basics': (
        """## Anti-Patterns

```
❌ Interactive elements without keyboard navigation
✅ All actions reachable via Tab/Enter/Space/Arrow keys

❌ Color contrast below 4.5:1 (AA standard)
✅ Use contrast checker; text on bg ≥ 4.5:1 normal, 3:1 large

❌ Images with no alt text
✅ Meaningful images: alt="description"; decorative: alt=""

❌ Custom components without ARIA roles
✅ Use semantic HTML first; ARIA only when native element unavailable

❌ Focus trapping outside modals
✅ Trap focus inside open modal; restore on close
```""",
        """## Quick Reference

| WCAG Level | Requirement | Check |
|---|---|---|
| A | Alt text on images | axe DevTools |
| A | Keyboard navigation | Tab through page |
| AA | Color contrast 4.5:1 | Colour Contrast Analyser |
| AA | Focus visible | Outline never display:none |
| AA | Error identification | Describe error in text |
| AAA | Enhanced contrast 7:1 | For critical text |"""
    ),

    'api-design': (
        """## Anti-Patterns

```
❌ Verbs in REST URLs (/getUser, /deletePost)
✅ Nouns only: GET /users/:id, DELETE /posts/:id

❌ Breaking changes without versioning
✅ Version with /v1/ prefix; never remove fields from v1

❌ Inconsistent response shapes per endpoint
✅ Standard envelope: { data, meta, error }

❌ 200 OK for errors ("success: false" in body)
✅ Correct HTTP status codes: 400, 401, 403, 404, 422, 500

❌ No pagination — returning all records
✅ Cursor-based pagination; document max page size
```""",
        """## Quick Reference

| HTTP Method | Semantics | Idempotent? |
|---|---|---|
| GET | Read resource | Yes |
| POST | Create resource | No |
| PUT | Replace resource | Yes |
| PATCH | Partial update | No |
| DELETE | Remove resource | Yes |

| Status | Meaning | When |
|---|---|---|
| 200 | OK | Success |
| 201 | Created | POST success |
| 204 | No Content | DELETE success |
| 400 | Bad Request | Validation fail |
| 401 | Unauthorized | No auth |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource missing |
| 422 | Unprocessable | Semantic error |"""
    ),

    'internationalization': (
        """## Anti-Patterns

```
❌ Hardcoded strings in component templates
✅ All user-visible strings in translation files (en.json, tr.json)

❌ Concatenating translated strings ("Hello " + name)
✅ Parameterized messages: t('greeting', { name })

❌ Date/number formatting without Intl API
✅ Intl.DateTimeFormat and Intl.NumberFormat for locale-aware output

❌ RTL layout that breaks because of left/right CSS
✅ Use logical properties: margin-inline-start instead of margin-left

❌ Loading all language bundles upfront
✅ Lazy-load translations per locale on demand
```""",
        """## Quick Reference

| Feature | API / Library | Note |
|---|---|---|
| Translation | next-intl / react-i18next | Key-based |
| Pluralization | ICU message format | {count, plural, ...} |
| Date format | Intl.DateTimeFormat | Locale-aware |
| Number format | Intl.NumberFormat | Currency, percent |
| Locale detect | Accept-Language header | Server-side redirect |
| RTL support | CSS logical properties | inline/block instead of left/right |"""
    ),

    'logging-patterns': (
        """## Anti-Patterns

```
❌ console.log in application code
✅ Structured logger (pino/winston) with log levels

❌ Logging sensitive data (passwords, tokens, PII)
✅ Redact sensitive fields; log IDs not values

❌ Logging inside tight loops (millions/sec)
✅ Log entry/exit of operations; aggregate metrics instead

❌ No correlation ID across service calls
✅ Propagate trace-id/request-id header; include in every log line

❌ Log statements that say what, not why
✅ Log context: what was being attempted, not just the error
```""",
        """## Quick Reference

| Level | When to use | Example |
|---|---|---|
| error | Unhandled exceptions, outages | DB connection failed |
| warn | Recoverable issues, deprecations | Fallback used |
| info | Business events, lifecycle | User signed up |
| debug | Diagnostic detail | Query took 200ms |
| trace | Very verbose paths | Enter function X |

| Field | Always include | Optional |
|---|---|---|
| timestamp | ISO 8601 | — |
| level | string | — |
| message | string | — |
| trace_id | string | — |
| service | string | version |
| user_id | string | — |"""
    ),

    'terraform-basics': (
        """## Anti-Patterns

```
❌ Storing tfstate locally — lost on laptop change, blocks team
✅ Remote state: S3 + DynamoDB lock, or Terraform Cloud

❌ Hardcoding secrets in .tf files
✅ Secrets via AWS Secrets Manager, Vault, or env vars

❌ Running terraform apply directly without plan review
✅ Always terraform plan → review → apply; automate in CI with approval gate

❌ One giant module for everything
✅ Split into reusable modules: networking, compute, database

❌ No lifecycle rules on resources that shouldn't be destroyed
✅ prevent_destroy = true on databases, S3 buckets with data
```""",
        """## Quick Reference

| Command | What it does | When |
|---|---|---|
| terraform init | Download providers | Before first apply |
| terraform plan | Show changes | Before every apply |
| terraform apply | Apply changes | After reviewing plan |
| terraform destroy | Remove all | Only in dev/staging |
| terraform import | Adopt existing resource | Brownfield migration |
| terraform state | Manipulate state | Advanced / emergency |"""
    ),

    'tailwind-expert': (
        """## Anti-Patterns

```
❌ Overriding Tailwind with arbitrary [value] everywhere
✅ Extend theme in tailwind.config.ts; use custom tokens

❌ Long className strings that repeat across components
✅ Extract to component with cva() (class-variance-authority)

❌ Purging accidentally removes used classes (dynamic class strings)
✅ Safelist dynamic classes or construct full class names in code

❌ Mixing Tailwind with global CSS for the same styles
✅ Tailwind for all layout/spacing; CSS for animations not in Tailwind

❌ No dark mode strategy — adding dark: to every class
✅ Centralize dark mode in design tokens via CSS variables
```""",
        """## Quick Reference

| Pattern | Implementation | Note |
|---|---|---|
| Component variants | cva() + cn() | Type-safe variants |
| Responsive | sm: md: lg: | Mobile-first |
| Dark mode | dark: prefix | class or media strategy |
| Animation | animate-* + @keyframes | Extend in config |
| Arbitrary value | w-[37px] | Use sparingly |
| Custom token | extend.colors.brand | In tailwind.config.ts |"""
    ),

    'message-queues': (
        """## Anti-Patterns

```
❌ Fire-and-forget without acknowledging (message lost on crash)
✅ Explicit ack after successful processing; use dead letter queue

❌ Large payloads in queue messages (>256KB)
✅ Store payload in S3/DB; put reference ID in message

❌ No idempotency — processing same message twice causes duplicate
✅ Idempotency key per message; deduplicate before processing

❌ One queue for everything (low priority blocks high)
✅ Separate queues by priority; separate consumer groups

❌ No monitoring on queue depth
✅ Alert on queue depth > threshold and age > SLA
```""",
        """## Quick Reference

| System | Use case | Key feature |
|---|---|---|
| BullMQ (Redis) | Background jobs | Cron, retry, priority |
| RabbitMQ | Complex routing | Exchanges, topics |
| Kafka | Event streaming | High throughput, replay |
| SQS | AWS-native | Managed, DLQ built-in |
| Inngest | Serverless workflows | Step functions |"""
    ),

    'edge-computing': (
        """## Anti-Patterns

```
❌ Running Node.js-only APIs at edge (unsupported runtime)
✅ Use Edge Runtime compatible APIs: fetch, crypto, TextEncoder only

❌ Accessing database directly from edge worker
✅ Use edge-compatible DBs (PlanetScale, Neon, Turso) or cache layer

❌ Edge functions for long-running tasks (>30s limit)
✅ Edge for short-lived transformations; offload heavy work to serverless

❌ No geo-awareness — same content to every region
✅ Edge KV for regionally replicated data; vary by cf-ipcountry header

❌ Debugging edge with console.log (no runtime visibility)
✅ Use structured logging + wrangler tail / Cloudflare Logpush
```""",
        """## Quick Reference

| Platform | Runtime limit | Best for |
|---|---|---|
| Cloudflare Workers | 50ms CPU | Global low-latency |
| Vercel Edge | 25s wall clock | Next.js middleware |
| Deno Deploy | Generous | Full Deno APIs |
| Fastly Compute | 50ms | CDN logic |
| AWS Lambda@Edge | 5s | CloudFront integration |"""
    ),

    'kubernetes-basics': (
        """## Anti-Patterns

```
❌ Running containers as root in pods
✅ securityContext: runAsNonRoot: true; runAsUser: 1000

❌ No resource limits on containers (noisy neighbor)
✅ Always set requests and limits for CPU and memory

❌ kubectl apply -f with no review
✅ GitOps: ArgoCD / Flux sync from git; no manual kubectl in prod

❌ All pods in default namespace
✅ Namespaces per team/environment with RBAC policies

❌ No liveness/readiness probes
✅ Readiness: ready to serve traffic; liveness: restart if stuck
```""",
        """## Quick Reference

| Resource | Purpose | Key fields |
|---|---|---|
| Deployment | Manage pod replicas | replicas, selector, template |
| Service | Network endpoint | ClusterIP, LoadBalancer, NodePort |
| Ingress | HTTP routing | rules, TLS, annotations |
| ConfigMap | Non-secret config | data key-value |
| Secret | Sensitive config | data base64-encoded |
| HPA | Auto-scale pods | minReplicas, maxReplicas, metrics |"""
    ),

    'browser-apis': (
        """## Anti-Patterns

```
❌ IntersectionObserver not disconnected after element removed
✅ observer.disconnect() in cleanup / useEffect return

❌ Blocking main thread with synchronous XHR
✅ Always async: fetch() with await

❌ Storing sensitive data in localStorage (XSS accessible)
✅ Sensitive data in HttpOnly cookies; localStorage only for non-sensitive

❌ Registering event listeners without removing on unmount
✅ Return cleanup function in useEffect; removeEventListener

❌ navigator.geolocation without feature detect
✅ Always feature-detect: if ('geolocation' in navigator)
```""",
        """## Quick Reference

| API | Use case | MDN |
|---|---|---|
| IntersectionObserver | Lazy load, scroll trigger | observe/unobserve |
| ResizeObserver | Responsive components | observe element |
| MutationObserver | Watch DOM changes | observe with config |
| Web Workers | Off-thread computation | postMessage |
| IndexedDB | Large client storage | via idb library |
| Web Crypto | Client-side crypto | subtle.digest, encrypt |"""
    ),

    'cron-jobs': (
        """## Anti-Patterns

```
❌ Multiple instances running the same cron simultaneously
✅ Distributed lock (Redis SET NX) before executing cron job

❌ Cron jobs with no logging or alerting
✅ Log start/end/duration; alert on failure or long runtime

❌ Cron times in local timezone
✅ Always use UTC in cron expressions

❌ Heavy work blocking the cron process
✅ Cron dispatches a job to a queue; worker handles the heavy lifting

❌ No graceful shutdown handling
✅ Handle SIGTERM; complete current job, reject new during shutdown
```""",
        """## Quick Reference

| Expression | Meaning | Example |
|---|---|---|
| `* * * * *` | Every minute | Health check |
| `0 * * * *` | Every hour | Hourly rollup |
| `0 0 * * *` | Daily midnight UTC | Daily report |
| `0 0 * * 0` | Weekly Sunday | Weekly summary |
| `*/5 * * * *` | Every 5 minutes | Polling job |

| Library | Runtime | Note |
|---|---|---|
| node-cron | Node.js | In-process |
| BullMQ repeat | Node.js | Queue-backed |
| Inngest | Serverless | Managed |
| GitHub Actions schedule | CI | Simple periodic |"""
    ),

    'file-handling': (
        """## Anti-Patterns

```
❌ Reading entire large file into memory (fs.readFileSync)
✅ Stream large files: createReadStream + pipe

❌ User-controlled file paths without sanitization (path traversal)
✅ path.basename() + restrict to allowed directory

❌ Storing uploaded files on server disk (ephemeral in serverless)
✅ Stream directly to S3 / object storage

❌ No file type validation (accept any extension)
✅ Check magic bytes (file-type library), not just extension

❌ Synchronous file operations in hot paths
✅ Always async: fs.promises / streams in API handlers
```""",
        """## Quick Reference

| Scenario | API | Note |
|---|---|---|
| Read small file | fs.promises.readFile | Await |
| Read large file | fs.createReadStream | Streaming |
| Write atomically | write to tmp then rename | Prevents corruption |
| Upload to S3 | @aws-sdk/lib-storage | Multipart auto |
| Temp file | tmp / os.tmpdir | Clean up on close |
| Watch file | fs.watch / chokidar | chokidar more reliable |"""
    ),

    'email-patterns': (
        """## Anti-Patterns

```
❌ Sending email synchronously inside HTTP request handler
✅ Queue email; deliver async via background worker

❌ Plain-text email only (no HTML template)
✅ Multipart emails: text/plain fallback + text/html styled

❌ Sending bulk email through SMTP directly
✅ Use transactional ESP (Resend, SendGrid, Postmark) for deliverability

❌ No unsubscribe link in marketing emails
✅ CAN-SPAM / GDPR: unsubscribe + physical address required

❌ Not testing email rendering across clients
✅ Litmus / Email on Acid preview before sending
```""",
        """## Quick Reference

| Service | Use case | SDK |
|---|---|---|
| Resend | Transactional | resend npm |
| SendGrid | Transactional + marketing | @sendgrid/mail |
| Postmark | High deliverability | postmark |
| Mailchimp | Marketing / newsletters | API v3 |
| React Email | Template authoring | react-email |

| Header | Purpose | Required? |
|---|---|---|
| List-Unsubscribe | One-click unsubscribe | Marketing: Yes |
| DKIM | Email authentication | Always |
| SPF | Sender policy | Always |
| DMARC | Alignment policy | Recommended |"""
    ),

    'event-driven-patterns': (
        """## Anti-Patterns

```
❌ Event consumers with direct coupling to producers
✅ Events via broker (Kafka/SNS/EventBridge) — producer never calls consumer

❌ Events with no schema contract (free-form JSON)
✅ Schema registry (Confluent/Glue) or Zod schema for every event type

❌ Event handlers that throw and cause infinite retry loops
✅ Bounded retry + dead letter queue; separate poison pill handling

❌ Choreography only — no visibility into multi-step workflows
✅ Add distributed tracing correlation ID across all event hops

❌ Mutable events — changing an event after publish
✅ Events are immutable facts in the past; append-only log
```""",
        """## Quick Reference

| Pattern | When | Complexity |
|---|---|---|
| Choreography | Loose coupling, simple flows | Low |
| Orchestration | Complex workflows, visibility | Medium |
| Saga | Distributed transaction rollback | High |
| Event sourcing | Full audit trail | High |
| CQRS + events | Read/write separation | High |

| Broker | Throughput | Durability |
|---|---|---|
| Kafka | Very high | Durable replay |
| RabbitMQ | High | Configurable |
| SNS/SQS | High | Managed |
| EventBridge | Medium | Managed |"""
    ),

    'nodejs-expert': (
        """## Anti-Patterns

```
❌ Blocking the event loop with CPU-intensive code
✅ Offload CPU work to Worker Threads or child_process

❌ Unhandled promise rejections crashing the process
✅ process.on('unhandledRejection', ...) + proper async error handling

❌ require() in hot paths (module cache miss on first load)
✅ Require at top of file; lazy require only for rarely-used modules

❌ Large synchronous JSON.parse() in request handler
✅ Stream parsing with streaming-json or offload to worker

❌ No graceful shutdown — dropping in-flight requests
✅ Handle SIGTERM: drain connections, wait for pending, then exit
```""",
        """## Quick Reference

| Scenario | Solution | Note |
|---|---|---|
| HTTP server | Fastify / Express | Fastify 2x faster |
| Async queue | BullMQ | Redis-backed |
| CPU work | Worker Threads | Shared ArrayBuffer |
| Child process | child_process.fork | Separate process |
| Streams | Transform stream | Backpressure built-in |
| Shutdown | http.closeAllConnections | Node 18.2+ |"""
    ),

    'component-design-patterns': (
        """## Anti-Patterns

```
❌ Component that does data fetching + rendering + state management
✅ Single responsibility: container (data) vs presentational (UI)

❌ Props drilling 5 levels deep
✅ Composition pattern or context for cross-cutting concerns

❌ Boolean prop explosion (isLoading, isDisabled, isError, isLarge...)
✅ Variant prop with discriminated union: variant="loading" | "error"

❌ Ref forwarding broken by wrapping in HOC
✅ forwardRef at every wrapper; compose with mergeRefs

❌ Component accepting 20+ props
✅ Split component; use render props or compound components for complexity
```""",
        """## Quick Reference

| Pattern | Use case | Trade-off |
|---|---|---|
| Compound components | Complex related UI | Flexible but verbose API |
| Render props | Injecting behavior | More flexible than HOC |
| HOC | Cross-cutting (auth, analytics) | Hard to compose |
| Custom hook | Reusable logic only | No rendering |
| Polymorphic `as` prop | Semantic element flex | Type complexity |
| Slot pattern | Content projection | Like Vue slots in React |"""
    ),

    'react-expert': (
        """## Anti-Patterns

```
❌ useEffect for derived state
✅ Compute derived state inline during render — no effect needed

❌ Mutating state directly (array.push, obj.key = val)
✅ Always return new references: [...arr, item], { ...obj, key: val }

❌ Large components that re-render on every parent change
✅ React.memo on stable components; split fast-changing state down

❌ useCallback/useMemo everywhere as "optimization"
✅ Profile first; memoize only when renders measurably slow

❌ key={index} for dynamic lists
✅ key={item.id} — stable, unique identity prevents wrong reconciliation
```""",
        """## Quick Reference

| Hook | Use case | Note |
|---|---|---|
| useState | Local UI state | Simple values |
| useReducer | Complex state machine | Action-based |
| useContext | Cross-tree shared state | Don't overuse |
| useEffect | Side effects only | Not for derived state |
| useCallback | Stable function ref | Only when passed to memo'd child |
| useMemo | Expensive computation | Profile first |
| useRef | DOM ref / mutable | Doesn't trigger re-render |
| useTransition | Non-urgent updates | Mark slow state as transition |"""
    ),

    'testing-patterns': (
        """## Anti-Patterns

```
❌ Testing implementation details (internals, private methods)
✅ Test behavior from the user's perspective — what it does, not how

❌ Mocking everything, including the thing under test
✅ Mock only external boundaries (DB, HTTP, clock); test real logic

❌ Single test file with 200 test cases — slow, hard to navigate
✅ Co-locate tests with feature; one file per module

❌ Tests that pass individually but fail in CI (global state leak)
✅ Reset all shared state in beforeEach/afterEach

❌ 0% E2E tests relying only on unit tests
✅ Testing trophy: many unit, some integration, few critical E2E
```""",
        """## Quick Reference

| Test type | Tool | What to test |
|---|---|---|
| Unit | Vitest / Jest | Pure functions, hooks |
| Component | Testing Library | User interactions |
| Integration | Supertest | API routes |
| E2E | Playwright | Critical user journeys |
| Visual | Chromatic | UI regression |
| Performance | Lighthouse CI | CWV thresholds |"""
    ),

    'typescript-expert': (
        """## Anti-Patterns

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
```""",
        """## Quick Reference

| Feature | Syntax | When to use |
|---|---|---|
| Discriminated union | type A = { kind: 'a' } | Type-safe conditionals |
| Type guard | is narrowed type | Custom narrowing |
| Conditional type | T extends U ? A : B | Generic branching |
| Template literal | \`${Status}Event\` | String unions |
| Mapped type | { [K in keyof T]: ... } | Transform types |
| Infer | infer R in conditional | Extract inner type |
| Satisfies | value satisfies Type | Validate without widen |"""
    ),
}

def has_section(content: str, section_title: str) -> bool:
    return section_title.lower() in content.lower()

def enhance_skill(skill_name: str, anti_patterns: str, quick_ref: str) -> bool:
    skill_path = os.path.join(SKILLS_DIR, skill_name, 'SKILL.md')
    if not os.path.exists(skill_path):
        print(f"  SKIP (not found): {skill_name}")
        return False

    with open(skill_path, 'r') as f:
        content = f.read()

    needs_anti = not has_section(content, '## anti-patterns')
    needs_qr = not has_section(content, '## quick reference')

    if not needs_anti and not needs_qr:
        print(f"  SKIP (already has both): {skill_name}")
        return False

    additions = []
    if needs_anti:
        additions.append(anti_patterns)
    if needs_qr:
        additions.append(quick_ref)

    new_content = content.rstrip() + '\n\n---\n\n' + '\n\n---\n\n'.join(additions) + '\n'

    with open(skill_path, 'w') as f:
        f.write(new_content)

    added = []
    if needs_anti: added.append('anti-patterns')
    if needs_qr: added.append('quick-ref')
    print(f"  OK ({', '.join(added)}): {skill_name}")
    return True

def main():
    updated = 0
    skipped = 0
    for skill_name, (anti, qr) in ENHANCEMENTS.items():
        result = enhance_skill(skill_name, anti, qr)
        if result:
            updated += 1
        else:
            skipped += 1

    print(f"\nDone: {updated} updated, {skipped} skipped")

if __name__ == '__main__':
    main()
