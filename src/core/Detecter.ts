import * as vscode from "vscode";

export class Detecter {

    private static documentMethodMap = {}
    private static methodPattern = /(([\w_]+)\s*\([\w\s,:"=]*\))\s*\{/;
    private static methodSecondPattern = /(([\w_]+)\s*\([\w\s,:"=]*\))\s*/;
    private static keywordPattern = /\b(if|While)\b/ig;

    /**
     * detect method list by document
     * @param document 
     */
    static getMethodList(document: vscode.TextDocument, usingCache = false): Method[] {

        // if (usingCache && null != this.documentMethodMap[document.uri.path]) {
        //     return this.documentMethodMap[document.uri.path];
        // }

        let methodList: Method[] = [];
        const lineCount = Math.min(document.lineCount, 10000);
        for (let line = 0; line < lineCount; line++) {
            var method = Detecter.getMethodByLine(document, line)
            if (method) {
                methodList.push(method)
            }
        }
        // this.documentMethodMap[document.uri.path] = methodList
        return methodList;
    }

    /**
     * detect method by line
     * @param document 
     * @param line 
     */
    static getMethodByLine(document: vscode.TextDocument, line: number) {
        let text = document.lineAt(line).text ;
        if(line+1<document.lineCount && text.match(this.methodSecondPattern)){
            text+=document.lineAt(line+1).text
        }

        const methodMatch = text.match(this.methodPattern);
        const keywordMatch = text.match(this.keywordPattern)
        if (methodMatch && !keywordMatch) {
            return new Method(methodMatch[1], methodMatch[2], line, Detecter.getRemarkByLine(document, line - 1))
        }
    }

    private static getRemarkByLine(document: vscode.TextDocument, line: number) {
        if (line >= 0) {
            const { text } = document.lineAt(line);
            const markMatch = text.match(/^\s*;(.+)/);
            if (markMatch) {
                return markMatch[1]
            }
        }

        return null;
    }

}

export class Method {
    constructor(public full: string, public name: string, public line: number, public comnent: string) { }
}

export class FileChangeProvider {

}