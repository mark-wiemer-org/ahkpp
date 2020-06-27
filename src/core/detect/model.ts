import * as vscode from "vscode";

export interface Script {
    methods: Method[];
    refs: Ref[];
    labels: Label[];
}

export interface Variable {
    name: string; document: vscode.TextDocument; line: number;
    method: string; isGlobal: boolean;
}

export class Method {
    constructor(public full: string, public name: string, public document: vscode.TextDocument,
        public line: number, public character: number, public comment: string) { }
}

export class Label {
    constructor(public name: string, public document: vscode.TextDocument, public line: number, public character: number) { }
}

export class Ref {
    constructor(public name: string, public document: vscode.TextDocument, public line: number, public character: number) { }
}