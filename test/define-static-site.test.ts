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
