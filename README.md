# effortless-aws

AWS serverless is the best way to run production software. Lambda gives you 99.95% availability out of the box, scales to zero, handles thousands of concurrent requests, and you never manage a server. DynamoDB, SQS, S3, EventBridge — these are battle-tested building blocks with guarantees most self-hosted infrastructure can't match. The event-driven model maps naturally to real business logic: an order is placed, a file is uploaded, a record changes.

The problem is never AWS itself — it's the tooling. CloudFormation templates, IAM policies, Terraform state files, CDK constructs. You end up spending more time on infrastructure plumbing than on your actual product. And even when infrastructure is sorted out, wiring serverless resources together — connecting a Lambda to a DynamoDB stream, granting cross-service permissions, passing table names between functions — is tedious and error-prone.

**Effortless** is a TypeScript framework for developers who build on AWS serverless. It handles three things:

1. **Infrastructure from code.** You write handlers, export them, and deploy. The framework derives Lambda functions, API Gateway routes, DynamoDB tables, streams, and IAM roles directly from your TypeScript exports. No config files.
2. **Bundling and packaging.** Your code is automatically bundled with [esbuild](https://esbuild.github.io/) — tree-shaken, split per function, with shared dependencies extracted into a common [Lambda Layer](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html). No build config to maintain.
3. **Typed cross-resource communication.** Reference one handler from another with `deps: { orders }` and get a fully typed client injected at runtime, with IAM permissions wired automatically. Serverless resources talk to each other through code, not through copied ARNs and manual policies.

```bash
npm install effortless-aws
```

## What it looks like

```typescript
import { defineHttp } from "effortless-aws";

export const hello = defineHttp({
  method: "GET",
  path: "/hello",
  onRequest: async () => {
    return { status: 200, body: { message: "Hello!" } };
  },
});
```

```bash
npx eff deploy
```

That's it — one export, one command. No YAML, no CloudFormation, no state files.

## Why

Traditional Lambda development splits infrastructure and code across multiple files and languages. Adding a single endpoint means touching CloudFormation/CDK/Terraform templates, IAM policies, and handler code separately.

**Effortless** derives infrastructure from your TypeScript exports. One `defineHttp` call creates the API Gateway route, Lambda function, and IAM role. One `defineTable` call creates the DynamoDB table, stream, event source mapping, and processor Lambda.

## Killer features

**Infrastructure from code** — export a handler, get the AWS resources. No config files, no YAML.

**Typed everything** — `defineTable` schema gives you typed `table.put()`, typed `deps.orders.get()`, typed `record.new`. One definition, types flow everywhere.

**Direct AWS SDK deploys** — no CloudFormation, no Pulumi. Direct API calls. Deploy in ~5-10s, not 5-10 minutes.

**No state files** — AWS resource tags are the source of truth. No tfstate, no S3 backends, no drift.

**Cross-handler deps** — `deps: { orders }` auto-wires IAM permissions and injects a typed `TableClient`. Zero config.

**SSM params** — `param("stripe-key")` fetches from Parameter Store at cold start. Auto IAM, auto caching, supports transforms.

**Partial batch failures** — DynamoDB stream processing reports failed records individually. No batch-level retries for one bad record.

**Cold start caching** — `context` factory runs once per cold start, cached across invocations. Put DB connections, SDK clients, config there.

## Examples

### Path params

```typescript
export const getUser = defineHttp({
  method: "GET",
  path: "/users/{id}",
  onRequest: async ({ req }) => {
    const user = await findUser(req.params.id);
    return { status: 200, body: user };
  },
});
```

> Creates: Lambda function, API Gateway `GET /users/{id}` route, IAM execution role.

### Schema validation

Works with any validation library — Zod, Effect Schema, or a plain function.

```typescript
export const createUser = defineHttp({
  method: "POST",
  path: "/users",
  schema: (input) => parseUser(input),
  onRequest: async ({ data }) => {
    // data is typed from schema return type
    return { status: 201, body: { id: data.id } };
  },
});
```

### Context (cold-start cache)

`context` runs once per cold start. Put SDK clients, DB connections, config here.

```typescript
export const listOrders = defineHttp({
  method: "GET",
  path: "/orders",
  context: () => ({
    db: new DatabaseClient(),
  }),
  onRequest: async ({ ctx }) => {
    const orders = await ctx.db.findAll();
    return { status: 200, body: orders };
  },
});
```

### SSM params

`param("key")` reads from Parameter Store at cold start. Auto IAM, auto caching.

```typescript
export const charge = defineHttp({
  method: "POST",
  path: "/charge",
  params: { apiKey: param("stripe-key") },
  context: async ({ params }) => ({
    stripe: new Stripe(params.apiKey),
  }),
  onRequest: async ({ ctx, data }) => {
    await ctx.stripe.charges.create(data);
    return { status: 200, body: { ok: true } };
  },
});
```

> Creates: Lambda, API Gateway route, IAM role with `ssm:GetParameter` on `/{project}/{stage}/stripe-key`.

### Cross-handler deps

`deps: { orders }` auto-wires IAM and injects a typed `TableClient`.

```typescript
type Order = { id: string; name: string };

export const orders = defineTable<Order>({
  pk: { name: "id", type: "string" },
});

export const createOrder = defineHttp({
  method: "POST",
  path: "/orders",
  deps: { orders },
  onRequest: async ({ deps }) => {
    await deps.orders.put({ id: crypto.randomUUID(), name: "New order" });
    return { status: 201, body: { ok: true } };
  },
});
```

> Creates: DynamoDB table, Lambda, API Gateway route. The Lambda's IAM role gets DynamoDB read/write permissions on the `orders` table automatically. Table name is injected via environment variable.

### DynamoDB table (resource only)

Export a table — get the DynamoDB resource. No Lambda, no stream.

```typescript
export const sessions = defineTable({
  pk: { name: "id", type: "string" },
  ttlAttribute: "expiresAt",
});
```

> Creates: DynamoDB table with TTL enabled. No Lambda, no stream — just the table.

### DynamoDB table with stream

Add `onRecord` to process changes. Each record is handled individually with automatic partial batch failure reporting.

```typescript
type User = { id: string; email: string; name: string };

export const users = defineTable<User>({
  pk: { name: "id", type: "string" },
  sk: { name: "email", type: "string" },
  onRecord: async ({ record }) => {
    if (record.eventName === "INSERT") {
      await sendWelcomeEmail(record.new!.email);
    }
  },
});
```

> Creates: DynamoDB table with stream enabled, Lambda for stream processing, event source mapping between them, IAM role with DynamoDB read/write permissions. Failed records are reported individually via [partial batch responses](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#services-ddb-batchfailurereporting).

### Full example

Everything together — table, HTTP handler with validation, deps, params, and context.

```typescript
type Order = { id: string; total: number; chargeId?: string };

export const orders = defineTable<Order>({
  pk: { name: "id", type: "string" },
  onRecord: async ({ record }) => {
    if (record.eventName === "INSERT") {
      await notifyWarehouse(record.new!);
    }
  },
});

export const createOrder = defineHttp({
  method: "POST",
  path: "/orders",
  schema: (input) => parseOrder(input),
  deps: { orders },
  params: { apiKey: param("stripe-key") },
  context: async ({ params }) => ({
    stripe: new Stripe(params.apiKey),
  }),
  onRequest: async ({ data, ctx, deps }) => {
    const charge = await ctx.stripe.charges.create({ amount: data.total });
    await deps.orders.put({ id: crypto.randomUUID(), ...data, chargeId: charge.id });
    return { status: 201, body: { ok: true } };
  },
});
```

## Configuration

```typescript
// effortless.config.ts
import { defineConfig } from "effortless-aws";

export default defineConfig({
  name: "my-app",
  region: "eu-central-1",
  handlers: ["src/**/*.ts"],
});
```

## CLI

```bash
npx eff deploy              # deploy all handlers
npx eff deploy --stage prod # deploy to specific stage
npx eff deploy --only users # deploy single handler
npx eff destroy             # remove all resources
npx eff logs users --follow # stream CloudWatch logs
npx eff list                # show deployed resources
```

## How it works

1. **Static analysis** (ts-morph) — reads your exports, extracts handler config from AST
2. **Bundle** (esbuild) — wraps each handler with a runtime adapter
3. **Deploy** (AWS SDK) — creates/updates Lambda, API Gateway, DynamoDB, IAM directly

No CloudFormation stacks. No Terraform state. Tags on AWS resources are the only state.

## Compared to

| | SST v3 | Nitric | Serverless | **Effortless** |
|---|---|---|---|---|
| Infra from code (not config) | No | Yes | No | **Yes** |
| Typed client from schema | No | No | No | **Yes** |
| No state files | No | No | No | **Yes** |
| Deploy speed | ~30s | ~30s | minutes | **~5-10s** |
| Runs in your AWS account | Yes | Yes | Yes | **Yes** |
| Open source | Yes | Yes | Yes | **Yes** |

## License

MIT
