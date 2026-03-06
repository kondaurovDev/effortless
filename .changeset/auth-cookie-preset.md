---
"effortless-aws": minor
"@effortless-aws/cli": minor
---

feat: add `defineAuth()` for HMAC-signed cookie authentication

- `defineAuth<Session>({ loginPath, public, expiresIn })` creates a typed auth config
- `defineApi({ auth })` injects typed `auth.grant(data)` / `auth.revoke()` / `auth.session` into handler args
- `defineStaticSite({ auth })` auto-generates Lambda@Edge middleware that verifies signed cookies
- Session data encoded as base64url JSON payload in cookie, signed with HMAC-SHA256
- HMAC secret is auto-generated and stored in SSM Parameter Store
- Stateless verification at edge — no external API calls needed

fix(cli): monorepo layer support and large layer uploads

- Auto-derive `extraNodeModules` from `root` config — when `projectDir !== cwd`, search `projectDir/node_modules` for layer packages (pnpm/npm/yarn compatible)
- Upload large layers (>50 MB) via S3 instead of direct API call to avoid 70 MB `PublishLayerVersion` limit
- Fix false "TypeScript entry points" warnings for packages like zod and @standard-schema/spec that use custom export conditions (`@zod/source`, `standard-schema-spec`) — now only standard runtime conditions (`import`, `require`, `default`, `node`) are checked
- Filter packages without resolved paths from layer (cosmetic fix)
