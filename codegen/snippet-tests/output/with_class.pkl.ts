// Code generated from Pkl module `withClass`. DO NOT EDIT.
import * as pklTypescript from "@pkl-community/pkl-typescript"

export interface WithClass {
  value: MyCustomClass
}

export interface MyCustomClass {
  x: string

  y: number
}


// LoadFromPath loads the pkl module at the given path and evaluates it into a WithClass
export const loadFromPath = async (path: string): Promise<WithClass> => {
  const evaluator = await pklTypescript.newEvaluator(pklTypescript.PreconfiguredOptions);
  return load(evaluator, pklTypescript.FileSource(path));
};

export const load = (evaluator: pklTypescript.Evaluator, source: pklTypescript.ModuleSource): Promise<WithClass> =>
  evaluator.evaluateModule(source) as Promise<WithClass>;
