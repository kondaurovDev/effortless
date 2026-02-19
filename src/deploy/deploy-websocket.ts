import { Effect } from "effect";
import type { ExtractedWebSocketFunction } from "~/build/bundle";
import {
  ensureWebSocketApi,
  addWebSocketRoutes,
  makeTags,
  resolveStage,
  type TagContext,
  type LambdaStatus,
} from "../aws";
import {
  type DeployInput,
  deployCoreLambda,
} from "./shared";

export type DeployWebSocketResult = {
  exportName: string;
  functionArn: string;
  status: LambdaStatus;
  wsApiId: string;
  wsUrl: string;
};

type DeployWebSocketFunctionInput = {
  input: DeployInput;
  fn: ExtractedWebSocketFunction;
  layerArn?: string;
  external?: string[];
  depsEnv?: Record<string, string>;
  depsPermissions?: readonly string[];
  staticGlobs?: string[];
};

const WS_DEFAULT_PERMISSIONS = ["execute-api:ManageConnections", "logs:*"] as const;

/** @internal */
export const deployWebSocketFunction = ({
  input, fn, layerArn, external, depsEnv, depsPermissions, staticGlobs
}: DeployWebSocketFunctionInput) =>
  Effect.gen(function* () {
    const { exportName, config } = fn;
    const handlerName = config.name ?? exportName;

    const tagCtx: TagContext = {
      project: input.project,
      stage: resolveStage(input.stage),
      handler: handlerName,
    };

    // 1. Create WebSocket API
    yield* Effect.logDebug("Creating WebSocket API...");
    const { apiId: wsApiId, wsUrl } = yield* ensureWebSocketApi({
      projectName: input.project,
      stage: tagCtx.stage,
      handlerName,
      region: input.region,
      tags: makeTags(tagCtx, "api-gateway"),
    });

    // 2. Inject WebSocket endpoint info into Lambda env vars
    const wsEnv: Record<string, string> = {
      EFF_WS_API_ID: wsApiId,
      EFF_WS_URL: wsUrl,
      ...depsEnv,
    };

    // 3. Deploy Lambda
    const { functionArn, status } = yield* deployCoreLambda({
      input,
      exportName,
      handlerName,
      defaultPermissions: WS_DEFAULT_PERMISSIONS,
      bundleType: "webSocket",
      ...(config.permissions ? { permissions: config.permissions } : {}),
      ...(config.memory ? { memory: config.memory } : {}),
      ...(config.timeout ? { timeout: config.timeout } : {}),
      ...(layerArn ? { layerArn } : {}),
      ...(external ? { external } : {}),
      depsEnv: wsEnv,
      ...(depsPermissions ? { depsPermissions } : {}),
      ...(staticGlobs && staticGlobs.length > 0 ? { staticGlobs } : {}),
    });

    // 4. Setup routes ($connect, $disconnect, $default) → Lambda
    yield* Effect.logDebug("Setting up WebSocket routes...");
    yield* addWebSocketRoutes({
      apiId: wsApiId,
      region: input.region,
      functionArn,
    });

    yield* Effect.logDebug(`WebSocket deployment complete! URL: ${wsUrl}`);

    return {
      exportName,
      functionArn,
      status,
      wsApiId,
      wsUrl,
    };
  });
