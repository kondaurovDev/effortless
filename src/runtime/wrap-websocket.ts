import type { WebSocketHandler } from "~/handlers/define-websocket";
import { createHandlerRuntime } from "./handler-utils";

type WebSocketEvent = {
  requestContext: {
    routeKey: string;
    connectionId: string;
    domainName: string;
    stage: string;
  };
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  body?: string;
  isBase64Encoded?: boolean;
};

// Lazy-initialized management API client (cached across invocations)
let managementClient: any = null;
let cachedEndpoint: string | null = null;
let PostToConnectionCmd: any = null;

const getSendFn = (domainName: string, stage: string) => {
  const endpoint = `https://${domainName}/${stage}`;

  return async (connectionId: string, data: unknown): Promise<void> => {
    // Lazy import — @aws-sdk/client-apigatewaymanagementapi is available in Lambda Node.js runtime.
    // Variable indirection prevents TypeScript from resolving the module at compile time.
    if (!managementClient || cachedEndpoint !== endpoint) {
      const modName = "@aws-sdk/client-apigatewaymanagementapi";
      const mod: any = await import(/* webpackIgnore: true */ modName);
      managementClient = new mod.ApiGatewayManagementApiClient({ endpoint });
      PostToConnectionCmd = mod.PostToConnectionCommand;
      cachedEndpoint = endpoint;
    }

    const payload = typeof data === "string" ? data : JSON.stringify(data);

    try {
      await managementClient.send(
        new PostToConnectionCmd({
          ConnectionId: connectionId,
          Data: new TextEncoder().encode(payload),
        })
      );
    } catch (err: any) {
      // GoneException means the connection is stale
      if (err.name === "GoneException" || err.$metadata?.httpStatusCode === 410) {
        throw Object.assign(new Error(`Connection ${connectionId} is gone`), { code: "GONE" });
      }
      throw err;
    }
  };
};

export const wrapWebSocket = <C>(handler: WebSocketHandler<C>) => {
  const rt = createHandlerRuntime(handler, "websocket", handler.__spec.logLevel ?? "info");
  const handleError = handler.onError ?? ((e: unknown) => console.error(`[effortless:${rt.handlerName}]`, e));

  return async (event: WebSocketEvent) => {
    const startTime = Date.now();
    rt.patchConsole();

    try {
      const { routeKey, connectionId, domainName, stage } = event.requestContext;
      const input = { routeKey, connectionId };

      if (routeKey === "$connect") {
        if (handler.onConnect) {
          try {
            const shared = await rt.commonArgs();
            await (handler.onConnect as any)({
              connectionId,
              headers: event.headers ?? {},
              query: event.queryStringParameters ?? {},
              ...shared,
            });
            rt.logExecution(startTime, input, { accepted: true });
          } catch (error) {
            handleError(error);
            rt.logError(startTime, input, error);
            return { statusCode: 403 };
          }
        }
        return { statusCode: 200 };
      }

      if (routeKey === "$disconnect") {
        if (handler.onDisconnect) {
          try {
            const shared = await rt.commonArgs();
            await (handler.onDisconnect as any)({
              connectionId,
              ...shared,
            });
            rt.logExecution(startTime, input, { disconnected: true });
          } catch (error) {
            handleError(error);
            rt.logError(startTime, input, error);
          }
        }
        return { statusCode: 200 };
      }

      // $default route (and any custom routes)
      const body = event.isBase64Encoded && event.body
        ? Buffer.from(event.body, "base64").toString("utf-8")
        : (event.body ?? "");

      const send = getSendFn(domainName, stage);
      const shared = await rt.commonArgs();

      try {
        await (handler.onMessage as any)({
          connectionId,
          body,
          send,
          ...shared,
        });
        rt.logExecution(startTime, { ...input, body }, { processed: true });
      } catch (error) {
        handleError(error);
        rt.logError(startTime, { ...input, body }, error);
      }

      return { statusCode: 200 };
    } finally {
      rt.restoreConsole();
    }
  };
};
