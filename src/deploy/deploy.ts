import { Effect, Console } from "effect";
import { c } from "~/cli/colors";
import {
  Aws,
  ensureProjectApi,
  addRouteToApi,
  removeStaleRoutes,
  makeTags,
  resolveStage,
  type TagContext,
  ensureLayer,
  readProductionDependencies,
  collectLayerPackages
} from "../aws";
import { findHandlerFiles, discoverHandlers, type DiscoveredHandlers } from "~/build/bundle";
import type { ParamEntry } from "~/build/handler-registry";
import { collectRequiredParams, checkMissingParams } from "./resolve-config";

// Re-export from shared
export {
  type DeployResult,
  type DeployTableResult,
  type DeployAllResult,
  type DeployInput
} from "./shared";

// Re-export from deploy-http
export { deploy, deployAll } from "./deploy-http";

// Re-export from deploy-table
export { deployTable, deployAllTables } from "./deploy-table";

// Import for internal use
import { type DeployInput, type DeployResult, type DeployTableResult } from "./shared";
import { deployLambda } from "./deploy-http";
import { deployTableFunction } from "./deploy-table";
import { deployAppLambda } from "./deploy-app";
import { deployStaticSite, type DeployStaticSiteResult } from "./deploy-static-site";
import { deployFifoQueueFunction, type DeployFifoQueueResult } from "./deploy-fifo-queue";
import { deployWebSocketFunction, type DeployWebSocketResult } from "./deploy-websocket";

// ============ Progress tracking ============

type StepStatus = "created" | "updated" | "unchanged";

const statusLabel = (status: StepStatus) => {
  switch (status) {
    case "created": return c.green("created");
    case "updated": return c.yellow("updated");
    case "unchanged": return c.dim("unchanged");
  }
};

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

type HandlerManifest = { name: string; type: string }[];

/**
 * Create a live progress tracker.
 * TTY mode: pre-prints all handler lines with a spinner, then updates them in place via ANSI escape codes.
 * Non-TTY mode (CI): prints each line sequentially as handlers complete.
 */
const createLiveProgress = (manifest: HandlerManifest) => {
  const isTTY = process.stdout.isTTY ?? false;
  const lineIndex = new Map<string, number>();
  manifest.forEach((h, i) => lineIndex.set(`${h.name}:${h.type}`, i));

  const results = new Map<string, StepStatus>();
  const startTime = Date.now();
  let frame = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  if (isTTY) {
    for (const h of manifest) {
      process.stdout.write(`  ${c.dim(`${h.name} (${h.type})`)} ${c.cyan(SPINNER[0]!)}\n`);
    }
    timer = setInterval(() => {
      frame = (frame + 1) % SPINNER.length;
      for (const h of manifest) {
        const key = `${h.name}:${h.type}`;
        if (results.has(key)) continue;
        const idx = lineIndex.get(key)!;
        const up = manifest.length - idx;
        const line = `  ${c.dim(`${h.name} (${h.type})`)} ${c.cyan(SPINNER[frame]!)}`;
        process.stdout.write(`\x1b[${up}A\x1b[2K${line}\x1b[${up}B\x1b[G`);
      }
    }, 80);
  }

  const formatDuration = () => {
    const sec = ((Date.now() - startTime) / 1000).toFixed(1);
    return c.dim(`${sec}s`);
  };

  return (name: string, type: string, status: StepStatus): Effect.Effect<void> =>
    Effect.sync(() => {
      const key = `${name}:${type}`;
      results.set(key, status);
      const line = `  ${name} ${c.dim(`(${type})`)} ${statusLabel(status)} ${formatDuration()}`;

      if (isTTY) {
        const idx = lineIndex.get(key) ?? 0;
        const up = manifest.length - idx;
        process.stdout.write(`\x1b[${up}A\x1b[2K${line}\x1b[${up}B\x1b[G`);
        if (results.size === manifest.length && timer) {
          clearInterval(timer);
        }
      } else {
        process.stdout.write(`  ${c.dim(`[${results.size}/${manifest.length}]`)} ${name} ${c.dim(`(${type})`)} ${statusLabel(status)} ${formatDuration()}\n`);
      }
    });
};

const DEPLOY_CONCURRENCY = 5;

// ============ Layer preparation ============

type PrepareLayerInput = {
  project: string;
  stage: string;
  region: string;
  projectDir: string;
};

