export { handlerRegistry, generateEntryPoint, extractHandlerConfigs } from "./handler-registry.js";
export type { HandlerType, HandlerDefinition, ExtractedConfig } from "./handler-registry.js";

export {
  bundle,
  zip,
  extractConfig,
  extractConfigs,
  extractTableConfigs,
  findHandlerFiles,
  discoverHandlers
} from "./bundle.js";
export type {
  BundleInput,
  ZipInput,
  ExtractedFunction,
  ExtractedTableFunction,
  DiscoveredHandlers
} from "./bundle.js";
