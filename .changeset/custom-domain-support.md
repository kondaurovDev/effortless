---
"effortless-aws": minor
---

Add custom domain support for `defineStaticSite`

- New `domain` option: automatically finds ACM certificate in us-east-1 and configures CloudFront aliases + SSL
- Automatic www→non-www 301 redirect when ACM certificate covers `www` (via CloudFront Function)
- Idempotent CloudFront Function updates: skips update when code hasn't changed
- Automatic cleanup of orphaned CloudFront Functions after deploy
