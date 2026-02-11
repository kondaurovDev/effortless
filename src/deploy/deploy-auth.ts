import { Effect } from "effect";
import type { ExtractedAuthFunction } from "~/build/bundle";
import {
  type DeployInput,
  deployCoreLambda,
} from "./shared";

export type DeployAuthResult = {
  exportName: string;
  functionArn: string;
  handlerName: string;
};

type DeployAuthLambdaInput = {
  input: DeployInput;
  fn: ExtractedAuthFunction;
  layerArn?: string;
  external?: string[];
};

export const deployAuthLambda = ({ input, fn, layerArn, external }: DeployAuthLambdaInput) =>
  Effect.gen(function* () {
    const { exportName, config } = fn;
    const handlerName = config.name ?? exportName;

    const { functionArn } = yield* deployCoreLambda({
      input,
      exportName,
      handlerName,
      bundleType: "auth",
      ...(config.permissions ? { permissions: config.permissions } : {}),
      ...(config.memory ? { memory: config.memory } : {}),
      timeout: config.timeout ?? 10,
      ...(layerArn ? { layerArn } : {}),
      ...(external ? { external } : {}),
    });

    return { exportName, functionArn, handlerName } satisfies DeployAuthResult;
  });
