export const
  codeNewEvaluator = 0x20 as const,
  codeNewEvaluatorResponse = 0x21 as const,
  codeCloseEvaluator = 0x22 as const,
  codeEvaluate = 0x23 as const,
  codeEvaluateResponse = 0x24 as const,
  codeEvaluateLog = 0x25 as const,
  codeEvaluateRead = 0x26 as const,
  codeEvaluateReadResponse = 0x27 as const,
  codeEvaluateReadModule = 0x28 as const,
  codeEvaluateReadModuleResponse = 0x29 as const,
  codeListResourcesRequest = 0x2a as const,
  codeListResourcesResponse = 0x2b as const,
  codeListModulesRequest = 0x2c as const,
  codeListModulesResponse = 0x2d as const;

export type OutgoingCode =
  typeof codeNewEvaluator
  | typeof codeCloseEvaluator
  | typeof codeEvaluate
  | typeof codeEvaluateReadResponse
  | typeof codeEvaluateReadModuleResponse
  | typeof codeListResourcesResponse
  | typeof codeListModulesResponse;
