import * as vscode from "vscode";
import { Detecter } from "../core/Detecter";


export class CompletionProvider implements vscode.CompletionItemProvider {

    private keywordList: string[] = [];
    private keywordComplectionItems: vscode.CompletionItem[] = [];
    constructor() {
        this.initKeywordComplectionItem();
    }

    public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[] | vscode.CompletionList> {

        const result: vscode.CompletionItem[] = [];
        (await Detecter.getMethodList(document, true)).forEach((method) => {
            const completionItem = new vscode.CompletionItem(method.name + "()", vscode.CompletionItemKind.Method);
            completionItem.detail = method.comnent;
            result.push(completionItem);
        });

        return this.keywordComplectionItems.concat(result);
    }

    public resolveCompletionItem?(item: vscode.CompletionItem): vscode.ProviderResult<vscode.CompletionItem> {
        return item;
    }

    private initKeywordComplectionItem() {
        this.keywordList.forEach((keyword) => {
            const keywordComplectionItem = new vscode.CompletionItem(keyword + " ");
            keywordComplectionItem.kind = vscode.CompletionItemKind.Property;
            this.keywordComplectionItems.push(keywordComplectionItem);
        });
    }

}

