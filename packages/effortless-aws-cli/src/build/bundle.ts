import { Effect } from "effect";
import * as esbuild from "esbuild";
import * as fsSync from "fs";
import * as path from "path";
import { builtinModules } from "module";
import { createRequire } from "module";
import archiver from "archiver";
import { globSync } from "glob";
import { generateEntryPoint, generateMiddlewareEntryPoint, extractHandlerConfigs, type HandlerType, type ExtractedConfig, type AuthConfig } from "./handler-registry";
import type { TableConfig, AppConfig, StaticSiteConfig, FifoQueueConfig, BucketConfig, MailerConfig, ApiConfig } from "effortless-aws";

/** Must match AUTH_COOKIE_NAME in effortless-aws/src/handlers/auth.ts */
const AUTH_COOKIE_NAME = "__eff_session";

export type BundleInput = {
  projectDir: string;
  format?: "esm" | "cjs";
  file: string;
};

// ============ Config extraction (uses registry) ============

export type ExtractedTableFunction = ExtractedConfig<TableConfig>;
export type ExtractedAppFunction = ExtractedConfig<AppConfig>;
export type ExtractedStaticSiteFunction = ExtractedConfig<StaticSiteConfig>;

export const extractTableConfigs = (source: string): ExtractedTableFunction[] =>
  extractHandlerConfigs<TableConfig>(source, "table");

export const extractAppConfigs = (source: string): ExtractedAppFunction[] =>
  extractHandlerConfigs<AppConfig>(source, "app");

export const extractStaticSiteConfigs = (source: string): ExtractedStaticSiteFunction[] =>
  extractHandlerConfigs<StaticSiteConfig>(source, "staticSite");

export type ExtractedFifoQueueFunction = ExtractedConfig<FifoQueueConfig>;

export const extractFifoQueueConfigs = (source: string): ExtractedFifoQueueFunction[] =>
  extractHandlerConfigs<FifoQueueConfig>(source, "fifoQueue");

export type ExtractedBucketFunction = ExtractedConfig<BucketConfig>;

export const extractBucketConfigs = (source: string): ExtractedBucketFunction[] =>
  extractHandlerConfigs<BucketConfig>(source, "bucket");

export type ExtractedMailerFunction = ExtractedConfig<MailerConfig>;

export const extractMailerConfigs = (source: string): ExtractedMailerFunction[] =>
  extractHandlerConfigs<MailerConfig>(source, "mailer");

export type ExtractedApiFunction = ExtractedConfig<ApiConfig>;

export const extractApiConfigs = (source: string): ExtractedApiFunction[] =>
  extractHandlerConfigs<ApiConfig>(source, "api");

// ============ Bundle (uses registry) ============

const _require = createRequire(import.meta.url);
const runtimeDir = path.join(path.dirname(_require.resolve("effortless-aws/package.json")), "dist/runtime");

export type BundleResult = {
  code: string;
  /** Top modules by size (path → bytes), only when metafile is enabled */
  topModules?: { path: string; bytes: number }[];
};

