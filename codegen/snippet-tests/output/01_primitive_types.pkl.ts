// Code generated from Pkl module `01-primitiveTypes`. DO NOT EDIT.
import * as pklTypescript from "@pkl-community/pkl-typescript"

export interface N01PrimitiveTypes {
  str: string

  int: number

  int8: number

  uint: number

  float: number

  bool: boolean

  nullType: null

  anyType: any
}


// LoadFromPath loads the pkl module at the given path and evaluates it into a N01PrimitiveTypes
export const loadFromPath = async (path: string): Promise<N01PrimitiveTypes> => {
  const evaluator = await pklTypescript.newEvaluator(pklTypescript.PreconfiguredOptions);
  return load(evaluator, pklTypescript.FileSource(path));
};

export const load = (evaluator: pklTypescript.Evaluator, source: pklTypescript.ModuleSource): Promise<N01PrimitiveTypes> =>
  evaluator.evaluateModule(source) as Promise<N01PrimitiveTypes>;