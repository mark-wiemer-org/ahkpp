import * as vscode from "vscode";

export class Detecter {

    private static methodPattern = /([\w_]+\([\w\s,:"=]*\))\s*\{/;
    private static keywordPattern = /\b(if|While)\b/ig;
    /**
     * detect method symbol by line
     * @param document 
     * @param line 
     */
    static getMethodByLine(document: vscode.TextDocument, line: number) {
        const { text } = document.lineAt(line);

        const methodMatch = text.match(this.methodPattern);
        const keywordMatch = text.match(this.keywordPattern)
        if (methodMatch && !keywordMatch) {
            return new Method(methodMatch[1], Detecter.getRemarkByLine(document, line - 1))
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
    constructor(public name: string, public comnent: string) { }
}