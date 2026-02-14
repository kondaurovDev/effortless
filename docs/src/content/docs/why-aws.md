---
title: Why AWS?
description: The AWS services Effortless uses, their availability guarantees, and what you get out of the box.
---

Effortless deploys your code onto fully managed AWS services. You write the handler logic — AWS handles availability, scaling, patching, and redundancy. This page covers which services are used, why they were chosen, and what guarantees they provide.

## Services

### Lambda

[AWS Lambda](https://aws.amazon.com/lambda/) runs your handler code. Each invocation gets an isolated execution environment — no servers, no containers to manage.

- Runs across multiple availability zones automatically
- Scales from zero to thousands of concurrent executions
- Cold starts on Node.js are typically 100–200ms, warm invocations respond in single-digit milliseconds
- First 1 million requests per month free, then $0.20 per million

### API Gateway HTTP API

[API Gateway HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html) handles HTTP routing, TLS, and throttling for `defineHttp` and `defineApp` handlers.

- Regional service, multi-AZ — no single point of failure
- Scales to thousands of requests per second with zero configuration
- Built-in rate limiting
- First 1 million requests per month free, then $1 per million

### DynamoDB

[DynamoDB](https://aws.amazon.com/dynamodb/) stores your data. Every table created by `defineTable` runs in on-demand mode with automatic scaling.

- Data replicated across three availability zones
- Single-digit millisecond latency at any scale
- 99.999% availability SLA
- No connection pools, no vacuuming, no version upgrades
- On-demand mode: 25 GB storage and enough throughput for most projects is free
- **DynamoDB Streams** turn every write into a real-time event — your `onRecord` handler runs automatically

### SQS FIFO

[SQS FIFO queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html) power `defineFifoQueue` handlers — fully managed message queues with exactly-once processing and strict ordering.

- Guaranteed message delivery with configurable retention
- No servers to manage, no Kafka clusters to tune
- ~$0.50 per million requests, first million free each month

### CloudFront + S3

[CloudFront](https://aws.amazon.com/cloudfront/) is a global CDN used by `defineStaticSite` to serve static sites from the edge.

- 450+ edge locations globally, sub-50ms latency for most users
- First 1 TB of data transfer per month free
- S3 bucket is private — accessed only through CloudFront Origin Access Control

### SSM Parameter Store

[SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) stores secrets and configuration referenced via `param()`.

- Regional, replicated across AZs
- `SecureString` parameters encrypted with KMS
- Values fetched once per Lambda cold start and cached

## Availability zones

AWS runs each region across multiple isolated data centers called availability zones (AZs). The services Effortless uses are designed around this:

- **Lambda** distributes invocations across AZs — if one AZ fails, traffic shifts automatically
- **DynamoDB** replicates data across three AZs — an entire data center can go down without data loss
- **API Gateway** runs across multiple AZs within the region
- **SQS** stores messages redundantly across multiple AZs

You don't configure any of this. It works out of the box.

## What Effortless handles for you

Beyond creating AWS resources, Effortless auto-wires all the connective tissue that you'd normally configure manually:

- **IAM roles and policies** — every Lambda gets its own role with least-privilege permissions
- **CloudWatch Logs** — attached to every handler automatically
- **DynamoDB access** — table handlers get full access to their own table; `deps: { orders }` grants access to dependent tables
- **SSM access** — `params: { key: param("...") }` grants `ssm:GetParameter` and `ssm:GetParameters`
- **SQS access** — queue handlers get permissions to receive and delete messages
- **Platform table** — observability logging permissions when `observe` is enabled (default)
- **API Gateway → Lambda** — resource-based policy allowing API Gateway to invoke your function
- **Event source mappings** — DynamoDB Streams → Lambda and SQS → Lambda wiring with partial batch failure reporting

## What you're responsible for

- **Handler code** — business logic, error handling, input validation
- **SSM parameters** — creating the actual secrets in Parameter Store before deploying handlers that reference them
- **DynamoDB schema design** — choosing partition keys and access patterns for your data
- **Extra AWS permissions** — only if your handler calls AWS services directly (S3, SNS, SES, etc.), via the optional `permissions` property on handler config

## Why not other platforms?

### Complete infrastructure SDK

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

### Fast deployment (no container builds)

| Provider | Deployment Model | Deploy Time |
|----------|------------------|-------------|
| AWS Lambda | ZIP upload | 3-5 seconds |
| GCP Cloud Functions (2nd gen) | Container build | 1-3 minutes |
| Vercel Functions | ZIP upload | 5-15 seconds |
| Cloudflare Workers | JS bundle | 1-3 seconds |

GCP Cloud Functions 2nd gen uses Cloud Run under the hood, which requires building a Docker image via Buildpacks. Every deploy triggers a full container build.

AWS Lambda uses Firecracker microVMs with pre-built runtimes. Upload a ZIP, Lambda runs immediately.

### Cost (almost free)

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

### Mature ecosystem

- 17+ years of production use
- Battle-tested at massive scale
- Extensive documentation
- Large community and talent pool
- Predictable behavior (no breaking changes)

### Trade-offs

**Cloudflare Workers** is faster for edge compute (0ms cold start) but limited to JS/WASM and has no integrated backend services.

**Vercel** is better for frontend-focused projects with simpler deployment, but you'll need external services for anything beyond functions.

**GCP** is competitive but the 2nd gen Cloud Functions container build time kills developer velocity.

For detailed comparisons with specific frameworks (SST, Nitric, Serverless, etc.), see [Comparisons](/comparisons/).
