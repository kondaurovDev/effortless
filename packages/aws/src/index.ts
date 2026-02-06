// AWS abstractions
export * from "./aws/index.js";

// AWS SDK clients (Effect.js wrappers)
export { makeClients, AllClientsDefault } from "./clients/index.js";
export * as clients from "./clients/index.js";
