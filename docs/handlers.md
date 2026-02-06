# Handlers

## defineQueue

Creates: SQS Queue + Lambda + Event Source Mapping + IAM permissions

```typescript
export const handler = defineQueue({
  // Optional
  name?: string,                      // defaults to export name
  memory?: number,                    // MB, default from config
  timeout?: DurationInput,            // e.g. "30 seconds"
  batchSize?: number,                 // 1-10, default 10
  visibilityTimeout?: DurationInput,  // default "30 seconds"
  messageSchema?: Schema.Schema<T>,   // for type-safe messages
  fifo?: boolean,                     // FIFO queue
  deadLetterQueue?: boolean | string, // enable DLQ or reference existing

  handler: async (messages: T[], ctx: QueueContext) => {
    // messages are already parsed and validated
    // ctx contains raw event, AWS context, logger
  }
});
```

## defineHttp

Creates: API Gateway HTTP API + Lambda + Route

```typescript
export const api = defineHttp({
  // Required
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  path: string,  // e.g. "/api/users/{id}"

  // Optional
  name?: string,                      // defaults to export name
  memory?: number,
  timeout?: DurationInput,
  cors?: boolean | CorsConfig,
  auth?: "none" | "iam" | "jwt" | AuthConfig,
  requestSchema?: Schema.Schema<T>,   // validate request body
  context?: () => C,                  // factory for dependencies (cached on cold start)

  onRequest: async ({ req, ctx }: { req: HttpRequest<T>, ctx?: C }) => {
    // req.body is typed and validated
    // req.params, req.query, req.headers available
    // ctx contains context if provided
    return {
      status: 200,
      body: { data: "response" },
      headers?: { ... },
    };
  }
});
```

## defineSchedule

Creates: EventBridge Rule + Lambda + IAM permissions

```typescript
export const daily = defineSchedule({
  // Required
  schedule: string,  // "rate(1 hour)" or "cron(0 12 * * ? *)"

  // Optional
  name?: string,
  memory?: number,
  timeout?: DurationInput,
  enabled?: boolean,  // default true

  handler: async (ctx: ScheduleContext) => {
    // ctx.scheduledTime, ctx.ruleName available
  }
});
```

## defineEvent

Creates: EventBridge Rule + Lambda for custom events

```typescript
export const orderCreated = defineEvent({
  // Required
  eventPattern: {
    source: ["my.app"],
    "detail-type": ["OrderCreated"],
  },

  // Optional
  name?: string,
  eventSchema?: Schema.Schema<T>,

  handler: async (event: T, ctx: EventContext) => {
    // typed event
  }
});
```

## defineS3

Creates: S3 Event Notification + Lambda

```typescript
export const upload = defineS3({
  // Required
  bucket: string,  // bucket name or reference
  events: ["s3:ObjectCreated:*"],

  // Optional
  name?: string,
  prefix?: string,
  suffix?: string,

  handler: async (records: S3Record[], ctx: S3Context) => {
    for (const record of records) {
      console.log(`New file: ${record.s3.object.key}`);
    }
  }
});
```

## defineTable

Creates: DynamoDB Table + (optional) Stream + Lambda + Event Source Mapping

```typescript
// With type - record.new/old are typed
type Order = {
  id: string;
  createdAt: number;
  amount: number;
};

export const orders = defineTable<Order>({
  // Required
  pk: { name: string, type: "string" | "number" | "binary" },

  // Optional - table
  name?: string,                      // defaults to export name
  sk?: { name: string, type: "string" | "number" | "binary" },
  billingMode?: "PAY_PER_REQUEST" | "PROVISIONED",  // default: PAY_PER_REQUEST
  ttlAttribute?: string,

  // Optional - stream (only if onRecord is provided)
  streamView?: "NEW_AND_OLD_IMAGES" | "NEW_IMAGE" | "OLD_IMAGE" | "KEYS_ONLY",  // default: NEW_AND_OLD_IMAGES
  batchSize?: number,                // 1-10000, default: 100
  startingPosition?: "LATEST" | "TRIM_HORIZON",  // default: LATEST
  filterPatterns?: FilterPattern[],  // filter events

  // Optional - lambda
  memory?: number,
  timeout?: DurationInput,
  context?: () => C,                  // factory for dependencies (cached on cold start)

  // Optional - if omitted, only the table is created (no Lambda)
  // Called once per record - partial batch failures handled automatically
  onRecord: async ({ record, ctx }: { record: TableRecord<Order>, ctx?: C }) => {
    if (record.eventName === "INSERT") {
      console.log("New:", record.new);  // Order
    }
    if (record.eventName === "MODIFY") {
      console.log("Changed:", record.old, "→", record.new);
    }
    if (record.eventName === "REMOVE") {
      console.log("Deleted:", record.old);
    }
  }
});

// Without onRecord - just creates the table (no Lambda, no stream)
export const users = defineTable({
  pk: { name: "id", type: "string" }
});

// Without type - record.new/old is Record<string, unknown>
export const logs = defineTable({
  pk: { name: "id", type: "string" },
  onRecord: async ({ record }) => {
    console.log(record.eventName, record.new);
  }
});

// With onBatchComplete - accumulate results and process at end
type ProcessedOrder = { id: string; amount: number };

export const ordersWithBatch = defineTable<Order>({
  pk: { name: "id", type: "string" },

  // Return value is collected into results array
  onRecord: async ({ record }) => {
    // TypeScript infers R = ProcessedOrder from return type
    return { id: record.new!.id, amount: record.new!.amount };
  },

  // Called after all records processed
  onBatchComplete: async ({ results, failures }) => {
    // results: ProcessedOrder[] - accumulated from onRecord
    // failures: FailedRecord<Order>[] - records that threw errors
    console.log(`Processed ${results.length}, failed ${failures.length}`);
    await batchWriteToAnotherTable(results);
  }
});
```
