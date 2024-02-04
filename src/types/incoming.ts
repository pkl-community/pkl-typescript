import {
  codeEvaluateLog,
  codeEvaluateRead,
  codeEvaluateReadModule,
  codeEvaluateResponse,
  codeListModulesRequest,
  codeListResourcesRequest,
  codeNewEvaluatorResponse
} from "./codes";

export type IncomingMessage =
  CreateEvaluatorResponse
  | EvaluateResponse
  | ReadResource
  | ReadModule
  | Log
  | ListResources
  | ListModules

export type CreateEvaluatorResponse = {
  requestId: bigint
  evaluatorId: bigint
  error: string
  code: typeof codeNewEvaluatorResponse,
}

export type EvaluateResponse = {
  requestId: bigint
  evaluatorId: bigint
  result: Uint8Array
  error?: string
  code: typeof codeEvaluateResponse,
}

export type ReadResource = {
  requestId: bigint
  evaluatorId: bigint
  uri: string
  code: typeof codeEvaluateRead,
}

export type ReadModule = {
  requestId: bigint
  evaluatorId: bigint
  uri: string
  code: typeof codeEvaluateReadModule,
}

export type Log = {
  evaluatorId: bigint
  level: number
  message: string
  frameUri: string
  code: typeof codeEvaluateLog,
}

export type ListResources = {
  requestId: bigint
  evaluatorId: bigint
  uri: string
  code: typeof codeListResourcesRequest,
}

export type ListModules = {
  requestId: bigint
  evaluatorId: bigint
  uri: string
  code: typeof codeListModulesRequest,
}

export function decode(incoming: unknown): IncomingMessage {
  const [code, map] = incoming as [number, Record<string, any>]
  const value = map
  switch (code) {
    case codeEvaluateResponse:
      return {...value, code: codeEvaluateResponse} as EvaluateResponse;
    case codeEvaluateLog:
      return {...value, code: codeEvaluateLog} as Log;
    case codeNewEvaluatorResponse:
      return {...value, code: codeNewEvaluatorResponse} as CreateEvaluatorResponse;
    case codeEvaluateRead:
      return {...value, code: codeEvaluateRead} as ReadResource;
    case codeEvaluateReadModule:
      return {...value, code: codeEvaluateReadModule} as ReadModule;
    case codeListResourcesRequest:
      return {...value, code: codeListResourcesRequest} as ListResources;
    case codeListModulesRequest:
      return {...value, code: codeListModulesRequest} as ListModules;
    default:
      throw new Error(`Unknown code: ${code}`)
  }
}
