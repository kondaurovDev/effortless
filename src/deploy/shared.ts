import { Effect } from "effect";
import * as fs from "fs/promises";
import * as path from "path";
import {
  ensureRole,
  ensureLambda,
  type LambdaStatus,
  makeTags,
  resolveStage,
  type TagContext,
  ensureLayer,
  readProductionDependencies,
  collectLayerPackages
} from "../aws";
import { bundle, zip, resolveStaticFiles, type BundleInput } from "~/build/bundle";

// ============ Common types ============

export type DeployResult = {
  exportName: string;
  url: string;
  functionArn: string;
};

export type DeployTableResult = {
  exportName: string;
  functionArn: string;
  status: LambdaStatus;
  tableArn: string;
  streamArn: string;
};

export type DeployAllResult = {
  apiId: string;
  apiUrl: string;
  handlers: DeployResult[];
};

export type DeployInput = BundleInput & {
  project: string;
  stage?: string;
  region: string;
  exportName?: string;
};

// ============ Shared utilities ============

export const readSource = (input: DeployInput): Effect.Effect<string> =>
  Effect.gen(function* () {
    if ("code" in input && typeof input.code === "string") {
      return input.code;
    }
    const filePath = path.isAbsolute(input.file)
      ? input.file
      : path.join(input.projectDir, input.file);
    return yield* Effect.promise(() => fs.readFile(filePath, "utf-8"));
  });

export type LayerInfo = {
  layerArn: string | undefined;
  external: string[];
};

export const ensureLayerAndExternal = (input: {
  project: string;
  stage: string;
  region: string;
  projectDir: string;
}) =>
  Effect.gen(function* () {
    const layerResult = yield* ensureLayer({
      project: input.project,
      stage: input.stage,
      region: input.region,
      projectDir: input.projectDir
    });

    const prodDeps = layerResult
      ? yield* readProductionDependencies(input.projectDir)
      : [];
    const { packages: external, warnings: layerWarnings } = prodDeps.length > 0
      ? yield* Effect.sync(() => collectLayerPackages(input.projectDir, prodDeps))
      : { packages: [] as string[], warnings: [] as string[] };

    for (const warning of layerWarnings) {
      yield* Effect.logWarning(`[layer] ${warning}`);
    }

    return {
      layerArn: layerResult?.layerVersionArn,
      external
    };
  });

// ============ Core Lambda deployment ============

export type DeployCoreLambdaInput = {
  input: DeployInput;
  exportName: string;
  handlerName: string;
  permissions?: readonly string[];
  defaultPermissions?: readonly string[];
  memory?: number;
  timeout?: number;
  bundleType?: "http" | "table" | "app" | "fifoQueue";
  layerArn?: string;
  external?: string[];
  /** Environment variables to set on the Lambda (e.g., for deps) */
  depsEnv?: Record<string, string>;
  /** Additional IAM permissions for deps access */
  depsPermissions?: readonly string[];
  /** Static file glob patterns to bundle into the Lambda ZIP */
  staticGlobs?: string[];
};

export const deployCoreLambda = ({
  input,
  exportName,
  handlerName,
  permissions,
  defaultPermissions,
  memory = 256,
  timeout = 30,
  bundleType,
  layerArn,
  external,
  depsEnv,
  depsPermissions,
  staticGlobs
}: DeployCoreLambdaInput) =>
  Effect.gen(function* () {
    const tagCtx: TagContext = {
      project: input.project,
      stage: resolveStage(input.stage),
      handler: handlerName
    };

    yield* Effect.logDebug(`Deploying Lambda: ${handlerName}`);

    if (external && external.length > 0) {
      yield* Effect.logDebug(`Using ${external.length} external packages: ${external.join(", ")}`);
    }

    const mergedPermissions = [
      ...(defaultPermissions ?? []),
      ...(permissions ?? []),
      ...(depsPermissions ?? [])
    ];

    const roleArn = yield* ensureRole(
      input.project,
      tagCtx.stage,
      handlerName,
      mergedPermissions.length > 0 ? mergedPermissions : undefined,
      makeTags(tagCtx, "iam-role")
    );

    const bundled = yield* bundle({
      ...input,
      exportName,
      ...(bundleType ? { type: bundleType } : {}),
      ...(external && external.length > 0 ? { external } : {})
    });
    const staticFiles = staticGlobs && staticGlobs.length > 0
      ? resolveStaticFiles(staticGlobs, input.projectDir)
      : undefined;
    const code = yield* zip({ content: bundled, staticFiles });

    const environment: Record<string, string> = {
      EFF_PROJECT: input.project,
      EFF_STAGE: tagCtx.stage,
      EFF_HANDLER: handlerName,
      ...depsEnv
    };

    const { functionArn, status } = yield* ensureLambda({
      project: input.project,
      stage: tagCtx.stage,
      name: handlerName,
      region: input.region,
      roleArn,
      code,
      memory,
      timeout,
      tags: makeTags(tagCtx, "lambda"),
      ...(layerArn ? { layers: [layerArn] } : {}),
      environment
    });

    return { functionArn, status, tagCtx };
  });

