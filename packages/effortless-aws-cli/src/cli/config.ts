import { Options } from "@effect/cli";
import * as path from "path";
import * as fs from "fs";
import { pathToFileURL } from "url";
import * as esbuild from "esbuild";
import { Effect } from "effect";
import type { EffortlessConfig } from "effortless-aws";

export const loadConfig = Effect.fn("loadConfig")(function* () {
  const configPath = path.resolve(process.cwd(), "effortless.config.ts");

  if (!fs.existsSync(configPath)) {
    return null as EffortlessConfig | null;
  }

  const result = yield* Effect.tryPromise({
    try: () =>
      esbuild.build({
        entryPoints: [configPath],
        bundle: true,
        write: false,
        format: "esm",
        platform: "node",
        external: ["effortless-aws"],
      }),
    catch: (error) => new Error(`Failed to compile config: ${error}`),
  });

  const output = result.outputFiles?.[0];
  if (!output) {
    return null as EffortlessConfig | null;
  }

  const code = output.text;
  const tempFile = path.join(process.cwd(), ".effortless-config.mjs");
  fs.writeFileSync(tempFile, code);

  const mod = yield* Effect.tryPromise({
    try: () => import(pathToFileURL(tempFile).href),
    catch: (error) => new Error(`Failed to load config: ${error}`),
  }).pipe(Effect.ensuring(Effect.sync(() => fs.unlinkSync(tempFile))));

  return mod.default as EffortlessConfig | null;
});

export const projectOption = Options.text("project").pipe(
  Options.withAlias("p"),
  Options.withDescription("Project name (or 'name' in effortless.config.ts)"),
  Options.optional
);

export const stageOption = Options.text("stage").pipe(
  Options.withAlias("s"),
  Options.withDescription("Deployment stage (default: dev)"),
  Options.withDefault("dev")
);

export const regionOption = Options.text("region").pipe(
  Options.withAlias("r"),
  Options.withDescription("AWS region (default: eu-central-1)"),
  Options.withDefault("eu-central-1")
);

export const verboseOption = Options.boolean("verbose").pipe(
  Options.withAlias("v"),
  Options.withDescription("Enable verbose logging")
);

export const outputOption = Options.text("output").pipe(
  Options.withAlias("o"),
  Options.withDescription("Output directory"),
  Options.withDefault(".effortless")
);

export const noSitesOption = Options.boolean("no-sites").pipe(
  Options.withDescription("Skip static site deployments")
);

export const dryRunOption = Options.boolean("dry-run").pipe(
  Options.withDescription("Show what would be deleted without deleting")
);

export const getPatternsFromConfig = (config: EffortlessConfig | null): string[] | null => {
  const handlersConfig = config?.handlers;
  if (!handlersConfig || (Array.isArray(handlersConfig) && handlersConfig.length === 0)) {
    return null;
  }
  const rawPatterns = Array.isArray(handlersConfig) ? handlersConfig : [handlersConfig];
  return rawPatterns.map(p => {
    if (!p.includes("*") && !p.includes("?")) {
      if (/\.tsx?$/.test(p)) return p;
      return `${p.replace(/\/$/, "")}/**/*.ts`;
    }
    return p;
  });
};
