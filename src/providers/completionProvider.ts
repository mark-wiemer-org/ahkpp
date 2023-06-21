import * as vscode from 'vscode';
import { Parser } from '../parser/parser';
import { SnippetString } from 'vscode';
import { Method } from '../parser/model';

/**
 * A completion item for the method itself.
 * Also one for each of its local variables if the line number is within the method.
 */
export const completionItemsForMethod = (
    method: Method,
    uriString: string,
    lineNumber: number,
): vscode.CompletionItem[] => {
    const result: vscode.CompletionItem[] = [];

    // Always suggest the method itself
    const completionItem = new vscode.CompletionItem(
        method.params.length === 0 ? method.name : method.full,
        vscode.CompletionItemKind.Method,
    );
    completionItem.insertText = method.params.length
        ? new SnippetString(`${method.name} ($1)`)
        : `${method.name}()`;
    completionItem.detail = method.comment;
    result.push(completionItem);

    // If the cursor is in the method, suggest params and variables
    if (
        method.uriString === uriString &&
        method.line <= lineNumber &&
        lineNumber <= method.endLine
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

    return result;
};

export class CompletionProvider implements vscode.CompletionItemProvider {
    public async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<vscode.CompletionItem[]> {
        const prePosition =
            position.character === 0
                ? position
                : new vscode.Position(position.line, position.character - 1);
        const preChart =
            position.character === 0
                ? null
                : document.getText(new vscode.Range(prePosition, position));
        if (preChart === '.') {
            return [];
        }

        const result: vscode.CompletionItem[] = [];

        (await Parser.getAllMethod()).forEach((method) =>
            result.push(
                ...completionItemsForMethod(
                    method,
                    document.uri.toString(),
                    position.line,
                ),
            ),
        );

        const script = await Parser.buildScript(document, { usingCache: true });
        script.variables.forEach((variable) =>
            result.push(
                new vscode.CompletionItem(
                    variable.name,
                    vscode.CompletionItemKind.Variable,
                ),
            ),
        );

        return result;
    }
}
