import { generateTypescript } from "./generate";
import { GeneratorSettings, load as loadGeneratorSettings } from "./generated";
import { join } from "path";
import { cwd } from "process";
import { PreconfiguredOptions, newEvaluator } from "../src";
import { pathToFileURL } from "url";
import {
  command,
  run,
  string,
  boolean,
  restPositionals,
  option,
  optional,
  flag,
} from "cmd-ts";
import consola, { LogLevels } from "consola";
import chalk from "chalk";
import { access } from "fs/promises";

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
  handler: async ({
    pklModules,
    settingsFilePath,
    outputDirectory,
    dryRun,
    verbose,
  }) => {
    /*
      Four ways to set the log level, in order of precedence:
      - CLI flag "-v", sets log level to "debug"
      - environment variable CONSOLA_LEVEL set to an integer
      - environment variable LOG_LEVEL set to a string that is a valid log level name
      - environment variable DEBUG, sets log level to "debug"
      - defaults to "info"
    */
    const x = Object.entries(process.env);
    const logLevel = verbose
      ? LogLevels.debug
      : (parseInt(process.env.CONSOLA_LEVEL ?? "") || null) ??
        (process.env.LOG_LEVEL !== undefined &&
          Object.keys(LogLevels).includes(process.env.LOG_LEVEL.toLowerCase()))
      ? LogLevels[
          process.env.LOG_LEVEL?.toLowerCase() as keyof typeof LogLevels
        ]
      : process.env.DEBUG
      ? LogLevels.debug
      : LogLevels.info;
    consola.level = logLevel;

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
        consola.fatal(
          `Unable to read settings file at ${chalk.cyan(settingsFile)}.`
        );
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
  main(process.argv.slice(2));
}
