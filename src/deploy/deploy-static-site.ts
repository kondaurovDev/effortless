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
  ensureViewerRequestFunction,
  ensureDistribution,
  invalidateDistribution,
  findCertificate,
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
      yield* Effect.logDebug(`Building site: ${config.build}`);
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

    // 3b. If domain is set, look up ACM certificate
    const domain = config.domain;
    let aliases: string[] | undefined;
    let acmCertificateArn: string | undefined;
    let wwwDomain: string | undefined;

    if (domain) {
      const certResult = yield* findCertificate(domain);
      acmCertificateArn = certResult.certificateArn;

      const wwwCandidate = `www.${domain}`;
      const certCoversWww = certResult.coveredDomains.includes(wwwCandidate) ||
        certResult.coveredDomains.includes(`*.${domain}`);

      if (certCoversWww) {
        aliases = [domain, wwwCandidate];
        wwwDomain = wwwCandidate;
        yield* Effect.logDebug(`ACM certificate covers ${wwwCandidate}, enabling www → non-www redirect`);
      } else {
        aliases = [domain];
        yield* Effect.logWarning(
          `ACM certificate does not cover ${wwwCandidate}. ` +
          `For SEO, add ${wwwCandidate} to your ACM certificate in us-east-1 to enable www → non-www redirect.`
        );
      }
    }

    // 4. Ensure viewer request function (URL rewrite + optional www redirect)
    const isSpa = config.spa ?? false;
    const needsUrlRewrite = !isSpa;
    const needsWwwRedirect = !!wwwDomain;
    let urlRewriteFunctionArn: string | undefined;

    if (needsUrlRewrite || needsWwwRedirect) {
      const fnName = needsWwwRedirect
        ? `${project}-${stage}-${handlerName}-viewer-req`
        : `${project}-${stage}-url-rewrite`;
      const result = yield* ensureViewerRequestFunction(fnName, {
        rewriteUrls: needsUrlRewrite,
        redirectWwwDomain: wwwDomain,
      });
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
      aliases,
      acmCertificateArn,
    });

    // 6. Set bucket policy for CloudFront OAC
    yield* putBucketPolicyForOAC(bucketName, distributionArn);

    // 7. Sync files to S3
    const sourceDir = path.resolve(projectDir, config.dir);
    yield* syncFiles({ bucketName, sourceDir });

    // 8. Invalidate CloudFront cache
    yield* invalidateDistribution(distributionId);

    const url = domain ? `https://${domain}` : `https://${domainName}`;
    yield* Effect.logDebug(`Static site deployed: ${url}`);

    return {
      exportName,
      handlerName,
      url,
      distributionId,
      bucketName,
    } satisfies DeployStaticSiteResult;
  });
