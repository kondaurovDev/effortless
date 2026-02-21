# Lambda Versioning in AWS

## How it works

- **$LATEST** — mutable pointer. Every `updateFunctionCode` overwrites it. This is what effortless uses for all standard handlers.
- **Published version** (`publishVersion`) — immutable snapshot of code + configuration. Gets a numeric ID (1, 2, 3...). Cannot be modified after publishing.
- **Alias** — named pointer to a specific version (e.g. `prod → v5`, `canary → v6`). Supports weighted routing (e.g. 95% v5, 5% v6).

## When a published version is required

| Scenario                     | Published version required? |
| ---------------------------- | --------------------------- |
| HTTP Lambda (API Gateway)    | No, `$LATEST` works         |
| Table stream Lambda          | No                          |
| WebSocket Lambda             | No                          |
| FIFO Queue Lambda            | No                          |
| **Lambda@Edge** (CloudFront) | **Yes, mandatory**          |
| Provisioned Concurrency      | Yes                         |
| Canary/weighted deployments  | Yes (via alias)             |

## Lambda@Edge constraint

CloudFront requires a versioned ARN (`arn:aws:lambda:us-east-1:123:function:name:42`). It does not accept `$LATEST`. This is a hard AWS requirement — there is no workaround.

Additional Lambda@Edge constraints:
- Must be deployed in **us-east-1**
- Must use **x86_64** architecture (ARM not supported)
- No environment variables allowed
- No VPC configuration
- Max 5s timeout (viewer request/response), 30s (origin request/response)
- Max 128 MB memory (viewer), 10 GB (origin)

## effortless-aws usage

- Standard handlers (HTTP, table, websocket, fifo-queue): `$LATEST`, no versioning needed.
- Static site middleware (Lambda@Edge): `publishVersion` called after `ensureLambda` in `deploy-static-site.ts`. Every deploy publishes a new version — old versions accumulate but are harmless (no cost, and CloudFront points to the latest published one).

## Potential future use

- **Provisioned Concurrency** — if added as an option to reduce cold starts, would require publishing a version + creating an alias to attach provisioned concurrency to.
