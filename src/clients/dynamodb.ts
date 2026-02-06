import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Sdk from "@aws-sdk/client-dynamodb";
import type { AllErrors } from "./internal/utils.js";

// *****  GENERATED CODE *****

export class DynamoDBClient extends Context.Tag('DynamoDBClient')<DynamoDBClient, Sdk.DynamoDBClient>() {

  static Default = (
    config?: Sdk.DynamoDBClientConfig
  ) =>
    Layer.effect(
      DynamoDBClient,
      Effect.gen(function*() {
        return new Sdk.DynamoDBClient(config ?? {})
      })
    )
}

/**
 * Creates an Effect that executes an AWS DynamoDB command.
 *
 * @param actionName - The name of the DynamoDB command to execute
 * @param actionInput - The input parameters for the command
 * @returns An Effect that will execute the command and return its output
 *
 * @example
 * ```typescript
 * import { dynamodb } from "@effect-ak/aws-sdk"
 *
 * const program = Effect.gen(function*() {
 *   const result = yield* dynamodb.make("command_name", {
 *     // command input parameters
 *   })
 *   return result
 * })
 * ```
 */
export const make =
  Effect.fn('aws_DynamoDB')(function* <M extends keyof DynamoDBApi>(
    actionName: M, actionInput: DynamoDBApi[M][0]
  ) {
    yield* Effect.logDebug(`aws_DynamoDB.${actionName}`, { input: actionInput })

    const client = yield* DynamoDBClient
    const command = new DynamoDBCommandFactory[actionName](actionInput) as Parameters<typeof client.send>[0]

    const result = yield* Effect.tryPromise({
      try: () => client.send(command) as Promise<DynamoDBApi[M][1]>,
      catch: (error) => {
        if (error instanceof Sdk.DynamoDBServiceException) {
          return new DynamoDBError(error, actionName)
        }
        throw error
      }
    })

    yield* Effect.logDebug(`aws_DynamoDB.${actionName} completed`)

    return result
  })

export class DynamoDBError<C extends keyof DynamoDBApi> {
  readonly _tag = "DynamoDBError";

  constructor(
    readonly cause: Sdk.DynamoDBServiceException,
    readonly command: C
  ) { }

  $is<N extends keyof DynamoDBApi[C][2]>(
    name: N
  ): this is DynamoDBError<C> {
    return this.cause.name == name;
  }

  is<N extends keyof AllErrors<DynamoDBApi>>(
    name: N
  ): this is DynamoDBError<C> {
    return this.cause.name == name;
  }

}

