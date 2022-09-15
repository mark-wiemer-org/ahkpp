import { EventEmitter } from 'events';
import { Scope, StackFrame, Variable } from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { RunnerService } from '../service/runnerService';
import { DebugServer } from './debugServer';
import { LaunchRequestArguments } from './debugSession';
import { BreakPointHandler } from './handler/breakpointHandler';
import { CommandHandler } from './handler/commandHandler';
import { StackHandler } from './handler/StackHandler';
import { VariableHandler } from './handler/variableHandler';
import { DbgpResponse } from './struct/dbgpResponse';
import { VarScope } from './struct/scope';
import * as portfinder from 'portfinder'
import { spawn } from 'child_process';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { Out } from '../common/out';
import { Global, ConfigKey } from '../common/global';

/**
 * A Ahk runtime debugger.
 * refrence: https://xdebug.org/docs/dbgp
 */
export class DebugDispather extends EventEmitter {

	private debugServer: DebugServer;
	private breakPointHandler: BreakPointHandler;
	private commandHandler: CommandHandler;
	private stackHandler: StackHandler;
	private variableHandler: VariableHandler;
	private startArgs: LaunchRequestArguments;

	public constructor() {
		super();
	}

	/**
	 * Start executing the given program.
	 */
	public async start(args: LaunchRequestArguments) {

		const { runtime = Global.getConfig(ConfigKey.executePath), dbgpSettings = {} } = args;
		const { max_children, max_data } = { max_children: 300, max_data: 131072, ...dbgpSettings };

		this.breakPointHandler = new BreakPointHandler();
		this.stackHandler = new StackHandler()
		this.variableHandler = new VariableHandler()
		this.startArgs = args;
		const port = await portfinder.getPortPromise({ port: 9000, stopPort: 9100 });
		Out.debug(`Creating debug server, port is ${port}`)
		this.debugServer = new DebugServer(port)
		this.commandHandler = new CommandHandler(this.debugServer)
		this.debugServer.start()
			.on("init", () => {
				this.breakPointHandler.loopPoints((bp) => { this.setBreakPonit(bp) })
				this.sendComand(`feature_set -n max_children -v ${max_children}`);
				this.sendComand(`feature_set -n max_data -v ${max_data}`);
				this.sendComand(`feature_set -n max_depth -v 2`); // Get properties recursively. Therefore fixed at 2
				this.sendComand('stdout -c 1')
				this.sendComand('stderr -c 1')
				this.sendComand('run');
				this.emit('output', `${runtime} ${args.program}`)
			})
			.on("stream", (stream) => {
				this.emit('output', Buffer.from(stream.content, 'base64').toString())
			})
			.on("response", (response: DbgpResponse) => {
				if (response.attr.command) {
					this.commandHandler.callback(response.attr.transaction_id, response)
					switch (response.attr.command) {
						case 'run':
						case 'step_into':
						case 'step_over':
						case 'step_out':
							this.processRunResponse(response);
							break;
						case 'stop':
							this.end();
							break;
					}
				}
			})
		if (!args.program) {
			args.program = await RunnerService.getPathByActive()
		}

		if (!existsSync(runtime)) {
			Out.log(`Autohotkey Execute Bin Not Found : ${runtime}`)
			this.end();
			return;
		}

		const ahkProcess = spawn(runtime, ["/ErrorStdOut", `/debug=localhost:${port}`, args.program], { cwd: `${resolve(args.program, '..')}` })
		ahkProcess.stderr.on("data", err => {
			this.emit('output', err.toString("utf8"))
			this.end()
		})
	}

	public async restart() {
		this.sendComand('stop');
		this.end()
		RunnerService.startDebugger(this.startArgs.program)
	}

	/**
	 * send command to the ahk debug proxy.
	 * @param command
	 */
	public sendComand(command: string, data?: string): Promise<DbgpResponse> {
		if (this.commandHandler) {
			return this.commandHandler.sendComand(command, data)
		}
		return null;
	}

	/**
	 * receive stop request from vscode, send command to notice the script stop.
	 */
	public stop() {
		this.sendComand('stop');
		this.debugServer.shutdown()
	}

	/**
	 * receive end message from script, send event to stop the debug session.
	 */
	public end() {
		this.emit('end');
		this.debugServer.shutdown()
	}

	public scopes(frameId: number): Scope[] {
		return this.variableHandler.scopes(frameId)
	}

