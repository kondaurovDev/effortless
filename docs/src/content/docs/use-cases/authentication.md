---
title: Authentication
description: Protect your API and static site with cookie-based authentication using defineAuth.
---

You have a frontend and an API, and some pages and endpoints should only be accessible to logged-in users. You don't want to integrate a third-party auth service or manage JWTs manually.

`defineAuth` gives you cookie-based authentication out of the box. It creates HMAC-signed session cookies, verifies them at the CDN edge (no round-trip to your backend), and injects typed session helpers into your API handlers.

## How it works

1. You define an auth config with `defineAuth<Session>()`
2. Pass it to `defineApi({ auth })` and `defineStaticSite({ auth })`
3. The API handler gets `auth.grant()`, `auth.revoke()`, and `auth.session`
4. The static site gets an auto-generated Lambda@Edge middleware that blocks unauthenticated requests

The session is stored in an `HttpOnly; Secure; SameSite=Lax` cookie, signed with HMAC-SHA256. The signing secret is auto-generated at deploy time and stored in SSM Parameter Store. Verification happens at the edge --- no external API calls, no database lookups.

## Define the auth config

Start by declaring what your session looks like and how auth should behave:

```typescript
// src/resources.ts
import { defineAuth } from "effortless-aws";

type Session = { userId: string; role: "admin" | "user" };

export const auth = defineAuth<Session>({
  loginPath: "/login",
  public: ["/login", "/assets/*"],
  expiresIn: "7d",
});
```

| Option | Description |
|---|---|
| `loginPath` | Where unauthenticated users are redirected |
| `public` | Paths that don't require authentication. Supports trailing `*` wildcard |
| `expiresIn` | Session lifetime. Accepts duration strings like `"7d"`, `"1h"`, `"30m"` or seconds. Default: `"7d"` |

The generic `<Session>` makes `auth.grant()` require typed data and `auth.session` return `Session | undefined` in handlers.

## Protect your API

Pass the auth config to `defineApi`. Your handlers receive an `auth` object with three members:

- **`auth.grant(data)`** --- create a signed session cookie. Returns a response with `Set-Cookie` header
- **`auth.revoke()`** --- clear the session cookie. Returns a response with `Max-Age=0`
- **`auth.session`** --- the decoded session data from the current request's cookie, or `undefined`

```typescript
// src/resources.ts
import { defineApi, defineTable, unsafeAs } from "effortless-aws";
import { z } from "zod";

export const users = defineTable({
  schema: unsafeAs<{ email: string; passwordHash: string; role: "admin" | "user" }>(),
});

const Action = z.discriminatedUnion("action", [
  z.object({ action: z.literal("login"), email: z.string(), password: z.string() }),
  z.object({ action: z.literal("logout") }),
]);

export const api = defineApi({
  basePath: "/api",
  auth,
  deps: () => ({ users }),
  schema: (input) => Action.parse(input),

  get: {
    "/me": async ({ auth }) => {
      if (!auth.session) {
        return { status: 401, body: { error: "Not authenticated" } };
      }
      return { status: 200, body: auth.session };
    },
  },

  post: async ({ data, auth, deps }) => {
    switch (data.action) {
      case "login": {
        const user = await deps.users.get({
          pk: `USER#${data.email}`,
          sk: "PROFILE",
        });
        if (!user || !verifyPassword(data.password, user.data.passwordHash)) {
          return { status: 401, body: { error: "Invalid credentials" } };
        }
        // Create a signed session cookie
        return auth.grant({ userId: data.email, role: user.data.role });
      }
      case "logout":
        return auth.revoke();
    }
  },
});
```

`auth.grant()` returns a full response object (`{ status: 200, body: { ok: true }, headers: { "set-cookie": "..." } }`), so you can return it directly. If you need a custom expiration for a specific grant:

```typescript
return auth.grant({ userId: "u1", role: "admin" }, { expiresIn: "1h" });
```

## Protect your static site

Pass the same auth config to `defineStaticSite`. Effortless auto-generates a Lambda@Edge function that verifies the cookie signature before serving any page.

```typescript
export const webapp = defineStaticSite({
  dir: "apps/frontend/dist",
  build: "pnpm --dir apps/frontend build",
  spa: true,
  auth,
  routes: {
    "/api/*": api,
  },
});
```

When a request comes in:
1. If the path matches a `public` pattern --- serve the page (no cookie check)
2. If a valid, non-expired session cookie exists --- serve the page
3. Otherwise --- redirect to `loginPath`

This happens at the CDN edge, so unauthenticated users never hit your origin. The verification is purely cryptographic --- the HMAC signature is checked against the secret that was injected into the Lambda@Edge function at build time.

## Custom session data

The generic on `defineAuth<T>` controls what data is stored in the cookie. Without a generic (`defineAuth({...})`), `grant()` takes no data and `session` is `undefined`.

With a generic, `grant()` requires typed data and `session` is typed:

```typescript
// No session data
const simpleAuth = defineAuth({
  loginPath: "/login",
});
// auth.grant()        --- no data needed
// auth.session        --- undefined

// With session data
const typedAuth = defineAuth<{ userId: string; role: string }>({
  loginPath: "/login",
});
// auth.grant({ userId: "u1", role: "admin" })  --- data required
// auth.session?.userId                          --- typed as string
```

Keep session data small --- it's stored in the cookie and sent with every request. Store IDs and roles, not large objects.

## How the cookie works

The session cookie format is:

```
__eff_session={base64url(JSON.stringify({ exp, ...data }))}.{hmac-sha256(payload, secret)}
```

- **Payload**: base64url-encoded JSON with an `exp` (Unix timestamp) field and your session data
- **Signature**: HMAC-SHA256 of the payload, using the auto-generated secret
- **Cookie attributes**: `HttpOnly; Secure; SameSite=Lax; Path=/`

The secret is generated once per project+stage and stored at `/{project}/{stage}/auth-hmac-secret` in SSM Parameter Store.

`HttpOnly` prevents JavaScript from reading the cookie (XSS protection). `Secure` ensures it's only sent over HTTPS. `SameSite=Lax` prevents CSRF for state-changing requests while allowing normal navigation.

## Architecture

```
Browser
  │
  ├── GET /dashboard
  │     └── CloudFront → Lambda@Edge (verify cookie) → S3 (serve page)
  │
  ├── POST /api  { action: "login", ... }
  │     └── CloudFront → Lambda Function URL → auth.grant() → Set-Cookie
  │
  └── GET /api/me
        └── CloudFront → Lambda Function URL → auth.session → JSON response
```

- **Lambda@Edge** runs at CloudFront edge locations, verifying cookies with zero latency to your origin
- **API Lambda** handles login/logout and reads the session from the same cookie
- **HMAC secret** is fetched once per Lambda cold start from SSM, then cached in memory

## See also

- [HTTP API guide](/use-cases/http-api) --- routes, validation, database access
- [Website guide](/use-cases/web-app) --- static sites, SPA mode, middleware
- [Definitions reference --- defineApi](/definitions/#defineapi) --- all API configuration options
