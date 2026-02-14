---
title: Website
description: Serve static sites and SPAs with defineApp and defineStaticSite — via Lambda or CloudFront CDN.
---

You've built a frontend — React, Vue, Astro, a documentation site — and you need to host it. On AWS that usually means: create an S3 bucket, configure permissions, set up CloudFront, write rewrite rules for SPAs, handle cache invalidation. Or if you just want it alongside your API — figure out how to serve static files from Lambda.

Effortless gives you two options depending on your needs: **defineApp** (Lambda + API Gateway) and **defineStaticSite** (CloudFront + S3).

## defineApp — serve alongside your API

Your frontend lives in the same project as your API. You want everything on the same domain, deployed with one command.

`defineApp` bundles your built site into a Lambda that serves static files through API Gateway. Since the site shares the same API Gateway as your HTTP handlers, there's no extra infrastructure — no S3 bucket, no CloudFront distribution, no additional cost.

```typescript
// src/site.ts
import { defineApp } from "effortless-aws";

export const docs = defineApp({
  dir: "dist",
  path: "/",
  build: "npx astro build",
});
```

On deploy, Effortless:
1. Runs `npx astro build` to produce the `dist/` folder
2. Bundles all files into the Lambda ZIP
3. Creates a Lambda that serves them with correct content types
4. Sets up API Gateway routes for `GET /` and `GET /{proxy+}`

HTML files get `Cache-Control: public, max-age=0, must-revalidate`. Assets (JS, CSS, images) get `Cache-Control: public, max-age=31536000, immutable`. No manual cache configuration.

### SPA mode

Your React or Vue app uses client-side routing. Every URL should return `index.html` and let the JS router handle the path.

```typescript
export const app = defineApp({
  dir: "build",
  path: "/app",
  build: "npm run build",
  spa: true,
});
```

With `spa: true`, any request that doesn't match a real file returns `index.html`. So `/app/dashboard`, `/app/settings/profile`, `/app/anything` all serve your SPA — and the client-side router takes over.

### Frontend + API in one project

This is where defineApp shines — your frontend and backend deploy together. No CORS issues, no separate infrastructure.

```typescript
// src/site.ts
import { defineApp } from "effortless-aws";

export const frontend = defineApp({
  dir: "client/dist",
  path: "/",
  build: "cd client && npm run build",
  spa: true,
});
```

```typescript
// src/api.ts
import { defineHttp, defineTable, typed } from "effortless-aws";

type Item = { id: string; name: string };

export const items = defineTable({
  pk: { name: "id", type: "string" },
  schema: typed<Item>(),
});

export const listItems = defineHttp({
  method: "GET",
  path: "/api/items",
  deps: { items },
  onRequest: async ({ deps }) => {
    const result = await deps.items.query({});
    return { status: 200, body: result };
  },
});
```

Your React app fetches `/api/items` — same domain, same API Gateway. The frontend serves from `/`, the API from `/api/*`. Everything deploys with one command.

---

## defineStaticSite — global CDN

Your site is public-facing — a marketing page, blog, documentation — and you want fast load times worldwide.

[CloudFront](/why-aws/#cloudfront--s3) is AWS's global CDN. Once cached, your files are served directly from the nearest edge location — no Lambda, no origin server.

The usual pain is the setup: create a private S3 bucket, configure Origin Access Control, set up URL rewriting for clean paths, handle SPA routing with custom error responses, and invalidate the cache on every deploy. `defineStaticSite` does all of this from one export.

```typescript
// src/site.ts
import { defineStaticSite } from "effortless-aws";

export const blog = defineStaticSite({
  dir: "dist",
  build: "npm run build",
});
```

On deploy, Effortless:
1. Runs `npm run build`
2. Creates a private S3 bucket
3. Uploads all files from `dist/`
4. Creates a CloudFront distribution with Origin Access Control
5. Sets up URL rewriting: `/about/` becomes `/about/index.html`
6. Invalidates the CloudFront cache so changes are live immediately

You get a CloudFront URL like `https://d1234567890.cloudfront.net`. Your site is served from edge locations worldwide.

### SPA mode

Same as defineApp — enable `spa: true` and all routes return `index.html`:

```typescript
export const app = defineStaticSite({
  dir: "build",
  build: "npm run build",
  spa: true,
});
```

Behind the scenes, CloudFront returns `index.html` for any path that doesn't match a real file (via custom error response for 403/404).

---

## Which one to choose?

| | defineApp | defineStaticSite |
|---|---|---|
| Serves via | Lambda + API Gateway | CloudFront + S3 |
| Global CDN | No | Yes |
| Same domain as API | Yes | No (separate CloudFront URL) |
| Extra AWS resources | None | S3 bucket + CloudFront distribution |
| Best for | Internal tools, admin panels, fullstack apps | Public sites, blogs, docs, marketing pages |

**Rule of thumb**: if your site lives alongside API handlers — use `defineApp`. If it's a standalone public site that needs CDN performance — use `defineStaticSite`.

## See also

- [Handlers reference — defineApp](/handlers/#defineapp) — all configuration options
- [Handlers reference — defineStaticSite](/handlers/#definestaticsite) — all configuration options
