import {ModuleSource} from "./module_source";
import {EvaluatorManager} from "./evaluator_manager";
import {EvaluateResponse, ListModules, ListResources, Log, ReadModule, ReadResource} from "../types/incoming";
import {
  codeEvaluate,
  codeEvaluateReadModuleResponse,
  codeEvaluateReadResponse,
  codeListModulesResponse,
  codeListResourcesResponse
} from "../types/codes";
import {ModuleReader, ResourceReader} from "./reader";
import {Evaluate} from "../types/outgoing";
import {Any} from "../types/pkl";


// EvaluatorInterface is an interface for evaluating Pkl modules.
export interface EvaluatorInterface {
  // evaluateModule evaluates the given module, and writes it to the value pointed by
  // out.
  //
  // This method is designed to work with Go modules that have been code generated from Pkl
  // sources.
  evaluateModule(source: ModuleSource): Promise<Any>

  // evaluateOutputText evaluates the `output.text` property of the given module.
  evaluateOutputText(source: ModuleSource): Promise<string>

  // evaluateOutputValue evaluates the `output.value` property of the given module,
  // and writes to the value pointed by out.
  evaluateOutputValue(source: ModuleSource): Promise<Any>

  // evaluateOutputFiles evaluates the `output.files` property of the given module.
  evaluateOutputFiles(source: ModuleSource): Promise<Record<string, string>>

  // evaluateExpression evaluates the provided expression on the given module source, and writes
  // the result into the value pointed by out.
  evaluateExpression(source: ModuleSource, expr: string): Promise<Any>

  // evaluateExpressionRaw evaluates the provided module, and returns the underlying value's raw
  // bytes.
  //
  // This is a low level API.
  evaluateExpressionRaw(source: ModuleSource, expr: string): Promise<Uint8Array>

  // close closes the evaluator and releases any underlying resources.
  close(): void

  // closed tells if this evaluator is closed.
  closed: boolean
}

export class Evaluator implements EvaluatorInterface {
  closed: boolean = false;
  pendingRequests: Map<string, { resolve: (resp: EvaluateResponse) => void, reject: (err: any) => void }>
  resourceReaders: ResourceReader[] = []
  moduleReaders: ModuleReader[] = []
  randState: bigint;

  constructor(private evaluatorId: bigint, private manager: EvaluatorManager) {
    this.pendingRequests = new Map()
    this.randState = evaluatorId
  }

  close(): void {
    this.manager.close()
  }

  async evaluateExpression<T>(source: ModuleSource, expr: string): Promise<Any> {
    const bytes = await this.evaluateExpressionRaw(source, expr)
    return this.manager.decoder.decode(bytes)
  }

  async evaluateExpressionRaw(source: ModuleSource, expr: string): Promise<Uint8Array> {
    if (this.closed) {
      throw new Error("evaluator is closed")
    }

    let evaluate: Evaluate = {
      requestId: this.randomInt63(),
      evaluatorId: this.evaluatorId,
      moduleUri: source.uri.toString(),
      code: codeEvaluate,
    }

    if (expr) evaluate.expr = expr;
    if (source.contents) evaluate.moduleText = source.contents


    const responsePromise = new Promise<EvaluateResponse>((resolve, reject) => {
      this.pendingRequests.set(evaluate.requestId.toString(), {resolve, reject})
    }).finally(() => this.pendingRequests.delete(evaluate.requestId.toString()))

    await this.manager.send(evaluate)

    const resp = await responsePromise
    if (resp.error) {
      throw new Error(resp.error)
    }

    return resp.result
  }

  evaluateModule<T>(source: ModuleSource): Promise<Any> {
    return this.evaluateExpression<T>(source, "")
  }

  async evaluateOutputFiles(source: ModuleSource): Promise<Record<string, string>> {
    return await this.evaluateExpression(source, "output.files.toMap().mapValues((_, it) -> it.text)") as Record<string, string>
  }

  async evaluateOutputText(source: ModuleSource): Promise<string> {
    return await this.evaluateExpression(source, "output.text") as string
  }

  evaluateOutputValue(source: ModuleSource): Promise<Any> {
    return this.evaluateExpression(source, "output.value")
  }

