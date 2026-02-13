import { Effect } from "effect";
import { execSync } from "child_process";
import * as path from "path";
import type { ExtractedStaticSiteFunction } from "~/build/bundle";
import {
  makeTags,
  resolveStage,
  type TagContext,
  ensureBucket,
  syncFiles,
  putBucketPolicyForOAC,
  ensureOAC,
  ensureUrlRewriteFunction,
  ensureDistribution,
  invalidateDistribution,
} from "../aws";

// ============ Static site deployment ============

export type DeployStaticSiteInput = {
  projectDir: string;
  project: string;
  stage?: string;
  region: string;
  fn: ExtractedStaticSiteFunction;
};

export type DeployStaticSiteResult = {
  exportName: string;
  handlerName: string;
  url: string;
  distributionId: string;
  bucketName: string;
};

/** @internal */
export const deployStaticSite = (input: DeployStaticSiteInput) =>
  Effect.gen(function* () {
    const { projectDir, project, region, fn } = input;
    const { exportName, config } = fn;
    const stage = resolveStage(input.stage);
    const handlerName = config.name ?? exportName;

    const tagCtx: TagContext = { project, stage, handler: handlerName };

    // 1. Run build command if specified
    if (config.build) {
      yield* Effect.logInfo(`Building site: ${config.build}`);
      yield* Effect.try({
        try: () => execSync(config.build!, { cwd: projectDir, stdio: "inherit" }),
        catch: (error) => new Error(`Site build failed: ${error}`),
      });
    }

    // 2. Ensure S3 bucket
    const bucketName = `${project}-${stage}-${handlerName}-site`.toLowerCase();
    const { bucketArn } = yield* ensureBucket({
      name: bucketName,
      region,
      tags: makeTags(tagCtx, "s3-bucket"),
    });

    // 3. Ensure Origin Access Control
    const oacName = `${project}-${stage}-oac`;
    const { oacId } = yield* ensureOAC({ name: oacName });

    // 4. Ensure URL rewrite function (for static sites, not SPA)
    const isSpa = config.spa ?? false;
    let urlRewriteFunctionArn: string | undefined;
    if (!isSpa) {
      const fnName = `${project}-${stage}-url-rewrite`;
      const result = yield* ensureUrlRewriteFunction(fnName);
      urlRewriteFunctionArn = result.functionArn;
    }

    // 5. Ensure CloudFront distribution
    const index = config.index ?? "index.html";
    const { distributionId, distributionArn, domainName } = yield* ensureDistribution({
      project,
      stage,
      handlerName,
      bucketName,
      bucketRegion: region,
      oacId,
      spa: isSpa,
      index,
      tags: makeTags(tagCtx, "cloudfront-distribution"),
      urlRewriteFunctionArn,
    });

    // 6. Set bucket policy for CloudFront OAC
    yield* putBucketPolicyForOAC(bucketName, distributionArn);

    // 7. Sync files to S3
    const sourceDir = path.resolve(projectDir, config.dir);
    yield* syncFiles({ bucketName, sourceDir });

    // 8. Invalidate CloudFront cache
    yield* invalidateDistribution(distributionId);

    const url = `https://${domainName}`;
    yield* Effect.logInfo(`Static site deployed: ${url}`);

    return {
      exportName,
      handlerName,
      url,
      distributionId,
      bucketName,
    } satisfies DeployStaticSiteResult;
  });
