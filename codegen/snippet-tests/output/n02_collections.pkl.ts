// Code generated from Pkl module `02-collections`. DO NOT EDIT.
import * as pklTypescript from "@pkl-community/pkl-typescript"

export interface N02Collections {
  listingAny: Array<any>

  listingString: Array<string>

  mappingAny: Map<any, any>

  mappingStringString: Map<string, string>

  mappingStringInt: Map<string, number>

  listAny: Array<any>

  listString: Array<string>

  mapAny: Map<any, any>

  mapStringString: Map<string, string>

  mapStringInt: Map<string, number>
}

// LoadFromPath loads the pkl module at the given path and evaluates it into a N02Collections
export const loadFromPath = async (path: string): Promise<N02Collections> => {
  const evaluator = await pklTypescript.newEvaluator(pklTypescript.PreconfiguredOptions);
  return load(evaluator, pklTypescript.FileSource(path));
};

export const load = (evaluator: pklTypescript.Evaluator, source: pklTypescript.ModuleSource): Promise<N02Collections> =>
  evaluator.evaluateModule(source) as Promise<N02Collections>;
