import { Effect, Schedule } from "effect";
import { cloudfront } from "./clients";
import { toAwsTagList, getResourcesByTags } from "./tags";

// AWS managed CachingOptimized policy
const CACHING_OPTIMIZED_POLICY_ID = "658327ea-f89d-4fab-a63d-7e88639e58f6";

export type EnsureOACInput = {
  name: string;
};

export const ensureOAC = (input: EnsureOACInput) =>
  Effect.gen(function* () {
    const { name } = input;

    // Check if OAC already exists
    const result = yield* cloudfront.make("list_origin_access_controls", {});
    const existing = result.OriginAccessControlList?.Items?.find(
      oac => oac.Name === name
    );

    if (existing) {
      yield* Effect.logDebug(`OAC ${name} already exists: ${existing.Id}`);
      return { oacId: existing.Id! };
    }

    yield* Effect.logInfo(`Creating Origin Access Control: ${name}`);
    const createResult = yield* cloudfront.make("create_origin_access_control", {
      OriginAccessControlConfig: {
        Name: name,
        Description: `OAC for effortless-aws: ${name}`,
        SigningProtocol: "sigv4",
        SigningBehavior: "always",
        OriginAccessControlOriginType: "s3",
      },
    });

    return { oacId: createResult.OriginAccessControl!.Id! };
  });

// CloudFront Function that rewrites /path/ → /path/index.html for static sites
const URL_REWRITE_FUNCTION_CODE = `\
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  } else if (!uri.includes('.')) {
    request.uri += '/index.html';
  }
  return request;
}`;

export const ensureUrlRewriteFunction = (name: string) =>
  Effect.gen(function* () {
    // Check if function already exists
    const list = yield* cloudfront.make("list_functions", {});
    const existing = list.FunctionList?.Items?.find(f => f.Name === name);

    if (existing) {
      yield* Effect.logDebug(`CloudFront Function ${name} already exists`);
      return { functionArn: existing.FunctionMetadata!.FunctionARN! };
    }

    yield* Effect.logInfo(`Creating CloudFront Function: ${name}`);
    const result = yield* cloudfront.make("create_function", {
      Name: name,
      FunctionConfig: {
        Comment: "URL rewrite: append index.html for directory paths",
        Runtime: "cloudfront-js-2.0",
      },
      FunctionCode: new TextEncoder().encode(URL_REWRITE_FUNCTION_CODE),
    });

    const etag = result.ETag!;

    // Publish the function to make it available for association
    yield* cloudfront.make("publish_function", {
      Name: name,
      IfMatch: etag,
    });

    return { functionArn: result.FunctionSummary!.FunctionMetadata!.FunctionARN! };
  });

export type EnsureDistributionInput = {
  project: string;
  stage: string;
  handlerName: string;
  bucketName: string;
  bucketRegion: string;
  oacId: string;
  spa: boolean;
  index: string;
  tags: Record<string, string>;
  urlRewriteFunctionArn?: string;
};

export type DistributionResult = {
  distributionId: string;
  distributionArn: string;
  domainName: string;
};

const makeDistComment = (project: string, stage: string, handlerName: string) =>
  `effortless: ${project}/${stage}/${handlerName}`;

