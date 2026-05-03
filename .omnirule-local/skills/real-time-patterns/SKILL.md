---
name: real-time-patterns
description: "Real-time: WebSockets, SSE, polling, rooms, presence, reconnection"
---

# Real-Time Patterns

**Focus:** Choosing real-time strategy, implementation patterns, scaling

## 1. Protocol Decision Tree

```
Use WebSockets when:
├── Bidirectional communication needed
├── Low-latency updates (chat, games)
├── High frequency messages
└── State synchronization

Use SSE when:
├── Server-to-client only
├── Simple one-way updates
├── Works with HTTP/2
└── Firewall-friendly

Use Polling when:
├── Infrequent updates
├── Simple implementation
├── No server state needed
└── Budget constraints
```

---

## 2. WebSocket Patterns

```
Connection lifecycle:
├── Handshake: HTTP upgrade
├── Connected: persistent
├── Ping/Pong: keep-alive
└── Close: graceful or error

Message patterns:
├── Text: JSON payloads
├── Binary: protocol buffers
└── Control frames: ping, pong, close

Scaling:
├── Sticky sessions or Redis pub/sub
├── Message brokers (Redis, Kafka)
└── Horizontal scaling
```

---

## 3. Room/Channel Patterns

```
Room structure:
├── userId + roomId: private chat
├── roomId only: group channel
└── projectId: collaborative doc

Implementation:
├── Map roomId to subscriber set
├── Pub/sub to room channels
└── Add/remove on join/leave

State management:
├── In-memory: fast, single instance
├── Redis: distributed, persistent
└── Database: slow, last resort
```

---

## 4. Presence Patterns

```
Presence tracking:
├── Online/offline status
├── Last seen timestamp
├── Currently viewing (optional)

Implementation:
├── Heartbeat: every 30-60s
├── Expire: 2-3x heartbeat
└── Broadcast on join/leave

Use cases:
├── Show "user is typing"
├── Online indicators
└── Active user list
```

---

## 5. Reconnection Patterns

```
Reconnection strategy:
├── Exponential backoff: 1s, 2s, 4s, 8s, 32s max
├── Max retries: 5-10 then give up
└── User notification after max

State recovery:
├── Replay missed messages (with cursor)
├── Full state refetch
└── Optimistic UI, reconcile

Edge cases:
├── Network switch (wifi/cellular)
├── Sleep/wake
└── Tab backgrounding
```

---

## 6. Message Delivery Patterns

```
Delivery guarantees:
├── At-most-once: fire and forget
├── At-least-once: ack + retry
└── Exactly-once: complex, rarely needed

Implementation:
├── Sequence numbers
├── Client ack
└── Server retry until ack

Offline queue:
├── Queue locally while disconnected
├── Sync on reconnect
└── Handle conflicts
```

---

## Key Patterns

1. **WebSockets for bidirectional** - Games, chat
2. **SSE for server push** - Notifications, feeds
3. **Polling for simplicity** - Low frequency
4. **Heartbeat for presence** - 30-60s intervals
5. **Exponential backoff** - Reconnection
6. **Message acks** - Reliability over UDP