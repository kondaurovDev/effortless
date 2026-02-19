import { describe, it, expect } from "vitest";
import { extractWebSocketConfigs } from "~/build/bundle";
import { importBundle } from "./helpers/bundle-code";
import * as path from "path";

const projectDir = path.resolve(import.meta.dirname, "..");

// ============ WebSocket event helpers ============

const makeWSEvent = (routeKey: string, overrides: Record<string, unknown> = {}) => ({
  requestContext: {
    routeKey,
    connectionId: "test-conn-id",
    domainName: "abc123.execute-api.eu-central-1.amazonaws.com",
    stage: "production",
  },
  headers: { "x-api-key": "test-key" },
  queryStringParameters: { token: "abc" },
  body: undefined as string | undefined,
  isBase64Encoded: false,
  ...overrides,
});

// ============ Config extraction tests ============

describe("extractWebSocketConfigs", () => {
  it("extracts config from named export", () => {
    const source = `
      import { defineWebSocket } from "effortless-aws";
      export const chat = defineWebSocket({
        timeout: 30,
        onMessage: async ({ connectionId, body, send }) => {}
      });
    `;
    const configs = extractWebSocketConfigs(source);
    expect(configs).toHaveLength(1);
    expect(configs[0]!.exportName).toBe("chat");
    expect(configs[0]!.config.timeout).toBe(30);
    expect(configs[0]!.hasHandler).toBe(true);
  });

  it("extracts config from default export", () => {
    const source = `
      import { defineWebSocket } from "effortless-aws";
      export default defineWebSocket({
        memory: 512,
        onMessage: async ({ connectionId, body, send }) => {}
      });
    `;
    const configs = extractWebSocketConfigs(source);
    expect(configs).toHaveLength(1);
    expect(configs[0]!.exportName).toBe("default");
    expect(configs[0]!.config.memory).toBe(512);
    expect(configs[0]!.hasHandler).toBe(true);
  });

  it("strips runtime props from config", () => {
    const source = `
      import { defineWebSocket } from "effortless-aws";
      export const ws = defineWebSocket({
        name: "my-ws",
        memory: 256,
        onConnect: async () => {},
        onMessage: async () => {},
        onDisconnect: async () => {},
        setup: () => ({ db: "pool" }),
      });
    `;
    const configs = extractWebSocketConfigs(source);
    expect(configs[0]!.config.name).toBe("my-ws");
    expect(configs[0]!.config.memory).toBe(256);
    expect(configs[0]!.config).not.toHaveProperty("onConnect");
    expect(configs[0]!.config).not.toHaveProperty("onMessage");
    expect(configs[0]!.config).not.toHaveProperty("onDisconnect");
    expect(configs[0]!.config).not.toHaveProperty("setup");
  });

  it("extracts deps keys", () => {
    const source = `
      import { defineWebSocket } from "effortless-aws";
      import { connections } from "./connections";
      export const ws = defineWebSocket({
        deps: { connections },
        onMessage: async ({ deps }) => {}
      });
    `;
    const configs = extractWebSocketConfigs(source);
    expect(configs[0]!.depsKeys).toEqual(["connections"]);
  });

  it("extracts param entries", () => {
    const source = `
      import { defineWebSocket, param } from "effortless-aws";
      export const ws = defineWebSocket({
        config: { apiKey: param("openai-key") },
        onMessage: async ({ config }) => {}
      });
    `;
    const configs = extractWebSocketConfigs(source);
    expect(configs[0]!.paramEntries).toEqual([{ propName: "apiKey", ssmKey: "openai-key" }]);
  });

  it("extracts static globs", () => {
    const source = `
      import { defineWebSocket } from "effortless-aws";
      export const ws = defineWebSocket({
        static: ["src/prompts/*.txt"],
        onMessage: async () => {}
      });
    `;
    const configs = extractWebSocketConfigs(source);
    expect(configs[0]!.staticGlobs).toEqual(["src/prompts/*.txt"]);
  });
});

// ============ Runtime wrapper tests ============