const prepareLayer = (input: PrepareLayerInput) =>
  Effect.gen(function* () {
    const layerResult = yield* ensureLayer({
      project: input.project,
      stage: input.stage,
      region: input.region,
      projectDir: input.projectDir
    }).pipe(
      Effect.provide(
        Aws.makeClients({
          lambda: { region: input.region }
        })
      )
    );

    const prodDeps = layerResult
      ? yield* readProductionDependencies(input.projectDir)
      : [];
    const { packages: external, warnings: layerWarnings } = prodDeps.length > 0
      ? yield* Effect.sync(() => collectLayerPackages(input.projectDir, prodDeps))
      : { packages: [] as string[], warnings: [] as string[] };

    for (const warning of layerWarnings) {
      yield* Effect.logWarning(`[layer] ${warning}`);
    }

    yield* Effect.logDebug(`Layer result: ${layerResult ? "exists" : "null"}, external packages: ${external.length}`);
    if (external.length > 0) {
      yield* Effect.logDebug(`Bundling with ${external.length} external packages from layer`);
    }

    return {
      layerArn: layerResult?.layerVersionArn,
      layerVersion: layerResult?.version,
      layerStatus: layerResult?.status,
      external
    };
  });

// ============ Deps resolution ============

const TABLE_CLIENT_PERMISSIONS = [
  "dynamodb:GetItem",
  "dynamodb:PutItem",
  "dynamodb:DeleteItem",
  "dynamodb:Query",
  "dynamodb:Scan",
  "dynamodb:UpdateItem",
  "dynamodb:BatchGetItem",
  "dynamodb:BatchWriteItem",
] as const;

/**
 * Build a map of all table handler export names to their resolved DynamoDB table names.
 * Table names are deterministic: ${project}-${stage}-${handlerName}
 */
const buildTableNameMap = (
  tableHandlers: DiscoveredHandlers["tableHandlers"],
  project: string,
  stage: string
): Map<string, string> => {
  const map = new Map<string, string>();
  for (const { exports } of tableHandlers) {
    for (const fn of exports) {
      const handlerName = fn.config.name ?? fn.exportName;
      map.set(fn.exportName, `${project}-${stage}-${handlerName}`);
    }
  }
  return map;
};

/**
 * Resolve deps keys to environment variables and IAM permissions.
 */
const resolveDeps = (
  depsKeys: string[],
  tableNameMap: Map<string, string>
): { depsEnv: Record<string, string>; depsPermissions: readonly string[] } | undefined => {
  if (depsKeys.length === 0) return undefined;

  const depsEnv: Record<string, string> = {};
  for (const key of depsKeys) {
    const tableName = tableNameMap.get(key);
    if (tableName) {
      depsEnv[`EFF_TABLE_${key}`] = tableName;
    }
  }

  if (Object.keys(depsEnv).length === 0) return undefined;

  return { depsEnv, depsPermissions: TABLE_CLIENT_PERMISSIONS };
};

// ============ Params resolution ============

const SSM_PERMISSIONS = [
  "ssm:GetParameter",
  "ssm:GetParameters",
] as const;

/**
 * Resolve param entries to environment variables and IAM permissions.
 * SSM path convention: /${project}/${stage}/${key}
 */
const resolveParams = (
  paramEntries: ParamEntry[],
  project: string,
  stage: string
): { paramsEnv: Record<string, string>; paramsPermissions: readonly string[] } | undefined => {
  if (paramEntries.length === 0) return undefined;

  const paramsEnv: Record<string, string> = {};
  for (const { propName, ssmKey } of paramEntries) {
    paramsEnv[`EFF_PARAM_${propName}`] = `/${project}/${stage}/${ssmKey}`;
  }

  return { paramsEnv, paramsPermissions: SSM_PERMISSIONS };
};

/**
 * Merge deps and params resolution into a single env/permissions payload.
 */
const mergeResolved = (
  deps: { depsEnv: Record<string, string>; depsPermissions: readonly string[] } | undefined,
  params: { paramsEnv: Record<string, string>; paramsPermissions: readonly string[] } | undefined
): { depsEnv: Record<string, string>; depsPermissions: readonly string[] } | undefined => {
  if (!deps && !params) return undefined;

  const env = { ...deps?.depsEnv, ...params?.paramsEnv };
  const permissions = [...(deps?.depsPermissions ?? []), ...(params?.paramsPermissions ?? [])];

  if (Object.keys(env).length === 0) return undefined;

  return { depsEnv: env, depsPermissions: permissions };
};

// ============ Parallel deploy task builders ============

