import * as vscode from "vscode";
import { Detecter } from "../core/detect/detecter";

export class CompletionProvider implements vscode.CompletionItemProvider {

    private keywordList: string[] = [];
    private keywordComplectionItems: vscode.CompletionItem[] = [];
    constructor() {
        this.initKeywordComplectionItem();
    }

    public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[] | vscode.CompletionList> {

        const prePostion = position.character === 0 ? position : new vscode.Position(position.line, position.character - 1);
        const preChart = position.character === 0 ? null : document.getText(new vscode.Range(prePostion, position));
        if(preChart=="."){
            return []
        }

        const result: vscode.CompletionItem[] = [];
        (await Detecter.buildScript(document, true)).methods.forEach((method) => {
            const completionItem = new vscode.CompletionItem(method.name + "()", vscode.CompletionItemKind.Method);
            completionItem.detail = method.comment;
            result.push(completionItem);
            if(method.params){
                for (const param of method.params) {
                    result.push(new vscode.CompletionItem(param, vscode.CompletionItemKind.Variable));   
                }
            }
        });

        (await Detecter.buildScript(document, true)).variables.forEach((variable) => {
            const completionItem = new vscode.CompletionItem(variable.name , vscode.CompletionItemKind.Variable);
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

