---
"@effortless-aws/cli": patch
---

fix: add `createRequire` banner to ESM bundles for CJS compatibility

CJS packages bundled into ESM output (e.g. `follow-redirects`) use `require()` for Node.js builtins, which doesn't exist in ESM context on Lambda. Adds `createRequire(import.meta.url)` banner so bundled CJS code can call `require()` without crashing.
