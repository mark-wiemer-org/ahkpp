import { basename } from 'path';
import {
	Breakpoint,
	BreakpointEvent,
	Handles,
	InitializedEvent,
	Logger,
	logger,
	LoggingDebugSession,
	OutputEvent,
	Scope,
	Source,
	StackFrame,
	StoppedEvent,
	TerminatedEvent,
	Thread,
	Variable,
} from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { AhkRuntime, AhkBreakpoint } from './AhkRuntime';

/**
 * This interface describes the mock-debug specific launch attributes
 * (which are not part of the Debug Adapter Protocol).
 * The schema for these attributes lives in the package.json of the mock-debug extension.
 * The interface should always match this schema.
 */
export interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
	/** An absolute path to the "program" to debug. */
	program: string;
	/** An absolute path to the AutoHotkey.exe. */
	runtime: string;
	dbgpSettings: {
		max_children: number;
		max_data: number;
	};
}

export class AhkDebugSession extends LoggingDebugSession {

	// we don't support multiple threads, so we can use a hardcoded ID for the default thread
	private static THREAD_ID = 1;

	// ahk debugger.
	private _runtime: AhkRuntime;

	private _variableHandles = new Handles<string>();

	/**
	 * Creates a new debug adapter that is used for one debug session.
	 * We configure the default implementation of a debug adapter here.
	 */
	public constructor() {
		super("ahk-debug.txt");

		// this debugger uses zero-based lines and columns
		this.setDebuggerLinesStartAt1(false);
		this.setDebuggerColumnsStartAt1(false);

		this._runtime = new AhkRuntime();
		this._runtime.on('break', (reason: string) => {
			this.sendEvent(new StoppedEvent(reason, AhkDebugSession.THREAD_ID));
		}).on('stopOnDataBreakpoint', () => {
			this.sendEvent(new StoppedEvent('data breakpoint', AhkDebugSession.THREAD_ID));
		}).on('output', (text) => {
			this.sendEvent(new OutputEvent(`${text}\n`));
		}).on('end', () => {
			this.sendEvent(new TerminatedEvent());
		});

	}

	/**
	 * The 'initialize' request is the first request called by the frontend
	 * to interrogate the features the debug adapter provides.
	 */
	protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {

		response.body = {
			...response.body,
			completionTriggerCharacters: [".", "["],
			supportsConfigurationDoneRequest: false,
			supportsEvaluateForHovers: true,
			supportsStepBack: false,
			supportsDataBreakpoints: false,
			supportsCompletionsRequest: true,
			supportsCancelRequest: true,
			supportsBreakpointLocationsRequest: false,
			supportsSetVariable: true,
		}

		this.sendResponse(response);
		this.sendEvent(new InitializedEvent());
	}

	protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): void {
		this._runtime.stop();
		this.sendResponse(response);
	}

	protected async launchRequest(response: DebugProtocol.LaunchResponse, args: LaunchRequestArguments) {
		this._runtime.start(args);
		this.sendResponse(response);
	}

	protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): void {

		const path = args.source.path as string;
		const clientLines = args.lines || [];

		this._runtime.clearBreakpoints(path);

		response.body = {
			breakpoints: clientLines.map((l) => {
				const { verified, line, id } = this._runtime.setBreakPoint(path, this.convertClientLineToDebugger(l));
				const bp = new Breakpoint(verified, this.convertDebuggerLineToClient(line)) as DebugProtocol.Breakpoint;
				bp.id = id;
				return bp;
			}),
		};
		this.sendResponse(response);
	}


	protected async stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): Promise<void> {

		const startFrame = typeof args.startFrame === 'number' ? args.startFrame : 0;
		const maxLevels = typeof args.levels === 'number' ? args.levels : 1000;
		const endFrame = startFrame + maxLevels;

		const stk = await this._runtime.stack(startFrame, endFrame);

		response.body = {
			stackFrames: stk.frames.map((f) => new StackFrame(f.index, f.name, this.createSource(f.file), this.convertDebuggerLineToClient(f.line))),
			totalFrames: stk.count,
		};
		this.sendResponse(response);
	}

	private frameId: number = 0;
	protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {

		response.body = {
			scopes: [
				new Scope("Local", this._variableHandles.create("Local"), false),
				new Scope("Global", this._variableHandles.create("Global"), false),
			],
		};
		this.frameId = args.frameId;
		this.sendResponse(response);
	}

	protected async variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments, request?: DebugProtocol.Request) {

		const scopeId = this._variableHandles.get(args.variablesReference) === 'Local' ? 0 : 1;
		response.body = {
			variables: await this._runtime.variables(scopeId, this.frameId, args),
		};

		this.sendResponse(response);
	}

	protected async setVariableRequest(response: DebugProtocol.SetVariableResponse, args: DebugProtocol.SetVariableArguments, request?: DebugProtocol.Request): Promise<void> {

		const scopeId: number = this._variableHandles.get(args.variablesReference) === 'Local' ? 0 : 1;
		const body = await this._runtime.setVariable(scopeId, this.frameId, args);

		const isDebugProtocolMessage: boolean = 'id' in body && 'format' in body;
		if (isDebugProtocolMessage === true) {
			this.sendErrorResponse(response, body);
			return;
		}

		response.body = body;
		this.sendResponse(response);
	}


	protected pauseRequest(response: DebugProtocol.PauseResponse, args: DebugProtocol.PauseArguments, request?: DebugProtocol.Request): void {
		this._runtime.pause()
		this.sendResponse(response);
	}


	protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): void {
		this._runtime.continue();
		this.sendResponse(response);
	}

	protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void {
		this._runtime.step();
		this.sendResponse(response);
	}

	protected stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments, request?: DebugProtocol.Request): void {
		this._runtime.stepIn();
		this.sendResponse(response);
	}

	protected stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments, request?: DebugProtocol.Request): void {
		this._runtime.stepOut();
		this.sendResponse(response);
	}

	protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {

		// not implment
		response.body = {
			threads: [
				new Thread(AhkDebugSession.THREAD_ID, "main thread"),
			],
		};
		this.sendResponse(response);
	}

	protected completionsRequest(response: DebugProtocol.CompletionsResponse, args: DebugProtocol.CompletionsArguments): void {
		// not implment
		// trigger on eval input
		response.body = {
			targets: [
				{
					label: "item 10",
					sortText: "10",
				},
			],
		};
		this.sendResponse(response);
	}

	protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments): void {
		// not implment, eval have problem
		this._runtime.sendComand(`expression -i transaction_id -- ${args.expression}`);

		// response.body = {
		// 	result: reply ? reply : `evaluate(context: '${args.context}', '${args.expression}')`,
		// 	variablesReference: 0
		// };
		// this.sendResponse(response);
	}


	// ---- helpers

	private createSource(filePath: string): Source {
		return new Source(basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, 'mock-adapter-data');
	}

}
