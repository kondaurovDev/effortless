import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Sdk from "@aws-sdk/client-lambda";
import type { AllErrors } from "./internal/utils.js";

// *****  GENERATED CODE *****

export class LambdaClient extends Context.Tag('LambdaClient')<LambdaClient, Sdk.LambdaClient>() {

  static Default = (
    config?: Sdk.LambdaClientConfig
  ) =>
    Layer.effect(
      LambdaClient,
      Effect.gen(function*() {
        return new Sdk.LambdaClient(config ?? {})
      })
    )
}

/**
 * Creates an Effect that executes an AWS Lambda command.
 *
 * @param actionName - The name of the Lambda command to execute
 * @param actionInput - The input parameters for the command
 * @returns An Effect that will execute the command and return its output
 *
 * @example
 * ```typescript
 * import { lambda } from "@effect-ak/aws-sdk"
 *
 * const program = Effect.gen(function*() {
 *   const result = yield* lambda.make("command_name", {
 *     // command input parameters
 *   })
 *   return result
 * })
 * ```
 */
export const make =
  Effect.fn('aws_Lambda')(function* <M extends keyof LambdaApi>(
    actionName: M, actionInput: LambdaApi[M][0]
  ) {
    yield* Effect.logDebug(`aws_Lambda.${actionName}`, { input: actionInput })

    const client = yield* LambdaClient
    const command = new LambdaCommandFactory[actionName](actionInput) as Parameters<typeof client.send>[0]

    const result = yield* Effect.tryPromise({
      try: () => client.send(command) as Promise<LambdaApi[M][1]>,
      catch: (error) => {
        if (error instanceof Sdk.LambdaServiceException) {
          return new LambdaError(error, actionName)
        }
        throw error
      }
    })

    yield* Effect.logDebug(`aws_Lambda.${actionName} completed`)

    return result
  })

export class LambdaError<C extends keyof LambdaApi> {
  readonly _tag = "LambdaError";

  constructor(
    readonly cause: Sdk.LambdaServiceException,
    readonly command: C
  ) { }

  $is<N extends keyof LambdaApi[C][2]>(
    name: N
  ): this is LambdaError<C> {
    return this.cause.name == name;
  }

  is<N extends keyof AllErrors<LambdaApi>>(
    name: N
  ): this is LambdaError<C> {
    return this.cause.name == name;
  }

}

