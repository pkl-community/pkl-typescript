// Code generated from Pkl module `test123`. DO NOT EDIT.
import * as pklTypescript from "@pkl-community/pkl-typescript"

export interface Test123 {
  x: string

  y: number

  z: Array<any>
}

// LoadFromPath loads the pkl module at the given path and evaluates it into a Test123
export const loadFromPath = async (path: string): Promise<Test123> => {
  const evaluator = await pklTypescript.newEvaluator(pklTypescript.PreconfiguredOptions);
  return load(evaluator, pklTypescript.FileSource(path));
};

export const load = (evaluator: pklTypescript.Evaluator, source: pklTypescript.ModuleSource): Promise<Test123> =>
  evaluator.evaluateModule(source) as Promise<Test123>;