export const bundle = (input: BundleInput & { exportName?: string; external?: string[]; type?: HandlerType }) =>
  Effect.gen(function* () {
    const exportName = input.exportName ?? "default";
    const type = input.type ?? "api";
    const externals = input.external ?? [];

    // Get source path for import statement
    const sourcePath = path.isAbsolute(input.file) ? input.file : `./${input.file}`;

    const entryPoint = generateEntryPoint(sourcePath, exportName, type, runtimeDir);

    // AWS SDK v3 + Node.js built-ins are available in the Lambda runtime — never bundle them
    const awsExternals = ["@aws-sdk/*", "@smithy/*"];
    const nodeExternals = builtinModules.flatMap(m => [m, `node:${m}`]);
    const allExternals = [...new Set([...awsExternals, ...nodeExternals, ...externals])];

    const format = input.format ?? "esm";

    const result = yield* Effect.tryPromise({
      try: () => esbuild.build({
        stdin: {
          contents: entryPoint,
          loader: "ts",
          resolveDir: input.projectDir
        },
        bundle: true,
        platform: "node",
        target: "node22",
        write: false,
        minify: false,
        sourcemap: false,
        format,
        external: allExternals,
        metafile: true,
        // CJS packages bundled into ESM need a `require` function for Node.js builtins
        ...(format === "esm" ? { banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" } } : {}),
      }),
      catch: (error) => new Error(`esbuild failed: ${error}`)
    });

    const output = result.outputFiles?.[0];
    if (!output) {
      throw new Error("esbuild produced no output");
    }

    const bundleResult: BundleResult = { code: output.text };

    if (result.metafile) {
      bundleResult.topModules = analyzeMetafile(result.metafile);
    }

    return bundleResult;
  });

/**
 * Extract top modules by size from esbuild metafile.
 * Groups by top-level package name (e.g. node_modules/effect/...).
 */
const analyzeMetafile = (metafile: esbuild.Metafile): { path: string; bytes: number }[] => {
  const packageSizes = new Map<string, number>();

  for (const [filePath, info] of Object.entries(metafile.inputs)) {
    // Group by package: node_modules/.pnpm/pkg@ver/node_modules/pkg/... → pkg
    const nodeModIdx = filePath.lastIndexOf("node_modules/");
    let key: string;
    if (nodeModIdx !== -1) {
      const afterNm = filePath.slice(nodeModIdx + "node_modules/".length);
      // Handle scoped packages: @scope/name/...
      if (afterNm.startsWith("@")) {
        const parts = afterNm.split("/");
        key = `${parts[0]}/${parts[1]}`;
      } else {
        key = afterNm.split("/")[0]!;
      }
    } else {
      key = "<project>";
    }
    packageSizes.set(key, (packageSizes.get(key) ?? 0) + info.bytes);
  }

  return Array.from(packageSizes.entries())
    .map(([p, bytes]) => ({ path: p, bytes }))
    .sort((a, b) => b.bytes - a.bytes);
};

/**
 * Bundle middleware as a standalone Lambda@Edge function.
 * Extracts only the middleware function from the handler source via AST,
 * so the bundle doesn't pull in unrelated dependencies (HTTP clients, etc.).
 */
export const bundleMiddleware = (input: { projectDir: string; file: string }) =>
  Effect.gen(function* () {
    const absFile = path.isAbsolute(input.file)
      ? input.file
      : path.resolve(input.projectDir, input.file);
    const source = fsSync.readFileSync(absFile, "utf-8");
    const sourceDir = path.dirname(absFile);

    const { entryPoint } = generateMiddlewareEntryPoint(source, runtimeDir);

    const awsExternals = ["@aws-sdk/*", "@smithy/*"];

    const result = yield* Effect.tryPromise({
      try: () => esbuild.build({
        stdin: {
          contents: entryPoint,
          loader: "ts",
          resolveDir: sourceDir,
        },
        bundle: true,
        platform: "node",
        target: "node22",
        write: false,
        minify: false,
        sourcemap: false,
        format: "esm",
        external: awsExternals,
      }),
      catch: (error) => new Error(`esbuild failed (middleware): ${error}`)
    });

    const output = result.outputFiles?.[0];
    if (!output) {
      throw new Error("esbuild produced no output for middleware");
    }
    return output.text;
  });

/**
 * Generate and bundle a self-contained auth middleware for Lambda@Edge.
 * The HMAC secret is injected at build time via esbuild `define`.
 * No external imports needed (uses Node.js built-in crypto).
 */
export const bundleAuthMiddleware = (input: { authConfig: AuthConfig; secret: string }) =>
  Effect.gen(function* () {
    const { authConfig, secret } = input;
    const loginPath = authConfig.loginPath;
    const publicPatterns = authConfig.public ?? [];

    const entryPoint = `
import { createHmac } from "crypto";

const SECRET = ${JSON.stringify(secret)};
const LOGIN_PATH = ${JSON.stringify(loginPath)};
const PUBLIC = ${JSON.stringify(publicPatterns)};
const COOKIE = ${JSON.stringify(AUTH_COOKIE_NAME)};

const isPublic = (uri) => {
  for (const p of PUBLIC) {
    if (p.endsWith("/*")) {
      if (uri.startsWith(p.slice(0, -1))) return true;
    } else if (p.endsWith("*")) {
      if (uri.startsWith(p.slice(0, -1))) return true;
    } else {
      if (uri === p) return true;
    }
  }
  return false;
};

const verify = (cookie) => {
  if (!cookie) return false;
  const dot = cookie.indexOf(".");
  if (dot === -1) return false;
  const payload = cookie.slice(0, dot);
  const sig = cookie.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(payload).digest("base64url");
  if (sig !== expected) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return data.exp > Math.floor(Date.now() / 1000);
  } catch { return false; }
};

const parseCookies = (headers) => {
  const cookies = {};
  const cookieHeaders = headers.cookie;
  if (!cookieHeaders) return cookies;
  for (const { value } of cookieHeaders) {
    for (const pair of value.split(";")) {
      const eq = pair.indexOf("=");
      if (eq === -1) continue;
      const name = pair.slice(0, eq).trim();
      const val = pair.slice(eq + 1).trim();
      if (name) cookies[name] = val;
    }
  }
  return cookies;
};

const rewrite = (uri) => {
  if (uri.endsWith("/")) return uri + "index.html";
  if (!uri.includes(".")) return uri + "/index.html";
  return uri;
};

export const handler = async (event) => {
  const req = event.Records[0].cf.request;

  if (isPublic(req.uri)) {
    req.uri = rewrite(req.uri);
    return req;
  }

  const cookies = parseCookies(req.headers);
  if (verify(cookies[COOKIE])) {
    req.uri = rewrite(req.uri);
    return req;
  }

  return {
    status: "302",
    statusDescription: "Found",
    headers: { location: [{ key: "Location", value: LOGIN_PATH }] },
  };
};
`;

    const result = yield* Effect.tryPromise({
      try: () => esbuild.build({
        stdin: { contents: entryPoint, loader: "js", resolveDir: process.cwd() },
        bundle: true,
        platform: "node",
        target: "node22",
        write: false,
        minify: true,
        sourcemap: false,
        format: "esm",
        external: ["crypto"],
      }),
      catch: (error) => new Error(`esbuild failed (auth middleware): ${error}`),
    });

    const output = result.outputFiles?.[0];
    if (!output) throw new Error("esbuild produced no output for auth middleware");
    return output.text;
  });

export type StaticFile = {
  content: Buffer;
  zipPath: string;
};

export type ZipInput = {
  content: string;
  filename?: string;
  staticFiles?: StaticFile[];
};

// Fixed date for deterministic zip (same content = same hash)
const FIXED_DATE = new Date(0);

export const zip = (input: ZipInput) =>
  Effect.async<Buffer, Error>((resume) => {
    const chunks: Buffer[] = [];
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("end", () => resume(Effect.succeed(Buffer.concat(chunks))));
    archive.on("error", (err) => resume(Effect.fail(err)));

    archive.append(input.content, { name: input.filename ?? "index.mjs", date: FIXED_DATE });
    if (input.staticFiles) {
      for (const file of input.staticFiles) {
        archive.append(file.content, { name: file.zipPath, date: FIXED_DATE });
      }
    }
    archive.finalize();
  });

// ============ Static file resolution ============

export const resolveStaticFiles = (globs: string[], projectDir: string): StaticFile[] => {
  const files: StaticFile[] = [];
  for (const pattern of globs) {
    const matches = globSync(pattern, { cwd: projectDir, nodir: true });
    for (const match of matches) {
      const absPath = path.join(projectDir, match);
      files.push({
        content: fsSync.readFileSync(absPath),
        zipPath: match
      });
    }
  }
  return files;
};

// ============ Directory ZIP (for SSR frameworks) ============

export const zipDirectory = (dirPath: string) =>
  Effect.async<Buffer, Error>((resume) => {
    const chunks: Buffer[] = [];
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("end", () => resume(Effect.succeed(Buffer.concat(chunks))));
    archive.on("error", (err) => resume(Effect.fail(err)));

    archive.directory(dirPath, false);
    archive.finalize();
  });

/**
 * Scan a directory's top-level entries and return CloudFront path patterns.
 * Directories become "/{name}/*", files become "/{name}".
 */
export const detectAssetPatterns = (assetsDir: string): string[] => {
  if (!fsSync.existsSync(assetsDir)) return [];

  const patterns: string[] = [];
  for (const entry of fsSync.readdirSync(assetsDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      patterns.push(`/${entry.name}/*`);
    } else {
      patterns.push(`/${entry.name}`);
    }
  }
  return patterns;
};

// ============ File discovery ============

export const findHandlerFiles = (patterns: string[], cwd: string): string[] => {
  const files = new Set<string>();
  for (const pattern of patterns) {
    const matches = globSync(pattern, { cwd, absolute: true });
    matches.forEach(f => files.add(f));
  }
  return Array.from(files);
};

export type DiscoveredHandlers = {
  tableHandlers: { file: string; exports: ExtractedTableFunction[] }[];
  appHandlers: { file: string; exports: ExtractedAppFunction[] }[];
  staticSiteHandlers: { file: string; exports: ExtractedStaticSiteFunction[] }[];
  fifoQueueHandlers: { file: string; exports: ExtractedFifoQueueFunction[] }[];
  bucketHandlers: { file: string; exports: ExtractedBucketFunction[] }[];
  mailerHandlers: { file: string; exports: ExtractedMailerFunction[] }[];
  apiHandlers: { file: string; exports: ExtractedApiFunction[] }[];
};

export const discoverHandlers = (files: string[]): DiscoveredHandlers => {
  const tableHandlers: { file: string; exports: ExtractedTableFunction[] }[] = [];
  const appHandlers: { file: string; exports: ExtractedAppFunction[] }[] = [];
  const staticSiteHandlers: { file: string; exports: ExtractedStaticSiteFunction[] }[] = [];
  const fifoQueueHandlers: { file: string; exports: ExtractedFifoQueueFunction[] }[] = [];
  const bucketHandlers: { file: string; exports: ExtractedBucketFunction[] }[] = [];
  const mailerHandlers: { file: string; exports: ExtractedMailerFunction[] }[] = [];
  const apiHandlers: { file: string; exports: ExtractedApiFunction[] }[] = [];

  for (const file of files) {
    // Skip directories
    if (!fsSync.statSync(file).isFile()) continue;

    const source = fsSync.readFileSync(file, "utf-8");
    const table = extractTableConfigs(source);
    const app = extractAppConfigs(source);
    const staticSite = extractStaticSiteConfigs(source);
    const fifoQueue = extractFifoQueueConfigs(source);
    const bucket = extractBucketConfigs(source);
    const mailer = extractMailerConfigs(source);
    const api = extractApiConfigs(source);

    if (table.length > 0) tableHandlers.push({ file, exports: table });
    if (app.length > 0) appHandlers.push({ file, exports: app });
    if (staticSite.length > 0) staticSiteHandlers.push({ file, exports: staticSite });
    if (fifoQueue.length > 0) fifoQueueHandlers.push({ file, exports: fifoQueue });
    if (bucket.length > 0) bucketHandlers.push({ file, exports: bucket });
    if (mailer.length > 0) mailerHandlers.push({ file, exports: mailer });
    if (api.length > 0) apiHandlers.push({ file, exports: api });
  }

  return { tableHandlers, appHandlers, staticSiteHandlers, fifoQueueHandlers, bucketHandlers, mailerHandlers, apiHandlers };
};

/** Flatten all discovered handlers into a list of { exportName, file, type } */
export const flattenHandlers = (discovered: DiscoveredHandlers) => {
  const entries = (
    type: string,
    handlers: { file: string; exports: { exportName: string }[] }[],
  ) => handlers.flatMap(h => h.exports.map(e => ({ exportName: e.exportName, file: h.file, type })));

  return [
    ...entries("table", discovered.tableHandlers),
    ...entries("app", discovered.appHandlers),
    ...entries("site", discovered.staticSiteHandlers),
    ...entries("queue", discovered.fifoQueueHandlers),
    ...entries("bucket", discovered.bucketHandlers),
    ...entries("mailer", discovered.mailerHandlers),
    ...entries("api", discovered.apiHandlers),
  ];
};
