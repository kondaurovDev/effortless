import { Effect } from "effect";
import { apigatewayv2, lambda } from "./clients";

export type AuthorizerConfig = {
  apiId: string;
  region: string;
  authorizerName: string;
  functionArn: string;
  identitySource?: string;
  ttl?: number;
};

export const ensureAuthorizer = (config: AuthorizerConfig) =>
  Effect.gen(function* () {
    const authorizerUri = `arn:aws:apigateway:${config.region}:lambda:path/2015-03-31/functions/${config.functionArn}/invocations`;

    // Find existing authorizer by name
    const existing = yield* apigatewayv2.make("get_authorizers", { ApiId: config.apiId });
    const existingAuth = existing.Items?.find(a => a.Name === config.authorizerName);

    let authorizerId: string;

    if (existingAuth) {
      yield* Effect.logDebug(`Authorizer already exists: ${config.authorizerName}`);
      authorizerId = existingAuth.AuthorizerId!;

      // Update in case URI or settings changed
      yield* apigatewayv2.make("update_authorizer", {
        ApiId: config.apiId,
        AuthorizerId: authorizerId,
        AuthorizerUri: authorizerUri,
        AuthorizerPayloadFormatVersion: "2.0",
        AuthorizerType: "REQUEST",
        EnableSimpleResponses: true,
        ...(config.identitySource !== undefined ? { IdentitySource: [config.identitySource] } : {}),
        AuthorizerResultTtlInSeconds: config.ttl ?? 0,
      });
    } else {
      yield* Effect.logInfo(`Creating authorizer: ${config.authorizerName}`);

      const result = yield* apigatewayv2.make("create_authorizer", {
        ApiId: config.apiId,
        Name: config.authorizerName,
        AuthorizerType: "REQUEST",
        AuthorizerUri: authorizerUri,
        AuthorizerPayloadFormatVersion: "2.0",
        EnableSimpleResponses: true,
        IdentitySource: config.identitySource ? [config.identitySource] : [],
        AuthorizerResultTtlInSeconds: config.ttl ?? 0,
      });

      authorizerId = result.AuthorizerId!;
    }

    // Add Lambda invoke permission for API Gateway
    yield* addAuthorizerPermission(config.functionArn, config.apiId, config.region);

    return { authorizerId };
  });

const addAuthorizerPermission = (
  functionArn: string,
  apiId: string,
  region: string
) =>
  Effect.gen(function* () {
    const statementId = `authorizer-${apiId}`;
    const accountId = functionArn.split(":")[4];
    const sourceArn = `arn:aws:execute-api:${region}:${accountId}:${apiId}/authorizers/*`;

    yield* lambda.make("add_permission", {
      FunctionName: functionArn,
      StatementId: statementId,
      Action: "lambda:InvokeFunction",
      Principal: "apigateway.amazonaws.com",
      SourceArn: sourceArn,
    }).pipe(
      Effect.catchIf(
        e => e._tag === "LambdaError" && e.is("ResourceConflictException"),
        () => Effect.logDebug("Authorizer permission already exists")
      )
    );
  });

export const deleteAuthorizer = (apiId: string, authorizerId: string) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Deleting authorizer: ${authorizerId}`);
    yield* apigatewayv2.make("delete_authorizer", {
      ApiId: apiId,
      AuthorizerId: authorizerId,
    }).pipe(
      Effect.catchIf(
        e => e._tag === "ApiGatewayV2Error" && e.is("NotFoundException"),
        () => Effect.logDebug(`Authorizer ${authorizerId} not found, skipping`)
      )
    );
  });
