---
name: grpc-patterns
description: "gRPC: Protocol Buffers, Service definition, Streaming, Error handling, Microservices communication."
triggers:
  files: [".proto"]
  directories: ["protos/", "grpc/"]
  keywords: ["gRPC", "protobuf", "proto", "grpc", "streaming", "unary"]
auto_load_when: "Building gRPC services or microservices with Protocol Buffers"
agent: architect
tools: ["Read", "Write", "Bash"]
---

# gRPC Architecture Patterns

**Focus:** Protocol Buffers, service design, streaming, error handling

## 1. Protocol Buffers Basics

```
Basic Proto Definition:
syntax = "proto3";

package user;

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc CreateUser (CreateUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  int64 created_at = 4;
}

message GetUserRequest {
  string id = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}

Scalar Types:
├── double, float → Floating point
├── int32, int64 → Signed integers
├── uint32, uint64 → Unsigned integers
├── sint32, sint64 → Signed ints (better for negative)
├── fixed32, fixed64 → Fixed-size ints
├── bool → Boolean
├── string → UTF-8 string
├── bytes → Arbitrary byte sequence

Field Numbers:
├── 1-15 → 1 byte (use for common fields)
├── 16-2047 → 2 bytes
└── Never reuse numbers, never change
```

---

## 2. Service Patterns

```
Unary (Request-Response):
rpc GetUser(GetUserRequest) returns (User);

Server Streaming:
rpc ListUsers(ListUsersRequest) returns (stream User);

Client Streaming:
rpc CreateUsers(stream CreateUserRequest) returns (CreateUsersResponse);

Bidirectional Streaming:
rpc Chat(stream ChatMessage) returns (stream ChatMessage);

Error Handling (Proto):
message Error {
  int32 code = 1;
  string message = 2;
  repeated string details = 3;
}

Best Practices:
├── Use meaningful names
├── Add comments for documentation
├── Keep services focused (single responsibility)
└── Use versioning: user.v1.UserService
```

---

## 3. Server Implementation

```
Node.js gRPC Server:
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('user.proto', {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(proto.user.UserService.service, {
  getUser: (call, callback) => {
    const user = { id: call.request.id, name: 'John' };
    callback(null, user);
  },

  createUser: (call, callback) => {
    const user = { id: '123', ...call.request };
    callback(null, user);
  },

  listUsers: (call) => {
    users.forEach(user => call.write(user));
    call.end();
  }
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
});

Error Handling:
getUser: (call, callback) => {
  const user = await getUserById(call.request.id);

  if (!user) {
    const error = new Error('User not found');
    error.code = grpc.status.NOT_FOUND;
    return callback(error);
  }

  callback(null, user);
}
```

---

## 4. Client Implementation

```
Node.js gRPC Client:
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const proto = grpc.loadPackageDefinition(packageDefinition).user;

const client = new proto.UserService('localhost:50051', grpc.credentials.createInsecure());

// Unary call
client.getUser({ id: '123' }, (error, user) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(user);
});

// Server streaming
const stream = client.listUsers({});
stream.on('data', (user) => console.log(user));
stream.on('end', () => console.log('done'));

// Client streaming
const stream = client.createUsers((error, response) => {
  console.log(response.created_count);
});

stream.write({ name: 'John', email: 'john@test.com' });
stream.write({ name: 'Jane', email: 'jane@test.com' });
stream.end();

// Bidirectional streaming
const stream = client.chat();
stream.on('data', (msg) => console.log('Received:', msg));
stream.write({ message: 'Hello' });

TypeScript with Proto:
import * as grpc from '@grpc/grpc-js';
import { UserServiceClient } from './generated/user_grpc_pb';
import { GetUserRequest, User } from './generated/user_pb';

const client = new UserServiceClient('localhost:50051', grpc.credentials.createInsecure());

const request = new GetUserRequest();
request.setId('123');

client.getUser(request, (err: grpc.ServiceError | null, user: User) => {
  console.log(user.getName());
});
```

---

## 5. Metadata & Authentication

