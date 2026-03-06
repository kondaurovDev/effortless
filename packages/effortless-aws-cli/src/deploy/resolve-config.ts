import { Effect } from "effect";
import { ssm } from "~/aws/clients";
import type { DiscoveredHandlers } from "~/build/bundle";
import type { SecretEntry, AuthConfig } from "~/build/handler-registry";

export type RequiredSecret = {
  ssmPath: string;
  propName: string;
  ssmKey: string;
  handlerName: string;
  generate?: import("~/build/handler-registry").GenerateSpec;
};

/**
 * Collect all required SSM parameter paths from discovered handlers.
 * Deduplicates by ssmPath (same key used by multiple handlers is listed once).
 */
export const collectRequiredSecrets = (
  handlers: DiscoveredHandlers,
  project: string,
  stage: string,
): RequiredSecret[] => {
  const seen = new Map<string, RequiredSecret>();

  const collect = (
    handlerGroups: { exports: { exportName: string; secretEntries: SecretEntry[] }[] }[],
  ) => {
    for (const { exports } of handlerGroups) {
      for (const fn of exports) {
        for (const { propName, ssmKey, generate } of fn.secretEntries) {
          const ssmPath = `/${project}/${stage}/${ssmKey}`;
          if (!seen.has(ssmPath)) {
            seen.set(ssmPath, {
              ssmPath,
              propName,
              ssmKey,
              handlerName: fn.exportName,
              ...(generate ? { generate } : {}),
            });
          }
        }
      }
    }
  };

  collect(handlers.tableHandlers);
  collect(handlers.fifoQueueHandlers);
  collect(handlers.bucketHandlers);
  collect(handlers.apiHandlers);

  return Array.from(seen.values());
};

/** SSM key used for the shared auth HMAC secret */
export const AUTH_SSM_KEY = "_auth-secret";

/**
 * Check if any discovered handler uses auth.
 * Returns the auth SSM path if auth is needed, undefined otherwise.
 */
export const collectAuthSecret = (
  handlers: DiscoveredHandlers,
  project: string,
  stage: string,
): RequiredSecret | undefined => {
  const hasAuth = (groups: { exports: { authConfig?: AuthConfig }[] }[]) =>
    groups.some(g => g.exports.some(fn => fn.authConfig));

  if (
    hasAuth(handlers.apiHandlers) ||
    hasAuth(handlers.staticSiteHandlers)
  ) {
    return {
      ssmPath: `/${project}/${stage}/${AUTH_SSM_KEY}`,
      propName: "_authSecret",
      ssmKey: AUTH_SSM_KEY,
      handlerName: "_auth",
      generate: { type: "hex", bytes: 32 },
    };
  }
  return undefined;
};

/**
 * Fetch the auth secret value from SSM. Used to inject into middleware bundle.
 */
export const fetchAuthSecretValue = (ssmPath: string) =>
  Effect.gen(function* () {
    const result = yield* ssm.make("get_parameters", {
      Names: [ssmPath],
      WithDecryption: true,
    });
    const value = result.Parameters?.[0]?.Value;
    if (!value) throw new Error(`Auth secret not found at ${ssmPath}`);
    return value;
  });

/**
 * Check which SSM parameters exist and which are missing.
 * Uses the generated SSM Effect client — requires SSMClient layer.
 */
export const checkMissingSecrets = (secrets: RequiredSecret[]) =>
  Effect.gen(function* () {
    if (secrets.length === 0) return { existing: [] as RequiredSecret[], missing: [] as RequiredSecret[] };

    const existingNames = new Set<string>();

    // SSM GetParameters supports max 10 names per call
    for (let i = 0; i < secrets.length; i += 10) {
      const batch = secrets.slice(i, i + 10);
      const result = yield* ssm.make("get_parameters", {
        Names: batch.map(p => p.ssmPath),
        WithDecryption: false,
      });
      for (const p of result.Parameters ?? []) {
        if (p.Name) existingNames.add(p.Name);
      }
    }

    const existing: RequiredSecret[] = [];
    const missing: RequiredSecret[] = [];
    for (const p of secrets) {
      if (existingNames.has(p.ssmPath)) {
        existing.push(p);
      } else {
        missing.push(p);
      }
    }

    return { existing, missing };
  });