  handleEvaluateResponse(msg: EvaluateResponse) {
    const pending = this.pendingRequests.get(msg.requestId.toString())
    if (!pending) {
      console.error("warn: received a message for an unknown request id:", msg.requestId)
      return
    }
    pending.resolve(msg)
  }

  handleLog(resp: Log) {
    switch (resp.level) {
      case 0:
        console.trace(resp.message, resp.frameUri)
      case 1:
        console.warn(resp.message, resp.frameUri)
      default:
        // log level beyond 1 is impossible
        throw new Error(`unknown log level: ${resp.level}`)
    }
  }

  async handleReadResource(msg: ReadResource) {
    const response = {evaluatorId: this.evaluatorId, requestId: msg.requestId, code: codeEvaluateReadResponse}
    let url: URL;
    try {
      url = new URL(msg.uri)
    } catch (e) {
      await this.manager.send({...response, error: `internal error: failed to parse resource url: ${e}`})
      return
    }

    const reader = this.resourceReaders.find((r) => `${r.scheme}:` === url.protocol)

    if (!reader) {
      await this.manager.send({...response, error: `No resource reader found for scheme ${url.protocol}`})
      return
    }

    try {
      const contents = reader.read(url)
      await this.manager.send({...response, contents})
    } catch (e) {
      await this.manager.send({...response, error: `${e}`})
    }
  }

  async handleReadModule(msg: ReadModule) {
    const response = {evaluatorId: this.evaluatorId, requestId: msg.requestId, code: codeEvaluateReadModuleResponse}
    let url: URL;
    try {
      url = new URL(msg.uri)
    } catch (e) {
      await this.manager.send({...response, error: `internal error: failed to parse resource url: ${e}`})
      return
    }

    const reader = this.moduleReaders.find((r) => `${r.scheme}:` === url.protocol)

    if (!reader) {
      await this.manager.send({...response, error: `No module reader found for scheme ${url.protocol}`})
      return
    }

    try {
      const contents = reader.read(url)
      await this.manager.send({...response, contents})
    } catch (e) {
      await this.manager.send({...response, error: `${e}`})
    }
  }

  async handleListResources(msg: ListResources) {
    const response = {evaluatorId: this.evaluatorId, requestId: msg.requestId, code: codeListResourcesResponse}
    let url: URL;
    try {
      url = new URL(msg.uri)
    } catch (e) {
      await this.manager.send({...response, error: `internal error: failed to parse resource url: ${e}`})
      return
    }

    const reader = this.resourceReaders.find((r) => `${r.scheme}:` === url.protocol)

    if (!reader) {
      await this.manager.send({...response, error: `No resource reader found for scheme ${url.protocol}`})
      return
    }

    try {
      const pathElements = reader.listElements(url)
      await this.manager.send({...response, pathElements})
    } catch (e) {
      await this.manager.send({...response, error: `${e}`})
    }
  }

  async handleListModules(msg: ListModules) {
    const response = {evaluatorId: this.evaluatorId, requestId: msg.requestId, code: codeListModulesResponse}
    let url: URL;
    try {
      url = new URL(msg.uri)
    } catch (e) {
      await this.manager.send({...response, error: `internal error: failed to parse resource url: ${e}`})
      return
    }

    const reader = this.resourceReaders.find((r) => `${r.scheme}:` === url.protocol)

    if (!reader) {
      await this.manager.send({...response, error: `No module reader found for scheme ${url.protocol}`})
      return
    }

    try {
      const pathElements = reader.listElements(url)
      await this.manager.send({...response, pathElements})
    } catch (e) {
      await this.manager.send({...response, error: `${e}`})
    }
  }

  private static U64_MASK = ((1n << 64n) - 1n)
  private static U63_MASK = ((1n << 63n) - 1n)
  private randomInt63(): bigint {
    this.randState = (this.randState + 0x9e3779b97f4a7c15n) & Evaluator.U64_MASK;
    let next: bigint = this.randState;
    next = ((next ^ (next >> 30n)) * 0xbf58476d1ce4e5b9n) & Evaluator.U64_MASK;
    next = ((next ^ (next >> 27n)) * 0x94d049bb133111ebn) & Evaluator.U64_MASK;
    next = next ^ (next >> 31n);
    return next & Evaluator.U63_MASK
  }
}

