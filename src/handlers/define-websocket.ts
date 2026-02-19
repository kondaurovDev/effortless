import type { LambdaWithPermissions, AnyParamRef, ResolveConfig } from "../helpers";
import type { TableHandler } from "./define-table";
import type { TableClient } from "~/runtime/table-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTableHandler = TableHandler<any, any, any, any, any, any>;

/** Maps a deps declaration to resolved runtime client types */
type ResolveDeps<D> = {
  [K in keyof D]: D[K] extends TableHandler<infer T, any, any, any, any> ? TableClient<T> : never;
};

/**
 * Setup factory type — conditional on whether deps/config are declared.
 * No deps/config: `() => C | Promise<C>`
 * With deps/config: `(args: { deps?, config? }) => C | Promise<C>`
 */
type SetupFactory<C, D, P> = [D | P] extends [undefined]
  ? () => C | Promise<C>
  : (args:
      & ([D] extends [undefined] ? {} : { deps: ResolveDeps<D> })
      & ([P] extends [undefined] ? {} : { config: ResolveConfig<P & {}> })
    ) => C | Promise<C>;

/**
 * Configuration options for a WebSocket handler (static Lambda settings).
 */
export type WebSocketConfig = LambdaWithPermissions;

/**
 * Send function injected into onMessage callback.
 * Serializes data to JSON and posts to a specific connection via API Gateway Management API.
 */
export type WebSocketSendFn = (connectionId: string, data: unknown) => Promise<void>;

/**
 * Called when a client connects via $connect route.
 * Throw to reject the connection (returns 403 to API Gateway).
 */
export type WebSocketConnectFn<C = undefined, D = undefined, P = undefined, S extends string[] | undefined = undefined> =
  (args: { connectionId: string; headers: Record<string, string | undefined>; query: Record<string, string | undefined> }
    & ([C] extends [undefined] ? {} : { ctx: C })
    & ([D] extends [undefined] ? {} : { deps: ResolveDeps<D> })
    & ([P] extends [undefined] ? {} : { config: ResolveConfig<P> })
    & ([S] extends [undefined] ? {} : { readStatic: (path: string) => string })
  ) => Promise<void>;

/**
 * Called when a message is received on $default route.
 * Receives the raw body string and a send function for replying.
 */
export type WebSocketMessageFn<C = undefined, D = undefined, P = undefined, S extends string[] | undefined = undefined> =
  (args: { connectionId: string; body: string; send: WebSocketSendFn }
    & ([C] extends [undefined] ? {} : { ctx: C })
    & ([D] extends [undefined] ? {} : { deps: ResolveDeps<D> })
    & ([P] extends [undefined] ? {} : { config: ResolveConfig<P> })
    & ([S] extends [undefined] ? {} : { readStatic: (path: string) => string })
  ) => Promise<void>;

/**
 * Called when a client disconnects via $disconnect route.
 */
export type WebSocketDisconnectFn<C = undefined, D = undefined, P = undefined, S extends string[] | undefined = undefined> =
  (args: { connectionId: string }
    & ([C] extends [undefined] ? {} : { ctx: C })
    & ([D] extends [undefined] ? {} : { deps: ResolveDeps<D> })
    & ([P] extends [undefined] ? {} : { config: ResolveConfig<P> })
    & ([S] extends [undefined] ? {} : { readStatic: (path: string) => string })
  ) => Promise<void>;

export type DefineWebSocketOptions<
  C = undefined,
  D extends Record<string, AnyTableHandler> | undefined = undefined,
  P extends Record<string, AnyParamRef> | undefined = undefined,
  S extends string[] | undefined = undefined
> = WebSocketConfig & {
  /** Called when a client connects. Throw to reject the connection (returns 403). */
  onConnect?: WebSocketConnectFn<C, D, P, S>;
  /** Called when a message is received on $default route. Required. */
  onMessage: WebSocketMessageFn<C, D, P, S>;
  /** Called when a client disconnects. */
  onDisconnect?: WebSocketDisconnectFn<C, D, P, S>;
  /** Error handler called when any callback throws. Defaults to console.error. */
  onError?: (error: unknown) => void;
  /**
   * Factory function to initialize shared state for the handler.
   * Called once on cold start, result is cached and reused across invocations.
   * When deps/config are declared, receives them as argument.
   */
  setup?: SetupFactory<C, D, P>;
  /**
   * Dependencies on other handlers (tables, queues, etc.).
   * Typed clients are injected into the handler via the `deps` argument.
   */
  deps?: D;
  /**
   * SSM Parameter Store parameters.
   * Declare with `param()` helper. Values are fetched and cached at cold start.
   */
  config?: P;
  /**
   * Static file glob patterns to bundle into the Lambda ZIP.
   * Files are accessible at runtime via the `readStatic` callback argument.
   */
  static?: S;
};

/**
 * Internal handler object created by defineWebSocket
 * @internal
 */
export type WebSocketHandler<C = undefined, D = undefined, P = undefined, S extends string[] | undefined = undefined> = {
  readonly __brand: "effortless-websocket";
  readonly __spec: WebSocketConfig;
  readonly onConnect?: WebSocketConnectFn<C, D, P, S>;
  readonly onMessage: WebSocketMessageFn<C, D, P, S>;
  readonly onDisconnect?: WebSocketDisconnectFn<C, D, P, S>;
  readonly onError?: (error: unknown) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly setup?: (...args: any[]) => C | Promise<C>;
  readonly deps?: D;
  readonly config?: P;
  readonly static?: string[];
};

/**
 * Define a WebSocket API with a Lambda message handler.
 *
 * Creates:
 * - API Gateway WebSocket API with $connect, $disconnect, $default routes
 * - Lambda function handling all routes (single Lambda)
 * - Lambda permission for API Gateway invocation
 *
 * The `send(connectionId, data)` function is injected into `onMessage` for
 * pushing messages back to connected clients via the Management API.
 *
 * @example Basic echo server
 * ```typescript
 * export const echo = defineWebSocket({
 *   onMessage: async ({ connectionId, body, send }) => {
 *     await send(connectionId, { echo: body });
 *   }
 * });
 * ```
 *
 * @example With connection management
 * ```typescript
 * export const chat = defineWebSocket({
 *   onConnect: async ({ connectionId, deps }) => {
 *     await deps.connections.put({ connectionId, connectedAt: Date.now() });
 *   },
 *   onMessage: async ({ connectionId, body, send, deps }) => {
 *     const data = JSON.parse(body);
 *     await send(connectionId, { received: data });
 *   },
 *   onDisconnect: async ({ connectionId, deps }) => {
 *     await deps.connections.delete({ connectionId });
 *   },
 *   deps: { connections },
 * });
 * ```
 */
export const defineWebSocket = <
  C = undefined,
  D extends Record<string, AnyTableHandler> | undefined = undefined,
  P extends Record<string, AnyParamRef> | undefined = undefined,
  S extends string[] | undefined = undefined
>(
  options: DefineWebSocketOptions<C, D, P, S>
): WebSocketHandler<C, D, P, S> => {
  const { onConnect, onMessage, onDisconnect, onError, setup, deps, config, static: staticFiles, ...__spec } = options;
  return {
    __brand: "effortless-websocket",
    __spec,
    onMessage,
    ...(onConnect ? { onConnect } : {}),
    ...(onDisconnect ? { onDisconnect } : {}),
    ...(onError ? { onError } : {}),
    ...(setup ? { setup } : {}),
    ...(deps ? { deps } : {}),
    ...(config ? { config } : {}),
    ...(staticFiles ? { static: staticFiles } : {}),
  } as WebSocketHandler<C, D, P, S>;
};
