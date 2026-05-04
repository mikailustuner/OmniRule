---
name: azure-patterns
description: "Azure Patterns: Functions, Container Apps, Cosmos DB, Azure SQL, AKS, serverless." 
triggers:
  extensions: [".py", ".ts", ".yaml"]
  directories: ["azure/", "infrastructure/"]
  keywords: ["azure", "functions", "container apps", "cosmos db", "azure sql", "aks", "app service", "bicep", "arm"]
auto_load_when: "Building on Microsoft Azure or designing enterprise architectures"
agent: cloud-architect
tools: ["Read", "Write", "Bash"]
---

# Azure Architecture Patterns

**Focus:** Enterprise integration, hybrid cloud, managed services

## 1. Compute Selection

```
When to use what:
├── Azure Functions
│   ├── Event-driven, HTTP, timers
│   ├── Premium: VNET, longer running
│   └── Consumption: pay per execution
│
├── Container Apps
│   ├── Microservices, event-driven
│   ├── KEDA-based autoscaling
│   └── Dapr integration for state
│
├── App Service
│   ├── Web apps (ASP.NET, Node, Python)
│   ├── PaaS for web apps
│   └── Managed, easy to use
│
├── AKS (Kubernetes)
│   ├── Full Kubernetes
│   ├── Enterprise features
│   └── Windows containers support
│
└── Azure VMs
│   ├── Legacy lift-and-shift
│   └── Specific requirements
```

---

## 2. Data Layer Patterns

```
Database selection:
├── Cosmos DB
│   ├── Global distributed NoSQL
│   ├── Multiple APIs (SQL, MongoDB, Cassandra, Gremlin)
│   ├── Multi-master, any region write
│   └── Serverless option
│
├── Azure SQL
│   ├── Managed SQL Server
│   ├── Intelligent database (auto-tuning)
│   └── Hyperscale for large DBs
│
├── PostgreSQL / MySQL
│   ├── Flexible Server (managed)
│   └── Serverless option
│
├── Azure Cache for Redis
│   ├── Caching, session store
│   └── Redis Enterprise for clustering
│
└── Blob Storage
    ├── Object storage
    ├── Hot/Cool/Archive tiers
    └── Azure Data Lake integration
```

---

## 3. Integration Patterns

```
Azure Integration Services:
├── Service Bus
│   ├── Enterprise messaging
│   ├── Topics for pub/sub
│   └── Reliable delivery
│
├── Logic Apps
│   ├── No-code workflow automation
│   ├── 400+ connectors
│   └── Visual workflow designer
│
├── API Management
│   ├── API gateway, developer portal
│   ├── Rate limiting, caching
│   └── Mock APIs for development
│
├── Event Grid
│   ├── Event routing
│   └── Push-based, near real-time
│
└── Functions + Service Bus
    └── Durable execution patterns
```

---

## 4. Enterprise Features

```
Azure Enterprise Patterns:
├── Identity
│   ├── Microsoft Entra ID (formerly AAD)
│   ├── SSO, MFA, Conditional Access
│   └── RBAC, managed identities
│
├── Hybrid Cloud
│   ├── Azure Arc (hybrid management)
│   ├── Azure Stack (on-prem Azure)
│   └── ExpressRoute (private connection)
│
├── Governance
│   ├── Azure Policy
│   ├── Management groups
│   └── Blueprints for compliance
│
└── Monitoring
│   ├── Application Insights
│   ├── Log Analytics
    └── Azure Monitor
```

---

## 5. Infrastructure as Code

```
IaC in Azure:
├── ARM Templates
│   ├── JSON-based, verbose
│   └── Native Azure
│
├── Bicep (recommended)
│   ├── Simplified, transpiles to ARM
│   └── Better syntax, modular
│
├── Terraform
    ├── Multi-cloud, popular
    └── Official Azure provider
│
└── Ansible
    ├── Configuration management
    └── Azure modules available
```

---

## Key Patterns

1. **Enterprise integration** - Best for Microsoft ecosystem
2. **Cosmos DB for global** - Multi-region, any API
3. **Logic Apps** - No-code for integrations
4. **Entra ID** - Identity and access management
5. **Bicep** - Simplified IaC (or Terraform)

---

## Anti-Patterns

```
❌ Using VMs for new workloads
✅ App Service / Container Apps / Functions

❌ Single region for production
✅ Multi-region with Traffic Manager

❌ Not using managed identities
✅ System/user assigned MI for RBAC

❌ No Azure Policy enforcement
✅ Governance from day one

❌ Ignoring Azure Cost Management
✅ Budget alerts, cost analysis
```

---

## Quick Reference

| Service | Use Case | Key Feature |
|---|---|---|
| Functions | Serverless | Event-driven |
| Container Apps | Microservices | KEDA scaling |
| App Service | Web apps | Managed |
| Cosmos DB | Global NoSQL | Multi-API |
| Azure SQL | Managed SQL | Intelligent |
| Service Bus | Messaging | Enterprise |
| AKS | Kubernetes | Enterprise |
| Blob Storage | Object storage | Tiers |