export type DynamoDBMethodInput<M extends keyof DynamoDBApi> = DynamoDBApi[M][0];
type DynamoDBApi = {
  batch_execute_statement: [
    Sdk.BatchExecuteStatementCommandInput,
    Sdk.BatchExecuteStatementCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ThrottlingException": Sdk.ThrottlingException
    }
  ]
  batch_get_item: [
    Sdk.BatchGetItemCommandInput,
    Sdk.BatchGetItemCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ProvisionedThroughputExceededException": Sdk.ProvisionedThroughputExceededException,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ThrottlingException": Sdk.ThrottlingException
    }
  ]
  batch_write_item: [
    Sdk.BatchWriteItemCommandInput,
    Sdk.BatchWriteItemCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ItemCollectionSizeLimitExceededException": Sdk.ItemCollectionSizeLimitExceededException,
      "ProvisionedThroughputExceededException": Sdk.ProvisionedThroughputExceededException,
      "ReplicatedWriteConflictException": Sdk.ReplicatedWriteConflictException,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ThrottlingException": Sdk.ThrottlingException
    }
  ]
  create_backup: [
    Sdk.CreateBackupCommandInput,
    Sdk.CreateBackupCommandOutput,
    {
      "BackupInUseException": Sdk.BackupInUseException,
      "ContinuousBackupsUnavailableException": Sdk.ContinuousBackupsUnavailableException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "TableInUseException": Sdk.TableInUseException,
      "TableNotFoundException": Sdk.TableNotFoundException
    }
  ]
  create_global_table: [
    Sdk.CreateGlobalTableCommandInput,
    Sdk.CreateGlobalTableCommandOutput,
    {
      "GlobalTableAlreadyExistsException": Sdk.GlobalTableAlreadyExistsException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "TableNotFoundException": Sdk.TableNotFoundException
    }
  ]
  create_table: [
    Sdk.CreateTableCommandInput,
    Sdk.CreateTableCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ResourceInUseException": Sdk.ResourceInUseException
    }
  ]
  delete_backup: [
    Sdk.DeleteBackupCommandInput,
    Sdk.DeleteBackupCommandOutput,
    {
      "BackupInUseException": Sdk.BackupInUseException,
      "BackupNotFoundException": Sdk.BackupNotFoundException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException
    }
  ]
  delete_item: [
    Sdk.DeleteItemCommandInput,
    Sdk.DeleteItemCommandOutput,
    {
      "ConditionalCheckFailedException": Sdk.ConditionalCheckFailedException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ItemCollectionSizeLimitExceededException": Sdk.ItemCollectionSizeLimitExceededException,
      "ProvisionedThroughputExceededException": Sdk.ProvisionedThroughputExceededException,
      "ReplicatedWriteConflictException": Sdk.ReplicatedWriteConflictException,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ThrottlingException": Sdk.ThrottlingException,
      "TransactionConflictException": Sdk.TransactionConflictException
    }
  ]
  delete_resource_policy: [
    Sdk.DeleteResourcePolicyCommandInput,
    Sdk.DeleteResourcePolicyCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "PolicyNotFoundException": Sdk.PolicyNotFoundException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  delete_table: [
    Sdk.DeleteTableCommandInput,
    Sdk.DeleteTableCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  describe_backup: [
    Sdk.DescribeBackupCommandInput,
    Sdk.DescribeBackupCommandOutput,
    {
      "BackupNotFoundException": Sdk.BackupNotFoundException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException
    }
  ]
  describe_continuous_backups: [
    Sdk.DescribeContinuousBackupsCommandInput,
    Sdk.DescribeContinuousBackupsCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "TableNotFoundException": Sdk.TableNotFoundException
    }
  ]
  describe_contributor_insights: [
    Sdk.DescribeContributorInsightsCommandInput,
    Sdk.DescribeContributorInsightsCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  describe_endpoints: [
    Sdk.DescribeEndpointsCommandInput,
    Sdk.DescribeEndpointsCommandOutput,
    never
  ]
  describe_export: [
    Sdk.DescribeExportCommandInput,
    Sdk.DescribeExportCommandOutput,
    {
      "ExportNotFoundException": Sdk.ExportNotFoundException,
      "InternalServerError": Sdk.InternalServerError,
      "LimitExceededException": Sdk.LimitExceededException
    }
  ]
  describe_global_table: [
    Sdk.DescribeGlobalTableCommandInput,
    Sdk.DescribeGlobalTableCommandOutput,
    {
      "GlobalTableNotFoundException": Sdk.GlobalTableNotFoundException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException
    }
  ]
  describe_global_table_settings: [
    Sdk.DescribeGlobalTableSettingsCommandInput,
    Sdk.DescribeGlobalTableSettingsCommandOutput,
    {
      "GlobalTableNotFoundException": Sdk.GlobalTableNotFoundException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException
    }
  ]
  describe_import: [
    Sdk.DescribeImportCommandInput,
    Sdk.DescribeImportCommandOutput,
    {
      "ImportNotFoundException": Sdk.ImportNotFoundException
    }
  ]
  describe_kinesis_streaming_destination: [
    Sdk.DescribeKinesisStreamingDestinationCommandInput,
    Sdk.DescribeKinesisStreamingDestinationCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  describe_limits: [
    Sdk.DescribeLimitsCommandInput,
    Sdk.DescribeLimitsCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException
    }
  ]
  describe_table: [
    Sdk.DescribeTableCommandInput,
    Sdk.DescribeTableCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  describe_table_replica_auto_scaling: [
    Sdk.DescribeTableReplicaAutoScalingCommandInput,
    Sdk.DescribeTableReplicaAutoScalingCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  describe_time_to_live: [
    Sdk.DescribeTimeToLiveCommandInput,
    Sdk.DescribeTimeToLiveCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  disable_kinesis_streaming_destination: [
    Sdk.DisableKinesisStreamingDestinationCommandInput,
    Sdk.DisableKinesisStreamingDestinationCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  enable_kinesis_streaming_destination: [
    Sdk.EnableKinesisStreamingDestinationCommandInput,
    Sdk.EnableKinesisStreamingDestinationCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  execute_statement: [
    Sdk.ExecuteStatementCommandInput,
    Sdk.ExecuteStatementCommandOutput,
    {
      "ConditionalCheckFailedException": Sdk.ConditionalCheckFailedException,
      "DuplicateItemException": Sdk.DuplicateItemException,
      "InternalServerError": Sdk.InternalServerError,
      "ItemCollectionSizeLimitExceededException": Sdk.ItemCollectionSizeLimitExceededException,
      "ProvisionedThroughputExceededException": Sdk.ProvisionedThroughputExceededException,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ThrottlingException": Sdk.ThrottlingException,
      "TransactionConflictException": Sdk.TransactionConflictException
    }
  ]
  execute_transaction: [
    Sdk.ExecuteTransactionCommandInput,
    Sdk.ExecuteTransactionCommandOutput,
    {
      "IdempotentParameterMismatchException": Sdk.IdempotentParameterMismatchException,
      "InternalServerError": Sdk.InternalServerError,
      "ProvisionedThroughputExceededException": Sdk.ProvisionedThroughputExceededException,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ThrottlingException": Sdk.ThrottlingException,
      "TransactionCanceledException": Sdk.TransactionCanceledException,
      "TransactionInProgressException": Sdk.TransactionInProgressException
    }
  ]
  export_table_to_point_in_time: [
    Sdk.ExportTableToPointInTimeCommandInput,
    Sdk.ExportTableToPointInTimeCommandOutput,
    {
      "ExportConflictException": Sdk.ExportConflictException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidExportTimeException": Sdk.InvalidExportTimeException,
      "LimitExceededException": Sdk.LimitExceededException,
      "PointInTimeRecoveryUnavailableException": Sdk.PointInTimeRecoveryUnavailableException,
      "TableNotFoundException": Sdk.TableNotFoundException
    }
  ]
  get_item: [
    Sdk.GetItemCommandInput,
    Sdk.GetItemCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ProvisionedThroughputExceededException": Sdk.ProvisionedThroughputExceededException,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ThrottlingException": Sdk.ThrottlingException
    }
  ]
  get_resource_policy: [
    Sdk.GetResourcePolicyCommandInput,
    Sdk.GetResourcePolicyCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "PolicyNotFoundException": Sdk.PolicyNotFoundException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  import_table: [
    Sdk.ImportTableCommandInput,
    Sdk.ImportTableCommandOutput,
    {
      "ImportConflictException": Sdk.ImportConflictException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ResourceInUseException": Sdk.ResourceInUseException
    }
  ]
  list_backups: [
    Sdk.ListBackupsCommandInput,
    Sdk.ListBackupsCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException
    }
  ]
  list_contributor_insights: [
    Sdk.ListContributorInsightsCommandInput,
    Sdk.ListContributorInsightsCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  list_exports: [
    Sdk.ListExportsCommandInput,
    Sdk.ListExportsCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "LimitExceededException": Sdk.LimitExceededException
    }
  ]
  list_global_tables: [
    Sdk.ListGlobalTablesCommandInput,
    Sdk.ListGlobalTablesCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException
    }
  ]
  list_imports: [
    Sdk.ListImportsCommandInput,
    Sdk.ListImportsCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException
    }
  ]
  list_tables: [
    Sdk.ListTablesCommandInput,
    Sdk.ListTablesCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException
    }
  ]
  list_tags_of_resource: [
    Sdk.ListTagsOfResourceCommandInput,
    Sdk.ListTagsOfResourceCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  put_item: [
    Sdk.PutItemCommandInput,
    Sdk.PutItemCommandOutput,
    {
      "ConditionalCheckFailedException": Sdk.ConditionalCheckFailedException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ItemCollectionSizeLimitExceededException": Sdk.ItemCollectionSizeLimitExceededException,
      "ProvisionedThroughputExceededException": Sdk.ProvisionedThroughputExceededException,
      "ReplicatedWriteConflictException": Sdk.ReplicatedWriteConflictException,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ThrottlingException": Sdk.ThrottlingException,
      "TransactionConflictException": Sdk.TransactionConflictException
    }
  ]
  put_resource_policy: [
    Sdk.PutResourcePolicyCommandInput,
    Sdk.PutResourcePolicyCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "PolicyNotFoundException": Sdk.PolicyNotFoundException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  query: [
    Sdk.QueryCommandInput,
    Sdk.QueryCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ProvisionedThroughputExceededException": Sdk.ProvisionedThroughputExceededException,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ThrottlingException": Sdk.ThrottlingException
    }
  ]
  restore_table_from_backup: [
    Sdk.RestoreTableFromBackupCommandInput,
    Sdk.RestoreTableFromBackupCommandOutput,
    {
      "BackupInUseException": Sdk.BackupInUseException,
      "BackupNotFoundException": Sdk.BackupNotFoundException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "TableAlreadyExistsException": Sdk.TableAlreadyExistsException,
      "TableInUseException": Sdk.TableInUseException
    }
  ]
  restore_table_to_point_in_time: [
    Sdk.RestoreTableToPointInTimeCommandInput,
    Sdk.RestoreTableToPointInTimeCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "InvalidRestoreTimeException": Sdk.InvalidRestoreTimeException,
      "LimitExceededException": Sdk.LimitExceededException,
      "PointInTimeRecoveryUnavailableException": Sdk.PointInTimeRecoveryUnavailableException,
      "TableAlreadyExistsException": Sdk.TableAlreadyExistsException,
      "TableInUseException": Sdk.TableInUseException,
      "TableNotFoundException": Sdk.TableNotFoundException
    }
  ]
  scan: [
    Sdk.ScanCommandInput,
    Sdk.ScanCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ProvisionedThroughputExceededException": Sdk.ProvisionedThroughputExceededException,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ThrottlingException": Sdk.ThrottlingException
    }
  ]
  tag_resource: [
    Sdk.TagResourceCommandInput,
    Sdk.TagResourceCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  transact_get_items: [
    Sdk.TransactGetItemsCommandInput,
    Sdk.TransactGetItemsCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ProvisionedThroughputExceededException": Sdk.ProvisionedThroughputExceededException,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ThrottlingException": Sdk.ThrottlingException,
      "TransactionCanceledException": Sdk.TransactionCanceledException
    }
  ]
  transact_write_items: [
    Sdk.TransactWriteItemsCommandInput,
    Sdk.TransactWriteItemsCommandOutput,
    {
      "IdempotentParameterMismatchException": Sdk.IdempotentParameterMismatchException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ProvisionedThroughputExceededException": Sdk.ProvisionedThroughputExceededException,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ThrottlingException": Sdk.ThrottlingException,
      "TransactionCanceledException": Sdk.TransactionCanceledException,
      "TransactionInProgressException": Sdk.TransactionInProgressException
    }
  ]
  untag_resource: [
    Sdk.UntagResourceCommandInput,
    Sdk.UntagResourceCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  update_continuous_backups: [
    Sdk.UpdateContinuousBackupsCommandInput,
    Sdk.UpdateContinuousBackupsCommandOutput,
    {
      "ContinuousBackupsUnavailableException": Sdk.ContinuousBackupsUnavailableException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "TableNotFoundException": Sdk.TableNotFoundException
    }
  ]
  update_contributor_insights: [
    Sdk.UpdateContributorInsightsCommandInput,
    Sdk.UpdateContributorInsightsCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  update_global_table: [
    Sdk.UpdateGlobalTableCommandInput,
    Sdk.UpdateGlobalTableCommandOutput,
    {
      "GlobalTableNotFoundException": Sdk.GlobalTableNotFoundException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ReplicaAlreadyExistsException": Sdk.ReplicaAlreadyExistsException,
      "ReplicaNotFoundException": Sdk.ReplicaNotFoundException,
      "TableNotFoundException": Sdk.TableNotFoundException
    }
  ]
  update_global_table_settings: [
    Sdk.UpdateGlobalTableSettingsCommandInput,
    Sdk.UpdateGlobalTableSettingsCommandOutput,
    {
      "GlobalTableNotFoundException": Sdk.GlobalTableNotFoundException,
      "IndexNotFoundException": Sdk.IndexNotFoundException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ReplicaNotFoundException": Sdk.ReplicaNotFoundException,
      "ResourceInUseException": Sdk.ResourceInUseException
    }
  ]
  update_item: [
    Sdk.UpdateItemCommandInput,
    Sdk.UpdateItemCommandOutput,
    {
      "ConditionalCheckFailedException": Sdk.ConditionalCheckFailedException,
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "ItemCollectionSizeLimitExceededException": Sdk.ItemCollectionSizeLimitExceededException,
      "ProvisionedThroughputExceededException": Sdk.ProvisionedThroughputExceededException,
      "ReplicatedWriteConflictException": Sdk.ReplicatedWriteConflictException,
      "RequestLimitExceeded": Sdk.RequestLimitExceeded,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException,
      "ThrottlingException": Sdk.ThrottlingException,
      "TransactionConflictException": Sdk.TransactionConflictException
    }
  ]
  update_kinesis_streaming_destination: [
    Sdk.UpdateKinesisStreamingDestinationCommandInput,
    Sdk.UpdateKinesisStreamingDestinationCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  update_table: [
    Sdk.UpdateTableCommandInput,
    Sdk.UpdateTableCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  update_table_replica_auto_scaling: [
    Sdk.UpdateTableReplicaAutoScalingCommandInput,
    Sdk.UpdateTableReplicaAutoScalingCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "LimitExceededException": Sdk.LimitExceededException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
  update_time_to_live: [
    Sdk.UpdateTimeToLiveCommandInput,
    Sdk.UpdateTimeToLiveCommandOutput,
    {
      "InternalServerError": Sdk.InternalServerError,
      "InvalidEndpointException": Sdk.InvalidEndpointException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ResourceInUseException": Sdk.ResourceInUseException,
      "ResourceNotFoundException": Sdk.ResourceNotFoundException
    }
  ]
};

const DynamoDBCommandFactory: { [M in keyof DynamoDBApi]: new (args: DynamoDBApi[M][0]) => unknown } = {
  batch_execute_statement: Sdk.BatchExecuteStatementCommand,
  batch_get_item: Sdk.BatchGetItemCommand,
  batch_write_item: Sdk.BatchWriteItemCommand,
  create_backup: Sdk.CreateBackupCommand,
  create_global_table: Sdk.CreateGlobalTableCommand,
  create_table: Sdk.CreateTableCommand,
  delete_backup: Sdk.DeleteBackupCommand,
  delete_item: Sdk.DeleteItemCommand,
  delete_resource_policy: Sdk.DeleteResourcePolicyCommand,
  delete_table: Sdk.DeleteTableCommand,
  describe_backup: Sdk.DescribeBackupCommand,
  describe_continuous_backups: Sdk.DescribeContinuousBackupsCommand,
  describe_contributor_insights: Sdk.DescribeContributorInsightsCommand,
  describe_endpoints: Sdk.DescribeEndpointsCommand,
  describe_export: Sdk.DescribeExportCommand,
  describe_global_table: Sdk.DescribeGlobalTableCommand,
  describe_global_table_settings: Sdk.DescribeGlobalTableSettingsCommand,
  describe_import: Sdk.DescribeImportCommand,
  describe_kinesis_streaming_destination: Sdk.DescribeKinesisStreamingDestinationCommand,
  describe_limits: Sdk.DescribeLimitsCommand,
  describe_table: Sdk.DescribeTableCommand,
  describe_table_replica_auto_scaling: Sdk.DescribeTableReplicaAutoScalingCommand,
  describe_time_to_live: Sdk.DescribeTimeToLiveCommand,
  disable_kinesis_streaming_destination: Sdk.DisableKinesisStreamingDestinationCommand,
  enable_kinesis_streaming_destination: Sdk.EnableKinesisStreamingDestinationCommand,
  execute_statement: Sdk.ExecuteStatementCommand,
  execute_transaction: Sdk.ExecuteTransactionCommand,
  export_table_to_point_in_time: Sdk.ExportTableToPointInTimeCommand,
  get_item: Sdk.GetItemCommand,
  get_resource_policy: Sdk.GetResourcePolicyCommand,
  import_table: Sdk.ImportTableCommand,
  list_backups: Sdk.ListBackupsCommand,
  list_contributor_insights: Sdk.ListContributorInsightsCommand,
  list_exports: Sdk.ListExportsCommand,
  list_global_tables: Sdk.ListGlobalTablesCommand,
  list_imports: Sdk.ListImportsCommand,
  list_tables: Sdk.ListTablesCommand,
  list_tags_of_resource: Sdk.ListTagsOfResourceCommand,
  put_item: Sdk.PutItemCommand,
  put_resource_policy: Sdk.PutResourcePolicyCommand,
  query: Sdk.QueryCommand,
  restore_table_from_backup: Sdk.RestoreTableFromBackupCommand,
  restore_table_to_point_in_time: Sdk.RestoreTableToPointInTimeCommand,
  scan: Sdk.ScanCommand,
  tag_resource: Sdk.TagResourceCommand,
  transact_get_items: Sdk.TransactGetItemsCommand,
  transact_write_items: Sdk.TransactWriteItemsCommand,
  untag_resource: Sdk.UntagResourceCommand,
  update_continuous_backups: Sdk.UpdateContinuousBackupsCommand,
  update_contributor_insights: Sdk.UpdateContributorInsightsCommand,
  update_global_table: Sdk.UpdateGlobalTableCommand,
  update_global_table_settings: Sdk.UpdateGlobalTableSettingsCommand,
  update_item: Sdk.UpdateItemCommand,
  update_kinesis_streaming_destination: Sdk.UpdateKinesisStreamingDestinationCommand,
  update_table: Sdk.UpdateTableCommand,
  update_table_replica_auto_scaling: Sdk.UpdateTableReplicaAutoScalingCommand,
  update_time_to_live: Sdk.UpdateTimeToLiveCommand,
};