type DeployTaskCtx = {
  input: DeployProjectInput;
  layerArn: string | undefined;
  external: string[];
  stage: string;
  tableNameMap: Map<string, string>;
  logComplete: (name: string, type: string, status: StepStatus) => Effect.Effect<void>;
};

const makeDeployInput = (ctx: DeployTaskCtx, file: string): DeployInput => ({
  projectDir: ctx.input.projectDir,
  file,
  project: ctx.input.project,
  region: ctx.input.region,
  ...(ctx.input.stage ? { stage: ctx.input.stage } : {}),
});

const resolveHandlerEnv = (
  depsKeys: string[],
  paramEntries: ParamEntry[],
  ctx: DeployTaskCtx,
) => {
  const resolved = mergeResolved(
    resolveDeps(depsKeys, ctx.tableNameMap),
    resolveParams(paramEntries, ctx.input.project, ctx.stage)
  );
  return {
    depsEnv: resolved?.depsEnv ?? {},
    depsPermissions: resolved?.depsPermissions ?? [],
  };
};

const buildHttpTasks = (
  ctx: DeployTaskCtx,
  handlers: DiscoveredHandlers["httpHandlers"],
  apiId: string,
  results: DeployResult[],
): Effect.Effect<void, unknown>[] => {
  const tasks: Effect.Effect<void, unknown>[] = [];
  const { region } = ctx.input;
  for (const { file, exports } of handlers) {
    for (const fn of exports) {
      tasks.push(
        Effect.gen(function* () {
          const env = resolveHandlerEnv(fn.depsKeys, fn.paramEntries, ctx);
          const { exportName, functionArn, status, config } = yield* deployLambda({
            input: makeDeployInput(ctx, file), fn,
            ...(ctx.layerArn ? { layerArn: ctx.layerArn } : {}),
            ...(ctx.external.length > 0 ? { external: ctx.external } : {}),
            depsEnv: env.depsEnv, depsPermissions: env.depsPermissions,
            ...(fn.staticGlobs.length > 0 ? { staticGlobs: fn.staticGlobs } : {}),
          }).pipe(Effect.provide(Aws.makeClients({ lambda: { region }, iam: { region } })));

          const { apiUrl: handlerUrl } = yield* addRouteToApi({
            apiId, region, functionArn, method: config.method, path: config.path,
          }).pipe(Effect.provide(Aws.makeClients({ lambda: { region }, apigatewayv2: { region } })));

          results.push({ exportName, url: handlerUrl, functionArn });
          yield* ctx.logComplete( config.name ?? exportName, "http", status);
        })
      );
    }
  }
  return tasks;
};

const buildTableTasks = (
  ctx: DeployTaskCtx,
  handlers: DiscoveredHandlers["tableHandlers"],
  results: DeployTableResult[],
): Effect.Effect<void, unknown>[] => {
  const tasks: Effect.Effect<void, unknown>[] = [];
  const { region } = ctx.input;
  for (const { file, exports } of handlers) {
    for (const fn of exports) {
      tasks.push(
        Effect.gen(function* () {
          const env = resolveHandlerEnv(fn.depsKeys, fn.paramEntries, ctx);
          const result = yield* deployTableFunction({
            input: makeDeployInput(ctx, file), fn,
            ...(ctx.layerArn ? { layerArn: ctx.layerArn } : {}),
            ...(ctx.external.length > 0 ? { external: ctx.external } : {}),
            depsEnv: env.depsEnv, depsPermissions: env.depsPermissions,
            ...(fn.staticGlobs.length > 0 ? { staticGlobs: fn.staticGlobs } : {}),
          }).pipe(Effect.provide(Aws.makeClients({ lambda: { region }, iam: { region }, dynamodb: { region } })));
          results.push(result);
          yield* ctx.logComplete( fn.config.name ?? fn.exportName, "table", result.status);
        })
      );
    }
  }
  return tasks;
};

/** Build the two API Gateway route paths for an app handler. */
export function buildAppRoutePaths(configPath: string): [root: string, greedy: string] {
  const basePath = configPath.replace(/\/+$/, "");
  return [basePath || "/", `${basePath}/{file+}`];
}

