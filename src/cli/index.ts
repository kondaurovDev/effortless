#!/usr/bin/env node

import { Command } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Effect } from "effect";

import { deployCommand } from "./commands/deploy";
import { statusCommand } from "./commands/status";
import { cleanupCommand } from "./commands/cleanup";
import { logsCommand } from "./commands/logs";
import { layerCommand } from "./commands/layer";
import { configCommand } from "./commands/config";

const mainCommand = Command.make("eff").pipe(
  Command.withSubcommands([deployCommand, statusCommand, logsCommand, cleanupCommand, layerCommand, configCommand]),
  Command.withDescription("Code-first AWS Lambda framework")
);

const cli = Command.run(mainCommand, {
  name: "effortless",
  version: "0.0.1",
});

cli(process.argv).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
);
