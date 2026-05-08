---
name: serverless-patterns
description: "Serverless: Lambda, Cloud Functions, Cold starts, Stateless design, Memory management, Cost optimization."
triggers:
  files: ["serverless.yml", "serverless.yaml", "sam-template.yaml"]
  directories: ["functions/", "lambda/", "handlers/"]
  keywords: ["lambda", "serverless", "AWS Lambda", "Cloud Functions", "Azure Functions", "cold start"]
auto_load_when: "Building serverless applications or deploying functions to cloud"
agent: devops-engineer
tools: ["Read", "Write", "Bash"]
---

# Serverless Architecture Patterns

**Focus:** Function design, cold starts, stateless patterns, cost optimization

## 1. Function Design

```
Basic Lambda Handler:
export const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Lambda' })
  }
}

TypeScript Handler:
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello' })
  }
}

Handler Best Practices:
├── Keep handler thin, delegate to services
├── Don't use context.callback (use async/await)
├── Return proper status codes and headers
└── Set requestId in response for tracing

Cold Start Causes:
├── Package size (large deps = slow)
├── Language runtime (Java, C# slower than Node, Python)
├── VPC if running in private subnet
├── Database connection at init
└── Initialization code outside handler

Warm Handler Pattern:
let db: Database | undefined

async function getDb() {
  if (!db) {
    db = await connectToDatabase()
  }
  return db
}

export const handler = async (event) => {
  const database = await getDb() // Reuse connection
}
```

---

## 2. Configuration & Environment

```
Environment Variables:
environment:
  LOG_LEVEL: info
  DB_HOST: ${self:custom.dbHost}

Secrets (AWS Secrets Manager):
environment:
  DB_PASSWORD: ${secrets:MyDbSecret}

Stages:
provider:
  stage: ${opt:stage, 'dev'}
  environment:
    STAGE: ${self:provider.stage}

config:
  dev:
    stage: dev
  prod:
    stage: prod

serverless.yml:
service: my-app
provider:
  name: aws
  runtime: nodejs20.x
  stage: dev
  region: us-east-1
  memorySize: 256
  timeout: 30
  environment:
    TABLE_NAME: ${self:custom.tableName}
  reservedConcurrency: 10

functions:
  getUser:
    handler: src/handlers/getUser.handler
    events:
      - http:
          path: users/{id}
          method: get
    environment:
      DB_TABLE: users
```

---

## 3. API Gateway Integration

```
Lambda Authorizer (JWT):
export const handler = async (event) => {
  const token = event.authorizationToken

  try {
    const user = await verifyJWT(token)
    return {
      statusCode: 200,
      body: JSON.stringify(user)
    }
  } catch {
    return {
      statusCode: 401,
      body: 'Unauthorized'
    }
  }
}

# serverless.yml
authorizer:
  name: jwtAuthorizer
  type: request
  function: src/auth/authorizer.handler
  identitySource: method.request.header.Authorization

API Gateway Patterns:
Lambda Integration:
- Full control over request/response
- Complex transformations
- Custom headers

Lambda Proxy Integration (default):
- event contains: headers, body, pathParams, queryStringParameters
- Return: statusCode, body, headers

Non-Proxy Integration:
- event contains: body, params, header
- Return: { statusCode, headers, body }
```

---

## 4. Async & Event Patterns

```
SQS Queue Trigger:
functions:
  processOrder:
    handler: src/handlers/processOrder.handler
    events:
      - sqs:
          arn: !GetAtt ordersQueue.Arn
          batchSize: 10

export const handler = async (event) => {
  for (const record of event.Records) {
    const order = JSON.parse(record.body)
    await processOrder(order)
  }
}

S3 Trigger:
functions:
  imageProcessor:
    handler: src/handlers/imageProcessor.handler
    events:
      - s3:
          bucket: images-bucket
          event: s3:ObjectCreated:*
          rules:
            - prefix: uploads/
            - suffix: .jpg

SNS Trigger:
functions:
  sendNotification:
    handler: src/handlers/notify.handler
    events:
      - sns: NewOrderTopic

EventBridge Pattern:
functions:
  orderHandler:
    handler: src/handlers/order.handler
    events:
      - eventBridge:
          event: order.created
```

---

## 5. Stateless Design

```
Shared State (Redis/DB):
// Don't use global variables
// Store state in external services

// ❌ Bad
let cache = {}
export const handler = async (event) => {
  cache[event.id] = event.data
}

// ✅ Good - use Redis
export const handler = async (event) => {
  await redis.set(event.id, JSON.stringify(event.data))
}

Connection Pooling:
// Create connections outside handler
let pool

async function getPool() {
  if (!pool) {
    pool = new Pool({ ... })
  }
  return pool
}

export const handler = async (event) => {
  const client = await getPool().connect()
  // Use client
  client.release()
}

External Configuration:
// Fetch config at runtime
export const handler = async (event) => {
  const config = await fetchConfigFromSSM('/myapp/config')
  // Use config
}

// Cache config with TTL
const configCache = { value: null, expires: 0 }

async function getConfig() {
  if (configCache.value && Date.now() < configCache.expires) {
    return configCache.value
  }
  configCache.value = await fetchConfig()
  configCache.expires = Date.now() + 60000
  return configCache.value
}
```

