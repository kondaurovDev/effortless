---
"effortless-aws": minor
---

Remove `name` from handler config API. Handler name is now always derived from the export name. This eliminates the `name` field from `LambdaConfig` and all `define*` option types.

**Breaking:** If you used `name` in `defineHttp`, `defineTable`, etc., remove it. The export variable name is now the handler name.

Before:
```ts
export const api = defineHttp({ name: "api", method: "GET", path: "/hello", ... });
```

After:
```ts
export const api = defineHttp({ method: "GET", path: "/hello", ... });
```