export const ensureDistribution = (input: EnsureDistributionInput) =>
  Effect.gen(function* () {
    const { project, stage, handlerName, bucketName, bucketRegion, oacId, spa, index, tags, urlRewriteFunctionArn } = input;
    const functionAssociations = urlRewriteFunctionArn
      ? { Quantity: 1, Items: [{ FunctionARN: urlRewriteFunctionArn, EventType: "viewer-request" as const }] }
      : { Quantity: 0, Items: [] };
    const comment = makeDistComment(project, stage, handlerName);
    const originId = `S3-${bucketName}`;
    const originDomain = `${bucketName}.s3.${bucketRegion}.amazonaws.com`;

    const customErrorResponses = spa
      ? {
          Quantity: 2,
          Items: [
            {
              ErrorCode: 403,
              ResponseCode: "200",
              ResponsePagePath: `/${index}`,
              ErrorCachingMinTTL: 0,
            },
            {
              ErrorCode: 404,
              ResponseCode: "200",
              ResponsePagePath: `/${index}`,
              ErrorCachingMinTTL: 0,
            },
          ],
        }
      : { Quantity: 0, Items: [] };

    // Find existing distribution by tags
    const existing = yield* findDistributionByTags(project, stage, handlerName);

    if (existing) {
      // Get current config to check if update is needed
      const configResult = yield* cloudfront.make("get_distribution_config", {
        Id: existing.Id,
      });
      const currentConfig = configResult.DistributionConfig!;

      const distResult = yield* cloudfront.make("get_distribution", { Id: existing.Id });
      const distributionArn = distResult.Distribution!.ARN!;

      // Check if distribution config needs updating
      const currentOrigin = currentConfig.Origins?.Items?.[0];
      const needsUpdate =
        currentOrigin?.DomainName !== originDomain ||
        currentOrigin?.OriginAccessControlId !== oacId ||
        currentConfig.DefaultRootObject !== index ||
        currentConfig.DefaultCacheBehavior?.CachePolicyId !== CACHING_OPTIMIZED_POLICY_ID ||
        (currentConfig.CustomErrorResponses?.Quantity ?? 0) !== customErrorResponses.Quantity ||
        (currentConfig.DefaultCacheBehavior?.FunctionAssociations?.Quantity ?? 0) !== functionAssociations.Quantity;

      if (needsUpdate) {
        yield* Effect.logInfo(`CloudFront distribution ${existing.Id} config changed, updating...`);
        const etag = configResult.ETag!;

        yield* cloudfront.make("update_distribution", {
          Id: existing.Id,
          IfMatch: etag,
          DistributionConfig: {
            ...currentConfig,
            Comment: comment,
            Origins: {
              Quantity: 1,
              Items: [
                {
                  Id: originId,
                  DomainName: originDomain,
                  OriginAccessControlId: oacId,
                  S3OriginConfig: { OriginAccessIdentity: "" },
                  CustomHeaders: { Quantity: 0, Items: [] },
                },
              ],
            },
            DefaultCacheBehavior: {
              ...currentConfig.DefaultCacheBehavior,
              TargetOriginId: originId,
              ViewerProtocolPolicy: "redirect-to-https",
              AllowedMethods: {
                Quantity: 2,
                Items: ["GET", "HEAD"],
                CachedMethods: { Quantity: 2, Items: ["GET", "HEAD"] },
              },
              Compress: true,
              CachePolicyId: CACHING_OPTIMIZED_POLICY_ID,
              FunctionAssociations: functionAssociations,
              ForwardedValues: undefined,
            },
            DefaultRootObject: index,
            CustomErrorResponses: customErrorResponses,
            Enabled: true,
          },
        });

        yield* cloudfront.make("tag_resource", {
          Resource: distributionArn,
          Tags: { Items: toAwsTagList(tags) },
        });
      } else {
        yield* Effect.logDebug(`CloudFront distribution ${existing.Id} is up to date, skipping update`);
      }

      return {
        distributionId: existing.Id!,
        distributionArn,
        domainName: existing.DomainName!,
      } satisfies DistributionResult;
    }

    // Create new distribution
    yield* Effect.logInfo("Creating CloudFront distribution (first deploy may take 5-15 minutes)...");

    const createResult = yield* cloudfront.make("create_distribution_with_tags", {
      DistributionConfigWithTags: {
        DistributionConfig: {
          CallerReference: `${project}-${stage}-${handlerName}-${Date.now()}`,
          Comment: comment,
          Origins: {
            Quantity: 1,
            Items: [
              {
                Id: originId,
                DomainName: originDomain,
                OriginAccessControlId: oacId,
                S3OriginConfig: { OriginAccessIdentity: "" },
              },
            ],
          },
          DefaultCacheBehavior: {
            TargetOriginId: originId,
            ViewerProtocolPolicy: "redirect-to-https",
            AllowedMethods: {
              Quantity: 2,
              Items: ["GET", "HEAD"],
              CachedMethods: { Quantity: 2, Items: ["GET", "HEAD"] },
            },
            Compress: true,
            CachePolicyId: CACHING_OPTIMIZED_POLICY_ID,
            FunctionAssociations: functionAssociations,
          },
          DefaultRootObject: index,
          Enabled: true,
          CustomErrorResponses: customErrorResponses,
          PriceClass: "PriceClass_All",
          HttpVersion: "http2and3",
        },
        Tags: { Items: toAwsTagList(tags) },
      },
    });

    const dist = createResult.Distribution!;
    return {
      distributionId: dist.Id!,
      distributionArn: dist.ARN!,
      domainName: dist.DomainName!,
    } satisfies DistributionResult;
  });

