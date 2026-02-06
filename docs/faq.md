# FAQ

## Why AWS?

We chose AWS Lambda over alternatives (Vercel, GCP Cloud Functions, Cloudflare Workers) for several reasons:

### 1. Complete Infrastructure SDK

AWS provides SDK access to **all** resources, not just compute:

```typescript
// Create any resource programmatically
const sqs = new SQSClient({});
const dynamodb = new DynamoDBClient({});
const eventbridge = new EventBridgeClient({});

// Full control over: queues, tables, schedules, API gateways, IAM, S3...
```

**Vercel/Cloudflare**: Functions only. Need external services for queues, databases, scheduling.

**GCP**: SDK exists but ecosystem is fragmented (Cloud Run, Cloud Functions, App Engine).

**AWS**: One SDK, one account, all resources. Build complete backends without third-party services.

### 2. Fast Deployment (No Container Builds)

| Provider | Deployment Model | Deploy Time |
|----------|------------------|-------------|
| AWS Lambda | ZIP upload | 3-5 seconds |
| GCP Cloud Functions (2nd gen) | Container build | 1-3 minutes |
| Vercel Functions | ZIP upload | 5-15 seconds |
| Cloudflare Workers | JS bundle | 1-3 seconds |

GCP Cloud Functions 2nd gen uses Cloud Run under the hood, which requires building a Docker image via Buildpacks. Every deploy triggers a full container build.

AWS Lambda uses Firecracker microVMs with pre-built runtimes. We upload ZIP, Lambda runs immediately.

### 3. Cost (Almost Free)

**AWS Lambda Free Tier (permanent, not just trial):**
- 1M requests/month free
- 400,000 GB-seconds/month free
- ~$0.20 per additional 1M requests

**For a typical side project:**
- DynamoDB: 25GB storage + 25 WCU/RCU free
- API Gateway: 1M requests free (first 12 months)
- SQS: 1M requests/month free
- EventBridge: First 14M events free

**Real cost for small-medium apps: $0-5/month**

**Vercel**: Free tier limited (100GB bandwidth, 100K function invocations). Pro starts at $20/month.

**GCP**: Similar free tier but Cloud Functions 2nd gen has minimum instance charges.

### 4. Mature Ecosystem

- 17+ years of production use
- Battle-tested at massive scale
- Extensive documentation
- Large community and talent pool
- Predictable behavior (no breaking changes)

### Trade-offs

**Cloudflare Workers** is faster for edge compute (0ms cold start) but limited to JS/WASM and has no integrated backend services.

**Vercel** is better for frontend-focused projects with simpler deployment, but you'll need external services for anything beyond functions.

**GCP** is competitive but the 2nd gen Cloud Functions container build time kills developer velocity.

**Our choice**: AWS gives us the complete toolkit to build entire backends from TypeScript exports, with the fastest iteration cycle and lowest cost.

---

## Why Not CloudFormation?

### The Problem with Abstraction Layers

Most AWS deployment tools follow this pattern:

```
Your Code → YAML/JSON Config → CloudFormation → AWS API
```

Each layer adds:
- **Latency**: CloudFormation stack operations take minutes, even for simple changes
- **Complexity**: Debugging requires understanding multiple abstraction levels
- **State drift**: Template state can diverge from actual AWS state
- **Vendor lock-in**: Your infrastructure is tied to CloudFormation's model

### Our Approach: Direct AWS SDK Calls

```
Your Code → AWS SDK → AWS API
```

**No intermediary.** We call the same APIs that CloudFormation calls, but directly.

### Speed Comparison

| Operation | CloudFormation | Effortless |
|-----------|----------------|------------|
| Create Lambda | 60-120s | 5-10s |
| Update Lambda code | 30-60s | 3-5s |
| Create API Gateway | 60-90s | 2-3s |
| Full redeploy | 5-10 min | 30-60s |

CloudFormation is slow because:
1. It validates the entire stack template
2. It creates a change set
3. It executes changes sequentially with rollback capability
4. It waits for each resource to stabilize

We're fast because:
1. We make direct API calls
2. We parallelize independent operations
3. We use `ensure*` pattern - check existence, create or update

### Imperative vs Declarative

**CloudFormation (declarative):**
> "Here's my desired state. Figure out how to get there."

**Effortless (imperative):**
> "Check if this exists. If not, create it. If yes, update it."

Declarative sounds elegant, but requires:
- Complex diffing algorithms
- State tracking and reconciliation
- Rollback mechanisms
- Dependency graph resolution

Our imperative approach is:
- Predictable - you know exactly what will happen
- Debuggable - each API call is visible
- Fast - no diff calculation, no rollback overhead
- Simple - ~50 lines per resource type vs thousands in CDK constructs

### Tags as State (Not Files)

**Traditional tools** store state in:
- Local files (Terraform `tfstate`)
- S3 buckets (Terraform remote backend)
- DynamoDB (CDK)
- CloudFormation stacks

**Problems:**
- State can drift from reality
- Team coordination requires locking
- Lost state = orphaned resources or duplicates
- Another thing to manage and back up

**Our approach:** AWS tags ARE the state.

```
effortless:project = my-app
effortless:stage = dev
effortless:handler = orders
effortless:type = lambda
```

**Benefits:**
- AWS is always the source of truth
- No sync issues - query AWS, get current state
- Works in teams without locking
- State survives across machines, CI environments
- Resource Groups Tagging API: one call to find all resources

**Trade-off:** Resource Groups Tagging API has indexing delay (~1-2 minutes). For new resources, we use direct API responses. Tags are for discovery of existing resources.

---

## Why Not Terraform/Pulumi?

They're excellent tools, but:

1. **Separate language/DSL** - HCL, YAML, or their SDK
2. **State management overhead** - backends, locking, imports
3. **General purpose** - designed for any cloud, any resource
4. **Learning curve** - significant investment to master

Effortless is:
1. **TypeScript only** - one language for infra and code
2. **Stateless** - tags + API queries
3. **Focused** - Lambda ecosystem only, but done well
4. **Zero config** - export a function, get infrastructure

---

## Why Not SST/Serverless Framework?

They build on CloudFormation:

```
SST → CDK → CloudFormation → AWS
Serverless Framework → CloudFormation → AWS
```

They inherit CloudFormation's:
- Slow deployments
- Stack limits (500 resources)
- Complex error messages
- Rollback behavior

We bypass all of this.

---

## Summary

| Aspect | CloudFormation/CDK | Effortless |
|--------|-------------------|------------|
| Speed | Minutes | Seconds |
| State | Stacks/Files | AWS Tags |
| Abstraction | High | Minimal |
| Scope | Everything | Lambda ecosystem |
| Config | YAML/TypeScript | TypeScript exports |
| Debugging | Stack events | API calls |
| Rollback | Automatic | Manual |
| Learning curve | Steep | Flat |

**Philosophy:** Direct is better than indirect. Fast is better than safe-but-slow. Simple is better than complete.
