import type { TableHandler } from "./define-table";
import type { MailerHandler } from "./define-mailer";
import type { TableClient } from "../runtime/table-client";
import type { EmailClient } from "../runtime/email-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTableHandler = TableHandler<any, any, any, any, any, any>;
export type AnyMailerHandler = MailerHandler;

/** Dep value types supported by the deps declaration */
export type AnyDepHandler = AnyTableHandler | AnyMailerHandler;

/** Maps a deps declaration to resolved runtime client types */
export type ResolveDeps<D> = {
  [K in keyof D]: D[K] extends TableHandler<infer T, any, any, any, any> ? TableClient<T>
    : D[K] extends MailerHandler ? EmailClient
    : never;
};
