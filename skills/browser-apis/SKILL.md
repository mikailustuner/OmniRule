---
name: browser-apis
description: "Browser APIs: Storage, IndexedDB, BroadcastChannel, SharedWorker, Clipboard" 
triggers:
  extensions: [".ts", ".tsx"]
  keywords: ["navigator", "localStorage", "IndexedDB", "ServiceWorker", "clipboard", "geolocation", "notification", "Web API"]
auto_load_when: "Using browser-native APIs"
agent: frontend-ops
tools: ["Read", "Write", "Bash"]
---

# Browser APIs Patterns

**Focus:** Client-side storage, cross-tab communication, background processing

## 1. Storage Decision Tree

```
Use localStorage when:
├── Simple key-value pairs
├── String data only
├── Under 5MB
└── Synchronous access OK

Use sessionStorage when:
├── Tab-specific data
├── Auto-clear on tab close
└── Sensitive data (per tab)

Use IndexedDB when:
├── Large structured data
├── Complex queries needed
├── Binary data (blobs)
└── Transaction support needed

Use Cache API when:
├── HTTP response caching
├── Offline support
└── Network-first/fallback
```

---

## 2. IndexedDB Patterns

```
Schema design:
├── Object stores: like tables
├── Indexes: for query performance
└── Version increment: for migrations

Transaction modes:
├── Read-only: safe, concurrent
├── Read-write: single writer
└── Version change: schema changes

Async patterns:
├── Promises (modern)
├── Event-based (legacy)
└── Cursor for large datasets

Common mistakes:
├── Not handling version upgrades
├── Transaction too long
└── Storing non-serializable
```

---

## 3. BroadcastChannel Patterns

```
Use case: Cross-tab sync
├── Same-origin tabs only
├── Real-time communication
└── No server needed

Implementation:
├── Create: new BroadcastChannel('name')
├── Send: channel.postMessage(data)
└── Receive: channel.onmessage

Use patterns:
├── Login state sync
├── Theme changes
├── Cache invalidation
└── Form state sharing

Limits:
├── 1MB message size
├── Not supported in all browsers
└── Safari: limited support
```

---

## 4. SharedWorker Patterns

```
Use case:
├── Shared state across tabs
├── Background processing
└── Single connection management

Communication:
├── Port-based messaging
├── MessageChannel for direct comm
└── Shared state via IndexedDB

Lifecycle:
├── Created on first connection
├── Stays alive while any tab connected
└── Dies when last tab closes

Warning:
├── Debugging is hard
├── Memory leaks possible
└── Browser support varies
```

---

## 5. Clipboard API Patterns

```
Read (paste):
├── Requires permission (navigator.permissions)
├── Support varies by browser
└── Handle plain text and HTML

Write (copy):
├── navigator.clipboard.writeText()
├── Modern: write() with ClipboardItem
├── Fallback: execCommand (deprecated)

Security:
├── User gesture required
├── Permission prompts
└── Don't trust clipboard content

Pattern:
├── Try modern API first
├── Handle errors gracefully
└── Provide fallback UI
```

---

## 6. Storage Limits & Quotas

```
localStorage:
├── 5-10MB per origin
├── Synchronous, blocking
└── No transactions

sessionStorage:
├── Same limit as localStorage
├── Per-tab isolation
└── Cleared on close

IndexedDB:
├── Variable: 50MB+
├── User can increase
└── Async, non-blocking

Cache API:
├── No fixed limit
├── Browser-managed eviction
└── Per-origin quota
```

---

## Key Patterns

1. **IndexedDB for complexity** - Queries, large data
2. **localStorage for simple** - Quick, synchronous
3. **BroadcastChannel** - Cross-tab sync, no server
4. **SharedWorker** - Shared background processing
5. **Clipboard requires gesture** - Don't rely on read
6. **Always handle quota errors** - Storage limited

---

## Anti-Patterns

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
```

---

## Quick Reference

| API | Use case | MDN |
|---|---|---|
| IntersectionObserver | Lazy load, scroll trigger | observe/unobserve |
| ResizeObserver | Responsive components | observe element |
| MutationObserver | Watch DOM changes | observe with config |
| Web Workers | Off-thread computation | postMessage |
| IndexedDB | Large client storage | via idb library |
| Web Crypto | Client-side crypto | subtle.digest, encrypt |
