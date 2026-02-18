---
title: Database
description: Create DynamoDB tables with defineTable — typed clients, stream processing, and event-driven workflows.
---

You need a database for your serverless app. [DynamoDB](/why-aws/#dynamodb) is a fully managed database with single-digit millisecond latency, automatic replication across availability zones, and a built-in streaming feature that turns every write into a real-time event.

The usual pain with DynamoDB isn't the service itself — it's the setup. CloudFormation templates, IAM policies, event source mappings, environment variable wiring. With `defineTable` you declare the table shape once, and get a typed client, stream processing, and automatic IAM wiring — all from a single export.

## A simple table

You have users and you want to store them in DynamoDB. Define the table with a type and a primary key.

```typescript
// src/users.ts
import { defineTable, typed } from "effortless-aws";

type User = { id: string; email: string; name: string; createdAt: string };

export const users = defineTable({
  pk: { name: "id", type: "string" },
  schema: typed<User>(),
});
```

After deploy, you get a DynamoDB table named `{project}-{stage}-users` with `id` as the partition key. Other handlers can reference this table via `deps` and get a typed client for `.put()`, `.get()`, `.delete()`, and `.query()`.

## Reacting to data changes

You want to do something every time a record is inserted, updated, or deleted — send a notification, update a search index, trigger a downstream process. Instead of polling or building a message queue, you can react to DynamoDB stream events directly.

Add `onRecord` and your function runs for every change.

```typescript
// src/orders.ts
import { defineTable, typed } from "effortless-aws";

type Order = { id: string; product: string; amount: number; status: string };

export const orders = defineTable({
  pk: { name: "id", type: "string" },
  schema: typed<Order>(),
  onRecord: async ({ record }) => {
    if (record.eventName === "INSERT") {
      console.log(`New order: ${record.new!.product} — $${record.new!.amount}`);
      // Send confirmation email, update analytics, notify warehouse...
    }
    if (record.eventName === "MODIFY" && record.new!.status === "shipped") {
      // Send shipping notification
    }
    if (record.eventName === "REMOVE") {
      // Clean up related resources
    }
  },
});
```

The `record` object is typed from your table type:
- `record.eventName` — `"INSERT"`, `"MODIFY"`, or `"REMOVE"`
- `record.new` — the new item (typed as `Order | undefined`)
- `record.old` — the previous item (typed as `Order | undefined`)

Effortless creates the DynamoDB stream, the Lambda function, and the event source mapping. If your handler throws, only that specific record is reported as a failure — other records in the batch still succeed (partial batch failure handling is built in).

## Batch processing

Processing records one by one is fine for most cases. But when you need to handle high throughput — indexing to Elasticsearch, writing to a data lake, aggregating metrics — you want to work with batches.

Use `onBatch` to receive all records at once.

```typescript
// src/analytics.ts
import { defineTable, typed } from "effortless-aws";

type ClickEvent = { id: string; page: string; userId: string; timestamp: string };

export const clickEvents = defineTable({
  pk: { name: "id", type: "string" },
  schema: typed<ClickEvent>(),
  batchSize: 100,
  onBatch: async ({ records }) => {
    const inserts = records
      .filter(r => r.eventName === "INSERT")
      .map(r => r.new!);

    if (inserts.length > 0) {
      await bulkIndexToElasticsearch(inserts);
    }
  },
});
```

You can also combine `onRecord` with `onBatchComplete` for a process-then-summarize pattern:

```typescript
export const payments = defineTable({
  pk: { name: "id", type: "string" },
  schema: typed<Payment>(),
  onRecord: async ({ record }) => {
    // Process each payment individually
    await processPayment(record.new!);
    return { processed: true };
  },
  onBatchComplete: async ({ results, failures }) => {
    // Runs after all records are processed
    console.log(`Processed: ${results.length}, Failed: ${failures.length}`);
    if (failures.length > 0) {
      await alertOnFailures(failures);
    }
  },
});
```

## Table with sort key and TTL

You need a table where items expire automatically — session tokens, cache entries, temporary data. Add a sort key for flexible queries and a TTL attribute for auto-expiration.

```typescript
// src/sessions.ts
import { defineTable, typed } from "effortless-aws";

type Session = {
  userId: string;
  sessionId: string;
  data: Record<string, unknown>;
  ttl: number; // Unix timestamp
};

export const sessions = defineTable({
  pk: { name: "userId", type: "string" },
  sk: { name: "sessionId", type: "string" },
  ttlAttribute: "ttl",
  schema: typed<Session>(),
});
```

DynamoDB automatically deletes items when the TTL timestamp passes. No cron jobs, no cleanup Lambda.

## Using the table from another handler

The real power of `defineTable` is how it composes with other handlers. Any HTTP handler can reference the table via `deps` and get a fully typed client — no table name strings, no raw SDK calls.

```typescript
// src/api.ts
import { defineHttp } from "effortless-aws";
import { sessions } from "./sessions";

export const getSession = defineHttp({
  method: "GET",
  path: "/sessions/{userId}/{sessionId}",
  deps: { sessions },
  onRequest: async ({ req, deps }) => {
    const session = await deps.sessions.get({
      userId: req.params.userId,
      sessionId: req.params.sessionId,
    });
    if (!session) return { status: 404, body: { error: "Session not found" } };
    return { status: 200, body: session };
  },
});
```

`deps.sessions.get()` knows the key shape (`userId` + `sessionId`) and the return type (`Session`). The Lambda gets IAM permissions for `GetItem` on that specific table. All wired automatically.

## Resource-only table

Sometimes you need a table but don't need stream processing — it's just a data store. Skip the `onRecord`/`onBatch` handler and you get a table without a stream Lambda.

```typescript
export const cache = defineTable({
  pk: { name: "key", type: "string" },
  ttlAttribute: "expiresAt",
  schema: typed<CacheEntry>(),
});
// No onRecord — just a table. Reference it with deps from other handlers.
```

## See also

- [Definitions reference — defineTable](/definitions/#definetable) — all configuration options
- [HTTP API use case](/use-cases/http-api/) — how to use deps in HTTP handlers
