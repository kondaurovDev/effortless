import { describe, it, expect } from "vitest"

import { extractApiConfigs, extractTableConfigs } from "~cli/build/bundle"

describe("params extraction", () => {

  describe("extractApiConfigs", () => {

    it("should extract param entries from handler", () => {
      const source = `
        import { defineApi, param } from "effortless-aws";

        export const api = defineApi({
          basePath: "/orders",
          config: {
            dbUrl: param("database-url"),
          },
          get: { "/": async ({ req, config }) => ({ status: 200 }) }
        });
      `;

      const configs = extractApiConfigs(source);

      expect(configs).toHaveLength(1);
      expect(configs[0]!.secretEntries).toEqual([
        { propName: "dbUrl", ssmKey: "database-url" }
      ]);
    });

    it("should extract multiple param entries", () => {
      const source = `
        import { defineApi, param } from "effortless-aws";

        export const api = defineApi({
          basePath: "/orders",
          config: {
            dbUrl: param("database-url"),
            apiKey: param("stripe-api-key"),
          },
          get: { "/": async ({ req, config }) => ({ status: 200 }) }
        });
      `;

      const configs = extractApiConfigs(source);

      expect(configs).toHaveLength(1);
      expect(configs[0]!.secretEntries).toEqual([
        { propName: "dbUrl", ssmKey: "database-url" },
        { propName: "apiKey", ssmKey: "stripe-api-key" }
      ]);
    });

    it("should extract param entries with transform", () => {
      const source = `
        import { defineApi, param } from "effortless-aws";
        import TOML from "smol-toml";

        export const api = defineApi({
          basePath: "/orders",
          config: {
            appConfig: param("app-config", TOML.parse),
          },
          get: { "/": async ({ req, config }) => ({ status: 200 }) }
        });
      `;

      const configs = extractApiConfigs(source);

      expect(configs).toHaveLength(1);
      expect(configs[0]!.secretEntries).toEqual([
        { propName: "appConfig", ssmKey: "app-config" }
      ]);
    });

    it("should return empty secretEntries when no params property", () => {
      const source = `
        import { defineApi } from "effortless-aws";

        export const hello = defineApi({
          basePath: "/hello",
          get: { "/": async ({ req }) => ({ status: 200 }) }
        });
      `;

      const configs = extractApiConfigs(source);

      expect(configs).toHaveLength(1);
      expect(configs[0]!.secretEntries).toEqual([]);
    });

    it("should extract params from default export", () => {
      const source = `
        import { defineApi, param } from "effortless-aws";

        export default defineApi({
          basePath: "/orders",
          config: {
            dbUrl: param("database-url"),
          },
          get: { "/": async ({ req }) => ({ status: 200 }) }
        });
      `;

      const configs = extractApiConfigs(source);

      expect(configs).toHaveLength(1);
      expect(configs[0]!.exportName).toBe("default");
      expect(configs[0]!.secretEntries).toEqual([
        { propName: "dbUrl", ssmKey: "database-url" }
      ]);
    });

    it("should not leak params into static config", () => {
      const source = `
        import { defineApi, param } from "effortless-aws";

        export const api = defineApi({
          basePath: "/orders",
          config: {
            dbUrl: param("database-url"),
          },
          get: { "/": async ({ req }) => ({ status: 200 }) }
        });
      `;

      const configs = extractApiConfigs(source);

      expect(configs[0]!.config).toEqual({ basePath: "/orders" });
      expect(configs[0]!.config).not.toHaveProperty("config");
    });

  });

  describe("secret() extraction", () => {

    it("should derive SSM key from property name (camelCase → kebab-case)", () => {
      const source = `
        import { defineApi, secret } from "effortless-aws";

        export const api = defineApi({
          basePath: "/orders",
          config: {
            authSecret: secret(),
            dbUrl: secret(),
          },
          get: { "/": async ({ req, config }) => ({ status: 200 }) }
        });
      `;

      const configs = extractApiConfigs(source);

      expect(configs[0]!.secretEntries).toEqual([
        { propName: "authSecret", ssmKey: "auth-secret" },
        { propName: "dbUrl", ssmKey: "db-url" },
      ]);
    });

    it("should use explicit key when provided", () => {
      const source = `
        import { defineApi, secret } from "effortless-aws";

        export const api = defineApi({
          basePath: "/orders",
          config: {
            dbUrl: secret({ key: "my-custom-key" }),
          },
          get: { "/": async ({ req }) => ({ status: 200 }) }
        });
      `;

      const configs = extractApiConfigs(source);

      expect(configs[0]!.secretEntries).toEqual([
        { propName: "dbUrl", ssmKey: "my-custom-key" },
      ]);
    });

    it("should extract generate spec for generateHex", () => {
      const source = `
        import { defineApi, secret, generateHex } from "effortless-aws";

        export const api = defineApi({
          basePath: "/orders",
          config: {
            authSecret: secret({ generate: generateHex(32) }),
          },
          get: { "/": async ({ req }) => ({ status: 200 }) }
        });
      `;

      const configs = extractApiConfigs(source);

      expect(configs[0]!.secretEntries).toEqual([
        { propName: "authSecret", ssmKey: "auth-secret", generate: { type: "hex", bytes: 32 } },
      ]);
    });

    it("should extract generate spec for generateBase64", () => {
      const source = `
        import { defineApi, secret, generateBase64 } from "effortless-aws";

        export const api = defineApi({
          basePath: "/orders",
          config: {
            token: secret({ generate: generateBase64(16) }),
          },
          get: { "/": async ({ req }) => ({ status: 200 }) }
        });
      `;

      const configs = extractApiConfigs(source);

      expect(configs[0]!.secretEntries).toEqual([
        { propName: "token", ssmKey: "token", generate: { type: "base64", bytes: 16 } },
      ]);
    });

    it("should extract generate spec for generateUuid", () => {
      const source = `
        import { defineApi, secret, generateUuid } from "effortless-aws";

        export const api = defineApi({
          basePath: "/orders",
          config: {
            instanceId: secret({ generate: generateUuid() }),
          },
          get: { "/": async ({ req }) => ({ status: 200 }) }
        });
      `;

      const configs = extractApiConfigs(source);

      expect(configs[0]!.secretEntries).toEqual([
        { propName: "instanceId", ssmKey: "instance-id", generate: { type: "uuid" } },
      ]);
    });

    it("should support secret with key + generate together", () => {
      const source = `
        import { defineApi, secret, generateHex } from "effortless-aws";

        export const api = defineApi({
          basePath: "/orders",
          config: {
            hmacKey: secret({ key: "hmac-secret", generate: generateHex(64) }),
          },
          get: { "/": async ({ req }) => ({ status: 200 }) }
        });
      `;

      const configs = extractApiConfigs(source);

      expect(configs[0]!.secretEntries).toEqual([
        { propName: "hmacKey", ssmKey: "hmac-secret", generate: { type: "hex", bytes: 64 } },
      ]);
    });

  });

  describe("extractTableConfigs", () => {

    it("should extract param entries from table handler", () => {
      const source = `
        import { defineTable, param } from "effortless-aws";

        export const orders = defineTable({
          name: "orders",
          config: {
            webhookUrl: param("webhook-url"),
          },
          onRecord: async ({ record, config }) => {}
        });
      `;

      const configs = extractTableConfigs(source);

      expect(configs).toHaveLength(1);
      expect(configs[0]!.secretEntries).toEqual([
        { propName: "webhookUrl", ssmKey: "webhook-url" }
      ]);
    });

    it("should return empty secretEntries for table without params", () => {
      const source = `
        import { defineTable } from "effortless-aws";

        export const orders = defineTable({
          name: "orders",
          onRecord: async ({ record }) => {}
        });
      `;

      const configs = extractTableConfigs(source);

      expect(configs).toHaveLength(1);
      expect(configs[0]!.secretEntries).toEqual([]);
    });

    it("should not leak params into table static config", () => {
      const source = `
        import { defineTable, param } from "effortless-aws";

        export const orders = defineTable({
          config: {
            webhookUrl: param("webhook-url"),
          },
          onRecord: async ({ record }) => {}
        });
      `;

      const configs = extractTableConfigs(source);

      expect(configs[0]!.config).not.toHaveProperty("config");
    });

  });

});
