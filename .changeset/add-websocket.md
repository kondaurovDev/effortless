---
"effortless-aws": minor
---

Add `defineWebSocket` handler type for API Gateway WebSocket API support.

Each `defineWebSocket` handler creates its own WebSocket API with `$connect`, `$disconnect`, and `$default` routes handled by a single Lambda. Includes `send(connectionId, data)` function injected into `onMessage` for sending messages back to clients via the Management API.

Supports all standard effortless features: `deps`, `config` (SSM params), `setup`, `static`, `logLevel`, and custom `permissions`.
