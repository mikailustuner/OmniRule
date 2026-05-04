---
name: aws-patterns
description: "AWS Patterns: Lambda, ECS/EKS, DynamoDB, S3, RDS, CloudWatch, serverless architecture." 
triggers:
  extensions: [".py", ".ts", ".yaml"]
  directories: ["aws/", "infrastructure/"]
  keywords: ["aws", "lambda", "dynamodb", "s3", "ecs", "eks", "cloudformation", "terraform", "sam", "cdk", "serverless"]
auto_load_when: "Building on AWS or designing cloud-native architectures"
agent: cloud-architect
tools: ["Read", "Write", "Bash"]
---

# AWS Architecture Patterns

**Focus:** Serverless, containers, managed services, cost optimization

## 1. Compute Selection

```
When to use what:
├── Serverless (Lambda)
│   ├── Event-driven, intermittent workloads
│   ├── < 15 min execution, < 10GB memory
│   └── Low traffic (pay per invocation)
│
├── Containers (ECS/Fargate)
│   ├── Long-running services
│   ├── Need full control over runtime
│   └── Batch jobs, APIs, workers
│
├── Kubernetes (EKS)
│   ├── Multi-service architecture
│   ├── Need Kubernetes ecosystem
│   └── Complex orchestration needs
│
└── EC2
│   ├── Legacy workloads
│   ├── Specific hardware needs (GPU)
│   └── Full control required
```

---

## 2. Data Layer Patterns

```
Database selection:
├── DynamoDB (NoSQL)
│   ├── Massive scale, low latency
│   ├── Pay per request (good for variable load)
│   └── Single-table design for efficiency
│
├── Aurora (SQL)
│   ├── PostgreSQL/MySQL compatible
│   ├── Serverless option (pay per ACU)
│   └── Global tables for multi-region
│
├── RDS (SQL)
│   ├── Standard PostgreSQL/MySQL
│   ├── Less demanding than Aurora
│   └── Good for migrate-from-legacy
│
├── ElastiCache
│   ├── Redis for caching, sessions
│   └── Memcached for simple caching
│
└── S3 (Object storage)
    ├── Any file/blob storage
    ├── Lambda trigger on object create
    └── Data lake with Athena
```

---

## 3. Event-Driven Architecture

```
AWS Event Patterns:
├── Lambda + S3
│   ├── Image processing, ETL triggers
│   └── Object created → Lambda invoked
│
├── Lambda + DynamoDB Streams
│   ├── Real-time changes captured
│   └── Audit logs, sync to other systems
│
├── EventBridge
│   ├── Decoupled microservices
│   ├── Schedule-based (cron)
│   └── Cross-account events
│
├── SQS + Lambda
│   ├── Durable queue for async work
│   └── Lambda polls queue (or SQS trigger)
│
└── SNS + Lambda
    ├── Pub/sub for notifications
    └── Fan-out to multiple targets
```

---

## 4. Infrastructure as Code

```
IaC Tool Selection:
├── CloudFormation
│   ├── Native AWS, full coverage
│   └── JSON/YAML, template inheritance
│
├── CDK (Cloud Development Kit)
│   ├── Code in TypeScript/Python
│   └── Generates CloudFormation
│   └── Best of both worlds
│
├── Serverless Application Model (SAM)
│   ├── Simplified for serverless
│   └── Local testing with sam local
│
└── Terraform
    ├── Multi-cloud (AWS + others)
    └── State management needed
```

---

## 5. Cost Optimization

```
AWS Cost Patterns:
├── Compute
│   ├── Lambda: Pay per invocation
│   ├── Fargate: Pay per vCPU/GB-hour
│   ├── Reserved Instances: 1-3 year for stable
│   └── Spot: Batch jobs, stateless workers (70%+ off)
│
├── Storage
│   ├── S3 Intelligent-Tiering (auto-move)
│   ├── Glacier for archives
│   └── Lifecycle policies
│
├── Database
│   ├── Aurora Serverless for variable
│   └── Provisioned for steady state
│
└── Networking
    ├── CloudFront for static assets
    └── PrivateLink for VPC-to-VPC
```

---

## Key Patterns

1. **Serverless-first** - Start with Lambda, add complexity only if needed
2. **Single table DynamoDB** - Design for access patterns upfront
3. **Event-driven** - Decouple services with EventBridge/SNS/SQS
4. **Infrastructure as code** - Never click in console for prod
5. **Cost-aware** - Use Spot, Savings Plans, S3 Intelligent-Tiering

---

## Anti-Patterns

```
❌ Using EC2 for everything — overprovisioned, underutilized
✅ Start with Lambda, move to containers only if needed

❌ No caching — hitting database for every request
✅ ElastiCache (Redis) for session/cache, CloudFront for static

❌ No dead letter queue — failed messages lost
✅ Configure DLQ on SQS/Lambda failures

❌ Single-AZ deployment — one AZ outage = downtime
✅ Multi-AZ for all production workloads

❌ No cost monitoring — surprised by bill at end of month
✅ Budget alerts, cost explorer, rightsizing recommendations
```

---

## Quick Reference

| Service | Use Case | Key Feature |
|---|---|---|
| Lambda | Serverless functions | Pay per invocation |
| DynamoDB | NoSQL, massive scale | Single-digit ms |
| S3 | Object storage | Intelligent-Tiering |
| RDS/Aurora | Relational | Managed backups |
| ElastiCache | Caching | Redis/Memcached |
| CloudFront | CDN | Global edge |
| EventBridge | Event bus | Decoupling |
| API Gateway | REST APIs | Rate limiting |