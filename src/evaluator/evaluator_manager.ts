import {EvaluatorImpl, Evaluator} from "./evaluator";
import {CreateEvaluator, OutgoingMessage, packMessage} from "../types/outgoing";
import * as msgpackr from "msgpackr";
import {
  codeEvaluateLog,
  codeEvaluateRead,
  codeEvaluateReadModule,
  codeEvaluateResponse,
  codeListModulesRequest,
  codeListResourcesRequest,
  codeNewEvaluator,
  codeNewEvaluatorResponse
} from "../types/codes";
import {encodedDependencies, EvaluatorOptions, PreconfiguredOptions, withProject} from "./evaluator_options";
import {loadProjectFromEvaluator, Project} from "./project";
import {spawn, spawnSync} from "node:child_process";
import {Readable, Writable} from "node:stream";
import {ChildProcessByStdio} from "child_process";
import {CreateEvaluatorResponse, decode, IncomingMessage} from "../types/incoming";
import {Decoder} from "./decoder";

// newEvaluatorManager creates a new EvaluatorManager.
export function newEvaluatorManager(): EvaluatorManagerInterface {
  return newEvaluatorManagerWithCommand([])
}

// newEvaluatorManagerWithCommand creates a new EvaluatorManager using the given pkl command.
//
// The first element in pklCmd is treated as the command to run.
// Any additional elements are treated as arguments to be passed to the process.
// pklCmd is treated as the base command that spawns Pkl.
// For example, the below snippet spawns the command /opt/bin/pkl.
//
//	newEvaluatorManagerWithCommand(["/opt/bin/pkl"])
export function newEvaluatorManagerWithCommand(pklCommand: string[]): EvaluatorManagerInterface {
  return new EvaluatorManager(pklCommand)
}


export interface EvaluatorManagerInterface {
  // close closes the evaluator manager and all of its evaluators.
  //
  // If running Pkl as a child process, closes all evaluators as well as the child process.
  // If calling into Pkl through the C API, close all existing evaluators.
  close(): void

  getVersion(): string

  // newEvaluator constructs an evaluator instance.
  //
  // If calling into Pkl as a child process, the first time NewEvaluator is called, this will
  // start the child process.
  newEvaluator(opts: EvaluatorOptions): Promise<Evaluator>

  // newProjectEvaluator is an easy way to create an evaluator that is configured by the specified
  // projectDir.
  //
  // It is similar to running the `pkl eval` or `pkl test` CLI command with a set `--project-dir`.
  //
  // When using project dependencies, they must first be resolved using the `pkl project resolve`
  // CLI command.
  newProjectEvaluator(projectDir: string, opts: EvaluatorOptions): Promise<Evaluator>
}


