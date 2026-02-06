import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "clients/index": "src/clients/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "effect",
    /^@aws-sdk\//,
    "archiver",
    "@vercel/nft",
  ],
});
