import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Sdk from "@aws-sdk/client-resource-groups-tagging-api";
import type { AllErrors } from "./internal/utils.js";

// *****  GENERATED CODE *****

export class ResourceGroupsTaggingAPIClient extends Context.Tag('ResourceGroupsTaggingAPIClient')<ResourceGroupsTaggingAPIClient, Sdk.ResourceGroupsTaggingAPIClient>() {

  static Default = (
    config?: Sdk.ResourceGroupsTaggingAPIClientConfig
  ) =>
    Layer.effect(
      ResourceGroupsTaggingAPIClient,
      Effect.gen(function*() {
        return new Sdk.ResourceGroupsTaggingAPIClient(config ?? {})
      })
    )
}

/**
 * Creates an Effect that executes an AWS ResourceGroupsTaggingAPI command.
 *
 * @param actionName - The name of the ResourceGroupsTaggingAPI command to execute
 * @param actionInput - The input parameters for the command
 * @returns An Effect that will execute the command and return its output
 *
 * @example
 * ```typescript
 * import { resource_groups_tagging_api } from "@effect-ak/aws-sdk"
 *
 * const program = Effect.gen(function*() {
 *   const result = yield* resource_groups_tagging_api.make("command_name", {
 *     // command input parameters
 *   })
 *   return result
 * })
 * ```
 */
export const make =
  Effect.fn('aws_ResourceGroupsTaggingAPI')(function* <M extends keyof ResourceGroupsTaggingAPIApi>(
    actionName: M, actionInput: ResourceGroupsTaggingAPIApi[M][0]
  ) {
    yield* Effect.logDebug(`aws_ResourceGroupsTaggingAPI.${actionName}`, { input: actionInput })

    const client = yield* ResourceGroupsTaggingAPIClient
    const command = new ResourceGroupsTaggingAPICommandFactory[actionName](actionInput) as Parameters<typeof client.send>[0]

    const result = yield* Effect.tryPromise({
      try: () => client.send(command) as Promise<ResourceGroupsTaggingAPIApi[M][1]>,
      catch: (error) => {
        if (error instanceof Sdk.ResourceGroupsTaggingAPIServiceException) {
          return new ResourceGroupsTaggingAPIError(error, actionName)
        }
        throw error
      }
    })

    yield* Effect.logDebug(`aws_ResourceGroupsTaggingAPI.${actionName} completed`)

    return result
  })

export class ResourceGroupsTaggingAPIError<C extends keyof ResourceGroupsTaggingAPIApi> {
  readonly _tag = "ResourceGroupsTaggingAPIError";

  constructor(
    readonly cause: Sdk.ResourceGroupsTaggingAPIServiceException,
    readonly command: C
  ) { }

  $is<N extends keyof ResourceGroupsTaggingAPIApi[C][2]>(
    name: N
  ): this is ResourceGroupsTaggingAPIError<C> {
    return this.cause.name == name;
  }

  is<N extends keyof AllErrors<ResourceGroupsTaggingAPIApi>>(
    name: N
  ): this is ResourceGroupsTaggingAPIError<C> {
    return this.cause.name == name;
  }

}

export type ResourceGroupsTaggingAPIMethodInput<M extends keyof ResourceGroupsTaggingAPIApi> = ResourceGroupsTaggingAPIApi[M][0];
type ResourceGroupsTaggingAPIApi = {
  describe_report_creation: [
    Sdk.DescribeReportCreationCommandInput,
    Sdk.DescribeReportCreationCommandOutput,
    {
      "ConstraintViolationException": Sdk.ConstraintViolationException,
      "InvalidParameterException": Sdk.InvalidParameterException,
      "ThrottledException": Sdk.ThrottledException
    }
  ]
  get_compliance_summary: [
    Sdk.GetComplianceSummaryCommandInput,
    Sdk.GetComplianceSummaryCommandOutput,
    {
      "ConstraintViolationException": Sdk.ConstraintViolationException,
      "InvalidParameterException": Sdk.InvalidParameterException,
      "ThrottledException": Sdk.ThrottledException
    }
  ]
  get_resources: [
    Sdk.GetResourcesCommandInput,
    Sdk.GetResourcesCommandOutput,
    {
      "InvalidParameterException": Sdk.InvalidParameterException,
      "PaginationTokenExpiredException": Sdk.PaginationTokenExpiredException,
      "ThrottledException": Sdk.ThrottledException
    }
  ]
  get_tag_keys: [
    Sdk.GetTagKeysCommandInput,
    Sdk.GetTagKeysCommandOutput,
    {
      "InvalidParameterException": Sdk.InvalidParameterException,
      "PaginationTokenExpiredException": Sdk.PaginationTokenExpiredException,
      "ThrottledException": Sdk.ThrottledException
    }
  ]
  get_tag_values: [
    Sdk.GetTagValuesCommandInput,
    Sdk.GetTagValuesCommandOutput,
    {
      "InvalidParameterException": Sdk.InvalidParameterException,
      "PaginationTokenExpiredException": Sdk.PaginationTokenExpiredException,
      "ThrottledException": Sdk.ThrottledException
    }
  ]
  list_required_tags: [
    Sdk.ListRequiredTagsCommandInput,
    Sdk.ListRequiredTagsCommandOutput,
    {
      "InvalidParameterException": Sdk.InvalidParameterException,
      "PaginationTokenExpiredException": Sdk.PaginationTokenExpiredException,
      "ThrottledException": Sdk.ThrottledException
    }
  ]
  start_report_creation: [
    Sdk.StartReportCreationCommandInput,
    Sdk.StartReportCreationCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "ConstraintViolationException": Sdk.ConstraintViolationException,
      "InvalidParameterException": Sdk.InvalidParameterException,
      "ThrottledException": Sdk.ThrottledException
    }
  ]
  tag_resources: [
    Sdk.TagResourcesCommandInput,
    Sdk.TagResourcesCommandOutput,
    {
      "InvalidParameterException": Sdk.InvalidParameterException,
      "ThrottledException": Sdk.ThrottledException
    }
  ]
  untag_resources: [
    Sdk.UntagResourcesCommandInput,
    Sdk.UntagResourcesCommandOutput,
    {
      "InvalidParameterException": Sdk.InvalidParameterException,
      "ThrottledException": Sdk.ThrottledException
    }
  ]
};

const ResourceGroupsTaggingAPICommandFactory: { [M in keyof ResourceGroupsTaggingAPIApi]: new (args: ResourceGroupsTaggingAPIApi[M][0]) => unknown } = {
  describe_report_creation: Sdk.DescribeReportCreationCommand,
  get_compliance_summary: Sdk.GetComplianceSummaryCommand,
  get_resources: Sdk.GetResourcesCommand,
  get_tag_keys: Sdk.GetTagKeysCommand,
  get_tag_values: Sdk.GetTagValuesCommand,
  list_required_tags: Sdk.ListRequiredTagsCommand,
  start_report_creation: Sdk.StartReportCreationCommand,
  tag_resources: Sdk.TagResourcesCommand,
  untag_resources: Sdk.UntagResourcesCommand,
};