describe("wrapWebSocket", () => {
  it("dispatches $connect and returns 200", async () => {
    const handlerCode = `
      import { defineWebSocket } from "./src/handlers/define-websocket";
      globalThis.__ws_connected = false;
      export default defineWebSocket({
        onConnect: async ({ connectionId }) => {
          globalThis.__ws_connected = connectionId;
        },
        onMessage: async () => {},
      });
    `;
    const mod = await importBundle({ code: handlerCode, projectDir, type: "webSocket" });
    const response = await mod.handler(makeWSEvent("$connect"));
    expect(response.statusCode).toBe(200);
    expect((globalThis as any).__ws_connected).toBe("test-conn-id");
  });

  it("returns 403 when onConnect throws", async () => {
    const handlerCode = `
      import { defineWebSocket } from "./src/handlers/define-websocket";
      export default defineWebSocket({
        onConnect: async () => { throw new Error("Unauthorized"); },
        onMessage: async () => {},
      });
    `;
    const mod = await importBundle({ code: handlerCode, projectDir, type: "webSocket" });
    const response = await mod.handler(makeWSEvent("$connect"));
    expect(response.statusCode).toBe(403);
  });

  it("returns 200 for $connect without onConnect handler", async () => {
    const handlerCode = `
      import { defineWebSocket } from "./src/handlers/define-websocket";
      export default defineWebSocket({
        onMessage: async () => {},
      });
    `;
    const mod = await importBundle({ code: handlerCode, projectDir, type: "webSocket" });
    const response = await mod.handler(makeWSEvent("$connect"));
    expect(response.statusCode).toBe(200);
  });

  it("dispatches $default to onMessage with body", async () => {
    const handlerCode = `
      import { defineWebSocket } from "./src/handlers/define-websocket";
      globalThis.__ws_received = null;
      export default defineWebSocket({
        onMessage: async ({ connectionId, body }) => {
          globalThis.__ws_received = { connectionId, body };
        },
      });
    `;
    const mod = await importBundle({ code: handlerCode, projectDir, type: "webSocket" });
    const response = await mod.handler(makeWSEvent("$default", { body: '{"action":"ping"}' }));
    expect(response.statusCode).toBe(200);
    const received = (globalThis as any).__ws_received;
    expect(received.connectionId).toBe("test-conn-id");
    expect(received.body).toBe('{"action":"ping"}');
  });

  it("dispatches $disconnect", async () => {
    const handlerCode = `
      import { defineWebSocket } from "./src/handlers/define-websocket";
      globalThis.__ws_disconnected = false;
      export default defineWebSocket({
        onMessage: async () => {},
        onDisconnect: async ({ connectionId }) => {
          globalThis.__ws_disconnected = connectionId;
        },
      });
    `;
    const mod = await importBundle({ code: handlerCode, projectDir, type: "webSocket" });
    const response = await mod.handler(makeWSEvent("$disconnect"));
    expect(response.statusCode).toBe(200);
    expect((globalThis as any).__ws_disconnected).toBe("test-conn-id");
  });

  it("provides send function in onMessage args", async () => {
    const handlerCode = `
      import { defineWebSocket } from "./src/handlers/define-websocket";
      globalThis.__ws_has_send = false;
      export default defineWebSocket({
        onMessage: async ({ send }) => {
          globalThis.__ws_has_send = typeof send === "function";
        },
      });
    `;
    const mod = await importBundle({ code: handlerCode, projectDir, type: "webSocket" });
    await mod.handler(makeWSEvent("$default", { body: "test" }));
    expect((globalThis as any).__ws_has_send).toBe(true);
  });

  it("passes headers and query to onConnect", async () => {
    const handlerCode = `
      import { defineWebSocket } from "./src/handlers/define-websocket";
      globalThis.__ws_connect_args = null;
      export default defineWebSocket({
        onConnect: async ({ connectionId, headers, query }) => {
          globalThis.__ws_connect_args = { connectionId, headers, query };
        },
        onMessage: async () => {},
      });
    `;
    const mod = await importBundle({ code: handlerCode, projectDir, type: "webSocket" });
    await mod.handler(makeWSEvent("$connect"));
    const args = (globalThis as any).__ws_connect_args;
    expect(args.connectionId).toBe("test-conn-id");
    expect(args.headers["x-api-key"]).toBe("test-key");
    expect(args.query.token).toBe("abc");
  });

  it("handles empty body on $default", async () => {
    const handlerCode = `
      import { defineWebSocket } from "./src/handlers/define-websocket";
      globalThis.__ws_empty_body = null;
      export default defineWebSocket({
        onMessage: async ({ body }) => {
          globalThis.__ws_empty_body = body;
        },
      });
    `;
    const mod = await importBundle({ code: handlerCode, projectDir, type: "webSocket" });
    await mod.handler(makeWSEvent("$default"));
    expect((globalThis as any).__ws_empty_body).toBe("");
  });

  it("handles base64 encoded body", async () => {
    const handlerCode = `
      import { defineWebSocket } from "./src/handlers/define-websocket";
      globalThis.__ws_decoded = null;
      export default defineWebSocket({
        onMessage: async ({ body }) => {
          globalThis.__ws_decoded = body;
        },
      });
    `;
    const mod = await importBundle({ code: handlerCode, projectDir, type: "webSocket" });
    const encoded = Buffer.from("hello world").toString("base64");
    await mod.handler(makeWSEvent("$default", { body: encoded, isBase64Encoded: true }));
    expect((globalThis as any).__ws_decoded).toBe("hello world");
  });

  it("returns 200 for $disconnect without onDisconnect handler", async () => {
    const handlerCode = `
      import { defineWebSocket } from "./src/handlers/define-websocket";
      export default defineWebSocket({
        onMessage: async () => {},
      });
    `;
    const mod = await importBundle({ code: handlerCode, projectDir, type: "webSocket" });
    const response = await mod.handler(makeWSEvent("$disconnect"));
    expect(response.statusCode).toBe(200);
  });
});