```
Metadata (Headers):
// Server - read metadata
getUser: (call, callback) => {
  const authToken = call.metadata.get('authorization')[0];
  // validate token
  callback(null, user);
}

// Client - send metadata
const metadata = new grpc.Metadata();
metadata.add('authorization', 'Bearer token');
client.getUser(request, metadata, (err, user) => {});

Authentication Interceptor:
// Server interceptor
function authInterceptor(call, callback) {
  const token = call.metadata.get('authorization')[0];
  if (!token) {
    const error = new Error('Unauthorized');
    error.code = grpc.status.UNAUTHENTICATED;
    return callback(error);
  }
  return callback(null);
}

server.addServiceWithInterceptor(
  service,
  grpc.interceptor(authInterceptor)
)

SSL/TLS:
const credentials = grpc.ServerCredentials.createSsl(
  rootCerts,           // CA certificate
  [{ cert: serverCert, key: serverKey }],  // server cert/key pair
  true                 // check client certificates
);

server.bindAsync('0.0.0.0:50051', credentials, () => {});

// Client TLS
const creds = grpc.credentials.createSsl(rootCert);
const client = new Service('host:50051', creds);
```

---

## 6. Deadlines & Cancellation

```
Client Deadline:
const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5);  // 5s timeout

client.getUser(request, { deadline }, (err, user) => {
  if (err.code === grpc.status.DEADLINE_EXCEEDED) {
    console.log('Request timed out');
  }
});

Server Deadline:
getUser: async (call, callback) => {
  const deadline = call.metadata.get('deadline')[0];
  // Check if already exceeded

  try {
    const result = await withTimeout(getUser(call.request), deadline);
    callback(null, result);
  } catch (e) {
    if (e.code === 'ETIMEDOUT') {
      const error = new Error('Timeout');
      error.code = grpc.status.DEADLINE_EXCEEDED;
      callback(error);
    }
  }
}

Cancellation:
// Client
const call = client.getUser(request, (err, user) => {});
call.cancel();

// Server
getUser: (call, callback) => {
  if (call.cancelled) {
    return callback(new Error('Cancelled'));
  }
}
```

---

## 7. Load Balancing

```
Client-side Load Balancing:
const addresses = [
  'localhost:50051',
  'localhost:50052',
  'localhost:50053'
];

const channel = grpc.createChannel(addresses[0], grpc.loadBalancingPolicy.ROUND_ROBIN, {
  'grpc.lb_policy_name': 'round_robin'
});

Proxy/Server-side Load Balancing:
// Use Envoy, nginx, or cloud LB
// gRPC health checking

Health Checking:
syntax = "proto3";

package grpc.health.v1;

service Health {
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
  rpc Watch(HealthCheckRequest) returns (stream HealthCheckResponse);
}

message HealthCheckRequest {
  string service = 1;
}

message HealthCheckResponse {
  enum ServingStatus {
    UNKNOWN = 0;
    SERVING = 1;
    NOT_SERVING = 2;
  }
  ServingStatus status = 1;
}
```

---

## 8. Best Practices

```
Proto Design:
├── Use semantic versioning: user.v1
├── Add field numbers for future
├── Use meaningful comments
└── Keep messages focused

Error Handling:
├── Define error codes as enums
├── Use metadata for error details
├── Implement retry logic on client
└── Use deadlines

Performance:
├── Enable keepalive
├── Use connection pooling
├── Compress messages (gzip)
└── Reuse channel across requests

Security:
├── Always use TLS in production
├── Implement auth interceptor
├── Validate all inputs
└── Rotate certificates regularly

Testing:
├── Use grpcurl for CLI testing
├── Write unit tests for handlers
├── Integration test with in-memory server
└── Contract test with generated code
```

---

## Anti-Patterns

```
❌ No versioning in proto
✅ Use v1, v2 namespace

❌ Large monolithic proto files
✅ Split by service/domain

❌ Using wrong field numbers
✅ 1-15 for common fields, reserve old numbers

❌ No error handling
✅ Implement proper error codes and metadata

❌ No deadline/timeouts
✅ Always set reasonable timeouts

❌ Creating new channel per request
✅ Reuse channel for performance

❌ No TLS in production
✅ Always use secure credentials

❌ Ignoring streaming backpressure
✅ Handle write queue properly
```

---

## Quick Reference

| Pattern | Syntax | Note |
|---|---|---|
| Unary | rpc GetUser(req) returns (res) | Simple request/response |
| Server stream | rpc List(req) returns (stream res) | One request, multiple responses |
| Client stream | rpc Create(stream req) returns (res) | Multiple requests, one response |
| Bidirectional | rpc Chat(stream req) returns (stream res) | Both streaming |
| Error | error.code = grpc.status.NOT_FOUND | Standard error codes |
| Deadline | { deadline: Date } | Request timeout |
| Metadata | call.metadata.get('key') | Headers |
| TLS | grpc.ServerCredentials.createSsl() | Secure connection |

## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish. You do not need explicit "write in Turkish" instructions.
