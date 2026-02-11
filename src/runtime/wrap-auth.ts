import type { AuthHandler } from "~/handlers/define-auth";

type AuthorizerEvent = {
  version?: string;
  type?: string;
  routeArn?: string;
  identitySource?: string;
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  requestContext?: {
    http?: { method?: string; path?: string };
    accountId?: string;
    apiId?: string;
    stage?: string;
  };
};

type AuthorizerResponse = {
  isAuthorized: boolean;
  context?: Record<string, string>;
};

export const wrapAuth = <C extends Record<string, string>>(handler: AuthHandler<C>) => {
  return async (event: AuthorizerEvent): Promise<AuthorizerResponse> => {
    try {
      const result = await handler.onAuth({
        headers: event.headers ?? {},
        queryStringParameters: event.queryStringParameters,
        routeArn: event.routeArn,
      });

      if (result.isAuthorized) {
        return {
          isAuthorized: true,
          ...(result.context ? { context: result.context } : {}),
        };
      }

      return { isAuthorized: false };
    } catch (error) {
      console.error("[effortless:auth]", error);
      return { isAuthorized: false };
    }
  };
};
