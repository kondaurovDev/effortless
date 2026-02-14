---
title: Configuration
description: Project and per-handler configuration options.
---

## Project Config

```typescript
// effortless.config.ts
import { defineConfig } from "effortless-aws";

export default defineConfig({
  // Required
  name: string,           // project/service name
  region: string,         // AWS region
  handlers: string[],     // glob patterns, e.g. ["src/**/*.ts"]

  // Optional
  defaults: {
    memory: number,       // default 256
    timeout: string,      // default "30 seconds"
    runtime: string,      // default "nodejs22.x"
  },

  // Environment variables for all lambdas
  env: {
    TABLE_NAME: "my-table",
    API_KEY: "${ssm:/my/api/key}",  // SSM parameter reference
  },

  // Tags for all resources
  tags: {
    Environment: "production",
    Project: "my-service",
  },

  // IAM permissions for all lambdas
  permissions: [
    "dynamodb:*",  // simplified
    {              // or detailed
      effect: "Allow",
      actions: ["s3:GetObject"],
      resources: ["arn:aws:s3:::my-bucket/*"],
    },
  ],

  // VPC configuration
  vpc: {
    securityGroupIds: ["sg-xxx"],
    subnetIds: ["subnet-xxx"],
  },
});
```

## Per-handler Overrides

Any config option can be overridden per handler:

```typescript
export const processor = defineFifoQueue({
  name: "heavy-processing",
  memory: 1024,  // override default
  timeout: 300,  // 5 minutes
  permissions: [
    "sqs:*",  // added to global permissions
  ],
  onMessage: async ({ message }) => { ... },
});
```
