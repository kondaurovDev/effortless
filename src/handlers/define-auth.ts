import type { Permission } from "./permissions";

/**
 * Configuration options extracted from DefineAuthOptions (without onAuth callback)
 */
export type AuthConfig = {
  /** Handler name. Defaults to export name if not specified */
  name?: string;
  /** Identity source expression (e.g., "$request.header.Authorization") */
  identitySource?: string;
  /** Authorizer result TTL in seconds (0 = no caching, default: 0) */
  ttl?: number;
  /** Lambda memory in MB (default: 256) */
  memory?: number;
  /** Lambda timeout in seconds (default: 10) */
  timeout?: number;
  /** Additional IAM permissions for the Lambda */
  permissions?: Permission[];
};

/**
 * Auth request object passed to the onAuth handler.
 * Contains the data from the API Gateway HTTP API v2 REQUEST authorizer event.
 */
export type AuthRequest = {
  /** Request headers */
  headers: Record<string, string | undefined>;
  /** Query string parameters */
  queryStringParameters?: Record<string, string | undefined>;
  /** The route ARN of the request being authorized */
  routeArn?: string;
};

/**
 * Auth response returned from the onAuth handler.
 * API Gateway authorizer context values are always strings.
 *
 * @typeParam C - The shape of the context object passed to downstream HTTP handlers
 */
export type AuthResponse<C extends Record<string, string> = Record<string, string>> =
  | { isAuthorized: true; context?: C }
  | { isAuthorized: false };

/**
 * The onAuth handler function type
 *
 * @typeParam C - The shape of the context object passed to downstream HTTP handlers
 */
export type AuthHandlerFn<C extends Record<string, string> = Record<string, string>> =
  (args: AuthRequest) => Promise<AuthResponse<C>>;

/**
 * Options for defining a Lambda authorizer
 *
 * @typeParam C - The shape of the context object (inferred from onAuth return type)
 */
export type DefineAuthOptions<C extends Record<string, string> = Record<string, string>> =
  AuthConfig & {
    /** Authorization handler function */
    onAuth: AuthHandlerFn<C>;
  };

/**
 * Internal handler object created by defineAuth.
 * Generic C carries the auth context type for downstream inference in defineHttp.
 * @internal
 */
export type AuthHandler<C extends Record<string, string> = Record<string, string>> = {
  readonly __brand: "effortless-auth";
  readonly config: AuthConfig;
  readonly onAuth: AuthHandlerFn<C>;
};

/**
 * Define a Lambda authorizer for protecting HTTP endpoints.
 *
 * The authorizer runs as a separate Lambda function. API Gateway invokes it
 * before the HTTP handler — if authorization fails, the handler is never called.
 * Results can be cached via the `ttl` option.
 *
 * @typeParam C - The shape of the context object (inferred from onAuth return type)
 * @param options - Configuration and authorization handler
 * @returns AuthHandler object used by the deployment system
 *
 * @example Basic token authorizer
 * ```typescript
 * export const tokenAuth = defineAuth({
 *   identitySource: "$request.header.Authorization",
 *   ttl: 300,
 *   onAuth: async ({ headers }) => {
 *     const token = headers.authorization;
 *     if (!token) return { isAuthorized: false };
 *     const user = await verifyToken(token);
 *     return { isAuthorized: true, context: { userId: user.id } };
 *   }
 * });
 * ```
 */
export const defineAuth = <C extends Record<string, string> = Record<string, string>>(
  options: DefineAuthOptions<C>
): AuthHandler<C> => {
  const { onAuth, ...config } = options;
  return {
    __brand: "effortless-auth",
    config,
    onAuth,
  } as AuthHandler<C>;
};
