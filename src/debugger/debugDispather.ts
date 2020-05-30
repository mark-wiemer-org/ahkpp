import { EventEmitter } from 'events';
import { StackFrame, Variable } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { ScriptRunner } from '../core/ScriptRunner';
import { DebugServer } from './debugServer';
import { LaunchRequestArguments } from './debugSession';
import { BreakPointHandler } from './handler/breakpointHandler';
import { CommandHandler } from './handler/commandHandler';
import { StackHandler } from './handler/StackHandler';
import { VariableParser } from './handler/VariableParser';
import { DbgpResponse } from './struct/dbgpResponse';
import { VarScope } from './struct/scope';

import getPort = require('get-port');

/**
 * A Ahk runtime debugger.
 * refrence: https://xdebug.org/docs/dbgp
 */
export class DebugDispather extends EventEmitter {

	private debugServer: DebugServer;
	private breakPointHandler: BreakPointHandler;
	private commandHandler: CommandHandler;
	private stackHandler: StackHandler;

	public constructor() {
		super();
		this.breakPointHandler = new BreakPointHandler();
		this.stackHandler = new StackHandler()
	}

	/**
	 * Start executing the given program.
	 */
	public async start(args: LaunchRequestArguments) {

		const { program, runtime, dbgpSettings = {} } = args;
		const { max_children, max_data } = { max_children: 300, max_data: 131072, ...dbgpSettings };

		const port = await getPort({ port: getPort.makeRange(9000, 9100) });
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
		const runSuccess = await ScriptRunner.instance.run(runtime, program, true, port)
		if (!runSuccess) {
			this.end();
		}
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

	/**
	 * List all variable or get refrence variable property detail.
	 * @param scopeId 0(Local) and 1(Global)
	 * @param args
	 */
	public async variables(scopeId: number, frameId: number, args: DebugProtocol.VariablesArguments, param?: string): Promise<Variable[]> {
		const propertyName = param ? param : VariableParser.getPropertyNameByRef(args.variablesReference);
		let command = `context_get -d ${frameId} -c ${scopeId}`;
		if (propertyName) {
			if (args) { scopeId = VariableParser.getPropertyScopeByRef(args.variablesReference); }
			command = `property_get -d ${frameId} -c ${scopeId} -n ${propertyName}`;
		}

		const response = await this.sendComand(command)
		return VariableParser.parse(response, scopeId, args);
	}

	public async setVariable(scopeId: number, frameId: number, args: DebugProtocol.SetVariableArguments): Promise<any> {
		const match = args.value.match(/^(?:()|\"(.*)\"|(true|false)|([+-]?\d+)|([+-]?\d+\.[+-]?\d+)|([\w\d]+))$/si);

		const isInvaridValue = !match;
		if (isInvaridValue === true) {
			const msg: DebugProtocol.Message = {
				id: args.variablesReference,
				format: `"${args.value}" is invalid value.`,
			};
			return new Promise((resolve) => resolve(msg));
		}

		const variablesReference = 0;
		let type: string, value: string;
		{
			const [, blank, str, bool, int, float, varName] = match;
			if (blank !== undefined) {
				type = 'string';
				value = '';
			} else if (str !== undefined) {
				type = 'string';
				value = str
			} else if (bool !== undefined) {
				type = 'string';
				value = bool.match(/true/i) ? '1' : '0';
			} else if (int !== undefined) {
				type = 'integer';
				value = int;
			} else if (float !== undefined) {
				type = 'float';
				value = float;
			} else {
				let variable = await this.variables(scopeId, frameId, null, varName)
				if (variable[0].value == "undefined" && scopeId == VarScope.LOCAL) {
					variable = await this.variables(VarScope.GLOBAL, frameId, null, varName)[0]
				}
				if (variable[0].value == "undefined") {
					const msg: DebugProtocol.Message = {
						id: args.variablesReference,
						format: `Variable ${varName} not found!`,
					};
					return new Promise((resolve) => resolve(msg));
				} else {
					value = variable[0].value;
					if (value.match(/^"|"$/g)) {
						type = "string"
						value = value.replace(/^"|"$/g, "")
					}
				}

			}
		}

		const parentFullName: string = VariableParser.getPropertyNameByRef(args.variablesReference);
		let fullname: string = args.name;
		let command: string = `property_set -d ${frameId} -c ${scopeId} -n ${args.name} -t ${type}`;
		if (parentFullName) {
			const isIndex: boolean = fullname.includes('[') && fullname.includes(']');
			fullname = isIndex === true ? `${parentFullName}${fullname}` : `${parentFullName}.${fullname}`;

			scopeId = VariableParser.getPropertyScopeByRef(args.variablesReference);
			command = `property_set -d ${frameId} -c ${scopeId} -n ${fullname} -t ${type}`;
		}

		const response: DbgpResponse = await this.sendComand(command, value);
		const success: boolean = !!parseInt(response.attr.success);
		if (success === false) {
			const msg: DebugProtocol.Message = {
				id: args.variablesReference,
				format: `"${fullname}" cannot be written. Probably read-only.`,
			}
			return msg;
		}

		const displayValue = type === 'string' ? `"${value}"` : value;
		return {
			name: args.name,
			value: displayValue,
			type, variablesReference,
		};

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