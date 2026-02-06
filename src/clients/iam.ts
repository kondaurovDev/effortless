import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Sdk from "@aws-sdk/client-iam";
import type { AllErrors } from "./internal/utils.js";

// *****  GENERATED CODE *****

export class IAMClient extends Context.Tag('IAMClient')<IAMClient, Sdk.IAMClient>() {

  static Default = (
    config?: Sdk.IAMClientConfig
  ) =>
    Layer.effect(
      IAMClient,
      Effect.gen(function*() {
        return new Sdk.IAMClient(config ?? {})
      })
    )
}

/**
 * Creates an Effect that executes an AWS IAM command.
 *
 * @param actionName - The name of the IAM command to execute
 * @param actionInput - The input parameters for the command
 * @returns An Effect that will execute the command and return its output
 *
 * @example
 * ```typescript
 * import { iam } from "@effect-ak/aws-sdk"
 *
 * const program = Effect.gen(function*() {
 *   const result = yield* iam.make("command_name", {
 *     // command input parameters
 *   })
 *   return result
 * })
 * ```
 */
export const make =
  Effect.fn('aws_IAM')(function* <M extends keyof IAMApi>(
    actionName: M, actionInput: IAMApi[M][0]
  ) {
    yield* Effect.logDebug(`aws_IAM.${actionName}`, { input: actionInput })

    const client = yield* IAMClient
    const command = new IAMCommandFactory[actionName](actionInput) as Parameters<typeof client.send>[0]

    const result = yield* Effect.tryPromise({
      try: () => client.send(command) as Promise<IAMApi[M][1]>,
      catch: (error) => {
        if (error instanceof Sdk.IAMServiceException) {
          return new IAMError(error, actionName)
        }
        throw error
      }
    })

    yield* Effect.logDebug(`aws_IAM.${actionName} completed`)

    return result
  })

export class IAMError<C extends keyof IAMApi> {
  readonly _tag = "IAMError";

  constructor(
    readonly cause: Sdk.IAMServiceException,
    readonly command: C
  ) { }

  $is<N extends keyof IAMApi[C][2]>(
    name: N
  ): this is IAMError<C> {
    return this.cause.name == name;
  }

  is<N extends keyof AllErrors<IAMApi>>(
    name: N
  ): this is IAMError<C> {
    return this.cause.name == name;
  }

}

