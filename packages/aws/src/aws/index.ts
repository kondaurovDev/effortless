// Lambda
export { ensureLambda, deleteLambda } from "./lambda.js";
export type { LambdaConfig } from "./lambda.js";

// IAM
export { ensureRole, deleteRole, listEffortlessRoles } from "./iam.js";
export type { EffortlessRole } from "./iam.js";

// DynamoDB
export { ensureTable, deleteTable, ensureEventSourceMapping } from "./dynamodb.js";
export type { EnsureTableInput, EnsureTableResult, EnsureEventSourceMappingInput, KeyType, StreamView } from "./dynamodb.js";

// API Gateway
export { ensureProjectApi, addRouteToApi, deleteApi } from "./apigateway.js";
export type { ProjectApiConfig, RouteConfig, HttpMethod } from "./apigateway.js";

// Layer
export { ensureLayer, readProductionDependencies, computeLockfileHash, collectLayerPackages, listLayerVersions, deleteAllLayerVersions, deleteLayerVersion } from "./layer.js";
export type { LayerConfig, LayerResult, LayerVersionInfo } from "./layer.js";

// Tags
export { makeTags, toAwsTagList, resolveStage, getResourcesByTags, findOrphanedResources, groupResourcesByHandler } from "./tags.js";
export type { ResourceType, TagContext } from "./tags.js";