const buildAppTasks = (
  ctx: DeployTaskCtx,
  handlers: DiscoveredHandlers["appHandlers"],
  apiId: string,
  results: DeployResult[],
): Effect.Effect<void, unknown>[] => {
  const tasks: Effect.Effect<void, unknown>[] = [];
  const { region } = ctx.input;
  for (const { file, exports } of handlers) {
    for (const fn of exports) {
      tasks.push(
        Effect.gen(function* () {
          const { exportName, functionArn, status, config, handlerName } = yield* deployAppLambda({
            input: makeDeployInput(ctx, file), fn,
            ...(ctx.layerArn ? { layerArn: ctx.layerArn } : {}),
            ...(ctx.external.length > 0 ? { external: ctx.external } : {}),
          }).pipe(Effect.provide(Aws.makeClients({ lambda: { region }, iam: { region } })));

          const [rootPath, greedyPath] = buildAppRoutePaths(config.path ?? "/");
          const { apiUrl: rootUrl } = yield* addRouteToApi({
            apiId, region, functionArn, method: "GET", path: rootPath,
          }).pipe(Effect.provide(Aws.makeClients({ lambda: { region }, apigatewayv2: { region } })));
          yield* addRouteToApi({
            apiId, region, functionArn, method: "GET", path: greedyPath,
          }).pipe(Effect.provide(Aws.makeClients({ lambda: { region }, apigatewayv2: { region } })));

          results.push({ exportName, url: rootUrl, functionArn });
          yield* ctx.logComplete( handlerName, "app", status);
        })
      );
    }
  }
  return tasks;
};

const buildStaticSiteTasks = (
  ctx: DeployTaskCtx,
  handlers: DiscoveredHandlers["staticSiteHandlers"],
  results: DeployStaticSiteResult[],
): Effect.Effect<void, unknown>[] => {
  const tasks: Effect.Effect<void, unknown>[] = [];
  const { region } = ctx.input;
  for (const { exports } of handlers) {
    for (const fn of exports) {
      tasks.push(
        Effect.gen(function* () {
          const result = yield* deployStaticSite({
            projectDir: ctx.input.projectDir, project: ctx.input.project,
            stage: ctx.input.stage, region, fn,
          }).pipe(Effect.provide(Aws.makeClients({
            s3: { region }, cloudfront: { region: "us-east-1" },
            resource_groups_tagging_api: { region: "us-east-1" },
          })));
          results.push(result);
          yield* ctx.logComplete( fn.config.name ?? fn.exportName, "site", "updated");
        })
      );
    }
  }
  return tasks;
};

const buildFifoQueueTasks = (
  ctx: DeployTaskCtx,
  handlers: DiscoveredHandlers["fifoQueueHandlers"],
  results: DeployFifoQueueResult[],
): Effect.Effect<void, unknown>[] => {
  const tasks: Effect.Effect<void, unknown>[] = [];
  const { region } = ctx.input;
  for (const { file, exports } of handlers) {
    for (const fn of exports) {
      tasks.push(
        Effect.gen(function* () {
          const env = resolveHandlerEnv(fn.depsKeys, fn.paramEntries, ctx);
          const result = yield* deployFifoQueueFunction({
            input: makeDeployInput(ctx, file), fn,
            ...(ctx.layerArn ? { layerArn: ctx.layerArn } : {}),
            ...(ctx.external.length > 0 ? { external: ctx.external } : {}),
            depsEnv: env.depsEnv, depsPermissions: env.depsPermissions,
            ...(fn.staticGlobs.length > 0 ? { staticGlobs: fn.staticGlobs } : {}),
          }).pipe(Effect.provide(Aws.makeClients({ lambda: { region }, iam: { region }, sqs: { region } })));
          results.push(result);
          yield* ctx.logComplete( fn.config.name ?? fn.exportName, "queue", result.status);
        })
      );
    }
  }
  return tasks;
};

const buildWebSocketTasks = (
  ctx: DeployTaskCtx,
  handlers: DiscoveredHandlers["webSocketHandlers"],
  results: DeployWebSocketResult[],
): Effect.Effect<void, unknown>[] => {
  const tasks: Effect.Effect<void, unknown>[] = [];
  const { region } = ctx.input;
  for (const { file, exports } of handlers) {
    for (const fn of exports) {
      tasks.push(
        Effect.gen(function* () {
          const env = resolveHandlerEnv(fn.depsKeys, fn.paramEntries, ctx);
          const result = yield* deployWebSocketFunction({
            input: makeDeployInput(ctx, file), fn,
            ...(ctx.layerArn ? { layerArn: ctx.layerArn } : {}),
            ...(ctx.external.length > 0 ? { external: ctx.external } : {}),
            depsEnv: env.depsEnv, depsPermissions: env.depsPermissions,
            ...(fn.staticGlobs.length > 0 ? { staticGlobs: fn.staticGlobs } : {}),
          }).pipe(Effect.provide(Aws.makeClients({ lambda: { region }, iam: { region }, apigatewayv2: { region } })));
          results.push(result);
          yield* ctx.logComplete(fn.config.name ?? fn.exportName, "ws", result.status);
        })
      );
    }
  }
  return tasks;
};

