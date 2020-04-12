import * as fs from "fs";
import * as vscode from "vscode";
import { Out } from "../common/out";
import { CodeUtil } from "../common/codeUtil";

export class Method {
    constructor(public full: string, public name: string, public line: number, public comnent: string) { }
}


export class Detecter {

    private static documentMethodMap = { key: String, methodList: Array<Method>() };
    // detect any like word(any)
    private static methodPreviousPattern = /(([\w_]+)\s*\(.*?\))/;
    // detech any like word(any){
    private static methodPattern = /(([\w_]+)\s*\(.*?\))\s*\{/;
    private static keywordPattern = /\b(if|While)\b/ig;

    public static getCacheFile(): string[] {
        return Object.keys(this.documentMethodMap).filter((key) => key.match(/\b(ahk|ext)$/i) && this.documentMethodMap[key].length > 0);
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
            this.getMethodList(vscode.Uri.file(buildPath));
        }

    }

    /**
     * detect method list by document
     * @param document
     */
    public static async getMethodList(docId: vscode.TextDocument | vscode.Uri, usingCache = false): Promise<Method[]> {

        let document: vscode.TextDocument;
        if (docId instanceof vscode.Uri) {
            document = await vscode.workspace.openTextDocument(docId as vscode.Uri);
        } else {
            document = docId as vscode.TextDocument;
        }

        if (usingCache && null != this.documentMethodMap[document.uri.path]) {
            return this.documentMethodMap[document.uri.path];
        }

        const methodList: Method[] = [];
        const lineCount = Math.min(document.lineCount, 10000);
        for (let line = 0; line < lineCount; line++) {
            const method = Detecter.getMethodByLine(document, line);
            if (method) {
                methodList.push(method);
            }
        }
        this.documentMethodMap[document.uri.path] = methodList;
        return methodList;
    }

    /**
     * detect method by line
     * @param document
     * @param line
     */
    public static getMethodByLine(document: vscode.TextDocument, line: number) {
        const text = this.buildCodeBlock(document, line);

        const methodMatch = text.match(this.methodPattern);
        const keywordMatch = text.match(this.keywordPattern);
        if (methodMatch && !keywordMatch) {
            return new Method(methodMatch[1], methodMatch[2], line, Detecter.getRemarkByLine(document, line - 1));
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