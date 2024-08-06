export { PreconfiguredOptions, EvaluatorOptions } from "./evaluator/evaluator_options";
export { FileSource, TextSource, UriSource, ModuleSource } from "./evaluator/module_source";

export {
  newEvaluator,
  newEvaluatorWithCommand,
  newProjectEvaluator,
  newProjectEvaluatorWithCommand,
} from "./evaluator/evaluator_exec";
export { newEvaluatorManager, newEvaluatorManagerWithCommand } from "./evaluator/evaluator_manager";
export type { Evaluator } from "./evaluator/evaluator";
export * from "./types/pkl";

import type { Evaluator } from "./evaluator/evaluator";
import { newEvaluator } from "./evaluator/evaluator_exec";
import { PreconfiguredOptions } from "./evaluator/evaluator_options";
import type { ModuleSource } from "./evaluator/module_source";
import { FileSource } from "./evaluator/module_source";

// LoadFromPath loads the pkl module at the given path and evaluates it into a N01PrimitiveTypes
export const loadFromPath = async <T>(path: string): Promise<T> => {
  const evaluator = await newEvaluator(PreconfiguredOptions);
  try {
    const result = await load<T>(evaluator, FileSource(path));
    return result;
  } finally {
    evaluator.close();
  }
};

export const load = <T>(evaluator: Evaluator, source: ModuleSource): Promise<T> =>
  evaluator.evaluateModule(source) as Promise<T>;