export type LambdaMethodInput<M extends keyof LambdaApi> = LambdaApi[M][0];
type LambdaApi = {
  add_layer_version_permission: [
    Sdk.AddLayerVersionPermissionCommandInput,
    Sdk.AddLayerVersionPermissionCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "PolicyLengthExceededException": Sdk.PolicyLengthExceededException,
      "PreconditionFailedException": Sdk.PreconditionFailedException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  add_permission: [
    Sdk.AddPermissionCommandInput,
    Sdk.AddPermissionCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "PolicyLengthExceededException": Sdk.PolicyLengthExceededException,
      "PreconditionFailedException": Sdk.PreconditionFailedException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  checkpoint_durable_execution: [
    Sdk.CheckpointDurableExecutionCommandInput,
    Sdk.CheckpointDurableExecutionCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_alias: [
    Sdk.CreateAliasCommandInput,
    Sdk.CreateAliasCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_capacity_provider: [
    Sdk.CreateCapacityProviderCommandInput,
    Sdk.CreateCapacityProviderCommandOutput,
    {
      "CapacityProviderLimitExceededException": Sdk.CapacityProviderLimitExceededException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_code_signing_config: [
    Sdk.CreateCodeSigningConfigCommandInput,
    Sdk.CreateCodeSigningConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException
    }
  ]
  create_event_source_mapping: [
    Sdk.CreateEventSourceMappingCommandInput,
    Sdk.CreateEventSourceMappingCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_function: [
    Sdk.CreateFunctionCommandInput,
    Sdk.CreateFunctionCommandOutput,
    {
      "CodeSigningConfigNotFoundException": Sdk.CodeSigningConfigNotFoundException,
      "CodeStorageExceededException": Sdk.CodeStorageExceededException,
      "CodeVerificationFailedException": Sdk.CodeVerificationFailedException,
      "FunctionVersionsPerCapacityProviderLimitExceededException": Sdk.FunctionVersionsPerCapacityProviderLimitExceededException,
      "InvalidCodeSignatureException": Sdk.InvalidCodeSignatureException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_function_url_config: [
    Sdk.CreateFunctionUrlConfigCommandInput,
    Sdk.CreateFunctionUrlConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_alias: [
    Sdk.DeleteAliasCommandInput,
    Sdk.DeleteAliasCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_capacity_provider: [
    Sdk.DeleteCapacityProviderCommandInput,
    Sdk.DeleteCapacityProviderCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_code_signing_config: [
    Sdk.DeleteCodeSigningConfigCommandInput,
    Sdk.DeleteCodeSigningConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  delete_event_source_mapping: [
    Sdk.DeleteEventSourceMappingCommandInput,
    Sdk.DeleteEventSourceMappingCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_function: [
    Sdk.DeleteFunctionCommandInput,
    Sdk.DeleteFunctionCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_function_code_signing_config: [
    Sdk.DeleteFunctionCodeSigningConfigCommandInput,
    Sdk.DeleteFunctionCodeSigningConfigCommandOutput,
    {
      "CodeSigningConfigNotFoundException": Sdk.CodeSigningConfigNotFoundException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_function_concurrency: [
    Sdk.DeleteFunctionConcurrencyCommandInput,
    Sdk.DeleteFunctionConcurrencyCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_function_event_invoke_config: [
    Sdk.DeleteFunctionEventInvokeConfigCommandInput,
    Sdk.DeleteFunctionEventInvokeConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_function_url_config: [
    Sdk.DeleteFunctionUrlConfigCommandInput,
    Sdk.DeleteFunctionUrlConfigCommandOutput,
    {
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_layer_version: [
    Sdk.DeleteLayerVersionCommandInput,
    Sdk.DeleteLayerVersionCommandOutput,
    {
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_provisioned_concurrency_config: [
    Sdk.DeleteProvisionedConcurrencyConfigCommandInput,
    Sdk.DeleteProvisionedConcurrencyConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_account_settings: [
    Sdk.GetAccountSettingsCommandInput,
    Sdk.GetAccountSettingsCommandOutput,
    {
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_alias: [
    Sdk.GetAliasCommandInput,
    Sdk.GetAliasCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_capacity_provider: [
    Sdk.GetCapacityProviderCommandInput,
    Sdk.GetCapacityProviderCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_code_signing_config: [
    Sdk.GetCodeSigningConfigCommandInput,
    Sdk.GetCodeSigningConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  get_durable_execution: [
    Sdk.GetDurableExecutionCommandInput,
    Sdk.GetDurableExecutionCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_durable_execution_history: [
    Sdk.GetDurableExecutionHistoryCommandInput,
    Sdk.GetDurableExecutionHistoryCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_durable_execution_state: [
    Sdk.GetDurableExecutionStateCommandInput,
    Sdk.GetDurableExecutionStateCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_event_source_mapping: [
    Sdk.GetEventSourceMappingCommandInput,
    Sdk.GetEventSourceMappingCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_function: [
    Sdk.GetFunctionCommandInput,
    Sdk.GetFunctionCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_function_code_signing_config: [
    Sdk.GetFunctionCodeSigningConfigCommandInput,
    Sdk.GetFunctionCodeSigningConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_function_concurrency: [
    Sdk.GetFunctionConcurrencyCommandInput,
    Sdk.GetFunctionConcurrencyCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_function_configuration: [
    Sdk.GetFunctionConfigurationCommandInput,
    Sdk.GetFunctionConfigurationCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_function_event_invoke_config: [
    Sdk.GetFunctionEventInvokeConfigCommandInput,
    Sdk.GetFunctionEventInvokeConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_function_recursion_config: [
    Sdk.GetFunctionRecursionConfigCommandInput,
    Sdk.GetFunctionRecursionConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_function_scaling_config: [
    Sdk.GetFunctionScalingConfigCommandInput,
    Sdk.GetFunctionScalingConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_function_url_config: [
    Sdk.GetFunctionUrlConfigCommandInput,
    Sdk.GetFunctionUrlConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_layer_version: [
    Sdk.GetLayerVersionCommandInput,
    Sdk.GetLayerVersionCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_layer_version_by_arn: [
    Sdk.GetLayerVersionByArnCommandInput,
    Sdk.GetLayerVersionByArnCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_layer_version_policy: [
    Sdk.GetLayerVersionPolicyCommandInput,
    Sdk.GetLayerVersionPolicyCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_policy: [
    Sdk.GetPolicyCommandInput,
    Sdk.GetPolicyCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_provisioned_concurrency_config: [
    Sdk.GetProvisionedConcurrencyConfigCommandInput,
    Sdk.GetProvisionedConcurrencyConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ProvisionedConcurrencyConfigNotFoundException": Sdk.ProvisionedConcurrencyConfigNotFoundException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_runtime_management_config: [
    Sdk.GetRuntimeManagementConfigCommandInput,
    Sdk.GetRuntimeManagementConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  invoke: [
    Sdk.InvokeCommandInput,
    Sdk.InvokeCommandOutput,
    {
      "DurableExecutionAlreadyStartedException": Sdk.DurableExecutionAlreadyStartedException,
      "EC2AccessDeniedException": Sdk.EC2AccessDeniedException,
      "EC2ThrottledException": Sdk.EC2ThrottledException,
      "EC2UnexpectedException": Sdk.EC2UnexpectedException,
      "EFSIOException": Sdk.EFSIOException,
      "EFSMountConnectivityException": Sdk.EFSMountConnectivityException,
      "EFSMountFailureException": Sdk.EFSMountFailureException,
      "EFSMountTimeoutException": Sdk.EFSMountTimeoutException,
      "ENILimitReachedException": Sdk.ENILimitReachedException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "InvalidRequestContentException": Sdk.InvalidRequestContentException,
      "InvalidRuntimeException": Sdk.InvalidRuntimeException,
      "InvalidSecurityGroupIDException": Sdk.InvalidSecurityGroupIDException,
      "InvalidSubnetIDException": Sdk.InvalidSubnetIDException,
      "InvalidZipFileException": Sdk.InvalidZipFileException,
      "KMSAccessDeniedException": Sdk.KMSAccessDeniedException,
      "KMSDisabledException": Sdk.KMSDisabledException,
      "KMSInvalidStateException": Sdk.KMSInvalidStateException,
      "KMSNotFoundException": Sdk.KMSNotFoundException,
      "NoPublishedVersionException": Sdk.NoPublishedVersionException,
      "RecursiveInvocationException": Sdk.RecursiveInvocationException,
      "RequestTooLargeException": Sdk.RequestTooLargeException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ResourceNotReadyException": Sdk.ResourceNotReadyException,
      "SerializedRequestEntityTooLargeException": Sdk.SerializedRequestEntityTooLargeException,
      "SnapStartException": Sdk.SnapStartException,
      "SnapStartNotReadyException": Sdk.SnapStartNotReadyException,
      "SnapStartTimeoutException": Sdk.SnapStartTimeoutException,
      "SubnetIPAddressLimitReachedException": Sdk.SubnetIPAddressLimitReachedException,
      "TooManyRequestsException": Sdk.TooManyRequestsException,
      "UnsupportedMediaTypeException": Sdk.UnsupportedMediaTypeException
    }
  ]
  invoke_async: [
    Sdk.InvokeAsyncCommandInput,
    Sdk.InvokeAsyncCommandOutput,
    {
      "InvalidRequestContentException": Sdk.InvalidRequestContentException,
      "InvalidRuntimeException": Sdk.InvalidRuntimeException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  invoke_with_response_stream: [
    Sdk.InvokeWithResponseStreamCommandInput,
    Sdk.InvokeWithResponseStreamCommandOutput,
    {
      "EC2AccessDeniedException": Sdk.EC2AccessDeniedException,
      "EC2ThrottledException": Sdk.EC2ThrottledException,
      "EC2UnexpectedException": Sdk.EC2UnexpectedException,
      "EFSIOException": Sdk.EFSIOException,
      "EFSMountConnectivityException": Sdk.EFSMountConnectivityException,
      "EFSMountFailureException": Sdk.EFSMountFailureException,
      "EFSMountTimeoutException": Sdk.EFSMountTimeoutException,
      "ENILimitReachedException": Sdk.ENILimitReachedException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "InvalidRequestContentException": Sdk.InvalidRequestContentException,
      "InvalidRuntimeException": Sdk.InvalidRuntimeException,
      "InvalidSecurityGroupIDException": Sdk.InvalidSecurityGroupIDException,
      "InvalidSubnetIDException": Sdk.InvalidSubnetIDException,
      "InvalidZipFileException": Sdk.InvalidZipFileException,
      "KMSAccessDeniedException": Sdk.KMSAccessDeniedException,
      "KMSDisabledException": Sdk.KMSDisabledException,
      "KMSInvalidStateException": Sdk.KMSInvalidStateException,
      "KMSNotFoundException": Sdk.KMSNotFoundException,
      "NoPublishedVersionException": Sdk.NoPublishedVersionException,
      "RecursiveInvocationException": Sdk.RecursiveInvocationException,
      "RequestTooLargeException": Sdk.RequestTooLargeException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ResourceNotReadyException": Sdk.ResourceNotReadyException,
      "SerializedRequestEntityTooLargeException": Sdk.SerializedRequestEntityTooLargeException,
      "SnapStartException": Sdk.SnapStartException,
      "SnapStartNotReadyException": Sdk.SnapStartNotReadyException,
      "SnapStartTimeoutException": Sdk.SnapStartTimeoutException,
      "SubnetIPAddressLimitReachedException": Sdk.SubnetIPAddressLimitReachedException,
      "TooManyRequestsException": Sdk.TooManyRequestsException,
      "UnsupportedMediaTypeException": Sdk.UnsupportedMediaTypeException
    }
  ]
  list_aliases: [
    Sdk.ListAliasesCommandInput,
    Sdk.ListAliasesCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_capacity_providers: [
    Sdk.ListCapacityProvidersCommandInput,
    Sdk.ListCapacityProvidersCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_code_signing_configs: [
    Sdk.ListCodeSigningConfigsCommandInput,
    Sdk.ListCodeSigningConfigsCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException
    }
  ]
  list_durable_executions_by_function: [
    Sdk.ListDurableExecutionsByFunctionCommandInput,
    Sdk.ListDurableExecutionsByFunctionCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_event_source_mappings: [
    Sdk.ListEventSourceMappingsCommandInput,
    Sdk.ListEventSourceMappingsCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_function_event_invoke_configs: [
    Sdk.ListFunctionEventInvokeConfigsCommandInput,
    Sdk.ListFunctionEventInvokeConfigsCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_function_url_configs: [
    Sdk.ListFunctionUrlConfigsCommandInput,
    Sdk.ListFunctionUrlConfigsCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_function_versions_by_capacity_provider: [
    Sdk.ListFunctionVersionsByCapacityProviderCommandInput,
    Sdk.ListFunctionVersionsByCapacityProviderCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_functions: [
    Sdk.ListFunctionsCommandInput,
    Sdk.ListFunctionsCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_functions_by_code_signing_config: [
    Sdk.ListFunctionsByCodeSigningConfigCommandInput,
    Sdk.ListFunctionsByCodeSigningConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  list_layer_versions: [
    Sdk.ListLayerVersionsCommandInput,
    Sdk.ListLayerVersionsCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_layers: [
    Sdk.ListLayersCommandInput,
    Sdk.ListLayersCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_provisioned_concurrency_configs: [
    Sdk.ListProvisionedConcurrencyConfigsCommandInput,
    Sdk.ListProvisionedConcurrencyConfigsCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_tags: [
    Sdk.ListTagsCommandInput,
    Sdk.ListTagsCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_versions_by_function: [
    Sdk.ListVersionsByFunctionCommandInput,
    Sdk.ListVersionsByFunctionCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  publish_layer_version: [
    Sdk.PublishLayerVersionCommandInput,
    Sdk.PublishLayerVersionCommandOutput,
    {
      "CodeStorageExceededException": Sdk.CodeStorageExceededException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  publish_version: [
    Sdk.PublishVersionCommandInput,
    Sdk.PublishVersionCommandOutput,
    {
      "CodeStorageExceededException": Sdk.CodeStorageExceededException,
      "FunctionVersionsPerCapacityProviderLimitExceededException": Sdk.FunctionVersionsPerCapacityProviderLimitExceededException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "PreconditionFailedException": Sdk.PreconditionFailedException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  put_function_code_signing_config: [
    Sdk.PutFunctionCodeSigningConfigCommandInput,
    Sdk.PutFunctionCodeSigningConfigCommandOutput,
    {
      "CodeSigningConfigNotFoundException": Sdk.CodeSigningConfigNotFoundException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  put_function_concurrency: [
    Sdk.PutFunctionConcurrencyCommandInput,
    Sdk.PutFunctionConcurrencyCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  put_function_event_invoke_config: [
    Sdk.PutFunctionEventInvokeConfigCommandInput,
    Sdk.PutFunctionEventInvokeConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  put_function_recursion_config: [
    Sdk.PutFunctionRecursionConfigCommandInput,
    Sdk.PutFunctionRecursionConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  put_function_scaling_config: [
    Sdk.PutFunctionScalingConfigCommandInput,
    Sdk.PutFunctionScalingConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  put_provisioned_concurrency_config: [
    Sdk.PutProvisionedConcurrencyConfigCommandInput,
    Sdk.PutProvisionedConcurrencyConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  put_runtime_management_config: [
    Sdk.PutRuntimeManagementConfigCommandInput,
    Sdk.PutRuntimeManagementConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  remove_layer_version_permission: [
    Sdk.RemoveLayerVersionPermissionCommandInput,
    Sdk.RemoveLayerVersionPermissionCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "PreconditionFailedException": Sdk.PreconditionFailedException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  remove_permission: [
    Sdk.RemovePermissionCommandInput,
    Sdk.RemovePermissionCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "PreconditionFailedException": Sdk.PreconditionFailedException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  send_durable_execution_callback_failure: [
    Sdk.SendDurableExecutionCallbackFailureCommandInput,
    Sdk.SendDurableExecutionCallbackFailureCommandOutput,
    {
      "CallbackTimeoutException": Sdk.CallbackTimeoutException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  send_durable_execution_callback_heartbeat: [
    Sdk.SendDurableExecutionCallbackHeartbeatCommandInput,
    Sdk.SendDurableExecutionCallbackHeartbeatCommandOutput,
    {
      "CallbackTimeoutException": Sdk.CallbackTimeoutException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  send_durable_execution_callback_success: [
    Sdk.SendDurableExecutionCallbackSuccessCommandInput,
    Sdk.SendDurableExecutionCallbackSuccessCommandOutput,
    {
      "CallbackTimeoutException": Sdk.CallbackTimeoutException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  stop_durable_execution: [
    Sdk.StopDurableExecutionCommandInput,
    Sdk.StopDurableExecutionCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  tag_resource: [
    Sdk.TagResourceCommandInput,
    Sdk.TagResourceCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  untag_resource: [
    Sdk.UntagResourceCommandInput,
    Sdk.UntagResourceCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_alias: [
    Sdk.UpdateAliasCommandInput,
    Sdk.UpdateAliasCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "PreconditionFailedException": Sdk.PreconditionFailedException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_capacity_provider: [
    Sdk.UpdateCapacityProviderCommandInput,
    Sdk.UpdateCapacityProviderCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_code_signing_config: [
    Sdk.UpdateCodeSigningConfigCommandInput,
    Sdk.UpdateCodeSigningConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  update_event_source_mapping: [
    Sdk.UpdateEventSourceMappingCommandInput,
    Sdk.UpdateEventSourceMappingCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_function_code: [
    Sdk.UpdateFunctionCodeCommandInput,
    Sdk.UpdateFunctionCodeCommandOutput,
    {
      "CodeSigningConfigNotFoundException": Sdk.CodeSigningConfigNotFoundException,
      "CodeStorageExceededException": Sdk.CodeStorageExceededException,
      "CodeVerificationFailedException": Sdk.CodeVerificationFailedException,
      "InvalidCodeSignatureException": Sdk.InvalidCodeSignatureException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "PreconditionFailedException": Sdk.PreconditionFailedException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_function_configuration: [
    Sdk.UpdateFunctionConfigurationCommandInput,
    Sdk.UpdateFunctionConfigurationCommandOutput,
    {
      "CodeSigningConfigNotFoundException": Sdk.CodeSigningConfigNotFoundException,
      "CodeVerificationFailedException": Sdk.CodeVerificationFailedException,
      "InvalidCodeSignatureException": Sdk.InvalidCodeSignatureException,
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "PreconditionFailedException": Sdk.PreconditionFailedException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_function_event_invoke_config: [
    Sdk.UpdateFunctionEventInvokeConfigCommandInput,
    Sdk.UpdateFunctionEventInvokeConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_function_url_config: [
    Sdk.UpdateFunctionUrlConfigCommandInput,
    Sdk.UpdateFunctionUrlConfigCommandOutput,
    {
      "InvalidParameterValueException": Sdk.InvalidParameterValueException,
      "ResourceConflictException": Sdk.ResourceConflictException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
};

const LambdaCommandFactory: { [M in keyof LambdaApi]: new (args: LambdaApi[M][0]) => unknown } = {
  add_layer_version_permission: Sdk.AddLayerVersionPermissionCommand,
  add_permission: Sdk.AddPermissionCommand,
  checkpoint_durable_execution: Sdk.CheckpointDurableExecutionCommand,
  create_alias: Sdk.CreateAliasCommand,
  create_capacity_provider: Sdk.CreateCapacityProviderCommand,
  create_code_signing_config: Sdk.CreateCodeSigningConfigCommand,
  create_event_source_mapping: Sdk.CreateEventSourceMappingCommand,
  create_function: Sdk.CreateFunctionCommand,
  create_function_url_config: Sdk.CreateFunctionUrlConfigCommand,
  delete_alias: Sdk.DeleteAliasCommand,
  delete_capacity_provider: Sdk.DeleteCapacityProviderCommand,
  delete_code_signing_config: Sdk.DeleteCodeSigningConfigCommand,
  delete_event_source_mapping: Sdk.DeleteEventSourceMappingCommand,
  delete_function: Sdk.DeleteFunctionCommand,
  delete_function_code_signing_config: Sdk.DeleteFunctionCodeSigningConfigCommand,
  delete_function_concurrency: Sdk.DeleteFunctionConcurrencyCommand,
  delete_function_event_invoke_config: Sdk.DeleteFunctionEventInvokeConfigCommand,
  delete_function_url_config: Sdk.DeleteFunctionUrlConfigCommand,
  delete_layer_version: Sdk.DeleteLayerVersionCommand,
  delete_provisioned_concurrency_config: Sdk.DeleteProvisionedConcurrencyConfigCommand,
  get_account_settings: Sdk.GetAccountSettingsCommand,
  get_alias: Sdk.GetAliasCommand,
  get_capacity_provider: Sdk.GetCapacityProviderCommand,
  get_code_signing_config: Sdk.GetCodeSigningConfigCommand,
  get_durable_execution: Sdk.GetDurableExecutionCommand,
  get_durable_execution_history: Sdk.GetDurableExecutionHistoryCommand,
  get_durable_execution_state: Sdk.GetDurableExecutionStateCommand,
  get_event_source_mapping: Sdk.GetEventSourceMappingCommand,
  get_function: Sdk.GetFunctionCommand,
  get_function_code_signing_config: Sdk.GetFunctionCodeSigningConfigCommand,
  get_function_concurrency: Sdk.GetFunctionConcurrencyCommand,
  get_function_configuration: Sdk.GetFunctionConfigurationCommand,
  get_function_event_invoke_config: Sdk.GetFunctionEventInvokeConfigCommand,
  get_function_recursion_config: Sdk.GetFunctionRecursionConfigCommand,
  get_function_scaling_config: Sdk.GetFunctionScalingConfigCommand,
  get_function_url_config: Sdk.GetFunctionUrlConfigCommand,
  get_layer_version: Sdk.GetLayerVersionCommand,
  get_layer_version_by_arn: Sdk.GetLayerVersionByArnCommand,
  get_layer_version_policy: Sdk.GetLayerVersionPolicyCommand,
  get_policy: Sdk.GetPolicyCommand,
  get_provisioned_concurrency_config: Sdk.GetProvisionedConcurrencyConfigCommand,
  get_runtime_management_config: Sdk.GetRuntimeManagementConfigCommand,
  invoke: Sdk.InvokeCommand,
  invoke_async: Sdk.InvokeAsyncCommand,
  invoke_with_response_stream: Sdk.InvokeWithResponseStreamCommand,
  list_aliases: Sdk.ListAliasesCommand,
  list_capacity_providers: Sdk.ListCapacityProvidersCommand,
  list_code_signing_configs: Sdk.ListCodeSigningConfigsCommand,
  list_durable_executions_by_function: Sdk.ListDurableExecutionsByFunctionCommand,
  list_event_source_mappings: Sdk.ListEventSourceMappingsCommand,
  list_function_event_invoke_configs: Sdk.ListFunctionEventInvokeConfigsCommand,
  list_function_url_configs: Sdk.ListFunctionUrlConfigsCommand,
  list_function_versions_by_capacity_provider: Sdk.ListFunctionVersionsByCapacityProviderCommand,
  list_functions: Sdk.ListFunctionsCommand,
  list_functions_by_code_signing_config: Sdk.ListFunctionsByCodeSigningConfigCommand,
  list_layer_versions: Sdk.ListLayerVersionsCommand,
  list_layers: Sdk.ListLayersCommand,
  list_provisioned_concurrency_configs: Sdk.ListProvisionedConcurrencyConfigsCommand,
  list_tags: Sdk.ListTagsCommand,
  list_versions_by_function: Sdk.ListVersionsByFunctionCommand,
  publish_layer_version: Sdk.PublishLayerVersionCommand,
  publish_version: Sdk.PublishVersionCommand,
  put_function_code_signing_config: Sdk.PutFunctionCodeSigningConfigCommand,
  put_function_concurrency: Sdk.PutFunctionConcurrencyCommand,
  put_function_event_invoke_config: Sdk.PutFunctionEventInvokeConfigCommand,
  put_function_recursion_config: Sdk.PutFunctionRecursionConfigCommand,
  put_function_scaling_config: Sdk.PutFunctionScalingConfigCommand,
  put_provisioned_concurrency_config: Sdk.PutProvisionedConcurrencyConfigCommand,
  put_runtime_management_config: Sdk.PutRuntimeManagementConfigCommand,
  remove_layer_version_permission: Sdk.RemoveLayerVersionPermissionCommand,
  remove_permission: Sdk.RemovePermissionCommand,
  send_durable_execution_callback_failure: Sdk.SendDurableExecutionCallbackFailureCommand,
  send_durable_execution_callback_heartbeat: Sdk.SendDurableExecutionCallbackHeartbeatCommand,
  send_durable_execution_callback_success: Sdk.SendDurableExecutionCallbackSuccessCommand,
  stop_durable_execution: Sdk.StopDurableExecutionCommand,
  tag_resource: Sdk.TagResourceCommand,
  untag_resource: Sdk.UntagResourceCommand,
  update_alias: Sdk.UpdateAliasCommand,
  update_capacity_provider: Sdk.UpdateCapacityProviderCommand,
  update_code_signing_config: Sdk.UpdateCodeSigningConfigCommand,
  update_event_source_mapping: Sdk.UpdateEventSourceMappingCommand,
  update_function_code: Sdk.UpdateFunctionCodeCommand,
  update_function_configuration: Sdk.UpdateFunctionConfigurationCommand,
  update_function_event_invoke_config: Sdk.UpdateFunctionEventInvokeConfigCommand,
  update_function_url_config: Sdk.UpdateFunctionUrlConfigCommand,
};
