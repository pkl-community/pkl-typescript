// This file was generated by `pkl-typescript` from Pkl module `ConfigSchema`.
// DO NOT EDIT.
import * as pklTypescript from "@pkl-community/pkl-typescript"

// Ref: Module root.
export interface ConfigSchema {
  address: string

  port: number
}

// LoadFromPath loads the pkl module at the given path and evaluates it into a ConfigSchema
export const loadFromPath = async (path: string): Promise<ConfigSchema> => {
  const evaluator = await pklTypescript.newEvaluator(pklTypescript.PreconfiguredOptions);
  try {
    const result = await load(evaluator, pklTypescript.FileSource(path));
    return result
  } finally {
    evaluator.close()
  }
};

export const load = (evaluator: pklTypescript.Evaluator, source: pklTypescript.ModuleSource): Promise<ConfigSchema> =>
  evaluator.evaluateModule(source) as Promise<ConfigSchema>;