const findDistributionByTags = (project: string, stage: string, handlerName: string) =>
  Effect.gen(function* () {
    const resources = yield* getResourcesByTags(project, stage);
    const dist = resources.find(r => {
      const isDistribution = r.ResourceARN?.includes(":distribution/");
      const handlerTag = r.Tags?.find(t => t.Key === "effortless:handler");
      return isDistribution && handlerTag?.Value === handlerName;
    });

    if (!dist?.ResourceARN) return undefined;

    const distributionId = dist.ResourceARN.split("/").pop()!;
    const result = yield* cloudfront.make("get_distribution", { Id: distributionId });
    return {
      Id: distributionId,
      DomainName: result.Distribution!.DomainName!,
    };
  });

export const invalidateDistribution = (distributionId: string) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Invalidating CloudFront distribution: ${distributionId}`);

    yield* cloudfront.make("create_invalidation", {
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: 1,
          Items: ["/*"],
        },
      },
    });
  });

export const disableAndDeleteDistribution = (distributionId: string) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Disabling CloudFront distribution: ${distributionId}`);

    // Get current config
    const configResult = yield* cloudfront.make("get_distribution_config", {
      Id: distributionId,
    }).pipe(
      Effect.catchIf(
        e => e._tag === "CloudFrontError" && e.is("NoSuchDistribution"),
        () => Effect.succeed(undefined)
      )
    );

    if (!configResult) {
      yield* Effect.logDebug(`Distribution ${distributionId} not found, skipping`);
      return;
    }

    const currentConfig = configResult.DistributionConfig!;

    // Disable if enabled
    if (currentConfig.Enabled) {
      const disableResult = yield* cloudfront.make("update_distribution", {
        Id: distributionId,
        IfMatch: configResult.ETag!,
        DistributionConfig: {
          ...currentConfig,
          Enabled: false,
        },
      });

      // Wait for distribution to be deployed (disabled)
      yield* waitForDistributionDeployed(distributionId);

      // Delete with the new ETag
      yield* cloudfront.make("delete_distribution", {
        Id: distributionId,
        IfMatch: disableResult.ETag!,
      });
    } else {
      // Already disabled, just delete
      yield* cloudfront.make("delete_distribution", {
        Id: distributionId,
        IfMatch: configResult.ETag!,
      });
    }

    yield* Effect.logInfo(`Deleted CloudFront distribution: ${distributionId}`);
  });

const waitForDistributionDeployed = (distributionId: string) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Waiting for distribution ${distributionId} to deploy (this may take several minutes)...`);

    yield* Effect.retry(
      cloudfront.make("get_distribution", { Id: distributionId }).pipe(
        Effect.flatMap(r => {
          const status = r.Distribution?.Status;
          if (status === "Deployed") {
            return Effect.succeed(r);
          }
          return Effect.fail(new Error(`Distribution status: ${status}`));
        })
      ),
      {
        times: 90,
        schedule: Schedule.spaced("10 seconds"),
      }
    );
  });

export const deleteOAC = (oacId: string) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Deleting Origin Access Control: ${oacId}`);

    // Get ETag first
    const result = yield* cloudfront.make("list_origin_access_controls", {});
    const oac = result.OriginAccessControlList?.Items?.find(o => o.Id === oacId);

    if (!oac) {
      yield* Effect.logDebug(`OAC ${oacId} not found, skipping`);
      return;
    }

    // Need to get the full OAC to get ETag
    // OAC deletion requires going through get_origin_access_control first
    // but we don't have that command easily. Use the list to check existence,
    // and try delete directly — CloudFront will error if in use.
    yield* cloudfront.make("delete_origin_access_control", {
      Id: oacId,
      IfMatch: "*", // Not ideal but works for cleanup
    }).pipe(
      Effect.catchIf(
        e => e._tag === "CloudFrontError",
        (e) => Effect.logDebug(`Could not delete OAC ${oacId}: ${e.cause.message}`)
      )
    );
  });