export type IAMMethodInput<M extends keyof IAMApi> = IAMApi[M][0];
type IAMApi = {
  accept_delegation_request: [
    Sdk.AcceptDelegationRequestCommandInput,
    Sdk.AcceptDelegationRequestCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  add_client_id_to_open_id_connect_provider: [
    Sdk.AddClientIDToOpenIDConnectProviderCommandInput,
    Sdk.AddClientIDToOpenIDConnectProviderCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  add_role_to_instance_profile: [
    Sdk.AddRoleToInstanceProfileCommandInput,
    Sdk.AddRoleToInstanceProfileCommandOutput,
    {
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException,
      "UnmodifiableEntityException": Sdk.UnmodifiableEntityException
    }
  ]
  add_user_to_group: [
    Sdk.AddUserToGroupCommandInput,
    Sdk.AddUserToGroupCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  associate_delegation_request: [
    Sdk.AssociateDelegationRequestCommandInput,
    Sdk.AssociateDelegationRequestCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  attach_group_policy: [
    Sdk.AttachGroupPolicyCommandInput,
    Sdk.AttachGroupPolicyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "PolicyNotAttachableException": Sdk.PolicyNotAttachableException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  attach_role_policy: [
    Sdk.AttachRolePolicyCommandInput,
    Sdk.AttachRolePolicyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "PolicyNotAttachableException": Sdk.PolicyNotAttachableException,
      "ServiceFailureException": Sdk.ServiceFailureException,
      "UnmodifiableEntityException": Sdk.UnmodifiableEntityException
    }
  ]
  attach_user_policy: [
    Sdk.AttachUserPolicyCommandInput,
    Sdk.AttachUserPolicyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "PolicyNotAttachableException": Sdk.PolicyNotAttachableException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  change_password: [
    Sdk.ChangePasswordCommandInput,
    Sdk.ChangePasswordCommandOutput,
    {
      "EntityTemporarilyUnmodifiableException": Sdk.EntityTemporarilyUnmodifiableException,
      "InvalidUserTypeException": Sdk.InvalidUserTypeException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "PasswordPolicyViolationException": Sdk.PasswordPolicyViolationException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_access_key: [
    Sdk.CreateAccessKeyCommandInput,
    Sdk.CreateAccessKeyCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_account_alias: [
    Sdk.CreateAccountAliasCommandInput,
    Sdk.CreateAccountAliasCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_delegation_request: [
    Sdk.CreateDelegationRequestCommandInput,
    Sdk.CreateDelegationRequestCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_group: [
    Sdk.CreateGroupCommandInput,
    Sdk.CreateGroupCommandOutput,
    {
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_instance_profile: [
    Sdk.CreateInstanceProfileCommandInput,
    Sdk.CreateInstanceProfileCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_login_profile: [
    Sdk.CreateLoginProfileCommandInput,
    Sdk.CreateLoginProfileCommandOutput,
    {
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "PasswordPolicyViolationException": Sdk.PasswordPolicyViolationException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_open_id_connect_provider: [
    Sdk.CreateOpenIDConnectProviderCommandInput,
    Sdk.CreateOpenIDConnectProviderCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "OpenIdIdpCommunicationErrorException": Sdk.OpenIdIdpCommunicationErrorException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_policy: [
    Sdk.CreatePolicyCommandInput,
    Sdk.CreatePolicyCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "MalformedPolicyDocumentException": Sdk.MalformedPolicyDocumentException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_policy_version: [
    Sdk.CreatePolicyVersionCommandInput,
    Sdk.CreatePolicyVersionCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "MalformedPolicyDocumentException": Sdk.MalformedPolicyDocumentException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_role: [
    Sdk.CreateRoleCommandInput,
    Sdk.CreateRoleCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "MalformedPolicyDocumentException": Sdk.MalformedPolicyDocumentException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_saml_provider: [
    Sdk.CreateSAMLProviderCommandInput,
    Sdk.CreateSAMLProviderCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_service_linked_role: [
    Sdk.CreateServiceLinkedRoleCommandInput,
    Sdk.CreateServiceLinkedRoleCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_service_specific_credential: [
    Sdk.CreateServiceSpecificCredentialCommandInput,
    Sdk.CreateServiceSpecificCredentialCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceNotSupportedException": Sdk.ServiceNotSupportedException
    }
  ]
  create_user: [
    Sdk.CreateUserCommandInput,
    Sdk.CreateUserCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  create_virtual_mfa_device: [
    Sdk.CreateVirtualMFADeviceCommandInput,
    Sdk.CreateVirtualMFADeviceCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  deactivate_mfa_device: [
    Sdk.DeactivateMFADeviceCommandInput,
    Sdk.DeactivateMFADeviceCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityTemporarilyUnmodifiableException": Sdk.EntityTemporarilyUnmodifiableException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_access_key: [
    Sdk.DeleteAccessKeyCommandInput,
    Sdk.DeleteAccessKeyCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_account_alias: [
    Sdk.DeleteAccountAliasCommandInput,
    Sdk.DeleteAccountAliasCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_account_password_policy: [
    Sdk.DeleteAccountPasswordPolicyCommandInput,
    Sdk.DeleteAccountPasswordPolicyCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_group: [
    Sdk.DeleteGroupCommandInput,
    Sdk.DeleteGroupCommandOutput,
    {
      "DeleteConflictException": Sdk.DeleteConflictException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_group_policy: [
    Sdk.DeleteGroupPolicyCommandInput,
    Sdk.DeleteGroupPolicyCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_instance_profile: [
    Sdk.DeleteInstanceProfileCommandInput,
    Sdk.DeleteInstanceProfileCommandOutput,
    {
      "DeleteConflictException": Sdk.DeleteConflictException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_login_profile: [
    Sdk.DeleteLoginProfileCommandInput,
    Sdk.DeleteLoginProfileCommandOutput,
    {
      "EntityTemporarilyUnmodifiableException": Sdk.EntityTemporarilyUnmodifiableException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_open_id_connect_provider: [
    Sdk.DeleteOpenIDConnectProviderCommandInput,
    Sdk.DeleteOpenIDConnectProviderCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_policy: [
    Sdk.DeletePolicyCommandInput,
    Sdk.DeletePolicyCommandOutput,
    {
      "DeleteConflictException": Sdk.DeleteConflictException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_policy_version: [
    Sdk.DeletePolicyVersionCommandInput,
    Sdk.DeletePolicyVersionCommandOutput,
    {
      "DeleteConflictException": Sdk.DeleteConflictException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_role: [
    Sdk.DeleteRoleCommandInput,
    Sdk.DeleteRoleCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "DeleteConflictException": Sdk.DeleteConflictException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException,
      "UnmodifiableEntityException": Sdk.UnmodifiableEntityException
    }
  ]
  delete_role_permissions_boundary: [
    Sdk.DeleteRolePermissionsBoundaryCommandInput,
    Sdk.DeleteRolePermissionsBoundaryCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException,
      "UnmodifiableEntityException": Sdk.UnmodifiableEntityException
    }
  ]
  delete_role_policy: [
    Sdk.DeleteRolePolicyCommandInput,
    Sdk.DeleteRolePolicyCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException,
      "UnmodifiableEntityException": Sdk.UnmodifiableEntityException
    }
  ]
  delete_saml_provider: [
    Sdk.DeleteSAMLProviderCommandInput,
    Sdk.DeleteSAMLProviderCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_server_certificate: [
    Sdk.DeleteServerCertificateCommandInput,
    Sdk.DeleteServerCertificateCommandOutput,
    {
      "DeleteConflictException": Sdk.DeleteConflictException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_service_linked_role: [
    Sdk.DeleteServiceLinkedRoleCommandInput,
    Sdk.DeleteServiceLinkedRoleCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_service_specific_credential: [
    Sdk.DeleteServiceSpecificCredentialCommandInput,
    Sdk.DeleteServiceSpecificCredentialCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException
    }
  ]
  delete_signing_certificate: [
    Sdk.DeleteSigningCertificateCommandInput,
    Sdk.DeleteSigningCertificateCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_ssh_public_key: [
    Sdk.DeleteSSHPublicKeyCommandInput,
    Sdk.DeleteSSHPublicKeyCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException
    }
  ]
  delete_user: [
    Sdk.DeleteUserCommandInput,
    Sdk.DeleteUserCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "DeleteConflictException": Sdk.DeleteConflictException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_user_permissions_boundary: [
    Sdk.DeleteUserPermissionsBoundaryCommandInput,
    Sdk.DeleteUserPermissionsBoundaryCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_user_policy: [
    Sdk.DeleteUserPolicyCommandInput,
    Sdk.DeleteUserPolicyCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  delete_virtual_mfa_device: [
    Sdk.DeleteVirtualMFADeviceCommandInput,
    Sdk.DeleteVirtualMFADeviceCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "DeleteConflictException": Sdk.DeleteConflictException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  detach_group_policy: [
    Sdk.DetachGroupPolicyCommandInput,
    Sdk.DetachGroupPolicyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  detach_role_policy: [
    Sdk.DetachRolePolicyCommandInput,
    Sdk.DetachRolePolicyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException,
      "UnmodifiableEntityException": Sdk.UnmodifiableEntityException
    }
  ]
  detach_user_policy: [
    Sdk.DetachUserPolicyCommandInput,
    Sdk.DetachUserPolicyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  disable_organizations_root_credentials_management: [
    Sdk.DisableOrganizationsRootCredentialsManagementCommandInput,
    Sdk.DisableOrganizationsRootCredentialsManagementCommandOutput,
    {
      "AccountNotManagementOrDelegatedAdministratorException": Sdk.AccountNotManagementOrDelegatedAdministratorException,
      "OrganizationNotFoundException": Sdk.OrganizationNotFoundException,
      "OrganizationNotInAllFeaturesModeException": Sdk.OrganizationNotInAllFeaturesModeException,
      "ServiceAccessNotEnabledException": Sdk.ServiceAccessNotEnabledException
    }
  ]
  disable_organizations_root_sessions: [
    Sdk.DisableOrganizationsRootSessionsCommandInput,
    Sdk.DisableOrganizationsRootSessionsCommandOutput,
    {
      "AccountNotManagementOrDelegatedAdministratorException": Sdk.AccountNotManagementOrDelegatedAdministratorException,
      "OrganizationNotFoundException": Sdk.OrganizationNotFoundException,
      "OrganizationNotInAllFeaturesModeException": Sdk.OrganizationNotInAllFeaturesModeException,
      "ServiceAccessNotEnabledException": Sdk.ServiceAccessNotEnabledException
    }
  ]
  disable_outbound_web_identity_federation: [
    Sdk.DisableOutboundWebIdentityFederationCommandInput,
    Sdk.DisableOutboundWebIdentityFederationCommandOutput,
    {
      "FeatureDisabledException": Sdk.FeatureDisabledException
    }
  ]
  enable_mfa_device: [
    Sdk.EnableMFADeviceCommandInput,
    Sdk.EnableMFADeviceCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "EntityTemporarilyUnmodifiableException": Sdk.EntityTemporarilyUnmodifiableException,
      "InvalidAuthenticationCodeException": Sdk.InvalidAuthenticationCodeException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  enable_organizations_root_credentials_management: [
    Sdk.EnableOrganizationsRootCredentialsManagementCommandInput,
    Sdk.EnableOrganizationsRootCredentialsManagementCommandOutput,
    {
      "AccountNotManagementOrDelegatedAdministratorException": Sdk.AccountNotManagementOrDelegatedAdministratorException,
      "CallerIsNotManagementAccountException": Sdk.CallerIsNotManagementAccountException,
      "OrganizationNotFoundException": Sdk.OrganizationNotFoundException,
      "OrganizationNotInAllFeaturesModeException": Sdk.OrganizationNotInAllFeaturesModeException,
      "ServiceAccessNotEnabledException": Sdk.ServiceAccessNotEnabledException
    }
  ]
  enable_organizations_root_sessions: [
    Sdk.EnableOrganizationsRootSessionsCommandInput,
    Sdk.EnableOrganizationsRootSessionsCommandOutput,
    {
      "AccountNotManagementOrDelegatedAdministratorException": Sdk.AccountNotManagementOrDelegatedAdministratorException,
      "CallerIsNotManagementAccountException": Sdk.CallerIsNotManagementAccountException,
      "OrganizationNotFoundException": Sdk.OrganizationNotFoundException,
      "OrganizationNotInAllFeaturesModeException": Sdk.OrganizationNotInAllFeaturesModeException,
      "ServiceAccessNotEnabledException": Sdk.ServiceAccessNotEnabledException
    }
  ]
  enable_outbound_web_identity_federation: [
    Sdk.EnableOutboundWebIdentityFederationCommandInput,
    Sdk.EnableOutboundWebIdentityFederationCommandOutput,
    {
      "FeatureEnabledException": Sdk.FeatureEnabledException
    }
  ]
  generate_credential_report: [
    Sdk.GenerateCredentialReportCommandInput,
    Sdk.GenerateCredentialReportCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  generate_organizations_access_report: [
    Sdk.GenerateOrganizationsAccessReportCommandInput,
    Sdk.GenerateOrganizationsAccessReportCommandOutput,
    {
      "ReportGenerationLimitExceededException": Sdk.ReportGenerationLimitExceededException
    }
  ]
  generate_service_last_accessed_details: [
    Sdk.GenerateServiceLastAccessedDetailsCommandInput,
    Sdk.GenerateServiceLastAccessedDetailsCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException
    }
  ]
  get_access_key_last_used: [
    Sdk.GetAccessKeyLastUsedCommandInput,
    Sdk.GetAccessKeyLastUsedCommandOutput,
    never
  ]
  get_account_authorization_details: [
    Sdk.GetAccountAuthorizationDetailsCommandInput,
    Sdk.GetAccountAuthorizationDetailsCommandOutput,
    {
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_account_password_policy: [
    Sdk.GetAccountPasswordPolicyCommandInput,
    Sdk.GetAccountPasswordPolicyCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_account_summary: [
    Sdk.GetAccountSummaryCommandInput,
    Sdk.GetAccountSummaryCommandOutput,
    {
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_context_keys_for_custom_policy: [
    Sdk.GetContextKeysForCustomPolicyCommandInput,
    Sdk.GetContextKeysForCustomPolicyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException
    }
  ]
  get_context_keys_for_principal_policy: [
    Sdk.GetContextKeysForPrincipalPolicyCommandInput,
    Sdk.GetContextKeysForPrincipalPolicyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException
    }
  ]
  get_credential_report: [
    Sdk.GetCredentialReportCommandInput,
    Sdk.GetCredentialReportCommandOutput,
    {
      "CredentialReportExpiredException": Sdk.CredentialReportExpiredException,
      "CredentialReportNotPresentException": Sdk.CredentialReportNotPresentException,
      "CredentialReportNotReadyException": Sdk.CredentialReportNotReadyException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_delegation_request: [
    Sdk.GetDelegationRequestCommandInput,
    Sdk.GetDelegationRequestCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_group: [
    Sdk.GetGroupCommandInput,
    Sdk.GetGroupCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_group_policy: [
    Sdk.GetGroupPolicyCommandInput,
    Sdk.GetGroupPolicyCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_human_readable_summary: [
    Sdk.GetHumanReadableSummaryCommandInput,
    Sdk.GetHumanReadableSummaryCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_instance_profile: [
    Sdk.GetInstanceProfileCommandInput,
    Sdk.GetInstanceProfileCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_login_profile: [
    Sdk.GetLoginProfileCommandInput,
    Sdk.GetLoginProfileCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_mfa_device: [
    Sdk.GetMFADeviceCommandInput,
    Sdk.GetMFADeviceCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_open_id_connect_provider: [
    Sdk.GetOpenIDConnectProviderCommandInput,
    Sdk.GetOpenIDConnectProviderCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_organizations_access_report: [
    Sdk.GetOrganizationsAccessReportCommandInput,
    Sdk.GetOrganizationsAccessReportCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException
    }
  ]
  get_outbound_web_identity_federation_info: [
    Sdk.GetOutboundWebIdentityFederationInfoCommandInput,
    Sdk.GetOutboundWebIdentityFederationInfoCommandOutput,
    {
      "FeatureDisabledException": Sdk.FeatureDisabledException
    }
  ]
  get_policy: [
    Sdk.GetPolicyCommandInput,
    Sdk.GetPolicyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_policy_version: [
    Sdk.GetPolicyVersionCommandInput,
    Sdk.GetPolicyVersionCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_role: [
    Sdk.GetRoleCommandInput,
    Sdk.GetRoleCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_role_policy: [
    Sdk.GetRolePolicyCommandInput,
    Sdk.GetRolePolicyCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_saml_provider: [
    Sdk.GetSAMLProviderCommandInput,
    Sdk.GetSAMLProviderCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_server_certificate: [
    Sdk.GetServerCertificateCommandInput,
    Sdk.GetServerCertificateCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_service_last_accessed_details: [
    Sdk.GetServiceLastAccessedDetailsCommandInput,
    Sdk.GetServiceLastAccessedDetailsCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException
    }
  ]
  get_service_last_accessed_details_with_entities: [
    Sdk.GetServiceLastAccessedDetailsWithEntitiesCommandInput,
    Sdk.GetServiceLastAccessedDetailsWithEntitiesCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException
    }
  ]
  get_service_linked_role_deletion_status: [
    Sdk.GetServiceLinkedRoleDeletionStatusCommandInput,
    Sdk.GetServiceLinkedRoleDeletionStatusCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_ssh_public_key: [
    Sdk.GetSSHPublicKeyCommandInput,
    Sdk.GetSSHPublicKeyCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "UnrecognizedPublicKeyEncodingException": Sdk.UnrecognizedPublicKeyEncodingException
    }
  ]
  get_user: [
    Sdk.GetUserCommandInput,
    Sdk.GetUserCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  get_user_policy: [
    Sdk.GetUserPolicyCommandInput,
    Sdk.GetUserPolicyCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_access_keys: [
    Sdk.ListAccessKeysCommandInput,
    Sdk.ListAccessKeysCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_account_aliases: [
    Sdk.ListAccountAliasesCommandInput,
    Sdk.ListAccountAliasesCommandOutput,
    {
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_attached_group_policies: [
    Sdk.ListAttachedGroupPoliciesCommandInput,
    Sdk.ListAttachedGroupPoliciesCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_attached_role_policies: [
    Sdk.ListAttachedRolePoliciesCommandInput,
    Sdk.ListAttachedRolePoliciesCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_attached_user_policies: [
    Sdk.ListAttachedUserPoliciesCommandInput,
    Sdk.ListAttachedUserPoliciesCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_delegation_requests: [
    Sdk.ListDelegationRequestsCommandInput,
    Sdk.ListDelegationRequestsCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_entities_for_policy: [
    Sdk.ListEntitiesForPolicyCommandInput,
    Sdk.ListEntitiesForPolicyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_group_policies: [
    Sdk.ListGroupPoliciesCommandInput,
    Sdk.ListGroupPoliciesCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_groups: [
    Sdk.ListGroupsCommandInput,
    Sdk.ListGroupsCommandOutput,
    {
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_groups_for_user: [
    Sdk.ListGroupsForUserCommandInput,
    Sdk.ListGroupsForUserCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_instance_profile_tags: [
    Sdk.ListInstanceProfileTagsCommandInput,
    Sdk.ListInstanceProfileTagsCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_instance_profiles: [
    Sdk.ListInstanceProfilesCommandInput,
    Sdk.ListInstanceProfilesCommandOutput,
    {
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_instance_profiles_for_role: [
    Sdk.ListInstanceProfilesForRoleCommandInput,
    Sdk.ListInstanceProfilesForRoleCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_mfa_device_tags: [
    Sdk.ListMFADeviceTagsCommandInput,
    Sdk.ListMFADeviceTagsCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_mfa_devices: [
    Sdk.ListMFADevicesCommandInput,
    Sdk.ListMFADevicesCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_open_id_connect_provider_tags: [
    Sdk.ListOpenIDConnectProviderTagsCommandInput,
    Sdk.ListOpenIDConnectProviderTagsCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_open_id_connect_providers: [
    Sdk.ListOpenIDConnectProvidersCommandInput,
    Sdk.ListOpenIDConnectProvidersCommandOutput,
    {
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_organizations_features: [
    Sdk.ListOrganizationsFeaturesCommandInput,
    Sdk.ListOrganizationsFeaturesCommandOutput,
    {
      "AccountNotManagementOrDelegatedAdministratorException": Sdk.AccountNotManagementOrDelegatedAdministratorException,
      "OrganizationNotFoundException": Sdk.OrganizationNotFoundException,
      "OrganizationNotInAllFeaturesModeException": Sdk.OrganizationNotInAllFeaturesModeException,
      "ServiceAccessNotEnabledException": Sdk.ServiceAccessNotEnabledException
    }
  ]
  list_policies: [
    Sdk.ListPoliciesCommandInput,
    Sdk.ListPoliciesCommandOutput,
    {
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_policies_granting_service_access: [
    Sdk.ListPoliciesGrantingServiceAccessCommandInput,
    Sdk.ListPoliciesGrantingServiceAccessCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException
    }
  ]
  list_policy_tags: [
    Sdk.ListPolicyTagsCommandInput,
    Sdk.ListPolicyTagsCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_policy_versions: [
    Sdk.ListPolicyVersionsCommandInput,
    Sdk.ListPolicyVersionsCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_role_policies: [
    Sdk.ListRolePoliciesCommandInput,
    Sdk.ListRolePoliciesCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_role_tags: [
    Sdk.ListRoleTagsCommandInput,
    Sdk.ListRoleTagsCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_roles: [
    Sdk.ListRolesCommandInput,
    Sdk.ListRolesCommandOutput,
    {
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_saml_provider_tags: [
    Sdk.ListSAMLProviderTagsCommandInput,
    Sdk.ListSAMLProviderTagsCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_saml_providers: [
    Sdk.ListSAMLProvidersCommandInput,
    Sdk.ListSAMLProvidersCommandOutput,
    {
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_server_certificate_tags: [
    Sdk.ListServerCertificateTagsCommandInput,
    Sdk.ListServerCertificateTagsCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_server_certificates: [
    Sdk.ListServerCertificatesCommandInput,
    Sdk.ListServerCertificatesCommandOutput,
    {
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_service_specific_credentials: [
    Sdk.ListServiceSpecificCredentialsCommandInput,
    Sdk.ListServiceSpecificCredentialsCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceNotSupportedException": Sdk.ServiceNotSupportedException
    }
  ]
  list_signing_certificates: [
    Sdk.ListSigningCertificatesCommandInput,
    Sdk.ListSigningCertificatesCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_ssh_public_keys: [
    Sdk.ListSSHPublicKeysCommandInput,
    Sdk.ListSSHPublicKeysCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException
    }
  ]
  list_user_policies: [
    Sdk.ListUserPoliciesCommandInput,
    Sdk.ListUserPoliciesCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_user_tags: [
    Sdk.ListUserTagsCommandInput,
    Sdk.ListUserTagsCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_users: [
    Sdk.ListUsersCommandInput,
    Sdk.ListUsersCommandOutput,
    {
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  list_virtual_mfa_devices: [
    Sdk.ListVirtualMFADevicesCommandInput,
    Sdk.ListVirtualMFADevicesCommandOutput,
    never
  ]
  put_group_policy: [
    Sdk.PutGroupPolicyCommandInput,
    Sdk.PutGroupPolicyCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "MalformedPolicyDocumentException": Sdk.MalformedPolicyDocumentException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  put_role_permissions_boundary: [
    Sdk.PutRolePermissionsBoundaryCommandInput,
    Sdk.PutRolePermissionsBoundaryCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "PolicyNotAttachableException": Sdk.PolicyNotAttachableException,
      "ServiceFailureException": Sdk.ServiceFailureException,
      "UnmodifiableEntityException": Sdk.UnmodifiableEntityException
    }
  ]
  put_role_policy: [
    Sdk.PutRolePolicyCommandInput,
    Sdk.PutRolePolicyCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "MalformedPolicyDocumentException": Sdk.MalformedPolicyDocumentException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException,
      "UnmodifiableEntityException": Sdk.UnmodifiableEntityException
    }
  ]
  put_user_permissions_boundary: [
    Sdk.PutUserPermissionsBoundaryCommandInput,
    Sdk.PutUserPermissionsBoundaryCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "PolicyNotAttachableException": Sdk.PolicyNotAttachableException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  put_user_policy: [
    Sdk.PutUserPolicyCommandInput,
    Sdk.PutUserPolicyCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "MalformedPolicyDocumentException": Sdk.MalformedPolicyDocumentException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  reject_delegation_request: [
    Sdk.RejectDelegationRequestCommandInput,
    Sdk.RejectDelegationRequestCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  remove_client_id_from_open_id_connect_provider: [
    Sdk.RemoveClientIDFromOpenIDConnectProviderCommandInput,
    Sdk.RemoveClientIDFromOpenIDConnectProviderCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  remove_role_from_instance_profile: [
    Sdk.RemoveRoleFromInstanceProfileCommandInput,
    Sdk.RemoveRoleFromInstanceProfileCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException,
      "UnmodifiableEntityException": Sdk.UnmodifiableEntityException
    }
  ]
  remove_user_from_group: [
    Sdk.RemoveUserFromGroupCommandInput,
    Sdk.RemoveUserFromGroupCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  reset_service_specific_credential: [
    Sdk.ResetServiceSpecificCredentialCommandInput,
    Sdk.ResetServiceSpecificCredentialCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException
    }
  ]
  resync_mfa_device: [
    Sdk.ResyncMFADeviceCommandInput,
    Sdk.ResyncMFADeviceCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidAuthenticationCodeException": Sdk.InvalidAuthenticationCodeException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  send_delegation_token: [
    Sdk.SendDelegationTokenCommandInput,
    Sdk.SendDelegationTokenCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  set_default_policy_version: [
    Sdk.SetDefaultPolicyVersionCommandInput,
    Sdk.SetDefaultPolicyVersionCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  set_security_token_service_preferences: [
    Sdk.SetSecurityTokenServicePreferencesCommandInput,
    Sdk.SetSecurityTokenServicePreferencesCommandOutput,
    {
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  simulate_custom_policy: [
    Sdk.SimulateCustomPolicyCommandInput,
    Sdk.SimulateCustomPolicyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "PolicyEvaluationException": Sdk.PolicyEvaluationException
    }
  ]
  simulate_principal_policy: [
    Sdk.SimulatePrincipalPolicyCommandInput,
    Sdk.SimulatePrincipalPolicyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "PolicyEvaluationException": Sdk.PolicyEvaluationException
    }
  ]
  tag_instance_profile: [
    Sdk.TagInstanceProfileCommandInput,
    Sdk.TagInstanceProfileCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  tag_mfa_device: [
    Sdk.TagMFADeviceCommandInput,
    Sdk.TagMFADeviceCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  tag_open_id_connect_provider: [
    Sdk.TagOpenIDConnectProviderCommandInput,
    Sdk.TagOpenIDConnectProviderCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  tag_policy: [
    Sdk.TagPolicyCommandInput,
    Sdk.TagPolicyCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  tag_role: [
    Sdk.TagRoleCommandInput,
    Sdk.TagRoleCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  tag_saml_provider: [
    Sdk.TagSAMLProviderCommandInput,
    Sdk.TagSAMLProviderCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  tag_server_certificate: [
    Sdk.TagServerCertificateCommandInput,
    Sdk.TagServerCertificateCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  tag_user: [
    Sdk.TagUserCommandInput,
    Sdk.TagUserCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  untag_instance_profile: [
    Sdk.UntagInstanceProfileCommandInput,
    Sdk.UntagInstanceProfileCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  untag_mfa_device: [
    Sdk.UntagMFADeviceCommandInput,
    Sdk.UntagMFADeviceCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  untag_open_id_connect_provider: [
    Sdk.UntagOpenIDConnectProviderCommandInput,
    Sdk.UntagOpenIDConnectProviderCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  untag_policy: [
    Sdk.UntagPolicyCommandInput,
    Sdk.UntagPolicyCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  untag_role: [
    Sdk.UntagRoleCommandInput,
    Sdk.UntagRoleCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  untag_saml_provider: [
    Sdk.UntagSAMLProviderCommandInput,
    Sdk.UntagSAMLProviderCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  untag_server_certificate: [
    Sdk.UntagServerCertificateCommandInput,
    Sdk.UntagServerCertificateCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  untag_user: [
    Sdk.UntagUserCommandInput,
    Sdk.UntagUserCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  update_access_key: [
    Sdk.UpdateAccessKeyCommandInput,
    Sdk.UpdateAccessKeyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  update_account_password_policy: [
    Sdk.UpdateAccountPasswordPolicyCommandInput,
    Sdk.UpdateAccountPasswordPolicyCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "MalformedPolicyDocumentException": Sdk.MalformedPolicyDocumentException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  update_assume_role_policy: [
    Sdk.UpdateAssumeRolePolicyCommandInput,
    Sdk.UpdateAssumeRolePolicyCommandOutput,
    {
      "LimitExceededException": Sdk.LimitExceededException,
      "MalformedPolicyDocumentException": Sdk.MalformedPolicyDocumentException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException,
      "UnmodifiableEntityException": Sdk.UnmodifiableEntityException
    }
  ]
  update_delegation_request: [
    Sdk.UpdateDelegationRequestCommandInput,
    Sdk.UpdateDelegationRequestCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  update_group: [
    Sdk.UpdateGroupCommandInput,
    Sdk.UpdateGroupCommandOutput,
    {
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  update_login_profile: [
    Sdk.UpdateLoginProfileCommandInput,
    Sdk.UpdateLoginProfileCommandOutput,
    {
      "EntityTemporarilyUnmodifiableException": Sdk.EntityTemporarilyUnmodifiableException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "PasswordPolicyViolationException": Sdk.PasswordPolicyViolationException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  update_open_id_connect_provider_thumbprint: [
    Sdk.UpdateOpenIDConnectProviderThumbprintCommandInput,
    Sdk.UpdateOpenIDConnectProviderThumbprintCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  update_role: [
    Sdk.UpdateRoleCommandInput,
    Sdk.UpdateRoleCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException,
      "UnmodifiableEntityException": Sdk.UnmodifiableEntityException
    }
  ]
  update_role_description: [
    Sdk.UpdateRoleDescriptionCommandInput,
    Sdk.UpdateRoleDescriptionCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException,
      "UnmodifiableEntityException": Sdk.UnmodifiableEntityException
    }
  ]
  update_saml_provider: [
    Sdk.UpdateSAMLProviderCommandInput,
    Sdk.UpdateSAMLProviderCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  update_server_certificate: [
    Sdk.UpdateServerCertificateCommandInput,
    Sdk.UpdateServerCertificateCommandOutput,
    {
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  update_service_specific_credential: [
    Sdk.UpdateServiceSpecificCredentialCommandInput,
    Sdk.UpdateServiceSpecificCredentialCommandOutput,
    {
      "NoSuchEntityException": Sdk.NoSuchEntityException
    }
  ]
  update_signing_certificate: [
    Sdk.UpdateSigningCertificateCommandInput,
    Sdk.UpdateSigningCertificateCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  update_ssh_public_key: [
    Sdk.UpdateSSHPublicKeyCommandInput,
    Sdk.UpdateSSHPublicKeyCommandOutput,
    {
      "InvalidInputException": Sdk.InvalidInputException,
      "NoSuchEntityException": Sdk.NoSuchEntityException
    }
  ]
  update_user: [
    Sdk.UpdateUserCommandInput,
    Sdk.UpdateUserCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "EntityTemporarilyUnmodifiableException": Sdk.EntityTemporarilyUnmodifiableException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  upload_server_certificate: [
    Sdk.UploadServerCertificateCommandInput,
    Sdk.UploadServerCertificateCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "InvalidInputException": Sdk.InvalidInputException,
      "KeyPairMismatchException": Sdk.KeyPairMismatchException,
      "LimitExceededException": Sdk.LimitExceededException,
      "MalformedCertificateException": Sdk.MalformedCertificateException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  upload_signing_certificate: [
    Sdk.UploadSigningCertificateCommandInput,
    Sdk.UploadSigningCertificateCommandOutput,
    {
      "ConcurrentModificationException": Sdk.ConcurrentModificationException,
      "DuplicateCertificateException": Sdk.DuplicateCertificateException,
      "EntityAlreadyExistsException": Sdk.EntityAlreadyExistsException,
      "InvalidCertificateException": Sdk.InvalidCertificateException,
      "LimitExceededException": Sdk.LimitExceededException,
      "MalformedCertificateException": Sdk.MalformedCertificateException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "ServiceFailureException": Sdk.ServiceFailureException
    }
  ]
  upload_ssh_public_key: [
    Sdk.UploadSSHPublicKeyCommandInput,
    Sdk.UploadSSHPublicKeyCommandOutput,
    {
      "DuplicateSSHPublicKeyException": Sdk.DuplicateSSHPublicKeyException,
      "InvalidPublicKeyException": Sdk.InvalidPublicKeyException,
      "LimitExceededException": Sdk.LimitExceededException,
      "NoSuchEntityException": Sdk.NoSuchEntityException,
      "UnrecognizedPublicKeyEncodingException": Sdk.UnrecognizedPublicKeyEncodingException
    }
  ]
};

const IAMCommandFactory: { [M in keyof IAMApi]: new (args: IAMApi[M][0]) => unknown } = {
  accept_delegation_request: Sdk.AcceptDelegationRequestCommand,
  add_client_id_to_open_id_connect_provider: Sdk.AddClientIDToOpenIDConnectProviderCommand,
  add_role_to_instance_profile: Sdk.AddRoleToInstanceProfileCommand,
  add_user_to_group: Sdk.AddUserToGroupCommand,
  associate_delegation_request: Sdk.AssociateDelegationRequestCommand,
  attach_group_policy: Sdk.AttachGroupPolicyCommand,
  attach_role_policy: Sdk.AttachRolePolicyCommand,
  attach_user_policy: Sdk.AttachUserPolicyCommand,
  change_password: Sdk.ChangePasswordCommand,
  create_access_key: Sdk.CreateAccessKeyCommand,
  create_account_alias: Sdk.CreateAccountAliasCommand,
  create_delegation_request: Sdk.CreateDelegationRequestCommand,
  create_group: Sdk.CreateGroupCommand,
  create_instance_profile: Sdk.CreateInstanceProfileCommand,
  create_login_profile: Sdk.CreateLoginProfileCommand,
  create_open_id_connect_provider: Sdk.CreateOpenIDConnectProviderCommand,
  create_policy: Sdk.CreatePolicyCommand,
  create_policy_version: Sdk.CreatePolicyVersionCommand,
  create_role: Sdk.CreateRoleCommand,
  create_saml_provider: Sdk.CreateSAMLProviderCommand,
  create_service_linked_role: Sdk.CreateServiceLinkedRoleCommand,
  create_service_specific_credential: Sdk.CreateServiceSpecificCredentialCommand,
  create_user: Sdk.CreateUserCommand,
  create_virtual_mfa_device: Sdk.CreateVirtualMFADeviceCommand,
  deactivate_mfa_device: Sdk.DeactivateMFADeviceCommand,
  delete_access_key: Sdk.DeleteAccessKeyCommand,
  delete_account_alias: Sdk.DeleteAccountAliasCommand,
  delete_account_password_policy: Sdk.DeleteAccountPasswordPolicyCommand,
  delete_group: Sdk.DeleteGroupCommand,
  delete_group_policy: Sdk.DeleteGroupPolicyCommand,
  delete_instance_profile: Sdk.DeleteInstanceProfileCommand,
  delete_login_profile: Sdk.DeleteLoginProfileCommand,
  delete_open_id_connect_provider: Sdk.DeleteOpenIDConnectProviderCommand,
  delete_policy: Sdk.DeletePolicyCommand,
  delete_policy_version: Sdk.DeletePolicyVersionCommand,
  delete_role: Sdk.DeleteRoleCommand,
  delete_role_permissions_boundary: Sdk.DeleteRolePermissionsBoundaryCommand,
  delete_role_policy: Sdk.DeleteRolePolicyCommand,
  delete_saml_provider: Sdk.DeleteSAMLProviderCommand,
  delete_server_certificate: Sdk.DeleteServerCertificateCommand,
  delete_service_linked_role: Sdk.DeleteServiceLinkedRoleCommand,
  delete_service_specific_credential: Sdk.DeleteServiceSpecificCredentialCommand,
  delete_signing_certificate: Sdk.DeleteSigningCertificateCommand,
  delete_ssh_public_key: Sdk.DeleteSSHPublicKeyCommand,
  delete_user: Sdk.DeleteUserCommand,
  delete_user_permissions_boundary: Sdk.DeleteUserPermissionsBoundaryCommand,
  delete_user_policy: Sdk.DeleteUserPolicyCommand,
  delete_virtual_mfa_device: Sdk.DeleteVirtualMFADeviceCommand,
  detach_group_policy: Sdk.DetachGroupPolicyCommand,
  detach_role_policy: Sdk.DetachRolePolicyCommand,
  detach_user_policy: Sdk.DetachUserPolicyCommand,
  disable_organizations_root_credentials_management: Sdk.DisableOrganizationsRootCredentialsManagementCommand,
  disable_organizations_root_sessions: Sdk.DisableOrganizationsRootSessionsCommand,
  disable_outbound_web_identity_federation: Sdk.DisableOutboundWebIdentityFederationCommand,
  enable_mfa_device: Sdk.EnableMFADeviceCommand,
  enable_organizations_root_credentials_management: Sdk.EnableOrganizationsRootCredentialsManagementCommand,
  enable_organizations_root_sessions: Sdk.EnableOrganizationsRootSessionsCommand,
  enable_outbound_web_identity_federation: Sdk.EnableOutboundWebIdentityFederationCommand,
  generate_credential_report: Sdk.GenerateCredentialReportCommand,
  generate_organizations_access_report: Sdk.GenerateOrganizationsAccessReportCommand,
  generate_service_last_accessed_details: Sdk.GenerateServiceLastAccessedDetailsCommand,
  get_access_key_last_used: Sdk.GetAccessKeyLastUsedCommand,
  get_account_authorization_details: Sdk.GetAccountAuthorizationDetailsCommand,
  get_account_password_policy: Sdk.GetAccountPasswordPolicyCommand,
  get_account_summary: Sdk.GetAccountSummaryCommand,
  get_context_keys_for_custom_policy: Sdk.GetContextKeysForCustomPolicyCommand,
  get_context_keys_for_principal_policy: Sdk.GetContextKeysForPrincipalPolicyCommand,
  get_credential_report: Sdk.GetCredentialReportCommand,
  get_delegation_request: Sdk.GetDelegationRequestCommand,
  get_group: Sdk.GetGroupCommand,
  get_group_policy: Sdk.GetGroupPolicyCommand,
  get_human_readable_summary: Sdk.GetHumanReadableSummaryCommand,
  get_instance_profile: Sdk.GetInstanceProfileCommand,
  get_login_profile: Sdk.GetLoginProfileCommand,
  get_mfa_device: Sdk.GetMFADeviceCommand,
  get_open_id_connect_provider: Sdk.GetOpenIDConnectProviderCommand,
  get_organizations_access_report: Sdk.GetOrganizationsAccessReportCommand,
  get_outbound_web_identity_federation_info: Sdk.GetOutboundWebIdentityFederationInfoCommand,
  get_policy: Sdk.GetPolicyCommand,
  get_policy_version: Sdk.GetPolicyVersionCommand,
  get_role: Sdk.GetRoleCommand,
  get_role_policy: Sdk.GetRolePolicyCommand,
  get_saml_provider: Sdk.GetSAMLProviderCommand,
  get_server_certificate: Sdk.GetServerCertificateCommand,
  get_service_last_accessed_details: Sdk.GetServiceLastAccessedDetailsCommand,
  get_service_last_accessed_details_with_entities: Sdk.GetServiceLastAccessedDetailsWithEntitiesCommand,
  get_service_linked_role_deletion_status: Sdk.GetServiceLinkedRoleDeletionStatusCommand,
  get_ssh_public_key: Sdk.GetSSHPublicKeyCommand,
  get_user: Sdk.GetUserCommand,
  get_user_policy: Sdk.GetUserPolicyCommand,
  list_access_keys: Sdk.ListAccessKeysCommand,
  list_account_aliases: Sdk.ListAccountAliasesCommand,
  list_attached_group_policies: Sdk.ListAttachedGroupPoliciesCommand,
  list_attached_role_policies: Sdk.ListAttachedRolePoliciesCommand,
  list_attached_user_policies: Sdk.ListAttachedUserPoliciesCommand,
  list_delegation_requests: Sdk.ListDelegationRequestsCommand,
  list_entities_for_policy: Sdk.ListEntitiesForPolicyCommand,
  list_group_policies: Sdk.ListGroupPoliciesCommand,
  list_groups: Sdk.ListGroupsCommand,
  list_groups_for_user: Sdk.ListGroupsForUserCommand,
  list_instance_profile_tags: Sdk.ListInstanceProfileTagsCommand,
  list_instance_profiles: Sdk.ListInstanceProfilesCommand,
  list_instance_profiles_for_role: Sdk.ListInstanceProfilesForRoleCommand,
  list_mfa_device_tags: Sdk.ListMFADeviceTagsCommand,
  list_mfa_devices: Sdk.ListMFADevicesCommand,
  list_open_id_connect_provider_tags: Sdk.ListOpenIDConnectProviderTagsCommand,
  list_open_id_connect_providers: Sdk.ListOpenIDConnectProvidersCommand,
  list_organizations_features: Sdk.ListOrganizationsFeaturesCommand,
  list_policies: Sdk.ListPoliciesCommand,
  list_policies_granting_service_access: Sdk.ListPoliciesGrantingServiceAccessCommand,
  list_policy_tags: Sdk.ListPolicyTagsCommand,
  list_policy_versions: Sdk.ListPolicyVersionsCommand,
  list_role_policies: Sdk.ListRolePoliciesCommand,
  list_role_tags: Sdk.ListRoleTagsCommand,
  list_roles: Sdk.ListRolesCommand,
  list_saml_provider_tags: Sdk.ListSAMLProviderTagsCommand,
  list_saml_providers: Sdk.ListSAMLProvidersCommand,
  list_server_certificate_tags: Sdk.ListServerCertificateTagsCommand,
  list_server_certificates: Sdk.ListServerCertificatesCommand,
  list_service_specific_credentials: Sdk.ListServiceSpecificCredentialsCommand,
  list_signing_certificates: Sdk.ListSigningCertificatesCommand,
  list_ssh_public_keys: Sdk.ListSSHPublicKeysCommand,
  list_user_policies: Sdk.ListUserPoliciesCommand,
  list_user_tags: Sdk.ListUserTagsCommand,
  list_users: Sdk.ListUsersCommand,
  list_virtual_mfa_devices: Sdk.ListVirtualMFADevicesCommand,
  put_group_policy: Sdk.PutGroupPolicyCommand,
  put_role_permissions_boundary: Sdk.PutRolePermissionsBoundaryCommand,
  put_role_policy: Sdk.PutRolePolicyCommand,
  put_user_permissions_boundary: Sdk.PutUserPermissionsBoundaryCommand,
  put_user_policy: Sdk.PutUserPolicyCommand,
  reject_delegation_request: Sdk.RejectDelegationRequestCommand,
  remove_client_id_from_open_id_connect_provider: Sdk.RemoveClientIDFromOpenIDConnectProviderCommand,
  remove_role_from_instance_profile: Sdk.RemoveRoleFromInstanceProfileCommand,
  remove_user_from_group: Sdk.RemoveUserFromGroupCommand,
  reset_service_specific_credential: Sdk.ResetServiceSpecificCredentialCommand,
  resync_mfa_device: Sdk.ResyncMFADeviceCommand,
  send_delegation_token: Sdk.SendDelegationTokenCommand,
  set_default_policy_version: Sdk.SetDefaultPolicyVersionCommand,
  set_security_token_service_preferences: Sdk.SetSecurityTokenServicePreferencesCommand,
  simulate_custom_policy: Sdk.SimulateCustomPolicyCommand,
  simulate_principal_policy: Sdk.SimulatePrincipalPolicyCommand,
  tag_instance_profile: Sdk.TagInstanceProfileCommand,
  tag_mfa_device: Sdk.TagMFADeviceCommand,
  tag_open_id_connect_provider: Sdk.TagOpenIDConnectProviderCommand,
  tag_policy: Sdk.TagPolicyCommand,
  tag_role: Sdk.TagRoleCommand,
  tag_saml_provider: Sdk.TagSAMLProviderCommand,
  tag_server_certificate: Sdk.TagServerCertificateCommand,
  tag_user: Sdk.TagUserCommand,
  untag_instance_profile: Sdk.UntagInstanceProfileCommand,
  untag_mfa_device: Sdk.UntagMFADeviceCommand,
  untag_open_id_connect_provider: Sdk.UntagOpenIDConnectProviderCommand,
  untag_policy: Sdk.UntagPolicyCommand,
  untag_role: Sdk.UntagRoleCommand,
  untag_saml_provider: Sdk.UntagSAMLProviderCommand,
  untag_server_certificate: Sdk.UntagServerCertificateCommand,
  untag_user: Sdk.UntagUserCommand,
  update_access_key: Sdk.UpdateAccessKeyCommand,
  update_account_password_policy: Sdk.UpdateAccountPasswordPolicyCommand,
  update_assume_role_policy: Sdk.UpdateAssumeRolePolicyCommand,
  update_delegation_request: Sdk.UpdateDelegationRequestCommand,
  update_group: Sdk.UpdateGroupCommand,
  update_login_profile: Sdk.UpdateLoginProfileCommand,
  update_open_id_connect_provider_thumbprint: Sdk.UpdateOpenIDConnectProviderThumbprintCommand,
  update_role: Sdk.UpdateRoleCommand,
  update_role_description: Sdk.UpdateRoleDescriptionCommand,
  update_saml_provider: Sdk.UpdateSAMLProviderCommand,
  update_server_certificate: Sdk.UpdateServerCertificateCommand,
  update_service_specific_credential: Sdk.UpdateServiceSpecificCredentialCommand,
  update_signing_certificate: Sdk.UpdateSigningCertificateCommand,
  update_ssh_public_key: Sdk.UpdateSSHPublicKeyCommand,
  update_user: Sdk.UpdateUserCommand,
  upload_server_certificate: Sdk.UploadServerCertificateCommand,
  upload_signing_certificate: Sdk.UploadSigningCertificateCommand,
  upload_ssh_public_key: Sdk.UploadSSHPublicKeyCommand,
};
