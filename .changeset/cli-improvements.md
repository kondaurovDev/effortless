---
"effortless-aws": minor
---

Improve CLI, simplify handler API, and refactor deploy pipeline

- Add `logs` command for viewing Lambda CloudWatch logs
- Add `layer` command (renamed from `layers`) for managing Lambda layers
- Enhance `status` command with detailed resource information
- Improve `cleanup` command with better resource discovery
- Add stale route cleanup for API Gateway
- Refactor deploy pipeline with improved logging and colored output
- Simplify handler definitions: remove `param`, `permissions`, and `typed` modules
- Remove platform table (platform-client, platform-types)
- Consolidate shared deploy logic into `shared.ts`
- Refactor runtime wrappers with unified initialization pattern
- Update docs: rewrite architecture, expand configuration, remove observability page
