import { EventEmitter } from 'events';
import { readFileSync } from 'fs';
import { Variable } from 'vscode-debugadapter';
import { ScriptRunner } from '../core/ScriptRunner';
import Net = require('net');
var xml2js = require('xml2js');


export interface AhkBreakpoint {
	id: number;
	line: number;
	verified: boolean;
	transId: number;
	source: string;
}

/**
 * A Mock runtime with minimal debugger functionality.
 */
export class AhkRuntime extends EventEmitter {



	// the initial (and one and only) file we are 'debugging'
	private _sourceFile: string;
	public get sourceFile() {
		return this._sourceFile;
	}

	// the contents (= lines) of the one and only file
	private _sourceLines: string[];

	// This is the next line that will be 'executed'
	private _currentLine = 0;

	// maps from sourceFile to array of Mock breakpoints
	private _breakPoints = new Map<string, AhkBreakpoint[]>();
	private _transBreakPoints = new Map<number, AhkBreakpoint>();

	// since we want to send breakpoint events, we will assign an id to every event
	// so that the frontend can match events with breakpoints.
	private _breakpointId = 1;

	private connection: Net.Socket;
	private transId = 1;
	private commandPromise = {}
	private netIns: Net.Server;

	private _breakAddresses = new Set<string>();

	constructor() {
		super();
	}

	public stop() {
		this.sendComand('stop')
		this.netIns.close()
	}

	/**
	 * Start executing the given program.
	 */
	public start(program: string, stopOnEntry: boolean) {

		this.loadSource(program);
		this._currentLine = -1;
		let tempData = '';

		this.netIns = new Net.Server().listen(9000).on('connection', (socket: Net.Socket) => {
			this.connection = socket;
			socket.on('data', (chunk) => {
				tempData += chunk.toString();
				if (tempData.match(/<\?xml version="1.0" encoding="UTF-8"\?>\s*</)) {
					this.process(tempData)
					tempData = ''
				}
			});
		}).on("error", (err: Error) => {
			console.log(err.message)
		})
		ScriptRunner.instance.run(program, true)
	}
	createPoints() {
		for (const key of this._breakPoints.keys()) {
			for (const bp of this._breakPoints.get(key)) {
				this._transBreakPoints.set(this.sendComand(`breakpoint_set -t line -f ${bp.source} -n ${bp.line + 1}`), bp)
			}
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

	variables(scope: string): Promise<Array<Variable>> {
		let transId = this.sendComand(`context_get -c ${scope == "Local" ? 0 : 1}`)
		return new Promise(resolve => {
			this.commandPromise[transId] = (response: any) => {
				let propertyList = response.match(/<property (.|\s|\n)+?<\/property>/ig)
				if (!propertyList) {
					resolve([]);
					return;
				};
				const properties = new Array<Variable>();
				for (let i = 0; i < propertyList.length; i++) {
					let property = propertyList[i]
					properties.push({
						name: `${property.match(/name="(.+?)"/i)[1]}`,
						value: `${Buffer.from(property.match(/>(.*?)</i)[1], 'base64').toString()}`,
						variablesReference: 0
					});
				}
				resolve(properties);
			}
		});
	}

	/**
	 * Returns a fake 'stacktrace' where every 'stackframe' is a word from the current line.
	 */
	public stack(startFrame: number, endFrame: number): any {
		let transId = this.sendComand(`stack_get`)
		return new Promise(resolve => {
			this.commandPromise[transId] = (response: any) => {
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

	public getBreakpoints(path: string, line: number): number[] {

		const l = this._sourceLines[line];

		let sawSpace = true;
		const bps: number[] = [];
		for (let i = 0; i < l.length; i++) {
			if (l[i] !== ' ') {
				if (sawSpace) {
					bps.push(i);
					sawSpace = false;
				}
			} else {
				sawSpace = true;
			}
		}

		return bps;
	}

	/*
	 * Set breakpoint in file with given line.
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

		return bp;
	}

	/*
	 * Clear breakpoint in file with given line.
	 */
	public clearBreakPoint(path: string, line: number): AhkBreakpoint | undefined {
		let bps = this._breakPoints.get(path);
		if (bps) {
			const index = bps.findIndex(bp => bp.line === line);
			if (index >= 0) {
				const bp = bps[index];
				bps.splice(index, 1);
				return bp;
			}
		}
		return undefined;
	}

	/*
	 * Clear all breakpoints for file.
	 */
	public clearBreakpoints(path: string): void {
		this._breakPoints.delete(path);
	}

	/*
	 * Set data breakpoint.
	 */
	public setDataBreakpoint(address: string): boolean {
		if (address) {
			this._breakAddresses.add(address);
			return true;
		}
		return false;
	}

	/*
	 * Clear all data breakpoints.
	 */
	public clearAllDataBreakpoints(): void {
		this._breakAddresses.clear();
	}

	// private methods

	private loadSource(file: string) {
		if (this._sourceFile !== file) {
			this._sourceFile = file;
			this._sourceLines = readFileSync(this._sourceFile).toString().split('\n');
		}
	}

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
				if (err)
					return;

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
								if (that.commandPromise[transId]) that.commandPromise[transId](part)
								break;
							case 'run':
							case 'step_into':
							case 'step_over':
							case 'step_out':
								that.processRunResponse(xml);
								break;
							case 'context_get':
								if (that.commandPromise[transId]) that.commandPromise[transId](part)
								break;
							case 'stop':
								that.processStopResponse(xml);
								break;

							default:
								break;
						}
					}
				}
			});
		}

	}

	private getBreakpointByTransId(transId: string) {
		return this._transBreakPoints.get(parseInt(transId));;
	}

	private processBreakpointSet(xml: any) {
		let transId = xml.response.attributes.transaction_id;
		let bp = this.getBreakpointByTransId(transId)
		bp.id == xml.response.attributes.id
		bp.verified = true;
		this.sendEvent('breakpointValidated', bp);
	}
	private processStopResponse(result: any) {
		this.sendEvent('end');
		this.connection.end()
	}
	private processContextResponse(result: any) {
		throw new Error("Method not implemented.");
	}
	processRunResponse(response: any) {
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