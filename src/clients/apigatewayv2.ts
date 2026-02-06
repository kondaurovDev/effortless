import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Sdk from "@aws-sdk/client-apigatewayv2";
import type { AllErrors } from "./internal/utils.js";

// *****  GENERATED CODE *****

export class ApiGatewayV2Client extends Context.Tag('ApiGatewayV2Client')<ApiGatewayV2Client, Sdk.ApiGatewayV2Client>() {

  static Default = (
    config?: Sdk.ApiGatewayV2ClientConfig
  ) =>
    Layer.effect(
      ApiGatewayV2Client,
      Effect.gen(function*() {
        return new Sdk.ApiGatewayV2Client(config ?? {})
      })
    )
}

/**
 * Creates an Effect that executes an AWS ApiGatewayV2 command.
 *
 * @param actionName - The name of the ApiGatewayV2 command to execute
 * @param actionInput - The input parameters for the command
 * @returns An Effect that will execute the command and return its output
 *
 * @example
 * ```typescript
 * import { apigatewayv2 } from "@effect-ak/aws-sdk"
 *
 * const program = Effect.gen(function*() {
 *   const result = yield* apigatewayv2.make("command_name", {
 *     // command input parameters
 *   })
 *   return result
 * })
 * ```
 */
export const make =
  Effect.fn('aws_ApiGatewayV2')(function* <M extends keyof ApiGatewayV2Api>(
    actionName: M, actionInput: ApiGatewayV2Api[M][0]
  ) {
    yield* Effect.logDebug(`aws_ApiGatewayV2.${actionName}`, { input: actionInput })

    const client = yield* ApiGatewayV2Client
    const command = new ApiGatewayV2CommandFactory[actionName](actionInput) as Parameters<typeof client.send>[0]

    const result = yield* Effect.tryPromise({
      try: () => client.send(command) as Promise<ApiGatewayV2Api[M][1]>,
      catch: (error) => {
        if (error instanceof Sdk.ApiGatewayV2ServiceException) {
          return new ApiGatewayV2Error(error, actionName)
        }
        throw error
      }
    })

    yield* Effect.logDebug(`aws_ApiGatewayV2.${actionName} completed`)

    return result
  })

export class ApiGatewayV2Error<C extends keyof ApiGatewayV2Api> {
  readonly _tag = "ApiGatewayV2Error";

  constructor(
    readonly cause: Sdk.ApiGatewayV2ServiceException,
    readonly command: C
  ) { }

  $is<N extends keyof ApiGatewayV2Api[C][2]>(
    name: N
  ): this is ApiGatewayV2Error<C> {
    return this.cause.name == name;
  }

  is<N extends keyof AllErrors<ApiGatewayV2Api>>(
    name: N
  ): this is ApiGatewayV2Error<C> {
    return this.cause.name == name;
  }

}

