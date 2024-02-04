import * as msgpackr from "msgpackr";
import {
  codeCloseEvaluator,
  codeEvaluate,
  codeEvaluateReadModuleResponse,
  codeEvaluateReadResponse,
  codeListModulesResponse,
  codeListResourcesResponse,
  codeNewEvaluator
} from "./codes";

export type OutgoingMessage =
  CreateEvaluator
  | CloseEvaluator
  | Evaluate
  | ReadResourceResponse
  | ReadModuleResponse
  | ListResourcesResponse
  | ListModulesResponse

export type ResourceReader = {
  scheme: string,
  hasHierarchicalUris: boolean,
  isGlobbable: boolean,
}

export type ModuleReader = {
  scheme: string,
  hasHierarchicalUris: boolean,
  isGlobbable: boolean,
  isLocal: boolean,
}

export type CreateEvaluator = {
  requestId: bigint,
  clientResourceReaders?: ResourceReader[],
  clientModuleReaders?: ModuleReader[],
  modulePaths?: string[],
  env?: Record<string, string>,
  properties?: Record<string, string>,
  outputFormat?: string,
  allowedModules?: string[],
  allowedResources?: string[],
  rootDir?: string,
  cacheDir?: string,
  project?: ProjectOrDependency,
  code: typeof codeNewEvaluator,
}

export type ProjectOrDependency = {
  packageUri?: string,
  type?: string,
  projectFileUri?: string
  checksums?: Checksums
  dependencies?: Record<string, ProjectOrDependency>
}

export type Checksums = {
  checksums: string
}

export type CloseEvaluator = {
  evaluatorId: bigint,
  code: typeof codeCloseEvaluator,
}

export type Evaluate = {
  requestId: bigint
  evaluatorId: bigint
  moduleUri: string
  moduleText?: string
  expr?: string
  code: typeof codeEvaluate,
}

export type ReadResourceResponse = {
  requestId: bigint,
  evaluatorId: bigint,
  code: typeof codeEvaluateReadResponse,
} & ({ contents: Uint8Array } | { error: string })

export type ReadModuleResponse = {
  requestId: bigint,
  evaluatorId: bigint,
  code: typeof codeEvaluateReadModuleResponse,
} & ({ contents: string } | { error: string })

export type ListResourcesResponse = {
  requestId: bigint,
  evaluatorId: bigint,
  code: typeof codeListResourcesResponse,
} & ({ pathElements: PathElement[] } | { error: string })

export type ListModulesResponse = {
  requestId: bigint,
  evaluatorId: bigint,
  code: typeof codeListModulesResponse,
} & ({ pathElements: PathElement[] } | { error: string })

export type PathElement = {
  name: string,
  isDirectory: boolean,
}

export function packMessage(encoder: msgpackr.Encoder, msg: OutgoingMessage): Buffer {
  const {code, ...rest} = msg;
  const enc = encoder.encode([code, rest])
  return enc
}
