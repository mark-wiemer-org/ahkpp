import { EventEmitter } from 'events';
import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { Variable } from 'vscode-debugadapter';
import { ScriptRunner } from '../core/ScriptRunner';
import Net = require('net');
import { Out } from '../common/out';
import xml2js = require('xml2js');
import getPort = require('get-port');
import { DebugProtocol } from 'vscode-debugprotocol';
import { VariableParser } from './handler/VariableParser';

export interface AhkBreakpoint {
	id: number;
	line: number;
	verified: boolean;
	source: string;
}

export interface DbgpResponse {
	response: {
		attributes: {
			command: string;
			context: string;
			transaction_id: string;
		}
		children: {
			property: any | any[]
		}
	}
}

/**
 * A Ahk runtime with minimal debugger functionality.
 * refrence: https://xdebug.org/docs/dbgp
 */
export class AhkRuntime extends EventEmitter {

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
	private commandCallback = {}
	private netIns: Net.Server;

	constructor() {
		super();
	}

	/**
	 * Start executing the given program.
	 */
	public async start(program: string, stopOnEntry: boolean) {

		program = vscode.window.activeTextEditor.document.uri.fsPath
		this.loadSource(program);
		let tempData = '';
		let port = await getPort({ port: getPort.makeRange(9000, 9100) });
		this.netIns = new Net.Server().listen(port).on('connection', (socket: Net.Socket) => {
			this.connection = socket;

			// TODO: Allowing values to be changed in launch.json
			// {
			//	...
			// 	"dbgp": {
			// 		"max_data": 131072,
			// 		"max_children": 1000
			//	}
			// }
			this.sendComand(`feature_set -n max_data -v 131072`);	// 131072 is Scite default
			this.sendComand(`feature_set -n max_children -v 1000`);	// 1000 is Scite default * 10

			this.sendComand(`feature_set -n max_depth -v 2`); // Get properties recursively. Therefore fixed at 2

			socket.on('data', (chunk) => {
				tempData += chunk.toString();
				if (tempData.match(/<\?xml version="1.0" encoding="UTF-8"\?>\s*</)) {
					this.process(tempData)
					tempData = ''
				}
			});
		}).on("error", (err: Error) => {
			Out.log(err.message)
		})
		if (!(await ScriptRunner.instance.run(program, true, port))) {
			this.stop()
			this.sendEvent('end')
		}
	}

	public sendComand(command: string): number {
		if (!this.connection) {
			return;
		}
		this.transId++;
		this.connection.write(`${command} -i ${this.transId}\x00`)
		return this.transId;
	}

	/**
	 * Continue execution to the end/beginning.
	 */
	public continue() {
		this.sendComand('run')
	}

	/**
	 * Step to the next/previous non empty line.
	 */
	public step() {
		this.sendComand('step_over')
	}

	public stepOut() {
		this.sendComand('step_out')
	}
	public stepIn() {
		this.sendComand('step_into')
	}
	public stop() {
		this.sendComand('stop')
		this.netIns.close()
	}

	/**
	 * List all variable or get refrence variable property detail.
	 * @param scope Local and Global
	 * @param args 
	 */
	public variables(scope: string, args: DebugProtocol.VariablesArguments): Promise<Array<Variable>> {
		let transId: number;
		let propertyName = VariableParser.getPropertyNameByRef(args.variablesReference);
		if (propertyName) {
			transId = this.sendComand(`property_get -n ${propertyName}`);
		} else {
			transId = this.sendComand(`context_get -c ${scope == "Local" ? 0 : 1}`);
		}
		return new Promise(resolve =>
			this.commandCallback[transId] = (response: any) => resolve(VariableParser.parse(response, args))
		);
	}

