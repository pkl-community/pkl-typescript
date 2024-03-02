// Code generated from Pkl module `pkl.typescript.GeneratorSettings`. DO NOT EDIT.
import * as pklTypescript from "@pkl-community/pkl-typescript"

export interface GeneratorSettings {
  // The output path to write generated files into.
  //
  // Defaults to `.out`. Relative paths are resolved against the enclosing directory.
  outputDirectory: string|null

  // If true, evaluates the Pkl modules to check that they could be generated,
  // and prints the filenames that would be created, but skips writing any files.
  dryRun: boolean|null

  // The Generator.pkl script to use for code generation.
  //
  // This is an internal setting that's meant for development purposes.
  generatorScriptPath: string|null
}

// LoadFromPath loads the pkl module at the given path and evaluates it into a GeneratorSettings
export const loadFromPath = async (path: string): Promise<GeneratorSettings> => {
  const evaluator = await pklTypescript.newEvaluator(pklTypescript.PreconfiguredOptions);
  return load(evaluator, pklTypescript.FileSource(path));
};

export const load = (evaluator: pklTypescript.Evaluator, source: pklTypescript.ModuleSource): Promise<GeneratorSettings> =>
  evaluator.evaluateModule(source) as Promise<GeneratorSettings>;
