/* This file was generated by `pkl-typescript` from Pkl module `n10.pkl.typescript.tests.namedModule`. */
/* DO NOT EDIT! */
/* istanbul ignore file */
/* eslint-disable */
import * as pklTypescript from "@pkl-community/pkl-typescript"

// Ref: Module root.
export interface NamedModule {
  x: string
}

// LoadFromPath loads the pkl module at the given path and evaluates it into a NamedModule
export const loadFromPath = async (path: string): Promise<NamedModule> => {
  const evaluator = await pklTypescript.newEvaluator(pklTypescript.PreconfiguredOptions);
  try {
    const result = await load(evaluator, pklTypescript.FileSource(path));
    return result
  } finally {
    evaluator.close()
  }
};

export const load = (evaluator: pklTypescript.Evaluator, source: pklTypescript.ModuleSource): Promise<NamedModule> =>
  evaluator.evaluateModule(source) as Promise<NamedModule>;
