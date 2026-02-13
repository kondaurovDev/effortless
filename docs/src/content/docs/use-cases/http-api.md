---
title: HTTP API
description: Build REST APIs with defineHttp — routes, validation, database access, and secrets.
---

You need a backend API. Maybe it's a mobile app that fetches data, a webhook endpoint for a third-party service, or a simple CRUD API for your side project. You don't want to set up Express, configure Docker, or manage a server.

Under the hood, Effortless uses [API Gateway HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html) — one of the best managed services on AWS. It handles TLS, routing, throttling, and scales to thousands of requests per second with zero configuration. The first 1 million requests per month are free, then $1 per million after that. No servers to patch, no load balancers to configure, no uptime to worry about.

With `defineHttp` you write an async function, export it, and get a production endpoint backed by API Gateway + Lambda.

## A simple endpoint

You want to return a JSON response at `GET /hello/{name}`.

```typescript
// src/api.ts
import { defineHttp } from "effortless-aws";

export const hello = defineHttp({
  method: "GET",
  path: "/hello/{name}",
  onRequest: async ({ req }) => {
    return {
      status: 200,
      body: { message: `Hello, ${req.params.name}!` },
    };
  },
});
```

After `npx eff deploy`, you get an API Gateway URL. Every request to `GET /hello/world` runs your function and returns `{ message: "Hello, world!" }`.

The `req` object gives you everything from the HTTP request:
- `req.params` — path parameters (`{name}`)
- `req.query` — query string parameters
- `req.headers` — request headers
- `req.body` — parsed request body (for POST/PUT/PATCH)

## Validating input

Accepting user input without validation is asking for trouble. You want the framework to reject bad requests before your code even runs.

Pass a schema and Effortless validates every request body automatically. Invalid requests get a 400 response — your handler never sees bad data.

```typescript
import { defineHttp } from "effortless-aws";
import { Schema } from "effect";

export const createUser = defineHttp({
  method: "POST",
  path: "/users",
  schema: Schema.Struct({
    email: Schema.String,
    name: Schema.String,
    age: Schema.Number.pipe(Schema.greaterThan(0)),
  }),
  onRequest: async ({ data }) => {
    // data is typed: { email: string, name: string, age: number }
    // already validated — no need for manual checks
    return {
      status: 201,
      body: { id: crypto.randomUUID(), ...data },
    };
  },
});
```

The `data` argument is typed from your schema. Send `{ "email": 123 }` and the caller gets a 400 with a clear validation error. Your handler only runs when the data is correct.

## CRUD with a database

Most APIs need a database. Traditionally that means: create a DynamoDB table in CloudFormation, configure IAM permissions for the Lambda to access it, pass the table name via environment variables, instantiate the DynamoDB client, and write untyped SDK calls.

With Effortless, you define the table and reference it in your HTTP handler via `deps`. The framework wires everything — table name, IAM permissions, typed client.

```typescript
// src/tasks.ts
import { defineTable, defineHttp } from "effortless-aws";
import { Schema } from "effect";

type Task = { id: string; title: string; done: boolean; createdAt: string };

export const tasks = defineTable<Task>({
  pk: { name: "id", type: "string" },
});

// POST /tasks — create a task
export const createTask = defineHttp({
  method: "POST",
  path: "/tasks",
  schema: Schema.Struct({ title: Schema.String }),
  deps: { tasks },
  onRequest: async ({ data, deps }) => {
    const task: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      done: false,
      createdAt: new Date().toISOString(),
    };
    await deps.tasks.put(task);
    return { status: 201, body: task };
  },
});

// GET /tasks/{id} — read a task
export const getTask = defineHttp({
  method: "GET",
  path: "/tasks/{id}",
  deps: { tasks },
  onRequest: async ({ req, deps }) => {
    const task = await deps.tasks.get({ id: req.params.id });
    if (!task) return { status: 404, body: { error: "Not found" } };
    return { status: 200, body: task };
  },
});

// DELETE /tasks/{id} — delete a task
export const deleteTask = defineHttp({
  method: "DELETE",
  path: "/tasks/{id}",
  deps: { tasks },
  onRequest: async ({ req, deps }) => {
    await deps.tasks.delete({ id: req.params.id });
    return { status: 200, body: { ok: true } };
  },
});
```

All of this lives in one file. Each Lambda gets only the DynamoDB permissions it needs — `createTask` gets `PutItem`, `getTask` gets `GetItem`, `deleteTask` gets `DeleteItem`. No manual IAM policies.

## Using secrets

Your API calls Stripe, SendGrid, or another service that requires an API key. You don't want to hardcode secrets or manage environment variables.

With `param()`, you reference an SSM Parameter Store key. Effortless fetches the value once at Lambda cold start, caches it, and injects it as a typed argument. IAM permissions for SSM are added automatically.

```typescript
import { defineHttp, param } from "effortless-aws";
import { Schema } from "effect";

export const checkout = defineHttp({
  method: "POST",
  path: "/checkout",
  params: {
    stripeKey: param("stripe/secret-key"),
  },
  schema: Schema.Struct({
    amount: Schema.Number,
    currency: Schema.String,
  }),
  onRequest: async ({ data, params }) => {
    // params.stripeKey is fetched from SSM, cached across invocations
    const stripe = new Stripe(params.stripeKey);
    const intent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency,
    });
    return { status: 200, body: { clientSecret: intent.client_secret } };
  },
});
```

Store the secret in SSM with `aws ssm put-parameter --name /my-service/dev/stripe/secret-key --value sk_test_... --type SecureString`. Effortless reads it at `/${project}/${stage}/${key}`.

## See also

- [Handlers reference — defineHttp](/handlers/#definehttp) — all configuration options
- [Architecture — Inter-handler dependencies](/architecture/#inter-handler-dependencies-deps) — how deps wiring works
