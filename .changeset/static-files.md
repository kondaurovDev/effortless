---
"effortless-aws": minor
---

Add static file bundling for Lambda handlers

Handlers can now declare `static: ["src/templates/*.ejs"]` to bundle files into the Lambda ZIP. A typed `readStatic(path)` helper is injected into the handler callback args to read bundled files at runtime.
