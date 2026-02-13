import { defineApp, defineStaticSite } from "effortless-aws";

export const docs = defineApp({
  path: "/",
  dir: "dist",
  build: "pnpm run build",
  spa: false,
});

export const docsCDN = defineStaticSite({
  dir: "dist",
  build: "pnpm run build",
  spa: false,
});
