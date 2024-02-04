import {EvaluatorOptions, PreconfiguredOptions, withProject} from "./evaluator_options";

import {EvaluatorInterface} from "./evaluator";
import {loadProjectFromEvaluator} from "./project";
import {newEvaluatorManagerWithCommand} from "./evaluator_manager";

// newEvaluator returns an evaluator backed by a single EvaluatorManager.
// Its manager gets closed when the evaluator is closed.
//
// If creating multiple evaluators, prefer using EvaluatorManager.NewEvaluator instead,
// because it lessens the overhead of each successive evaluator.
export function newEvaluator(opts: EvaluatorOptions): Promise<EvaluatorInterface> {
  return newEvaluatorWithCommand([], opts)
}

// NewProjectEvaluator is an easy way to create an evaluator that is configured by the specified
// projectDir.
//
// It is similar to running the `pkl eval` or `pkl test` CLI command with a set `--project-dir`.
//
// When using project dependencies, they must first be resolved using the `pkl project resolve`
// CLI command.
export function newProjectEvaluator(projectDir: string, opts: EvaluatorOptions): Promise<EvaluatorInterface> {
  return newProjectEvaluatorWithCommand(projectDir, [], opts)
}

// NewProjectEvaluatorWithCommand is like NewProjectEvaluator, but also accepts the Pkl command to run.
//
// The first element in pklCmd is treated as the command to run.
// Any additional elements are treated as arguments to be passed to the process.
// pklCmd is treated as the base command that spawns Pkl.
// For example, the below snippet spawns the command /opt/bin/pkl.
//
//	NewProjectEvaluatorWithCommand(context.Background(), []string{"/opt/bin/pkl"}, "/path/to/my/project")
//
// If creating multiple evaluators, prefer using EvaluatorManager.NewProjectEvaluator instead,
// because it lessens the overhead of each successive evaluator.
export async function newProjectEvaluatorWithCommand(projectDir: string, pklCmd: string[], opts: EvaluatorOptions): Promise<EvaluatorInterface> {
  const manager = newEvaluatorManagerWithCommand(pklCmd)
  const projectEvaluator = await newEvaluator(PreconfiguredOptions)
  const project = await loadProjectFromEvaluator(projectEvaluator, projectDir+"/PklProject")
  return manager.newEvaluator({...withProject(project), ...opts})
}

// newEvaluatorWithCommand is like NewEvaluator, but also accepts the Pkl command to run.
//
// The first element in pklCmd is treated as the command to run.
// Any additional elements are treated as arguments to be passed to the process.
// pklCmd is treated as the base command that spawns Pkl.
// For example, the below snippet spawns the command /opt/bin/pkl.
//
//	NewEvaluatorWithCommand(context.Background(), []string{"/opt/bin/pkl"})
//
// If creating multiple evaluators, prefer using EvaluatorManager.NewEvaluator instead,
// because it lessens the overhead of each successive evaluator.
export function newEvaluatorWithCommand(pklCmd: string[], opts: EvaluatorOptions): Promise<EvaluatorInterface> {
  const manager = newEvaluatorManagerWithCommand(pklCmd)
  return manager.newEvaluator(opts)
}
