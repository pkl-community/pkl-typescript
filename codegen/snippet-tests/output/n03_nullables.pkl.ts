// Code generated from Pkl module `03-nullables`. DO NOT EDIT.
import * as pklTypescript from "@pkl-community/pkl-typescript"

export interface N03Nullables {
  nullableString: string|null

  nullableInt: number|null

  nullableListingOfStrings: Array<string>|null

  listingOfNullableStrings: Array<string|null>
}

// LoadFromPath loads the pkl module at the given path and evaluates it into a N03Nullables
export const loadFromPath = async (path: string): Promise<N03Nullables> => {
  const evaluator = await pklTypescript.newEvaluator(pklTypescript.PreconfiguredOptions);
  return load(evaluator, pklTypescript.FileSource(path));
};

export const load = (evaluator: pklTypescript.Evaluator, source: pklTypescript.ModuleSource): Promise<N03Nullables> =>
  evaluator.evaluateModule(source) as Promise<N03Nullables>;