export class EvaluatorManager implements EvaluatorManagerInterface {
  private static semverPattern = /(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/
  private static pklVersionRegex = new RegExp(`Pkl (${this.semverPattern.toString()}).*`)

  private pendingEvaluators: Map<string, {
    resolve: (resp: CreateEvaluatorResponse) => void,
    reject: (err: any) => void
  }> = new Map()
  private evaluators: Map<bigint, EvaluatorImpl> = new Map()
  private closed: boolean = false
  private version?: string
  private cmd: ChildProcessByStdio<Writable, Readable, null>;
  private readonly msgpackConfig: msgpackr.Options = {int64AsType: 'bigint', useRecords: false, encodeUndefinedAsNil: true}
  private readonly encoder: msgpackr.Encoder = new msgpackr.Encoder(this.msgpackConfig);
  readonly decoder: Decoder = new Decoder(this.msgpackConfig);
  private streamDecoder: msgpackr.UnpackrStream = new msgpackr.UnpackrStream(this.msgpackConfig)

  constructor(private readonly pklCommand: string[]) {
    const [cmd, args] = this.getStartCommand();
    this.cmd = spawn(cmd, args, {
      env: process.env,
      stdio: ['pipe', 'pipe', 'inherit']
    })

    this.decode(this.cmd.stdout).catch(console.error)
    this.cmd.on('close', () => {
      this.pendingEvaluators.forEach(({reject}) => {
        reject(new Error("pkl command exited"))
      })
      let errors: any[] = [];
      this.evaluators.forEach((ev) => {
        try {
          ev.close()
        } catch (e) {
          errors.push(e)
        }
      })
      this.closed = true
      if (errors.length > 0) {
        console.error("errors closing evaluators:", errors)
      }
    })
  }

  private getCommandAndArgStrings(): [string, string[]] {
    if (this.pklCommand.length > 0) {
      return [this.pklCommand[0], this.pklCommand.slice(1)]
    }
    const pklExecEnv = process.env["PKL_EXEC"] ?? ""
    if (pklExecEnv != "") {
      const parts = pklExecEnv.split(" ")
      return [parts[0], parts.slice(1)]
    }
    return ["pkl", []]
  }

  async send(out: OutgoingMessage) {
    await new Promise<void>((resolve, reject) => this.cmd.stdin.write(packMessage(this.encoder, out), (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    }))
  }

  private getEvaluator(evaluatorId: bigint): EvaluatorImpl | undefined {
    const ev = this.evaluators.get(evaluatorId)
    if (!ev) {
      console.log("Received unknown evaluator id:", evaluatorId)
      return undefined
    }
    return ev
  }

  private async decode(stdout: Readable) {
    stdout.pipe(this.streamDecoder)
    for await (const item of this.streamDecoder) {
      const decoded = decode(item);
      let ev: EvaluatorImpl | undefined;
      switch (decoded.code) {
        case codeEvaluateResponse:
          ev = this.getEvaluator(decoded.evaluatorId)
          if (!ev) {
            continue
          }
          ev.handleEvaluateResponse(decoded)
          continue
        case codeEvaluateLog:
          ev = this.getEvaluator(decoded.evaluatorId)
          if (!ev) {
            continue
          }
          ev.handleLog(decoded)
          continue
        case codeEvaluateRead:
          ev = this.getEvaluator(decoded.evaluatorId)
          if (!ev) {
            continue
          }
          await ev.handleReadResource(decoded)
          continue
        case codeEvaluateReadModule:
          ev = this.getEvaluator(decoded.evaluatorId)
          if (!ev) {
            continue
          }
          await ev.handleReadModule(decoded)
          continue
        case codeListResourcesRequest:
          ev = this.getEvaluator(decoded.evaluatorId)
          if (!ev) {
            continue
          }
          await ev.handleListResources(decoded)
          continue
        case codeListModulesRequest:
          ev = this.getEvaluator(decoded.evaluatorId)
          if (!ev) {
            continue
          }
          await ev.handleListModules(decoded)
          continue
        case codeNewEvaluatorResponse:
          const pending = this.pendingEvaluators.get(decoded.requestId.toString())
          if (!pending) {
            console.error("warn: received a message for an unknown request id:", decoded.requestId)
            return
          }
          pending.resolve(decoded)
      }
    }
  }

  private getStartCommand(): [string, string[]] {
    const [cmd, args] = this.getCommandAndArgStrings()
    return [cmd, [...args, "server"]]
  }


  close(): void {
    this.cmd.kill()
  }

  getVersion(): string {
    if (this.version) {
      return this.version
    }
    const [cmd, args] = this.getCommandAndArgStrings()
    const result = spawnSync(cmd, [...args, "--version"])
    const version = result.stdout.toString().match(EvaluatorManager.pklVersionRegex)

    if (!version?.length || version.length < 2) {
      throw new Error(`failed to get version information from Pkl. Ran '${args.join(" ")}', and got stdout "${result.stdout.toString()}"`)
    }
    this.version = version[1]
    return this.version
  }

  async newEvaluator(opts: EvaluatorOptions): Promise<Evaluator> {
    if (this.closed) {
      throw new Error("EvaluatorManager has been closed")
    }

    const createEvaluator: CreateEvaluator = {
      requestId: BigInt(0), // TODO
      clientResourceReaders: opts.resourceReaders ?? [],
      clientModuleReaders: opts.moduleReaders ?? [],
      code: codeNewEvaluator,
      ...opts,
    }

    if (opts.projectDir) createEvaluator.project = {
      projectFileUri: `file://${opts.projectDir}/PklProject`,
      dependencies: opts.declaredProjectDependencies ? encodedDependencies(opts.declaredProjectDependencies) : undefined
    }

    const responsePromise = new Promise<CreateEvaluatorResponse>((resolve, reject) => {
      this.pendingEvaluators.set(createEvaluator.requestId.toString(), {resolve, reject})
    }).finally(() => this.pendingEvaluators.delete(createEvaluator.requestId.toString()))

    await this.send(createEvaluator)

    const response = await responsePromise;
    if (response.error && response.error !== "") {
      throw new Error(response.error)
    }
    const ev = new EvaluatorImpl(response.evaluatorId, this);
    this.evaluators.set(response.evaluatorId, ev)

    return ev
  }

  async newProjectEvaluator(projectDir: string, opts: EvaluatorOptions): Promise<Evaluator> {
    const projectEvaluator = await this.newEvaluator(PreconfiguredOptions)
    const project = await loadProjectFromEvaluator(projectEvaluator, projectDir + "/PklProject")

    return this.newEvaluator({...withProject(project), ...opts})
  }
}

