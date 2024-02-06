// EvaluatorOptions is the set of options available to control Pkl evaluation.
import {ProjectOrDependency} from "../types/outgoing";
import {ModuleReader, ResourceReader} from "./reader";
import * as path from "path";
import * as os from "os";
import {Project} from "./project";

export type EvaluatorOptions = {
  // properties is the set of properties available to the `prop:` resource reader.
  properties?: Record<string, string>

  // env is the set of environment variables available to the `env:` resource reader.
  env?: Record<string, string>

  // modulePaths is the set of directories, ZIP archives, or JAR archives to search when
  // resolving `modulepath`: resources and modules.
  //
  // This option must be non-emptyMirror if ModuleReaderModulePath or ResourceModulePath are used.
  modulePaths?: string[]

  // outputFormat controls the renderer to be used when rendering the `output.text`
  // property of a module.
  outputFormat?: "json" | "jsonnet" | "pcf" | "plist" | "properties" | "textproto" | "xml" | "yaml"

  // allowedModules is the URI patterns that determine which modules can be loaded and evaluated.
  allowedModules?: string[]

  // allowedResources is the URI patterns that determine which resources can be loaded and evaluated.
  allowedResources?: string[]

  // resourceReaders are the resource readers to be used by the evaluator.
  resourceReaders?: ResourceReader[]

  // moduleReaders are the set of custom module readers to be used by the evaluator.
  moduleReaders?: ModuleReader[]

  // cacheDir is the directory where `package:` modules are cached.
  //
  // If empty, no cacheing is performed.
  cacheDir?: string

  // rootDir is the root directory for file-based reads within a Pkl program.
  //
  // Attempting to read past the root directory is an error.
  rootDir?: string

  // ProjectDir is the project directory for the evaluator.
  //
  // Setting this determines how Pkl resolves dependency notation imports.
  // It causes Pkl to look for the resolved dependencies relative to this directory,
  // and load resolved dependencies from a PklProject.deps.json file inside this directory.
  //
  // NOTE:
  // Setting this option is not equivalent to setting the `--project-dir` flag from the CLI.
  // When the `--project-dir` flag is set, the CLI will evaluate the PklProject file,
  // and then applies any evaluator settings and dependencies set in the PklProject file
  // for the main evaluation.
  //
  // In contrast, this option only determines how Pkl considers whether files are part of a
  // project.
  // It is meant to be set by lower level logic in TS that first evaluates the PklProject,
  // which then configures EvaluatorOptions accordingly.
  //
  // To emulate the CLI's `--project-dir` flag, create an evaluator with NewProjectEvaluator,
  // or EvaluatorManager.NewProjectEvaluator.
  projectDir?: string

  // declaredProjectDependencies is set of dependencies available to modules within ProjectDir.
  //
  // When importing dependencies, a PklProject.deps.json file must exist within ProjectDir
  // that contains the project's resolved dependencies.
  declaredProjectDependencies?: ProjectDependencies
}

export type ProjectDependencies = {
  localDependencies: Record<string, ProjectLocalDependency>
  remoteDependencies: Record<string, ProjectRemoteDependency>
}

export function encodedDependencies(input: ProjectDependencies): Record<string, ProjectOrDependency> {
  const deps = [...Object.entries(input.localDependencies), ...Object.entries(input.remoteDependencies)]
  const depsMessage: [string, ProjectOrDependency][] = deps.map(([key, dep]) => [key, {
    packageUri: dep.packageUri,
    projectFileUri: "projectFileUri" in dep ? dep.projectFileUri : undefined,
    type: "projectFileUri" in dep ? "local" : "remote",
    checksums: "projectFileUri" in dep ? undefined : {checksums: dep.checksums.sha256},
    dependencies: "projectFileUri" in dep ? encodedDependencies(dep.dependencies) : undefined,
  }])

  return Object.fromEntries(depsMessage)
}

type ProjectLocalDependency = {
  packageUri: string

  projectFileUri: string

  dependencies: ProjectDependencies
}

type ProjectRemoteDependency = {
  packageUri: string,
  checksums: Checksums,
}

type Checksums = {
  sha256: string
}

export const PreconfiguredOptions: EvaluatorOptions = {
  allowedResources: ["http:", "https:", "file:", "env:", "prop:", "modulepath:", "package:", "projectpackage:"],
  allowedModules: ["pkl:", "repl:", "file:", "http:", "https:", "modulepath:", "package:", "projectpackage:"],
  env: Object.fromEntries(Object.entries(process.env).filter(([k, v]) => v !== undefined)) as Record<string, string>,
  cacheDir: path.join(os.homedir(), ".pkl/cache")
}

export function withProject(project: Project): EvaluatorOptions {
  return {...withProjectEvaluatorSettings(project), ...withProjectDependencies(project)}
}

function withProjectEvaluatorSettings(project: Project): EvaluatorOptions {
  if (project.evaluatorSettings) {
    return {
      properties: project.evaluatorSettings.externalProperties,
      env: project.evaluatorSettings.env,
      allowedModules: project.evaluatorSettings.allowedModules,
      allowedResources: project.evaluatorSettings.allowedResources,
      cacheDir: project.evaluatorSettings.noCache ? undefined : project.evaluatorSettings.moduleCacheDir,
      rootDir: project.evaluatorSettings.rootDir,
    }
  } else {
    return {}
  }
}

function withProjectDependencies(project: Project): EvaluatorOptions {
  return {
    projectDir: project.projectFileUri.replace(/\/PklProject$/, '').replace(/^file:\/\//, ''),
    declaredProjectDependencies: project.dependencies
  }
}
