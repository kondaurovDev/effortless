import { describe, it, expect } from "vitest"
import * as path from "path"

import { extractAuthConfigs, extractConfigs } from "~/build/bundle"
import { importBundle } from "./helpers/bundle-code"

const projectDir = path.resolve(__dirname, "..")

const makeAuthEvent = (overrides: Record<string, unknown> = {}) => ({
  version: "2.0",
  type: "REQUEST",
  routeArn: "arn:aws:execute-api:us-east-1:123456789:abc123/$default/GET/hello",
  headers: {},
  queryStringParameters: {},
  ...overrides,
});

describe("defineAuth", () => {

  it("should bundle and invoke auth handler — authorized", async () => {
    const handlerCode = `
      import { defineAuth } from "./src/handlers/define-auth";

      export default defineAuth({
        onAuth: async ({ headers }) => {
          if (headers.authorization === "Bearer valid") {
            return { isAuthorized: true, context: { userId: "42", role: "admin" } };
          }
          return { isAuthorized: false };
        }
      });
    `;

    const mod = await importBundle({ code: handlerCode, projectDir, type: "auth" });

    expect(typeof mod.handler).toBe("function");

    const response = await mod.handler(makeAuthEvent({
      headers: { authorization: "Bearer valid" }
    }));

    expect(response.isAuthorized).toBe(true);
    expect(response.context).toEqual({ userId: "42", role: "admin" });
  });

  it("should return isAuthorized false for invalid token", async () => {
    const handlerCode = `
      import { defineAuth } from "./src/handlers/define-auth";

      export default defineAuth({
        onAuth: async ({ headers }) => {
          if (headers.authorization === "Bearer valid") {
            return { isAuthorized: true, context: { userId: "42" } };
          }
          return { isAuthorized: false };
        }
      });
    `;

    const mod = await importBundle({ code: handlerCode, projectDir, type: "auth" });

    const response = await mod.handler(makeAuthEvent({
      headers: { authorization: "Bearer invalid" }
    }));

    expect(response.isAuthorized).toBe(false);
    expect(response.context).toBeUndefined();
  });

  it("should return isAuthorized false on error (fail-closed)", async () => {
    const handlerCode = `
      import { defineAuth } from "./src/handlers/define-auth";

      export default defineAuth({
        onAuth: async () => {
          throw new Error("unexpected error");
        }
      });
    `;

    const mod = await importBundle({ code: handlerCode, projectDir, type: "auth" });

    const response = await mod.handler(makeAuthEvent());

    expect(response.isAuthorized).toBe(false);
  });

  it("should pass queryStringParameters and routeArn to handler", async () => {
    const handlerCode = `
      import { defineAuth } from "./src/handlers/define-auth";

      export default defineAuth({
        onAuth: async ({ queryStringParameters, routeArn }) => {
          return {
            isAuthorized: true,
            context: {
              apiKey: queryStringParameters?.key ?? "none",
              route: routeArn ?? "unknown",
            }
          };
        }
      });
    `;

    const mod = await importBundle({ code: handlerCode, projectDir, type: "auth" });

    const response = await mod.handler(makeAuthEvent({
      queryStringParameters: { key: "abc123" },
      routeArn: "arn:aws:execute-api:us-east-1:123:api/GET/profile",
    }));

    expect(response.isAuthorized).toBe(true);
    expect(response.context?.apiKey).toBe("abc123");
    expect(response.context?.route).toBe("arn:aws:execute-api:us-east-1:123:api/GET/profile");
  });

  describe("config extraction", () => {

    it("should extract auth config without runtime props", () => {
      const source = `
        import { defineAuth } from "effortless-aws";

        export const myAuth = defineAuth({
          name: "token-auth",
          identitySource: "$request.header.Authorization",
          ttl: 300,
          onAuth: async ({ headers }) => ({ isAuthorized: true })
        });
      `;

      const configs = extractAuthConfigs(source);

      expect(configs).toHaveLength(1);
      expect(configs[0]!.exportName).toBe("myAuth");
      expect(configs[0]!.config).toEqual({
        name: "token-auth",
        identitySource: "$request.header.Authorization",
        ttl: 300,
      });
      expect(configs[0]!.config).not.toHaveProperty("onAuth");
    });

    it("should extract authRef from defineHttp config", () => {
      const source = `
        import { defineHttp } from "effortless-aws";
        import { tokenAuth } from "./auth";

        export const api = defineHttp({
          method: "GET",
          path: "/profile",
          auth: tokenAuth,
          onRequest: async ({ req }) => ({ status: 200 })
        });
      `;

      const configs = extractConfigs(source);

      expect(configs).toHaveLength(1);
      expect(configs[0]!.authRef).toBe("tokenAuth");
      expect(configs[0]!.config).not.toHaveProperty("auth");
    });

    it("should not have authRef when no auth is set", () => {
      const source = `
        import { defineHttp } from "effortless-aws";

        export const api = defineHttp({
          method: "GET",
          path: "/public",
          onRequest: async ({ req }) => ({ status: 200 })
        });
      `;

      const configs = extractConfigs(source);

      expect(configs).toHaveLength(1);
      expect(configs[0]!.authRef).toBeUndefined();
    });

  });

});
