import { EventEmitter } from 'events';
import { readFileSync } from 'fs';
import { Variable } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { Out } from '../common/out';
import { ScriptRunner } from '../core/ScriptRunner';
import { AhkStack, StackHandler } from './handler/StackHandler';
import { VariableParser } from './handler/VariableParser';
import { LaunchRequestArguments } from './AhkDebug';

import Net = require('net');
import xml2js = require('xml2js');
import getPort = require('get-port');

export interface AhkBreakpoint {
	id: number;
	line: number;
	verified: boolean;
	source: string;
}

export interface DbgpResponse {
	attributes: {
		command: string;
		context: string;
		transaction_id: string;
		success: '0' | '1';
		/** Breakpoint id */
		id: number;
		/** run state */
		status: string;
	}
	children: {
		stack:any,
		property: any | any[],
		error?: {
			attributes: {
				code: number;
			}
		}
	},
}

const defaultDbgpSettings = {
	max_children: 300, // 300 is Scite default * 3
	max_data: 131072,  // 131072 is Scite default
};

/**
 * A Ahk runtime debugger.
 * refrence: https://xdebug.org/docs/dbgp
 */
export class AhkRuntime extends EventEmitter {

	private static LOCAL = 0;
	private static GLOBAL = 1;
	// the initial (and one and only) file we are 'debugging'
	private _sourceFile: string;
	public get sourceFile() {
		return this._sourceFile;
	}

	// the contents (= lines) of the one and only file
	private _sourceLines: string[];

	// maps from sourceFile to array of Mock breakpoints
	private _breakPoints = new Map<string, AhkBreakpoint[]>();
	private _transBreakPoints = new Map<number, AhkBreakpoint>();

	private connection: Net.Socket;
	private transId = 1;
	private commandCallback = {};
	private netIns: Net.Server;

	/**
	 * Start executing the given program.
	 */
	public async start(args: LaunchRequestArguments) {
		const { program, runtime, dbgpSettings = {} } = args;
		const { max_children, max_data } = Object.assign({}, defaultDbgpSettings, dbgpSettings);

		this.loadSource(program);
		let tempData = '';
		const port = await getPort({ port: getPort.makeRange(9000, 9100) });
		this.netIns = new Net.Server().listen(port).on('connection', (socket: Net.Socket) => {
			this.connection = socket;

			this.sendComand(`feature_set -n max_children -v ${max_children}`);
			this.sendComand(`feature_set -n max_data -v ${max_data}`);
			this.sendComand(`feature_set -n max_depth -v 2`); // Get properties recursively. Therefore fixed at 2

			socket.on('data', (chunk) => {
				tempData += chunk.toString();
				if (tempData.match(/<\?xml version="1.0" encoding="UTF-8"\?>\s*</)) {
					this.process(tempData);
					tempData = '';
				}
			});
		}).on("error", (err: Error) => {
			Out.log(err.message);
		});
		if (!(await ScriptRunner.instance.run(runtime, program, true, port))) {
			this.stop();
			this.sendEvent('end');
		}
	}

	/**
	 * send command to the ahk debug proxy.
	 * @param command
	 */
	public sendComand(command: string, data?: string): Promise<DbgpResponse> {
		if (!this.connection) {
			return;
		}
		this.transId++;
		command += ` -i ${this.transId}`;
		if (typeof data === 'string') {
			command += ` -- ${Buffer.from(data).toString('base64')}`;
		}
		// Out.log(`command: ${command}`)
		command += '\x00';

		this.connection.write(`${command}`);
		return new Promise((resolve) => {
			this.commandCallback[this.transId] = (response: DbgpResponse) => {
				resolve(response)
			};
		})
	}

	/**
	 * notice the script continue execution to the next point or end.
	 */
	public continue() {
		this.sendComand('run');
	}

	/**
	 * notice the script step over.
	 */
	public step() {
		this.sendComand('step_over');
	}

	/**
	 * notice the script step out.
	 */
	public stepOut() {
		this.sendComand('step_out');
	}

	/**
	 * notice the script step info
	 */
	public stepIn() {
		this.sendComand('step_into');
	}

	/**
	 * receive stop request from vscode, send command to notice the script stop.
	 */
	public stop() {
		this.sendComand('stop');
		if (this.connection) {
			this.connection.end();
		}
		this.netIns.close();
	}

