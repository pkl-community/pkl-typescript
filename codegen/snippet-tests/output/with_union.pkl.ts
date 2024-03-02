// Code generated from Pkl module `withUnion`. DO NOT EDIT.
import * as pklTypescript from "@pkl-community/pkl-typescript"

export interface WithUnion {
  x: string

  y: any
}


// LoadFromPath loads the pkl module at the given path and evaluates it into a WithUnion
export const loadFromPath = async (path: string): Promise<WithUnion> => {
  const evaluator = await pklTypescript.newEvaluator(pklTypescript.PreconfiguredOptions);
  return load(evaluator, pklTypescript.FileSource(path));
};

export const load = (evaluator: pklTypescript.Evaluator, source: pklTypescript.ModuleSource): Promise<WithUnion> =>
  evaluator.evaluateModule(source) as Promise<WithUnion>;
