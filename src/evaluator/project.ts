import {PreconfiguredOptions, ProjectDependencies} from "./evaluator_options";
import {Evaluator} from "./evaluator";
import {FileSource} from "./module_source";
import {newEvaluator} from "./evaluator_exec";

// Project is the TS representation of pkl.Project.
export type Project = {
  projectFileUri: string
  package?: ProjectPackage
  evaluatorSettings?: ProjectEvaluatorSettings
  tests: string[]

  dependencies: ProjectDependencies
}

// ProjectPackage is the TS representation of pkl.Project#Package.
type ProjectPackage = {
  name: string
  baseUri: string
  version: string
  packageZipUrl: string
  description: string
  authors: string[]
  website: string
  documentation: string
  sourceCode: string
  sourceCodeUrlScheme: string
  license: string
  licenseText: string
  issueTracker: string
  apiTests: string[]
  exclude: string[]
  uri: string[]
}

// ProjectEvaluatorSettings is the representation of pkl.Project#EvaluatorSettings
export type ProjectEvaluatorSettings = {
  externalProperties: Record<string, string>
  env: Record<string, string>
  allowedModules: string[]
  allowedResources: string[]
  noCache?: boolean
  modulePath: string[]
  moduleCacheDir: string
  rootDir: string
}

// loadProject loads a project definition from the specified path directory.
export async function loadProject(path: string): Promise<Project> {
  const ev = await newEvaluator(PreconfiguredOptions)
  return loadProjectFromEvaluator(ev, path)
}

export async function loadProjectFromEvaluator(ev: Evaluator, path: string): Promise<Project> {
  return await ev.evaluateOutputValue(FileSource(path)) as Project
}
