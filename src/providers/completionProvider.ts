import * as vscode from 'vscode';
import { Parser } from '../parser/parser';
import { SnippetString } from 'vscode';

export class CompletionProvider implements vscode.CompletionItemProvider {
    private keywordList: string[] = [];
    private keywordComplectionItems: vscode.CompletionItem[] = [];
    constructor() {
        this.initKeywordComplectionItem();
    }

    public async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<vscode.CompletionItem[] | vscode.CompletionList> {
        const prePostion =
            position.character === 0
                ? position
                : new vscode.Position(position.line, position.character - 1);
        const preChart =
            position.character === 0
                ? null
                : document.getText(new vscode.Range(prePostion, position));
        if (preChart == '.') {
            return [];
        }

        const result: vscode.CompletionItem[] = [];

        (await Parser.getAllMethod()).forEach((method) => {
            const completionItem = new vscode.CompletionItem(
                method.params.length == 0 ? method.name : method.full,
                vscode.CompletionItemKind.Method,
            );
            if (method.params.length == 0) {
                completionItem.insertText = method.name + '()';
            } else {
                completionItem.insertText = new SnippetString(
                    method.name + '($1)',
                );
            }
            completionItem.detail = method.comment;
            result.push(completionItem);
            if (
                method.document == document &&
                position.line >= method.line &&
                position.line <= method.endLine
            ) {
                for (const param of method.params) {
                    result.push(
                        new vscode.CompletionItem(
                            param,
                            vscode.CompletionItemKind.Variable,
                        ),
                    );
                }
                for (const variable of method.variables) {
                    result.push(
                        new vscode.CompletionItem(
                            variable.name,
                            vscode.CompletionItemKind.Variable,
                        ),
                    );
                }
            }
        });

        const script = await Parser.buildScript(document, true);
        script.variables.forEach((variable) => {
            const completionItem = new vscode.CompletionItem(
                variable.name,
                vscode.CompletionItemKind.Variable,
            );
            result.push(completionItem);
        });

        return this.keywordComplectionItems.concat(result);
    }

    public resolveCompletionItem?(
        item: vscode.CompletionItem,
    ): vscode.ProviderResult<vscode.CompletionItem> {
        return item;
    }

    private initKeywordComplectionItem() {
        this.keywordList.forEach((keyword) => {
            const keywordComplectionItem = new vscode.CompletionItem(
                keyword + ' ',
            );
            keywordComplectionItem.kind = vscode.CompletionItemKind.Property;
            this.keywordComplectionItems.push(keywordComplectionItem);
        });
    }
}
