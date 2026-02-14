// Config
export { defineConfig } from "./config"
export type { EffortlessConfig } from "./config"

// Handlers
export { defineHttp } from "./handlers/define-http"
export { defineTable } from "./handlers/define-table"
export { defineApp } from "./handlers/define-app"
export { defineStaticSite } from "./handlers/define-static-site"
export { defineFifoQueue } from "./handlers/define-fifo-queue"
export { param } from "./handlers/param"
export { typed } from "./handlers/typed"

// Types
export type { HttpConfig, HttpRequest, HttpResponse, HttpMethod, ContentType, HttpHandler, HttpHandlerFn, DefineHttpOptions, ResolveDeps } from "./handlers/define-http"
export type { TableConfig, TableRecord, TableHandler, TableKey, KeyType, StreamView, DefineTableOptions, TableRecordFn, TableBatchFn, TableBatchCompleteFn, FailedRecord } from "./handlers/define-table"
export type { AppConfig, AppHandler } from "./handlers/define-app"
export type { StaticSiteConfig, StaticSiteHandler } from "./handlers/define-static-site"
export type { FifoQueueConfig, FifoQueueMessage, FifoQueueHandler, FifoQueueMessageFn, FifoQueueBatchFn, DefineFifoQueueOptions } from "./handlers/define-fifo-queue"
export type { TableClient, QueryParams } from "./runtime/table-client"
export type { ParamRef, ResolveParams } from "./handlers/param"

// Platform
export { createPlatformClient } from "./runtime/platform-client"
export type { PlatformClient } from "./runtime/platform-client"
export type { PlatformEntity, ExecutionLogEntity, ExecutionEntry, ErrorEntry, BasePlatformEntity } from "./runtime/platform-types"