	/**
	 * send get stack command and return stack result promise
	 * @param startFrame stack frame limit start
	 * @param endFrame  stack frame limit end
	 */
	public stack(startFrame: number, endFrame: number): Promise<any> {
		let transId = this.sendComand(`stack_get`)
		return new Promise(resolve => {
			this.commandCallback[transId] = (response: any) => {
				let stackList = response.match(/<stack(.|\s|\n)+?\/>/ig)
				if (stackList) {
					const frames = new Array<any>();
					for (let i = startFrame; i < Math.min(endFrame, stackList.length); i++) {
						let stack = stackList[i]
						frames.push({
							index: i,
							name: `${stack.match(/where="(.+?)"/i)[1]}`,
							file: `${stack.match(/filename="(.+?)"/i)[1]}`,
							line: parseInt(`${stack.match(/lineno="(.+?)"/i)[1]}`) - 1
						});
					}
					resolve({ frames, count: stackList.length });
				} else {
					resolve({ frames: [{ index: startFrame, name: this._sourceFile, file: this._sourceFile, line: 1 }], count: 1 });
				}
			}
		})

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

		const bp = <AhkBreakpoint>{ verified: false, line, id: null, transId: null, source: path };
		let bps = this._breakPoints.get(path);
		if (!bps) {
			bps = new Array<AhkBreakpoint>();
			this._breakPoints.set(path, bps);
		}
		bps.push(bp);
		this.verifyBreakpoints(path);
		if (this.connection && bp.verified) {
			this._transBreakPoints.set(this.sendComand(`breakpoint_set -t line -f ${bp.source} -n ${bp.line + 1}`), bp)
		}

		return bp;
	}

	
	private createPoints() {
		for (const key of this._breakPoints.keys()) {
			for (const bp of this._breakPoints.get(key)) {
				this._transBreakPoints.set(this.sendComand(`breakpoint_set -t line -f ${bp.source} -n ${bp.line + 1}`), bp)
			}
		}
	}

	/** 
	 * Clear all breakpoints for file.
	 * @param path file path
	 */
	public clearBreakpoints(path: string): void {

		let bps: AhkBreakpoint[]
		if (this.connection && (bps = this._breakPoints.get(path))) {
			for (const bp of bps) {
				this.sendComand(`breakpoint_remove -d ${bp.id}`)
			}
		}
		this._breakPoints.delete(path);
	}

	/**
	 * check debug line is enable.
	 * @param path file path
	 */
	private verifyBreakpoints(path: string): void {
		let bps = this._breakPoints.get(path);
		if (bps) {
			this.loadSource(path);
			bps.forEach(bp => {
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
		setImmediate(_ => {
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
		explicitArray: false
	});
	// refrence: https://github.com/wesleylancel/node-dbgp
	process(data: string) {
		var that = this;

		// Strip everything before the xml tag
		data = data.substr(data.indexOf('<?xml'));

		if (data.indexOf(this.header) == -1) {
			data = this.header + data;
		}
		for (const part of data.split(this.header)) {
			if (null == part || part.trim() == "") continue;
			let s = this.header + part;
			this.parser.parseString(s, function (err, xml) {
				if (err) {
					Out.log(err)
					return;
				}

				if (xml.init) {
					that.createPoints()
					return that.sendComand('run');
				}


				if (xml.response) {
					if (xml.response.attributes.command) {
						let transId = parseInt(xml.response.attributes.transaction_id);
						switch (xml.response.attributes.command) {
							case 'breakpoint_set':
								that.processBreakpointSet(xml);
								break;
							case 'stack_get':
								if (that.commandCallback[transId]) that.commandCallback[transId](part)
								break;
							case 'run':
							case 'step_into':
							case 'step_over':
							case 'step_out':
								that.processRunResponse(xml);
								break;
							case 'context_get':
							case 'property_get':
								if (that.commandCallback[transId]) that.commandCallback[transId](xml)
								break;
							case 'stop':
								that.processStopResponse(xml);
								break;
						}
					}
				}
			});
		}

	}

	private processBreakpointSet(xml: any) {
		let transId = xml.response.attributes.transaction_id;
		let bp = this._transBreakPoints.get(parseInt(transId));
		bp.id = xml.response.attributes.id
		bp.verified = true;
		this.sendEvent('breakpointValidated', bp);
	}
	private processStopResponse(result: any) {
		this.sendEvent('end');
		this.connection.end()
	}
	private processRunResponse(response: any) {
		// Run command returns a status
		switch (response.response.attributes.status) {
			case 'break':
				this.sendEvent('stopOnStep');
				break;
			case 'stopping':
			case 'stopped':
				this.sendEvent('end');
				this.connection.end()
				break;
			default:
				break;
		}
	}

}