// ============ Permissions ============

type AwsService =
  | "dynamodb"
  | "s3"
  | "sqs"
  | "sns"
  | "ses"
  | "ssm"
  | "lambda"
  | "events"
  | "secretsmanager"
  | "cognito-idp"
  | "logs";

export type Permission = `${AwsService}:${string}` | (string & {});

// ============ Lambda config ============

/** Logging verbosity level for Lambda handlers */
export type LogLevel = "error" | "info" | "debug";

/**
 * Common Lambda configuration shared by all handler types.
 */
export type LambdaConfig = {
  /** Handler name. Defaults to export name if not specified */
  name?: string;
  /** Lambda memory in MB (default: 256) */
  memory?: number;
  /** Lambda timeout in seconds (default: 30) */
  timeout?: number;
  /** Logging verbosity: "error" (errors only), "info" (+ execution summary), "debug" (+ input/output). Default: "info" */
  logLevel?: LogLevel;
};

/**
 * Lambda configuration with additional IAM permissions.
 * Used by handler types that support custom permissions (http, table, fifo-queue).
 */
export type LambdaWithPermissions = LambdaConfig & {
  /** Additional IAM permissions for the Lambda */
  permissions?: Permission[];
};

// ============ Params ============

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyParamRef = ParamRef<any>;

/**
 * Reference to an SSM Parameter Store parameter.
 *
 * @typeParam T - The resolved type after optional transform (default: string)
 */
export type ParamRef<T = string> = {
  readonly __brand: "effortless-param";
  readonly key: string;
  readonly transform?: (raw: string) => T;
};

/**
 * Maps a params declaration to resolved value types.
 *
 * @typeParam P - Record of param names to ParamRef instances
 */
export type ResolveParams<P> = {
  [K in keyof P]: P[K] extends ParamRef<infer T> ? T : never;
};

/**
 * Declare an SSM Parameter Store parameter.
 *
 * The key is combined with project and stage at deploy time to form the full
 * SSM path: `/${project}/${stage}/${key}`.
 *
 * @param key - Parameter key (e.g., "database-url")
 * @param transform - Optional function to transform the raw string value
 * @returns A ParamRef used by the deployment and runtime systems
 *
 * @example Simple string parameter
 * ```typescript
 * params: {
 *   dbUrl: param("database-url"),
 * }
 * ```
 *
 * @example With transform (e.g., TOML parsing)
 * ```typescript
 * import TOML from "smol-toml";
 *
 * params: {
 *   config: param("app-config", TOML.parse),
 * }
 * ```
 */
export function param(key: string): ParamRef<string>;
export function param<T>(key: string, transform: (raw: string) => T): ParamRef<T>;
export function param<T = string>(
  key: string,
  transform?: (raw: string) => T
): ParamRef<T> {
  return {
    __brand: "effortless-param",
    key,
    ...(transform ? { transform } : {}),
  } as ParamRef<T>;
}

// ============ Typed helper ============

/**
 * Type-only schema helper for handlers.
 *
 * Use this instead of explicit generic parameters like `defineTable<Order>(...)`.
 * It enables TypeScript to infer all generic types from the options object,
 * avoiding the partial-inference problem where specifying one generic
 * forces all others to their defaults.
 *
 * At runtime this is a no-op identity function — it simply returns the input unchanged.
 * The type narrowing happens entirely at the TypeScript level.
 *
 * @example Resource-only table
 * ```typescript
 * type User = { id: string; email: string };
 *
 * // Before (breaks inference for context, deps, params):
 * export const users = defineTable<User>({ pk: { name: "id", type: "string" } });
 *
 * // After (all generics inferred correctly):
 * export const users = defineTable({
 *   pk: { name: "id", type: "string" },
 *   schema: typed<User>(),
 * });
 * ```
 *
 * @example Table with stream handler
 * ```typescript
 * export const orders = defineTable({
 *   pk: { name: "id", type: "string" },
 *   schema: typed<Order>(),
 *   context: async () => ({ db: createClient() }),
 *   onRecord: async ({ record, ctx }) => {
 *     // record.new is Order, ctx is { db: Client } — all inferred
 *   },
 * });
 * ```
 */
export function typed<T>(): (input: unknown) => T {
  return (input: unknown) => input as T;
}