	/**
	 * List all variable or get refrence variable property detail.
	 * @param scopeId 0(Local) and 1(Global)
	 * @param args
	 */
	public async listVariables(args: DebugProtocol.VariablesArguments): Promise<Variable[]> {

		if (args.filter === 'named') {
			return [];
		}

		if (args.filter === 'indexed') {
			return this.variableHandler.getArrayValue(args.variablesReference, args.start, args.count);
		}

		const scope: number = this.variableHandler.getScopeByRef(args.variablesReference)
		const frameId: number = this.variableHandler.getFrameId()

		const propertyName = this.variableHandler.getVarByRef(args.variablesReference)?.name
		if (propertyName) {
			return this.getVariable(frameId, scope, propertyName)
		}

		const response = await this.sendComand(`context_get -d ${frameId} -c ${scope}`)

		return this.variableHandler.parse(response, scope);
	}

	public async getVariableByEval(variableName: string): Promise<string> {
		const frameId: number = this.variableHandler.getFrameId()

		const variables = await this.getVariable(frameId, VarScope.LOCAL, variableName)
		if (variables.length == 0) {
			return null;
		} else if (variables.length == 1) {
			return variables[0].value
		} else {
			const ahkVar = this.variableHandler.getVarByName(variableName)
			return JSON.stringify(ahkVar.value)
		}
	}

	private async getVariable(frameId: number, scope: VarScope, variableName: string): Promise<Variable[]> {
		const response = await this.sendComand(`property_get -d ${frameId} -c ${scope} -n ${variableName}`)
		return this.variableHandler.parsePropertyget(response, scope);
	}

	public async setVariable(args: DebugProtocol.SetVariableArguments): Promise<any> {
		return this.variableHandler.obtainValue(args.value).then(async ({ type, value, isVariable }) => {
			const frameId: number = this.variableHandler.getFrameId()
			const scope: number = this.variableHandler.getScopeByRef(args.variablesReference)
			if (isVariable) {
				const ahkVar = (await this.getVariable(frameId, scope, value))[0]
				if (!ahkVar) {
					throw new Error(`variable ${args.value} not found!`);
				}
				value = ahkVar.value;
				if (value.match(/^"|"$/g)) {
					type = "string"
					value = value.replace(/^"|"$/g, "")
				}
			}
			const parentFullName: string = this.variableHandler.getVarByRef(args.variablesReference)?.name;
			let fullname: string = args.name;
			if (parentFullName) {
				const isIndex: boolean = fullname.includes('[') && fullname.includes(']');
				fullname = isIndex === true ? `${parentFullName}${fullname}` : `${parentFullName}.${fullname}`;
			}

			const response: DbgpResponse = await this.sendComand(`property_set -d ${frameId} -c ${scope} -n ${fullname} -t ${type}`, value);
			const success = !!parseInt(response.attr.success);
			if (success === false) {
				throw new Error(`"${fullname}" cannot be written. Probably read-only.`);
			}
			const displayValue = type === 'string' ? `"${value}"` : value;
			const PRIMITIVE = 0
			return {
				name: args.name,
				value: displayValue,
				type, variablesReference: PRIMITIVE,
			};
		})

	}

	/**
	 * send get stack command and return stack result promise
	 * @param startFrame stack frame limit start
	 * @param endFrame  stack frame limit end
	 */
	public async stack(args: DebugProtocol.StackTraceArguments): Promise<StackFrame[]> {
		const response = await this.sendComand(`stack_get`);
		return this.stackHandler.handle(args, response)
	}

	private async setBreakPonit(bp: DebugProtocol.Breakpoint) {
		if (this.debugServer && bp.verified) {
			const res = await this.sendComand(`breakpoint_set -t line -f ${bp.source.path} -n ${bp.line}`)
			bp.id = res.attr.id
		}
	}

	public buildBreakPoint(path: string, sourceBreakpoints: DebugProtocol.SourceBreakpoint[]) {
		this.clearBreakpoints(path)
		return this.breakPointHandler.buildBreakPoint(path, sourceBreakpoints, (bp) => { this.setBreakPonit(bp) });
	}

	/**
	 * Clear all breakpoints for file.
	 * @param path file path
	 */
	private clearBreakpoints(path: string): void {
		let bps: DebugProtocol.Breakpoint[];
		if (this.debugServer && (bps = this.breakPointHandler.get(path))) {
			for (const bp of bps) {
				this.sendComand(`breakpoint_remove -d ${bp.id}`);
			}
		}
	}

	private processRunResponse(response: DbgpResponse) {
		switch (response.attr.status) {
			case 'break':
				this.emit('break', response.attr.command)
				break;
			case 'stopping':
			case 'stopped':
				this.end();
				break;
		}
	}

}