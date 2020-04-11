import { EventEmitter } from 'events';
import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { Variable } from 'vscode-debugadapter';
import { ScriptRunner } from '../core/ScriptRunner';
import Net = require('net');
import { Out } from '../common/out';
const xml2js = require('xml2js');
const getPort = require('get-port');

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
			property: DbgpProperty | DbgpProperty[]
		}
	}
}
export interface DbgpProperty {
	attributes?: {
		name?: string;
		fullname?: string;
		type?: string;
		facet?: string;
		classname?: string;
		address?: string;
		size?: string;
		page?: string;
		pagesize?: string;
		children?: string;
		numchildren?: string;
		encoding?: string;
	}
	content?: string;
	children?: { property: DbgpProperty | DbgpProperty[] };
}

/** formats a dbgp property value for VS Code */
function formatPropertyValue(property: DbgpProperty): string {
	const { attributes, content = '' } = property;

	if (['string', 'integer', 'float'].includes(attributes.type) === true) {
		const primitive = Buffer.from(content, attributes.encoding).toString();

		if (attributes.type === 'integer' || attributes.type === 'float') {
			return primitive;
		}
		return `"${primitive}"`;
	}
	else if (attributes.type === 'object') {
		if (isArrayLikeProperty(property) == true) {
			const classname = attributes.classname === 'Object' ? 'Array' : attributes.classname;
			const length = getArrayLikeLength(property);

			return `${classname}(${length})`;
		}
	}

	return `${attributes.classname}`;
}
function getArrayLikeLength(property: DbgpProperty): number {
	const { children }= property;

	if (!children) {
		return 0;
	}

	const properties: DbgpProperty[] = Array.isArray(children.property) ? children.property as DbgpProperty[] : [ children.property as DbgpProperty];
	for (let i = properties.length - 1; 0 <= i; i--) {
		const property = properties[i];

		const match = property.attributes.name.match(/\[([0-9]+)\]/);
		if (match) {
			return parseInt(match[1]);
		}
	}
	return 0;
}
function isArrayLikeProperty(property: DbgpProperty): boolean {
	const { attributes, children } = property;
	if (attributes.children === "0") {
		return false;
	}

	const childProperties: DbgpProperty[] = Array.isArray(children.property) ? children.property as DbgpProperty[] : [ children.property as DbgpProperty];
	return childProperties.some((childProperty: DbgpProperty) => {
		if (childProperty.attributes.name.match(/\[[0-9]+\]/)) {
			return true;
		}
		return false;
	})
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

	private _properties = new Map<number, DbgpProperty>()
	private _variableReferenceCounter = 10000;

	private connection: Net.Socket;
	private transId = 1;
	private commandPromise = {}
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
	private createPoints() {
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
	public stop() {
		this.sendComand('stop')
		this.netIns.close()
	}

	public variables(scope: string, args /* : VariablesArguments */): Promise<Array<Variable>> {
		let transId;
		if (this._properties.has(args.variableReference) === true) {
			const property = this._properties.get(args.variableReference);
			transId = this.sendComand(`property_get -n ${property.attributes.fullname}`);
		}
		else {
			transId = this.sendComand(`context_get -c ${scope == "Local" ? 0 : 1}`);
		}
		return new Promise(resolve => {
			this.commandPromise[transId] = (response: any) => {
				this.parser.parseString(response, (err, xml: DbgpResponse) => {
					let properties: DbgpProperty[];

					if (	this._properties.has(args.variableReference) == true
						&&	xml.response.attributes.command === 'property_get'
					) {
						const { children } = xml.response.children.property as DbgpProperty;
						properties = Array.isArray(children.property) == true ? children.property as DbgpProperty[] : [ children.property as DbgpProperty ];
					}
					else {
						if ("children" in xml.response) {
							const { children } = xml.response;
							properties = Array.isArray(children.property) ? children.property : [ children.property ];
						}
						else {
							properties = [];
						}
					}

					if (properties.length === 0) {
						resolve([]);
						return;
					}

					const variables: Variable[] = [];
					properties.forEach((property, i) => {
						const { attributes } = property;
						let variablesReference;
						let indexedVariables, namedVariables;

						if ('filter' in args) {
							const match = attributes.name.match(/\[([0-9]+)\]/);
							const indexed = !!match;
							if (args.filter === 'named' && indexed) {
								return;
							}
							else if (args.filter === 'indexed') {
								if (indexed) {
									const index = parseInt(match[1]);
									const start = args.start + 1;
									const end = args.start + args.count;
									const contains = (start) <= index && index <= end;
									if (contains === false) {
										return;
									}
								}
								else {
									return;
								}
							}
						}

						if ('children' in property && attributes.type === 'object') {
							variablesReference = this._variableReferenceCounter++;
							this._properties.set(variablesReference, property);

							if (isArrayLikeProperty(property) === true) {
								const length = getArrayLikeLength(property);

								indexedVariables = 100 < length ? length : undefined;
								namedVariables = 100 < length ? 1 : undefined;
							}
						}
						else {
							variablesReference = 0;
						}

						const { name, type } = attributes;
						const value = formatPropertyValue(property);
						const variable = {
							name, type, value, variablesReference,
							indexedVariables, namedVariables
						}
						variables.push(variable);
					});

					resolve(variables);
				});
			};
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
		if (this.connection && bp.verified) {
			this._transBreakPoints.set(this.sendComand(`breakpoint_set -t line -f ${bp.source} -n ${bp.line + 1}`), bp)
		}

		return bp;
	}

	/*
	 * Clear all breakpoints for file.
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
								if (that.commandPromise[transId]) that.commandPromise[transId](part)
								break;
							case 'run':
							case 'step_into':
							case 'step_over':
							case 'step_out':
								that.processRunResponse(xml);
								break;
							case 'context_get':
							case 'property_get':
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