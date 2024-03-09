// This file was generated by `pkl-typescript` from Pkl module `01-primitiveTypes`.
// DO NOT EDIT.
import * as pklTypescript from "@pkl-community/pkl-typescript"

// Ref: Module root.
export interface N01PrimitiveTypes {
  str: string

  int: number

  int8: number

  uint: number

  float: number

  bool: boolean

  nullType: null

  anyType: any

  nothingType: never
}

// LoadFromPath loads the pkl module at the given path and evaluates it into a N01PrimitiveTypes
export const loadFromPath = async (path: string): Promise<N01PrimitiveTypes> => {
  const evaluator = await pklTypescript.newEvaluator(pklTypescript.PreconfiguredOptions);
  try {
    const result = await load(evaluator, pklTypescript.FileSource(path));
    return result
  } finally {
    evaluator.close()
  }
};

export const load = (evaluator: pklTypescript.Evaluator, source: pklTypescript.ModuleSource): Promise<N01PrimitiveTypes> =>
  evaluator.evaluateModule(source) as Promise<N01PrimitiveTypes>;
