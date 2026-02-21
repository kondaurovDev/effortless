---
"effortless-aws": minor
---

Add edge protection middleware for static sites, built-in GSI `tag-pk-index` with `queryByTag()`, and type-safe `tagField`

- **Static site middleware**: `defineStaticSite` now accepts a `middleware` callback (Lambda@Edge viewer-request) for auth, redirects, and access control
- **GSI `tag-pk-index`**: Every `defineTable` table now gets an always-on Global Secondary Index on `tag` (PK) + `pk` (SK), enabling cross-partition queries by entity type via `queryByTag()`
- **`queryByTag()`**: New method on `TableClient` — query all items of a given entity type across partitions, with optional `pk` filter, `limit`, and `scanIndexForward`
- **Type-safe `tagField`**: `tagField` option in `defineTable` is now constrained to `keyof T` instead of plain `string`
- **Single-table design refinements**: Improved `TableClient` typing, `put()` auto-extracts tag from data, `update()` supports `tag` and `ttl` actions
