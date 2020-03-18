import * as vscode from "vscode";
import { Detecter } from "../core/Detecter";


export class CompletionProvider implements vscode.CompletionItemProvider {

    private keywordList: string[] = []
    private keywordComplectionItems: vscode.CompletionItem[] = []
    constructor() {
        this.initKeywordComplectionItem()
    }

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {

        const lineCount = Math.min(document.lineCount, 10000);
        const result: vscode.CompletionItem[] = [];
        for (let line = 0; line < lineCount; line++) {
            var method = Detecter.getMethodByLine(document, line)
            if (method) {
                result.push(new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Method))
            }
        }
        return this.keywordComplectionItems.concat(result);
    }
    resolveCompletionItem?(item: vscode.CompletionItem): vscode.ProviderResult<vscode.CompletionItem> {
        return item;
    }

    private initKeywordComplectionItem() {
        this.keywordList.forEach(keyword => {
            let keywordComplectionItem = new vscode.CompletionItem(keyword + " ")
            keywordComplectionItem.kind = vscode.CompletionItemKind.Property
            this.keywordComplectionItems.push(keywordComplectionItem)
        })
    }

}