// ============ Project deployment ============

export type DeployProjectInput = {
  projectDir: string;
  patterns: string[];
  project: string;
  stage?: string;
  region: string;
};

export type DeployProjectResult = {
  apiId?: string;
  apiUrl?: string;
  httpResults: DeployResult[];
  tableResults: DeployTableResult[];
  appResults: DeployResult[];
  staticSiteResults: DeployStaticSiteResult[];
  fifoQueueResults: DeployFifoQueueResult[];
  webSocketResults: DeployWebSocketResult[];
};

export const deployProject = (input: DeployProjectInput) =>
  Effect.gen(function* () {
    // Discover handlers from file patterns
    const files = findHandlerFiles(input.patterns, input.projectDir);

    if (files.length === 0) {
      return yield* Effect.fail(new Error(`No files match patterns: ${input.patterns.join(", ")}`));
    }

    yield* Effect.logDebug(`Found ${files.length} file(s) matching patterns`);

    const { httpHandlers, tableHandlers, appHandlers, staticSiteHandlers, fifoQueueHandlers, webSocketHandlers } = discoverHandlers(files);

    const totalHttpHandlers = httpHandlers.reduce((acc, h) => acc + h.exports.length, 0);
    const totalTableHandlers = tableHandlers.reduce((acc, h) => acc + h.exports.length, 0);
    const totalAppHandlers = appHandlers.reduce((acc, h) => acc + h.exports.length, 0);
    const totalStaticSiteHandlers = staticSiteHandlers.reduce((acc, h) => acc + h.exports.length, 0);
    const totalFifoQueueHandlers = fifoQueueHandlers.reduce((acc, h) => acc + h.exports.length, 0);
    const totalWebSocketHandlers = webSocketHandlers.reduce((acc, h) => acc + h.exports.length, 0);
    const totalAllHandlers = totalHttpHandlers + totalTableHandlers + totalAppHandlers + totalStaticSiteHandlers + totalFifoQueueHandlers + totalWebSocketHandlers;

    if (totalAllHandlers === 0) {
      return yield* Effect.fail(new Error("No handlers found in matched files"));
    }

    const parts: string[] = [];
    if (totalHttpHandlers > 0) parts.push(`${totalHttpHandlers} http`);
    if (totalTableHandlers > 0) parts.push(`${totalTableHandlers} table`);
    if (totalAppHandlers > 0) parts.push(`${totalAppHandlers} app`);
    if (totalStaticSiteHandlers > 0) parts.push(`${totalStaticSiteHandlers} site`);
    if (totalFifoQueueHandlers > 0) parts.push(`${totalFifoQueueHandlers} queue`);
    if (totalWebSocketHandlers > 0) parts.push(`${totalWebSocketHandlers} ws`);
    yield* Console.log(`\n  ${c.dim("Handlers:")} ${parts.join(", ")}`);

    // Check for missing SSM parameters
    const discovered = { httpHandlers, tableHandlers, appHandlers, staticSiteHandlers, fifoQueueHandlers, webSocketHandlers };
    const requiredParams = collectRequiredParams(discovered, input.project, resolveStage(input.stage));
    if (requiredParams.length > 0) {
      const { missing } = yield* checkMissingParams(requiredParams).pipe(
        Effect.provide(Aws.makeClients({ ssm: { region: input.region } }))
      );
      if (missing.length > 0) {
        const stageLabel = resolveStage(input.stage);
        yield* Console.log(`\n  ${c.yellow("⚠")} Missing ${missing.length} SSM parameter(s):\n`);
        for (const p of missing) {
          yield* Console.log(`    ${c.dim(p.handlerName)} → ${c.yellow(p.ssmPath)}`);
        }
        yield* Console.log(`\n  Run: ${c.cyan(`npx eff config --stage ${stageLabel}`)}`);
      }
    }

    // Build table name map for deps resolution
    const tableNameMap = buildTableNameMap(tableHandlers, input.project, resolveStage(input.stage));

    // Prepare layer
    const { layerArn, layerVersion, layerStatus, external } = yield* prepareLayer({
      project: input.project,
      stage: resolveStage(input.stage),
      region: input.region,
      projectDir: input.projectDir
    });

    if (layerArn && layerStatus) {
      const status = layerStatus === "cached" ? c.dim("cached") : c.green("created");
      yield* Console.log(`  ${c.dim("Layer:")} ${status} ${c.dim(`v${layerVersion}`)} (${external.length} packages)`);
    }

    const stage = resolveStage(input.stage);

    // Setup API Gateway for HTTP/app handlers
    let apiId: string | undefined;
    let apiUrl: string | undefined;

    if (totalHttpHandlers > 0 || totalAppHandlers > 0) {
      const tagCtx: TagContext = {
        project: input.project,
        stage: resolveStage(input.stage),
        handler: "api"
      };

      const api = yield* ensureProjectApi({
        projectName: input.project,
        stage: tagCtx.stage,
        region: input.region,
        tags: makeTags(tagCtx, "api-gateway")
      }).pipe(
        Effect.provide(
          Aws.makeClients({
            apigatewayv2: { region: input.region }
          })
        )
      );

      apiId = api.apiId;
      apiUrl = `https://${apiId}.execute-api.${input.region}.amazonaws.com`;
      yield* Console.log(`  ${c.dim("API Gateway:")} ${apiId}`);
    }

    yield* Console.log("");

    // Build handler manifest and live progress tracker
    const manifest: HandlerManifest = [];
    for (const { exports } of httpHandlers)
      for (const fn of exports) manifest.push({ name: fn.config.name ?? fn.exportName, type: "http" });
    for (const { exports } of tableHandlers)
      for (const fn of exports) manifest.push({ name: fn.config.name ?? fn.exportName, type: "table" });
    for (const { exports } of appHandlers)
      for (const fn of exports) manifest.push({ name: fn.config.name ?? fn.exportName, type: "app" });
    for (const { exports } of staticSiteHandlers)
      for (const fn of exports) manifest.push({ name: fn.config.name ?? fn.exportName, type: "site" });
    for (const { exports } of fifoQueueHandlers)
      for (const fn of exports) manifest.push({ name: fn.config.name ?? fn.exportName, type: "queue" });
    for (const { exports } of webSocketHandlers)
      for (const fn of exports) manifest.push({ name: fn.config.name ?? fn.exportName, type: "ws" });

    manifest.sort((a, b) => a.name.localeCompare(b.name));
    const logComplete = createLiveProgress(manifest);
    const ctx: DeployTaskCtx = {
      input, layerArn, external, stage, tableNameMap, logComplete,
    };

    const httpResults: DeployResult[] = [];
    const tableResults: DeployTableResult[] = [];
    const appResults: DeployResult[] = [];
    const staticSiteResults: DeployStaticSiteResult[] = [];
    const fifoQueueResults: DeployFifoQueueResult[] = [];
    const webSocketResults: DeployWebSocketResult[] = [];

    const tasks = [
      ...(apiId ? buildHttpTasks(ctx, httpHandlers, apiId, httpResults) : []),
      ...buildTableTasks(ctx, tableHandlers, tableResults),
      ...(apiId ? buildAppTasks(ctx, appHandlers, apiId, appResults) : []),
      ...buildStaticSiteTasks(ctx, staticSiteHandlers, staticSiteResults),
      ...buildFifoQueueTasks(ctx, fifoQueueHandlers, fifoQueueResults),
      ...buildWebSocketTasks(ctx, webSocketHandlers, webSocketResults),
    ];

    yield* Effect.all(tasks, { concurrency: DEPLOY_CONCURRENCY, discard: true });

    // Remove stale API Gateway routes
    if (apiId) {
      const activeRouteKeys = new Set<string>();

      for (const { exports } of httpHandlers) {
        for (const fn of exports) {
          activeRouteKeys.add(`${fn.config.method} ${fn.config.path}`);
        }
      }
      for (const { exports } of appHandlers) {
        for (const fn of exports) {
          const [rootPath, greedyPath] = buildAppRoutePaths(fn.config.path ?? "/");
          activeRouteKeys.add(`GET ${rootPath}`);
          activeRouteKeys.add(`GET ${greedyPath}`);
        }
      }

      yield* removeStaleRoutes(apiId, activeRouteKeys).pipe(
        Effect.provide(
          Aws.makeClients({
            apigatewayv2: { region: input.region }
          })
        )
      );
    }

    if (apiUrl) {
      yield* Effect.logDebug(`Deployment complete! API: ${apiUrl}`);
    }

    return { apiId, apiUrl, httpResults, tableResults, appResults, staticSiteResults, fifoQueueResults, webSocketResults };
  });
