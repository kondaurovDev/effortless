import { Effect } from "effect";
import { apigatewayv2, lambda } from "./clients";

export type WebSocketApiConfig = {
  projectName: string;
  stage: string;
  handlerName: string;
  region: string;
  tags?: Record<string, string>;
};

export type WebSocketApiResult = {
  apiId: string;
  wsUrl: string;
};

/**
 * Create or update a WebSocket API Gateway.
 * Each WebSocket handler gets its own API.
 * Naming convention: ${project}-${stage}-${handlerName}-ws
 */
export const ensureWebSocketApi = (config: WebSocketApiConfig) =>
  Effect.gen(function* () {
    const apiName = `${config.projectName}-${config.stage}-${config.handlerName}-ws`;

    const existingApis = yield* apigatewayv2.make("get_apis", {});
    const existingApi = existingApis.Items?.find(api => api.Name === apiName);

    let apiId: string;

    if (existingApi) {
      yield* Effect.logDebug(`Using existing WebSocket API: ${apiName}`);
      apiId = existingApi.ApiId!;

      if (config.tags) {
        const apiArn = `arn:aws:apigateway:${config.region}::/apis/${apiId}`;
        yield* apigatewayv2.make("tag_resource", {
          ResourceArn: apiArn,
          Tags: config.tags,
        });
      }
    } else {
      yield* Effect.logDebug(`Creating WebSocket API: ${apiName}`);

      const createResult = yield* apigatewayv2.make("create_api", {
        Name: apiName,
        ProtocolType: "WEBSOCKET",
        RouteSelectionExpression: "$request.body.action",
        Tags: config.tags,
      });

      apiId = createResult.ApiId!;

      // Create production stage with auto-deploy
      yield* apigatewayv2.make("create_stage", {
        ApiId: apiId,
        StageName: "production",
        AutoDeploy: true,
      });
    }

    const wsUrl = `wss://${apiId}.execute-api.${config.region}.amazonaws.com/production`;
    return { apiId, wsUrl };
  });

export type WebSocketRoutesConfig = {
  apiId: string;
  region: string;
  functionArn: string;
};

/**
 * Create integration and all 3 routes ($connect, $disconnect, $default)
 * pointing to the same Lambda function.
 */
export const addWebSocketRoutes = (config: WebSocketRoutesConfig) =>
  Effect.gen(function* () {
    const { apiId, region, functionArn } = config;
    const integrationUri = `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${functionArn}/invocations`;

    // Find or create integration
    const existingIntegrations = yield* apigatewayv2.make("get_integrations", { ApiId: apiId });
    let integrationId = existingIntegrations.Items?.find(
      i => i.IntegrationUri === integrationUri
    )?.IntegrationId;

    if (!integrationId) {
      yield* Effect.logDebug("Creating WebSocket integration");
      const integrationResult = yield* apigatewayv2.make("create_integration", {
        ApiId: apiId,
        IntegrationType: "AWS_PROXY",
        IntegrationUri: integrationUri,
        IntegrationMethod: "POST",
      });
      integrationId = integrationResult.IntegrationId!;
    }

    const target = `integrations/${integrationId}`;

    // Create/update the three standard routes
    const routeKeys = ["$connect", "$disconnect", "$default"];
    const existingRoutes = yield* apigatewayv2.make("get_routes", { ApiId: apiId });

    for (const routeKey of routeKeys) {
      const existingRoute = existingRoutes.Items?.find(r => r.RouteKey === routeKey);

      if (!existingRoute) {
        yield* Effect.logDebug(`Creating route: ${routeKey}`);
        yield* apigatewayv2.make("create_route", {
          ApiId: apiId,
          RouteKey: routeKey,
          Target: target,
        });
      } else if (existingRoute.Target !== target) {
        yield* Effect.logDebug(`Updating route target: ${routeKey}`);
        yield* apigatewayv2.make("update_route", {
          ApiId: apiId,
          RouteId: existingRoute.RouteId!,
          RouteKey: routeKey,
          Target: target,
        });
      } else {
        yield* Effect.logDebug(`Route already exists: ${routeKey}`);
      }
    }

    // Add Lambda invoke permission for API Gateway
    yield* addWebSocketLambdaPermission(functionArn, apiId, region);
  });

const addWebSocketLambdaPermission = (
  functionArn: string,
  apiId: string,
  region: string
) =>
  Effect.gen(function* () {
    const statementId = `apigateway-ws-${apiId}`;
    const accountId = functionArn.split(":")[4];
    const sourceArn = `arn:aws:execute-api:${region}:${accountId}:${apiId}/*/*`;

    yield* lambda.make("add_permission", {
      FunctionName: functionArn,
      StatementId: statementId,
      Action: "lambda:InvokeFunction",
      Principal: "apigateway.amazonaws.com",
      SourceArn: sourceArn,
    }).pipe(
      Effect.catchIf(
        e => e._tag === "LambdaError" && e.is("ResourceConflictException"),
        () => Effect.logDebug("WebSocket permission already exists")
      )
    );
  });

/**
 * Delete a WebSocket API Gateway.
 */
export const deleteWebSocketApi = (apiId: string) =>
  Effect.gen(function* () {
    yield* Effect.logDebug(`Deleting WebSocket API: ${apiId}`);
    yield* apigatewayv2.make("delete_api", {
      ApiId: apiId,
    }).pipe(
      Effect.catchIf(
        e => e._tag === "ApiGatewayV2Error" && e.is("NotFoundException"),
        () => Effect.logDebug(`WebSocket API ${apiId} not found, skipping`)
      )
    );
  });
