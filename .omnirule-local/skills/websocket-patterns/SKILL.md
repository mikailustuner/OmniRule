---
name: websocket-patterns
description: "WebSockets: Connection management, reconnection, rooms, and real-time communication."
---

# WebSocket Patterns

**Focus:** Real-time bidirectional communication

---

## 1. Connection Lifecycle

```
Connection states:

├── Connecting
│   └── Handshake in progress
│   └── After: HTTP upgrade request
│   └── Timeout: 10-30 seconds
│
├── Connected
│   └── Full-duplex channel open
│   └── Keep-alive: ping/pong every 30s
│   └── Bi-directional messaging
│
├── Closing
│   └── Graceful shutdown initiated
│   └── Code 1000 (normal) or error codes
│   └── Clean-up: release resources
│
└── Disconnected
    └── Connection lost
    └── Trigger reconnection
```

---

## 2. Reconnection Strategy

```
When reconnect:

├── Immediate retry
    └── First attempt after disconnect
    └── 0-1 second delay
│
├── Exponential backoff
    └── Delay: 1s, 2s, 4s, 8s, 30s (max)
    └── Jitter: random +/- 1 second
    └── Reset on successful connection
│
├── Max retries
    └── After 5-10 failures, stop
    └── Notify user: "connection lost"
    └── Offer manual reconnect button
│
└── Always include
    └── Random jitter (prevent thundering herd)
    └── Backoff on server errors
    └── Immediate retry on network change
```

---

## 3. Rooms and Channels

```
When to use rooms:

├── User-specific
│   └── Private messages
│   └── Per-user notification stream
│   └── Join room: user:{userId}
│
├── Group-based
│   └── Team chat, group conversations
│   └── Join room: team:{teamId}
│   └── Broadcast to group
│
├── Broadcast
│   └── All connected clients
│   └── Announcements, system updates
│   └── No room needed, send to all
│
└── Topic-based (pub/sub)
    └── Multiple interests per user
    └── Subscribe: notifications, updates, alerts
    └── Pattern: MQTT-style routing
```

---

## 4. Message Patterns

```
Message types:

├── Client → Server
│   ├── ACTION: user performed action
│   ├── SUBSCRIBE: join room/channel
│   ├── UNSUBSCRIBE: leave room/channel
│   └── PING: keep-alive (optional)
│
└── Server → Client
    ├── EVENT: real-time update
    ├── BROADCAST: room-wide message
    ├── ACK: confirm message received
    └── PONG: keep-alive response
```

```
Protocol design:
├── Include message type/enum
├── Include payload (JSON)
├── Include timestamp (server-side)
├── Include correlation ID (request/response)
└── Include message ID (for ACKs)
```

---

## 5. Scaling Considerations

```
Single server (start here):
├── In-memory connection storage
├── Works for < 10k concurrent connections
└── Simple, no external dependencies

Redis pub/sub (horizontal scaling):
├── Store connections in Redis
├── Route messages through Redis
├── Can scale to millions
├── Add: Redis adapter for Socket.io
└── Trade-off: latency increase

WebSocket gateway (production):
├── Dedicated WS servers
├── Route via load balancer
├── Sticky sessions required
└── Shared state via Redis
```

---

## Key Patterns

1. **Heartbeat** — Detect dead connections early
2. **Auto-reconnect** — Seamless recovery
3. **Graceful degradation** — Fallback to polling if needed
4. **Message queue** — Buffer during disconnect
5. **Rate limiting** — Prevent flooding