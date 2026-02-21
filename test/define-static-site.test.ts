import { describe, it, expect } from "vitest"

import { extractStaticSiteConfigs } from "~/build/bundle"

// ============ AST extraction ============

describe("defineStaticSite extraction", () => {

  it("should extract static site config from named export", () => {
    const source = `
      import { defineStaticSite } from "effortless-aws";

      export const docs = defineStaticSite({
        dir: "dist",
        spa: true,
        build: "npm run build",
      });
    `;

    const configs = extractStaticSiteConfigs(source);

    expect(configs).toHaveLength(1);
    expect(configs[0]!.exportName).toBe("docs");
    expect(configs[0]!.config).toEqual({
      dir: "dist",
      spa: true,
      build: "npm run build",
    });
  });

  it("should extract static site config from default export", () => {
    const source = `
      import { defineStaticSite } from "effortless-aws";

      export default defineStaticSite({
        name: "marketing",
        dir: "dist",
        index: "main.html",
      });
    `;

    const configs = extractStaticSiteConfigs(source);

    expect(configs).toHaveLength(1);
    expect(configs[0]!.exportName).toBe("default");
    expect(configs[0]!.config).toEqual({
      name: "marketing",
      dir: "dist",
      index: "main.html",
    });
  });

  it("should have empty deps, params, and static globs", () => {
    const source = `
      import { defineStaticSite } from "effortless-aws";

      export const docs = defineStaticSite({
        dir: "dist",
      });
    `;

    const configs = extractStaticSiteConfigs(source);

    expect(configs[0]!.depsKeys).toEqual([]);
    expect(configs[0]!.paramEntries).toEqual([]);
    expect(configs[0]!.staticGlobs).toEqual([]);
  });

  it("should detect middleware and set hasHandler to true", () => {
    const source = `
      import { defineStaticSite } from "effortless-aws";

      export const admin = defineStaticSite({
        dir: "admin/dist",
        middleware: async (request) => {
          if (!request.cookies.session) {
            return { redirect: "/login" };
          }
        },
      });
    `;

    const configs = extractStaticSiteConfigs(source);

    expect(configs).toHaveLength(1);
    expect(configs[0]!.exportName).toBe("admin");
    expect(configs[0]!.hasHandler).toBe(true);
    // middleware should be stripped from config (it's in RUNTIME_PROPS)
    expect(configs[0]!.config).not.toHaveProperty("middleware");
    expect(configs[0]!.config).toEqual({ dir: "admin/dist" });
  });

  it("should set hasHandler to false when no middleware", () => {
    const source = `
      import { defineStaticSite } from "effortless-aws";

      export const docs = defineStaticSite({
        dir: "dist",
        spa: true,
      });
    `;

    const configs = extractStaticSiteConfigs(source);

    expect(configs).toHaveLength(1);
    expect(configs[0]!.hasHandler).toBe(false);
  });

  it("should not match defineApp or defineHttp calls", () => {
    const source = `
      import { defineApp } from "effortless-aws";

      export const app = defineApp({
        path: "/app",
        dir: "src/webapp",
      });
    `;

    const configs = extractStaticSiteConfigs(source);
    expect(configs).toHaveLength(0);
  });

});
