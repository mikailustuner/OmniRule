---
name: pwa-patterns
description: "Service workers, offline strategy, manifest" 
triggers:
  filenames: ["manifest.json", "service-worker.js", "sw.js"]
  keywords: ["PWA", "service worker", "offline", "manifest", "cache strategy", "install prompt"]
auto_load_when: "Building Progressive Web App features"
agent: frontend-ops
tools: ["Read", "Write", "Bash"]
---

# PWA Patterns

Focus: Service workers, offline strategies, web manifest

## 1. Service Worker Decision Tree

```
When to use service worker:
├── Offline support → yes
├── Background sync → yes
├── Push notifications → yes
└── Performance → yes (caching)

When to register:
├── After user consent → prompt
├── Page loaded → yes
└── HTTPS required → yes
```

## 2. Caching Strategy Decision Tree

```
When to use Cache First:
├── Static assets → yes
├── Versioned files → yes
├── Offline-ready → yes
└── Always available → yes

When to use Network First:
├── API requests → yes
├── Dynamic content → yes
├── Live data required → yes
└── Always fresh if possible

When to use Stale-While-Revalidate:
├── Balanced → yes
├── Performance + freshness → yes
└── Non-critical → yes

When to use Network Only:
├── Real-time data → yes
├── Authentication → yes
└── Live updates → yes
```

## 3. Offline Strategy Decision Tree

```
When full offline:
├── Core functionality → yes
├── Productivity app → yes
├── Critical path → yes
└── Content-first app → yes

When partial offline:
├── Some features work → yes
├── Read cache, write queue → yes
├── Best experience → yes
└── Not all needed → yes

When online only:
├── Real-time essential → yes
├── No offline needed → yes
└── Ephemeral data → yes
```

## 4. Web Manifest Decision Tree

```
When to use standalone:
├── Native-like app → yes
├── Remove browser UI → yes
└── Full screen → yes

When to use minimal-ui:
├── Some browser UI → yes
├── Navigation needed → yes
└── Trust + URL visible → yes

Icon requirements:
├── 192x192 → yes
├── 512x512 → yes
└── Maskable → yes (all sizes)

When to use theme_color:
├── Branded experience → yes
└── Status bar → match
```

## 5. Install Prompt Decision Tree

```
When to show install:
├── Before engagement → no
├── User engaged → yes
├── Deferred → prompt-event
└── No multiple → track shown

Before prompt:
├── Use app features → yes
├── Create local data → yes
├── Show value → yes
└── User ready → yes
```

## 6. Background Sync Decision Tree

```
When to use background sync:
├── Queue requests offline → yes
├── Important actions → yes
└── User returns online → yes

When to queue:
├── Form submissions → yes
├── Saves → yes
└── Important → yes

When not to queue:
├── Non-essential → skip
├── Real-time verification → skip
└── Session-based → skip
```

## When to Use Decision Summary

1. Service worker for offline + caching + push
2. Cache First for static, Network First for API
3. Web manifest for installable app
4. Show install prompt after engagement
5. Background sync for offline queuing

---

## Anti-Patterns

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
```

---

## Quick Reference

| Capability | API | Required for |
|---|---|---|
| Offline | Cache API + Service Worker | Core PWA |
| Install prompt | beforeinstallprompt | App store feel |
| Push notifications | Push API + Notification API | Re-engagement |
| Background sync | Background Sync API | Offline mutations |
| Periodic sync | Periodic Background Sync | Content refresh |
| Web manifest | manifest.json | Installability |
| App shell | Precache + runtime cache | Fast load |


## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish. You do not need explicit "write in Turkish" instructions.
