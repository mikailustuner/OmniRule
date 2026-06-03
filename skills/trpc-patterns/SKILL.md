---
name: trpc-patterns
description: "tRPC v11: Type-safe API layer, routers, procedures, context, middleware, React Query integration."
triggers:
  extensions: [".ts", ".tsx"]
  directories: ["server/trpc/", "trpc/", "src/server/"]
  filenames: ["trpc.ts", "router.ts", "_app.ts"]
  keywords: ["trpc", "createTRPCRouter", "publicProcedure", "protectedProcedure", "createCallerFactory", "inferAsyncReturnType"]
auto_load_when: "Building full-stack TypeScript API with tRPC"
agent: architect
tools: ["Read", "Write", "Bash"]
---

# tRPC v11 Patterns

**Version:** tRPC v11 | **Stack:** Next.js App Router + React Query

---

## 1. Server Setup

```ts
// server/trpc/trpc.ts — core setup
import { initTRPC, TRPCError } from '@trpc/server';
import { type Session } from 'next-auth';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { db } from '@/lib/db';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerSession();
  return { db, session, ...opts };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, session: ctx.session } });
});
```

---

## 2. Router Definition

```ts
// server/trpc/routers/post.ts
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const postRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ cursor: z.string().optional(), limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      const nextCursor = posts.length > input.limit ? posts.pop()!.id : undefined;
      return { posts, nextCursor };
    }),

  create: protectedProcedure
    .input(z.object({ title: z.string().min(1).max(255), body: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: { ...input, authorId: ctx.session.user.id },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({ where: { id: input.id } });
      if (post?.authorId !== ctx.session.user.id)
        throw new TRPCError({ code: 'FORBIDDEN' });
      return ctx.db.post.delete({ where: { id: input.id } });
    }),
});

// server/trpc/root.ts
export const appRouter = createTRPCRouter({ post: postRouter });
export type AppRouter = typeof appRouter;
```

---

## 3. Next.js App Router Integration

```ts
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/root';
import { createTRPCContext } from '@/server/trpc/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  });

export { handler as GET, handler as POST };

// lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/trpc/root';
export const api = createTRPCReact<AppRouter>();

// lib/trpc/server.ts — Server Component caller
import { createCallerFactory } from '@trpc/server';
import { appRouter } from '@/server/trpc/root';
const createCaller = createCallerFactory(appRouter);
export const api = createCaller(await createTRPCContext({ headers: new Headers() }));
```

---

## 4. Client Usage (React Query)

```tsx
'use client';
import { api } from '@/lib/trpc/client';

// Query
const { data, isLoading } = api.post.getAll.useQuery({ limit: 10 });

// Infinite query
const { data, fetchNextPage } = api.post.getAll.useInfiniteQuery(
  { limit: 10 },
  { getNextPageParam: (last) => last.nextCursor }
);

// Mutation with optimistic update
const utils = api.useUtils();
const create = api.post.create.useMutation({
  onSuccess: () => utils.post.getAll.invalidate(),
});
create.mutate({ title: 'Hello', body: 'World' });
```

---

## 5. Server Component Usage

```tsx
// app/posts/page.tsx — no useQuery, direct caller
import { api } from '@/lib/trpc/server';
export default async function PostsPage() {
  const { posts } = await api.post.getAll({ limit: 20 });
  return <PostList posts={posts} />;
}
```

---

## Quick Reference

| Pattern | Code |
|---------|------|
| Public procedure | `publicProcedure.query/mutation` |
| Auth-protected | `protectedProcedure` (throws UNAUTHORIZED) |
| Input validation | `.input(z.object({...}))` — always use Zod |
| Cursor pagination | `take: limit+1`, return `nextCursor` |
| Invalidate cache | `utils.router.procedure.invalidate()` |
| Server Component | `createCallerFactory` + direct call |

## Anti-Patterns

```
❌ Skipping input validation on procedures
✅ Always .input(z.schema()) — tRPC validates automatically

❌ One giant router file
✅ Split by domain: postRouter, userRouter, merged in root

❌ Fetching in Server Component via HTTP (localhost)
✅ Use createCallerFactory for direct in-process calls

❌ Not using superjson transformer
✅ superjson handles Date, Map, Set serialization automatically
```

## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish.
