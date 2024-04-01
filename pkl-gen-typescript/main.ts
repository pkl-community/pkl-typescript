import chalk from "chalk";
import { boolean, command, flag, option, optional, restPositionals, run, string } from "cmd-ts";
import consola from "consola";
import { access } from "fs/promises";
import { join } from "path";
import { cwd } from "process";
import { pathToFileURL } from "url";

import { newEvaluator, PreconfiguredOptions } from "../src";
import { generateTypescript } from "./generate";
import type { GeneratorSettings } from "./generated";
import { load as loadGeneratorSettings } from "./generated";

export const cli = command({
  name: "pkl-gen-typescript",
  args: {
    pklModules: restPositionals({
      type: string,
      displayName: "Pkl module to evaluate",
    }),
    settingsFilePath: option({
      type: optional(string),
      long: "settings-file",
      short: "s",
      description: "Path to the generator-settings.pkl file",
    }),
    dryRun: flag({
      type: boolean,
      long: "dry-run",
      description:
        "Evaluate the Pkl modules and check that they could be generated, but do not write them anywhere",
    }),
    outputDirectory: option({
      type: optional(string),
      long: "output-directory",
      short: "o",
      description: "Directory to write generated files into",
    }),
    verbose: flag({
      type: boolean,
      long: "verbose",
      short: "v",
      description: "Enable debug logging",
    }),
  },
  handler: async ({ pklModules, settingsFilePath, outputDirectory, dryRun, verbose }) => {
    consola.level = verbose
      ? 4
      : (parseInt(process.env.CONSOLA_LEVEL ?? "") || null) ?? (process.env.DEBUG ? 4 : 3);

    if (!pklModules.length) {
      consola.error("You must provide at least one file to evaluate.");
    }

    const settingsFile: string | null =
      settingsFilePath ??
      (await (async () => {
        // Check if there is a `generator-settings.pkl` in the current directory.
        const localSettingsFile = join(cwd(), "generator-settings.pkl");
        try {
          await access(localSettingsFile);
          return localSettingsFile;
        } catch (err) {
          return null;
        }
      })());

    if (settingsFile) {
      try {
        await access(settingsFile);
        consola.info(`Using settings file at ${chalk.cyan(settingsFile)}`);
      } catch (err) {
        consola.fatal(`Unable to read settings file at ${chalk.cyan(settingsFile)}.`);
        consola.debug(err);
        process.exit(1);
      }
    }

    const evaluator = await newEvaluator(PreconfiguredOptions);
    try {
      const settings = (
        settingsFile
          ? await loadGeneratorSettings(evaluator, {
              uri: pathToFileURL(settingsFile),
            })
          : // This ordering means that the generator-settings.pkl overrides CLI args
            // TODO: reverse this precedence, merge CLI args with settings file
            {
              dryRun,
              outputDirectory,
            }
      ) as GeneratorSettings;

      await generateTypescript(evaluator, pklModules, settings);
    } finally {
      evaluator.close();
    }
  },
});

export default async function main(args: string[]) {
  return run(cli, args);
}

if (require.main === module) {
  void main(process.argv.slice(2));
}
