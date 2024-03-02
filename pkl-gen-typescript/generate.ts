import { mkdir, mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { isAbsolute, join, sep } from "path";
import { cwd } from "process";
import { Evaluator } from "src/evaluator/evaluator";
import { pathToFileURL } from "url";
import type { GeneratorSettings } from "./generated/GeneratorSettings.pkl";
import chalk from "chalk";
import { consola } from "consola";

const toAbsolutePath = (path: string) =>
  isAbsolute(path) ? path : join(cwd(), path);

export async function generateTypescript(
  evaluator: Evaluator,
  pklModulePaths: string[],
  settings: GeneratorSettings
) {
  consola.start(
    `Generating TypeScript sources for modules ${chalk.cyan(
      pklModulePaths.join(", ")
    )}`
  );

  pklModulePaths = pklModulePaths.map(toAbsolutePath);

  if (settings.generatorScriptPath) {
    settings.generatorScriptPath = settings.generatorScriptPath.includes(":")
      ? settings.generatorScriptPath
      : join(cwd(), settings.generatorScriptPath);

    consola.warn(
      `Using custom generator script: ${chalk.cyan(
        settings.generatorScriptPath
      )}`
    );
  } else {
    // TODO(Jason): If this is bundled, do we need
    //              to find the path better than this?
    settings.generatorScriptPath = join(
      __dirname,
      "../codegen/src/Generator.pkl"
    );
  }

  const tmpDir = await mkdtemp(`${tmpdir}${sep}`);

  const outputDir = settings.outputDirectory
    ? toAbsolutePath(settings.outputDirectory)
    : join(cwd(), ".out");
  await mkdir(outputDir, { recursive: true });

  for (let [index, pklInputModule] of pklModulePaths.entries()) {
    // TODO: This was taken from Swift - is it missing anything from the Go template?
    //       https://github.com/apple/pkl-go/blob/main/cmd/pkl-gen-go/pkg/template.gopkl
    const moduleToEvaluate = `
amends "${settings.generatorScriptPath}"

import "${pklInputModule}" as theModule

moduleToGenerate = theModule
    `;

    consola.level >= 4 /* consola.debug is level 4 */
      ? consola.box(`
Evaluating temp Pkl module:
---
${moduleToEvaluate}`)
      : null;

    const tmpFilePath = join(tmpDir, `pkl-gen-typescript-${index}.pkl`);

    await writeFile(tmpFilePath, moduleToEvaluate, "utf-8");
    const files = (await evaluator.evaluateOutputFiles({
      uri: pathToFileURL(tmpFilePath),
    })) as unknown as Map<string, string>;

    for (let [filename, contents] of files) {
      const path = join(outputDir, filename);

      if (!settings.dryRun) {
        await writeFile(path, contents, "utf-8");
      }
      consola.success(path);
    }
  }

  // TODO: Validate/fix formatting with Prettier, like Go does with gofmt?
  //       That, or put prettier-ignore/eslint-ignore directives at the top of the file.
}
