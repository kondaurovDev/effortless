import * as Layer from "effect/Layer";
import type { ApiGatewayV2ClientConfig } from "@aws-sdk/client-apigatewayv2";
import type { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import type { IAMClientConfig } from "@aws-sdk/client-iam";
import type { LambdaClientConfig } from "@aws-sdk/client-lambda";
import type { ResourceGroupsTaggingAPIClientConfig } from "@aws-sdk/client-resource-groups-tagging-api";
import * as apigatewayv2 from "./apigatewayv2.js";
import * as dynamodb from "./dynamodb.js";
import * as iam from "./iam.js";
import * as lambda from "./lambda.js";
import * as resource_groups_tagging_api from "./resource-groups-tagging-api.js";

// *****  GENERATED CODE *****
export { apigatewayv2 };
export { dynamodb };
export { iam };
export { lambda };
export { resource_groups_tagging_api };

export const AllClientsDefault = Layer.mergeAll(
  apigatewayv2.ApiGatewayV2Client.Default(),
  dynamodb.DynamoDBClient.Default(),
  iam.IAMClient.Default(),
  lambda.LambdaClient.Default(),
  resource_groups_tagging_api.ResourceGroupsTaggingAPIClient.Default()
);

export const makeClients = (config?: {
  apigatewayv2?: ApiGatewayV2ClientConfig,
  dynamodb?: DynamoDBClientConfig,
  iam?: IAMClientConfig,
  lambda?: LambdaClientConfig,
  resource_groups_tagging_api?: ResourceGroupsTaggingAPIClientConfig
}) => Layer.mergeAll(
  apigatewayv2.ApiGatewayV2Client.Default(config?.apigatewayv2),
  dynamodb.DynamoDBClient.Default(config?.dynamodb),
  iam.IAMClient.Default(config?.iam),
  lambda.LambdaClient.Default(config?.lambda),
  resource_groups_tagging_api.ResourceGroupsTaggingAPIClient.Default(config?.resource_groups_tagging_api)
);
            
            





