/* This file was generated by `pkl-typescript` from Pkl module `08-withUnion`. */
/* DO NOT EDIT! */
/* istanbul ignore file */
/* eslint-disable */
import * as pklTypescript from "@pkl-community/pkl-typescript"

// Ref: Module root.
export interface N08WithUnion {
  x: "one" | "another"

  y: string | number

  x1or2: X1 | X2

  personFact: PersonProperty

  aFruit: Apple | Orange

  anotherFruit: Fruit
}

// Ref: Pkl class `08-withUnion.X1`.
export interface X1 {
  firstName: string
}

// Ref: Pkl class `08-withUnion.X2`.
export interface X2 {
  lastName: string
}

// Ref: Pkl class `08-withUnion.Apple`.
export interface Apple {
  name: "apple"

  sweetness: number
}

// Ref: Pkl class `08-withUnion.Orange`.
export interface Orange {
  name: "orange"

  tartness: number
}

// Ref: Pkl type `08-withUnion.PersonProperty`.
type PersonProperty = PersonName | PersonAge

// Ref: Pkl type `08-withUnion.Fruit`.
type Fruit = Apple | Orange

// Ref: Pkl type `08-withUnion.PersonName`.
type PersonName = string

// Ref: Pkl type `08-withUnion.PersonAge`.
type PersonAge = number

// LoadFromPath loads the pkl module at the given path and evaluates it into a N08WithUnion
export const loadFromPath = async (path: string): Promise<N08WithUnion> => {
  const evaluator = await pklTypescript.newEvaluator(pklTypescript.PreconfiguredOptions);
  try {
    const result = await load(evaluator, pklTypescript.FileSource(path));
    return result
  } finally {
    evaluator.close()
  }
};

export const load = (evaluator: pklTypescript.Evaluator, source: pklTypescript.ModuleSource): Promise<N08WithUnion> =>
  evaluator.evaluateModule(source) as Promise<N08WithUnion>;