export type ApiGatewayV2MethodInput<M extends keyof ApiGatewayV2Api> = ApiGatewayV2Api[M][0];
type ApiGatewayV2Api = {
  create_api: [
    Sdk.CreateApiCommandInput,
    Sdk.CreateApiCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_api_mapping: [
    Sdk.CreateApiMappingCommandInput,
    Sdk.CreateApiMappingCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_authorizer: [
    Sdk.CreateAuthorizerCommandInput,
    Sdk.CreateAuthorizerCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_deployment: [
    Sdk.CreateDeploymentCommandInput,
    Sdk.CreateDeploymentCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_domain_name: [
    Sdk.CreateDomainNameCommandInput,
    Sdk.CreateDomainNameCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_integration: [
    Sdk.CreateIntegrationCommandInput,
    Sdk.CreateIntegrationCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_integration_response: [
    Sdk.CreateIntegrationResponseCommandInput,
    Sdk.CreateIntegrationResponseCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_model: [
    Sdk.CreateModelCommandInput,
    Sdk.CreateModelCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_portal: [
    Sdk.CreatePortalCommandInput,
    Sdk.CreatePortalCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_portal_product: [
    Sdk.CreatePortalProductCommandInput,
    Sdk.CreatePortalProductCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_product_page: [
    Sdk.CreateProductPageCommandInput,
    Sdk.CreateProductPageCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_product_rest_endpoint_page: [
    Sdk.CreateProductRestEndpointPageCommandInput,
    Sdk.CreateProductRestEndpointPageCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_route: [
    Sdk.CreateRouteCommandInput,
    Sdk.CreateRouteCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_route_response: [
    Sdk.CreateRouteResponseCommandInput,
    Sdk.CreateRouteResponseCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_routing_rule: [
    Sdk.CreateRoutingRuleCommandInput,
    Sdk.CreateRoutingRuleCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_stage: [
    Sdk.CreateStageCommandInput,
    Sdk.CreateStageCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  create_vpc_link: [
    Sdk.CreateVpcLinkCommandInput,
    Sdk.CreateVpcLinkCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_access_log_settings: [
    Sdk.DeleteAccessLogSettingsCommandInput,
    Sdk.DeleteAccessLogSettingsCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_api: [
    Sdk.DeleteApiCommandInput,
    Sdk.DeleteApiCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_api_mapping: [
    Sdk.DeleteApiMappingCommandInput,
    Sdk.DeleteApiMappingCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_authorizer: [
    Sdk.DeleteAuthorizerCommandInput,
    Sdk.DeleteAuthorizerCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_cors_configuration: [
    Sdk.DeleteCorsConfigurationCommandInput,
    Sdk.DeleteCorsConfigurationCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_deployment: [
    Sdk.DeleteDeploymentCommandInput,
    Sdk.DeleteDeploymentCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_domain_name: [
    Sdk.DeleteDomainNameCommandInput,
    Sdk.DeleteDomainNameCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_integration: [
    Sdk.DeleteIntegrationCommandInput,
    Sdk.DeleteIntegrationCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_integration_response: [
    Sdk.DeleteIntegrationResponseCommandInput,
    Sdk.DeleteIntegrationResponseCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_model: [
    Sdk.DeleteModelCommandInput,
    Sdk.DeleteModelCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_portal: [
    Sdk.DeletePortalCommandInput,
    Sdk.DeletePortalCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_portal_product: [
    Sdk.DeletePortalProductCommandInput,
    Sdk.DeletePortalProductCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_portal_product_sharing_policy: [
    Sdk.DeletePortalProductSharingPolicyCommandInput,
    Sdk.DeletePortalProductSharingPolicyCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_product_page: [
    Sdk.DeleteProductPageCommandInput,
    Sdk.DeleteProductPageCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_product_rest_endpoint_page: [
    Sdk.DeleteProductRestEndpointPageCommandInput,
    Sdk.DeleteProductRestEndpointPageCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_route: [
    Sdk.DeleteRouteCommandInput,
    Sdk.DeleteRouteCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_route_request_parameter: [
    Sdk.DeleteRouteRequestParameterCommandInput,
    Sdk.DeleteRouteRequestParameterCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_route_response: [
    Sdk.DeleteRouteResponseCommandInput,
    Sdk.DeleteRouteResponseCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_route_settings: [
    Sdk.DeleteRouteSettingsCommandInput,
    Sdk.DeleteRouteSettingsCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_routing_rule: [
    Sdk.DeleteRoutingRuleCommandInput,
    Sdk.DeleteRoutingRuleCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_stage: [
    Sdk.DeleteStageCommandInput,
    Sdk.DeleteStageCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  delete_vpc_link: [
    Sdk.DeleteVpcLinkCommandInput,
    Sdk.DeleteVpcLinkCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  disable_portal: [
    Sdk.DisablePortalCommandInput,
    Sdk.DisablePortalCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  export_api: [
    Sdk.ExportApiCommandInput,
    Sdk.ExportApiCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_api: [
    Sdk.GetApiCommandInput,
    Sdk.GetApiCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_api_mapping: [
    Sdk.GetApiMappingCommandInput,
    Sdk.GetApiMappingCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_api_mappings: [
    Sdk.GetApiMappingsCommandInput,
    Sdk.GetApiMappingsCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_apis: [
    Sdk.GetApisCommandInput,
    Sdk.GetApisCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_authorizer: [
    Sdk.GetAuthorizerCommandInput,
    Sdk.GetAuthorizerCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_authorizers: [
    Sdk.GetAuthorizersCommandInput,
    Sdk.GetAuthorizersCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_deployment: [
    Sdk.GetDeploymentCommandInput,
    Sdk.GetDeploymentCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_deployments: [
    Sdk.GetDeploymentsCommandInput,
    Sdk.GetDeploymentsCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_domain_name: [
    Sdk.GetDomainNameCommandInput,
    Sdk.GetDomainNameCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_domain_names: [
    Sdk.GetDomainNamesCommandInput,
    Sdk.GetDomainNamesCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_integration: [
    Sdk.GetIntegrationCommandInput,
    Sdk.GetIntegrationCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_integration_response: [
    Sdk.GetIntegrationResponseCommandInput,
    Sdk.GetIntegrationResponseCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_integration_responses: [
    Sdk.GetIntegrationResponsesCommandInput,
    Sdk.GetIntegrationResponsesCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_integrations: [
    Sdk.GetIntegrationsCommandInput,
    Sdk.GetIntegrationsCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_model: [
    Sdk.GetModelCommandInput,
    Sdk.GetModelCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_model_template: [
    Sdk.GetModelTemplateCommandInput,
    Sdk.GetModelTemplateCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_models: [
    Sdk.GetModelsCommandInput,
    Sdk.GetModelsCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_portal: [
    Sdk.GetPortalCommandInput,
    Sdk.GetPortalCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_portal_product: [
    Sdk.GetPortalProductCommandInput,
    Sdk.GetPortalProductCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_portal_product_sharing_policy: [
    Sdk.GetPortalProductSharingPolicyCommandInput,
    Sdk.GetPortalProductSharingPolicyCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_product_page: [
    Sdk.GetProductPageCommandInput,
    Sdk.GetProductPageCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_product_rest_endpoint_page: [
    Sdk.GetProductRestEndpointPageCommandInput,
    Sdk.GetProductRestEndpointPageCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_route: [
    Sdk.GetRouteCommandInput,
    Sdk.GetRouteCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_route_response: [
    Sdk.GetRouteResponseCommandInput,
    Sdk.GetRouteResponseCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_route_responses: [
    Sdk.GetRouteResponsesCommandInput,
    Sdk.GetRouteResponsesCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_routes: [
    Sdk.GetRoutesCommandInput,
    Sdk.GetRoutesCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_routing_rule: [
    Sdk.GetRoutingRuleCommandInput,
    Sdk.GetRoutingRuleCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_stage: [
    Sdk.GetStageCommandInput,
    Sdk.GetStageCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_stages: [
    Sdk.GetStagesCommandInput,
    Sdk.GetStagesCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_tags: [
    Sdk.GetTagsCommandInput,
    Sdk.GetTagsCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_vpc_link: [
    Sdk.GetVpcLinkCommandInput,
    Sdk.GetVpcLinkCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  get_vpc_links: [
    Sdk.GetVpcLinksCommandInput,
    Sdk.GetVpcLinksCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  import_api: [
    Sdk.ImportApiCommandInput,
    Sdk.ImportApiCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_portal_products: [
    Sdk.ListPortalProductsCommandInput,
    Sdk.ListPortalProductsCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_portals: [
    Sdk.ListPortalsCommandInput,
    Sdk.ListPortalsCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_product_pages: [
    Sdk.ListProductPagesCommandInput,
    Sdk.ListProductPagesCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_product_rest_endpoint_pages: [
    Sdk.ListProductRestEndpointPagesCommandInput,
    Sdk.ListProductRestEndpointPagesCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  list_routing_rules: [
    Sdk.ListRoutingRulesCommandInput,
    Sdk.ListRoutingRulesCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  preview_portal: [
    Sdk.PreviewPortalCommandInput,
    Sdk.PreviewPortalCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  publish_portal: [
    Sdk.PublishPortalCommandInput,
    Sdk.PublishPortalCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  put_portal_product_sharing_policy: [
    Sdk.PutPortalProductSharingPolicyCommandInput,
    Sdk.PutPortalProductSharingPolicyCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  put_routing_rule: [
    Sdk.PutRoutingRuleCommandInput,
    Sdk.PutRoutingRuleCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  reimport_api: [
    Sdk.ReimportApiCommandInput,
    Sdk.ReimportApiCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  reset_authorizers_cache: [
    Sdk.ResetAuthorizersCacheCommandInput,
    Sdk.ResetAuthorizersCacheCommandOutput,
    {
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  tag_resource: [
    Sdk.TagResourceCommandInput,
    Sdk.TagResourceCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  untag_resource: [
    Sdk.UntagResourceCommandInput,
    Sdk.UntagResourceCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_api: [
    Sdk.UpdateApiCommandInput,
    Sdk.UpdateApiCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_api_mapping: [
    Sdk.UpdateApiMappingCommandInput,
    Sdk.UpdateApiMappingCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_authorizer: [
    Sdk.UpdateAuthorizerCommandInput,
    Sdk.UpdateAuthorizerCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_deployment: [
    Sdk.UpdateDeploymentCommandInput,
    Sdk.UpdateDeploymentCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_domain_name: [
    Sdk.UpdateDomainNameCommandInput,
    Sdk.UpdateDomainNameCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_integration: [
    Sdk.UpdateIntegrationCommandInput,
    Sdk.UpdateIntegrationCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_integration_response: [
    Sdk.UpdateIntegrationResponseCommandInput,
    Sdk.UpdateIntegrationResponseCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_model: [
    Sdk.UpdateModelCommandInput,
    Sdk.UpdateModelCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_portal: [
    Sdk.UpdatePortalCommandInput,
    Sdk.UpdatePortalCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_portal_product: [
    Sdk.UpdatePortalProductCommandInput,
    Sdk.UpdatePortalProductCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_product_page: [
    Sdk.UpdateProductPageCommandInput,
    Sdk.UpdateProductPageCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_product_rest_endpoint_page: [
    Sdk.UpdateProductRestEndpointPageCommandInput,
    Sdk.UpdateProductRestEndpointPageCommandOutput,
    {
      "AccessDeniedException": Sdk.AccessDeniedException,
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_route: [
    Sdk.UpdateRouteCommandInput,
    Sdk.UpdateRouteCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_route_response: [
    Sdk.UpdateRouteResponseCommandInput,
    Sdk.UpdateRouteResponseCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_stage: [
    Sdk.UpdateStageCommandInput,
    Sdk.UpdateStageCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "ConflictException": Sdk.ConflictException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
  update_vpc_link: [
    Sdk.UpdateVpcLinkCommandInput,
    Sdk.UpdateVpcLinkCommandOutput,
    {
      "BadRequestException": Sdk.BadRequestException,
      "NotFoundException": Sdk.NotFoundException,
      "TooManyRequestsException": Sdk.TooManyRequestsException
    }
  ]
};

const ApiGatewayV2CommandFactory: { [M in keyof ApiGatewayV2Api]: new (args: ApiGatewayV2Api[M][0]) => unknown } = {
  create_api: Sdk.CreateApiCommand,
  create_api_mapping: Sdk.CreateApiMappingCommand,
  create_authorizer: Sdk.CreateAuthorizerCommand,
  create_deployment: Sdk.CreateDeploymentCommand,
  create_domain_name: Sdk.CreateDomainNameCommand,
  create_integration: Sdk.CreateIntegrationCommand,
  create_integration_response: Sdk.CreateIntegrationResponseCommand,
  create_model: Sdk.CreateModelCommand,
  create_portal: Sdk.CreatePortalCommand,
  create_portal_product: Sdk.CreatePortalProductCommand,
  create_product_page: Sdk.CreateProductPageCommand,
  create_product_rest_endpoint_page: Sdk.CreateProductRestEndpointPageCommand,
  create_route: Sdk.CreateRouteCommand,
  create_route_response: Sdk.CreateRouteResponseCommand,
  create_routing_rule: Sdk.CreateRoutingRuleCommand,
  create_stage: Sdk.CreateStageCommand,
  create_vpc_link: Sdk.CreateVpcLinkCommand,
  delete_access_log_settings: Sdk.DeleteAccessLogSettingsCommand,
  delete_api: Sdk.DeleteApiCommand,
  delete_api_mapping: Sdk.DeleteApiMappingCommand,
  delete_authorizer: Sdk.DeleteAuthorizerCommand,
  delete_cors_configuration: Sdk.DeleteCorsConfigurationCommand,
  delete_deployment: Sdk.DeleteDeploymentCommand,
  delete_domain_name: Sdk.DeleteDomainNameCommand,
  delete_integration: Sdk.DeleteIntegrationCommand,
  delete_integration_response: Sdk.DeleteIntegrationResponseCommand,
  delete_model: Sdk.DeleteModelCommand,
  delete_portal: Sdk.DeletePortalCommand,
  delete_portal_product: Sdk.DeletePortalProductCommand,
  delete_portal_product_sharing_policy: Sdk.DeletePortalProductSharingPolicyCommand,
  delete_product_page: Sdk.DeleteProductPageCommand,
  delete_product_rest_endpoint_page: Sdk.DeleteProductRestEndpointPageCommand,
  delete_route: Sdk.DeleteRouteCommand,
  delete_route_request_parameter: Sdk.DeleteRouteRequestParameterCommand,
  delete_route_response: Sdk.DeleteRouteResponseCommand,
  delete_route_settings: Sdk.DeleteRouteSettingsCommand,
  delete_routing_rule: Sdk.DeleteRoutingRuleCommand,
  delete_stage: Sdk.DeleteStageCommand,
  delete_vpc_link: Sdk.DeleteVpcLinkCommand,
  disable_portal: Sdk.DisablePortalCommand,
  export_api: Sdk.ExportApiCommand,
  get_api: Sdk.GetApiCommand,
  get_api_mapping: Sdk.GetApiMappingCommand,
  get_api_mappings: Sdk.GetApiMappingsCommand,
  get_apis: Sdk.GetApisCommand,
  get_authorizer: Sdk.GetAuthorizerCommand,
  get_authorizers: Sdk.GetAuthorizersCommand,
  get_deployment: Sdk.GetDeploymentCommand,
  get_deployments: Sdk.GetDeploymentsCommand,
  get_domain_name: Sdk.GetDomainNameCommand,
  get_domain_names: Sdk.GetDomainNamesCommand,
  get_integration: Sdk.GetIntegrationCommand,
  get_integration_response: Sdk.GetIntegrationResponseCommand,
  get_integration_responses: Sdk.GetIntegrationResponsesCommand,
  get_integrations: Sdk.GetIntegrationsCommand,
  get_model: Sdk.GetModelCommand,
  get_model_template: Sdk.GetModelTemplateCommand,
  get_models: Sdk.GetModelsCommand,
  get_portal: Sdk.GetPortalCommand,
  get_portal_product: Sdk.GetPortalProductCommand,
  get_portal_product_sharing_policy: Sdk.GetPortalProductSharingPolicyCommand,
  get_product_page: Sdk.GetProductPageCommand,
  get_product_rest_endpoint_page: Sdk.GetProductRestEndpointPageCommand,
  get_route: Sdk.GetRouteCommand,
  get_route_response: Sdk.GetRouteResponseCommand,
  get_route_responses: Sdk.GetRouteResponsesCommand,
  get_routes: Sdk.GetRoutesCommand,
  get_routing_rule: Sdk.GetRoutingRuleCommand,
  get_stage: Sdk.GetStageCommand,
  get_stages: Sdk.GetStagesCommand,
  get_tags: Sdk.GetTagsCommand,
  get_vpc_link: Sdk.GetVpcLinkCommand,
  get_vpc_links: Sdk.GetVpcLinksCommand,
  import_api: Sdk.ImportApiCommand,
  list_portal_products: Sdk.ListPortalProductsCommand,
  list_portals: Sdk.ListPortalsCommand,
  list_product_pages: Sdk.ListProductPagesCommand,
  list_product_rest_endpoint_pages: Sdk.ListProductRestEndpointPagesCommand,
  list_routing_rules: Sdk.ListRoutingRulesCommand,
  preview_portal: Sdk.PreviewPortalCommand,
  publish_portal: Sdk.PublishPortalCommand,
  put_portal_product_sharing_policy: Sdk.PutPortalProductSharingPolicyCommand,
  put_routing_rule: Sdk.PutRoutingRuleCommand,
  reimport_api: Sdk.ReimportApiCommand,
  reset_authorizers_cache: Sdk.ResetAuthorizersCacheCommand,
  tag_resource: Sdk.TagResourceCommand,
  untag_resource: Sdk.UntagResourceCommand,
  update_api: Sdk.UpdateApiCommand,
  update_api_mapping: Sdk.UpdateApiMappingCommand,
  update_authorizer: Sdk.UpdateAuthorizerCommand,
  update_deployment: Sdk.UpdateDeploymentCommand,
  update_domain_name: Sdk.UpdateDomainNameCommand,
  update_integration: Sdk.UpdateIntegrationCommand,
  update_integration_response: Sdk.UpdateIntegrationResponseCommand,
  update_model: Sdk.UpdateModelCommand,
  update_portal: Sdk.UpdatePortalCommand,
  update_portal_product: Sdk.UpdatePortalProductCommand,
  update_product_page: Sdk.UpdateProductPageCommand,
  update_product_rest_endpoint_page: Sdk.UpdateProductRestEndpointPageCommand,
  update_route: Sdk.UpdateRouteCommand,
  update_route_response: Sdk.UpdateRouteResponseCommand,
  update_stage: Sdk.UpdateStageCommand,
  update_vpc_link: Sdk.UpdateVpcLinkCommand,
};