---

## 6. Performance & Cost

```
Memory vs Performance:
├── Higher memory = more CPU = faster execution
├── Test optimal memory for each function
├── Use AWS Lambda Power Tuning tool
└── Trade-off: Higher memory costs more per ms

Cold Start Optimization:
├── Minimize bundle size
├── Lazy load heavy dependencies
├── Use layers for common code
├── Avoid VPC if not needed
├── Use provisioned concurrency for latency-sensitive

Provisioned Concurrency:
functions:
  api:
    handler: src/handlers/api.handler
    provisionedConcurrency: 5
    reservedConcurrency: 10

Cost Optimization:
├── Use right memory size
├── Set appropriate timeout
├── Use reserved concurrency
├── Minimize execution time
└── Use ARM architecture (Graviton2, 20% cheaper)

Cost Calculation:
Cost = (Requests × $0.0000002) + (Duration × $0.0000166667 × Memory/1024)

Example:
100,000 requests, 100ms avg, 256MB
= (100000 × 0.0000002) + (100000 × 0.1 × 0.0000167 × 0.25)
= $0.02 + $0.04 = $0.06/month
```

---

## 7. Error Handling & Retry

```
Function Error Handling:
export const handler = async (event) => {
  try {
    const result = await processEvent(event)
    return { success: true, data: result }
  } catch (error) {
    console.error('Error:', error)
    // Don't expose internal errors
    return { success: false, error: 'Internal error' }
  }
}

Retry Configuration (SQS):
functions:
  processOrder:
    handler: src/handlers/processOrder.handler
    events:
      - sqs:
          arn: !GetAtt queue.Arn
          batchSize: 10
          maxRecordAge: 604800
          retryAttempts: 3
          bisectBatchOnFunctionError: true

DLQ Pattern:
functions:
  processOrder:
    handler: src/handlers/processOrder.handler
    events:
      - sqs:
          arn: !GetAtt queue.Arn
          destinationConfig:
            onFailure:
              arn: !GetAtt deadLetterQueue.Arn
              type: sqs

Circuit Breaker:
async function withCircuitBreaker(fn, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === attempts - 1) throw error
      await sleep(Math.pow(2, i) * 1000)
    }
  }
}
```

---

## 8. Testing Serverless

```
Local Testing:
serverless offline start

Unit Testing:
import { handler } from '../handler'

test('should return 200', async () => {
  const event = { body: JSON.stringify({ name: 'test' }) }
  const result = await handler(event)

  expect(result.statusCode).toBe(200)
  expect(JSON.parse(result.body).message).toBe('Hello test')
})

Mocking AWS Services:
jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => ({
      get: () => ({ promise: () => Promise.resolve({ Item: { id: '1' } }) }),
      put: () => ({ promise: () => Promise.resolve({}) })
    }))
  }
}))

Integration Testing:
├── Use serverless-offline for local testing
├── Use test stacks in CI/CD
├── Test against real services in staging
└── Use localstack for mock AWS services

Best Practices:
├── Test each handler in isolation
├── Mock external services
├── Test error paths
├── Test async triggers with proper events
└── Include cold start in performance tests
```

---

## Key Patterns

1. **Keep functions small** — Single responsibility
2. **Stateless design** — Store state externally
3. **Lazy initialization** — Initialize outside handler
4. **Error handling** — Return proper errors, use DLQ
5. **Provisioned concurrency** — For latency-sensitive
6. **Monitor cold starts** — Track and optimize

---

## Anti-Patterns

```
❌ Using global variables for state
✅ Use external storage (Redis, DynamoDB)

❌ Heavy initialization in handler
✅ Initialize outside handler (module level)

❌ No error handling
✅ Try-catch, return proper errors

❌ Synchronous calls to external services
✅ Use async/await, handle timeouts

❌ No retries for async events
✅ Configure DLQ for failed events

❌ Over-provisioned memory
✅ Test optimal memory for each function

❌ No monitoring
✅ Add custom metrics, log error rates

❌ Tight coupling to cloud SDK
✅ Abstract to interface for testability
```

---

## Quick Reference

| Concern | Pattern | Implementation |
|---|---|---|
| Handler | async/await | Always return Promise |
| State | External storage | Redis, DynamoDB |
| Init | Lazy load | Initialize outside handler |
| Cold start | Minimize bundle | Use layers, lazy deps |
| Memory | Test optimal | Start 256MB, adjust |
| Concurrency | Rate limit | reservedConcurrency |
| Retry | DLQ | On failure destination |
| Cost | ARM | Use arm64 architecture |

## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish. You do not need explicit "write in Turkish" instructions.
