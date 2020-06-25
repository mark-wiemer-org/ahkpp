import * as fs from "fs";
import * as vscode from "vscode";
import { Out } from "../common/out";
import { CodeUtil } from "../common/codeUtil";
import { worker } from "cluster";

export class Script {
    constructor(public methods: Method[], public labels: Label[]) { }
}

export class Method {
    constructor(public full: string, public name: string, public document: vscode.TextDocument, public line: number, public comment: string) { }
}

export class Label {
    constructor(public name: string, public document: vscode.TextDocument, public line: number) { }
}

export class Detecter {

    private static documentCache = new Map<string, Script>();

    public static getCacheFile() {
        return this.documentCache.keys()
    }

    /**
     * load method list by path
     * @param buildPath
     */
    public static async buildByPath(buildPath: string) {
        if (fs.statSync(buildPath).isDirectory()) {
            fs.readdir(buildPath, (err, files) => {
                if (err) {
                    Out.log(err);
                    return;
                }
                for (const file of files) {
                    if (file.match(/(^\.|out|target|node_modules)/)) {
                        continue;
                    }
                    this.buildByPath(buildPath + "/" + file);
                }
            });
        } else if (buildPath.match(/\b(ahk|ext)$/i)) {
            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(buildPath));
            this.buildScript(document);
        }

    }

    /**
     * detect method list by document
     * @param document 
     */
    public static async buildScript(document: vscode.TextDocument, usingCache = false): Promise<Script> {

        if (usingCache && null != this.documentCache.get(document.uri.path)) {
            return this.documentCache.get(document.uri.path)
        }

        const methods: Method[] = [];
        const labels: Label[] = [];
        const lineCount = Math.min(document.lineCount, 10000);
        for (let line = 0; line < lineCount; line++) {
            const method = Detecter.getMethodByLine(document, line);
            if (method) {
                methods.push(method);
            }
            const label = Detecter.getLabelByLine(document, line);
            if (label) {
                labels.push(label);
            }
        }
        const script: Script = { methods, labels }
        this.documentCache.set(document.uri.path, script)
        return script;
    }


    public static async getMethodByName(document: vscode.TextDocument, name: string) {
        name = name.toLowerCase()
        for (const method of (await Detecter.buildScript(document)).methods) {
            if (method.name.toLowerCase() == name) {
                return method;
            }
        }
        for (const filePath of Detecter.getCacheFile()) {
            const tempDocument = await vscode.workspace.openTextDocument(filePath);
            for (const method of (await Detecter.buildScript(tempDocument)).methods) {
                if (method.name.toLowerCase() == name) {
                    return method;
                }
            }
        }
    }

    public static async getLabelByName(document: vscode.TextDocument, name: string) {
        name = name.toLowerCase()
        for (const label of (await Detecter.buildScript(document)).labels) {
            if (new RegExp("\\bg?" + label.name + "\\b", "i").test(name)) {
                return label;
            }
        }
        for (const filePath of Detecter.getCacheFile()) {
            const tempDocument = await vscode.workspace.openTextDocument(filePath);
            for (const label of (await Detecter.buildScript(tempDocument)).labels) {
                if (new RegExp("\\bg?" + label.name + "\\b", "i").test(name)) {
                    return label;
                }
            }
        }
    }


    public static getLabelByLine(document: vscode.TextDocument, line: number) {
        const text = CodeUtil.purity(document.lineAt(line).text);
        const label = /^ *(\w+) *:{1}(?!(:|=))/.exec(text)
        if (label) {
            return new Label(label[1], document, line);
        }
    }

    // detect any like word(any)
    private static methodPreviousPattern = /(([\w_]+)\s*\(.*?\))/;
    // detech any like word(any){
    private static methodPattern = /(([\w_]+)\s*\(.*?\))\s*\{/;
    /**
     * detect method by line
     * @param document
     * @param line
     */
    public static getMethodByLine(document: vscode.TextDocument, line: number) {
        const text = this.buildCodeBlock(document, line);

        const methodMatch = text.match(this.methodPattern);
        if (methodMatch && !/\b(if|While)\b/ig.test(text)) {
            return new Method(methodMatch[1], methodMatch[2], document, line, Detecter.getRemarkByLine(document, line - 1));
        }
    }

    /**
     * collect multi line code to one.
     * @param document 
     * @param line 
     */
    private static buildCodeBlock(document: vscode.TextDocument, line: number): string {
        let text = CodeUtil.purity(document.lineAt(line).text);
        for (let end = false, i = line + 1; i < document.lineCount && !end; i++) {
            if (text.match(this.methodPreviousPattern)) {
                const nextLineText = CodeUtil.purity(document.lineAt(i).text);
                if (!nextLineText.trim()) { continue; }
                if (nextLineText.match(/^\s*{/)) { text += "{"; }
            }
            end = true;
        }
        return text;
    }

    /**
     * detech remark, remark format: ;any
     * @param document 
     * @param line 
     */
    private static getRemarkByLine(document: vscode.TextDocument, line: number) {
        if (line >= 0) {
            const { text } = document.lineAt(line);
            const markMatch = text.match(/^\s*;(.+)/);
            if (markMatch) {
                return markMatch[1];
            }
        }

        return null;
    }

}