	/**
	 * receive end message from script, send event to stop the debug session.
	 */
	public end() {
		this.sendEvent('end');
		if (this.connection) {
			this.connection.end();
		}
		this.netIns.close();
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
		const match = args.value.match(/^(?:()|\"(.*)\"|(true|false)|([+-]\d+)|([+-]\d+\.[+-]\d+)|([\w\d]+))$/si);

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
				type = 'bool';
				value = bool.match(/true/i) ? '1' : '0';
			} else if (int !== undefined) {
				type = 'integer';
				value = int;
			} else if (float !== undefined) {
				type = 'float';
				value = float;
			} else {
				let variable = await this.variables(scopeId, frameId, null, varName)
				if (variable[0].value == "undefined" && scopeId == AhkRuntime.LOCAL) {
					variable = await this.variables(AhkRuntime.GLOBAL, frameId, null, varName)[0]
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
		const success: boolean = !!parseInt(response.attributes.success);
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
			type, variablesReference
		};

	}

	/**
	 * send get stack command and return stack result promise
	 * @param startFrame stack frame limit start
	 * @param endFrame  stack frame limit end
	 */
	public async stack(startFrame: number, endFrame: number): Promise<AhkStack> {
		const response = await this.sendComand(`stack_get`);
		return StackHandler.handle(response, startFrame, endFrame, this._sourceFile)
	}

	private loadSource(file: string) {
		if (this._sourceFile !== file) {
			this._sourceFile = file;
			this._sourceLines = readFileSync(this._sourceFile).toString().split('\n');
		}
	}

	/**
	 * Set breakpoint in file with given line.
	 * @param path file path
	 * @param line file line
	 */
	public setBreakPoint(path: string, line: number): AhkBreakpoint {

		const bp = { verified: false, line, id: null, transId: null, source: path } as AhkBreakpoint;
		let bps = this._breakPoints.get(path);
		if (!bps) {
			bps = new Array<AhkBreakpoint>();
			this._breakPoints.set(path, bps);
		}
		bps.push(bp);
		this.verifyBreakpoints(path);
		if (this.connection && bp.verified) {
			this.sendComand(`breakpoint_set -t line -f ${bp.source} -n ${bp.line + 1}`)
			this._transBreakPoints.set(this.transId, bp);
		}

		return bp;
	}


	/**
	 * set breakpoint to the script actual.
	 */
	private createPoints() {
		for (const key of this._breakPoints.keys()) {
			for (const bp of this._breakPoints.get(key)) {
				this.sendComand(`breakpoint_set -t line -f ${bp.source} -n ${bp.line + 1}`)
				this._transBreakPoints.set(this.transId, bp);
			}
		}
	}

	/**
	 * Clear all breakpoints for file.
	 * @param path file path
	 */
	public clearBreakpoints(path: string): void {

		let bps: AhkBreakpoint[];
		if (this.connection && (bps = this._breakPoints.get(path))) {
			for (const bp of bps) {
				this.sendComand(`breakpoint_remove -d ${bp.id}`);
			}
		}
		this._breakPoints.delete(path);
	}

	/**
	 * check debug line is enable.
	 * @param path file path
	 */
	private verifyBreakpoints(path: string): void {
		const bps = this._breakPoints.get(path);
		if (bps) {
			this.loadSource(path);
			bps.forEach((bp) => {
				if (!bp.verified && bp.line < this._sourceLines.length) {
					const srcLine = this._sourceLines[bp.line].trim();
					if (srcLine.trim().charAt(0) != ';') {
						bp.verified = true;
						this.sendEvent('breakpointValidated', bp);
					}
				}
			});
		}
	}

	private sendEvent(event: string, ...args: any[]) {
		setImmediate((_) => {
			this.emit(event, ...args);
		});
	}

	private header = `<?xml version="1.0" encoding="UTF-8"?>`;
	private parser = new xml2js.Parser({
		attrkey: 'attributes',
		explicitChildren: true,
		childkey: 'children',
		charsAsChildren: false,
		charkey: 'content',
		explicitCharkey: true,
		explicitArray: false,
	});
	// refrence: https://github.com/wesleylancel/node-dbgp
	public process(data: string) {
		const that = this;

		// Strip everything before the xml tag
		data = data.substr(data.indexOf('<?xml'));

		if (data.indexOf(this.header) == -1) {
			data = this.header + data;
		}
		for (const part of data.split(this.header)) {
			if (null == part || part.trim() == "") { continue; }
			const s = this.header + part;
			this.parser.parseString(s, (err, res) => {
				if (err) {
					Out.log(err);
					return;
				}

				if (res.init) {
					that.createPoints();
					return that.sendComand('run');
				}

				const response = res.response
				if (response) {
					if (res.response.attributes.command) {
						const transId = parseInt(response.attributes.transaction_id);
						if (that.commandCallback[transId]) {
							that.commandCallback[transId](response);
							that.commandCallback[transId] = null;
						}
						switch (response.attributes.command) {
							case 'breakpoint_set':
								that.processBreakpointSet(response);
								break;
							case 'run':
							case 'step_into':
							case 'step_over':
							case 'step_out':
								that.processRunResponse(response);
								break;
							case 'stop':
								that.end();
								break;
							// case 'feature_set':
							// 	Out.log(`feature_set: ${JSON.stringify(xml)}`);
							// 	break;
						}
					}
				}
			});
		}

	}

	private processBreakpointSet(response: DbgpResponse) {
		const transId = response.attributes.transaction_id;
		const bp = this._transBreakPoints.get(parseInt(transId));
		bp.id = response.attributes.id;
		bp.verified = true;
		this.sendEvent('breakpointValidated', bp);
	}

	private processRunResponse(response: DbgpResponse) {
		// Run command returns a status
		switch (response.attributes.status) {
			case 'break':
				this.sendEvent('stopOnStep');
				break;
			case 'stopping':
			case 'stopped':
				this.end();
				break;
		}
	}

}