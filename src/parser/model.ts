import * as vscode from 'vscode';

/** Symbols and structures parsed from a file */
export interface Script {
    methods: Method[];
    refs: Ref[];
    labels: Label[];
    variables: Variable[];
    blocks: Block[];
}

export interface Variable {
    name: string;
    document: vscode.TextDocument;
    line: number;
    character: number;
    method: Method;
    isGlobal: boolean;
}

export class Label {
    constructor(
        public name: string,
        public document: vscode.TextDocument,
        public line: number,
        public character: number,
    ) {}
}

export class Ref {
    constructor(
        public name: string,
        public document: vscode.TextDocument,
        public line: number,
        public character: number,
    ) {}
}

export class Block {
    constructor(
        public name: string,
        public document: vscode.TextDocument,
        public line: number,
        public character: number,
    ) {}
}

export class Method {
    public params: string[];
    public variables: Variable[];
    public full: string;
    public endLine: number;
    constructor(
        public origin: string,
        public name: string,
        public uriString: string,
        public line: number,
        public character: number,
        public withQuote: boolean,
        /** Method header comment */
        public comment: string,
    ) {
        this.buildParams();
        this.variables = [];
    }

    private buildParams() {
        const refPattern = /\s*\((.+?)\)\s*$/;
        if (this.origin !== this.name) {
            const paramsMatch = this.origin.match(refPattern);
            if (paramsMatch) {
                this.params = paramsMatch[1]
                    .split(',')
                    .filter((param) => param.trim())
                    .map((param) => {
                        const paramMatch = param.match(/[^:=* \t]+/);
                        return paramMatch?.[0] ?? param;
                    });
                this.full = this.origin.replace(
                    paramsMatch[1],
                    this.params.join(','),
                );
            } else {
                this.params = [];
                this.full = this.origin;
            }
        }
    }

    public pushVariable(variables: Variable | Variable[]) {
        if (!Array.isArray(variables)) {
            variables = [variables];
        }
        loop: for (const variable of variables) {
            for (const curVariable of this.variables) {
                if (curVariable.name === variable.name) {
                    continue loop;
                }
            }
            for (const paramStr of this.params) {
                if (paramStr === variable.name) {
                    continue loop;
                }
            }
            this.variables.push(variable);
        }
    }
}
