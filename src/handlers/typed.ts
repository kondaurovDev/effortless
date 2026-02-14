/**
 * Type-only schema helper for handlers.
 *
 * Use this instead of explicit generic parameters like `defineTable<Order>(...)`.
 * It enables TypeScript to infer all generic types from the options object,
 * avoiding the partial-inference problem where specifying one generic
 * forces all others to their defaults.
 *
 * At runtime this is a no-op identity function — it simply returns the input unchanged.
 * The type narrowing happens entirely at the TypeScript level.
 *
 * @example Resource-only table
 * ```typescript
 * type User = { id: string; email: string };
 *
 * // Before (breaks inference for context, deps, params):
 * export const users = defineTable<User>({ pk: { name: "id", type: "string" } });
 *
 * // After (all generics inferred correctly):
 * export const users = defineTable({
 *   pk: { name: "id", type: "string" },
 *   schema: typed<User>(),
 * });
 * ```
 *
 * @example Table with stream handler
 * ```typescript
 * export const orders = defineTable({
 *   pk: { name: "id", type: "string" },
 *   schema: typed<Order>(),
 *   context: async () => ({ db: createClient() }),
 *   onRecord: async ({ record, ctx }) => {
 *     // record.new is Order, ctx is { db: Client } — all inferred
 *   },
 * });
 * ```
 */
export function typed<T>(): (input: unknown) => T {
  return (input: unknown) => input as T;
}
